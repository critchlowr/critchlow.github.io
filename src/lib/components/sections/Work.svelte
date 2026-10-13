<script lang="ts">
	import { selectedWork } from '$lib/data/content';
	import { simulator } from '$lib/stores/simulator.svelte';
	import { inview } from '$lib/actions/inview';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
</script>

<SectionWrapper id="work" headingId="work-heading" number="03" title="Selected Work">
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
