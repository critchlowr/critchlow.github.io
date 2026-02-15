<script lang="ts">
    let { onreset }: { onreset: () => void } = $props();
</script>

<div class="flex flex-col items-center justify-center gap-6 py-12 text-center">
    <div class="text-4xl">
        <span class="victory-truck" aria-hidden="true">
            <!-- Pixel truck icon -->
            <svg width="64" height="40" viewBox="0 0 64 40" class="inline-block">
                <rect x="0" y="8" width="36" height="24" rx="2" fill="var(--color-moss-500)" />
                <rect x="36" y="16" width="24" height="16" rx="2" fill="var(--color-moss-600)" />
                <rect x="52" y="12" width="8" height="4" rx="1" fill="var(--color-moss-600)" />
                <circle cx="12" cy="36" r="4" fill="#333" stroke="#555" stroke-width="2" />
                <circle cx="50" cy="36" r="4" fill="#333" stroke="#555" stroke-width="2" />
            </svg>
        </span>
    </div>

    <div>
        <h3 class="text-2xl font-bold text-warm-800 dark:text-warm-100">All Orders Shipped!</h3>
        <p class="mt-2 text-sm text-warm-600 dark:text-warm-400">
            You successfully managed the warehouse. Every order picked, staged, loaded, and shipped.
        </p>
    </div>

    <button
        type="button"
        class="rounded-lg bg-accent-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-600 dark:bg-accent-600 dark:hover:bg-accent-500"
        onclick={onreset}
    >
        Play Again
    </button>
</div>

<style>
    .victory-truck {
        display: inline-block;
        animation: truck-bounce 0.6s ease-in-out infinite alternate;
    }

    @keyframes truck-bounce {
        from { transform: translateY(0); }
        to { transform: translateY(-6px); }
    }

    @media (prefers-reduced-motion: reduce) {
        .victory-truck {
            animation: none;
        }
    }
</style>
