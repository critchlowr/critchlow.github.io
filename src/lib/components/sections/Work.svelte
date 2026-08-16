<script lang="ts">
	import { selectedWork, publications } from '$lib/data/content';
	import { simulator } from '$lib/stores/simulator.svelte';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';

	// The featured card is derived from the same export the Research section renders,
	// so the two can never drift apart.
	const featured = publications.find((p) => p.status === 'published');
</script>

<SectionWrapper id="work" headingId="work-heading" number="03" title="Selected Work">
	{#if featured}
		<article
			class="mb-4 rounded-xl border-2 border-accent-300 bg-accent-50 p-6 dark:border-accent-600 dark:bg-accent-950 md:p-8"
		>
			<div class="mb-3 flex flex-wrap items-center gap-2">
				<span class="rounded-full bg-accent-600 px-2.5 py-0.5 text-sm font-semibold text-white dark:bg-accent-500">
					Peer-reviewed
				</span>
				<span class="text-sm font-medium text-accent-700 dark:text-accent-300">ASSETS 2026</span>
			</div>
			<h3 class="text-xl font-bold leading-snug text-primary-800 dark:text-primary-100">
				{featured.title}
			</h3>
			<p class="mt-2 text-base text-warm-700 dark:text-warm-300">{featured.authors}</p>
			{#if featured.summary}
				<p class="mt-3 max-w-3xl text-base leading-relaxed text-warm-700 dark:text-warm-300">
					{featured.summary}
				</p>
			{/if}
			<p class="mt-4">
				<a
					href="#research"
					class="inline-flex items-center gap-1.5 text-base font-semibold text-accent-700 underline-offset-4 hover:underline dark:text-accent-300"
				>
					Full citation and my contribution
					<span aria-hidden="true">&darr;</span>
				</a>
			</p>
		</article>
	{/if}

	<div class="grid gap-4 sm:grid-cols-2">
		{#each selectedWork as project}
			<div
				class="flex flex-col rounded-xl border border-warm-200 bg-white p-6 transition-all hover:border-accent-300 hover:shadow-md dark:border-warm-700 dark:bg-warm-800 dark:hover:border-accent-600"
			>
				<div class="mb-3 flex items-start justify-between gap-2">
					<h3 class="text-lg font-bold text-primary-700 dark:text-primary-200">{project.title}</h3>
					<span
						class="shrink-0 rounded-full bg-accent-100 px-2.5 py-0.5 text-sm font-medium text-accent-700 dark:bg-accent-900 dark:text-accent-300"
					>
						{project.period}
					</span>
				</div>
				<p class="mb-3 text-base leading-relaxed text-warm-600 dark:text-warm-400">
					{project.description}
				</p>

				{#if project.action === 'simulator'}
					<p class="mb-3">
						<button
							type="button"
							class="inline-flex items-center gap-1.5 text-base font-semibold text-accent-700 underline-offset-4 hover:underline dark:text-accent-300"
							onclick={() => simulator.launch()}
						>
							{project.hrefLabel ?? 'Play it'}
							<span aria-hidden="true">&rarr;</span>
						</button>
					</p>
				{:else if project.href && project.external}
					<p class="mb-3">
						<a
							href={project.href}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-1.5 text-base font-semibold text-accent-700 underline-offset-4 hover:underline dark:text-accent-300"
						>
							{project.hrefLabel ?? 'Visit site'}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-3.5 w-3.5"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
							>
								<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
								<polyline points="15 3 21 3 21 9" />
								<line x1="10" y1="14" x2="21" y2="3" />
							</svg>
							<span class="sr-only">(opens in a new tab)</span>
						</a>
					</p>
				{:else if project.href}
					<p class="mb-3">
						<a
							href={project.href}
							class="inline-flex items-center gap-1.5 text-base font-semibold text-accent-700 underline-offset-4 hover:underline dark:text-accent-300"
						>
							{project.hrefLabel ?? 'Read more'}
							<span aria-hidden="true">&rarr;</span>
						</a>
					</p>
				{/if}

				<div class="mt-auto flex flex-wrap gap-1.5 border-t border-warm-100 pt-3 dark:border-warm-700">
					{#each project.tools.split(', ') as tool}
						<span
							class="rounded-full bg-moss-100 px-2.5 py-0.5 text-sm font-medium text-moss-700 dark:bg-moss-800 dark:text-moss-200"
						>
							{tool}
						</span>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</SectionWrapper>
