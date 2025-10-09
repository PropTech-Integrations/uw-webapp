<script lang="ts">
	interface Props {
		columns: number;
		rows: number;
		gap: number;
		containerEl?: HTMLElement;
		handleDragOver: (e: DragEvent) => void;
		handleDrop: (e: DragEvent) => void;
		handleDragLeave: () => void;
		children?: any;
	}

	let {
		columns,
		rows,
		gap,
		containerEl = $bindable(),
		handleDragOver,
		handleDrop,
		handleDragLeave,
		children
	}: Props = $props();
</script>

<div
	bind:this={containerEl}
	role="region"
	aria-label="Dashboard grid drop zone"
	class="dashboard-grid relative h-full w-full rounded-lg bg-gray-50 p-4"
	ondragover={handleDragOver}
	ondrop={handleDrop}
	ondragleave={handleDragLeave}
>
	<div
		class="relative grid h-full"
		style="
        grid-template-columns: repeat({columns}, 1fr);
        grid-template-rows: repeat({rows}, minmax(100px, 1fr));
        gap: {gap}px;
      "
	>
		{@render children?.()}
	</div>
</div>

<style>
	.dashboard-grid {
		min-height: 600px;
	}
</style>
