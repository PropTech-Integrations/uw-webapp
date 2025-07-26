<script lang="ts">
	export let currentCount: number;
	export let maxCount: number;
	$: percentage = (currentCount / maxCount) * 100;
</script>

<div class="w-full">
	<div class="mb-1 flex justify-between">
		<span class="text-sm font-medium text-gray-700">Source limit</span>
		<span class="text-sm font-medium text-gray-700">{currentCount}/{maxCount}</span>
	</div>
	<div class="h-2 w-full overflow-hidden rounded-full bg-gray-200">
		<div class="h-2 rounded-full" style="width: {percentage}%" class:bg-blue-600={percentage < 100}></div>
	</div>
</div>
