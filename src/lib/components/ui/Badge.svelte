<script lang="ts">
	import type { Snippet } from 'svelte';

	type Tone = 'moss' | 'accent' | 'warm' | 'plum';
	type Size = 'xs' | 'sm' | 'md' | 'lg';

	interface Props {
		children: Snippet;
		/** moss = skills and tags, accent = emphasis, warm = neutral metadata, plum = systems. */
		tone?: Tone;
		size?: Size;
		class?: string;
	}

	let { children, tone = 'moss', size = 'xs', class: extra = '' }: Props = $props();

	// Text sits at 800 in light and 300 in dark. The ramps now follow Tailwind's
	// lightness curve, so the old 700/200 pairs no longer clear 4.5:1 against their
	// own fills — the stop moved because the ramp did, not because the design did.
	const tones: Record<Tone, string> = {
		moss: 'bg-moss-100 text-moss-800 dark:bg-moss-900 dark:text-moss-300',
		accent: 'bg-accent-100 text-accent-800 dark:bg-accent-950 dark:text-accent-300',
		warm: 'bg-warm-100 text-warm-800 dark:bg-warm-800 dark:text-warm-200',
		plum: 'bg-plum-100 text-plum-800 dark:bg-plum-900 dark:text-plum-300'
	};

	// These are the four paddings already in use across the site, kept exactly so the
	// extraction is not also a restyle.
	const sizes: Record<Size, string> = {
		xs: 'px-2.5 py-0.5', // tags, tool chips, period pills in the work grid
		sm: 'px-3 py-0.5', // period pills on experience and education cards
		md: 'px-3 py-1', // simulator flow steps
		lg: 'px-4 py-1.5' // skill pills
	};
</script>

<span class="inline-block rounded-full text-sm font-medium {tones[tone]} {sizes[size]} {extra}">
	{@render children()}
</span>
