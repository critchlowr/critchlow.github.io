/**
 * Document scroll progress, 0..1, computed once and shared.
 *
 * Ambient.svelte was already calculating exactly this for its lamp drift, and
 * the mobile reading bar needs the same number. One rAF-throttled listener for
 * both, rather than two doing identical work on every scroll event.
 *
 * The $state lives at module scope but the listener is created by `init()`,
 * called once from +layout.svelte — the same shape theme.svelte.ts already uses,
 * and necessary because effects can only be created during component
 * initialisation.
 */
let progress = $state(0);
let started = false;

export function initScrollProgress() {
	if (started) return;
	started = true;

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
		started = false;
	};
}

export const scrollProgress = {
	get value() {
		return progress;
	}
};
