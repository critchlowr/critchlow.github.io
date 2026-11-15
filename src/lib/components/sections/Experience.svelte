<script lang="ts">
	import { experience } from '$lib/data/content';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';
	import Entry from '$lib/components/ui/Entry.svelte';
	import ConveyorBelt from '$lib/components/ui/ConveyorBelt.svelte';
	import JobStickers from '$lib/components/ui/JobStickers.svelte';
</script>

<SectionWrapper id="experience" headingId="experience-heading" title="Experience">
	<ul class="space-y-12">
		{#each experience as job (job.company + job.title)}
			<Entry id={job.id} title={job.title}>
				{#snippet meta()}
					<!-- Dates beside the stickers on phones; stacked in the left column above that. -->
					<div class="flex items-end justify-between gap-4 md:block">
						<p>
							<span class="block">{job.period}</span>
							<span class="block">{job.location}</span>
						</p>
						{#if job.stickers}
							<div class="max-w-[55%] md:mt-4 md:max-w-none">
								<JobStickers set={job.stickers} />
							</div>
						{/if}
					</div>
				{/snippet}
				{#snippet lead()}
					<p class="text-brand mt-0.5 font-medium">{job.company}</p>
				{/snippet}
				{#if job.summary}
					<p class="text-ink text-body">{job.summary}</p>
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
						<a href="/simulator" class="link font-semibold">
							See how the work flowed: try the WMS simulator
						</a>
					</p>
					<div class="mt-2">
						<ConveyorBelt />
					</div>
				{/if}
			</Entry>
		{/each}
	</ul>
</SectionWrapper>
