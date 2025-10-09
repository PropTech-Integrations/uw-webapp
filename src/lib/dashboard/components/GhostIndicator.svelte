<script lang="ts">
	import type { Position, Size } from '$lib/dashboard/types/widget';

	interface Props {
		position: Position;
		size: Size;
	}

	let { position, size }: Props = $props();
</script>

<div
	class="ghost-indicator pointer-events-none absolute z-10 rounded-lg border-2 border-dashed border-blue-500 bg-blue-500/20"
	style="
      grid-column: {position.gridColumn} / span {size.colSpan};
      grid-row: {position.gridRow} / span {size.rowSpan};
    "
></div>
