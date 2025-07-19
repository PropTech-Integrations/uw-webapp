<script lang="ts">
	// Import Svelte Resources
	import { onMount } from 'svelte'; // Svelte lifecycle hook

	// Import PDF Viewer Component
	// import PDFViewer from '$lib/components/PDFViewer/PDFViewer.svelte';

    import PdfViewer from 'svelte-pdf';
	// Import Application Libraries, Types, and Functions
	import type { PageData } from './$types'; // Generated types for page props

	// Extract initial data provided by the page's load function
	export let data: PageData;

	// Reactive state holding the document data to display
	let documentData = data.document;

	let pages = documentData.filter((item: any) => item.SK && item.SK.startsWith('ASSET#PAGE#'));
	let pdfUrls: string[] = pages.map(
		(page: any, index: number) =>
			'https://uw-dev-documents-e1tez94r.s3.us-west-2.amazonaws.com/' +
			page.key 
	);
	//   let images = documentData.filter((item: any) => item.SK && item.SK.startsWith('ASSET#IMAGE#'));
</script>

<main>
	<h1>Document Details</h1>
	{#if documentData}
		<div>
			<!-- <!-- <h2>{documentData.title}</h2> -->
			<!-- <p>{JSON.stringify(images)}</p> -->
			<!-- {#each images as image}
        <img src={`https://uw-dev-documents-e1tez94r.s3.us-west-2.amazonaws.com/${image.key}`} alt="Document" />
      {/each} -->

			<h1>PDF Gallery</h1>
			<!-- <pre>{JSON.stringify(data, null, 2)}</pre> -->
            {#each pdfUrls as url, index}
              <PdfViewer url={url} showBorder={false} />
            {/each}
			<!-- {#each pdfUrls as url, index} -->
            <!-- <object data="https://www.cdc.gov/healthcare-associated-infections/media/pdfs/CRE-handout-V7-508.pdf" type="application/pdf" width="100%" height="600px" title="PDF Page 1">
                <p>
                  Your browser does not support PDF embedding. Download the PDF
                  <a href="https://www.cdc.gov/healthcare-associated-infections/media/pdfs/CRE-handout-V7-508.pdf">here</a>.
                </p>
              </object> -->
			<!-- {/each} -->
		</div>
	{:else}
		<p>Loading document data...</p>
	{/if}
</main>

<style>
	.pdf-frame {
		width: 100%;
		height: 800px;
		border: 1px solid #ddd;
		margin-bottom: 2rem;
	}
	.error {
		color: red;
	}
</style>
