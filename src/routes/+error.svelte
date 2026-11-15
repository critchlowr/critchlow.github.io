<script lang="ts">
	import { page } from '$app/state';

	const notFound = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{notFound ? 'Page not found' : 'Something went wrong'} | Ryan Critchlow</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="flex min-h-[80vh] items-center px-5 pt-24 pb-16" aria-labelledby="error-heading">
	<div class="mx-auto w-full max-w-2xl">
		<!-- Georgia, from the header logo. Masked so the line art takes the ink colour in both themes. -->
		<span class="logo-mark text-ink-strong block h-28 w-44 bg-current" aria-hidden="true"></span>
		<h1 id="error-heading" class="font-display text-ink-strong text-display mt-8 font-extrabold">
			{notFound ? 'Page not found' : 'Something went wrong'}
		</h1>
		<p class="text-ink text-body mt-6 max-w-xl">
			{#if notFound}
				There is nothing at <code class="font-mono text-base">{page.url.pathname}</code>. The link
				may have a typo, or the page may have moved.
			{:else}
				{page.error?.message ?? 'An unexpected error stopped this page from loading.'}
			{/if}
		</p>
		<a href="/" class="btn btn-primary mt-10"> Back to the main page </a>
	</div>
</section>

<style>
	.logo-mark {
		mask: url('/images/logo-dog.png') left center / contain no-repeat;
		-webkit-mask: url('/images/logo-dog.png') left center / contain no-repeat;
	}

	/* Forced-colours mode repaints backgrounds, which would hide the masked logo. */
	@media (forced-colors: active) {
		.logo-mark {
			forced-color-adjust: none;
			background-color: CanvasText;
		}
	}
</style>
