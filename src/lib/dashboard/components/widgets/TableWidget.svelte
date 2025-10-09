<script lang="ts">
	import type { TableWidget } from '$lib/dashboard/types/widget';

	interface Props {
		data: TableWidget['data'];
	}

	let { data }: Props = $props();
	let sortColumn = $state<string | null>(null);
	let sortDirection = $state<'asc' | 'desc'>('asc');
	let currentPage = $state(1);
	const itemsPerPage = 10;

	let sortedRows = $derived.by(() => {
		if (!data.sortable || !sortColumn) return data.rows;

		return [...data.rows].sort((a, b) => {
			const aVal = a[sortColumn!];
			const bVal = b[sortColumn!];
			const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
			return sortDirection === 'asc' ? comparison : -comparison;
		});
	});

	let paginatedRows = $derived.by(() => {
		if (!data.paginated) return sortedRows;
		const start = (currentPage - 1) * itemsPerPage;
		return sortedRows.slice(start, start + itemsPerPage);
	});

	function handleSort(column: string) {
		if (!data.sortable) return;
		if (sortColumn === column) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column;
			sortDirection = 'asc';
		}
	}
</script>

<div class="table-widget flex h-full flex-col">
	<div class="flex-1 overflow-auto">
		{#if data.title}
			<h3 class="mb-2 text-lg font-medium text-gray-700">{data.title}</h3>
		{/if}
		<table class="w-full text-sm">
			<thead class="sticky top-0 bg-gray-50">
				<tr>
					{#each data.headers as header}
						<th
							class="px-3 py-2 text-left font-medium text-gray-700 {data.sortable
								? 'cursor-pointer hover:bg-gray-100'
								: ''}"
							onclick={() => handleSort(header)}
						>
							{header}
							{#if data.sortable && sortColumn === header}
								<span class="ml-1">
									{sortDirection === 'asc' ? '↑' : '↓'}
								</span>
							{/if}
						</th>
					{/each}
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-200">
				{#each paginatedRows as row}
					<tr class="hover:bg-gray-50">
						{#each data.headers as header}
							<td class="px-3 py-2 text-gray-600">
								{row[header] || ''}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if data.paginated}
		<div class="mt-2 flex items-center justify-between border-t pt-2">
			<button
				class="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200 disabled:opacity-50"
				disabled={currentPage === 1}
				onclick={() => currentPage--}
			>
				Previous
			</button>
			<span class="text-sm text-gray-600">
				Page {currentPage} of {Math.ceil(data.rows.length / itemsPerPage)}
			</span>
			<button
				class="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200 disabled:opacity-50"
				disabled={currentPage >= Math.ceil(data.rows.length / itemsPerPage)}
				onclick={() => currentPage++}
			>
				Next
			</button>
		</div>
	{/if}
</div>
