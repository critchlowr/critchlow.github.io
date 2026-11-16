<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		onclose: () => void;
		children: Snippet;
	}

	let { open = false, onclose, children }: Props = $props();
	let el = $state<HTMLDialogElement>();

	/*
		A native modal dialog. showModal() makes the rest of the page inert, keeps
		Tab inside, and lets Escape close it wherever focus is.
	*/
	$effect(() => {
		const dialog = el;
		if (!dialog || !open) return;

		dialog.showModal();
		// Focus the dialog itself, so its name is read out. The browser would pick
		// the first control, which in the game is Reset.
		dialog.focus();
		// Stop the page behind from scrolling while the dialog is open.
		document.body.style.overflow = 'hidden';

		return () => {
			dialog.close();
			document.body.style.overflow = '';
		};
	});
</script>

<!--
	Named by the heading WarehouseGame renders, so the name and the visible title
	cannot drift apart. The element fills the screen and is its own backdrop, so a
	click that lands on it, and not on the panel inside, closes the dialog. Keyboard
	users close with Escape or the Close button in the header.

	Escape arrives as `cancel`. It is stopped there and passed to `onclose`, so
	closing always goes through the one path that also resets the shift.
-->
<dialog
	bind:this={el}
	class="text-ink fixed inset-0 m-0 h-full max-h-none w-full max-w-none items-stretch justify-center border-0 bg-black/60 p-0 backdrop-blur-sm open:flex md:items-center"
	aria-labelledby="wms-dialog-title"
	tabindex="-1"
	oncancel={(e) => {
		e.preventDefault();
		onclose();
	}}
	onclick={(e) => {
		if (e.target === e.currentTarget) onclose();
	}}
>
	{#if open}
		<!--
			Fixed height, so the window does not resize between phases; the panel
			inside scrolls instead. On mobile it is h-full rather than 100dvh: while
			browser toolbars animate, 100dvh can exceed this fixed parent and push the
			header, with its Close and Reset buttons, off the top of the screen.
		-->
		<div
			class="bg-surface modal-panel relative flex h-full w-screen flex-col overflow-hidden shadow-2xl md:h-[85vh] md:w-[90vw] md:max-w-5xl md:rounded-lg"
		>
			{@render children()}
		</div>
	{/if}
</dialog>

<style>
	/* The element is the backdrop; the browser's own would sit behind it unseen. */
	dialog::backdrop {
		background: none;
	}

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
