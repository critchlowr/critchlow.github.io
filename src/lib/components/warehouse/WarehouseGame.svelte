<script lang="ts">
	import {
		type Order,
		type OrderLine,
		type InventoryItem,
		type Pick,
		type GamePhase,
		WAREHOUSE_NAME,
		createSeedOrders,
		createSeedOrderLines,
		createSeedInventory,
		resetCounters,
		waveRelease,
		executePick,
		reportEmpty,
		createReplen,
		completeReplen,
		stageAll,
		packOrder,
		canPackComplete,
		getPackShortfall,
		loadAll,
		shipAllLoaded,
		refreshOrderStatuses,
		allOrdersResolved,
		holdOrder,
		anyPicksWithStatus,
		getShortQtyForSku,
		getReplenishableDemand,
		nextPickId
	} from '$lib/data/warehouse';

	import WarehouseScene from './WarehouseScene.svelte';
	import type { SceneAction } from './WarehouseScene.svelte';
	import OrderStatusBar from './OrderStatusBar.svelte';
	import PickingPanel from './PickingPanel.svelte';
	import InventoryTable from './InventoryTable.svelte';
	import RunSummary from './RunSummary.svelte';
	import type { RunLog } from './RunSummary.svelte';

	let { onclose }: { onclose: () => void } = $props();

	// Game state
	let orders = $state<Order[]>(createSeedOrders());
	let orderLines = $state<OrderLine[]>(createSeedOrderLines());
	let inventory = $state<InventoryItem[]>(createSeedInventory());
	let picks = $state<Pick[]>([]);
	/*
		Replenishments scheduled but not yet on the shelf. A counter, not the Replen
		objects: those are mutated from timers after being stored in $state, and a
		$state proxy does not see changes made to the original object.
	*/
	let replensInFlight = $state(0);

	// Cart state
	const CART_CAPACITY = 6;
	let cartPickIds = $state<string[]>([]);
	const cartFull = $derived(cartPickIds.length >= CART_CAPACITY);
	// True between the last pick of a cart and the cart arriving at staging.
	let staging = $state(false);

	// What happened during the run, for the summary at the end.
	const emptyLog = (): RunLog => ({ emptyReports: [], replenishments: [], decisions: [] });
	let log = $state<RunLog>(emptyLog());

	/*
		Every delayed step goes through later(), tagged with the run it belongs to.
		Reset starts a new run, so a replenishment or staging timer from the old one
		lands as a no-op instead of changing the new shift's stock.
	*/
	let runId = 0;
	function later(fn: () => void, ms: number) {
		const run = runId;
		setTimeout(() => {
			if (run === runId) fn();
		}, ms);
	}

	// Matches the picker's walk back to the cart in WarehouseScene.
	const PICK_WALK_MS = 1800;

	// Scene state
	let sceneAction = $state<SceneAction>({ type: 'idle' });

	// Replen notification — shown to picker when a replen is scheduled after a partial pick
	let replenNotice = $state<{ sku: string; itemName: string; qty: number } | null>(null);

	/*
		Screen-reader narration. The live region lives here rather than in
		PickingPanel because a region has to be in the DOM before its text changes,
		and PickingPanel's branches are created and destroyed by {#if}.
	*/
	let announcement = $state('');
	let announceToggle = false;

	function announce(msg: string) {
		// Some screen readers suppress a repeat of identical text. A trailing
		// zero-width space alternates the string without changing what is read.
		announceToggle = !announceToggle;
		announcement = announceToggle ? msg + '​' : msg;
	}

	function itemNameFor(sku: string) {
		return inventory.find((i) => i.sku === sku)?.itemName ?? sku;
	}

	// Derived
	// SKU lists rather than counts, so the scene can colour each carton by item.
	const cartSkus = $derived(cartPickIds.map((id) => picks.find((p) => p.pickId === id)?.sku ?? ''));
	const stagedSkus = $derived(picks.filter((p) => p.status === 'Staged').map((p) => p.sku));
	const heldSkus = $derived(picks.filter((p) => p.status === 'Held').map((p) => p.sku));
	const packedCount = $derived(picks.filter((p) => p.status === 'Packed').length);
	const loadedCount = $derived(picks.filter((p) => p.status === 'Loaded').length);

	// Orders sitting at the pack station, with whether each can go out complete.
	const packQueue = $derived(
		orders
			.filter((o) => picks.some((p) => p.orderId === o.orderId && p.status === 'Staged'))
			.map((o) => ({
				orderId: o.orderId,
				customer: o.customer,
				complete: canPackComplete(o.orderId, orderLines, picks),
				shortfall: getPackShortfall(o.orderId, orderLines, picks)
			}))
	);

	const gamePhase = $derived.by<GamePhase>(() => {
		if (allOrdersResolved(orders)) return 'victory';
		if (picks.length === 0) return 'pre-wave';
		if (anyPicksWithStatus(picks, 'Assigned')) return 'picking';
		if (cartPickIds.length > 0) return 'picking';
		if (anyPicksWithStatus(picks, 'Picked')) return 'picking';
		// Only report-empty shorts block (they may have a replen in flight)
		const hasReplenInFlight = picks.some(
			(p) =>
				p.status === 'Short' &&
				p.source === 'report-empty' &&
				(() => {
					const inv = inventory.find((i) => i.sku === p.sku);
					return inv ? inv.qtyAvailable > 0 : false;
				})()
		);
		if (hasReplenInFlight) return 'picking';
		// Staged stock waits at the pack station before anything can load.
		if (anyPicksWithStatus(picks, 'Staged')) return 'packing';
		if (anyPicksWithStatus(picks, 'Packed')) return 'loading';
		return 'picking';
	});

	// A fresh object every time, so the scene's effect re-runs even for a repeat action.
	function triggerScene(action: SceneAction) {
		sceneAction = { ...action };
	}

	function reset() {
		runId++;
		resetCounters();
		orders = createSeedOrders();
		orderLines = createSeedOrderLines();
		inventory = createSeedInventory();
		picks = [];
		replensInFlight = 0;
		cartPickIds = [];
		staging = false;
		log = emptyLog();
		replenNotice = null;
		sceneAction = { type: 'idle' };
		announce('Simulation reset. Ready to release a new wave.');
	}

	function handleWave() {
		const newPicks = waveRelease(orders, orderLines, inventory);
		picks = [...picks, ...newPicks];
		orders = [...orders];
		orderLines = [...orderLines];
		inventory = [...inventory];

		announce(`Wave released. ${newPicks.length} pick tasks created.`);
	}

	function handlePick(pickId: string) {
		const pick = picks.find((p) => p.pickId === pickId);
		if (!pick || pick.status !== 'Assigned') return;

		// Captured before the item is added, so the scene can hold the cart at its
		// previous contents until the picker has walked the item back.
		const cartBefore = cartSkus.slice();
		const { orderId, lineNum } = pick;
		executePick(pick, inventory, orderLines);
		cartPickIds = [...cartPickIds, pickId];
		picks = [...picks];
		orderLines = [...orderLines];
		inventory = [...inventory];

		refreshOrderStatuses(orders, orderLines, picks);
		orders = [...orders];

		triggerScene({ type: 'pick', fromLocation: pick.fromLocation, sku: pick.sku, cartBefore });

		/*
			Built as one string and announced once at the end, rather than announced
			here and again inside the replenishment branch.

			Two announce() calls in the same synchronous block are not two
			announcements: the second replaces the live region's text content before
			the screen reader has read the first, so the pick result was silently
			dropped every time a replenishment fired — precisely the picks where the
			user most needs to hear what happened.
		*/
		let narration =
			`Picked ${pick.qtyToPick} ${itemNameFor(pick.sku)} from ${pick.fromLocation}. ` +
			`Cart ${cartPickIds.length} of ${CART_CAPACITY}.`;

		// Check if this order line has unmet demand that can be replenished
		const demand = getReplenishableDemand(orderId, lineNum, orderLines, picks, inventory);
		if (demand) {
			// Find item name for the notice
			const demandInv = inventory.find((i) => i.sku === demand.sku);
			const itemName = demandInv?.itemName ?? demand.sku;

			// Show replen notice immediately
			replenNotice = { sku: demand.sku, itemName, qty: demand.replenQty };
			replensInFlight++;
			narration += ` Replenishment scheduled: ${demand.replenQty} ${itemName} moving to ${demand.location}.`;

			// Held until the pick animation has finished and the slot is visibly empty.
			later(() => {
				const replen = createReplen(demand.sku, demand.replenQty, demand.location);
				log.replenishments.push({ itemName, qty: demand.replenQty, location: demand.location });

				triggerScene({ type: 'replen', sku: demand.sku });

				later(() => {
					completeReplen(replen, inventory, picks);

					// Create a new Assigned pick for the replenished qty
					const inv = inventory.find((i) => i.sku === demand.sku);
					const newPick: Pick = {
						pickId: nextPickId(),
						orderId,
						lineNum,
						sku: demand.sku,
						fromLocation: demand.location,
						qtyToPick: demand.replenQty,
						status: 'Assigned'
					};
					if (inv) inv.qtyAllocated += demand.replenQty;
					picks = [...picks, newPick];
					replensInFlight--;

					inventory = [...inventory];
					orderLines = [...orderLines];

					refreshOrderStatuses(orders, orderLines, picks);
					orders = [...orders];

					// Clear replen notice
					replenNotice = null;
					announce(
						`Replenishment complete. ${itemName} back at ${demand.location}. Pick re-issued.`
					);
					stageIfDone();
					// Matches the moment the runner sets the carton down in the slot.
				}, 1500);
			}, 2000);
		}

		announce(narration);
		stageIfDone();
	}

	/*
		Staging happens on its own: once the cart is full, or once there is nothing
		left to pick and no replenishment on the way. It used to be a button the
		player pressed after every few picks, which added clicks without adding a
		decision. Delayed so the picker finishes walking the last item back first.
	*/
	function stageIfDone() {
		if (staging || cartPickIds.length === 0) return;
		const nothingToPick = !anyPicksWithStatus(picks, 'Assigned');
		if (!cartFull && !(nothingToPick && replensInFlight === 0)) return;

		staging = true;
		later(() => {
			staging = false;
			handleStageCart();
		}, PICK_WALK_MS);
	}

	function handleReportEmpty(pickId: string) {
		const pick = picks.find((p) => p.pickId === pickId);
		if (!pick || pick.status !== 'Assigned') return;

		const { pickedQty, canReplen } = reportEmpty(pick, inventory, picks, orderLines);
		picks = [...picks];
		inventory = [...inventory];
		orderLines = [...orderLines];

		// If a partial pick happened, add to cart
		if (pickedQty > 0) {
			cartPickIds = [...cartPickIds, pick.pickId];
		}

		log.emptyReports.push({ location: pick.fromLocation, itemName: itemNameFor(pick.sku) });
		triggerScene({ type: 'short', sku: pick.sku });

		if (canReplen) {
			const finalShortQty = getShortQtyForSku(pick.sku, picks);
			const inv = inventory.find((i) => i.sku === pick.sku);
			const location = inv?.location ?? 'A-01-01';
			const replenQty = inv ? Math.min(finalShortQty, inv.qtyAvailable) : finalShortQty;
			const replen = createReplen(pick.sku, replenQty, location);
			replensInFlight++;
			log.replenishments.push({ itemName: itemNameFor(pick.sku), qty: replenQty, location });

			// Beat first, so the slot is visibly empty before the runner sets off.
			later(() => {
				triggerScene({ type: 'replen', sku: pick.sku });

				later(() => {
					completeReplen(replen, inventory, picks);

					// Move newly re-assigned picks to end of array so they queue after current picks
					const reassigned = picks.filter((p) => p.sku === pick.sku && p.status === 'Assigned');
					const rest = picks.filter((p) => !(p.sku === pick.sku && p.status === 'Assigned'));
					picks = [...rest, ...reassigned];
					replensInFlight--;

					inventory = [...inventory];

					refreshOrderStatuses(orders, orderLines, picks);
					orders = [...orders];
					stageIfDone();
					// Matches the moment the runner sets the carton down in the slot.
				}, 1500);
			}, 900);
		}

		announce(
			`Location ${pick.fromLocation} reported empty. ` +
				(pickedQty > 0 ? `${pickedQty} of ${pick.qtyToPick} picked. ` : 'Nothing picked. ') +
				(canReplen ? 'Replenishment scheduled.' : 'Line will ship short.')
		);

		refreshOrderStatuses(orders, orderLines, picks);
		orders = [...orders];
		stageIfDone();
	}

	function handleStageCart() {
		// Captured before the cart is emptied, so the scene can show the cart being
		// wheeled to staging with the items still in it.
		const carried = cartSkus.slice();

		stageAll(picks);
		cartPickIds = [];
		picks = [...picks];

		refreshOrderStatuses(orders, orderLines, picks);
		orders = [...orders];

		triggerScene({ type: 'stage', boxes: carried });
		announce(
			`Cart staged. ${carried.length} ${carried.length === 1 ? 'item' : 'items'} moved to staging.`
		);
	}

	// Packs every order that has all its lines. Short orders wait for a decision.
	function handlePackReady() {
		const ready = packQueue.filter((e) => e.complete).map((e) => e.orderId);
		for (const orderId of ready) packOrder(orderId, orderLines, picks);
		picks = [...picks];
		refreshOrderStatuses(orders, orderLines, picks);
		orders = [...orders];

		triggerScene({ type: 'pack' });
		announce(`Packed ${ready.join(', ')}.`);
	}

	function missingFor(orderId: string) {
		return getPackShortfall(orderId, orderLines, picks).map((s) => ({
			itemName: s.itemName,
			qty: s.missingQty
		}));
	}

	function customerOf(orderId: string) {
		return orders.find((o) => o.orderId === orderId)?.customer ?? orderId;
	}

	function handleShipShort(orderId: string) {
		const missing = missingFor(orderId);
		const result = packOrder(orderId, orderLines, picks, true);
		if (!result.packed) return;

		log.decisions.push({
			orderId,
			customer: customerOf(orderId),
			choice: 'shipped-short',
			missing
		});
		picks = [...picks];
		refreshOrderStatuses(orders, orderLines, picks);
		orders = [...orders];

		triggerScene({ type: 'pack' });
		announce(`${orderId} packed short.`);
	}

	function handleHold(orderId: string) {
		log.decisions.push({
			orderId,
			customer: customerOf(orderId),
			choice: 'held',
			missing: missingFor(orderId)
		});
		holdOrder(orderId, orders, picks);
		picks = [...picks];
		orders = [...orders];

		triggerScene({ type: 'hold' });
		announce(`${orderId} held in staging until stock arrives.`);
	}

	// Loading and shipping were two buttons with nothing to decide between them.
	function handleLoadAndShip() {
		loadAll(picks);
		const cartons = picks.filter((p) => p.status === 'Loaded').length;
		shipAllLoaded(picks, orderLines, orders);
		picks = [...picks];
		orderLines = [...orderLines];
		orders = [...orders];

		triggerScene({ type: 'ship' });
		announce(`Truck loaded with ${cartons} cartons and shipped.`);
	}
</script>

<!-- Outside every {#if}: a region inserted along with its first message is not reliably announced. -->
<p class="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>

<!--
	Header.

	`min-w-0 truncate` on the title and `shrink-0` on the controls are load-bearing,
	not tidying. A flex item defaults to min-width:auto and refuses to shrink below
	its content, so on a 320px screen the untruncated warehouse name pushed Reset
	past the panel's right edge — and the panel is overflow-hidden, so it was simply
	gone rather than merely cramped.
-->
<div
	class="border-warm-200 dark:border-warm-700 flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2"
>
	<h2
		id="wms-dialog-title"
		class="text-warm-800 dark:text-warm-100 min-w-0 truncate text-sm font-bold sm:text-base"
	>
		{WAREHOUSE_NAME}
	</h2>

	<!--
		Both controls now exist at every breakpoint, and both are 44px. Mobile used to
		get a back-arrow and no ✕ at all, while Reset was a borderless 12px label — so
		even when they were on screen, neither read as a control. 44px also clears
		SC 2.5.8's 24x24 floor with room to spare.
	-->
	<div class="flex shrink-0 items-center gap-1.5">
		<button
			type="button"
			class="border-warm-300 text-warm-700 hover:border-warm-500 hover:bg-warm-200 dark:border-warm-600 dark:text-warm-300 dark:hover:bg-warm-700 inline-flex h-11 items-center rounded-lg border px-3 text-xs font-semibold transition-colors"
			onclick={reset}
		>
			Reset
		</button>
		<button
			type="button"
			class="text-warm-700 hover:bg-warm-200 hover:text-warm-900 dark:text-warm-300 dark:hover:bg-warm-700 dark:hover:text-warm-100 inline-flex h-11 w-11 items-center justify-center rounded-lg transition-colors"
			onclick={onclose}
			aria-label="Close simulator"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				aria-hidden="true"
			>
				<line x1="18" y1="6" x2="6" y2="18" />
				<line x1="6" y1="6" x2="18" y2="18" />
			</svg>
		</button>
	</div>
</div>

<!-- Scene. Stays mounted for the whole run so overlapping trips can play out. -->
<WarehouseScene
	action={sceneAction}
	{cartSkus}
	{stagedSkus}
	{heldSkus}
	{packedCount}
	{loadedCount}
	{inventory}
/>

<!-- Content -->
<!--
	min-h-0 is what actually lets this scroll. A flex child defaults to min-height:auto,
	so without it the panel refuses to shrink below its content and pushes the scene
	smaller instead of scrolling.
-->
<div class="min-h-0 flex-1 overflow-y-auto px-4 py-4">
	{#if gamePhase === 'victory'}
		<RunSummary {orders} {orderLines} {picks} {log} onreset={reset} />
	{:else}
		<!-- Order status cards (always visible) -->
		<OrderStatusBar {orders} {orderLines} {picks} />

		<!-- Phase-driven action panel -->
		<PickingPanel
			{gamePhase}
			{orders}
			{orderLines}
			{picks}
			{inventory}
			{cartPickIds}
			{staging}
			{replenNotice}
			{packQueue}
			cartCapacity={CART_CAPACITY}
			onwave={handleWave}
			onpick={handlePick}
			onreportempty={handleReportEmpty}
			onpackready={handlePackReady}
			onshipshort={handleShipShort}
			onhold={handleHold}
			onloadandship={handleLoadAndShip}
		/>

		<!-- Collapsible inventory -->
		<details class="mt-4">
			<summary
				class="text-warm-700 hover:text-warm-900 dark:text-warm-300 dark:hover:text-warm-100 cursor-pointer text-sm font-medium"
			>
				View Inventory
			</summary>
			<div class="mt-2">
				<InventoryTable {inventory} />
			</div>
		</details>
	{/if}
</div>
