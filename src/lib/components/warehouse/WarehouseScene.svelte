<script lang="ts" module>
	/** One step for the scene to animate. Sent by WarehouseGame after each action. */
	export type SceneAction =
		| { type: 'idle' }
		/**
		 * `cartBefore` is the cart's SKUs before this pick. The game adds the item on
		 * click, so the scene needs the old contents to show until the picker walks
		 * back with it.
		 */
		| { type: 'pick'; fromLocation: string; sku: string; cartBefore: string[] }
		/**
		 * `boxes` is the cart's SKUs when staging started. The game has already
		 * emptied the cart, so the scene needs them to wheel a full cart over.
		 */
		| { type: 'stage'; boxes: string[] }
		| { type: 'pack' }
		| { type: 'ship' }
		| { type: 'replen'; sku: string }
		/** The picker reached the slot and found it empty. */
		| { type: 'short'; sku: string }
		/** A short order was kept back in staging. */
		| { type: 'hold' };
</script>

<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { WAREHOUSE_NAME, physicalOnHand, type InventoryItem } from '#lib/data/warehouse.ts';

	interface Props {
		action: SceneAction;
		cartSkus: string[];
		stagedSkus: string[];
		heldSkus: string[];
		packedCount: number;
		loadedCount: number;
		inventory: InventoryItem[];
	}

	let { action, cartSkus, stagedSkus, heldSkus, packedCount, loadedCount, inventory }: Props =
		$props();

	// Loose goods are colour-coded by SKU so an item can be followed from the rack
	// to the cart to staging. Packing turns everything into the same taped carton.
	// Kept in script rather than CSS classes, because Svelte removes scoped
	// selectors it cannot see used in the markup.
	const SKU_TONES = [
		{ fill: '#a3c99d', edge: '#3d7a31' }, // green
		{ fill: '#c98ec8', edge: '#6f2a6d' }, // plum
		{ fill: '#efd48a', edge: '#b18816' }, // amber
		{ fill: '#a8c4e6', edge: '#3f6ea8' }, // blue
		{ fill: '#f0b49a', edge: '#c05a28' }, // terracotta
		{ fill: '#bfb3d9', edge: '#5b4a8a' } // periwinkle
	];

	/** Which rack column holds this SKU, and so where the workers walk to. */
	function columnOf(sku: string) {
		const i = inventory.findIndex((it) => it.sku === sku);
		return i < 0 ? 0 : i;
	}

	function tone(sku: string) {
		const i = inventory.findIndex((it) => it.sku === sku);
		const t = SKU_TONES[(i < 0 ? 0 : i) % SKU_TONES.length];
		return `--fill: ${t.fill}; --edge: ${t.edge};`;
	}

	/** Cartons shown per rack column, as a coarse gauge of stock on hand. */
	function stockBars(qty: number) {
		if (qty <= 0) return 0;
		if (qty <= 3) return 1;
		if (qty <= 7) return 2;
		return 3;
	}

	// Picker worker states
	let workerPos = $state<'idle' | 'at-shelf' | 'carrying-back' | 'at-staging'>('idle');
	let workerCarrying = $state(false);

	// Replen/receiving worker states
	let replenWorkerPos = $state<'at-inbound' | 'walking-to-shelf' | 'at-shelf' | 'walking-back'>(
		'at-inbound'
	);
	let replenCarrying = $state(false);

	// Which way each worker faces, and whether they are mid-walk. Walking is read
	// from the CSS transition on `left`, so the legs move exactly while the body does.
	type Facing = 'left' | 'right';
	let pickerFacing = $state<Facing>('right');
	let runnerFacing = $state<Facing>('right');
	let pickerWalking = $state(false);
	let runnerWalking = $state(false);

	function onWalk(e: TransitionEvent, who: 'picker' | 'runner', walking: boolean) {
		if (e.propertyName !== 'left' || e.target !== e.currentTarget) return;
		if (who === 'picker') {
			pickerWalking = walking;
			// Back at rest beside the cart, the picker turns to face it again.
			if (!walking && workerPos === 'idle') pickerFacing = 'right';
		} else {
			runnerWalking = walking;
			if (!walking && replenWorkerPos === 'at-inbound') runnerFacing = 'right';
		}
	}

	// Outbound truck
	let truckState = $state<'parked' | 'leaving' | 'arriving'>('parked');

	// Shelf glow on replen
	let shelfFlash = $state(false);

	// Shown over the picker's head at an empty slot.
	let puzzled = $state(false);

	// Pack station flash when an order gets sealed
	let packFlash = $state(false);

	// The picker's cart. It sits where the picker idles, fills as items are picked,
	// and gets wheeled to staging when the cart is staged.
	let cartPos = $state<'at-pick' | 'at-staging'>('at-pick');
	let cartDisplay = $state<string[]>([]);
	let carriedSku = $state('');
	let pickColumn = $state(0);
	let replenColumn = $state(0);
	let replenSku = $state('');
	// Freezes cartDisplay while the picker is mid-walk, so the cart's contents change
	// when they arrive rather than when the button is clicked.
	let holdCart = $state(false);

	/*
		The scene stays mounted for the whole run, so a new trip cancels the same
		worker's previous one; otherwise an old "walk back" timer would land mid-trip.
		Each worker has its own timer group, so both can be on the floor at once.
	*/
	type Group = 'picker' | 'runner' | 'truck';
	const timers: Record<Group, ReturnType<typeof setTimeout>[]> = {
		picker: [],
		runner: [],
		truck: []
	};
	function after(group: Group, ms: number, fn: () => void) {
		timers[group].push(setTimeout(fn, ms));
	}
	function cancel(group: Group) {
		timers[group].forEach(clearTimeout);
		timers[group] = [];
	}
	onDestroy(() => (Object.keys(timers) as Group[]).forEach(cancel));

	// Cancels the picker's current trip and puts them, and the cart, back at rest,
	// so a trip cut short never leaves the cart stranded at staging.
	function settlePicker() {
		cancel('picker');
		workerPos = 'idle';
		workerCarrying = false;
		puzzled = false;
		cartPos = 'at-pick';
		holdCart = false;
		pickerFacing = 'right';
	}

	// Back to the opening frame, for Reset.
	function resetScene() {
		(Object.keys(timers) as Group[]).forEach(cancel);
		settlePicker();
		replenWorkerPos = 'at-inbound';
		replenCarrying = false;
		runnerFacing = 'right';
		truckState = 'parked';
		shelfFlash = false;
		packFlash = false;
	}

	// Only `action` starts an animation. The dispatch is untracked because the
	// animations read `inventory` through columnOf(); tracking it would replay the
	// trip whenever a replenishment updates inventory.
	$effect(() => {
		const a = action;
		untrack(() => {
			if (a.type === 'idle') resetScene();
			else if (a.type === 'pick') animatePick(a.sku, a.cartBefore);
			else if (a.type === 'short') animateShort(a.sku);
			else if (a.type === 'hold') animatePack();
			else if (a.type === 'stage') animateStage(a.boxes);
			else if (a.type === 'pack') animatePack();
			else if (a.type === 'ship') animateShip();
			else if (a.type === 'replen') animateReplen(a.sku);
		});
	});

	// Declared after the action effects so that when a walk begins, this sees
	// holdCart already set and leaves the in-transit contents alone.
	$effect(() => {
		if (!holdCart) cartDisplay = cartSkus;
	});

	// Walk to the rack empty-handed, pick the item up there, carry it back, and only
	// then drop it in the cart.
	function animatePick(sku: string, cartBefore: string[]) {
		settlePicker();
		holdCart = true;
		cartDisplay = cartBefore;
		carriedSku = sku;
		pickColumn = columnOf(sku);
		workerCarrying = false;
		pickerFacing = 'left';
		workerPos = 'at-shelf';

		// Arrives at the column and lifts the carton.
		after('picker', 700, () => {
			workerCarrying = true;
		});
		// Beat at the rack, then walks back with it.
		after('picker', 1300, () => {
			pickerFacing = 'right';
			workerPos = 'carrying-back';
		});
		// Reaches the cart and puts it in.
		after('picker', 1750, () => {
			workerPos = 'idle';
			workerCarrying = false;
			holdCart = false;
		});
	}

	// Same trip as a pick, but the slot is empty: a beat at the rack, then back
	// with nothing.
	function animateShort(sku: string) {
		settlePicker();
		pickColumn = columnOf(sku);
		pickerFacing = 'left';
		workerPos = 'at-shelf';
		after('picker', 700, () => {
			puzzled = true;
		});
		after('picker', 1500, () => {
			puzzled = false;
			pickerFacing = 'right';
			workerPos = 'carrying-back';
		});
		after('picker', 1950, () => {
			workerPos = 'idle';
		});
	}

	// The picker wheels the loaded cart over to staging, unloads it, and brings it back.
	function animateStage(boxes: string[]) {
		settlePicker();
		holdCart = true;
		cartDisplay = boxes;
		workerCarrying = false;
		workerPos = 'at-staging';
		cartPos = 'at-staging';
		after('picker', 700, () => {
			cartDisplay = [];
		});
		after('picker', 1000, () => {
			pickerFacing = 'left';
			workerPos = 'idle';
			cartPos = 'at-pick';
			holdCart = false;
		});
	}

	function animatePack() {
		settlePicker();
		workerPos = 'at-staging';
		packFlash = true;
		after('picker', 700, () => {
			packFlash = false;
		});
		after('picker', 900, () => {
			pickerFacing = 'left';
			workerPos = 'idle';
		});
	}

	// The trailer takes 1s to clear the frame. The dock stays empty for a beat before
	// the next one backs in, so it reads as a new truck.
	function animateShip() {
		cancel('truck');
		truckState = 'leaving';
		after('truck', 2800, () => {
			truckState = 'arriving';
		});
		after('truck', 4000, () => {
			truckState = 'parked';
		});
	}

	// The picker in reverse: collect a carton at receiving, carry it to the SKU's
	// column, set it down, walk back. The drop at 1500ms is when the game completes
	// the replenishment, so the column refills as the carton lands.
	function animateReplen(sku: string) {
		cancel('runner');
		replenColumn = columnOf(sku);
		replenSku = sku;

		// Lifts a carton at receiving.
		replenCarrying = true;
		replenWorkerPos = 'at-inbound';

		// Carries it across to the rack.
		after('runner', 600, () => {
			replenWorkerPos = 'walking-to-shelf';
		});
		// Sets it down in the slot.
		after('runner', 1500, () => {
			replenCarrying = false;
			shelfFlash = true;
		});
		// Heads back to receiving.
		after('runner', 2100, () => {
			shelfFlash = false;
			runnerFacing = 'left';
			replenWorkerPos = 'walking-back';
		});
		after('runner', 2800, () => {
			replenWorkerPos = 'at-inbound';
		});
	}
</script>

<!--
	The trucks, workers and wheels are drawn by docs/design-review/illustrations, in the
	same hand as the site's other illustrations. Cartons, the rack and the cart are
	plain boxes because their number and colour change as the game runs.
-->
<div class="scene" aria-hidden="true">
	<!-- Building, with the floor running under it and out to both trucks. -->
	<div class="building">
		<div class="building-sign">{WAREHOUSE_NAME}</div>
	</div>
	<div class="floor"></div>

	<!-- ── Inbound (left) ── -->

	<!-- Inbound truck: parked, backed up to the building, cab off to the left. -->
	<div class="inbound-truck">
		<img class="truck-art ink-art" src="/illustrations/sim/truck-in.svg" alt="" />
		<img class="wheel ink-art w-1" src="/illustrations/sim/wheel.svg" alt="" />
		<img class="wheel ink-art w-2" src="/illustrations/sim/wheel.svg" alt="" />
		<img class="wheel ink-art w-3" src="/illustrations/sim/wheel.svg" alt="" />
	</div>

	<!-- Conveyor from the truck to the receiving area -->
	<div class="conveyor">
		<div class="conveyor-line"></div>
		<div class="conveyor-roller"></div>
		<div class="conveyor-roller cr-2"></div>
		<div class="conveyor-roller cr-3"></div>
		<div class="conveyor-roller cr-4"></div>
		<div class="conveyor-roller cr-5"></div>
	</div>

	<!-- Receiving area -->
	<div class="area-label receiving-label">Receiving</div>
	<div class="receiving-area">
		<div class="receiving-box"></div>
		<div class="receiving-box"></div>
	</div>

	<!-- Receiving/replen worker -->
	<div
		class="worker replen-worker"
		style="--col-i: {replenColumn}"
		class:rw-at-inbound={replenWorkerPos === 'at-inbound'}
		class:rw-walking-to-shelf={replenWorkerPos === 'walking-to-shelf'}
		class:rw-at-shelf={replenWorkerPos === 'at-shelf'}
		class:rw-walking-back={replenWorkerPos === 'walking-back'}
		class:walking={runnerWalking}
		class:face-left={runnerFacing === 'left'}
		ontransitionrun={(e) => onWalk(e, 'runner', true)}
		ontransitionend={(e) => onWalk(e, 'runner', false)}
		ontransitioncancel={(e) => onWalk(e, 'runner', false)}
	>
		<div class="figure">
			<img class="leg leg-a ink-art" src="/illustrations/sim/worker-leg.svg" alt="" />
			<img class="leg leg-b ink-art" src="/illustrations/sim/worker-leg.svg" alt="" />
			<img class="torso ink-art" src="/illustrations/sim/worker-runner.svg" alt="" />
			{#if replenCarrying}
				<div class="carried-box" style={tone(replenSku)}></div>
			{/if}
		</div>
	</div>

	<!-- ── Centre ── -->

	<!-- Rack: each column shows one item's stock -->
	<div class="shelf" class:shelf-flash={shelfFlash}>
		{#each inventory as item (item.sku)}
			<div class="shelf-col" title="{item.itemName} ({physicalOnHand(item)})">
				{#each { length: stockBars(physicalOnHand(item)) } as _, i (i)}
					<div class="shelf-box" style={tone(item.sku)}></div>
				{/each}
			</div>
		{/each}
	</div>

	<!-- Picker worker -->
	<div
		class="worker picker"
		style="--col-i: {pickColumn}"
		class:worker-idle={workerPos === 'idle'}
		class:worker-at-shelf={workerPos === 'at-shelf'}
		class:worker-carrying-back={workerPos === 'carrying-back'}
		class:worker-at-staging={workerPos === 'at-staging'}
		class:walking={pickerWalking}
		class:face-left={pickerFacing === 'left'}
		ontransitionrun={(e) => onWalk(e, 'picker', true)}
		ontransitionend={(e) => onWalk(e, 'picker', false)}
		ontransitioncancel={(e) => onWalk(e, 'picker', false)}
	>
		<div class="figure">
			<img class="leg leg-a ink-art" src="/illustrations/sim/worker-leg.svg" alt="" />
			<img class="leg leg-b ink-art" src="/illustrations/sim/worker-leg.svg" alt="" />
			<img class="torso ink-art" src="/illustrations/sim/worker-picker.svg" alt="" />
			{#if workerCarrying}
				<div class="carried-box" style={tone(carriedSku)}></div>
			{/if}
		</div>
		<!-- Outside the figure, so it is not mirrored when the picker faces left. -->
		{#if puzzled}
			<div class="puzzled">?</div>
		{/if}
	</div>

	<!-- The picker's cart: fills as items are picked, then is wheeled to staging. -->
	<div
		class="cart"
		class:cart-at-pick={cartPos === 'at-pick'}
		class:cart-at-staging={cartPos === 'at-staging'}
	>
		<div class="cart-basket">
			{#each cartDisplay.slice(0, 6) as sku, i (i)}
				<div class="cart-box" style={tone(sku)}></div>
			{/each}
		</div>
		<div class="cart-handle"></div>
		<div class="cart-wheel cw-1"></div>
		<div class="cart-wheel cw-2"></div>
	</div>

	<!-- ── Outbound (right) ── -->

	<!-- Staging area: loose boxes waiting, sealed boxes packed and ready to load -->
	<div class="area-label staging-label">Staging</div>
	<div class="staging-area" class:pack-flash={packFlash}>
		{#each { length: Math.min(packedCount, 12) } as _, i (i)}
			<div class="packed-box"></div>
		{/each}
		{#each stagedSkus.slice(0, 12 - Math.min(packedCount, 12)) as sku, i (i)}
			<div class="staged-box" style={tone(sku)}></div>
		{/each}
		{#each heldSkus.slice(0, 6) as sku, i (i)}
			<div class="staged-box held-box" style={tone(sku)}></div>
		{/each}
		{#if heldSkus.length > 0}
			<div class="hold-tag">Hold</div>
		{/if}
	</div>

	<!-- Outbound truck. Its trailer is open-sided, so loaded cartons show inside. -->
	<div
		class="truck"
		class:truck-parked={truckState === 'parked'}
		class:truck-leaving={truckState === 'leaving'}
		class:truck-arriving={truckState === 'arriving'}
	>
		<img class="truck-art ink-art" src="/illustrations/sim/truck-out.svg" alt="" />
		<div class="truck-trailer">
			{#each { length: Math.min(loadedCount, 12) } as _, i (i)}
				<div class="loaded-box"></div>
			{/each}
		</div>
		<img class="wheel ink-art w-1" src="/illustrations/sim/wheel.svg" alt="" />
		<img class="wheel ink-art w-2" src="/illustrations/sim/wheel.svg" alt="" />
		<img class="wheel ink-art w-3" src="/illustrations/sim/wheel.svg" alt="" />
	</div>
</div>

<style>
	.scene {
		/* One carton size for the rack, cart, staging and truck, so goods keep their
		   size as they move. */
		--carton: 10px;
		/* Where the rack starts. Worker shelf positions are derived from it so they
		   land on the right column at any breakpoint. */
		--rack-left: 34%;
		/* Scales both trucks together. */
		--u: 1;
		/* Height of the floor strip; everything stands on its top edge. */
		--ground: 20%;
		/* Line colour for the parts drawn in CSS, matching the illustrations' ink. */
		--ink: #3b2a1e;
		--wall: #fbf6ea;
		--floor: #e2dccd;

		position: relative;
		width: 100%;
		height: 210px;
		/* A flex child of the modal; without this it shrinks when the panel below grows. */
		flex-shrink: 0;
		overflow: hidden;
		border-bottom: 1px solid var(--t-edge);
		background: var(--t-band);
	}

	:global(.dark) .scene {
		--ink: #d6cdbf;
		--wall: #2a231b;
		--floor: #382e23;
	}

	.floor {
		position: absolute;
		inset: auto 0 0;
		height: var(--ground);
		border-top: 2px solid var(--ink);
		background: var(--floor);
	}

	/* Building: spans from one dock to the other, with the trucks outside it. */
	.building {
		position: absolute;
		bottom: var(--ground);
		left: 12%;
		right: 15%;
		height: 66%;
		border: 2px solid var(--ink);
		border-bottom: none;
		border-radius: 6px 6px 0 0;
		background: var(--wall);
	}

	.building-sign {
		position: absolute;
		top: 7px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 13px;
		font-weight: 700;
		color: var(--ink);
		white-space: nowrap;
	}

	/* Names for the two marked-out floor areas. */
	.area-label {
		position: absolute;
		/* Clear of the workers' hard hats, which pass underneath. */
		bottom: calc(var(--ground) + 54px);
		transform: translateX(-50%);
		font-size: 10px;
		font-weight: 700;
		color: var(--ink);
		white-space: nowrap;
		z-index: 5;
	}

	/* ── Trucks ── */

	.truck,
	.inbound-truck {
		position: absolute;
		/* The drawing leaves 2px under the wheels at full size. */
		bottom: calc(var(--ground) - 2px * var(--u));
		width: calc(120px * var(--u));
		height: calc(64px * var(--u));
	}

	.truck-art {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.wheel {
		position: absolute;
		top: 71.9%;
		width: 13.33%;
		height: auto;
		aspect-ratio: 1;
	}

	.w-1 {
		left: 8.3%;
	}
	.w-2 {
		left: 20.8%;
	}
	.w-3 {
		left: 72.5%;
	}

	/* Mirrored, so its trailer backs onto the building and the cab points away. */
	.inbound-truck {
		--u: 0.85;
		right: 88%;
		transform: scaleX(-1);
	}

	.truck {
		left: 85%;
		transition: transform 1s ease-in;
	}

	.truck-parked {
		transform: translateX(0);
	}
	.truck-leaving {
		transform: translateX(220%);
	}
	.truck-arriving {
		transform: translateX(0);
		animation: truck-arrive 1s cubic-bezier(0.2, 0.7, 0.3, 1);
	}

	@keyframes truck-arrive {
		from {
			transform: translateX(220%);
		}
		to {
			transform: translateX(0);
		}
	}

	/* The open side of the trailer, in the drawing's own proportions. */
	.truck-trailer {
		position: absolute;
		left: 3%;
		top: 11%;
		width: 61%;
		height: 67%;
		display: flex;
		flex-wrap: wrap-reverse;
		direction: rtl;
		align-content: flex-start;
		gap: 2px;
		padding: 3px;
		overflow: hidden;
	}

	/* ── Inbound (left) ── */

	.conveyor {
		position: absolute;
		bottom: calc(var(--ground) + 5px);
		left: 12%;
		width: 10%;
		height: 6px;
	}

	.conveyor-line {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: repeating-linear-gradient(to right, var(--ink) 0 4px, transparent 4px 7px);
	}

	.conveyor-roller {
		position: absolute;
		bottom: -3px;
		left: 0;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #d3d8de;
		border: 1.5px solid var(--ink);
	}

	.cr-2 {
		left: 22%;
	}
	.cr-3 {
		left: 44%;
	}
	.cr-4 {
		left: 66%;
	}
	.cr-5 {
		left: 88%;
	}

	.receiving-area,
	.staging-area {
		position: absolute;
		bottom: var(--ground);
		border: 1.5px dashed var(--ink);
		border-bottom: none;
		border-radius: 3px 3px 0 0;
		display: flex;
		padding: 3px;
	}

	.receiving-area {
		left: 22%;
		width: calc(var(--carton) * 2 + 14px);
		height: calc(var(--carton) * 2 + 12px);
		align-items: flex-end;
		gap: 3px;
	}

	.receiving-label {
		left: calc(22% + var(--carton) + 7px);
	}

	/* ── Workers ── */

	.worker {
		position: absolute;
		bottom: var(--ground);
		width: 24px;
		height: 49px;
		z-index: 10;
	}

	.picker {
		transition: left 0.4s ease-in-out;
	}

	.replen-worker {
		transition: left 0.7s ease-in-out;
	}

	/* Turns the whole figure, carried carton included. */
	.figure {
		position: absolute;
		inset: 0;
	}

	.face-left .figure {
		transform: scaleX(-1);
	}

	.torso {
		position: absolute;
		top: 0;
		left: 0;
		width: 24px;
		height: 37px;
	}

	.leg {
		position: absolute;
		top: 33px;
		width: 8px;
		height: 16px;
		transform-origin: 50% 2px;
	}

	.leg-a {
		left: 5px;
	}
	.leg-b {
		left: 11px;
	}

	.rw-at-inbound,
	.rw-walking-back {
		left: 24%;
	}

	/* Centre of column --col-i: rack padding and border, then one column pitch per
	   index, then half a column, less half the worker's width. */
	.rw-walking-to-shelf,
	.rw-at-shelf,
	.worker-at-shelf {
		left: calc(
			var(--rack-left) + 5px + var(--col-i, 0) * (var(--carton) + 6px) + (var(--carton) + 4px) / 2 -
				12px
		);
	}

	.worker-idle,
	.worker-carrying-back {
		left: 52%;
	}
	.worker-at-staging {
		left: 62%;
	}

	/* Held out in front, at chest height. */
	.carried-box {
		position: absolute;
		top: 20px;
		right: calc(var(--carton) * -1 + 3px);
	}

	/* Above the picker's hard hat while they stand at an empty slot. */
	.puzzled {
		position: absolute;
		top: -17px;
		left: 50%;
		translate: -50% 0;
		font: 700 12px/1 var(--font-sans);
		color: var(--color-ember-800);
		background: #fff;
		border: 1.5px solid #3b2a1e;
		border-radius: 6px;
		padding: 2px 5px;
	}

	/* ── Rack ── */

	/*
		The rack, cart and cartons keep their own colours in both themes, as the
		illustrations do. On the dark theme a light outline stands in for the
		illustrations' die-cut edge.
	*/
	.shelf {
		position: absolute;
		bottom: var(--ground);
		left: var(--rack-left);
		/* max-content, not a calculated width. A width that came up short would squeeze
		   empty columns to their borders while full ones kept their size. */
		width: max-content;
		height: calc(var(--carton) * 3 + 22px);
		display: flex;
		align-items: stretch;
		gap: 2px;
		padding: 3px;
		background: #c8914f;
		border: 2px solid #3b2a1e;
		border-radius: 3px 3px 0 0;
		transition: box-shadow 0.3s;
	}

	:global(.dark) .shelf,
	:global(.dark) .cart-basket {
		outline: 1px solid rgb(255 248 235 / 0.8);
	}

	.shelf-flash {
		box-shadow: 0 0 14px 3px var(--color-accent-400);
	}

	.shelf-col {
		display: flex;
		/* Fixed and non-flexible, so an empty slot is exactly as wide as a full one and
		   reads as an empty shelf rather than vanishing. */
		width: calc(var(--carton) + 4px);
		flex: none;
		flex-direction: column-reverse;
		align-items: center;
		justify-content: flex-start;
		gap: 2px;
		background: #f2d3a0;
		border: 1px solid #3b2a1e;
		border-radius: 1px;
		padding-bottom: 1px;
	}

	/* Loose goods, still identifiable as a particular SKU. --fill and --edge are set
	   inline per carton; the reds are the fallback for anything unmatched. */
	.shelf-box,
	.carried-box,
	.cart-box,
	.staged-box {
		width: var(--carton);
		height: var(--carton);
		flex-shrink: 0;
		border: 1.5px solid var(--edge, var(--color-ember-500));
		border-radius: 2px;
		background: var(--fill, var(--color-ember-100));
	}

	/* ── Picker's cart ── */

	.cart {
		position: absolute;
		bottom: var(--ground);
		width: calc(var(--carton) * 2 + 14px);
		height: calc(var(--carton) * 3 + 14px);
		transition: left 0.4s ease-in-out;
		z-index: 9;
	}

	/* Between the picker (idle at 52%) and staging (60%), so the picker, the cart and
	   the staging area all sit in a row in plain view. */
	.cart-at-pick {
		left: 56%;
	}

	.cart-at-staging {
		left: 63%;
	}

	.cart-basket {
		position: absolute;
		bottom: 5px;
		left: 0;
		display: flex;
		/* Holds CART_CAPACITY (6): two across, three down. */
		width: calc(var(--carton) * 2 + 10px);
		height: calc(var(--carton) * 3 + 8px);
		flex-wrap: wrap-reverse;
		align-content: flex-start;
		gap: 1px;
		overflow: hidden;
		padding: 1px;
		border: 1.5px solid #3b2a1e;
		border-top: none;
		border-radius: 0 0 3px 3px;
		background: #fff;
	}

	:global(.dark) .cart-basket {
		background: #e9e4d8;
	}

	.cart-handle {
		position: absolute;
		right: -3px;
		bottom: 5px;
		width: 5px;
		height: calc(var(--carton) * 3 + 11px);
		border-top: 1.5px solid var(--ink);
		border-right: 1.5px solid var(--ink);
		border-radius: 0 3px 0 0;
	}

	.cart-wheel {
		position: absolute;
		bottom: 0;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--ink);
	}

	.cw-1 {
		left: 3px;
	}

	.cw-2 {
		right: 5px;
	}

	/* ── Outbound (right) ── */

	.staging-area {
		left: 60%;
		/* Holds the 12 cartons it renders: four across, three down. */
		width: calc(var(--carton) * 4 + 15px);
		height: calc(var(--carton) * 3 + 12px);
		flex-wrap: wrap-reverse;
		direction: rtl;
		align-content: flex-start;
		gap: 2px;
		overflow: hidden;
		/* On the base rule so the flash fades out as well as in. */
		transition:
			box-shadow 0.25s ease,
			border-color 0.25s ease;
	}

	.staging-label {
		left: calc(60% + var(--carton) * 2 + 7px);
	}

	/* A held order's goods stay loose in staging, outlined so they read as set aside. */
	.held-box {
		outline: 1px dashed var(--color-ember-700);
		outline-offset: 1px;
	}

	.hold-tag {
		position: absolute;
		top: -13px;
		right: 0;
		font: 700 8px/1 var(--font-sans);
		color: #fff;
		background: var(--color-ember-700);
		border-radius: 3px;
		padding: 2px 4px;
	}

	/* Goods keep one carton colour the whole way through the warehouse. What changes
	   is the tape: a plain box is loose, a taped box is sealed. So staged boxes are
	   plain, and packed and loaded boxes are cardboard with a tape stripe. */
	.packed-box,
	.loaded-box,
	.receiving-box {
		width: var(--carton);
		height: var(--carton);
		background: #e6bd85;
		border: 1.5px solid #3b2a1e;
		border-radius: 2px;
		flex-shrink: 0;
		/* A fixed 2px band; a percentage of a small carton rounds to nothing. */
		background-image: linear-gradient(
			to bottom,
			transparent calc(50% - 1px),
			#b77a3c calc(50% - 1px),
			#b77a3c calc(50% + 1px),
			transparent calc(50% + 1px)
		);
	}

	.staging-area.pack-flash {
		border-color: var(--color-ember-600);
		box-shadow: 0 0 8px 1px var(--color-ember-400);
	}

	/* ── Motion ── */

	@media (prefers-reduced-motion: no-preference) {
		/* Legs swing and the figure bobs for exactly as long as the worker is moving. */
		.walking .leg-a {
			animation: stride 0.3s ease-in-out infinite alternate;
		}
		.walking .leg-b {
			animation: stride 0.3s ease-in-out infinite alternate-reverse;
		}
		.walking .torso,
		.walking .carried-box {
			animation: bob 0.15s ease-in-out infinite alternate;
		}

		/* Wheels turn with the truck: forward as it pulls out, back as it reverses in. */
		.truck-leaving .wheel {
			animation: roll 0.45s linear infinite;
		}
		.truck-arriving .wheel {
			animation: roll 0.6s linear infinite reverse;
		}

		/* A carton settles as it is set down, wherever it lands. */
		.shelf-box,
		.cart-box,
		.staged-box,
		.packed-box,
		.loaded-box {
			animation: set-down 0.22s var(--ease-spring) backwards;
		}

		.puzzled {
			animation: pop 0.2s var(--ease-spring) backwards;
		}
	}

	@keyframes stride {
		from {
			rotate: -24deg;
		}
		to {
			rotate: 24deg;
		}
	}

	@keyframes bob {
		to {
			translate: 0 -1px;
		}
	}

	@keyframes roll {
		to {
			rotate: 360deg;
		}
	}

	@keyframes set-down {
		from {
			translate: 0 -5px;
			scale: 0.75;
		}
	}

	@keyframes pop {
		from {
			scale: 0.4;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.picker,
		.replen-worker,
		.cart,
		.truck {
			transition-duration: 0.01s;
		}

		.staging-area {
			transition: none;
		}
		.staging-area.pack-flash {
			box-shadow: none;
		}

		@keyframes truck-arrive {
			from {
				transform: translateX(0);
			}
			to {
				transform: translateX(0);
			}
		}
	}

	/*
		On a wide modal the fixed-size figures would look lost, so the whole scene is
		drawn larger. `zoom` scales the pixel sizes and keeps the percentage layout.
	*/
	@media (min-width: 900px) and (min-height: 720px) {
		.scene {
			zoom: 1.2;
			/* Trucks grow with the zoom but their docks do not move, so trim them to fit. */
			--u: 0.85;
		}
		.inbound-truck {
			--u: 0.72;
		}
	}

	/*
		Short landscape, such as a phone turned sideways. The scene is decoration, so
		hiding it loses no information and frees height for the game. Blocking
		landscape instead would fail SC 1.3.4.
	*/
	@media (orientation: landscape) and (max-height: 500px) and (pointer: coarse) {
		.scene {
			display: none;
		}
	}

	@media (max-width: 640px) {
		.scene {
			height: 160px;
			--carton: 7px;
			--rack-left: 32%;
			--u: 0.55;
		}
		/* The scene is percentage-positioned but its contents are fixed px, so on a
		   narrow screen everything crowds. Spread the chain across the space that is
		   actually there: the rack clears the replen runner parked at 24%, and the
		   picker, cart and staging move out toward the truck. */
		.building {
			left: 13%;
			right: 18%;
		}
		.inbound-truck {
			--u: 0.5;
			right: 89%;
		}
		.truck {
			left: 82.5%;
		}
		.receiving-area {
			left: 19%;
		}
		.receiving-label {
			left: calc(19% + var(--carton) + 7px);
		}
		.worker-idle,
		.worker-carrying-back {
			left: 53%;
		}
		.cart-at-pick {
			left: 60%;
		}
		.staging-area {
			left: 68%;
		}
		.staging-label {
			left: calc(68% + var(--carton) * 2 + 7px);
		}
		.worker-at-staging {
			left: 69%;
		}
		.cart-at-staging {
			left: 71%;
		}
		.building-sign {
			font-size: 11px;
		}
		/*
			Small on purpose. The scene is aria-hidden decoration, and everything these
			label is also shown as 14px+ text in PickingPanel and OrderStatusBar.
		*/
		.area-label {
			font-size: 8px;
		}
	}
</style>
