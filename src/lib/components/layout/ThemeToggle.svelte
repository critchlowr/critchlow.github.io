<script lang="ts">
	import { theme, type ThemeMode } from '$lib/stores/theme.svelte';
	import Icon, { type IconName } from '$lib/components/ui/Icon.svelte';

	// Current state, then what activating does. "Click" would assume a mouse.
	const labels: Record<ThemeMode, string> = {
		light: 'Theme: light. Switch to dark',
		dark: 'Theme: dark. Switch to system',
		system: 'Theme: system. Switch to light'
	};

	const icons: Record<ThemeMode, IconName> = { light: 'sun', dark: 'moon', system: 'monitor' };
</script>

<button
	onclick={theme.toggle}
	aria-label={labels[theme.mode]}
	class="text-ink-muted hover:bg-band hover:text-ink-strong rounded-lg p-2 transition-colors"
>
	<Icon name={icons[theme.mode]} />
</button>
