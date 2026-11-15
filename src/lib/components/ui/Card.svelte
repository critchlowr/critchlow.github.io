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

	// `@container` lets contents size to the card rather than the viewport.
	const shell = '@container rounded-md border border-edge bg-surface-raised';
</script>

<svelte:element this={as} {id} class="{shell} {extra}">
	{@render children()}
</svelte:element>
