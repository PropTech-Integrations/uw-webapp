<script lang="ts">
	/**
	 * Unified AI Job → Paragraph Component
	 *
	 * Combines job submission and paragraph display into a single component
	 * Simplified architecture without bridge pattern
	 */

	import { onDestroy, onMount } from 'svelte';
	import { gql } from '$lib/realtime/graphql/requestHandler';
	import { addSubscription, removeSubscription, ensureConnection } from '$lib/stores/appSyncClientStore';
	import { S_JOB_UPDATE } from '$lib/realtime/graphql/subscriptions/Job';
	import { jobUpdateStore, type JobUpdate } from '$lib/stores/jobUpdateStore';
	import type { SubscriptionSpec } from '$lib/realtime/websocket/types';
	import { getWidgetTextFormat, type ParagraphWidgetData } from '$lib/dashboard/types/widgetSchemas';

	// ===== Types =====
	const JOB_STATUSES = {
		PENDING: 'PENDING',
		PROCESSING: 'PROCESSING',
		IN_PROGRESS: 'IN_PROGRESS',
		COMPLETED: 'COMPLETED',
		COMPLETE: 'COMPLETE',
		FAILED: 'FAILED',
		ERROR: 'ERROR'
	} as const;

	type JobStatus = typeof JOB_STATUSES[keyof typeof JOB_STATUSES];

	const CONNECTION_STATES = {
		DISCONNECTED: 'disconnected',
		CONNECTING: 'connecting',
		CONNECTED: 'connected',
		ERROR: 'error'
	} as const;

	type ConnectionState = typeof CONNECTION_STATES[keyof typeof CONNECTION_STATES];

	interface Props {
		idToken: string;
		prompt?: string;
		widgetId?: string;
		model?: 'gpt-5-nano';
		autoSubmit?: boolean;
	}

	interface JobState {
		status: 'idle' | 'submitting' | 'processing' | 'completed' | 'error';
		jobId: string | null;
		error: Error | null;
		connectionState: ConnectionState;
		updates: JobUpdate[];
	}

	// ===== Props =====
	let {
		idToken,
		prompt = 'Summarize the latest AI developments in a short paragraph',
		widgetId = 'ai-paragraph-widget',
		model = 'gpt-5-nano',
		autoSubmit = false
	}: Props = $props();

	// ===== State =====
	let jobState = $state<JobState>({
		status: 'idle',
		jobId: null,
		error: null,
		connectionState: CONNECTION_STATES.DISCONNECTED,
		updates: []
	});

	let paragraphData = $state<ParagraphWidgetData>({
		title: 'AI Generated Content',
		content: 'Click "Generate Content" to start.',
		markdown: false
	});

	let currentSubscription = $state<SubscriptionSpec<JobUpdate> | null>(null);
	let subscriptionTimeout = $state<ReturnType<typeof setTimeout> | null>(null);

	// ===== Computed Properties =====
	let isProcessing = $derived(
		jobState.status === 'submitting' || jobState.status === 'processing'
	);
	
	let latestUpdate = $derived(jobState.updates[0]);
	
	let isJobComplete = $derived(
		!!latestUpdate && isTerminalStatus(latestUpdate.status as JobStatus)
	);

	// ===== GraphQL Mutation =====
	const M_SUBMIT_JOB = `
		mutation SubmitJob($input: SubmitJobInput!) {
			submitJob(input: $input) {
				id
				status
			}
		}
	`;

	// ===== Utility Functions =====
	function isTerminalStatus(status: JobStatus): boolean {
		return [
			JOB_STATUSES.COMPLETED,
			JOB_STATUSES.COMPLETE,
			JOB_STATUSES.FAILED,
			JOB_STATUSES.ERROR
		].includes(status);
	}

	function transformJobResult(result: string | null): ParagraphWidgetData {
		if (!result) {
			return {
				title: 'No Content',
				content: 'No result received from AI',
				markdown: false
			};
		}

		try {
			const parsed = typeof result === 'string' ? JSON.parse(result) : result;
			
			// Extract content from various possible structures
			let extractedTitle: string | undefined;
			let extractedContent: string;
			let extractedMarkdown: boolean = false;

			if (typeof parsed.content === 'string') {
				extractedContent = parsed.content;
				extractedTitle = parsed.title;
				extractedMarkdown = parsed.markdown || false;
			} else if (parsed.output_parsed?.content) {
				extractedContent = parsed.output_parsed.content;
				extractedTitle = parsed.output_parsed.title;
				extractedMarkdown = parsed.output_parsed.markdown || false;
			} else if (typeof parsed.text === 'string') {
				extractedContent = parsed.text;
				extractedTitle = parsed.title;
				extractedMarkdown = parsed.markdown || false;
			} else {
				extractedContent = JSON.stringify(parsed, null, 2);
				extractedTitle = 'AI Response';
			}

			return {
				title: extractedTitle || 'AI Generated Content',
				content: extractedContent,
				markdown: extractedMarkdown
			};
		} catch (error) {
			console.error('Failed to parse result:', error);
			return {
				title: 'Error',
				content: `Failed to process: ${error instanceof Error ? error.message : 'Unknown'}`,
				markdown: false
			};
		}
	}

	function createJobInput() {
		const textFormat = getWidgetTextFormat('paragraph', 'ParagraphContent');

		return {
			request: JSON.stringify({
				model,
				input: [
					{
						role: 'system',
						content: `You are a helpful assistant that writes clear, informative paragraphs. 
						Structure your response with:
						- A concise, descriptive title
						- Well-formatted content (use markdown if it improves readability)
						- Set markdown: true if you use markdown formatting`
					},
					{
						role: 'user',
						content: prompt
					}
				],
				text: {
					format: textFormat
				}
			}),
			priority: 'HIGH' as const
		};
	}

	// ===== Job Submission =====
	async function submitJob(): Promise<void> {
		if (!idToken) {
			jobState.error = new Error('Authentication required');
			jobState.status = 'error';
			return;
		}

		// Reset state
		jobState = {
			status: 'submitting',
			jobId: null,
			error: null,
			connectionState: CONNECTION_STATES.DISCONNECTED,
			updates: []
		};

		try {
			const input = createJobInput();
			const response = await gql<{ submitJob: { id: string; status: string } }>(
				M_SUBMIT_JOB,
				{ input },
				idToken
			);

			if (!response?.submitJob?.id) {
				throw new Error('Invalid response from server');
			}

			jobState.jobId = response.submitJob.id;
			jobState.status = 'processing';

			// Set up subscription for updates
			await setupSubscription(response.submitJob.id);
		} catch (error) {
			console.error('Job submission failed:', error);
			jobState.status = 'error';
			jobState.error = error instanceof Error ? error : new Error('Failed to submit job');
		}
	}

	// ===== WebSocket Subscription =====
	async function setupSubscription(jobId: string): Promise<void> {
		jobState.connectionState = CONNECTION_STATES.CONNECTING;

		try {
			// Clean up existing subscription
			if (currentSubscription) {
				removeSubscription(currentSubscription);
			}

			// Set timeout for subscription
			subscriptionTimeout = setTimeout(() => {
				console.warn('Subscription timeout');
				jobState.connectionState = CONNECTION_STATES.ERROR;
			}, 300000); // 5 minutes

			// Create subscription
			const subscription: SubscriptionSpec<JobUpdate> = {
				query: S_JOB_UPDATE,
				variables: { id: jobId },
				select: (payload: unknown): JobUpdate | undefined => {
					const data = payload as any;
					const update = data?.onJobUpdate || data?.data?.onJobUpdate || data;
					
					if (update?.id && update?.status) {
						return update as JobUpdate;
					}
					return undefined;
				},
				next: (update: JobUpdate) => {
					if (update) {
						handleJobUpdate(update);
					}
				},
				error: (error: unknown) => {
					console.error('Subscription error:', error);
					jobState.connectionState = CONNECTION_STATES.ERROR;
				}
			};

			currentSubscription = subscription;

			// Connect and subscribe
			await ensureConnection(idToken);
			await addSubscription(idToken, subscription);
			
			jobState.connectionState = CONNECTION_STATES.CONNECTED;
		} catch (error) {
			console.error('Failed to establish subscription:', error);
			jobState.connectionState = CONNECTION_STATES.ERROR;
		}
	}

	function handleJobUpdate(update: JobUpdate): void {
		// Add update to the beginning of the array
		jobState.updates = [update, ...jobState.updates];

		// Update paragraph data if we have a result
		if (update.result) {
			paragraphData = transformJobResult(update.result);
		}

		// Update job status
		const status = update.status as JobStatus;
		if (isTerminalStatus(status)) {
			if (status === JOB_STATUSES.FAILED || status === JOB_STATUSES.ERROR) {
				jobState.status = 'error';
				jobState.error = new Error(`Job failed with status: ${status}`);
			} else {
				jobState.status = 'completed';
			}

			// Clean up subscription
			if (subscriptionTimeout) {
				clearTimeout(subscriptionTimeout);
				subscriptionTimeout = null;
			}
			
			setTimeout(() => {
				if (currentSubscription) {
					removeSubscription(currentSubscription);
					currentSubscription = null;
					jobState.connectionState = CONNECTION_STATES.DISCONNECTED;
				}
			}, 1000);
		}
	}

	function reset(): void {
		// Clean up subscription
		if (currentSubscription) {
			removeSubscription(currentSubscription);
			currentSubscription = null;
		}

		if (subscriptionTimeout) {
			clearTimeout(subscriptionTimeout);
			subscriptionTimeout = null;
		}

		// Reset state
		jobState = {
			status: 'idle',
			jobId: null,
			error: null,
			connectionState: CONNECTION_STATES.DISCONNECTED,
			updates: []
		};

		paragraphData = {
			title: 'AI Generated Content',
			content: 'Click "Generate Content" to start.',
			markdown: false
		};
	}

	// ===== Lifecycle =====
	onMount(() => {
		if (autoSubmit) {
			submitJob();
		}
	});

	onDestroy(() => {
		if (currentSubscription) {
			removeSubscription(currentSubscription);
		}
		if (subscriptionTimeout) {
			clearTimeout(subscriptionTimeout);
		}
	});
</script>

<div class="space-y-6 rounded-lg border-2 border-blue-200 bg-white p-6 shadow-lg">
	<!-- Header -->

			{#if jobState.status === 'completed' || jobState.status === 'error'}
				<button
					onclick={reset}
					class="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700
					       transition-colors hover:bg-gray-200"
				>
					Reset
				</button>
			{/if}
	


	<!-- Action Button -->
	{#if jobState.status === 'idle'}
		<button
			onclick={submitJob}
			disabled={!idToken}
			class="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3
			       font-semibold text-white shadow-md transition-all hover:from-blue-700 
			       hover:to-blue-800 hover:shadow-lg active:scale-[0.98] 
			       disabled:cursor-not-allowed disabled:opacity-50"
		>
			Generate Content
		</button>
	{/if}

	<!-- Status Display -->
	{#if jobState.status !== 'idle'}
		<div class="space-y-4">
			<!-- Status Bar -->
			<div class="flex items-center justify-between rounded-lg bg-gray-50 p-3">
				<div class="flex items-center gap-3">
					<div class="flex items-center gap-2">
						{#if isProcessing}
							<div class="h-3 w-3 animate-pulse rounded-full bg-blue-500"></div>
							<span class="text-sm font-medium text-gray-700">Processing</span>
						{:else if jobState.status === 'completed'}
							<div class="h-3 w-3 rounded-full bg-green-500"></div>
							<span class="text-sm font-medium text-gray-700">Completed</span>
						{:else if jobState.status === 'error'}
							<div class="h-3 w-3 rounded-full bg-red-500"></div>
							<span class="text-sm font-medium text-gray-700">Error</span>
						{/if}
					</div>
					{#if jobState.jobId}
						<span class="font-mono text-xs text-gray-500">ID: {jobState.jobId}</span>
					{/if}
				</div>
				
				<!-- Connection Status -->
				<div class="flex items-center gap-2 text-sm">
					{#if jobState.connectionState === CONNECTION_STATES.CONNECTED}
						<span class="h-2 w-2 rounded-full bg-green-500"></span>
						<span class="text-green-600">Live</span>
					{:else if jobState.connectionState === CONNECTION_STATES.CONNECTING}
						<span class="h-2 w-2 animate-pulse rounded-full bg-yellow-500"></span>
						<span class="text-yellow-600">Connecting</span>
					{:else}
						<span class="h-2 w-2 rounded-full bg-gray-400"></span>
						<span class="text-gray-600">Offline</span>
					{/if}
				</div>
			</div>

			<!-- Error Display -->
			{#if jobState.error}
				<div class="rounded-lg border border-red-200 bg-red-50 p-4">
					<p class="text-sm font-semibold text-red-800">Error</p>
					<p class="mt-1 text-sm text-red-700">{jobState.error.message}</p>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Paragraph Display -->
	<div class="rounded-lg border border-gray-200 bg-white p-6">
		<h3 class="mb-4 font-semibold text-gray-900">Generated Content</h3>
		
		<div class="space-y-3">
			{#if paragraphData.title}
				<h4 class="text-lg font-bold text-gray-800">{paragraphData.title}</h4>
			{/if}
			
			{#if paragraphData.markdown}
				<div class="prose prose-sm max-w-none">
					<!-- In production, use a markdown renderer like marked -->
					<div class="whitespace-pre-wrap text-gray-700">{paragraphData.content}</div>
				</div>
			{:else}
				<p class="text-gray-700">{paragraphData.content}</p>
			{/if}
		</div>
	</div>

	<!-- Job Updates -->
	{#if jobState.updates.length > 0}
		<details class="rounded-lg bg-gray-50 p-4">
			<summary class="cursor-pointer font-semibold text-gray-900">
				Job Updates ({jobState.updates.length})
			</summary>
			<div class="mt-3 space-y-2">
				{#each jobState.updates as update}
					<div class="rounded border border-gray-200 bg-white p-3">
						<div class="flex items-center justify-between">
							<span class="text-sm font-medium">{update.status}</span>
							<time class="text-xs text-gray-500">
								{new Date(update.updatedAt).toLocaleTimeString()}
							</time>
						</div>
					</div>
				{/each}
			</div>
		</details>
	{/if}
</div>

<style>
	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.animate-pulse {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
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

	.prose {
		line-height: 1.75;
	}

	.prose pre {
		background-color: #f3f4f6;
		padding: 0.75rem;
		border-radius: 0.375rem;
		overflow-x: auto;
	}
</style>