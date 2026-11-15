<script lang="ts">
	import { skills } from '$lib/data/content';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';
</script>

<!--
	Each group names where the skills were used and links there, so the list reads as
	evidence rather than keywords. No ratings or logo walls: they don't tell a reader
	how well someone knows a thing. The grid matches Entry's columns, with the group
	name where an entry has its dates.
-->
<SectionWrapper id="skills" headingId="skills-heading" title="Skills">
	<ul class="space-y-10">
		{#each skills as group (group.label)}
			<li class="md:grid md:grid-cols-[10rem_minmax(0,1fr)] md:gap-x-8">
				<h3 class="text-ink-strong text-body font-semibold">{group.label}</h3>
				<div class="max-w-measure mt-2 md:mt-0">
					<ul class="text-ink text-body gap-x-8 sm:columns-2" aria-label="{group.label} skills">
						{#each group.items as item (item)}
							<li class="break-inside-avoid">{item}</li>
						{/each}
					</ul>
					<p class="text-ink-muted mt-3 text-sm">
						From
						{#each group.from as place, i (place.href + place.label)}
							{i > 0 ? (i === group.from.length - 1 ? ' and ' : ', ') : ''}<a
								href={place.href}
								class="link font-medium">{place.label}</a
							>
						{/each}
					</p>
				</div>
			</li>
		{/each}
	</ul>
</SectionWrapper>
