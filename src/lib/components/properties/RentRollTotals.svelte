<script lang="ts">
  export let rentRollData: {
    units: number;
    sf: number;
    currentRent: string;
    rentPerSf: number;
    twelveMoRent: string;
    proformaRent: string;
    proformaRentPerSf: string;
    twelveMoProformaRent: string;
  };
</script>

<div class="bg-white border rounded-lg p-4 overflow-auto">
  <!-- headers -->
  <div class="grid grid-cols-8 text-center text-xs font-medium text-gray-500">
    <div>Units</div>
    <div>SF</div>
    <div>current rent</div>
    <div>rent/SF</div>
    <div>12 mo rent</div>
    <div>proforma rent</div>
    <div>proforma rent/SF</div>
    <div>12 mo proforma rent</div>
  </div>

  <!-- values -->
  <div class="grid grid-cols-8 text-center text-sm text-gray-900 mt-2">
    <div>{rentRollData.units}</div>
    <div>{rentRollData.sf.toLocaleString()}</div>
    <div>{rentRollData.currentRent}</div>
    <div>{rentRollData.rentPerSf}</div>
    <div>{rentRollData.twelveMoRent}</div>
    <div>{rentRollData.proformaRent}</div>
    <div>{rentRollData.proformaRentPerSf}</div>
    <div>{rentRollData.twelveMoProformaRent}</div>
  </div>
</div>
