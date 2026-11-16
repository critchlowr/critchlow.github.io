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

				<div
					class="mt-8 grid gap-x-12 gap-y-8 border-t-2 border-white/20 pt-8 lg:grid-cols-[3fr_2fr]"
				>
					{#if pub.summary}
						<div>
							<h4 class="font-display mb-2 text-xl font-bold">What the paper found</h4>
							<p class="text-body">{pub.summary}</p>
						</div>
					{/if}
					<div>
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

	/* The shared link colour is brick, which does not read on olive. */
	.feature-link :global(a) {
		color: var(--t-on-feature);
	}
</style>
