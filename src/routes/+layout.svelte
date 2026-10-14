<script lang="ts">
	import '../app.css';
	import { onMount, type Snippet } from 'svelte';
	import { theme } from '$lib/stores/theme.svelte';
	import Nav from '$lib/components/layout/Nav.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import SkipLink from '$lib/components/layout/SkipLink.svelte';
	// The font packages' exports block direct file imports, hence the root-relative paths.
	import frauncesLatin from '/node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2?url';
	import interLatin from '/node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() => {
		theme.init();

		// A note for anyone who opens the console.
		console.log(
			'%cORD-000  ·  1 line  ·  Staged\n%cYou found the pick list. Say hello: critchlow.rc@gmail.com',
			'font-family:monospace;font-weight:700;color:#845e00',
			'font-family:monospace;color:#135c73'
		);
	});
</script>

<!--
	Fonts are otherwise found only after the stylesheet is parsed. Preloading the
	Latin subsets of the heading and body faces starts both downloads at once.
-->
<svelte:head>
	<link rel="preload" href={frauncesLatin} as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="preload" href={interLatin} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

<SkipLink />
<Nav />
<main id="main-content" tabindex="-1">
	{@render children()}
</main>
<Footer />
