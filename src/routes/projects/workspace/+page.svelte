<script lang="ts">
	import RightChatDrawer from '$lib/components/RightChatDrawer.svelte';
	import { ui } from '$lib/stores/ui.svelte';
	import NewProjectWorkflow from '$lib/components/Project/NewProjectWorkflow.svelte';
	import Button from '$lib/ui/Button.svelte';
</script>

<!-- Full viewport split: main app + right chat drawer -->
<div
	class="flex min-h-[100svh] w-full bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100"
	style={`padding-right:${ui.sidebarOpen ? ui.sidebarWidth : 0}px`}
>
	<!-- Main app area -->
	<div class="flex min-w-0 flex-1 flex-col">
		<!-- Top bar -->
		<header
			class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/70 px-4 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/60"
		>
			<div class="flex items-center gap-3">
				<button
					class="rounded-xl border px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
					onclick={() => (ui.sidebarOpen = !ui.sidebarOpen)}
				>
					{ui.sidebarOpen ? 'Hide AI' : 'Show AI'}
				</button>
				<h1 class="text-base font-semibold">Workspace</h1>
				<p class="hidden text-xs text-gray-500 md:block dark:text-gray-400">
					Build Your AI Powered CRE Expert
				</p>
				<div class="flex-1"></div>
			</div>
			<div class="text-xs opacity-70"></div>
			<div>
				<Button href="/support" icon>Help & Documentation</Button>
			</div>
		</header>

		<!-- Content -->
		<main class="flex-1 p-4">
			<NewProjectWorkflow />
		</main>
	</div>

	<!-- Right chat drawer -->
	<RightChatDrawer />
</div>
