/**
 * Anchor scrolling with a duration we control.
 *
 * `scroll-behavior: smooth` was doing this before, and it could not be tuned:
 * CSSOM View defines the duration and easing as "user-agent-defined", with no
 * author knob at all. In practice engines pick a near-constant duration, so a
 * short hop felt fine and a full-page jump felt like a teleport.
 *
 * Note that `html { scroll-behavior: smooth }` MUST stay removed from app.css
 * for this to work. The spec's scroll algorithm begins by aborting any ongoing
 * smooth scroll, so with that rule in place each of the ~60 writes per second
 * below would cancel the one before it and the page would crawl or stall — with
 * nothing obviously wrong in this file.
 */

import { replaceState } from '$app/navigation';
import { page } from '$app/state';

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Milliseconds per 1000px travelled. */
const SPEED = 700;
/** Below this a scroll reads as a jump anyway, so do not drag it out. */
const MIN = 360;
/** Above this, longer stops reading as smoother and starts reading as slow. */
const MAX = 1100;

/** Keys that mean "I want to scroll myself". */
const CANCEL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']);

let frame = 0;
let detach: (() => void) | null = null;

/** True while a programmatic scroll is running. Rails use this to suspend. */
export const isAnimating = () => frame !== 0;

export function stopScroll() {
	if (frame) cancelAnimationFrame(frame);
	frame = 0;
	detach?.();
	detach = null;
}

export function smoothScrollTo(target: number, onDone?: () => void) {
	stopScroll();

	// Read per call rather than caching at module load, so changing the OS
	// setting mid-session takes effect without a reload.
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	const start = window.scrollY;
	const max = document.documentElement.scrollHeight - window.innerHeight;
	const end = Math.max(0, Math.min(target, max));
	const delta = end - start;

	if (reduce || Math.abs(delta) < 8) {
		window.scrollTo({ top: end, behavior: 'instant' });
		onDone?.();
		return;
	}

	const duration = Math.min(MAX, Math.max(MIN, (Math.abs(delta) / 1000) * SPEED));
	const t0 = performance.now();

	/*
		Hand control back the instant the user asks for it. A scroller that keeps
		animating while someone is spinning the wheel is worse than no scroller —
		the two fight and the page appears to stick. `once` means the first input
		wins and the listener removes itself; keydown is capture-phase so a space
		press aborts before anything else acts on it.
	*/
	const onKey = (e: KeyboardEvent) => {
		if (CANCEL_KEYS.has(e.key)) stopScroll();
	};
	window.addEventListener('wheel', stopScroll, { passive: true, once: true });
	window.addEventListener('touchstart', stopScroll, { passive: true, once: true });
	window.addEventListener('keydown', onKey, true);
	detach = () => {
		window.removeEventListener('wheel', stopScroll);
		window.removeEventListener('touchstart', stopScroll);
		window.removeEventListener('keydown', onKey, true);
	};

	function step(now: number) {
		const t = Math.min(1, (now - t0) / duration);
		window.scrollTo({ top: Math.round(start + delta * easeInOutCubic(t)), behavior: 'instant' });
		if (t < 1) {
			frame = requestAnimationFrame(step);
			return;
		}
		stopScroll();
		onDone?.();
	}

	frame = requestAnimationFrame(step);
}

/**
 * Nav offset, read from the same custom properties `scroll-padding-top` uses,
 * so a programmatic scroll and a native fragment jump land in the same place.
 */
function navOffset() {
	const root = getComputedStyle(document.documentElement);
	const rem = (name: string, fallback: number) => {
		const v = parseFloat(root.getPropertyValue(name));
		return Number.isFinite(v) ? v * 16 : fallback;
	};
	return rem('--nav-h', 61) + rem('--nav-gap', 20);
}

/**
 * Scrolls to a fragment and leaves focus and history in a correct state.
 *
 * Returns false if nothing on the page matches, so the caller can decline to
 * preventDefault and let the browser do whatever it would have done.
 */
export function goToHash(hash: string) {
	const id = decodeURIComponent(hash.replace(/^#/, ''));
	if (!id) return false;

	const el = document.getElementById(id);
	if (!el) return false;

	const top = el.getBoundingClientRect().top + window.scrollY - navOffset();

	smoothScrollTo(top, () => {
		/*
			Three things here are the difference between "scrolls nicely" and "works
			for keyboard and screen-reader users":

			1. A <section> or <h2> is not focusable, so .focus() would be a silent
			   no-op and the user's next Tab would continue from the link they just
			   clicked — i.e. to the next nav link, not into the content.
			2. preventScroll, or focusing re-jumps the page and undoes the easing.
			3. replaceState from $app/navigation, not history.pushState. SvelteKit
			   keeps its own bookkeeping in history.state; a raw pushState wipes it
			   and breaks scroll restoration. replace rather than push also keeps Back
			   meaning "the previous page" instead of filling history with fragments.
		*/
		if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
		el.focus({ preventScroll: true });

		try {
			replaceState('#' + id, page.state);
		} catch {
			// replaceState throws if the router has not initialised yet. The scroll
			// and focus have already happened, which is the part that matters.
		}
	});

	return true;
}
