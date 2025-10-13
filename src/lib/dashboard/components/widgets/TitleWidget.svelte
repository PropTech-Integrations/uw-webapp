<script lang="ts">
	import type { TitleWidget } from '$lib/dashboard/types/widget';
	import { mapStore } from '$lib/stores/mapObjectStore';

	interface Props {
		data: TitleWidget['data'];
	}

	let { data }: Props = $props();
	let widgetData = $state(data);

	let consumer = mapStore.registerConsumer<TitleWidget['data']>(
		'title-content',
		'title-widget'
	);

	console.log(`🏷️ TitleWidget: Initialized`);
	console.log('   Subscribing to content updates...\n');

	// Subscribe to content updates
	consumer.subscribe((data) => {
		if (data) {
			widgetData = data;
			console.log('Title content updated:', data);
		}
	});
</script>

<div class="title-widget flex h-full flex-col bg-gray-50 dark:bg-gray-800 justify-center text-{widgetData.alignment || 'left'}">
	<h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">{widgetData.title}</h2>
	{#if widgetData.subtitle}
		<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{widgetData.subtitle}</p>
	{/if}
</div>
