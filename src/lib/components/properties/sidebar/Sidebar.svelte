<script lang="ts">
    export let property: {
      address: string;
      statusTags: string[];
      // thumbnailUrl: string;
    };
  </script>
  
  <aside class="w-64 bg-white border-r flex flex-col">
    <div class="p-4 flex-1">
      <!-- Placeholder thumbnail -->
      <div class="w-full h-40 bg-gray-100 rounded mb-4 flex items-center justify-center">
        <!-- <img src={property.thumbnailUrl} alt="Property thumbnail" class="w-full h-full object-cover rounded" /> -->
         <img src="/images/thumbnails/3.png" alt="Property thumbnail" class="w-full h-full object-cover rounded" />
      </div>
  
      <h2 class="font-semibold">{property.address}</h2>
      <div class="flex flex-wrap gap-2 mt-2">
        {#each property.statusTags as tag}
          <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{tag}</span>
        {/each}
      </div>
  
      <nav class="mt-6 space-y-1 text-sm text-gray-600">
        <a class="block px-2 py-1 bg-purple-50 text-purple-700 rounded" href="#">Summary</a>
        <a class="block px-2 py-1 rounded hover:bg-gray-100" href="#">Analyses</a>
        <a class="block px-2 py-1 rounded hover:bg-gray-100" href="#">Property info</a>
        <a class="block px-2 py-1 rounded hover:bg-gray-100" href="#">Attachments</a>
        <!-- … -->
      </nav>
    </div>
  
    <div class="p-4 border-t">
      <button class="w-full mb-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
        Create brochure
      </button>
      <button class="w-full px-4 py-2 border rounded hover:bg-gray-100">
        Share property website
      </button>
    </div>
  </aside>
  