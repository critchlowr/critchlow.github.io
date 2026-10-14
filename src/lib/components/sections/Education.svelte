<script lang="ts">
	import { education } from '$lib/data/content';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';
</script>

<SectionWrapper id="education" headingId="education-heading" title="Education">
	<ul class="space-y-8">
		{#each education as edu (edu.degree)}
			<li>
				<div class="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
					<div>
						<h3 class="text-ink-strong font-display text-xl font-semibold">{edu.degree}</h3>
						<p class="text-brand mt-0.5 font-medium">{edu.school}</p>
					</div>
					<p class="text-ink-muted shrink-0 text-sm">{edu.period}</p>
				</div>
				{#if edu.notes && edu.notes.length > 0}
					<ul class="text-ink-muted mt-2 list-disc space-y-1 pl-5">
						{#each edu.notes as note (note)}
							<li>{note}</li>
						{/each}
					</ul>
				{/if}
			</li>
		{/each}
	</ul>
</SectionWrapper>
