<script lang="ts">
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// Import Types and Data Stores
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	// PageProps is a type that is used to hold the data for the page.
	import type { PageProps } from './$types';

	// Project Data is loaded in the +layout.svelte file and passed to this component as well
	// as the other pages that are nested within the workspace layout
	import type { Project } from '$lib/types/Project';

	// DocumentandPages is a type that is used to hold the data for the document and pages.
	import type { Document } from '$lib/types/Document';

	// The project store holds the state for the workspace. It's initialized from data loaded
	// on the server side and passed to the client.
	import { project as projectStore } from '$lib/stores/project.svelte';
    console.log("projectStore: ", projectStore);
	type PageItem = { id?: string; pageNumber?: number | null };
	type Pages = { items?: PageItem[] | null };
	type DocInput = {
		s3Bucket: string;

		docHash: string;
		pages?: Pages | null;
	};

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// Props and State Variables
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	let { data }: PageProps = $props();
	let { idToken } = data;

	// Use reactive project store instead of static data
	let project: Project = $derived($projectStore)!;
	let documentAndPages: Document | null = $state(null);
	let currentDocument = $state<string | null>(null);

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
	// Import Application Utility Functions
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
	import { getPageS3Url } from '$lib/utils/s3urls';
	import { gql } from '$lib/realtime/graphql/requestHandler';

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
	// Import 3rd Party Svelte Components
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

	// PdfViewer is a component that is used to display the PDF document.
	import PdfViewer from 'svelte-pdf';

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
	// GraphQL Queries
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
	import { Q_DOCUMENT_BY_ID } from '$lib/realtime/graphql/queries/Document';

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
	// Import Svelte Component
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
	import { Button, Dropdown, Checkbox, DropdownItem } from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
	// Svelte Component Functions
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
	function buildS3PageUrls(doc: DocInput, opts?: { region?: string }): string[] {
		const region = opts?.region ?? 'us-west-2';
		const bucket = (doc.s3Bucket || '').trim();
		const docHash = (doc.docHash || '').trim();

		if (!bucket) throw new Error('s3Bucket is required');
		if (!docHash) throw new Error('docHash is required');

		const items = doc.pages?.items ?? [];
		if (!Array.isArray(items) || items.length === 0) return [];

		// Sort items by pageNumber (ascending), fallback to index if missing
		const sorted = [...items].sort((a, b) => {
			console.log('a, b: ', a.pageNumber, ' ', b.pageNumber);
			const aNum = typeof a.pageNumber === 'number' && a.pageNumber > 0 ? a.pageNumber : 1;
			const bNum = typeof b.pageNumber === 'number' && b.pageNumber > 0 ? b.pageNumber : 1;
			// console.log("aNum, bNum: ", aNum, " ", bNum);
			return aNum - bNum;
		});

		console.log('sorted: ', sorted);
		return sorted.map((it, i) => {
			const n = typeof it.pageNumber === 'number' && it.pageNumber > 0 ? it.pageNumber : i + 1;
			return `https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(docHash)}/pages/${n}.pdf`;
			console.log('n: ', n);
		});
	}

	const fetchDocument = async (id: string) => {
		console.log('Fetching document:', id);
		const response = await gql<{ document: Document }>(
			Q_DOCUMENT_BY_ID,
			{ id }, // Pass documentId as variable
			idToken
		);
		// Log the response for debugging
		console.log('Here is the response===========================:> ', response);

		// If no response, throw 404 error
		if (!response) {
			throw new Error('Document not found');
		}

		// If document is missing in the response, throw 404 error
		if (!response.document) {
			throw new Error('Document not found');
		}

		const sortedPages = response.document.pages?.items?.sort((a, b) => a.pageNumber - b.pageNumber);

		// Update the current document and store the fetched data
		currentDocument = id;
		documentAndPages = response.document;
	};

	// Auto-fetch the first document when the page loads
	$effect(() => {
		if (project?.documents?.[0]?.id && !documentAndPages) {
			currentDocument = project.documents[0].id;
			fetchDocument(project.documents[0].id);
		}
	});
</script>

<Button
	>Choose Document<ChevronDownOutline class="ms-2 h-6 w-6 text-white dark:text-white" /></Button
>
<Dropdown simple class="w-48 space-y-1 p-3 text-sm">
	{#each project?.documents as doc}
		<DropdownItem class="rounded-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
			<Checkbox checked={currentDocument === doc.id} onchange={() => fetchDocument(doc.id)}>
				{doc.filename}
			</Checkbox>
		</DropdownItem>
	{/each}
</Dropdown>

{#if documentAndPages}
	<div class="my-4 space-y-8">
		{#if documentAndPages?.pages?.items}
			{#each documentAndPages.pages.items as page}
				<div class="grid grid-cols-2 items-start gap-4">
					<div>
						<h3>Page {page.pageNumber}</h3>
						<PdfViewer
							scale={0.8}
							showBorder={false}
							showButtons={['']}
							url={getPageS3Url(
								documentAndPages?.s3Bucket,
								documentAndPages?.docHash,
								page.pageNumber
							)}
						/>
					</div>
					<div>
						{#if documentAndPages?.texts?.items}
							{#each documentAndPages.texts.items.filter((t) => t.pageNumber+1 === page.pageNumber) as text}
								<div class="mb-2">{page.pageNumber+1}: {text.content}</div>
							{/each}
						{:else}
							<div class="text-gray-400">No text found for this page.</div>
						{/if}
					</div>
				</div>
			{/each}
		{:else}
			<p>No pages found.</p>
		{/if}
	</div>
{:else}
	<p class="text-sm text-gray-500 dark:text-gray-400">
		<b>Dashboard:</b>
		Click to load document analysis data...
	</p>
{/if}
