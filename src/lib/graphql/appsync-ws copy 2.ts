// src/lib/appsync-ws.ts
import { browser } from '$app/environment';

type Auth = { mode: 'apiKey'; apiKey: string } | { mode: 'cognito'; idToken: string }; // OIDC is identical, use idToken/AccessToken

type SubscriptionHandle = { id: string; unsubscribe: () => void };

export function createAppSyncWsClient(opts: {
	graphqlHttpUrl: string; // e.g. https://<id>.appsync-api.us-west-2.amazonaws.com/graphql
	auth: Auth;
	onEvent?: (ev: any) => void; // raw frame observer (optional)
}) {
	if (!browser) throw new Error('WS client must run in the browser');

	const http = new URL(opts.graphqlHttpUrl);
	const httpHost = http.host;
	// Convert the appsync-api host to appsync-realtime-api + path
	const realtimeUrl =
		http.protocol === 'https:'
			? `wss://${httpHost.replace('appsync-api', 'appsync-realtime-api')}${http.pathname}`
			: (() => {
					throw new Error('graphqlHttpUrl must be https://');
				})();

	const headerObj =
		opts.auth.mode === 'apiKey'
			? { host: httpHost, 'x-api-key': opts.auth.apiKey }
			: { host: httpHost, Authorization: opts.auth.idToken };

	const b64url = (s: string) => btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

	// Use subprotocols so we don’t depend on query-string headers
	const headerSubproto = `header-${b64url(JSON.stringify(headerObj))}`;
	const ws = new WebSocket(realtimeUrl, ['graphql-ws', headerSubproto]);

	// Internal state
	const subs = new Map<string, { next: (data: any) => void; error?: (e: any) => void }>();
	let isAcked = false;
	const pendingStarts = new Map<string, any>();

	let _resolveReady!: () => void;
	let _rejectReady!: (err: any) => void;
	const readyPromise = new Promise<void>((res, rej) => {
		_resolveReady = res;
		_rejectReady = rej;
	});

	let lastKa = Date.now();
	let connectionTimeoutMs = 5 * 60 * 1000; // default until we read ACK

	const send = (obj: any) => ws.readyState === 1 && ws.send(JSON.stringify(obj));

	ws.addEventListener('open', () => {
		console.log('Websocket connection opened');
		send({ type: 'connection_init' });
	});

	ws.addEventListener('message', (evt) => {
		console.log(evt.data);
		const msg = JSON.parse(String(evt.data));
		opts.onEvent?.(msg);

		if (msg.type === 'connection_ack') {
			isAcked = true;
			_resolveReady();
			// Flush queued starts
			for (const [, frame] of pendingStarts) send(frame);
			pendingStarts.clear();
			return;
		}

		if (msg.type === 'ka') {
			lastKa = Date.now();
			return;
		}

		switch (msg.type) {
			case 'start_ack':
				// nothing to do
				break;

			case 'data':
				{
					const sub = subs.get(msg.id);
					sub?.next?.(msg.payload?.data);
				}
				break;

			case 'error':
				{
					const sub = subs.get(msg.id);
					sub?.error?.(msg.payload ?? msg);
				}
				break;

			case 'complete':
				subs.delete(msg.id);
				break;
		}
	});

	// Simple keepalive watchdog: if we miss a 'ka' past the timeout, close.
	const kaTimer = setInterval(
		() => {
			if (Date.now() - lastKa > connectionTimeoutMs) {
				try {
					ws.close(4000, 'KA timeout');
				} catch {}
			}
		},
		Math.max(1000, Math.floor(connectionTimeoutMs / 4))
	);

	ws.addEventListener('close', () => {
		if (!isAcked) _rejectReady(new Error('Socket closed before ACK'));
		isAcked = false;
		clearInterval(kaTimer);
	});

	function subscribe<T = unknown>(params: {
		query: string;
		variables?: Record<string, any>;
		next: (data: T) => void;
		error?: (e: any) => void;
	}) {
		const id = crypto.randomUUID();
		// store handlers (same as your code)

		const http = new URL(opts.graphqlHttpUrl);
		const authExt =
			opts.auth.mode === 'apiKey'
				? { 'x-api-key': (opts.auth as any).apiKey, host: http.host }
				: { Authorization: (opts.auth as any).idToken, host: http.host };

		const frame = {
			id,
			type: 'start',
			payload: {
				data: JSON.stringify({ query: params.query, variables: params.variables ?? {} }),
				extensions: { authorization: authExt }
			}
		};

		// --- NEW: queue until ACK ---
		if (isAcked) send(frame);
		else pendingStarts.set(id, frame);

		return {
			id,
			unsubscribe: () => {
				// remove from queue if never sent
				pendingStarts.delete(id);
				send({ type: 'stop', id });
			}
		};
	}

	return {
		websocket: ws,
		subscribe,
		// --- NEW: expose a ready() Promise you can await ---
		ready: () => readyPromise
	};
}
