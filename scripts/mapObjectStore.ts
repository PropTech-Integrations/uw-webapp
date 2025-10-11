// stores/MapStore.ts
import { writable, derived, get, type Writable, type Readable, type Unsubscriber } from 'svelte/store';

// Type definitions for producers and consumers
interface Producer<T> {
  publish: (value: T) => void;
  update: (updater: (current: T | undefined) => T) => void;
  clear: () => void;
}

interface Consumer<T> {
  subscribe: Readable<T | undefined>['subscribe'];
  get: () => T | undefined;
}

interface ProducerConsumer<T> extends Producer<T>, Consumer<T> {}

// Type registry entry
interface TypeEntry<T = any> {
  store: Writable<T | undefined>;
  producers: Set<string>;
  consumers: Set<string>;
  lastValue?: T;
}

// Main MapStore class - single store for all types
class MapStore {
  // Map of type name to its store and metadata
  private typeRegistry = new Map<string, TypeEntry>();
  
  // Track active registrations
  private registrations = new Map<string, {
    type: string;
    role: 'producer' | 'consumer' | 'both';
  }>();

  /**
   * Register as a producer for a specific type
   * Producers can publish values of the specified type
   */
  registerProducer<T>(typeId: string, registrationId: string, initialValue?: T): Producer<T> {
    this.ensureType<T>(typeId, initialValue);
    const entry = this.typeRegistry.get(typeId)! as TypeEntry<T>;
    
    // Track this producer
    entry.producers.add(registrationId);
    this.registrations.set(registrationId, { type: typeId, role: 'producer' });

    return {
      publish: (value: T) => {
        entry.store.set(value);
        entry.lastValue = value;
      },
      
      update: (updater: (current: T | undefined) => T) => {
        entry.store.update(current => {
          const newValue = updater(current);
          entry.lastValue = newValue;
          return newValue;
        });
      },
      
      clear: () => {
        entry.store.set(undefined);
        entry.lastValue = undefined;
      }
    };
  }

  /**
   * Register as a consumer for a specific type
   * Consumers can subscribe to values of the specified type
   */
  registerConsumer<T>(typeId: string, registrationId: string): Consumer<T> {
    this.ensureType<T>(typeId);
    const entry = this.typeRegistry.get(typeId)! as TypeEntry<T>;
    
    // Track this consumer
    entry.consumers.add(registrationId);
    this.registrations.set(registrationId, { type: typeId, role: 'consumer' });

    return {
      subscribe: entry.store.subscribe,
      
      get: () => get(entry.store)
    };
  }

  /**
   * Register as both producer and consumer for a specific type
   * Can both publish and subscribe to values
   */
  register<T>(typeId: string, registrationId: string, initialValue?: T): ProducerConsumer<T> {
    this.ensureType<T>(typeId, initialValue);
    const entry = this.typeRegistry.get(typeId)! as TypeEntry<T>;
    
    // Track as both producer and consumer
    entry.producers.add(registrationId);
    entry.consumers.add(registrationId);
    this.registrations.set(registrationId, { type: typeId, role: 'both' });

    return {
      publish: (value: T) => {
        entry.store.set(value);
        entry.lastValue = value;
      },
      
      update: (updater: (current: T | undefined) => T) => {
        entry.store.update(current => {
          const newValue = updater(current);
          entry.lastValue = newValue;
          return newValue;
        });
      },
      
      clear: () => {
        entry.store.set(undefined);
        entry.lastValue = undefined;
      },
      
      subscribe: entry.store.subscribe,
      
      get: () => get(entry.store)
    };
  }

  /**
   * Create a derived consumer that transforms data from another type
   */
  registerDerivedConsumer<TSource, TDerived>(
    sourceTypeId: string,
    registrationId: string,
    transformer: (value: TSource | undefined) => TDerived | undefined
  ): Consumer<TDerived> {
    this.ensureType<TSource>(sourceTypeId);
    const sourceEntry = this.typeRegistry.get(sourceTypeId)! as TypeEntry<TSource>;
    
    // Track this as a consumer of the source type
    sourceEntry.consumers.add(registrationId);
    this.registrations.set(registrationId, { type: sourceTypeId, role: 'consumer' });

    const derivedStore = derived(
      sourceEntry.store,
      $value => transformer($value)
    );

    return {
      subscribe: derivedStore.subscribe,
      get: () => get(derivedStore)
    };
  }

  /**
   * Bridge two types - consume from one type and produce to another
   */
  registerBridge<TSource, TTarget>(
    sourceTypeId: string,
    targetTypeId: string,
    registrationId: string,
    transformer: (value: TSource) => TTarget,
    options?: {
      filter?: (value: TSource) => boolean;
      debounceMs?: number;
    }
  ): Unsubscriber {
    const consumer = this.registerConsumer<TSource>(sourceTypeId, `${registrationId}_consumer`);
    const producer = this.registerProducer<TTarget>(targetTypeId, `${registrationId}_producer`);
    
    let timeout: ReturnType<typeof setTimeout>;
    
    return consumer.subscribe(value => {
      if (value === undefined) return;
      if (options?.filter && !options.filter(value)) return;
      
      if (options?.debounceMs) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          producer.publish(transformer(value));
        }, options.debounceMs);
      } else {
        producer.publish(transformer(value));
      }
    });
  }

  /**
   * Unregister a producer/consumer
   */
  unregister(registrationId: string): void {
    const registration = this.registrations.get(registrationId);
    if (!registration) return;
    
    const entry = this.typeRegistry.get(registration.type);
    if (!entry) return;
    
    // Remove from appropriate sets
    if (registration.role === 'producer' || registration.role === 'both') {
      entry.producers.delete(registrationId);
    }
    if (registration.role === 'consumer' || registration.role === 'both') {
      entry.consumers.delete(registrationId);
    }
    
    this.registrations.delete(registrationId);
    
    // Clean up type if no more producers/consumers
    if (entry.producers.size === 0 && entry.consumers.size === 0) {
      this.typeRegistry.delete(registration.type);
    }
  }

  /**
   * Get information about registered types
   */
  getTypeInfo(): Array<{
    typeId: string;
    producerCount: number;
    consumerCount: number;
    hasValue: boolean;
  }> {
    return Array.from(this.typeRegistry.entries()).map(([typeId, entry]) => ({
      typeId,
      producerCount: entry.producers.size,
      consumerCount: entry.consumers.size,
      hasValue: entry.lastValue !== undefined
    }));
  }

  /**
   * Get all registrations for a specific type
   */
  getTypeRegistrations(typeId: string): {
    producers: string[];
    consumers: string[];
  } {
    const entry = this.typeRegistry.get(typeId);
    if (!entry) return { producers: [], consumers: [] };
    
    return {
      producers: Array.from(entry.producers),
      consumers: Array.from(entry.consumers)
    };
  }

  /**
   * Clear all data but keep registrations
   */
  clearData(): void {
    this.typeRegistry.forEach(entry => {
      entry.store.set(undefined);
      entry.lastValue = undefined;
    });
  }

  /**
   * Reset everything
   */
  reset(): void {
    this.typeRegistry.clear();
    this.registrations.clear();
  }

  // Private helper to ensure a type exists
  private ensureType<T>(typeId: string, initialValue?: T): void {
    if (!this.typeRegistry.has(typeId)) {
      this.typeRegistry.set(typeId, {
        store: writable<T | undefined>(initialValue),
        producers: new Set(),
        consumers: new Set(),
        lastValue: initialValue
      });
    } else if (initialValue !== undefined && !this.typeRegistry.get(typeId)!.lastValue) {
      // Set initial value if type exists but has no value
      const entry = this.typeRegistry.get(typeId)! as TypeEntry<T>;
      entry.store.set(initialValue);
      entry.lastValue = initialValue;
    }
  }
}

// Create singleton instance
export const mapStore = new MapStore();

// Convenience functions for common patterns
export function createProducer<T>(typeId: string, registrationId: string, initialValue?: T) {
  return mapStore.registerProducer<T>(typeId, registrationId, initialValue);
}

export function createConsumer<T>(typeId: string, registrationId: string) {
  return mapStore.registerConsumer<T>(typeId, registrationId);
}

export function createProducerConsumer<T>(typeId: string, registrationId: string, initialValue?: T) {
  return mapStore.register<T>(typeId, registrationId, initialValue);
}

// Example usage:
/*
// Define your types
interface UserData {
  id: string;
  name: string;
  role: string;
}

interface AuthState {
  isAuthenticated: boolean;
  token?: string;
}

interface Notification {
  message: string;
  type: 'info' | 'warning' | 'error';
}

// Auth service acts as a producer of AuthState
const authService = mapStore.registerProducer<AuthState>('auth', 'authService', {
  isAuthenticated: false
});

// User service produces UserData
const userService = mapStore.registerProducer<UserData>('user', 'userService');

// Header component consumes both auth and user data
const headerAuth = mapStore.registerConsumer<AuthState>('auth', 'headerComponent');
const headerUser = mapStore.registerConsumer<UserData>('user', 'headerComponent');

// Notification system can both produce and consume notifications
const notificationSystem = mapStore.register<Notification>('notification', 'notificationSystem');

// Bridge example: When user logs in, create a notification
const loginNotificationBridge = mapStore.registerBridge<AuthState, Notification>(
  'auth',
  'notification',
  'loginNotificationBridge',
  (auth) => ({
    message: auth.isAuthenticated ? 'Logged in successfully' : 'Logged out',
    type: 'info'
  }),
  {
    filter: (auth) => auth.isAuthenticated !== undefined
  }
);

// Usage
authService.publish({ isAuthenticated: true, token: 'abc123' });
userService.publish({ id: '1', name: 'John Doe', role: 'admin' });

// Subscribe to changes
headerAuth.subscribe(auth => {
  console.log('Auth state changed:', auth);
});

headerUser.subscribe(user => {
  console.log('User data changed:', user);
});

// Check type information
console.log(mapStore.getTypeInfo());
// [
//   { typeId: 'auth', producerCount: 1, consumerCount: 2, hasValue: true },
//   { typeId: 'user', producerCount: 1, consumerCount: 1, hasValue: true },
//   { typeId: 'notification', producerCount: 2, consumerCount: 1, hasValue: true }
// ]
*/