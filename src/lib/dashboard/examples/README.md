# Widget Job Integration Examples

This directory contains examples showing how to use the type-safe widget system with AI job submission.

## Overview

The widget system provides end-to-end type safety from AI job submission to widget display:

```
AI Job (with Zod schema) → Validation → mapObjectStore → Widget (validated data)
```

## Key Components

### 1. Widget Schemas (`widgetSchemas.ts`)
- Defines Zod schemas for all widget data types
- Provides OpenAI structured output configuration
- Single source of truth for widget data structure

### 2. Widget Bridge (`widgetBridge.ts`)
- Creates validated publishers/consumers
- Bridges job updates to widget channels
- Automatic validation and error handling

### 3. Widget Components
- Receive validated data from mapObjectStore
- Type-safe props and state
- No manual validation needed

## Quick Start

### 1. Define Your Widget Data

```typescript
// Already defined in widgetSchemas.ts
import { ParagraphWidgetDataSchema } from '$lib/dashboard/types/widgetSchemas';
```

### 2. Get OpenAI Configuration

```typescript
import { getWidgetOpenAIConfig } from '$lib/dashboard/types/widgetSchemas';

const openAIConfig = getWidgetOpenAIConfig(
  'paragraph',
  'DocumentSummary',
  'Summary of a document'
);

// Use with OpenAI
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [...],
  response_format: openAIConfig
});
```

### 3. Create Job → Widget Bridge

```typescript
import { createJobWidgetBridge } from '$lib/dashboard/types/widgetBridge';
import { WidgetChannels } from '$lib/dashboard/types/widgetSchemas';

const bridge = createJobWidgetBridge({
  jobId: 'job-123',
  channel: WidgetChannels.paragraphContent,
  transformer: (result) => JSON.parse(result),
  filter: (update) => update.status === 'COMPLETED'
});

// Cleanup when done
bridge.disconnect();
```

### 4. Use in Widget

```svelte
<script>
import ParagraphWidget from '$lib/dashboard/components/widgets/ParagraphWidget.svelte';

const initialData = {
  title: 'Loading...',
  content: 'Waiting for AI response...',
  markdown: false
};
</script>

<ParagraphWidget 
  data={initialData}
  channelId="paragraph-content"
  widgetId="my-widget"
/>
```

## Type Safety Benefits

✅ **OpenAI Output**: Zod schema ensures AI responses match widget structure  
✅ **Runtime Validation**: Invalid data is caught before reaching widgets  
✅ **TypeScript Safety**: Full type inference across the entire flow  
✅ **Single Source**: One Zod schema defines everything  

## Examples

- `WidgetJobIntegration.svelte` - Complete working example
- Shows the full flow from job submission to widget display
- Includes bridge status monitoring
- Demonstrates error handling

## Advanced Usage

### Manual Publishing

```typescript
import { createWidgetPublisher } from '$lib/dashboard/types/widgetBridge';
import { WidgetChannels } from '$lib/dashboard/types/widgetSchemas';

const publisher = createWidgetPublisher(
  WidgetChannels.paragraphContent,
  'my-publisher'
);

// Validated publish (throws on error)
publisher.publish({
  title: 'Hello',
  content: 'World',
  markdown: false
});

// Safe publish (returns result)
const result = publisher.safeParse(someData);
if (result.success) {
  console.log('Valid:', result.data);
} else {
  console.error('Invalid:', result.error);
}
```

### Custom Channels

```typescript
const customChannel = {
  channelId: 'custom-paragraph',
  widgetType: 'paragraph',
  schema: ParagraphWidgetDataSchema,
  description: 'Custom paragraph channel'
};

const publisher = createWidgetPublisher(customChannel, 'my-custom-publisher');
```

### Multi-Widget Bridge

```typescript
import { createJobMultiWidgetBridge } from '$lib/dashboard/types/widgetBridge';

// One job updates multiple widgets
const bridge = createJobMultiWidgetBridge('job-123', [
  {
    config: WidgetChannels.paragraphContent,
    transformer: (result) => JSON.parse(result).summary
  },
  {
    config: WidgetChannels.metricData,
    transformer: (result) => JSON.parse(result).metrics
  }
]);
```

## Error Handling

The system automatically logs validation errors:

```
[ValidatedPublisher:paragraph-content:my-publisher] Validation failed:
ZodError: [
  {
    "code": "invalid_type",
    "expected": "string",
    "received": "number",
    "path": ["content"],
    "message": "Expected string, received number"
  }
]
```

Invalid data is filtered out and never reaches widgets.

## Testing

```typescript
import { validateWidgetData } from '$lib/dashboard/types/widgetSchemas';

const result = validateWidgetData('paragraph', someData);
if (result.success) {
  // Use result.data (fully typed)
} else {
  // Handle result.error
}
```

## Best Practices

1. **Use Preset Channels**: `WidgetChannels.paragraphContent` over custom configs
2. **Let Bridge Handle**: Use `createJobWidgetBridge` instead of manual publishing
3. **Validate Early**: OpenAI structured output prevents most validation errors
4. **Monitor Status**: Use `bridge.getStatus()` to track validation issues
5. **Cleanup**: Always call `bridge.disconnect()` in `onDestroy`

## Support

For issues or questions, see:
- `widgetSchemas.ts` - Schema definitions
- `widgetBridge.ts` - Bridge implementation
- `WidgetJobIntegration.svelte` - Working example

