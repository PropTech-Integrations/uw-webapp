<script lang="ts">
	import PropertyCard from '$lib/components/properties/PropertyCard.svelte';
	import Button from '$lib/ui/Button.svelte';

	interface Property {
		id: string;
		address: string;
    url: string;
		thumbnailUrl?: string;
		statusTags: string[];
		stats?: string[];
		cap?: string;
		grm?: string;
		date: string;
		isDraft?: boolean;
		onFinishDraft?: () => void;
	}

	const properties: Property[] = [
		{
			id: '582b8cda7fb7184fcdde7d7c254fb86ce978fa517059782c7537980ac3f261d8',
			address: '198 NE Combs Flat Rd, Prineville, OR 97754',
			thumbnailUrl: '/images/properties/198NECombs.png',
      url: "/properties/582b8cda7fb7184fcdde7d7c254fb86ce978fa517059782c7537980ac3f261d8/summary",
			statusTags: ['Draft'],
			date: 'Jul 18, 2025',
			isDraft: false,
			onFinishDraft: () => alert('Finish draft clicked!')
		},
		{
			id: 'c42fdf5d3d1e873c8ae713110424968eec1dded045067183a387c5ff5e1b11de',
			address: 'Hobby Lobby 4107 Broadway Street, Mount Vernon, IL 62864',
      url: "/properties/c42fdf5d3d1e873c8ae713110424968eec1dded045067183a387c5ff5e1b11de/summary",
			statusTags: ['Go Signal'],
			thumbnailUrl: '/images/properties/hobbylobby.png',
			stats: ['280 units', '$858.14M', '$3M/unit', '$2,892.40/SF', '296.69K SF', '2005/R 2022'],
			cap: '0.29%',
			grm: '177.01',
			date: 'Jul 18, 2025'
		},
		{
			id: 'e404e46d3a6158cdb05155e2f614692c4ef99104fc1ebddbd5c02aa6f57a158d',
			address: '907-1015 S. WW White Rd, San Antonio, TX 78220, USA',
      url: "/properties/e404e46d3a6158cdb05155e2f614692c4ef99104fc1ebddbd5c02aa6f57a158d/summary",
			thumbnailUrl: '/images/properties/loneoak.png',
			statusTags: [],
			stats: ['8 units', '$6.1M', '$763K/unit', '$948.09/SF', '6.43K SF', '2001/R 2018'],
			cap: '3.17%',
			grm: '18.94',
			date: 'Jul 18, 2025'
		},
		{
			id: '27ac91e378b055931a20843d545dabfc6b5c75f7b2953147ccc5fb66fc9848f5',
			address: '9440-9680 Hageman Rd, Bakersfield, CA 93306, USA',
      url: "/properties/27ac91e378b055931a20843d545dabfc6b5c75f7b2953147ccc5fb66fc9848f5/summary",
			thumbnailUrl: '/images/properties/plazaAtRiverLakes.png',
			statusTags: [],
			stats: ['8 units', '$6.1M', '$763K/unit', '$948.09/SF', '6.43K SF', '2001/R 2018'],
			cap: '3.17%',
			grm: '18.94',
			date: 'Jul 18, 2025'
		}
	];
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