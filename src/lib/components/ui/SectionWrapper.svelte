<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		id: string;
		headingId: string;
		title: string;
		children: Snippet;
	}

	let { id, headingId, title, children }: Props = $props();
</script>

<!--
	One plain section: a heading and its content on one container width, so every
	section shares the same left edge. No numbers, rules or reveal animations; the
	page should read like a résumé.

	`odd:bg-band` shades every other section by its position on the page (the hero
	is the first child), so the alternation survives reordering the sections.
-->
<section {id} aria-labelledby={headingId} class="odd:bg-band">
	<div class="mx-auto max-w-4xl px-5 py-16 md:py-20">
		<h2 id={headingId} class="text-ink-strong font-display text-title mb-8 font-semibold">
			{title}
		</h2>
		{@render children()}
	</div>
</section>
