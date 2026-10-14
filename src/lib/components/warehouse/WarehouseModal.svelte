<script lang="ts">
	import type { Snippet } from 'svelte';
	import { dialog } from '$lib/actions/dialog';

	interface Props {
		open: boolean;
		onclose: () => void;
		children: Snippet;
	}

	let { open = false, onclose, children }: Props = $props();

	// Stop the page behind from scrolling while the dialog is open.
	$effect(() => {
		if (!open) return;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

{#if open}
	<!--
		Named by the heading WarehouseGame renders, so the name and the visible title
		cannot drift apart. Keyboard users close with Escape (from use:dialog) or the
		Close button in the header; the backdrop click is a pointer convenience, and
		the target check stops clicks inside the panel from counting.
	-->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="fixed inset-0 z-50 flex items-stretch justify-center bg-black/60 backdrop-blur-sm md:items-center"
		role="dialog"
		aria-modal="true"
		aria-labelledby="wms-dialog-title"
		tabindex="-1"
		use:dialog={{ onclose, initialFocus: 'container' }}
		onclick={(e) => {
			if (e.target === e.currentTarget) onclose();
		}}
	>
		<!--
			Fixed height, so the window does not resize between phases; the panel
			inside scrolls instead. On mobile it is h-full rather than 100dvh: while
			browser toolbars animate, 100dvh can exceed this fixed parent and push the
			header, with its Close and Reset buttons, off the top of the screen.
		-->
		<div
			class="bg-surface modal-panel relative z-10 flex h-full w-screen flex-col overflow-hidden shadow-2xl md:h-[85vh] md:w-[90vw] md:max-w-5xl md:rounded-2xl"
		>
			{@render children()}
		</div>
	</div>
{/if}

<style>
	/* Keep the header clear of a notch and the panel clear of the home indicator. */
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
