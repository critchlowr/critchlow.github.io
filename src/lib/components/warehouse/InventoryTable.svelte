<script lang="ts">
    import type { InventoryItem } from '$lib/data/warehouse';

    let { inventory }: { inventory: InventoryItem[] } = $props();
</script>

<div class="overflow-x-auto">
    <table class="w-full text-left text-sm">
        <thead>
            <tr class="border-b border-warm-200 text-xs font-semibold uppercase tracking-wider text-warm-600 dark:border-warm-700 dark:text-warm-300">
                <th class="px-3 py-2">Location</th>
                <th class="px-3 py-2">Item</th>
                <th class="px-3 py-2 text-right">Inbound</th>
                <th class="px-3 py-2 text-right">On Hand</th>
                <th class="px-3 py-2 text-right">Allocated</th>
            </tr>
        </thead>
        <tbody>
            {#each inventory as item}
                <tr class="border-b border-warm-100 transition-colors hover:bg-warm-100 dark:border-warm-800 dark:hover:bg-warm-800">
                    <td class="px-3 py-2 font-mono text-xs text-warm-600 dark:text-warm-300">{item.location}</td>
                    <td class="px-3 py-2 text-warm-700 dark:text-warm-200">{item.itemName}</td>
                    <td class="px-3 py-2 text-right font-mono {item.qtyAvailable <= 0 ? 'text-warm-400 dark:text-warm-500' : 'text-warm-700 dark:text-warm-200'}">{item.qtyAvailable}</td>
                    <td class="px-3 py-2 text-right font-mono text-warm-700 dark:text-warm-200">{item.qtyOnHand}</td>
                    <td class="px-3 py-2 text-right font-mono font-semibold {item.qtyAllocated > 0 ? 'text-accent-600 dark:text-accent-400' : 'text-warm-400 dark:text-warm-500'}">
                        {item.qtyAllocated}
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
