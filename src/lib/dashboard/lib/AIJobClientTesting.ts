import {
	createJobSubmissionClientWithAppSync,
	type JobUpdate,
	type JobCallbacks,
	PRIORITY_LEVELS,
	JOB_STATUSES
} from './JobManager';

import { paragraphTitleQuery } from '../types/OpenAIQueryDefs';

export async function advancedExample(idToken: string) {
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

const ret = advancedExample(
	'eyJraWQiOiJtQVFUZ0t3TUtWNUhIWHpCZEREa09aSE55NzN2QzhEcWdOTmdqMFVsN3hVPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiM0ZCN1VES2pmMUg5UTNNNUJNeGJOUSIsInN1YiI6IjQ4ZjFiM2UwLWUwMzEtNzA0Ni1mMWM3LWRjYmFlYzEzMTQxYSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtd2VzdC0yLmFtYXpvbmF3cy5jb21cL3VzLXdlc3QtMl81YW9lSWNmdjciLCJjb2duaXRvOnVzZXJuYW1lIjoiNDhmMWIzZTAtZTAzMS03MDQ2LWYxYzctZGNiYWVjMTMxNDFhIiwiZ2l2ZW5fbmFtZSI6IkRhbmllbCIsIm9yaWdpbl9qdGkiOiIzNmU4NjEyZC1hMGRmLTQ2YzgtYTMzZC01ZTVjZmM0NWZkZTYiLCJhdWQiOiI0M3U1YW9rbjNxbmVwNHM4YXNxNTlvMzZwMCIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzYwMzExOTcxLCJwaG9uZV9udW1iZXIiOiIrMTUwMzU5MjAwODQiLCJleHAiOjE3NjAzOTgzNzEsImlhdCI6MTc2MDMxMTk3MSwiZmFtaWx5X25hbWUiOiJIb2xtbHVuZCIsImp0aSI6IjdmZDc5ZDlhLWYzN2YtNDZiNC04ZWFjLTU2ZWRjOTM5YWRmOCIsImVtYWlsIjoiYWduYXRoYW5AZ21haWwuY29tIn0.W9soFIINyPtDmM1rBEUctElR0FyRqMhY3TarW31u-dyTxaQ6Xk6GUxUJ_t787_NHDl5Y6wWXsgr8DH_CEJUrtJJDvk29z0mJMKtYIzcTdgkRP1lbZ8AlumrX9J6r3XAQO4ny0lAbGneq7bsBPOFDRZDE7cVerkDN-9xbo6TOud0m7Em7hhvpIkSBPpfoRM_7yIZOAeEeysWDJ1ONCn9GbO2LezAg07TI7aJ4G-YljQ-2eOD6JDK3ZRnJ8fQQr0SNtlgZqtEPSKjdmklr3kOMmLBuFefPhdDsUqo9xs2YhxbMS4i5kPKdgWfTtg9PLkT9VoSCspXB9r2nVzIE4YBmIg'
);
console.log(ret);
