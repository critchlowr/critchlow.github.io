<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		/** Element to render. Use `article` for a card with its own heading, `li` inside a list. */
		as?: 'div' | 'article' | 'li';
		/** Layout classes: padding, flex, spacing. The card's own look lives here. */
		class?: string;
		/** Anchor target, so a link elsewhere can point at this card. */
		id?: string;
	}

	let { children, as = 'div', class: extra = '', id }: Props = $props();

	// `@container` lets contents size to the card rather than the viewport. The
	// resting shadow separates a white card from the light page band, where the
	// 1px border alone is faint.
	const shell = '@container rounded-xl border border-edge bg-surface-raised shadow-sm';
</script>

<svelte:element this={as} {id} class="{shell} {extra}">
	{@render children()}
</svelte:element>
