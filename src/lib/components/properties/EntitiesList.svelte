<script lang="ts">
	import { Badge, Button, Hr, P } from 'flowbite-svelte';
	let { entities } = $props();

	function truncateText(text: string | number | boolean): string {
		if (typeof text !== 'string') return String(text);
		return text.length > 33 ? text.slice(0, 33) + '...' : text;
	}
</script>

<div class="text-white">
	<!-- {JSON.stringify(entities)} -->
	{#each Object.entries(entities) as [key, value]}
		<div class="grid grid-cols-8 gap-4 mb-2">
			<Badge class="col-span-2 text-center">{key}</Badge>
			<P class="col-span-5">{truncateText(value as string | number | boolean)}</P>
			<P  class="underline text-sm">Edit</P>
		</div>
	{/each}
</div>
