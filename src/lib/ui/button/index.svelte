<script lang="ts">
	export let href: string;
	export let label: string;
	export let icon: boolean = false;
</script>

<a {href}>
	<button
		aria-label={label}
		class="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 shadow-sm transition hover:bg-gray-50 hover:border-gray-400"
	>
    {#if icon}
		<svg class="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
		</svg>
    {/if}
		<span class="text-sm font-medium text-gray-700">{label}</span>
	</button>
</a>
