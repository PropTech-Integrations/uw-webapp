<script>
	import Sidebar from '$lib/components/properties/sidebar/Sidebar.svelte';

	let { children, data } = $props();
	let property = data.property;
</script>

<div class="flex h-full w-full">
			<Sidebar {property} />

		{@render children()}

</div>


