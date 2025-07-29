<script lang="ts">
	import IntegrationCard from '$lib/components/IntegrationCard.svelte';

	interface Integration {
		iconSrc: string;
		title: string;
		description: string;
		removeHref: string;
		connectHref: string;
		settingsHref: string;
	}

	const integrations: Integration[] = [
		{
			iconSrc: '/icons/mailchimp.svg',
			title: 'ESRI',
			description: 'Leverage Esri\'s advanced GIS tools for comprehensive spatial analysis and mapping solutions.',
			removeHref: '#',
			connectHref: '#',
			settingsHref: '#'
		},
		{
			iconSrc: '/icons/google-drive.svg',
			title: 'StratiqAI CRE Index',
			description: 'Create custom maps and visualize data with Mapbox\'s powerful mapping platform.',
			removeHref: '#',
			connectHref: '#',
			settingsHref: '#'
		},
		{
			iconSrc: '/icons/google-drive.svg',
			title: 'US Bureau of Labor Statistics',
			description: 'Transform location data into business outcomes with CARTO\'s spatial analysis tools.',
			removeHref: '#',
			connectHref: '#',
			settingsHref: '#'
		},
		{
			iconSrc: '/icons/google-drive.svg',
			title: 'US Census Bureau',
			description: 'Utilize SuperGIS for efficient geographic data management and spatial analysis.',
			removeHref: '#',
			connectHref: '#',
			settingsHref: '#'
		}
		// ... add other integrations
	];
</script>

<section
	class="w-full space-y-6 rounded-2xl bg-white bg-gradient-to-br from-zinc-50 via-red-50 to-indigo-50 p-6 shadow-md"
>
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-semibold text-gray-900">Integrations</h1>
	</div>

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each integrations as integration}
			<IntegrationCard {...integration} />
		{/each}
	</div>
</section>
