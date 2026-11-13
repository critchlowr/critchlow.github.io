<script lang="ts">
	import { scrollable } from '$lib/actions/scrollable';
	import Card from '$lib/components/ui/Card.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import WarehouseModal from '$lib/components/warehouse/WarehouseModal.svelte';
	import WarehouseGame from '$lib/components/warehouse/WarehouseGame.svelte';

	let open = $state(false);

	// The main sequence. Shorting is not a step in it — see the branch below.
	const steps = ['Wave', 'Pick', 'Stage', 'Pack', 'Load', 'Ship'];
	const branch = ['Short', 'Replenish'];
</script>

<section class="pt-28 pb-20 md:pt-32" aria-labelledby="simulator-heading">
	<div class="mx-auto max-w-4xl px-5">
		<p class="mb-4">
			<a href="/#experience" class="link text-sm font-semibold">Back to Experience</a>
		</p>
		<h1 id="simulator-heading" class="text-ink-strong font-display text-title mb-8 font-semibold">
			WMS Simulator
		</h1>
		<Card class="p-6 md:p-8">
			<div class="max-w-2xl space-y-5">
				<p class="text-ink text-body">
					For three years I administered warehouse management systems for four enterprise accounts.
					Most of that job was explaining the same flow to people who had never worked in a
					warehouse: an order comes in, inventory gets allocated, someone walks the floor and picks
					it, and what gets picked is packed and shipped.
				</p>
				<p class="text-ink text-body">
					The simulator walks through that flow, including what happens when a picker reaches an
					empty location: the line shorts, replenishment refills the location, and the pick is tried
					again. If the location can't be refilled in time, you choose whether the order waits or
					ships partial.
				</p>

				<!--
					One grid so the exception branch can start in the same column as Pick.
					Each step is a column; the branch is a final list item placed at column 2
					(Pick) and spanning to the end, which keeps it aligned no matter how the
					pill widths change. Scrolls inside itself on narrow screens.
				-->
				<div
					class="overflow-x-auto pt-2"
					use:scrollable={{ label: 'Fulfillment sequence diagram', role: 'group' }}
				>
					<ol
						class="grid w-max items-center gap-x-1 gap-y-2"
						style="grid-template-columns: repeat({steps.length}, auto);"
						aria-label="Warehouse fulfillment sequence, with the exception path when a pick location is empty"
					>
						{#each steps as step, i (step)}
							<li class="flex items-center gap-1">
								<Badge tone="accent" size="md">{step}</Badge>
								{#if i < steps.length - 1}
									<span class="text-ink-muted" aria-hidden="true">&rarr;</span>
								{/if}
							</li>
						{/each}

						<li class="flex items-center gap-1" style="grid-column: 2 / -1;">
							<span class="text-ink-muted" aria-hidden="true">&#8627;</span>
							<span class="text-ink-muted mr-1 text-sm">location empty</span>
							{#each branch as step (step)}
								<span
									class="bg-ember-100 text-ember-800 dark:bg-ember-950 dark:text-ember-300 rounded-full px-3 py-1 text-sm font-medium"
								>
									{step}
								</span>
								<span class="text-ink-muted" aria-hidden="true">&rarr;</span>
							{/each}
							<span class="text-ink-muted text-sm">back to Pick</span>
						</li>
					</ol>
				</div>

				<div class="pt-2">
					<button type="button" class="btn btn-primary" onclick={() => (open = true)}>
						<Icon name="play" class="h-4 w-4" />
						Run the simulator
					</button>
				</div>
			</div>
		</Card>
	</div>
</section>

<WarehouseModal {open} onclose={() => (open = false)}>
	<WarehouseGame onclose={() => (open = false)} />
</WarehouseModal>
