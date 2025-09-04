<!-- src/routes/(app)/+layout.svelte -->
<script lang="ts">
	// Type imports
	import type { LayoutProps } from './$types';
	import type { Project } from '$lib/types/Project';

	// Import Logging
	import { logger } from '$lib/logging/debug';

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// Props and State Variables
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	// $props() returns whatever props are passed into the component
	let { children, data }: LayoutProps = $props();
	// $inspect('layout.svelte: data from server', data);

	// Authentication: Get the authenticated current User from the Load Data
	let currentUser = $derived(data.currentUser);

	// Authentication: Get idToken from server-side load function
	let idToken = data.idToken!;

	// The Workspace Layout uses the project store for reactive project data
	let project = $derived(data.project);

	// Import project store for synchronization
	import { project as projectStore, setProject, updateProject } from '$lib/stores/project.svelte';

	// Sync server data to client store (only in browser)
	if (browser) {
		$effect(() => {
			if (project) {
				setProject(project);
			}
		});
	}

	$inspect(project);
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// GraphQL Endpoint, Queries, Mutations, and Subscriptions
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// Define the public environment variables for GraphQL endpoint and API key
	import { PUBLIC_GRAPHQL_HTTP_ENDPOINT } from '$env/static/public';

	// Import GraphQL Queries, Mutations, and Subscriptions
	import { S_PROJECT_UPDATED_BY_ID } from '$lib/realtime/graphql/subscriptions/Project';

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// Application Svelte Components Section
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	// Import Application Svelte Components
	import UploadArea from '$lib/components/Upload/UploadArea.svelte';

	import { ui } from '$lib/stores/ui.svelte';
	// import { project, setProject } from '$lib/stores/project.svelte';
	import { browser } from '$app/environment';
	import RightChatDrawer from '$lib/components/RightChatDrawer.svelte';
	import WorkspaceHeaderBar from '$lib/components/workspace/WorkspaceHeaderBar.svelte';
	import SourceCards from '$lib/components/workspace/SourceCards.svelte';
	import TabButton from '$lib/ui/TabButton.svelte';

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// Initialize the WebSocket Client
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	import { AppSyncWsClient } from '$lib/realtime/websocket/AppSyncWsClient';

	// these live across recreations of the child effect
	let client: AppSyncWsClient | null = null;

	// The websocket client should only be initialized once and is responsible for cleaning up
	// it's own resources when the component is destroyed
	$effect.root(() => {
		console.log('Entered $effect.root');
		if (typeof window === 'undefined') return; // SvelteKit guard

		// Tear down any previous client before creating a new one
		if (client) {
			console.log('Tearing down previous client');
			client.disconnect();
			client = null;
		}

		client = new AppSyncWsClient({
			graphqlHttpUrl: PUBLIC_GRAPHQL_HTTP_ENDPOINT,
			auth: { mode: 'cognito', idToken: idToken },
			subscriptions: [
				{
					query: S_PROJECT_UPDATED_BY_ID,
					variables: { id: project?.id },
					path: 'onProjectUpdated',
					next: (it: Project) => {
						project = it;
						// Update the global project store so all child pages stay in sync
						if (browser) {
							setProject(it);
						}
						logger(`Project ${it.id} updated:`, it);
					},
					error: (err) => console.error('project sub error', err)
				}
			]
		});

		return () => {
			client?.disconnect();
			client = null;
		};
	});
</script>

<!-- Full viewport split: main app + right chat drawer -->
<div
	class="flex min-h-[100svh] w-full bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100"
	style={`padding-right:${ui.sidebarOpen ? ui.sidebarWidth : 0}px`}
>
	<!-- Main app area -->
	<div class="flex min-w-0 flex-1 flex-col">
		<WorkspaceHeaderBar projectName={$projectStore?.name ?? ''} />

		<div class="grid flex-1 grid-cols-6 gap-6 p-4">
			<!-- Column 1 -->
			<div class="col-span-1">
				<section
					class="space-y-6 rounded-2xl bg-gradient-to-br from-zinc-50 via-red-50 to-indigo-50 p-2 shadow-md dark:bg-gray-800 dark:bg-none"
				>
					{#if $projectStore?.documents}
						{#each $projectStore.documents as document}
							<div>{document.filename}</div>
						{/each}
						<UploadArea bind:documents={$projectStore.documents} />
					{/if}
					<SourceCards />
				</section>
			</div>
			<div class="col-span-5">
				<!-- Workspace Navigation -->
				<div class="mb-4 flex flex-wrap gap-2">
					<TabButton href="get-started">Get Started</TabButton>
					<TabButton href="document-analysis">Document Analysis</TabButton>
					<TabButton href="ai-data-labeling">AI Data Labeling</TabButton>
					<TabButton href="insights">Insights</TabButton>
					<TabButton href="property-analysis">Property Analysis</TabButton>
					<TabButton href="market-analysis">Market Analysis</TabButton>
					<TabButton href="investment-analysis">Investment Analysis</TabButton>
					<TabButton href="reports">Reports</TabButton>
				</div>
				{@render children()}
			</div>
		</div>
	</div>

	<!-- Right chat drawer which will contain the chatbot -->
	<RightChatDrawer />
</div>
