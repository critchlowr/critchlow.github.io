<script lang="ts">
	import { selectedWork, publications } from '$lib/data/content';
	import { simulator } from '$lib/stores/simulator.svelte';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';

	// The featured card is derived from the same export the Research section renders,
	// so the two can never drift apart.
	const featured = publications.find((p) => p.status === 'published');
</script>

<SectionWrapper id="work" headingId="work-heading" number="03" title="Selected Work">
	{#if featured}
		<article
			class="border-accent-300 bg-accent-50 dark:border-accent-600 dark:bg-accent-950 mb-4 rounded-xl border-2 p-6 md:p-8"
		>
			<div class="mb-3 flex flex-wrap items-center gap-2">
				<span
					class="bg-accent-600 dark:bg-accent-500 rounded-full px-2.5 py-0.5 text-sm font-semibold text-white"
				>
					Peer-reviewed
				</span>
				<span class="text-accent-700 dark:text-accent-300 text-sm font-medium">ASSETS 2026</span>
			</div>
			<h3 class="text-primary-800 dark:text-primary-100 text-xl leading-snug font-bold">
				{featured.title}
			</h3>
			<p class="text-warm-700 dark:text-warm-300 mt-2 text-base">{featured.authors}</p>
			{#if featured.summary}
				<p class="text-warm-700 dark:text-warm-300 mt-3 max-w-3xl text-base leading-relaxed">
					{featured.summary}
				</p>
			{/if}
			<p class="mt-4">
				<ArrowLink href="#research" direction="down" label="Full citation and my contribution" />
			</p>
		</article>
	{/if}

	<div class="grid gap-4 sm:grid-cols-2">
		{#each selectedWork as project (project.title)}
			<Card interactive class="flex flex-col p-6">
				<div class="mb-3 flex items-start justify-between gap-2">
					<h3 class="text-primary-700 dark:text-primary-200 text-lg font-bold">{project.title}</h3>
					<Badge tone="accent" class="shrink-0">{project.period}</Badge>
				</div>
				<p class="text-warm-600 dark:text-warm-400 mb-3 text-base leading-relaxed">
					{project.description}
				</p>

				{#if project.action === 'simulator'}
					<p class="mb-3">
						<ArrowLink label={project.hrefLabel ?? 'Play it'} onclick={() => simulator.launch()} />
					</p>
				{:else if project.href}
					<p class="mb-3">
						<ArrowLink
							href={project.href}
							external={project.external}
							label={project.hrefLabel ?? (project.external ? 'Visit site' : 'Read more')}
						/>
					</p>
				{/if}

				<div
					class="border-warm-100 dark:border-warm-700 mt-auto flex flex-wrap gap-1.5 border-t pt-3"
				>
					{#each project.tools.split(', ') as tool (tool)}
						<Badge>{tool}</Badge>
					{/each}
				</div>
			</Card>
		{/each}
	</div>
</SectionWrapper>
