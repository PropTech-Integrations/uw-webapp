<script>
	import Logo from '../Logo/Logo.svelte';

	let active = 'upload'; // Example: tracks current active section
	let isCollapsed = false; // State to track if the sidebar is collapsed

	function toggleSidebar() {
		isCollapsed = !isCollapsed;
	}
</script>

<aside
	class={`transition-width flex h-full flex-col border-r border-gray-200 bg-white duration-300 dark:border-gray-700 dark:bg-gray-900 ${isCollapsed ? 'w-20' : 'w-36'}`}
>
	<!-- Logo and Toggle Button -->
	<div
		class="flex h-16 items-center justify-between border-b border-gray-200 px-2 pt-8 dark:border-gray-700"
	>
		<img
			src="/images/logos/logo-graphic-only.png"
			alt="Logo"
			class="h-10 w-10 justify-center"
			onclick={toggleSidebar}
		/>
		<button onclick={toggleSidebar} class="text-gray-500 focus:outline-none dark:text-gray-300">
			{#if !isCollapsed}
				<svg
					class="h-6 w-6 text-gray-600 dark:text-white"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M5 12h14M5 12l4-4m-4 4 4 4"
					/>
				</svg>
			{/if}
		</button>
	</div>

	<!-- Navigation -->
	<nav class="font-poppins flex-1 space-y-1 overflow-y-auto px-2 py-4">
		<a
			href="/properties/new"
			class="group flex items-center justify-center rounded-lg px-2 py-2 text-sm font-medium transition-all
			hover:bg-gray-100 dark:hover:bg-gray-800
			{active === '/properties/new'
				? 'bg-gray-100 text-stone-600 dark:bg-gray-800'
				: 'text-gray-700 dark:text-gray-300'}"
			onclick={() => (active = '/properties/new')}
		>
			<svg
				class="mr-3 h-6 w-6 text-gray-800 dark:text-white"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				fill="none"
				viewBox="0 0 24 24"
			>
				<path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 16h13M4 16l4-4m-4 4 4 4M20 8H7m13 0-4 4m4-4-4-4"
				/>
			</svg>

			<span class={`hidden ${isCollapsed ? 'md:hidden' : 'md:inline'}`}>New Property</span>
		</a>
		<a
			href="/pipeline"
			class="group flex items-center justify-center rounded-lg px-2 py-2 text-sm font-medium transition-all
			hover:bg-gray-100 dark:hover:bg-gray-800
			{active === 'pipeline'
				? 'bg-gray-100 text-stone-600 dark:bg-gray-800'
				: 'text-gray-700 dark:text-gray-300'}"
			onclick={() => (active = 'pipeline')}
		>
			<svg
				class="mr-3 h-6 w-6 text-gray-800 dark:text-white"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				fill="none"
				viewBox="0 0 24 24"
			>
				<path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 16h13M4 16l4-4m-4 4 4 4M20 8H7m13 0-4 4m4-4-4-4"
				/>
			</svg>

			<span class={`hidden ${isCollapsed ? 'md:hidden' : 'md:inline'}`}>Pipeline</span>
		</a>

		<a
			href="/markets"
			class="group flex items-center justify-center rounded-lg px-2 py-2 text-sm font-medium transition-all
			hover:bg-gray-100 dark:hover:bg-gray-800
			{active === 'analysis'
				? 'bg-gray-100 text-stone-600 dark:bg-gray-800'
				: 'text-gray-700 dark:text-gray-300'}"
			  onclick={() => (active = 'analysis')}
		>
			<svg
				class="mr-3 h-6 w-6 text-stone-600 dark:text-white"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				fill="none"
				viewBox="0 0 24 24"
			>
				<path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"
				/>
			</svg>

			<span class={`hidden ${isCollapsed ? 'md:hidden' : 'md:inline'}`}>Markets</span>
		</a>

		<a
			href="reports"
			class="group flex items-center justify-center rounded-lg px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
		>
			<svg
				class="mr-3 h-6 w-6 text-gray-800 dark:text-white"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				fill="none"
				viewBox="0 0 24 24"
			>
				<path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 3v4a1 1 0 0 1-1 1H5m4 10v-2m3 2v-6m3 6v-3m4-11v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7.914a1 1 0 0 1 .293-.707l3.914-3.914A1 1 0 0 1 9.914 3H18a1 1 0 0 1 1 1Z"
				/>
			</svg>

			<span class={`hidden ${isCollapsed ? 'md:hidden' : 'md:inline'}`}>Reports</span>
		</a>

		<!-- <a href="#" class="group flex items-center px-2 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
			<svg class="w-6 h-6 mr-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
				<path d="M3 4a1 1 0 000 2h14a1 1 0 100-2H3zM3 9a1 1 0 000 2h14a1 1 0 100-2H3zm0 5a1 1 0 000 2h14a1 1 0 100-2H3z" />
			</svg>
			<span class={`hidden ${isCollapsed ? 'md:hidden' : 'md:inline'}`}>Dealfinder</span>
		</a> -->

		<a
			href="support"
			class="group flex items-center justify-center rounded-lg px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
		>
			<svg
				class="mr-3 h-6 w-6 text-gray-800 dark:text-white"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				fill="none"
				viewBox="0 0 24 24"
			>
				<path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 6.03v13m0-13c-2.819-.831-4.715-1.076-8.029-1.023A.99.99 0 0 0 3 6v11c0 .563.466 1.014 1.03 1.007 3.122-.043 5.018.212 7.97 1.023m0-13c2.819-.831 4.715-1.076 8.029-1.023A.99.99 0 0 1 21 6v11c0 .563-.466 1.014-1.03 1.007-3.122-.043-5.018.212-7.97 1.023"
				/>
			</svg>

			<span class={`hidden ${isCollapsed ? 'md:hidden' : 'md:inline'}`}>Support</span>
		</a>
	</nav>

	<!-- Footer -->
	<!-- <div
		class="flex items-center justify-between border-t border-gray-200 px-4 py-4 dark:border-gray-700"
	>
		<img
			src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/bonnie-green.png"
			alt="User"
			class="h-10 w-10 rounded-full"
		/>
		<div class={`hidden ${isCollapsed ? 'md:hidden' : 'md:flex'} ml-2 flex-col text-sm`}>
			<span class="font-semibold text-gray-900 dark:text-white">Pro User</span>
			<span class="text-xs text-gray-500 dark:text-gray-400">PRO</span>
		</div>
	</div> -->
</aside>
