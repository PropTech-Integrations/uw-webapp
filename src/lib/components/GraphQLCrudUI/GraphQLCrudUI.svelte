<script lang="ts">
	import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from "flowbite-svelte";
	
	// Accepts a generic type T for the row data
	export let items: any[] = [];
	export let columns: { key: string; label?: string }[] = [];
</script>

<Table>
    <TableHead>
        {#each columns as col}
            <TableHeadCell>{col.label ?? col.key}</TableHeadCell>
        {/each}
    </TableHead>
    <TableBody>
        {#each items as item}
            <TableBodyRow>
                {#each columns as col}
                    <TableBodyCell>{item[col.key]}</TableBodyCell>
                {/each}
            </TableBodyRow>
        {/each}
    </TableBody>
</Table>