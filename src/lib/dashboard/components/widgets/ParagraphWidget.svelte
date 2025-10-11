<script lang="ts">
	// import TypeWriter from '$lib/components/TypeWriter/TypeWriter.svelte';
	import type { ParagraphWidget } from '$lib/dashboard/types/widget';

	import { mapStore } from '$lib/stores/mapObjectStore';

	interface Props {
		data: ParagraphWidget['data'];
	}

	let { data }: Props = $props();
	let widgetData = $state(data);

	let consumer = mapStore.registerConsumer<ParagraphWidget['data']>(
		'paragraph-content',
		'paragraph-widget'
	);

	console.log(`📝 ParagraphWidget[${data.title}]: Initialized`);
	console.log('   Subscribing to content updates...\n');
	$inspect(widgetData);

	// Subscribe to content updates
	consumer.subscribe((data) => {
		if (data) {
			// this.updateContent(data);
			widgetData = data;
			console.log('Content updated:', data);
		}
	});
</script>

<div class="paragraph-widget h-full overflow-auto">
	{#if data.title}
		<h3 class="mb-2 text-lg font-medium text-gray-700">{widgetData.title}</h3>
	{/if}
	{#if data.markdown}
		{@html widgetData.content}
	{:else}
		<!-- <TypeWriter
			text={widgetData.content}
		/> -->
		<p class="leading-relaxed text-gray-700">{widgetData.content}</p>
	{/if}
</div>
