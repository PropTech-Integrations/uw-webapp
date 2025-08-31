<script lang="ts">
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// Props Section
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	// Import the SvelteKit Types for the Page Properties
	import type { PageProps } from './$types';
	import type { DocumentAndPages, Page } from '$lib/types/Document';

	// Get the Props for the Component
	let componentProps: PageProps = $props();

	// Get the authenticated current User from the Load Data
	let currentUser = $derived(componentProps.data?.currentUser);

	// Get idToken from server-side load function
	let idToken = componentProps.data.idToken!;

	let project = $state(componentProps.data.project);
	$inspect('The project is', project);

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
	import { Q_GET_DOCUMENT_AND_PAGES } from '$lib/realtime/graphql/Documents/queries';
	import { M_UPDATE_PROJECT } from '$lib/realtime/graphql/Projects/mutations';
	import {
		S_CREATE_PROJECT,
		S_UPDATE_PROJECT,
		S_DELETE_PROJECT
	} from '$lib/realtime/graphql/Projects/subscriptions';
	import {
		S_CREATE_DOCUMENT,
		S_UPDATE_DOCUMENT,
		S_DELETE_DOCUMENT
	} from '$lib/realtime/graphql/Documents/subscriptions';
	import {
		S_CREATE_PAGE,
		S_UPDATE_PAGE,
		S_DELETE_PAGE
	} from '$lib/realtime/graphql/Pages/subscriptions';

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
		console.log('in effect -=-=-=-=-=-=-=-=-= +++');
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

		console.log('Setting up WebSocket subscriptions for project:', project.id);

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
				}),
				
				// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
				// Document Subscriptions - Listen for document changes and refresh page data
				// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
				
				// Subscribe to document creation events
				subAtPath<DocumentAndPages>({
					query: S_CREATE_DOCUMENT,
					path: 'onDocumentCreated',
					next: (doc) => {
						if (doc && doc.docHash) {
							console.log('New document created:', doc);
							// Refresh document data when a new document is created
							if (project?.documents?.some(d => d.id === doc.docHash)) {
								refreshDocumentPages();
							}
						}
					}
				}),
				// Subscribe to document update events
				subAtPath<DocumentAndPages>({
					query: S_UPDATE_DOCUMENT,
					path: 'onDocumentUpdated',
					next: (doc) => {
						if (doc && doc.docHash) {
							console.log('Document updated:', doc);
							// Refresh document data when a document is updated
							if (project?.documents?.some(d => d.id === doc.docHash)) {
								refreshDocumentPages();
							}
						}
					}
				}),
				// Subscribe to document deletion events
				subAtPath<DocumentAndPages>({
					query: S_DELETE_DOCUMENT,
					path: 'onDocumentDeleted',
					next: (doc) => {
						if (doc && doc.docHash) {
							console.log('Document deleted:', doc);
							// Refresh document data when a document is deleted
							if (project?.documents?.some(d => d.id === doc.docHash)) {
								refreshDocumentPages();
							}
						}
					}
				}),
				
				// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
				// Page Subscriptions - Listen for page changes and refresh document data
				// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
				
				// Subscribe to page creation events
				subAtPath<Page>({
					query: S_CREATE_PAGE,
					path: 'onPageCreated',
					next: (page) => {
						if (page && page.docHash) {
							console.log('New page created:', page);
							// Refresh document data when a new page is created
							if (project?.documents?.some(d => d.id === page.docHash)) {
								refreshDocumentPages();
							}
						}
					}
				}),
				// Subscribe to page update events
				subAtPath<Page>({
					query: S_UPDATE_PAGE,
					path: 'onPageUpdated',
					next: (page) => {
						if (page && page.docHash) {
							console.log('Page updated:', page);
							// Refresh document data when a page is updated
							if (project?.documents?.some(d => d.id === page.docHash)) {
								refreshDocumentPages();
							}
						}
					}
				}),
				// Subscribe to page deletion events
				subAtPath<Page>({
					query: S_DELETE_PAGE,
					path: 'onPageDeleted',
					next: (page) => {
						if (page && page.docHash) {
							console.log('Page deleted:', page);
							// Refresh document data when a page is deleted
							if (project?.documents?.some(d => d.id === page.docHash)) {
								refreshDocumentPages();
							}
						}
					}
				})
			]
		);

		// Return disposer to clean up subscriptions on component unmount/HMR
		return dispose;
	});

	import { Tabs, TabItem } from 'flowbite-svelte';
	import { Spinner } from 'flowbite-svelte';
	import PdfViewer from 'svelte-pdf';

	// Import Svelte Components
	import UploadArea from '$lib/components/Upload/UploadArea.svelte';
	import SourceCard from '$lib/components/Upload/SourceCard.svelte';
	import ProgressBar from '$lib/components/Upload/ProgressBar.svelte';
	import RightChatDrawer from '$lib/components/RightChatDrawer.svelte';
	import { ui } from '$lib/stores/ui.svelte';
	import WorkspaceHeaderBar from '$lib/components/workspace/WorkspaceHeaderBar.svelte';
	import GetStarted from '$lib/components/workspace/GetStarted.svelte';
	import { getPageS3Url } from '$lib/realtime/utils/s3urls';

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

	let documentAndPages: DocumentAndPages | null = $state(null);

	async function getDocumentPages() {
		console.log('getDocumentPages');

		// Check if project has documents
		if (!project?.documents?.length) {
			console.log('No documents in project');
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
		console.log('Document pages updated:', documentAndPages);
	}

	// Helper function to refresh document pages when documents change
	function refreshDocumentPages() {
		if (project?.documents?.length) {
			getDocumentPages();
		}
	}

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
