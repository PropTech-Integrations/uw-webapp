<script lang="ts">
  export let acquisition: {
    holdTerm: string;
    exitCap: string;
    workingCapital: string;
    acquisitionDate: string;
    totalCashToClose: string;
    totalAcquisitionCosts: string;
    decisionCriteria: { label: string; current: string; target: string }[];
  };
</script>

<div class="bg-white border rounded-lg p-6 flex flex-col justify-between">
  <div>
    <h2 class="text-lg font-semibold mb-4">ACQUISITION & SALE</h2>
    <dl class="text-sm text-gray-700 space-y-2">
      <div><dt class="font-medium inline">Hold term</dt> <dd class="inline float-right">{acquisition.holdTerm}</dd></div>
      <div><dt class="font-medium inline">Exit cap rate</dt> <dd class="inline float-right">{acquisition.exitCap}</dd></div>
      <div><dt class="font-medium inline">Working capital</dt> <dd class="inline float-right">{acquisition.workingCapital}</dd></div>
      <div><dt class="font-medium inline">Acquisition date</dt> <dd class="inline float-right">{acquisition.acquisitionDate}</dd></div>
      <div><dt class="font-medium inline">Total cash to close</dt> <dd class="inline float-right">{acquisition.totalCashToClose}</dd></div>
      <div><dt class="font-medium inline">Total acquisition costs</dt> <dd class="inline float-right">{acquisition.totalAcquisitionCosts}</dd></div>
    </dl>
  </div>

  <div class="mt-6">
    <h3 class="text-sm font-semibold mb-2">DECISION CRITERIA</h3>
    <ul class="space-y-2 text-sm">
      {#each acquisition.decisionCriteria as crit}
        <li class="flex justify-between items-center">
          <span>{crit.label}</span>
          <div class="text-right">
            <span class="inline">{crit.current}</span>
            <span class="text-gray-500 ml-2">{crit.target}</span>
          </div>
        </li>
      {/each}
    </ul>
    <button class="mt-2 text-xs text-gray-500 hover:underline">configure criteria</button>
  </div>
</div>
