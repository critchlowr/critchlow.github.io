<script lang="ts">
	import { projects } from '$lib/data/content';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';
</script>

<SectionWrapper id="projects" headingId="projects-heading" number="05" title="Projects & Research">
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each projects as project}
			<div class="flex flex-col rounded-xl border border-warm-200 bg-white p-6 transition-all hover:border-accent-300 hover:shadow-md dark:border-warm-700 dark:bg-warm-800 dark:hover:border-accent-600">
				<div class="mb-3 flex items-start justify-between gap-2">
					<h3 class="text-lg font-bold text-primary-700 dark:text-primary-200">{project.title}</h3>
					<span class="shrink-0 rounded-full bg-accent-100 px-2.5 py-0.5 text-sm font-medium text-accent-700 dark:bg-accent-900 dark:text-accent-300">
						{project.period}
					</span>
				</div>
				<p class="mb-3 text-sm leading-relaxed text-warm-600 dark:text-warm-400">{project.description}</p>
				<div class="mt-auto flex flex-wrap gap-1.5 pt-3 border-t border-warm-100 dark:border-warm-700">
					{#each project.tools.split(', ') as tool}
						<span class="rounded-full bg-moss-100 px-2.5 py-0.5 text-sm font-medium text-moss-700 dark:bg-moss-800 dark:text-moss-200">
							{tool}
						</span>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</SectionWrapper>
