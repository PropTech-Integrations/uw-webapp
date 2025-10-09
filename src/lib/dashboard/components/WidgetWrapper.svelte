<script lang="ts">
  import type { Widget, WidgetAction } from '$lib/dashboard/types/widget';
  import { createDragHandlers } from '$lib/dashboard/utils/drag-drop';
  import { dashboard } from '$lib/dashboard/stores/dashboard.svelte';
  import ResizeHandles from './ResizeHandles.svelte';
  import WidgetDropdown from './WidgetDropdown.svelte';
  import TitleWidget from '$lib/dashboard/components/widgets/TitleWidget.svelte';
  import ParagraphWidget from '$lib/dashboard/components/widgets/ParagraphWidget.svelte';
  import TableWidget from '$lib/dashboard/components/widgets/TableWidget.svelte';
  import ImageWidget from '$lib/dashboard/components/widgets/ImageWidget.svelte';
  import LineChartWidget from '$lib/dashboard/components/widgets/LineChartWidget.svelte';
  import BarChartWidget from '$lib/dashboard/components/widgets/BarChartWidget.svelte';
  import MetricWidget from '$lib/dashboard/components/widgets/MetricWidget.svelte';
  
  interface Props {
    widget: Widget;
    onDragStart: (widget: Widget) => void;
    onDragEnd: () => void;
  }
  
  let { widget, onDragStart, onDragEnd }: Props = $props();
  let showEditDialog = $state(false);
  
  const dragHandlers = createDragHandlers(widget, {
    onDragStart,
    onDragEnd,
    onDrop: () => {}
  });
  
  function handleWidgetAction(action: WidgetAction) {
    switch (action) {
      case 'edit':
        showEditDialog = true;
        break;
        
      case 'duplicate':
        dashboard.duplicateWidget(widget.id);
        break;
        
      case 'lock':
        dashboard.updateWidget(widget.id, { locked: true });
        break;
        
      case 'unlock':
        dashboard.updateWidget(widget.id, { locked: false });
        break;
        
      case 'bringToFront':
        dashboard.bringWidgetToFront(widget.id);
        break;
        
      case 'sendToBack':
        dashboard.sendWidgetToBack(widget.id);
        break;
        
      case 'exportData':
        exportWidgetData();
        break;
        
      case 'refresh':
        refreshWidgetData();
        break;
        
      case 'settings':
        showEditDialog = true;
        break;
        
      case 'remove':
        if (confirm(`Are you sure you want to remove this ${widget.type} widget?`)) {
          dashboard.removeWidget(widget.id);
        }
        break;
    }
  }
  
  function exportWidgetData() {
    const dataStr = JSON.stringify(widget.data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${widget.type}-${widget.id}-data.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  function refreshWidgetData() {
    // Implement data refresh logic here
    console.log('Refreshing widget data:', widget.id);
    // You could emit an event or call an API to refresh the widget's data
  }
  
  // Calculate z-index for layering
  let zIndex = $derived(dashboard.getWidgetZIndex(widget.id));
</script>

<div
  role="button"
  tabindex="0"
  class="widget-wrapper relative group h-full"
  style="
    grid-column: {widget.gridColumn} / span {widget.colSpan};
    grid-row: {widget.gridRow} / span {widget.rowSpan};
    z-index: {zIndex};
  "
  draggable={!widget.locked}
  ondragstart={dragHandlers.handleDragStart}
  ondragend={dragHandlers.handleDragEnd}
>
  <div class="widget-content h-full bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden">
    <!-- Widget Header (if title is set) -->
    {#if widget.title}
      <div class="widget-header px-4 py-2 bg-gray-50 border-b border-gray-200">
        <h3 class="text-sm font-medium text-gray-700">{widget.title}</h3>
        {#if widget.description}
          <p class="text-xs text-gray-500 mt-0.5">{widget.description}</p>
        {/if}
      </div>
    {/if}
    
    <!-- Widget Body -->
    <div class="widget-body {widget.title ? 'p-4' : 'p-4 h-full'}">
      {#if widget.type === 'title'}
        <TitleWidget data={widget.data} />
      {:else if widget.type === 'paragraph'}
        <ParagraphWidget data={widget.data} />
      {:else if widget.type === 'table'}
        <TableWidget data={widget.data} />
      {:else if widget.type === 'image'}
        <ImageWidget data={widget.data} />
      {:else if widget.type === 'lineChart'}
        <LineChartWidget data={widget.data} />
      {:else if widget.type === 'barChart'}
        <BarChartWidget data={widget.data} />
      {:else if widget.type === 'metric'}
        <MetricWidget data={widget.data} />
      {/if}
    </div>
    
    <!-- Lock indicator -->
    {#if widget.locked}
      <div class="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
      </div>
    {/if}
  </div>
  
  <!-- Dropdown Menu -->
  <WidgetDropdown {widget} onAction={handleWidgetAction} />
  
  <!-- Resize Handles -->
  {#if !widget.locked}
    <ResizeHandles widgetId={widget.id} />
  {/if}
</div>

<!-- Edit Dialog -->
{#if showEditDialog}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style="z-index: 10000;">
    <div class="bg-white rounded-lg p-6 max-w-md w-full">
      <h3 class="text-lg font-semibold mb-4">Edit Widget</h3>
      
      <div class="space-y-4">
        <div>
          <label for="widget-title-{widget.id}" class="block text-sm font-medium text-gray-700 mb-1">
            Widget Title
          </label>
          <input
            id="widget-title-{widget.id}"
            type="text"
            value={widget.title || ''}
            oninput={(e) => dashboard.updateWidget(widget.id, { title: e.currentTarget.value })}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter widget title..."
          />
        </div>
        
        <div>
          <label for="widget-description-{widget.id}" class="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="widget-description-{widget.id}"
            value={widget.description || ''}
            oninput={(e) => dashboard.updateWidget(widget.id, { description: e.currentTarget.value })}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Enter widget description..."
          ></textarea>
        </div>
        
        <div>
          <div class="block text-sm font-medium text-gray-700 mb-1">
            Widget Type
          </div>
          <p class="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
            {widget.type}
          </p>
        </div>
        
        <div>
          <div class="block text-sm font-medium text-gray-700 mb-1">
            Position & Size
          </div>
          <div class="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div class="bg-gray-50 px-3 py-2 rounded">
              Column: {widget.gridColumn}, Row: {widget.gridRow}
            </div>
            <div class="bg-gray-50 px-3 py-2 rounded">
              Width: {widget.colSpan}, Height: {widget.rowSpan}
            </div>
          </div>
        </div>
      </div>
      
      <div class="flex justify-end gap-2 mt-6">
        <button
          onclick={() => showEditDialog = false}
          class="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .widget-wrapper {
    cursor: move;
    position: relative;
  }
  
  .widget-wrapper[draggable="false"] {
    cursor: default;
  }
  
  .widget-wrapper.dragging {
    opacity: 0.5;
  }
  
  .widget-content {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .widget-body {
    flex: 1;
    overflow: auto;
  }
</style>