# AI Job as Producer - Complete Guide

## Overview

This guide shows how to create an AI Job that acts as a producer for widget content. The bridge system automatically handles producer creation, validation, and publishing.

## Quick Start

### 1. Use the Example Component

```typescript
// In your page/route
import AIJobParagraphExample from '$lib/dashboard/examples/AIJobParagraphExample.svelte';

<AIJobParagraphExample 
  idToken={userToken}
  prompt="Your custom prompt here"
  widgetId="my-widget"
/>
```

### 2. Or Build Your Own

Follow these steps to create your own AI job producer:

---

## Step-by-Step Implementation

### Step 1: Get OpenAI Text Format with Widget Schema

```typescript
import { getWidgetTextFormat } from '$lib/dashboard/types/widgetSchemas';

// This converts the Zod schema to OpenAI's text format (recommended approach)
const textFormat = getWidgetTextFormat('paragraph', 'ParagraphContent');
```

**What this does:**
- Uses `zodTextFormat` from OpenAI SDK (official recommendation)
- Converts `ParagraphWidgetDataSchema` to OpenAI text format
- Ensures AI responses match the widget's expected data structure
- Reduces parsing errors
- Sets `strict: true` automatically for reliable outputs

---

### Step 2: Create Job Input with Text Format

```typescript
const jobInput = {
  request: JSON.stringify({
    model: 'gpt-4o-mini',
    input: [
      { 
        role: 'system', 
        content: 'Write a clear paragraph with a title' 
      },
      { 
        role: 'user', 
        content: 'Summarize the latest AI news' 
      }
    ],
    text: {
      format: textFormat  // ← Use text format for structured output
    }
  }),
  priority: 'HIGH' as const
};
```

**Important:**
- Use `text: { format: textFormat }` (not `response_format`)
- This is the official OpenAI approach for structured outputs
- Include `model` field (e.g., `'gpt-4o-mini'`)
- Use message format with `input: [{ role, content }]`

---

### Step 3: Set Initial Widget Data

```typescript
import type { ParagraphWidgetData } from '$lib/dashboard/types/widgetSchemas';

const initialData: ParagraphWidgetData = {
  title: 'AI Generated Content',
  content: 'Waiting for AI response...',
  markdown: false
};
```

---

### Step 4: Create Job Completion Handler (Producer Created Here!)

```typescript
import { createJobWidgetBridge } from '$lib/dashboard/types/widgetBridge';
import { WidgetChannels } from '$lib/dashboard/types/widgetSchemas';

let bridge: JobWidgetBridge | null = null;

function handleJobComplete(update: any) {
  // This creates the producer automatically!
  bridge = createJobWidgetBridge({
    jobId: update.id,
    channel: WidgetChannels.paragraphContent,
    
    // Optional: Transform the result
    transformer: (result: string) => {
      const parsed = JSON.parse(result);
      return {
        title: parsed.title || 'AI Response',
        content: parsed.content || result,
        markdown: false
      };
    },
    
    // Optional: Filter which updates to process
    filter: (update) => {
      return update.status === 'COMPLETED' && update.result !== null;
    }
  });
  
  console.log('✅ Producer created automatically!');
  console.log('   Producer ID: job-' + update.id + '-to-paragraph-content');
  console.log('   Channel: paragraph-content');
}
```

**What the bridge does:**
1. ✅ Creates a `ValidatedPublisher` for the channel
2. ✅ Registers producer with ID: `job-{jobId}-to-{channelId}`
3. ✅ Subscribes to job updates from `jobUpdateStore`
4. ✅ Transforms job result with your transformer
5. ✅ Validates result against `ParagraphWidgetDataSchema`
6. ✅ Publishes to `mapObjectStore`
7. ✅ Handles cleanup when disconnected

---

### Step 5: Add JobSubmission Component

```svelte
<script>
import JobSubmission from '$lib/components/AI/JobSubmission.svelte';

// ... state and handlers from above
</script>

<JobSubmission
  {idToken}
  {jobInput}
  onJobComplete={handleJobComplete}
  onJobError={(error) => console.error('Job error:', error)}
/>
```

---

### Step 6: Add ParagraphWidget (Consumer)

```svelte
<script>
import ParagraphWidget from '$lib/dashboard/components/widgets/ParagraphWidget.svelte';
</script>

<ParagraphWidget 
  data={initialData}
  widgetId="my-paragraph-widget"
  channelId="paragraph-content"
/>
```

**The widget:**
- Creates a `ValidatedConsumer` for `paragraph-content` channel
- Automatically receives data when producer publishes
- Validates received data
- Updates its display

---

### Step 7: Cleanup on Component Destroy

```typescript
import { onDestroy } from 'svelte';

onDestroy(() => {
  if (bridge) {
    bridge.disconnect();  // Cleans up producer
  }
});
```

---

## Complete Example

```svelte
<script lang="ts">
import { onDestroy } from 'svelte';
import JobSubmission from '$lib/components/AI/JobSubmission.svelte';
import ParagraphWidget from '$lib/dashboard/components/widgets/ParagraphWidget.svelte';
import { WidgetChannels, getWidgetOpenAIConfig } from '$lib/dashboard/types/widgetSchemas';
import { createJobWidgetBridge } from '$lib/dashboard/types/widgetBridge';

interface Props {
  idToken: string;
}

let { idToken }: Props = $props();
let bridge = $state(null);

// Step 1: OpenAI config
const openAIConfig = getWidgetOpenAIConfig('paragraph');

// Step 2: Job input
const jobInput = {
  request: JSON.stringify({
    prompt: 'Write about AI trends',
    response_format: openAIConfig
  }),
  priority: 'HIGH' as const
};

// Step 3: Initial data
const initialData = {
  title: 'Waiting...',
  content: 'AI is generating content...',
  markdown: false
};

// Step 4: Job completion handler (creates producer)
function handleJobComplete(update: any) {
  bridge = createJobWidgetBridge({
    jobId: update.id,
    channel: WidgetChannels.paragraphContent
  });
}

// Step 7: Cleanup
onDestroy(() => bridge?.disconnect());
</script>

<!-- Step 5: Job submission -->
<JobSubmission {idToken} {jobInput} onJobComplete={handleJobComplete} />

<!-- Step 6: Widget display -->
<ParagraphWidget data={initialData} widgetId="my-widget" />
```

---

## Data Flow Diagram

```
User clicks "Submit Job"
         ↓
JobSubmission component submits job
         ↓
Job processes in backend
         ↓
Job completes with result
         ↓
handleJobComplete() called
         ↓
createJobWidgetBridge() creates:
  ├─ ValidatedPublisher ← Producer created here!
  ├─ Subscribes to jobUpdateStore
  └─ Validates against ParagraphWidgetDataSchema
         ↓
Job update arrives
         ↓
Bridge transforms result
         ↓
Bridge validates result (Zod)
         ↓
Bridge publishes to mapObjectStore
         ↓
mapObjectStore notifies subscribers
         ↓
ParagraphWidget (consumer) receives data
         ↓
Widget validates data (Zod)
         ↓
Widget updates display
         ↓
User sees AI-generated content!
```

---

## Producer Details

### Where is the producer?
The producer is created inside `createJobWidgetBridge()`:

```typescript
// Inside widgetBridge.ts
export function createJobWidgetBridge(config) {
  const bridgeId = `job-${config.jobId}-to-${config.channel.channelId}`;
  
  // This creates the producer!
  const publisher = createWidgetPublisher(config.channel, bridgeId);
  
  // Producer is now registered in mapObjectStore
  // Producer ID: job-{jobId}-to-{channelId}
  // Channel: {channelId}
  
  // ... rest of bridge setup
}
```

### Verify producer registration

Use the MapStore Debug Panel:

```typescript
// Click "📤 Log Producers" button in the UI
// Or in console:
import { mapStore } from '$lib/stores/mapObjectStore';
console.table(mapStore.getAllProducers());
```

Expected output:
```
Producer ID: job-abc123-to-paragraph-content
Channel: paragraph-content
Role: producer
```

---

## Debugging

### Issue: Widget not updating

**Check:**
1. Bridge created? → Look for `handleJobComplete()` log
2. Producer registered? → Click "📤 Log Producers" button
3. Data published? → Click "💾 Log Data" button
4. Consumer registered? → Click "📥 Log Consumers" button

**Console logs to look for:**
```
🎯 [AIJobParagraphExample] Job completed: job-abc123
✅ Producer created automatically!
🌉 [createJobWidgetBridge] Creating bridge: job-abc123-to-paragraph-content
📨 [JobWidgetBridge] Job update received
✅ Validation passed, publishing to mapStore
📥 Data received from mapStore
✅ Widget state updated
```

### Issue: Validation errors

**Check console for:**
```
❌ [ValidatedPublisher:paragraph-content:...] Validation failed:
ZodError: [
  {
    "path": ["content"],
    "message": "Expected string, received number"
  }
]
```

**Fix:**
- Adjust transformer to return correct structure
- Ensure OpenAI config matches widget schema

---

## Best Practices

### ✅ DO

1. **Use bridges for AI jobs:**
   ```typescript
   const bridge = createJobWidgetBridge({ jobId, channel });
   ```

2. **Include OpenAI structured output:**
   ```typescript
   response_format: getWidgetOpenAIConfig('paragraph')
   ```

3. **Clean up on unmount:**
   ```typescript
   onDestroy(() => bridge?.disconnect());
   ```

4. **Handle errors:**
   ```typescript
   onJobError={(error) => console.error('Job failed:', error)}
   ```

### ❌ DON'T

1. **Don't create producer manually:**
   ```typescript
   // ❌ NO - Let bridge create it
   const producer = createWidgetPublisher(...);
   ```

2. **Don't forget cleanup:**
   ```typescript
   // ❌ Missing onDestroy will leak memory
   ```

3. **Don't skip transformer:**
   ```typescript
   // If AI response doesn't match schema, add transformer:
   transformer: (result) => {
     const parsed = JSON.parse(result);
     return { title: parsed.title, content: parsed.text, markdown: false };
   }
   ```

---

## Summary

**To create an AI job as a producer:**

1. ✅ Get text format: `getWidgetTextFormat('paragraph')`
2. ✅ Include in job request: `text: { format: textFormat }`
3. ✅ Use proper job structure with `model` and `input`
4. ✅ Create bridge on completion: `createJobWidgetBridge({ jobId, channel })`
5. ✅ Bridge creates producer automatically
6. ✅ Widget receives data via consumer
7. ✅ Clean up on unmount: `bridge.disconnect()`

**The bridge handles everything:**
- Producer creation ✓
- Validation ✓
- Publishing ✓
- Cleanup ✓

**You only need to:**
- Call `createJobWidgetBridge()` when job completes
- Call `bridge.disconnect()` when done

That's it! 🎉

