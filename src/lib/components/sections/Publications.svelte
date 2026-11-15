<script lang="ts">
	import { publications, credentials, researchInterests } from '$lib/data/content';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';
	import Entry from '$lib/components/ui/Entry.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';

	const statusLabel = { published: 'Peer-reviewed', 'under-review': 'Under review' };
</script>

<SectionWrapper id="publications" headingId="publications-heading" title="Research">
	<div class="space-y-12">
		<p class="text-ink text-body sm:text-lede max-w-measure">{researchInterests}</p>
		<ul class="space-y-12">
			{#each publications as pub (pub.title)}
				<Entry title={pub.title}>
					{#snippet meta()}
						<p>{statusLabel[pub.status]}</p>
					{/snippet}
					{#snippet lead()}
						<p class="text-ink-muted mt-2">{pub.authors}</p>
						<p class="text-ink-muted mt-1 italic">{pub.venue}</p>
						{#if pub.honor}
							<p class="text-ink-strong mt-1 font-semibold">{pub.honor}</p>
						{/if}
					{/snippet}
					{#if pub.summary}
						<p class="text-ink text-body mb-4">{pub.summary}</p>
					{/if}
					<p class="text-ink-muted text-body">
						<span class="text-ink-strong font-semibold">My contribution:</span>
						{pub.contribution}
					</p>
					{#if pub.funding}
						<p class="text-ink-muted mt-3 text-sm">{pub.funding}</p>
					{/if}
					{#if pub.href}
						<p class="mt-4">
							<ArrowLink
								href={pub.href}
								label={pub.hrefLabel ?? 'Read more'}
								external={pub.external}
							/>
						</p>
					{/if}
				</Entry>
			{/each}
		</ul>

		<!-- Indented to the entries' text column. -->
		<ul class="text-ink-muted space-y-1 text-sm md:pl-48">
			<li>
				<a
					href={credentials.orcidHref}
					target="_blank"
					rel="noopener noreferrer"
					class="link inline-flex items-center gap-1.5"
				>
					<img src="/images/orcid-id.svg" alt="" class="h-4 w-4" width="16" height="16" />
					<span>ORCID iD {credentials.orcid}</span>
					<span class="sr-only">(opens in a new tab)</span>
				</a>
			</li>
			<li>Member, {credentials.membershipDetail}</li>
		</ul>
	</div>
</SectionWrapper>
