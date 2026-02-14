<script lang="ts">
	import { hero } from '$lib/data/content';
</script>

<section id="hero" class="flex min-h-[80vh] items-center justify-center px-4 pt-20" aria-label="Introduction">
	<div class="max-w-3xl text-center">
		<h1 class="hero-animate text-4xl font-bold tracking-tight text-primary-800 sm:text-5xl md:text-6xl dark:text-primary-200">
			{hero.name}
		</h1>
		<p class="hero-animate-delay-1 mt-4 text-lg font-medium text-accent-600 sm:text-xl dark:text-accent-400">
			{hero.tagline}
		</p>
		<p class="hero-animate-delay-2 mx-auto mt-6 max-w-2xl text-base leading-relaxed text-warm-600 dark:text-warm-400">
			{hero.summary}
		</p>
		<div class="hero-animate-delay-2 mt-8">
			<a href="#contact" onclick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }} class="inline-block rounded-lg bg-accent-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-500 dark:bg-accent-600 dark:hover:bg-red-600">
				Get in Touch
			</a>
		</div>
	</div>
</section>
