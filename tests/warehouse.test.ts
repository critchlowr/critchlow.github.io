/**
 * Tests for the warehouse model behind the simulator. They run on Node's own test
 * runner with no extra packages: npm test.
 *
 * Each test builds a fresh copy of the seed data, so none depends on another.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	createSeedOrders,
	createSeedOrderLines,
	createSeedInventory,
	resetPickIds,
	nextPickId,
	waveRelease,
	executePick,
	reportEmpty,
	completeReplen,
	getReplenishableDemand,
	getShortQtyForSku,
	physicalOnHand,
	stageAll,
	getPackShortfall,
	canPackComplete,
	packOrder,
	holdOrder,
	loadAll,
	shipAllLoaded,
	refreshOrderStatuses,
	allOrdersResolved,
	orderLineStatus
} from '../src/lib/data/warehouse.ts';

/** A new run with its wave already released. */
function releasedRun() {
	resetPickIds();
	const orders = createSeedOrders();
	const orderLines = createSeedOrderLines();
	const inventory = createSeedInventory();
	const picks = waveRelease(orders, orderLines, inventory);
	return { orders, orderLines, inventory, picks };
}

const stock = (run: ReturnType<typeof releasedRun>, sku: string) =>
	run.inventory.find((i) => i.sku === sku)!;
const pickOf = (run: ReturnType<typeof releasedRun>, orderId: string, sku: string) =>
	run.picks.find((p) => p.orderId === orderId && p.sku === sku)!;
const order = (run: ReturnType<typeof releasedRun>, orderId: string) =>
	run.orders.find((o) => o.orderId === orderId)!;

/** Picks every assigned pick of one order and stages it. */
function pickAndStage(run: ReturnType<typeof releasedRun>, orderId: string) {
	for (const pick of run.picks) {
		if (pick.orderId === orderId && pick.status === 'Assigned') {
			executePick(pick, run.inventory, run.orderLines);
		}
	}
	stageAll(run.picks);
	refreshOrderStatuses(run.orders, run.orderLines, run.picks);
}

test('pick ids count up from PCK-001 and restart on reset', () => {
	resetPickIds();
	assert.equal(nextPickId(), 'PCK-001');
	assert.equal(nextPickId(), 'PCK-002');
	resetPickIds();
	assert.equal(nextPickId(), 'PCK-001');
});

test('a wave creates one pick per order line and releases every order', () => {
	const run = releasedRun();

	assert.equal(run.picks.length, 8);
	assert.ok(run.picks.every((p) => p.status === 'Assigned'));
	assert.ok(run.orders.every((o) => o.status === 'Released'));
});

test('a wave allocates only the stock that is on hand', () => {
	const run = releasedRun();

	// Order 1003 wants 5 kazoos; the pick location holds 2.
	assert.equal(pickOf(run, '1003', 'PKZ-01').qtyToPick, 2);
	assert.equal(stock(run, 'PKZ-01').qtyAllocated, 2);
	// Two orders share one item: 3 for order 1001 and 2 for order 1003.
	assert.equal(stock(run, 'BBP-01').qtyAllocated, 5);
});

test('a second wave creates nothing, because no order is still open', () => {
	const run = releasedRun();
	assert.deepEqual(waveRelease(run.orders, run.orderLines, run.inventory), []);
});

test('confirming a pick takes the stock and credits the order line', () => {
	const run = releasedRun();
	const pick = pickOf(run, '1001', 'BBP-01');

	executePick(pick, run.inventory, run.orderLines);

	assert.equal(pick.status, 'Picked');
	assert.equal(stock(run, 'BBP-01').qtyOnHand, 7);
	assert.equal(stock(run, 'BBP-01').qtyAllocated, 2);
	assert.equal(run.orderLines.find((l) => l.orderId === '1001' && l.lineNum === 1)!.qtyPicked, 3);
});

test('the mayonnaise location is counted at 5 but physically empty', () => {
	const run = releasedRun();
	assert.equal(stock(run, 'MAYO-01').qtyOnHand, 5);
	assert.equal(physicalOnHand(stock(run, 'MAYO-01')), 0);
});

test('reporting an empty location shorts the pick and zeroes the location', () => {
	const run = releasedRun();
	const pick = pickOf(run, '1002', 'MAYO-01');

	const result = reportEmpty(pick, run.inventory, run.picks, run.orderLines);

	assert.deepEqual(result, { pickedQty: 0, canReplen: true });
	assert.equal(pick.status, 'Short');
	assert.equal(pick.source, 'report-empty');
	assert.equal(getShortQtyForSku('MAYO-01', run.picks), 2);

	const mayo = stock(run, 'MAYO-01');
	assert.equal(mayo.qtyOnHand, 0);
	assert.equal(mayo.qtyMissing, 0);
	assert.equal(mayo.qtyAllocated, 0);
});

test('reporting a part-empty location takes what is there and shorts the rest', () => {
	const run = releasedRun();
	// One unit is physically on the shelf; the pick asks for two.
	stock(run, 'MAYO-01').qtyMissing = 4;
	const pick = pickOf(run, '1002', 'MAYO-01');

	const result = reportEmpty(pick, run.inventory, run.picks, run.orderLines);

	assert.equal(result.pickedQty, 1);
	assert.equal(pick.status, 'Picked');
	assert.equal(pick.qtyToPick, 1);

	const remainder = run.picks.at(-1)!;
	assert.equal(remainder.status, 'Short');
	assert.equal(remainder.qtyToPick, 1);
	assert.equal(remainder.sku, 'MAYO-01');
});

test('reporting empty shorts every other open pick of the same item', () => {
	const run = releasedRun();

	reportEmpty(pickOf(run, '1001', 'BBP-01'), run.inventory, run.picks, run.orderLines);

	assert.equal(pickOf(run, '1003', 'BBP-01').status, 'Short');
});

test('reporting empty does nothing to a pick that is already picked', () => {
	const run = releasedRun();
	const pick = pickOf(run, '1001', 'BBP-01');
	executePick(pick, run.inventory, run.orderLines);

	const result = reportEmpty(pick, run.inventory, run.picks, run.orderLines);

	assert.deepEqual(result, { pickedQty: 0, canReplen: false });
	assert.equal(pick.status, 'Picked');
	assert.equal(stock(run, 'BBP-01').qtyOnHand, 7);
});

test('replenishment moves reserve forward and re-opens the short pick', () => {
	const run = releasedRun();
	const pick = pickOf(run, '1002', 'MAYO-01');
	reportEmpty(pick, run.inventory, run.picks, run.orderLines);

	completeReplen('MAYO-01', 2, run.inventory, run.picks);

	const mayo = stock(run, 'MAYO-01');
	assert.equal(mayo.qtyAvailable, 0);
	assert.equal(mayo.qtyOnHand, 2);
	assert.equal(mayo.qtyAllocated, 2);
	assert.equal(pick.status, 'Assigned');
});

test('replenishment leaves a short pick alone when it cannot cover it', () => {
	const run = releasedRun();
	const pick = pickOf(run, '1002', 'MAYO-01');
	reportEmpty(pick, run.inventory, run.picks, run.orderLines);

	completeReplen('MAYO-01', 1, run.inventory, run.picks);

	assert.equal(pick.status, 'Short');
});

test('uncovered demand is replenishable up to what reserve holds', () => {
	const run = releasedRun();

	// Order 1003, line 1: 5 ordered, 2 on a pick, 3 uncovered, 2 in reserve.
	assert.deepEqual(getReplenishableDemand('1003', 1, run.orderLines, run.picks, run.inventory), {
		sku: 'PKZ-01',
		replenQty: 2,
		location: 'C-03-02'
	});
	// A fully covered line has nothing to replenish.
	assert.equal(getReplenishableDemand('1001', 1, run.orderLines, run.picks, run.inventory), null);
});

test('a complete order packs, loads and ships', () => {
	const run = releasedRun();
	pickAndStage(run, '1001');
	assert.equal(order(run, '1001').status, 'Staged');
	assert.equal(canPackComplete('1001', run.orderLines, run.picks), true);

	assert.equal(packOrder('1001', run.orderLines, run.picks), true);
	loadAll(run.picks);
	shipAllLoaded(run.picks, run.orderLines, run.orders);

	assert.equal(order(run, '1001').status, 'Shipped');
	assert.deepEqual(
		run.orderLines.filter((l) => l.orderId === '1001').map((l) => l.qtyShipped),
		[3, 2]
	);
});

test('a short order refuses to pack unless it is forced', () => {
	const run = releasedRun();
	pickAndStage(run, '1003');

	assert.deepEqual(getPackShortfall('1003', run.orderLines, run.picks), [
		{ lineNum: 1, sku: 'PKZ-01', itemName: 'Pocket Kazoo', missingQty: 3 }
	]);
	assert.equal(canPackComplete('1003', run.orderLines, run.picks), false);
	assert.equal(packOrder('1003', run.orderLines, run.picks), false);
	assert.equal(packOrder('1003', run.orderLines, run.picks, true), true);
});

test('a short order shipped short ends as Shipped with the shortfall unshipped', () => {
	const run = releasedRun();
	pickAndStage(run, '1003');
	packOrder('1003', run.orderLines, run.picks, true);
	loadAll(run.picks);
	shipAllLoaded(run.picks, run.orderLines, run.orders);

	assert.equal(order(run, '1003').status, 'Shipped');
	assert.equal(run.orderLines.find((l) => l.orderId === '1003' && l.lineNum === 1)!.qtyShipped, 2);
});

test('holding an order keeps its stock in staging and off the truck', () => {
	const run = releasedRun();
	pickAndStage(run, '1003');

	holdOrder('1003', run.orders, run.picks);
	loadAll(run.picks);
	shipAllLoaded(run.picks, run.orderLines, run.orders);

	assert.equal(order(run, '1003').status, 'Held');
	assert.ok(run.picks.filter((p) => p.orderId === '1003').every((p) => p.status === 'Held'));
});

test('an order with a staged pick and an open pick shows Partial Stage', () => {
	const run = releasedRun();
	executePick(pickOf(run, '1001', 'BBP-01'), run.inventory, run.orderLines);
	stageAll(run.picks);
	refreshOrderStatuses(run.orders, run.orderLines, run.picks);

	assert.equal(order(run, '1001').status, 'Partial Stage');
});

test('line progress counts each line at the furthest step it has reached', () => {
	const run = releasedRun();
	executePick(pickOf(run, '1001', 'BBP-01'), run.inventory, run.orderLines);
	stageAll(run.picks);
	executePick(pickOf(run, '1001', 'HMM-01'), run.inventory, run.orderLines);

	assert.deepEqual(orderLineStatus('1001', run.orderLines, run.picks), {
		picked: 2,
		staged: 1,
		packed: 0,
		loaded: 0,
		shipped: 0,
		shorted: 0,
		total: 2
	});
});

test('the run is over once every order has shipped or been held', () => {
	const run = releasedRun();
	reportEmpty(pickOf(run, '1002', 'MAYO-01'), run.inventory, run.picks, run.orderLines);
	completeReplen('MAYO-01', 2, run.inventory, run.picks);
	for (const id of ['1001', '1002', '1003']) pickAndStage(run, id);
	assert.equal(allOrdersResolved(run.orders), false);

	packOrder('1001', run.orderLines, run.picks);
	packOrder('1002', run.orderLines, run.picks);
	holdOrder('1003', run.orders, run.picks);
	loadAll(run.picks);
	shipAllLoaded(run.picks, run.orderLines, run.orders);

	assert.deepEqual(
		run.orders.map((o) => o.status),
		['Shipped', 'Shipped', 'Held']
	);
	assert.equal(allOrdersResolved(run.orders), true);
});
