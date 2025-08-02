<!-- src/lib/NotificationBar.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';

	interface Notification {
		id: number;
		text: string;
	}

	/** How many lines tall by default */
	export let defaultLines: number = 3;

	let notifications: Notification[] = [];

	/** current bar height in pixels */
	let heightPx: string;

	/** assumed line-height (px) per notification */
	const LINE_HEIGHT = 24;

	let isResizing = false;
	let startY = 0;
	let startHeight = 0;

	onMount(() => {
		heightPx = `${defaultLines * LINE_HEIGHT}px`;
	});

	/** call this method to push a new notification */
	export function notify(text: string): void {
		const id = Date.now() + Math.random();
		notifications = [ { id, text }, ...notifications];
	}

	function startResize(event: MouseEvent): void {
		isResizing = true;
		startY = event.clientY;
		startHeight = parseInt(heightPx, 10);
		window.addEventListener('mousemove', resize);
		window.addEventListener('mouseup', stopResize);
	}

	function resize(event: MouseEvent): void {
		if (!isResizing) return;
		const dy = startY - event.clientY;
		let newH = startHeight + dy;
		newH = Math.max(LINE_HEIGHT, Math.min(window.innerHeight, newH));
		heightPx = `${newH}px`;
	}

	function stopResize(): void {
		isResizing = false;
		window.removeEventListener('mousemove', resize);
		window.removeEventListener('mouseup', stopResize);
	}
</script>

<div class="opacity-75">
	<div
		class="fixed bottom-0 left-1/2 z-50 w-1/2 -translate-x-1/2 transform overflow-hidden border-white border-2 rounded-lg bg-black font-sans text-white"
		style="height: {heightPx}; --line-height: {LINE_HEIGHT}px"
	>
		<button
			class="absolute left-0 right-0 top-0 h-1.5 cursor-ns-resize border-none bg-transparent"
			onmousedown={startResize}
			aria-label="Resize notification bar"
		></button>

		<div class="box-border flex h-full flex-col-reverse overflow-hidden opacity-100">
			{#each notifications as { id, text } (id)}
				<div
					class="rounded bg-opacity-10 px-2 text-sm text-white"
					in:fade={{ duration: 300 }}
					animate:flip={{ duration: 400, easing: cubicOut }}
				>
					{text}
				</div>
			{/each}
		</div>
	</div>
</div>
