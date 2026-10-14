<script lang="ts">
	import { about } from '$lib/data/content';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';
</script>

<SectionWrapper id="about" headingId="about-heading" title="About">
	<div class="max-w-2xl space-y-5">
		{#each about.paragraphs as paragraph (paragraph)}
			<p class="text-ink text-body">{paragraph}</p>
		{/each}
	</div>
</SectionWrapper>
