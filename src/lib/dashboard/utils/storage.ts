import type { Widget, DashboardConfig } from '$lib/dashboard/types/widget';

const STORAGE_KEYS = {
	WIDGETS: 'dashboard_widgets',
	CONFIG: 'dashboard_config',
	VERSION: 'dashboard_version'
} as const;

const CURRENT_VERSION = '1.0.0';

export interface DashboardState {
	widgets: Widget[];
	config: DashboardConfig;
	version: string;
}

export class DashboardStorage {
	private static isLocalStorageAvailable(): boolean {
		try {
			const testKey = '__dashboard_test__';
			localStorage.setItem(testKey, 'test');
			localStorage.removeItem(testKey);
			return true;
		} catch {
			return false;
		}
	}

	static saveDashboard(widgets: Widget[], config: DashboardConfig): boolean {
		if (!this.isLocalStorageAvailable()) {
			console.warn('LocalStorage is not available');
			return false;
		}

		try {
			const state: DashboardState = {
				widgets,
				config,
				version: CURRENT_VERSION
			};

			localStorage.setItem(STORAGE_KEYS.WIDGETS, JSON.stringify(widgets));
			localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
			localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);

			return true;
		} catch (error) {
			console.error('Failed to save dashboard to localStorage:', error);
			return false;
		}
	}

	static loadDashboard(): DashboardState | null {
		if (!this.isLocalStorageAvailable()) {
			return null;
		}

		try {
			const version = localStorage.getItem(STORAGE_KEYS.VERSION);

			// Check if stored version matches current version
			if (version !== CURRENT_VERSION) {
				console.info('Dashboard version mismatch, clearing old data');
				this.clearDashboard();
				return null;
			}

			const widgetsJson = localStorage.getItem(STORAGE_KEYS.WIDGETS);
			const configJson = localStorage.getItem(STORAGE_KEYS.CONFIG);

			if (!widgetsJson || !configJson) {
				return null;
			}

			const widgets = JSON.parse(widgetsJson) as Widget[];
			const config = JSON.parse(configJson) as DashboardConfig;

			// Validate loaded data
			if (!Array.isArray(widgets) || !config.gridColumns || !config.gridRows) {
				console.error('Invalid dashboard data in localStorage');
				return null;
			}

			return {
				widgets,
				config,
				version: CURRENT_VERSION
			};
		} catch (error) {
			console.error('Failed to load dashboard from localStorage:', error);
			return null;
		}
	}

	static clearDashboard(): boolean {
		if (!this.isLocalStorageAvailable()) {
			return false;
		}

		try {
			localStorage.removeItem(STORAGE_KEYS.WIDGETS);
			localStorage.removeItem(STORAGE_KEYS.CONFIG);
			localStorage.removeItem(STORAGE_KEYS.VERSION);
			return true;
		} catch (error) {
			console.error('Failed to clear dashboard from localStorage:', error);
			return false;
		}
	}

	static exportDashboard(): string | null {
		const state = this.loadDashboard();
		if (!state) return null;

		try {
			return JSON.stringify(state, null, 2);
		} catch (error) {
			console.error('Failed to export dashboard:', error);
			return null;
		}
	}

	static importDashboard(jsonString: string): boolean {
		try {
			const state = JSON.parse(jsonString) as DashboardState;

			if (!state.widgets || !state.config) {
				throw new Error('Invalid dashboard data structure');
			}

			return this.saveDashboard(state.widgets, state.config);
		} catch (error) {
			console.error('Failed to import dashboard:', error);
			return false;
		}
	}
}
