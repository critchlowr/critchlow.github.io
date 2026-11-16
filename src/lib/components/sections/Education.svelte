<script lang="ts">
	import { education } from '#lib/data/content.ts';
</script>

<!-- Shares a row with Skills on wide screens; the page lays the two out. -->
<section id="education" aria-labelledby="education-heading">
	<h2 id="education-heading" class="font-display text-ink-strong text-section mb-9 font-extrabold">
		Education
	</h2>
	<ul class="space-y-8">
		{#each education as edu (edu.degree)}
			<li>
				<h3 class="font-display text-ink-strong text-[1.6rem] leading-[1.1] font-bold">
					{edu.degree}
				</h3>
				<p class="text-olive mt-1 font-bold">{edu.school}</p>
				<p class="text-ink-muted text-sm font-semibold">{edu.period}</p>
				{#if edu.notes && edu.notes.length > 0}
					<ul class="text-ink-muted text-body mt-2 space-y-1">
						{#each edu.notes as note (note)}
							<li>{note}</li>
						{/each}
					</ul>
				{/if}
			</li>
		{/each}
	</ul>
</section>
