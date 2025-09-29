<!-- ComponentC.svelte - Shows all keys and can subscribe to any -->
<script lang="ts">
    import { mapStore } from '$lib/stores/mapStore';
    
    // Subscribe to the list of all keys
    const keys = mapStore.getKeys();
    
    // Subscribe to the entire map
    let totalItems = $derived(Array.from($mapStore.values()).flat().length);
    
    // Dynamically subscribe to a specific key
    let selectedKey = $state('');
    let selectedItems = $derived(selectedKey ? mapStore.subscribeToKey(selectedKey) : null);
    
    function addToSelected() {
      if (selectedKey) {
        const value = prompt(`Add to ${selectedKey}:`);
        if (value) {
          mapStore.addToKey(selectedKey, value);
        }
      }
    }
  </script>
  
  <div class="component">
    <h3>Component C - Dashboard</h3>
    
    <p>Total keys: {$keys.length}</p>
    <p>Total items across all keys: {totalItems}</p>
    
    <div>
      <label>
        Select a key to monitor:
        <select bind:value={selectedKey}>
          <option value="">-- Select --</option>
          {#each $keys as key}
            <option value={key}>{key}</option>
          {/each}
        </select>
      </label>
    </div>
    
    {#if selectedItems}
      <div>
        <h4>Items in "{selectedKey}": {$selectedItems?.length || 0}</h4>
        <ul>
          {#each $selectedItems || [] as item}
            <li>{item}</li>
          {/each}
        </ul>
        <button onclick={addToSelected}>Add to {selectedKey}</button>
      </div>
    {/if}
    
    <button onclick={() => mapStore.deleteKey(selectedKey)} disabled={!selectedKey}>
      Delete Key
    </button>
  </div>
  
  <style>
    .component {
      padding: 1rem;
      background: #f3e5f5;
      border-radius: 8px;
      margin: 0.5rem;
    }
  </style>