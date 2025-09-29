<!-- App.svelte -->
<script lang="ts">
    import { stringStore } from '$lib/stores/mapStore';
    
    let inputValue = '';
    
    function handleAdd() {
      if (inputValue.trim()) {
        stringStore.add(inputValue);
        inputValue = '';
      }
    }
  </script>
  
  <div>
    <h2>String Store Demo</h2>
    
    <!-- Auto-subscribes with $ prefix -->
    <p>Total items: {$stringStore.length}</p>
    
    <ul>
      {#each $stringStore as str, index}
        <li>
          {str}
          <button on:click={() => stringStore.remove(index)}>Delete</button>
        </li>
      {/each}
    </ul>
    
    <form on:submit|preventDefault={handleAdd}>
      <input bind:value={inputValue} placeholder="Add a string..." />
      <button type="submit">Add</button>
    </form>
    
    <button on:click={() => stringStore.clear()}>Clear All</button>
  </div>