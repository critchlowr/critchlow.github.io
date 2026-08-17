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

<section
	{id}
	aria-labelledby={headingId}
	class={alt ? 'bg-warm-100 dark:bg-warm-900' : 'bg-surface'}
>
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
