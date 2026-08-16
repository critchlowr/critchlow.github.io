<script lang="ts">
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';
	import WarehouseModal from '$lib/components/warehouse/WarehouseModal.svelte';
	import WarehouseGame from '$lib/components/warehouse/WarehouseGame.svelte';
	import { simulator } from '$lib/stores/simulator.svelte';

	// The main sequence. Shorting is not a step in it — see the branch below.
	const steps = ['Wave', 'Pick', 'Stage', 'Pack', 'Load', 'Ship'];
	const branch = ['Short', 'Replenish'];
</script>

<SectionWrapper id="simulator" headingId="simulator-heading" number="04" title="WMS Simulator" alt>
	<div
		class="border-warm-200 dark:border-warm-700 dark:bg-warm-800 rounded-xl border bg-white p-6 md:p-8"
	>
		<div class="max-w-2xl space-y-4">
			<p class="text-warm-700 dark:text-warm-300 leading-relaxed">
				For three years I administered warehouse management systems for four enterprise accounts.
				Most of that job was explaining the same flow to people who had never worked in a warehouse:
				an order comes in, inventory gets allocated, someone walks the floor and picks it, and what
				gets picked is packed and shipped.
			</p>
			<p class="text-warm-700 dark:text-warm-300 leading-relaxed">
				So I built the flow instead of describing it. The interesting part is the exception. If the
				picker reaches the location and it is empty, that line shorts, replenishment refills the
				location, and the pick gets tried again. If it cannot be refilled in time, someone has to
				decide whether the customer waits or gets a partial shipment. That decision is the whole
				job.
			</p>

			<!--
				One grid so the exception branch can start in the same column as Pick.
				Each step is a column; the branch is a final list item placed at column 2
				(Pick) and spanning to the end, which keeps it aligned no matter how the
				pill widths change. Scrolls inside itself on narrow screens.
			-->
			<div class="overflow-x-auto pt-2">
				<ol
					class="grid w-max items-center gap-x-1 gap-y-2"
					style="grid-template-columns: repeat({steps.length}, auto);"
					aria-label="Warehouse fulfillment sequence, with the exception path when a pick location is empty"
				>
					{#each steps as step, i (step)}
						<li class="flex items-center gap-1">
							<span
								class="bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200 rounded-full px-3 py-1 text-sm font-medium"
							>
								{step}
							</span>
							{#if i < steps.length - 1}
								<span class="text-warm-400 dark:text-warm-500" aria-hidden="true">&rarr;</span>
							{/if}
						</li>
					{/each}

					<li class="flex items-center gap-1" style="grid-column: 2 / -1;">
						<span class="text-warm-400 dark:text-warm-500" aria-hidden="true">&#8627;</span>
						<span class="text-warm-500 dark:text-warm-400 mr-1 text-sm">location empty</span>
						{#each branch as step (step)}
							<span
								class="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300"
							>
								{step}
							</span>
							<span class="text-warm-400 dark:text-warm-500" aria-hidden="true">&rarr;</span>
						{/each}
						<span class="text-warm-500 dark:text-warm-400 text-sm">back to Pick</span>
					</li>
				</ol>
			</div>

			<div class="pt-2">
				<button
					type="button"
					class="bg-accent-500 focus:ring-accent-400 dark:bg-accent-600 dark:focus:ring-offset-warm-800 inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-500 focus:ring-2 focus:ring-offset-2 focus:outline-none dark:hover:bg-red-600"
					onclick={() => simulator.launch()}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
					>
						<path
							fill-rule="evenodd"
							d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h6v4H7V5zm2 6h2v2H9v-2z"
							clip-rule="evenodd"
						/>
					</svg>
					Run the simulator
				</button>
			</div>
		</div>
	</div>
</SectionWrapper>

<WarehouseModal open={simulator.open} onclose={() => simulator.close()}>
	<WarehouseGame onclose={() => simulator.close()} />
</WarehouseModal>
