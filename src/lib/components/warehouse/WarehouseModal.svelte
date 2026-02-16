<script lang="ts">
    import type { Snippet } from 'svelte';

    let { open = false, onclose, children }: { open: boolean; onclose: () => void; children: Snippet } = $props();

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') onclose();
    }

    $effect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    });
</script>

{#if open}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Warehouse Management Simulator"
        tabindex="-1"
        onkeydown={handleKeydown}
    >
        <!-- Backdrop click to close -->
        <button
            type="button"
            class="absolute inset-0 cursor-default"
            onclick={onclose}
            aria-label="Close simulator"
            tabindex="-1"
        ></button>

        <!-- Modal content -->
        <div
            class="relative z-10 flex h-[100dvh] w-screen flex-col overflow-hidden bg-warm-50 shadow-2xl dark:bg-warm-900 md:h-auto md:max-h-[85vh] md:w-[90vw] md:max-w-5xl md:rounded-2xl"
        >
            {@render children()}
        </div>
    </div>
{/if}
