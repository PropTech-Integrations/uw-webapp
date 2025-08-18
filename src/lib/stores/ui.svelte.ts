// Simple, persistent UI store for the right sidebar
const LOC_KEY = 'ui.sidebarWidth';

function loadWidth(): number {
	if (typeof localStorage === 'undefined') return 448; // 28rem default
	const v = Number(localStorage.getItem(LOC_KEY));
	return Number.isFinite(v) && v >= 240 ? v : 448;
}

class UIStore {
	sidebarOpen = $state(true);
	sidebarWidth = $state(loadWidth()); // pixels

	setWidth(px: number) {
		const min = 280; // px
		const max = Math.min(Math.round(globalThis?.innerWidth ? innerWidth * 0.6 : 900), 900);
		const clamped = Math.max(min, Math.min(max, Math.round(px)));
		this.sidebarWidth = clamped;
		try { localStorage.setItem(LOC_KEY, String(clamped)); } catch {}
	}
}

export const ui = new UIStore();