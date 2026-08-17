<script lang="ts">
	import type { Order, OrderLine, Pick, InventoryItem, GamePhase } from '$lib/data/warehouse';
	import Card from '$lib/components/ui/Card.svelte';

	export interface PackQueueEntry {
		orderId: string;
		customer: string;
		complete: boolean;
		shortfall: { lineNum: number; sku: string; itemName: string; missingQty: number }[];
	}

	let {
		gamePhase,
		orders,
		orderLines,
		picks,
		inventory,
		cartPickIds,
		cartFull,
		replenNotice,
		packQueue,
		cartCapacity,
		onwave,
		onpick,
		onreportempty,
		onstagecart,
		onpackorder,
		onloadall,
		onshipall
	}: {
		gamePhase: GamePhase;
		orders: Order[];
		orderLines: OrderLine[];
		picks: Pick[];
		inventory: InventoryItem[];
		cartPickIds: string[];
		cartFull: boolean;
		replenNotice: { sku: string; itemName: string; qty: number } | null;
		packQueue: PackQueueEntry[];
		cartCapacity: number;
		onwave: () => void;
		onpick: (pickId: string) => void;
		onreportempty: (pickId: string) => void;
		onstagecart: () => void;
		onpackorder: (orderId: string, force?: boolean) => void;
		onloadall: () => void;
		onshipall: () => void;
	} = $props();

	// Which incomplete order the player is currently being asked to confirm shipping short.
	let confirmingShortPack = $state<string | null>(null);

	/*
		Phase changes replace this whole panel, which destroys the button the user
		just pressed and drops focus on <body> — SC 2.4.3. Moving focus to the new
		panel's heading fixes that and announces the new phase without needing a
		second live region to duplicate it.

		Deliberately conditional: focus only moves if it was already inside the panel
		or has been lost entirely. A phase can also flip on a replenishment timer with
		no user action, and yanking focus away from, say, the Close button would be
		its own defect.
	*/
	let panelRoot = $state<HTMLElement>();
	let settled = false;

	$effect(() => {
		const phase = gamePhase; // read, so the effect re-runs on every phase change
		if (!settled) {
			settled = true; // never steal focus on first mount
			return;
		}
		// VictoryScreen replaces this panel and focuses its own heading.
		if (phase === 'victory') return;
		const active = document.activeElement as HTMLElement | null;
		const wasInPanel = !!panelRoot && !!active && panelRoot.contains(active);
		const wasLost = !active || active === document.body;
		if (!wasInPanel && !wasLost) return;

		(panelRoot?.querySelector<HTMLElement>('h3') ?? panelRoot)?.focus();
	});

	const openCount = $derived(orders.filter((o) => o.status === 'Open').length);
	const totalLines = $derived(orderLines.length);

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

	// Counts
	const assignedCount = $derived(picks.filter((p) => p.status === 'Assigned').length);
	const pickedCount = $derived(
		picks.filter(
			(p) =>
				p.status === 'Picked' ||
				p.status === 'Staged' ||
				p.status === 'Loaded' ||
				p.status === 'Shipped'
		).length
	);
	const totalPicks = $derived(picks.filter((p) => p.status !== 'Short').length);
	const packedCount = $derived(picks.filter((p) => p.status === 'Packed').length);
	const loadedCount = $derived(picks.filter((p) => p.status === 'Loaded').length);

	// Can the current pick be confirmed? (location must have enough on hand)
	const locationHasEnough = $derived(
		currentPick
			? (() => {
					const inv = inventory.find((i) => i.sku === currentPick.sku);
					return inv ? inv.qtyOnHand >= currentPick.qtyToPick : false;
				})()
			: false
	);

	// Short/replen state
	const shortPicks = $derived(picks.filter((p) => p.status === 'Short'));
	const shortSkus = $derived([...new Set(shortPicks.map((p) => p.sku))]);
	const hasReplenishableShorts = $derived(
		shortPicks.some((p) => {
			if (p.source !== 'report-empty') return false;
			const inv = inventory.find((i) => i.sku === p.sku);
			return inv ? inv.qtyAvailable > 0 : false;
		})
	);

	// Are we waiting on replen? (replenishable shorts exist but no assigned picks to work on)
	const waitingOnReplen = $derived(
		hasReplenishableShorts && assignedCount === 0 && cartPickIds.length === 0
	);
</script>

<!--
	tabindex="-1" only so this can catch focus when a branch has no heading. No
	outline suppression here — that is the pattern this pass removed from thirteen
	other controls, and it would be no better on a fallback focus target.
-->
<div bind:this={panelRoot} tabindex="-1">
	<Card>
		<!-- ═══ PRE-WAVE ═══ -->
		{#if gamePhase === 'pre-wave'}
			<div class="p-4 py-6 text-center">
				<h3 tabindex="-1" class="text-warm-800 dark:text-warm-100 text-lg font-bold">
					Ready to start
				</h3>
				<p class="text-warm-600 dark:text-warm-300 mt-1 text-sm">
					{openCount} order{openCount !== 1 ? 's' : ''} waiting &middot; {totalLines} lines total
				</p>
				<button
					type="button"
					class="bg-action hover:bg-action-hover mt-4 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-colors"
					onclick={onwave}
					aria-label="Wave Orders — allocate inventory and create pick tasks"
				>
					Wave Orders
				</button>
				<p class="text-warm-500 dark:text-warm-400 mt-2 text-xs">
					Allocates inventory and creates pick tasks
				</p>
			</div>

			<!-- ═══ PICKING ═══ -->
		{:else if gamePhase === 'picking'}
			<!-- Cart bar (compact) -->
			<div
				class="border-warm-200 dark:border-warm-700 flex items-center justify-between border-b px-4 py-2"
			>
				<div class="flex items-center gap-2">
					<span
						class="text-warm-600 dark:text-warm-300 text-xs font-semibold tracking-wider uppercase"
						>Cart</span
					>
					<div class="flex gap-0.5">
						{#each { length: cartCapacity } as _, i (i)}
							<div
								class="h-3 w-3 rounded-sm {i < cartPickIds.length
									? 'bg-accent-400 dark:bg-accent-500'
									: 'bg-warm-200 dark:bg-warm-600'}"
							></div>
						{/each}
					</div>
					<span class="text-warm-600 dark:text-warm-300 font-mono text-xs"
						>{cartPickIds.length}/{cartCapacity}</span
					>
				</div>
				{#if cartPickIds.length > 0}
					<button
						type="button"
						class="bg-action-neutral hover:bg-action-neutral-hover rounded px-3 py-1 text-xs font-semibold text-white transition-colors"
						onclick={onstagecart}
						aria-label="Stage Cart — move picked items to staging area"
					>
						Stage Cart
					</button>
				{/if}
			</div>

			<div class="p-4">
				<!-- Replen scheduled notice -->
				{#if replenNotice}
					<div
						class="border-accent-300 bg-accent-50 dark:border-accent-600 dark:bg-accent-900 mb-4 rounded-lg border px-4 py-3"
					>
						<div class="flex items-center gap-2">
							<div class="bg-accent-500 h-2.5 w-2.5 animate-pulse rounded-full"></div>
							<p class="text-accent-700 dark:text-accent-200 text-sm font-semibold">
								Replenishment Scheduled
							</p>
						</div>
						<p class="text-accent-600 dark:text-accent-300 mt-1 text-xs">
							{replenNotice.qty}x {replenNotice.itemName} being moved to forward pick location
						</p>
					</div>
				{/if}

				<!-- Cart full banner -->
				{#if cartFull}
					<div class="bg-ember-50 dark:bg-ember-950 mb-4 rounded-lg px-4 py-3 text-center">
						<p class="text-ember-600 dark:text-ember-400 text-sm font-medium">
							Cart full — stage your cart before picking more
						</p>
						<button
							type="button"
							class="bg-action-neutral hover:bg-action-neutral-hover mt-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
							onclick={onstagecart}
						>
							Stage Cart ({cartPickIds.length} items)
						</button>
					</div>

					<!-- Current pick (handheld device view) -->
				{:else if currentPick && currentLine && currentOrder}
					<!-- Progress -->
					<div class="mb-3 text-center">
						<span class="text-warm-600 dark:text-warm-300 text-xs font-medium">
							Pick {pickedCount + 1} of {totalPicks +
								picks.filter((p) => p.status === 'Short').length}
						</span>
					</div>

					<!-- Pick card -->
					<div
						class="border-accent-300 bg-accent-50 dark:border-accent-500 dark:bg-accent-900 rounded-lg border-2 p-4"
					>
						<!-- Order info -->
						<div class="mb-3 flex items-center justify-between">
							<span class="text-accent-700 dark:text-accent-200 font-mono text-xs font-semibold"
								>{currentPick.orderId}</span
							>
							<span class="text-warm-600 dark:text-warm-200 text-xs">{currentOrder.customer}</span>
						</div>

						<!-- Item -->
						<div class="mb-4 text-center">
							<p class="text-warm-800 dark:text-warm-50 text-lg font-bold">
								{currentLine.itemName}
							</p>
							<p class="text-warm-600 dark:text-warm-200 mt-1 font-mono text-sm">
								{currentPick.sku}
							</p>
						</div>

						<!-- Location, ordered, pick qty -->
						<div class="mb-4 flex justify-center gap-6">
							<div class="text-center">
								<p
									class="text-warm-600 dark:text-accent-200 text-xs font-semibold tracking-wider uppercase"
								>
									Location
								</p>
								<p class="text-warm-800 dark:text-warm-50 mt-0.5 font-mono text-lg font-bold">
									{currentPick.fromLocation}
								</p>
							</div>
							<div class="text-center">
								<p
									class="text-warm-600 dark:text-accent-200 text-xs font-semibold tracking-wider uppercase"
								>
									Ordered
								</p>
								<p class="text-warm-800 dark:text-warm-50 mt-0.5 font-mono text-lg font-bold">
									{currentLine.qtyOrdered}
								</p>
							</div>
							<div class="text-center">
								<p
									class="text-warm-600 dark:text-accent-200 text-xs font-semibold tracking-wider uppercase"
								>
									Pick Qty
								</p>
								<p class="text-warm-800 dark:text-warm-50 mt-0.5 font-mono text-lg font-bold">
									{currentPick.qtyToPick}
								</p>
							</div>
						</div>

						<!-- Action buttons -->
						{#if !locationHasEnough}
							<p class="text-ember-500 dark:text-ember-400 mb-2 text-center text-xs font-medium">
								Location short — report empty to continue
							</p>
						{/if}
						<div class="flex gap-2">
							<button
								type="button"
								class="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition-colors {locationHasEnough
									? 'bg-action-go hover:bg-action-go-hover'
									: 'bg-warm-300 dark:bg-warm-600 cursor-not-allowed'}"
								onclick={() => onpick(currentPick.pickId)}
								disabled={!locationHasEnough}
								aria-label="Confirm Pick — {currentPick.qtyToPick} {currentLine.itemName} from {currentPick.fromLocation}"
							>
								Confirm Pick
							</button>
							<button
								type="button"
								class="bg-action-warn hover:bg-action-warn-hover flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition-colors"
								onclick={() => onreportempty(currentPick.pickId)}
								aria-label="Report Empty — location {currentPick.fromLocation} has no stock"
							>
								Report Empty
							</button>
						</div>
					</div>

					<!-- Waiting on replenishment -->
				{:else if waitingOnReplen}
					<div class="py-4 text-center">
						<h3 tabindex="-1" class="text-warm-800 dark:text-warm-100 text-base font-bold">
							Waiting for Replenishment
						</h3>
						<p class="text-warm-600 dark:text-warm-300 mt-1 text-sm">
							Inventory is being restocked for {shortSkus.length} item{shortSkus.length !== 1
								? 's'
								: ''}
						</p>
						<div class="mt-3 flex justify-center">
							<div
								class="bg-accent-50 dark:bg-accent-900 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
							>
								<div class="bg-accent-500 h-2 w-2 animate-pulse rounded-full"></div>
								<span class="text-accent-700 dark:text-accent-300 text-xs font-medium"
									>Replen in progress</span
								>
							</div>
						</div>
					</div>

					<!-- All picks done, stage to continue -->
				{:else if cartPickIds.length > 0}
					<div class="py-4 text-center">
						<p class="text-moss-700 dark:text-moss-300 text-sm font-medium">
							All items picked! Stage your cart to continue.
						</p>
						<button
							type="button"
							class="bg-action-neutral hover:bg-action-neutral-hover mt-3 rounded-lg px-6 py-2 text-sm font-semibold text-white transition-colors"
							onclick={onstagecart}
						>
							Stage Cart ({cartPickIds.length} items)
						</button>
					</div>
				{:else}
					<div class="py-4 text-center">
						<p class="text-moss-700 dark:text-moss-300 text-sm font-medium">
							All picks complete and staged!
						</p>
					</div>
				{/if}
			</div>

			<!-- ═══ PACKING ═══ -->
		{:else if gamePhase === 'packing'}
			<div class="border-warm-200 dark:border-warm-700 border-b px-4 py-3">
				<h3 tabindex="-1" class="text-warm-800 dark:text-warm-100 text-base font-bold">
					Pack Station
				</h3>
				<p class="text-warm-600 dark:text-warm-300 mt-0.5 text-xs">
					Nothing goes on the truck until it is packed. An order that is missing stock can wait for
					replenishment, or ship short.
				</p>
			</div>

			<div class="space-y-3 p-4">
				{#each packQueue as entry (entry.orderId)}
					{@const missingUnits = entry.shortfall.reduce((s, l) => s + l.missingQty, 0)}
					<div
						class="rounded-lg border-2 p-4 {entry.complete
							? 'border-moss-300 bg-moss-50 dark:border-moss-600 dark:bg-moss-900'
							: 'border-ember-300 bg-ember-50 dark:border-ember-600 dark:bg-ember-950'}"
					>
						<div class="mb-2 flex items-center justify-between">
							<span class="text-warm-700 dark:text-warm-200 font-mono text-xs font-semibold">
								{entry.orderId}
							</span>
							<span class="text-warm-600 dark:text-warm-300 text-xs">{entry.customer}</span>
						</div>

						{#if entry.complete}
							<p class="text-moss-700 dark:text-moss-200 mb-3 text-sm font-medium">
								All lines accounted for. Ready to pack.
							</p>
							<button
								type="button"
								class="bg-action-go hover:bg-action-go-hover w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-colors"
								onclick={() => onpackorder(entry.orderId)}
								aria-label="Pack Order — {entry.orderId} complete"
							>
								Pack Order
							</button>
						{:else}
							<p class="text-ember-700 dark:text-ember-300 mb-2 text-sm font-medium">
								Short {missingUnits} unit{missingUnits !== 1 ? 's' : ''} across
								{entry.shortfall.length} line{entry.shortfall.length !== 1 ? 's' : ''}
							</p>
							<ul class="mb-3 space-y-0.5">
								{#each entry.shortfall as line (line.lineNum)}
									<li class="text-ember-600 dark:text-ember-400 font-mono text-xs">
										{line.sku} &middot; {line.itemName} &minus;{line.missingQty}
									</li>
								{/each}
							</ul>

							{#if confirmingShortPack === entry.orderId}
								<p class="text-ember-700 dark:text-ember-300 mb-2 text-xs font-medium">
									This closes the order short. The missing units will not ship and cannot be
									recovered.
								</p>
								<div class="flex gap-2">
									<button
										type="button"
										class="bg-action-warn hover:bg-action-warn-hover flex-1 rounded-lg py-2 text-sm font-semibold text-white transition-colors"
										onclick={() => {
											onpackorder(entry.orderId, true);
											confirmingShortPack = null;
										}}
									>
										Confirm Ship Short
									</button>
									<button
										type="button"
										class="border-warm-300 text-warm-700 hover:bg-warm-100 dark:border-warm-600 dark:text-warm-200 dark:hover:bg-warm-700 flex-1 rounded-lg border py-2 text-sm font-semibold transition-colors"
										onclick={() => {
											confirmingShortPack = null;
										}}
									>
										Cancel
									</button>
								</div>
							{:else}
								<div class="flex gap-2">
									<button
										type="button"
										class="bg-warm-200 text-warm-500 dark:bg-warm-700 dark:text-warm-400 flex-1 cursor-not-allowed rounded-lg py-2 text-sm font-semibold"
										disabled
									>
										Waiting on Replen
									</button>
									<button
										type="button"
										class="bg-action-warn hover:bg-action-warn-hover flex-1 rounded-lg py-2 text-sm font-semibold text-white transition-colors"
										onclick={() => {
											confirmingShortPack = entry.orderId;
										}}
										aria-label="Pack Short — ship {entry.orderId} partial"
									>
										Pack Short
									</button>
								</div>
							{/if}
						{/if}
					</div>
				{/each}

				{#if packedCount > 0}
					<p class="text-warm-500 dark:text-warm-400 pt-1 text-center text-xs">
						{packedCount} item{packedCount !== 1 ? 's' : ''} packed and waiting for the truck
					</p>
				{/if}
			</div>

			<!-- ═══ LOADING ═══ -->
		{:else if gamePhase === 'loading'}
			<div class="p-4 py-6 text-center">
				<h3 tabindex="-1" class="text-warm-800 dark:text-warm-100 text-lg font-bold">
					Packing complete!
				</h3>
				<p class="text-warm-600 dark:text-warm-300 mt-1 text-sm">
					{packedCount} item{packedCount !== 1 ? 's' : ''} packed and ready to load
				</p>
				<button
					type="button"
					class="bg-action-ship hover:bg-action-ship-hover mt-4 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-colors"
					onclick={onloadall}
					aria-label="Load Truck — move packed items into outbound truck"
				>
					Load Truck
				</button>
				<p class="text-warm-500 dark:text-warm-400 mt-2 text-xs">
					Move all packed cartons into the outbound truck
				</p>
			</div>

			<!-- ═══ SHIPPING ═══ -->
		{:else if gamePhase === 'shipping'}
			<div class="p-4 py-6 text-center">
				<h3 tabindex="-1" class="text-warm-800 dark:text-warm-100 text-lg font-bold">
					Truck loaded!
				</h3>
				<p class="text-warm-600 dark:text-warm-300 mt-1 text-sm">
					{loadedCount} item{loadedCount !== 1 ? 's' : ''} ready to ship
				</p>
				<button
					type="button"
					class="bg-action-go hover:bg-action-go-hover mt-4 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-colors"
					onclick={onshipall}
					aria-label="Ship All Orders — send every loaded order"
				>
					Ship All Orders
				</button>
			</div>
		{/if}
	</Card>
</div>
