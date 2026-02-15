<script lang="ts">
    import type { InventoryItem } from '$lib/data/warehouse';

    export type SceneAction =
        | { type: 'idle' }
        | { type: 'pick'; fromLocation: string }
        | { type: 'stage' }
        | { type: 'load' }
        | { type: 'ship' }
        | { type: 'replen' };

    let { action = { type: 'idle' } as SceneAction, stagedCount = 0, loadedCount = 0, inventory = [] as InventoryItem[] }: { action: SceneAction; stagedCount: number; loadedCount: number; inventory: InventoryItem[] } = $props();

    // Picker worker states
    let workerPos = $state<'idle' | 'at-shelf' | 'carrying-back' | 'at-staging'>('idle');
    let workerCarrying = $state(false);

    // Replen/receiving worker states
    let replenWorkerPos = $state<'at-inbound' | 'walking-to-shelf' | 'at-shelf' | 'walking-back'>('at-inbound');
    let replenCarrying = $state(false);

    // Outbound truck
    let truckState = $state<'parked' | 'leaving' | 'arriving'>('parked');

    // Shelf glow on replen
    let shelfFlash = $state(false);

    $effect(() => {
        const a = action;
        if (a.type === 'pick') animatePick();
        else if (a.type === 'stage') animateStage();
        else if (a.type === 'load') animateLoad();
        else if (a.type === 'ship') animateShip();
        else if (a.type === 'replen') animateReplen();
    });

    function animatePick() {
        workerPos = 'at-shelf';
        workerCarrying = false;
        setTimeout(() => {
            workerCarrying = true;
            workerPos = 'carrying-back';
        }, 500);
        setTimeout(() => {
            workerPos = 'idle';
            workerCarrying = false;
        }, 1000);
    }

    function animateStage() {
        workerCarrying = true;
        workerPos = 'at-staging';
        setTimeout(() => {
            workerCarrying = false;
            workerPos = 'idle';
        }, 800);
    }

    function animateLoad() {
        workerPos = 'at-staging';
        setTimeout(() => {
            workerPos = 'idle';
        }, 800);
    }

    function animateShip() {
        truckState = 'leaving';
        setTimeout(() => {
            truckState = 'arriving';
        }, 1200);
        setTimeout(() => {
            truckState = 'parked';
        }, 2400);
    }

    function animateReplen() {
        // Receiving worker picks up from inbound, walks to shelf, drops off, walks back
        replenCarrying = true;
        replenWorkerPos = 'walking-to-shelf';
        setTimeout(() => {
            replenWorkerPos = 'at-shelf';
            shelfFlash = true;
        }, 900);
        setTimeout(() => {
            replenCarrying = false;
            replenWorkerPos = 'walking-back';
            shelfFlash = false;
        }, 1500);
        setTimeout(() => {
            replenWorkerPos = 'at-inbound';
        }, 2200);
    }
</script>

<div class="scene" aria-hidden="true">
    <div class="scene-bg">
        <!-- Building -->
        <div class="building">
            <div class="building-sign">Really Cool Big Warehouse</div>
        </div>

        <!-- Floor -->
        <div class="floor"></div>

        <!-- ═══ INBOUND (left side) ═══ -->

        <!-- Inbound truck (parked, static) -->
        <div class="inbound-truck">
            <div class="inbound-trailer"></div>
            <div class="inbound-cab">
                <div class="inbound-cab-window"></div>
            </div>
            <div class="truck-wheel itw-1"></div>
            <div class="truck-wheel itw-2"></div>
        </div>

        <!-- Inbound dock -->
        <div class="inbound-dock"></div>

        <!-- Conveyor lines from truck to receiving area -->
        <div class="conveyor">
            <div class="conveyor-line"></div>
            <div class="conveyor-roller"></div>
            <div class="conveyor-roller cr-2"></div>
            <div class="conveyor-roller cr-3"></div>
            <div class="conveyor-roller cr-4"></div>
            <div class="conveyor-roller cr-5"></div>
        </div>

        <!-- Receiving area -->
        <div class="receiving-label">RECEIVING</div>
        <div class="receiving-area">
            <div class="receiving-box"></div>
            <div class="receiving-box"></div>
        </div>

        <!-- Receiving/replen worker -->
        <div
            class="replen-worker"
            class:rw-at-inbound={replenWorkerPos === 'at-inbound'}
            class:rw-walking-to-shelf={replenWorkerPos === 'walking-to-shelf'}
            class:rw-at-shelf={replenWorkerPos === 'at-shelf'}
            class:rw-walking-back={replenWorkerPos === 'walking-back'}
        >
            <div class="worker-hardhat replen-hat"></div>
            <div class="worker-head"></div>
            <div class="worker-body replen-body"></div>
            <div class="worker-legs"></div>
            {#if replenCarrying}
                <div class="carried-box"></div>
            {/if}
        </div>

        <!-- ═══ WAREHOUSE CENTER ═══ -->

        <!-- Shelf/rack — each slot shows inventory -->
        <div class="shelf" class:shelf-flash={shelfFlash}>
            {#each inventory as item}
                <div class="shelf-slot">
                    {#if item.qtyOnHand > 0}
                        <div class="shelf-box" title="{item.itemName} ({item.qtyOnHand})"></div>
                    {/if}
                </div>
            {/each}
        </div>

        <!-- Picker worker -->
        <div
            class="worker"
            class:worker-idle={workerPos === 'idle'}
            class:worker-at-shelf={workerPos === 'at-shelf'}
            class:worker-carrying-back={workerPos === 'carrying-back'}
            class:worker-at-staging={workerPos === 'at-staging'}
        >
            <div class="worker-hardhat"></div>
            <div class="worker-head"></div>
            <div class="worker-body"></div>
            <div class="worker-legs"></div>
            {#if workerCarrying}
                <div class="carried-box"></div>
            {/if}
        </div>

        <!-- ═══ OUTBOUND (right side) ═══ -->

        <!-- Staging area -->
        <div class="staging-label">STAGING</div>
        <div class="staging-area">
            {#each { length: Math.min(stagedCount, 12) } as _}
                <div class="staged-box"></div>
            {/each}
        </div>

        <!-- Outbound dock -->
        <div class="outbound-dock"></div>

        <!-- Outbound truck -->
        <div
            class="truck"
            class:truck-parked={truckState === 'parked'}
            class:truck-leaving={truckState === 'leaving'}
            class:truck-arriving={truckState === 'arriving'}
        >
            <div class="truck-trailer">
                {#each { length: Math.min(loadedCount, 12) } as _}
                    <div class="loaded-box"></div>
                {/each}
            </div>
            <div class="truck-cab">
                <div class="cab-window"></div>
                <div class="cab-bumper"></div>
            </div>
            <div class="truck-wheel tw-1"></div>
            <div class="truck-wheel tw-2"></div>
            <div class="truck-wheel tw-3"></div>
            <div class="truck-wheel tw-4"></div>
        </div>
    </div>
</div>

<style>
    .scene {
        position: relative;
        width: 100%;
        height: 195px;
        overflow: hidden;
        border-bottom: 1px solid var(--color-warm-200);
        background: linear-gradient(to bottom, #87CEEB 0%, #B0E0E6 50%, transparent 50%);
    }

    :global(.dark) .scene {
        background: linear-gradient(to bottom, #1a1a3e 0%, #2a2a4e 50%, transparent 50%);
        border-color: var(--color-warm-700);
    }

    .scene-bg { position: absolute; inset: 0; }

    .floor {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 22%;
        background: #8B7355;
    }

    :global(.dark) .floor { background: #4a3828; }

    /* Building */
    .building {
        position: absolute;
        bottom: 22%;
        left: 1%;
        width: 98%;
        height: 62%;
        background: #D2B48C;
        border: 2px solid #8B7355;
        border-bottom: none;
    }

    :global(.dark) .building { background: #5a4a3a; border-color: #3a2a1a; }

    .building-sign {
        position: absolute;
        top: 6px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 12px;
        font-weight: 700;
        color: #5a3a1a;
        white-space: nowrap;
        font-family: var(--font-mono);
        letter-spacing: 0.5px;
    }

    :global(.dark) .building-sign { color: #d4b896; }

    /* ═══ INBOUND LEFT SIDE ═══ */

    /* Inbound truck — facing left (cab on left) */
    .inbound-truck {
        position: absolute;
        bottom: 22%;
        left: 0%;
        width: 11%;
        height: 34%;
    }

    .inbound-trailer {
        position: absolute;
        right: 0;
        bottom: 10px;
        width: 55%;
        height: 80%;
        background: #E8E8E8;
        border: 2px solid #B0B0B0;
        border-radius: 1px;
    }

    :global(.dark) .inbound-trailer { background: #6a6a6a; border-color: #4a4a4a; }

    .inbound-cab {
        position: absolute;
        left: 0;
        bottom: 10px;
        width: 38%;
        height: 42%;
        background: #2E86C1;
        border: 2px solid #1B4F72;
        border-radius: 4px 1px 1px 1px;
    }

    :global(.dark) .inbound-cab { background: #1a5276; border-color: #0e3a5c; }

    .inbound-cab-window {
        position: absolute;
        top: 3px;
        left: 3px;
        width: 55%;
        height: 40%;
        background: #AED6F1;
        border: 1px solid #85C1E9;
        border-radius: 3px 1px 0 0;
    }

    :global(.dark) .inbound-cab-window { background: #5B8DB8; border-color: #417A9B; }

    .itw-1 { left: 5%; }
    .itw-2 { right: 8%; }

    /* Inbound dock */
    .inbound-dock {
        position: absolute;
        bottom: 22%;
        left: 10%;
        width: 3%;
        height: 8px;
        background: #8B7355;
        border: 1px solid #6B5335;
    }

    :global(.dark) .inbound-dock { background: #5a4328; border-color: #3a2318; }

    /* Conveyor from dock to receiving */
    .conveyor {
        position: absolute;
        bottom: calc(22% + 5px);
        left: 12%;
        width: 10%;
        height: 6px;
    }

    .conveyor-line {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: repeating-linear-gradient(
            to right,
            #666 0px, #666 4px,
            transparent 4px, transparent 7px
        );
    }

    :global(.dark) .conveyor-line {
        background: repeating-linear-gradient(
            to right,
            #888 0px, #888 4px,
            transparent 4px, transparent 7px
        );
    }

    .conveyor-roller {
        position: absolute;
        bottom: -3px;
        left: 0;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #888;
        border: 1px solid #666;
    }

    .cr-2 { left: 22%; }
    .cr-3 { left: 44%; }
    .cr-4 { left: 66%; }
    .cr-5 { left: 88%; }

    /* Receiving area */
    .receiving-area {
        position: absolute;
        bottom: 22%;
        left: 22%;
        width: 8%;
        height: 16%;
        border: 1px dashed #8B7355;
        border-bottom: none;
        display: flex;
        align-items: flex-end;
        gap: 3px;
        padding: 3px;
    }

    :global(.dark) .receiving-area { border-color: var(--color-warm-400); }

    .receiving-label {
        position: absolute;
        bottom: calc(22% + 54px);
        left: 26%;
        transform: translateX(-50%);
        font-size: 8px;
        font-weight: 700;
        color: #8B7355;
        font-family: var(--font-mono);
        white-space: nowrap;
        z-index: 5;
    }

    :global(.dark) .receiving-label { color: var(--color-warm-400); }

    .receiving-box {
        width: 10px;
        height: 10px;
        background: var(--color-accent-100);
        border: 1px solid var(--color-accent-500);
        border-radius: 1px;
        flex-shrink: 0;
    }

    /* Replen/receiving worker */
    .replen-worker {
        position: absolute;
        bottom: 22%;
        width: 24px;
        height: 48px;
        transition: left 0.7s ease-in-out;
        z-index: 10;
    }

    .rw-at-inbound { left: 24%; }
    .rw-walking-to-shelf { left: 46%; }
    .rw-at-shelf { left: 46%; }
    .rw-walking-back { left: 24%; }

    .replen-hat { background: #FF6B35 !important; }

    .replen-body { background: #2E8B57 !important; }
    :global(.dark) .replen-body { background: #1a6b37 !important; }

    /* ═══ CENTER ═══ */

    /* Shelf */
    .shelf {
        position: absolute;
        bottom: 22%;
        left: 34%;
        width: 14%;
        height: 30%;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(2, 1fr);
        gap: 3px;
        padding: 3px;
        background: #8B6914;
        border: 2px solid #6B4914;
        transition: box-shadow 0.3s;
    }

    :global(.dark) .shelf { background: #6B5914; border-color: #4B3914; }

    .shelf-flash { box-shadow: 0 0 14px 3px var(--color-accent-400); }

    .shelf-slot {
        background: #C4A55A;
        border: 1px solid #A48530;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    :global(.dark) .shelf-slot { background: #8a7540; border-color: #6a5530; }

    .shelf-box {
        width: 70%;
        height: 65%;
        background: var(--color-red-100);
        border: 1px solid var(--color-red-400);
        border-radius: 1px;
        transition: opacity 0.3s, transform 0.3s;
    }

    :global(.dark) .shelf-box {
        background: var(--color-red-900);
        border-color: var(--color-red-500);
    }

    /* Picker worker */
    .worker {
        position: absolute;
        bottom: 22%;
        width: 24px;
        height: 48px;
        transition: left 0.4s ease-in-out;
        z-index: 10;
    }

    .worker-idle { left: 52%; }
    .worker-at-shelf { left: 38%; }
    .worker-carrying-back { left: 52%; }
    .worker-at-staging { left: 62%; }

    .worker-hardhat {
        position: absolute;
        top: 0;
        left: 2px;
        width: 20px;
        height: 9px;
        background: #FFD700;
        border-radius: 4px 4px 0 0;
    }

    .worker-head {
        position: absolute;
        top: 9px;
        left: 5px;
        width: 14px;
        height: 12px;
        background: #FDBCB4;
        border-radius: 3px;
    }

    :global(.dark) .worker-head { background: #d4a090; }

    .worker-body {
        position: absolute;
        top: 21px;
        left: 3px;
        width: 18px;
        height: 15px;
        background: #4169E1;
        border-radius: 2px;
    }

    :global(.dark) .worker-body { background: #2a4a9a; }

    .worker-legs {
        position: absolute;
        top: 36px;
        left: 5px;
        width: 14px;
        height: 12px;
        background: #2F4F4F;
        border-radius: 0 0 3px 3px;
    }

    .carried-box {
        position: absolute;
        top: 3px;
        right: -12px;
        width: 12px;
        height: 12px;
        background: var(--color-red-100);
        border: 1px solid var(--color-red-500);
        border-radius: 1px;
    }

    /* ═══ OUTBOUND RIGHT SIDE ═══ */

    /* Staging area */
    .staging-area {
        position: absolute;
        bottom: 22%;
        left: 60%;
        width: 10%;
        height: 16%;
        border: 1px dashed var(--color-warm-600);
        border-bottom: none;
        display: flex;
        flex-wrap: wrap-reverse;
        direction: rtl;
        align-content: flex-start;
        gap: 2px;
        padding: 3px;
        overflow: hidden;
    }

    :global(.dark) .staging-area { border-color: var(--color-warm-400); }

    .staging-label {
        position: absolute;
        bottom: calc(22% + 54px);
        left: 65%;
        transform: translateX(-50%);
        font-size: 8px;
        font-weight: 700;
        color: var(--color-warm-600);
        font-family: var(--font-mono);
        white-space: nowrap;
        z-index: 5;
    }

    :global(.dark) .staging-label { color: var(--color-warm-400); }

    .staged-box {
        width: 10px;
        height: 10px;
        background: var(--color-red-100);
        border: 1px solid var(--color-red-500);
        border-radius: 1px;
        flex-shrink: 0;
    }

    /* Outbound dock */
    .outbound-dock {
        position: absolute;
        bottom: 22%;
        right: 5%;
        width: 3%;
        height: 8px;
        background: #8B7355;
        border: 1px solid #6B5335;
    }

    :global(.dark) .outbound-dock { background: #5a4328; border-color: #3a2318; }

    /* Outbound truck */
    .truck {
        position: absolute;
        bottom: 22%;
        right: 0%;
        width: 16%;
        height: 34%;
        transition: transform 1s ease-in-out;
    }

    .truck-parked { transform: translateX(0); }
    .truck-leaving { transform: translateX(160%); }
    .truck-arriving { transform: translateX(0); animation: truck-arrive 1s ease-out; }

    @keyframes truck-arrive {
        from { transform: translateX(160%); }
        to { transform: translateX(0); }
    }

    .truck-trailer {
        position: absolute;
        left: 0;
        bottom: 10px;
        width: 58%;
        height: 80%;
        background: #E8E8E8;
        border: 2px solid #B0B0B0;
        border-radius: 1px;
        display: flex;
        flex-wrap: wrap-reverse;
        direction: rtl;
        align-content: flex-start;
        gap: 2px;
        padding: 3px;
        overflow: hidden;
    }

    :global(.dark) .truck-trailer { background: #6a6a6a; border-color: #4a4a4a; }

    .truck-cab {
        position: absolute;
        right: 0;
        bottom: 10px;
        width: 36%;
        height: 45%;
        background: #C0392B;
        border: 2px solid #96281B;
        border-radius: 1px 4px 1px 1px;
    }

    :global(.dark) .truck-cab { background: #922316; border-color: #6c1a11; }

    .cab-window {
        position: absolute;
        top: 3px;
        right: 3px;
        width: 55%;
        height: 40%;
        background: #AED6F1;
        border: 1px solid #85C1E9;
        border-radius: 1px 3px 0 0;
    }

    :global(.dark) .cab-window { background: #5B8DB8; border-color: #417A9B; }

    .cab-bumper {
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 30%;
        height: 4px;
        background: #7F8C8D;
        border-radius: 0 0 2px 0;
    }

    .loaded-box {
        width: 10px;
        height: 10px;
        background: var(--color-red-100);
        border: 1px solid var(--color-red-500);
        border-radius: 1px;
        flex-shrink: 0;
    }

    /* Shared wheel style */
    .truck-wheel {
        position: absolute;
        bottom: 2px;
        width: 10px;
        height: 10px;
        background: #2C3E50;
        border-radius: 50%;
        border: 2px solid #555;
    }

    .tw-1 { left: 6%; }
    .tw-2 { left: 18%; }
    .tw-3 { right: 14%; }
    .tw-4 { right: 3%; }

    @media (prefers-reduced-motion: reduce) {
        .worker, .replen-worker, .truck {
            transition-duration: 0.01s;
        }

        @keyframes truck-arrive {
            from { transform: translateX(0); }
            to { transform: translateX(0); }
        }
    }

    @media (max-width: 640px) {
        .scene { height: 150px; }
        .building-sign { font-size: 9px; }
        .staging-label, .receiving-label { font-size: 6px; }
    }
</style>
