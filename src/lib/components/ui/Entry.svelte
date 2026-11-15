<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		/** Left column: dates, a status, anything that places the entry. */
		meta: Snippet;
		/** Lines directly under the title, such as the employer or the authors. */
		lead?: Snippet;
		children?: Snippet;
		as?: 'li' | 'div';
		/** Anchor target, so a link elsewhere can point at this entry. */
		id?: string;
	}

	let { title, meta, lead, children, as = 'li', id }: Props = $props();
</script>

<!--
	One dated entry: a degree, a paper or a job. From the md breakpoint the meta sits
	in a left column and the text in a right column capped at the reading measure, so
	every list on the page scans the same way. Below that the three parts stack.

	The title comes first in the source so the heading is read before its dates; the
	grid placement moves the meta to the left visually.
-->
<svelte:element
	this={as}
	{id}
	class="md:grid md:grid-cols-[10rem_minmax(0,1fr)] md:grid-rows-[auto_1fr] md:gap-x-8"
>
	<div class="max-w-measure md:col-start-2 md:row-start-1">
		<h3 class="text-ink-strong text-entry font-bold">{title}</h3>
		{@render lead?.()}
	</div>
	<div
		class="text-ink-muted mt-2 text-sm md:col-start-1 md:row-span-2 md:row-start-1 md:mt-0 md:pt-1.5"
	>
		{@render meta()}
	</div>
	{#if children}
		<div class="max-w-measure mt-3 md:col-start-2 md:row-start-2">
			{@render children()}
		</div>
	{/if}
</svelte:element>
