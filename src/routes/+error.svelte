<script>
	import { Heading, P } from 'flowbite-svelte';

	import Button from '$lib/ui/Button.svelte';
</script>

<section class="w-full h-full flex items-center justify-center min-h-screen">
	<div class="text-center">
		<Heading tag="h1" class="mb-8 text-2xl font-extrabold md:text-3xl lg:text-4xl">404</Heading>
		<div>
			<p class="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
				Something's missing.
			</p>
			<p class="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">
				Sorry, we can't find that page. You'll find lots to explore on the home page.
			</p>
			<Button href="/">Back to Homepage</Button>
		</div>
	</div>
</section>
