# JobManager - AppSync WebSocket Integration

A TypeScript library for submitting and monitoring jobs with real-time updates via AWS AppSync WebSocket.

## Architecture Overview

The JobManager provides a clean abstraction layer for job submission and monitoring, integrating seamlessly with your existing AppSync infrastructure:

```
┌─────────────────────────────────────────────────────────────┐
│                     JobManager (Client)                      │
│  - Job submission with retry logic                           │
│  - Real-time job monitoring                                  │
│  - Connection state management                               │
│  - Automatic reconnection with exponential backoff           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              AppSync Infrastructure Layer                    │
│                                                              │
│  ┌─────────────────┐  ┌──────────────────┐                 │
│  │ appSyncClient   │  │  jobUpdateStore  │                 │
│  │ Store           │  │                  │                 │
│  │ - Connection    │  │ - Job state      │                 │
│  │ - Subscriptions │  │ - Updates        │                 │
│  └─────────────────┘  └──────────────────┘                 │
│           │                     │                            │
│           ▼                     ▼                            │
│  ┌─────────────────┐  ┌──────────────────┐                 │
│  │ AppSyncWsClient │  │  GraphQL (gql)   │                 │
│  │ - WebSocket     │  │  - Mutations     │                 │
│  │ - Protocol      │  │  - Queries       │                 │
│  └─────────────────┘  └──────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    AWS AppSync Backend                       │
│  - GraphQL API                                               │
│  - WebSocket subscriptions                                   │
│  - Job processing                                            │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

- ✅ **Seamless AppSync Integration**: Uses your existing AppSync WebSocket infrastructure
- ✅ **Automatic Retries**: Configurable retry logic for both job submission and connection failures
- ✅ **Real-time Updates**: Subscribe to job state changes and status updates via WebSocket
- ✅ **Connection Management**: Automatic reconnection with exponential backoff
- ✅ **Type Safety**: Full TypeScript support with comprehensive type definitions
- ✅ **Reactive State**: Integrates with Svelte stores for reactive UI updates
- ✅ **Error Handling**: Robust error handling with detailed error codes
- ✅ **Resource Cleanup**: Automatic cleanup of subscriptions and connections

## Installation & Setup

The JobManager is integrated into your application and requires no additional installation. It uses the following existing modules:

- `$lib/realtime/graphql/requestHandler` - GraphQL query/mutation handler
- `$lib/stores/appSyncClientStore` - Shared AppSync WebSocket client
- `$lib/stores/jobUpdateStore` - Job state and updates store
- `$lib/realtime/graphql/subscriptions/Job` - Job update subscription

## Quick Start

### Basic Usage

```typescript
import { createJobSubmissionClientWithAppSync, PRIORITY_LEVELS } from '$lib/dashboard/lib/JobManager';

// Create a client instance
const client = createJobSubmissionClientWithAppSync();

// Submit a job
const result = await client.submitJob(
  {
    request: 'Process this data',
    priority: PRIORITY_LEVELS.HIGH
  },
  idToken // Your Cognito ID token
);

console.log('Job submitted:', result.id);

// Subscribe to job updates
const updatesStore = client.subscribeToJobUpdates(result.id);
updatesStore.subscribe((updates) => {
  console.log('Latest update:', updates[0]);
});
```

### With Configuration and Callbacks

```typescript
const client = createJobSubmissionClientWithAppSync({
  config: {
    maxRetries: 3,
    retryDelay: 1000,
    reconnectBackoffMultiplier: 2,
    maxReconnectDelay: 30000,
    subscriptionTimeout: 300000 // 5 minutes
  },
  callbacks: {
    onJobComplete: (update) => {
      console.log('Job completed!', update);
    },
    onJobError: (error) => {
      console.error('Job failed:', error);
    },
    onStatusUpdate: (update) => {
      console.log('Status:', update.status);
    },
    onConnectionStateChange: (state) => {
      console.log('Connection:', state);
    }
  }
});
```

## API Reference

### Factory Functions

#### `createJobSubmissionClientWithAppSync(options?)`

Creates a JobSubmissionClient with AppSync WebSocket dependencies pre-configured.

**Parameters:**
- `options.config` (optional): Configuration object
  - `maxRetries`: Maximum retry attempts (default: 3)
  - `retryDelay`: Initial retry delay in ms (default: 1000)
  - `reconnectBackoffMultiplier`: Backoff multiplier (default: 2)
  - `maxReconnectDelay`: Maximum delay between retries in ms (default: 30000)
  - `subscriptionTimeout`: Subscription timeout in ms (default: 300000)

- `options.callbacks` (optional): Event callbacks
  - `onJobComplete`: Called when job reaches terminal success state
  - `onJobError`: Called when job fails or errors occur
  - `onStatusUpdate`: Called on every job status update
  - `onConnectionStateChange`: Called when WebSocket connection state changes

**Returns:** `JobSubmissionClient` instance

### JobSubmissionClient Methods

#### `submitJob(input, idToken)`

Submits a job and sets up real-time monitoring.

**Parameters:**
- `input.request`: The job request string
- `input.priority`: Job priority ('HIGH' | 'MEDIUM' | 'LOW')
- `idToken`: Cognito ID token for authentication

**Returns:** `Promise<SubmitJobResponse>`

**Throws:** `JobSubmissionError` with error codes:
- `AUTH_REQUIRED`: Missing authentication token
- `INVALID_INPUT`: Invalid job request
- `SUBMISSION_FAILED`: Job submission failed after retries
- `UNKNOWN_ERROR`: Unexpected error

#### `subscribeToJobState(jobId)`

Subscribe to job state changes (result, error, loading, connection state).

**Returns:** Svelte `Readable<JobState>`

#### `subscribeToJobUpdates(jobId)`

Subscribe to job status updates.

**Returns:** Svelte `Readable<JobUpdate[]>`

#### `getJobState(jobId)`

Get the current state of a job synchronously.

**Returns:** `JobState | undefined`

#### `getJobUpdates(jobId)`

Get all updates for a job synchronously.

**Returns:** `JobUpdate[]`

#### `cleanup()`

Clean up all resources (subscriptions, timers, connections).

**Returns:** `Promise<void>`

### Types

#### JobStatus
```typescript
type JobStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'COMPLETE'
  | 'FAILED'
  | 'ERROR';
```

#### Priority
```typescript
type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
```

#### ConnectionState
```typescript
type ConnectionState = 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';
```

#### JobState
```typescript
interface JobState {
  readonly result: SubmitJobResponse | null;
  readonly error: Error | null;
  readonly loading: boolean;
  readonly connectionState: ConnectionState;
  readonly reconnectAttempts: number;
}
```

#### JobUpdate
```typescript
interface JobUpdate {
  readonly id: string;
  readonly status: string;
  readonly result?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
```

## Usage Patterns

### Svelte Component Integration

```svelte
<script lang="ts">
  import { onDestroy } from 'svelte';
  import { 
    createJobSubmissionClientWithAppSync, 
    PRIORITY_LEVELS 
  } from '$lib/dashboard/lib/JobManager';
  
  let idToken = $state('your-token');
  let jobState = $state(null);
  let jobUpdates = $state([]);
  
  const client = createJobSubmissionClientWithAppSync({
    callbacks: {
      onJobComplete: (update) => {
        console.log('Completed!', update);
      }
    }
  });
  
  async function submit() {
    const result = await client.submitJob(
      { request: 'My request', priority: PRIORITY_LEVELS.HIGH },
      idToken
    );
    
    // Subscribe to reactive updates
    client.subscribeToJobState(result.id).subscribe(state => {
      jobState = state;
    });
    
    client.subscribeToJobUpdates(result.id).subscribe(updates => {
      jobUpdates = updates;
    });
  }
  
  onDestroy(() => {
    client.cleanup();
  });
</script>

<button onclick={submit}>Submit Job</button>

{#if jobState}
  <div>Status: {jobState.result?.status}</div>
  <div>Connection: {jobState.connectionState}</div>
{/if}

{#each jobUpdates as update}
  <div>{update.status} at {update.updatedAt}</div>
{/each}
```

### Singleton Pattern

For app-wide job management, create a singleton instance:

```typescript
// jobClient.ts
let client = null;

export function getJobClient() {
  if (!client) {
    client = createJobSubmissionClientWithAppSync({
      callbacks: {
        onJobComplete: (update) => {
          // Global notification
          showNotification(`Job ${update.id} completed`);
        }
      }
    });
  }
  return client;
}
```

### Queue Management

```typescript
class JobQueue {
  private client = createJobSubmissionClientWithAppSync();
  private jobs = new Map();
  
  async submit(request: string, idToken: string) {
    const result = await this.client.submitJob(
      { request, priority: PRIORITY_LEVELS.MEDIUM },
      idToken
    );
    
    this.jobs.set(result.id, { status: 'pending' });
    
    // Track completion
    this.client.subscribeToJobUpdates(result.id).subscribe(updates => {
      const latest = updates[0];
      if (latest) {
        this.jobs.set(result.id, { status: latest.status });
      }
    });
    
    return result;
  }
  
  getStatus(jobId: string) {
    return this.jobs.get(jobId);
  }
}
```

## WebSocket Connection Details

### Connection Lifecycle

1. **Job Submission**: Job is submitted via GraphQL mutation over HTTPS
2. **Connection Setup**: WebSocket connection is established (or reused if already connected)
3. **Subscription**: Subscribe to job updates for the specific job ID
4. **Real-time Updates**: Receive status updates as job progresses
5. **Completion**: Subscription is cleaned up when job reaches terminal state
6. **Cleanup**: Resources are released

### Connection Reuse

The JobManager leverages the singleton AppSyncWsClient from `appSyncClientStore`, which means:

- **Single WebSocket**: All JobManager instances share the same WebSocket connection
- **Efficient**: No duplicate connections or authentication overhead
- **Automatic Management**: Connection is maintained across component lifecycles
- **Token Handling**: Automatically reconnects if authentication token changes

### Reconnection Strategy

The JobManager implements exponential backoff for reconnection:

1. Initial retry after `retryDelay` ms (default: 1000ms)
2. Each subsequent retry doubles the delay (configurable via `reconnectBackoffMultiplier`)
3. Maximum delay capped at `maxReconnectDelay` ms (default: 30000ms)
4. Stops after `maxRetries` attempts (default: 3)

Example delay sequence with defaults:
- Attempt 1: 1000ms
- Attempt 2: 2000ms
- Attempt 3: 4000ms

## Error Handling

### Error Types

#### JobSubmissionError
Thrown during job submission failures.

```typescript
try {
  await client.submitJob(input, token);
} catch (error) {
  if (error.code === 'AUTH_REQUIRED') {
    // Refresh token
  } else if (error.code === 'INVALID_INPUT') {
    // Show validation error
  }
}
```

#### WebSocketError
Thrown during WebSocket connection/subscription failures.

Properties:
- `message`: Error description
- `code`: Error code
- `shouldRetry`: Whether the error is retryable

### Best Practices

1. **Always handle errors**: Use try-catch for `submitJob()`
2. **Implement callbacks**: Use `onJobError` for user feedback
3. **Cleanup on unmount**: Call `cleanup()` in component destroy hooks
4. **Validate tokens**: Check token expiration before submission
5. **Monitor connection state**: React to `connectionState` changes in UI

## Performance Considerations

- **Shared Connection**: Single WebSocket connection is shared app-wide
- **Subscription Cleanup**: Subscriptions are automatically cleaned up on job completion
- **Memory Management**: Old job data should be cleaned from stores periodically
- **Throttling**: Consider rate-limiting job submissions in high-frequency scenarios

## Troubleshooting

### Job not receiving updates

1. Check WebSocket connection state: `jobState.connectionState`
2. Verify authentication token is valid
3. Check browser console for WebSocket errors
4. Ensure AppSync subscription is properly configured in backend

### Connection keeps dropping

1. Check network stability
2. Verify token hasn't expired (AppSync closes connection on invalid token)
3. Increase `subscriptionTimeout` if jobs take longer
4. Check AppSync connection timeout settings in backend

### Job submission fails

1. Verify authentication token is valid
2. Check GraphQL mutation permissions
3. Validate job input format
4. Check backend logs for errors

## Migration Guide

If you're currently using direct AppSync calls (like in `JobSubmission.svelte`), here's how to migrate:

### Before
```typescript
// Manual setup
const subscription = { query: S_JOB_UPDATE, variables: { id: jobId }, ... };
await ensureConnection(idToken);
await addSubscription(idToken, subscription);
// ... manual cleanup
```

### After
```typescript
const client = createJobSubmissionClientWithAppSync();
const result = await client.submitJob(input, idToken);
// Automatic connection, subscription, and cleanup management
```

Benefits:
- ✅ 80% less boilerplate code
- ✅ Automatic error handling and retries
- ✅ Built-in reconnection logic
- ✅ Consistent state management
- ✅ Easy-to-use callbacks

## Examples

See `JobManager.example.ts` for comprehensive usage examples including:
- Basic usage
- Advanced configuration
- Svelte component integration
- Multiple job management
- Error handling patterns
- Singleton pattern

## Contributing

When modifying JobManager:

1. Maintain backward compatibility
2. Update this README
3. Add examples to `JobManager.example.ts`
4. Ensure all linter rules pass
5. Test with real AppSync backend

## License

Internal use - StratiqAI

