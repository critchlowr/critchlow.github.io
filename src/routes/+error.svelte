<script lang="ts">
	import { page } from '$app/state';

	const notFound = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{notFound ? 'Page not found' : 'Something went wrong'} | Ryan Critchlow</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<!--
	Worded as a WMS short-pick exception, the same event the simulator stages when a
	picker reaches an empty location.
-->
<section class="flex min-h-[80vh] items-center px-5 pt-24 pb-16" aria-labelledby="error-heading">
	<div class="mx-auto w-full max-w-2xl">
		<p class="text-brand font-mono text-sm font-semibold tracking-[0.14em] uppercase">
			{notFound ? 'Exception · Location empty' : `Exception · ${page.status}`}
		</p>
		<h1 id="error-heading" class="text-ink-strong font-display text-display mt-4 font-semibold">
			{notFound ? 'Nothing at this location.' : 'Something went wrong.'}
		</h1>
		<p class="text-ink text-body mt-6 max-w-xl">
			{#if notFound}
				The picker reached <code class="font-mono text-base">{page.url.pathname}</code> and found the
				slot empty. The page may have moved, or the link may have a typo.
			{:else}
				{page.error?.message ?? 'An unexpected error stopped this page from loading.'}
			{/if}
		</p>
		<a
			href="/"
			class="bg-accent-700 hover:bg-accent-800 ease-spring mt-10 inline-block rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-sm transition-[background-color,transform] duration-200 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
		>
			Back to the main page
		</a>
	</div>
</section>
