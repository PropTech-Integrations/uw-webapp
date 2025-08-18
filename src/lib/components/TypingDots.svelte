<script lang="ts">
  export let label: string = 'Assistant is typing';
</script>

<div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
  <span class="sr-only">{label}</span>
  <div class="flex gap-1">
    <span class="w-2 h-2 rounded-full bg-gray-400/80 animate-bounce" style="animation-delay:-0.2s"></span>
    <span class="w-2 h-2 rounded-full bg-gray-400/80 animate-bounce"></span>
    <span class="w-2 h-2 rounded-full bg-gray-400/80 animate-bounce" style="animation-delay:0.2s"></span>
  </div>
</div>
