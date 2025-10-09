import type { Widget, DashboardConfig, DragState, ResizeState, Position } from '$lib/dashboard/types/widget';
import { isValidPosition } from '$lib/dashboard/utils/grid';

class DashboardStore {
  // State using Svelte 5 runes
  widgets = $state<Widget[]>([]);
  config = $state<DashboardConfig>({
    gridColumns: 12,
    gridRows: 8,
    gap: 16,
    minCellHeight: 100
  });
  
  dragState = $state<DragState>({
    isDragging: false,
    activeWidgetId: null,
    ghostPosition: null
  });
  
  resizeState = $state<ResizeState>({
    isResizing: false,
    activeWidgetId: null,
    resizeHandle: null
  });
  
  // Derived state
  gridCells = $derived.by(() => {
    const cells: boolean[][] = [];
    for (let row = 0; row < this.config.gridRows; row++) {
      cells[row] = new Array(this.config.gridColumns).fill(false);
    }
    
    this.widgets.forEach(widget => {
      for (let r = 0; r < widget.rowSpan; r++) {
        for (let c = 0; c < widget.colSpan; c++) {
          const row = widget.gridRow - 1 + r;
          const col = widget.gridColumn - 1 + c;
          if (row < this.config.gridRows && col < this.config.gridColumns) {
            cells[row][col] = true;
          }
        }
      }
    });
    
    return cells;
  });
  
  activeWidget = $derived.by(() => {
    const id = this.dragState.activeWidgetId || this.resizeState.activeWidgetId;
    return id ? this.widgets.find(w => w.id === id) : null;
  });
  
  // Methods
  addWidget(widget: Widget) {
    if (this.canPlaceWidget(widget)) {
      this.widgets.push(widget);
      return true;
    }
    return false;
  }
  
  removeWidget(id: string) {
    this.widgets = this.widgets.filter(w => w.id !== id);
  }
  
  updateWidget(id: string, updates: Partial<Widget>) {
    const index = this.widgets.findIndex(w => w.id === id);
    if (index !== -1) {
      this.widgets[index] = { ...this.widgets[index], ...updates } as Widget;
    }
  }
  
  moveWidget(id: string, position: Position) {
    const widget = this.widgets.find(w => w.id === id);
    if (widget && this.canPlaceWidget({ ...widget, ...position }, id)) {
      this.updateWidget(id, position);
      return true;
    }
    return false;
  }
  
  resizeWidget(id: string, colSpan: number, rowSpan: number) {
    const widget = this.widgets.find(w => w.id === id);
    if (!widget) return false;
    
    // Check constraints
    const newColSpan = Math.max(
      widget.minWidth || 1,
      Math.min(widget.maxWidth || this.config.gridColumns, colSpan)
    );
    const newRowSpan = Math.max(
      widget.minHeight || 1,
      Math.min(widget.maxHeight || this.config.gridRows, rowSpan)
    );
    
    if (this.canPlaceWidget({ ...widget, colSpan: newColSpan, rowSpan: newRowSpan }, id)) {
      this.updateWidget(id, { colSpan: newColSpan, rowSpan: newRowSpan });
      return true;
    }
    return false;
  }
  
  canPlaceWidget(widget: Partial<Widget> & Position & { colSpan: number; rowSpan: number }, excludeId?: string): boolean {
    return isValidPosition(
      widget.gridColumn,
      widget.gridRow,
      widget.colSpan,
      widget.rowSpan,
      this.config.gridColumns,
      this.config.gridRows,
      this.widgets.filter(w => w.id !== excludeId)
    );
  }
  
  setDragState(state: Partial<DragState>) {
    this.dragState = { ...this.dragState, ...state };
  }
  
  setResizeState(state: Partial<ResizeState>) {
    this.resizeState = { ...this.resizeState, ...state };
  }
  
  resetInteractionStates() {
    this.dragState = {
      isDragging: false,
      activeWidgetId: null,
      ghostPosition: null
    };
    this.resizeState = {
      isResizing: false,
      activeWidgetId: null,
      resizeHandle: null
    };
  }
  
  updateGridConfig(config: Partial<DashboardConfig>) {
    this.config = { ...this.config, ...config };
  }
}

export const dashboard = new DashboardStore();