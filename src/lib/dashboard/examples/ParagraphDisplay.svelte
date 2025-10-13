<script lang="ts">
	/**
	 * Paragraph Display Child Component
	 * 
	 * Responsible for:
	 * - Displaying the ParagraphWidgetData
	 * - Rendering the ParagraphWidget
	 * - Handling widget-specific UI concerns
	 */

	import ParagraphWidget from '$lib/dashboard/components/widgets/ParagraphWidget.svelte';
	import type { ParagraphWidgetData } from '$lib/dashboard/types/widgetSchemas';

	interface Props {
		/** The paragraph data to display */
		data: ParagraphWidgetData;
		/** Widget identifier */
		widgetId: string;
		/** Channel ID for the widget */
		channelId: string;
	}

	let {
		data,
		widgetId,
		channelId
	}: Props = $props();

	// Computed properties for display state
	let isWaiting = $derived(
		data.content === 'Waiting for AI to generate content... Click "Submit Job" to start.'
	);

	let hasError = $derived(
		data.title === 'Error'
	);

	let displayStatus = $derived(
		isWaiting ? 'waiting' : hasError ? 'error' : 'success'
	);

	// Format the content length for display
	let contentLength = $derived(
		data.content ? data.content.length : 0
	);

	let contentPreview = $derived(
		!data.content ? '' : 
		data.content.length <= 100 ? data.content :
		data.content.substring(0, 97) + '...'
	);
</script>

<div class="rounded-lg border-2 border-purple-300 bg-purple-50 p-4">
	<!-- Info Header -->
	<div class="mb-3 flex items-start justify-between">
		<p class="text-xs text-purple-700">
			This widget automatically receives data from the producer via mapObjectStore
		</p>
		
		<!-- Status Indicator -->
		<div class="flex items-center gap-2">
			{#if displayStatus === 'waiting'}
				<span class="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs">
					<span class="h-2 w-2 rounded-full bg-gray-400"></span>
					Waiting
				</span>
			{:else if displayStatus === 'error'}
				<span class="flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs">
					<span class="h-2 w-2 rounded-full bg-red-500"></span>
					Error
				</span>
			{:else}
				<span class="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs">
					<span class="h-2 w-2 rounded-full bg-green-500"></span>
					Ready
				</span>
			{/if}
		</div>
	</div>

	<!-- Widget Container -->
	<div class="rounded-lg border-2 border-purple-400 bg-white p-4 min-h-[150px] relative">
		<!-- Overlay for waiting state -->
		{#if isWaiting}
			<div class="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-lg">
				<div class="text-center">
					<div class="mb-2">
						<svg class="mx-auto h-8 w-8 animate-spin text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
					</div>
					<p class="text-sm text-gray-600">Waiting for content...</p>
				</div>
			</div>
		{/if}

		<!-- Main Widget -->
		<ParagraphWidget 
			{data}
			{widgetId} 
			{channelId}
		/>
	</div>

	<!-- Metadata Footer -->
	<div class="mt-3 grid grid-cols-3 gap-2 text-xs">
		<div class="rounded bg-purple-100 p-2">
			<span class="font-medium text-purple-700">Format:</span>
			<span class="ml-1 text-purple-600">
				{data.markdown ? 'Markdown' : 'Plain Text'}
			</span>
		</div>
		<div class="rounded bg-purple-100 p-2">
			<span class="font-medium text-purple-700">Length:</span>
			<span class="ml-1 text-purple-600">
				{contentLength} chars
			</span>
		</div>
		<div class="rounded bg-purple-100 p-2">
			<span class="font-medium text-purple-700">Channel:</span>
			<span class="ml-1 font-mono text-purple-600">
				{channelId}
			</span>
		</div>
	</div>

	<!-- Content Preview (for debug) -->
	<details class="mt-3">
		<summary class="cursor-pointer text-xs font-medium text-purple-700 hover:text-purple-900">
			View Data Structure
		</summary>
		<div class="mt-2 rounded bg-purple-100 p-2">
			<pre class="overflow-x-auto text-xs text-purple-800">{JSON.stringify(data, null, 2)}</pre>
		</div>
	</details>
</div>

<style>
	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}

	details summary::-webkit-details-marker {
		display: none;
	}

	details summary::before {
		content: '▶';
		display: inline-block;
		margin-right: 0.5rem;
		transition: transform 0.2s;
	}

	details[open] summary::before {
		transform: rotate(90deg);
	}
</style>