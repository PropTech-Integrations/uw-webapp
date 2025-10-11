// stores/jobUpdateStore.ts
import { writable, derived, type Writable, type Readable } from 'svelte/store';

export interface JobUpdate {
	readonly id: string;
	readonly request: string;
	readonly result: string | null;
	readonly status: string;
	readonly createdAt: string;
	readonly updatedAt: string;
}

export interface JobSubmissionState {
	readonly result: { id: string; status: string } | null;
	readonly error: Error | null;
	readonly loading: boolean;
	readonly connectionState: 'disconnected' | 'connecting' | 'connected' | 'error';
	readonly reconnectAttempts: number;
}

class JobUpdateStore {
	private updatesStore: Writable<Map<string, JobUpdate[]>>;
	private stateStore: Writable<Map<string, JobSubmissionState>>;
	public subscribeToUpdates: Writable<Map<string, JobUpdate[]>>['subscribe'];
	public subscribeToState: Writable<Map<string, JobSubmissionState>>['subscribe'];
	private updateStores = new Map<string, Readable<JobUpdate[]>>();
	private stateStores = new Map<string, Readable<JobSubmissionState>>();

	constructor() {
		this.updatesStore = writable(new Map());
		this.stateStore = writable(new Map());
		this.subscribeToUpdates = this.updatesStore.subscribe;
		this.subscribeToState = this.stateStore.subscribe;
	}

	// Subscribe to a specific job's updates
	subscribeToJobUpdates(jobId: string): Readable<JobUpdate[]> {
		if (this.updateStores.has(jobId)) {
			return this.updateStores.get(jobId)!;
		}

		const updateStore = derived(this.updatesStore, ($store) => $store.get(jobId) || []);

		this.updateStores.set(jobId, updateStore);
		return updateStore;
	}

	// Subscribe to a specific job's state
	subscribeToJobState(jobId: string): Readable<JobSubmissionState | null> {
		if (this.stateStores.has(jobId)) {
			return this.stateStores.get(jobId)! as Readable<JobSubmissionState | null>;
		}

		const stateStoreItem: Readable<JobSubmissionState | null> = derived(
			this.stateStore,
			($store) => $store.get(jobId) || null
		);

		this.stateStores.set(jobId, stateStoreItem as any);
		return stateStoreItem;
	}

	// Add a job update (prepends to maintain newest-first order)
	addJobUpdate(jobId: string, update: JobUpdate): void {
		this.updatesStore.update((map) => {
			const newMap = new Map(map);
			const current = newMap.get(jobId) || [];
			
			// Prevent duplicates based on updatedAt timestamp
			const isDuplicate = current.some(
				(u) => u.id === update.id && u.updatedAt === update.updatedAt
			);
			
			if (!isDuplicate) {
				newMap.set(jobId, [update, ...current]);
			}
			
			return newMap;
		});
	}

	// Update job state
	updateJobState(jobId: string, state: Partial<JobSubmissionState>): void {
		this.stateStore.update((map) => {
			const newMap = new Map(map);
			const current = newMap.get(jobId) || {
				result: null,
				error: null,
				loading: false,
				connectionState: 'disconnected' as const,
				reconnectAttempts: 0
			};
			newMap.set(jobId, { ...current, ...state });
			return newMap;
		});
	}

	// Set initial job state
	setJobState(jobId: string, state: JobSubmissionState): void {
		this.stateStore.update((map) => {
			const newMap = new Map(map);
			newMap.set(jobId, state);
			return newMap;
		});
	}

	// Clear updates for a specific job
	clearJobUpdates(jobId: string): void {
		this.updatesStore.update((map) => {
			const newMap = new Map(map);
			newMap.set(jobId, []);
			return newMap;
		});
	}

	// Clear state for a specific job
	clearJobState(jobId: string): void {
		this.stateStore.update((map) => {
			const newMap = new Map(map);
			newMap.delete(jobId);
			return newMap;
		});
		this.stateStores.delete(jobId);
	}

	// Delete a job entirely
	deleteJob(jobId: string): void {
		this.updatesStore.update((map) => {
			const newMap = new Map(map);
			newMap.delete(jobId);
			return newMap;
		});
		this.updateStores.delete(jobId);

		this.stateStore.update((map) => {
			const newMap = new Map(map);
			newMap.delete(jobId);
			return newMap;
		});
		this.stateStores.delete(jobId);
	}

	// Get latest update for a job
	getLatestUpdate(jobId: string): Readable<JobUpdate | null> {
		return derived(this.updatesStore, ($store) => {
			const updates = $store.get(jobId);
			return updates && updates.length > 0 ? updates[0] : null;
		});
	}

	// Clear all data
	clearAll(): void {
		this.updatesStore.set(new Map());
		this.stateStore.set(new Map());
		this.updateStores.clear();
		this.stateStores.clear();
	}

	// Get all job IDs
	getAllJobIds(): Readable<string[]> {
		return derived(this.updatesStore, ($store) => Array.from($store.keys()));
	}
}

export const jobUpdateStore = new JobUpdateStore();

