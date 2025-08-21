<script lang="ts">
  import type { ChatMessage } from '$lib/types/chat';

  export let msg: ChatMessage;

  const isUser = msg.role === 'user';
  const base =
    'max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm border text-sm leading-relaxed';
</script>

<div class="w-full flex {isUser ? 'justify-end' : 'justify-start'} my-2">
  <div class="{base} {isUser
      ? 'bg-blue-600 text-white border-blue-600'
      : 'bg-white text-gray-900 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700'}">
    <slot name="header">
      <div class="mb-1 text-xs opacity-75">
        {isUser ? 'You' : 'assistant'} · {msg.ts ? new Date(msg.ts).toLocaleTimeString() : ''}
      </div>
    </slot>
    <div class="whitespace-pre-wrap">{msg.content}</div>
    {#if msg.pending}
      <div class="mt-2 text-[11px] opacity-70">sending…</div>
    {/if}
  </div>
</div>
