<!-- +page.svelte -->
<script>
	let { project } = $props();
  </script>
  



<p class="text-sm text-gray-500 dark:text-gray-400">
	<!-- Blog Section -->
</p>
<section class="mb-6 p-6 shadow">
	<h2 class="mb-4 text-xl font-semibold">StratiqAI Blog   {project?.name}</h2>
	<article class="mb-6">
		<h3 class="mb-2 text-lg font-bold">Welcome to the StratiqAI Blog!</h3>
		<p class="mb-2">
			Stay up to date with the latest news, product updates, and industry insights from the
			StratiqAI team.
		</p>
		<a href="/blog/welcome" class="text-sm hover:underline">Read more →</a>
	</article>
	<article class="mb-6">
		<h3 class="mb-2 text-lg font-bold">How AI is Transforming Property Analysis</h3>
		<p class="mb-2">
			Discover how artificial intelligence is streamlining underwriting and property evaluation for
			real estate professionals.
		</p>
		<a href="/blog/ai-property-analysis" class="text-sm hover:underline">Read more →</a>
	</article>
	<article>
		<h3 class="mb-2 text-lg font-bold">Tips for Uploading Your First Property</h3>
		<p class="mb-2">
			Get started quickly with our step-by-step guide to uploading and analyzing your first property
			in StratiqAI.
		</p>
		<a href="/blog/first-property-tips" class="text-sm hover:underline">Read more →</a>
	</article>
</section>
