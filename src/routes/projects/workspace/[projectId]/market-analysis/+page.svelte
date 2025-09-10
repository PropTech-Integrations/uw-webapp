<!-- +page.svelte -->
<script lang="ts">
	import { project as projectStore } from '$lib/stores/project.svelte';

	let { data } = $props();
	// Use reactive project store instead of static data
	let project = $derived($projectStore);

	import PdfViewerSearch from '$lib/components/PDFViewer/PDFViewerSearch.svelte';

	// Example: put a PDF in your static/ folder (e.g., static/sample.pdf)
	let pdfUrl = '/198 NE Combs Flat Rd OM.pdf';
	let query = $state('');
	let pdfViewer: PdfViewerSearch;
	$inspect('query: ', query);
</script>

<div class="mx-auto max-w-screen-lg p-4">
	<div class="mb-4 flex items-center gap-2">
		<input
			class="w-full rounded border px-3 py-2 shadow-sm text-gray-700"
			type="text"
			placeholder="Search text to highlight…"
			bind:value={query}
		/>
		<button
			class="rounded border border-gray-700 text-gray-700 dark:text-gray-300 dark:border-gray-300 px-4 py-2 shadow-sm hover:bg-gray-50"
			onclick={() => {
				query = query.trim();
				pdfViewer?.performSearch();
			}}
			aria-label="Apply search"
		>
			Search
		</button>
	</div>

	<PdfViewerSearch bind:this={pdfViewer} src={pdfUrl} {query} scale={1.25} />
</div>
