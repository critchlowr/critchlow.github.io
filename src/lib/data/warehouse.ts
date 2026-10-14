/**
 * The warehouse model behind the simulator: types, seed data, and the functions
 * that move orders through wave, pick, stage, pack, load and ship. Functions
 * mutate the arrays they are given; WarehouseGame passes in $state, so the UI
 * follows.
 */

// ── Types ──

export type OrderStatus =
	| 'Open'
	| 'Released'
	| 'Picking'
	| 'Picked'
	| 'Partial Stage'
	| 'Staged'
	| 'Packed'
	| 'Partial Pack'
	| 'Loaded'
	| 'Partial Ship'
	| 'Shipped'
	/** Kept back to ship complete once stock arrives, rather than shipped short. */
	| 'Held';
export type PickStatus =
	'Assigned' | 'Picked' | 'Staged' | 'Packed' | 'Loaded' | 'Shipped' | 'Short' | 'Held';
export type ReplenStatus = 'Pending' | 'In Transit' | 'Complete';
export type GamePhase = 'pre-wave' | 'picking' | 'packing' | 'loading' | 'victory';

export interface Order {
	orderId: string;
	customer: string;
	status: OrderStatus;
	createdAt: string;
}

export interface OrderLine {
	orderId: string;
	lineNum: number;
	sku: string;
	itemName: string;
	qtyOrdered: number;
	qtyPicked: number;
	qtyShipped: number;
}

export interface InventoryItem {
	sku: string;
	itemName: string;
	location: string;
	/** Reserve stock at the back of the warehouse, used to replenish. */
	qtyAvailable: number;
	/** Stock the system counts in the forward pick location. */
	qtyOnHand: number;
	/** On-hand units promised to open picks. */
	qtyAllocated: number;
	/** Units the system counts in the pick location that are not physically there. */
	qtyMissing?: number;
}

/** What is actually on the shelf, as opposed to what the system thinks. */
export function physicalOnHand(inv: InventoryItem): number {
	return Math.max(0, inv.qtyOnHand - (inv.qtyMissing ?? 0));
}

export interface Pick {
	pickId: string;
	orderId: string;
	lineNum: number;
	sku: string;
	fromLocation: string;
	qtyToPick: number;
	status: PickStatus;
	source?: 'report-empty';
}

export interface Replen {
	replenId: string;
	sku: string;
	toLocation: string;
	qty: number;
	status: ReplenStatus;
}

// ── Seed data ──

export const WAREHOUSE_NAME = 'Really Cool Big Warehouse';

export function createSeedOrders(): Order[] {
	return [
		{ orderId: 'ORD-001', customer: 'Little Baby', status: 'Open', createdAt: '2024-01-15' },
		{
			orderId: 'ORD-002',
			customer: 'Giraffe Incorporated',
			status: 'Open',
			createdAt: '2024-01-16'
		},
		{
			orderId: 'ORD-003',
			customer: 'Kind of Insignificant Solutions',
			status: 'Open',
			createdAt: '2024-01-17'
		}
	];
}

export function createSeedOrderLines(): OrderLine[] {
	return [
		{
			orderId: 'ORD-001',
			lineNum: 1,
			sku: 'BBP-01',
			itemName: 'Baby Bottle Pop',
			qtyOrdered: 3,
			qtyPicked: 0,
			qtyShipped: 0
		},
		{
			orderId: 'ORD-001',
			lineNum: 2,
			sku: 'HMM-01',
			itemName: 'Hannah Montana Microphone',
			qtyOrdered: 2,
			qtyPicked: 0,
			qtyShipped: 0
		},
		{
			orderId: 'ORD-002',
			lineNum: 1,
			sku: 'STH-01',
			itemName: 'Stiletto Hammer',
			qtyOrdered: 4,
			qtyPicked: 0,
			qtyShipped: 0
		},
		{
			orderId: 'ORD-002',
			lineNum: 2,
			sku: 'MAYO-01',
			itemName: 'Mayonnaise',
			qtyOrdered: 2,
			qtyPicked: 0,
			qtyShipped: 0
		},
		{
			orderId: 'ORD-002',
			lineNum: 3,
			sku: 'RTV-01',
			itemName: 'Really Tiny Violin',
			qtyOrdered: 6,
			qtyPicked: 0,
			qtyShipped: 0
		},
		{
			orderId: 'ORD-003',
			lineNum: 1,
			sku: 'PEX-01',
			itemName: 'Photo of Your Ex',
			qtyOrdered: 5,
			qtyPicked: 0,
			qtyShipped: 0
		},
		{
			orderId: 'ORD-003',
			lineNum: 2,
			sku: 'BBP-01',
			itemName: 'Baby Bottle Pop',
			qtyOrdered: 2,
			qtyPicked: 0,
			qtyShipped: 0
		},
		{
			orderId: 'ORD-003',
			lineNum: 3,
			sku: 'HMM-01',
			itemName: 'Hannah Montana Microphone',
			qtyOrdered: 1,
			qtyPicked: 0,
			qtyShipped: 0
		}
	];
}

export function createSeedInventory(): InventoryItem[] {
	return [
		{
			sku: 'BBP-01',
			itemName: 'Baby Bottle Pop',
			location: 'A-01-01',
			qtyAvailable: 5,
			qtyOnHand: 10,
			qtyAllocated: 0
		},
		{
			sku: 'HMM-01',
			itemName: 'Hannah Montana Microphone',
			location: 'A-01-02',
			qtyAvailable: 4,
			qtyOnHand: 8,
			qtyAllocated: 0
		},
		{
			sku: 'STH-01',
			itemName: 'Stiletto Hammer',
			location: 'B-02-01',
			qtyAvailable: 3,
			qtyOnHand: 6,
			qtyAllocated: 0
		},
		{
			sku: 'MAYO-01',
			itemName: 'Mayonnaise',
			location: 'B-02-03',
			qtyAvailable: 2,
			qtyOnHand: 5,
			qtyAllocated: 0,
			// The system counts 5 but the shelf is empty, so the picker finds an empty
			// location and has to report it. Count discrepancies like this are routine.
			qtyMissing: 5
		},
		{
			sku: 'RTV-01',
			itemName: 'Really Tiny Violin',
			location: 'C-03-01',
			qtyAvailable: 6,
			qtyOnHand: 12,
			qtyAllocated: 0
		},
		{
			sku: 'PEX-01',
			itemName: 'Photo of Your Ex',
			location: 'C-03-02',
			// Reserve is one unit under ORD-003's demand, so every run reaches the
			// pack station with one order short and a hold-or-ship decision to make.
			qtyAvailable: 2,
			qtyOnHand: 2,
			qtyAllocated: 0
		}
	];
}

// ── Model ──

let pickCounter = 0;
let replenCounter = 0;

export function resetCounters() {
	pickCounter = 0;
	replenCounter = 0;
}

export function nextPickId(): string {
	pickCounter++;
	return `PCK-${String(pickCounter).padStart(3, '0')}`;
}

function nextReplenId(): string {
	replenCounter++;
	return `RPL-${String(replenCounter).padStart(3, '0')}`;
}

/**
 * Releases a wave: allocates stock to every open order and creates picks for
 * what could be allocated. Demand with no stock gets no pick.
 */
export function waveRelease(
	orders: Order[],
	orderLines: OrderLine[],
	inventory: InventoryItem[]
): Pick[] {
	const newPicks: Pick[] = [];
	const openOrders = orders.filter((o) => o.status === 'Open');

	for (const order of openOrders) {
		const lines = orderLines.filter((l) => l.orderId === order.orderId);

		for (const line of lines) {
			const inv = inventory.find((i) => i.sku === line.sku);
			const location = inv?.location ?? '???';
			const needed = line.qtyOrdered - line.qtyPicked;

			if (needed <= 0) continue;

			const available = inv ? Math.max(0, inv.qtyOnHand - inv.qtyAllocated) : 0;
			const assignQty = Math.min(available, needed);

			if (assignQty > 0 && inv) {
				inv.qtyAllocated += assignQty;
				newPicks.push({
					pickId: nextPickId(),
					orderId: order.orderId,
					lineNum: line.lineNum,
					sku: line.sku,
					fromLocation: location,
					qtyToPick: assignQty,
					status: 'Assigned'
				});
			}
		}

		order.status = 'Released';
	}

	return newPicks;
}

/**
 * Confirms a pick: takes it from the shelf and credits the order line.
 */
export function executePick(pick: Pick, inventory: InventoryItem[], orderLines: OrderLine[]): void {
	const inv = inventory.find((i) => i.sku === pick.sku);
	if (inv) {
		inv.qtyOnHand -= pick.qtyToPick;
		inv.qtyAllocated -= pick.qtyToPick;
	}

	const line = orderLines.find((l) => l.orderId === pick.orderId && l.lineNum === pick.lineNum);
	if (line) {
		line.qtyPicked += pick.qtyToPick;
	}

	pick.status = 'Picked';
}

/**
 * Reports a pick location empty: the picker found less than the pick asked for.
 *
 * - Some stock there: the pick shrinks to what was taken, and the rest becomes a Short pick.
 * - Nothing there: the whole pick becomes Short.
 * - The location is zeroed, and every other open pick of the SKU shorts too.
 *
 * Returns how many units were taken, and whether reserve can replenish.
 */
export function reportEmpty(
	pick: Pick,
	inventory: InventoryItem[],
	picks: Pick[],
	orderLines: OrderLine[]
): { pickedQty: number; canReplen: boolean } {
	if (pick.status !== 'Assigned') return { pickedQty: 0, canReplen: false };

	const inv = inventory.find((i) => i.sku === pick.sku);
	const onHandQty = inv ? physicalOnHand(inv) : 0;
	let pickedQty = 0;

	if (onHandQty > 0 && onHandQty < pick.qtyToPick) {
		// Partial pick: the picker takes what is there.
		pickedQty = onHandQty;
		const remainder = pick.qtyToPick - onHandQty;

		pick.qtyToPick = pickedQty;
		pick.status = 'Picked';

		if (inv) {
			inv.qtyOnHand -= pickedQty;
			inv.qtyAllocated -= pickedQty;
		}

		const line = orderLines.find((l) => l.orderId === pick.orderId && l.lineNum === pick.lineNum);
		if (line) {
			line.qtyPicked += pickedQty;
		}

		// The remainder becomes a Short pick.
		picks.push({
			pickId: nextPickId(),
			orderId: pick.orderId,
			lineNum: pick.lineNum,
			sku: pick.sku,
			fromLocation: pick.fromLocation,
			qtyToPick: remainder,
			status: 'Short',
			source: 'report-empty'
		});
	} else {
		// Nothing usable on hand: the whole pick shorts.
		if (inv) {
			inv.qtyAllocated -= pick.qtyToPick;
		}
		pick.status = 'Short';
		pick.source = 'report-empty';
	}

	// Zero out forward pick location; the report doubles as a count.
	if (inv) {
		inv.qtyOnHand = 0;
		inv.qtyMissing = 0;
		inv.qtyAllocated = Math.max(0, inv.qtyAllocated);
	}

	// The location is empty for everyone, so every other open pick of this SKU shorts too.
	const otherAssigned = picks.filter(
		(p) => p.sku === pick.sku && p.status === 'Assigned' && p.pickId !== pick.pickId
	);
	for (const other of otherAssigned) {
		if (inv) inv.qtyAllocated -= other.qtyToPick;
		other.status = 'Short';
		other.source = 'report-empty';
	}
	if (inv) inv.qtyAllocated = Math.max(0, inv.qtyAllocated);

	const canReplen = inv ? inv.qtyAvailable > 0 : false;
	return { pickedQty, canReplen };
}

/**
 * Creates a replenishment task for a short SKU.
 */
export function createReplen(sku: string, qty: number, toLocation: string): Replen {
	return {
		replenId: nextReplenId(),
		sku,
		toLocation,
		qty,
		status: 'Pending'
	};
}

/**
 * Completes a replenishment: moves stock from reserve to the pick location, then
 * re-opens the short picks it covers.
 */
export function completeReplen(replen: Replen, inventory: InventoryItem[], picks: Pick[]): void {
	const inv = inventory.find((i) => i.sku === replen.sku);
	if (inv) {
		const moveQty = Math.min(replen.qty, inv.qtyAvailable);
		inv.qtyAvailable -= moveQty;
		inv.qtyOnHand += moveQty;
	}

	replen.status = 'Complete';

	let remaining = replen.qty;
	for (const pick of picks) {
		if (pick.sku === replen.sku && pick.status === 'Short' && remaining > 0) {
			if (pick.qtyToPick <= remaining) {
				pick.status = 'Assigned';
				if (inv) inv.qtyAllocated += pick.qtyToPick;
				remaining -= pick.qtyToPick;
			}
		}
	}
}

/**
 * Unmet demand on an order line that reserve stock can cover, or null if none.
 * `replenQty` is the smaller of the unmet demand and the reserve on hand.
 */
export function getReplenishableDemand(
	orderId: string,
	lineNum: number,
	orderLines: OrderLine[],
	picks: Pick[],
	inventory: InventoryItem[]
): { sku: string; unmetQty: number; replenQty: number; location: string } | null {
	const line = orderLines.find((l) => l.orderId === orderId && l.lineNum === lineNum);
	if (!line) return null;

	// Units already covered by picks that have not shorted, or already shipped.
	const activePicks = picks.filter(
		(p) => p.orderId === orderId && p.lineNum === lineNum && p.status !== 'Short'
	);
	const coveredQty = activePicks.reduce((sum, p) => sum + p.qtyToPick, 0) + line.qtyShipped;
	const unmetQty = line.qtyOrdered - coveredQty;

	if (unmetQty <= 0) return null;

	const inv = inventory.find((i) => i.sku === line.sku);
	if (!inv || inv.qtyAvailable <= 0) return null;

	const replenQty = Math.min(unmetQty, inv.qtyAvailable);
	return { sku: line.sku, unmetQty, replenQty, location: inv.location };
}

/**
 * Whether an order still has short picks.
 */
export function hasShortPicks(orderId: string, picks: Pick[]): boolean {
	return picks.some((p) => p.orderId === orderId && p.status === 'Short');
}

/**
 * Total short quantity for a SKU across all short picks.
 */
export function getShortQtyForSku(sku: string, picks: Pick[]): number {
	return picks
		.filter((p) => p.sku === sku && p.status === 'Short')
		.reduce((sum, p) => sum + p.qtyToPick, 0);
}

/**
 * Whether any pick has the given status.
 */
export function anyPicksWithStatus(picks: Pick[], status: PickStatus): boolean {
	return picks.some((p) => p.status === status);
}

/**
 * Stages every picked item, across all orders.
 */
export function stageAll(picks: Pick[]): void {
	for (const pick of picks) {
		if (pick.status === 'Picked') {
			pick.status = 'Staged';
		}
	}
}

/**
 * Orders that have staged picks waiting at the pack station.
 */
export function ordersAwaitingPack(orderIds: string[], picks: Pick[]): string[] {
	return orderIds.filter((id) => picks.some((p) => p.orderId === id && p.status === 'Staged'));
}

/**
 * Can this order be packed complete — is every ordered unit accounted for?
 * False when a line is still short, or when a line has unstaged work outstanding.
 */
export function canPackComplete(orderId: string, orderLines: OrderLine[], picks: Pick[]): boolean {
	if (hasShortPicks(orderId, picks)) return false;

	const lines = orderLines.filter((l) => l.orderId === orderId);
	return lines.every((line) => {
		const covered = picks
			.filter((p) => p.orderId === orderId && p.lineNum === line.lineNum && p.status !== 'Short')
			.reduce((sum, p) => sum + p.qtyToPick, 0);
		return covered + line.qtyShipped >= line.qtyOrdered;
	});
}

/**
 * How many units of an order are missing, and which lines they belong to.
 * Drives the shortfall warning on the pack station.
 */
export function getPackShortfall(
	orderId: string,
	orderLines: OrderLine[],
	picks: Pick[]
): { lineNum: number; sku: string; itemName: string; missingQty: number }[] {
	const lines = orderLines.filter((l) => l.orderId === orderId);
	const shortfall: { lineNum: number; sku: string; itemName: string; missingQty: number }[] = [];

	for (const line of lines) {
		const covered = picks
			.filter((p) => p.orderId === orderId && p.lineNum === line.lineNum && p.status !== 'Short')
			.reduce((sum, p) => sum + p.qtyToPick, 0);
		const missing = line.qtyOrdered - covered - line.qtyShipped;
		if (missing > 0) {
			shortfall.push({
				lineNum: line.lineNum,
				sku: line.sku,
				itemName: line.itemName,
				missingQty: missing
			});
		}
	}

	return shortfall;
}

/**
 * Pack one order. Packing is order-scoped: it asks whether the order is whole
 * enough to ship, which is where a short finally costs something.
 *
 * - Complete order: staged picks become Packed.
 * - Incomplete and force=false: refuses, so the player can wait for replen.
 * - Incomplete and force=true: packs what is there and the order ships partial.
 */
export function packOrder(
	orderId: string,
	orderLines: OrderLine[],
	picks: Pick[],
	force = false
): { packed: boolean; packedCount: number; shortfall: number } {
	const shortfall = getPackShortfall(orderId, orderLines, picks).reduce(
		(sum, s) => sum + s.missingQty,
		0
	);

	if (shortfall > 0 && !force) {
		return { packed: false, packedCount: 0, shortfall };
	}

	let packedCount = 0;
	for (const pick of picks) {
		if (pick.orderId === orderId && pick.status === 'Staged') {
			pick.status = 'Packed';
			packedCount++;
		}
	}

	return { packed: packedCount > 0, packedCount, shortfall };
}

/**
 * Hold a short order instead of shipping it partial. Its staged stock stays in
 * staging and the order waits for the next inbound to ship complete.
 */
export function holdOrder(orderId: string, orders: Order[], picks: Pick[]): void {
	for (const pick of picks) {
		if (pick.orderId === orderId && pick.status === 'Staged') pick.status = 'Held';
	}
	const order = orders.find((o) => o.orderId === orderId);
	if (order) order.status = 'Held';
}

/**
 * Loads every packed item, across all orders. Staged-but-unpacked stock stays put —
 * nothing goes on the truck until it has been packed.
 */
export function loadAll(picks: Pick[]): void {
	for (const pick of picks) {
		if (pick.status === 'Packed') {
			pick.status = 'Loaded';
		}
	}
}

/**
 * Ships every loaded item and updates order statuses.
 * Returns the IDs of the orders that shipped something.
 */
export function shipAllLoaded(picks: Pick[], orderLines: OrderLine[], orders: Order[]): string[] {
	const affectedOrderIds = new Set<string>();

	for (const pick of picks) {
		if (pick.status === 'Loaded') {
			pick.status = 'Shipped';
			affectedOrderIds.add(pick.orderId);

			const line = orderLines.find((l) => l.orderId === pick.orderId && l.lineNum === pick.lineNum);
			if (line) {
				line.qtyShipped += pick.qtyToPick;
			}
		}
	}

	refreshOrderStatuses(orders, orderLines, picks);

	return [...affectedOrderIds];
}

/**
 * Recomputes every order's status from its picks. Call after any pick changes.
 */
export function refreshOrderStatuses(
	orders: Order[],
	orderLines: OrderLine[],
	picks: Pick[]
): void {
	for (const order of orders) {
		if (order.status === 'Open') continue;
		if (order.status === 'Shipped') continue;
		if (order.status === 'Held') continue;

		const orderPicks = picks.filter((p) => p.orderId === order.orderId);
		const lines = orderLines.filter((l) => l.orderId === order.orderId);
		const allLinesFullyShipped = lines.every((l) => l.qtyShipped >= l.qtyOrdered);

		if (allLinesFullyShipped) {
			order.status = 'Shipped';
			continue;
		}

		const anyShipped = lines.some((l) => l.qtyShipped > 0);
		if (anyShipped) {
			// Every pick shipped or shorted: the order is done, even if partial.
			const allPicksTerminal =
				orderPicks.length > 0 &&
				orderPicks.every((p) => p.status === 'Shipped' || p.status === 'Short');
			if (allPicksTerminal) {
				order.status = 'Shipped';
			} else {
				order.status = 'Partial Ship';
			}
			continue;
		}

		if (orderPicks.length === 0) {
			order.status = 'Released';
			continue;
		}

		// Everything shorted and nothing left to fulfil: the order is done.
		const allShort = orderPicks.every((p) => p.status === 'Short');
		if (allShort) {
			order.status = 'Shipped';
			continue;
		}

		// Otherwise the order takes the furthest status among its picks.
		const hasLoaded = orderPicks.some((p) => p.status === 'Loaded');
		const hasPacked = orderPicks.some((p) => p.status === 'Packed');
		const hasStaged = orderPicks.some((p) => p.status === 'Staged');
		const hasPicked = orderPicks.some((p) => p.status === 'Picked');
		const hasAssigned = orderPicks.some((p) => p.status === 'Assigned');
		const hasShort = orderPicks.some((p) => p.status === 'Short');
		const hasActiveWork = hasAssigned || hasPicked;

		if (hasLoaded) {
			order.status = 'Loaded';
		} else if (hasPacked && hasShort) {
			// Packed short — the player chose to ship it incomplete.
			order.status = 'Partial Pack';
		} else if (hasPacked) {
			order.status = 'Packed';
		} else if (hasStaged && hasActiveWork) {
			order.status = 'Partial Stage';
		} else if (hasStaged) {
			order.status = 'Staged';
		} else if (hasPicked || hasAssigned) {
			order.status = 'Picking';
		} else {
			order.status = 'Released';
		}
	}
}

/**
 * The run is over once every order has either shipped or been held.
 */
export function allOrdersResolved(orders: Order[]): boolean {
	return orders.every((o) => o.status === 'Shipped' || o.status === 'Held');
}

/**
 * Per-order progress counted in lines, not picks. Each line counts at the
 * furthest step its picks have reached; a line with a Short pick also counts
 * as shorted.
 */
export function orderLineStatus(
	orderId: string,
	orderLines: OrderLine[],
	picks: Pick[]
): {
	picked: number;
	staged: number;
	packed: number;
	loaded: number;
	shipped: number;
	shorted: number;
	total: number;
} {
	const lines = orderLines.filter((l) => l.orderId === orderId);
	const total = lines.length;
	let picked = 0,
		staged = 0,
		packed = 0,
		loaded = 0,
		shipped = 0,
		shorted = 0;

	for (const line of lines) {
		const linePicks = picks.filter((p) => p.orderId === orderId && p.lineNum === line.lineNum);

		const hasShort = linePicks.some((p) => p.status === 'Short');
		if (hasShort) shorted++;

		if (linePicks.length === 0) continue;

		// Each line counts at the furthest step any of its picks has reached.
		const hasShipped = linePicks.some((p) => p.status === 'Shipped');
		const hasLoaded = linePicks.some((p) => p.status === 'Loaded');
		const hasPacked = linePicks.some((p) => p.status === 'Packed');
		const hasStaged = linePicks.some((p) => p.status === 'Staged');
		const hasPicked = linePicks.some((p) => p.status === 'Picked');
		const allShort = linePicks.every((p) => p.status === 'Short');

		if (allShort) {
			// Only short picks: the line has not progressed.
		} else if (hasShipped) {
			shipped++;
			loaded++;
			packed++;
			staged++;
			picked++;
		} else if (hasLoaded) {
			loaded++;
			packed++;
			staged++;
			picked++;
		} else if (hasPacked) {
			packed++;
			staged++;
			picked++;
		} else if (hasStaged) {
			staged++;
			picked++;
		} else if (hasPicked) {
			picked++;
		}
	}

	return { picked, staged, packed, loaded, shipped, shorted, total };
}
