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
	import { physicalOnHand, type InventoryItem } from '$lib/data/warehouse';

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
	}

	// Back to the opening frame, for Reset.
	function resetScene() {
		(Object.keys(timers) as Group[]).forEach(cancel);
		settlePicker();
		replenWorkerPos = 'at-inbound';
		replenCarrying = false;
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
		workerPos = 'at-shelf';

		// Arrives at the column and lifts the carton.
		after('picker', 700, () => {
			workerCarrying = true;
		});
		// Beat at the rack, then walks back with it.
		after('picker', 1300, () => {
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
		workerPos = 'at-shelf';
		after('picker', 700, () => {
			puzzled = true;
		});
		after('picker', 1500, () => {
			puzzled = false;
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
			replenWorkerPos = 'walking-back';
		});
		after('runner', 2800, () => {
			replenWorkerPos = 'at-inbound';
		});
	}
</script>

<div class="scene" aria-hidden="true">
	<div class="scene-bg">
		<!-- Building -->
		<div class="building">
			<div class="building-sign">Really Cool Big Warehouse</div>
		</div>

		<!-- Floor -->
		<div class="floor"></div>

		<!-- ── Inbound (left) ── -->

		<!-- Inbound truck (parked, static) -->
		<div class="inbound-truck">
			<div class="inbound-trailer"></div>
			<div class="inbound-cab">
				<div class="inbound-cab-window"></div>
			</div>
			<div class="truck-wheel itw-1"></div>
			<div class="truck-wheel itw-2"></div>
		</div>

		<!-- Inbound dock -->
		<div class="inbound-dock"></div>

		<!-- Conveyor lines from truck to receiving area -->
		<div class="conveyor">
			<div class="conveyor-line"></div>
			<div class="conveyor-roller"></div>
			<div class="conveyor-roller cr-2"></div>
			<div class="conveyor-roller cr-3"></div>
			<div class="conveyor-roller cr-4"></div>
			<div class="conveyor-roller cr-5"></div>
		</div>

		<!-- Receiving area -->
		<div class="receiving-label">RECEIVING</div>
		<div class="receiving-area">
			<div class="receiving-box"></div>
			<div class="receiving-box"></div>
		</div>

		<!-- Receiving/replen worker -->
		<div
			class="replen-worker"
			style="--col-i: {replenColumn}"
			class:rw-at-inbound={replenWorkerPos === 'at-inbound'}
			class:rw-walking-to-shelf={replenWorkerPos === 'walking-to-shelf'}
			class:rw-at-shelf={replenWorkerPos === 'at-shelf'}
			class:rw-walking-back={replenWorkerPos === 'walking-back'}
		>
			<div class="worker-hardhat replen-hat"></div>
			<div class="worker-head"></div>
			<div class="worker-body replen-body"></div>
			<div class="worker-legs"></div>
			{#if replenCarrying}
				<div class="carried-box" style={tone(replenSku)}></div>
			{/if}
		</div>

		<!-- ── Centre ── -->

		<!-- Shelf/rack — each slot shows inventory -->
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
			class="worker"
			style="--col-i: {pickColumn}"
			class:worker-idle={workerPos === 'idle'}
			class:worker-at-shelf={workerPos === 'at-shelf'}
			class:worker-carrying-back={workerPos === 'carrying-back'}
			class:worker-at-staging={workerPos === 'at-staging'}
		>
			<div class="worker-hardhat"></div>
			<div class="worker-head"></div>
			<div class="worker-body"></div>
			<div class="worker-legs"></div>
			{#if workerCarrying}
				<div class="carried-box" style={tone(carriedSku)}></div>
			{/if}
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

		<!-- Staging area — loose boxes waiting, sealed boxes packed and ready to load -->
		<div class="staging-label">STAGING</div>
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
				<div class="hold-tag">HOLD</div>
			{/if}
		</div>

		<!-- Outbound dock -->
		<div class="outbound-dock"></div>

		<!-- Outbound truck -->
		<div
			class="truck"
			class:truck-parked={truckState === 'parked'}
			class:truck-leaving={truckState === 'leaving'}
			class:truck-arriving={truckState === 'arriving'}
		>
			<div class="truck-trailer">
				{#each { length: Math.min(loadedCount, 12) } as _, i (i)}
					<div class="loaded-box"></div>
				{/each}
			</div>
			<div class="truck-cab">
				<div class="cab-window"></div>
				<div class="cab-bumper"></div>
			</div>
			<div class="truck-wheel tw-1"></div>
			<div class="truck-wheel tw-2"></div>
			<div class="truck-wheel tw-3"></div>
			<div class="truck-wheel tw-4"></div>
		</div>
	</div>
</div>

<style>
	.scene {
		/* One carton size for the cart, staging and the truck, so goods keep their
		   size as they move. */
		--carton: 8px;
		/* Where the rack starts. Worker shelf positions are derived from it so they
		   land on the right column at any breakpoint. */
		--rack-left: 34%;

		position: relative;
		width: 100%;
		height: 195px;
		/* A flex child of the modal; without this it shrinks when the panel below grows. */
		flex-shrink: 0;
		overflow: hidden;
		border-bottom: 1px solid var(--color-warm-200);
		background: linear-gradient(to bottom, #87ceeb 0%, #b0e0e6 50%, transparent 50%);
	}

	:global(.dark) .scene {
		background: linear-gradient(to bottom, #1a1a3e 0%, #2a2a4e 50%, transparent 50%);
		border-color: var(--color-warm-700);
	}

	.scene-bg {
		position: absolute;
		inset: 0;
	}

	.floor {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 22%;
		background: #8b7355;
	}

	:global(.dark) .floor {
		background: #4a3828;
	}

	/* Building */
	.building {
		position: absolute;
		bottom: 22%;
		left: 1%;
		width: 98%;
		height: 62%;
		background: #d2b48c;
		border: 2px solid #8b7355;
		border-bottom: none;
	}

	:global(.dark) .building {
		background: #5a4a3a;
		border-color: #3a2a1a;
	}

	.building-sign {
		position: absolute;
		top: 6px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 12px;
		font-weight: 700;
		color: #5a3a1a;
		white-space: nowrap;
		font-family: var(--font-mono);
		letter-spacing: 0.5px;
	}

	:global(.dark) .building-sign {
		color: var(--color-warm-300);
	}

	/* ── Inbound (left) ── */

	/* Inbound truck — facing left (cab on left) */
	.inbound-truck {
		position: absolute;
		bottom: 22%;
		left: 0%;
		width: 11%;
		height: 34%;
	}

	.inbound-trailer {
		position: absolute;
		right: 0;
		bottom: 10px;
		width: 55%;
		height: 80%;
		background: #e8e8e8;
		border: 2px solid #b0b0b0;
		border-radius: 1px;
	}

	:global(.dark) .inbound-trailer {
		background: #6a6a6a;
		border-color: #4a4a4a;
	}

	.inbound-cab {
		position: absolute;
		left: 0;
		bottom: 10px;
		width: 38%;
		height: 42%;
		background: #2e86c1;
		border: 2px solid #1b4f72;
		border-radius: 4px 1px 1px 1px;
	}

	:global(.dark) .inbound-cab {
		background: #1a5276;
		border-color: #0e3a5c;
	}

	.inbound-cab-window {
		position: absolute;
		top: 3px;
		left: 3px;
		width: 55%;
		height: 40%;
		background: #aed6f1;
		border: 1px solid #85c1e9;
		border-radius: 3px 1px 0 0;
	}

	:global(.dark) .inbound-cab-window {
		background: #5b8db8;
		border-color: #417a9b;
	}

	.itw-1 {
		left: 5%;
	}
	.itw-2 {
		right: 8%;
	}

	/* Inbound dock */
	.inbound-dock {
		position: absolute;
		bottom: 22%;
		left: 10%;
		width: 3%;
		height: 8px;
		background: #8b7355;
		border: 1px solid #6b5335;
	}

	:global(.dark) .inbound-dock {
		background: #5a4328;
		border-color: #3a2318;
	}

	/* Conveyor from dock to receiving */
	.conveyor {
		position: absolute;
		bottom: calc(22% + 5px);
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
		background: repeating-linear-gradient(
			to right,
			#666 0px,
			#666 4px,
			transparent 4px,
			transparent 7px
		);
	}

	:global(.dark) .conveyor-line {
		background: repeating-linear-gradient(
			to right,
			#888 0px,
			#888 4px,
			transparent 4px,
			transparent 7px
		);
	}

	.conveyor-roller {
		position: absolute;
		bottom: -3px;
		left: 0;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #888;
		border: 1px solid #666;
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

	/* Receiving area */
	.receiving-area {
		position: absolute;
		bottom: 22%;
		left: 22%;
		width: calc(var(--carton) * 2 + 14px);
		height: calc(var(--carton) * 2 + 12px);
		border: 1px dashed #8b7355;
		border-bottom: none;
		display: flex;
		align-items: flex-end;
		gap: 3px;
		padding: 3px;
	}

	:global(.dark) .receiving-area {
		border-color: var(--color-warm-400);
	}

	.receiving-label {
		position: absolute;
		bottom: calc(22% + 54px);
		left: 26%;
		transform: translateX(-50%);
		font-size: 8px;
		font-weight: 700;
		color: #5a3a1a;
		font-family: var(--font-mono);
		white-space: nowrap;
		z-index: 5;
	}

	:global(.dark) .receiving-label {
		color: var(--color-warm-300);
	}

	.receiving-box {
		width: var(--carton);
		height: var(--carton);
		background: var(--color-accent-100);
		border: 1px solid var(--color-accent-500);
		border-radius: 1px;
		flex-shrink: 0;
	}

	/* Replen/receiving worker */
	.replen-worker {
		position: absolute;
		bottom: 22%;
		width: 24px;
		height: 48px;
		transition: left 0.7s ease-in-out;
		z-index: 10;
	}

	.rw-at-inbound {
		left: 24%;
	}
	.rw-walking-to-shelf {
		left: calc(
			var(--rack-left) + 5px + var(--col-i, 0) * (var(--carton) + 6px) + (var(--carton) + 4px) / 2 -
				12px
		);
	}
	.rw-at-shelf {
		left: calc(
			var(--rack-left) + 5px + var(--col-i, 0) * (var(--carton) + 6px) + (var(--carton) + 4px) / 2 -
				12px
		);
	}
	.rw-walking-back {
		left: 24%;
	}

	.replen-hat {
		background: #ff6b35 !important;
	}

	.replen-body {
		background: #2e8b57 !important;
	}
	:global(.dark) .replen-body {
		background: #1a6b37 !important;
	}

	/* ── Centre ── */

	/* Shelf */
	.shelf {
		position: absolute;
		bottom: 22%;
		left: var(--rack-left);
		/* max-content, not a calculated width. A width that came up short would squeeze
		   empty columns to their borders while full ones kept their size. */
		width: max-content;
		height: calc(var(--carton) * 3 + 22px);
		display: flex;
		align-items: stretch;
		gap: 2px;
		padding: 3px;
		background: #8b6914;
		border: 2px solid #6b4914;
		transition: box-shadow 0.3s;
	}

	:global(.dark) .shelf {
		background: #6b5914;
		border-color: #4b3914;
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
		background: #c4a55a;
		border: 1px solid #a48530;
		padding-bottom: 1px;
	}

	:global(.dark) .shelf-col {
		background: #8a7540;
		border-color: #6a5530;
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
		border: 1px solid var(--edge, var(--color-ember-500));
		border-radius: 1px;
		background: var(--fill, var(--color-ember-100));
	}

	.shelf-box {
		transition:
			opacity 0.3s,
			transform 0.3s;
	}

	/*
		No dark-mode override: the per-SKU pastels read fine on the dark rack, and a
		single override colour would hide which item is which.
	*/

	/* Picker worker */
	.worker {
		position: absolute;
		bottom: 22%;
		width: 24px;
		height: 48px;
		transition: left 0.4s ease-in-out;
		z-index: 10;
	}

	.worker-idle {
		left: 52%;
	}
	/* Centre of column --col-i: rack padding and border, then one column pitch per
	   index, then half a column, less half the worker's width. */
	.worker-at-shelf {
		left: calc(
			var(--rack-left) + 5px + var(--col-i, 0) * (var(--carton) + 6px) + (var(--carton) + 4px) / 2 -
				12px
		);
	}
	.worker-carrying-back {
		left: 52%;
	}
	.worker-at-staging {
		left: 62%;
	}

	.worker-hardhat {
		position: absolute;
		top: 0;
		left: 2px;
		width: 20px;
		height: 9px;
		background: #ffd700;
		border-radius: 4px 4px 0 0;
	}

	.worker-head {
		position: absolute;
		top: 9px;
		left: 5px;
		width: 14px;
		height: 12px;
		background: #fdbcb4;
		border-radius: 3px;
	}

	:global(.dark) .worker-head {
		background: #d4a090;
	}

	.worker-body {
		position: absolute;
		top: 21px;
		left: 3px;
		width: 18px;
		height: 15px;
		background: #4169e1;
		border-radius: 2px;
	}

	:global(.dark) .worker-body {
		background: #2a4a9a;
	}

	.worker-legs {
		position: absolute;
		top: 36px;
		left: 5px;
		width: 14px;
		height: 12px;
		background: #2f4f4f;
		border-radius: 0 0 3px 3px;
	}

	/* ── Picker's cart ── */

	.cart {
		position: absolute;
		bottom: 22%;
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
		bottom: 4px;
		left: 0;
		display: flex;
		/* Holds CART_CAPACITY (6): two across, three down. Narrow enough to sit
		   between the picker and staging without crowding either. */
		width: calc(var(--carton) * 2 + 10px);
		height: calc(var(--carton) * 3 + 8px);
		flex-wrap: wrap-reverse;
		align-content: flex-start;
		gap: 1px;
		overflow: hidden;
		padding: 1px;
		border: 1px solid var(--color-warm-600);
		border-top: none;
		background: var(--color-warm-100);
	}

	:global(.dark) .cart-basket {
		border-color: var(--color-warm-400);
		background: var(--color-warm-700);
	}

	.cart-handle {
		position: absolute;
		right: -3px;
		bottom: 4px;
		width: 4px;
		height: calc(var(--carton) * 3 + 11px);
		border-top: 1px solid var(--color-warm-600);
		border-right: 1px solid var(--color-warm-600);
	}

	:global(.dark) .cart-handle {
		border-color: var(--color-warm-400);
	}

	.cart-wheel {
		position: absolute;
		bottom: 0;
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: var(--color-warm-700);
	}

	:global(.dark) .cart-wheel {
		background: var(--color-warm-400);
	}

	.cw-1 {
		left: 3px;
	}

	.cw-2 {
		right: 5px;
	}

	.carried-box {
		position: absolute;
		top: 3px;
		right: calc(var(--carton) * -1 - 3px);
	}

	/* Above the picker's hard hat while they stand at an empty slot. */
	.puzzled {
		position: absolute;
		top: -14px;
		left: 50%;
		transform: translateX(-50%);
		font: 700 11px/1 var(--font-mono);
		color: var(--color-ember-800);
		background: #fff;
		border: 1px solid var(--color-ember-700);
		border-radius: 3px;
		padding: 1px 3px;
	}

	/* ── Outbound (right) ── */

	/* Staging area */
	.staging-area {
		position: absolute;
		bottom: 22%;
		left: 60%;
		/* Holds the 12 cartons it renders: four across, three down. */
		width: calc(var(--carton) * 4 + 15px);
		height: calc(var(--carton) * 3 + 12px);
		border: 1px dashed var(--color-warm-600);
		border-bottom: none;
		display: flex;
		flex-wrap: wrap-reverse;
		direction: rtl;
		align-content: flex-start;
		gap: 2px;
		padding: 3px;
		overflow: hidden;
	}

	:global(.dark) .staging-area {
		border-color: var(--color-warm-400);
	}

	.staging-label {
		position: absolute;
		bottom: calc(22% + 54px);
		left: 65%;
		transform: translateX(-50%);
		font-size: 8px;
		font-weight: 700;
		color: #5a3a1a;
		font-family: var(--font-mono);
		white-space: nowrap;
		z-index: 5;
	}

	:global(.dark) .staging-label {
		color: var(--color-warm-300);
	}

	/* A held order's goods stay loose in staging, outlined so they read as set aside. */
	.held-box {
		outline: 1px dashed var(--color-ember-700);
		outline-offset: 1px;
	}

	.hold-tag {
		position: absolute;
		top: -12px;
		right: 0;
		font: 700 7px/1 var(--font-mono);
		color: #fff;
		background: var(--color-ember-700);
		border-radius: 2px;
		padding: 2px 3px;
	}

	/* Packed — sealed with tape, ready for the truck */
	/* Goods keep one carton colour the whole way through the warehouse. What changes
	   is the tape: a plain box is loose, a taped box is sealed. So staged boxes are
	   plain, and packed and loaded boxes carry the same tape stripe. */
	.packed-box,
	.loaded-box {
		width: var(--carton);
		height: var(--carton);
		background: var(--color-ember-100);
		border: 1px solid var(--color-ember-500);
		border-radius: 1px;
		flex-shrink: 0;
		/* A fixed 2px band; a percentage of an 8px carton rounds to nothing. */
		background-image: linear-gradient(
			to bottom,
			transparent calc(50% - 1px),
			var(--color-ember-600) calc(50% - 1px),
			var(--color-ember-600) calc(50% + 1px),
			transparent calc(50% + 1px)
		);
	}

	/* On the base rule so the flash fades out as well as in. */
	.staging-area {
		transition:
			box-shadow 0.25s ease,
			border-color 0.25s ease;
	}

	.staging-area.pack-flash {
		border-color: var(--color-ember-600);
		box-shadow: 0 0 8px 1px var(--color-ember-400);
	}

	@media (prefers-reduced-motion: reduce) {
		.staging-area {
			transition: none;
		}
		.staging-area.pack-flash {
			box-shadow: none;
		}
	}

	/* Outbound dock */
	.outbound-dock {
		position: absolute;
		bottom: 22%;
		right: 5%;
		width: 3%;
		height: 8px;
		background: #8b7355;
		border: 1px solid #6b5335;
	}

	:global(.dark) .outbound-dock {
		background: #5a4328;
		border-color: #3a2318;
	}

	/* Outbound truck */
	.truck {
		position: absolute;
		bottom: 22%;
		right: 0%;
		width: 16%;
		height: 34%;
		transition: transform 1s ease-in-out;
	}

	.truck-parked {
		transform: translateX(0);
	}
	.truck-leaving {
		transform: translateX(160%);
	}
	.truck-arriving {
		transform: translateX(0);
		animation: truck-arrive 1s ease-out;
	}

	@keyframes truck-arrive {
		from {
			transform: translateX(160%);
		}
		to {
			transform: translateX(0);
		}
	}

	.truck-trailer {
		position: absolute;
		left: 0;
		bottom: 10px;
		width: 58%;
		height: 80%;
		background: #e8e8e8;
		border: 2px solid #b0b0b0;
		border-radius: 1px;
		display: flex;
		flex-wrap: wrap-reverse;
		direction: rtl;
		align-content: flex-start;
		gap: 2px;
		padding: 3px;
		overflow: hidden;
	}

	:global(.dark) .truck-trailer {
		background: #6a6a6a;
		border-color: #4a4a4a;
	}

	.truck-cab {
		position: absolute;
		right: 0;
		bottom: 10px;
		width: 36%;
		height: 45%;
		background: #c0392b;
		border: 2px solid #96281b;
		border-radius: 1px 4px 1px 1px;
	}

	:global(.dark) .truck-cab {
		background: #922316;
		border-color: #6c1a11;
	}

	.cab-window {
		position: absolute;
		top: 3px;
		right: 3px;
		width: 55%;
		height: 40%;
		background: #aed6f1;
		border: 1px solid #85c1e9;
		border-radius: 1px 3px 0 0;
	}

	:global(.dark) .cab-window {
		background: #5b8db8;
		border-color: #417a9b;
	}

	.cab-bumper {
		position: absolute;
		bottom: -2px;
		right: -2px;
		width: 30%;
		height: 4px;
		background: #7f8c8d;
		border-radius: 0 0 2px 0;
	}

	/* Shared wheel style */
	.truck-wheel {
		position: absolute;
		bottom: 2px;
		width: 10px;
		height: 10px;
		background: #2c3e50;
		border-radius: 50%;
		border: 2px solid #555;
	}

	.tw-1 {
		left: 6%;
	}
	.tw-2 {
		left: 18%;
	}
	.tw-3 {
		right: 14%;
	}
	.tw-4 {
		right: 3%;
	}

	@media (prefers-reduced-motion: reduce) {
		.worker,
		.replen-worker,
		.truck {
			transition-duration: 0.01s;
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
			height: 150px;
			--carton: 6px;
			--rack-left: 32%;
		}
		/* The scene is percentage-positioned but its contents are fixed px, so on a
		   narrow screen everything crowds. Spread the chain across the space that is
		   actually there: the rack clears the replen runner parked at 24%, and the
		   picker, cart and staging move out toward the truck at 84%. */
		.receiving-area {
			left: 19%;
		}
		.worker-idle,
		.worker-carrying-back {
			left: 55%;
		}
		.cart-at-pick {
			left: 62%;
		}
		.staging-area {
			left: 70%;
		}
		.staging-label {
			left: 75%;
		}
		.worker-at-staging {
			left: 72%;
		}
		.cart-at-staging {
			left: 73%;
		}
		.building-sign {
			font-size: 10px;
		}
		/*
			These two stay at 6px on purpose. The scene is aria-hidden decoration,
			and everything they label is also shown as 14px+ text in PickingPanel
			and OrderStatusBar. WAVE flags them as small text; that is accepted.
		*/
		.staging-label,
		.receiving-label {
			font-size: 6px;
		}
	}
</style>
