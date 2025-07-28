<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import PdfViewer from 'svelte-pdf';
	import type { PageData } from './$types'; // Import the type for page data
	import { marked } from 'marked';
	import { Accordion, AccordionItem, P } from 'flowbite-svelte';

	import EntitiesList from '$lib/components/properties/EntitiesList.svelte';
	import Sidebar from '$lib/components/properties/sidebar/Sidebar.svelte';

	// Extract the document data provided by the page's load function
	export let data: PageData;

	// Reactive state holding the document data
	let documentData = data.document;
	// console.log('Document Analysis', documentData);

	let pdfViewers: any[] = [];
	let id = '';
	
	// Use browser check to avoid SSR issues
	if (typeof window !== 'undefined') {
		id = window.location.pathname.split('/')[2];
	}
	// Example static fetch
	const property = {
		id: id,
		address: '9404 West Rd, Houston, TX 77064, USA',
		statusTags: [],
		info: {
			price: '$858,139,130',
			units: 280,
			unitMix: ['138× 1+1', '8× 2+1', '110× 2+2', '24× 3+2'],
			pricePerUnit: '$3.06M',
			pricePerSF: '$2,892.4',
			ybYr: '2005/2022',
			buildingSize: '296,688 SF',
			bedrooms: 446
		},
		metrics: {
			cap: { current: '0.29%', proforma: '0.55%' },
			grm: { current: '177.01', proforma: '170.38' },
			coc: { current: '0.06%', proforma: '0.47%' },
			upside: '3.89%',
			irr: { current: '-5.33%', target: '10.00%' },
			equityMultiple: { current: '0.59×', target: '1.50×' },
			roe: { current: '0.1%', target: '4.77%' },
			roi: '4.64%',
			priceEstimate: {
				low: '$815,232,174',
				mid: '$858,139,130',
				high: '$901,046,087'
			}
		},
		acquisition: {
			holdTerm: '10 years',
			exitCap: '1.55%',
			workingCapital: '$0',
			acquisitionDate: 'Jul 18, 2025',
			totalCashToClose: '$830.41M',
			totalAcquisitionCosts: '$858.14M',
			decisionCriteria: [
				{ label: 'IRR', current: '-5.33%', target: '10.00%' },
				{ label: 'Equity Multiple', current: '0.59×', target: '1.50×' },
				{ label: 'Avg. Cash on Cash', current: '0.47%', target: '5.00%' },
				{ label: 'Min. Purchase Cap Rate', current: '0.29%', target: '1.90%' },
				{ label: 'Proforma Cap Rate', current: '0.55%', target: '3.00%' }
			]
		}
	};

</script>

<div class="flex h-full">
	<Sidebar {property} />
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
