<script lang="ts">
	import { hero } from '$lib/data/content';
	import Shelf from '$lib/components/ui/Shelf.svelte';
</script>

<section id="hero" class="pt-28 pb-16 md:pt-36 md:pb-20" aria-label="Introduction">
	<div class="mx-auto max-w-4xl px-5">
		<!-- The name is sized to run close to the full width of the column at every width. -->
		<h1
			class="text-ink-strong text-[clamp(2.5rem,13vw,7.75rem)] leading-[0.95] font-extrabold tracking-[-0.035em]"
		>
			{hero.name}
		</h1>
		<p class="text-ink mt-4 text-xl font-medium sm:text-2xl">{hero.tagline}</p>

		<div class="mt-10 md:mt-12">
			<Shelf />
		</div>

		<div class="mt-10 md:grid md:grid-cols-[minmax(0,1fr)_15rem] md:gap-x-10">
			<p class="text-ink text-body sm:text-lede">{hero.summary}</p>
			<div class="mt-8 md:mt-1">
				<p class="text-ink-muted flex items-start gap-3 text-sm">
					<img
						src="/images/ryancritchlow-96.webp"
						alt=""
						width="96"
						height="96"
						class="border-edge h-12 w-12 shrink-0 rounded-full border object-cover"
					/>
					<span>{hero.availability}</span>
				</p>
				<div class="mt-5 flex flex-wrap items-center gap-3 md:flex-col md:items-stretch">
					<a href="#contact" class="btn btn-primary"> Get in touch </a>
					<a href={hero.resumeHref} class="btn btn-secondary"> Résumé (PDF) </a>
				</div>
			</div>
		</div>
	</div>
</section>
