# AI Job Request Type System

A complete type-safe system for creating AI extraction and processing jobs with Zod schema validation.

## Overview

This system provides a flexible, type-safe way to create AI job requests that can be:
- Imported from external sources
- Configured dynamically
- Created using builder patterns
- Validated with Zod schemas

## Quick Start

### 1. Simple Extraction Job

```typescript
import { createExtractionJob } from '$lib/types/aiJobRequest';
import { projectSchema } from '$lib/schemas/extractionSchemas';

const job = createExtractionJob(
  projectSchema,
  'projectDetails',
  ['vs_YOUR_VECTOR_STORE_ID'],
  'Extract project details from the document'
);
```

### 2. Simple Summary Job

```typescript
import { createSummaryJob } from '$lib/types/aiJobRequest';

const job = createSummaryJob(
  ['vs_YOUR_VECTOR_STORE_ID'],
  'Write a two sentence summary',
  { priority: 'HIGH' }
);
```

### 3. Builder Pattern (Most Flexible)

```typescript
import { AIJobRequestBuilder } from '$lib/types/aiJobRequest';
import { projectSchema } from '$lib/schemas/extractionSchemas';

const job = new AIJobRequestBuilder('gpt-5-nano')
  .withSystemMessage('You are a data extraction expert')
  .withFileSearch(['vs_YOUR_VECTOR_STORE_ID'])
  .withToolChoice('auto')
  .withZodSchema(projectSchema, 'project')
  .withPriority('HIGH')
  .build();
```

## Core Types

### JobInput
```typescript
interface JobInput {
  request: string;  // Stringified AIJobRequestConfig
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}
```

### AIJobRequestConfig
```typescript
interface AIJobRequestConfig<T = any> {
  model: string;
  input?: AIMessage[];
  messages?: AIMessage[];
  tools?: AITool[];
  tool_choice?: 'auto' | 'required' | 'none';
  text?: TextFormat<T>;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
}
```

## Schema Management

### Defining Schemas

Create schemas in `src/lib/schemas/`:

```typescript
// src/lib/schemas/mySchemas.ts
import { z } from 'zod';

export const mySchema = z.object({
  field1: z.string().describe('Description for AI'),
  field2: z.number().optional(),
  field3: z.array(z.string())
});

export type MyType = z.infer<typeof mySchema>;
```

### Importing Schemas

```typescript
import { mySchema } from '$lib/schemas/mySchemas';
import { createExtractionJob } from '$lib/types/aiJobRequest';

const job = createExtractionJob(mySchema, 'myData', [vectorStoreId]);
```

## API Reference

### createExtractionJob()

Create a schema-based extraction job.

```typescript
function createExtractionJob<T extends z.ZodType>(
  schema: T,
  schemaName: string,
  vectorStoreIds: string[],
  systemPrompt?: string,
  options?: {
    model?: string;
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  }
): JobInput
```

**Parameters:**
- `schema` - Zod schema defining the data structure
- `schemaName` - Name for the schema (used in response)
- `vectorStoreIds` - Array of vector store IDs to search
- `systemPrompt` - Optional system message (default: "Extract the details from the file")
- `options.model` - Optional model name (default: "gpt-5-nano")
- `options.priority` - Optional priority (default: "HIGH")

### createSummaryJob()

Create a text summary job.

```typescript
function createSummaryJob(
  vectorStoreIds: string[],
  prompt: string,
  options?: {
    model?: string;
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  }
): JobInput
```

### AIJobRequestBuilder

Fluent builder for creating complex job configurations.

```typescript
class AIJobRequestBuilder<T extends z.ZodType = any> {
  constructor(model?: string)
  
  withSystemMessage(content: string): this
  withUserMessage(content: string): this
  withFileSearch(vectorStoreIds: string[]): this
  withToolChoice(choice: 'auto' | 'required' | 'none'): this
  withZodSchema(schema: T, name: string): this
  withPriority(priority: 'HIGH' | 'MEDIUM' | 'LOW'): this
  
  build(): JobInput
  getConfig(): AIJobRequestConfig
}
```

### createAIJobInput()

Low-level function for manual job creation.

```typescript
function createAIJobInput(
  config: AIJobRequestConfig,
  priority?: 'HIGH' | 'MEDIUM' | 'LOW'
): JobInput
```

## Usage Patterns

### 1. From External Configuration

```typescript
interface ExternalConfig {
  schemaKey: string;
  vectorStoreId: string;
  prompt: string;
}

// Load from API/database
const config: ExternalConfig = await fetchConfig();

// Map to actual schema
const schemaMap = { project: projectSchema, broker: brokerSchema };
const schema = schemaMap[config.schemaKey];

const job = createExtractionJob(
  schema,
  config.schemaKey,
  [config.vectorStoreId],
  config.prompt
);
```

### 2. Dynamic Schema Generation

```typescript
function createDynamicJob(fields: Array<{name: string, type: string}>) {
  const schemaShape = {};
  
  fields.forEach(field => {
    schemaShape[field.name] = field.type === 'number' 
      ? z.number() 
      : z.string();
  });
  
  const dynamicSchema = z.object(schemaShape);
  
  return createExtractionJob(dynamicSchema, 'dynamic', [vectorStoreId]);
}
```

### 3. Batch Job Creation

```typescript
const jobs = schemas.map(schema => 
  createExtractionJob(schema, schema.name, [vectorStoreId])
);
```

### 4. Template Class

```typescript
class JobFactory {
  constructor(private vectorStoreId: string) {}
  
  createProjectJob(): JobInput {
    return createExtractionJob(
      projectSchema, 
      'project', 
      [this.vectorStoreId]
    );
  }
  
  createCustomJob(schema: z.ZodType, name: string): JobInput {
    return createExtractionJob(
      schema, 
      name, 
      [this.vectorStoreId]
    );
  }
}
```

## Integration with JobSubmission Component

```svelte
<script lang="ts">
  import JobSubmission from '$lib/components/AI/JobSubmission.svelte';
  import { createExtractionJob } from '$lib/types/aiJobRequest';
  import { projectSchema } from '$lib/schemas/extractionSchemas';
  
  const jobInput = createExtractionJob(
    projectSchema,
    'project',
    ['vs_YOUR_VECTOR_STORE_ID'],
    'Extract project details'
  );
</script>

<JobSubmission idToken={data.idToken} jobInput={jobInput} />
```

## Provided Schemas

The following schemas are available in `src/lib/schemas/extractionSchemas.ts`:

- **projectSchema** - Property/project details
- **brokerSchema** - Broker contact information
- **financialSchema** - Financial data (price, cap rate, NOI, etc.)
- **tenantSchema** - Tenant lease information
- **contactSchema** - General contact information

## Examples

See `src/lib/types/aiJobRequest.examples.ts` for comprehensive usage examples including:
- Helper function usage
- Builder pattern
- Manual configuration
- External configuration loading
- Batch job creation
- Dynamic schema generation
- Job templates
- Type-safe creation

## Best Practices

1. **Define schemas externally** - Keep schemas in `src/lib/schemas/` for reusability
2. **Use helper functions** - `createExtractionJob()` and `createSummaryJob()` for common cases
3. **Use builder pattern** - For complex, custom configurations
4. **Type your schemas** - Export TypeScript types using `z.infer<typeof schema>`
5. **Add descriptions** - Use `.describe()` on schema fields to guide AI extraction
6. **Centralize vector store IDs** - Consider environment variables or config files

## TypeScript Support

All functions and classes are fully typed:

```typescript
// Schema type is inferred
const job = createExtractionJob(projectSchema, ...);
// job: JobInput

// Builder is type-safe
const builder = new AIJobRequestBuilder<typeof projectSchema>('gpt-5-nano');
// builder methods autocomplete and type-check

// Extract TypeScript types from schemas
type Project = z.infer<typeof projectSchema>;
```

## Testing

```typescript
import { createExtractionJob } from '$lib/types/aiJobRequest';
import { projectSchema } from '$lib/schemas/extractionSchemas';

describe('Job Creation', () => {
  it('creates valid job input', () => {
    const job = createExtractionJob(
      projectSchema,
      'project',
      ['test-vector-store']
    );
    
    expect(job.priority).toBe('HIGH');
    expect(JSON.parse(job.request).model).toBe('gpt-5-nano');
  });
});
```

## Migration Guide

### Before

```typescript
const jobInput = {
  request: JSON.stringify({
    model: 'gpt-5-nano',
    input: [{ role: 'system', content: 'Extract data' }],
    tools: [{ type: 'file_search', vector_store_ids: ['vs_123'] }],
    // ... complex manual configuration
  }),
  priority: 'HIGH'
};
```

### After

```typescript
const jobInput = createExtractionJob(
  mySchema,
  'data',
  ['vs_123'],
  'Extract data'
);
```

## Files

- `src/lib/types/aiJobRequest.ts` - Core types and functions
- `src/lib/types/aiJobRequest.examples.ts` - Usage examples
- `src/lib/schemas/extractionSchemas.ts` - Predefined schemas
- `src/routes/ai/+page.svelte` - Live example usage

