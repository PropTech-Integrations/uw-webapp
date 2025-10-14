import type { Widget, Position } from '$lib/dashboard/types/widget';

export function isValidPosition(
	col: number,
	row: number,
	colSpan: number,
	rowSpan: number,
	maxCols: number,
	maxRows: number,
	widgets: Widget[]
): boolean {
	// Check bounds
	if (col < 1 || row < 1 || col + colSpan - 1 > maxCols || row + rowSpan - 1 > maxRows) {
		return false;
	}

	// Check for collisions with other widgets
	for (const widget of widgets) {
		const collision = !(
			col + colSpan <= widget.gridColumn ||
			widget.gridColumn + widget.colSpan <= col ||
			row + rowSpan <= widget.gridRow ||
			widget.gridRow + widget.rowSpan <= row
		);

		if (collision) return false;
	}

	return true;
}

export function getGridPositionFromCoordinates(
	x: number,
	y: number,
	containerRect: DOMRect,
	gridColumns: number,
	gridRows: number,
	gap: number,
	minCellHeight: number,
	padding: number = 16 // p-4 class = 1rem = 16px
): Position {
	// Account for padding on the container
	const effectiveWidth = containerRect.width - (padding * 2);
	
	// Calculate cell dimensions including gaps
	const totalGapWidth = gap * (gridColumns - 1);
	const totalGapHeight = gap * (gridRows - 1);
	
	const cellWidth = (effectiveWidth - totalGapWidth) / gridColumns;
	// Use the actual minCellHeight from the grid configuration
	const cellHeight = minCellHeight;

	// Calculate relative position within the grid
	// The grid starts at container.left + padding, and container.top + padding
	const gridLeft = containerRect.left + padding;
	const gridTop = containerRect.top + padding;
	
	const relativeX = x - gridLeft;
	const relativeY = y - gridTop;

	// Calculate column and row
	const col = Math.min(
		Math.max(1, Math.floor(relativeX / (cellWidth + gap)) + 1),
		gridColumns
	);
	const row = Math.min(
		Math.max(1, Math.floor(relativeY / (cellHeight + gap)) + 1),
		gridRows
	);

	return { gridColumn: col, gridRow: row };
}

export function findAvailablePosition(
	colSpan: number,
	rowSpan: number,
	gridColumns: number,
	gridRows: number,
	widgets: Widget[]
): Position | null {
	for (let row = 1; row <= gridRows - rowSpan + 1; row++) {
		for (let col = 1; col <= gridColumns - colSpan + 1; col++) {
			if (isValidPosition(col, row, colSpan, rowSpan, gridColumns, gridRows, widgets)) {
				return { gridColumn: col, gridRow: row };
			}
		}
	}
	return null;
}
