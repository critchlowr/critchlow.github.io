<script lang="ts" module>
	export interface RunLog {
		emptyReports: { location: string; itemName: string }[];
		replenishments: { itemName: string; qty: number; location: string }[];
		decisions: {
			orderId: string;
			customer: string;
			choice: 'held' | 'shipped-short';
			missing: { itemName: string; qty: number }[];
		}[];
	}
</script>

<script lang="ts">
	import type { Order, OrderLine, Pick } from '$lib/data/warehouse';

	let {
		orders,
		orderLines,
		picks,
		log,
		onreset
	}: {
		orders: Order[];
		orderLines: OrderLine[];
		picks: Pick[];
		log: RunLog;
		onreset: () => void;
	} = $props();

	// This replaces the whole panel, so the button that ended the run is gone and
	// focus would fall to <body>. Landing on the heading restores it and reads the result.
	let heading = $state<HTMLElement>();
	$effect(() => {
		heading?.focus();
	});

	const missingText = (missing: { itemName: string; qty: number }[]) =>
		missing.map((m) => `${m.qty} ${m.itemName}`).join(', ');

	const outcomes = $derived(
		orders.map((order) => {
			const lines = orderLines.filter((l) => l.orderId === order.orderId);
			const ordered = lines.reduce((sum, l) => sum + l.qtyOrdered, 0);
			const shipped = lines.reduce((sum, l) => sum + l.qtyShipped, 0);
			const decision = log.decisions.find((d) => d.orderId === order.orderId);

			let result: string;
			if (order.status === 'Held') {
				result = `Held in staging, waiting on ${missingText(decision?.missing ?? [])}. Ships complete when stock arrives.`;
			} else if (shipped >= ordered) {
				result = `Shipped complete, ${ordered} units.`;
			} else {
				result = `Shipped short, ${shipped} of ${ordered} units. Missing ${missingText(decision?.missing ?? [])}.`;
			}
			return { ...order, result };
		})
	);

	const shippedCount = $derived(orders.filter((o) => o.status === 'Shipped').length);
	const heldCount = $derived(orders.filter((o) => o.status === 'Held').length);
	const pickCount = $derived(
		picks.filter((p) => p.status === 'Shipped' || p.status === 'Held').length
	);
</script>

<div class="mx-auto max-w-xl py-6">
	<h3 bind:this={heading} tabindex="-1" class="text-warm-800 dark:text-warm-100 text-2xl font-bold">
		Shift summary
	</h3>
	<p class="text-warm-700 dark:text-warm-300 mt-1 text-sm">
		{shippedCount} of {orders.length} orders shipped today{heldCount > 0
			? `, ${heldCount} held`
			: ''}.
	</p>

	<h4 class="text-warm-800 dark:text-warm-100 mt-6 text-sm font-semibold">Orders</h4>
	<ul class="mt-2 space-y-2">
		{#each outcomes as order (order.orderId)}
			<li
				class="border-warm-200 dark:border-warm-700 bg-surface-raised rounded-lg border px-3 py-2 text-sm"
			>
				<span class="text-warm-800 dark:text-warm-100 font-mono text-xs font-semibold">
					{order.orderId}
				</span>
				<span class="text-warm-700 dark:text-warm-300">{order.customer}</span>
				<p class="text-warm-800 dark:text-warm-100 mt-0.5">{order.result}</p>
			</li>
		{/each}
	</ul>

	<h4 class="text-warm-800 dark:text-warm-100 mt-6 text-sm font-semibold">On the floor</h4>
	<ul class="text-warm-800 dark:text-warm-100 mt-2 list-disc space-y-1 pl-5 text-sm">
		<li>{pickCount} picks confirmed.</li>
		{#if log.emptyReports.length === 0}
			<li>No locations reported empty.</li>
		{:else}
			{#each log.emptyReports as report, i (i)}
				<li>{report.location} reported empty ({report.itemName}).</li>
			{/each}
		{/if}
		{#if log.replenishments.length === 0}
			<li>No replenishments.</li>
		{:else}
			{#each log.replenishments as replen, i (i)}
				<li>
					Replenished {replen.qty}
					{replen.itemName} from reserve to {replen.location}.
				</li>
			{/each}
		{/if}
	</ul>

	<button
		type="button"
		class="bg-action hover:bg-action-hover mt-6 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors"
		onclick={onreset}
	>
		Run another shift
	</button>
</div>
