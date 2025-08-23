<script lang="ts">
    import { v4 as uuid } from 'uuid';
    import type { ChatMessage, AIAction } from '$lib/types/chat';
    import { parseActionsFromReply } from '$lib/types/chat';
    import { ui } from '$lib/stores/ui.svelte';
  
    let { onActions, model: initialModel }: { onActions?: (actions: AIAction[]) => void; model?: string } = $props();
    let model = $state(initialModel ?? 'gpt-4o-mini');
  
    let loading = $state(false);
    let messages = $state<ChatMessage[]>([
      {
        id: uuid(),
        role: 'assistant',
        content: "Hi! I can help and also control the app. Try: “Add a task to email the pipeline investors today.”",
        ts: new Date().toISOString()
      }
    ]);
    let input = $state('');
  
    function push(role: ChatMessage['role'], content: string) {
      messages = [...messages, { id: uuid(), role, content, ts: new Date().toISOString() }];
      queueMicrotask(() => document.getElementById('chat-end')?.scrollIntoView({ behavior: 'smooth' }));
      try { localStorage.setItem('drawer.messages', JSON.stringify(messages.slice(-200))); } catch {}
    }
  
    $effect(() => {
      try {
        const saved = localStorage.getItem('drawer.messages');
        if (saved) {
          const parsedMessages = JSON.parse(saved);
          // Clean up any messages with invalid roles
          messages = parsedMessages.filter((msg: any) => 
            msg.role === 'system' || msg.role === 'user' || msg.role === 'assistant'
          );
        }
      } catch {}
    });
  
    async function send() {
      const text = input.trim();
      if (!text || loading) return;
      input = '';
      push('user', text);
  
      loading = true;
      try {
        const payload = {
          model,
          messages: messages.map(({ role, content }) => ({ role, content }))
        };
        const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (!res.ok || data.error) {
          push('assistant', `⚠️ ${data.error || res.statusText}`);
          return;
        }
        const reply: string = data.reply ?? '';
        push('assistant', reply);
  
        const actions = parseActionsFromReply(reply);
        if (actions.length) onActions?.(actions);
      } catch (e: any) {
        push('assistant', `⚠️ Network error: ${e?.message ?? e}`);
      } finally {
        loading = false;
      }
    }
  
    function key(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') send();
    }
  
    function toggle() { ui.sidebarOpen = !ui.sidebarOpen; }

    function clearMessages() {
      try {
        localStorage.removeItem('drawer.messages');
        messages = [
          {
            id: uuid(),
            role: 'assistant',
            content: "Hi! I can help and also control the app. Try: \"Add a task to email the pipeline investors today.\"",
            ts: new Date().toISOString()
          }
        ];
      } catch {}
    }
  
    // --- Drag-resize logic ---
    let startX = 0;
    let startWidth = 0;
    let resizing = $state(false);
  
    function beginResize(e: PointerEvent) {
      if (e.button !== 0) return;
      resizing = true;
      startX = e.clientX;
      startWidth = ui.sidebarWidth;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      document.documentElement.classList.add('select-none'); // prevent text selection while dragging
    }
  
    function onResizeMove(e: PointerEvent) {
      if (!resizing) return;
      // Handle is on the LEFT edge of the drawer. Moving pointer LEFT increases width.
      const delta = startX - e.clientX;
      ui.setWidth(startWidth + delta);
    }
  
    function endResize(e: PointerEvent) {
      if (!resizing) return;
      resizing = false;
      try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
      document.documentElement.classList.remove('select-none');
    }
  </script>
  
  <!-- Drawer Shell (fixed overlay on the right) -->
  <div
    class="fixed inset-y-0 right-0 z-40 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col"
    class:hidden={!ui.sidebarOpen}
    style={`width:${ui.sidebarWidth}px`}>
  
    <!-- Left-edge drag handle -->
    <div
      title="Drag to resize"
      on:pointerdown={beginResize}
      on:pointermove={onResizeMove}
      on:pointerup={endResize}
      on:pointercancel={endResize}
      class="absolute left-0 top-0 h-full w-1 cursor-col-resize group"
    >
      <!-- a slightly easier-to-grab invisible area -->
      <div class="absolute -left-1 top-0 h-full w-3"></div>
      <!-- visual affordance (thin line) -->
      <div class="h-full w-px bg-gray-300 dark:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  
    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <!-- <div class="w-9 h-9 rounded-2xl bg-blue-600 text-white grid place-items-center font-semibold">AI</div> -->
        <div>
          <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">StratiqAI</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Ctrl/⌘+Enter to send</div>
        </div>
      </div>
  
      <div class="flex items-center gap-2">
        <select bind:value={model}
          class="text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 px-2 pr-6 py-1">
          <option value="gpt-4o-mini">gpt-4o-mini</option>
          <option value="gpt-4o">gpt-4o</option>
          <option value="gpt-4">gpt-4</option>
          <option value="gpt-4-turbo">gpt-4-turbo</option>
          <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
          <option value="gpt-3.5">gpt-3.5</option>
        </select>
  
        <button type="button" on:click={toggle}
          class="text-xs px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
          Close
        </button>

        <button type="button" on:click={clearMessages}
          class="text-xs px-2 py-1 rounded-lg border border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-800 text-red-700 dark:text-red-200">
          Clear
        </button>
      </div>
    </div>
  
    <!-- Messages -->
    <div class="flex-1 overflow-auto px-4 py-3 space-y-3"
         style={resizing ? 'cursor: col-resize;' : ''}>
      {#each messages as m (m.id)}
        <div class="flex {m.role === 'user' ? 'justify-end' : 'justify-start'}">
          <div class="{m.role === 'user'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'} rounded-2xl px-4 py-2 max-w-[85%]">
            <div class="text-[11px] opacity-70 mb-1">{m.role} · {m.ts ? new Date(m.ts).toLocaleTimeString() : ''}</div>
            <div class="whitespace-pre-wrap text-sm">{m.content}</div>
          </div>
        </div>
      {/each}
      {#if loading}
        <div class="text-xs text-gray-500 dark:text-gray-400">StratiqAI is typing…</div>
      {/if}
      <div id="chat-end"></div>
    </div>
  
    <!-- Composer -->
    <div class="border-t border-gray-200 dark:border-gray-800 p-3">
      <div class="flex gap-2">
        <textarea
          bind:value={input}
          rows="1"
          on:keydown={key}
          placeholder="Ask the AI to help…"
          class="flex-1 w-full p-3 text-sm rounded-2xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
          disabled={loading}
        />
        <button on:click={send} disabled={loading}
          class="px-4 py-2 rounded-2xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60">
          Send
        </button>
      </div>
    </div>
  </div>
  
  <!-- Peek-tab (when closed) -->
  {#if !ui.sidebarOpen}
    <button
      title="Open chat"
      on:click={() => (ui.sidebarOpen = true)}
      class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full bg-blue-600 text-white px-3 py-2 rounded-l-xl shadow">
      Chat
    </button>
  {/if}
  