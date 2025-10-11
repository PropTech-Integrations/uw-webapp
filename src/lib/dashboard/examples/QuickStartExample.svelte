<script lang="ts">
	/**
	 * Quick Start Example: 5-Minute Integration
	 * 
	 * This minimal example shows the fastest way to connect
	 * an AI job to a widget with full type safety.
	 */

	import { onDestroy } from 'svelte';
	import JobSubmission from '$lib/components/AI/JobSubmission.svelte';
	import ParagraphWidget from '$lib/dashboard/components/widgets/ParagraphWidget.svelte';
	import { WidgetChannels, getWidgetTextFormat } from '$lib/dashboard/types/widgetSchemas';
	import { createJobWidgetBridge } from '$lib/dashboard/types/widgetBridge';

	interface Props {
		idToken: string;
	}

	let { idToken }: Props = $props();
	let bridge = $state<ReturnType<typeof createJobWidgetBridge> | null>(null);

	// Step 1: Get OpenAI text format (ensures AI output matches widget schema)
	const textFormat = getWidgetTextFormat('paragraph');

	// Step 2: Configure job
	const jobInput = {
		request: JSON.stringify({
			model: 'gpt-4o-mini',
			input: [
				{ role: 'system', content: 'Summarize the latest tech news' }
			],
			text: { format: textFormat }
		}),
		priority: 'HIGH' as const
	};

	// Step 3: Initial widget data
	const initialData = {
		title: 'Tech News Summary',
		content: 'Loading...',
		markdown: false
	};

	// Step 4: Handle job completion
	function onJobComplete(update: any) {
		// Create bridge: Job → Validation → Widget
		bridge = createJobWidgetBridge({
			jobId: update.id,
			channel: WidgetChannels.paragraphContent
		});
	}

	// Step 5: Cleanup
	onDestroy(() => {
		bridge?.disconnect();
	});
</script>

<!-- That's it! Now just use the components -->
<div class="space-y-4 p-4">
	<!-- Job Submission -->
	<JobSubmission 
		{idToken} 
		{jobInput} 
		{onJobComplete} 
	/>

	<!-- Widget (automatically receives validated data) -->
	<ParagraphWidget data={initialData} />
</div>

<!--
═══════════════════════════════════════════════════════════════
What This Does:
═══════════════════════════════════════════════════════════════

1. ✅ OpenAI structured output ensures response matches schema
2. ✅ Bridge validates job result against Zod schema
3. ✅ Widget receives fully typed, validated data
4. ✅ Invalid data is caught and logged automatically

═══════════════════════════════════════════════════════════════
Type Safety at Every Step:
═══════════════════════════════════════════════════════════════

AI Job → [Zod Schema] → Validation → [mapObjectStore] → Widget
   ✓          ✓             ✓               ✓            ✓

═══════════════════════════════════════════════════════════════
No Manual Validation Needed!
═══════════════════════════════════════════════════════════════

The system automatically:
- Validates AI output against schema
- Validates data before publishing to store
- Validates data before sending to widget
- Logs all validation errors

═══════════════════════════════════════════════════════════════
Customize If Needed:
═══════════════════════════════════════════════════════════════

bridge = createJobWidgetBridge({
  jobId: update.id,
  channel: WidgetChannels.paragraphContent,
  
  // Custom transformer
  transformer: (result) => {
    const parsed = JSON.parse(result);
    return {
      title: parsed.title || 'Default Title',
      content: parsed.content,
      markdown: true
    };
  },
  
  // Custom filter
  filter: (update) => {
    return update.status === 'COMPLETED' && update.result !== null;
  }
});

═══════════════════════════════════════════════════════════════
-->

