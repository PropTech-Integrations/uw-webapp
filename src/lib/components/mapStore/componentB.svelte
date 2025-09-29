<!-- ComponentB.svelte - Subscribes to "colors" array -->
<script lang="ts">
    import { mapStore } from '$lib/stores/mapStore';
    
    // Subscribe to just the "colors" array
    const colors = mapStore.subscribeToKey('colors');
    
    let newColor = '';
    
    function addColor() {
      if (newColor) {
        mapStore.addToKey('colors', newColor);
        newColor = '';
      }
    }
  </script>
  
  <div class="component">
    <h3>Component B - Colors</h3>
    
    <!-- This only updates when colors array changes -->
    <p>Count: {$colors.length}</p>
    
    <ul>
      {#each $colors as color, index}
        <li>
          {color}
          <button on:click={() => mapStore.removeFromKey('colors', index)}>×</button>
        </li>
      {/each}
    </ul>
    
    <input bind:value={newColor} placeholder="Add color..." />
    <button on:click={addColor}>Add</button>
  </div>
  
  <style>
    .component {
      padding: 1rem;
      background: #fff3e0;
      border-radius: 8px;
      margin: 0.5rem;
    }
  </style>