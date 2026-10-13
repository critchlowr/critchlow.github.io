<script lang="ts">
	import { scrollable } from '$lib/actions/scrollable';
	import type { InventoryItem } from '$lib/data/warehouse';

	let { inventory }: { inventory: InventoryItem[] } = $props();
</script>

<div class="overflow-x-auto" use:scrollable={{ label: 'Inventory, scrolls horizontally' }}>
	<table class="w-full text-left text-sm">
		<caption class="sr-only"
			>Warehouse inventory by location, with inbound, on-hand, and allocated quantities.</caption
		>
		<thead>
			<tr
				class="border-warm-200 text-warm-700 dark:border-warm-700 dark:text-warm-300 border-b text-xs font-semibold tracking-wider uppercase"
			>
				<th scope="col" class="px-3 py-2">Location</th>
				<th scope="col" class="px-3 py-2">Item</th>
				<th scope="col" class="px-3 py-2 text-right">Inbound</th>
				<th scope="col" class="px-3 py-2 text-right">On Hand</th>
				<th scope="col" class="px-3 py-2 text-right">Allocated</th>
			</tr>
		</thead>
		<tbody>
			{#each inventory as item (item.sku)}
				<tr
					class="border-warm-100 hover:bg-warm-100 dark:border-warm-800 dark:hover:bg-warm-800 border-b transition-colors"
				>
					<td class="text-warm-700 dark:text-warm-300 px-3 py-2 font-mono text-xs"
						>{item.location}</td
					>
					<td class="text-warm-700 dark:text-warm-200 px-3 py-2">{item.itemName}</td>
					<td
						class="px-3 py-2 text-right font-mono {item.qtyAvailable <= 0
							? 'text-warm-700 dark:text-warm-300'
							: 'text-warm-700 dark:text-warm-200'}">{item.qtyAvailable}</td
					>
					<td class="text-warm-700 dark:text-warm-200 px-3 py-2 text-right font-mono"
						>{item.qtyOnHand}</td
					>
					<td
						class="px-3 py-2 text-right font-mono font-semibold {item.qtyAllocated > 0
							? 'text-accent-700 dark:text-accent-400'
							: 'text-warm-700 dark:text-warm-300'}"
					>
						{item.qtyAllocated}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
