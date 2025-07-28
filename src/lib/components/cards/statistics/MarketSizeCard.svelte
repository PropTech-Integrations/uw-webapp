<script>
	import { Card } from 'flowbite-svelte';

</script>


	<div class="p-4 bg-white rounded-lg shadow-md">
		<div class="flex justify-between items-start mb-4">
			<div>
				<h2 class="text-lg font-semibold mb-1">Market Size Analysis</h2>
				<p class="text-sm text-gray-600">
					The analysis was conducted in the local market of Santa Rosa, CA, as the demand for
					renovated residential rental properties is increasing due to the aging housing stock and a
					growing population in the area.
				</p>
			</div>
			<div class="flex items-center space-x-1 ml-4">
				<button
					class="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<svg
						class="w-5 h-5 text-gray-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.582m-.356-2A8.001 8.001 0 0119.418 15m0 0H15"
						></path></svg
					>
				</button>
				<button
					class="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<svg
						class="w-5 h-5 text-gray-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 9l-7 7-7-7"
						></path></svg
					>
				</button>
			</div>
		</div>

		<div class="flex justify-center items-center relative min-h-[400px]">
			<!-- TAM Circle -->
			<div
				class="absolute left-1/2 transform -translate-x-[60%] bg-blue-300 opacity-70 rounded-full flex flex-col items-center justify-center text-black font-semibold text-center"
				style="width: 400px; height: 400px; z-index: 3;"
			>
				<span class="text-lg">TAM</span>
				<span>$2B</span>
			</div>

			<!-- SAM Circle -->
			<div
				class="absolute left-1/2 transform -translate-x-1/4 bg-blue-500 opacity-70 rounded-full flex flex-col items-center justify-center text-white font-semibold text-center"
				style="width: 300px; height: 300px; z-index: 4;"
			>
				<span class="text-md">SAM</span>
				<span>$800M</span>
			</div>

			<!-- SOM Circle -->
			<div
				class="absolute left-1/2 transform translate-x-1/4 bg-blue-700 opacity-80 rounded-full flex flex-col items-center justify-center text-white font-semibold text-center"
				style="width: 240px; height: 240px; z-index: 5;"
			>
				<span class="text-md">SOM</span>
				<span>$160M</span>
			</div>
		</div>
	</div>

