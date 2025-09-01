<script lang="ts">
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// Define the Types for the Component
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	import type { PageProps } from './$types';
	import type { DocumentAndPages, Page } from '$lib/types/Document';
	import type { Project } from '$lib/types/Project';

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// Props Section
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// Define the Props for the Component
	let componentProps: PageProps = $props();

	// Get the authenticated current User from the Load Data
	let currentUser = $derived(componentProps.data?.currentUser);

	// Get idToken from server-side load function
	let idToken = componentProps.data.idToken!;

	let project = $state(componentProps.data.project);
	// $inspect('The project is', project);

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// Realtime Section
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	// Define the public environment variables for GraphQL endpoint and API key
	import { PUBLIC_GRAPHQL_HTTP_ENDPOINT } from '$env/static/public';

	// 3. Import realtime subscription setup and helper for extracting data at a path
	import { AppSyncWsClient, gql } from '$lib/realtime/websocket/AppSyncWsClient';

	// 4. Import list operations for Project
	import { createListOps } from '$lib/realtime/websocket/ListOperations';

	// 5. Import GraphQL subscription queries for create, update, and delete events
	import { Q_GET_DOCUMENT_AND_PAGES } from '$lib/realtime/graphql/Documents/queries';
	import { updateProject } from '$lib/realtime/graphql/Projects/mutations';

	import { S_PROJECT_UPDATED_BY_ID } from '$lib/realtime/graphql/Projects/subscriptions';

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

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// Effects Section
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	// Watch for document changes and update project via GraphQL
	$effect(() => {
		if (project?.documents && idToken) {
			// Debounce the update to avoid excessive API calls
			const timeoutId = setTimeout(async () => {
				try {
					await updateProject(project, idToken);
					logger('Project updated successfully after document change');
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

		logger('Setting up WebSocket subscriptions for project:', project.id);

		const client = new AppSyncWsClient(
			{
				graphqlHttpUrl: PUBLIC_GRAPHQL_HTTP_ENDPOINT,
				auth: { mode: 'cognito', idToken },
				subscriptions: [
					{
						query: S_PROJECT_UPDATED_BY_ID,
						variables: { id: project.id },
						path: 'onProjectUpdated',
						next: (it: Project) => {
							if (it && it.id) {
								projectListOps.upsertMutable([project], it);
							}
						}
					}
				]
			}
		);

		// Return disposer to clean up subscriptions on component unmount/HMR
		return () => client.disconnect();
	});

	// Data defined for this component - Source Cards
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

	let documentAndPages: DocumentAndPages | null = $state(null);

	async function getDocumentPages() {
		logger('getDocumentPages');

		// Check if project has documents
		if (!project?.documents?.length) {
			logger('No documents in project');
			documentAndPages = null;
			return;
		}

		// Call the GraphQL endpoint with the Q_GET_DOCUMENT_AND_PAGES query
		const response = await gql<{ getDocument: DocumentAndPages }>(
			Q_GET_DOCUMENT_AND_PAGES,
			{ docHash: project.documents[0].id },
			idToken
		);

		// Check if response is null or undefined
		if (!response) {
			console.error('GraphQL response is null or undefined');
			return;
		}

		// Check if getDocument is null or undefined
		if (!response.getDocument) {
			console.error('getDocument is null or undefined in response');
			return;
		}

		documentAndPages = response.getDocument;
		logger('Document pages updated:', documentAndPages);
	}

	// Helper function to refresh document pages when documents change
	function refreshDocumentPages() {
		if (project?.documents?.length) {
			getDocumentPages();
		}
	}

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// Load the Flowbite Svelte components
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { Spinner } from 'flowbite-svelte';
	import PdfViewer from 'svelte-pdf';

	// Import Application Svelte Components
	import UploadArea from '$lib/components/Upload/UploadArea.svelte';
	import SourceCard from '$lib/components/Upload/SourceCard.svelte';
	import ProgressBar from '$lib/components/Upload/ProgressBar.svelte';
	import RightChatDrawer from '$lib/components/RightChatDrawer.svelte';
	import { ui } from '$lib/stores/ui.svelte';
	import WorkspaceHeaderBar from '$lib/components/workspace/WorkspaceHeaderBar.svelte';
	import GetStarted from '$lib/components/workspace/GetStarted.svelte';
	import { getPageS3Url } from '$lib/realtime/utils/s3urls';
	import { logger } from '$lib/logging/debug';
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
				<div class="grid grid-cols-6 gap-6">
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
					<div class="col-span-5">
						<Tabs tabStyle="pill">
							<TabItem open>
								{#snippet titleSlot()}
									<span>Get Started</span>
								{/snippet}
								<GetStarted />
							</TabItem>
							<TabItem onclick={getDocumentPages}>
								{#snippet titleSlot()}
									<span>Document Analysis</span>
								{/snippet}
								{#if documentAndPages}
									<div class="my-4 grid grid-cols-4 gap-4">
										<div class="text-sm text-gray-700">
											{#if documentAndPages?.pages?.items}
												<ul>
													{#each documentAndPages.pages.items as page}
														<div class="col-span-2">
															<PdfViewer
																scale={0.8}
																showBorder={false}
																showButtons={['']}
																url={getPageS3Url(
																	documentAndPages.s3Bucket,
																	documentAndPages.docHash,
																	page.pageNumber
																)}
															/>
														</div>
													{/each}
												</ul>
											{:else}
												<p>No pages found.</p>
											{/if}
										</div>
									</div>
								{:else}
									<p class="text-sm text-gray-500 dark:text-gray-400">
										<b>Dashboard:</b>
										Click to load document analysis data...
									</p>
								{/if}
							</TabItem>
							<TabItem>
								{#snippet titleSlot()}
									<span>AI Data Labeling</span>
								{/snippet}
								<p class="text-sm text-gray-500 dark:text-gray-400">
									<b>Settings:</b>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
									ut labore et dolore magna aliqua.
								</p>
							</TabItem>

							<TabItem>
								{#snippet titleSlot()}
									<span>Insights</span>
								{/snippet}
								<p class="text-sm text-gray-500 dark:text-gray-400">
									<b>Users:</b>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
									ut labore et dolore magna aliqua.
								</p>
							</TabItem>
							<TabItem>
								{#snippet titleSlot()}
									<span>Property Analysis</span>
								{/snippet}
								<p class="text-sm text-gray-500 dark:text-gray-400">
									<b>Users:</b>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
									ut labore et dolore magna aliqua.
								</p>
							</TabItem>
							<TabItem>
								{#snippet titleSlot()}
									<span>Market Analysis</span>
								{/snippet}
								<p class="text-sm text-gray-500 dark:text-gray-400">
									<b>Users:</b>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
									ut labore et dolore magna aliqua.
								</p>
							</TabItem>
							<TabItem>
								{#snippet titleSlot()}
									<span>Investment Analysis</span>
								{/snippet}
								<p class="text-sm text-gray-500 dark:text-gray-400">
									<b>Users:</b>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
									ut labore et dolore magna aliqua.
								</p>
							</TabItem>
							<TabItem>
								{#snippet titleSlot()}
									<span>Reports</span>
								{/snippet}
								<p class="text-sm text-gray-500 dark:text-gray-400">
									<b>Users:</b>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
									ut labore et dolore magna aliqua.
								</p>
							</TabItem>
						</Tabs>
					</div>
				</div>
			</main>
		{/if}
	</div>

	<!-- Right chat drawer -->
	<RightChatDrawer />
</div>
