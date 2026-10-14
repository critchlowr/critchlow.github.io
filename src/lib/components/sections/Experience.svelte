<script lang="ts">
	import { experience } from '$lib/data/content';
	import { inview } from '$lib/actions/inview';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import ConveyorBelt from '$lib/components/ui/ConveyorBelt.svelte';
	import JobStickers from '$lib/components/ui/JobStickers.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import { simulator } from '$lib/stores/simulator.svelte';
</script>

<SectionWrapper id="experience" headingId="experience-heading" number="02" title="Experience" alt>
	<!--
		Cards, not rules. This section sits on the alt ground, so a raised surface is
		what gives each role an edge against the tint behind it — and with seven entries
		the boundaries are what make the column scannable.
	-->
	<!-- A wider gap than usual leaves room for the stickers on the card edges. -->
	<ul class="stagger space-y-10" use:inview>
		{#each experience as job, jobIndex (job.company + job.title)}
			<Card as="li" interactive class="group relative p-6 md:p-7" style="--i: {jobIndex}">
				<div
					class="flex flex-col items-center gap-1 text-center sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:text-left"
				>
					<div>
						<h3 class="text-ink-strong font-display text-2xl font-semibold">
							{job.title}
						</h3>
						<p class="text-brand mt-1 text-base font-medium">
							{job.company}
						</p>
					</div>
					<div class="shrink-0 sm:text-right">
						<Badge tone="warm" size="sm">{job.period}</Badge>
						<p class="text-ink-muted mt-1.5 text-sm">
							{job.location}
						</p>
					</div>
				</div>
				{#if job.bullets.length > 0}
					<ul class="mt-5 space-y-2.5">
						{#each job.bullets as bullet (bullet)}
							<li class="text-ink-muted text-body flex gap-2.5">
								<span
									class="bg-ember-500 mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full"
									aria-hidden="true"
								></span>
								<span>{bullet}</span>
							</li>
						{/each}
					</ul>
				{/if}
				{#if job.tags && job.tags.length > 0}
					<div class="mt-5 flex flex-wrap gap-1.5">
						{#each job.tags as tag (tag)}
							<Badge tone="plum">{tag}</Badge>
						{/each}
					</div>
				{/if}
				{#if job.href}
					<div class="mt-5">
						<ArrowLink href={job.href} label={job.hrefLabel ?? 'Read more'} size="sm" />
					</div>
				{/if}
				{#if job.showSimulator}
					<div class="mt-6 flex justify-center">
						<button
							type="button"
							class="border-accent-400 bg-accent-50 text-accent-800 hover:bg-accent-100 hover:border-accent-500 dark:border-accent-700 dark:bg-accent-950 dark:text-accent-200 dark:hover:bg-accent-900 ease-spring inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-[background-color,border-color,transform] duration-200 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
							onclick={() => simulator.launch()}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4"
								viewBox="0 0 20 20"
								fill="currentColor"
								aria-hidden="true"
							>
								<path
									fill-rule="evenodd"
									d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h6v4H7V5zm2 6h2v2H9v-2z"
									clip-rule="evenodd"
								/>
							</svg>
							Try the WMS Simulator
						</button>
					</div>
					<!--
						Bled to the card edges rather than boxed again inside it — a border
						within a border reads as clutter.
					-->
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
