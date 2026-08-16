<script lang="ts">
	import { education } from '$lib/data/content';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';
</script>

<SectionWrapper id="education" headingId="education-heading" number="07" title="Education" alt>
	<div class="space-y-4">
		{#each education as edu (edu.degree)}
			<div
				class="border-warm-200 hover:border-accent-300 dark:border-warm-700 dark:bg-warm-800 dark:hover:border-plum-400 rounded-xl border bg-white p-6 transition-all hover:shadow-md"
			>
				<div class="flex flex-col justify-between gap-1 sm:flex-row sm:items-start">
					<div>
						<h3 class="text-primary-700 dark:text-primary-200 text-lg font-bold">{edu.degree}</h3>
						<p class="text-accent-600 dark:text-accent-300 text-sm font-medium">{edu.school}</p>
					</div>
					<div class="shrink-0 text-right">
						<span
							class="bg-warm-100 text-warm-600 dark:bg-warm-700 dark:text-warm-300 inline-block rounded-full px-3 py-0.5 text-sm font-medium"
							>{edu.period}</span
						>
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
			</div>
		{/each}
	</div>
</SectionWrapper>
