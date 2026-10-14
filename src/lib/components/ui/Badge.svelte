<script lang="ts">
	import type { Snippet } from 'svelte';

	type Tone = 'moss' | 'accent' | 'warm' | 'plum';
	type Size = 'xs' | 'sm' | 'md' | 'lg';

	interface Props {
		children: Snippet;
		/** Colour family. Each pairs a pale fill with text that clears 4.5:1 on it. */
		tone?: Tone;
		size?: Size;
		class?: string;
	}

	let { children, tone = 'moss', size = 'xs', class: extra = '' }: Props = $props();

	// Text at 800 in light and 300 in dark is what clears 4.5:1 against these fills.
	const tones: Record<Tone, string> = {
		moss: 'bg-moss-100 text-moss-800 dark:bg-moss-900 dark:text-moss-300',
		accent: 'bg-accent-100 text-accent-800 dark:bg-accent-950 dark:text-accent-300',
		warm: 'bg-warm-100 text-warm-800 dark:bg-warm-800 dark:text-warm-200',
		plum: 'bg-plum-100 text-plum-800 dark:bg-plum-900 dark:text-plum-300'
	};

	const sizes: Record<Size, string> = {
		xs: 'px-2.5 py-0.5',
		sm: 'px-3 py-0.5',
		md: 'px-3 py-1',
		lg: 'px-4 py-1.5'
	};
</script>

<span class="inline-block rounded-full text-sm font-medium {tones[tone]} {sizes[size]} {extra}">
	{@render children()}
</span>
