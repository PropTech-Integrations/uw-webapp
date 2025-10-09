<script lang="ts">
    import type { TitleWidget } from '$lib/dashboard/types/widget';
    
    interface Props {
      data: TitleWidget['data'];
    }
    
    let { data }: Props = $props();
  </script>
  
  <div class="title-widget h-full flex flex-col justify-center text-{data.alignment || 'left'}">
    <h2 class="text-2xl font-bold text-gray-800">{data.title}</h2>
    {#if data.subtitle}
      <p class="text-sm text-gray-600 mt-1">{data.subtitle}</p>
    {/if}
  </div>