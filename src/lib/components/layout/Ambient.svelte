<script lang="ts">
	/**
	 * Ambient background — four large, soft colour fields that drift on their own and
	 * shift position as the page scrolls, so the ground behind the content is never
	 * quite the same twice.
	 *
	 * Performance notes, because a full-viewport effect is an easy way to wreck
	 * scrolling:
	 *
	 * - Only `transform` and `opacity` animate. Both are compositor properties, so no
	 *   layout or paint happens per frame. There is deliberately no `filter: blur()`
	 *   or `hue-rotate()` — radial gradients are already soft, and a filter on a fixed
	 *   full-screen layer forces a repaint every frame.
	 * - Scroll writes one custom property, rAF-throttled, and the CSS does the rest.
	 * - Drift and scroll transforms live on separate nested elements. A keyframe
	 *   animation on `transform` would otherwise clobber the scroll-driven value.
	 */
	let progress = $state(0);

	$effect(() => {
		let frame = 0;

		function update() {
			const max = document.documentElement.scrollHeight - window.innerHeight;
			progress = max > 0 ? window.scrollY / max : 0;
		}

		function schedule() {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(update);
		}

		update();
		window.addEventListener('scroll', schedule, { passive: true });
		window.addEventListener('resize', schedule, { passive: true });

		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
		};
	});
</script>

<div class="ambient" style="--p: {progress}" aria-hidden="true">
	<span class="lamp l1"><span class="glow"></span></span>
	<span class="lamp l2"><span class="glow"></span></span>
	<span class="lamp l3"><span class="glow"></span></span>
	<span class="lamp l4"><span class="glow"></span></span>
</div>

<style>
	.ambient {
		position: fixed;
		inset: 0;
		z-index: 0;
		overflow: hidden;
		pointer-events: none;
		/* layout/paint/style, deliberately not `strict` — size containment buys nothing
		   on an inset-sized element and risks collapsing it. */
		contain: layout paint style;
	}

	.lamp {
		position: absolute;
		width: 78vmax;
		height: 78vmax;
		will-change: transform;
	}

	.glow {
		display: block;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		will-change: transform, opacity;
	}

	/*
		Each lamp travels a different distance and direction with scroll, so they slide
		across and past one another rather than moving as a sheet. The overlaps are what
		produce new hues — no hue-rotate needed, the colours mix themselves.
	*/
	.l1 {
		top: -34vmax;
		left: -22vmax;
		transform: translate3d(calc(var(--p) * 14vmax), calc(var(--p) * 30vmax), 0);
	}
	.l2 {
		top: 6vmax;
		right: -30vmax;
		transform: translate3d(calc(var(--p) * -20vmax), calc(var(--p) * 46vmax), 0);
	}
	.l3 {
		bottom: -40vmax;
		left: 10vmax;
		transform: translate3d(calc(var(--p) * 26vmax), calc(var(--p) * -36vmax), 0);
	}
	.l4 {
		top: 30vmax;
		left: -34vmax;
		transform: translate3d(calc(var(--p) * 40vmax), calc(var(--p) * -18vmax), 0);
	}

	/*
		Long, mutually prime-ish periods so the arrangement does not visibly loop.

		Light mode uses the 400/300 stops rather than 300/200. Raising opacity on the
		paler stops does almost nothing — they are already close to the ground, so more
		of the same near-white changes little. One stop deeper is what actually makes
		the wash visible on a light page.
	*/
	.l1 .glow {
		background: radial-gradient(circle, var(--color-accent-400) 0%, transparent 68%);
		opacity: 0.52;
		animation: drift-a 47s ease-in-out infinite;
	}
	.l2 .glow {
		background: radial-gradient(circle, var(--color-plum-400) 0%, transparent 68%);
		opacity: 0.48;
		animation: drift-b 61s ease-in-out infinite;
	}
	.l3 .glow {
		background: radial-gradient(circle, var(--color-moss-300) 0%, transparent 68%);
		opacity: 0.42;
		animation: drift-c 53s ease-in-out infinite;
	}
	.l4 .glow {
		background: radial-gradient(circle, var(--color-ember-300) 0%, transparent 68%);
		opacity: 0.36;
		animation: drift-d 71s ease-in-out infinite;
	}

	/* Dark mode carries the effect — an unlit dark ground was the whole complaint. */
	:global(.dark) .l1 .glow {
		background: radial-gradient(circle, var(--color-accent-600) 0%, transparent 68%);
		opacity: 0.5;
	}
	:global(.dark) .l2 .glow {
		background: radial-gradient(circle, var(--color-plum-600) 0%, transparent 68%);
		opacity: 0.5;
	}
	:global(.dark) .l3 .glow {
		background: radial-gradient(circle, var(--color-moss-700) 0%, transparent 68%);
		opacity: 0.42;
	}
	:global(.dark) .l4 .glow {
		background: radial-gradient(circle, var(--color-ember-800) 0%, transparent 68%);
		opacity: 0.38;
	}

	@keyframes drift-a {
		0%,
		100% {
			transform: translate3d(0, 0, 0) scale(1);
		}
		50% {
			transform: translate3d(7vmax, 5vmax, 0) scale(1.14);
		}
	}
	@keyframes drift-b {
		0%,
		100% {
			transform: translate3d(0, 0, 0) scale(1.08);
		}
		50% {
			transform: translate3d(-8vmax, 6vmax, 0) scale(0.94);
		}
	}
	@keyframes drift-c {
		0%,
		100% {
			transform: translate3d(0, 0, 0) scale(0.96);
		}
		50% {
			transform: translate3d(6vmax, -7vmax, 0) scale(1.16);
		}
	}
	@keyframes drift-d {
		0%,
		100% {
			transform: translate3d(0, 0, 0) scale(1.1);
		}
		50% {
			transform: translate3d(-6vmax, -5vmax, 0) scale(0.92);
		}
	}

	/*
		Reduced motion keeps the colour and drops every movement — the lamps stay lit
		where they are. Scroll coupling goes too, since that is motion the user did not
		ask for either.
	*/
	@media (prefers-reduced-motion: reduce) {
		.lamp {
			transform: none !important;
		}
		.glow {
			animation: none !important;
		}
	}
</style>
