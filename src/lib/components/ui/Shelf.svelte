<script lang="ts">
	/**
	 * The hero's shelf: one or two hand-drawn objects from each job, set out left to
	 * right in the order the jobs happened, standing on a plank. The same objects sit
	 * beside their jobs in Experience. Decorative, so hidden from assistive tech.
	 *
	 * On load the objects are set down one after another, once. With reduced motion on
	 * they are simply there.
	 */

	/** File name, width at full size (px), intrinsic size, and whether phones show it. */
	type Item = [icon: string, w: number, vw: number, vh: number, phone: boolean];

	// One group per job, oldest first: site carpentry, bartending, warehouse systems,
	// research, and the millwork shop.
	const groups: Item[][] = [
		[
			['lumber', 84, 180, 82, false],
			['saw', 104, 200, 109, true]
		],
		[
			['coupe', 46, 110, 107, true],
			['beaker', 34, 99, 149, false]
		],
		[['cartons', 70, 84, 90, true]],
		[
			['clipboard', 60, 81, 105, true],
			['notes', 50, 71, 73, false],
			['pencil', 52, 70, 16, false]
		],
		[
			['square', 28, 54, 111, true],
			['tape', 66, 132, 71, true]
		]
	];

	// Position in the whole row, for the stagger.
	const order = new Map(groups.flat().map((item, i) => [item[0], i]));
</script>

<div class="shelf" aria-hidden="true">
	<div class="flex items-end justify-between px-[3%]">
		{#each groups as group (group[0][0])}
			<div class="flex items-end gap-[calc(var(--k)*10px)]">
				{#each group as [icon, w, vw, vh, phone] (icon)}
					<img
						class={['object ink-art h-auto', !phone && 'hidden sm:block']}
						src="/illustrations/{icon}.svg"
						alt=""
						width={vw}
						height={vh}
						style="width: calc(var(--k) * {w}px); --i: {order.get(icon)};"
					/>
				{/each}
			</div>
		{/each}
	</div>
	<!-- Two cuts of the plank, so the drawn line keeps its weight at either width. -->
	<img
		class="ink-art -mt-1 block h-auto w-full sm:hidden"
		src="/illustrations/plank-short.svg"
		alt=""
		width="360"
		height="28"
	/>
	<img
		class="ink-art -mt-1 hidden h-auto w-full sm:block"
		src="/illustrations/plank.svg"
		alt=""
		width="880"
		height="28"
	/>
</div>

<style>
	/* --k scales every object together, so their relative sizes hold on a phone. */
	.shelf {
		--k: 0.6;
	}

	@media (width >= 40rem) {
		.shelf {
			--k: 0.8;
		}
	}

	@media (width >= 48rem) {
		.shelf {
			--k: 1;
		}
	}

	.object {
		position: relative;
		z-index: 1;
	}

	@media (prefers-reduced-motion: no-preference) {
		.object {
			animation: set-down 0.45s var(--ease-spring) both;
			animation-delay: calc(0.15s + var(--i) * 0.07s);
		}
	}

	@keyframes set-down {
		/* Position only, so an object is never invisible if the animation does not run. */
		from {
			translate: 0 -14px;
		}
		to {
			translate: 0 0;
		}
	}
</style>
