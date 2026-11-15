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
	section shares the same left edge. A rule across the column marks where each one
	starts; there are no numbers or reveal animations.
-->
<section {id} aria-labelledby={headingId}>
	<div class="mx-auto max-w-4xl px-5">
		<div class="border-edge border-t py-16 md:py-20">
			<h2 id={headingId} class="text-ink-strong text-title mb-10 font-extrabold">
				{title}
			</h2>
			{@render children()}
		</div>
	</div>
</section>
