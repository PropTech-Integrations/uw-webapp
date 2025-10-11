# WebSocket Client Refactoring

## Overview
Refactored the `JobSubmission` component to use a shared singleton `AppSyncWsClient` instance instead of each component creating its own WebSocket connection.

## Problem
Previously, each `JobSubmission` component instance created its own `AppSyncWsClient`, resulting in:
- Multiple WebSocket connections to the same AppSync endpoint
- Inefficient resource usage
- Potential connection limit issues
- Unnecessary overhead when multiple job subscriptions are active

## Solution
Created a centralized `appSyncClientStore` that provides a singleton `AppSyncWsClient` instance shared across all components.

## Changes Made

### 1. New File: `src/lib/stores/appSyncClientStore.ts`
A new store module that manages the shared WebSocket client:

**Key Functions:**
- `getAppSyncClient()` - Returns the current client instance (or null)
- `ensureConnection(idToken)` - Establishes or reuses a connection with the given auth token
- `addSubscription(idToken, spec)` - Adds a subscription to the shared client
- `removeSubscription(spec)` - Removes a subscription from the shared client
- `disconnectClient()` - Disconnects the shared client (e.g., on logout)
- `getConnectionState()` - Returns current connection status

**Features:**
- Singleton pattern ensures only one WebSocket connection
- Automatic token management - reconnects if token changes
- Thread-safe connection establishment with promise-based queuing
- Clean lifecycle management

### 2. Updated: `src/lib/components/AI/JobSubmission.svelte`

**Removed:**
- Local `wsClient` from `NetworkState`
- Direct instantiation of `AppSyncWsClient`
- Import of `AppSyncWsClient` class
- Import of `PUBLIC_GRAPHQL_HTTP_ENDPOINT`

**Added:**
- Import of shared client functions: `ensureConnection`, `addSubscription`, `removeSubscription`
- Import of `SubscriptionSpec` type
- `currentSubscription` field in `NetworkState` to track active subscription

**Modified:**
- `setupSubscription()` - Now uses `ensureConnection()` and `addSubscription()` instead of creating new client
- `cleanupWebSocket()` - Now calls `removeSubscription()` instead of disconnecting the client
- Subscription select function return type changed from `null` to `undefined` for type safety

## Benefits

### Performance
- **Single WebSocket Connection**: All job subscriptions share one connection
- **Reduced Network Overhead**: No duplicate handshakes or keep-alive messages
- **Lower Memory Usage**: One client instance vs. multiple

### Reliability
- **Centralized Connection Management**: Easier to monitor and debug
- **Automatic Token Handling**: Seamlessly reconnects when auth token changes
- **Better Connection Pooling**: No risk of hitting connection limits

### Code Quality
- **Separation of Concerns**: Connection management is separate from component logic
- **Reusability**: Other components can easily use the same client
- **Testability**: Easier to mock and test the shared client

## Usage Example

### In Components:
```typescript
import { ensureConnection, addSubscription, removeSubscription } from '$lib/stores/appSyncClientStore';
import type { SubscriptionSpec } from '$lib/realtime/websocket/types';

// Define subscription
const subscription: SubscriptionSpec<MyDataType> = {
  query: MY_SUBSCRIPTION_QUERY,
  variables: { id: myId },
  select: (payload) => payload.data,
  next: (data) => handleData(data),
  error: (err) => handleError(err)
};

// Add subscription
await ensureConnection(idToken);
await addSubscription(idToken, subscription);

// Later, remove subscription
removeSubscription(subscription);
```

### On Logout:
```typescript
import { disconnectClient } from '$lib/stores/appSyncClientStore';

function logout() {
  disconnectClient();
  // ... other logout logic
}
```

## Real-World Impact

In the `/ai` route, there are **3 simultaneous JobSubmission components**:
- Project Details extractor
- Broker Details extractor  
- Two Sentence Summary generator

**Before Refactoring:**
- 3 separate WebSocket connections
- 3 connection handshakes
- 3 keep-alive timers
- Higher latency and resource usage

**After Refactoring:**
- 1 shared WebSocket connection
- 1 connection handshake
- 1 keep-alive timer
- Lower latency and resource usage
- All 3 jobs receive updates through the same connection

## Testing Recommendations

1. **Single Component**: Test with one JobSubmission to ensure basic functionality
2. **Multiple Components**: Test with multiple JobSubmissions on the same page (like `/ai` route)
3. **Token Changes**: Test reconnection behavior when auth token is refreshed
4. **Component Lifecycle**: Ensure subscriptions are properly cleaned up on unmount
5. **Error Handling**: Verify error recovery and reconnection logic
6. **Concurrent Jobs**: Submit multiple jobs simultaneously and verify all receive updates
7. **Network Issues**: Test behavior during connection drops and recovery

## Migration Guide

For other components using `AppSyncWsClient`:

1. Remove direct `AppSyncWsClient` instantiation
2. Import functions from `appSyncClientStore`
3. Use `ensureConnection()` before subscribing
4. Use `addSubscription()` / `removeSubscription()` for subscription management
5. Call `removeSubscription()` in cleanup/onDestroy hooks
6. Consider calling `disconnectClient()` on logout

## Future Improvements

- Add connection state monitoring (connected/disconnected/error) as a Svelte store
- Implement automatic retry logic in the store
- Add metrics/telemetry for connection health
- Create a debug panel showing active subscriptions
- Add support for subscription priority/QoS

