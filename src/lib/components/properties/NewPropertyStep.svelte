<script lang="ts">
	interface Step {
		number: number;
		title: string;
		active: boolean;
		description: string;
	}

	export let steps: Step[];
	function handleStepClick(clickedStep: Step) {
		console.log(clickedStep);
		steps.forEach((s) => {
			s.active = s === clickedStep;
			console.log(`${s.number}: ${s.active}`);
		});
	}
</script>

<ol
	class="flex flex-col w-full items-center justify-between space-y-4 sm:flex-row sm:space-y-0 rtl:space-x-reverse"
>
	{#each steps as step}
		<button
			class="flex w-full items-center text-left space-x-2.5 rtl:space-x-reverse cursor-pointer"
			class:text-blue-600={step.active}
			class:text-gray-500={!step.active}
			class:opacity-85={!step.active}
			onclick={() => handleStepClick(step)}
		>
			<span
				class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border"
				class:text-blue-600={step.active}
				class:text-gray-500={!step.active}
				class:opacity-85={!step.active}
			>
				{step.number} 
			</span>
			<span class:text-blue-600={step.active} class:text-gray-500={!step.active}>
				<h3 class="font-medium leading-tight">{step.title}</h3>
				<p class="text-xs">{step.description}</p>
			</span>
		</button>
	{/each}
</ol>

