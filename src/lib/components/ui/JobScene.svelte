<script lang="ts">
	/**
	 * A small hand-drawn still life along the bottom of a job card: bar tools for
	 * bartending, a circular saw for construction, a workbench for woodworking.
	 *
	 * The drawings are static SVG files rather than inline markup, so they stay out of
	 * the JS bundle, load lazily, and cache. They're decorative, so they have no alt text.
	 */
	let { scene }: { scene: 'bar' | 'saw' | 'bench' } = $props();
</script>

<div class="scene bg-warm-100 dark:bg-warm-800" aria-hidden="true">
	<img
		src="/illustrations/{scene}.svg"
		alt=""
		width="440"
		height="150"
		loading="lazy"
		decoding="async"
	/>
</div>

<style>
	.scene {
		position: relative;
		height: 8.5rem;
		overflow: hidden;
	}

	@media (width >= 48rem) {
		.scene {
			height: 10rem;
		}
	}

	img {
		position: absolute;
		/* Sits a hair into the counter line so the objects rest on it. */
		inset: auto 0 calc(0.75rem - 3px);
		width: 100%;
		height: calc(100% - 1.25rem);
		object-fit: contain;
		object-position: center bottom;
	}

	/* The counter, bench or plank everything stands on. */
	.scene::after {
		content: '';
		position: absolute;
		inset: auto 0 0;
		height: 0.75rem;
		border-top: 2px solid #3b2a1e;
		background: var(--color-warm-300);
	}

	:global(.dark) .scene::after {
		background: var(--color-warm-900);
	}
</style>
