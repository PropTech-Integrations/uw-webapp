<script lang="ts">
    import KVTable, { type Row } from './KVTable.svelte';
  
    const r = (label: string, value = '', note = '', align: 'left' | 'right' = 'right'): Row =>
      ({ label, value, note, align });
  
    // ==== LEFT COLUMN ====
    const analysisDetails: Row[] = [
      r('Analysis Start', 'Month 1', 'Jan-26', 'left'),
      r('Analysis Period', '120 Months'),
      r('Analysis End', '', 'Dec-35', 'left'),
      r('General Vacancy', '0.0%')
    ];
  
    const otherIncome: Row[] = [
      r('Other Income – Billboard Rent', '', '1,200', 'left'),
      r('Total Other Income (per Year)', '', '1,200', 'left'),
      r('Income Growth (% /Yr.)', '2.0%')
    ];
  
    const expenseAssumptionsHeader = r('Type', 'PSF', '');
    const expenseAssumptions: Row[] = [
      r('Tenant Expense Recovery %', 'NNN', '100%'),
      r('Tenant CapEx Recovery %', '', '0%'),
      r('Year 1 Operating Expenses', '6.50', '16,250'),
      r('Year 1 Capital Expenditures', '0.50', '1,250'),
      r('Expense Growth (% /Yr.)', '2.0%')
    ];
    const year1NOI = r('Year 1 Net Operating Income', '', '188,700');
  
    const residualAssumptions: Row[] = [ r('Residual Discount Rate', '9.50%') ];
  
    const residualProForma: Row[] = [
      r('Gross Rent', '228,561', '91.42'),
      r('Expense Recovery Income', '16,250', '6.50'),
      r('Other Income', '1,463', '0.59'),
      r('Total Gross Income', '', '246,274', 'left'),
      r('- Vacancy % Credit Loss', '', '0.0%', 'left'),
      r('Effective Gross Revenue', '', '246,274', 'left'),
      r('- Operating Expenses', '', '16,250', 'left'),
      r('Net Operating Income', '', '230,024', 'left'),
      r('- CapEx', '', '1,250', 'left'),
      r('Cash Flow from Operations', '', '228,774', 'left')
    ];
  
    const netResidual: Row[] = [
      r('Gross Residual Value', 'Cap Rate 7.50%', '3,066,990', 'left'),
      r('- Retenanting Cost', '', '0', 'left'),
      r('- Downtime', 'Months 0 Months', '0', 'left'),
      r('- Selling Costs', '6.0% 0.00%', '0', 'left'),
      r('Net Residual Value', '$/SF 1,226.80', '3,066,990', 'left')
    ];
  
    // ==== RIGHT COLUMN ====
    const projectInvestment: Row[] = [
      r('Purchase Price', 'Going-in cap', '7.45% · $/SF 1,006.40 · 2,516,000', 'left'),
      r('Acquisition Fees', '1.00% · $/SF 10.06', '25,160', 'left'),
      r('Due Diligence Costs', '0.50% · $/SF 5.03', '12,580', 'left'),
      r('Construction Costs', 'YOC', '0', 'left'),
      r('Total Project Costs', '7.34% · $/SF 1,021.50', '2,553,740', 'left')
    ];
  
    const debt: Row[] = [
      r('Loan Amount', '% of Price 70% · $/SF 704.48', '1,761,200', 'left'),
      r('Fixed Interest Rate', '', '6.25%', 'left'),
      r('Amortization', '', '360 Months', 'left')
    ];
  
    const tenantDetails: Row[] = [
      r('Tenant Name', 'Type Public', 'Sun Coffee, Inc', 'left'),
      r('Year Established', '', '1941', 'left'),
      r('Credit Rating', 'Type S&P', 'BBB', 'left'),
      r('Credit Income Discount Rate', '', '7.00%', 'left'),
      r('Spec Income Discount Rate', '', '9.50%', 'left')
    ];
  
    const leaseRentDetails: Row[] = [
      r('Lease Start', 'Month 0', 'Oct-2017', 'left'),
      r('Lease Length', '', '180 Months', 'left'),
      r('Lease End', 'End Month 81', 'Sep-32', 'left')
    ];
  
    const initialLeaseIncome: Row[] = [
      r('Rent Increase Type', 'Inc. Month Jan', 'None', 'left'),
      r('Base Rent $/SF/Yr (as of Month 1)', '', '75.00', 'left'),
      r('Annual', '', '187,500', 'left')
    ];
  
    const option1: Row[] = [
      r('Exercise Probability', '', '75%', 'left'),
      r('Start Month 82 · Length 60 Months · Option Rent $/SF/Yr 75.00 · Option Rent Increase (% /Yr.) 0.0%', '', '', 'left')
    ];
  
    const option2: Row[] = [
      r('Exercise Probability', '', '75%', 'left'),
      r('Start Month 143 · Length 60 Months · Option Rent $/SF/Yr 75.00 · Option Rent Increase (% /Yr.) 0.0%', '', '', 'left')
    ];
  </script>
  
  <!-- Header -->
  <div class="mx-auto max-w-[1200px] p-4">
    <div class="mb-3 flex items-center justify-between">
      <h1 class="rounded bg-[#b11a1a] px-3 py-1 text-sm font-bold tracking-wide text-white">
        STNL VALUATION MODEL | INPUTS
      </h1>
      <div class="text-right text-xs">
        <div><span class="font-semibold">Sun Coffee</span> <span class="text-gray-500">v2.8</span></div>
        <div class="text-[11px] text-gray-500 dark:text-gray-200">Interest: Fee Simple</div>
      </div>
    </div>
  
    <!-- Body -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <!-- LEFT -->
      <div class="space-y-4">
        {#each [
          { title: 'ANALYSIS DETAILS', rows: analysisDetails, underline: null },
          { title: 'OTHER INCOME ASSUMPTIONS', rows: otherIncome, underline: 0 },
        ] as sec}
          <div class="rounded-xl border border-gray-200 p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div class="mb-2 text-[12px] font-bold tracking-wide text-gray-800 dark:text-gray-200">{sec.title}</div>
            <KVTable rows={sec.rows} underlineIndex={sec.underline} />
          </div>
        {/each}
  
        <div class="rounded-xl border border-gray-200 p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div class="mb-2 text-[12px] font-bold tracking-wide text-gray-800 dark:text-gray-200">EXPENSE ASSUMPTIONS</div>
          <div class="mb-1 text-[11px] text-blue-700">Type</div>
          <KVTable rows={[expenseAssumptionsHeader, ...expenseAssumptions]} />
          <div class="mt-2 border-t pt-2">
            <KVTable rows={[year1NOI]} />
          </div>
        </div>
  
        <div class="rounded-xl border border-gray-200 p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div class="mb-2 text-[12px] font-bold tracking-wide text-gray-800 dark:text-gray-200">RESIDUAL ASSUMPTIONS</div>
          <KVTable rows={residualAssumptions} />
          <div class="mt-3 border-t pt-2">
            <div class="mb-2 text-[13px] font-semibold">Residual Pro Forma</div>
            <KVTable rows={residualProForma} />
          </div>
        </div>
  
        <div class="rounded-xl border border-gray-200 p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div class="mb-2 text-[12px] font-bold tracking-wide text-gray-800 dark:text-gray-200">NET RESIDUAL VALUE</div>
          <KVTable rows={netResidual} />
        </div>
      </div>
  
      <!-- RIGHT -->
      <div class="space-y-4">
        {#each [
          { title: 'PROJECT INVESTMENT', rows: projectInvestment },
          { title: 'DEBT', rows: debt },
          { title: 'TENANT DETAILS', rows: tenantDetails },
          { title: 'LEASE RENT DETAILS', rows: leaseRentDetails },
          { title: 'INITIAL LEASE INCOME', rows: initialLeaseIncome },
        ] as sec}
          <div class="rounded-xl border border-gray-200 p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div class="mb-2 text-[12px] font-bold tracking-wide text-gray-800 dark:text-gray-200">{sec.title}</div>
            <KVTable rows={sec.rows} />
          </div>
        {/each}
  
        <div class="rounded-xl border border-gray-200 p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div class="mb-2 flex items-center justify-between">
            <div class="text-[12px] font-bold tracking-wide text-gray-800 dark:text-gray-200">OPTION #1 – RENEWAL INCOME</div>
            <span class="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Yes</span>
          </div>
          <KVTable rows={option1} />
        </div>
  
        <div class="rounded-xl border border-gray-200 p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div class="mb-2 text-[12px] font-bold tracking-wide text-gray-800 dark:text-gray-200">OPTION #2 – RENEWAL INCOME</div>
          <KVTable rows={option2} />
        </div>
      </div>
    </div>
  </div>
  