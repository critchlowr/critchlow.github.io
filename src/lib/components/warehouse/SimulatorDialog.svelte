<script lang="ts">
	/*
		The simulator, opened over whatever page the reader is on. Its first screen is a
		short introduction with the fulfillment sequence; "Start the shift" swaps in
		the game. Mounted once, in the layout, and opened through the simulator store.
	*/
	import { tick } from 'svelte';
	import { simulator } from '#lib/stores/simulator.svelte.ts';
	import Icon from '#lib/components/ui/Icon.svelte';
	import WarehouseModal from './WarehouseModal.svelte';
	import WarehouseGame from './WarehouseGame.svelte';

	let started = $state(false);
	let intro = $state<HTMLElement>();

	// The main sequence. Shorting is not a step in it; the note under it covers that.
	const steps = ['Wave', 'Pick', 'Stage', 'Pack', 'Load', 'Ship'];

	async function close() {
		simulator.hide();
		started = false;
		// After the dialog is gone and the page behind it can take focus again.
		await tick();
		simulator.restoreFocus();
	}

	async function start() {
		// Found before the swap: the Start button is about to be removed, so focus
		// goes to the dialog itself, which is then named by the game's title.
		const dialog = intro?.closest<HTMLElement>('[role="dialog"]');
		started = true;
		await tick();
		dialog?.focus();
	}
</script>

<WarehouseModal open={simulator.open} onclose={close}>
	{#if started}
		<WarehouseGame onclose={close} />
	{:else}
		<div class="border-edge flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2">
			<h2 id="wms-dialog-title" class="text-ink-strong pl-2 text-sm font-bold sm:text-base">
				Warehouse simulator
			</h2>
			<button
				type="button"
				class="text-ink-muted hover:bg-band hover:text-ink-strong inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors"
				onclick={close}
				aria-label="Close simulator"
			>
				<Icon name="close" />
			</button>
		</div>

		<div
			bind:this={intro}
			class="flex flex-1 items-center justify-center gap-14 overflow-y-auto overscroll-contain p-[clamp(1.5rem,5vw,3rem)]"
		>
			<div class="max-w-[34rem]">
				<p class="text-ink text-lg leading-relaxed">
					For three years I administered warehouse management systems for four enterprise accounts.
					This walks through the flow I explained most often.
				</p>
				<ol
					class="my-5 flex flex-wrap items-center gap-x-1 gap-y-2"
					aria-label="Fulfillment sequence"
				>
					{#each steps as step, i (step)}
						<li class="flex items-center gap-1">
							<span class="bg-chip text-ink rounded-full px-3 py-1 text-[0.95rem] font-bold">
								{step}
							</span>
							{#if i < steps.length - 1}
								<span class="text-ink-muted" aria-hidden="true">&rarr;</span>
							{/if}
						</li>
					{/each}
				</ol>
				<p class="text-ink-muted mb-7">
					When a pick location is empty, the line shorts, replenishment refills the location, and
					the pick is tried again. If it can't be refilled in time, you choose whether the order
					waits or ships partial.
				</p>
				<button type="button" class="btn btn-primary" onclick={start}>
					<Icon name="play" class="h-4 w-4" />
					Start the shift
				</button>
			</div>
			<img
				class="ink-art hidden h-auto w-36 -rotate-3 md:block"
				src="/illustrations/cartons.svg"
				alt=""
				width="84"
				height="90"
			/>
		</div>
	{/if}
</WarehouseModal>
