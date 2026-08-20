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
		/** Inline custom properties, e.g. the `--i` stagger index inside a `.stagger` list. */
		style?: string;
		/** Anchor target, so a rail or a link can address this card. */
		id?: string;
	}

	let { children, interactive = false, as = 'div', class: extra = '', style, id }: Props = $props();

	// `@container` lets the contents respond to the column they sit in rather than the
	// viewport — the Work grid goes two-up at sm, so viewport width stopped being a
	// useful signal for anything inside a card.
	// A resting shadow, not just a hover one: in light mode a white card on a parchment
	// band is separated by very little luminance, and the shadow does work that a 1px
	// border cannot.
	const shell = '@container rounded-xl border border-edge bg-surface-raised shadow-sm';

	// Hover is a lift plus a shadow on the spring easing, not a colour swap. The border
	// still moves, but through the --t-edge-hover token, whose contrast against the
	// resting edge is verified once in app.css rather than guessed at per component.
	const hover =
		'transition-[transform,box-shadow,border-color] duration-200 ease-spring ' +
		'hover:border-edge-hover hover:-translate-y-0.5 hover:shadow-lg ' +
		'motion-reduce:transition-none motion-reduce:hover:translate-y-0';
</script>

<svelte:element this={as} {id} class="{shell} {interactive ? hover : ''} {extra}" {style}>
	{@render children()}
</svelte:element>
