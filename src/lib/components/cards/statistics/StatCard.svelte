<script>
    import { Card, Heading, P } from 'flowbite-svelte';
    import { DollarOutline } from 'flowbite-svelte-icons';
  
    /** The label shown above the price */
    let { label = 'Listing Price', val="20" } = $props();
    /** Tailwind class for the icon color */
    // export let iconColor = 'text-orange-500';
  </script>
  
  <Card class="flex flex-col max-w-xs mx-auto p-6 text-center items-center">
    <!-- <DollarOutline class={`w-8 h-8 ${iconColor} mx-auto mb-4`} /> -->
    <Heading tag="h4" class="" customSize="text-sm font-bold md:text-md lg:text-lg text-center">
			{label}
		</Heading>
    <!-- <P class="text-md font-medium uppercase text-center">{label}</P> -->
    <P class="mt-2 text-5xl font-bold flex-1 dark:text-orange-500">{val}</P>
  </Card>