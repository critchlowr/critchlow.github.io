<script lang="ts">
	import { about } from '$lib/data/content';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';
</script>

<SectionWrapper id="about" headingId="about-heading" number="01" title="About Me">
	<div class="flex flex-col items-center gap-6 md:flex-row md:items-center">
		<img
			src="/images/ryancritchlow.jpeg"
			alt="Ryan Critchlow"
			class="border-warm-200 dark:border-warm-700 h-56 w-56 shrink-0 rounded-xl border-2 object-cover shadow-md md:h-72 md:w-72"
		/>
		<div class="space-y-4">
			{#each about.paragraphs as paragraph (paragraph)}
				<p class="text-warm-700 dark:text-warm-300 leading-relaxed">{paragraph}</p>
			{/each}
		</div>
	</div>
</SectionWrapper>
