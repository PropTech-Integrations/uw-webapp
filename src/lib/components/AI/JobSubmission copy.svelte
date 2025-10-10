<script lang="ts">
	import { onDestroy } from 'svelte';
	import { gql } from '$lib/realtime/graphql/requestHandler';
	import { AppSyncWsClient } from '$lib/realtime/websocket/AppSyncWsClient';
	import { S_JOB_UPDATE } from '$lib/realtime/graphql/subscriptions/Job';
	import { PUBLIC_GRAPHQL_HTTP_ENDPOINT } from '$env/static/public';

	type Props = {
		idToken: string;
		jobInput: SubmitJobInput;
	};

	let { idToken, jobInput }: Props = $props();

	const M_SUBMIT_JOB = `
        mutation SubmitJob($input: SubmitJobInput!) {
            submitJob(input: $input) {
                id
                status
            }
        }
    `;

	type SubmitJobInput = {
		request: string;
		priority: string;
	};

	type SubmitJobResponse = {
		id: string;
		status: string;
	};

	type JobUpdate = {
		id: string;
		request: string;
		result: string | null;
		status: string;
		createdAt: string;
		updatedAt: string;
	};

	let result: SubmitJobResponse | null = $state(null);
	let error: string | null = $state(null);
	let loading = $state(false);
	let jobUpdates = $state<JobUpdate[]>([]);
	let wsClient: AppSyncWsClient | null = null;
	let isSubscribed = $state(false);

	async function submitJob(input: SubmitJobInput, token: string) {
		try {
			const res = await gql<{ submitJob: SubmitJobResponse }>(M_SUBMIT_JOB, { input }, token);
			return res.submitJob;
		} catch (e) {
			console.error('Error submitting job:', e);
			throw e;
		}
	}

	function addJobUpdate(update: JobUpdate) {
		console.log('Adding job update to UI:', update);
		console.log('Current jobUpdates length before add:', jobUpdates.length);

		// Create a completely new array to ensure reactivity
		const newUpdates = [update, ...jobUpdates];
		jobUpdates = newUpdates;

		console.log('Current jobUpdates length after add:', jobUpdates.length);
		console.log('jobUpdates array:', jobUpdates);
	}

	async function subscribeToJobUpdates(jobId: string, token: string) {
		console.log('Setting up subscription for job ID:', jobId);

		// Create WebSocket client
		wsClient = new AppSyncWsClient({
			graphqlHttpUrl: PUBLIC_GRAPHQL_HTTP_ENDPOINT,
			auth: { mode: 'cognito', idToken: token },
			subscriptions: [
				{
					query: S_JOB_UPDATE,
					variables: { id: jobId },
					select: (payload: any) => {
						console.log('==== SELECT function called ====');
						console.log('Payload:', payload);
						console.log('Payload keys:', Object.keys(payload || {}));

						// Try to extract onJobUpdate from payload
						if (payload && payload.onJobUpdate) {
							console.log('Found onJobUpdate in payload:', payload.onJobUpdate);
							return payload.onJobUpdate;
						}

						console.log('Returning full payload');
						return payload;
					},
					next: (update: any) => {
						console.log('==== NEXT callback called ====');
						console.log('Update received:', update);
						console.log('Update type:', typeof update);
						console.log('Update keys:', Object.keys(update || {}));

						// Ensure update has required fields
						if (update && update.id) {
							console.log('Valid update, calling addJobUpdate');
							addJobUpdate(update as JobUpdate);
						} else {
							console.error('Invalid update received (no id):', update);
						}
					},
					error: (err: any) => {
						console.error('Job subscription error:', err);
						error = 'Subscription error: ' + (err.message || JSON.stringify(err));
						isSubscribed = false;
					}
				}
			]
		});

		// Wait for WebSocket to be ready
		try {
			await wsClient.ready();
			isSubscribed = true;
			console.log('✓ Subscription active and ready for job:', jobId);
		} catch (err) {
			console.error('Failed to establish subscription:', err);
			error = 'Failed to connect to updates';
			isSubscribed = false;
		}
	}

	async function handleSubmitJob() {
		if (!idToken) {
			error = 'Not authenticated';
			return;
		}

		// Clean up previous WebSocket connection if exists
		if (wsClient) {
			wsClient.disconnect();
			wsClient = null;
			isSubscribed = false;
		}

		// Reset state
		error = null;
		result = null;
		jobUpdates = [];

		loading = true;
		try {
			result = await submitJob(jobInput, idToken);
			console.log('Job submitted successfully:', result);

			// Subscribe to job updates
			if (result?.id) {
				await subscribeToJobUpdates(result.id, idToken);
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to submit job';
		} finally {
			loading = false;
		}
	}

	onDestroy(() => {
		// Clean up WebSocket connection
		if (wsClient) {
			wsClient.disconnect();
			wsClient = null;
		}
		isSubscribed = false;
	});
</script>

<div class="space-y-6">
	<!-- Submit Button -->
	{#if !result && !loading}
		<div>
			<button
				onclick={handleSubmitJob}
				class="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
			>
				Submit Job
			</button>
			<p class="mt-2 text-sm text-gray-600">
				Click to submit a job that extracts project details from a document
			</p>
		</div>
	{/if}

	<!-- Loading State -->
	{#if loading}
		<div class="rounded-lg bg-blue-50 p-4 text-blue-700">
			<p class="font-semibold">Submitting job...</p>
		</div>
	{/if}

	<!-- Error State -->
	{#if error}
		<div class="rounded-lg bg-red-50 p-4 text-red-700">
			<p class="font-semibold">Error:</p>
			<p>{error}</p>
		</div>
	{/if}

	<!-- Success State -->
	{#if result}
		<div class="rounded-lg bg-green-50 p-4 text-green-700">
			<div class="flex items-start justify-between">
				<div>
					<p class="mb-2 font-semibold">Job submitted successfully!</p>
					<p><strong>Job ID:</strong> {result.id}</p>
					<p><strong>Initial Status:</strong> {result.status}</p>
				</div>
				<button
					onclick={handleSubmitJob}
					disabled={loading}
					class="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-green-800 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Submit Another Job
				</button>
			</div>
		</div>

		<!-- Job Updates Section -->
		<div>
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-2xl font-semibold">Job Updates ({jobUpdates.length})</h2>
				{#if isSubscribed}
					<div class="flex items-center gap-2 text-sm text-green-600">
						<span class="relative flex h-3 w-3">
							<span
								class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"
							></span>
							<span class="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
						</span>
						<span>Listening for updates</span>
					</div>
				{/if}
			</div>

			{#if jobUpdates.length === 0}
				<div class="rounded-lg bg-gray-50 p-4 text-gray-600">
					<p>Waiting for updates...</p>
					{#if isSubscribed}
						<p class="mt-2 text-sm">The subscription is active and listening for changes.</p>
					{:else}
						<p class="mt-2 text-sm">Connecting to subscription...</p>
					{/if}
				</div>
			{:else}
				<div class="space-y-4">
					{#each jobUpdates as update, index (update.id + update.updatedAt)}
						<div
							class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
						>
							<div class="mb-2 flex items-center justify-between">
								<span
									class="inline-block rounded-full px-3 py-1 text-sm font-semibold"
									class:bg-yellow-100={update.status === 'PENDING'}
									class:text-yellow-800={update.status === 'PENDING'}
									class:bg-blue-100={update.status === 'PROCESSING' || update.status === 'IN_PROGRESS'}
									class:text-blue-800={update.status === 'PROCESSING' || update.status === 'IN_PROGRESS'}
									class:bg-green-100={update.status === 'COMPLETED' || update.status === 'COMPLETE'}
									class:text-green-800={update.status === 'COMPLETED' || update.status === 'COMPLETE'}
									class:bg-red-100={update.status === 'FAILED' || update.status === 'ERROR'}
									class:text-red-800={update.status === 'FAILED' || update.status === 'ERROR'}
								>
									{update.status}
								</span>
								<span class="text-sm text-gray-500">
									{new Date(update.updatedAt).toLocaleString()}
								</span>
							</div>

							<div class="space-y-2 text-sm">
								<div>
									<strong>Job ID:</strong>
									<span class="font-mono text-xs">{update.id}</span>
								</div>

								{#if update.result}
									{@const parsedResult = (() => {
										try {
											return JSON.parse(update.result);
										} catch {
											return null;
										}
									})()}

									{#if parsedResult?.output_parsed}
										<div class="mt-2 rounded border border-green-200 bg-green-50 p-3">
											<strong class="text-green-900">Extracted Data:</strong>
											<div class="mt-2 space-y-1">
												{#each Object.entries(parsedResult.output_parsed) as [key, value]}
													<div class="text-xs">
														<span class="font-semibold">{key}:</span>
														<span class="text-gray-700">{value}</span>
													</div>
												{/each}
											</div>
										</div>
									{/if}

									<details class="mt-2">
										<summary class="cursor-pointer text-xs text-gray-600 hover:text-gray-900"
											>View Full Result JSON</summary
										>
										<pre
											class="mt-1 max-h-96 overflow-auto rounded bg-gray-50 p-2 text-xs">{JSON.stringify(
												parsedResult,
												null,
												2
											)}</pre>
									</details>
								{/if}

								<div class="text-xs text-gray-400">
									<div><strong>Created:</strong> {new Date(update.createdAt).toLocaleString()}</div>
									<div><strong>Updated:</strong> {new Date(update.updatedAt).toLocaleString()}</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
