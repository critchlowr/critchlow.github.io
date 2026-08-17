<script lang="ts">
	import { education } from '$lib/data/content';
	import { inview } from '$lib/actions/inview';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
</script>

<SectionWrapper id="education" headingId="education-heading" number="07" title="Education">
	<!-- Cards for the same reason Experience uses them: the boundary is what makes an
	     entry scannable, and it matches the section it mirrors. -->
	<ul class="stagger space-y-5" use:inview>
		{#each education as edu, i (edu.degree)}
			<Card as="li" interactive class="p-6 md:p-7" style="--i: {i}">
				<div
					class="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:text-left"
				>
					<div>
						<h3 class="text-ink-strong font-display text-2xl font-semibold">{edu.degree}</h3>
						<p class="text-brand mt-1 text-base font-medium">{edu.school}</p>
					</div>
					<div class="shrink-0 sm:text-right">
						<Badge tone="warm" size="sm">{edu.period}</Badge>
						<p class="text-ink-muted mt-1.5 text-sm">{edu.location}</p>
					</div>
				</div>
				{#if edu.notes && edu.notes.length > 0}
					<ul class="mt-4 space-y-1.5">
						{#each edu.notes as note (note)}
							<li class="text-ink-muted flex gap-2.5 text-base">
								<span class="bg-moss-500 mt-2 h-1.5 w-1.5 shrink-0 rounded-full" aria-hidden="true"
								></span>
								<span>{note}</span>
							</li>
						{/each}
					</ul>
				{/if}
			</Card>
		{/each}
	</ul>
</SectionWrapper>
