<script lang="ts">
	import {
		type Order,
		type OrderLine,
		type InventoryItem,
		type Pick,
		type Replen,
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
		allOrdersShipped,
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
	import VictoryScreen from './VictoryScreen.svelte';

	let { onclose }: { onclose: () => void } = $props();

	// Game state
	let orders = $state<Order[]>(createSeedOrders());
	let orderLines = $state<OrderLine[]>(createSeedOrderLines());
	let inventory = $state<InventoryItem[]>(createSeedInventory());
	let picks = $state<Pick[]>([]);
	let replens = $state<Replen[]>([]);

	// Cart state
	const CART_CAPACITY = 6;
	let cartPickIds = $state<string[]>([]);
	const cartFull = $derived(cartPickIds.length >= CART_CAPACITY);

	// Scene state
	let sceneAction = $state<SceneAction>({ type: 'idle' });
	let actionKey = $state(0);

	// Replen notification — shown to picker when a replen is scheduled after a partial pick
	let replenNotice = $state<{ sku: string; itemName: string; qty: number } | null>(null);

	// Derived
	// SKU lists rather than counts, so the scene can colour each carton by item.
	const cartSkus = $derived(cartPickIds.map((id) => picks.find((p) => p.pickId === id)?.sku ?? ''));
	const stagedSkus = $derived(picks.filter((p) => p.status === 'Staged').map((p) => p.sku));
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
		if (allOrdersShipped(orders)) return 'victory';
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
		if (anyPicksWithStatus(picks, 'Loaded')) return 'shipping';
		return 'picking';
	});

	function triggerScene(action: SceneAction) {
		actionKey++;
		sceneAction = { ...action };
	}

	function reset() {
		resetCounters();
		orders = createSeedOrders();
		orderLines = createSeedOrderLines();
		inventory = createSeedInventory();
		picks = [];
		replens = [];
		cartPickIds = [];
		replenNotice = null;
		sceneAction = { type: 'idle' };
	}

	function handleWave() {
		const newPicks = waveRelease(orders, orderLines, inventory);
		picks = [...picks, ...newPicks];
		orders = [...orders];
		orderLines = [...orderLines];
		inventory = [...inventory];
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

		// Check if this order line has unmet demand that can be replenished
		const demand = getReplenishableDemand(orderId, lineNum, orderLines, picks, inventory);
		if (demand) {
			// Find item name for the notice
			const demandInv = inventory.find((i) => i.sku === demand.sku);
			const itemName = demandInv?.itemName ?? demand.sku;

			// Show replen notice immediately
			replenNotice = { sku: demand.sku, itemName, qty: demand.replenQty };

			// Held until the pick animation has finished and the slot is visibly empty.
			setTimeout(() => {
				const replen = createReplen(demand.sku, demand.replenQty, demand.location);
				replens = [...replens, replen];

				triggerScene({ type: 'replen', sku: demand.sku });

				setTimeout(() => {
					replen.status = 'In Transit';
					replens = [...replens];
				}, 400);

				setTimeout(() => {
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

					replens = [...replens];
					inventory = [...inventory];
					orderLines = [...orderLines];

					refreshOrderStatuses(orders, orderLines, picks);
					orders = [...orders];

					// Clear replen notice
					replenNotice = null;
					// Matches the moment the runner sets the carton down in the slot.
				}, 1500);
			}, 2000);
		}
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

		if (canReplen) {
			const finalShortQty = getShortQtyForSku(pick.sku, picks);
			const inv = inventory.find((i) => i.sku === pick.sku);
			const location = inv?.location ?? 'A-01-01';
			const replenQty = inv ? Math.min(finalShortQty, inv.qtyAvailable) : finalShortQty;
			const replen = createReplen(pick.sku, replenQty, location);
			replens = [...replens, replen];

			// Beat first, so the slot is visibly empty before the runner sets off.
			setTimeout(() => {
				triggerScene({ type: 'replen', sku: pick.sku });

				setTimeout(() => {
					replen.status = 'In Transit';
					replens = [...replens];
				}, 400);

				setTimeout(() => {
					completeReplen(replen, inventory, picks);

					// Move newly re-assigned picks to end of array so they queue after current picks
					const reassigned = picks.filter((p) => p.sku === pick.sku && p.status === 'Assigned');
					const rest = picks.filter((p) => !(p.sku === pick.sku && p.status === 'Assigned'));
					picks = [...rest, ...reassigned];

					replens = [...replens];
					inventory = [...inventory];

					refreshOrderStatuses(orders, orderLines, picks);
					orders = [...orders];
					// Matches the moment the runner sets the carton down in the slot.
				}, 1500);
			}, 900);
		}

		refreshOrderStatuses(orders, orderLines, picks);
		orders = [...orders];
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
	}

	function handlePackOrder(orderId: string, force = false) {
		const result = packOrder(orderId, orderLines, picks, force);
		if (!result.packed) return;

		picks = [...picks];
		refreshOrderStatuses(orders, orderLines, picks);
		orders = [...orders];

		triggerScene({ type: 'pack' });
	}

	function handleLoadAll() {
		loadAll(picks);
		picks = [...picks];

		refreshOrderStatuses(orders, orderLines, picks);
		orders = [...orders];

		triggerScene({ type: 'load' });
	}

	function handleShipAll() {
		shipAllLoaded(picks, orderLines, orders);
		picks = [...picks];
		orderLines = [...orderLines];
		orders = [...orders];

		triggerScene({ type: 'ship' });
	}
</script>

<!-- Header -->
<div
	class="border-warm-200 dark:border-warm-700 flex shrink-0 items-center justify-between border-b px-4 py-3"
>
	<div class="flex items-center gap-3">
		<button
			type="button"
			class="text-warm-500 hover:bg-warm-200 hover:text-warm-700 dark:text-warm-400 dark:hover:bg-warm-700 dark:hover:text-warm-200 rounded-lg p-1.5 transition-colors md:hidden"
			onclick={onclose}
			aria-label="Close simulator"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				viewBox="0 0 20 20"
				fill="currentColor"
				aria-hidden="true"
			>
				<path
					fill-rule="evenodd"
					d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
					clip-rule="evenodd"
				/>
			</svg>
		</button>
		<h2 class="text-warm-800 dark:text-warm-100 text-sm font-bold sm:text-base">
			{WAREHOUSE_NAME}
		</h2>
	</div>
	<div class="flex items-center gap-2">
		<button
			type="button"
			class="text-warm-600 hover:bg-warm-200 dark:text-warm-400 dark:hover:bg-warm-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
			onclick={reset}
			aria-label="Reset warehouse simulation"
		>
			Reset
		</button>
		<button
			type="button"
			class="text-warm-500 hover:bg-warm-200 hover:text-warm-700 dark:text-warm-400 dark:hover:bg-warm-700 dark:hover:text-warm-200 hidden rounded-lg p-1.5 transition-colors md:block"
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
				aria-hidden="true"
			>
				<line x1="18" y1="6" x2="6" y2="18" />
				<line x1="6" y1="6" x2="18" y2="18" />
			</svg>
		</button>
	</div>
</div>

<!-- Scene -->
{#key actionKey}
	<WarehouseScene
		action={sceneAction}
		{cartSkus}
		{stagedSkus}
		{packedCount}
		{loadedCount}
		{inventory}
	/>
{/key}

<!-- Content -->
<!--
	min-h-0 is what actually lets this scroll. A flex child defaults to min-height:auto,
	so without it the panel refuses to shrink below its content and pushes the scene
	smaller instead of scrolling.
-->
<div class="min-h-0 flex-1 overflow-y-auto px-4 py-4">
	{#if gamePhase === 'victory'}
		<VictoryScreen onreset={reset} />
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
			{cartFull}
			{replenNotice}
			{packQueue}
			cartCapacity={CART_CAPACITY}
			onwave={handleWave}
			onpick={handlePick}
			onreportempty={handleReportEmpty}
			onstagecart={handleStageCart}
			onpackorder={handlePackOrder}
			onloadall={handleLoadAll}
			onshipall={handleShipAll}
		/>

		<!-- Collapsible inventory -->
		<details class="mt-4">
			<summary
				class="text-warm-500 hover:text-warm-700 dark:text-warm-400 dark:hover:text-warm-200 cursor-pointer text-sm font-medium"
			>
				View Inventory
			</summary>
			<div class="mt-2">
				<InventoryTable {inventory} />
			</div>
		</details>
	{/if}
</div>
