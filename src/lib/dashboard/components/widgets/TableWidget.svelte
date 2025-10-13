<script lang="ts">
	import type { TableWidget } from '$lib/dashboard/types/widget';
	import { mapStore } from '$lib/stores/mapObjectStore';

	interface Props {
		data: TableWidget['data'];
	}

	let { data }: Props = $props();
	let widgetData = $state(data);

	let consumer = mapStore.registerConsumer<TableWidget['data']>(
		'table-content',
		'table-widget'
	);

	console.log(`📋 TableWidget: Initialized`);
	console.log('   Subscribing to content updates...\n');

	// Subscribe to content updates
	consumer.subscribe((data) => {
		if (data) {
			widgetData = data;
			console.log('Table content updated:', data);
		}
	});

	let sortColumn = $state<string | null>(null);
	let sortDirection = $state<'asc' | 'desc'>('asc');
	let currentPage = $state(1);
	const itemsPerPage = 10;

	let sortedRows = $derived.by(() => {
		if (!widgetData.sortable || !sortColumn) return widgetData.rows;

		return [...widgetData.rows].sort((a, b) => {
			const aVal = a[sortColumn!];
			const bVal = b[sortColumn!];
			const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
			return sortDirection === 'asc' ? comparison : -comparison;
		});
	});

	let paginatedRows = $derived.by(() => {
		if (!widgetData.paginated) return sortedRows;
		const start = (currentPage - 1) * itemsPerPage;
		return sortedRows.slice(start, start + itemsPerPage);
	});

	function handleSort(column: string) {
		if (!widgetData.sortable) return;
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
		{#if widgetData.title}
			<h3 class="mb-2 text-lg font-medium text-gray-700 dark:text-gray-200">{widgetData.title}</h3>
		{/if}
		<table class="w-full text-sm">
			<thead class="sticky top-0 bg-gray-50 dark:bg-gray-800">
				<tr>
					{#each widgetData.headers as header}
						<th
							class="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-200 {widgetData.sortable
								? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
								: ''}"
							onclick={() => handleSort(header)}
						>
							{header}
							{#if widgetData.sortable && sortColumn === header}
								<span class="ml-1">
									{sortDirection === 'asc' ? '↑' : '↓'}
								</span>
							{/if}
						</th>
					{/each}
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
				{#each paginatedRows as row}
					<tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
						{#each widgetData.headers as header}
							<td class="px-3 py-2 text-gray-600 dark:text-gray-300">
								{row[header] || ''}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if widgetData.paginated}
		<div class="mt-2 flex items-center justify-between border-t dark:border-gray-700 pt-2">
			<button
				class="rounded bg-gray-100 dark:bg-gray-700 px-3 py-1 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
				disabled={currentPage === 1}
				onclick={() => currentPage--}
			>
				Previous
			</button>
			<span class="text-sm text-gray-600 dark:text-gray-400">
				Page {currentPage} of {Math.ceil(widgetData.rows.length / itemsPerPage)}
			</span>
			<button
				class="rounded bg-gray-100 dark:bg-gray-700 px-3 py-1 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
				disabled={currentPage >= Math.ceil(widgetData.rows.length / itemsPerPage)}
				onclick={() => currentPage++}
			>
				Next
			</button>
		</div>
	{/if}
</div>
