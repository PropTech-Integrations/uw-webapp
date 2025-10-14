// Widget Schema Registry with Zod
// This file defines Zod schemas for widget data and provides type-safe bridges
// between AI JobSubmission, mapObjectStore, and widget components.

import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { zodTextFormat } from 'openai/helpers/zod';
import type { WidgetType } from './widget';

// ===== Zod Schemas for Widget Data =====

export const ParagraphWidgetDataSchema = z.object({
	title: z.string().nullable().optional(),
	content: z.string().min(1, 'Content is required'),
	markdown: z.boolean().nullable().default(false)
});

export const TableWidgetDataSchema = z.object({
	title: z.string().nullable().optional(),
	headers: z.array(z.string()),
	rows: z.array(z.record(z.string(), z.any())),
	sortable: z.boolean().nullable().optional(),
	paginated: z.boolean().nullable().optional()
});

export const TitleWidgetDataSchema = z.object({
	title: z.string(),
	subtitle: z.string().nullable().optional(),
	alignment: z.enum(['left', 'center', 'right']).nullable().optional()
});

export const ImageWidgetDataSchema = z.object({
	title: z.string().nullable().optional(),
	src: z.string().url(),
	alt: z.string(),
	objectFit: z.enum(['cover', 'contain', 'fill']).nullable().optional()
});

export const LineChartWidgetDataSchema = z.object({
	datasets: z.array(
		z.object({
			label: z.string(),
			data: z.array(z.number()),
			color: z.string().nullable().optional()
		})
	),
	labels: z.array(z.string()),
	options: z
		.object({
			responsive: z.boolean().nullable().optional(),
			maintainAspectRatio: z.boolean().nullable().optional()
		})
		.nullable()
		.optional()
});

export const BarChartWidgetDataSchema = z.object({
	datasets: z.array(
		z.object({
			label: z.string(),
			data: z.array(z.number()),
			backgroundColor: z.string().nullable().optional()
		})
	),
	labels: z.array(z.string()),
	orientation: z.enum(['vertical', 'horizontal']).nullable().optional()
});

export const MetricWidgetDataSchema = z.object({
	label: z.string(),
	value: z.union([z.string(), z.number()]),
	change: z.number().nullable().optional(),
	changeType: z.enum(['increase', 'decrease']).nullable().optional(),
	unit: z.string().nullable().optional()
});

export const MapWidgetDataSchema = z.object({
	title: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
	lat: z.number().min(-90).max(90),
	lon: z.number().min(-180).max(180),
	zoom: z.number().min(0).max(20),
	mapType: z.enum(['leaflet', 'google', 'mapbox']),
	apiKey: z.string()
});

// ===== Schema Registry =====

export const WidgetDataSchemas = {
	paragraph: ParagraphWidgetDataSchema,
	table: TableWidgetDataSchema,
	title: TitleWidgetDataSchema,
	image: ImageWidgetDataSchema,
	lineChart: LineChartWidgetDataSchema,
	barChart: BarChartWidgetDataSchema,
	metric: MetricWidgetDataSchema,
	map: MapWidgetDataSchema
} as const;

// ===== Inferred Types from Schemas =====

export type ParagraphWidgetData = z.infer<typeof ParagraphWidgetDataSchema>;
export type TableWidgetData = z.infer<typeof TableWidgetDataSchema>;
export type TitleWidgetData = z.infer<typeof TitleWidgetDataSchema>;
export type ImageWidgetData = z.infer<typeof ImageWidgetDataSchema>;
export type LineChartWidgetData = z.infer<typeof LineChartWidgetDataSchema>;
export type BarChartWidgetData = z.infer<typeof BarChartWidgetDataSchema>;
export type MetricWidgetData = z.infer<typeof MetricWidgetDataSchema>;
export type MapWidgetData = z.infer<typeof MapWidgetDataSchema>;

// Union type of all widget data
export type WidgetData =
	| ParagraphWidgetData
	| TableWidgetData
	| TitleWidgetData
	| ImageWidgetData
	| LineChartWidgetData
	| BarChartWidgetData
	| MetricWidgetData
	| MapWidgetData;

// ===== Type-safe Widget Data Mapping =====

export interface WidgetDataTypeMap {
	paragraph: ParagraphWidgetData;
	table: TableWidgetData;
	title: TitleWidgetData;
	image: ImageWidgetData;
	lineChart: LineChartWidgetData;
	barChart: BarChartWidgetData;
	metric: MetricWidgetData;
	map: MapWidgetData;
}

// ===== Widget Channel Configuration =====

/**
 * Configuration for a widget's data channel in the mapObjectStore
 * @template T - The widget type
 */
export interface WidgetChannelConfig<T extends WidgetType = WidgetType> {
	/** Unique identifier for this data channel */
	readonly channelId: string;
	/** Widget type this channel is for */
	readonly widgetType: T;
	/** Zod schema for validating data */
	readonly schema: z.ZodSchema<WidgetDataTypeMap[T]>;
	/** Optional description for debugging */
	readonly description?: string;
}

// ===== OpenAI Structured Output Configuration =====

/**
 * Configuration for OpenAI structured output (Legacy - use zodTextFormat instead)
 * @deprecated Use getWidgetTextFormat() for OpenAI text format
 */
export interface OpenAIStructuredOutputConfig {
	type: 'json_schema';
	json_schema: {
		name: string;
		description?: string;
		schema: Record<string, unknown>;
		strict?: boolean;
	};
}

/**
 * OpenAI Text Format Configuration
 * This is the correct format for OpenAI structured outputs
 * Use this in the job input's `text.format` field
 */
export interface OpenAITextFormatConfig {
	type: 'json_schema';
	name: string;
	strict: true;
	schema: Record<string, unknown>;
}

/**
 * Convert a Zod schema to OpenAI structured output format
 * @param name - Name for the schema
 * @param schema - Zod schema to convert
 * @param description - Optional description
 * @returns OpenAI structured output configuration
 * 
 * @example
 * ```typescript
 * const openAIConfig = zodSchemaToOpenAI(
 *   'ParagraphContent',
 *   ParagraphWidgetDataSchema,
 *   'Content for a paragraph widget'
 * );
 * 
 * // Use with OpenAI API:
 * const response = await openai.chat.completions.create({
 *   model: 'gpt-4o',
 *   messages: [...],
 *   response_format: openAIConfig
 * });
 * ```
 */
export function zodSchemaToOpenAI<T extends z.ZodSchema>(
	name: string,
	schema: T,
	description?: string
): OpenAIStructuredOutputConfig {
	console.log(`\n🔧 [zodSchemaToOpenAI] Converting Zod schema to OpenAI format`);
	console.log(`   Name: ${name}`);
	console.log(`   Description: ${description || '(none)'}`);
	
	// Convert Zod schema to JSON Schema
	const jsonSchema = zodToJsonSchema(schema, {
		name,
		$refStrategy: 'none' // Inline all references for OpenAI compatibility
	});

	// Extract the schema object (remove $schema property if present)
	const { $schema, ...schemaObject } = jsonSchema as any;

	console.log(`   ✅ Conversion complete`);

	return {
		type: 'json_schema',
		json_schema: {
			name,
			description,
			schema: schemaObject,
			strict: true
		}
	};
}

/**
 * Get OpenAI text format for a specific widget type
 * This uses zodTextFormat which is the recommended way for OpenAI structured outputs
 * 
 * @param widgetType - The widget type
 * @param name - Optional custom name (defaults to widgetType)
 * @returns OpenAI text format configuration for use in job input
 * 
 * @example
 * ```typescript
 * const textFormat = getWidgetTextFormat('paragraph', 'ParagraphContent');
 * 
 * // Use in job input:
 * const jobInput = {
 *   model: 'gpt-4o-mini',
 *   input: [{ role: 'system', content: 'Generate content...' }],
 *   text: { format: textFormat }
 * };
 * ```
 */
export function getWidgetTextFormat<T extends WidgetType>(
	widgetType: T,
	name?: string
): OpenAITextFormatConfig {
	console.log(`\n🔧 [getWidgetTextFormat] Getting OpenAI text format for widget type: ${widgetType}`);
	const schema = WidgetDataSchemas[widgetType];
	const configName = name || `${widgetType}WidgetData`;
	
	console.log(`   Using zodTextFormat with name: ${configName}`);
	const textFormat = zodTextFormat(schema, configName);
	console.log(`   ✅ Text format generated`);
	
	return textFormat as OpenAITextFormatConfig;
}

// /**
//  * Get OpenAI structured output config for a specific widget type
//  * @deprecated Use getWidgetTextFormat() instead for proper OpenAI text format
//  * @param widgetType - The widget type
//  * @param name - Optional custom name (defaults to widgetType)
//  * @param description - Optional description
//  */
// export function getWidgetOpenAIConfig<T extends WidgetType>(
// 	widgetType: T,
// 	name?: string,
// 	description?: string
// ): OpenAIStructuredOutputConfig {
// 	console.log(`\n🔧 [getWidgetOpenAIConfig] Getting OpenAI config for widget type: ${widgetType}`);
// 	console.log(`   ⚠️  DEPRECATED: Use getWidgetTextFormat() instead`);
// 	const schema = WidgetDataSchemas[widgetType];
// 	const configName = name || `${widgetType}WidgetData`;
// 	const configDescription = description || `Data for ${widgetType} widget`;
	
// 	return zodSchemaToOpenAI(configName, schema, configDescription);
// }

// ===== Validated Data Publisher =====

/**
 * Create a validated publisher for widget data
 * This ensures that data published to mapObjectStore is validated against the schema
 */
export interface ValidatedPublisher<T = any> {
	/**
	 * Publish data with validation
	 * @throws {z.ZodError} if validation fails
	 */
	publish(data: T): void;
	/**
	 * Publish data with safe validation (returns error instead of throwing)
	 */
	safeParse(data: unknown): { success: true; data: T } | { success: false; error: z.ZodError };
	/** Clear the published data */
	clear(): void;
}

/**
 * Create a validated consumer for widget data
 * This ensures that data received from mapObjectStore is validated
 */
export interface ValidatedConsumer<T = any> {
	/**
	 * Subscribe to validated data
	 * Invalid data will be filtered out and logged
	 */
	subscribe(callback: (data: T | undefined) => void): () => void;
	/** Get current validated data */
	get(): T | undefined;
}

// ===== Widget Data Bridge Configuration =====

/**
 * Configuration for AI Job -> Widget data flow
 */
export interface WidgetDataBridgeConfig<T extends WidgetType = WidgetType> {
	/** Job ID to listen for updates from */
	readonly jobId: string;
	/** Channel configuration for the widget */
	readonly channel: WidgetChannelConfig<T>;
	/** Optional transformer to convert job result to widget data */
	readonly transformer?: (jobResult: string) => any;
	/** Optional filter to determine which job updates to process */
	readonly filter?: (update: { status: string; result: string | null }) => boolean;
}

// ===== Validation Helpers =====

/**
 * Validate widget data against its schema
 */
export function validateWidgetData<T extends WidgetType>(
	widgetType: T,
	data: unknown
): { success: true; data: WidgetDataTypeMap[T] } | { success: false; error: z.ZodError } {
	console.log(`\n🔧 [validateWidgetData] Validating data for widget type: ${widgetType}`);
	const schema = WidgetDataSchemas[widgetType];
	const result = schema.safeParse(data) as any;
	console.log(`   Result: ${result.success ? '✅ Valid' : '❌ Invalid'}`);
	return result;
}

/**
 * Parse and validate widget data, throwing on error
 */
export function parseWidgetData<T extends WidgetType>(
	widgetType: T,
	data: unknown
): WidgetDataTypeMap[T] {
	console.log(`\n🔧 [parseWidgetData] Parsing data for widget type: ${widgetType}`);
	const schema = WidgetDataSchemas[widgetType];
	// Type assertion needed due to TypeScript's limitations with indexed schema types
	// Runtime validation by Zod ensures type safety
	try {
		const result = schema.parse(data) as any;
		console.log(`   ✅ Parse successful`);
		return result;
	} catch (error) {
		console.error(`   ❌ Parse failed:`, error);
		throw error;
	}
}

// ===== Preset Channel Configurations =====

/**
 * Common channel configurations for widgets
 */
export const WidgetChannels = {
	paragraphContent: {
		channelId: 'paragraph-content',
		widgetType: 'paragraph',
		schema: ParagraphWidgetDataSchema,
		description: 'Channel for paragraph widget content'
	} as WidgetChannelConfig<'paragraph'>,

	tableData: {
		channelId: 'table-data',
		widgetType: 'table',
		schema: TableWidgetDataSchema,
		description: 'Channel for table widget data'
	} as WidgetChannelConfig<'table'>,

	metricData: {
		channelId: 'metric-data',
		widgetType: 'metric',
		schema: MetricWidgetDataSchema,
		description: 'Channel for metric widget data'
	} as WidgetChannelConfig<'metric'>,

	chartData: {
		channelId: 'chart-data',
		widgetType: 'lineChart',
		schema: LineChartWidgetDataSchema,
		description: 'Channel for chart widget data'
	} as WidgetChannelConfig<'lineChart'>
} as const;

// ===== Type Guards =====

export function isWidgetType(type: string): type is WidgetType {
	return type in WidgetDataSchemas;
}

export function hasWidgetSchema(type: WidgetType): type is keyof typeof WidgetDataSchemas {
	return type in WidgetDataSchemas;
}

