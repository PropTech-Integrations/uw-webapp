<script lang="ts">
	// 1. Import the SvelteKit Types for the Page Properties
	import type { PageProps } from './$types';

	// Import realtime subscription setup and helper for extracting data at a path
	import { setupAppSyncRealtime, subAtPath, gql } from '$lib/realtime/websocket/AppSyncWsClient';

	// Import list operations for UserItem (upsert/remove helpers)
	import { projectListOps } from '$lib/realtime/websocket/ListOperations';

	// Import GraphQL subscription queries for create, update, and delete events
	// import { S_CREATE, S_UPDATE, S_DELETE } from '$lib/realtime/graphql/UserItems/queryDefs';
	import { M_CREATE_PROJECT, M_DELETE_PROJECT } from '$lib/realtime/graphql/Projects/mutations';
	import { S_CREATE_PROJECT, S_UPDATE_PROJECT, S_DELETE_PROJECT } from '$lib/realtime/graphql/Projects/subscriptions';

	// Import public environment variables for GraphQL endpoint and API key
	import { PUBLIC_GRAPHQL_HTTP_ENDPOINT } from '$env/static/public';

	// Import types for user items
	import type { Project } from '$lib/types/Project';

	// 2. Get the Props for the Component
	let componentProps: PageProps = $props();

	// 3. Get the authenticated current User from the Load Data
	let currentUser = $derived(componentProps.data?.currentUser);

	// Get idToken from server-side load function
	// TODO: The web socket should be enhanced so that the URL with the authentiation is created on the server side.
	//       This will allow the server to not have to pass the idToken to the client
	//       Expiration times should be set to 1 hour or less
	let idToken = componentProps.data.idToken!;

	// Debug: Log the idToken status
	console.log('idToken from props:', idToken ? 'present' : 'missing');
	console.log('componentProps.data:', componentProps.data);

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// State Section
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	// 4. Make items reactive and deeply tracked for mutations (Svelte 5 $state)
	let projects = $state<Project[]>(componentProps.data?.items);
	// $inspect(items);

	// let projects: Project[] = $derived(
	// 	items.map((item) => {
	// 		const data = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
	// 		return { ...data, id: item.entityId };
	// 	})
	// );

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// Effects Section
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	// Set up GraphQL realtime subscriptions when component is mounted
	$effect.root(() => {
		// Only run on the client (not during SSR)
		if (typeof window === 'undefined') return;

		// Check if idToken is available before setting up WebSocket
		if (!idToken) {
			console.error('No idToken available for WebSocket authentication');
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
					next: (it) => projectListOps.upsertMutable(projects, it)
				}),
				// Subscribe to "update" events and upsert updated items into the list
				subAtPath<Project>({
					query: S_UPDATE_PROJECT,
					path: 'onProjectUpdated',
					next: (it) => projectListOps.upsertMutable(projects, it)
				}),
				// Subscribe to "delete" events and remove deleted items from the list
				subAtPath<Project>({
					query: S_DELETE_PROJECT,
					path: 'onProjectDeleted',
					next: (it) => projectListOps.removeMutable(projects, it)
				})
			]
		);

		// Return disposer to clean up subscriptions on component unmount/HMR
		return dispose;
	});

	// Reactive error message, initially null
	let errorMsg = $state<string | null>(null);

	// Flowbite Svelte Components
	import {
		Avatar,
		Breadcrumb,
		BreadcrumbItem,
		Button,
		Checkbox,
		Heading,
		Indicator
	} from 'flowbite-svelte';

	import { Input, Table, TableBody, TableBodyCell, TableBodyRow, TableHead } from 'flowbite-svelte';
	import { TableHeadCell, Toolbar, ToolbarButton } from 'flowbite-svelte';
	import { CogSolid, DotsVerticalOutline, DownloadSolid } from 'flowbite-svelte-icons';
	import {
		EditOutline,
		ExclamationCircleSolid,
		PlusOutline,
		TrashBinSolid
	} from 'flowbite-svelte-icons';

	// Local Components
	import DeleteModal from './DeleteModal.svelte';
	import ProjectModal from './ProjectModal.svelte';
	import MetaTag from './MetaTag.svelte';

	// State
	let openProject: boolean = $state(false); // modal control
	let openDelete: boolean = $state(false); // modal control
	let current_project: any = $state({});

	// Meta Tags
	const path: string = '/projects';
	const description: string = 'My StratiqAI Projects';
	const title: string = 'My StratiqAI Projects';
	const subtitle: string = 'My StratiqAI Projects';

	// Sample project data
	const sampleProject = {
		id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
		name: 'Sample Project',
		address: '123 Main St',
		assetType: 'Office',
		city: 'Sample City',
		state: 'CA',
		zip: '90001',
		country: 'USA',
		image: '',
		description: 'A sample project for demonstration.',
		ownerId: currentUser?.sub || '',
		createdAt: new Date().toISOString(),
		status: 'Active',
		members: [],
		tags: ['demo'],
		isPublic: false,
		isArchived: false,
		isDeleted: false,
		isActive: true,
		id_token: '', // Fill in as needed
		access_token: '',
		refresh_token: ''
	};

	// Creation is handled inside ProjectModal
</script>

<MetaTag {path} {description} {title} {subtitle} />

<main class="relative h-full w-full overflow-y-auto bg-white dark:bg-gray-800">
	<h1 class="hidden">Projects</h1>
	<div class="p-4">
		<!-- <Breadcrumb class="mb-5">
			<BreadcrumbItem home>Home</BreadcrumbItem>
			<BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
			<BreadcrumbItem>List</BreadcrumbItem>
		</Breadcrumb> -->

		<!-- {#if currentUser?.isAuthenticated}
			<p>Hi {currentUser.givenName + ' ' + currentUser.familyName}</p>
		{:else}
			<a href="/auth/login">Sign in</a>
		{/if} -->

		<Toolbar embedded class="w-full py-4 text-gray-500  dark:text-gray-300">
			<Heading tag="h1" class="text-xl pr-8 font-semibold text-gray-900 sm:text-2xl dark:text-white"
				>Investment Pipeline</Heading
			>
			<Input placeholder="Search for projects" class="me-4 w-80 border xl:w-96" />
			<!-- <div class="border-l border-gray-100 pl-2 dark:border-gray-700">
				<ToolbarButton
					color="dark"
					class="m-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700"
				>
					<CogSolid size="lg" />
				</ToolbarButton>
				<ToolbarButton
					color="dark"
					class="m-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700"
				>
					<TrashBinSolid size="lg" />
				</ToolbarButton>
				<ToolbarButton
					color="dark"
					class="m-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700"
				>
					<ExclamationCircleSolid size="lg" />
				</ToolbarButton>
				<ToolbarButton
					color="dark"
					class="m-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700"
				>
					<DotsVerticalOutline size="lg" />
				</ToolbarButton>
			</div> -->
			{#snippet end()}
				<div class="flex items-center space-x-2">
					<Button
						size="sm"
						class="gap-2 whitespace-nowrap px-3"
						onclick={() => (window.location.href = '/projects/workspace')}
					>
						<PlusOutline size="sm" />Add Project
					</Button>
					<!-- <Button size="sm" color="alternative" class="gap-2 px-3">
						<DownloadSolid size="md" class="-ml-1" />Export
					</Button> -->
				</div>
			{/snippet}
		</Toolbar>
	</div>
	<Table>
		<TableHead class="border-y border-gray-200 bg-gray-100 dark:border-gray-700">
			<TableHeadCell class="w-4 p-4"><Checkbox /></TableHeadCell>
			{#each ['Name', 'Address', 'Asset Type', 'Status', 'Actions'] as title}
				<TableHeadCell class="p-4 font-medium">{title}</TableHeadCell>
			{/each}
		</TableHead>
		<TableBody>
			{#each projects as project}
				<TableBodyRow class="border-gray-200 text-base">
					<TableBodyCell class="w-4 p-4"><Checkbox /></TableBodyCell>
					<TableBodyCell class="mr-12 flex items-center space-x-6 whitespace-nowrap p-4">
						<a href={`/projects/workspace/${project.id}`} class="flex items-center space-x-6 group">
							<Avatar src={project.image || ''} size="lg" cornerStyle="rounded" />
							<div class="text-sm font-normal text-gray-500 dark:text-gray-300">
								<div class="text-base font-semibold text-gray-900 dark:text-white group-hover:underline">
									{project.name}
								</div>
								<div class="text-sm font-normal text-gray-500 dark:text-gray-300">
									{project.description}
								</div>
							</div>
						</a>
					</TableBodyCell>
					<TableBodyCell
						class="max-w-sm overflow-hidden truncate p-4 text-base font-normal text-gray-500 xl:max-w-xs dark:text-gray-300"
					>
						<div class="text-base font-semibold text-gray-900 dark:text-white">
							{project.address}
						</div>
						<div class="text-sm font-normal text-gray-500 dark:text-gray-300">
							{project.city + ', ' + project.state + ' ' + project.zip}
						</div>
					</TableBodyCell>
					<TableBodyCell class="p-4">{project.assetType}</TableBodyCell>
					<TableBodyCell class="p-4 font-normal">
						<div class="flex items-center gap-2">
							<Indicator
								color={project.status === 'Active'
									? 'green'
									: project.status === 'Archived'
										? 'blue'
										: 'red'}
							/>
							{project.status}
						</div>
					</TableBodyCell>
					<TableBodyCell class="space-x-2 p-4">
						<!-- <Button
							size="sm"
							class="gap-2 px-3"
							onclick={() => ((current_project = project), (openProject = true))}
						>
							<EditOutline size="sm" /> Edit
						</Button> -->
						<Button
							color="red"
							size="sm"
							class="gap-2 px-3"
							onclick={() => ((current_project = project), (openDelete = true))}
						>
							<TrashBinSolid size="sm" /> Delete
						</Button>
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
</main>
<!-- onclick={() => ((current_project = project), (openDelete = true))} -->
<!-- Modals -->
<ProjectModal bind:open={openProject} data={current_project} {idToken} />
<DeleteModal bind:open={openDelete} data={current_project} {idToken} />
