<script lang="ts">
	interface Props {
		title: string;
		subtitle: string;
		location: string;
		period: string;
		bullets?: string[];
		notes?: string[];
	}

	let { title, subtitle, location, period, bullets = [], notes = [] }: Props = $props();
</script>

<div class="relative border-l-2 border-warm-300 py-4 pl-6 dark:border-warm-600">
	<div class="absolute top-6 -left-[7px] h-3 w-3 rounded-full border-2 border-accent-400 bg-warm-50 dark:bg-warm-900"></div>
	<h3 class="text-lg font-semibold text-primary-700 dark:text-primary-300">{title}</h3>
	<p class="text-sm font-medium text-warm-600 dark:text-warm-300">{subtitle}</p>
	<p class="mt-0.5 text-sm text-warm-600 dark:text-warm-400">{location} &middot; {period}</p>
	{#if bullets.length > 0}
		<ul class="mt-2 space-y-1">
			{#each bullets as bullet}
				<li class="text-sm leading-relaxed text-warm-700 dark:text-warm-300">
					<span class="mr-2 text-accent-400" aria-hidden="true">&bull;</span>{bullet}
				</li>
			{/each}
		</ul>
	{/if}
	{#if notes.length > 0}
		<ul class="mt-2 space-y-1">
			{#each notes as note}
				<li class="text-sm italic text-warm-600 dark:text-warm-400">{note}</li>
			{/each}
		</ul>
	{/if}
</div>
