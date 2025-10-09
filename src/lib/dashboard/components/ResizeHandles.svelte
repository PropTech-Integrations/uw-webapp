<script lang="ts">
    import { dashboard } from '$lib/dashboard/stores/dashboard.svelte';
    
    interface Props {
      widgetId: string;
    }
    
    let { widgetId }: Props = $props();
    let containerEl: HTMLElement;
    
    function startResize(
      event: MouseEvent, 
      handle: 'right' | 'bottom' | 'corner'
    ) {
      event.preventDefault();
      event.stopPropagation();
      
      const widget = dashboard.widgets.find(w => w.id === widgetId);
      if (!widget) return;
      
      dashboard.setResizeState({
        isResizing: true,
        activeWidgetId: widgetId,
        resizeHandle: handle
      });
      
      const startX = event.clientX;
      const startY = event.clientY;
      const startColSpan = widget.colSpan;
      const startRowSpan = widget.rowSpan;
      
      function handleMouseMove(e: MouseEvent) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        const container = document.querySelector('.dashboard-grid');
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        const cellWidth = rect.width / dashboard.config.gridColumns;
        const cellHeight = rect.height / dashboard.config.gridRows;
        
        let newColSpan = startColSpan;
        let newRowSpan = startRowSpan;
        
        if (handle === 'right' || handle === 'corner') {
          newColSpan = Math.max(1, startColSpan + Math.round(deltaX / cellWidth));
        }
        
        if (handle === 'bottom' || handle === 'corner') {
          newRowSpan = Math.max(1, startRowSpan + Math.round(deltaY / cellHeight));
        }
        
        dashboard.resizeWidget(widgetId, newColSpan, newRowSpan);
      }
      
      function handleMouseUp() {
        dashboard.resetInteractionStates();
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  </script>
  
  <div 
    bind:this={containerEl}
    class="resize-handles opacity-0 group-hover:opacity-100 transition-opacity"
  >
    <button
      class="resize-handle resize-right absolute top-2 right-0 w-1 h-[calc(100%-16px)] cursor-ew-resize bg-blue-500 hover:bg-blue-600 rounded-full"
      onmousedown={(e) => startResize(e, 'right')}
      aria-label="Resize width"
    />
    <button
      class="resize-handle resize-bottom absolute bottom-0 left-2 w-[calc(100%-16px)] h-1 cursor-ns-resize bg-blue-500 hover:bg-blue-600 rounded-full"
      onmousedown={(e) => startResize(e, 'bottom')}
      aria-label="Resize height"
    />
    <button
      class="resize-handle resize-corner absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize bg-blue-500 hover:bg-blue-600 rounded-tl-full"
      onmousedown={(e) => startResize(e, 'corner')}
      aria-label="Resize both dimensions"
    />
  </div>