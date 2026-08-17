<script lang="ts">
	import { hero } from '$lib/data/content';
	import { inview } from '$lib/actions/inview';
</script>

<section
	id="hero"
	class="relative flex min-h-[88vh] items-center overflow-hidden px-5 pt-24 pb-16"
	aria-label="Introduction"
>
	<div class="wash" aria-hidden="true"></div>

	<div class="relative mx-auto w-full max-w-4xl">
		<h1
			class="text-ink-strong font-display text-display font-semibold"
			use:inview={{ dir: 'up', i: 0 }}
		>
			{hero.name}
		</h1>

		<p class="text-brand mt-5 text-xl font-medium" use:inview={{ dir: 'up', i: 1 }}>
			{hero.tagline}
		</p>

		<div class="bg-edge rule-draw mt-8 h-px w-full" use:inview aria-hidden="true"></div>

		<p class="text-ink text-body mt-8 max-w-2xl" use:inview={{ dir: 'up', i: 2 }}>
			{hero.summary}
		</p>

		<p class="text-ink-muted mt-5 max-w-xl text-base" use:inview={{ dir: 'up', i: 3 }}>
			{hero.availability}
		</p>

		<div class="mt-10 flex flex-wrap items-center gap-3" use:inview={{ dir: 'up', i: 4 }}>
			<a
				href="#contact"
				class="bg-accent-700 hover:bg-accent-800 ease-spring inline-block rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-sm transition-[background-color,transform] duration-200 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
			>
				Get in Touch
			</a>
			<a
				href={hero.resumeHref}
				class="border-edge text-ink-muted hover:border-edge-hover hover:text-ink-strong ease-spring inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold transition-[color,border-color,transform] duration-200 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
					<polyline points="7 10 12 15 17 10" />
					<line x1="12" y1="15" x2="12" y2="3" />
				</svg>
				Resume
			</a>
		</div>
	</div>
</section>

<style>
	/*
		Two soft washes — harvest gold from the upper left, sky from the lower right.
		The palette's whole premise is warm earth against a cool counterpoint, so the
		hero states that before any content does. Static; nothing here animates.
	*/
	.wash {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background:
			radial-gradient(
				66rem 36rem at 10% -12%,
				color-mix(in oklab, var(--color-accent-300) 62%, transparent),
				transparent 72%
			),
			radial-gradient(
				54rem 34rem at 94% 110%,
				color-mix(in oklab, var(--color-plum-300) 52%, transparent),
				transparent 72%
			),
			radial-gradient(
				40rem 26rem at 72% -4%,
				color-mix(in oklab, var(--color-moss-200) 26%, transparent),
				transparent 70%
			);
	}

	:global(.dark) .wash {
		background:
			radial-gradient(
				66rem 36rem at 10% -12%,
				color-mix(in oklab, var(--color-accent-700) 58%, transparent),
				transparent 72%
			),
			radial-gradient(
				54rem 34rem at 94% 110%,
				color-mix(in oklab, var(--color-plum-700) 62%, transparent),
				transparent 72%
			),
			radial-gradient(
				40rem 26rem at 72% -4%,
				color-mix(in oklab, var(--color-moss-800) 34%, transparent),
				transparent 70%
			);
	}
</style>
