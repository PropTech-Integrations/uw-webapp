<script lang="ts">
	import {
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	export let insights: { name: string; value: string; confidence: number }[] = [];
</script>

{#if insights && insights.length != 0}
	<div class="mt-16">
		<Table striped={true} hoverable={true}>
			<TableHead>
				<TableHeadCell>Name</TableHeadCell>
				<TableHeadCell>Value</TableHeadCell>
				<TableHeadCell>Confidence</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each insights as insight}
					<TableBodyRow>
						<TableBodyCell class="text-gray-900 dark:text-white">{insight.name}</TableBodyCell>
						<TableBodyCell class="text-gray-900 dark:text-white">{insight.value}</TableBodyCell>
						<TableBodyCell class="text-gray-900 dark:text-white"
							>{(insight.confidence * 100).toFixed(1)}%</TableBodyCell
						>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
	</div>
{/if}
