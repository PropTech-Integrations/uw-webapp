<script lang="ts">
	import { onMount } from 'svelte';
	import { createAppSyncWsClient } from '$lib/graphql/appsync-ws';
	import { PUBLIC_GRAPHQL_HTTP_ENDPOINT, PUBLIC_GRAPHQL_API_KEY } from '$env/static/public';

	// Replace with your API details
	const API_KEY = import.meta.env.VITE_APPSYNC_API_KEY as string;

	// ---- types ----
	type UserItem = {
		userId: string;
		sk: string;
		entityType: string;
		entityId: string;
		data: any; // AppSync returns AWSJSON; we'll parse strings into objects
		createdAt: string;
	};

	// ---- state (Svelte 5 runes) ----
	let items = $state<UserItem[]>([]);
	let loading = $state(true);
	let errorMsg = $state<string | null>(null);
	let client: ReturnType<typeof createAppSyncWsClient> | null = null;

	// ---- tiny GraphQL helper for initial list ----
	async function gql<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
		const res = await fetch(PUBLIC_GRAPHQL_HTTP_ENDPOINT, {
			method: 'POST',
			headers: { 'content-type': 'application/json', 'x-api-key': PUBLIC_GRAPHQL_API_KEY },
			body: JSON.stringify({ query, variables })
		});
		const body = await res.json();
		if (body.errors?.length) throw new Error(body.errors.map((e: any) => e.message).join('; '));
		return body.data as T;
	}

	const Q_LIST = `
    query List($limit:Int) {
      listUserItems(limit:$limit) {
        items { userId sk entityType entityId data createdAt }
        nextToken
      }
    }`;

	// You can scope these with args if you want; leaving open to catch all changes
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

	const SUB_ON_CREATE = `
      subscription OnCreateUserItem {
        onCreateUserItem {
          userId
          sk
          entityType
          entityId
          data
          createdAt
        }
      }`;

	// ---- websocket client ----
	// Create in onMount so it only runs in the browser

	// ---- helpers to merge stream into state ----
	function keyFor(it: UserItem) {
		return `${it.userId}#${it.sk}`;
	}

	function normalize(it: UserItem): UserItem {
		if (typeof it.data === 'string') {
			try {
				it.data = JSON.parse(it.data);
			} catch {}
		}
		return it;
	}

	function upsert(it: UserItem) {
		it = normalize(it);
		const idx = items.findIndex((x) => keyFor(x) === keyFor(it));
		if (idx >= 0)
			items[idx] = it; // replace in place
		else items.unshift(it); // newest at top
	}

	function remove(it: UserItem) {
		items = items.filter((x) => keyFor(x) !== keyFor(it));
	}

	let handles: Array<{ unsubscribe: () => void }> = [];
  let frames = $state<any[]>([]);

	onMount(() => {
		(async () => {
			// 1) initial list (HTTP)
			try {
				const d = await gql<{ listUserItems: { items: UserItem[]; nextToken?: string } }>(Q_LIST, {
					limit: 50
				});
				items = (d.listUserItems.items ?? []).map(normalize);
			} catch (err) {
				errorMsg = (err as Error).message;
			} finally {
				loading = false;
			}

			// 2) live updates (WS)
			client = createAppSyncWsClient({
				graphqlHttpUrl: PUBLIC_GRAPHQL_HTTP_ENDPOINT,
				auth: { mode: 'apiKey', apiKey: PUBLIC_GRAPHQL_API_KEY },
				onEvent: (f) => {
					console.debug('WS frame', f);
					frames = [f, ...frames].slice(0, 20);
				}
			});
			handles.push(
				client.subscribe<{ onCreateUserItem: UserItem }>({
					query: S_CREATE,
					next: (p) => { console.log('[page] onCreate payload', p); p?.onCreateUserItem && upsert(p.onCreateUserItem); },
					error: (e) => console.error('onCreate error', e)
				}),
				client.subscribe<{ onUpdateUserItem: UserItem }>({
					query: S_UPDATE,
					next: (p) => { console.log('[page] onUpdate payload', p); p?.onUpdateUserItem && upsert(p.onUpdateUserItem); },
					error: (e) => console.error('onUpdate error', e)
				}),
				client.subscribe<{ onDeleteUserItem: UserItem }>({
					query: S_DELETE,
					next: (p) => { console.log('[page] onDelete payload', p); p?.onDeleteUserItem && remove(p.onDeleteUserItem); },
					error: (e) => console.error('onDelete error', e)
				})
			);
		})();

		// cleanup
		return () => {
			handles.forEach((h) => h.unsubscribe());
			client?.websocket.close();
		};
	});
</script>

<div class="space-y-3">
	{#if loading}
		<p class="text-gray-500">Loading…</p>
	{:else if errorMsg}
		<p class="text-red-600">Error: {errorMsg}</p>
	{:else if items.length === 0}
		<p class="text-gray-500">No items yet.</p>
	{/if}

	<ul class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each items as it (it.userId + ':' + it.sk)}
			<li class="rounded-xl border p-3">
				<div class="font-semibold">{it.userId}:{it.sk}</div>
				<div class="text-sm text-gray-600">{it.entityType} → {it.entityId}</div>
				<div class="text-xs text-gray-500">{new Date(it.createdAt).toLocaleString()}</div>
				<pre class="mt-2 overflow-auto text-xs">{JSON.stringify(it.data, null, 2)}</pre>
			</li>
		{/each}
	</ul>

	<div class="mt-6">
		<h3 class="text-sm font-semibold text-gray-700">Recent WS frames (latest first)</h3>
		<pre class="mt-2 max-h-64 overflow-auto rounded bg-gray-50 p-2 text-xs">{JSON.stringify(frames, null, 2)}</pre>
	</div>
</div>
