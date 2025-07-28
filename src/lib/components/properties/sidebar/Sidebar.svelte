<script lang="ts">
    export let property: {
      id: string;
      address: string;
      statusTags: string[];
      // thumbnailUrl: string;
    };

    const menuItems = [
    { label: 'Document Review', active: false, href: `/properties/${property.id}/document` },
    { label: 'Summary', active: true, href: `/properties/${property.id}/summary` },
    { label: 'Analysis', active: false, href: `/properties/${property.id}/analysis` },
    { label: 'Property info', active: false, href: `/properties/${property.id}/property-info` },
    { label: 'Market overview', active: false, href: `/properties/${property.id}/market-overview` },
    { label: 'Sales comps', active: false, href: `/properties/${property.id}/sales-comps` },
    { label: 'Rent comps', active: false, href: `/properties/${property.id}/rent-comps` },
  ];
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
        {#each menuItems as item}
          <a class="block px-2 py-1 rounded hover:bg-gray-100 {item.active ? 'bg-gray-100' : ''}" href={item.href}>{item.label}</a>
        {/each}
      </nav>
    </div>
  

  </aside>
  