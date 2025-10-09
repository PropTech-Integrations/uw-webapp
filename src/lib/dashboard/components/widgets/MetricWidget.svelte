<script lang="ts">
    import type { MetricWidget } from '$lib/dashboard/types/widget';
    
    interface Props {
      data: MetricWidget['data'];
    }
    
    let { data }: Props = $props();
  </script>
  
  <div class="metric-widget h-full flex flex-col justify-center">
    <p class="text-sm text-gray-600 mb-1">{data.label}</p>
    <p class="text-3xl font-bold text-gray-900">
      {data.value}{data.unit ? ` ${data.unit}` : ''}
    </p>
    {#if data.change !== undefined}
      <p class="text-sm mt-2 flex items-center {data.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}">
        {#if data.changeType === 'increase'}
          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
          </svg>
        {:else}
          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
        {/if}
        {Math.abs(data.change)}%
      </p>
    {/if}
  </div>