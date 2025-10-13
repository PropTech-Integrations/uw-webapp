<script lang="ts">
	import { z } from 'zod';
	import { getContext, onDestroy } from 'svelte';
	
	// UI Components
	import { Button, Alert, Spinner } from 'flowbite-svelte';
	import TypeWriter from '$lib/components/TypeWriter/TypeWriter.svelte';
	
	// Types
	import type { ParagraphWidget } from '$lib/dashboard/types/widget';
	import type { WidgetChannelConfig } from '$lib/dashboard/types/widgetSchemas';
	import type { CurrentUser } from '$lib/types/auth';
	import type { JobUpdate } from '$lib/dashboard/lib/JobManager';
	
	// Utils
	import { submitAIJob, type JobSubmissionCallbacks } from './utils/aiJobSubmission';
	import { setupConsumer } from './utils/consumerSetup';
	import { mapStore } from '$lib/stores/mapObjectStore';
	import { paragraphTitleQuery } from '$lib/dashboard/types/OpenAIQueryDefs';

	//////////////////////////////////////////////////////////////////////////////////////////////
	// Schema Definition
	//////////////////////////////////////////////////////////////////////////////////////////////
	
	const ParagraphWidgetDataSchema = z.object({
		title: z.string().nullable().optional(),
		content: z.string().min(1, 'Content is required'),
		markdown: z.boolean().default(false)
	});

	type ParagraphWidgetData = z.infer<typeof ParagraphWidgetDataSchema>;

	//////////////////////////////////////////////////////////////////////////////////////////////
	// Component Props & State
	//////////////////////////////////////////////////////////////////////////////////////////////
	
	interface Props {
		data: ParagraphWidget['data'];
		/** Optional custom channel ID (defaults to 'paragraph-content') */
		channelId?: string;
		/** Optional custom widget ID for consumer registration */
		widgetId?: string;
		/** Optional prompt for AI content generation */
		defaultPrompt?: string;
		/** Enable/disable AI generation button */
		enableAIGeneration?: boolean;
		/** Custom CSS classes */
		class?: string;
	}

	const { 
		data, 
		channelId = 'paragraph-content', 
		widgetId = 'paragraph-widget',
		defaultPrompt = 'Write a paragraph about the economy of Santa Rosa, CA',
		enableAIGeneration = true,
		class: className = ''
	}: Props = $props();

	// Local state management
	let widgetData = $state<ParagraphWidgetData>(validateData(data));
	let isLoading = $state(false);
	let error = $state<string | null>(null);
	let lastUpdateTime = $state<Date | null>(null);
	let connectionState = $state<'connected' | 'disconnected' | 'connecting'>('disconnected');

	// Get current user from context
	const pageData = getContext<{ currentUser: CurrentUser }>('pageData');
	const currentUser = $derived(pageData?.currentUser);
	
	// Computed state
	const canSubmitJob = $derived(
		!isLoading && 
		currentUser?.idToken && 
		enableAIGeneration &&
		connectionState !== 'connecting'
	);
	
	const formattedUpdateTime = $derived(
		lastUpdateTime?.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		}) ?? null
	);

	//////////////////////////////////////////////////////////////////////////////////////////////
	// Helper Functions
	//////////////////////////////////////////////////////////////////////////////////////////////
	
	function validateData(data: unknown): ParagraphWidgetData {
		try {
			return ParagraphWidgetDataSchema.parse(data);
		} catch (err) {
			console.error('Invalid widget data:', err);
			return {
				title: 'Error',
				content: 'Failed to load widget content',
				markdown: false
			};
		}
	}
	
	function clearError() {
		error = null;
	}
	
	function handleDataUpdate(newData: ParagraphWidgetData) {
		try {
			// Normalize data to ensure markdown is never undefined
			const normalized = {
				...newData,
				markdown: newData.markdown ?? false
			};
			widgetData = validateData(normalized);
			lastUpdateTime = new Date();
			error = null;
		} catch (err) {
			console.error('Failed to update widget data:', err);
			error = 'Failed to update content';
		}
	}

	//////////////////////////////////////////////////////////////////////////////////////////////
	// Channel Setup
	//////////////////////////////////////////////////////////////////////////////////////////////

	const channel: WidgetChannelConfig<'paragraph'> = {
		channelId,
		widgetType: 'paragraph',
		schema: ParagraphWidgetDataSchema,
		description: 'Channel for paragraph widget content'
	};

	// Setup content producer
	const contentProducer = mapStore.registerProducer<ParagraphWidget['data']>(
		channelId,
		`content-generator-agent-${widgetId}`
	);

	// Setup consumer with error handling
	const { unsubscribe } = setupConsumer<ParagraphWidgetData>(
		channel, 
		widgetId, 
		(validatedData) => {
			if (validatedData) {
				handleDataUpdate(validatedData);
			}
		}
	);

	// Cleanup on destroy
	onDestroy(() => {
		unsubscribe?.();
	});

	//////////////////////////////////////////////////////////////////////////////////////////////
	// AI Job Management
	//////////////////////////////////////////////////////////////////////////////////////////////

	const jobCallbacks: JobSubmissionCallbacks = {
		onJobComplete: (update: JobUpdate) => {
			try {
				isLoading = false;
				
				const result = JSON.parse(update.result as string);
				const parsedOutput = result.output_parsed;
				
				if (!parsedOutput) {
					throw new Error('Invalid AI response format');
				}

				const newData: ParagraphWidget['data'] = {
					title: parsedOutput.title || null,
					content: parsedOutput.content || '',
					markdown: parsedOutput.markdown ?? false
				};

				console.log(`✅ AI content generated: "${newData.title || 'Untitled'}"`);
				contentProducer.publish(newData);
				
			} catch (err) {
				console.error('Failed to process AI response:', err);
				error = 'Failed to process AI response';
				isLoading = false;
			}
		},
		
		onJobError: (err: Error) => {
			console.error('❌ Job failed:', err);
			error = err.message || 'AI generation failed';
			isLoading = false;
		},
		
		onStatusUpdate: (update: JobUpdate) => {
			console.log('📊 Job status:', update.status);
			// Could add more granular status tracking here
		},
		
		onConnectionStateChange: (state: string) => {
			console.log('🔌 Connection state:', state);
			connectionState = state as typeof connectionState;
		}
	};
	
	async function handleAIGeneration() {
		if (!currentUser?.idToken) {
			error = 'Authentication required';
			return;
		}
		
		try {
			error = null;
			isLoading = true;
			
			await submitAIJob(
				paragraphTitleQuery(defaultPrompt),
				currentUser.idToken,
				jobCallbacks
			);
		} catch (err) {
			console.error('Failed to submit AI job:', err);
			error = 'Failed to submit AI request';
			isLoading = false;
		}
	}
</script>

<div class="paragraph-widget relative h-full overflow-auto rounded-lg bg-white shadow-sm {className}" class:loading={isLoading}>
	<!-- Error Display -->
	{#if error}
		<Alert 
			color="red" 
			dismissable
			class="absolute left-4 right-4 top-4 z-20"
			onclose={clearError}
		>
			{error}
		</Alert>
	{/if}
	
	<!-- AI Generation Controls -->
	{#if enableAIGeneration}
		<div class="absolute right-4 top-4 z-10 flex items-center gap-2">
			<!-- Connection Status Indicator -->
			<div class="flex items-center gap-1">
				<div 
					class="h-2 w-2 rounded-full"
					class:bg-green-500={connectionState === 'connected'}
					class:bg-yellow-500={connectionState === 'connecting'}
					class:bg-gray-400={connectionState === 'disconnected'}
				></div>
				<span class="text-xs text-gray-600">
					{connectionState}
				</span>
			</div>
			
			<!-- Generate Button -->
			<Button
				disabled={!canSubmitJob}
				class="flex items-center gap-2"
				color="blue"
				size="sm"
				onclick={handleAIGeneration}
			>
				{#if isLoading}
					<Spinner size="4" color="primary" />
					<span>Generating...</span>
				{:else}
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path 
							stroke-linecap="round" 
							stroke-linejoin="round" 
							stroke-width="2" 
							d="M13 10V3L4 14h7v7l9-11h-7z"
						/>
					</svg>
					<span>Generate Content</span>
				{/if}
			</Button>
		</div>
	{/if}
	
	<!-- Content Display -->
	<div class="px-4 pb-4 pt-16">
		{#if widgetData.title}
			<h3 class="mb-3 text-xl font-semibold text-gray-800">
				{widgetData.title}
			</h3>
		{/if}
		
		{#if isLoading && !widgetData.content}
			<div class="flex items-center justify-center py-12">
				<Spinner size="8" color="gray" />
			</div>
		{:else}
			{#key widgetData.content}
				<div class="custom-prose max-w-none">
					{#if widgetData.markdown}
						<!-- If using markdown, you might want to add a markdown renderer here -->
						<TypeWriter text={widgetData.content} speed={2} />
					{:else}
						<TypeWriter text={widgetData.content} speed={2} />
					{/if}
				</div>
			{/key}
		{/if}
		
		<!-- Update Timestamp -->
		{#if formattedUpdateTime}
			<div class="mt-4 text-xs text-gray-500">
				Last updated: {formattedUpdateTime}
			</div>
		{/if}
	</div>
</div>

<style>
	/* Smooth transitions for alerts */
	.paragraph-widget :global(.alert) {
		transition: all 0.3s ease-in-out;
	}
	
	/* Loading state overlay */
	.paragraph-widget.loading {
		opacity: 0.75;
	}
	
	/* Custom prose styles if needed */
	.custom-prose {
		line-height: 1.75;
		color: rgb(55 65 81);
	}
</style>