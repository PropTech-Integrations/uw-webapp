<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	import { PUBLIC_WS_URL } from '$env/static/public';
	import { Heading, P } from 'flowbite-svelte';

	// Extract the document data provided by the page's load function
	export let data: PageData;

	// Reactive state holding the document data
	let documentData = data.documents ?? [];
	onMount(() => {
		console.log('PUBLIC_WS_URL -------------------------->', PUBLIC_WS_URL);
	});
</script>

<Heading>Documents</Heading>

<div class="flex flex-col gap-4">
	{#each documentData as document, index}
		<div class="gap-4">
			<P class="m-4 mb-0 font-bold">Document {index + 1}</P>
			<a href={`/documents/${document.hash}`}>
				<P>
					{document.hash}
				</P>
			</a>
		</div>
	{/each}
</div>
