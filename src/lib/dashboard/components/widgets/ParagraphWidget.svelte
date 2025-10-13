<script lang="ts">
	import z from 'zod';

	//////////////////////////////////////////////////////////////////////////////////////////////
	// Types
	import type { ParagraphWidget } from '$lib/dashboard/types/widget';
	import { type WidgetChannelConfig } from '$lib/dashboard/types/widgetSchemas';

	interface Props {
		data: ParagraphWidget['data'];
		/** Optional custom channel ID (defaults to 'paragraph-content') */
		channelId?: string;
		/** Optional custom widget ID for consumer registration */
		widgetId?: string;
	}

	const ParagraphWidgetDataSchema = z.object({
		title: z.string().nullable().optional(),
		content: z.string(),
		markdown: z.boolean().nullable().optional()
	});

	type ParagraphWidgetData = z.infer<typeof ParagraphWidgetDataSchema>;

	//////////////////////////////////////////////////////////////////////////////////////////////
	// Auth Types
	import type { CurrentUser } from '$lib/types/auth';

	//////////////////////////////////////////////////////////////////////////////////////////////
	// UI Imports
	import TypeWriter from '$lib/components/TypeWriter/TypeWriter.svelte';
	import { Button } from 'flowbite-svelte';
	import { getContext } from 'svelte';

	//////////////////////////////////////////////////////////////////////////////////////////////
	// AI Job Submission & Channel Setup
	import { submitAIJob, type JobSubmissionCallbacks } from './utils/aiJobSubmission';
	import type { JobUpdate } from '$lib/dashboard/lib/JobManager';
	import { setupParagraphConsumer } from './utils/consumerSetup';
	import { mapStore } from '$lib/stores/mapObjectStore';
	import { paragraphTitleQuery } from '$lib/dashboard/types/OpenAIQueryDefs';

	//////////////////////////////////////////////////////////////////////////////////////////////
	// Props & State
	let { data, channelId = 'paragraph-content', widgetId = 'paragraph-widget' }: Props = $props();
	let widgetData = $state<ParagraphWidgetData>(data);

	// Get current user from page context
	const pageData = getContext<{ currentUser: CurrentUser }>('pageData');
	const currentUser = pageData?.currentUser;

	//////////////////////////////////////////////////////////////////////////////////////////////
	// Channel Setup
	//////////////////////////////////////////////////////////////////////////////////////////////

	// Setup channel
	const channel = {
		channelId: 'paragraph-content',
		widgetType: 'paragraph',
		schema: ParagraphWidgetDataSchema,
		description: 'Channel for paragraph widget content'
	} as WidgetChannelConfig<'paragraph'>;

	console.log(`   Initial data:`, data);

	// Setup content producer for publishing AI-generated content
	const contentProducer = mapStore.registerProducer<ParagraphWidget['data']>(
		channelId,
		'content-generator-agent'
	);

	// Setup consumer with subscription
	const consumer = setupParagraphConsumer(channel, widgetId, (validatedData) => {
		if (validatedData) {
			widgetData = validatedData;
		}
	});

	//////////////////////////////////////////////////////////////////////////////////////////////
	// AI Job Callbacks
	//////////////////////////////////////////////////////////////////////////////////////////////

	const jobCallbacks: JobSubmissionCallbacks = {
		onJobComplete: (update: JobUpdate) => {
			console.log('✅ Job completed successfully:', update);
			const result = JSON.parse(update.result as string);
			const timestamp = new Date().toLocaleTimeString();

			const newData: ParagraphWidget['data'] = {
				title: result.output_parsed.title,
				content: result.output_parsed.markdown
					? result.output_parsed.content
					: `${result.output_parsed.content}\n\nLast updated: ${timestamp}`,
				markdown: result.output_parsed.markdown
			};

			console.log(`🤖 AI Agent generated new content: "${result.output_parsed.title}"`);
			contentProducer.publish(newData);
		},
		onJobError: (error: Error) => {
			console.error('❌ Job failed:', error);
			// TODO: Show error notification to user
		},
		onStatusUpdate: (update: JobUpdate) => {
			console.log('📊 Status update:', update.status);
			// TODO: Update progress indicator
		},
		onConnectionStateChange: (state: string) => {
			console.log('🔌 Connection state:', state);
			// TODO: Show connection status indicator
		}
	};
</script>

<div class="paragraph-widget h-full overflow-auto">
	<div class="absolute right-16 top-4 z-10">
		<Button
			class="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
			onclick={() =>
				currentUser?.idToken &&
				submitAIJob(
					paragraphTitleQuery('Write a paragraph about the economy of Santa Rosa, CA'),
					currentUser.idToken,
					jobCallbacks
				)}>Submit AI Job</Button
		>
	</div>
	{#if data.title}
		<h3 class="mb-2 mt-1 text-lg font-medium text-gray-700">{widgetData.title}</h3>
	{/if}

	{#key widgetData.content}
		<TypeWriter text={widgetData.content} />
	{/key}
	<!-- <p class="leading-relaxed text-gray-700">{widgetData.content}</p> -->
</div>
