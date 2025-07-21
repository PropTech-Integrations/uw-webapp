
<script lang="ts">
    export let info: {
      price: string;
      units: number;
      unitMix: string[];
      pricePerUnit: string;
      pricePerSF: string;
      ybYr: string;
      buildingSize: string;
      bedrooms: number;
    };
  </script>
  
  <div class="bg-white border rounded-lg p-6">
    <h2 class="text-lg font-semibold mb-4">PROPERTY INFO</h2>
    <dl class="space-y-2 text-sm text-gray-700">
      <div><dt class="font-medium inline">Price</dt> <dd class="inline float-right">{info.price}</dd></div>
      <div><dt class="font-medium inline">Units</dt> <dd class="inline float-right">{info.units}</dd></div>
      <div>
        <dt class="font-medium">Unit mix</dt>
        <dd class="flex flex-wrap justify-end gap-2">
          {#each info.unitMix as mix}
            <span class="px-2 py-1 bg-gray-100 rounded text-xs">{mix}</span>
          {/each}
        </dd>
      </div>
      <div><dt class="font-medium inline">Price per unit</dt> <dd class="inline float-right">{info.pricePerUnit}</dd></div>
      <div><dt class="font-medium inline">Price per SF</dt> <dd class="inline float-right">{info.pricePerSF}</dd></div>
      <div><dt class="font-medium inline">YB/YR</dt> <dd class="inline float-right">{info.ybYr}</dd></div>
      <div><dt class="font-medium inline">Building size (RSF)</dt> <dd class="inline float-right">{info.buildingSize}</dd></div>
      <div><dt class="font-medium inline">Bedrooms</dt> <dd class="inline float-right">{info.bedrooms}</dd></div>
      <!-- add remaining fields as needed -->
    </dl>
  </div>
  