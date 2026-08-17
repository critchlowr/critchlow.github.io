<script lang="ts">
	import { selectedWork, publications } from '$lib/data/content';
	import { simulator } from '$lib/stores/simulator.svelte';
	import { inview } from '$lib/actions/inview';
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
			class="border-accent-300 bg-accent-50 dark:border-accent-700 dark:bg-accent-950 mb-5 rounded-xl border-2 p-6 md:p-8"
			use:inview={{ dir: 'scale' }}
		>
			<div class="mb-3 flex flex-wrap items-center gap-2">
				<span
					class="bg-accent-700 dark:bg-accent-300 dark:text-accent-950 rounded-full px-3 py-0.5 text-sm font-semibold text-white"
				>
					Peer-reviewed
				</span>
				<span class="text-accent-800 dark:text-accent-300 text-sm font-medium">ASSETS 2026</span>
			</div>
			<h3 class="text-ink-strong font-display text-2xl leading-snug font-semibold">
				{featured.title}
			</h3>
			<p class="text-ink-muted mt-2 text-base">{featured.authors}</p>
			{#if featured.summary}
				<p class="text-ink text-body mt-3 max-w-3xl">
					{featured.summary}
				</p>
			{/if}
			<p class="mt-4">
				<ArrowLink href="#research" direction="down" label="Full citation and my contribution" />
			</p>
		</article>
	{/if}

	<div class="stagger grid gap-5 sm:grid-cols-2" use:inview>
		{#each selectedWork as project, i (project.title)}
			<div style="--i: {i}" class="flex">
				<Card interactive as="article" class="flex w-full flex-col p-6">
					<div class="mb-3 flex items-start justify-between gap-3">
						<h3 class="text-ink-strong font-display text-xl font-semibold">{project.title}</h3>
						<Badge tone="accent" size="sm" class="shrink-0">{project.period}</Badge>
					</div>
					<p class="text-ink-muted mb-4 text-base leading-relaxed">
						{project.description}
					</p>

					{#if project.action === 'simulator'}
						<p class="mb-4">
							<ArrowLink
								label={project.hrefLabel ?? 'Play it'}
								onclick={() => simulator.launch()}
							/>
						</p>
					{:else if project.href}
						<p class="mb-4">
							<ArrowLink
								href={project.href}
								external={project.external}
								label={project.hrefLabel ?? (project.external ? 'Visit site' : 'Read more')}
							/>
						</p>
					{/if}

					<div class="border-edge mt-auto flex flex-wrap gap-1.5 border-t pt-4">
						{#each project.tools.split(', ') as tool (tool)}
							<Badge tone="plum">{tool}</Badge>
						{/each}
					</div>
				</Card>
			</div>
		{/each}
	</div>
</SectionWrapper>
