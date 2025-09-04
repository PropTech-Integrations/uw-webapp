<script lang="ts">
	import PdfViewer from 'svelte-pdf';
	import { getPageS3Url } from '$lib/utils/s3urls';
	import type { DocumentAndPages } from '$lib/types/Document';
	import type { PageProps } from './$types';
	import { project as projectStore } from '$lib/stores/project.svelte';
	import type { Project } from '$lib/types/Project';

	let { data }: PageProps = $props();

	let { idToken } = data;

	// Use reactive project store instead of static data
	let project: Project = $derived($projectStore)!;
	let documentAndPages: DocumentAndPages | null = $state(null);

	let currentDocument = $state<string | null>(null);
    $inspect("currentDocument: ", currentDocument);
    
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
	// Import Svelte Component
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
	import { Button, Dropdown, Checkbox, DropdownItem } from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';
	import { Q_DOCUMENT_AND_PAGES_BY_ID } from '$lib/realtime/graphql/queries/Document';
	import { gql } from '$lib/realtime/graphql/requestHandler';

	type PageItem = { id?: string; pageNumber?: number | null };
	type Pages = { items?: PageItem[] | null };
	type DocInput = {
		s3Bucket: string;
		docHash: string;
		pages?: Pages | null;
	};

	function buildS3PageUrls(doc: DocInput, opts?: { region?: string }): string[] {
		const region = opts?.region ?? 'us-west-2';
		const bucket = (doc.s3Bucket || '').trim();
		const docHash = (doc.docHash || '').trim();

		if (!bucket) throw new Error('s3Bucket is required');
		if (!docHash) throw new Error('docHash is required');

		const items = doc.pages?.items ?? [];
		if (!Array.isArray(items) || items.length === 0) return [];

		// Use pageNumber if present; otherwise fall back to 1-based index.
		const numbers = items.map((it, i) =>
			typeof it.pageNumber === 'number' && it.pageNumber > 0 ? it.pageNumber : i + 1
		);

		// De-dupe and sort ascending
		const uniqueSorted = Array.from(new Set(numbers)).sort((a, b) => a - b);

		// Build URLs like:
		// https://{bucket}.s3.{region}.amazonaws.com/{docHash}/pages/{n}.pdf
		return uniqueSorted.map(
			(n) =>
				`https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(docHash)}/pages/${n}.pdf`
		);
	}

	const fetchDocument = async (id: string) => {
		console.log('Fetching document:', id);
		const response = await gql<{ document: DocumentAndPages }>(
			Q_DOCUMENT_AND_PAGES_BY_ID,
			{ id }, // Pass documentId as variable
			idToken
		);
		// Log the response for debugging
		console.log(response);

		// If no response, throw 404 error
		if (!response) {
			throw new Error('Document not found');
		}

		// If document is missing in the response, throw 404 error
		if (!response.document) {
			throw new Error('Document not found');
		}

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

<!-- <h1>Document Analysis - You made it!</h1> -->

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
<div class="my-4 grid grid-cols-4 gap-4">
    <div class="text-sm text-gray-700">
        {#if documentAndPages?.pages?.items}
            <ul>
                {#each documentAndPages?.pages?.items as page}
                    <div class="col-span-2">
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
