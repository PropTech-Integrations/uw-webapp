<script lang="ts">
    import type { OperatingRow } from '$lib/types/property';
    
    export let operatingRows: OperatingRow[];
    export let units: number;
    export let sf: number;
  </script>
  
  <div class="bg-white border rounded-lg p-4 overflow-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="text-left text-gray-500">
          <th class="py-2"> </th>
          <th class="py-2">Current</th>
          <th class="py-2">Per Unit {units}</th>
          <th class="py-2">Per SF {sf}</th>
          <th class="py-2">Proforma</th>
          <th class="py-2">Per Unit {units}</th>
          <th class="py-2">Per SF {sf}</th>
        </tr>
      </thead>
      <tbody class="text-gray-900">
        {#each operatingRows as row, i}
          <tr class="{i < operatingRows.length - 1 ? 'border-b' : ''}">
            <td class="py-2 font-medium">{row.label}</td>
            <td class="py-2">{row.current}</td>
            <td class="py-2">{row.perUnitCurrent}</td>
            <td class="py-2">{row.perSfCurrent}</td>
            <td class="py-2">{row.proforma}</td>
            <td class="py-2">{row.perUnitProforma}</td>
            <td class="py-2">{row.perSfProforma}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  