<script lang="ts">
	import { interests } from '$lib/data/content';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';
</script>

<SectionWrapper id="interests" headingId="interests-heading" number="06" title="Outside of Work">
	<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
		{#each interests as interest}
			<div class="flex items-center gap-3 rounded-xl border border-warm-200 bg-white px-4 py-3 transition-all hover:border-accent-300 hover:shadow-sm dark:border-warm-700 dark:bg-warm-800 dark:hover:border-accent-600">
				<span class="text-2xl" aria-hidden="true">{interest.emoji}</span>
				<span class="text-sm font-medium text-warm-700 dark:text-warm-300">{interest.label}</span>
			</div>
		{/each}
	</div>
</SectionWrapper>
