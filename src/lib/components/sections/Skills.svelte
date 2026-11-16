<script lang="ts">
	import { skills } from '#lib/data/content.ts';
</script>

<!--
	Each group names where the skills were used and links there, so the list reads as
	evidence rather than keywords. No ratings or logo walls: they don't tell a reader
	how well someone knows a thing. Shares a row with Education on wide screens.
-->
<section id="skills" aria-labelledby="skills-heading">
	<h2 id="skills-heading" class="font-display text-ink-strong text-section mb-9 font-extrabold">
		Skills
	</h2>
	<ul class="space-y-8">
		{#each skills as group (group.label)}
			<li>
				<h3 class="font-display text-ink-strong text-[1.6rem] leading-[1.1] font-bold">
					{group.label}
				</h3>
				<ul class="mt-3 flex flex-wrap gap-2" aria-label="{group.label} skills">
					{#each group.items as item (item)}
						<li class="bg-chip text-ink rounded-full px-3 py-1">{item}</li>
					{/each}
				</ul>
				<p class="text-ink-muted mt-3 text-sm">
					From
					{#each group.from as place, i (place.href + place.label)}
						{i > 0 ? (i === group.from.length - 1 ? ' and ' : ', ') : ''}<a
							href={place.href}
							class="link py-1 font-medium">{place.label}</a
						>
					{/each}
				</p>
			</li>
		{/each}
	</ul>
</section>
