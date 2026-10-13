type ThemeMode = 'light' | 'dark' | 'system';

function createThemeStore() {
	let mode = $state<ThemeMode>('system');

	function apply(m: ThemeMode) {
		if (typeof document === 'undefined') return;
		const isDark =
			m === 'dark' || (m === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
		document.documentElement.classList.toggle('dark', isDark);
	}

	function init() {
		let saved: ThemeMode | null = null;
		try {
			saved = localStorage.getItem('theme') as ThemeMode | null;
		} catch {
			// Storage can be blocked; follow the system setting.
		}
		if (saved && ['light', 'dark', 'system'].includes(saved)) {
			mode = saved;
		}
		apply(mode);

		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
			if (mode === 'system') apply('system');
		});
	}

	function toggle() {
		const next: ThemeMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
		mode = next;
		try {
			localStorage.setItem('theme', next);
		} catch {
			// The choice still applies for this visit.
		}
		apply(next);
	}

	return {
		get mode() {
			return mode;
		},
		init,
		toggle
	};
}

export const theme = createThemeStore();
