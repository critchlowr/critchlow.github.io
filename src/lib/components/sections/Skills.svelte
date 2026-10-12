<script lang="ts">
	import { inview } from '$lib/actions/inview';
	import { skills, tools } from '$lib/data/content';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';

	const devIconBase = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';
</script>

<SectionWrapper id="skills" headingId="skills-heading" number="06" title="Skills" alt width="wide">
	<div class="space-y-12">
		{#each skills as category (category.label)}
			<div use:inview={{ dir: 'up' }}>
				<h3 class="text-ink-muted mb-4 font-mono text-xs font-semibold tracking-[0.14em] uppercase">
					{category.label}
				</h3>
				<div class="stagger flex flex-wrap gap-2" use:inview>
					{#each category.items as item, i (item)}
						<span style="--i: {i}"><Badge size="lg">{item}</Badge></span>
					{/each}
				</div>
			</div>
		{/each}

		<div>
			<h3 class="text-ink-muted mb-4 font-mono text-xs font-semibold tracking-[0.14em] uppercase">
				Data &amp; Tools
			</h3>
			<div class="stagger grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4" use:inview>
				{#each tools as tool, i (tool.name)}
					<div
						class="group border-edge bg-surface-raised hover:border-edge-hover ease-spring flex min-h-13 items-center gap-3 rounded-lg border px-4 py-3 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
						style="--i: {i}"
					>
						{#if tool.icon}
							<img
								src="{devIconBase}/{tool.icon}.svg"
								alt=""
								class="ease-spring h-7 w-7 transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
								loading="lazy"
								aria-hidden="true"
							/>
						{/if}
						<span class="text-ink text-sm font-medium">{tool.name}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</SectionWrapper>
