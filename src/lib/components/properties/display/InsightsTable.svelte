<script lang="ts">
	import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, ImagePlaceholder, Modal } from "flowbite-svelte";
	import { slide } from "svelte/transition";

	let { insights } = $props();
	
	type ItemType = {
	  name: string;
	  value: string;
	  category: string;
	  confidence: string;
	};
  
	let openRow: number | null | undefined = $state();
	let details: ItemType | undefined = $state();
	let doubleClickModal = $state(false);
  
	const toggleRow = (i: number) => {
	  openRow = openRow === i ? null : i;
	};
</script>
  
<Table class="w-full max-w-screen-lg">
	<TableHead>
		<TableHeadCell class="w-1/4 px-2 py-1">Name</TableHeadCell>
		<TableHeadCell class="w-1/4 px-2 py-1">Value</TableHeadCell>
		<!-- <TableHeadCell class="w-1/4 px-2 py-1">Category</TableHeadCell> -->
		<TableHeadCell class="w-1/16 px-2 py-1">Confidence</TableHeadCell>
	</TableHead>
	<TableBody>
	  {#each insights as item, i}
		<TableBodyRow onclick={() => toggleRow(i)} class="px-2 py-1">
		  <TableBodyCell class="w-1/4 px-2 py-1">{item.name}</TableBodyCell>
		  <TableBodyCell class="w-1/4 px-2 py-1">{item.value}</TableBodyCell>
		  <!-- <TableBodyCell class="w-1/4 px-2 py-1">{item.category}</TableBodyCell> -->
		  <TableBodyCell class="w-1/16 px-2 py-1 text-xs">{(parseFloat(item.confidence) * 100).toFixed(0)}%</TableBodyCell>
		</TableBodyRow>
		{#if openRow === i}
		  <TableBodyRow
			ondblclick={() => {
			  doubleClickModal = true;
			  details = item;
			}}
		  >
			<TableBodyCell colspan={4} class="p-0">
			  <div class="px-1 py-2" transition:slide={{ duration: 300, axis: "y" }}>
				<ImagePlaceholder />
			  </div>
			</TableBodyCell>
		  </TableBodyRow>
		{/if}
	  {/each}
	</TableBody>
</Table>
<Modal title={details?.name} bind:open={doubleClickModal} autoclose outsideclose>
	<ImagePlaceholder />
</Modal>