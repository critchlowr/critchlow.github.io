<script lang="ts">
	import type { Order, OrderLine, Pick } from '$lib/data/warehouse';
	import { orderLineStatus } from '$lib/data/warehouse';
	import StatusBadge from './StatusBadge.svelte';

	let {
		orders,
		orderLines,
		picks
	}: {
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
				done = p.loaded;
				label = 'loaded';
				break;
			case 'Packed':
			case 'Partial Pack':
				done = p.packed;
				label = 'packed';
				break;
			case 'Staged':
			case 'Partial Stage':
				done = p.staged;
				label = 'staged';
				break;
			default:
				done = p.picked;
				label = 'picked';
				break;
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
	{#each orders as order (order.orderId)}
		{@const progress = getProgressForOrder(order)}
		{@const status = displayStatus(order)}
		<div
			class="border-warm-200 dark:border-warm-700 dark:bg-warm-800 flex items-center gap-3 rounded-lg border bg-white px-3 py-2"
		>
			<span class="text-warm-700 dark:text-warm-300 font-mono text-xs font-semibold"
				>{order.orderId}</span
			>
			<span class="text-warm-700 dark:text-warm-300 truncate text-sm">{order.customer}</span>
			<div class="ml-auto flex items-center gap-2">
				{#if progress.total > 0}
					<span class="text-warm-700 dark:text-warm-300 text-xs"
						>{progress.done}/{progress.total} {progress.label}</span
					>
					<div class="flex gap-0.5">
						{#each { length: progress.total } as _, i (i)}
							{@const isShorted = i >= progress.total - progress.shorted}
							<div
								class="h-1.5 w-3 rounded-full {i < progress.done
									? 'bg-moss-400 dark:bg-moss-500'
									: isShorted
										? 'bg-ember-300 dark:bg-ember-700'
										: 'bg-warm-200 dark:bg-warm-600'}"
							></div>
						{/each}
					</div>
				{/if}
				<StatusBadge {status} />
			</div>
		</div>
	{/each}
</div>
