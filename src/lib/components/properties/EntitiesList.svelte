<script lang="ts">
	import { Badge, Button, Heading, Hr, P } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	interface entities {
		category: string;
		name: string;
		value: string;
		confidence: number;
	}
	let { entities } = $props();
	// console.log("entities -------------------------->");
	// $inspect(entities);

	let showAll = $state(false);
	let displayedEntities: entities[] = $state([]);

	onMount(() => {
		displayedEntities = entities.slice(0, 12);
	});

	function toggleShowAll() {
		showAll = !showAll;
		displayedEntities = showAll ? entities : entities.slice(0, 12);
	}

	function truncateText(text: string | number | boolean): string {
		if (typeof text !== 'string') return String(text);
		return text.length > 60 ? text.slice(0, 60) + '...' : text;
	}
</script>

<div class="mt-20 text-white">

	<Heading tag="h4" class="text-md font-bold pb-4">Labeled Data</Heading>
	{#each displayedEntities as value, key}
		<div class="mb-2 grid grid-cols-9 gap-4">
			{#if value.name}
				<Badge class="col-span-2 text-center">{value.name}</Badge>
			{:else}
				<Badge class="col-span-2 text-center">{value.value}</Badge>
			{/if}
			<P class="col-span-5 text-sm">{truncateText(value.value)}</P>
			<P class="col-span-2 text-sm">{value.confidence * 100}% confidence</P>
				<!-- <P class="text-sm underline">Edit</P> -->
			<!-- {#if value.discovered}
				<Badge class="col-span-2 text-center">Discovered</Badge>
			{/if} -->
		</div>
	{/each}
	{#if entities.length > 12}
		<Button onclick={toggleShowAll} class="mt-4">
			{showAll ? 'Show Less' : 'Click for More'}
		</Button>
	{/if}
</div>