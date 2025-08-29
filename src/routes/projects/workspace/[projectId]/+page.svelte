<script lang="ts">

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// Props Section
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	
	// Import the SvelteKit Types for the Page Properties
	import type { PageProps } from './$types';
	
	// Get the Props for the Component
	let componentProps: PageProps = $props();

	// Get the authenticated current User from the Load Data
	let currentUser = $derived(componentProps.data?.currentUser);

	// Get idToken from server-side load function
	let idToken = componentProps.data.idToken!;

	let project = $state(componentProps.data.project);
	$inspect("The project is", project);

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// Realtime Section
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	// 1. Import public environment variables for GraphQL endpoint and API key
	import { PUBLIC_GRAPHQL_HTTP_ENDPOINT } from '$env/static/public';

	// 2. Import types for user items
	import type { Project } from '$lib/types/Project';

	// 3. Import realtime subscription setup and helper for extracting data at a path
	import { gql, setupAppSyncRealtime, subAtPath } from '$lib/realtime/websocket/AppSyncWsClient';

	// 4. Import list operations for Project
	import { createListOps } from '$lib/realtime/websocket/ListOperations';

	// 5. Import GraphQL subscription queries for create, update, and delete events
	// import { Q_LIST_USER_PROJECTS } from '$lib/realtime/graphql/Projects/queries';
	import { M_UPDATE_PROJECT } from '$lib/realtime/graphql/Projects/mutations';
	import {
		S_CREATE_PROJECT,
		S_UPDATE_PROJECT,
		S_DELETE_PROJECT
	} from '$lib/realtime/graphql/Projects/subscriptions';

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// Data Section
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	// const { data } = $props<{ data: { project: Project } }>();
	// const project = $state(data.project);
	// $inspect(project);

	// 6. Create list operations for Project
	export const projectListOps = createListOps<Project>({
		keyFor: (it) => it.id
	});

	async function updateProject(project: Project, idToken: string) {
		const mutation = M_UPDATE_PROJECT;
		// Extract only the fields that can be updated according to UpdateProjectInput
		const input = {
			id: project.id,
			name: project.name,
			description: project.description,
			image: project.image,
			address: project.address,
			city: project.city,
			state: project.state,
			zip: project.zip,
			country: project.country,
			assetType: project.assetType,
			status: project.status,
			isActive: project.isActive,
			isArchived: project.isArchived,
			isDeleted: project.isDeleted,
			isPublic: project.isPublic,
			members: project.members,
			documents: project.documents,
			tags: project.tags
		};
		console.log('input', JSON.stringify(input, null, 2));
		try {
			const res = await gql<{ updateProject: Project }>(mutation, { input }, idToken);
			return res.updateProject;
		} catch (e) {
			console.error('Error updating project:', e);
			throw e;
		}
	}

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// Effects Section
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	// Watch for document changes and update project via GraphQL
	$effect(() => {
		console.log("in effect -=-=-=-=-=-=-=-=-= +++");
		if (project?.documents && idToken) {
			// Debounce the update to avoid excessive API calls
			const timeoutId = setTimeout(async () => {
				try {
					await updateProject(project, idToken);
					console.log('Project updated successfully after document change');
				} catch (error) {
					console.error('Failed to update project:', error);
				}
			}, 1000); // Wait 1 second after last change

			return () => clearTimeout(timeoutId);
		}
	});

	// Set up GraphQL realtime subscriptions when component is mounted
	$effect.root(() => {
		// Only run on the client (not during SSR)
		if (typeof window === 'undefined') return;

		// Check if idToken and project are available before setting up WebSocket
		if (!idToken || !project) {
			console.error('No idToken or project available for WebSocket authentication');
			return;
		}

		console.log('Setting up WebSocket with idToken:', idToken ? 'present' : 'missing');

		const dispose = setupAppSyncRealtime(
			{
				graphqlHttpUrl: PUBLIC_GRAPHQL_HTTP_ENDPOINT,
				auth: { mode: 'cognito', idToken }
			},
			[
				// Subscribe to "create" events and upsert new items into the list
				subAtPath<Project>({
					query: S_CREATE_PROJECT,
					path: 'onProjectCreated',
					next: (it) => {
						if (it && it.id) {
							projectListOps.upsertMutable([project], it);
						}
					}
				}),
				// Subscribe to "update" events and upsert updated items into the list
				subAtPath<Project>({
					query: S_UPDATE_PROJECT,
					path: 'onProjectUpdated',
					next: (it) => {
						if (it && it.id) {
							projectListOps.upsertMutable([project], it);
						}
					}
				}),
				// Subscribe to "delete" events and remove deleted items from the list
				subAtPath<Project>({
					query: S_DELETE_PROJECT,
					path: 'onProjectDeleted',
					next: (it) => {
						if (it && it.id) {
							projectListOps.removeMutable([project], it);
						}
					}
				})
			]
		);

		// Return disposer to clean up subscriptions on component unmount/HMR
		return dispose;
	});


	// Import Svelte Components
	import UploadArea from '$lib/components/Upload/UploadArea.svelte';
	import SourceCard from '$lib/components/Upload/SourceCard.svelte';
	import ProgressBar from '$lib/components/Upload/ProgressBar.svelte';
	import RightChatDrawer from '$lib/components/RightChatDrawer.svelte';
	import { ui } from '$lib/stores/ui.svelte';
	import WorkspaceHeaderBar from '$lib/components/workspace/WorkspaceHeaderBar.svelte';

	// Data defined for this component
	const sourceCards = [
		{
			title: 'PDF Documents',
			image: '/images/sources_page/om3.png',
			description: 'Offering Memorandums, Investment Presentations, and other PDF documents'
		},
		{
			title: 'Rent Roll',
			image: '/images/sources_page/rentroll.jpg',
			description:
				'Upload Rent Roll documents exported from Appfolio, Yardi and other property management systems.'
		},
		{
			title: 'T12',
			image: '/images/sources_page/t12.png',
			description:
				'Upload T12 and income/expense documents exported from common property management systems.'
		}
	];

	// let currentCount = 2;
	// const maxCount = 20;
</script>

<!-- Full viewport split: main app + right chat drawer -->
<div
	class="flex min-h-[100svh] w-full bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100"
	style={`padding-right:${ui.sidebarOpen ? ui.sidebarWidth : 0}px`}
>
	<!-- Main app area -->
	<div class="flex min-w-0 flex-1 flex-col">
		{#if project}
			<WorkspaceHeaderBar projectName={project.name} />

			<!-- Content -->
			<main class="flex-1 p-4">
				<div class="grid grid-cols-3 gap-6">
					<!-- Column 1 -->
					<div class="col-span-1">
						<section
							class="space-y-6 rounded-2xl bg-white bg-gradient-to-br from-zinc-50 via-red-50 to-indigo-50 p-2 pt-0 shadow-md"
						>
							<UploadArea bind:documents={project.documents} />

						<div class="grid grid-cols-1 gap-4">
							{#each sourceCards as card}
								<SourceCard {card} />
							{/each}
						</div>

						<!-- <ProgressBar {currentCount} {maxCount} /> -->
					</section>
				</div>

				<!-- Columns 2 & 3 (Filler) -->
				<div class="col-span-2">
					<!-- Blog Section -->
					<section class="mb-6 rounded-xl bg-white p-6 shadow">
						<h2 class="mb-4 text-xl font-semibold">StratiqAI Blog</h2>
						<article class="mb-6">
							<h3 class="mb-2 text-lg font-bold">Welcome to the StratiqAI Blog!</h3>
							<p class="mb-2 text-gray-700">
								Stay up to date with the latest news, product updates, and industry insights from
								the StratiqAI team.
							</p>
							<a href="/blog/welcome" class="text-sm text-blue-600 hover:underline">Read more →</a>
						</article>
						<article class="mb-6">
							<h3 class="mb-2 text-lg font-bold">How AI is Transforming Property Analysis</h3>
							<p class="mb-2 text-gray-700">
								Discover how artificial intelligence is streamlining underwriting and property
								evaluation for real estate professionals.
							</p>
							<a href="/blog/ai-property-analysis" class="text-sm text-blue-600 hover:underline"
								>Read more →</a
							>
						</article>
						<article>
							<h3 class="mb-2 text-lg font-bold">Tips for Uploading Your First Property</h3>
							<p class="mb-2 text-gray-700">
								Get started quickly with our step-by-step guide to uploading and analyzing your
								first property in StratiqAI.
							</p>
							<a href="/blog/first-property-tips" class="text-sm text-blue-600 hover:underline"
								>Read more →</a
							>
						</article>
					</section>
				</div>
			</div>
		</main>
		{/if}
	</div>

	<!-- Right chat drawer -->
	<RightChatDrawer />
</div>
