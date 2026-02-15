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
	});
</script>

<SkipLink />
<Nav />
<main id="main-content" tabindex="-1">
	{@render children()}
</main>
<Footer />
