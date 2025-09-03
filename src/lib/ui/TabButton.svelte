<script lang="ts">
  import type { Snippet } from 'svelte';

  type TabButtonProps = {
    onclick?: (e: MouseEvent) => void;
    href?: string;
    className?: string;
    children?: Snippet;
  };

  const {
    onclick = undefined,
    href,
    className = '',
    children
  }: TabButtonProps = $props();

  const defaultClasses: string =
    'inline-block text-sm font-medium text-center disabled:cursor-not-allowed p-4 py-3 px-4 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white';

  const mergedClasses: string = $derived(`${defaultClasses} ${className}`.trim());
</script>

{#if href}
  <a href={href} class={mergedClasses} onclick={onclick}>
    {@render children?.()}
  </a>
{:else}
  <button type="button" class={mergedClasses} onclick={onclick}>
    {@render children?.()}
  </button>
{/if}