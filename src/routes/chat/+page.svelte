<script lang="ts">
    import { v4 as uuid } from 'uuid';
    import ChatMessage from '$lib/components/ChatMessage.svelte';
    import ChatInput from '$lib/components/ChatInput.svelte';
    import TypingDots from '$lib/components/TypingDots.svelte';
    import type { ChatMessage as ChatMsg } from '$lib/types/chat';
  
    // ---- state ----
    let messages = $state<ChatMsg[]>([
      {
        id: uuid(),
        role: 'assistant',
        content: "Hi! I'm your AI assistant. How can I help today?",
        ts: new Date().toISOString()
      }
    ]);
    let loading = $state(false);
    let model = $state('gpt-4o-mini'); // easily switch models
  
    // ---- helpers ----
    function push(role: ChatMsg['role'], content: string, pending = false) {
      messages = [
        ...messages,
        { id: uuid(), role, content, ts: new Date().toISOString(), pending }
      ];
    }
  
    async function sendUserMessage(text: string) {
      // optimistic user message
      push('user', text);
  
      // call server
      loading = true;
      try {
        const payload = {
          model,
          messages: messages.map(({ role, content }) => ({ role, content }))
        };
  
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
  
        const data = await res.json();
        if (!res.ok || data.error) {
          push('assistant', `⚠️ Error: ${data.error || res.statusText}`);
          return;
        }
  
        push('assistant', data.reply || '(no reply)');
      } catch (e: any) {
        push('assistant', `⚠️ Network error: ${e?.message ?? e}`);
      } finally {
        loading = false;
        saveLocal();
        scrollToBottom();
      }
    }
  
    function saveLocal() {
      try {
        localStorage.setItem('chat.messages', JSON.stringify(messages.slice(-200)));
        localStorage.setItem('chat.model', model);
      } catch {}
    }
  
    function restoreLocal() {
      try {
        const m = localStorage.getItem('chat.messages');
        const mdl = localStorage.getItem('chat.model');
        if (m) messages = JSON.parse(m);
        if (mdl) model = mdl;
      } catch {}
    }
  
    function clearChat() {
      messages = [];
      saveLocal();
    }
  
    function scrollToBottom() {
      requestAnimationFrame(() => {
        const end = document.getElementById('end-of-chat');
        end?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    }
  
    $effect(() => {
      restoreLocal();
      scrollToBottom();
    });
  </script>
  
  <!-- Page shell -->
  <div class="min-h-[100svh] flex flex-col bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 backdrop-blur sticky top-0 z-10">
      <div class="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-2xl bg-blue-600 text-white grid place-items-center font-semibold">AI</div>
          <div>
            <h1 class="text-base font-semibold text-gray-900 dark:text-gray-100">Chat</h1>
            <p class="text-xs text-gray-500 dark:text-gray-400">Tailwind + Flowbite styling</p>
          </div>
        </div>
  
        <div class="flex items-center gap-2">
          <!-- Model select -->
          <label class="sr-only" for="model">Model</label>
          <select
            id="model"
            bind:value={model}
            class="text-sm rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 px-3 py-2 focus:ring-2 focus:ring-blue-500"
            on:change={saveLocal}
          >
            <option value="gpt-4o-mini">gpt-4o-mini</option>
            <option value="gpt-4o">gpt-4o</option>
            <option value="gpt-4o-mini-transcribe">gpt-4o-mini-transcribe</option>
          </select>
  
          <button
            class="ml-1 text-sm px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
            on:click={clearChat}
            title="Clear conversation"
          >
            Clear
          </button>
        </div>
      </div>
    </header>
  
    <!-- Messages -->
    <main class="flex-1">
      <div class="max-w-4xl mx-auto px-4 py-6">
        {#if messages.length === 0}
          <div class="text-center text-gray-500 dark:text-gray-400 py-16">
            Start the conversation — ask a question!
          </div>
        {/if}
  
        {#each messages as m (m.id)}
          <ChatMessage msg={m} />
        {/each}
  
        {#if loading}
          <div class="my-2">
            <TypingDots />
          </div>
        {/if}
  
        <div id="end-of-chat" class="h-1"></div>
      </div>
    </main>
  
    <!-- Composer -->
    <footer class="bg-white dark:bg-gray-900/60 backdrop-blur sticky bottom-0">
      <div class="max-w-4xl mx-auto">
        <ChatInput on:send={(e) => sendUserMessage(e.detail)} disabled={loading} />
      </div>
    </footer>
  </div>
  