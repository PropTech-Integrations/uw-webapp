<script lang="ts">
	import type { CompsComparisonRow } from '$lib/types/property';

	export let rows: CompsComparisonRow[];
</script>

<table class="w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
	<thead class="bg-gray-100">
		<tr>
			<th class="px-4 py-2 text-left text-sm font-medium">property</th>
			<th class="px-4 py-2 text-right text-sm font-medium">sale price</th>
			<th class="px-4 py-2 text-right text-sm font-medium">units</th>
			<th class="px-4 py-2 text-right text-sm font-medium">RSF</th>
			<th class="px-4 py-2 text-center text-sm font-medium">YB/YR</th>
			<th class="px-4 py-2 text-right text-sm font-medium">$/unit</th>
			<th class="px-4 py-2 text-right text-sm font-medium">$/SF</th>
			<th class="px-4 py-2 text-right text-sm font-medium">CAP</th>
			<th class="px-4 py-2 text-right text-sm font-medium">GRM</th>
			<th class="px-4 py-2 text-right text-sm font-medium">avg unit SF</th>
		</tr>
	</thead>
	<tbody>
		{#each rows as row, i}
			<tr class={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
				<td class="px-4 py-2 text-sm font-medium {i === 1 ? 'text-purple-600' : ''}">
					{row.label}
				</td>
				<td class="px-4 py-2 text-right text-sm">{row.salePrice}</td>
				<td class="px-4 py-2 text-right text-sm {i === 1 ? 'text-purple-600' : ''}">
					{row.units}
				</td>
				<td class="px-4 py-2 text-right text-sm">{row.rsf}</td>
				<td class="px-4 py-2 text-center text-sm {i === 1 ? 'text-purple-600' : ''}">
					{row.ybYr}
				</td>
				<td class="px-4 py-2 text-right text-sm">{row.perUnit}</td>
				<td class="px-4 py-2 text-right text-sm">{row.perSf}</td>
				<td class="px-4 py-2 text-right text-sm">{row.cap}</td>
				<td class="px-4 py-2 text-right text-sm">{row.grm}</td>
				<td class="px-4 py-2 text-right text-sm">{row.avgUnitSf}</td>
			</tr>
		{/each}
	</tbody>
</table>
