import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import OpenAI from 'openai';

// Define your Zod schemas for different use cases

// 1. Simple extraction schema
const PersonSchema = z.object({
	name: z.string().describe('Full name of the person'),
	age: z.number().int().describe('Age in years'),
	email: z.string().email().describe('Email address'),
	occupation: z.string().describe('Current job or profession')
});

// 2. More complex schema with nested objects and arrays
const ArticleAnalysisSchema = z.object({
	title: z.string().describe('Article title'),
	summary: z.string().describe('Brief summary of the article'),
	sentiment: z.enum(['positive', 'negative', 'neutral']).describe('Overall sentiment'),
	keyPoints: z.array(z.string()).describe('Main points from the article'),
	entities: z
		.array(
			z.object({
				name: z.string().describe('Entity name'),
				type: z.enum(['person', 'organization', 'location', 'product']).describe('Entity type'),
				relevance: z.number().min(0).max(1).describe('Relevance score between 0 and 1')
			})
		)
		.describe('Named entities mentioned'),
	metadata: z
		.object({
			wordCount: z.number().int().describe('Total word count'),
			readingTimeMinutes: z.number().describe('Estimated reading time'),
			language: z.string().describe('Article language')
		})
		.describe('Article metadata')
});

// 3. Function calling schema
const WeatherFunctionSchema = z.object({
	location: z.string().describe('City and state, e.g., San Francisco, CA'),
	unit: z.enum(['celsius', 'fahrenheit']).default('fahrenheit').describe('Temperature unit'),
	includeForcast: z.boolean().default(false).describe('Include 5-day forecast')
});

// Convert Zod schemas to JSON Schema format
function zodToOpenAISchema(schema: z.ZodSchema, name: string, description?: string) {
	// Convert to JSON Schema
	const jsonSchema = zodToJsonSchema(schema, {
		name,
		$refStrategy: 'none', // OpenAI doesn't support $ref
		target: 'openApi3'
	}) as any;

	// Extract the schema, removing the wrapper properties that zod-to-json-schema adds
	const schemaObj = jsonSchema.$schema ? { ...jsonSchema } : jsonSchema;
	delete schemaObj.$schema;
	delete schemaObj.definitions;
	
	// Ensure the schema has type: "object" at the root
	if (!schemaObj.type) {
		schemaObj.type = 'object';
	}

	// For strict mode, ensure additionalProperties is false
	if (schemaObj.type === 'object' && schemaObj.additionalProperties === undefined) {
		schemaObj.additionalProperties = false;
	}

	// Clean up for OpenAI compatibility
	const cleaned = {
		type: 'json_schema' as const,
		json_schema: {
			name: name.replace(/\s+/g, '_').toLowerCase(),
			strict: true, // Enable strict mode for guaranteed conformance
			schema: schemaObj,
			...(description && { description })
		}
	};

	return cleaned;
}

// Example usage with OpenAI API
async function demonstrateOpenAIIntegration() {
	const openai = new OpenAI({
		apiKey: process.env.OPENAI_API_KEY
	});

	// 1. Using response_format for structured extraction
	const personExtractionSchema = zodToOpenAISchema(
		PersonSchema,
		'person_extraction',
		'Extract person information from text'
	);

	console.log('=== Person Extraction Schema ===');
	console.log(JSON.stringify(personExtractionSchema, null, 2));

	// Example API call with structured output
	try {
		const extractionResponse = await openai.chat.completions.create({
			model: 'gpt-5-nano',
			messages: [
				{
					role: 'system',
					content: 'Extract person information from the provided text.'
				},
				{
					role: 'user',
					content:
						'John Smith is a 32-year-old software engineer. You can reach him at john.smith@example.com.'
				}
			],
			response_format: personExtractionSchema
		});

		// Parse and validate the response
		const rawResponse = JSON.parse(extractionResponse.choices[0].message.content || '{}');
		const validatedPerson = PersonSchema.parse(rawResponse);
		console.log('\n✅ Validated extraction:', validatedPerson);
	} catch (error) {
		console.error('API call failed:', error);
	}

	// // 2. Complex article analysis schema
	// const articleSchema = zodToOpenAISchema(
	// 	ArticleAnalysisSchema,
	// 	'article_analysis',
	// 	'Comprehensive article analysis'
	// );

	// console.log('\n=== Article Analysis Schema ===');
	// console.log(JSON.stringify(articleSchema, null, 2));

	// // 3. Function calling with Zod schema
	// const weatherFunction = {
	// 	type: 'function' as const,
	// 	function: {
	// 		name: 'get_weather',
	// 		description: 'Get current weather for a location',
	// 		parameters: zodToJsonSchema(WeatherFunctionSchema, {
	// 			$refStrategy: 'none'
	// 		})
	// 	}
	// };

	// console.log('\n=== Weather Function Schema ===');
	// console.log(JSON.stringify(weatherFunction, null, 2));

	// // Example function calling
	// try {
	// 	const functionResponse = await openai.chat.completions.create({
	// 		model: 'gpt-5-nano',
	// 		messages: [
	// 			{
	// 				role: 'user',
	// 				content: "What's the weather in San Francisco?"
	// 			}
	// 		],
	// 		tools: [weatherFunction],
	// 		tool_choice: 'auto'
	// 	});

	// 	const toolCall = functionResponse.choices[0].message.tool_calls?.[0];
	// 	if (toolCall && toolCall.type === 'function') {
	// 		const args = JSON.parse(toolCall.function.arguments);
	// 		const validatedArgs = WeatherFunctionSchema.parse(args);
	// 		console.log('\n✅ Validated function arguments:', validatedArgs);
	// 	}
	// } catch (error) {
	// 	console.error('Function calling failed:', error);
	// }
}

// Helper function to validate OpenAI responses
function validateOpenAIResponse<T>(
	schema: z.ZodSchema<T>,
	response: string
): { success: boolean; data?: T; error?: z.ZodError } {
	try {
		const parsed = JSON.parse(response);
		const validated = schema.parse(parsed);
		return { success: true, data: validated };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return { success: false, error };
		}
		throw error;
	}
}

// Example: Creating a reusable typed completion function
class TypedOpenAI {
	constructor(private openai: OpenAI) {}

	async createStructuredCompletion<T>(
		schema: z.ZodSchema<T>,
		schemaName: string,
		messages: OpenAI.ChatCompletionMessageParam[],
		options?: { description?: string; model?: string }
	): Promise<T> {
		const responseFormat = zodToOpenAISchema(schema, schemaName, options?.description);

		const response = await this.openai.chat.completions.create({
			model: options?.model || 'gpt-5-nano',
			messages,
			response_format: responseFormat
		});

		const content = response.choices[0].message.content;
		if (!content) {
			throw new Error('No content in response');
		}

		const parsed = JSON.parse(content);
		return schema.parse(parsed); // Validates and returns typed data
	}
}

// Usage example
async function typedExample() {
	const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
	const typed = new TypedOpenAI(openai);

	// Type-safe completion with automatic validation
	const person = await typed.createStructuredCompletion(PersonSchema, 'extract_person', [
		{
			role: 'user',
			content: 'Extract: Jane Doe, 28 years old, jane@example.com, data scientist'
		}
	]);

	// `person` is fully typed as z.infer<typeof PersonSchema>
	console.log(person.name); // TypeScript knows this is a string
	console.log(person.age); // TypeScript knows this is a number
}

demonstrateOpenAIIntegration().catch(console.error);
