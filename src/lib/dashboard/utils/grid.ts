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
	gap: number
): Position {
	const cellWidth = (containerRect.width - gap * (gridColumns - 1)) / gridColumns;
	const cellHeight = (containerRect.height - gap * (gridRows - 1)) / gridRows;

	const col = Math.min(
		Math.max(1, Math.floor((x - containerRect.left) / (cellWidth + gap)) + 1),
		gridColumns
	);
	const row = Math.min(
		Math.max(1, Math.floor((y - containerRect.top) / (cellHeight + gap)) + 1),
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
