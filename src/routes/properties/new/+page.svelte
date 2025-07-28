<script lang="ts">
	import NewPropertyStep from '$lib/components/properties/NewPropertyStep.svelte';
	import DiscoverButton from '$lib/components/Upload/DiscoverButton.svelte';

	import Step1AddSource from '../../../lib/components/Upload/Step1AddSource.svelte';
	import Step2EnrichData from '../../../lib/components/Upload/Step2EnrichData.svelte';
	import { fade } from 'svelte/transition';

	interface Step {
		number: number;
		title: string;
		active: boolean;
		description: string;
	}

	let steps: Step[] = $state([
		{
			number: 1,
			title: 'Add Sources',
			active: true,
			description: 'Upload PDF files and other data sources'
		},
		{
			number: 2,
			title: 'Enrich with Industry Data',
			active: false,
			description: 'ESRI and other industry data sources'
		},
		{
			number: 3,
			title: 'StratiqAI Analysis',
			active: false,
			description: 'Next Generation AI Powered Analysis'
		},
		{
			number: 4,
			title: 'Build Reports',
			active: false,
			description: 'Generate Underwriting, Go/No Go, and Broker Reports'
		}
	]);
</script>

<section
	class="space-y-6 rounded-2xl bg-white bg-gradient-to-br from-zinc-50 via-stone-50 to-indigo-50 p-6 shadow-md"
>
	<header class="flex items-center justify-between">
		<h1 class="font-poppins text-2xl font-semibold">New Property Analysis</h1>
		<DiscoverButton />
	</header>

	<NewPropertyStep bind:steps />

	{#if steps[0].active}
		<div in:fade={{ duration: 200 }} out:fade={{ duration: 200 }}>
			<Step1AddSource />
		</div>
	{:else if steps[1].active}
		<div in:fade={{ duration: 200 }} out:fade={{ duration: 200 }}>
			<Step2EnrichData />
		</div>
	{/if}
</section>
