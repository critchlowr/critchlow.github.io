<script lang="ts">
	import { inview } from '$lib/actions/inview';
	import type { Snippet } from 'svelte';

	interface Props {
		id: string;
		headingId: string;
		number: string;
		title: string;
		children: Snippet;
		alt?: boolean;
	}

	let { id, headingId, number, title, children, alt = false }: Props = $props();
</script>

<section
	{id}
	aria-labelledby={headingId}
	class={alt
		? 'bg-warm-100 dark:bg-warm-800/50'
		: 'bg-warm-50 dark:bg-warm-900'}
>
	<div class="fade-in-up mx-auto max-w-5xl px-4 py-16 md:py-24" use:inview>
		<div class="mb-10 flex items-baseline gap-3">
			<span class="text-4xl font-bold text-accent-400 dark:text-accent-300" aria-hidden="true">{number}</span>
			<h2 id={headingId} class="text-2xl font-bold text-primary-700 dark:text-primary-200">{title}</h2>
			<div class="h-px flex-1 bg-warm-200 dark:bg-plum-800"></div>
		</div>
		{@render children()}
	</div>
</section>
