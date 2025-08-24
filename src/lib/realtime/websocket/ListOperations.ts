// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// ListOperations.ts
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

// Import the UserItem type from the types folder
import type { UserItem } from '$lib/types/UserItem';

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// List Operations Section
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

// Generic helpers to manage a list of T by a computed key.
// Works great with Svelte 5 $state deep reactivity (mutations are tracked).

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Key Functions Section
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

// A function type that takes an object of type T and returns a string key.
// This is used to uniquely identify items in a list.
export type KeyFn<T> = (x: T) => string;

// A function type that takes an object of type T and returns a normalized version of it.
// This is used to ensure that items are in a consistent format before processing.
export type NormalizeFn<T> = (x: T) => T;

// The keyJoin function generates a composite key function for objects of type T.
// It takes a variable number of field names (keys of T) as arguments.
export function keyJoin<T>(...fields: (keyof T)[]): KeyFn<T> {
	// Returns a function that, given an object x of type T, maps each specified field
	// to its string representation, joins them with a '#' separator, and returns the result.
	return (x) => fields.map((f) => String((x as any)[f])).join('#');
}

export function createListOps<T>(opts: { keyFor: KeyFn<T>; normalize?: NormalizeFn<T> }) {
	// Use the provided normalize function or default to identity function if not provided
	const norm: NormalizeFn<T> = opts.normalize ?? ((x) => x);

	// --- MUTATING versions (perfect for $state arrays) ---
	// Function to insert or update an item in the list in place
	function upsertMutable(items: T[], it: T): void {
		console.log('upsertMutable', it);
		it = norm(it); // Normalize the item
		const k = opts.keyFor(it); // Get the key for the item
		const i = items.findIndex((x) => opts.keyFor(x) === k); // Find the index of the item in the list
		if (i >= 0)
			items[i] = it; // If found, update the item
		else items.unshift(it); // If not found, add the item to the start of the list
	}

	function removeMutable(items: T[], it: T): void {
		const k = opts.keyFor(norm(it)); // Get the key for the normalized item
		// In-place filter to remove the item, reducing garbage collection
		let w = 0;
		for (let r = 0; r < items.length; r++) {
			if (opts.keyFor(items[r]) !== k) items[w++] = items[r]; // Retain items that don't match the key
		}
		items.length = w; // Adjust the length of the array to remove unwanted items
	}

	// --- IMMUTABLE versions (return a new array) ---
	// Function to insert or update an item in the list and return a new list
	function upsert(items: T[], it: T): T[] {
		it = norm(it); // Normalize the item
		const k = opts.keyFor(it); // Get the key for the item
		const i = items.findIndex((x) => opts.keyFor(x) === k); // Find the index of the item in the list
		if (i >= 0) {
			const copy = items.slice(); // Create a shallow copy of the list
			copy[i] = it; // Update the item in the copy
			return copy; // Return the updated copy
		}
		return [it, ...items]; // If not found, add the item to the start of a new list
	}

	// Function to remove an item from the list and return a new list
	function remove(items: T[], it: T): T[] {
		const k = opts.keyFor(norm(it)); // Get the key for the normalized item
		return items.filter((x) => opts.keyFor(x) !== k); // Return a new list without the item
	}

	// Return the operations with the key and normalize functions
	return { keyFor: opts.keyFor, normalize: norm, upsertMutable, removeMutable, upsert, remove };
}

// Create list operations specifically for UserItem type
export const userItemOps = createListOps<UserItem>({
	keyFor: (it) => it.entityId, // Define how to generate a key for UserItem
	normalize: (it) => {
		if (typeof it.data === 'string') {
			try {
				return { ...it, data: JSON.parse(it.data) }; // Parse data if it's a string
			} catch {
				// Keep original data on parse failure
			}
		}
		return it; // Return the item as is if no parsing is needed
	}
});
