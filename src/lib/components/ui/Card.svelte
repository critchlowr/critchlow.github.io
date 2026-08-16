<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		/** Adds the hover affordance. Use for cards that link somewhere or open something. */
		interactive?: boolean;
		/** Element to render. Prefer `article` for cards with their own heading. */
		as?: 'div' | 'article' | 'li';
		/** Layout classes — padding, flex, spacing. Styling of the shell itself lives here. */
		class?: string;
	}

	let { children, interactive = false, as = 'div', class: extra = '' }: Props = $props();

	const shell = 'rounded-xl border border-warm-200 bg-white dark:border-warm-700 dark:bg-warm-800';

	// The dark hover was previously split between plum-400 and accent-600 across
	// components. plum-400 sits at 1.04:1 against the resting warm-700 border, so the
	// hover was invisible in dark mode. accent-600 gives 1.47:1, the closest match to
	// the 1.63:1 delta the light theme already uses.
	const hover =
		'transition-all hover:border-accent-300 hover:shadow-md dark:hover:border-accent-600';
</script>

<svelte:element this={as} class="{shell} {interactive ? hover : ''} {extra}">
	{@render children()}
</svelte:element>
