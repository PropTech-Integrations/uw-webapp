<script lang="ts">
    import PropertyCard from '$lib/components/properties/PropertyCard.svelte';


    interface Property {
      id: string;
      address: string;
      thumbnailUrl?: string;
      statusTags: string[];
      stats?: string[];
      cap?: string;
      grm?: string;
      date: string;
      isDraft?: boolean;
      onFinishDraft?: () => void;
    }
  
    const properties: Property[] = [
      {
        id: '1',
        address: '721 SE 39th Ct, Hillsboro, OR 97123, USA',
        thumbnailUrl: '/images/thumbnails/1.webp',
        statusTags: ['Draft'],
        date: 'Jul 18, 2025',
        isDraft: true,
        onFinishDraft: () => alert('Finish draft clicked!'),
      },
      {
        id: '2',
        address: 'Hobby Lobby 4107 Broadway Street, Mount Vernon, IL 62864',
        statusTags: ['Active', 'Fail'],
        thumbnailUrl: '/images/thumbnails/2.png',
        stats: [
          '280 units',
          '$858.14M',
          '$3M/unit',
          '$2,892.40/SF',
          '296.69K SF',
          '2005/R 2022',
        ],
        cap: '0.29%',
        grm: '177.01',
        date: 'Jul 18, 2025',
      },
      {
        id: '3',
        address: '1697 Marmont Avenue, Los Angeles, CA 90069, USA',
        thumbnailUrl: '/images/thumbnails/3.png',
        statusTags: ['New', 'Fail', 'Example'],
        stats: [
          '8 units',
          '$6.1M',
          '$763K/unit',
          '$948.09/SF',
          '6.43K SF',
          '2001/R 2018',
        ],
        cap: '3.17%',
        grm: '18.94',
        date: 'Jul 18, 2025',
      },
    ];
  </script>
  
  <div class="p-6 space-y-6 w-full bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Pipeline</h1>
      <button class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
        New Analysis
      </button>
    </div>
  
    <!-- Search & Filters -->
    <div class="flex items-center space-x-4">
      <input
        type="text"
        placeholder="search pipeline"
        class="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring"
      />
      <button class="px-3 py-2 border rounded hover:bg-gray-100">Filters</button>
    </div>
  
    <!-- List -->
    <div class="space-y-4">
      {#each properties as prop (prop.id)}
        <PropertyCard {prop} />
      {/each}
    </div>
  </div>
  