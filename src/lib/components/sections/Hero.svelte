<script lang="ts">
	import { hero } from '$lib/data/content';
</script>

<section id="hero" class="flex min-h-[80vh] items-center justify-center px-4 pt-20" aria-label="Introduction">
	<div class="max-w-3xl text-center">
		<h1 class="hero-animate text-4xl font-bold tracking-tight text-primary-800 sm:text-5xl md:text-6xl dark:text-primary-200">
			{hero.name}
		</h1>
		<p class="hero-animate-delay-1 mt-4 text-lg font-medium text-accent-600 sm:text-xl dark:text-accent-300">
			{hero.tagline}
		</p>
		<p class="hero-animate-delay-2 mx-auto mt-6 max-w-2xl text-base leading-relaxed text-warm-600 dark:text-warm-400">
			{hero.summary}
		</p>
		<p class="hero-animate-delay-2 mx-auto mt-6 max-w-xl text-sm text-warm-600 dark:text-warm-400">
			{hero.availability}
		</p>
		<div class="hero-animate-delay-2 mt-8 flex flex-wrap items-center justify-center gap-3">
			<a href="#contact" class="inline-block rounded-lg bg-accent-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-500 dark:bg-accent-600 dark:hover:bg-red-600">
				Get in Touch
			</a>
			<a
				href={hero.resumeHref}
				class="inline-flex items-center gap-2 rounded-lg border border-warm-300 px-6 py-2.5 text-sm font-semibold text-warm-700 transition-colors hover:border-accent-400 hover:text-accent-700 dark:border-warm-600 dark:text-warm-300 dark:hover:border-accent-500 dark:hover:text-accent-300"
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
					<polyline points="7 10 12 15 17 10" />
					<line x1="12" y1="15" x2="12" y2="3" />
				</svg>
				Resume
			</a>
		</div>
	</div>
</section>
