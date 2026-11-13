<script lang="ts">
	import type { OrderStatus } from '$lib/data/warehouse';

	interface Props {
		/** An order status. A " (Short)" suffix keeps the base status's colour. */
		status: string;
	}

	let { status }: Props = $props();

	// Each pairs a pale fill with text that clears 4.5:1 on it, in both themes.
	const tones = {
		waiting: 'bg-warm-200 text-warm-700 dark:bg-warm-700 dark:text-warm-200',
		working: 'bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-300',
		staged: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
		done: 'bg-moss-100 text-moss-700 dark:bg-moss-900 dark:text-moss-300',
		outbound: 'bg-plum-100 text-plum-700 dark:bg-plum-900 dark:text-plum-300'
	};

	const toneOf: Record<OrderStatus, keyof typeof tones> = {
		Open: 'waiting',
		Released: 'working',
		Picking: 'working',
		Picked: 'done',
		'Partial Stage': 'staged',
		Staged: 'staged',
		Held: 'staged',
		Packed: 'done',
		'Partial Pack': 'outbound',
		Loaded: 'outbound',
		'Partial Ship': 'outbound',
		Shipped: 'done'
	};

	const baseStatus = $derived(status.split(' (')[0] as OrderStatus);
	const classes = $derived(tones[toneOf[baseStatus] ?? 'waiting']);
</script>

<span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold {classes}">
	{status}
</span>
