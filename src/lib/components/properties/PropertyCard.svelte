<script lang="ts">
	import type { Property } from '$lib/types/property';
	import type { CompsComparisonRow } from '$lib/types/property';
	import CompsComparison from '$lib/components/properties/CompsComparison.svelte';
	export let prop: Property;
	$: console.log(prop);
	const compsComparisonRows: CompsComparisonRow[] = [
		{
			label: 'Averages',
			salePrice: '$665M',
			units: 230,
			rsf: '180,930',
			ybYr: '2019/--',
			perUnit: '$2,891,304',
			perSf: '$3,675.45',
			cap: '--',
			grm: '--',
			avgUnitSf: 787
		},
		{
			label: 'Subject',
			salePrice: '--',
			units: 280,
			rsf: '--',
			ybYr: '2005/2022',
			perUnit: '--',
			perSf: '--',
			cap: '--',
			grm: '--',
			avgUnitSf: '--'
		}
	];
</script>

<a href={prop.url} >
	<div
		class="flex items-center my-2 justify-between rounded-lg border border-dashed border-purple-300 bg-white p-4 transition-shadow hover:shadow"
	>
		<!-- Left: Thumbnail & Address -->
		<div class="flex items-center space-x-4">
			{#if prop.thumbnailUrl}
				<img src={prop.thumbnailUrl} alt="thumb" class="h-16 w-20 rounded object-cover" />
			{:else}
				<div class="flex h-16 w-20 items-center justify-center rounded bg-gray-200">
					<svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 7l6 6-6 6M21 7l-6 6 6 6"
						/>
					</svg>
				</div>
			{/if}

			<div>
				<div class="font-medium">{prop.address}</div>
				<div class="mt-1 flex flex-wrap gap-2">
					{#each prop.statusTags as tag}
						<span class="font-poppins rounded-full border-b- bg-yellow-100 px-2 py-1 text-sm text-yellow-700">
							{tag}
						</span>
					{/each}
				</div>
			</div>
		</div>

		<!-- Middle (stats & metrics) -->
		<!-- {#if !prop.isDraft}
			<div class="flex-1 px-6">
				<div class="flex flex-wrap gap-2 text-sm text-gray-600">
					{#each prop.stats ?? [] as stat, index}
						<span>{stat}</span>
						{#if index < (prop.stats?.length ?? 0) - 1}<span>·</span>{/if}
					{/each}
				</div>
				<div class="mt-2 text-sm">
					{#if prop.cap}
						<span class="font-semibold">CAP {prop.cap}</span>
					{/if}
					{#if prop.grm}
						<span class="ml-4 font-semibold">GRM {prop.grm}</span>
					{/if}
				</div>
			</div>
		{/if} -->

		<!-- Right: Actions & Date -->
		<div class="flex items-center space-x-4">
			<div class="text-sm text-gray-500">{prop.date}</div>

			<!-- {#if prop.isDraft}
				<button class="rounded bg-purple-600 px-3 py-1 text-white" on:click={prop.onFinishDraft}>
					finish draft
				</button>
			{:else}
				<!-- <img src="https://i.pravatar.cc/32?u={prop.id}" alt="user" class="h-8 w-8 rounded-full" /> -
				<button class="rounded p-1 hover:bg-gray-100" aria-label="More options">
					<p>...</p>
				</button>
			{/if} -->
		</div>
	</div>
</a>
