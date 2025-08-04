/**
 * @file websocket.ts
 *
 * This utility provides a robust WebSocket client for use in SvelteKit applications.
 * It handles:
 *   - Initial connection setup
 *   - Automatic reconnection with a configurable delay
 *   - JSON message parsing and dispatch
 *   - Optional heartbeat functionality to keep connections alive (commented out by default)
 *
 * Usage:
 *   Import `createWebSocket` and pass lifecycle callbacks (onOpen, onMessage, etc.)
 *   to hook into connection and message events. The returned object gives access
 *   to `send`, `close`, and the current `socket` instance.
 */

/**
 * Example usage in a Svelte component:
 *
 * ```svelte
 * <script lang="ts">
 *   import { onMount, onDestroy } from "svelte";
 *   import { createWebSocket } from "$lib/utils/websocket";
 *
 *   let messages: any[] = [];
 *   let socket: ReturnType<typeof createWebSocket>;
 *
 *   onMount(() => {
 *     socket = createWebSocket({
 *       url: import.meta.env.VITE_WS_URL, // WebSocket URL from .env file
 *       onOpen: () => {
 *         console.log("WebSocket connected");
 *       },
 *       onMessage: (data) => {
 *         messages = [...messages, data];
 *       },
 *       onClose: (event) => {
 *         console.log("WebSocket closed", event);
 *       },
 *       onError: (event) => {
 *         console.error("WebSocket error", event);
 *       },
 *     });
 *   });
 *
 *   onDestroy(() => {
 *     socket?.close(); // Clean up when component unmounts
 *   });
 * </script>
 *
 * <h2>Messages</h2>
 * {#if messages.length === 0}
 *   <p>No messages yet…</p>
 * {:else}
 *   <ul>
 *     {#each messages as msg}
 *       <li><pre>{JSON.stringify(msg, null, 2)}</pre></li>
 *     {/each}
 *   </ul>
 * {/if}
 * ```
 */

// TODO: Messages received are using the any type. Stronger typing is needed.
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Import Environment Variables
import { PUBLIC_WS_URL } from '$env/static/public'; // WebSocket endpoint from environment
import type { StreamEvent } from './types';

type MessageHandler = (data: any) => void;

interface WebSocketOptions {
	url: string;
	reconnectDelayMs?: number; // Optional: delay before attempting reconnect after disconnection
	onMessage?: MessageHandler; // Callback for incoming messages
	onOpen?: () => void; // Callback for successful connection
	onClose?: (event: CloseEvent) => void; // Callback for disconnection
	onError?: (event: Event) => void; // Callback for error events
}

export function createWebSocket(options: WebSocketOptions) {
	const {
		url,
		reconnectDelayMs = 3000, // default: try to reconnect after 3 seconds
		onMessage,
		onOpen,
		onClose,
		onError
	} = options;

	// The web socket is set to null when the connection is closed
	let socket: WebSocket | null = null;

	// A Svelte store to hold the messages
	const { subscribe, update, set } = writable<any[]>([]);

	function connect() {
		// Guard that this function is only called in the browser
		if (!browser) return;

		// Create a new WebSocket connection
		socket = new WebSocket(url);

		/**
		 * Handles the 'open' event for the WebSocket connection.
		 *
		 * - Invokes the onOpen callback if provided.
		 * - Logs a message to the console indicating the WebSocket is connected.
		 * - Clears the Svelte store.
		 */
		socket.addEventListener('open', () => {
			onOpen?.();
			console.log('WebSocket connected - websockets.ts');
			set([]);
		});

		/**
		 * Handles incoming WebSocket messages.
		 *
		 * - Logs the received message data.
		 * - Attempts to parse the message as JSON.
		 * - Invokes the onMessage callback with the parsed message if provided.
		 * - Updates the Svelte store with the new message.
		 *
		 * @param {MessageEvent} event - The message event containing the data.
		 */
		socket.addEventListener('message', (event) => {
			console.log('WebSocket message received:', event.data);
			const str = typeof event.data === 'string' ? event.data : event.data.toString('utf8');

			let msg: any;
			try {
				// Parse the message as JSON
				msg = JSON.parse(str);
				// Invoke the onMessage callback if provided
				onMessage?.(msg);
				// Update the Svelte store with the new message
				update((messages) => [...messages, msg]);
			} catch (e) {
				console.warn('Failed to parse WebSocket message:', e);
			}
		});

		/**
		 * Handles the 'close' event for the WebSocket connection.
		 *
		 * - Logs the WebSocket closure event to the console.
		 * - Invokes the onClose callback if provided.
		 * - Performs cleanup operations.
		 * - Attempts to reconnect after a specified delay.
		 *
		 * @param {CloseEvent} event - The close event containing the reason for closure.
		 */
		// Add an event listener for the 'close' event on the WebSocket
		socket.addEventListener('close', (event) => {
			// Log the closure of the WebSocket connection along with the event details
			console.log('WebSocket closed:', event);
			// Invoke the onClose callback if it is provided
			onClose?.(event);
			// Perform cleanup operations
			cleanup();
			// Attempt to reconnect after a specified delay
			setTimeout(connect, reconnectDelayMs);
		});

		/**
		 * Handles the 'error' event for the WebSocket connection.
		 *
		 * - Logs the WebSocket error event to the console.
		 * - Invokes the onError callback if provided.
		 * - Closes the WebSocket to trigger cleanup and reconnection.
		 *
		 * @param {Event} event - The error event containing details of the error.
		 */
		// Add an event listener for the 'error' event on the WebSocket
		socket.addEventListener('error', (event) => {
			// Log the error event details to the console
			console.log('WebSocket error:', event);
			// Invoke the onError callback if it is provided
			onError?.(event);
			// Close the WebSocket to trigger the 'close' event, initiating cleanup and reconnection
			socket?.close();
		});
	}

	function send(data: any) {
		if (socket?.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify(data));
		}
	}

	function cleanup() {
		socket?.close(); // close the current socket if it's still open
		socket = null;
	}

	if (browser) {
		connect(); // start the connection immediately
	}
	return {
		subscribe, // expose the Svelte store for external access
		send, // function to send a JSON-serializable message
		close: cleanup, // allow consumers to manually close the connection
		get socket() {
			// expose the current socket instance for advanced use cases
			return socket;
		}
	};
}

// instantiate with your endpoint
export const messagesStore = createWebSocket({
	url: PUBLIC_WS_URL,

	// Basic callbacks to log events
	onMessage: (event: StreamEvent) => {
		console.log('websocket message received', event);
		// const type = classify(event.data);
		// console.log('type -------------------------->', type);
		// // Merge each incoming DynamoDB stream event into the current table data
		// docdata = mergeEvents(docdata, [event]);
	},
	onOpen: () => console.log('🔌 WebSocket connected'), // Log on successful connection
	onClose: () => console.log('❌ WebSocket closed'), // Log on connection close
	onError: () => console.warn('⚠️ WebSocket error') // Warn on any connection errors
});
