<script lang="ts">
	// import TypeWriter from '$lib/components/TypeWriter/TypeWriter.svelte';
	import type { ParagraphWidget } from '$lib/dashboard/types/widget';
	import { WidgetChannels } from '$lib/dashboard/types/widgetSchemas';
	import { createWidgetConsumer } from '$lib/dashboard/types/widgetBridge';
	import type { ParagraphWidgetData } from '$lib/dashboard/types/widgetSchemas';

	interface Props {
		data: ParagraphWidget['data'];
		/** Optional custom channel ID (defaults to 'paragraph-content') */
		channelId?: string;
		/** Optional custom widget ID for consumer registration */
		widgetId?: string;
	}

	let { data, channelId = 'paragraph-content', widgetId = 'paragraph-widget' }: Props = $props();
	let widgetData = $state<ParagraphWidgetData>(data);

	console.log(`\n📝 [ParagraphWidget] Initializing widget`);
	console.log(`   Widget ID: ${widgetId}`);
	console.log(`   Channel ID: ${channelId}`);
	console.log(`   Initial data:`, data);

	// Create a validated consumer using the type-safe bridge system
	const consumer = createWidgetConsumer(
		channelId === 'paragraph-content'
			? WidgetChannels.paragraphContent
			: {
					channelId,
					widgetType: 'paragraph',
					schema: WidgetChannels.paragraphContent.schema,
					description: `Custom paragraph widget channel: ${channelId}`
				},
		widgetId
	);

	console.log(`📝 [ParagraphWidget:${widgetId}] Consumer created, setting up subscription...`);
	$inspect(widgetData);

	// Subscribe to validated content updates
	// The consumer automatically validates data against the Zod schema
	consumer.subscribe((validatedData) => {
		console.log(`\n📝 [ParagraphWidget:${widgetId}] 📥 Subscription callback triggered`);
		if (validatedData) {
			console.log(`   ✅ Received validated data:`, validatedData);
			widgetData = validatedData;
			console.log(`   ✅ Widget state updated`);
		} else {
			console.log(`   ⚠️ Received undefined or invalid data`);
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
