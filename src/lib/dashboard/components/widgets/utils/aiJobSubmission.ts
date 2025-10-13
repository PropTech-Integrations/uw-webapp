import type { ParagraphWidget } from '$lib/dashboard/types/widget';
import { createJobSubmissionClientWithAppSync } from '$lib/dashboard/lib/JobManager';
import type { JobUpdate } from '$lib/dashboard/lib/JobManager';
import { paragraphTitleQuery } from '$lib/dashboard/types/OpenAIQueryDefs';
import { mapStore } from '$lib/stores/mapObjectStore';

/**
 * Advanced example of AI job submission with custom configuration
 * Creates a job submission client and submits a paragraph generation job
 * 
 * @param idToken - User's authentication token
 * @returns Promise with job submission result
 */
export async function submitParagraphGenerationJob(idToken: string) {
	let contentProducer = mapStore.registerProducer<ParagraphWidget['data']>(
		'paragraph-content',
		'content-generator-agent'
	);

	const timestamp = new Date().toLocaleTimeString();

	// Create a client with custom configuration (async)
	const client = await createJobSubmissionClientWithAppSync({
		config: {
			maxRetries: 5,
			retryDelay: 2000,
			reconnectBackoffMultiplier: 2,
			maxReconnectDelay: 60000,
			subscriptionTimeout: 300000 // 5 minutes
		},
		callbacks: {
			onJobComplete: (update: JobUpdate) => {
				console.log('✅ Job completed successfully:', update);
				const result = JSON.parse(update.result as string);
				const data: ParagraphWidget['data'] = {
					title: result.output_parsed.title,
					content: result.output_parsed.markdown
						? result.output_parsed.content
						: `${result.output_parsed.content}\n\nLast updated: ${timestamp}`,
					markdown: result.output_parsed.markdown
				};
				console.log(`🤖 AI Agent generated new content: "${result.output_parsed.title}"`);
				contentProducer.publish(data);
				// Handle completion (e.g., show notification, update UI)
			},
			onJobError: (error: Error) => {
				console.error('❌ Job failed:', error);
				// Handle error (e.g., show error message, retry)
			},
			onStatusUpdate: (update: JobUpdate) => {
				console.log('📊 Status update:', update.status);
				// Track progress (e.g., update progress bar)
			},
			onConnectionStateChange: (state) => {
				console.log('🔌 Connection state:', state);
				// Handle connection changes (e.g., show connection indicator)
			}
		}
	});

	// Submit a job
	const result = await client.submitJob(
		paragraphTitleQuery('Write a paragraph about the economy of Santa Rosa, CA'),
		idToken
	);

	return result;
}

