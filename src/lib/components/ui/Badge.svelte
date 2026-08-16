<script lang="ts">
	import type { Snippet } from 'svelte';

	type Tone = 'moss' | 'accent' | 'warm';
	type Size = 'xs' | 'sm' | 'md' | 'lg';

	interface Props {
		children: Snippet;
		/** moss = skills and tags, accent = emphasis, warm = neutral metadata. */
		tone?: Tone;
		size?: Size;
		class?: string;
	}

	let { children, tone = 'moss', size = 'xs', class: extra = '' }: Props = $props();

	const tones: Record<Tone, string> = {
		moss: 'bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200',
		accent: 'bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-300',
		warm: 'bg-warm-100 text-warm-600 dark:bg-warm-700 dark:text-warm-300'
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
