<script lang="ts">
	import type { Project } from '$lib/types';

	interface Props {
		project: Project;
	}

	let { project }: Props = $props();
</script>

<div class="rounded-xl border border-warm-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-warm-700 dark:bg-warm-800">
	<div class="mb-2 flex flex-wrap items-start justify-between gap-2">
		<h3 class="text-lg font-semibold text-primary-700 dark:text-primary-300">{project.title}</h3>
		<span class="rounded-full bg-accent-100 px-2.5 py-0.5 text-xs font-medium text-accent-700 dark:bg-accent-900 dark:text-accent-300">
			{project.period}
		</span>
	</div>
	<p class="mb-3 text-sm text-warm-600 dark:text-warm-400">{project.description}</p>
	<p class="mb-3 text-xs font-medium text-moss-600 dark:text-moss-400">Tools: {project.tools}</p>
	{#if project.bullets.length > 0}
		<ul class="space-y-1">
			{#each project.bullets as bullet}
				<li class="text-sm leading-relaxed text-warm-700 dark:text-warm-300">
					<span class="mr-2 text-accent-400" aria-hidden="true">&bull;</span>{bullet}
				</li>
			{/each}
		</ul>
	{/if}
</div>
