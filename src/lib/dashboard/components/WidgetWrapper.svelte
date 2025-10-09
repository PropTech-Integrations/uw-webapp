<script lang="ts">
    import type { Widget } from '$lib/dashboard/types/widget';
    import { createDragHandlers } from '$lib/dashboard/utils/drag-drop';
    import ResizeHandles from '$lib/dashboard/components/ResizeHandles.svelte';
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
    
    const dragHandlers = createDragHandlers(widget, {
      onDragStart,
      onDragEnd,
      onDrop: () => {} // Handled at container level
    });
  </script>
  
  <div
    class="widget-wrapper relative group h-full"
    style="
      grid-column: {widget.gridColumn} / span {widget.colSpan};
      grid-row: {widget.gridRow} / span {widget.rowSpan};
    "
    draggable={!widget.locked}
    ondragstart={dragHandlers.handleDragStart}
    ondragend={dragHandlers.handleDragEnd}
  >
    <div class="widget-content h-full bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border border-gray-200 overflow-hidden">
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
    
    {#if !widget.locked}
      <ResizeHandles widgetId={widget.id} />
    {/if}
  </div>
  
  <style>
    .widget-wrapper {
      cursor: move;
    }
    
    .widget-wrapper.dragging {
      opacity: 0.5;
    }
    
    .widget-wrapper[draggable="false"] {
      cursor: default;
    }
  </style>