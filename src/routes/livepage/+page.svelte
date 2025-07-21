<script lang="ts">
	import PdfViewer from 'svelte-pdf';
	import type { PageData } from './$types'; // Import the type for page data
	import { marked } from 'marked';
	import { P } from 'flowbite-svelte';
	import { onMount, onDestroy } from 'svelte';

	// Extract the document data provided by the page's load function
	export let data: PageData;

	// Reactive state holding the document data
	let documentData = data.document;
	console.log('Document Analysis', documentData);

	let pdfViewers: any[] = [];


</script>

<!-- Page layout: Display document data in a table -->
<div class="w-full space-y-4">
	<h2 class="text-4xl font-extrabold p-4 dark:text-white">Document Analysis</h2>
	<div class="my-4 grid grid-cols-4 gap-4 bg-amber-50">
		{#each documentData as page, index}
        <div class="col-span-2">
            <PdfViewer scale={0.825} url={page.url} showBorder={false} showButtons={['']} />
        </div>
        <div class="col-span-2">
            {#if page.text}
            <div class="text-sm">

                <P>{@html marked(page.text)}</P>
            </div>
            {:else}
                <p>No text available for this page.</p>
            {/if}
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
