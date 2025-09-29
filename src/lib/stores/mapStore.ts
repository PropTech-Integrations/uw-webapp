// stores/MapStore.ts
import { writable, derived, type Writable, type Readable } from 'svelte/store';

class MapStore {
  private store: Writable<Map<string, string[]>>;
  public subscribe: Writable<Map<string, string[]>>['subscribe'];
  private itemStores = new Map<string, Readable<string[]>>();

  constructor() {
    this.store = writable(new Map());
    this.subscribe = this.store.subscribe;
  }

  // Subscribe to a specific key's array
  subscribeToKey(key: string): Readable<string[]> {
    // Return cached store if it exists
    if (this.itemStores.has(key)) {
      return this.itemStores.get(key)!;
    }

    // Create a derived store for this specific key
    const itemStore = derived(
      this.store,
      $store => $store.get(key) || []
    );

    this.itemStores.set(key, itemStore);
    return itemStore;
  }

  // Add a string to a specific key's array
  addToKey(key: string, value: string): void {
    this.store.update(map => {
      const newMap = new Map(map);
      const current = newMap.get(key) || [];
      newMap.set(key, [...current, value]);
      return newMap;
    });
  }

  // Remove a string from a specific key's array
  removeFromKey(key: string, index: number): void {
    this.store.update(map => {
      const newMap = new Map(map);
      const current = newMap.get(key);
      if (current) {
        newMap.set(key, current.filter((_, i) => i !== index));
      }
      return newMap;
    });
  }

  // Set an entire array for a key
  setKey(key: string, values: string[]): void {
    this.store.update(map => {
      const newMap = new Map(map);
      newMap.set(key, values);
      return newMap;
    });
  }

  // Delete a key entirely
  deleteKey(key: string): void {
    this.store.update(map => {
      const newMap = new Map(map);
      newMap.delete(key);
      return newMap;
    });
    
    // Clean up cached store
    this.itemStores.delete(key);
  }

  // Clear all data
  clear(): void {
    this.store.set(new Map());
    this.itemStores.clear();
  }

  // Get all keys
  getKeys(): Readable<string[]> {
    return derived(this.store, $store => Array.from($store.keys()));
  }
}

export const mapStore = new MapStore();