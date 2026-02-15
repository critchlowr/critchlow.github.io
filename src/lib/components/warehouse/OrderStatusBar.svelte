<script lang="ts">
    import type { Order, OrderLine, Pick } from '$lib/data/warehouse';
    import { orderLineStatus } from '$lib/data/warehouse';
    import StatusBadge from './StatusBadge.svelte';

    let { orders, orderLines, picks }: {
        orders: Order[];
        orderLines: OrderLine[];
        picks: Pick[];
    } = $props();

    function getProgressForOrder(order: Order) {
        const p = orderLineStatus(order.orderId, orderLines, picks);
        if (p.total === 0) return { done: 0, shorted: 0, total: 0, label: '' };

        let done: number;
        let label: string;
        switch (order.status) {
            case 'Loaded':
            case 'Shipped':
            case 'Partial Ship':
                done = p.loaded; label = 'loaded'; break;
            case 'Staged':
            case 'Partial Stage':
                done = p.staged; label = 'staged'; break;
            default:
                done = p.picked; label = 'picked'; break;
        }

        return { done, shorted: p.shorted, total: p.total, label };
    }

    function displayStatus(order: Order): string {
        const p = orderLineStatus(order.orderId, orderLines, picks);
        if (p.shorted > 0 && order.status !== 'Shipped' && order.status !== 'Open') {
            return `${order.status} (Short)`;
        }
        return order.status;
    }
</script>

<div class="mb-4 space-y-2">
    {#each orders as order}
        {@const progress = getProgressForOrder(order)}
        {@const status = displayStatus(order)}
        <div class="flex items-center gap-3 rounded-lg border border-warm-200 bg-white px-3 py-2 dark:border-warm-700 dark:bg-warm-800">
            <span class="font-mono text-xs font-semibold text-warm-600 dark:text-warm-300">{order.orderId}</span>
            <span class="truncate text-sm text-warm-500 dark:text-warm-400">{order.customer}</span>
            <div class="ml-auto flex items-center gap-2">
                {#if progress.total > 0}
                    <span class="text-xs text-warm-500 dark:text-warm-400">{progress.done}/{progress.total} {progress.label}</span>
                    <div class="flex gap-0.5">
                        {#each { length: progress.total } as _, i}
                            {@const isShorted = i >= progress.total - progress.shorted}
                            <div
                                class="h-1.5 w-3 rounded-full {i < progress.done
                                    ? 'bg-moss-400 dark:bg-moss-500'
                                    : isShorted
                                        ? 'bg-red-300 dark:bg-red-700'
                                        : 'bg-warm-200 dark:bg-warm-600'}"
                            ></div>
                        {/each}
                    </div>
                {/if}
                <StatusBadge status={status} />
            </div>
        </div>
    {/each}
</div>
