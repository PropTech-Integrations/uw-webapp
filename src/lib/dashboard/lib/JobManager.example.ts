/**
 * JobManager Usage Examples
 * 
 * This file demonstrates how to use the JobManager with AppSync WebSocket integration.
 */

import {
  createJobSubmissionClientWithAppSync,
  type JobUpdate,
  type JobCallbacks,
  PRIORITY_LEVELS,
  JOB_STATUSES
} from './JobManager';

// ===== Example 1: Basic Usage =====

export async function basicExample(idToken: string) {
  // Create a client with default configuration (async)
  const client = await createJobSubmissionClientWithAppSync();

  // Submit a job
  const result = await client.submitJob(
    {
      request: 'Process this data',
      priority: PRIORITY_LEVELS.HIGH
    },
    idToken
  );

  console.log('Job submitted:', result);
  
  // Subscribe to job state changes
  const stateStore = client.subscribeToJobState(result.id);
  stateStore.subscribe((state) => {
    console.log('Job state:', state);
  });

  // Subscribe to job updates
  const updatesStore = client.subscribeToJobUpdates(result.id);
  updatesStore.subscribe((updates) => {
    console.log('Job updates:', updates);
  });

  return result;
}

// ===== Example 2: With Custom Configuration and Callbacks =====

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
    {
      request: 'Complex processing task',
      priority: PRIORITY_LEVELS.MEDIUM
    },
    idToken
  );

  return result;
}

// ===== Example 3: Svelte Component Integration =====

/**
 * Example of using JobManager in a Svelte component
 * 
 * ```svelte
 * <script lang="ts">
 *   import { onMount, onDestroy } from 'svelte';
 *   import { createJobSubmissionClientWithAppSync, PRIORITY_LEVELS } from '$lib/dashboard/lib/JobManager';
 *   
 *   let idToken = $state('your-cognito-id-token');
 *   let jobId = $state<string | null>(null);
 *   let jobState = $state<any>(null);
 *   let jobUpdates = $state<any[]>([]);
 *   let client = $state<any>(null);
 *   
 *   // Create client instance on mount
 *   onMount(async () => {
 *     client = await createJobSubmissionClientWithAppSync({
 *       callbacks: {
 *         onJobComplete: (update) => {
 *           console.log('Job completed!', update);
 *         },
 *         onJobError: (error) => {
 *           console.error('Job error:', error);
 *         }
 *       }
 *     });
 *   });
 *   
 *   async function submitJob(request: string) {
 *     if (!client) {
 *       console.error('Client not initialized');
 *       return;
 *     }
 *     
 *     try {
 *       const result = await client.submitJob(
 *         { request, priority: PRIORITY_LEVELS.HIGH },
 *         idToken
 *       );
 *       
 *       jobId = result.id;
 *       
 *       // Subscribe to updates
 *       const stateStore = client.subscribeToJobState(result.id);
 *       stateStore.subscribe(state => { jobState = state; });
 *       
 *       const updatesStore = client.subscribeToJobUpdates(result.id);
 *       updatesStore.subscribe(updates => { jobUpdates = updates; });
 *       
 *     } catch (error) {
 *       console.error('Failed to submit job:', error);
 *     }
 *   }
 *   
 *   onDestroy(() => {
 *     client?.cleanup();
 *   });
 * </script>
 * 
 * <button onclick={() => submitJob('My request')}>Submit Job</button>
 * 
 * {#if jobState}
 *   <div>Status: {jobState.result?.status}</div>
 *   <div>Connection: {jobState.connectionState}</div>
 *   <div>Loading: {jobState.loading}</div>
 * {/if}
 * 
 * {#each jobUpdates as update}
 *   <div>{update.status} - {update.updatedAt}</div>
 * {/each}
 * ```
 */

// ===== Example 4: Multiple Job Management =====

export class JobQueue {
  private client: Awaited<ReturnType<typeof createJobSubmissionClientWithAppSync>> | null = null;
  private activeJobs = new Set<string>();

  async initialize() {
    if (!this.client) {
      this.client = await createJobSubmissionClientWithAppSync({
        callbacks: {
          onJobComplete: (update) => {
            console.log(`Job ${update.id} completed`);
          }
        }
      });
    }
  }

  async submitMultipleJobs(requests: string[], idToken: string) {
    await this.initialize();
    const results = await Promise.allSettled(
      requests.map(request =>
        this.submitAndTrack(request, idToken)
      )
    );
    
    return results;
  }

  private async submitAndTrack(request: string, idToken: string) {
    if (!this.client) throw new Error('Client not initialized');
    
    const result = await this.client.submitJob(
      { request, priority: PRIORITY_LEVELS.MEDIUM },
      idToken
    );
    
    this.activeJobs.add(result.id);
    
    // Track job completion
    const updatesStore = this.client.subscribeToJobUpdates(result.id);
    updatesStore.subscribe(updates => {
      const latest = updates[0];
      if (latest && [JOB_STATUSES.COMPLETED, JOB_STATUSES.COMPLETE, JOB_STATUSES.FAILED, JOB_STATUSES.ERROR].includes(latest.status as any)) {
        this.activeJobs.delete(result.id);
      }
    });
    
    return result;
  }

  getActiveJobCount(): number {
    return this.activeJobs.size;
  }

  async cleanup() {
    if (this.client) {
      await this.client.cleanup();
    }
    this.activeJobs.clear();
  }
}

// ===== Example 5: Error Handling Patterns =====

export async function errorHandlingExample(idToken: string) {
  const client = await createJobSubmissionClientWithAppSync({
    config: {
      maxRetries: 3
    }
  });

  try {
    const result = await client.submitJob(
      { request: 'My request', priority: PRIORITY_LEVELS.HIGH },
      idToken
    );
    
    // Success - job is now being processed
    return { success: true, jobId: result.id };
    
  } catch (error: any) {
    // Handle different error types
    if (error.code === 'AUTH_REQUIRED') {
      console.error('Authentication failed - token may be expired');
      // Redirect to login or refresh token
    } else if (error.code === 'INVALID_INPUT') {
      console.error('Invalid request format');
      // Show validation error to user
    } else if (error.code === 'SUBMISSION_FAILED') {
      console.error('Failed to submit job after retries');
      // Show error and allow user to retry
    } else {
      console.error('Unexpected error:', error);
    }
    
    return { success: false, error: error.message };
  }
}

// ===== Example 6: Singleton Pattern for App-Wide Usage =====

let globalClient: Awaited<ReturnType<typeof createJobSubmissionClientWithAppSync>> | null = null;

export async function getGlobalJobClient() {
  if (!globalClient) {
    globalClient = await createJobSubmissionClientWithAppSync({
      callbacks: {
        onJobComplete: (update) => {
          // Global notification system
          console.log('Global: Job completed', update.id);
        },
        onJobError: (error) => {
          // Global error handler
          console.error('Global: Job error', error);
        }
      }
    });
  }
  return globalClient;
}

export async function cleanupGlobalClient() {
  if (globalClient) {
    await globalClient.cleanup();
    globalClient = null;
  }
}

