<script lang="ts">
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// Imports Section
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	// Import Svelte's fade transition for animating list items
	import { fade } from 'svelte/transition';

	// Import types for page props and user items
	import type { PageProps } from './$types';

	// Import types for user items
	import type { UserItem } from '$lib/types/UserItem';

	// Import realtime subscription setup and helper for extracting data at a path
	import { setupAppSyncRealtime, subAtPath } from '$lib/realtime/websocket/AppSyncWsClient';

	// Import list operations for UserItem (upsert/remove helpers)
	import { userItemOps } from '$lib/realtime/websocket/ListOperations';

	// Import GraphQL subscription queries for create, update, and delete events
	import { S_CREATE, S_UPDATE, S_DELETE } from '$lib/realtime/graphql/queries';

	// Import public environment variables for GraphQL endpoint and API key
	import { PUBLIC_GRAPHQL_HTTP_ENDPOINT } from '$env/static/public';
	import { error } from '@sveltejs/kit';

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// State Section
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	// Get initial data from server-side load function
	let { data }: PageProps = $props();

	// Make items reactive and deeply tracked for mutations (Svelte 5 $state)
	let items = $state<UserItem[]>(data.items);

	// Get idToken from server-side load function
	let idToken = data.idToken!

	// Reactive error message, initially null
	let errorMsg = $state<string | null>(null);

	// Enable Svelte's inspection tool for debugging items
	// $inspect(items);

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// Effects Section
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	// Set up GraphQL realtime subscriptions when component is mounted
	$effect.root(() => {
		// Only run on the client (not during SSR)
		if (typeof window === 'undefined') return;

		const dispose = setupAppSyncRealtime(
			{
				graphqlHttpUrl: PUBLIC_GRAPHQL_HTTP_ENDPOINT,
				auth: { mode: 'cognito', idToken }
			},
			[
				// Subscribe to "create" events and upsert new items into the list
				subAtPath<UserItem>({
					query: S_CREATE,
					path: 'onCreateUserItem',
					next: (it) => userItemOps.upsertMutable(items, it)
				}),
				// Subscribe to "update" events and upsert updated items into the list
				subAtPath<UserItem>({
					query: S_UPDATE,
					path: 'onUpdateUserItem',
					next: (it) => userItemOps.upsertMutable(items, it)
				}),
				// Subscribe to "delete" events and remove deleted items from the list
				subAtPath<UserItem>({
					query: S_DELETE,
					path: 'onDeleteUserItem',
					next: (it) => userItemOps.removeMutable(items, it)
				})
			]
		);

		// Return disposer to clean up subscriptions on component unmount/HMR
		return dispose;
	});
</script>

<div class="space-y-3 p-4">
	<h1 class="mb-4 text-2xl font-bold">Realtime GraphQL Testing</h1>

	{#if errorMsg}
		<!-- Show error message if present -->
		<p class="text-red-600">Error: {errorMsg}</p>
	{/if}

	<!-- Display items in a responsive grid -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each items as it (it.userId + ':' + it.sk)}
			<!-- Card for each user item, with fade in/out transitions -->
			<div class="max-w-sm rounded-lg border border-gray-200 bg-white shadow-md" in:fade out:fade>
				<div class="p-5">
					<!-- Display userId and sk as the card title -->
					<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">{it.userId}:{it.sk}</h5>
					<!-- Show entity type and entity id -->
					<p class="font-normal text-gray-700">{it.entityType} → {it.entityId}</p>
					<!-- Show creation date in local format -->
					<p class="text-xs text-gray-500">{new Date(it.createdAt).toLocaleString()}</p>
					<!-- Pretty-print the data field -->
					<pre class="mt-2 overflow-auto text-xs">{JSON.stringify(it.data, null, 2)}</pre>
				</div>
			</div>
		{/each}
	</div>
</div>
