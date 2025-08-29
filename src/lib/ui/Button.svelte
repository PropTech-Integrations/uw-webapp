<script lang="ts">
    import { Button } from "flowbite-svelte";
    import type { Snippet } from 'svelte';

    let { href, icon = false, children, className = '', onclick } = $props<{
        href?: string;
        icon?: boolean;
        children?: Snippet;
        className?: string;
        onclick?: (e: MouseEvent) => void;
    }>();
</script>

<Button
    href={href}
    class={`flex space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 shadow-sm transition hover:bg-gray-50 hover:border-gray-400 ${className}`}
    onclick={onclick}
>
    {#if icon}
		<svg class="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
		</svg>
    {/if}
    <span class="text-sm font-medium text-gray-700">
        {#if children}
            {@render children()}
        {:else}
            Button
        {/if}
    </span>	
</Button>