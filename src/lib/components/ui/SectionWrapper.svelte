<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		id: string;
		headingId: string;
		title: string;
		children: Snippet;
		/** Alternate ground, to separate neighbouring sections. */
		alt?: boolean;
	}

	let { id, headingId, title, children, alt = false }: Props = $props();
</script>

<!--
	One plain section: a heading and its content on one container width, so every
	section shares the same left edge. No numbers, rules or reveal animations; the
	page should read like a résumé.
-->
<section {id} aria-labelledby={headingId} class={alt ? 'bg-band' : ''}>
	<div class="mx-auto max-w-4xl px-5 py-16 md:py-20">
		<h2 id={headingId} class="text-ink-strong font-display text-title mb-8 font-semibold">
			{title}
		</h2>
		{@render children()}
	</div>
</section>
