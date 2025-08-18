<script lang="ts">
    import RightChatDrawer from '$lib/components/RightChatDrawer.svelte';
    import type { AIAction } from '$lib/types/chat';
    import { v4 as uuid } from 'uuid';
    import { ui } from '$lib/stores/ui.svelte';
  
    // --- demo state ---
    type Task = { id: string; title: string; status: 'todo'|'doing'|'done' };
    let tasks = $state<Task[]>([
      { id: uuid(), title: 'Sketch dashboard layout', status: 'todo' },
      { id: uuid(), title: 'Integrate billing', status: 'doing' },
      { id: uuid(), title: 'Write release notes', status: 'done' }
    ]);
  
    // --- action handlers from AI ---
    function onActions(actions: AIAction[]) {
      for (const a of actions) {
        switch (a.type) {
          case 'add_task': {
            const id = uuid();
            tasks = [...tasks, { id, title: a.payload.title, status: a.payload.status ?? 'todo' }];
            break;
          }
          case 'update_task': {
            tasks = tasks.map(t => t.id === a.payload.id
              ? { ...t, ...('title' in a.payload ? { title: a.payload.title! } : {}), ...('status' in a.payload ? { status: a.payload.status! } : {}) }
              : t);
            break;
          }
          case 'delete_task': {
            tasks = tasks.filter(t => t.id !== a.payload.id);
            break;
          }
          case 'move_task': {
            tasks = tasks.map(t => t.id === a.payload.id ? { ...t, status: a.payload.to } : t);
            break;
          }
        }
      }
    }
  
    // --- helpers ---
    const columns: { key: Task['status']; title: string }[] = [
      { key: 'todo', title: 'To do' },
      { key: 'doing', title: 'In progress' },
      { key: 'done', title: 'Done' },
      { key: 'todo', title: 'To do' },
      { key: 'doing', title: 'In progress' },
      { key: 'done', title: 'Done' }
    ];
  
    function addQuick(status: Task['status']) {
      const title = prompt('Task title?');
      if (!title) return;
      tasks = [...tasks, { id: uuid(), title, status }];
    }
  </script>
  
  <!-- Full viewport split: main app + right chat drawer -->
  <div class="min-h-[100svh] flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
       style={`padding-right:${ui.sidebarOpen ? ui.sidebarWidth : 0}px`}>
    <!-- Main app area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top bar -->
      <header class="sticky top-0 z-10 bg-white/70 dark:bg-gray-900/60 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button class="rounded-xl border px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                  onclick={() => (ui.sidebarOpen = !ui.sidebarOpen)}>
            {ui.sidebarOpen ? 'Hide AI' : 'Show AI'}
          </button>
          <h1 class="text-base font-semibold">Workspace</h1>
          <p class="text-xs text-gray-500 dark:text-gray-400 hidden md:block">Ask the AI to add/move/update tasks.</p>
        </div>
        <div class="text-xs opacity-70">Demo Kanban</div>
      </header>
  
      <!-- Content -->
      <main class="flex-1 p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          {#each columns as col}
            <section class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-3">
              <div class="flex items-center justify-between mb-2">
                <h2 class="text-sm font-semibold">{col.title}</h2>
                <button class="text-xs px-2 py-1 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800"
                        onclick={() => addQuick(col.key)}>+ Add</button>
              </div>
              <ul class="space-y-2">
                {#each tasks.filter(t => t.status === col.key) as t (t.id)}
                  <li class="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 px-3 py-2">
                    <div class="text-sm">{t.title}</div>
                    <div class="mt-2 flex items-center gap-2 text-[11px] text-gray-500">
                      <code class="opacity-80">{t.id.slice(0,8)}</code>
                      <div class="ml-auto flex gap-1">
                        <button class="px-2 py-0.5 rounded border hover:bg-gray-100 dark:hover:bg-gray-700"
                                onclick={() => (tasks = tasks.filter(x => x.id !== t.id))}>Delete</button>
                        <div class="relative">
                          <select bind:value={t.status}
                            class="text-[11px] rounded border border-gray-300 dark:border-gray-700 bg-transparent"
                            onchange={() => (tasks = [...tasks])}>
                            <option value="todo">todo</option>
                            <option value="doing">doing</option>
                            <option value="done">done</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </li>
                {/each}
              </ul>
            </section>
          {/each}
        </div>
      </main>
    </div>
  
    <!-- Right chat drawer -->
    <RightChatDrawer {onActions} />
  </div>
  