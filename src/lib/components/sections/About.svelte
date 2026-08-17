<script lang="ts">
	import { about } from '$lib/data/content';
	import { inview } from '$lib/actions/inview';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';
</script>

<SectionWrapper id="about" headingId="about-heading" number="01" title="About Me">
	<div class="flex flex-col items-center gap-10 md:flex-row md:items-start">
		<div class="shrink-0" use:inview={{ dir: 'left' }}>
			<img
				src="/images/ryancritchlow.jpeg"
				alt="Ryan Critchlow"
				class="border-edge h-56 w-56 rounded-2xl border object-cover shadow-lg md:h-72 md:w-72"
			/>
		</div>
		<div class="space-y-5" use:inview={{ dir: 'right' }}>
			{#each about.paragraphs as paragraph (paragraph)}
				<p class="text-ink text-body">{paragraph}</p>
			{/each}
		</div>
	</div>
</SectionWrapper>
