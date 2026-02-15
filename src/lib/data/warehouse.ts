// ── Types ──────────────────────────────────────────────────

export type OrderStatus = 'Open' | 'Released' | 'Picking' | 'Picked' | 'Partial Stage' | 'Staged' | 'Loaded' | 'Partial Ship' | 'Shipped';
export type PickStatus = 'Assigned' | 'Picked' | 'Staged' | 'Loaded' | 'Shipped' | 'Short';
export type ReplenStatus = 'Pending' | 'In Transit' | 'Complete';
export type GamePhase = 'pre-wave' | 'picking' | 'loading' | 'shipping' | 'victory';

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
	qtyAvailable: number;  // inbound/reserve stock (back of warehouse)
	qtyOnHand: number;     // forward pick location (what the picker goes to)
	qtyAllocated: number;  // allocated from on-hand for active picks
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

// ── Seed Data ──────────────────────────────────────────────

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
		{ orderId: 'ORD-001', lineNum: 1, sku: 'BBP-01', itemName: 'Baby Bottle Pop', qtyOrdered: 3, qtyPicked: 0, qtyShipped: 0 },
		{ orderId: 'ORD-001', lineNum: 2, sku: 'HMM-01', itemName: 'Hannah Montana Microphone', qtyOrdered: 2, qtyPicked: 0, qtyShipped: 0 },
		{ orderId: 'ORD-002', lineNum: 1, sku: 'STH-01', itemName: 'Stiletto Hammer', qtyOrdered: 4, qtyPicked: 0, qtyShipped: 0 },
		{ orderId: 'ORD-002', lineNum: 2, sku: 'MAYO-01', itemName: 'Mayonnaise', qtyOrdered: 2, qtyPicked: 0, qtyShipped: 0 },
		{ orderId: 'ORD-002', lineNum: 3, sku: 'RTV-01', itemName: 'Really Tiny Violin', qtyOrdered: 6, qtyPicked: 0, qtyShipped: 0 },
		{ orderId: 'ORD-003', lineNum: 1, sku: 'PEX-01', itemName: 'Photo of Your Ex', qtyOrdered: 5, qtyPicked: 0, qtyShipped: 0 },
		{ orderId: 'ORD-003', lineNum: 2, sku: 'BBP-01', itemName: 'Baby Bottle Pop', qtyOrdered: 2, qtyPicked: 0, qtyShipped: 0 },
		{ orderId: 'ORD-003', lineNum: 3, sku: 'HMM-01', itemName: 'Hannah Montana Microphone', qtyOrdered: 1, qtyPicked: 0, qtyShipped: 0 },
	];
}

export function createSeedInventory(): InventoryItem[] {
	return [
		{ sku: 'BBP-01', itemName: 'Baby Bottle Pop', location: 'A-01-01', qtyAvailable: 5, qtyOnHand: 10, qtyAllocated: 0 },
		{ sku: 'HMM-01', itemName: 'Hannah Montana Microphone', location: 'A-01-02', qtyAvailable: 4, qtyOnHand: 8, qtyAllocated: 0 },
		{ sku: 'STH-01', itemName: 'Stiletto Hammer', location: 'B-02-01', qtyAvailable: 3, qtyOnHand: 6, qtyAllocated: 0 },
		{ sku: 'MAYO-01', itemName: 'Mayonnaise', location: 'B-02-03', qtyAvailable: 2, qtyOnHand: 5, qtyAllocated: 0 },
		{ sku: 'RTV-01', itemName: 'Really Tiny Violin', location: 'C-03-01', qtyAvailable: 6, qtyOnHand: 12, qtyAllocated: 0 },
		{ sku: 'PEX-01', itemName: 'Photo of Your Ex', location: 'C-03-02', qtyAvailable: 3, qtyOnHand: 2, qtyAllocated: 0 },
	];
}

// ── Helper Functions ───────────────────────────────────────

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
 * Wave release: allocate inventory across all open orders and create picks.
 * Only creates Assigned picks for what can be allocated. Lines with zero
 * available inventory get no pick — unallocated demand is just unfulfilled.
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
 * Execute a pick: update inventory and order line quantities.
 */
export function executePick(
	pick: Pick,
	inventory: InventoryItem[],
	orderLines: OrderLine[]
): void {
	const inv = inventory.find((i) => i.sku === pick.sku);
	if (inv) {
		inv.qtyOnHand -= pick.qtyToPick;
		inv.qtyAllocated -= pick.qtyToPick;
	}

	const line = orderLines.find(
		(l) => l.orderId === pick.orderId && l.lineNum === pick.lineNum
	);
	if (line) {
		line.qtyPicked += pick.qtyToPick;
	}

	pick.status = 'Picked';
}

/**
 * Report a pick location as empty. The picker found less than qtyToPick at the location.
 *
 * - If some qty is on hand: partial pick (shrink pick to onHandQty, mark Picked, update inventory/line).
 * - If nothing on hand: convert entire pick to Short.
 * - Zeros out qtyOnHand (location is empty after this).
 * - Releases allocations and shorts all other Assigned picks for the same SKU.
 * - Returns pickedQty (what the picker grabbed) and whether replen is possible.
 */
export function reportEmpty(
	pick: Pick,
	inventory: InventoryItem[],
	picks: Pick[],
	orderLines: OrderLine[]
): { pickedQty: number; canReplen: boolean } {
	if (pick.status !== 'Assigned') return { pickedQty: 0, canReplen: false };

	const inv = inventory.find((i) => i.sku === pick.sku);
	const onHandQty = inv ? inv.qtyOnHand : 0;
	let pickedQty = 0;

	if (onHandQty > 0 && onHandQty < pick.qtyToPick) {
		// Partial pick — picker grabs what's there
		pickedQty = onHandQty;
		const remainder = pick.qtyToPick - onHandQty;

		// Shrink original pick to what was grabbed, mark as Picked
		pick.qtyToPick = pickedQty;
		pick.status = 'Picked';

		// Update inventory
		if (inv) {
			inv.qtyOnHand -= pickedQty;
			inv.qtyAllocated -= pickedQty;
		}

		// Update order line
		const line = orderLines.find(
			(l) => l.orderId === pick.orderId && l.lineNum === pick.lineNum
		);
		if (line) {
			line.qtyPicked += pickedQty;
		}

		// Create a Short pick for the remainder
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
		// Nothing on hand (or pick qty matches on hand but location is being reported empty)
		// Convert entire pick to Short
		if (inv) {
			inv.qtyAllocated -= pick.qtyToPick;
		}
		pick.status = 'Short';
		pick.source = 'report-empty';
	}

	// Zero out forward pick location
	if (inv) {
		inv.qtyOnHand = 0;
		inv.qtyAllocated = Math.max(0, inv.qtyAllocated);
	}

	// Short all OTHER assigned picks for the same SKU (location is empty for everyone)
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
 * Create a replenishment task for a short SKU.
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
 * Complete a replenishment: move qty from available (inbound) to on-hand (forward pick),
 * then convert short picks to assigned.
 */
export function completeReplen(
	replen: Replen,
	inventory: InventoryItem[],
	picks: Pick[]
): void {
	const inv = inventory.find((i) => i.sku === replen.sku);
	if (inv) {
		// Move from available (inbound) to on-hand (forward pick)
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
 * Check if an order line has unmet demand that could be fulfilled via replen.
 * Returns the replenishable qty (min of unmet demand and available inbound inventory).
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

	// Total already covered by existing picks (any status except Short)
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
 * Check if an order has any short picks remaining.
 */
export function hasShortPicks(orderId: string, picks: Pick[]): boolean {
	return picks.some((p) => p.orderId === orderId && p.status === 'Short');
}

/**
 * Get the total short quantity for a SKU across all short picks.
 */
export function getShortQtyForSku(sku: string, picks: Pick[]): number {
	return picks
		.filter((p) => p.sku === sku && p.status === 'Short')
		.reduce((sum, p) => sum + p.qtyToPick, 0);
}



/**
 * Check if any picks across all orders have a given status.
 */
export function anyPicksWithStatus(picks: Pick[], status: PickStatus): boolean {
	return picks.some((p) => p.status === status);
}

/**
 * Stage ALL picked items across all orders.
 */
export function stageAll(picks: Pick[]): void {
	for (const pick of picks) {
		if (pick.status === 'Picked') {
			pick.status = 'Staged';
		}
	}
}

/**
 * Load ALL staged items across all orders.
 */
export function loadAll(picks: Pick[]): void {
	for (const pick of picks) {
		if (pick.status === 'Staged') {
			pick.status = 'Loaded';
		}
	}
}

/**
 * Ship ALL loaded items across ALL orders.
 * Returns list of order IDs that were affected.
 */
export function shipAllLoaded(
	picks: Pick[],
	orderLines: OrderLine[],
	orders: Order[]
): string[] {
	const affectedOrderIds = new Set<string>();

	for (const pick of picks) {
		if (pick.status === 'Loaded') {
			pick.status = 'Shipped';
			affectedOrderIds.add(pick.orderId);

			const line = orderLines.find(
				(l) => l.orderId === pick.orderId && l.lineNum === pick.lineNum
			);
			if (line) {
				line.qtyShipped += pick.qtyToPick;
			}
		}
	}

	// Update order statuses via refreshOrderStatuses
	refreshOrderStatuses(orders, orderLines, picks);

	return [...affectedOrderIds];
}

/**
 * Refresh all order statuses based on their pick states.
 * Call this after any pick status change.
 */
export function refreshOrderStatuses(
	orders: Order[],
	orderLines: OrderLine[],
	picks: Pick[]
): void {
	for (const order of orders) {
		if (order.status === 'Open') continue;
		if (order.status === 'Shipped') continue;

		const orderPicks = picks.filter((p) => p.orderId === order.orderId);
		const lines = orderLines.filter((l) => l.orderId === order.orderId);
		const allLinesFullyShipped = lines.every((l) => l.qtyShipped >= l.qtyOrdered);

		if (allLinesFullyShipped) {
			order.status = 'Shipped';
			continue;
		}

		// Check if any lines have been shipped
		const anyShipped = lines.some((l) => l.qtyShipped > 0);
		if (anyShipped) {
			// If all picks are terminal (Shipped or Short), order is done — allow partial ship as "Shipped"
			const allPicksTerminal = orderPicks.length > 0 &&
				orderPicks.every((p) => p.status === 'Shipped' || p.status === 'Short');
			if (allPicksTerminal) {
				order.status = 'Shipped';
			} else {
				order.status = 'Partial Ship';
			}
			continue;
		}

		if (orderPicks.length === 0) {
			// Released but no picks yet
			order.status = 'Released';
			continue;
		}

		// If all picks are Short (everything shorted, nothing left to fulfill), order is done
		const allShort = orderPicks.every((p) => p.status === 'Short');
		if (allShort) {
			order.status = 'Shipped';
			continue;
		}

		// Determine highest status among picks
		const hasLoaded = orderPicks.some((p) => p.status === 'Loaded');
		const hasStaged = orderPicks.some((p) => p.status === 'Staged');
		const hasPicked = orderPicks.some((p) => p.status === 'Picked');
		const hasAssigned = orderPicks.some((p) => p.status === 'Assigned');
		const hasActiveWork = hasAssigned || hasPicked;

		if (hasLoaded) {
			order.status = 'Loaded';
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
 * Check if all orders are shipped.
 */
export function allOrdersShipped(orders: Order[]): boolean {
	return orders.every((o) => o.status === 'Shipped');
}

/**
 * Get per-order progress based on order lines (not picks).
 * Total = number of order lines. Each line's status is determined by its best pick.
 * Lines with no picks or only Short picks count as shorted.
 */
export function orderLineStatus(
	orderId: string,
	orderLines: OrderLine[],
	picks: Pick[]
): { picked: number; staged: number; loaded: number; shipped: number; shorted: number; total: number } {
	const lines = orderLines.filter((l) => l.orderId === orderId);
	const total = lines.length;
	let picked = 0, staged = 0, loaded = 0, shipped = 0, shorted = 0;

	for (const line of lines) {
		const linePicks = picks.filter(
			(p) => p.orderId === orderId && p.lineNum === line.lineNum
		);

		// A line is shorted if any of its picks are Short
		const hasShort = linePicks.some((p) => p.status === 'Short');
		if (hasShort) shorted++;

		if (linePicks.length === 0) continue;

		// Use the "best" (most advanced) pick status for this line
		const hasShipped = linePicks.some((p) => p.status === 'Shipped');
		const hasLoaded = linePicks.some((p) => p.status === 'Loaded');
		const hasStaged = linePicks.some((p) => p.status === 'Staged');
		const hasPicked = linePicks.some((p) => p.status === 'Picked');
		const allShort = linePicks.every((p) => p.status === 'Short');

		if (allShort) { /* only short picks — don't count as progressed */ }
		else if (hasShipped) { shipped++; loaded++; staged++; picked++; }
		else if (hasLoaded) { loaded++; staged++; picked++; }
		else if (hasStaged) { staged++; picked++; }
		else if (hasPicked) { picked++; }
	}

	return { picked, staged, loaded, shipped, shorted, total };
}
