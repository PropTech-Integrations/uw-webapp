<script lang="ts">
    import RightChatDrawer from '$lib/components/RightChatDrawer.svelte';
    import type { AIAction } from '$lib/types/chat';
    import { v4 as uuid } from 'uuid';
    import { ui } from '$lib/stores/ui.svelte';
	import NewProjectWorkflow from '$lib/components/Project/NewProjectWorkflow.svelte';
  
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
  <div class="min-h-[100svh] w-full flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
          <p class="text-xs text-gray-500 dark:text-gray-400 hidden md:block">Build Your AI Powered CRE Expert</p>
        </div>
        <div class="text-xs opacity-70"></div>
      </header>
  
      <!-- Content -->
      <main class="flex-1 p-4">
        <NewProjectWorkflow />
      </main>
    </div>
  
    <!-- Right chat drawer -->
    <RightChatDrawer {onActions} />
  </div>
  