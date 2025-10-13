<script lang="ts">
	import type { PageData } from './$types';
	import Dashboard from '$lib/dashboard/components/Dashboard.svelte';
	import DashboardControls from '$lib/dashboard/components/DashboardControls.svelte';
	import MapStoreDebugPanel from '$lib/dashboard/components/MapStoreDebugPanel.svelte';
	import ParagraphDisplayParent from '$lib/dashboard/examples/ParagraphDisplayParent.svelte';
	import { dashboard } from '$lib/dashboard/stores/dashboard.svelte';
	import type { Widget } from '$lib/dashboard/types/widget';
	import { onMount, setContext } from 'svelte';
	import { PUBLIC_GEOAPIFY_API_KEY } from '$env/static/public';
	import SimpleWidgetExample from '$lib/dashboard/examples/SimpleWidgetExample.svelte';
	import SimplifiedParagraphDisplay from '$lib/dashboard/examples/SimplifiedParagraphDisplay.svelte';
	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let isLoading = $state(true);
	
	// Set page data context for child components
	setContext('pageData', { currentUser: data.currentUser });



	const marketingWidgets: Widget[] = [
		{
			id: 'widget-1',
			type: 'title',
			gridColumn: 1,
			gridRow: 1,
			colSpan: 12,
			rowSpan: 1,
			data: {
				title: 'Market Analysis',
				subtitle: 'Real-time metrics and analytics',
				alignment: 'center'
			}
		},
		{
			id: 'widget-4',
			type: 'table',
			gridColumn: 9,
			gridRow: 2,
			colSpan: 4,
			rowSpan: 4,
			minHeight: 2,
			data: {
				title: 'City Statistics',
				headers: ['Name', 'Value'],
				rows: [
					{
						Name: 'City',
						Value: 'Hillsboro'
					},
					{
						Name: 'State',
						Value: 'Oregon'
					},
					{
						Name: 'County',
						Value: 'Washington'
					},
					{
						Name: 'Zip Codes',
						Value: '97124 97123'
					},
					{
						Name: 'Cost of Living',
						Value: '28.1% higher'
					},
					{
						Name: 'Time zone',
						Value: 'Pacific Standard Time (PST)'
					},
					{
						Name: 'Elevation',
						Value: '33 ft above sea level'
					}
				],
				sortable: true,
				paginated: false
			}
		},
		// {
		// 	id: 'widget-5',
		// 	type: 'image',
		// 	gridColumn: 1,
		// 	gridRow: 2,
		// 	colSpan: 8,
		// 	rowSpan: 4,
		// 	minWidth: 3,
		// 	minHeight: 2,
		// 	data: {
		// 		src: 'https://pti-demo-web-assets.s3.us-west-2.amazonaws.com/images/aaronmap.png',
		// 		alt: 'Image',
		// 		objectFit: 'cover'
		// 	}
		// },
		{
			id: 'widget-5',
			type: 'map',
			gridColumn: 1,
			gridRow: 2,
			colSpan: 8,
			rowSpan: 4,
			minWidth: 3,
			minHeight: 2,
			data: {
				title: 'Map of Hillsboro',
				lat: 45.513897,
				lon: -122.943565,
				zoom: 15,
				mapType: 'leaflet',
				apiKey: PUBLIC_GEOAPIFY_API_KEY
			}
		},
		{
			id: 'widget-6',
			type: 'paragraph',
			gridColumn: 1,
			gridRow: 6,
			colSpan: 12,
			rowSpan: 2,
			minWidth: 2,
			minHeight: 2,
			data: {
				title: 'Employment',
				content:
					'As of 2023, the workforce of Hillsboro is about 59,200 people. Employment grew ~ 1.8% from 2022 to 2023. The labor force participation rate (i.e. percent of working-age population that is working or seeking work) in Hillsboro is around 73%, which is higher than both the Portland MSA (~67%) and Oregon overall (~62.4%). In terms of industries employing residents, the top sectors are: Manufacturing (≈14,254 jobs), Health Care & Social Assistance (≈6,822), and Retail Trade (≈6,661). Regarding earnings: — Median household income in Hillsboro is ~$103,207. — Among industries, Manufacturing is one of the highest paying, with about $100,297 average/typical earnings.'
			}
		},
		{
			id: 'widget-8',
			type: 'metric',
			gridColumn: 1,
			gridRow: 8,
			colSpan: 2,
			rowSpan: 1,
			minWidth: 1,
			minHeight: 1,
			data: {
				label: 'MANUFACTURING',
				value: '10%'
			}
		},
		{
			id: 'widget-1760034441135',
			type: 'metric',
			gridColumn: 3,
			gridRow: 8,
			colSpan: 2,
			rowSpan: 1,
			minWidth: 1,
			minHeight: 1,
			data: {
				label: 'BUSINESS SERVICES',
				value: '16%'
			}
		},
		{
			id: 'widget-1760034444139',
			type: 'metric',
			gridColumn: 5,
			gridRow: 8,
			colSpan: 2,
			rowSpan: 1,
			minWidth: 1,
			minHeight: 1,
			data: {
				label: 'GOVERNMENT',
				value: '10%'
			}
		},
		{
			id: 'widget-1760034594067',
			type: 'metric',
			gridColumn: 7,
			gridRow: 8,
			colSpan: 2,
			rowSpan: 1,
			minWidth: 1,
			minHeight: 1,
			data: {
				label: 'HOSPITALITY',
				value: '10%'
			}
		},
		{
			id: 'widget-1760034597055',
			type: 'metric',
			gridColumn: 9,
			gridRow: 8,
			colSpan: 2,
			rowSpan: 1,
			minWidth: 1,
			minHeight: 1,
			data: {
				label: 'FINANCIAL ACTIVITIES',
				value: '10%'
			}
		},
		{
			id: 'widget-1760034608731',
			type: 'metric',
			gridColumn: 11,
			gridRow: 8,
			colSpan: 2,
			rowSpan: 1,
			minWidth: 1,
			minHeight: 1,
			data: {
				label: 'UTILITIES',
				value: '10%'
			}
		},
		{
			id: 'widget-1760034608732',
			type: 'metric',
			gridColumn: 11,
			gridRow: 9,
			colSpan: 2,
			rowSpan: 1,
			minWidth: 1,
			minHeight: 1,
			data: {
				label: 'CONSTRUCTION',
				value: '10%'
			}
		},
		{
			id: 'widget-1760034605935',
			type: 'metric',
			gridColumn: 1,
			gridRow: 9,
			colSpan: 2,
			rowSpan: 1,
			minWidth: 1,
			minHeight: 1,
			data: {
				label: 'EDUCATION AND HEALTH SERVICES',
				value: '10%'
			}
		},
		{
			id: 'widget-1760034612393',
			type: 'metric',
			gridColumn: 3,
			gridRow: 9,
			colSpan: 2,
			rowSpan: 1,
			minWidth: 1,
			minHeight: 1,
			data: {
				label: 'INFORMATION',
				value: '10%'
			}
		},
		{
			id: 'widget-1760034618243',
			type: 'metric',
			gridColumn: 5,
			gridRow: 9,
			colSpan: 2,
			rowSpan: 1,
			minWidth: 1,
			minHeight: 1,
			data: {
				label: 'OTHER SERVICES',
				value: '10%'
			}
		},
		{
			id: 'widget-1760034621635',
			type: 'metric',
			gridColumn: 7,
			gridRow: 9,
			colSpan: 2,
			rowSpan: 1,
			minWidth: 1,
			minHeight: 1,
			data: {
				label: 'MANUFACTURING',
				value: '10%'
			}
		},
		{
			id: 'widget-1760034624211',
			type: 'metric',
			gridColumn: 9,
			gridRow: 9,
			colSpan: 2,
			rowSpan: 1,
			minWidth: 1,
			minHeight: 1,
			data: {
				label: 'Total Revenue',
				value: '$45,231',
				change: 12.5,
				changeType: 'increase'
			}
		}
	];

	onMount(() => {
		// Try to load saved dashboard
		const hasLoadedDashboard = dashboard.initialize();

		// If no saved dashboard, load defaults
		if (!hasLoadedDashboard) {
			console.info('No saved dashboard found, loading defaults');
			marketingWidgets.forEach((widget) => {
				dashboard.addWidget(widget);
			});
		}

		// Handle responsive grid adjustment
		function updateGridSize() {
			const width = window.innerWidth;
			if (width < 640) {
				dashboard.updateGridConfig({ gridColumns: 4, gridRows: 12 });
			} else if (width < 1024) {
				dashboard.updateGridConfig({ gridColumns: 8, gridRows: 10 });
			} else {
				dashboard.updateGridConfig({ gridColumns: 12, gridRows: 8 });
			}
		}

		updateGridSize();
		window.addEventListener('resize', updateGridSize);

		// Save dashboard before page unload if there are unsaved changes
		window.addEventListener('beforeunload', (e) => {
			if (dashboard.hasUnsavedChanges && dashboard.autoSaveEnabled) {
				dashboard.save();
			}
		});

		isLoading = false;

		return () => {
			window.removeEventListener('resize', updateGridSize);
			// Save any pending changes
			if (dashboard.hasUnsavedChanges && dashboard.autoSaveEnabled) {
				dashboard.save();
			}
		};
	});

	// Keyboard shortcuts
	function handleKeydown(e: KeyboardEvent) {
		// Ctrl/Cmd + S to save
		if ((e.ctrlKey || e.metaKey) && e.key === 's') {
			e.preventDefault();
			dashboard.save();
		}
	}


</script>

<svelte:window onkeydown={handleKeydown} />

<div class="">
	<header class="border-b bg-white shadow-sm">
		<div class="mx-auto max-w-7xl px-4 py-4">
			<h1 class="text-2xl font-bold text-gray-900">Drag & Drop Dashboard</h1>
			<p class="mt-1 text-sm text-gray-600">
				Drag widgets to reposition • Hover and drag handles to resize • Auto-saves to browser
			</p>
		</div>
	</header>

	<DashboardControls />

	<!-- MapStore Debug Panel -->
	<div class="mx-auto max-w-7xl px-4 pb-4">
		<MapStoreDebugPanel />
	</div>

	<!-- AI Job → Paragraph Widget Example -->
	<!-- <div class="mx-auto max-w-7xl px-4 pb-4">
		<AIJobParagraphExample 
			idToken={data.idToken}
			prompt="Summarize the latest developments in AI technology in 2-3 paragraphs"
			widgetId="dashboard-ai-paragraph"
		/>
	</div> -->

	<!-- Simple Widget Example -->
	<!-- <div class="mx-auto max-w-7xl px-4 pb-4">
		<SimpleWidgetExample	 
			idToken={data.idToken}
		/>
	</div>  -->

	<!-- AI Job → Paragraph Widget Example -->
	<div class="mx-auto max-w-7xl px-4 pb-4">
		<ParagraphDisplayParent
			idToken={data.idToken}
			prompt="Write 2-3 sentences about the economy of Hillsboro, OR"
			widgetId="dashboard-ai-paragraph"
		/>
	</div>

	<!-- AI Job → Paragraph Widget Example -->
	<!-- <div class="mx-auto max-w-7xl px-4 pb-4">
		<SimplifiedParagraphDisplay
			idToken={data.idToken}
			widgetId="dashboard-simplified-paragraph"
		/>
	</div> -->

	<main class="mx-auto max-w-7xl p-4">
		{#if isLoading}
			<div class="flex h-64 items-center justify-center">
				<div class="text-gray-600">Loading dashboard...</div>
			</div>
		{:else}
			<!-- Removed fixed height constraint to allow grid to extend fully -->
			<div class="min-h-[800px]">
				<Dashboard />
			</div>
		{/if}
	</main>
</div>
