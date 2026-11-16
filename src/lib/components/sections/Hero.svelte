<script lang="ts">
	import { hero, publications } from '#lib/data/content.ts';
	import { simulator } from '#lib/stores/simulator.svelte.ts';
	import Icon from '#lib/components/ui/Icon.svelte';

	// The paper tile quotes the published paper, so its title and nomination have one source.
	const paper = publications.find((p) => p.status === 'published');
</script>

<!--
	The board: one fact per tile. It replaces the old hero paragraph and the About
	section. The paper, Körber and degree tiles link to the sections that back them
	up, and the Körber tile also has a button that opens the simulator. On load the
	tiles are placed one after another, once; with reduced motion on they are simply
	there.
-->
<section id="hero" class="wrap board" aria-label="Introduction">
	<div class="tile name on-dark" style="--i:0">
		<h1 class="font-display">{hero.name}</h1>
		<p class="font-display tagline">{hero.tagline}</p>
		<p class="intro">{hero.intro}</p>
		<div class="mt-7 flex flex-wrap gap-2.5">
			<a href="#contact" class="btn btn-light">Get in touch</a>
			<a href={hero.resumeHref} class="btn btn-ghost">Résumé (PDF)</a>
		</div>
	</div>

	<div class="tile photo" style="--i:1">
		<img
			src="/images/ryancritchlow-325.webp"
			alt="Ryan Critchlow"
			width="325"
			height="325"
			fetchpriority="high"
		/>
	</div>

	<div class="tile avail" style="--i:2">
		<p>{hero.availability}</p>
	</div>

	{#if paper}
		<div class="tile paper on-dark" style="--i:3">
			<p class="kind">{hero.paper.label}</p>
			<h2 class="font-display"><a href={hero.paper.href}>{hero.paper.title}</a></h2>
			<p>Co-author of “{paper.title}”. {paper.honor}.</p>
		</div>
	{/if}

	<div class="tile sim on-dark" style="--i:4">
		<img
			class="sticker-edge cartons"
			src="/illustrations/cartons.svg"
			alt=""
			width="84"
			height="90"
		/>
		<h2 class="font-display"><a href={hero.korber.href}>{hero.korber.title}</a></h2>
		<p>{hero.korber.detail}</p>
		<button type="button" class="btn btn-light mt-5" onclick={simulator.show}>
			<Icon name="play" class="h-4 w-4" />
			Play the warehouse simulator
		</button>
	</div>

	<div class="tile degree" style="--i:5">
		<h2 class="font-display"><a href={hero.degree.href}>{hero.degree.title}</a></h2>
		<p>{hero.degree.detail}</p>
	</div>

	<div class="tile personal" style="--i:6">
		<!-- The lab from the header, masked so the line art takes the ink colour in both themes. -->
		<span class="logo-mark" aria-hidden="true"></span>
		<p>{hero.personal}</p>
	</div>
</section>

<style>
	/* The header is fixed, so the board starts below it. */
	.board {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
		padding-top: 5rem;
		padding-bottom: clamp(1rem, 3vw, 2rem);
	}

	.tile {
		position: relative;
		grid-column: 1 / -1;
		padding: clamp(1.25rem, 2.6vw, 2rem);
		background: var(--t-surface-raised);
	}

	.tile p {
		line-height: 1.45;
	}

	h2 {
		margin-bottom: 0.5rem;
		font-size: clamp(1.35rem, 2.2vw, 1.7rem);
		line-height: 1.1;
		font-weight: 700;
		letter-spacing: -0.015em;
	}

	h2 a {
		text-decoration: underline;
		text-decoration-thickness: 2px;
		text-underline-offset: 4px;
	}

	/* The whole tile is the link's target; the heading text is its name. */
	h2 a::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: var(--radius-tile);
	}

	/*
		The focus ring is drawn on the tile, not the heading text inside it. It sits
		just inside the tile's edge, so it is always seen against the tile's own colour.
	*/
	h2 a:focus-visible {
		outline: none;
	}

	h2 a:focus-visible::after {
		outline: 3px solid var(--t-focus);
		outline-offset: -7px;
	}

	.name {
		padding: clamp(1.5rem, 4vw, 3rem);
		background: var(--t-hero);
		color: var(--t-on-hero);
	}

	h1 {
		font-size: clamp(3rem, 9vw, 6.25rem);
		line-height: 0.9;
		font-weight: 800;
		letter-spacing: -0.035em;
	}

	.tagline {
		margin-top: 1rem;
		font-size: clamp(1.3rem, 2.4vw, 1.75rem);
		line-height: 1.15;
		font-weight: 600;
	}

	.intro {
		max-width: 30rem;
		margin-top: 0.75rem;
		font-size: 1.125rem;
	}

	.photo {
		grid-column: span 1;
		min-height: 10rem;
		padding: 0;
		overflow: hidden;
	}

	.photo img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: 50% 25%;
	}

	.avail {
		grid-column: span 1;
		display: flex;
		align-items: end;
		background: var(--t-tan);
		color: var(--t-on-tan);
		font-weight: 600;
	}

	.paper {
		background: var(--t-feature);
		color: var(--t-on-feature);
	}

	.kind {
		display: inline-block;
		margin-bottom: 0.9rem;
		padding: 0.15rem 0.75rem;
		border-radius: 999px;
		background: var(--t-on-feature);
		color: #262d12;
		font-size: 0.9rem;
		font-weight: 700;
	}

	.sim {
		background: var(--t-espresso);
		color: var(--t-on-espresso);
	}

	/* The tile is a link to the Körber row, so its button sits above the link's target. */
	.sim .btn {
		position: relative;
		z-index: 1;
	}

	.cartons {
		float: right;
		width: clamp(4rem, 9vw, 6rem);
		height: auto;
		margin: 0 0 0.5rem 1rem;
		rotate: 5deg;
	}

	.degree {
		background: var(--t-chip);
	}

	.personal {
		display: flex;
		align-items: center;
		gap: 1.25rem;
	}

	.logo-mark {
		flex-shrink: 0;
		width: clamp(6rem, 12vw, 8.5rem);
		aspect-ratio: 297 / 192;
		background: var(--t-ink-strong);
		mask: url('/images/logo-dog.png') center / contain no-repeat;
		-webkit-mask: url('/images/logo-dog.png') center / contain no-repeat;
	}

	@media (width >= 60rem) {
		.board {
			grid-template-columns: repeat(12, minmax(0, 1fr));
		}

		.name {
			grid-column: span 7;
			grid-row: span 2;
		}

		.photo {
			grid-column: span 2;
		}

		.avail {
			grid-column: span 3;
		}

		.paper,
		.sim {
			grid-column: span 5;
		}

		.degree {
			grid-column: span 3;
		}

		.personal {
			grid-column: span 4;
			flex-direction: column;
			align-items: flex-start;
		}
	}

	@media (prefers-reduced-motion: no-preference) {
		.tile {
			animation: place 0.45s var(--ease-out) backwards;
			animation-delay: calc(var(--i) * 60ms);
		}

		@keyframes place {
			from {
				opacity: 0;
				scale: 0.96;
			}
		}
	}

	/* A linked tile lifts a little under a mouse. Touch screens would leave it stuck. */
	@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
		.tile:has(h2 a) {
			transition: translate 0.15s ease-out;
		}

		.tile:has(h2 a):hover {
			translate: 0 -3px;
		}
	}

	/* Forced-colours mode repaints backgrounds, which would hide the masked logo. */
	@media (forced-colors: active) {
		.logo-mark {
			forced-color-adjust: none;
			background-color: CanvasText;
		}
	}
</style>
