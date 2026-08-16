<script lang="ts">
	import { inview } from '$lib/actions/inview';
	import { skills, tools } from '$lib/data/content';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';

	const devIconBase = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';
</script>

<SectionWrapper id="skills" headingId="skills-heading" number="06" title="Skills" alt>
	<div class="space-y-10">
		{#each skills as category (category.label)}
			<div>
				<h3
					class="text-warm-700 dark:text-warm-300 mb-4 text-sm font-semibold tracking-wider uppercase"
				>
					{category.label}
				</h3>
				<div class="flex flex-wrap gap-2">
					{#each category.items as item (item)}
						<span
							class="bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200 rounded-full px-4 py-1.5 text-sm font-medium"
						>
							{item}
						</span>
					{/each}
				</div>
			</div>
		{/each}

		<div>
			<h3
				class="text-warm-700 dark:text-warm-300 mb-4 text-sm font-semibold tracking-wider uppercase"
			>
				Data &amp; Tools
			</h3>
			<div class="stagger-children grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4" use:inview>
				{#each tools as tool (tool.name)}
					<div
						class="border-warm-200 hover:border-accent-300 dark:border-warm-700 dark:bg-warm-800 dark:hover:border-accent-600 flex items-center gap-3 rounded-lg border bg-white px-4 py-3 transition-all hover:shadow-sm"
					>
						<img
							src="{devIconBase}/{tool.icon}.svg"
							alt=""
							class="h-7 w-7"
							loading="lazy"
							aria-hidden="true"
						/>
						<span class="text-warm-700 dark:text-warm-300 text-sm font-medium">{tool.name}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</SectionWrapper>
