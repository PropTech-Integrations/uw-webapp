<script lang="ts">
	import { Card, Button, Toggle } from 'flowbite-svelte';
	export let card: {
		title: string;
		image: string;
		description: string;
	};
</script>

<div class="space-y-4">
	<Card img={card.image} href="/" horizontal size="md">
		<div class="m-6">
			<h5 class="mb-2 text-md font-bold tracking-tight text-gray-900 dark:text-white">
				{card.title}
			</h5>
			<p class="mb-3 text-sm leading-tight font-normal text-gray-700 dark:text-gray-400">{card.description}</p>
		</div>
	</Card>
</div>
