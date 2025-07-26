<!-- src/lib/S3PdfList.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import PdfViewer from '$lib/components/PdfViewer.svelte';
  
	interface FileEntry {
	  key: string;
	  url: string;
	}
  
	let files: FileEntry[] = [];
	let loading = true;
	let error: string | null = null;
  
	onMount(async () => {
	  try {
		const res = await fetch('/api/s3-files');
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		files = await res.json();
	  } catch (err: any) {
		console.error(err);
		error = err.message;
	  } finally {
		loading = false;
	  }
	});
  </script>
  
  {#if loading}
	<p>Loading documents…</p>
  {:else if error}
	<p class="error">Error: {error}</p>
  {:else if files.length === 0}
	<p>No documents available.</p>
  {:else}
	<ul class="pdf-list">
	  {#each files as file (file.key)}
		<li class="pdf-item">
		  <h4>{file.key}</h4>
		  <PdfViewer
			{file.url}
			scale={1.2}
			showBorder={false}
			showButtons={[]}
		  />
		</li>
	  {/each}
	</ul>
  {/if}
  
  <style>
	.pdf-list { list-style: none; padding: 0; }
	.pdf-item { margin-bottom: 2rem; }
	.error { color: red; }
  </style>
  