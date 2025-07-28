<script lang="ts">
    import { Card } from 'flowbite-svelte';
    import { GiftBoxSolid, ArrowUpRightFromSquareOutline } from 'flowbite-svelte-icons';
    let {title, text, linkText, href} = $props();
  </script>
  
  <Card class="flex flex-wrap items-center content-start">
    <!-- <GiftBoxSolid class="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" /> -->
    <a href="/">
      <h5 class="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">{title}</h5>
    </a>

    <a href="/" class="mb-3 font-bold text-4xl text-primary-600 hover:underline">
      {linkText}
      <!-- <ArrowUpRightFromSquareOutline class="w-4 h-4 ms-2.5" /> -->
    </a>
    <p class="text-center font-normal text-gray-500 dark:text-gray-400">{text}</p>
  </Card>