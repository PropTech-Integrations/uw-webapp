<script lang="ts">
  export let metrics: {
    cap: { current: string; proforma: string };
    grm: { current: string; proforma: string };
    coc: { current: string; proforma: string };
    upside: string;
    irr: { current: string; target: string };
    equityMultiple: { current: string; target: string };
    roe: { current: string; target: string };
    roi: string;
    priceEstimate: { low: string; mid: string; high: string };
  };
</script>

<div class="bg-white border rounded-lg p-6 flex flex-col justify-between">
  <div>
    <h2 class="text-lg font-semibold mb-4">METRICS</h2>
    <dl class="text-sm text-gray-700 space-y-2">
      <div><dt class="inline font-medium">CAP</dt> <dd class="inline float-right">{metrics.cap.current}</dd> <span class="text-purple-600 float-right ml-4">{metrics.cap.proforma}</span></div>
      <div><dt class="inline font-medium">GRM</dt> <dd class="inline float-right">{metrics.grm.current}</dd> <span class="text-purple-600 float-right ml-4">{metrics.grm.proforma}</span></div>
      <div><dt class="inline font-medium">Cash-on-Cash</dt> <dd class="inline float-right">{metrics.coc.current}</dd> <span class="text-purple-600 float-right ml-4">{metrics.coc.proforma}</span></div>
      <div><dt class="inline font-medium">Upside</dt> <dd class="inline float-right text-purple-600">{metrics.upside}</dd></div>
      <div class="mt-4"><dt class="font-medium">IRR</dt> <dd class="inline float-right">{metrics.irr.current}</dd> <span class="text-gray-500 ml-4">avg. {metrics.irr.target}</span></div>
      <div><dt class="font-medium">Equity Multiple</dt> <dd class="inline float-right">{metrics.equityMultiple.current}</dd> <span class="text-gray-500 ml-4"> {metrics.equityMultiple.target}</span></div>
      <div><dt class="font-medium">ROE</dt> <dd class="inline float-right">{metrics.roe.current}</dd> <span class="text-gray-500 ml-4">{metrics.roe.target}</span></div>
      <div><dt class="font-medium">ROI</dt> <dd class="inline float-right text-purple-600">{metrics.roi}</dd></div>
    </dl>
  </div>

  <!-- Price estimate bar -->
  <div class="mt-6">
    <h3 class="text-sm font-semibold mb-2">PRICE ESTIMATE</h3>
    <div class="flex justify-between text-sm mb-1">
      <span>{metrics.priceEstimate.low}</span>
      <span>{metrics.priceEstimate.mid}</span>
      <span>{metrics.priceEstimate.high}</span>
    </div>
    <div class="h-2 bg-gradient-to-r from-red-500 via-green-500 to-red-500 rounded-full relative">
      <div
        class="absolute top-0"
        style="left: calc( (50% - 1px) ); /* midpoint marker, adjust per real data */"
      >
        <svg class="w-4 h-4 text-green-700" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 0 L12 6 H8 L10 0z" />
        </svg>
      </div>
    </div>
  </div>
</div>
