<script lang="ts">
    let { visible = false }: { visible: boolean } = $props();
</script>

<div
    class="select-none overflow-hidden rounded-b-xl bg-warm-100 py-3 dark:bg-warm-800"
    role="img"
    aria-label="Animated conveyor belt with boxes"
>
    <div class="relative h-10" aria-hidden="true">
        <!-- Animated layer: belt track + boxes scroll together -->
        <div class="belt-content" class:belt-animate={visible}>
            <!-- First segment -->
            <div class="belt-segment">
                <div class="belt-track">{#each { length: 200 } as _}-{/each}</div>
                <div class="box box-bounce-a bottom-3 left-[5%] h-5 w-5"></div>
                <div class="box box-bounce-b bottom-3 left-[14%] h-3.5 w-3.5"></div>
                <div class="box box-bounce-c bottom-3 left-[40%] h-6 w-6"></div>
                <div class="box box-bounce-d bottom-3 left-[72%] h-4 w-4"></div>
            </div>
            <!-- Second segment (identical copy for seamless loop) -->
            <div class="belt-segment">
                <div class="belt-track">{#each { length: 200 } as _}-{/each}</div>
                <div class="box box-bounce-a bottom-3 left-[5%] h-5 w-5"></div>
                <div class="box box-bounce-b bottom-3 left-[14%] h-3.5 w-3.5"></div>
                <div class="box box-bounce-c bottom-3 left-[40%] h-6 w-6"></div>
                <div class="box box-bounce-d bottom-3 left-[72%] h-4 w-4"></div>
            </div>
        </div>
        <!-- Static layer: rollers stay fixed in place -->
        <div class="belt-rollers">
            {#each { length: 40 } as _}
                <span>o</span>
            {/each}
        </div>
    </div>
</div>

<style>
    .belt-content {
        display: flex;
        width: 200%;
        height: 100%;
    }

    .belt-segment {
        width: 50%;
        height: 100%;
        position: relative;
        flex-shrink: 0;
    }

    .belt-track {
        position: absolute;
        bottom: 6px;
        left: 0;
        white-space: nowrap;
        font-family: ui-monospace, 'JetBrains Mono', monospace;
        font-size: 11px;
        line-height: 1;
        color: var(--color-warm-600);
        letter-spacing: 3px;
    }

    :global(.dark) .belt-track {
        color: var(--color-warm-400);
    }

    .box {
        position: absolute;
        border-radius: 3px;
        border: 1px solid var(--color-red-500);
        background-color: var(--color-red-50);
    }

    :global(.dark) .box {
        border-color: var(--color-red-400);
        background-color: var(--color-red-900);
    }

    .belt-rollers {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 1;
        display: flex;
        justify-content: space-between;
        padding: 0 2px;
        font-family: ui-monospace, 'JetBrains Mono', monospace;
        font-size: 9px;
        line-height: 1;
        color: var(--color-warm-600);
        pointer-events: none;
    }

    :global(.dark) .belt-rollers {
        color: var(--color-warm-400);
    }

    .belt-animate {
        animation: belt-scroll 6s linear infinite;
    }

    .belt-animate .box-bounce-a {
        animation: box-bounce 0.55s ease-in-out infinite;
    }

    .belt-animate .box-bounce-b {
        animation: box-bounce 0.7s ease-in-out infinite 0.2s;
    }

    .belt-animate .box-bounce-c {
        animation: box-bounce 0.5s ease-in-out infinite 0.1s;
    }

    .belt-animate .box-bounce-d {
        animation: box-bounce 0.65s ease-in-out infinite 0.35s;
    }

    @keyframes belt-scroll {
        from {
            transform: translateX(-50%);
        }
        to {
            transform: translateX(0);
        }
    }

    @keyframes box-bounce {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-2px);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .belt-animate {
            animation: belt-scroll 10s linear infinite;
        }

        .belt-animate .box-bounce-a {
            animation: box-bounce 1.1s ease-in-out infinite;
        }

        .belt-animate .box-bounce-b {
            animation: box-bounce 1.4s ease-in-out infinite 0.2s;
        }

        .belt-animate .box-bounce-c {
            animation: box-bounce 1s ease-in-out infinite 0.1s;
        }

        .belt-animate .box-bounce-d {
            animation: box-bounce 1.3s ease-in-out infinite 0.35s;
        }
    }
</style>
