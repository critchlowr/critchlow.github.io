<script lang="ts">
	import { publications, credentials } from '$lib/data/content';
	import { inview } from '$lib/actions/inview';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';

	const peerReviewed = publications.filter((p) => p.status === 'published');
	const inPreparation = publications.filter((p) => p.status === 'in-preparation');

	const groups = [
		{ label: 'Peer-Reviewed', items: peerReviewed },
		{ label: 'In Preparation', items: inPreparation }
	];
</script>

<SectionWrapper id="research" headingId="research-heading" number="05" title="Research">
	<div class="space-y-12">
		{#each groups as group (group.label)}
			{#if group.items.length > 0}
				<div>
					<h3
						class="text-ink-muted mb-4 font-mono text-xs font-semibold tracking-[0.14em] uppercase"
					>
						{group.label}
					</h3>
					<div class="stagger space-y-5" use:inview>
						{#each group.items as pub, i (pub.title)}
							<div style="--i: {i}">
								<Card as="article" id={pub.id} interactive class="p-6 md:p-7">
									<h4 class="text-ink-strong font-display text-xl leading-snug font-semibold">
										{pub.title}
									</h4>
									<p class="text-ink-muted mt-2 text-base">{pub.authors}</p>
									<p class="text-brand mt-1 text-base italic">
										{pub.venue}
									</p>
									{#if pub.summary}
										<p class="text-ink text-body mt-3">
											{pub.summary}
										</p>
									{/if}
									<p class="border-edge text-ink-muted text-body mt-4 border-t pt-4">
										<span class="text-ink-strong font-semibold">My contribution:</span>
										{pub.contribution}
									</p>
									{#if pub.href}
										<p class="mt-4">
											<ArrowLink
												href={pub.href}
												external={pub.external}
												label={pub.hrefLabel ?? 'Read more'}
											/>
										</p>
									{/if}
								</Card>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{/each}

		<ul class="flex flex-wrap items-center gap-x-3 gap-y-2" use:inview={{ dir: 'up' }}>
			<li>
				<a
					href={credentials.orcidHref}
					target="_blank"
					rel="noopener noreferrer"
					class="border-edge hover:border-edge-hover inline-flex items-center gap-2 rounded-full border py-1 pr-3 pl-1.5 text-sm transition-colors"
				>
					<img src="/images/orcid-id.svg" alt="" class="h-4 w-4" width="16" height="16" />
					<span class="text-ink-muted">
						<span class="sr-only">ORCID iD:</span>
						{credentials.orcid}
					</span>
					<!-- Same wording as ArrowLink, so both external links announce identically. -->
					<span class="sr-only">(opens in a new tab)</span>
				</a>
			</li>
			<li class="border-edge inline-flex items-center gap-2 rounded-full border py-1 pr-3 pl-1.5">
				<!--
					ACM's logo is a restricted trademark, so this is a typographic mark rather
					than the corporate logo.
				-->
				<span
					class="bg-warm-200 text-warm-800 dark:bg-warm-800 dark:text-warm-200 inline-flex h-4 items-center rounded-full px-1.5 text-[0.6rem] font-bold tracking-tight"
					aria-hidden="true"
				>
					ACM
				</span>
				<span class="text-ink-muted text-sm">
					{credentials.membershipDetail}
				</span>
			</li>
		</ul>
	</div>
</SectionWrapper>
