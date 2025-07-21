<script lang="ts">
	import Sidebar from '$lib/components/Sidebar/Sidebar.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<div class="flex">
	<Sidebar />
	{@render children()}
</div>
