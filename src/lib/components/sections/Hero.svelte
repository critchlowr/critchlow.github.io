<script lang="ts">
	import { hero } from '$lib/data/content';
</script>

<section id="hero" class="pt-28 pb-14 md:pt-32" aria-label="Introduction">
	<div class="mx-auto max-w-4xl px-5">
		<p class="text-ink-muted flex items-center gap-3 text-sm">
			<img
				src="/images/ryancritchlow-96.webp"
				alt=""
				width="96"
				height="96"
				class="border-edge h-12 w-12 shrink-0 rounded-full border object-cover"
			/>
			<span>{hero.status} {hero.availability}</span>
		</p>

		<h1
			class="text-ink-strong font-display mt-6 text-[clamp(2.5rem,1.4rem+5vw,4.25rem)] leading-[1.02] font-semibold tracking-[-0.03em]"
		>
			{hero.name}
		</h1>
		<p class="text-brand mt-3 text-xl font-medium">{hero.tagline}</p>
		<p class="text-ink text-lede mt-6 max-w-2xl">{hero.summary}</p>

		<div class="mt-8 flex flex-wrap items-center gap-3">
			<a
				href="#contact"
				class="bg-brand hover:bg-brand-strong text-on-brand inline-block rounded-lg px-6 py-3 text-sm font-semibold transition-colors motion-reduce:transition-none"
			>
				Get in touch
			</a>
			<a
				href={hero.resumeHref}
				class="border-edge text-ink hover:border-edge-hover inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold transition-colors motion-reduce:transition-none"
			>
				Résumé (PDF)
			</a>
		</div>
	</div>
</section>
