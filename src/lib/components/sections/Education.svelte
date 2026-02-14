<script lang="ts">
	import { education } from '$lib/data/content';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';
</script>

<SectionWrapper id="education" headingId="education-heading" number="03" title="Education">
	<div class="space-y-4">
		{#each education as edu}
			<div class="rounded-xl border border-warm-200 bg-white p-6 transition-all hover:border-accent-300 hover:shadow-md dark:border-warm-700 dark:bg-warm-800 dark:hover:border-plum-400">
				<div class="flex flex-col justify-between gap-1 sm:flex-row sm:items-start">
					<div>
						<h3 class="text-lg font-semibold text-primary-700 dark:text-primary-300">{edu.degree}</h3>
						<p class="text-sm font-medium text-accent-600 dark:text-accent-400">{edu.school}</p>
					</div>
					<div class="shrink-0 text-right">
						<span class="inline-block rounded-full bg-warm-100 px-3 py-0.5 text-xs font-medium text-warm-600 dark:bg-warm-700 dark:text-warm-300">{edu.period}</span>
						<p class="mt-1 text-xs text-warm-500 dark:text-warm-500">{edu.location}</p>
					</div>
				</div>
				{#if edu.notes && edu.notes.length > 0}
					<ul class="mt-3 space-y-1">
						{#each edu.notes as note}
							<li class="flex gap-2 text-sm italic text-warm-600 dark:text-warm-400">
								<span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-moss-400" aria-hidden="true"></span>
								<span>{note}</span>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/each}
	</div>
</SectionWrapper>
