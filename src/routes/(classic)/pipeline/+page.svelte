<script lang="ts">
	import PropertyCard from '$lib/components/properties/PropertyCard.svelte';
	import Button from '$lib/ui/Button.svelte';

	export let data;
	const { properties } = data;

</script>

<div
	class="min-h-screen w-full space-y-6 bg-white bg-gradient-to-br from-zinc-50 via-red-50 to-indigo-50 p-6 shadow-md"
>
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h1 class="font-poppins text-2xl font-semibold">Pipeline</h1>
		<!-- INSERT_YOUR_CODE -->

		<button
			class="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 shadow-sm transition hover:bg-gray-50"
		>

			<span class="text-xs font-medium text-gray-700">Forward Documents to <b class="font-semibold">user@stratiq-pipeline.com</b> for auto analysis</span>
		</button>
		
		<Button href="/properties/new" icon={true}>New Property Analysis</Button>
	</div>

	<!-- Search & Filters -->
	<div class="flex items-center space-x-4">
		<input
			type="text"
			placeholder="search pipeline"
			class="flex-1 rounded-lg border border-gray-400 px-4 py-2 focus:outline-none focus:ring"
		/>
		<!-- <button class="rounded border px-3 py-2 hover:bg-gray-100">Filters</button> -->
		<Button href="#" icon={false}>Filters</Button>
	</div>

	<!-- List -->
	<div class="space-y-4">
		{#each properties as prop}
			<PropertyCard {prop} />
		{/each}
	</div>
</div>