<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { gql } from '$lib/realtime/graphql/requestHandler';
	import { AppSyncWsClient } from '$lib/realtime/websocket/AppSyncWsClient';
	import { S_JOB_UPDATE } from '$lib/realtime/graphql/subscriptions/Job';
	import { PUBLIC_GRAPHQL_HTTP_ENDPOINT } from '$env/static/public';

	// ===== Type Definitions =====

	// Use const assertion for better type safety
	const JOB_STATUSES = {
		PENDING: 'PENDING',
		PROCESSING: 'PROCESSING',
		IN_PROGRESS: 'IN_PROGRESS',
		COMPLETED: 'COMPLETED',
		COMPLETE: 'COMPLETE',
		FAILED: 'FAILED',
		ERROR: 'ERROR'
	} as const;

	type JobStatus = (typeof JOB_STATUSES)[keyof typeof JOB_STATUSES];

	const CONNECTION_STATES = {
		DISCONNECTED: 'disconnected',
		CONNECTING: 'connecting',
		CONNECTED: 'connected',
		ERROR: 'error'
	} as const;

	type ConnectionState = (typeof CONNECTION_STATES)[keyof typeof CONNECTION_STATES];

	const PRIORITY_LEVELS = {
		HIGH: 'HIGH',
		MEDIUM: 'MEDIUM',
		LOW: 'LOW'
	} as const;

	type Priority = (typeof PRIORITY_LEVELS)[keyof typeof PRIORITY_LEVELS];

	interface SubmitJobInput {
		readonly request: string;
		readonly priority: Priority;
	}

	interface SubmitJobResponse {
		readonly id: string;
		readonly status: JobStatus;
	}

	interface JobUpdate {
		readonly id: string;
		readonly request: string;
		readonly result: string | null;
		readonly status: JobStatus;
		readonly createdAt: string;
		readonly updatedAt: string;
	}

	interface ParsedResult {
		readonly output_parsed?: Record<string, unknown>;
		readonly error?: string;
		readonly [key: string]: unknown;
	}

	interface ComponentConfig {
		readonly auth: {
			readonly idToken: string;
		};
		readonly job: {
			readonly input: SubmitJobInput;
		};
		readonly options: {
			readonly maxRetries: number;
			readonly retryDelay: number;
			readonly reconnectBackoffMultiplier: number;
			readonly maxReconnectDelay: number;
			readonly subscriptionTimeout: number;
		};
	}

	interface ComponentState {
		// Job state
		result: SubmitJobResponse | null;
		error: Error | null;
		loading: boolean;
		jobUpdates: ReadonlyArray<JobUpdate>;
		// WebSocket state
		wsClient: AppSyncWsClient | null;
		connectionState: ConnectionState;
		reconnectAttempts: number;
		reconnectTimer: ReturnType<typeof setTimeout> | null;
		subscriptionTimeout: ReturnType<typeof setTimeout> | null;
	}

	interface StatusStyle {
		readonly bg: string;
		readonly text: string;
		readonly icon: string;
	}

	// ===== Props & Configuration =====
	interface Props {
		idToken: string;
		jobInput: SubmitJobInput;
		maxRetries?: number;
		retryDelay?: number;
		reconnectBackoffMultiplier?: number;
		maxReconnectDelay?: number;
		subscriptionTimeout?: number;
		onJobComplete?: (update: JobUpdate) => void;
		onJobError?: (error: Error) => void;
	}

	let {
		idToken,
		jobInput,
		maxRetries = 3,
		retryDelay = 1000,
		reconnectBackoffMultiplier = 2,
		maxReconnectDelay = 30000,
		subscriptionTimeout = 300000, // 5 minutes
		onJobComplete,
		onJobError
	}: Props = $props();

	// ===== Constants =====
	const STATUS_STYLES: Record<JobStatus, StatusStyle> = {
		[JOB_STATUSES.PENDING]: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳' },
		[JOB_STATUSES.PROCESSING]: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '⚙️' },
		[JOB_STATUSES.IN_PROGRESS]: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '🔄' },
		[JOB_STATUSES.COMPLETED]: { bg: 'bg-green-100', text: 'text-green-800', icon: '✅' },
		[JOB_STATUSES.COMPLETE]: { bg: 'bg-green-100', text: 'text-green-800', icon: '✅' },
		[JOB_STATUSES.FAILED]: { bg: 'bg-red-100', text: 'text-red-800', icon: '❌' },
		[JOB_STATUSES.ERROR]: { bg: 'bg-red-100', text: 'text-red-800', icon: '⚠️' }
	};

	const DEFAULT_STATUS_STYLE: StatusStyle = {
		bg: 'bg-gray-100',
		text: 'text-gray-800',
		icon: '📋'
	};

	// Consolidated configuration object
	const config: ComponentConfig = $derived({
		auth: { idToken },
		job: { input: jobInput },
		options: {
			maxRetries,
			retryDelay,
			reconnectBackoffMultiplier,
			maxReconnectDelay,
			subscriptionTimeout
		}
	});

	// State object with proper initialization
	let state = $state<ComponentState>({
		result: null,
		error: null,
		loading: false,
		jobUpdates: [],
		wsClient: null,
		connectionState: CONNECTION_STATES.DISCONNECTED,
		reconnectAttempts: 0,
		reconnectTimer: null,
		subscriptionTimeout: null
	});

	// Derived state with proper typing
	const isSubscribed = $derived(state.connectionState === CONNECTION_STATES.CONNECTED);
	const latestUpdate = $derived<JobUpdate | undefined>(state.jobUpdates[0]);
	const isJobComplete = $derived<boolean>(!!latestUpdate && isTerminalStatus(latestUpdate.status));

	// ===== GraphQL Mutation =====
	const M_SUBMIT_JOB = `
		mutation SubmitJob($input: SubmitJobInput!) {
			submitJob(input: $input) {
				id
				status
			}
		}
	`;

	// ===== Error Handling =====
	class JobSubmissionError extends Error {
		readonly code?: string;
		readonly details?: unknown;

		constructor(message: string, code?: string, details?: unknown) {
			super(message);
			this.name = 'JobSubmissionError';
			this.code = code;
			this.details = details;
		}
	}

	class WebSocketError extends Error {
		readonly code?: string;
		readonly shouldRetry: boolean;

		constructor(message: string, code?: string, shouldRetry: boolean = true) {
			super(message);
			this.name = 'WebSocketError';
			this.code = code;
			this.shouldRetry = shouldRetry;
		}
	}

	// ===== Utility Functions =====
	function isTerminalStatus(status: JobStatus): boolean {
		const terminalStatuses: JobStatus[] = [
			JOB_STATUSES.COMPLETED,
			JOB_STATUSES.COMPLETE,
			JOB_STATUSES.FAILED,
			JOB_STATUSES.ERROR
		];
		return terminalStatuses.includes(status);
	}

	function getStatusStyle(status: JobStatus): StatusStyle {
		return STATUS_STYLES[status] || DEFAULT_STATUS_STYLE;
	}

	function parseResult(resultStr: string | null): ParsedResult | null {
		if (!resultStr) return null;

		try {
			const parsed = JSON.parse(resultStr);
			// Validate parsed result structure
			if (typeof parsed !== 'object' || parsed === null) {
				throw new Error('Invalid result format');
			}
			return parsed;
		} catch (error) {
			console.error('Failed to parse result:', error);
			return {
				error: `Failed to parse result: ${error instanceof Error ? error.message : 'Unknown error'}`
			};
		}
	}

	function formatDate(dateStr: string): string {
		try {
			const date = new Date(dateStr);
			if (isNaN(date.getTime())) {
				throw new Error('Invalid date');
			}

			return new Intl.DateTimeFormat('en-US', {
				dateStyle: 'short',
				timeStyle: 'medium'
			}).format(date);
		} catch (error) {
			console.error('Date formatting error:', error);
			return dateStr; // Return original string if formatting fails
		}
	}

	function calculateBackoffDelay(attempt: number): number {
		const baseDelay = config.options.retryDelay;
		const multiplier = config.options.reconnectBackoffMultiplier;
		const maxDelay = config.options.maxReconnectDelay;

		const delay = baseDelay * Math.pow(multiplier, attempt - 1);
		return Math.min(delay, maxDelay);
	}

	// ===== API Functions with Enhanced Error Handling =====
	async function submitJobWithRetry(
		input: SubmitJobInput,
		token: string,
		attempt = 1
	): Promise<SubmitJobResponse> {
		try {
			const response = await gql<{ submitJob: SubmitJobResponse }>(M_SUBMIT_JOB, { input }, token);

			// Validate response structure
			if (!response?.submitJob?.id || !response.submitJob.status) {
				throw new JobSubmissionError('Invalid response structure', 'INVALID_RESPONSE', response);
			}

			return response.submitJob;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error(`Job submission attempt ${attempt} failed:`, errorMessage);

			// Check if error is retryable
			const isRetryable = !(
				error instanceof JobSubmissionError && error.code === 'INVALID_RESPONSE'
			);

			if (attempt < config.options.maxRetries && isRetryable) {
				const delay = calculateBackoffDelay(attempt);
				console.log(
					`Retrying in ${delay}ms (attempt ${attempt + 1}/${config.options.maxRetries})...`
				);

				await new Promise((resolve) => setTimeout(resolve, delay));
				return submitJobWithRetry(input, token, attempt + 1);
			}

			throw error instanceof JobSubmissionError
				? error
				: new JobSubmissionError(errorMessage, 'SUBMISSION_FAILED', error);
		}
	}

	// ===== WebSocket Management with Enhanced Error Handling =====
	function addJobUpdate(update: JobUpdate): void {
		console.log('Adding job update:', {
			id: update.id,
			status: update.status,
			timestamp: update.updatedAt
		});

		// Prevent duplicate updates using immutable comparison
		const isDuplicate = state.jobUpdates.some(
			(u) => u.id === update.id && u.updatedAt === update.updatedAt
		);

		if (!isDuplicate) {
			// Create new array for immutability
			state.jobUpdates = [update, ...state.jobUpdates];

			// Trigger callbacks
			if (isTerminalStatus(update.status)) {
				if (update.status === JOB_STATUSES.FAILED || update.status === JOB_STATUSES.ERROR) {
					onJobError?.(new JobSubmissionError('Job failed', update.status, update));
				} else {
					onJobComplete?.(update);
				}
			}
		}
	}

	function startSubscriptionTimeout(jobId: string): void {
		clearSubscriptionTimeout();

		state.subscriptionTimeout = setTimeout(() => {
			console.warn(`Subscription timeout for job ${jobId}`);
			handleSubscriptionError(
				new WebSocketError('Subscription timeout', 'TIMEOUT', false),
				jobId,
				config.auth.idToken
			);
		}, config.options.subscriptionTimeout);
	}

	function clearSubscriptionTimeout(): void {
		if (state.subscriptionTimeout) {
			clearTimeout(state.subscriptionTimeout);
			state.subscriptionTimeout = null;
		}
	}

	async function setupSubscription(jobId: string, token: string): Promise<void> {
		console.log('Setting up subscription for job:', jobId);
		state.connectionState = CONNECTION_STATES.CONNECTING;

		try {
			// Clean up existing connection
			await cleanupWebSocket();

			// Start subscription timeout
			startSubscriptionTimeout(jobId);

			state.wsClient = new AppSyncWsClient({
				graphqlHttpUrl: PUBLIC_GRAPHQL_HTTP_ENDPOINT,
				auth: { mode: 'cognito', idToken: token },
				subscriptions: [
					{
						query: S_JOB_UPDATE,
						variables: { id: jobId },
						select: (payload: unknown): JobUpdate | null => {
							// Type-safe payload extraction
							const data = payload as any;
							const update = data?.onJobUpdate || data?.data?.onJobUpdate || data;

							// Validate update structure
							if (update?.id && update?.status) {
								return update as JobUpdate;
							}

							console.warn('Invalid update structure:', payload);
							return null;
						},
						next: (update: JobUpdate | null) => {
							if (update) {
								clearSubscriptionTimeout(); // Reset timeout on successful update
								addJobUpdate(update);

								// Auto-disconnect if job is complete
								if (isTerminalStatus(update.status)) {
									console.log('Job complete, scheduling subscription cleanup');
									setTimeout(() => cleanupWebSocket(), 1000);
								} else {
									startSubscriptionTimeout(jobId); // Restart timeout for next update
								}
							}
						},
						error: (error: unknown) => {
							const wsError =
								error instanceof Error
									? new WebSocketError(error.message, 'SUBSCRIPTION_ERROR')
									: new WebSocketError('Unknown subscription error', 'UNKNOWN_ERROR');

							console.error('Subscription error:', wsError);
							handleSubscriptionError(wsError, jobId, token);
						}
					}
				]
			});

			await state.wsClient.ready();
			state.connectionState = CONNECTION_STATES.CONNECTED;
			state.reconnectAttempts = 0;
			console.log('✓ Subscription established for job:', jobId);
		} catch (error) {
			const wsError =
				error instanceof Error
					? new WebSocketError(error.message, 'CONNECTION_ERROR')
					: new WebSocketError('Failed to establish connection', 'UNKNOWN_ERROR');

			console.error('Failed to establish subscription:', wsError);
			handleSubscriptionError(wsError, jobId, token);
		}
	}

	function handleSubscriptionError(error: WebSocketError, jobId: string, token: string): void {
		clearSubscriptionTimeout();
		state.connectionState = CONNECTION_STATES.ERROR;
		state.error = error;

		// Attempt reconnection if appropriate
		const canRetry =
			error.shouldRetry && state.reconnectAttempts < config.options.maxRetries && !isJobComplete;

		if (canRetry) {
			state.reconnectAttempts++;
			const delay = calculateBackoffDelay(state.reconnectAttempts);

			console.log(
				`Scheduling reconnection attempt ${state.reconnectAttempts}/${config.options.maxRetries} in ${delay}ms`
			);

			state.reconnectTimer = setTimeout(() => {
				setupSubscription(jobId, token);
			}, delay);
		} else {
			console.error('Max reconnection attempts reached or job complete, stopping reconnection');
			onJobError?.(error);
		}
	}

	async function cleanupWebSocket(): Promise<void> {
		clearSubscriptionTimeout();

		if (state.reconnectTimer) {
			clearTimeout(state.reconnectTimer);
			state.reconnectTimer = null;
		}

		if (state.wsClient) {
			try {
				state.wsClient.disconnect();
			} catch (error) {
				console.error('Error disconnecting WebSocket:', error);
			} finally {
				state.wsClient = null;
			}
		}

		state.connectionState = CONNECTION_STATES.DISCONNECTED;
	}

	// ===== Main Handler =====
	async function handleSubmitJob(): Promise<void> {
		// Validate authentication
		if (!config.auth.idToken) {
			state.error = new JobSubmissionError('Authentication required', 'AUTH_REQUIRED');
			return;
		}

		// Validate input
		const trimmedRequest = config.job.input?.request?.trim();
		if (!trimmedRequest) {
			state.error = new JobSubmissionError('Job request cannot be empty', 'INVALID_INPUT');
			return;
		}

		// Reset state
		await cleanupWebSocket();
		state.error = null;
		state.result = null;
		state.jobUpdates = [];
		state.loading = true;

		try {
			state.result = await submitJobWithRetry(config.job.input, config.auth.idToken);
			console.log('Job submitted successfully:', state.result);

			// Set up real-time subscription
			if (state.result?.id) {
				await setupSubscription(state.result.id, config.auth.idToken);
			}
		} catch (error) {
			const jobError =
				error instanceof JobSubmissionError
					? error
					: new JobSubmissionError(
							error instanceof Error ? error.message : 'Failed to submit job',
							'UNKNOWN_ERROR',
							error
						);

			state.error = jobError;
			console.error('Job submission failed:', jobError);
			onJobError?.(jobError);
		} finally {
			state.loading = false;
		}
	}

	// ===== Lifecycle Hooks =====
	onMount(() => {
		// Validate configuration on mount
		if (!config.auth.idToken) {
			state.error = new JobSubmissionError(
				'Authentication required to submit jobs',
				'AUTH_REQUIRED'
			);
		}

		// Set up performance monitoring in dev
		if (import.meta.env.DEV) {
			console.log('Job Submission Component mounted', {
				config: {
					maxRetries: config.options.maxRetries,
					retryDelay: config.options.retryDelay,
					subscriptionTimeout: config.options.subscriptionTimeout
				}
			});
		}
	});

	onDestroy(() => {
		// Ensure all resources are cleaned up
		cleanupWebSocket();
		clearSubscriptionTimeout();

		if (import.meta.env.DEV) {
			console.log('Job Submission Component destroyed');
		}
	});

	// ===== Reactive Debugging (Dev Only) =====
	$effect(() => {
		if (import.meta.env.DEV) {
			console.log('State update:', {
				connectionState: state.connectionState,
				updatesCount: state.jobUpdates.length,
				isJobComplete,
				latestStatus: latestUpdate?.status,
				error: state.error?.message
			});
		}
	});

	// ===== Accessibility Helpers =====
	function getAriaLabel(status: JobStatus): string {
		const labels: Record<JobStatus, string> = {
			[JOB_STATUSES.PENDING]: 'Job is pending',
			[JOB_STATUSES.PROCESSING]: 'Job is being processed',
			[JOB_STATUSES.IN_PROGRESS]: 'Job is in progress',
			[JOB_STATUSES.COMPLETED]: 'Job completed successfully',
			[JOB_STATUSES.COMPLETE]: 'Job completed successfully',
			[JOB_STATUSES.FAILED]: 'Job failed',
			[JOB_STATUSES.ERROR]: 'Job encountered an error'
		};
		return labels[status] || 'Job status unknown';
	}

	function getConnectionAriaLabel(): string {
		const labels: Record<ConnectionState, string> = {
			[CONNECTION_STATES.CONNECTED]: 'Real-time updates connected',
			[CONNECTION_STATES.CONNECTING]: 'Connecting to real-time updates',
			[CONNECTION_STATES.DISCONNECTED]: 'Real-time updates disconnected',
			[CONNECTION_STATES.ERROR]: 'Connection error'
		};
		return labels[state.connectionState];
	}
</script>

// JobSubmission.svelte
<div class="space-y-6" role="region" aria-label="Job Submission Interface">
	<!-- Submit Button -->
	{#if !state.result && !state.loading}
		<div class="space-y-3">
			<button
				onclick={handleSubmitJob}
				disabled={!config.auth.idToken}
				class="group relative rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-md"
				aria-label="Submit new job"
			>
				<span class="flex items-center gap-2">
					<svg
						class="h-5 w-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
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

			<div class="text-sm text-gray-600" role="status" aria-label="Job configuration">
				<p>Request: <span class="font-mono text-xs">{config.job.input.request}</span></p>
				<p>Priority: <span class="font-semibold">{config.job.input.priority}</span></p>
			</div>
		</div>
	{/if}

	<!-- Loading State -->
	{#if state.loading}
		<div
			class="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4"
			role="status"
			aria-live="polite"
		>
			<div class="flex items-center gap-3">
				<div
					class="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
					aria-hidden="true"
				></div>
				<p class="font-semibold text-blue-700">Submitting job...</p>
			</div>
		</div>
	{/if}

	<!-- Error State -->
	{#if state.error}
		<div class="rounded-lg border border-red-200 bg-red-50 p-4" role="alert" aria-live="assertive">
			<div class="flex gap-3">
				<span class="text-red-600" aria-hidden="true">⚠️</span>
				<div class="text-red-700">
					<p class="font-semibold">Error</p>
					<p class="text-sm">{state.error.message}</p>
					{#if state.error instanceof JobSubmissionError && state.error.code}
						<p class="mt-1 font-mono text-xs text-red-600">Code: {state.error.code}</p>
					{/if}
					{#if state.reconnectAttempts > 0}
						<p class="mt-2 text-xs text-red-600">
							Reconnection attempt {state.reconnectAttempts}/{config.options.maxRetries}
						</p>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- Success State -->
	{#if state.result}
		<div
			class="rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4"
			role="status"
			aria-live="polite"
		>
			<div class="flex items-start justify-between">
				<div class="space-y-1">
					<p class="flex items-center gap-2 font-semibold text-green-800">
						<span aria-hidden="true">✅</span> Job submitted successfully!
					</p>
					<p class="font-mono text-xs text-gray-600">ID: {state.result.id}</p>
					<p class="text-sm text-gray-700">
						Status:
						<span class="font-semibold" aria-label={getAriaLabel(state.result.status)}>
							{state.result.status}
						</span>
					</p>
				</div>
				<button
					onclick={handleSubmitJob}
					disabled={state.loading}
					class="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-green-800 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
					aria-label="Submit another job"
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
					{state.jobUpdates.length}
				</span>
			</h2>

			<div
				class="flex items-center gap-2 text-sm"
				role="status"
				aria-label={getConnectionAriaLabel()}
			>
				{#if state.connectionState === CONNECTION_STATES.CONNECTED}
					<span class="relative flex h-3 w-3" aria-hidden="true">
						<span
							class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"
						></span>
						<span class="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
					</span>
					<span class="text-green-600">Live</span>
				{:else if state.connectionState === CONNECTION_STATES.CONNECTING}
					<span class="h-3 w-3 animate-pulse rounded-full bg-yellow-500" aria-hidden="true"></span>
					<span class="text-yellow-600">Connecting...</span>
				{:else if state.connectionState === CONNECTION_STATES.ERROR}
					<span class="h-3 w-3 rounded-full bg-red-500" aria-hidden="true"></span>
					<span class="text-red-600">Connection Error</span>
				{:else}
					<span class="h-3 w-3 rounded-full bg-gray-400" aria-hidden="true"></span>
					<span class="text-gray-600">Disconnected</span>
				{/if}

				{#if isJobComplete}
					<span class="ml-2 text-xs text-gray-500">(Job Complete)</span>
				{/if}
			</div>
		</div>

		<!-- Updates List -->
		{#if state.jobUpdates.length === 0}
			<div class="rounded-lg border border-gray-200 bg-white p-6 text-center" role="status">
				<div
					class="mx-auto mb-3 h-12 w-12 animate-pulse rounded-full bg-gray-100"
					aria-hidden="true"
				></div>
				<p class="font-medium text-gray-600">Waiting for updates...</p>
				<p class="mt-1 text-sm text-gray-500">
					{#if isSubscribed}
						Subscription active and listening
					{:else if state.connectionState === CONNECTION_STATES.CONNECTING}
						Establishing connection...
					{:else}
						Connection pending
					{/if}
				</p>
			</div>
		{:else}
			<div class="space-y-3" role="list" aria-label="Job updates">
				{#each state.jobUpdates as update, index (update.id + '-' + update.updatedAt)}
					{@const statusInfo = getStatusStyle(update.status)}
					{@const parsedResult = parseResult(update.result)}

					<article
						class="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
						class:animate-pulse={index === 0 && !isJobComplete}
						role="listitem"
						aria-label="Job update {index + 1}"
					>
						<!-- Header -->
						<div class="mb-3 flex items-center justify-between">
							<div class="flex items-center gap-2">
								<span class="text-lg" aria-hidden="true">{statusInfo.icon}</span>
								<span
									class="rounded-full px-3 py-1 text-sm font-semibold {statusInfo.bg} {statusInfo.text}"
									aria-label={getAriaLabel(update.status)}
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
												<dd class="text-gray-900">
													<pre class="whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
												</dd>
											</div>
										{/each}
									</dl>
								</div>
							{:else if parsedResult?.error}
								<div
									class="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700"
									role="alert"
								>
									{parsedResult.error}
								</div>
							{/if}

							<!-- Full Result (Collapsible) -->
							{#if update.result}
								<details class="group/details">
									<summary
										class="cursor-pointer rounded px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
									>
										<span
											class="inline-block transition-transform group-open/details:rotate-90"
											aria-hidden="true"
										>
											▶
										</span>
										View Full Result
									</summary>
									<pre
										class="mt-2 max-h-64 overflow-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-100">
<code>{JSON.stringify(parsedResult, null, 2)}</code></pre>
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
					</article>
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

	/* Ensure proper contrast for accessibility */
	.text-gray-400 {
		color: #6b7280;
	}

	/* Code block styling */
	pre code {
		font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
	}
</style>
