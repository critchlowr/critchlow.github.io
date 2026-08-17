<script lang="ts">
	import type { Snippet } from 'svelte';
	import { dialog } from '$lib/actions/dialog';

	let {
		open = false,
		onclose,
		children
	}: { open: boolean; onclose: () => void; children: Snippet } = $props();

	$effect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

{#if open}
	<!--
		Clicking the backdrop closes, guarded on `e.target === e.currentTarget` so a
		click anywhere inside the panel does not bubble up as a backdrop click. This
		replaces a full-bleed `<button>` that sat behind the panel: it was
		`tabindex="-1"` yet still in the accessibility tree, so it read as a third
		unreachable control named "Close simulator". A real Close button lives in the
		header, which is what keeps 2.1.1 satisfied without it.

		The keyboard path is Escape, bound inside `use:dialog`, plus that Close button,
		so this click handler is a pointer convenience rather than the only way out.

		`aria-labelledby` points at the heading WarehouseGame already renders, so the
		dialog's name and its visible title cannot drift apart.
	-->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="fixed inset-0 z-50 flex items-stretch justify-center bg-black/60 backdrop-blur-sm md:items-center"
		role="dialog"
		aria-modal="true"
		aria-labelledby="wms-dialog-title"
		tabindex="-1"
		use:dialog={{ onclose }}
		onclick={(e) => {
			if (e.target === e.currentTarget) onclose();
		}}
	>
		<!--
			Fixed height rather than max-height: the window must not resize as the panel
			below the scene changes between phases. Overflow is handled by the panel,
			which scrolls.

			`h-full` on mobile, not `h-[100dvh]`. The two look equivalent and are not:
			this sits in a `fixed inset-0` parent, and on iOS Safari and Chrome Android
			100dvh can exceed that parent's height while the browser toolbars are
			collapsing or expanding. A centred flex child that overflows its container
			overflows equally in BOTH directions, and the top overflow is unreachable —
			which took the header, and with it the only Close and Reset controls, off
			the top of the screen. Sizing to the parent makes that impossible; the
			parent is by definition on-screen.
		-->
		<div
			class="bg-warm-50 dark:bg-warm-900 modal-panel relative z-10 flex h-full w-screen flex-col overflow-hidden shadow-2xl md:h-[85vh] md:w-[90vw] md:max-w-5xl md:rounded-2xl"
		>
			{@render children()}
		</div>
	</div>
{/if}

<style>
	/*
		Notched devices: keep the header clear of the status bar and the scrolling
		panel clear of the home indicator. No-ops everywhere else, since env()
		resolves to 0 when there are no insets.
	*/
	.modal-panel {
		padding-top: env(safe-area-inset-top);
		padding-bottom: env(safe-area-inset-bottom);
	}

	@media (min-width: 48rem) {
		.modal-panel {
			padding-top: 0;
			padding-bottom: 0;
		}
	}
</style>
