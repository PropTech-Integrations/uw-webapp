<script lang="ts">
	import Logo from '../Logo/Logo.svelte';
	import UserDropdown from './UserDropdown.svelte';
	import type { CurrentUser } from '$lib/types/auth';

	let active = $state('upload');
	let {
		isSidebarOpen = $bindable(),
		onclick: toggleSidebar,
		currentUser = $bindable()
	} = $props<{
		isSidebarOpen?: boolean;
		onclick?: () => void;
		currentUser?: CurrentUser;
	}>();

	let isCollapsed = $derived(!isSidebarOpen);

	const navItems = [
		{
			label: 'Projects',
			href: '/projects',
			activeKey: '/project',
			icon: `<path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M9 8h10M9 12h10M9 16h10M4.99 8H5m-.02 4h.01m0 4H5"/>`
		},

		{
			label: 'Workspace',
			href: '/projects/workspace',
			activeKey: 'analysis',
			icon: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 14H4m6.5 3L8 20m5.5-3 2.5 3M4.88889 17H19.1111c.4909 0 .8889-.4157.8889-.9286V4.92857C20 4.41574 19.602 4 19.1111 4H4.88889C4.39797 4 4 4.41574 4 4.92857V16.0714c0 .5129.39797.9286.88889.9286ZM13 14v-3h4v3h-4Z"/>`
		},
		{
			label: 'Reports',
			href: 'reports',
			activeKey: 'reports',
			icon: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 3v4a1 1 0 0 1-1 1H5m4 10v-2m3 2v-6m3 6v-3m4-11v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7.914a1 1 0 0 1 .293-.707l3.914-3.914A1 1 0 0 1 9.914 3H18a1 1 0 0 1 1 1Z"/>`
		},
		{
			label: 'Support',
			href: 'support',
			activeKey: 'support',
			icon: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.03v13m0-13c-2.819-.831-4.715-1.076-8.029-1.023A.99.99 0 0 0 3 6v11c0 .563.466 1.014 1.03 1.007 3.122-.043 5.018.212 7.97 1.023m0-13c2.819-.831 4.715-1.076 8.029-1.023A.99.99 0 0 1 21 6v11c0 .563-.466 1.014-1.03 1.007-3.122-.043-5.018.212-7.97 1.023"/>`
		}
	];
</script>

<!-- Logo and Toggle Button -->
<div class="pt-4 flex h-16 flex-shrink-0 items-center justify-between px-2">
	<button
		onclick={toggleSidebar}
		class="m-auto justify-center text-gray-500 focus:outline-none dark:text-gray-300"
	>
		<img
			src="/images/logos/logo-graphic-only.png"
			alt="StratiqAI Logo"
			class={`m-auto mt-2 justify-center ${isSidebarOpen ? 'h-18 w-18' : 'h-12 w-12'}`}
		/>
	</button>
	<button onclick={toggleSidebar} class="text-gray-500 focus:outline-none dark:text-gray-300">
		{#if isSidebarOpen}
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
<nav class="font-poppins flex-1 space-y-2 overflow-x-hidden mt-6 px-2 py-4">
	{#each navItems as item}
		<a
			href={item.href}
			class={`group flex rounded-lg overflow-x-hidden px-2 py-2 text-sm font-medium transition-all
				hover:bg-gray-100 dark:hover:bg-gray-800
				${
					active === item.activeKey
						? 'bg-gray-100 text-stone-600 dark:bg-gray-800'
						: 'text-gray-700 dark:text-gray-300'
				}
				${isSidebarOpen ? 'items-center' : 'justify-center items-center'}
			`}
			onclick={() => (active = item.activeKey)}
		>
			<svg class="w-8 h-8 text-gray-800 dark:text-white flex-shrink-0 {isSidebarOpen ? 'mr-1' : ''}" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
				{@html item.icon}
			</svg>
			{#if isSidebarOpen}
				<span class="ml-1 md:inline">{item.label}</span>
			{/if}
		</a>
	{/each}
</nav>

<!-- Footer -->
<div
	class="flex items-center justify-center border-t border-gray-200 py-4 dark:border-gray-700"
>
	<UserDropdown {currentUser} />
</div>
