<script lang="ts">
    import { createAppSyncWsClient } from '$lib/graphql/appsync-ws';
    import {
      PUBLIC_GRAPHQL_HTTP_ENDPOINT as GRAPHQL_HTTP,
      PUBLIC_GRAPHQL_API_KEY as API_KEY
    } from '$env/static/public';
    import { fade } from 'svelte/transition';
    import type { UserItem } from '$lib/types/UserItem';
  
    // ---- types ----
    

    // ---- runes state ----
    let items = $state<UserItem[]>([]);
    let loading = $state(true);
    let errorMsg = $state<string | null>(null);
  
    // ---- queries/subscriptions ----
    const Q_LIST = `
      query List($limit:Int) {
        listUserItems(limit:$limit) {
          items { userId sk entityType entityId data createdAt }
          nextToken
        }
      }`;
  
    const S_CREATE = `
      subscription OnCreate {
        onCreateUserItem { userId sk entityType entityId data createdAt }
      }`;
  
    const S_UPDATE = `
      subscription OnUpdate {
        onUpdateUserItem { userId sk entityType entityId data createdAt }
      }`;
  
    const S_DELETE = `
      subscription OnDelete {
        onDeleteUserItem { userId sk entityType entityId data createdAt }
      }`;
  
    // ---- helpers ----
    async function gql<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
      const res = await fetch(GRAPHQL_HTTP, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': API_KEY },
        body: JSON.stringify({ query, variables })
      });
      const body = await res.json();
      if (body.errors?.length) throw new Error(body.errors.map((e: any) => e.message).join('; '));
      return body.data as T;
    }
  
    const keyFor = (it: UserItem) => `${it.userId}#${it.sk}`;
  
    function normalize(it: UserItem): UserItem {
      if (typeof it.data === 'string') { try { it.data = JSON.parse(it.data); } catch {} }
      return it;
    }
  
    function upsert(it: UserItem) {
      it = normalize(it);
      const idx = items.findIndex((x) => keyFor(x) === keyFor(it));
      if (idx >= 0) items[idx] = it;
      else items.unshift(it);
    }
  
    function remove(it: UserItem) {
      items = items.filter((x) => keyFor(x) !== keyFor(it));
    }
  
    // ---- lifecycle (runes) ----
    $effect.root(() => {
      if (typeof window === 'undefined') return; // SSR guard
  
      const client = createAppSyncWsClient({
        graphqlHttpUrl: GRAPHQL_HTTP,
        auth: { mode: 'apiKey', apiKey: API_KEY },
        onEvent: (f) => console.debug('WS frame', f)
      });
  
      let cancelled = false;
      const handles: Array<{ unsubscribe: () => void }> = [];
  
      (async () => {
        // 1) initial list
        loading = true;
        try {
          const d = await gql<{ listUserItems: { items: UserItem[]; nextToken?: string } }>(Q_LIST, { limit: 50 });
          items = (d.listUserItems.items ?? []).map(normalize);
        } catch (err) {
          errorMsg = (err as Error).message;
        } finally {
          loading = false;
        }
  
        // 2) wait for WS ACK, then subscribe
        await client.ready().catch((e) => console.warn('ready() failed', e));
        if (cancelled) return;
  
        handles.push(
          client.subscribe<{ onCreateUserItem: UserItem }>({
            query: S_CREATE,
            next: (p) => p?.onCreateUserItem && upsert(p.onCreateUserItem),
            error: (e) => console.error('onCreate error', e)
          }),
          client.subscribe<{ onUpdateUserItem: UserItem }>({
            query: S_UPDATE,
            next: (p) => p?.onUpdateUserItem && upsert(p.onUpdateUserItem),
            error: (e) => console.error('onUpdate error', e)
          }),
          client.subscribe<{ onDeleteUserItem: UserItem }>({
            query: S_DELETE,
            next: (p) => p?.onDeleteUserItem && remove(p.onDeleteUserItem),
            error: (e) => console.error('onDelete error', e)
          })
        );
      })();
  
      // cleanup (also covers HMR)
      return () => {
        cancelled = true;
        handles.forEach((h) => h.unsubscribe());
        client.websocket.close();
      };
    });
  </script>
  
  <div class="space-y-3 p-4">
    {#if loading}
      <p class="text-gray-500">Loading…</p>
    {:else if errorMsg}
      <p class="text-red-600">Error: {errorMsg}</p>
    {:else if items.length === 0}
      <p class="text-gray-500">No items yet.</p>
    {/if}
  
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each items as it (it.userId + ':' + it.sk)}
        <div class="max-w-sm bg-white border border-gray-200 rounded-lg shadow-md" in:fade out:fade>
          <div class="p-5">
            <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">{it.userId}:{it.sk}</h5>
            <p class="font-normal text-gray-700">{it.entityType} → {it.entityId}</p>
            <p class="text-xs text-gray-500">{new Date(it.createdAt).toLocaleString()}</p>
            <pre class="mt-2 text-xs overflow-auto">{JSON.stringify(it.data, null, 2)}</pre>
          </div>
        </div>
      {/each}
    </div>
  </div>