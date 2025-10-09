<script lang="ts">
	import type { ParagraphWidget } from '$lib/dashboard/types/widget';

	interface Props {
		data: ParagraphWidget['data'];
	}

	let { data }: Props = $props();
</script>

<div class="paragraph-widget h-full overflow-auto">
	{#if data.title}
		<h3 class="mb-2 text-lg font-medium text-gray-700">{data.title}</h3>
	{/if}
	{#if data.markdown}
		{@html data.content}
	{:else}
		<p class="leading-relaxed text-gray-700">{data.content}</p>
	{/if}
</div>