<script>
	import Sidebar from '$lib/components/properties/sidebar/Sidebar.svelte';

	let { children, data } = $props();
	let property = data.property;
</script>

<div class="flex h-full w-full">
			<Sidebar {property} />
	<section
		class="h-full w-full space-y-6 rounded-2xl bg-white bg-gradient-to-br from-zinc-50 via-red-50 to-indigo-50 p-6 shadow-md"
	>
		{@render children()}
	</section>
</div>


