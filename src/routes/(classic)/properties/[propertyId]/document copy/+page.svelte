<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	// Import Environment Variables
	import { PUBLIC_WS_URL } from '$env/static/public'; // WebSocket endpoint from environment

	// Import Application Libraries, Types, and Functions
	import { mergeEvents } from '$lib/websockets/mergeEvents'; // Helper to merge stream events into table data
	import type { StreamEvent } from '$lib/websockets/types'; // Type definitions for stream events and data items
	import { createWebSocket } from '$lib/websockets/websockets'; // Factory to create a configured WebSocket

	import PdfViewer from 'svelte-pdf';
	import type { PageData } from './$types'; // Import the type for page data
	import { marked } from 'marked';
	// import { classify } from '../../../../../../scripts/insights/classifier';
	import { Accordion, AccordionItem, Heading, P } from 'flowbite-svelte';

	import EntitiesList from '$lib/components/properties/EntitiesList.svelte';

	// Extract the document data provided by the page's load function
	// export let data: PageData;
	// Extract initial data provided by the page's load function
	let { data }: { data: PageData } = $props();
	console.log('data -------------------------->', data);
	// Reactive state holding the array of items to display in the table
	let docdata = $state(data.document)
	console.log('table_data --------------------------');
	$inspect(docdata);
	// Reference to the WebSocket connection, for cleanup
	let socket: ReturnType<typeof createWebSocket>;

	// Reactive state holding the document data
	let documentData = data.document;
	console.log('Document Analysis', documentData);

	let pdfViewers: any[] = [];

	// Initialize WebSocket connection when component mounts
	onMount(() => {
		//   console.log('🔌 WebSocket connecting to', PUBLIC_WS_URL, "wss://mbft9w8es5.execute-api.us-west-2.amazonaws.com/prod", PUBLIC_WS_URL === "wss://mbft9w8es5.execute-api.us-west-2.amazonaws.com/prod");
		socket = createWebSocket({
			url: PUBLIC_WS_URL,
			onMessage: (event: StreamEvent) => {
				console.log('event -------------------------->', event);
				const type = classify(event.data);
				console.log('type -------------------------->', type);
				// Merge each incoming DynamoDB stream event into the current table data
				docdata = mergeEvents(docdata, [event]);
			},
			onOpen: () => console.log('🔌 WebSocket connected'), // Log on successful connection
			onClose: () => console.log('❌ WebSocket closed'), // Log on connection close
			onError: () => console.warn('⚠️ WebSocket error') // Warn on any connection errors
		});
	});

	// Clean up the WebSocket connection when component is destroyed
	onDestroy(() => {
		socket?.close();
	});
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
				<PdfViewer scale={0.55} url={page.url} showBorder={false} showButtons={['']} />
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
