<script lang="ts">
	import { inview } from '$lib/actions/inview';
	import { skills, tools } from '$lib/data/content';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';

	const devIconBase = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';
</script>

<SectionWrapper id="skills" headingId="skills-heading" number="06" title="Skills" alt>
	<div class="space-y-10">
		{#each skills as category}
			<div>
				<h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-warm-700 dark:text-warm-300">
					{category.label}
				</h3>
				<div class="flex flex-wrap gap-2">
					{#each category.items as item}
						<span class="rounded-full bg-moss-100 px-4 py-1.5 text-sm font-medium text-moss-700 dark:bg-moss-800 dark:text-moss-200">
							{item}
						</span>
					{/each}
				</div>
			</div>
		{/each}

		<div>
			<h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-warm-700 dark:text-warm-300">
				Data &amp; Tools
			</h3>
			<div class="stagger-children grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4" use:inview>
				{#each tools as tool}
					<div class="flex items-center gap-3 rounded-lg border border-warm-200 bg-white px-4 py-3 transition-all hover:border-accent-300 hover:shadow-sm dark:border-warm-700 dark:bg-warm-800 dark:hover:border-accent-600">
						<img
							src="{devIconBase}/{tool.icon}.svg"
							alt=""
							class="h-7 w-7"
							loading="lazy"
							aria-hidden="true"
						/>
						<span class="text-sm font-medium text-warm-700 dark:text-warm-300">{tool.name}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</SectionWrapper>
