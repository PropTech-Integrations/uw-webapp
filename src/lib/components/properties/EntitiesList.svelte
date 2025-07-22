<script lang="ts">
	import { Badge, Button, Heading, Hr, P } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	export let entities: { category: string; subCategory?: string; entity: string; discovered: boolean }[];

	let showAll = false;
	let displayedEntities: { category: string; subCategory?: string; entity: string; discovered: boolean }[] = [];

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

	<Heading tag="h3" class="text-xl font-bold pb-4">
		{#if displayedEntities.length > 0}
			{displayedEntities[0].category}
		{/if}
	</Heading>
	{#each displayedEntities as value, key}
		<div class="mb-2 grid grid-cols-9 gap-4">
			
			{#if value.subCategory}
				<Badge class="col-span-2 text-center">{value.subCategory}</Badge>
			{:else}
				<Badge class="col-span-2 text-center">{value.category}</Badge>
			{/if}
			<P class="col-span-5 text-sm">{truncateText(value.entity)}</P>
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