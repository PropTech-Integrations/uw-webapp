<script lang="ts">
	// Import Svelte Resources
	import { onMount } from 'svelte'; // Svelte lifecycle hook

	import { PUBLIC_WS_URL } from '$env/static/public'; // WebSocket endpoint from environment

	// Import Application Libraries, Types, and Functions
	import { mergeEvents } from '$lib/websockets/mergeEvents'; // Helper to merge stream events into table data
	import type { StreamEvent, Item } from '$lib/websockets/types'; // Type definitions for stream events and data items
	// import type { PageData } from './$types'; // Generated types for page props
	import { createWebSocket } from '$lib/websockets/websockets'; // Factory to create a configured WebSocket



	// Import PDF Viewer Component
	// import PDFViewer from '$lib/components/PDFViewer/PDFViewer.svelte';

	import PdfViewer from 'svelte-pdf';
	// Import Application Libraries, Types, and Functions
	import type { PageData } from './$types'; // Generated types for page props
	import { Accordion, AccordionItem, Heading, P } from 'flowbite-svelte';
	import { marked } from 'marked';

	// Extract initial data provided by the page's load function
	export let data: PageData;

	// Reactive state holding the document data to display
	let documentData = data.document;

	console.log("Document Data", documentData)
	let pages = documentData.filter((item: any) => item.SK && item.SK.startsWith('ASSET#PAGE#'));
	console.log("Pages", pages)
	let pdfUrls: string[] = pages
		.sort((a: any, b: any) => a.pageId - b.pageId)
		.map((page: any) => 'https://uw-dev-documents-e1tez94r.s3.us-west-2.amazonaws.com/' + page.key);
	//   let images = documentData.filter((item: any) => item.SK && item.SK.startsWith('ASSET#IMAGE#'));
	let texts = documentData
		.filter((item: any) => item.SK && item.SK.startsWith('ASSET#TEXT#'))
		.sort((a: any, b: any) => a.pageId - b.pageId)
		.map((item: any) => {
			return {
				...item,
				text: item.text.replace(/!\[.*?\]\(.*?\)/g, '') // Remove markdown image references
			};
		});
	console.log(texts[0].text)
</script>

<main class="w-full bg-amber-50">
	{#if documentData}
		<h1 class="text-2xl font-bold p-4">Document Analysis</h1>
		<!-- <pre>{JSON.stringify(pages, null, 2)}</pre> -->
		<div class="my-4 grid grid-cols-4 gap-4 bg-amber-50">
			{#each pdfUrls as url, index}
				<div class="col-span-2">
					<PdfViewer scale={.70} {url} showBorder={false} showButtons={['']} />
				</div>
				<div class="col-span-2">
					<Heading tag="h5" class="text-md">
						Artificial Intelligence is Indentifying Key Data
					</Heading>
					<ul class="list-disc pl-5">
						<li>Document Title: {documentData.title}</li>
						<li>Number of Pages: {pages.length}</li>
						<!-- <li>PDF URLs: {#each pdfUrls as url}<span>{url}</span>{/each}</li> -->
						<!-- <li>Entities Count: {entities.length}</li> -->
					</ul>


					
					<!-- {#if entities && entities[page.index]}
						<EntitiesList entities={entities[page.index]} />
					{:else}
						<P>No entities found for this page</P>
					{/if} -->
					<div class="border rounded-lg p-4">
						<h3 class="text-lg font-semibold mb-2">Raw Scanned Text</h3>
						{#if texts[index] && texts[index].text}
							<p>Page: {index}</p>
							<div class="text-sm">
								<!-- <p>{texts[0].text}</p> -->
								<P>{@html marked(texts[index]["text"])}</P>
							</div>
						{:else}
							<p>No text available for this page.</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<p>Loading document data...</p>
	{/if}
</main>

<style>

</style>
