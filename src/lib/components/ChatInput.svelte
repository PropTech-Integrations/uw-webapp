<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher<{ send: string }>();
  
    export let disabled = false;
    let text = '';
  
    function onSend() {
      const value = text.trim();
      if (!value) return;
      dispatch('send', value);
      text = '';
    }
  
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        onSend();
      }
    }
  </script>
  
  <div class="border-t border-gray-200 dark:border-gray-700 p-3">
    <div class="flex gap-2">
      <textarea
        bind:value={text}
        rows="1"
        placeholder="Ask me anything… (Ctrl/⌘+Enter to send)"
        class="flex-1 block w-full p-3 text-sm rounded-2xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
        on:keydown={handleKey}
        disabled={disabled}
      />
      <button
        on:click={onSend}
        disabled={disabled}
        class="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed shadow"
        data-tooltip-target="send-tip"
      >
        Send
      </button>
    </div>
    <div id="send-tip" role="tooltip" class="sr-only">Send (Ctrl/⌘+Enter)</div>
  </div>
  