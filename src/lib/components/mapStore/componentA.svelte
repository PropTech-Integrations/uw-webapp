<!-- ComponentA.svelte - Subscribes to "documents" array -->
<script lang="ts">
	import { mapStore } from '$lib/stores/mapStore';

	// Subscribe to just the "documents" array - must be at top level
	const documentsStore = mapStore.subscribeToKey('documents');

	let newDocuments = '';

	function addDocuments() {
		if (newDocuments) {
			mapStore.addToKey('documents', newDocuments);
			newDocuments = '';
		}
	}
</script>

<div class="component">
	<h3>Component A - documents</h3>

	<!-- This only updates when documents array changes -->
	<p>Count: {$documentsStore.length}</p>

	<ul>
		{#each $documentsStore as documents, index}
			<li>
				{JSON.stringify(documents, null, 2)}
				<button onclick={() => mapStore.removeFromKey('documents', index)}>×</button>
			</li>
		{/each}
	</ul>

	<input bind:value={newDocuments} placeholder="Add documents..." />
	<button onclick={addDocuments}>Add</button>
</div>

<style>
	.component {
		padding: 1rem;
		background: #e3f2fd;
		border-radius: 8px;
		margin: 0.5rem;
	}
</style>