<script lang="ts">
    let { visible = false }: { visible: boolean } = $props();
</script>

<div
    class="select-none overflow-hidden rounded-b-xl bg-warm-100 py-3 dark:bg-warm-800"
    role="img"
    aria-label="Decorative animated conveyor belt with shipping boxes"
>
    <div class="relative h-10" aria-hidden="true">
        <!-- Animated layer: belt track + boxes scroll together -->
        <div class="belt-content" class:belt-animate={visible}>
            <!-- Continuous track across full width -->
            <div class="belt-track"></div>
            <!-- First segment boxes -->
            <div class="belt-segment">
                <div class="box box-bounce-a bottom-3 left-[5%] h-5 w-5"></div>
                <div class="box box-bounce-b bottom-3 left-[14%] h-3.5 w-3.5"></div>
                <div class="box box-bounce-c bottom-3 left-[40%] h-6 w-6"></div>
                <div class="box box-bounce-d bottom-3 left-[72%] h-4 w-4"></div>
            </div>
            <!-- Second segment boxes (seamless loop) -->
            <div class="belt-segment">
                <div class="box box-bounce-a bottom-3 left-[5%] h-5 w-5"></div>
                <div class="box box-bounce-b bottom-3 left-[14%] h-3.5 w-3.5"></div>
                <div class="box box-bounce-c bottom-3 left-[40%] h-6 w-6"></div>
                <div class="box box-bounce-d bottom-3 left-[72%] h-4 w-4"></div>
            </div>
        </div>
        <!-- Static layer: rollers stay fixed in place -->
        <div class="belt-rollers">
            {#each { length: 30 } as _}
                <span class="roller"></span>
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
        width: 100%;
        height: 2px;
        background: repeating-linear-gradient(
            to right,
            var(--color-warm-600) 0px,
            var(--color-warm-600) 6px,
            transparent 6px,
            transparent 12px
        );
    }

    :global(.dark) .belt-track {
        background: repeating-linear-gradient(
            to right,
            var(--color-warm-400) 0px,
            var(--color-warm-400) 6px,
            transparent 6px,
            transparent 12px
        );
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
        padding: 0 4px;
        pointer-events: none;
    }

    .roller {
        display: block;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        border: 1.5px solid var(--color-warm-600);
    }

    :global(.dark) .roller {
        border-color: var(--color-warm-400);
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
