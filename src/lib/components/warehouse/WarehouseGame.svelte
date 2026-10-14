<script lang="ts">
	import { onDestroy } from 'svelte';
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
	import WarehouseScene, { type SceneAction } from './WarehouseScene.svelte';
	import OrderStatusBar from './OrderStatusBar.svelte';
	import PickingPanel from './PickingPanel.svelte';
	import InventoryTable from './InventoryTable.svelte';
	import RunSummary, { type RunLog } from './RunSummary.svelte';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	const CART_CAPACITY = 6;
	/** How long the picker takes to walk an item back to the cart in the scene. */
	const PICK_WALK_MS = 1800;

	// ── Game state ──
	// $state is deeply reactive, so the model functions in warehouse.ts can
	// mutate these in place and the UI follows.

	let orders = $state<Order[]>(createSeedOrders());
	let orderLines = $state<OrderLine[]>(createSeedOrderLines());
	let inventory = $state<InventoryItem[]>(createSeedInventory());
	let picks = $state<Pick[]>([]);
	/** Replenishments scheduled but not yet on the shelf. */
	let replensInFlight = $state(0);
	let cartPickIds = $state<string[]>([]);
	/** True between the last pick of a cart and the cart arriving at staging. */
	let staging = $state(false);
	/** Shown to the picker while a replenishment is on its way. */
	let replenNotice = $state<{ sku: string; itemName: string; qty: number } | null>(null);
	let sceneAction = $state<SceneAction>({ type: 'idle' });

	const emptyLog = (): RunLog => ({ emptyReports: [], replenishments: [], decisions: [] });
	/** What happened during the run, for the shift summary. */
	let log = $state<RunLog>(emptyLog());

	// ── Derived ──

	const cartFull = $derived(cartPickIds.length >= CART_CAPACITY);
	// SKU lists rather than counts, so the scene can colour each carton by item.
	const cartSkus = $derived(cartPickIds.map((id) => picks.find((p) => p.pickId === id)?.sku ?? ''));
	const stagedSkus = $derived(picks.filter((p) => p.status === 'Staged').map((p) => p.sku));
	const heldSkus = $derived(picks.filter((p) => p.status === 'Held').map((p) => p.sku));
	const packedCount = $derived(picks.filter((p) => p.status === 'Packed').length);
	const loadedCount = $derived(picks.filter((p) => p.status === 'Loaded').length);

	/** Orders waiting at the pack station, and whether each can ship complete. */
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
		if (
			cartPickIds.length > 0 ||
			anyPicksWithStatus(picks, 'Assigned') ||
			anyPicksWithStatus(picks, 'Picked')
		) {
			return 'picking';
		}
		// A location reported empty may still be refilled from reserve.
		const awaitingReplen = picks.some(
			(p) => p.status === 'Short' && p.source === 'report-empty' && reserveOf(p.sku) > 0
		);
		if (awaitingReplen) return 'picking';
		if (anyPicksWithStatus(picks, 'Staged')) return 'packing';
		if (anyPicksWithStatus(picks, 'Packed')) return 'loading';
		return 'picking';
	});

	// ── Helpers ──

	function itemNameFor(sku: string) {
		return inventory.find((i) => i.sku === sku)?.itemName ?? sku;
	}

	function reserveOf(sku: string) {
		return inventory.find((i) => i.sku === sku)?.qtyAvailable ?? 0;
	}

	function customerOf(orderId: string) {
		return orders.find((o) => o.orderId === orderId)?.customer ?? orderId;
	}

	function missingFor(orderId: string) {
		return getPackShortfall(orderId, orderLines, picks).map((s) => ({
			itemName: s.itemName,
			qty: s.missingQty
		}));
	}

	// A new object every time, so the scene reacts even to a repeat of the same action.
	function triggerScene(action: SceneAction) {
		sceneAction = { ...action };
	}

	/*
		Delayed steps (walks, replenishments) all go through later(), so Reset and
		closing the dialog can cancel them. Otherwise a timer from the old run would
		change the new run's stock.
	*/
	let timers: ReturnType<typeof setTimeout>[] = [];

	function later(fn: () => void, ms: number) {
		timers.push(setTimeout(fn, ms));
	}

	function cancelTimers() {
		timers.forEach(clearTimeout);
		timers = [];
	}

	onDestroy(cancelTimers);

	// ── Screen-reader narration ──
	// The live region lives here, outside every {#if}, because a region must exist
	// before its text changes to be announced reliably.

	let announcement = $state('');
	let announceToggle = false;

	// Some screen readers skip a repeat of identical text. Alternating a trailing
	// zero-width space changes the string without changing what is read.
	function announce(message: string) {
		announceToggle = !announceToggle;
		announcement = announceToggle ? message + '​' : message;
	}

	// ── Actions ──

	function reset() {
		cancelTimers();
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
		announce(`Wave released. ${newPicks.length} pick tasks created.`);
	}

	function handlePick(pickId: string) {
		const pick = picks.find((p) => p.pickId === pickId);
		if (!pick || pick.status !== 'Assigned') return;

		// Before the item is added, so the scene can show the old cart until the
		// picker has walked the item back.
		const cartBefore = cartSkus.slice();
		const { orderId, lineNum } = pick;

		executePick(pick, inventory, orderLines);
		cartPickIds = [...cartPickIds, pickId];
		refreshOrderStatuses(orders, orderLines, picks);
		triggerScene({ type: 'pick', fromLocation: pick.fromLocation, sku: pick.sku, cartBefore });

		// One announcement per action. Two in the same tick would overwrite each
		// other before the screen reader read the first.
		let narration =
			`Picked ${pick.qtyToPick} ${itemNameFor(pick.sku)} from ${pick.fromLocation}. ` +
			`Cart ${cartPickIds.length} of ${CART_CAPACITY}.`;

		const demand = getReplenishableDemand(orderId, lineNum, orderLines, picks, inventory);
		if (demand) {
			const itemName = itemNameFor(demand.sku);
			replenNotice = { sku: demand.sku, itemName, qty: demand.replenQty };
			replensInFlight++;
			narration += ` Replenishment scheduled: ${demand.replenQty} ${itemName} moving to ${demand.location}.`;

			// Starts once the pick animation is done and the slot is visibly empty.
			later(() => {
				const replen = createReplen(demand.sku, demand.replenQty, demand.location);
				log.replenishments.push({ itemName, qty: demand.replenQty, location: demand.location });
				triggerScene({ type: 'replen', sku: demand.sku });

				// Lands when the runner sets the carton down in the scene.
				later(() => {
					completeReplen(replen, inventory, picks);

					const inv = inventory.find((i) => i.sku === demand.sku);
					if (inv) inv.qtyAllocated += demand.replenQty;
					picks.push({
						pickId: nextPickId(),
						orderId,
						lineNum,
						sku: demand.sku,
						fromLocation: demand.location,
						qtyToPick: demand.replenQty,
						status: 'Assigned'
					});
					replensInFlight--;
					refreshOrderStatuses(orders, orderLines, picks);

					replenNotice = null;
					announce(
						`Replenishment complete. ${itemName} back at ${demand.location}. Pick re-issued.`
					);
					stageIfDone();
				}, 1500);
			}, 2000);
		}

		announce(narration);
		stageIfDone();
	}

	/*
		Staging is automatic: once the cart is full, or once nothing is left to pick
		and no replenishment is on the way. Delayed so the picker finishes walking
		the last item back first.
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

		// A partial pick still goes in the cart.
		if (pickedQty > 0) cartPickIds = [...cartPickIds, pick.pickId];

		log.emptyReports.push({ location: pick.fromLocation, itemName: itemNameFor(pick.sku) });
		triggerScene({ type: 'short', sku: pick.sku });

		if (canReplen) {
			const inv = inventory.find((i) => i.sku === pick.sku);
			const location = inv?.location ?? 'A-01-01';
			const shortQty = getShortQtyForSku(pick.sku, picks);
			const replenQty = inv ? Math.min(shortQty, inv.qtyAvailable) : shortQty;
			const replen = createReplen(pick.sku, replenQty, location);
			replensInFlight++;
			log.replenishments.push({ itemName: itemNameFor(pick.sku), qty: replenQty, location });

			// A beat first, so the slot is visibly empty before the runner sets off.
			later(() => {
				triggerScene({ type: 'replen', sku: pick.sku });

				// Lands when the runner sets the carton down in the scene.
				later(() => {
					completeReplen(replen, inventory, picks);

					// Re-issued picks go to the back of the queue.
					const reissued = picks.filter((p) => p.sku === pick.sku && p.status === 'Assigned');
					const rest = picks.filter((p) => !(p.sku === pick.sku && p.status === 'Assigned'));
					picks = [...rest, ...reissued];
					replensInFlight--;
					refreshOrderStatuses(orders, orderLines, picks);
					stageIfDone();
				}, 1500);
			}, 900);
		}

		announce(
			`Location ${pick.fromLocation} reported empty. ` +
				(pickedQty > 0 ? `${pickedQty} of ${pick.qtyToPick} picked. ` : 'Nothing picked. ') +
				(canReplen ? 'Replenishment scheduled.' : 'Line will ship short.')
		);

		refreshOrderStatuses(orders, orderLines, picks);
		stageIfDone();
	}

	function handleStageCart() {
		// Before the cart is emptied, so the scene can wheel it over with items in it.
		const carried = cartSkus.slice();

		stageAll(picks);
		cartPickIds = [];
		refreshOrderStatuses(orders, orderLines, picks);

		triggerScene({ type: 'stage', boxes: carried });
		announce(
			`Cart staged. ${carried.length} ${carried.length === 1 ? 'item' : 'items'} moved to staging.`
		);
	}

	// Packs every order that has all its lines. Short orders wait for a decision.
	function handlePackReady() {
		const ready = packQueue.filter((e) => e.complete).map((e) => e.orderId);
		for (const orderId of ready) packOrder(orderId, orderLines, picks);
		refreshOrderStatuses(orders, orderLines, picks);

		triggerScene({ type: 'pack' });
		announce(`Packed ${ready.join(', ')}.`);
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
		refreshOrderStatuses(orders, orderLines, picks);

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

		triggerScene({ type: 'hold' });
		announce(`${orderId} held in staging until stock arrives.`);
	}

	function handleLoadAndShip() {
		loadAll(picks);
		const cartons = picks.filter((p) => p.status === 'Loaded').length;
		shipAllLoaded(picks, orderLines, orders);

		triggerScene({ type: 'ship' });
		announce(`Truck loaded with ${cartons} cartons and shipped.`);
	}
</script>

<p class="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>

<!--
	Header. `min-w-0 truncate` on the title and `shrink-0` on the controls keep
	Reset and Close on screen at 320px; without them the long name pushes them
	past the panel's clipped edge.
-->
<div class="border-edge flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2">
	<h2 id="wms-dialog-title" class="text-ink-strong min-w-0 truncate text-sm font-bold sm:text-base">
		{WAREHOUSE_NAME}
	</h2>

	<!-- Both controls are 44px, well above the SC 2.5.8 minimum of 24px. -->
	<div class="flex shrink-0 items-center gap-1.5">
		<button
			type="button"
			class="border-edge text-ink-muted hover:border-edge-hover hover:bg-band inline-flex h-11 items-center rounded-lg border px-3 text-xs font-semibold transition-colors"
			onclick={reset}
		>
			Reset
		</button>
		<button
			type="button"
			class="text-ink-muted hover:bg-band hover:text-ink-strong inline-flex h-11 w-11 items-center justify-center rounded-lg transition-colors"
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

<!-- Stays mounted for the whole run so overlapping trips can play out. -->
<WarehouseScene
	action={sceneAction}
	{cartSkus}
	{stagedSkus}
	{heldSkus}
	{packedCount}
	{loadedCount}
	{inventory}
/>

<!-- min-h-0 lets this flex child shrink and scroll instead of squeezing the scene. -->
<div class="min-h-0 flex-1 overflow-y-auto px-4 py-4">
	{#if gamePhase === 'victory'}
		<RunSummary {orders} {orderLines} {picks} {log} onreset={reset} />
	{:else}
		<OrderStatusBar {orders} {orderLines} {picks} />

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

		<details class="mt-4">
			<summary class="text-ink-muted hover:text-ink-strong cursor-pointer text-sm font-medium">
				View Inventory
			</summary>
			<div class="mt-2">
				<InventoryTable {inventory} />
			</div>
		</details>
	{/if}
</div>
