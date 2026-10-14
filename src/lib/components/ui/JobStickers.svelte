<script lang="ts">
	/**
	 * Hand-drawn objects stuck around a job card like stickers: sitting on the top edge,
	 * peeking out from the bottom edge, or, on wide screens where there's margin, leaning
	 * on the right side.
	 *
	 * They can't cover text. A sticker overlaps the card by at most 14px, which stays
	 * inside the card's 24px padding, and the rest sits in the gap between cards.
	 * Positions are hand-picked to look scattered but are fixed, so nothing moves between
	 * the server render and hydration. Decorative, so hidden from assistive tech.
	 */
	type Edge = 'top' | 'bottom' | 'right';
	/** Edge, position along it (%), tilt (deg). `null` hides the sticker at that size. */
	type Place = [edge: Edge, at: number, tilt: number] | null;
	interface Sticker {
		icon: keyof typeof icons;
		/** Display width in px. */
		w: number;
		/** Narrow cards, then cards at least 36rem wide, then pages at least 70rem wide. */
		narrow: Place;
		wide?: Place;
		page?: Place;
	}

	let { set }: { set: 'bar' | 'saw' | 'bench' } = $props();

	// Intrinsic sizes from each SVG's viewBox, for the width/height attributes.
	const icons = {
		beaker: [99, 149],
		coupe: [110, 108],
		egg: [72, 42],
		spoons: [55, 133],
		lumber: [180, 82],
		saw: [200, 109],
		chiselboard: [148, 43],
		rocks: [68, 75],
		square: [54, 111],
		tape: [132, 71]
	} as const;

	const sets: Record<typeof set, Sticker[]> = {
		bar: [
			{ icon: 'coupe', w: 40, narrow: ['top', 78, -6], wide: ['top', 64, -5] },
			{ icon: 'beaker', w: 30, narrow: ['top', 20, 7], wide: ['top', 50, 6] },
			{ icon: 'egg', w: 38, narrow: ['bottom', 84, 14], wide: ['bottom', 90, 12] },
			{ icon: 'rocks', w: 32, narrow: ['bottom', 56, -4], wide: ['bottom', 74, -6] },
			{ icon: 'spoons', w: 19, narrow: null, wide: ['top', 80, 9], page: ['right', 45, 10] }
		],
		saw: [
			{ icon: 'saw', w: 92, narrow: ['bottom', 70, -3], wide: ['bottom', 76, -3] },
			{ icon: 'lumber', w: 62, narrow: ['top', 24, 2], wide: ['top', 18, 2] }
		],
		bench: [
			{ icon: 'square', w: 22, narrow: ['top', 80, 8], wide: ['top', 60, 7] },
			{ icon: 'tape', w: 56, narrow: ['bottom', 76, -5], wide: ['bottom', 86, -5] },
			{ icon: 'chiselboard', w: 78, narrow: ['bottom', 28, 3], wide: ['bottom', 30, 2] }
		]
	};

	/** How far a sticker on the top edge sinks into the card. */
	const SINK = 10;
	/** How much of a sticker on the bottom edge shows inside the card. */
	const PEEK = 14;

	function vars(place: Place, n: string) {
		if (!place) return `--d${n}: none;`;
		const [edge, at, tilt] = place;
		const [left, top, tx, ty] =
			edge === 'top'
				? [`${at}%`, '0%', '-50%', `calc(-100% + ${SINK}px)`]
				: edge === 'bottom'
					? [`${at}%`, '100%', '-50%', `-${PEEK}px`]
					: ['100%', `${at}%`, 'calc(-50% + 6px)', '-50%'];
		return `--d${n}: block; --l${n}: ${left}; --t${n}: ${top}; --tx${n}: ${tx}; --ty${n}: ${ty}; --r${n}: ${tilt}deg;`;
	}

	function style(s: Sticker) {
		const wide = s.wide === undefined ? s.narrow : s.wide;
		const page = s.page === undefined ? wide : s.page;
		return `--w: ${s.w}px; ${vars(s.narrow, '')} ${vars(wide, '2')} ${vars(page, '3')}`;
	}
</script>

{#each sets[set] as s (s.icon)}
	<img
		class="sticker"
		src="/illustrations/{s.icon}.svg"
		alt=""
		aria-hidden="true"
		width={icons[s.icon][0]}
		height={icons[s.icon][1]}
		loading="lazy"
		decoding="async"
		style={style(s)}
	/>
{/each}

<style>
	.sticker {
		position: absolute;
		z-index: 1;
		display: var(--d);
		left: var(--l);
		top: var(--t);
		width: var(--w);
		height: auto;
		translate: var(--tx) var(--ty);
		rotate: calc(var(--r) * var(--flip, 1));
		pointer-events: none;
	}

	@container (width >= 36rem) {
		.sticker {
			display: var(--d2);
			left: var(--l2);
			top: var(--t2);
			translate: var(--tx2) var(--ty2);
			rotate: calc(var(--r2) * var(--flip, 1));
		}
	}

	@media (width >= 70rem) {
		.sticker {
			display: var(--d3);
			left: var(--l3);
			top: var(--t3);
			translate: var(--tx3) var(--ty3);
			rotate: calc(var(--r3) * var(--flip, 1));
		}
	}

	/*
		In dark mode the ink outlines sit on a dark ground, so a thin light edge (like a
		die-cut sticker) keeps the shapes readable.
	*/
	:global(.dark) .sticker {
		filter: drop-shadow(1px 0 0 rgb(255 248 235 / 0.8)) drop-shadow(-1px 0 0 rgb(255 248 235 / 0.8))
			drop-shadow(0 1px 0 rgb(255 248 235 / 0.8)) drop-shadow(0 -1px 0 rgb(255 248 235 / 0.8));
	}

	/* Hovering the card tips each sticker the other way. Only when motion is welcome. */
	@media (prefers-reduced-motion: no-preference) {
		.sticker {
			transition: rotate 0.35s var(--ease-spring);
		}

		:global(.group:hover) .sticker {
			--flip: -1;
		}
	}
</style>
