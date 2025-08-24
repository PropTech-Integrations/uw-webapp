<script>
	import { onMount } from 'svelte';

	// Redirect to /pipeline when this page is loaded (browser only)
	onMount(() => {
		window.location.href = '/projects';
	});
</script>
