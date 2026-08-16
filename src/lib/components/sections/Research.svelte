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
		{#each groups as group (group.label)}
			{#if group.items.length > 0}
				<div>
					<h3
						class="text-warm-700 dark:text-warm-300 mb-4 text-sm font-semibold tracking-wider uppercase"
					>
						{group.label}
					</h3>
					<div class="space-y-4">
						{#each group.items as pub (pub.title)}
							<article
								class="border-warm-200 hover:border-accent-300 dark:border-warm-700 dark:bg-warm-800 dark:hover:border-plum-400 rounded-xl border bg-white p-6 transition-all hover:shadow-md"
							>
								<h4 class="text-primary-700 dark:text-primary-200 text-lg leading-snug font-bold">
									{pub.title}
								</h4>
								<p class="text-warm-600 dark:text-warm-400 mt-1.5 text-base">{pub.authors}</p>
								<p class="text-accent-600 dark:text-accent-300 mt-1 text-base italic">
									{pub.venue}
								</p>
								{#if pub.summary}
									<p class="text-warm-600 dark:text-warm-400 mt-3 text-base leading-relaxed">
										{pub.summary}
									</p>
								{/if}
								<p
									class="border-warm-100 text-warm-600 dark:border-warm-700 dark:text-warm-400 mt-3 border-t pt-3 text-base leading-relaxed"
								>
									<span class="text-warm-700 dark:text-warm-300 font-semibold"
										>My contribution:</span
									>
									{pub.contribution}
								</p>
								{#if pub.href}
									<p class="mt-3">
										<a
											href={pub.href}
											class="text-accent-700 dark:text-accent-300 inline-flex items-center gap-1.5 text-base font-semibold underline-offset-4 hover:underline"
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

		<ul class="flex flex-wrap items-center gap-x-3 gap-y-2">
			<li>
				<a
					href={credentials.orcidHref}
					target="_blank"
					rel="noopener noreferrer"
					class="border-warm-200 hover:border-accent-300 dark:border-warm-700 dark:hover:border-accent-600 inline-flex items-center gap-2 rounded-full border py-1 pr-3 pl-1.5 text-sm transition-colors"
				>
					<img src="/images/orcid-id.svg" alt="" class="h-4 w-4" width="16" height="16" />
					<span class="text-warm-600 dark:text-warm-400">
						<span class="sr-only">ORCID iD:</span>
						{credentials.orcid}
					</span>
				</a>
			</li>
			<li
				class="border-warm-200 dark:border-warm-700 inline-flex items-center gap-2 rounded-full border py-1 pr-3 pl-1.5"
			>
				<!--
					ACM's logo is a restricted trademark, so this is a typographic mark rather
					than the corporate logo.
				-->
				<span
					class="bg-warm-200 text-warm-700 dark:bg-warm-700 dark:text-warm-200 inline-flex h-4 items-center rounded-full px-1.5 text-[0.6rem] font-bold tracking-tight"
					aria-hidden="true"
				>
					ACM
				</span>
				<span class="text-warm-600 dark:text-warm-400 text-sm">
					{credentials.membershipDetail}
				</span>
			</li>
		</ul>
	</div>
</SectionWrapper>
