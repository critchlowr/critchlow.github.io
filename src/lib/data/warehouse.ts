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
export type GamePhase = 'pre-wave' | 'picking' | 'packing' | 'loading' | 'victory';

export interface Order {
	orderId: string;
	customer: string;
	status: OrderStatus;
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

export interface Pick {
	pickId: string;
	orderId: string;
	lineNum: number;
	sku: string;
	fromLocation: string;
	qtyToPick: number;
	status: PickStatus;
	/** Set on a Short pick that came from a location reported empty. */
	source?: 'report-empty';
}

/** Units of one order line that no pick covers. */
export interface Shortfall {
	lineNum: number;
	sku: string;
	itemName: string;
	missingQty: number;
}

// ── Seed data ──

export const WAREHOUSE_NAME = 'Really Cool Big Warehouse';

const ITEM_NAMES: Record<string, string> = {
	'BBP-01': 'Baby Bottle Pop',
	'HMM-01': 'Hannah Montana Microphone',
	'STH-01': 'Stiletto Hammer',
	'MAYO-01': 'Mayonnaise',
	'RTV-01': 'Really Tiny Violin',
	'PEX-01': 'Photo of Your Ex'
};

export function createSeedOrders(): Order[] {
	return [
		{ orderId: 'ORD-001', customer: 'Little Baby', status: 'Open' },
		{ orderId: 'ORD-002', customer: 'Giraffe Incorporated', status: 'Open' },
		{ orderId: 'ORD-003', customer: 'Kind of Insignificant Solutions', status: 'Open' }
	];
}

export function createSeedOrderLines(): OrderLine[] {
	const line = (orderId: string, lineNum: number, sku: string, qtyOrdered: number): OrderLine => ({
		orderId,
		lineNum,
		sku,
		itemName: ITEM_NAMES[sku],
		qtyOrdered,
		qtyPicked: 0,
		qtyShipped: 0
	});

	return [
		line('ORD-001', 1, 'BBP-01', 3),
		line('ORD-001', 2, 'HMM-01', 2),
		line('ORD-002', 1, 'STH-01', 4),
		line('ORD-002', 2, 'MAYO-01', 2),
		line('ORD-002', 3, 'RTV-01', 6),
		line('ORD-003', 1, 'PEX-01', 5),
		line('ORD-003', 2, 'BBP-01', 2),
		line('ORD-003', 3, 'HMM-01', 1)
	];
}

export function createSeedInventory(): InventoryItem[] {
	const stock = (
		sku: string,
		location: string,
		qtyAvailable: number,
		qtyOnHand: number,
		qtyMissing?: number
	): InventoryItem => ({
		sku,
		itemName: ITEM_NAMES[sku],
		location,
		qtyAvailable,
		qtyOnHand,
		qtyAllocated: 0,
		...(qtyMissing ? { qtyMissing } : {})
	});

	return [
		//    SKU        location   reserve  on hand  missing
		stock('BBP-01', 'A-01-01', 5, 10),
		stock('HMM-01', 'A-01-02', 4, 8),
		stock('STH-01', 'B-02-01', 3, 6),
		// The system counts 5 but the shelf is empty, so the picker finds an empty
		// location and has to report it. Count discrepancies like this are routine.
		stock('MAYO-01', 'B-02-03', 2, 5, 5),
		stock('RTV-01', 'C-03-01', 6, 12),
		// Reserve is one unit under ORD-003's demand, so every run reaches the
		// pack station with one order short and a hold-or-ship decision to make.
		stock('PEX-01', 'C-03-02', 2, 2)
	];
}

// ── Lookups ──

/** What is actually on the shelf, as opposed to what the system thinks. */
export function physicalOnHand(inv: InventoryItem): number {
	return Math.max(0, inv.qtyOnHand - (inv.qtyMissing ?? 0));
}

const stockOf = (sku: string, inventory: InventoryItem[]) => inventory.find((i) => i.sku === sku);

const linesOf = (orderId: string, orderLines: OrderLine[]) =>
	orderLines.filter((l) => l.orderId === orderId);

/** The order line a pick, or an (order, line number) pair, belongs to. */
const lineOf = (ref: { orderId: string; lineNum: number }, orderLines: OrderLine[]) =>
	orderLines.find((l) => l.orderId === ref.orderId && l.lineNum === ref.lineNum);

const picksOfLine = (line: OrderLine, picks: Pick[]) =>
	picks.filter((p) => p.orderId === line.orderId && p.lineNum === line.lineNum);

/** Units of a line no pick covers: ordered, less shipped, less every pick that has not shorted. */
function missingQty(line: OrderLine, picks: Pick[]): number {
	const covered = picksOfLine(line, picks)
		.filter((p) => p.status !== 'Short')
		.reduce((sum, p) => sum + p.qtyToPick, 0);
	return line.qtyOrdered - line.qtyShipped - covered;
}

/** Whether any pick has the given status. */
export function anyPicksWithStatus(picks: Pick[], status: PickStatus): boolean {
	return picks.some((p) => p.status === status);
}

/** Total short quantity for a SKU across all short picks. */
export function getShortQtyForSku(sku: string, picks: Pick[]): number {
	return picks
		.filter((p) => p.sku === sku && p.status === 'Short')
		.reduce((sum, p) => sum + p.qtyToPick, 0);
}

// ── Pick ids ──

let pickCounter = 0;

/** Restarts pick numbering at PCK-001, for a new run. */
export function resetPickIds() {
	pickCounter = 0;
}

export function nextPickId(): string {
	pickCounter++;
	return `PCK-${String(pickCounter).padStart(3, '0')}`;
}

// ── Wave and pick ──

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

	for (const order of orders.filter((o) => o.status === 'Open')) {
		for (const line of linesOf(order.orderId, orderLines)) {
			const inv = stockOf(line.sku, inventory);
			if (!inv) continue;

			const needed = line.qtyOrdered - line.qtyPicked;
			const unallocated = Math.max(0, inv.qtyOnHand - inv.qtyAllocated);
			const assignQty = Math.min(unallocated, needed);
			if (assignQty <= 0) continue;

			inv.qtyAllocated += assignQty;
			newPicks.push({
				pickId: nextPickId(),
				orderId: order.orderId,
				lineNum: line.lineNum,
				sku: line.sku,
				fromLocation: inv.location,
				qtyToPick: assignQty,
				status: 'Assigned'
			});
		}

		order.status = 'Released';
	}

	return newPicks;
}

/** Takes `qty` units of a pick off the shelf and credits its order line. */
function takeFromShelf(
	pick: Pick,
	qty: number,
	inventory: InventoryItem[],
	orderLines: OrderLine[]
) {
	const inv = stockOf(pick.sku, inventory);
	if (inv) {
		inv.qtyOnHand -= qty;
		inv.qtyAllocated -= qty;
	}

	const line = lineOf(pick, orderLines);
	if (line) line.qtyPicked += qty;

	pick.status = 'Picked';
}

/** Confirms a pick: takes it from the shelf and credits the order line. */
export function executePick(pick: Pick, inventory: InventoryItem[], orderLines: OrderLine[]): void {
	takeFromShelf(pick, pick.qtyToPick, inventory, orderLines);
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

	const inv = stockOf(pick.sku, inventory);
	const onShelf = inv ? physicalOnHand(inv) : 0;
	let pickedQty = 0;

	if (onShelf > 0 && onShelf < pick.qtyToPick) {
		// Partial pick: the picker takes what is there, and the remainder shorts.
		pickedQty = onShelf;
		const remainder = pick.qtyToPick - pickedQty;

		pick.qtyToPick = pickedQty;
		takeFromShelf(pick, pickedQty, inventory, orderLines);

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
		pick.status = 'Short';
		pick.source = 'report-empty';
	}

	// The location is empty for everyone, so every other open pick of this SKU shorts too.
	for (const other of picks) {
		if (other.sku === pick.sku && other.status === 'Assigned') {
			other.status = 'Short';
			other.source = 'report-empty';
		}
	}

	// The report doubles as a count: the location holds nothing, so nothing in it
	// is allocated either.
	if (inv) {
		inv.qtyOnHand = 0;
		inv.qtyMissing = 0;
		inv.qtyAllocated = 0;
	}

	return { pickedQty, canReplen: !!inv && inv.qtyAvailable > 0 };
}

// ── Replenishment ──

/**
 * Completes a replenishment: moves up to `qty` units of a SKU from reserve to
 * its pick location, then re-opens the short picks that stock covers.
 */
export function completeReplen(
	sku: string,
	qty: number,
	inventory: InventoryItem[],
	picks: Pick[]
): void {
	const inv = stockOf(sku, inventory);
	if (inv) {
		const moveQty = Math.min(qty, inv.qtyAvailable);
		inv.qtyAvailable -= moveQty;
		inv.qtyOnHand += moveQty;
	}

	let remaining = qty;
	for (const pick of picks) {
		if (pick.sku !== sku || pick.status !== 'Short' || pick.qtyToPick > remaining) continue;
		pick.status = 'Assigned';
		if (inv) inv.qtyAllocated += pick.qtyToPick;
		remaining -= pick.qtyToPick;
	}
}

/**
 * Demand on an order line that no pick covers but reserve stock can, or null if
 * there is none. `replenQty` is the smaller of that demand and the reserve.
 */
export function getReplenishableDemand(
	orderId: string,
	lineNum: number,
	orderLines: OrderLine[],
	picks: Pick[],
	inventory: InventoryItem[]
): { sku: string; replenQty: number; location: string } | null {
	const line = lineOf({ orderId, lineNum }, orderLines);
	if (!line) return null;

	const unmet = missingQty(line, picks);
	const inv = stockOf(line.sku, inventory);
	if (unmet <= 0 || !inv || inv.qtyAvailable <= 0) return null;

	return {
		sku: line.sku,
		replenQty: Math.min(unmet, inv.qtyAvailable),
		location: inv.location
	};
}

// ── Stage, pack, load, ship ──

/** Moves every pick with status `from` on to `to`, optionally for one order only. */
function advance(picks: Pick[], from: PickStatus, to: PickStatus, orderId?: string): number {
	let moved = 0;
	for (const pick of picks) {
		if (pick.status !== from || (orderId && pick.orderId !== orderId)) continue;
		pick.status = to;
		moved++;
	}
	return moved;
}

/** Stages every picked item, across all orders. */
export function stageAll(picks: Pick[]): void {
	advance(picks, 'Picked', 'Staged');
}

/**
 * How many units of an order are missing, and which lines they belong to.
 * Drives the shortfall warning on the pack station.
 */
export function getPackShortfall(
	orderId: string,
	orderLines: OrderLine[],
	picks: Pick[]
): Shortfall[] {
	return linesOf(orderId, orderLines)
		.map((line) => ({
			lineNum: line.lineNum,
			sku: line.sku,
			itemName: line.itemName,
			missingQty: missingQty(line, picks)
		}))
		.filter((s) => s.missingQty > 0);
}

/**
 * Can this order be packed complete — is every ordered unit accounted for?
 * False when a line is still short, or has demand no pick covers.
 */
export function canPackComplete(orderId: string, orderLines: OrderLine[], picks: Pick[]): boolean {
	const hasShort = picks.some((p) => p.orderId === orderId && p.status === 'Short');
	return !hasShort && getPackShortfall(orderId, orderLines, picks).length === 0;
}

/**
 * Packs one order. Packing is order-scoped: it asks whether the order is whole
 * enough to ship, which is where a short finally costs something.
 *
 * - Complete order: staged picks become Packed.
 * - Incomplete and force=false: refuses, so the player can wait for replen.
 * - Incomplete and force=true: packs what is there and the order ships partial.
 *
 * Returns whether anything was packed.
 */
export function packOrder(
	orderId: string,
	orderLines: OrderLine[],
	picks: Pick[],
	force = false
): boolean {
	const complete = getPackShortfall(orderId, orderLines, picks).length === 0;
	if (!complete && !force) return false;
	return advance(picks, 'Staged', 'Packed', orderId) > 0;
}

/**
 * Holds a short order instead of shipping it partial. Its staged stock stays in
 * staging and the order waits for the next inbound to ship complete.
 */
export function holdOrder(orderId: string, orders: Order[], picks: Pick[]): void {
	advance(picks, 'Staged', 'Held', orderId);
	const order = orders.find((o) => o.orderId === orderId);
	if (order) order.status = 'Held';
}

/**
 * Loads every packed item, across all orders. Staged-but-unpacked stock stays put —
 * nothing goes on the truck until it has been packed.
 */
export function loadAll(picks: Pick[]): void {
	advance(picks, 'Packed', 'Loaded');
}

/** Ships every loaded item, credits the order lines, and updates order statuses. */
export function shipAllLoaded(picks: Pick[], orderLines: OrderLine[], orders: Order[]): void {
	for (const pick of picks) {
		if (pick.status !== 'Loaded') continue;
		pick.status = 'Shipped';
		const line = lineOf(pick, orderLines);
		if (line) line.qtyShipped += pick.qtyToPick;
	}

	refreshOrderStatuses(orders, orderLines, picks);
}

// ── Order status ──

/** The status an in-flight order should show, worked out from its lines and picks. */
function statusFor(order: Order, orderLines: OrderLine[], picks: Pick[]): OrderStatus {
	const lines = linesOf(order.orderId, orderLines);
	const orderPicks = picks.filter((p) => p.orderId === order.orderId);
	const has = (status: PickStatus) => orderPicks.some((p) => p.status === status);

	if (lines.every((l) => l.qtyShipped >= l.qtyOrdered)) return 'Shipped';

	if (lines.some((l) => l.qtyShipped > 0)) {
		// Every pick shipped or shorted: the order is done, even if partial.
		const done = orderPicks.every((p) => p.status === 'Shipped' || p.status === 'Short');
		return done ? 'Shipped' : 'Partial Ship';
	}

	if (orderPicks.length === 0) return 'Released';

	// Everything shorted and nothing left to fulfil: the order is done.
	if (orderPicks.every((p) => p.status === 'Short')) return 'Shipped';

	// Otherwise the order takes the furthest status among its picks.
	const pickingStill = has('Assigned') || has('Picked');
	if (has('Loaded')) return 'Loaded';
	// Packed short: the player chose to ship it incomplete.
	if (has('Packed')) return has('Short') ? 'Partial Pack' : 'Packed';
	if (has('Staged')) return pickingStill ? 'Partial Stage' : 'Staged';
	return pickingStill ? 'Picking' : 'Released';
}

/**
 * Recomputes every in-flight order's status from its picks. Call after any pick
 * changes. Open, Shipped and Held orders are left as they are.
 */
export function refreshOrderStatuses(
	orders: Order[],
	orderLines: OrderLine[],
	picks: Pick[]
): void {
	for (const order of orders) {
		if (order.status === 'Open' || order.status === 'Shipped' || order.status === 'Held') continue;
		order.status = statusFor(order, orderLines, picks);
	}
}

/** The run is over once every order has either shipped or been held. */
export function allOrdersResolved(orders: Order[]): boolean {
	return orders.every((o) => o.status === 'Shipped' || o.status === 'Held');
}

/** The steps a line's picks move through, in order. */
const PROGRESS_STEPS = ['Picked', 'Staged', 'Packed', 'Loaded', 'Shipped'] as const;

/**
 * Per-order progress counted in lines, not picks. Each line counts at the
 * furthest step any of its picks has reached, and at every step before it; a
 * line with a Short pick also counts as shorted.
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
	const lines = linesOf(orderId, orderLines);
	// Lines that have reached each step, indexed like PROGRESS_STEPS.
	const reached = PROGRESS_STEPS.map(() => 0);
	let shorted = 0;

	for (const line of lines) {
		const statuses = picksOfLine(line, picks).map((p) => p.status);
		if (statuses.includes('Short')) shorted++;

		// -1 when no pick has been picked yet (all Assigned, Short or Held).
		const furthest = Math.max(
			-1,
			...statuses.map((s) => PROGRESS_STEPS.indexOf(s as (typeof PROGRESS_STEPS)[number]))
		);
		for (let step = 0; step <= furthest; step++) reached[step]++;
	}

	const [picked, staged, packed, loaded, shipped] = reached;
	return { picked, staged, packed, loaded, shipped, shorted, total: lines.length };
}
