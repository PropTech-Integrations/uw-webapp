// src/lib/appsync-ws.ts
import { browser } from '$app/environment';

type Auth =
  | { mode: 'apiKey'; apiKey: string }
  | { mode: 'cognito'; idToken: string }; // OIDC is identical, use idToken/AccessToken

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

  const b64url = (s: string) =>
    btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  // Use subprotocols so we don’t depend on query-string headers
  const headerSubproto = `header-${b64url(JSON.stringify(headerObj))}`;
  const ws = new WebSocket(realtimeUrl, ['graphql-ws', headerSubproto]);

  // Internal state
  const subs = new Map<
    string,
    { next: (data: any) => void; error?: (e: any) => void }
  >();
  let isAcked = false;
  let lastKa = Date.now();
  let connectionTimeoutMs = 5 * 60 * 1000; // default until we read ACK

  const send = (obj: any) => ws.readyState === 1 && ws.send(JSON.stringify(obj));

  ws.addEventListener('open', () => {
    try { console.log('[AppSyncWS] open → sending connection_init'); } catch {}
    // Optional but recommended: init
    send({ type: 'connection_init' });
  });

  ws.addEventListener('error', (evt) => {
    try { console.error('[AppSyncWS] socket error', evt); } catch {}
  });

  ws.addEventListener('close', (evt) => {
    try { console.warn('[AppSyncWS] close', { code: (evt as any).code, reason: (evt as any).reason }); } catch {}
  });

  ws.addEventListener('message', (evt) => {
    try { console.debug('[AppSyncWS] <- raw', evt?.data); } catch {}
    const msg = JSON.parse(String(evt.data));
    opts.onEvent?.(msg);

    switch (msg.type) {
      case 'connection_ack':
        isAcked = true;
        connectionTimeoutMs = msg?.payload?.connectionTimeoutMs ?? connectionTimeoutMs;
        try { console.log('[AppSyncWS] <- connection_ack', { connectionTimeoutMs }); } catch {}
        break;

      case 'ka':
        lastKa = Date.now();
        try { console.debug('[AppSyncWS] <- ka'); } catch {}
        break;

      case 'start_ack':
        try { console.log('[AppSyncWS] <- start_ack for id', msg.id); } catch {}
        break;

      case 'data':
        {
          const sub = subs.get(msg.id);
          sub?.next?.(msg.payload?.data);
          try { console.log('[AppSyncWS] <- data for id', msg.id, msg.payload?.errors ? { errors: msg.payload.errors } : {}); } catch {}
        }
        break;

      case 'error':
        {
          const sub = subs.get(msg.id);
          sub?.error?.(msg.payload ?? msg);
          try { console.error('[AppSyncWS] <- error for id', msg.id, msg.payload ?? msg); } catch {}
        }
        break;

      case 'complete':
        try { console.log('[AppSyncWS] <- complete for id', msg.id); } catch {}
        subs.delete(msg.id);
        break;
    }
  });

  // Simple keepalive watchdog: if we miss a 'ka' past the timeout, close.
  const kaTimer = setInterval(() => {
    if (Date.now() - lastKa > connectionTimeoutMs) {
      try {
        ws.close(4000, 'KA timeout');
      } catch {}
    }
  }, Math.max(1000, Math.floor(connectionTimeoutMs / 4)));

  ws.addEventListener('close', () => clearInterval(kaTimer));

  function subscribe<T = unknown>(params: {
    query: string;
    variables?: Record<string, any>;
    next: (data: T) => void;
    error?: (e: any) => void;
  }): SubscriptionHandle {
    const id = crypto.randomUUID();


    subs.set(id, { next: params.next, error: params.error });

    // Authorization must be included again inside extensions.authorization
    const authExt =
      opts.auth.mode === 'apiKey'
        ? { 'x-api-key': (opts.auth as any).apiKey, host: httpHost }
        : { Authorization: (opts.auth as any).idToken, host: httpHost };

    const dataStr = JSON.stringify({
      query: params.query,
      variables: params.variables ?? {},
    });

    const startFrame = {
      id,
      type: 'start',
      payload: {
        data: dataStr,
        extensions: { authorization: authExt },
      },
    };

    // If the server hasn’t ACKed yet, buffer a tick.
    const sendStart = () => send(startFrame);
    try {
      const q = params.query?.replace(/\s+/g, ' ').slice(0, 80) + '…';
      console.log('[AppSyncWS] -> start', { id, hasAck: isAcked, query: q, hasVars: !!params.variables });
    } catch {}
    isAcked ? sendStart() : setTimeout(() => { try { console.debug('[AppSyncWS] delayed start send', id); } catch {}; sendStart(); }, 50);
    return {
      id,
      unsubscribe: () => {
        try { console.log('[AppSyncWS] -> stop', id); } catch {}
        send({ type: 'stop', id });
      },
    };
  }

  return {
    websocket: ws,
    subscribe,
  };
}
