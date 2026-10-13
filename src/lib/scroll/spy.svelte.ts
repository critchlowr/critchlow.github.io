import { isAnimating } from './scroller';

/**
 * Tracks which of a list of elements is "current" as the page scrolls.
 *
 * This is scroll-position maths rather than an IntersectionObserver, which is
 * worth explaining because IO looks like the obvious tool.
 *
 * The published IO scrollspies all end up re-implementing this. The cleverest
 * of them extends `rootMargin` upward by the entire document height and then
 * sorts intersecting entries in reverse DOM order — which is exactly "the last
 * element whose top is above a line", written in IO's coordinate system. They
 * also need a timestamp filter to suppress the storm of callbacks IO fires on
 * first load, which their own author calls brittle.
 *
 * Three failure modes come free here:
 *
 * - **Short sections never activating.** There is no notion of "intersecting";
 *   every element above the line is a candidate and the last one wins, so a
 *   one-line section is current for exactly as long as it holds the line.
 * - **The last element never activating.** It is often too short to ever reach
 *   the line, so the bottom of the page wins outright.
 * - **Fast scrolling skipping entries.** `active` is a pure function of
 *   `scrollY` recomputed from scratch every frame, so there is no accumulated
 *   state that can desynchronise.
 *
 * Adapted from the scrollspy in Nav.svelte, which already had all of this
 * right.
 */
export interface SpyOptions {
	/** Fraction of viewport height defining the "current" line. */
	line?: number;
}

export function createSpy(getTargets: () => HTMLElement[], options: SpyOptions = {}) {
	const { line = 0.35 } = options;
	let active = $state(0);

	$effect(() => {
		let frame = 0;

		function update() {
			/*
				While a programmatic scroll is running, the page sweeps through every
				section between here and the destination. Without this the highlight
				strobes down the rail for the whole animation. The click handler sets
				`active` optimistically instead, so the rail responds on the same frame
				as the click and simply holds until the scroll lands.
			*/
			if (isAnimating()) return;

			const targets = getTargets();
			if (targets.length === 0) return;

			const threshold = window.innerHeight * line;
			let next = 0;
			for (let i = 0; i < targets.length; i++) {
				if (targets[i].getBoundingClientRect().top <= threshold) next = i;
			}

			const atBottom =
				window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
			if (atBottom) next = targets.length - 1;

			active = next;
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

	return {
		get active() {
			return active;
		},
		/** Set optimistically on click so the rail does not lag the user. */
		set active(v: number) {
			active = v;
		}
	};
}
