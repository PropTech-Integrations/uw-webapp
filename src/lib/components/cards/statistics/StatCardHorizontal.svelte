<script lang="ts">
  import { Card } from 'flowbite-svelte';
  let {title, text, linkText, href} = $props();
  import { DollarOutline } from 'flowbite-svelte-icons';
</script>

<Card class="p-6 w-full max-w-sm"> 
  <div class="flex items-center justify-between">
    <div>
      <h3 class="text-base font-normal mb-1">
        {title}
      </h3>
      <p class="text-3xl font-bold">
        {linkText}
      </p>
    </div>
    <div class="w-12 h-12 rounded-full flex items-center justify-center"> 
      <DollarOutline class="w-14 h-14 text-orange-500" /> 
    </div>
  </div>
</Card>