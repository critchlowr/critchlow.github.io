<script lang="ts">
    import type { Order, OrderLine, Pick, InventoryItem, GamePhase } from '$lib/data/warehouse';

    let {
        gamePhase,
        orders,
        orderLines,
        picks,
        inventory,
        cartPickIds,
        cartFull,
        replenNotice,
        cartCapacity,
        onwave,
        onpick,
        onreportempty,
        onstagecart,
        onloadall,
        onshipall,
    }: {
        gamePhase: GamePhase;
        orders: Order[];
        orderLines: OrderLine[];
        picks: Pick[];
        inventory: InventoryItem[];
        cartPickIds: string[];
        cartFull: boolean;
        replenNotice: { sku: string; itemName: string; qty: number } | null;
        cartCapacity: number;
        onwave: () => void;
        onpick: (pickId: string) => void;
        onreportempty: (pickId: string) => void;
        onstagecart: () => void;
        onloadall: () => void;
        onshipall: () => void;
    } = $props();

    const openCount = $derived(orders.filter(o => o.status === 'Open').length);
    const totalLines = $derived(orderLines.length);

    // The current pick: first Assigned pick in queue
    const currentPick = $derived(picks.find(p => p.status === 'Assigned') ?? null);
    const currentLine = $derived(
        currentPick
            ? orderLines.find(l => l.orderId === currentPick.orderId && l.lineNum === currentPick.lineNum)
            : null
    );
    const currentOrder = $derived(
        currentPick
            ? orders.find(o => o.orderId === currentPick.orderId)
            : null
    );

    // Counts
    const assignedCount = $derived(picks.filter(p => p.status === 'Assigned').length);
    const pickedCount = $derived(picks.filter(p => p.status === 'Picked' || p.status === 'Staged' || p.status === 'Loaded' || p.status === 'Shipped').length);
    const totalPicks = $derived(picks.filter(p => p.status !== 'Short').length);
    const stagedCount = $derived(picks.filter(p => p.status === 'Staged').length);
    const loadedCount = $derived(picks.filter(p => p.status === 'Loaded').length);

    // Can the current pick be confirmed? (location must have enough on hand)
    const locationHasEnough = $derived(
        currentPick
            ? (() => {
                const inv = inventory.find(i => i.sku === currentPick.sku);
                return inv ? inv.qtyOnHand >= currentPick.qtyToPick : false;
            })()
            : false
    );

    // Short/replen state
    const shortPicks = $derived(picks.filter(p => p.status === 'Short'));
    const shortSkus = $derived(
        [...new Set(shortPicks.map(p => p.sku))]
    );
    const hasReplenishableShorts = $derived(
        shortPicks.some(p => {
            if (p.source !== 'report-empty') return false;
            const inv = inventory.find(i => i.sku === p.sku);
            return inv ? inv.qtyAvailable > 0 : false;
        })
    );

    // Are we waiting on replen? (replenishable shorts exist but no assigned picks to work on)
    const waitingOnReplen = $derived(hasReplenishableShorts && assignedCount === 0 && cartPickIds.length === 0);
</script>

<div class="rounded-xl border border-warm-200 bg-white dark:border-warm-700 dark:bg-warm-800">

    <!-- ═══ PRE-WAVE ═══ -->
    {#if gamePhase === 'pre-wave'}
        <div class="p-4 py-6 text-center">
            <h3 class="text-lg font-bold text-warm-800 dark:text-warm-100">Ready to start</h3>
            <p class="mt-1 text-sm text-warm-600 dark:text-warm-300">
                {openCount} order{openCount !== 1 ? 's' : ''} waiting &middot; {totalLines} lines total
            </p>
            <button
                type="button"
                class="mt-4 rounded-lg bg-accent-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 dark:bg-accent-600 dark:hover:bg-accent-500 dark:focus:ring-offset-warm-800"
                onclick={onwave}
            >
                Wave Orders
            </button>
            <p class="mt-2 text-xs text-warm-500 dark:text-warm-400">
                Allocates inventory and creates pick tasks
            </p>
        </div>

    <!-- ═══ PICKING ═══ -->
    {:else if gamePhase === 'picking'}
        <!-- Cart bar (compact) -->
        <div class="flex items-center justify-between border-b border-warm-200 px-4 py-2 dark:border-warm-700">
            <div class="flex items-center gap-2">
                <span class="text-xs font-semibold uppercase tracking-wider text-warm-600 dark:text-warm-300">Cart</span>
                <div class="flex gap-0.5">
                    {#each { length: cartCapacity } as _, i}
                        <div
                            class="h-3 w-3 rounded-sm {i < cartPickIds.length
                                ? 'bg-accent-400 dark:bg-accent-500'
                                : 'bg-warm-200 dark:bg-warm-600'}"
                        ></div>
                    {/each}
                </div>
                <span class="font-mono text-xs text-warm-600 dark:text-warm-300">{cartPickIds.length}/{cartCapacity}</span>
            </div>
            {#if cartPickIds.length > 0}
                <button
                    type="button"
                    class="rounded bg-blue-500 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-blue-600"
                    onclick={onstagecart}
                >
                    Stage Cart
                </button>
            {/if}
        </div>

        <div class="p-4">
            <!-- Replen scheduled notice -->
            {#if replenNotice}
                <div class="mb-4 rounded-lg border border-accent-300 bg-accent-50 px-4 py-3 dark:border-accent-600 dark:bg-accent-900">
                    <div class="flex items-center gap-2">
                        <div class="h-2.5 w-2.5 animate-pulse rounded-full bg-accent-500"></div>
                        <p class="text-sm font-semibold text-accent-700 dark:text-accent-200">Replenishment Scheduled</p>
                    </div>
                    <p class="mt-1 text-xs text-accent-600 dark:text-accent-300">
                        {replenNotice.qty}x {replenNotice.itemName} being moved to forward pick location
                    </p>
                </div>
            {/if}

            <!-- Cart full banner -->
            {#if cartFull}
                <div class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-center dark:bg-red-950">
                    <p class="text-sm font-medium text-red-600 dark:text-red-400">Cart full — stage your cart before picking more</p>
                    <button
                        type="button"
                        class="mt-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
                        onclick={onstagecart}
                    >
                        Stage Cart ({cartPickIds.length} items)
                    </button>
                </div>

            <!-- Current pick (handheld device view) -->
            {:else if currentPick && currentLine && currentOrder}
                <!-- Progress -->
                <div class="mb-3 text-center">
                    <span class="text-xs font-medium text-warm-600 dark:text-warm-300">
                        Pick {pickedCount + 1} of {totalPicks + picks.filter(p => p.status === 'Short').length}
                    </span>
                </div>

                <!-- Pick card -->
                <div class="rounded-lg border-2 border-accent-300 bg-accent-50 p-4 dark:border-accent-500 dark:bg-accent-900">
                    <!-- Order info -->
                    <div class="mb-3 flex items-center justify-between">
                        <span class="font-mono text-xs font-semibold text-accent-700 dark:text-accent-200">{currentPick.orderId}</span>
                        <span class="text-xs text-warm-600 dark:text-warm-200">{currentOrder.customer}</span>
                    </div>

                    <!-- Item -->
                    <div class="mb-4 text-center">
                        <p class="text-lg font-bold text-warm-800 dark:text-warm-50">{currentLine.itemName}</p>
                        <p class="mt-1 font-mono text-sm text-warm-600 dark:text-warm-200">{currentPick.sku}</p>
                    </div>

                    <!-- Location, ordered, pick qty -->
                    <div class="mb-4 flex justify-center gap-6">
                        <div class="text-center">
                            <p class="text-xs font-semibold uppercase tracking-wider text-warm-600 dark:text-accent-200">Location</p>
                            <p class="mt-0.5 font-mono text-lg font-bold text-warm-800 dark:text-warm-50">{currentPick.fromLocation}</p>
                        </div>
                        <div class="text-center">
                            <p class="text-xs font-semibold uppercase tracking-wider text-warm-600 dark:text-accent-200">Ordered</p>
                            <p class="mt-0.5 font-mono text-lg font-bold text-warm-800 dark:text-warm-50">{currentLine.qtyOrdered}</p>
                        </div>
                        <div class="text-center">
                            <p class="text-xs font-semibold uppercase tracking-wider text-warm-600 dark:text-accent-200">Pick Qty</p>
                            <p class="mt-0.5 font-mono text-lg font-bold text-warm-800 dark:text-warm-50">{currentPick.qtyToPick}</p>
                        </div>
                    </div>

                    <!-- Action buttons -->
                    {#if !locationHasEnough}
                        <p class="mb-2 text-center text-xs font-medium text-red-500 dark:text-red-400">
                            Location short — report empty to continue
                        </p>
                    {/if}
                    <div class="flex gap-2">
                        <button
                            type="button"
                            class="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 {locationHasEnough
                                ? 'bg-moss-500 hover:bg-moss-600 focus:ring-moss-400'
                                : 'cursor-not-allowed bg-warm-300 dark:bg-warm-600'}"
                            onclick={() => onpick(currentPick.pickId)}
                            disabled={!locationHasEnough}
                        >
                            Confirm Pick
                        </button>
                        <button
                            type="button"
                            class="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                            onclick={() => onreportempty(currentPick.pickId)}
                        >
                            Report Empty
                        </button>
                    </div>
                </div>

            <!-- Waiting on replenishment -->
            {:else if waitingOnReplen}
                <div class="py-4 text-center">
                    <h3 class="text-base font-bold text-warm-800 dark:text-warm-100">Waiting for Replenishment</h3>
                    <p class="mt-1 text-sm text-warm-600 dark:text-warm-300">
                        Inventory is being restocked for {shortSkus.length} item{shortSkus.length !== 1 ? 's' : ''}
                    </p>
                    <div class="mt-3 flex justify-center">
                        <div class="inline-flex items-center gap-2 rounded-full bg-accent-50 px-4 py-1.5 dark:bg-accent-900">
                            <div class="h-2 w-2 animate-pulse rounded-full bg-accent-500"></div>
                            <span class="text-xs font-medium text-accent-700 dark:text-accent-300">Replen in progress</span>
                        </div>
                    </div>
                </div>

            <!-- All picks done, stage to continue -->
            {:else if cartPickIds.length > 0}
                <div class="py-4 text-center">
                    <p class="text-sm font-medium text-moss-700 dark:text-moss-300">All items picked! Stage your cart to continue.</p>
                    <button
                        type="button"
                        class="mt-3 rounded-lg bg-blue-500 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
                        onclick={onstagecart}
                    >
                        Stage Cart ({cartPickIds.length} items)
                    </button>
                </div>

            {:else}
                <div class="py-4 text-center">
                    <p class="text-sm font-medium text-moss-700 dark:text-moss-300">All picks complete and staged!</p>
                </div>
            {/if}
        </div>

    <!-- ═══ LOADING ═══ -->
    {:else if gamePhase === 'loading'}
        <div class="p-4 py-6 text-center">
            <h3 class="text-lg font-bold text-warm-800 dark:text-warm-100">Picking complete!</h3>
            <p class="mt-1 text-sm text-warm-600 dark:text-warm-300">
                {stagedCount} item{stagedCount !== 1 ? 's' : ''} in the staging area
            </p>
            <button
                type="button"
                class="mt-4 rounded-lg bg-plum-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-plum-600 focus:outline-none focus:ring-2 focus:ring-plum-400 focus:ring-offset-2 dark:focus:ring-offset-warm-800"
                onclick={onloadall}
            >
                Load Truck
            </button>
            <p class="mt-2 text-xs text-warm-500 dark:text-warm-400">
                Move all staged items into the outbound truck
            </p>
        </div>

    <!-- ═══ SHIPPING ═══ -->
    {:else if gamePhase === 'shipping'}
        <div class="p-4 py-6 text-center">
            <h3 class="text-lg font-bold text-warm-800 dark:text-warm-100">Truck loaded!</h3>
            <p class="mt-1 text-sm text-warm-600 dark:text-warm-300">
                {loadedCount} item{loadedCount !== 1 ? 's' : ''} ready to ship
            </p>
            <button
                type="button"
                class="mt-4 rounded-lg bg-moss-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-moss-600 focus:outline-none focus:ring-2 focus:ring-moss-400 focus:ring-offset-2 dark:focus:ring-offset-warm-800"
                onclick={onshipall}
            >
                Ship All Orders
            </button>
        </div>
    {/if}
</div>
