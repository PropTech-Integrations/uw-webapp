<script lang="ts">
	//////////////////////////////////////////////////////////////////////////////////////////////
	// Types
	import type { ParagraphWidget } from '$lib/dashboard/types/widget';
	import { ParagraphWidgetDataSchema, WidgetChannels, type ParagraphWidgetData } from '$lib/dashboard/types/widgetSchemas';

	interface Props {
		data: ParagraphWidget['data'];
		/** Optional custom channel ID (defaults to 'paragraph-content') */
		channelId?: string;
		/** Optional custom widget ID for consumer registration */
		widgetId?: string;
	}

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
	import { submitParagraphGenerationJob } from './utils/aiJobSubmission';
	import { createParagraphChannel } from './utils/channelSetup';
	import { setupParagraphConsumer } from './utils/consumerSetup';

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
	const channel = WidgetChannels.paragraphContent;
	console.log(`   Initial data:`, data);

	// Setup consumer with subscription
	const consumer = setupParagraphConsumer(channel, widgetId, (validatedData) => {
		if (validatedData) {
			widgetData = validatedData;
		}
	});
</script>

<div class="paragraph-widget h-full overflow-auto">
	<div class="absolute right-16 top-4 z-10">
		<Button
			class="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
			onclick={() => currentUser?.idToken && submitParagraphGenerationJob(currentUser.idToken)}
			>Submit AI Job</Button
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
