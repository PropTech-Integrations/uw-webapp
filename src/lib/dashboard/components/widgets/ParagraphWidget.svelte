<script lang="ts">
    import type { ParagraphWidget } from '$lib/dashboard/types/widget';
    
    interface Props {
      data: ParagraphWidget['data'];
    }
    
    let { data }: Props = $props();
  </script>
  
  <div class="paragraph-widget h-full overflow-auto">
    {#if data.markdown}
      {@html data.content}
    {:else}
      <p class="text-gray-700 leading-relaxed">{data.content}</p>
    {/if}
  </div>