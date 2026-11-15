<script lang="ts">
	import { hero } from '$lib/data/content';
	import Shelf from '$lib/components/ui/Shelf.svelte';
</script>

<!--
	The one brick block on the page. The name is set in the condensed heading face and
	sized to run close to the full width of the column at every width.
-->
<section id="hero" class="on-dark bg-hero text-on-hero pt-24 md:pt-28" aria-label="Introduction">
	<div class="wrap">
		<h1
			class="font-display text-[clamp(3rem,17.2vw,12.25rem)] leading-[0.82] font-extrabold tracking-[-0.03em]"
		>
			{hero.name}
		</h1>
		<p
			class="font-display mt-[clamp(1.5rem,3.5vw,3rem)] text-[clamp(1.4rem,2.8vw,2rem)] leading-tight font-bold"
		>
			{hero.tagline}
		</p>

		<!--
			From lg up the summary and buttons share a row with the photo. Below that the
			photo sits beside the availability line, under the buttons.
		-->
		<div
			class="mt-[clamp(1.5rem,3vw,2.25rem)] grid gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,1fr)_15rem]"
		>
			<div>
				<p class="text-body sm:text-lede max-w-[40rem]">{hero.summary}</p>
				<div class="mt-7 flex flex-wrap gap-3">
					<a href="#contact" class="btn hero-btn hero-btn-primary">Get in touch</a>
					<a href={hero.resumeHref} class="btn hero-btn">Résumé (PDF)</a>
				</div>
			</div>
			<div class="flex items-center gap-5 lg:block">
				<img
					src="/images/ryancritchlow-325.webp"
					alt="Ryan Critchlow"
					width="325"
					height="325"
					fetchpriority="high"
					class="photo aspect-square w-28 shrink-0 rounded-xl object-cover object-[50%_30%] sm:w-32 lg:w-full"
				/>
				<p class="text-on-hero-muted max-w-[17rem] text-sm lg:mt-6">{hero.availability}</p>
			</div>
		</div>

		<!-- The plank straddles the edge between the brick block and the page below. -->
		<div class="relative z-1 mt-[clamp(2.5rem,6vw,4.5rem)] -mb-3.5">
			<Shelf sticker />
		</div>
	</div>
</section>

<style>
	/* On brick the buttons are outlined in the hero's light ink, not the page's dark ink. */
	.hero-btn {
		--t-outline: var(--t-on-hero);
		--t-shadow: #2a0d0c;
		color: var(--t-on-hero);
	}

	.hero-btn:hover {
		background-color: rgb(255 243 224 / 0.12);
	}

	.hero-btn-primary,
	.hero-btn-primary:hover {
		background-color: var(--t-on-hero);
		color: #4a1614;
	}

	/* The photo sits like a print set down on the block, slightly off square. */
	.photo {
		border: 5px solid var(--t-on-hero);
		box-shadow: 5px 5px 0 #2a0d0c;
		rotate: 2.5deg;
	}
</style>
