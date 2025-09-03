import { writable } from 'svelte/store';
import type { Project } from '$lib/types/Project';

// Create writable stores for project state
export const project = writable<Project | null>(null);
export const loading = writable(false);
export const error = writable<string | null>(null);

// Helper functions to update the stores
export const setProject = (projectData: Project) => {
	project.set(projectData);
	error.set(null);
};

export const updateProject = (updates: Partial<Project>) => {
	project.update(currentProject => {
		if (currentProject) {
			return { ...currentProject, ...updates };
		}
		return currentProject;
	});
};

export const setLoading = (loadingState: boolean) => {
	loading.set(loadingState);
};

export const setError = (errorMessage: string | null) => {
	error.set(errorMessage);
	loading.set(false);
};

export const clear = () => {
	project.set(null);
	loading.set(false);
	error.set(null);
};
