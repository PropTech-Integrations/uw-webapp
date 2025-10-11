<script lang="ts">
	/**
	 * AI Job → Paragraph Widget Example
	 *
	 * This example shows how to:
	 * 1. Submit an AI job with structured output
	 * 2. Automatically create a producer via bridge
	 * 3. Display results in ParagraphWidget
	 */

	import { onDestroy } from 'svelte';
	import JobSubmission from '$lib/components/AI/JobSubmission.svelte';
	import ParagraphWidget from '$lib/dashboard/components/widgets/ParagraphWidget.svelte';
	import { 
		WidgetChannels, 
		getWidgetTextFormat,
		type ParagraphWidgetData 
	} from '$lib/dashboard/types/widgetSchemas';
	import { createJobWidgetBridge, type JobWidgetBridge } from '$lib/dashboard/types/widgetBridge';

	// ===== Props =====
	interface Props {
		idToken: string;
		/** Optional: Custom prompt for the AI */
		prompt?: string;
		/** Optional: Custom widget ID */
		widgetId?: string;
	}

	let {
		idToken,
		prompt = 'Summarize the latest AI developments in a short paragraph',
		widgetId = 'ai-paragraph-widget'
	}: Props = $props();

	// ===== State =====
	let bridge = $state<JobWidgetBridge | null>(null);
	let currentJobId = $state<string | null>(null);

	// ===== Step 1: Configure OpenAI with Paragraph Schema =====
	// This ensures the AI response matches ParagraphWidgetData structure
	// Using zodTextFormat which is the correct OpenAI structured output format
	const textFormat = getWidgetTextFormat('paragraph', 'ParagraphContent');

	console.log('📋 OpenAI Text Format for Paragraph Widget:', textFormat);

	// ===== Step 2: Create Job Input =====
	const jobInput = {
		request: JSON.stringify({
			model: 'gpt-4o-mini',
			input: [
				{ 
					role: 'system', 
					content: 'Write a clear, informative paragraph. Include a title if appropriate.' 
				},
				{ 
					role: 'user', 
					content: prompt 
				}
			],
			// Use text format for structured output (OpenAI recommended approach)
			text: {
				format: textFormat
			}
		}),
		priority: 'HIGH' as const
	};

	// ===== Step 3: Initial Widget Data =====
	const initialData = {
		title: 'AI Generated Content',
		content: 'Waiting for AI to generate content... Click "Submit Job" to start.',
		markdown: false
	} as ParagraphWidgetData;

	// ===== Step 4: Job Completion Handler (Creates Producer!) =====
	/**
	 * This is where the producer gets created automatically via the bridge
	 */
	function handleJobComplete(update: any) {
		console.log(`\n🎯 [AIJobParagraphExample] Job completed: ${update.id}`);

		currentJobId = update.id;

		// Create bridge - this automatically:
		// 1. Creates a ValidatedPublisher for 'paragraph-content' channel
		// 2. Subscribes to job updates from jobUpdateStore
		// 3. Validates job results against ParagraphWidgetDataSchema
		// 4. Publishes to mapObjectStore
		bridge = createJobWidgetBridge({
			jobId: update.id,
			channel: WidgetChannels.paragraphContent,

			// Optional: Transform job result to widget format
			transformer: (result: string) => {
				console.log('\n🔄 [AIJobParagraphExample] Transforming job result...');
				console.log('   Raw result type:', typeof result);
				console.log('   Raw result:', result);
				
				try {
					const parsed = JSON.parse(result);
					console.log('   ✅ Parsed result:', parsed);
					console.log('   Parsed type:', typeof parsed);
					console.log('   Parsed keys:', Object.keys(parsed));
					
					// Handle different response structures
					let title: string | null | undefined;
					let content: string;
					let markdown: boolean | null | undefined;
					
					// Extract content (handle if it's nested in output_parsed or other structures)
					if (typeof parsed.content === 'string') {
						content = parsed.content;
					} else if (typeof parsed.text === 'string') {
						content = parsed.text;
					} else if (parsed.output_parsed?.content) {
						content = typeof parsed.output_parsed.content === 'string' 
							? parsed.output_parsed.content 
							: JSON.stringify(parsed.output_parsed.content);
					} else if (typeof parsed.content === 'object') {
						// Content is an object, stringify it
						console.warn('   ⚠️ Content is an object, converting to string');
						content = JSON.stringify(parsed.content, null, 2);
					} else {
						// Fallback: use entire result as content
						content = JSON.stringify(parsed, null, 2);
					}
					
					// Extract title
					if (typeof parsed.title === 'string') {
						title = parsed.title;
					} else if (parsed.output_parsed?.title) {
						title = parsed.output_parsed.title;
					} else {
						title = undefined;
					}
					
					// Extract markdown flag
					if (typeof parsed.markdown === 'boolean') {
						markdown = parsed.markdown;
					} else if (parsed.output_parsed?.markdown !== undefined) {
						markdown = parsed.output_parsed.markdown;
					} else {
						markdown = undefined;
					}
					
					const widgetData = {
						title: title ?? undefined,
						content: content,
						markdown: markdown ?? undefined
					} as ParagraphWidgetData;
					
					console.log('   ✅ Transformed to widget data:', widgetData);
					return widgetData;
				} catch (error) {
					console.error('   ❌ Transform error:', error);
					// Fallback: treat as plain text
					return {
						title: 'AI Response',
						content: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
						markdown: false
					};
				}
			},

			// Optional: Filter which job updates to process
			filter: (update) => {
				const shouldProcess =
					(update.status === 'COMPLETED' || update.status === 'COMPLETE') && update.result !== null;
				console.log(
					`   Filter result for status ${update.status}: ${shouldProcess ? '✅ Process' : '❌ Skip'}`
				);
				return shouldProcess;
			}
		});

		console.log('✅ [AIJobParagraphExample] Bridge created - producer registered automatically');
		console.log('   Producer ID: job-' + update.id + '-to-paragraph-content');
		console.log('   Channel: paragraph-content');
		console.log('   Widget will automatically receive updates via consumer\n');
	}

	// ===== Step 5: Error Handler =====
	function handleJobError(error: Error) {
		console.error('❌ [AIJobParagraphExample] Job error:', error);
	}

	// ===== Step 6: Cleanup =====
	onDestroy(() => {
		if (bridge) {
			console.log('🧹 [AIJobParagraphExample] Cleaning up bridge and producer');
			bridge.disconnect();
		}
	});
</script>

<div class="space-y-6 rounded-lg border-2 border-blue-200 bg-white p-6 shadow-lg">
	<!-- Header -->
	<div class="border-b pb-4">
		<h2 class="text-2xl font-bold text-gray-900">AI Job → Paragraph Widget</h2>
		<p class="mt-2 text-sm text-gray-600">
			Submit an AI job that automatically publishes results to a ParagraphWidget
		</p>
	</div>

	<!-- Info Panel -->
	<div class="rounded-lg bg-blue-50 p-4">
		<h3 class="mb-2 flex items-center gap-2 font-semibold text-blue-900">
			<span>ℹ️</span>
			How it works
		</h3>
		<ol class="space-y-1 text-sm text-blue-800">
			<li>1. AI job uses OpenAI text format (zodTextFormat with ParagraphWidget schema)</li>
			<li>2. Job completes → handleJobComplete() creates bridge</li>
			<li>3. Bridge creates ValidatedPublisher for 'paragraph-content' channel</li>
			<li>4. Bridge validates and publishes job result to mapObjectStore</li>
			<li>5. ParagraphWidget (consumer) receives and displays validated data</li>
		</ol>
	</div>

	<!-- Job Submission -->
	<div class="space-y-3">
		<h3 class="font-semibold text-gray-900">Step 1: Submit AI Job</h3>
		<div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
			<JobSubmission
				{idToken}
				{jobInput}
				onJobComplete={handleJobComplete}
				onJobError={handleJobError}
			/>
		</div>
	</div>

	<!-- Bridge Status -->
	{#if bridge}
		<div class="space-y-3">
			<h3 class="font-semibold text-gray-900">Step 2: Bridge Status</h3>
			<div class="rounded-lg border border-green-200 bg-green-50 p-4">
				<div class="space-y-2 text-sm">
					<div class="flex items-center gap-2">
						<span class="font-medium">Producer Created:</span>
						<span class="rounded-full bg-green-600 px-2 py-0.5 text-xs font-semibold text-white">
							✓ Yes
						</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="font-medium">Channel:</span>
						<code class="rounded bg-white px-2 py-1 text-xs">paragraph-content</code>
					</div>
					<div class="flex items-center gap-2">
						<span class="font-medium">Producer ID:</span>
						<code class="rounded bg-white px-2 py-1 text-xs">
							job-{currentJobId}-to-paragraph-content
						</code>
					</div>
					<div class="flex items-center gap-2">
						<span class="font-medium">Status:</span>
						{#if bridge.getStatus().connected}
							<span class="text-green-700">🟢 Connected</span>
						{:else}
							<span class="text-gray-600">⚫ Disconnected</span>
						{/if}
					</div>
					{#if bridge.getStatus().lastUpdate}
						<div class="flex items-center gap-2">
							<span class="font-medium">Last Update:</span>
							<span class="text-gray-700">{bridge.getStatus()?.lastUpdate?.toLocaleTimeString()}</span
							>
						</div>
					{/if}
					{#if bridge.getStatus().lastError}
						<div class="rounded border border-red-300 bg-red-50 p-2">
							<p class="text-xs font-semibold text-red-800">Validation Error:</p>
							<pre class="mt-1 text-xs text-red-700">{JSON.stringify(
									bridge.getStatus().lastError,
									null,
									2
								)}</pre>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- Widget Display -->
	<div class="space-y-3">
		<h3 class="font-semibold text-gray-900">Step 3: Widget Display</h3>
		<div class="rounded-lg border-2 border-purple-300 bg-purple-50 p-4">
			<p class="mb-3 text-xs text-purple-700">
				This widget automatically receives data from the producer via mapObjectStore
			</p>
			<div class="rounded-lg border-2 border-purple-400 bg-white p-4">
				<ParagraphWidget data={initialData as any} {widgetId} channelId="paragraph-content" />
			</div>
		</div>
	</div>

	<!-- Debug Helper -->
	<div class="rounded-lg bg-gray-50 p-4">
		<h3 class="mb-2 font-semibold text-gray-900">🐛 Debug</h3>
		<p class="text-xs text-gray-600">
			Open browser console (F12) to see detailed logs of the data flow. Use the MapStore Debug Panel
			buttons to inspect producers, consumers, and data.
		</p>
	</div>
</div>

<style>
	code {
		font-family: 'Fira Code', 'Cascadia Code', monospace;
	}
</style>
