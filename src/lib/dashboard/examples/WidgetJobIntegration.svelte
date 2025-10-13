<script lang="ts">
	/**
	 * Complete Example: AI Job → Widget Integration
	 * 
	 * This example demonstrates the full type-safe flow:
	 * 1. Submit an AI job with OpenAI structured output (using Zod schema)
	 * 2. Job updates are validated and published to mapObjectStore
	 * 3. Widget consumes validated data from mapObjectStore
	 * 
	 * Type safety is enforced at every step!
	 */

	import { onMount, onDestroy } from 'svelte';
	import JobSubmission from '$lib/components/AI/JobSubmission.svelte';
	import ParagraphWidget from '$lib/dashboard/components/widgets/ParagraphWidget.svelte';
	import { 
		WidgetChannels, 
		getWidgetTextFormat,
		type ParagraphWidgetData 
	} from '$lib/dashboard/types/widgetSchemas';
	import { 
		createJobWidgetBridge,
		type JobWidgetBridge 
	} from '$lib/dashboard/types/widgetBridge';

	// ===== Props =====
	interface Props {
		idToken: string;
	}

	let { idToken }: Props = $props();

	// ===== State =====
	let currentJobId = $state<string | null>(null);
	let bridge = $state<JobWidgetBridge | null>(null);
	let bridgeStatus = $state<{ 
		connected: boolean; 
		lastUpdate?: Date; 
		lastError?: any;
	}>({ connected: false, lastUpdate: undefined, lastError: undefined });

	// ===== Job Configuration =====
	
	// Get OpenAI text format configuration for paragraph widget
	// Using zodTextFormat which is the recommended OpenAI structured output approach
	console.log(`\n\n╔═══════════════════════════════════════════════════════════════╗`);
	console.log(`║  Widget Job Integration - Initialization                      ║`);
	console.log(`╚═══════════════════════════════════════════════════════════════╝\n`);
	
	const textFormat = getWidgetTextFormat('paragraph', 'DocumentSummary');

	console.log('\n📋 [WidgetJobIntegration] OpenAI Text Format Config:', textFormat);

	const jobInput = {
		request: JSON.stringify({
			model: 'gpt-5-nano',
			input: [
				{ 
					role: 'system', 
					content: 'Create a summary of the latest market trends. Include a title and clear content.' 
				},
				{ 
					role: 'user', 
					content: 'Generate a summary of current market conditions' 
				}
			],
			// Use text format for structured output
			text: {
				format: textFormat
			}
		}),
		priority: 'HIGH' as const
	};

	// ===== Widget Configuration =====
	
	const widgetData = {
		title: 'AI Generated Summary',
		content: 'Waiting for AI response...',
		markdown: true
	} as ParagraphWidgetData;

	// ===== Job Handlers =====

	function handleJobComplete(jobId: string) {
		console.log(`\n\n═══════════════════════════════════════════════════════════════`);
		console.log(`🎉 [WidgetJobIntegration] handleJobComplete() called`);
		console.log(`   Job ID: ${jobId}`);
		console.log(`═══════════════════════════════════════════════════════════════\n`);
		
		// Create a bridge from job updates to widget channel
		// This automatically:
		// 1. Listens for job updates
		// 2. Validates the result against ParagraphWidgetDataSchema
		// 3. Publishes to the 'paragraph-content' channel
		console.log(`[WidgetJobIntegration] Creating job-widget bridge...`);
		bridge = createJobWidgetBridge({
			jobId,
			channel: WidgetChannels.paragraphContent,
			
			// Transform job result to widget data
			transformer: (result: string) => {
				console.log(`\n🔄 [WidgetJobIntegration] Custom transformer called`);
				console.log(`   Raw result:`, result);
				const parsed = JSON.parse(result);
				console.log(`   Parsed result:`, parsed);
				
				// Since we used OpenAI structured output, this should already match our schema
				// But we transform it to be explicit
				const transformed = {
					title: parsed.title || undefined,
					content: parsed.content || parsed.summary || result,
					markdown: true
				} as ParagraphWidgetData;
				
				console.log(`   ✅ Transformed to widget data:`, transformed);
				return transformed;
			},
			
			// Only process completed jobs
			filter: (update) => {
				console.log(`[WidgetJobIntegration] Filter function called for status: ${update.status}`);
				const shouldProcess = (update.status === 'COMPLETED' || update.status === 'COMPLETE') 
					&& update.result !== null;
				console.log(`   Filter result: ${shouldProcess ? '✅ Pass' : '❌ Skip'}`);
				return shouldProcess;
			}
		});
		
		console.log(`\n[WidgetJobIntegration] ✅ Bridge created successfully\n`);

		// Monitor bridge status
		const interval = setInterval(() => {
			if (bridge) {
				bridgeStatus = bridge.getStatus();
			}
		}, 1000);

		// Cleanup
		onDestroy(() => {
			clearInterval(interval);
			bridge?.disconnect();
		});
	}

	function handleJobError(error: Error) {
		console.error(`\n❌ [WidgetJobIntegration] handleJobError() called`);
		console.error(`   Error:`, error);
	}

	// ===== Alternative: Manual Integration =====
	
	/**
	 * If you need more control, you can manually publish to the widget channel:
	 */
	function manualPublishExample() {
		// This is commented out but shows the manual approach
		/*
		import { createWidgetPublisher } from '$lib/dashboard/types/widgetBridge';
		
		const publisher = createWidgetPublisher(
			WidgetChannels.paragraphContent,
			'my-ai-job-handler'
		);
		
		// This will validate the data before publishing
		publisher.publish({
			title: 'Manual Update',
			content: 'This was manually published with validation',
			markdown: false
		});
		
		// Or use safeParse for error handling
		const result = publisher.safeParse(someData);
		if (result.success) {
			console.log('Data is valid:', result.data);
		} else {
			console.error('Validation failed:', result.error);
		}
		*/
	}
</script>

<div class="space-y-6 p-6">
	<div class="rounded-lg bg-white p-6 shadow-md">
		<h1 class="mb-2 text-2xl font-bold text-gray-800">Type-Safe AI Job → Widget Integration</h1>
		<p class="text-gray-600">
			This example demonstrates the complete flow with type safety at every step
		</p>
	</div>

	<!-- Job Submission Component -->
	<div class="rounded-lg bg-white p-6 shadow-md">
		<h2 class="mb-4 text-xl font-semibold text-gray-800">Step 1: Submit AI Job</h2>
		<p class="mb-4 text-sm text-gray-600">
			Job includes OpenAI structured output configuration based on the widget's Zod schema
		</p>
		
		<JobSubmission
			{idToken}
			{jobInput}
			onJobComplete={(update) => {
				currentJobId = update.id;
				handleJobComplete(update.id);
			}}
			onJobError={handleJobError}
		/>
	</div>

	<!-- Bridge Status -->
	{#if bridge}
		<div class="rounded-lg bg-white p-6 shadow-md">
			<h2 class="mb-4 text-xl font-semibold text-gray-800">Step 2: Job → Widget Bridge</h2>
			<div class="space-y-2 text-sm">
				<div class="flex items-center gap-2">
					<span class="font-medium">Status:</span>
					{#if bridgeStatus.connected}
						<span class="flex items-center gap-1 text-green-600">
							<span class="h-2 w-2 rounded-full bg-green-500"></span>
							Connected
						</span>
					{:else}
						<span class="flex items-center gap-1 text-gray-600">
							<span class="h-2 w-2 rounded-full bg-gray-400"></span>
							Disconnected
						</span>
					{/if}
				</div>
				
				{#if bridgeStatus.lastUpdate}
					<div class="flex items-center gap-2">
						<span class="font-medium">Last Update:</span>
						<span class="text-gray-700">
							{bridgeStatus.lastUpdate.toLocaleTimeString()}
						</span>
					</div>
				{/if}
				
				{#if bridgeStatus.lastError}
					<div class="rounded border border-red-200 bg-red-50 p-2">
						<p class="font-medium text-red-800">Validation Error:</p>
						<pre class="mt-1 text-xs text-red-700">{JSON.stringify(bridgeStatus.lastError, null, 2)}</pre>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Widget Display -->
	<div class="rounded-lg bg-white p-6 shadow-md">
		<h2 class="mb-4 text-xl font-semibold text-gray-800">Step 3: Widget Display</h2>
		<p class="mb-4 text-sm text-gray-600">
			Widget receives validated data from mapObjectStore
		</p>
		
		<div class="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
			<ParagraphWidget 
				data={widgetData as any}
				widgetId="example-paragraph-widget"
			/>
		</div>
	</div>

	<!-- Type Safety Info -->
	<div class="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-6 shadow-md">
		<h2 class="mb-4 text-xl font-semibold text-gray-800">✨ Type Safety Benefits</h2>
		<ul class="space-y-2 text-sm text-gray-700">
			<li class="flex items-start gap-2">
				<span class="text-green-600">✓</span>
				<span><strong>OpenAI Output:</strong> Zod schema ensures AI response matches widget data structure</span>
			</li>
			<li class="flex items-start gap-2">
				<span class="text-green-600">✓</span>
				<span><strong>Runtime Validation:</strong> Invalid data is caught and logged before reaching widgets</span>
			</li>
			<li class="flex items-start gap-2">
				<span class="text-green-600">✓</span>
				<span><strong>TypeScript Safety:</strong> Full type inference across AI Job → Store → Widget</span>
			</li>
			<li class="flex items-start gap-2">
				<span class="text-green-600">✓</span>
				<span><strong>Single Source of Truth:</strong> One Zod schema defines the entire data flow</span>
			</li>
		</ul>
	</div>

	<!-- Code Example -->
	<details class="rounded-lg bg-white p-6 shadow-md">
		<summary class="cursor-pointer text-lg font-semibold text-gray-800">
			View Code Examples
		</summary>
		
		<div class="mt-4 space-y-4">
			<div>
				<h3 class="mb-2 font-medium text-gray-700">1. Define Widget Schema (already done)</h3>
				<pre class="rounded bg-gray-900 p-4 text-xs text-gray-100"><code>{`// In widgetSchemas.ts
export const ParagraphWidgetDataSchema = z.object({
  title: z.string().optional(),
  content: z.string(),
  markdown: z.boolean().optional()
});`}</code></pre>
			</div>

			<div>
				<h3 class="mb-2 font-medium text-gray-700">2. Get OpenAI Config</h3>
				<pre class="rounded bg-gray-900 p-4 text-xs text-gray-100"><code>{`const openAIConfig = getWidgetOpenAIConfig(
  'paragraph',
  'DocumentSummary',
  'Summary with title and content'
);

// Use in OpenAI API call
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [...],
  response_format: openAIConfig
});`}</code></pre>
			</div>

			<div>
				<h3 class="mb-2 font-medium text-gray-700">3. Create Job → Widget Bridge</h3>
				<pre class="rounded bg-gray-900 p-4 text-xs text-gray-100"><code>{`const bridge = createJobWidgetBridge({
  jobId: 'job-123',
  channel: WidgetChannels.paragraphContent,
  transformer: (result) => JSON.parse(result)
});

// Cleanup when done
bridge.disconnect();`}</code></pre>
			</div>

			<div>
				<h3 class="mb-2 font-medium text-gray-700">4. Use in Widget</h3>
				<pre class="rounded bg-gray-900 p-4 text-xs text-gray-100"><code>{`// Widget automatically receives validated data
<ParagraphWidget 
  data={initialData}
  channelId="paragraph-content"
  widgetId="my-widget"
/>`}</code></pre>
			</div>
		</div>
	</details>
</div>

<style>
	pre code {
		font-family: 'Fira Code', 'Cascadia Code', monospace;
	}
</style>

