<script lang="ts">
    import type { BarChartWidget } from '$lib/dashboard/types/widget';
    
    interface Props {
      data: BarChartWidget['data'];
    }
    
    let { data }: Props = $props();
    
    // Note: You'll need to integrate with a charting library like Chart.js
    // This is a placeholder implementation
  </script>
  
  <div class="bar-chart-widget h-full flex items-center justify-center bg-gray-50 rounded">
    <div class="text-center">
      <p class="text-gray-600 mb-2">Bar Chart ({data.orientation || 'vertical'})</p>
      <p class="text-sm text-gray-500">
        {data.datasets.length} dataset(s) with {data.labels.length} bars
      </p>
      <!-- Integrate Chart.js or similar library here -->
    </div>
  </div>