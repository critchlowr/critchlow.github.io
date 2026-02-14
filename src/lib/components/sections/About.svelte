<script lang="ts">
	import { about } from '$lib/data/content';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';
</script>

<SectionWrapper id="about" headingId="about-heading" number="01" title="About Me">
	<div class="flex flex-col items-center gap-6 md:flex-row md:items-center">
		<img
			src="/images/ryancritchlow.jpeg"
			alt="Ryan Critchlow"
			class="h-56 w-56 shrink-0 rounded-xl border-2 border-warm-200 object-cover shadow-md dark:border-warm-700 md:h-72 md:w-72"
		/>
		<div class="space-y-4">
			{#each about.paragraphs as paragraph}
				<p class="leading-relaxed text-warm-700 dark:text-warm-300">{paragraph}</p>
			{/each}
			<p class="leading-relaxed text-warm-700 dark:text-warm-300">
				When I'm not coding or researching, you'll find me on a trail with my chocolate lab, training for my next half marathon, or behind a bar crafting cocktails. I'm into road biking, reading, and the occasional long video game session. I like staying active and being outside as much as I can.
			</p>
		</div>
	</div>
</SectionWrapper>
