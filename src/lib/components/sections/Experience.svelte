<script lang="ts">
	import { experience } from '#lib/data/content.ts';
	import SectionWrapper from '#lib/components/ui/SectionWrapper.svelte';
	import ConveyorBelt from '#lib/components/ui/ConveyorBelt.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import JobStickers from '#lib/components/ui/JobStickers.svelte';
	import { simulator } from '#lib/stores/simulator.svelte.ts';

	/*
		Each role is one row that unfolds. A link elsewhere on the page can point at a
		role (Skills does), so when the address names a row, that row is opened.
	*/
	$effect(() => {
		function openTarget() {
			const id = decodeURIComponent(location.hash.slice(1));
			if (!id) return;
			const row = document.getElementById(id)?.querySelector('details');
			if (row) row.open = true;
		}

		openTarget();
		window.addEventListener('hashchange', openTarget);
		return () => window.removeEventListener('hashchange', openTarget);
	});
</script>

<SectionWrapper id="experience" headingId="experience-heading" title="Experience" band>
	<ul class="rows">
		{#each experience as job (job.company + job.title)}
			<li id={job.id} class="row">
				<!--
					A native details element: keyboard, screen reader and find-in-page support
					come with it, and a closed row's text still matches a page search.
				-->
				<details open={job.open}>
					<summary>
						<span class="min-w-0">
							<h3 class="font-display text-ink-strong text-row font-bold">{job.title}</h3>
							<span class="text-olive mt-1 block font-bold">{job.company}</span>
						</span>
						<span class="when text-ink-muted text-sm font-semibold">
							<span class="block">{job.period}</span>
							<span class="block font-normal">{job.location}</span>
						</span>
						<span class="pm" aria-hidden="true"></span>
					</summary>

					<div
						class="grid gap-x-12 gap-y-6 pt-1 pb-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
					>
						<div class="max-w-measure">
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
								<!-- Opens the simulator over the page, so the reader stays on this row. -->
								<div
									class="on-dark bg-espresso text-on-espresso tile mt-6 flex flex-wrap items-center justify-between gap-4 px-6 py-5"
								>
									<p class="font-display text-2xl leading-tight font-bold">
										See how the work flowed
									</p>
									<button type="button" class="btn btn-light" onclick={simulator.show}>
										<Icon name="play" class="h-4 w-4" />
										Play the warehouse simulator
									</button>
								</div>
								<div class="mt-2">
									<ConveyorBelt />
								</div>
							{/if}
						</div>
						{#if job.stickers}
							<div class="lg:w-64">
								<JobStickers set={job.stickers} scale={2.1} />
							</div>
						{/if}
					</div>
				</details>
			</li>
		{/each}
	</ul>
</SectionWrapper>

<style>
	.rows {
		border-bottom: 2px solid var(--t-edge);
	}

	.row {
		border-top: 2px solid var(--t-edge);
		/* An opened row lands below the fixed header when a link jumps to it. */
		scroll-margin-top: 4.5rem;
	}

	/* Hovering a row tips its objects a little further over. */
	.row:hover {
		--lean: 2.4;
	}

	summary {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto 1.5rem;
		align-items: center;
		gap: 0.25rem 1.25rem;
		margin-inline: -0.75rem;
		padding: 1rem 0.75rem;
		cursor: pointer;
		list-style: none;
	}

	.when {
		text-align: right;
	}

	/* On a phone the dates go under the employer, so the title keeps the full width. */
	@media (width < 40rem) {
		summary {
			grid-template-columns: minmax(0, 1fr) 1.5rem;
		}

		.when {
			grid-row: 2;
			text-align: left;
		}

		.pm {
			grid-row: 1;
			grid-column: 2;
		}
	}

	summary::-webkit-details-marker {
		display: none;
	}

	summary:hover {
		background: var(--t-chip);
	}

	/* A plus that turns to a minus when the row is open. */
	.pm {
		position: relative;
		width: 1.5rem;
		height: 1.5rem;
	}

	.pm::before,
	.pm::after {
		content: '';
		position: absolute;
		inset: calc(50% - 2px) 0 auto 0;
		height: 4px;
		background: var(--t-ink);
	}

	.pm::after {
		rotate: 90deg;
	}

	details[open] .pm::after {
		rotate: 0deg;
	}

	/*
		The row slides open where the browser can animate to an element's own height.
		Elsewhere it opens at once.
	*/
	details::details-content {
		interpolate-size: allow-keywords;
		overflow: clip;
		contain: layout;
	}

	details:not([open])::details-content {
		block-size: 0;
	}

	@media (prefers-reduced-motion: no-preference) {
		.pm::after {
			transition: rotate 0.2s;
		}

		details::details-content {
			transition: block-size, content-visibility, display;
			transition-duration: 0.3s;
			transition-timing-function: ease-in-out;
			transition-behavior: allow-discrete;
		}
	}

	@media (forced-colors: active) {
		.pm::before,
		.pm::after {
			background: CanvasText;
		}
	}
</style>
