<script lang="ts">
	/*
		The simulator used to live on this page. It now opens over the main page, so
		this address sends the reader there with the simulator already open. Any
		?theme= in the address is kept, for the accessibility runs.
	*/
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { simulator } from '$lib/stores/simulator.svelte';

	// Opened after the move: a navigation resets focus, which would pull it out of the dialog.
	onMount(async () => {
		await goto(`/${location.search}`, { replaceState: true });
		simulator.show();
	});
</script>

<svelte:head>
	<title>Warehouse simulator | Ryan Critchlow</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<!-- Shown only for a moment, or when scripts are off. -->
<section class="wrap pt-28 pb-20" aria-labelledby="simulator-heading">
	<h1 id="simulator-heading" class="font-display text-ink-strong text-section font-extrabold">
		Warehouse simulator
	</h1>
	<p class="text-ink text-body max-w-measure mt-6">
		The simulator opens on the main page, from the Körber tile at the top or the Körber role under
		Experience.
	</p>
	<a href="/" class="btn btn-primary mt-8">Go to the main page</a>
</section>
