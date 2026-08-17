<script lang="ts">
	import { contact } from '$lib/data/content';
	import { inview } from '$lib/actions/inview';
	import ContactLink from '$lib/components/ui/ContactLink.svelte';
</script>

<footer
	id="contact"
	class="bg-footer/90 relative overflow-hidden"
	aria-labelledby="contact-heading"
>
	<div class="wash" aria-hidden="true"></div>

	<div class="relative mx-auto max-w-5xl px-5 py-24">
		<h2
			id="contact-heading"
			class="text-ink-strong font-display text-title mb-10 text-center font-semibold"
			use:inview={{ dir: 'up' }}
		>
			Get In Touch
		</h2>
		<div class="stagger flex flex-wrap items-center justify-center gap-4" use:inview>
			{#each contact as link, i (link.href)}
				<span style="--i: {i}"><ContactLink {link} /></span>
			{/each}
		</div>
		<p class="text-ink-muted mt-16 text-center text-sm">
			&copy; {new Date().getFullYear()} Ryan Critchlow
		</p>
	</div>
</footer>

<style>
	/*
		The ground itself is the --t-footer token; only the wash lives here. It bookends
		the hero — same two gradients, positions mirrored, so gold and plum arrive from
		the opposite corners to the ones they came from at the top of the page.
	*/
	.wash {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background:
			radial-gradient(
				54rem 30rem at 90% -20%,
				color-mix(in oklab, var(--color-accent-300) 55%, transparent),
				transparent 72%
			),
			radial-gradient(
				60rem 32rem at 6% 120%,
				color-mix(in oklab, var(--color-plum-300) 48%, transparent),
				transparent 72%
			);
	}

	:global(.dark) .wash {
		background:
			radial-gradient(
				54rem 30rem at 90% -20%,
				color-mix(in oklab, var(--color-accent-700) 42%, transparent),
				transparent 72%
			),
			radial-gradient(
				60rem 32rem at 6% 120%,
				color-mix(in oklab, var(--color-plum-700) 46%, transparent),
				transparent 72%
			);
	}
</style>
