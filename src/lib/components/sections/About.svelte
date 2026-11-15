<script lang="ts">
	import { about } from '$lib/data/content';
</script>

<!--
	Directly under the hero, so the personal note is read with the introduction and
	not left at the foot of the page. The lab from the header is shown large beside it.
-->
<section id="about" aria-labelledby="about-heading">
	<div
		class="wrap grid items-center gap-x-16 gap-y-8 py-16 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:py-20"
	>
		<div>
			<h2 id="about-heading" class="font-display text-ink-strong text-section font-extrabold">
				About
			</h2>
			<div class="max-w-measure mt-8 space-y-4">
				{#each about.paragraphs as paragraph (paragraph)}
					<p class="text-ink text-lede">{paragraph}</p>
				{/each}
			</div>
		</div>
		<!-- Masked so the line art takes the ink colour in both themes. -->
		<span
			class="logo-mark text-ink-strong block aspect-[297/192] w-full max-w-64 bg-current md:max-w-none"
			aria-hidden="true"
		></span>
	</div>
</section>

<style>
	.logo-mark {
		mask: url('/images/logo-dog.png') center / contain no-repeat;
		-webkit-mask: url('/images/logo-dog.png') center / contain no-repeat;
	}

	/* Forced-colours mode repaints backgrounds, which would hide the masked logo. */
	@media (forced-colors: active) {
		.logo-mark {
			forced-color-adjust: none;
			background-color: CanvasText;
		}
	}
</style>
