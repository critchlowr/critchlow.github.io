<script lang="ts">
	/**
	 * Hand-drawn objects from a job, set down in a row under its dates. Sizes and tilts
	 * are hand-picked and fixed, so nothing moves between the server render and
	 * hydration. Decorative, so hidden from assistive tech.
	 */
	interface Props {
		set: 'bar' | 'saw' | 'bench' | 'research' | 'warehouse';
		/** Multiplies every object's width; the sizes below are for a 10rem column. */
		scale?: number;
	}

	let { set, scale = 1 }: Props = $props();

	// Intrinsic sizes from each SVG's viewBox, for the width/height attributes.
	const icons = {
		beaker: [99, 149],
		coupe: [110, 108],
		spoons: [55, 133],
		lumber: [180, 82],
		saw: [200, 109],
		chiselboard: [148, 43],
		rocks: [68, 75],
		square: [54, 111],
		tape: [132, 71],
		clipboard: [81, 105],
		notes: [71, 73],
		pencil: [70, 16],
		cartons: [84, 90]
	} as const;

	/** Icon, display width (px), tilt (deg). Each row fits the 10rem meta column. */
	type Sticker = [icon: keyof typeof icons, w: number, tilt: number];

	const sets: Record<typeof set, Sticker[]> = {
		bar: [
			['coupe', 38, -5],
			['beaker', 28, 4],
			['rocks', 30, -3],
			['spoons', 17, 8]
		],
		saw: [
			['lumber', 56, 2],
			['saw', 84, -3]
		],
		bench: [
			['square', 20, 5],
			['tape', 48, -3],
			['chiselboard', 66, 2]
		],
		research: [
			['clipboard', 34, -3],
			['notes', 32, 4],
			['pencil', 40, -6]
		],
		warehouse: [['cartons', 44, 2]]
	};
</script>

<div class="stickers flex flex-wrap items-end gap-x-3 gap-y-2" aria-hidden="true">
	{#each sets[set] as [icon, w, tilt] (icon)}
		<img
			class="ink-art h-auto"
			src="/illustrations/{icon}.svg"
			alt=""
			width={icons[icon][0]}
			height={icons[icon][1]}
			loading="lazy"
			decoding="async"
			style="width: {w * scale}px; --tilt: {tilt}deg;"
		/>
	{/each}
</div>

<style>
	/*
		Each object rests at its own tilt. `--lean` is set by a hovered row, and tips the
		objects a little further the same way.
	*/
	img {
		rotate: calc(var(--tilt) * var(--lean, 1));
		transform-origin: 50% 100%;
	}

	@media (prefers-reduced-motion: no-preference) {
		img {
			transition: rotate 0.35s var(--ease-spring);
		}
	}
</style>
