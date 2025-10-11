// Widget Bridge System
// Type-safe bridge between AI JobSubmission -> mapObjectStore -> Widget components

import { z } from 'zod';
import { mapStore } from '$lib/stores/mapObjectStore';
import { jobUpdateStore, type JobUpdate } from '$lib/stores/jobUpdateStore';
import type { Readable } from 'svelte/store';
import type {
	WidgetChannelConfig,
	WidgetDataTypeMap,
	ValidatedPublisher,
	ValidatedConsumer,
	WidgetDataBridgeConfig
} from './widgetSchemas';
import type { WidgetType } from './widget';

// ===== Validated Publisher Implementation =====

class ValidatedPublisherImpl<T> implements ValidatedPublisher<T> {
	constructor(
		private schema: z.ZodSchema<T>,
		private publisher: { publish: (value: T) => void; clear: () => void },
		private channelId: string
	) {
		console.log(`[ValidatedPublisher] Constructor called for channel: ${this.channelId}`);
	}

	publish(data: T): void {
		console.log(`[ValidatedPublisher:${this.channelId}] publish() called with data:`, data);
		const result = this.schema.safeParse(data);
		if (!result.success) {
			console.error(`[ValidatedPublisher:${this.channelId}] Validation failed:`, result.error);
			throw result.error;
		}
		console.log(`[ValidatedPublisher:${this.channelId}] ✅ Validation passed, publishing to mapStore`);
		this.publisher.publish(result.data);
	}

	safeParse(data: unknown): { success: true; data: T } | { success: false; error: z.ZodError } {
		console.log(`[ValidatedPublisher:${this.channelId}] safeParse() called`);
		const result = this.schema.safeParse(data);
		if (result.success) {
			console.log(`[ValidatedPublisher:${this.channelId}] ✅ safeParse validation passed`);
			return { success: true, data: result.data };
		}
		console.log(`[ValidatedPublisher:${this.channelId}] ❌ safeParse validation failed`);
		return { success: false, error: result.error };
	}

	clear(): void {
		console.log(`[ValidatedPublisher:${this.channelId}] clear() called`);
		this.publisher.clear();
	}
}

// ===== Validated Consumer Implementation =====

class ValidatedConsumerImpl<T> implements ValidatedConsumer<T> {
	constructor(
		private schema: z.ZodSchema<T>,
		private consumer: { subscribe: Readable<T | undefined>['subscribe']; get: () => T | undefined },
		private channelId: string
	) {
		console.log(`[ValidatedConsumer] Constructor called for channel: ${this.channelId}`);
	}

	subscribe(callback: (data: T | undefined) => void): () => void {
		console.log(`[ValidatedConsumer:${this.channelId}] subscribe() called, setting up subscription`);
		return this.consumer.subscribe((data) => {
			console.log(`[ValidatedConsumer:${this.channelId}] 📥 Data received from mapStore:`, data);
			if (data === undefined) {
				console.log(`[ValidatedConsumer:${this.channelId}] Data is undefined, passing through`);
				callback(undefined);
				return;
			}

			const result = this.schema.safeParse(data);
			if (!result.success) {
				console.error(`[ValidatedConsumer:${this.channelId}] ❌ Invalid data received:`, result.error);
				callback(undefined);
				return;
			}

			console.log(`[ValidatedConsumer:${this.channelId}] ✅ Validation passed, calling callback with validated data`);
			callback(result.data);
		});
	}

	get(): T | undefined {
		console.log(`[ValidatedConsumer:${this.channelId}] get() called`);
		const data = this.consumer.get();
		if (data === undefined) {
			console.log(`[ValidatedConsumer:${this.channelId}] No data in store`);
			return undefined;
		}

		const result = this.schema.safeParse(data);
		if (!result.success) {
			console.error(`[ValidatedConsumer:${this.channelId}] Invalid data in store:`, result.error);
			return undefined;
		}

		console.log(`[ValidatedConsumer:${this.channelId}] ✅ Returning validated data from store`);
		return result.data;
	}
}

// ===== Widget Bridge Factory =====

/**
 * Create a validated publisher for a widget channel
 */
export function createWidgetPublisher<T extends WidgetType>(
	config: WidgetChannelConfig<T>,
	publisherId: string
): ValidatedPublisher<WidgetDataTypeMap[T]> {
	console.log(`\n🔧 [createWidgetPublisher] Called for channel: ${config.channelId}, publisher: ${publisherId}`);
	const publisher = mapStore.registerProducer<WidgetDataTypeMap[T]>(config.channelId, publisherId);
	console.log(`   ↳ Registered producer in mapStore`);

	return new ValidatedPublisherImpl(
		config.schema,
		publisher,
		`${config.channelId}:${publisherId}`
	);
}

/**
 * Create a validated consumer for a widget channel
 */
export function createWidgetConsumer<T extends WidgetType>(
	config: WidgetChannelConfig<T>,
	consumerId: string
): ValidatedConsumer<WidgetDataTypeMap[T]> {
	console.log(`\n🔧 [createWidgetConsumer] Called for channel: ${config.channelId}, consumer: ${consumerId}`);
	const consumer = mapStore.registerConsumer<WidgetDataTypeMap[T]>(config.channelId, consumerId);
	console.log(`   ↳ Registered consumer in mapStore`);

	return new ValidatedConsumerImpl(
		config.schema,
		consumer,
		`${config.channelId}:${consumerId}`
	);
}

// ===== AI Job to Widget Bridge =====

/**
 * Result of bridging a job to a widget channel
 */
export interface JobWidgetBridge {
	/** Unsubscribe from job updates */
	disconnect: () => void;
	/** Get current validation status */
	getStatus: () => {
		connected: boolean;
		lastUpdate?: Date;
		lastError?: z.ZodError;
	};
}

/**
 * Create a bridge from AI job updates to a widget channel
 * This automatically:
 * - Listens to job updates
 * - Validates the job result against the widget schema
 * - Publishes valid data to the widget channel
 */
export function createJobWidgetBridge<T extends WidgetType>(
	config: WidgetDataBridgeConfig<T>
): JobWidgetBridge {
	const bridgeId = `job-${config.jobId}-to-${config.channel.channelId}`;
	console.log(`\n🌉 [createJobWidgetBridge] Creating bridge: ${bridgeId}`);
	console.log(`   Job ID: ${config.jobId}`);
	console.log(`   Target Channel: ${config.channel.channelId}`);
	
	const publisher = createWidgetPublisher(config.channel, bridgeId);

	let lastUpdate: Date | undefined;
	let lastError: z.ZodError | undefined;
	let isConnected = true;

	// Default transformer: parse JSON from job result
	const transform =
		config.transformer ||
		((result: string): WidgetDataTypeMap[T] => {
			console.log(`[JobWidgetBridge:${bridgeId}] Using default transformer (JSON.parse)`);
			return JSON.parse(result);
		});

	// Default filter: only process COMPLETED status with non-null result
	const filter =
		config.filter ||
		((update: { status: string; result: string | null }) => {
			return (
				(update.status === 'COMPLETED' || update.status === 'COMPLETE') &&
				update.result !== null
			);
		});

	console.log(`[JobWidgetBridge:${bridgeId}] Subscribing to job updates...`);
	
	// Subscribe to job updates
	const jobUpdatesStore = jobUpdateStore.subscribeToJobUpdates(config.jobId);
	const unsubscribe = jobUpdatesStore.subscribe((updates: JobUpdate[]) => {
		console.log(`\n📨 [JobWidgetBridge:${bridgeId}] Job update received, ${updates.length} updates in store`);
		
		if (!isConnected || updates.length === 0) {
			console.log(`   ↳ Skipping: ${!isConnected ? 'disconnected' : 'no updates'}`);
			return;
		}

		const latestUpdate = updates[0];
		console.log(`   Latest update status: ${latestUpdate.status}`);
		console.log(`   Has result: ${latestUpdate.result !== null}`);
		
		if (!filter({ status: latestUpdate.status, result: latestUpdate.result })) {
			console.log(`   ↳ Update filtered out by filter function`);
			return;
		}

		console.log(`   ✅ Update passed filter, processing...`);

		try {
			// Transform job result to widget data
			console.log(`   🔄 Transforming job result to widget data...`);
			const widgetData = transform(latestUpdate.result!);
			console.log(`   ✅ Transform successful:`, widgetData);

			// Publish to widget channel (with validation)
			console.log(`   📤 Publishing to widget channel...`);
			publisher.publish(widgetData);
			lastUpdate = new Date();
			lastError = undefined;

			console.log(`✅ [JobWidgetBridge:${bridgeId}] Successfully published data to widget channel`);
		} catch (error) {
			if (error instanceof z.ZodError) {
				lastError = error;
				console.error(`❌ [JobWidgetBridge:${bridgeId}] Validation error:`, error);
			} else {
				console.error(`❌ [JobWidgetBridge:${bridgeId}] Transform error:`, error);
			}
		}
	});

	console.log(`✅ [JobWidgetBridge:${bridgeId}] Bridge created and listening`);

	return {
		disconnect: () => {
			console.log(`\n🔌 [JobWidgetBridge:${bridgeId}] disconnect() called`);
			isConnected = false;
			unsubscribe();
			publisher.clear();
			console.log(`   ✅ Disconnected`);
		},
		getStatus: () => {
			console.log(`[JobWidgetBridge:${bridgeId}] getStatus() called`);
			return {
				connected: isConnected,
				lastUpdate,
				lastError
			};
		}
	};
}

// ===== Multi-Widget Bridge =====

/**
 * Bridge a single job to multiple widget channels
 * Useful when one AI job produces data for multiple widgets
 */
export function createJobMultiWidgetBridge(
	jobId: string,
	channels: Array<{
		config: WidgetChannelConfig;
		transformer: (jobResult: string) => any;
		filter?: (update: { status: string; result: string | null }) => boolean;
	}>
): JobWidgetBridge {
	console.log(`\n🌉🌉 [createJobMultiWidgetBridge] Creating multi-bridge for job: ${jobId}`);
	console.log(`   Number of channels: ${channels.length}`);
	
	const bridges = channels.map((channel, index) => {
		console.log(`   Creating bridge ${index + 1}/${channels.length} for channel: ${channel.config.channelId}`);
		return createJobWidgetBridge({
			jobId,
			channel: channel.config as any,
			transformer: channel.transformer,
			filter: channel.filter
		});
	});

	console.log(`✅ [createJobMultiWidgetBridge] All bridges created`);

	return {
		disconnect: () => {
			console.log(`\n🔌 [createJobMultiWidgetBridge] Disconnecting all bridges for job: ${jobId}`);
			bridges.forEach((bridge, index) => {
				console.log(`   Disconnecting bridge ${index + 1}/${bridges.length}`);
				bridge.disconnect();
			});
		},
		getStatus: () => {
			console.log(`[createJobMultiWidgetBridge] getStatus() called for job: ${jobId}`);
			const statuses = bridges.map((bridge) => bridge.getStatus());
			return {
				connected: statuses.some((s) => s.connected),
				lastUpdate: statuses.map((s) => s.lastUpdate).filter(Boolean).sort((a, b) => b!.getTime() - a!.getTime())[0],
				lastError: statuses.find((s) => s.lastError)?.lastError
			};
		}
	};
}

// ===== Convenience Functions =====

/**
 * Create a simple paragraph widget publisher
 */
export function createParagraphPublisher(
	channelId: string,
	publisherId: string
): ValidatedPublisher<WidgetDataTypeMap['paragraph']> {
	console.log(`\n🔧 [createParagraphPublisher] Called for channel: ${channelId}, publisher: ${publisherId}`);
	return createWidgetPublisher(
		{
			channelId,
			widgetType: 'paragraph',
			schema: z.object({
				title: z.string().optional(),
				content: z.string(),
				markdown: z.boolean().optional()
			})
		},
		publisherId
	);
}

/**
 * Create a simple paragraph widget consumer
 */
export function createParagraphConsumer(
	channelId: string,
	consumerId: string
): ValidatedConsumer<WidgetDataTypeMap['paragraph']> {
	console.log(`\n🔧 [createParagraphConsumer] Called for channel: ${channelId}, consumer: ${consumerId}`);
	return createWidgetConsumer(
		{
			channelId,
			widgetType: 'paragraph',
			schema: z.object({
				title: z.string().optional(),
				content: z.string(),
				markdown: z.boolean().optional()
			})
		},
		consumerId
	);
}

// ===== Hook for Svelte Components =====

/**
 * Create a reactive widget consumer for use in Svelte components
 * Returns a store that automatically validates data
 */
export function createReactiveWidgetConsumer<T extends WidgetType>(
	config: WidgetChannelConfig<T>,
	consumerId: string
): {
	subscribe: (callback: (data: WidgetDataTypeMap[T] | undefined) => void) => () => void;
	get: () => WidgetDataTypeMap[T] | undefined;
} {
	console.log(`\n🔧 [createReactiveWidgetConsumer] Called for channel: ${config.channelId}, consumer: ${consumerId}`);
	return createWidgetConsumer(config, consumerId);
}

// ===== Example Usage =====

/*
// In an AI job handler:
import { WidgetChannels } from './widgetSchemas';
import { createJobWidgetBridge } from './widgetBridge';

async function submitAIJob() {
  const jobId = await submitJob({ request: "Generate a summary", priority: "HIGH" });
  
  // Bridge job updates to paragraph widget
  const bridge = createJobWidgetBridge({
    jobId,
    channel: WidgetChannels.paragraphContent,
    transformer: (result) => {
      const parsed = JSON.parse(result);
      return {
        title: parsed.title,
        content: parsed.summary,
        markdown: true
      };
    }
  });
  
  return { jobId, bridge };
}

// In a widget component:
import { WidgetChannels } from '$lib/dashboard/types/widgetSchemas';
import { createWidgetConsumer } from '$lib/dashboard/types/widgetBridge';

const consumer = createWidgetConsumer(
  WidgetChannels.paragraphContent,
  'my-paragraph-widget'
);

consumer.subscribe((data) => {
  if (data) {
    console.log('Received validated data:', data);
    // data is fully typed as ParagraphWidgetData
  }
});
*/

