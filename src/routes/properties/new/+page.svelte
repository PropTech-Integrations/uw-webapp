<script lang="ts">
	let currentStep = 1;

	import Step1AddSource from '../../../lib/components/Upload/Step1AddSource.svelte';
	import Step2EnrichData from '../../../lib/components/Upload/Step2EnrichData.svelte';
	import { fade } from 'svelte/transition'; 
</script>

{#if currentStep === 1}
	<div in:fade={{ duration: 3000 }} out:fade={{ duration: 3000 }}>
		<Step1AddSource />
	</div>
{:else if currentStep === 2}
	<div in:fade={{ duration: 3000 }} out:fade={{ duration: 3000 }}>
		<Step2EnrichData />
	</div>
{/if}
