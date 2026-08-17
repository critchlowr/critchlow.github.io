<script lang="ts">
	import { inview } from '$lib/actions/inview';
	import type { Snippet } from 'svelte';

	interface Props {
		id: string;
		headingId: string;
		number: string;
		title: string;
		children: Snippet;
		/** Alternate ground. Used to separate neighbouring sections, not decoratively. */
		alt?: boolean;
		/**
		 * Measure. `prose` keeps running text near 65 characters; `wide` is for grids
		 * that need the room. Previously every section was hard-coded to max-w-5xl,
		 * which is too wide for reading and too narrow for the skills wall.
		 */
		width?: 'prose' | 'default' | 'wide';
	}

	let { id, headingId, number, title, children, alt = false, width = 'default' }: Props = $props();

	const measures = {
		prose: 'max-w-3xl',
		default: 'max-w-5xl',
		wide: 'max-w-6xl'
	};
</script>

<!--
	The plain band sits at 68%. The lamps run at full intensity in both themes, and
	this is what stops their light lifting the ground onto the card fill. It damps the
	ambient only behind body copy — the hero and footer carry no section band at all,
	so they show the lamps undimmed.
-->
<section {id} aria-labelledby={headingId} class={alt ? 'bg-band/80' : 'bg-surface/68'}>
	<div class="mx-auto {measures[width]} px-5 py-20 md:py-28">
		<div class="mb-12 flex items-baseline gap-4" use:inview={{ dir: 'up' }}>
			<span
				class="text-brand font-display text-numeral font-semibold tabular-nums"
				aria-hidden="true">{number}</span
			>
			<h2 id={headingId} class="text-ink-strong font-display text-title font-semibold">
				{title}
			</h2>
			<div class="bg-edge rule-draw h-px flex-1"></div>
		</div>
		{@render children()}
	</div>
</section>
