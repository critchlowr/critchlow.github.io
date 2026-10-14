<script lang="ts">
	import { orderLineStatus, type Order, type OrderLine, type Pick } from '$lib/data/warehouse';
	import StatusBadge from './StatusBadge.svelte';

	interface Props {
		orders: Order[];
		orderLines: OrderLine[];
		picks: Pick[];
	}

	let { orders, orderLines, picks }: Props = $props();

	/** Which line count to show for each status: the furthest step the order has reached. */
	function stepFor(status: Order['status']): 'loaded' | 'packed' | 'staged' | 'picked' {
		switch (status) {
			case 'Loaded':
			case 'Shipped':
			case 'Partial Ship':
				return 'loaded';
			case 'Packed':
			case 'Partial Pack':
				return 'packed';
			case 'Staged':
			case 'Partial Stage':
				return 'staged';
			default:
				return 'picked';
		}
	}

	// One pass over each order's lines per update, shared by the progress and the badge.
	const rows = $derived(
		orders.map((order) => {
			const lines = orderLineStatus(order.orderId, orderLines, picks);
			const step = stepFor(order.status);
			const showShort = lines.shorted > 0 && order.status !== 'Shipped' && order.status !== 'Open';
			return {
				order,
				progress: { done: lines[step], shorted: lines.shorted, total: lines.total, label: step },
				status: showShort ? `${order.status} (Short)` : order.status
			};
		})
	);
</script>

<div class="mb-4 space-y-2">
	{#each rows as { order, progress, status } (order.orderId)}
		<div class="border-edge bg-surface-raised flex items-center gap-3 rounded-lg border px-3 py-2">
			<span class="text-ink-muted font-mono text-xs font-semibold">{order.orderId}</span>
			<span class="text-ink-muted truncate text-sm">{order.customer}</span>
			<div class="ml-auto flex items-center gap-2">
				{#if progress.total > 0}
					<span class="text-ink-muted text-xs"
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
