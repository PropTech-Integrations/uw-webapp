<script lang="ts">
    import type { Position, Size } from '$lib/dashboard/types/widget';
    
    interface Props {
      position: Position;
      size: Size;
    }
    
    let { position, size }: Props = $props();
  </script>
  
  <div
    class="ghost-indicator absolute bg-blue-500/20 border-2 border-dashed border-blue-500 rounded-lg pointer-events-none z-10"
    style="
      grid-column: {position.gridColumn} / span {size.colSpan};
      grid-row: {position.gridRow} / span {size.rowSpan};
    "
  />