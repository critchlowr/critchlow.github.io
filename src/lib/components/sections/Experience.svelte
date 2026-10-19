<script lang="ts">
	import { experience } from '$lib/data/content';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import ConveyorBelt from '$lib/components/ui/ConveyorBelt.svelte';
	import JobStickers from '$lib/components/ui/JobStickers.svelte';
</script>

<SectionWrapper id="experience" headingId="experience-heading" title="Experience">
	<!-- A wider gap than usual leaves room for the stickers on the card edges. -->
	<ul class="space-y-10">
		{#each experience as job (job.company + job.title)}
			<Card as="li" id={job.id} class="group relative p-6 md:p-7">
				<div class="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
					<div>
						<h3 class="text-ink-strong font-display text-2xl font-semibold">{job.title}</h3>
						<p class="text-brand mt-0.5 text-base font-medium">{job.company}</p>
					</div>
					<p class="text-ink-muted shrink-0 text-sm sm:text-right">
						{job.period}<span class="sm:hidden"> · </span><br
							class="hidden sm:block"
						/>{job.location}
					</p>
				</div>
				{#if job.summary}
					<p class="text-ink text-body mt-4">{job.summary}</p>
				{/if}
				{#if job.bullets.length > 0}
					<ul class="text-ink-muted text-body mt-3 list-disc space-y-2 pl-5">
						{#each job.bullets as bullet (bullet)}
							<li>{bullet}</li>
						{/each}
					</ul>
				{/if}
				{#if job.showSimulator}
					<p class="mt-5">
						<a href="/simulator" class="text-link font-semibold underline underline-offset-4">
							See how the work flowed: try the WMS simulator
						</a>
					</p>
					<!-- Runs to the card edges instead of nesting a second border inside the card. -->
					<div class="bleed">
						<ConveyorBelt />
					</div>
				{/if}
				{#if job.stickers}
					<JobStickers set={job.stickers} />
				{/if}
			</Card>
		{/each}
	</ul>
</SectionWrapper>

<style>
	/* Bleeds a bottom strip to the card edges, matching the card's padding. */
	.bleed {
		margin: 1.5rem -1.5rem -1.5rem;
		overflow: hidden;
		border-radius: 0 0 0.75rem 0.75rem;
	}

	@media (width >= 48rem) {
		.bleed {
			margin: 1.5rem -1.75rem -1.75rem;
		}
	}
</style>
