<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		id: string;
		headingId: string;
		title: string;
		/** Sets the section on the sand band instead of the page colour. */
		band?: boolean;
		children: Snippet;
	}

	let { id, headingId, title, band = false, children }: Props = $props();
</script>

<!--
	One section: a large heading and its content on the shared page width. Sections
	are told apart by their ground colour and their own layout, so there is no rule
	between them.
-->
<section {id} aria-labelledby={headingId} class={[band && 'bg-band']}>
	<div class="wrap py-16 md:py-24">
		<h2 id={headingId} class="font-display text-ink-strong text-section mb-9 font-extrabold">
			{title}
		</h2>
		{@render children()}
	</div>
</section>
