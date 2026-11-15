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

		<!--
			From md up: the summary and the photo share a row, and the photo is cropped to
			the summary's height. Buttons sit under the summary, availability under the photo.
			On phones the photo sits beside the availability line, above the buttons.
		-->
		<div class="mt-10 md:grid md:grid-cols-[minmax(0,1fr)_15rem] md:gap-x-10">
			<p class="text-ink text-body sm:text-lede md:col-start-1 md:row-start-1">{hero.summary}</p>
			<div class="mt-8 flex items-center gap-4 md:contents">
				<div
					class="border-edge h-28 w-28 shrink-0 overflow-hidden rounded-md border md:relative md:col-start-2 md:row-start-1 md:h-auto md:w-auto"
				>
					<!-- Out of flow from md up, so the row takes its height from the summary alone. -->
					<img
						src="/images/ryancritchlow-325.webp"
						alt="Ryan Critchlow"
						width="325"
						height="325"
						class="h-full w-full object-cover object-[50%_30%] md:absolute md:inset-0"
					/>
				</div>
				<p class="text-ink-muted text-sm md:col-start-2 md:row-start-2 md:mt-4">
					{hero.availability}
				</p>
			</div>
			<div
				class="mt-5 flex flex-wrap items-start gap-3 md:col-start-1 md:row-start-2 md:mt-6 md:self-start"
			>
				<a href="#contact" class="btn btn-primary"> Get in touch </a>
				<a href={hero.resumeHref} class="btn btn-secondary"> Résumé (PDF) </a>
			</div>
		</div>
	</div>
</section>
