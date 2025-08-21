// A tiny wrapper to wire multiple AppSync subscriptions with one call.
// Works with your existing createAppSyncWsClient.

// Import the public environment variables
import { PUBLIC_GRAPHQL_HTTP_ENDPOINT } from '$env/static/public';

export type SubscribeOptions<T = unknown> = {
	query: string;
	variables?: Record<string, any>;
	next: (data: T) => void;
	error?: (e: any) => void;
};

export type AppSyncWsClient = {
	websocket: WebSocket;
	subscribe<T = unknown>(opts: SubscribeOptions<T>): { id: string; unsubscribe(): void };
	ready(): Promise<void>;
};

// ---- helpers ----
export async function gql<T>(
	query: string,
	variables: Record<string, any> = {},
	idToken: string
): Promise<T> {
	const headers: Record<string, string> = {
		'content-type': 'application/json',
		'Authorization': idToken
	};
	console.log('GraphQL Request ------------------------------------');
	console.log('headers', headers);
	console.log('body', JSON.stringify({ query, variables }));
	console.log('----------------------------------------------------');
	const res = await fetch(PUBLIC_GRAPHQL_HTTP_ENDPOINT, {
		method: 'POST',
		headers,
		body: JSON.stringify({ query, variables })
	});
	const body = await res.json();
	if (body.errors?.length) throw new Error(body.errors.map((e: any) => e.message).join('; '));
	return body.data as T;
}

// ---------- helpers ----------

function toRealtimeUrl(httpUrl: URL): string {
	// Standard AppSync domains:
	// https://<id>.appsync-api.<region>.amazonaws.com/graphql
	// -> wss://<id>.appsync-realtime-api.<region>.amazonaws.com/graphql
	if (httpUrl.host.includes('appsync-api')) {
		return `wss://${httpUrl.host.replace('appsync-api', 'appsync-realtime-api')}${httpUrl.pathname}`;
	}

	// Custom domain case:
	// https://api.example.com/graphql  -> wss://api.example.com/graphql/realtime
	const basePath = httpUrl.pathname.replace(/\/graphql\/?$/, '');
	return `wss://${httpUrl.host}${basePath}/graphql/realtime`;
}

function base64Url(s: string): string {
	// Browser-safe base64url encode
	// eslint-disable-next-line no-undef
	return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function safeJsonParse(s: string): any | null {
	try {
		return JSON.parse(s);
	} catch {
		return null;
	}
}

function uuid(): string {
	// eslint-disable-next-line no-undef
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		// eslint-disable-next-line no-undef
		return crypto.randomUUID();
	}
	return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export function createAppSyncWsClient(opts: {
	graphqlHttpUrl: string;
	auth: AppSyncAuth;
	onEvent?: (frame: any) => void; // raw frame observer (optional)
}): AppSyncWsClient {
	if (typeof window === 'undefined') {
		throw new Error('AppSync WS client must run in the browser');
	}

	const httpUrl = new URL(opts.graphqlHttpUrl);
	const httpHost = httpUrl.host;

	const realtimeUrl = toRealtimeUrl(httpUrl);
	const headerObj =
		opts.auth.mode === 'apiKey'
			? { host: httpHost, 'x-api-key': opts.auth.apiKey }
			: { host: httpHost, Authorization: opts.auth.idToken };

	const headerSubproto = `header-${base64Url(JSON.stringify(headerObj))}`;

	const ws = new WebSocket(realtimeUrl, ['graphql-ws', headerSubproto]);

	// ---- connection gating / queueing ----
	let isAcked = false;
	const pendingStarts = new Map<string, any>();

	let resolveReady!: () => void;
	let rejectReady!: (err: any) => void;
	const readyPromise = new Promise<void>((res, rej) => {
		resolveReady = res;
		rejectReady = rej;
	});

	// ---- subscribers ----
	const subs = new Map<
		string,
		{
			next: (data: any) => void;
			error?: (e: any) => void;
		}
	>();

	// ---- keepalive management ----
	let lastKa = Date.now();
	let connectionTimeoutMs = 5 * 60 * 1000; // default overwritten by ACK
	let kaTimer: number | null = null;

	const send = (obj: any) => {
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify(obj));
			return true;
		}
		return false;
	};

	ws.addEventListener('open', () => {
		send({ type: 'connection_init' });
	});

	ws.addEventListener('message', (evt) => {
		const msg = safeJsonParse(String(evt.data));
		if (!msg) return;
		opts.onEvent?.(msg);

		switch (msg.type) {
			case 'connection_ack': {
				isAcked = true;
				connectionTimeoutMs = msg?.payload?.connectionTimeoutMs ?? connectionTimeoutMs;
				resolveReady();

				// start KA watchdog
				if (kaTimer == null) {
					kaTimer = window.setInterval(
						() => {
							if (Date.now() - lastKa > connectionTimeoutMs) {
								try {
									ws.close(4000, 'KA timeout');
								} catch {}
							}
						},
						Math.max(1000, Math.floor(connectionTimeoutMs / 4))
					);
				}

				// flush queued subscriptions
				for (const [, frame] of pendingStarts) send(frame);
				pendingStarts.clear();
				break;
			}

			case 'ka': {
				lastKa = Date.now();
				break;
			}

			case 'start_ack': {
				// nothing to do
				break;
			}

			case 'data': {
				const sub = subs.get(msg.id);
				sub?.next?.(msg.payload?.data);
				break;
			}

			case 'error': {
				// per-subscription error (has id) or connection-level error (no id)
				const sub = msg.id ? subs.get(msg.id) : undefined;
				if (sub?.error) sub.error(msg.payload ?? msg);
				else console.error('AppSync WS error', msg.payload ?? msg);
				break;
			}

			case 'complete': {
				subs.delete(msg.id);
				break;
			}
		}
	});

	ws.addEventListener('close', () => {
		if (!isAcked) rejectReady(new Error('Socket closed before connection_ack'));
		isAcked = false;
		if (kaTimer != null) {
			clearInterval(kaTimer);
			kaTimer = null;
		}
	});

	function subscribe<T = unknown>(
		params: SubscribeOptions<T>
	): { id: string; unsubscribe(): void } {
		const id = uuid();

		subs.set(id, { next: params.next, error: params.error });

		const authExt =
			opts.auth.mode === 'apiKey'
				? { 'x-api-key': (opts.auth as any).apiKey, host: httpHost }
				: { Authorization: (opts.auth as any).idToken, host: httpHost };

		const frame = {
			id,
			type: 'start',
			payload: {
				data: JSON.stringify({
					query: params.query,
					variables: params.variables ?? {}
				}),
				extensions: { authorization: authExt }
			}
		};

		if (isAcked) send(frame);
		else pendingStarts.set(id, frame);

		return {
			id,
			unsubscribe: () => {
				pendingStarts.delete(id); // if it never flushed, drop it
				send({ type: 'stop', id });
				subs.delete(id);
			}
		};
	}

	return {
		websocket: ws,
		subscribe,
		ready: () => readyPromise
	};
}

export type AppSyncAuth = { mode: 'apiKey'; apiKey: string } | { mode: 'cognito'; idToken: string }; // 'apiKey' | 'cognito'
// | { mode: 'jwt'; jwt: string } // alias -> mapped to 'cognito'
// | { mode: 'iam'; signer: unknown }; // Add your IAM signer or other modes here if your client supports them:

export interface RealtimeClientOptions {
	graphqlHttpUrl: string;
	auth: AppSyncAuth;
	onEvent?: (frame: unknown) => void;
}

/** A single subscription to register */
export interface SubscriptionSpec<T> {
	/** GraphQL subscription document (string or whatever your client expects) */
	query: string;
	/** Optional variables to pass with the subscription */
	variables?: Record<string, unknown>;
	/**
	 * Where to find the data in the payload, e.g. "onCreateUserItem".
	 * If provided, used as the default selector.
	 */
	path?: string;
	/**
	 * Custom selector to extract/shape the payload.
	 * If omitted, we use `path` (if provided) or pass the whole payload through.
	 */
	select?: (payload: any) => T | undefined;
	/** Handler for new data (after select/path extraction) */
	next: (data: T) => void;
	/** Optional error handler */
	error?: (e: unknown) => void;
}

/** Utility: safe dot-path lookup ("a.b.c") */
function pluck(obj: any, path?: string) {
	if (!path) return obj;
	return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

/**
 * Creates the socket, waits for ready, wires subscriptions, and returns a disposer.
 * Call this inside $effect.root in Svelte so cleanup runs on teardown/HMR.
 */
export function setupAppSyncRealtime(
	clientOptions: RealtimeClientOptions,
	subs: SubscriptionSpec<any>[]
): () => void {
	console.log('setupAppSyncRealtime');
	console.log('clientOptions', clientOptions);
	console.log('subs', subs);
	// Adapt auth to the WS client's supported modes
	const { auth, ...rest } = clientOptions;
	let wsAuth: AppSyncAuth;
	console.log('auth', auth);
	switch (auth.mode) {
		// case 'jwt':
		// 	wsAuth = { mode: 'cognito', idToken: auth.jwt };
		// 	break;
		case 'apiKey':
		case 'cognito':
			wsAuth = auth as AppSyncAuth;
			console.log('wsAuth', wsAuth);
			break;
		default:
			throw new Error(`Unsupported auth mode for AppSync realtime: ${(auth as any)?.mode}`);
	}

	const client = createAppSyncWsClient({ ...rest, auth: wsAuth });
	let cancelled = false;
	const handles: Array<{ unsubscribe: () => void }> = [];

	(async () => {
		try {
			await client.ready();
			if (cancelled) return;

			for (const spec of subs) {
				const selector =
					spec.select ??
					((payload: any) => pluck(payload, spec.path)) ??
					((payload: any) => payload);

				const h = client.subscribe({
					query: spec.query,
					variables: spec.variables,
					next: (payload: any) => {
						try {
							const picked = selector(payload);
							if (picked !== undefined) spec.next(picked);
						} catch (e) {
							(spec.error ?? console.error)('selector error', e);
						}
					},
					error: spec.error ?? ((e: unknown) => console.error('subscription error', e))
				});

				handles.push(h);
			}
		} catch (e) {
			console.warn('AppSync realtime setup failed', e);
		}
	})();

	// disposer
	return () => {
		cancelled = true;
		try {
			for (const h of handles) h.unsubscribe?.();
		} finally {
			try {
				client.websocket?.close?.();
			} catch {}
		}
	};
}

/** Convenience: typed factory for a path-based spec */
export function subAtPath<T>(args: {
	query: string;
	path: string;
	next: (data: T) => void;
	variables?: Record<string, unknown>;
	error?: (e: unknown) => void;
}): SubscriptionSpec<T> {
	return { ...args };
}
