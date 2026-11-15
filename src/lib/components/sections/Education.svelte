<script lang="ts">
	import { education } from '$lib/data/content';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';
	import Entry from '$lib/components/ui/Entry.svelte';
</script>

<SectionWrapper id="education" headingId="education-heading" title="Education">
	<ul class="space-y-10">
		{#each education as edu (edu.degree)}
			<Entry title={edu.degree}>
				{#snippet meta()}
					<p>{edu.period}</p>
				{/snippet}
				{#snippet lead()}
					<p class="text-brand mt-0.5 font-medium">{edu.school}</p>
				{/snippet}
				{#if edu.notes && edu.notes.length > 0}
					<ul class="text-ink-muted text-body list-disc space-y-1 pl-5">
						{#each edu.notes as note (note)}
							<li>{note}</li>
						{/each}
					</ul>
				{/if}
			</Entry>
		{/each}
	</ul>
</SectionWrapper>
