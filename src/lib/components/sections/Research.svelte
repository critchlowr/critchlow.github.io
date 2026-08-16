<script lang="ts">
	import { publications, credentials } from '$lib/data/content';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';

	const peerReviewed = publications.filter((p) => p.status === 'published');
	const inPreparation = publications.filter((p) => p.status === 'in-preparation');

	const groups = [
		{ label: 'Peer-Reviewed', items: peerReviewed },
		{ label: 'In Preparation', items: inPreparation }
	];
</script>

<SectionWrapper id="research" headingId="research-heading" number="05" title="Research">
	<div class="space-y-10">
		{#each groups as group}
			{#if group.items.length > 0}
				<div>
					<h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-warm-700 dark:text-warm-300">
						{group.label}
					</h3>
					<div class="space-y-4">
						{#each group.items as pub}
							<article class="rounded-xl border border-warm-200 bg-white p-6 transition-all hover:border-accent-300 hover:shadow-md dark:border-warm-700 dark:bg-warm-800 dark:hover:border-plum-400">
								<h4 class="text-lg font-bold leading-snug text-primary-700 dark:text-primary-200">
									{pub.title}
								</h4>
								<p class="mt-1.5 text-base text-warm-600 dark:text-warm-400">{pub.authors}</p>
								<p class="mt-1 text-base italic text-accent-600 dark:text-accent-300">{pub.venue}</p>
								{#if pub.summary}
									<p class="mt-3 text-base leading-relaxed text-warm-600 dark:text-warm-400">
										{pub.summary}
									</p>
								{/if}
								<p class="mt-3 border-t border-warm-100 pt-3 text-base leading-relaxed text-warm-600 dark:border-warm-700 dark:text-warm-400">
									<span class="font-semibold text-warm-700 dark:text-warm-300">My contribution:</span>
									{pub.contribution}
								</p>
								{#if pub.href}
									<p class="mt-3">
										<a
											href={pub.href}
											class="inline-flex items-center gap-1.5 text-base font-semibold text-accent-700 underline-offset-4 hover:underline dark:text-accent-300"
										>
											{pub.hrefLabel ?? 'Read more'}
											<span aria-hidden="true">&rarr;</span>
										</a>
									</p>
								{/if}
							</article>
						{/each}
					</div>
				</div>
			{/if}
		{/each}

		<p class="text-sm text-warm-600 dark:text-warm-400">
			ORCID
			<a
				href={credentials.orcidHref}
				class="font-medium text-accent-700 underline-offset-4 hover:underline dark:text-accent-300"
				rel="noopener noreferrer"
			>{credentials.orcid}</a>
			<span class="mx-2 text-warm-400 dark:text-warm-600" aria-hidden="true">·</span>
			{credentials.affiliation}
		</p>
	</div>
</SectionWrapper>
