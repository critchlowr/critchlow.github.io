<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme.svelte';
	import Nav from '$lib/components/layout/Nav.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import SkipLink from '$lib/components/layout/SkipLink.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

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

<SkipLink />
<Nav />
<main id="main-content" tabindex="-1">
	{@render children()}
</main>
<Footer />
