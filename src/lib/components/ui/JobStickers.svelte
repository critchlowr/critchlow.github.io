<script lang="ts">
	/**
	 * Hand-drawn objects from a job, set down in a row under its dates. Sizes and tilts
	 * are hand-picked and fixed, so nothing moves between the server render and
	 * hydration. Decorative, so hidden from assistive tech.
	 */
	interface Props {
		set: 'bar' | 'saw' | 'bench' | 'research' | 'warehouse';
	}

	let { set }: Props = $props();

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

<div
	class="flex flex-wrap items-end justify-end gap-x-2 gap-y-1 md:justify-start"
	aria-hidden="true"
>
	{#each sets[set] as [icon, w, tilt] (icon)}
		<img
			class="ink-art h-auto"
			src="/illustrations/{icon}.svg"
			alt=""
			width={icons[icon][0]}
			height={icons[icon][1]}
			loading="lazy"
			decoding="async"
			style="width: {w}px; rotate: {tilt}deg;"
		/>
	{/each}
</div>
