<script lang="ts">
	import { education } from '$lib/data/content';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
</script>

<SectionWrapper id="education" headingId="education-heading" number="07" title="Education" alt>
	<div class="space-y-4">
		{#each education as edu (edu.degree)}
			<Card interactive class="p-6">
				<div class="flex flex-col justify-between gap-1 sm:flex-row sm:items-start">
					<div>
						<h3 class="text-primary-700 dark:text-primary-200 text-lg font-bold">{edu.degree}</h3>
						<p class="text-accent-600 dark:text-accent-300 text-sm font-medium">{edu.school}</p>
					</div>
					<div class="shrink-0 text-right">
						<Badge tone="warm" size="sm">{edu.period}</Badge>
						<p class="text-warm-600 dark:text-warm-400 mt-1 text-sm">{edu.location}</p>
					</div>
				</div>
				{#if edu.notes && edu.notes.length > 0}
					<ul class="mt-3 space-y-1">
						{#each edu.notes as note (note)}
							<li class="text-warm-600 dark:text-warm-400 flex gap-2 text-sm italic">
								<span
									class="bg-moss-400 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
									aria-hidden="true"
								></span>
								<span>{note}</span>
							</li>
						{/each}
					</ul>
				{/if}
			</Card>
		{/each}
	</div>
</SectionWrapper>
