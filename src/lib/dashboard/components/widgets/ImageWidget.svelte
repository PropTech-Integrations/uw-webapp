<script lang="ts">
	import type { ImageWidget } from '$lib/dashboard/types/widget';

	interface Props {
		data: ImageWidget['data'];
	}

	let { data }: Props = $props();
</script>

<div class="image-widget h-full">
	<img
		src={data.src}
		alt={data.alt}
		class="h-full w-full object-{data.objectFit || 'cover'} rounded"
	/>
</div>
