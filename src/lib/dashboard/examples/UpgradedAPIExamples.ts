/**
 * Widget Bridge Upgraded API - Complete Examples
 * 
 * This file demonstrates all the new features of the upgraded Widget Bridge system.
 * All examples are fully typed and ready to use.
 */

import {
	Publishers,
	Consumers,
	WidgetStores,
	bridgeJobToWidget,
	bridgeJobToMultipleWidgets,
	type JobWidgetBridge
} from '$lib/dashboard/types/widgetBridge';
import { WidgetChannels } from '$lib/dashboard/types/widgetSchemas';

// ============================================================================
// Example 1: Publishing Data with Presets
// ============================================================================

export function example1_SimplePublishing() {
	// Create a publisher for a paragraph widget
	const paragraphPublisher = Publishers.paragraph('sales-summary', 'data-service');

	// Publish data (auto-validated & auto-saved to localStorage)
	paragraphPublisher.publish({
		title: 'Q4 Sales Summary',
		content: 'Total sales increased by 23% compared to Q3...',
		markdown: true
	});

	// Create a metric publisher
	const metricPublisher = Publishers.metric('revenue', 'analytics-service');

	metricPublisher.publish({
		label: 'Total Revenue',
		value: 1250000,
		unit: '$',
		change: 23.5,
		changeType: 'increase'
	});

	// Create a table publisher
	const tablePublisher = Publishers.table('top-products', 'data-service');

	tablePublisher.publish({
		title: 'Top 5 Products',
		headers: ['Product', 'Sales', 'Change'],
		rows: [
			{ Product: 'Widget A', Sales: '$125,000', Change: '+15%' },
			{ Product: 'Widget B', Sales: '$98,000', Change: '+8%' },
			{ Product: 'Widget C', Sales: '$87,000', Change: '-3%' }
		],
		sortable: true,
		paginated: false
	});
}

// ============================================================================
// Example 2: Consuming Data with Presets
// ============================================================================

export function example2_SimpleConsuming() {
	// Create a consumer for a paragraph widget
	const consumer = Consumers.paragraph('sales-summary', 'widget-display');

	// Subscribe to data updates
	const unsubscribe = consumer.subscribe((data) => {
		if (data) {
			console.log('New paragraph data:', data);
			console.log('Title:', data.title);
			console.log('Content:', data.content);
			console.log('Is Markdown:', data.markdown);
		}
	});

	// Get current data synchronously
	const currentData = consumer.get();
	console.log('Current data:', currentData);

	// Don't forget to unsubscribe when done
	return unsubscribe;
}

// ============================================================================
// Example 3: Reactive Svelte Stores
// ============================================================================

export function example3_SvelteStores() {
	// Create reactive stores for different widget types
	const paragraphStore = WidgetStores.paragraph('summary', 'widget-1');
	const metricStore = WidgetStores.metric('revenue', 'widget-2');
	const chartStore = WidgetStores.lineChart('trends', 'widget-3');

	// Subscribe to updates (works like any Svelte store)
	const unsubscribe1 = paragraphStore.subscribe((data) => {
		console.log('Paragraph updated:', data);
	});

	const unsubscribe2 = metricStore.subscribe((data) => {
		console.log('Metric updated:', data);
	});

	const unsubscribe3 = chartStore.subscribe((data) => {
		console.log('Chart updated:', data);
	});

	// Cleanup
	return () => {
		unsubscribe1();
		unsubscribe2();
		unsubscribe3();
	};
}

// ============================================================================
// Example 4: Simple AI Job to Widget Bridge
// ============================================================================

export async function example4_SimpleJobBridge(submitJob: (params: any) => Promise<string>) {
	// Submit AI job
	const jobId = await submitJob({
		request: 'Generate a summary of Q4 sales performance',
		priority: 'HIGH'
	});

	// Bridge job to paragraph widget (NEW CLEANER API)
	const bridge = bridgeJobToWidget({
		jobId,
		channel: WidgetChannels.paragraph('sales-summary'),
		transformer: (result) => {
			const data = JSON.parse(result);
			return {
				title: 'Q4 Sales Summary',
				content: data.summary,
				markdown: true
			};
		}
	});

	// Check bridge status
	console.log('Bridge status:', bridge.getStatus());

	// Cleanup when done
	// bridge.disconnect();

	return bridge;
}

// ============================================================================
// Example 5: Multi-Widget Dashboard from Single Job
// ============================================================================

export async function example5_MultiWidgetDashboard(submitJob: (params: any) => Promise<string>) {
	// Submit comprehensive analysis job
	const jobId = await submitJob({
		request: `Analyze Q4 2024 performance and provide:
			1. Total revenue metric
			2. Monthly revenue trend chart
			3. Detailed analysis paragraph
			4. Top products table`,
		priority: 'HIGH'
	});

	// Bridge to multiple widgets at once
	const bridge = bridgeJobToMultipleWidgets(jobId, [
		// Metric: Total Revenue
		{
			channel: WidgetChannels.metric('q4-revenue'),
			transformer: (result) => {
				const data = JSON.parse(result);
				return {
					label: 'Q4 Revenue',
					value: data.totalRevenue,
					change: data.revenueChange,
					changeType: data.revenueChange > 0 ? 'increase' : 'decrease',
					unit: '$'
				};
			}
		},

		// Chart: Revenue Trend
		{
			channel: WidgetChannels.lineChart('revenue-trend'),
			transformer: (result) => {
				const data = JSON.parse(result);
				return {
					datasets: [
						{
							label: 'Revenue',
							data: data.monthlyRevenue,
							color: '#10b981'
						}
					],
					labels: ['October', 'November', 'December']
				};
			}
		},

		// Paragraph: Analysis
		{
			channel: WidgetChannels.paragraph('q4-analysis'),
			transformer: (result) => {
				const data = JSON.parse(result);
				return {
					title: 'Q4 Analysis',
					content: data.analysis,
					markdown: true
				};
			}
		},

		// Table: Top Products
		{
			channel: WidgetChannels.table('top-products'),
			transformer: (result) => {
				const data = JSON.parse(result);
				return {
					title: 'Top 10 Products',
					headers: ['Product', 'Revenue', 'Growth'],
					rows: data.topProducts,
					sortable: true,
					paginated: true
				};
			}
		}
	]);

	console.log('Multi-widget bridge status:', bridge.getStatus());

	return bridge;
}

// ============================================================================
// Example 6: Real-time Data Service with Publishers
// ============================================================================

export class RealtimeMetricService {
	private publisher: ReturnType<typeof Publishers.metric>;
	private intervalId: NodeJS.Timeout | null = null;

	constructor(private channelId: string, private serviceId: string) {
		this.publisher = Publishers.metric(channelId, serviceId);
	}

	start() {
		console.log(`Starting realtime service for channel: ${this.channelId}`);

		// Simulate realtime updates every second
		this.intervalId = setInterval(() => {
			const value = Math.random() * 100;
			const change = (Math.random() - 0.5) * 20;

			this.publisher.publish({
				label: 'CPU Usage',
				value: value.toFixed(1),
				unit: '%',
				change: Math.abs(change),
				changeType: change > 0 ? 'increase' : 'decrease'
			});
		}, 1000);
	}

	stop() {
		console.log(`Stopping realtime service for channel: ${this.channelId}`);

		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}

		// Clear the channel data
		this.publisher.clear();
	}
}

// Usage:
// const service = new RealtimeMetricService('cpu-usage', 'monitoring-service');
// service.start();
// ... later ...
// service.stop();

// ============================================================================
// Example 7: Dynamic Channel Creation for Multiple Instances
// ============================================================================

export function example7_DynamicChannels() {
	// Create unique channels for multiple widget instances
	const widgets = ['widget-1', 'widget-2', 'widget-3'];

	const publishers = widgets.map((widgetId) => {
		// Each widget gets its own unique channel
		return Publishers.paragraph(`paragraph-${widgetId}`, `service-${widgetId}`);
	});

	// Publish different data to each
	publishers[0].publish({ content: 'Content for widget 1', markdown: false });
	publishers[1].publish({ content: 'Content for widget 2', markdown: false });
	publishers[2].publish({ content: 'Content for widget 3', markdown: false });

	return publishers;
}

// ============================================================================
// Example 8: Complex Transformation with Error Handling
// ============================================================================

export async function example8_ComplexTransformation(
	submitJob: (params: any) => Promise<string>
) {
	const jobId = await submitJob({
		request: 'Generate complex analytics data',
		priority: 'HIGH'
	});

	const bridge = bridgeJobToWidget({
		jobId,
		channel: WidgetChannels.table('analytics-table'),
		transformer: (result) => {
			try {
				const rawData = JSON.parse(result);

				// Complex transformation logic
				const processedRows = rawData.items.map((item: any) => ({
					Name: item.name,
					Value: `$${item.value.toLocaleString()}`,
					Change: `${item.change > 0 ? '+' : ''}${item.change}%`,
					Status: item.change > 0 ? '✅' : '⚠️'
				}));

				return {
					title: 'Analytics Report',
					headers: ['Name', 'Value', 'Change', 'Status'],
					rows: processedRows,
					sortable: true,
					paginated: processedRows.length > 10
				};
			} catch (error) {
				console.error('Transformation error:', error);
				// Return fallback data
				return {
					title: 'Error',
					headers: ['Message'],
					rows: [{ Message: 'Failed to process data' }]
				};
			}
		},
		// Optional: Custom filter
		filter: (update) => {
			// Only process completed jobs with valid results
			return update.status === 'COMPLETED' && update.result !== null && update.result !== '';
		}
	});

	return bridge;
}

// ============================================================================
// Example 9: Service Class with Multiple Publishers
// ============================================================================

export class DashboardDataService {
	private metricPublisher: ReturnType<typeof Publishers.metric>;
	private paragraphPublisher: ReturnType<typeof Publishers.paragraph>;
	private chartPublisher: ReturnType<typeof Publishers.lineChart>;

	constructor() {
		this.metricPublisher = Publishers.metric('dashboard-metric', 'dashboard-service');
		this.paragraphPublisher = Publishers.paragraph('dashboard-summary', 'dashboard-service');
		this.chartPublisher = Publishers.lineChart('dashboard-chart', 'dashboard-service');
	}

	updateMetric(label: string, value: number, unit: string) {
		this.metricPublisher.publish({
			label,
			value,
			unit,
			changeType: 'increase'
		});
	}

	updateSummary(content: string, markdown: boolean = true) {
		this.paragraphPublisher.publish({
			title: 'Dashboard Summary',
			content,
			markdown
		});
	}

	updateChart(labels: string[], data: number[]) {
		this.chartPublisher.publish({
			datasets: [
				{
					label: 'Metrics',
					data,
					color: '#3b82f6'
				}
			],
			labels
		});
	}

	clearAll() {
		this.metricPublisher.clear();
		this.paragraphPublisher.clear();
		this.chartPublisher.clear();
	}
}

// Usage:
// const service = new DashboardDataService();
// service.updateMetric('Revenue', 125000, '$');
// service.updateSummary('Q4 was excellent...');
// service.updateChart(['Oct', 'Nov', 'Dec'], [100, 120, 150]);

// ============================================================================
// Example 10: All Widget Types at Once
// ============================================================================

export function example10_AllWidgetTypes() {
	// Publishers for all 8 widget types
	const publishers = {
		paragraph: Publishers.paragraph('all-paragraph', 'demo'),
		table: Publishers.table('all-table', 'demo'),
		metric: Publishers.metric('all-metric', 'demo'),
		lineChart: Publishers.lineChart('all-line-chart', 'demo'),
		barChart: Publishers.barChart('all-bar-chart', 'demo'),
		title: Publishers.title('all-title', 'demo'),
		image: Publishers.image('all-image', 'demo'),
		map: Publishers.map('all-map', 'demo')
	};

	// Publish sample data to each
	publishers.paragraph.publish({
		content: 'Sample paragraph content',
		markdown: true
	});

	publishers.table.publish({
		headers: ['Col1', 'Col2'],
		rows: [{ Col1: 'A', Col2: 'B' }]
	});

	publishers.metric.publish({
		label: 'Sample Metric',
		value: 42,
		unit: 'units'
	});

	publishers.lineChart.publish({
		datasets: [{ label: 'Data', data: [1, 2, 3], color: '#000' }],
		labels: ['A', 'B', 'C']
	});

	publishers.barChart.publish({
		datasets: [{ label: 'Data', data: [1, 2, 3], backgroundColor: '#000' }],
		labels: ['A', 'B', 'C']
	});

	publishers.title.publish({
		title: 'Sample Title',
		subtitle: 'Sample Subtitle'
	});

	publishers.image.publish({
		src: 'https://example.com/image.jpg',
		alt: 'Sample Image'
	});

	publishers.map.publish({
		lat: 37.7749,
		lon: -122.4194,
		zoom: 12,
		mapType: 'leaflet',
		apiKey: 'your-api-key'
	});

	return publishers;
}

// ============================================================================
// Export All Examples
// ============================================================================

export const examples = {
	example1_SimplePublishing,
	example2_SimpleConsuming,
	example3_SvelteStores,
	example4_SimpleJobBridge,
	example5_MultiWidgetDashboard,
	example7_DynamicChannels,
	example8_ComplexTransformation,
	example10_AllWidgetTypes,
	RealtimeMetricService,
	DashboardDataService
};

