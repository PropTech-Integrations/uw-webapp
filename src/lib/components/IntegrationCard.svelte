<script lang="ts">
	export let iconSrc: string;
	export let title: string;
	export let description: string;
	export let removeHref: string;
	export let connectHref: string;
	export let settingsHref: string;
</script>

<div class="flex h-full flex-col justify-between rounded-lg border border-gray-400 p-4">
	<!-- Header: icon, title, settings -->
	<div>
		<div class="mb-3 flex items-center justify-between">
			<div class="flex items-center space-x-2">
				<!-- <img src={iconSrc} alt="{title} logo" class="h-6 w-6" /> -->
				<h3 class="text-lg font-medium text-gray-900">{title}</h3>
			</div>
			<a href={settingsHref} class="text-gray-400 hover:text-white" aria-label="Settings for {title}">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M11.049 2.927c.3-.921 1.603-.921 1.902 0a1.724 1.724 0 002.311 1.058c.92-.3 1.922.76 1.644 1.68a1.724 1.724 0 001.07 2.141c.92.3.92 1.603 0 1.902a1.724 1.724 0 00-1.058 2.311c.3.92-.76 1.922-1.68 1.644a1.724 1.724 0 00-2.141 1.07c-.3.92-1.603.92-1.902 0a1.724 1.724 0 00-2.311-1.058c-.92.3-1.922-.76-1.644-1.68a1.724 1.724 0 00-1.07-2.141c-.92-.3-.92-1.603 0-1.902a1.724 1.724 0 001.058-2.311c-.3-.92.76-1.922 1.68-1.644a1.724 1.724 0 002.141-1.07z"
					/>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
					/>
				</svg>
			</a>
		</div>
		<p class="mb-4 text-sm text-gray-700">{description}</p>
	</div>

	<!-- Actions: Remove & Connect -->
	<div class="flex gap-2">
		<button
		class="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 shadow-sm transition hover:bg-gray-50"
	>
		<span class="font-poppins text-sm font-medium text-gray-700">Remove</span>
	</button>
	
		<a
			href={connectHref}
			class="flex-1 font-poppins text-sm font-medium rounded bg-blue-600 py-2 text-center text-white hover:bg-blue-700">Connect</a
		>
	</div>
</div>
