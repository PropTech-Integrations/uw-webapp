<script lang="ts">
	import { onMount } from 'svelte';
	import { createAppSyncWsClient } from '$lib/graphql/appsync-ws';
	import { PUBLIC_GRAPHQL_HTTP_ENDPOINT, PUBLIC_GRAPHQL_API_KEY } from '$env/static/public';

	// ---- types ----
	type UserItem = {
		userId: string;
		sk: string;
		entityType: string;
		entityId: string;
		data: any; // AppSync returns AWSJSON; we'll parse strings into objects
		createdAt: string;
	};

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

	// ---- state (Svelte 5 runes) ----
	let items = $state<UserItem[]>([]);
	let loading = $state(true);
	let errorMsg = $state<string | null>(null);
	let client: ReturnType<typeof createAppSyncWsClient> | null = null;
	let sub: { unsubscribe: () => void } | null = null;

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

	onMount(() => {
		client = createAppSyncWsClient({
			graphqlHttpUrl: PUBLIC_GRAPHQL_HTTP_ENDPOINT,
			auth: { mode: 'apiKey', apiKey: PUBLIC_GRAPHQL_API_KEY },
			onEvent: (frame) => console.debug('WS frame', frame)
		});

		sub = client.subscribe({
			query: SUB_ON_CREATE,
			next: (data: any) => {
				console.log('data -------------------------->', data);
				const rec = data?.onCreateUserItem;
				if (rec) items = [rec, ...items];
			},
			error: (e) => console.error('subscription error', e)
		});

		return () => {
			sub?.unsubscribe();
			client?.websocket?.close();
		};
	});
</script>

<h2 class="text-xl font-semibold">Live UserItems</h2>
<ul class="mt-4 space-y-2">
	{#each items as it}
		<li class="rounded-xl border p-3">{it.userId}:{it.sk} — {it.entityType} → {it.entityId}</li>
	{/each}
</ul>
