<script lang="ts">
	import Dashboard from '$lib/dashboard/components/Dashboard.svelte';
	import DashboardControls from '$lib/dashboard/components/DashboardControls.svelte';
	import { dashboard } from '$lib/dashboard/stores/dashboard.svelte';
	import type { Widget } from '$lib/dashboard/types/widget';
	import { onMount } from 'svelte';
	
	let isLoading = $state(true);
	
	// Default widgets for first-time users
	const defaultWidgets: Widget[] = [
	  {
		id: 'widget-1',
		type: 'title',
		gridColumn: 1,
		gridRow: 1,
		colSpan: 4,
		rowSpan: 1,
		data: {
		  title: 'Dashboard Overview',
		  subtitle: 'Real-time metrics and analytics',
		  alignment: 'center'
		}
	  },
	  {
		id: 'widget-2',
		type: 'metric',
		gridColumn: 5,
		gridRow: 1,
		colSpan: 2,
		rowSpan: 2,
		data: {
		  label: 'Total Revenue',
		  value: '$45,231',
		  change: 12.5,
		  changeType: 'increase'
		}
	  },
	  {
		id: 'widget-3',
		type: 'metric',
		gridColumn: 7,
		gridRow: 1,
		colSpan: 2,
		rowSpan: 2,
		data: {
		  label: 'Active Users',
		  value: '1,234',
		  change: -3.2,
		  changeType: 'decrease'
		}
	  },
	  {
		id: 'widget-4',
		type: 'table',
		gridColumn: 1,
		gridRow: 2,
		colSpan: 4,
		rowSpan: 3,
		minHeight: 2,
		data: {
		  headers: ['Name', 'Status', 'Revenue', 'Growth'],
		  rows: [
			{ Name: 'Product A', Status: 'Active', Revenue: '$12,345', Growth: '+15%' },
			{ Name: 'Product B', Status: 'Active', Revenue: '$8,765', Growth: '+8%' },
			{ Name: 'Product C', Status: 'Pending', Revenue: '$5,432', Growth: '-2%' },
			{ Name: 'Product D', Status: 'Active', Revenue: '$9,876', Growth: '+22%' },
		  ],
		  sortable: true,
		  paginated: false
		}
	  },
	  {
		id: 'widget-5',
		type: 'lineChart',
		gridColumn: 9,
		gridRow: 1,
		colSpan: 4,
		rowSpan: 3,
		minWidth: 3,
		minHeight: 2,
		data: {
		  datasets: [
			{
			  label: 'Sales',
			  data: [30, 45, 28, 50, 62, 75, 88],
			  color: '#3B82F6'
			},
			{
			  label: 'Costs',
			  data: [20, 30, 25, 35, 40, 45, 50],
			  color: '#EF4444'
			}
		  ],
		  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
		}
	  },
	  {
		id: 'widget-6',
		type: 'paragraph',
		gridColumn: 1,
		gridRow: 5,
		colSpan: 8,
		rowSpan: 2,
		data: {
		  content: 'This dashboard demonstrates a flexible grid system with draggable and resizable widgets. Each widget can be moved to any available position and resized within its constraints. The layout is automatically saved to your browser\'s local storage.'
		}
	  },
	  {
		id: 'widget-7',
		type: 'barChart',
		gridColumn: 9,
		gridRow: 4,
		colSpan: 4,
		rowSpan: 3,
		minWidth: 2,
		minHeight: 2,
		data: {
		  datasets: [
			{
			  label: 'Q1 Performance',
			  data: [65, 78, 82, 91],
			  backgroundColor: '#10B981'
			}
		  ],
		  labels: ['Jan', 'Feb', 'Mar', 'Apr'],
		  orientation: 'vertical'
		}
	  }
	];
	
	onMount(() => {
	  // Try to load saved dashboard
	  const hasLoadedDashboard = dashboard.initialize();
	  
	  // If no saved dashboard, load defaults
	  if (!hasLoadedDashboard) {
		console.info('No saved dashboard found, loading defaults');
		defaultWidgets.forEach(widget => {
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
  
  <div class="min-h-screen bg-gray-100">
	<header class="bg-white shadow-sm border-b">
	  <div class="max-w-7xl mx-auto px-4 py-4">
		<h1 class="text-2xl font-bold text-gray-900">Drag & Drop Dashboard</h1>
		<p class="text-sm text-gray-600 mt-1">
		  Drag widgets to reposition • Hover and drag handles to resize • Auto-saves to browser
		</p>
	  </div>
	</header>
	
	<DashboardControls />
	
	<main class="max-w-7xl mx-auto p-4">
	  {#if isLoading}
		<div class="flex items-center justify-center h-64">
		  <div class="text-gray-600">Loading dashboard...</div>
		</div>
	  {:else}
		<div class="h-[calc(100vh-200px)]">
		  <Dashboard />
		</div>
	  {/if}
	</main>
  </div>