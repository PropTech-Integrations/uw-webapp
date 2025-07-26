<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import PdfViewer from 'svelte-pdf';
	import type { PageData } from './$types'; // Import the type for page data
	import { marked } from 'marked';
	import { Accordion, AccordionItem, P } from 'flowbite-svelte';

	import EntitiesList from '$lib/components/properties/EntitiesList.svelte';

	// Extract the document data provided by the page's load function
	export let data: PageData;

	// Reactive state holding the document data
	let documentData = data.document;
	// console.log('Document Analysis', documentData);

	let pdfViewers: any[] = [];
</script>

<!-- Page layout: Display document data in a table -->
<div class="w-full space-y-4">
	<h2 class="p-4 text-4xl font-extrabold dark:text-white">Document Analysis</h2>
	<div class="my-4 grid grid-cols-5 gap-4 bg-amber-50">
		{#each documentData as page, index}
			<div class="col-span-3">
				<P class="m-4 mb-0 font-bold">Page{page.pageId}</P>
				<PdfViewer scale={1.2} url={page.url} showBorder={false} showButtons={['']} />
			</div>
			<div class="col-span-2">
				{#if page.entities && page.entities.length > 0}
					<EntitiesList entities={page.entities} />
				{:else}
					<P>No entities found for this page</P>
				{/if}
				<Accordion flush>
					<AccordionItem>
						{#snippet header()}Raw Scanned Text{/snippet}
						<p class="text-sm">{@html marked(page.text)}</p>
					</AccordionItem>
				</Accordion>
			</div>
		{/each}
	</div>

	<!-- <table class="min-w-full bg-white">
    <thead>
      <tr>
        {#if documentData.length > 0}
          {#each Object.keys(documentData[0]) as column}
            <th class="py-2">{column}</th>
          {/each}
        {/if}
      </tr>
    </thead>
    <tbody>
      {#each documentData as row}
        <tr>
          {#each Object.values(row) as value}
            <td class="border px-4 py-2">{value}</td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table> -->
</div>
