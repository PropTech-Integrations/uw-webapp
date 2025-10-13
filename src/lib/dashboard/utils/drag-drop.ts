import type { Widget } from '$lib/dashboard/types/widget';

export interface DragDropHandlers {
	onDragStart: (widget: Widget) => void;
	onDragEnd: () => void;
	onDrop: (x: number, y: number) => void;
}

export function createDragHandlers(widget: Widget, handlers: DragDropHandlers) {
	return {
		handleDragStart: (e: DragEvent) => {
			if (!e.dataTransfer) return;

			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('application/json', JSON.stringify(widget));

			// Create a better drag image from the widget element
			const dragImage = e.currentTarget as HTMLElement;
			
			// Calculate the offset from the element's top-left corner
			// Use the position within the element where the mouse grabbed it
			const rect = dragImage.getBoundingClientRect();
			const offsetX = e.clientX - rect.left;
			const offsetY = e.clientY - rect.top;
			
			// Set drag image with proper offset so cursor aligns with grab point
			e.dataTransfer.setDragImage(dragImage, offsetX, offsetY);

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
