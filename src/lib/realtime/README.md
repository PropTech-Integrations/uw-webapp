# Real-time GraphQL with AWS AppSync in this app

This document explains how the web app uses AWS AppSync, GraphQL, and WebSockets to build real-time user interfaces. It covers the data model, GraphQL operations, the lightweight AppSync WebSocket client, the list management helpers, and how everything is wired together in the Svelte UI.

## What you get

- **Real-time updates**: New, updated, and deleted items stream into the UI via GraphQL subscriptions over WebSockets.
- **Fast initial load**: The page server loads initial data via GraphQL HTTP.
- **Simple client**: A small WebSocket client tailored for AppSync’s real-time protocol.
- **Predictable list handling**: Helpers to insert-or-update/remove items in-place for Svelte 5 `$state` arrays or immutably when needed.

## Prerequisites

- An AppSync GraphQL API with `listUserItems`, `onCreateUserItem`, `onUpdateUserItem`, and `onDeleteUserItem` resolvers.
- Frontend environment variables (set in `.env` or your hosting env):
  - `PUBLIC_GRAPHQL_HTTP_ENDPOINT` — AppSync GraphQL HTTP endpoint
  - `PUBLIC_GRAPHQL_API_KEY` — AppSync API Key (or switch to Cognito mode; see Auth below)

Example `.env` entries:

```bash
PUBLIC_GRAPHQL_HTTP_ENDPOINT=https://xxxxxxxxxx.appsync-api.us-east-1.amazonaws.com/graphql
PUBLIC_GRAPHQL_API_KEY=da2-xxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Data model

The app renders a list of `UserItem` records:

```1:8:uw-webapp/src/lib/types/UserItem.ts
export type UserItem = {
  userId: string;
  sk: string;
  entityType: string;
  entityId: string;
  data: any;
  createdAt: string;
};
```

## GraphQL operations

The UI uses one HTTP query for initial load and three subscriptions for real-time updates:

```1:7:uw-webapp/src/lib/realtime/graphql/queries.ts
export const Q_LIST = `
query List($limit:Int) {
  listUserItems(limit:$limit) {
    items { userId sk entityType entityId data createdAt }
    nextToken
  }
}`;
```

```9:12:uw-webapp/src/lib/realtime/graphql/queries.ts
export const S_CREATE = `
subscription OnCreate {
  onCreateUserItem { userId sk entityType entityId data createdAt }
}`;
```

```14:17:uw-webapp/src/lib/realtime/graphql/queries.ts
export const S_UPDATE = `
subscription OnUpdate {
  onUpdateUserItem { userId sk entityType entityId data createdAt }
}`;
```

```19:22:uw-webapp/src/lib/realtime/graphql/queries.ts
export const S_DELETE = `
subscription OnDelete {
  onDeleteUserItem { userId sk entityType entityId data createdAt }
}`;
```

## Server-side initial load (GraphQL over HTTP)

The page server loads the first page of items using a simple `gql` helper:

```12:21:uw-webapp/src/routes/realtime/+page.server.ts
export const load: PageServerLoad = async ({ params }) => {
  try {
    const response = await gql<{ listUserItems: { items: UserItem[] } }>(Q_LIST, { limit: 50 });
    console.log('response', JSON.stringify(response, null, 2));
    return { items: response.listUserItems.items };
  } catch (error: any) {
    console.error('Error loading data:', error);
    return { items: [], error: error.message };
  }
};
```

The `gql` helper sends `POST` requests with the API key:

```20:30:uw-webapp/src/lib/realtime/websocket/AppSyncWsClient.ts
export async function gql<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
  const res = await fetch(PUBLIC_GRAPHQL_HTTP_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': PUBLIC_GRAPHQL_API_KEY },
    body: JSON.stringify({ query, variables })
  });
  const body = await res.json();
  if (body.errors?.length) throw new Error(body.errors.map((e: any) => e.message).join('; '));
  return body.data as T;
}
```

## Real-time over WebSockets

The app opens a WebSocket to the AppSync real-time endpoint, handles `connection_ack`, keep-alive frames, and per-subscription messages. It supports both API Key and Cognito JWT auth.

Creating the WebSocket client:

```71:92:uw-webapp/src/lib/realtime/websocket/AppSyncWsClient.ts
export function createAppSyncWsClient(opts: {
  graphqlHttpUrl: string;
  auth: AppSyncAuth;
  onEvent?: (frame: any) => void;
}): AppSyncWsClient {
  ...
  const realtimeUrl = toRealtimeUrl(httpUrl);
  const headerObj =
    opts.auth.mode === 'apiKey'
      ? { host: httpHost, 'x-api-key': opts.auth.apiKey }
      : { host: httpHost, Authorization: opts.auth.idToken };

  const headerSubproto = `header-${base64Url(JSON.stringify(headerObj))}`;

  const ws = new WebSocket(realtimeUrl, ['graphql-ws', headerSubproto]);
```

Subscribing to operations and receiving data:

```201:236:uw-webapp/src/lib/realtime/websocket/AppSyncWsClient.ts
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

  ...
  return {
    id,
    unsubscribe: () => {
      pendingStarts.delete(id);
      send({ type: 'stop', id });
      subs.delete(id);
    }
  };
}
```

### Wiring subscriptions in Svelte

Use `setupAppSyncRealtime` with `subAtPath` to attach multiple subscriptions at once:

```52:76:uw-webapp/src/routes/realtime/+page.svelte
const dispose = setupAppSyncRealtime(
  {
    graphqlHttpUrl: PUBLIC_GRAPHQL_HTTP_ENDPOINT,
    auth: { mode: 'apiKey', apiKey: PUBLIC_GRAPHQL_API_KEY }
  },
  [
    subAtPath<UserItem>({
      query: S_CREATE,
      path: 'onCreateUserItem',
      next: (it) => userItemOps.upsertMutable(items, it)
    }),
    subAtPath<UserItem>({
      query: S_UPDATE,
      path: 'onUpdateUserItem',
      next: (it) => userItemOps.upsertMutable(items, it)
    }),
    subAtPath<UserItem>({
      query: S_DELETE,
      path: 'onDeleteUserItem',
      next: (it) => userItemOps.removeMutable(items, it)
    })
  ]
);
```

This runs inside `$effect.root` so the socket and subscriptions are cleaned up on teardown/HMR.

## Managing real-time lists

`createListOps` provides consistent list operations keyed by a function. It offers both mutable operations (ideal for Svelte 5 `$state` arrays) and immutable variants.

Keyed insert-or-update/remove (mutable):

```41:59:uw-webapp/src/lib/realtime/websocket/ListOperations.ts
function upsertMutable(items: T[], it: T): void {
  it = norm(it);
  const k = opts.keyFor(it);
  const i = items.findIndex((x) => opts.keyFor(x) === k);
  if (i >= 0) items[i] = it;
  else items.unshift(it);
}

function removeMutable(items: T[], it: T): void {
  const k = opts.keyFor(norm(it));
  let w = 0;
  for (let r = 0; r < items.length; r++) {
    if (opts.keyFor(items[r]) !== k) items[w++] = items[r];
  }
  items.length = w;
}
```

`UserItem`-specific ops (with `data` JSON normalization):

```86:97:uw-webapp/src/lib/realtime/websocket/ListOperations.ts
export const userItemOps = createListOps<UserItem>({
  keyFor: (it) => `${it.userId}#${it.sk}`,
  normalize: (it) => {
    if (typeof it.data === 'string') {
      try {
        return { ...it, data: JSON.parse(it.data) };
      } catch {
        // keep original on parse failure
      }
    }
    return it;
  }
});
```

## Auth modes

- **API Key** (shown above): `auth: { mode: 'apiKey', apiKey: PUBLIC_GRAPHQL_API_KEY }`
- **Cognito (ID token)**: `auth: { mode: 'cognito', idToken: yourIdToken }`

The WebSocket subprotocol includes an authorization header bundle that AppSync validates on `connection_init` and attaches per-subscription in `start` frames.

## Rendering and reactivity

- The list is a Svelte 5 `$state<UserItem[]>`, so mutations done by `userItemOps.upsertMutable/removeMutable` are tracked automatically.
- Each card is keyed by `userId + ':' + sk` and uses `fade` transitions.

## Error handling and resilience

- Connection-level and per-subscription errors are surfaced to the console or to a provided `error` handler.
- A keep-alive watchdog closes stale sockets if KA frames stop arriving (AppSync sends `ka` frames periodically).
- On `connection_ack`, the client flushes any queued `start` frames and begins streaming data.

## Swapping in your own schema

If your schema uses different types/fields:

- Update `src/lib/realtime/graphql/queries.ts` with your query/subscription documents.
- Adjust the `UserItem` type (or create your own) and update the list keying logic in `ListOperations.ts`.
- Rewire the `subAtPath` selectors to point at the right payload fields (e.g., `path: 'onCreateYourType'`).

## Adding new types and subscriptions (extending the setup)

Follow these steps to introduce a new entity type and wire its real-time updates end-to-end. The pattern mirrors the existing `UserItem` flow, but you can keep each entity decoupled for maintainability.

1. Define the new TypeScript type

Create a type describing your entity (e.g., `MyEvent`) in `src/lib/types/`:

```typescript
// src/lib/types/MyEvent.ts
export type MyEvent = {
  id: string;
  groupId: string;
  kind: string;
  payload: unknown; // shape as needed
  createdAt: string;
};
```

1. Add GraphQL operations

Add list and subscription documents (either alongside existing queries or in a new module to keep things separated):

```typescript
// src/lib/realtime/graphql/myEvent.queries.ts
export const Q_LIST_MY_EVENT = `
  query ListMyEvent($limit:Int) {
    listMyEvent(limit:$limit) {
      items { id groupId kind payload createdAt }
      nextToken
    }
  }
`;

export const S_CREATE_MY_EVENT = `
  subscription OnCreateMyEvent {
    onCreateMyEvent { id groupId kind payload createdAt }
  }
`;
```

1. Create list operations for the new type

Provide a stable key and any normalization logic (e.g., parse serialized JSON):

```typescript
// src/lib/realtime/websocket/MyEventListOps.ts
import { createListOps } from './ListOperations';
import type { MyEvent } from '$lib/types/MyEvent';

export const myEventOps = createListOps<MyEvent>({
  keyFor: (it) => `${it.groupId}#${it.id}`,
  normalize: (it) => {
    if (typeof (it as any).payload === 'string') {
      try {
        return { ...it, payload: JSON.parse((it as any).payload as string) };
      } catch {}
    }
    return it;
  }
});
```

1. Wire server-side initial load (optional)

Use `gql` to fetch the first page so your UI renders instantly:

```typescript
// example: src/routes/my-events/+page.server.ts
import { gql } from '$lib/realtime/websocket/AppSyncWsClient';
import { Q_LIST_MY_EVENT } from '$lib/realtime/graphql/myEvent.queries';
import type { MyEvent } from '$lib/types/MyEvent';

export const load = async () => {
  const res = await gql<{ listMyEvent: { items: MyEvent[] } }>(Q_LIST_MY_EVENT, { limit: 50 });
  return { items: res.listMyEvent.items };
};
```

1. Wire client-side subscriptions

Attach subscriptions with `setupAppSyncRealtime`. Use `subAtPath` if the payload path matches your field name, or provide a `select` function to reshape the payload.

```typescript
// example: src/routes/my-events/+page.svelte (script excerpt)
import { setupAppSyncRealtime, subAtPath } from '$lib/realtime/websocket/AppSyncWsClient';
import { S_CREATE_MY_EVENT } from '$lib/realtime/graphql/myEvent.queries';
import { myEventOps } from '$lib/realtime/websocket/MyEventListOps';
import type { MyEvent } from '$lib/types/MyEvent';
import { PUBLIC_GRAPHQL_HTTP_ENDPOINT, PUBLIC_GRAPHQL_API_KEY } from '$env/static/public';

let items = $state<MyEvent[]>([]);

$effect.root(() => {
  if (typeof window === 'undefined') return;
  const dispose = setupAppSyncRealtime(
    {
      graphqlHttpUrl: PUBLIC_GRAPHQL_HTTP_ENDPOINT,
      auth: { mode: 'apiKey', apiKey: PUBLIC_GRAPHQL_API_KEY }
    },
    [
      subAtPath<MyEvent>({
        query: S_CREATE_MY_EVENT,
        path: 'onCreateMyEvent',
        next: (it) => myEventOps.upsertMutable(items, it)
      })
    ]
  );
  return dispose;
});
```

Notes and tips for future growth

- Add update/delete subscriptions the same way and call `upsertMutable` or `removeMutable` accordingly.
- Use `select` instead of `path` if you need to combine fields or transform the payload:

  ```ts
  { query, select: (p) => ({ ...p.onCreateMyEvent, scope: 'alpha' }), next }
  ```

- Keep each entity’s queries and list ops in their own modules to avoid cross-coupling as the app grows.
- For multi-entity pages, instantiate separate `$state` arrays and subscribe to each; the WS client can multiplex many subscriptions on one socket.
- If you migrate auth to Cognito, switch to `auth: { mode: 'cognito', idToken }` without changing the rest of the wiring.

## Troubleshooting

- 403/401 on HTTP: verify `PUBLIC_GRAPHQL_HTTP_ENDPOINT` and API key or ID token.
- Socket closes before `connection_ack`: ensure the custom domain mapping or region is correct; verify the subprotocol header encoding.
- No real-time events: confirm AppSync subscription resolvers are configured and the client is subscribed to the correct fields.

## File map

- HTTP + WS client: `src/lib/realtime/websocket/AppSyncWsClient.ts`
- List helpers: `src/lib/realtime/websocket/ListOperations.ts`
- GraphQL docs: `src/lib/realtime/graphql/queries.ts`
- Type: `src/lib/types/UserItem.ts`
- Page server (initial load): `src/routes/realtime/+page.server.ts`
- Page UI (real-time wiring): `src/routes/realtime/+page.svelte`
