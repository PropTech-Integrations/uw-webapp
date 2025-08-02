<script lang="ts">
	import {
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	let { title, data } = $props();

</script>

<Table shadow>
	<TableHead defaultRow={false}>
		<tr>
			<TableHeadCell colspan={2}>{title}</TableHeadCell>
		</tr>
	</TableHead>
	<TableBody class="divide-y">
        {#each data as {key, val}}
		<TableBodyRow>
			<TableBodyCell>{key}</TableBodyCell>
			<TableBodyCell>{val}</TableBodyCell>
		</TableBodyRow>
        {/each}
	</TableBody>
</Table>


