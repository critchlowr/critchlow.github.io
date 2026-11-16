<script lang="ts">
	import '../app.css';
	import { onMount, type Snippet } from 'svelte';
	import { theme } from '#lib/stores/theme.svelte.ts';
	import Nav from '#lib/components/layout/Nav.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import SkipLink from '#lib/components/layout/SkipLink.svelte';
	// The font packages' exports block direct file imports, hence the root-relative paths.
	import sansLatin from '/node_modules/@fontsource-variable/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-wght-normal.woff2?url';
	import displayFont from '#lib/assets/fonts/gabarito-display.woff2?url';
	import SimulatorDialog from '#lib/components/warehouse/SimulatorDialog.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() => {
		theme.init();

		// A note for anyone who opens the console.
		console.log(
			'%cOrder #1000  ·  1 line  ·  Staged\n%cYou found the pick list. Say hello: critchlow.rc@gmail.com',
			'font-family:monospace;font-weight:700;color:#7a2a26',
			'font-family:monospace;color:#5a4d3f'
		);
	});
</script>

<!--
	Fonts are otherwise found only after the stylesheet is parsed. Preloading the two
	files used above the fold, the text face and the heading face, starts those
	downloads at once.
-->
<svelte:head>
	<link rel="preload" href={sansLatin} as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="preload" href={displayFont} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

<SkipLink />
<Nav />
<main id="main-content" tabindex="-1">
	{@render children()}
</main>
<Footer />
<!-- One simulator dialog for the whole site; any button can open it. -->
<SimulatorDialog />
