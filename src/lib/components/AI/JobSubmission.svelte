<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { gql } from '$lib/realtime/graphql/requestHandler';
	import { AppSyncWsClient } from '$lib/realtime/websocket/AppSyncWsClient';
	import { S_JOB_UPDATE } from '$lib/realtime/graphql/subscriptions/Job';
	import { PUBLIC_GRAPHQL_HTTP_ENDPOINT } from '$env/static/public';

	// ===== Type Definitions =====
	type Props = {
		idToken: string;
		jobInput: SubmitJobInput;
		maxRetries?: number;
		retryDelay?: number;
	};

	type SubmitJobInput = {
		request: string;
		priority: 'HIGH' | 'MEDIUM' | 'LOW';
	};

	type SubmitJobResponse = {
		id: string;
		status: JobStatus;
	};

	type JobStatus =
		| 'PENDING'
		| 'PROCESSING'
		| 'IN_PROGRESS'
		| 'COMPLETED'
		| 'COMPLETE'
		| 'FAILED'
		| 'ERROR';

	type JobUpdate = {
		id: string;
		request: string;
		result: string | null;
		status: JobStatus;
		createdAt: string;
		updatedAt: string;
	};

	type ParsedResult = {
		output_parsed?: Record<string, unknown>;
		error?: string;
		[key: string]: unknown;
	};

	type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

	// ===== Props & State =====
	let { idToken, jobInput, maxRetries = 3, retryDelay = 1000 }: Props = $props();

	// Core state
	let result: SubmitJobResponse | null = $state(null);
	let error: string | null = $state(null);
	let loading = $state(false);
	let jobUpdates = $state<JobUpdate[]>([]);

	// WebSocket state
	let wsClient: AppSyncWsClient | null = null;
	let connectionState = $state<ConnectionState>('disconnected');
	let reconnectAttempts = $state(0);
	let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

	// Derived state
	let isSubscribed = $derived(connectionState === 'connected');
	let latestUpdate = $derived(jobUpdates[0]);
	let isJobComplete = $derived(
		latestUpdate?.status === 'COMPLETED' ||
			latestUpdate?.status === 'COMPLETE' ||
			latestUpdate?.status === 'FAILED' ||
			latestUpdate?.status === 'ERROR'
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
	function getStatusColor(status: JobStatus): { bg: string; text: string; icon?: string } {
		const statusMap: Record<JobStatus, { bg: string; text: string; icon?: string }> = {
			PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳' },
			PROCESSING: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '⚙️' },
			IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '🔄' },
			COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', icon: '✅' },
			COMPLETE: { bg: 'bg-green-100', text: 'text-green-800', icon: '✅' },
			FAILED: { bg: 'bg-red-100', text: 'text-red-800', icon: '❌' },
			ERROR: { bg: 'bg-red-100', text: 'text-red-800', icon: '⚠️' }
		};
		return statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
	}

	function parseResult(resultStr: string | null): ParsedResult | null {
		if (!resultStr) return null;
		try {
			return JSON.parse(resultStr);
		} catch (e) {
			console.error('Failed to parse result:', e);
			return { error: 'Failed to parse result' };
		}
	}

	function formatDate(dateStr: string): string {
		return new Intl.DateTimeFormat('en-US', {
			dateStyle: 'short',
			timeStyle: 'medium'
		}).format(new Date(dateStr));
	}

	// ===== API Functions with Retry Logic =====
	async function submitJobWithRetry(
		input: SubmitJobInput,
		token: string,
		attempt = 1
	): Promise<SubmitJobResponse> {
		try {
			const res = await gql<{ submitJob: SubmitJobResponse }>(M_SUBMIT_JOB, { input }, token);
			return res.submitJob;
		} catch (e) {
			console.error(`Job submission attempt ${attempt} failed:`, e);

			if (attempt < maxRetries) {
				console.log(`Retrying in ${retryDelay}ms...`);
				await new Promise((resolve) => setTimeout(resolve, retryDelay));
				return submitJobWithRetry(input, token, attempt + 1);
			}

			throw e;
		}
	}

	// ===== WebSocket Management =====
	function addJobUpdate(update: JobUpdate) {
		console.log('Adding job update:', {
			id: update.id,
			status: update.status,
			timestamp: update.updatedAt
		});

		// Prevent duplicate updates
		const exists = jobUpdates.some((u) => u.id === update.id && u.updatedAt === update.updatedAt);

		if (!exists) {
			jobUpdates = [update, ...jobUpdates];
		}
	}

	async function setupSubscription(jobId: string, token: string) {
		console.log('Setting up subscription for job:', jobId);
		connectionState = 'connecting';

		try {
			// Clean up existing connection
			await cleanupWebSocket();

			wsClient = new AppSyncWsClient({
				graphqlHttpUrl: PUBLIC_GRAPHQL_HTTP_ENDPOINT,
				auth: { mode: 'cognito', idToken: token },
				subscriptions: [
					{
						query: S_JOB_UPDATE,
						variables: { id: jobId },
						select: (payload: any) => {
							// Extract onJobUpdate from various payload structures
							return payload?.onJobUpdate || payload?.data?.onJobUpdate || payload;
						},
						next: (update: any) => {
							if (update?.id) {
								addJobUpdate(update as JobUpdate);

								// Auto-disconnect if job is complete
								if (isJobComplete && wsClient) {
									console.log('Job complete, closing subscription');
									setTimeout(() => cleanupWebSocket(), 1000);
								}
							} else {
								console.warn('Received invalid update:', update);
							}
						},
						error: (err: any) => {
							console.error('Subscription error:', err);
							handleSubscriptionError(err, jobId, token);
						}
					}
				]
			});

			await wsClient.ready();
			connectionState = 'connected';
			reconnectAttempts = 0;
			console.log('✓ Subscription established for job:', jobId);
		} catch (err) {
			console.error('Failed to establish subscription:', err);
			handleSubscriptionError(err, jobId, token);
		}
	}

	function handleSubscriptionError(err: any, jobId: string, token: string) {
		connectionState = 'error';
		error = `Connection error: ${err?.message || 'Unknown error'}`;

		// Attempt reconnection if not at max attempts and job not complete
		if (reconnectAttempts < maxRetries && !isJobComplete) {
			reconnectAttempts++;
			const delay = Math.min(retryDelay * Math.pow(2, reconnectAttempts - 1), 10000);

			console.log(`Reconnection attempt ${reconnectAttempts}/${maxRetries} in ${delay}ms`);
			reconnectTimer = setTimeout(() => {
				setupSubscription(jobId, token);
			}, delay);
		}
	}

	async function cleanupWebSocket() {
		if (reconnectTimer) {
			clearTimeout(reconnectTimer);
			reconnectTimer = null;
		}

		if (wsClient) {
			try {
				wsClient.disconnect();
			} catch (e) {
				console.error('Error disconnecting WebSocket:', e);
			}
			wsClient = null;
		}

		connectionState = 'disconnected';
	}

	// ===== Main Handler =====
	async function handleSubmitJob() {
		if (!idToken) {
			error = 'Authentication required';
			return;
		}

		// Validate input
		if (!jobInput?.request?.trim()) {
			error = 'Job request cannot be empty';
			return;
		}

		// Reset state
		await cleanupWebSocket();
		error = null;
		result = null;
		jobUpdates = [];
		loading = true;

		try {
			result = await submitJobWithRetry(jobInput, idToken);
			console.log('Job submitted successfully:', result);

			// Set up real-time subscription
			if (result?.id) {
				await setupSubscription(result.id, idToken);
			}
		} catch (e) {
			const errorMessage = e instanceof Error ? e.message : 'Failed to submit job';
			error = errorMessage;
			console.error('Job submission failed:', e);
		} finally {
			loading = false;
		}
	}

	// ===== Lifecycle =====
	onMount(() => {
		// Check authentication on mount
		if (!idToken) {
			error = 'Authentication required to submit jobs';
		}
	});

	onDestroy(() => {
		cleanupWebSocket();
	});

	// ===== Reactive Statements =====
	$effect(() => {
		// Log state changes for debugging
		if (import.meta.env.DEV) {
			console.log('State update:', {
				connectionState,
				updatesCount: jobUpdates.length,
				isJobComplete,
				latestStatus: latestUpdate?.status
			});
		}
	});
</script>

<div class="space-y-6">
	<!-- Submit Button -->
	{#if !result && !loading}
		<div class="space-y-3">
			<button
				onclick={handleSubmitJob}
				disabled={!idToken}
				class="group relative rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-md"
			>
				<span class="flex items-center gap-2">
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8l-8 8-8-8"
						/>
					</svg>
					Submit Job
				</span>
			</button>

			<div class="text-sm text-gray-600">
				<p>Request: <span class="font-mono text-xs">{jobInput.request}</span></p>
				<p>Priority: <span class="font-semibold">{jobInput.priority}</span></p>
			</div>
		</div>
	{/if}

	<!-- Loading State -->
	{#if loading}
		<div class="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
			<div class="flex items-center gap-3">
				<div
					class="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
				></div>
				<p class="font-semibold text-blue-700">Submitting job...</p>
			</div>
		</div>
	{/if}

	<!-- Error State -->
	{#if error}
		<div class="rounded-lg border border-red-200 bg-red-50 p-4" role="alert">
			<div class="flex gap-3">
				<span class="text-red-600">⚠️</span>
				<div class="text-red-700">
					<p class="font-semibold">Error</p>
					<p class="text-sm">{error}</p>
					{#if reconnectAttempts > 0}
						<p class="mt-2 text-xs text-red-600">
							Reconnection attempt {reconnectAttempts}/{maxRetries}
						</p>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- Success State -->
	{#if result}
		<div
			class="rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4"
		>
			<div class="flex items-start justify-between">
				<div class="space-y-1">
					<p class="flex items-center gap-2 font-semibold text-green-800">
						<span>✅</span> Job submitted successfully!
					</p>
					<p class="font-mono text-xs text-gray-600">ID: {result.id}</p>
					<p class="text-sm text-gray-700">
						Status:
						<span class="font-semibold">{result.status}</span>
					</p>
				</div>
				<button
					onclick={handleSubmitJob}
					disabled={loading}
					class="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-green-800 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
				>
					Submit Another
				</button>
			</div>
		</div>

		<!-- Connection Status -->
		<div class="flex items-center justify-between rounded-lg bg-gray-50 p-3">
			<h2 class="text-lg font-semibold">
				Job Updates
				<span class="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-sm font-normal">
					{jobUpdates.length}
				</span>
			</h2>

			<div class="flex items-center gap-2 text-sm">
				{#if connectionState === 'connected'}
					<span class="relative flex h-3 w-3">
						<span
							class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"
						></span>
						<span class="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
					</span>
					<span class="text-green-600">Live</span>
				{:else if connectionState === 'connecting'}
					<span class="h-3 w-3 animate-pulse rounded-full bg-yellow-500"></span>
					<span class="text-yellow-600">Connecting...</span>
				{:else if connectionState === 'error'}
					<span class="h-3 w-3 rounded-full bg-red-500"></span>
					<span class="text-red-600">Connection Error</span>
				{:else}
					<span class="h-3 w-3 rounded-full bg-gray-400"></span>
					<span class="text-gray-600">Disconnected</span>
				{/if}

				{#if isJobComplete}
					<span class="ml-2 text-xs text-gray-500">(Job Complete)</span>
				{/if}
			</div>
		</div>

		<!-- Updates List -->
		{#if jobUpdates.length === 0}
			<div class="rounded-lg border border-gray-200 bg-white p-6 text-center">
				<div class="mx-auto mb-3 h-12 w-12 animate-pulse rounded-full bg-gray-100"></div>
				<p class="font-medium text-gray-600">Waiting for updates...</p>
				<p class="mt-1 text-sm text-gray-500">
					{#if isSubscribed}
						Subscription active and listening
					{:else if connectionState === 'connecting'}
						Establishing connection...
					{:else}
						Connection pending
					{/if}
				</p>
			</div>
		{:else}
			<div class="space-y-3">
				{#each jobUpdates as update, index (update.id + '-' + update.updatedAt)}
					{@const statusInfo = getStatusColor(update.status)}
					{@const parsedResult = parseResult(update.result)}

					<div
						class="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
						class:animate-pulse={index === 0 && !isJobComplete}
					>
						<!-- Header -->
						<div class="mb-3 flex items-center justify-between">
							<div class="flex items-center gap-2">
								<span class="text-lg">{statusInfo.icon || '📋'}</span>
								<span
									class="rounded-full px-3 py-1 text-sm font-semibold {statusInfo.bg} {statusInfo.text}"
								>
									{update.status}
								</span>
								{#if index === 0}
									<span class="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
										Latest
									</span>
								{/if}
							</div>
							<time class="text-xs text-gray-500" datetime={update.updatedAt}>
								{formatDate(update.updatedAt)}
							</time>
						</div>

						<!-- Content -->
						<div class="space-y-3">
							<!-- Extracted Data -->
							{#if parsedResult?.output_parsed}
								<div
									class="rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-3"
								>
									<h4 class="mb-2 text-sm font-semibold text-green-900">📊 Extracted Data</h4>
									<dl class="grid grid-cols-2 gap-2 text-sm">
										{#each Object.entries(parsedResult.output_parsed) as [key, value]}
											<div>
												<dt class="font-medium text-gray-600">{key}:</dt>
												<dd class="text-gray-900">{JSON.stringify(value, null, 2)}</dd>
											</div>
										{/each}
									</dl>
								</div>
							{:else if parsedResult?.error}
								<div class="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
									{parsedResult.error}
								</div>
							{/if}

							<!-- Full Result (Collapsible) -->
							{#if update.result}
								<details class="group/details">
									<summary
										class="cursor-pointer rounded px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
									>
										<span class="inline-block transition-transform group-open/details:rotate-90"
											>▶</span
										>
										View Full Result
									</summary>
									<pre
										class="mt-2 max-h-64 overflow-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-100">
{JSON.stringify(parsedResult, null, 2)}</pre>
								</details>
							{/if}

							<!-- Metadata -->
							<div class="border-t pt-2 text-xs text-gray-400">
								<p>Created: {formatDate(update.createdAt)}</p>
								{#if update.createdAt !== update.updatedAt}
									<p>Modified: {formatDate(update.updatedAt)}</p>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>

<style>
	/* Custom animation for connection indicator */
	@keyframes pulse-ring {
		0% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.5);
			opacity: 0.5;
		}
		100% {
			transform: scale(2);
			opacity: 0;
		}
	}
</style>
