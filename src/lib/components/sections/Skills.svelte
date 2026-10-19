<script lang="ts">
	import { skills } from '$lib/data/content';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';
</script>

<!--
	Each group names where the skills were used and links there, so the list reads as
	evidence rather than keywords. No ratings or logo walls: they don't tell a reader
	how well someone knows a thing.
-->
<SectionWrapper id="skills" headingId="skills-heading" title="Skills">
	<ul class="grid gap-5 md:grid-cols-2">
		{#each skills as group (group.label)}
			<li class="border-edge bg-surface-raised rounded-xl border p-5 md:p-6">
				<h3 class="text-ink-strong font-semibold">{group.label}</h3>
				<ul class="mt-3 flex flex-wrap gap-2" aria-label="{group.label} skills">
					{#each group.items as item (item)}
						<li class="bg-chip text-ink rounded-full px-3 py-1 text-sm">{item}</li>
					{/each}
				</ul>
				<p class="text-ink-muted mt-4 text-sm">
					From
					{#each group.from as place, i (place.href + place.label)}
						{i > 0 ? (i === group.from.length - 1 ? ' and ' : ', ') : ''}<a
							href={place.href}
							class="text-link font-medium underline underline-offset-4">{place.label}</a
						>
					{/each}
				</p>
			</li>
		{/each}
	</ul>
</SectionWrapper>
