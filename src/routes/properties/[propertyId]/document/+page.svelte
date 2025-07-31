<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import PdfViewer from 'svelte-pdf';
	import type { PageData } from './$types'; // Import the type for page data
	import { marked } from 'marked';
	import { Accordion, AccordionItem, Heading, P } from 'flowbite-svelte';

	import EntitiesList from '$lib/components/properties/EntitiesList.svelte';

	// Extract the document data provided by the page's load function
	export let data: PageData;

	// Reactive state holding the document data
	let documentData = data.document;
	console.log('Document Analysis', documentData);

	let pdfViewers: any[] = [];
</script>

<!-- Page layout: Display document data in a table -->
<section
	class="w-full space-y-6 rounded-2xl bg-white bg-gradient-to-br from-zinc-50 via-red-50 to-indigo-50 p-6 shadow-md"
>
	<Heading tag="h2" class="mb-8 text-2xl font-extrabold  md:text-3xl lg:text-4xl">
		AI Document Analysis
	</Heading>
	<P class="text-shadow-md mb-6 font-normal leading-tight text-gray-700 dark:text-gray-400">
		We've analyzed the document and extracted important information. Verify the results and make any
		necessary adjustments.
	</P>
	<div class="my-4 grid grid-cols-5 gap-4">
		{#each documentData as page, index}
			<div class="col-span-3">
				<P class="m-4 mb-0 font-bold">Page{page.pageId}</P>
				<PdfViewer scale={0.75} url={page.url} showBorder={false} showButtons={['']} />
			</div>
			<div class="col-span-2">
				<EntitiesList entities={page.entities} />

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
</section>
