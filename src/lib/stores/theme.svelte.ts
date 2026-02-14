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
		const saved = localStorage.getItem('theme') as ThemeMode | null;
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
		localStorage.setItem('theme', next);
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
