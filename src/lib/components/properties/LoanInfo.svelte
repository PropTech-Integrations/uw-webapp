<script lang="ts">
    export let loanAmount: string;
    export let downPayment: string;
    export let ltv: string;
    export let dcr: string;
    export let loanTerm: string;
    export let interestOnlyPeriod: string;
    export let amortization: string;
    export let interestRate: string;
    export let interestRateSpread: string;
  
    const panels = [
      [
        { label: 'Loan Amount', value: loanAmount },
        { label: 'Down Payment', value: downPayment },
        { label: 'LTV', value: ltv },
        { label: 'DCR', value: dcr }
      ],
      [
        { label: 'Loan Term', value: loanTerm },
        { label: 'Interest only period', value: interestOnlyPeriod },
        { label: 'Amortization', value: amortization }
      ],
      [
        { label: 'Interest rate', value: interestRate },
        { label: 'Interest rate spread', value: interestRateSpread }
      ]
    ];
  </script>
  
  <div class="grid grid-cols-1 gap-4">
    <div class="bg-white border rounded-lg p-4">
      <dl class="space-y-2 text-sm text-gray-700">
        {#each panels as panel}
          {#each panel as item}
            <div class="flex justify-between">
              <dt class="font-medium">{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          {/each}
        {/each}
      </dl>
    </div>
  </div>