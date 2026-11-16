<script lang="ts">
	import { publications, credentials, researchInterests } from '$lib/data/content';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';

	const statusLabel = { published: 'Peer-reviewed', 'under-review': 'Under review' };

	// The published paper gets the olive tile; papers under review are smaller tiles.
	const published = publications.filter((p) => p.status === 'published');
	const underReview = publications.filter((p) => p.status === 'under-review');
</script>

<SectionWrapper id="publications" headingId="publications-heading" title="Research">
	<p class="text-ink max-w-measure mb-10 text-[clamp(1.15rem,2vw,1.4rem)] leading-snug">
		{researchInterests}
	</p>

	<ul class="space-y-6">
		{#each published as pub (pub.title)}
			<li class="on-dark bg-feature text-on-feature tile p-[clamp(1.5rem,4vw,3.25rem)]">
				<p class="mb-5 flex flex-wrap gap-2">
					<span class="pill pill-solid">{statusLabel[pub.status]}</span>
					{#if pub.honor}
						<span class="pill">{pub.honor}</span>
					{/if}
				</p>
				<h3
					class="font-display max-w-[24ch] text-[clamp(1.75rem,4.2vw,3rem)] leading-[1.04] font-bold tracking-[-0.015em]"
				>
					{pub.title}
				</h3>
				<p class="text-on-feature-muted mt-5 max-w-[44rem]">{pub.authors}. {pub.venue}</p>

				<div class="mt-8 border-t-2 border-white/20 pt-8">
					<div class="max-w-[44rem]">
						<h4 class="font-display mb-2 text-xl font-bold">My contribution</h4>
						<p class="text-body">{pub.contribution}</p>
						{#if pub.href}
							<p class="feature-link mt-5">
								<ArrowLink
									href={pub.href}
									label={pub.hrefLabel ?? 'Read more'}
									external={pub.external}
								/>
							</p>
						{/if}
						{#if pub.pdfHref}
							<p class="feature-link mt-3">
								<ArrowLink href={pub.pdfHref} label={pub.pdfLabel ?? 'Download the paper (PDF)'} />
							</p>
						{/if}
						{#if pub.funding}
							<p class="text-on-feature-muted mt-5 text-sm">{pub.funding}</p>
						{/if}
					</div>

					<!--
						The abstract is long, so it starts folded, like the roles in Experience.
						A native details element: its text is still found by find-in-page.
					-->
					{#if pub.summary}
						<details class="abstract mt-8">
							<summary>
								<h4 class="font-display text-xl font-bold">What the paper found</h4>
								<span class="pm" aria-hidden="true"></span>
							</summary>
							<p class="text-body max-w-[44rem] pb-2">{pub.summary}</p>
						</details>
					{/if}
				</div>
			</li>
		{/each}
	</ul>

	<ul class="mt-7 grid gap-6 md:grid-cols-2">
		{#each underReview as pub (pub.title)}
			<li class="bg-surface-raised tile p-[clamp(1.25rem,3vw,2rem)]">
				<p><span class="pill">{statusLabel[pub.status]}</span></p>
				<h3 class="font-display text-ink-strong mt-4 text-[1.6rem] leading-[1.1] font-bold">
					{pub.title}
				</h3>
				<p class="text-ink-muted mt-2 text-sm">{pub.authors}. {pub.venue}</p>
				<p class="text-ink text-body mt-3">
					<span class="text-ink-strong font-semibold">My contribution:</span>
					{pub.contribution}
				</p>
			</li>
		{/each}
	</ul>

	<ul class="text-ink-muted mt-8 space-y-1 text-sm">
		<li>
			<a
				href={credentials.orcidHref}
				target="_blank"
				rel="noopener noreferrer"
				class="link inline-flex items-center gap-1.5 py-1"
			>
				<img src="/images/orcid-id.svg" alt="" class="h-4 w-4" width="16" height="16" />
				<span>ORCID iD {credentials.orcid}</span>
				<span class="sr-only">(opens in a new tab)</span>
			</a>
		</li>
		<li>Member, {credentials.membershipDetail}</li>
	</ul>
</SectionWrapper>

<style>
	.pill {
		display: inline-block;
		padding: 0.2rem 0.8rem;
		border: 2px solid currentColor;
		border-radius: 999px;
		font-size: 0.9rem;
		font-weight: 700;
	}

	.pill-solid {
		background: var(--t-on-feature);
		border-color: var(--t-on-feature);
		color: #262d12;
	}

	.abstract {
		border-top: 2px solid rgb(255 255 255 / 0.2);
	}

	.abstract summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		min-height: 44px;
		padding-block: 1rem;
		cursor: pointer;
		list-style: none;
	}

	.abstract summary::-webkit-details-marker {
		display: none;
	}

	/* A plus that turns to a minus when the abstract is open, as on the Experience rows. */
	.pm {
		position: relative;
		flex-shrink: 0;
		width: 1.25rem;
		height: 1.25rem;
	}

	.pm::before,
	.pm::after {
		content: '';
		position: absolute;
		inset: calc(50% - 1.5px) 0 auto 0;
		height: 3px;
		background: currentColor;
	}

	.pm::after {
		rotate: 90deg;
	}

	details[open] .pm::after {
		rotate: 0deg;
	}

	/* Slides open where the browser can animate to an element's own height. */
	.abstract::details-content {
		interpolate-size: allow-keywords;
		overflow: clip;
	}

	.abstract:not([open])::details-content {
		block-size: 0;
	}

	@media (prefers-reduced-motion: no-preference) {
		.pm::after {
			transition: rotate 0.2s;
		}

		.abstract::details-content {
			transition: block-size, content-visibility;
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

	/* The shared link colour is brick, which does not read on olive. */
	.feature-link :global(a) {
		color: var(--t-on-feature);
	}
</style>
