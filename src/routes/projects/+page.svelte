<script lang="ts">
	import type { LayoutProps } from '../$types';

	let { data }: LayoutProps = $props();
	console.log('=========================================');
	console.log(data);
	console.log('=========================================');

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

	// Local Types
	import type { Project } from '$lib/types/belongsToUser/project';

	// Local Components
	import Projects from './projects.json';
	import { imagesPath } from './variables';
	import DeleteModal from './DeleteModal.svelte';
	import UserModal from './UserModal.svelte';
	import MetaTag from './MetaTag.svelte';

	// State
	let openProject: boolean = $state(false); // modal control
	let openDelete: boolean = $state(false); // modal control
	let current_project: any = $state({});

	// current user from load data
	let currentUser = $derived(data?.currentUser);

	// Meta Tags
	const path: string = '/projects';
	const description: string = 'My StratiqAI Projects';
	const title: string = 'My StratiqAI Projects';
	const subtitle: string = 'My StratiqAI Projects';
</script>

<MetaTag {path} {description} {title} {subtitle} />

<main class="relative h-full w-full overflow-y-auto bg-white dark:bg-gray-800">
	<h1 class="hidden">Projects</h1>
	<div class="p-4">
		<Breadcrumb class="mb-5">
			<BreadcrumbItem home>Home</BreadcrumbItem>
			<BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
			<BreadcrumbItem>List</BreadcrumbItem>
		</Breadcrumb>

		{#if currentUser?.isAuthenticated}
			<p>Hi {currentUser.givenName + ' ' + currentUser.familyName}</p>
		{:else}
			<a href="/auth/login">Sign in</a>
		{/if}

		<Heading tag="h1" class="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white"
			>All Projects</Heading
		>
		<Toolbar embedded class="w-full py-4 text-gray-500  dark:text-gray-300">
			<Input placeholder="Search for projects" class="me-4 w-80 border xl:w-96" />
			<div class="border-l border-gray-100 pl-2 dark:border-gray-700">
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
			</div>
			{#snippet end()}
				<div class="flex items-center space-x-2">
					<Button
						size="sm"
						class="gap-2 whitespace-nowrap px-3"
						onclick={() => ((current_project = {}), (openProject = true))}
					>
						<PlusOutline size="sm" />Add Project
					</Button>
					<Button size="sm" color="alternative" class="gap-2 px-3">
						<DownloadSolid size="md" class="-ml-1" />Export
					</Button>
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
			{#each Projects as project}
				<TableBodyRow class="text-base border-gray-200">
					<TableBodyCell class="w-4 p-4"><Checkbox /></TableBodyCell>
					<TableBodyCell class="mr-12 flex items-center space-x-6 whitespace-nowrap p-4">
						<Avatar src={project.image} size="lg" cornerStyle="rounded" />
						<div class="text-sm font-normal text-gray-500 dark:text-gray-300">
							<div class="text-base font-semibold text-gray-900 dark:text-white">
								{project.name}
							</div>
							<div class="text-sm font-normal text-gray-500 dark:text-gray-300">
								{project.description}
							</div>
						</div>
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
						<Button
							size="sm"
							class="gap-2 px-3"
							onclick={() => ((current_project = project), (openProject = true))}
						>
							<EditOutline size="sm" /> Edit
						</Button>
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

<!-- Modals -->
<UserModal bind:open={openProject} data={current_project} />
<DeleteModal bind:open={openDelete} />
