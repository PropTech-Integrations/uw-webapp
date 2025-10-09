import type { Widget, DashboardConfig, DragState, ResizeState, Position } from '$lib/dashboard/types/widget';
import { isValidPosition, findAvailablePosition } from '$lib/dashboard/utils/grid';
import { DashboardStorage } from '$lib/dashboard/utils/storage';

class DashboardStore {
  // State using Svelte 5 runes
  widgets = $state<Widget[]>([]);
  widgetZIndexMap = $state<Map<string, number>>(new Map());
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

  // Auto-save configuration
  autoSaveEnabled = $state(true);
  autoSaveDelay = 1000;
  private autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;
  
  // Track if dashboard has been initialized from storage
  private initialized = false;
  private nextZIndex = 1;
  
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

  hasUnsavedChanges = $state(false);
  
  // Initialize from localStorage
  initialize(): boolean {
    if (this.initialized) return true;
    
    const savedState = DashboardStorage.loadDashboard();
    if (savedState) {
      this.widgets = savedState.widgets;
      this.config = savedState.config;
      
      // Initialize z-index for existing widgets
      this.widgets.forEach((widget, index) => {
        this.widgetZIndexMap.set(widget.id, index + 1);
        this.nextZIndex = Math.max(this.nextZIndex, index + 2);
      });
      
      this.initialized = true;
      console.info('Dashboard loaded from localStorage');
      return true;
    }
    
    this.initialized = true;
    return false;
  }
  
  // Save to localStorage
  save(): boolean {
    const success = DashboardStorage.saveDashboard(this.widgets, this.config);
    if (success) {
      this.hasUnsavedChanges = false;
      console.info('Dashboard saved to localStorage');
    }
    return success;
  }
  
  // Auto-save with debouncing
  private scheduleAutoSave() {
    if (!this.autoSaveEnabled) return;
    
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }
    
    this.autoSaveTimeout = setTimeout(() => {
      this.save();
      this.autoSaveTimeout = null;
    }, this.autoSaveDelay);
    
    this.hasUnsavedChanges = true;
  }
  
  // Clear saved dashboard
  clearSavedDashboard(): boolean {
    const success = DashboardStorage.clearDashboard();
    if (success) {
      console.info('Dashboard cleared from localStorage');
      this.hasUnsavedChanges = false;
    }
    return success;
  }
  
  // Export dashboard as JSON
  exportDashboard(): string | null {
    return DashboardStorage.exportDashboard();
  }
  
  // Import dashboard from JSON
  importDashboard(jsonString: string): boolean {
    const success = DashboardStorage.importDashboard(jsonString);
    if (success) {
      const savedState = DashboardStorage.loadDashboard();
      if (savedState) {
        this.widgets = savedState.widgets;
        this.config = savedState.config;
        this.hasUnsavedChanges = false;
        return true;
      }
    }
    return false;
  }
  
  // Reset to default layout
  resetToDefault() {
    this.widgets = [];
    this.widgetZIndexMap.clear();
    this.nextZIndex = 1;
    this.config = {
      gridColumns: 12,
      gridRows: 8,
      gap: 16,
      minCellHeight: 100
    };
    this.clearSavedDashboard();
  }
  
  // Widget management methods
  addWidget(widget: Widget) {
    if (this.canPlaceWidget(widget)) {
      this.widgets.push(widget);
      this.widgetZIndexMap.set(widget.id, this.nextZIndex++);
      this.scheduleAutoSave();
      return true;
    }
    return false;
  }
  
  removeWidget(id: string) {
    this.widgets = this.widgets.filter(w => w.id !== id);
    this.widgetZIndexMap.delete(id);
    this.scheduleAutoSave();
  }
  
  updateWidget(id: string, updates: Partial<Widget>) {
    const index = this.widgets.findIndex(w => w.id === id);
    if (index !== -1) {
      this.widgets[index] = { ...this.widgets[index], ...updates } as Widget;
      this.scheduleAutoSave();
    }
  }
  
  duplicateWidget(id: string) {
    const widget = this.widgets.find(w => w.id === id);
    if (!widget) return false;
    
    // Find an available position for the duplicate
    const position = findAvailablePosition(
      widget.colSpan,
      widget.rowSpan,
      this.config.gridColumns,
      this.config.gridRows,
      this.widgets
    );
    
    if (!position) {
      alert('No available space for duplicate widget');
      return false;
    }
    
    const newWidget: Widget = {
      ...widget,
      id: `widget-${Date.now()}`,
      gridColumn: position.gridColumn,
      gridRow: position.gridRow,
      title: widget.title ? `${widget.title} (Copy)` : undefined
    };
    
    this.addWidget(newWidget);
    return true;
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
  
  // Z-index management for layering
  bringWidgetToFront(id: string) {
    this.widgetZIndexMap.set(id, this.nextZIndex++);
    this.scheduleAutoSave();
  }
  
  sendWidgetToBack(id: string) {
    // Shift all z-indices up and put this one at 1
    const currentMin = Math.min(...Array.from(this.widgetZIndexMap.values()));
    this.widgetZIndexMap.set(id, currentMin - 1);
    this.scheduleAutoSave();
  }
  
  getWidgetZIndex(id: string): number {
    return this.widgetZIndexMap.get(id) || 0;
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
    this.scheduleAutoSave();
  }
  
  setAutoSave(enabled: boolean) {
    this.autoSaveEnabled = enabled;
    if (enabled && this.hasUnsavedChanges) {
      this.save();
    }
  }
}

export const dashboard = new DashboardStore();