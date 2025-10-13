<script lang="ts">
	// import TypeWriter from '$lib/components/TypeWriter/TypeWriter.svelte';
	import type { ParagraphWidget } from '$lib/dashboard/types/widget';
	import { WidgetChannels } from '$lib/dashboard/types/widgetSchemas';
	import { createWidgetConsumer } from '$lib/dashboard/types/widgetBridge';
	import type { ParagraphWidgetData } from '$lib/dashboard/types/widgetSchemas';

	// AI Job Submission
	import { createJobSubmissionClientWithAppSync } from '$lib/dashboard/lib/JobManager';
	import { type JobUpdate } from '$lib/dashboard/lib/JobManager';
	import { paragraphTitleQuery } from '$lib/dashboard/types/OpenAIQueryDefs';
	import { Button } from 'flowbite-svelte';
	import { getContext } from 'svelte';
	import type { CurrentUser } from '$lib/types/auth';

	// mapStore
	import { mapStore } from '$lib/stores/mapObjectStore';

	interface Props {
		data: ParagraphWidget['data'];
		/** Optional custom channel ID (defaults to 'paragraph-content') */
		channelId?: string;
		/** Optional custom widget ID for consumer registration */
		widgetId?: string;
	}

	let { data, channelId = 'paragraph-content', widgetId = 'paragraph-widget' }: Props = $props();
	let widgetData = $state<ParagraphWidgetData>(data);

	// Get current user from page context
	const pageData = getContext<{ currentUser: CurrentUser }>('pageData');
	const currentUser = pageData?.currentUser;

	//////////////////////////////////////////////////////////////////////////////////////////////
	// AI Job Submission
	//////////////////////////////////////////////////////////////////////////////////////////////

	export async function advancedExample(idToken: string) {
		let contentProducer = mapStore.registerProducer<ParagraphWidget['data']>(
			'paragraph-content',
			'content-generator-agent'
		);

		const timestamp = new Date().toLocaleTimeString();

		// Create a client with custom configuration (async)
		const client = await createJobSubmissionClientWithAppSync({
			config: {
				maxRetries: 5,
				retryDelay: 2000,
				reconnectBackoffMultiplier: 2,
				maxReconnectDelay: 60000,
				subscriptionTimeout: 300000 // 5 minutes
			},
			callbacks: {
				onJobComplete: (update: JobUpdate) => {
					console.log('✅ Job completed successfully:', update);
					const result = JSON.parse(update.result as string);
					const data: ParagraphWidget['data'] = {
						title: result.output_parsed.title,
						content: result.output_parsed.markdown
							? result.output_parsed.content
							: `${result.output_parsed.content}\n\nLast updated: ${timestamp}`,
						markdown: result.output_parsed.markdown
					};
					console.log(`🤖 AI Agent generated new content: "${result.output_parsed.title}"`);
					contentProducer.publish(data);
					// Handle completion (e.g., show notification, update UI)
				},
				onJobError: (error: Error) => {
					console.error('❌ Job failed:', error);
					// Handle error (e.g., show error message, retry)
				},
				onStatusUpdate: (update: JobUpdate) => {
					console.log('📊 Status update:', update.status);
					// Track progress (e.g., update progress bar)
				},
				onConnectionStateChange: (state) => {
					console.log('🔌 Connection state:', state);
					// Handle connection changes (e.g., show connection indicator)
				}
			}
		});

		// Submit a job
		const result = await client.submitJob(
			paragraphTitleQuery('Write a paragraph about the economy of Santa Rosa, CA'),
			idToken
		);

		return result;
	}

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
	<div class="absolute right-16 top-4 z-10">
		<Button
			class="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
			onclick={() => currentUser?.idToken && advancedExample(currentUser.idToken)}
			>Submit AI Job</Button
		>
	</div>
	{#if data.title}
		<h3 class="mb-2 mt-1 text-lg font-medium text-gray-700">{widgetData.title}</h3>
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
