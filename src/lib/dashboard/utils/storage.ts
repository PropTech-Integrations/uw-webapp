import type { Widget, DashboardConfig } from '$lib/dashboard/types/widget';
import { mapStore } from '$lib/stores/mapObjectStore';

const STORAGE_KEYS = {
	WIDGETS: 'dashboard_widgets',
	CONFIG: 'dashboard_config',
	WIDGET_DATA: 'dashboard_widget_data',
	VERSION: 'dashboard_version'
} as const;

const CURRENT_VERSION = '2.0.0'; // Bumped version to include widget data

export interface WidgetDataSnapshot {
	[channelId: string]: any;
}

export interface DashboardState {
	widgets: Widget[];
	config: DashboardConfig;
	widgetData: WidgetDataSnapshot;
	version: string;
}

// Auto-save configuration
let autoSaveWidgetDataEnabled = true;
let autoSaveWidgetDataTimeout: ReturnType<typeof setTimeout> | null = null;
const AUTO_SAVE_DELAY = 1000; // 1 second debounce

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

	/**
	 * Enable or disable auto-save for widget data
	 */
	static setAutoSaveWidgetData(enabled: boolean): void {
		console.log(`🔧 [DashboardStorage] Auto-save widget data: ${enabled ? 'enabled' : 'disabled'}`);
		autoSaveWidgetDataEnabled = enabled;
	}

	/**
	 * Save only widget data (debounced)
	 * Called automatically when mapObjectStore data changes
	 */
	static autoSaveWidgetData(): void {
		if (!autoSaveWidgetDataEnabled) return;

		// Debounce to avoid excessive writes
		if (autoSaveWidgetDataTimeout) {
			clearTimeout(autoSaveWidgetDataTimeout);
		}

		autoSaveWidgetDataTimeout = setTimeout(() => {
			console.log('💾 [DashboardStorage] Auto-saving widget data...');
			this.saveWidgetDataOnly();
			autoSaveWidgetDataTimeout = null;
		}, AUTO_SAVE_DELAY);
	}

	/**
	 * Save only widget data (without full dashboard)
	 */
	private static saveWidgetDataOnly(): boolean {
		if (!this.isLocalStorageAvailable()) {
			return false;
		}

		try {
			// Capture current widget data from mapObjectStore
			const allData = mapStore.getAllData();
			const widgetData: WidgetDataSnapshot = {};
			
			allData.forEach(item => {
				if (item.value !== undefined) {
					widgetData[item.typeId] = item.value;
				}
			});

			localStorage.setItem(STORAGE_KEYS.WIDGET_DATA, JSON.stringify(widgetData));
			console.log(`   ✅ Auto-saved ${Object.keys(widgetData).length} channels`);

			return true;
		} catch (error) {
			console.error('❌ [DashboardStorage] Failed to auto-save widget data:', error);
			return false;
		}
	}

	static saveDashboard(widgets: Widget[], config: DashboardConfig): boolean {
		console.log('\n💾 [DashboardStorage] Saving dashboard to localStorage...');
		
		if (!this.isLocalStorageAvailable()) {
			console.warn('LocalStorage is not available');
			return false;
		}

		try {
			// Capture current widget data from mapObjectStore
			const allData = mapStore.getAllData();
			const widgetData: WidgetDataSnapshot = {};
			
			allData.forEach(item => {
				if (item.value !== undefined) {
					widgetData[item.typeId] = item.value;
					console.log(`   ✅ Captured data for channel: ${item.typeId}`);
				}
			});

			console.log(`   Total channels saved: ${Object.keys(widgetData).length}`);

			const state: DashboardState = {
				widgets,
				config,
				widgetData,
				version: CURRENT_VERSION
			};

			localStorage.setItem(STORAGE_KEYS.WIDGETS, JSON.stringify(widgets));
			localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
			localStorage.setItem(STORAGE_KEYS.WIDGET_DATA, JSON.stringify(widgetData));
			localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);

			console.log('✅ [DashboardStorage] Dashboard saved successfully\n');
			return true;
		} catch (error) {
			console.error('❌ [DashboardStorage] Failed to save dashboard to localStorage:', error);
			return false;
		}
	}

	static loadDashboard(): DashboardState | null {
		console.log('\n📂 [DashboardStorage] Loading dashboard from localStorage...');
		
		if (!this.isLocalStorageAvailable()) {
			console.warn('LocalStorage is not available');
			return null;
		}

		try {
			const version = localStorage.getItem(STORAGE_KEYS.VERSION);

			// Check if stored version matches current version
			if (version !== CURRENT_VERSION) {
				console.info(`   Version mismatch (stored: ${version}, current: ${CURRENT_VERSION}), clearing old data`);
				this.clearDashboard();
				return null;
			}

			const widgetsJson = localStorage.getItem(STORAGE_KEYS.WIDGETS);
			const configJson = localStorage.getItem(STORAGE_KEYS.CONFIG);
			const widgetDataJson = localStorage.getItem(STORAGE_KEYS.WIDGET_DATA);

			if (!widgetsJson || !configJson) {
				console.log('   No saved dashboard found');
				return null;
			}

			const widgets = JSON.parse(widgetsJson) as Widget[];
			const config = JSON.parse(configJson) as DashboardConfig;
			const widgetData = widgetDataJson ? JSON.parse(widgetDataJson) as WidgetDataSnapshot : {};

			// Validate loaded data
			if (!Array.isArray(widgets) || !config.gridColumns || !config.gridRows) {
				console.error('Invalid dashboard data in localStorage');
				return null;
			}

			console.log(`   ✅ Loaded ${widgets.length} widgets`);
			console.log(`   ✅ Loaded ${Object.keys(widgetData).length} widget data channels`);

			// Restore widget data to mapObjectStore
			this.restoreWidgetData(widgetData);

			return {
				widgets,
				config,
				widgetData,
				version: CURRENT_VERSION
			};
		} catch (error) {
			console.error('❌ [DashboardStorage] Failed to load dashboard from localStorage:', error);
			return null;
		}
	}

	/**
	 * Restore widget data to mapObjectStore
	 */
	private static restoreWidgetData(widgetData: WidgetDataSnapshot): void {
		console.log('\n📤 [DashboardStorage] Restoring widget data to mapObjectStore...');
		
		Object.entries(widgetData).forEach(([channelId, data]) => {
			try {
				// Register a temporary producer to restore the data
				const producer = mapStore.registerProducer(
					channelId,
					'dashboard-storage-restore'
				);
				
				producer.publish(data);
				console.log(`   ✅ Restored data for channel: ${channelId}`);
				
				// Unregister the temporary producer
				mapStore.unregister('dashboard-storage-restore');
			} catch (error) {
				console.error(`   ❌ Failed to restore data for channel ${channelId}:`, error);
			}
		});

		console.log('✅ [DashboardStorage] Widget data restoration complete\n');
	}

	static clearDashboard(): boolean {
		console.log('\n🗑️  [DashboardStorage] Clearing dashboard from localStorage...');
		
		if (!this.isLocalStorageAvailable()) {
			return false;
		}

		try {
			localStorage.removeItem(STORAGE_KEYS.WIDGETS);
			localStorage.removeItem(STORAGE_KEYS.CONFIG);
			localStorage.removeItem(STORAGE_KEYS.WIDGET_DATA);
			localStorage.removeItem(STORAGE_KEYS.VERSION);
			
			console.log('✅ [DashboardStorage] Dashboard cleared\n');
			return true;
		} catch (error) {
			console.error('❌ [DashboardStorage] Failed to clear dashboard from localStorage:', error);
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
