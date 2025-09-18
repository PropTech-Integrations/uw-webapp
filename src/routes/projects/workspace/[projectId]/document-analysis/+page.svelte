<script lang="ts">
    import { PUBLIC_DOCUMENTS_BUCKET, PUBLIC_REGION } from '$env/static/public';

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// Import Types and Data Stores
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	// Project Data is loaded in the +layout.svelte file and passed to this component as well
	// as the other pages that are nested within the workspace layout
	import type { Project } from '$lib/types/Project';
	import type { Document } from '$lib/types/Document';
	import InsightTable from '$lib/components/workspace/InsightTable.svelte';
	import { AccordionItem, Accordion } from 'flowbite-svelte';

	// The project store holds the state for the workspace. It's initialized from data loaded
	// on the server side and passed to the client.
	import { project as projectStore, documents as documentsStore } from '$lib/stores/project.svelte';

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// Stores and State Variables
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	// Projects belong to users and hold the documents
	let project: Project = $derived($projectStore)!;

	// Documents belong to projects and hold the pages and insights
	let documents: Document[] = $derived($documentsStore);

	// Documents belong to projects and hold the pages and insights
	let currentDocHash: string | null = $derived(project?.documents?.[0]?.id ?? null);
	let currentDocument: Document | null = $derived(
		documents?.find((doc) => doc.docHash === currentDocHash) ?? null
	);
	const currentDocmentURL = $derived( `https://${PUBLIC_DOCUMENTS_BUCKET}.s3.${PUBLIC_REGION}.amazonaws.com/${currentDocHash}/document.pdf` )	
	let hasDocuments: boolean = $derived(project?.documents?.length > 0);
	$inspect('currentDocumentURL: ', currentDocmentURL);

	// PdfViewer is a component that is used to display the PDF document.
	// import PdfViewer from 'svelte-pdf';
	import PDFViewer from '$lib/components/PDFViewer/PDFViewer.svelte';

	let currentPage: number = $state(1);

	let pdfViewer: any;
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
	// Import Svelte Component
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
	import { Button, Dropdown, DropdownItem } from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';
</script>


<!-- {#if hasDocuments}
	<Button>
		{project?.documents?.find(doc => doc.id === currentDocHash)?.filename ?? 'Choose Document'}
		<ChevronDownOutline class="ms-2 h-6 w-6 text-white dark:text-white" />
	</Button>
	<Dropdown simple class="w-48 space-y-1 p-3 text-sm">
		{#each project?.documents as doc}
			<DropdownItem
				class="rounded-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-600 {currentDocHash === doc.id
					? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
					: ''}"
				onclick={() => {
					currentDocHash = doc.id;
				}}
			>
				{doc.filename}
			</DropdownItem>
		{/each}
	</Dropdown>
{/if} -->

{#if currentDocHash}
		<PDFViewer
			bind:this={pdfViewer}
			scale={1.0}
			bind:currentPage={currentPage}
			url={currentDocmentURL}
		/>
		<div class="md:col-span-1 lg:col-span-2 xl:col-span-3 md:mt-0 space-y-4">
			{#if currentDocument?.insights?.items}
				{#if currentDocument.insights.items.length === 0}
					<div class="text-gray-400">No insights found for this page.</div>
				{:else}
					<InsightTable
						insights={currentDocument.insights.items.filter(
							(i) => Number(i.pageId) + 1 === Number(currentPage)
						)}
					/>
				{/if}
			{:else}
				<div class="text-gray-400">No insights found for this page.</div>
			{/if}

			{#if currentDocument?.texts?.items}
				{#each currentDocument.texts.items.filter((t) => t.pageNumber + 1 === currentPage) as text}
					<Accordion>
						<AccordionItem>
							{#snippet header()}Show Raw Text{/snippet}
							<!-- <p class="mb-2 text-gray-500 dark:text-gray-400">
								Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab
								necessitatibus sint explicabo ...
							</p> -->
							<p class="text-gray-500 dark:text-gray-400">
								{currentPage + 1}: {text.content}
							</p>
						</AccordionItem>
					</Accordion>
				{/each}
			{:else}
				<div class="text-gray-400">No text found for this page.</div>
			{/if}
		</div>

{:else}
	<p class="text-sm text-gray-500 dark:text-gray-400">
		<b>Dashboard:</b>
		Click to load document analysis data...
	</p>
{/if}
