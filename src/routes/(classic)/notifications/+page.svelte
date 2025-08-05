<script lang="ts">
	// Import Environment Variables
	import { PUBLIC_WS_URL } from '$env/static/public'; // WebSocket endpoint from environment

	// Import Application Libraries, Types, and Functions
	import { messagesStore } from '$lib/websockets/websockets'; // Factory to create a configured WebSocket
</script>

<section
	class="space-y-6 rounded-2xl bg-white bg-gradient-to-br from-zinc-50 via-red-50 to-indigo-50 p-6 shadow-md"
>
<h1>Notifications</h1>
<!-- display all messages with fade-in effect -->
{#each $messagesStore as msg}
	<div class="flex flex-col gap-2 transition-opacity duration-500 ease-in opacity-0 animate-fadeIn">
		<pre>{JSON.stringify(msg.data, null, 2)}</pre>
	</div>
{/each}
</section>
<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	.animate-fadeIn {
		animation: fadeIn 0.5s forwards;
	}
</style>