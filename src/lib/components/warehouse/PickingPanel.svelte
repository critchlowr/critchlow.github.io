<script lang="ts" module>
	/** An order at the pack station, and why it can or cannot ship complete. */
	export interface PackQueueEntry {
		orderId: string;
		customer: string;
		complete: boolean;
		shortfall: { lineNum: number; sku: string; itemName: string; missingQty: number }[];
	}
</script>

<script lang="ts">
	import {
		physicalOnHand,
		type Order,
		type OrderLine,
		type Pick,
		type InventoryItem,
		type GamePhase
	} from '$lib/data/warehouse';
	import Card from '$lib/components/ui/Card.svelte';

	interface Props {
		gamePhase: GamePhase;
		orders: Order[];
		orderLines: OrderLine[];
		picks: Pick[];
		inventory: InventoryItem[];
		cartPickIds: string[];
		staging: boolean;
		replenNotice: { sku: string; itemName: string; qty: number } | null;
		packQueue: PackQueueEntry[];
		cartCapacity: number;
		onwave: () => void;
		onpick: (pickId: string) => void;
		onreportempty: (pickId: string) => void;
		onpackready: () => void;
		onshipshort: (orderId: string) => void;
		onhold: (orderId: string) => void;
		onloadandship: () => void;
	}

	let {
		gamePhase,
		orders,
		orderLines,
		picks,
		inventory,
		cartPickIds,
		staging,
		replenNotice,
		packQueue,
		cartCapacity,
		onwave,
		onpick,
		onreportempty,
		onpackready,
		onshipshort,
		onhold,
		onloadandship
	}: Props = $props();

	/*
		Phase changes replace this whole panel, which destroys the button the user
		just pressed and drops focus on <body> (SC 2.4.3). Moving focus to the new
		panel's heading fixes that and announces the new phase.

		Only when focus was already in the panel or lost: a phase can also change on
		a replenishment timer, and pulling focus off the Close button would be its
		own defect.
	*/
	let panelRoot = $state<HTMLElement>();
	let settled = false;

	$effect(() => {
		const key = view; // read, so the effect re-runs whenever the panel's content swaps
		if (!settled) {
			settled = true; // never steal focus on first mount
			return;
		}
		// RunSummary replaces this panel and focuses its own heading.
		if (key.startsWith('victory')) return;
		const active = document.activeElement as HTMLElement | null;
		const wasLost = !active || active === document.body;
		const wasOnHeading = !!active && active.tagName === 'H3' && !!panelRoot?.contains(active);
		if (!wasLost && !wasOnHeading && !(active === panelRoot)) return;

		// The new view's heading if it has one; otherwise its first control (the pick
		// card, whose buttons carry the item and location in their names).
		const target =
			panelRoot?.querySelector<HTMLElement>('h3') ??
			panelRoot?.querySelector<HTMLElement>('button:not([disabled])') ??
			panelRoot;
		target?.focus();
	});

	const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

	const openCount = $derived(orders.filter((o) => o.status === 'Open').length);

	// The current pick: first Assigned pick in queue
	const currentPick = $derived(picks.find((p) => p.status === 'Assigned') ?? null);
	const currentLine = $derived(
		currentPick
			? orderLines.find(
					(l) => l.orderId === currentPick.orderId && l.lineNum === currentPick.lineNum
				)
			: null
	);
	const currentOrder = $derived(
		currentPick ? orders.find((o) => o.orderId === currentPick.orderId) : null
	);

	const pickedCount = $derived(
		picks.filter((p) => ['Picked', 'Staged', 'Packed', 'Loaded', 'Shipped'].includes(p.status))
			.length
	);
	const totalPicks = $derived(picks.length);
	const packedCount = $derived(picks.filter((p) => p.status === 'Packed').length);
	const heldCount = $derived(orders.filter((o) => o.status === 'Held').length);

	const locationHasEnough = $derived.by(() => {
		if (!currentPick) return false;
		const inv = inventory.find((i) => i.sku === currentPick.sku);
		return inv ? physicalOnHand(inv) >= currentPick.qtyToPick : false;
	});

	const readyOrders = $derived(packQueue.filter((e) => e.complete));
	const shortOrders = $derived(packQueue.filter((e) => !e.complete));

	/*
		Which view the panel is showing. Focus has to follow any swap, not just phase
		changes: staging and packing a group both remove the button that was pressed.
	*/
	const view = $derived(
		`${gamePhase}:${staging ? 'staging' : currentPick ? `pick-${locationHasEnough}` : 'wait'}:${readyOrders.length}:${shortOrders.length}`
	);

	const button =
		'rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed';
	// Primary actions use the site's brand colour; the rest use the semantic fills.
	const primary = `${button} bg-brand text-on-brand hover:bg-brand-strong`;
	const fill = `${button} text-white`;
	const heading = 'text-ink-strong text-lg font-bold';
	const note = 'text-ink-muted text-sm';
</script>

<!--
	tabindex="-1" only so this can catch focus when a branch has no heading.
-->
<div bind:this={panelRoot} tabindex="-1">
	<Card>
		{#if gamePhase === 'pre-wave'}
			<div class="p-4 py-6 text-center">
				<h3 tabindex="-1" class={heading}>Ready to start</h3>
				<p class="{note} mt-1">
					{plural(openCount, 'order')} waiting, {plural(orderLines.length, 'line')} in total.
				</p>
				<button type="button" class="{primary} mt-4" onclick={onwave}> Wave orders </button>
				<p class="text-ink-muted mt-2 text-xs">Allocates inventory and creates the pick list.</p>
			</div>
		{:else if gamePhase === 'picking'}
			<div class="border-edge flex items-center gap-2 border-b px-4 py-2">
				<span class="text-ink-muted text-xs font-semibold tracking-wider uppercase"> Cart </span>
				<div class="flex gap-0.5" aria-hidden="true">
					{#each { length: cartCapacity } as _, i (i)}
						<div
							class="h-3 w-3 rounded-sm {i < cartPickIds.length
								? 'bg-accent-400 dark:bg-accent-500'
								: 'bg-warm-200 dark:bg-warm-600'}"
						></div>
					{/each}
				</div>
				<span class="text-ink-muted font-mono text-xs">
					{cartPickIds.length}/{cartCapacity}
				</span>
				<span class="text-ink-muted ml-auto text-xs">
					Stages itself when full or when picking is done
				</span>
			</div>

			<div class="p-4">
				{#if replenNotice}
					<div
						class="border-accent-300 bg-accent-50 dark:border-accent-600 dark:bg-accent-900 mb-4 rounded-lg border px-4 py-3"
					>
						<p class="text-accent-800 dark:text-accent-200 text-sm font-semibold">
							Replenishment scheduled
						</p>
						<p class="text-accent-800 dark:text-accent-200 mt-1 text-xs">
							{replenNotice.qty}
							{replenNotice.itemName} moving from reserve to the pick location.
						</p>
					</div>
				{/if}

				{#if staging}
					<div class="py-4 text-center">
						<h3 tabindex="-1" class="text-ink-strong text-base font-bold">
							Taking the cart to staging
						</h3>
					</div>
				{:else if currentPick && currentLine && currentOrder}
					<p class="text-ink-muted mb-3 text-center text-xs font-medium">
						Pick {pickedCount + 1} of {totalPicks}
					</p>

					<div
						class="border-accent-300 bg-accent-50 dark:border-accent-500 dark:bg-accent-900 rounded-lg border-2 p-4"
					>
						<div class="mb-3 flex items-center justify-between">
							<span class="text-accent-700 dark:text-accent-200 font-mono text-xs font-semibold">
								{currentPick.orderId}
							</span>
							<span class="text-ink-muted text-xs">{currentOrder.customer}</span>
						</div>
						<div class="mb-4 text-center">
							<p class="text-ink-strong text-lg font-bold">
								{currentLine.itemName}
							</p>
							<p class="text-ink-muted mt-1 font-mono text-sm">
								{currentPick.sku}
							</p>
						</div>
						<dl class="mb-4 flex justify-center gap-6 text-center">
							{#each [['Location', currentPick.fromLocation], ['Ordered', currentLine.qtyOrdered], ['Pick qty', currentPick.qtyToPick]] as [label, value] (label)}
								<div>
									<dt
										class="text-ink-muted dark:text-accent-200 text-xs font-semibold tracking-wider uppercase"
									>
										{label}
									</dt>
									<dd class="text-ink-strong mt-0.5 font-mono text-lg font-bold">
										{value}
									</dd>
								</div>
							{/each}
						</dl>
						{#if !locationHasEnough}
							<p
								id="short-reason"
								class="text-ember-700 dark:text-ember-300 mb-2 text-center text-xs font-medium"
							>
								The location doesn't have enough. Report it empty to continue.
							</p>
						{/if}
						<div class="flex gap-2">
							<button
								type="button"
								class="{fill} bg-action-go hover:bg-action-go-hover disabled:bg-warm-300 dark:disabled:bg-warm-600 flex-1 px-0"
								onclick={() => onpick(currentPick.pickId)}
								disabled={!locationHasEnough}
								aria-label="Confirm pick: {currentPick.qtyToPick} {currentLine.itemName} from {currentPick.fromLocation}"
							>
								Confirm pick
							</button>
							<button
								type="button"
								class="{fill} bg-action-warn hover:bg-action-warn-hover flex-1 px-0"
								onclick={() => onreportempty(currentPick.pickId)}
								aria-label="Report empty: location {currentPick.fromLocation}"
								aria-describedby={locationHasEnough ? undefined : 'short-reason'}
							>
								Report empty
							</button>
						</div>
					</div>
				{:else}
					<div class="py-4 text-center">
						<h3 tabindex="-1" class="text-ink-strong text-base font-bold">
							Waiting for replenishment
						</h3>
						<p class="{note} mt-1">The runner is bringing stock from reserve.</p>
					</div>
				{/if}
			</div>
		{:else if gamePhase === 'packing'}
			<div class="border-edge border-b px-4 py-3">
				<h3 tabindex="-1" class="text-ink-strong text-base font-bold">Pack station</h3>
				<p class="text-ink-muted mt-0.5 text-xs">
					Orders with every line picked can be packed. A short order can be held until stock
					arrives, or shipped without the missing units.
				</p>
			</div>

			<div class="space-y-3 p-4">
				{#if readyOrders.length > 0}
					<div
						class="border-moss-300 bg-moss-50 dark:border-moss-600 dark:bg-moss-900 rounded-lg border-2 p-4"
					>
						<p class="text-moss-800 dark:text-moss-200 mb-2 text-sm font-medium">
							Complete and ready to pack:
						</p>
						<ul class="mb-3 space-y-0.5">
							{#each readyOrders as entry (entry.orderId)}
								<li class="text-ink-strong text-sm">
									<span class="font-mono text-xs font-semibold">{entry.orderId}</span>
									{entry.customer}
								</li>
							{/each}
						</ul>
						<button
							type="button"
							class="{fill} bg-action-go hover:bg-action-go-hover w-full"
							onclick={onpackready}
						>
							Pack {plural(readyOrders.length, 'order')}
						</button>
					</div>
				{/if}

				{#each shortOrders as entry (entry.orderId)}
					{@const missingUnits = entry.shortfall.reduce((s, l) => s + l.missingQty, 0)}
					<div
						class="border-ember-300 bg-ember-50 dark:border-ember-600 dark:bg-ember-950 rounded-lg border-2 p-4"
					>
						<div class="mb-2 flex items-center justify-between">
							<span class="text-ink-strong font-mono text-xs font-semibold">
								{entry.orderId}
							</span>
							<span class="text-ink-muted text-xs">{entry.customer}</span>
						</div>
						<p class="text-ember-800 dark:text-ember-200 text-sm font-medium">
							Short {plural(missingUnits, 'unit')}. Reserve can't cover it.
						</p>
						<ul class="mb-3">
							{#each entry.shortfall as line (line.lineNum)}
								<li class="text-ember-800 dark:text-ember-200 font-mono text-xs">
									{line.sku}
									{line.itemName}: {line.missingQty} missing
								</li>
							{/each}
						</ul>
						<div class="flex gap-2">
							<button
								type="button"
								class="{fill} bg-action-neutral hover:bg-action-neutral-hover flex-1 px-0"
								onclick={() => onhold(entry.orderId)}
								aria-describedby="hold-help-{entry.orderId}"
							>
								Hold order
							</button>
							<button
								type="button"
								class="{fill} bg-action-warn hover:bg-action-warn-hover flex-1 px-0"
								onclick={() => onshipshort(entry.orderId)}
								aria-describedby="short-help-{entry.orderId}"
							>
								Ship short
							</button>
						</div>
						<ul class="text-ink-strong mt-3 space-y-1 text-xs">
							<li id="hold-help-{entry.orderId}">
								Hold: the order stays in staging and ships complete when stock arrives.
							</li>
							<li id="short-help-{entry.orderId}">
								Ship short: the rest ships today. The missing units are backordered or canceled.
							</li>
						</ul>
					</div>
				{/each}
			</div>
		{:else if gamePhase === 'loading'}
			<div class="p-4 py-6 text-center">
				<h3 tabindex="-1" class={heading}>Ready to ship</h3>
				<p class="{note} mt-1">
					{plural(packedCount, 'carton')} packed.{heldCount > 0
						? ` ${plural(heldCount, 'held order')} ${heldCount === 1 ? 'stays' : 'stay'} in staging.`
						: ''}
				</p>
				<button
					type="button"
					class="{fill} bg-action-ship hover:bg-action-ship-hover mt-4"
					onclick={onloadandship}
				>
					Load truck and ship
				</button>
			</div>
		{/if}
	</Card>
</div>
