<script lang="ts">
	import type { Snippet } from 'svelte';
	import { portal } from '$lib/actions/portal';

	let {
		open = false,
		onclose,
		children
	}: { open: boolean; onclose: () => void; children: Snippet } = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
	}

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
	<div
		use:portal
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		aria-label="Warehouse Management Simulator"
		tabindex="-1"
		onkeydown={handleKeydown}
	>
		<!-- Backdrop click to close -->
		<button
			type="button"
			class="absolute inset-0 cursor-default"
			onclick={onclose}
			aria-label="Close simulator"
			tabindex="-1"
		></button>

		<!--
			Fixed height rather than max-height: the window must not resize as the panel
			below the scene changes between phases. Overflow is handled by the panel,
			which scrolls.
		-->
		<div
			class="bg-warm-50 dark:bg-warm-900 relative z-10 flex h-[100dvh] w-screen flex-col overflow-hidden shadow-2xl md:h-[85vh] md:w-[90vw] md:max-w-5xl md:rounded-2xl"
		>
			{@render children()}

			<!--
				The warehouse floor runs the width of the scene and is laid out for the
				taller view. A phone turned sideways has nowhere near the height for it,
				so cover the game rather than let it render badly. Shown purely by media
				query — see the style block for why it is scoped the way it is.
			-->
			<div class="rotate-notice bg-warm-50 dark:bg-warm-900" role="status">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="text-accent-600 dark:text-accent-300 h-10 w-10"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.75"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<rect x="7" y="2" width="10" height="20" rx="2" />
					<path d="M3 9a9 9 0 0 1 3-4" />
					<polyline points="2 5 3 9 7 8" />
				</svg>
				<p class="text-warm-800 dark:text-warm-100 text-base font-semibold">
					Turn your phone upright to play
				</p>
				<p class="text-warm-600 dark:text-warm-400 max-w-xs text-sm">
					The warehouse floor is laid out across the screen, so the simulator needs the taller view.
				</p>
				<button
					type="button"
					class="border-warm-300 text-warm-700 hover:border-accent-400 hover:text-accent-700 dark:border-warm-600 dark:text-warm-300 mt-1 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors"
					onclick={onclose}
				>
					Close the simulator
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.rotate-notice {
		display: none;
	}

	/*
		All three conditions matter:
		- orientation: landscape, the case we are catching;
		- max-height 500px, so a short desktop window is not mistaken for a phone;
		- pointer: coarse, so only touch devices are affected. A laptop dragged to a
		  squat window keeps the game.
		A tablet in landscape is taller than 500px and so keeps it too.
	*/
	@media (orientation: landscape) and (max-height: 500px) and (pointer: coarse) {
		.rotate-notice {
			position: absolute;
			inset: 0;
			z-index: 20;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 0.5rem;
			padding: 1.5rem;
			text-align: center;
		}
	}
</style>
