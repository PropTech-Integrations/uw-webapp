<!-- src/lib/PdfViewer.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
	GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

	export let url: string;
	let canvas: HTMLCanvasElement;

	onMount(async () => {
		const loadingTask = getDocument(url);
		const pdf = await loadingTask.promise;
		const page = await pdf.getPage(1); // render only first page
		const viewport = page.getViewport({ scale: 1.5 });
		canvas.width = viewport.width;
		canvas.height = viewport.height;
		await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
	});
</script>

<canvas bind:this={canvas}></canvas>
