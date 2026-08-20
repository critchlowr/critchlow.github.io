<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme.svelte';
	import Nav from '$lib/components/layout/Nav.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import SkipLink from '$lib/components/layout/SkipLink.svelte';
	import Ambient from '$lib/components/layout/Ambient.svelte';
	import { goToHash } from '$lib/scroll/scroller';
	import { initScrollProgress } from '$lib/scroll/progress.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	/*
		One delegated handler for every in-page fragment link — nav, hero buttons,
		footer contacts, and both rails — so none of them has to import anything.

		Capture phase is not a style choice. SvelteKit's router bails out when it
		sees event.defaultPrevented, but its own listener is a bubble listener on the
		app container, so a bubble listener here would run after it and be too late
		to stop it.
	*/
	$effect(() => {
		function onClick(e: MouseEvent) {
			if (e.defaultPrevented || e.button !== 0) return;
			if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

			const anchor = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
			// The skip link opts out: it has to be instantaneous, and animating it
			// would defeat the point of a bypass mechanism.
			if (!anchor || anchor.dataset.noSmooth !== undefined) return;

			const url = new URL(anchor.href, location.href);
			if (url.origin !== location.origin) return;
			if (url.pathname !== location.pathname) return; // cross-page: let the router do it
			if (!url.hash) return;

			// Only claim the click if the target actually exists on this page.
			if (goToHash(url.hash)) e.preventDefault();
		}

		document.addEventListener('click', onClick, true);
		return () => document.removeEventListener('click', onClick, true);
	});

	// One shared scroll listener for the ambient lamps and the mobile reading bar.
	$effect(() => initScrollProgress());

	onMount(() => {
		theme.init();

		// For the sort of reader who opens devtools on a portfolio — which, for these
		// roles, is a decent share of them.
		console.log(
			'%cORD-000  ·  1 line  ·  Staged\n%cYou found the pick list. Say hello: critchlow.rc@gmail.com',
			'font-family:monospace;font-weight:700;color:#845e00',
			'font-family:monospace;color:#135c73'
		);
	});
</script>

<Ambient />
<SkipLink />
<Nav />
<!-- Everything after the ambient layer needs its own stacking context above it. -->
<main id="main-content" tabindex="-1" class="relative z-10">
	{@render children()}
</main>
<div class="relative z-10">
	<Footer />
</div>
