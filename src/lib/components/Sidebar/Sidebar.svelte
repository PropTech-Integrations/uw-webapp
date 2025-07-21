<script>
	import Logo from "../Logo/Logo.svelte";

    let active = 'upload'; // Example: tracks current active section
  </script>
  
  <aside class="w-20 md:w-40 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
    <!-- Logo -->
    <div class="flex items-center justify-center h-16 pt-8 border-b border-gray-200 dark:border-gray-700">
      <Logo />
      <!-- <div class="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center text-purple-700 font-bold text-xl">
        🏠
      </div> -->
    </div>
  
    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto px-2 py-4 space-y-1">
      <a
        href="#"
        class="group flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-all
        hover:bg-gray-100 dark:hover:bg-gray-800
        {active === 'upload' ? 'bg-gray-100 dark:bg-gray-800 text-purple-600' : 'text-gray-700 dark:text-gray-300'}"
        on:click={() => active = 'upload'}
      >
        <svg class="w-6 h-6 mr-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 3a2 2 0 00-2 2v12a1 1 0 001.447.894l7.105-3.553A1 1 0 0011 13.382V5a2 2 0 00-2-2H4z" />
        </svg>
        <span class="hidden md:inline">Pipeline</span>
      </a>
  
      <a
        href="#"
        class="group flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-all
        hover:bg-gray-100 dark:hover:bg-gray-800
        {active === 'analysis' ? 'bg-gray-100 dark:bg-gray-800 text-purple-600' : 'text-gray-700 dark:text-gray-300'}"
        on:click={() => active = 'analysis'}
      >
        <svg class="w-6 h-6 mr-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 2a1 1 0 00-1 1v14a1 1 0 001.447.894l7.105-3.553A1 1 0 0012 13.382V3a1 1 0 00-1-1H4z" />
        </svg>
        <span class="hidden md:inline">Markets</span>
      </a>
  
      <a href="#" class="group flex items-center px-2 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
        <svg class="w-6 h-6 mr-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 20a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        <span class="hidden md:inline">Reports</span>
      </a>
  
      <a href="#" class="group flex items-center px-2 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
        <svg class="w-6 h-6 mr-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 000 2h14a1 1 0 100-2H3zM3 9a1 1 0 000 2h14a1 1 0 100-2H3zm0 5a1 1 0 000 2h14a1 1 0 100-2H3z" />
        </svg>
        <span class="hidden md:inline">Dealfinder</span>
      </a>
  
      <a href="#" class="group flex items-center px-2 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
        <svg class="w-6 h-6 mr-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M18 13a1 1 0 00-1-1h-4v2h4a1 1 0 001-1zm-6 1v2h-4v-2h4zm-6 0a1 1 0 00-1-1H2a1 1 0 000 2h3a1 1 0 001-1z" />
        </svg>
        <span class="hidden md:inline">Support</span>
      </a>
    </nav>
  
    <!-- Footer -->
    <div class="px-4 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
      <img src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/bonnie-green.png" alt="User" class="w-10 h-10 rounded-full" />
      <div class="hidden md:flex flex-col text-sm ml-2">
        <span class="text-gray-900 dark:text-white font-semibold">Pro User</span>
        <span class="text-gray-500 dark:text-gray-400 text-xs">PRO</span>
      </div>
    </div>
  </aside>
  