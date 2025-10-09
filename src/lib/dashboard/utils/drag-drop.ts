import type { Widget } from '$lib/dashboard/types/widget';

export interface DragDropHandlers {
  onDragStart: (widget: Widget) => void;
  onDragEnd: () => void;
  onDrop: (x: number, y: number) => void;
}

export function createDragHandlers(
  widget: Widget,
  handlers: DragDropHandlers
) {
  return {
    handleDragStart: (e: DragEvent) => {
      if (!e.dataTransfer) return;
      
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('application/json', JSON.stringify(widget));
      
      // Create drag image
      const dragImage = e.currentTarget as HTMLElement;
      e.dataTransfer.setDragImage(dragImage, e.offsetX, e.offsetY);
      
      handlers.onDragStart(widget);
    },
    
    handleDragEnd: () => {
      handlers.onDragEnd();
    }
  };
}

export function createDropHandlers(handlers: {
  onDragOver: (x: number, y: number) => void;
  onDrop: (x: number, y: number) => void;
  onDragLeave: () => void;
}) {
  return {
    handleDragOver: (e: DragEvent) => {
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'move';
      handlers.onDragOver(e.clientX, e.clientY);
    },
    
    handleDrop: (e: DragEvent) => {
      e.preventDefault();
      handlers.onDrop(e.clientX, e.clientY);
    },
    
    handleDragLeave: () => {
      handlers.onDragLeave();
    }
  };
}