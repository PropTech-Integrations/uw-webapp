<script lang="ts">
	import SpeedometerCard from '$lib/components/SpeedometerCard/index.svelte';
</script>

<main class="flex min-h-screen items-center justify-center bg-gray-100 p-6">
	<SpeedometerCard
		title="Market"
		value={75}
		description="Evaluates the market's growth potential and stability, including factors like population trends, job growth, rental rates, and economics."
		buttonText="Review"
		buttonLink="/review"
	/>
</main>
