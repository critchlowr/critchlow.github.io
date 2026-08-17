export interface InviewOptions {
	/** Direction the element travels from. `none` fades with no movement. */
	dir?: 'up' | 'left' | 'right' | 'scale' | 'none';
	/** Stagger position within a group. Drives `--i`, which the CSS turns into a delay. */
	i?: number;
	/**
	 * How far up the viewport the element must travel before it reveals, as a
	 * fraction of viewport height. 0.15 means "once it is 15% past the bottom edge".
	 */
	margin?: number;
}

/**
 * Reveals an element when it scrolls into view.
 *
 * Two things here are deliberate and were both bugs before:
 *
 * 1. The trigger is viewport-relative (`rootMargin`), not element-relative
 *    (`threshold`). A threshold of 0.1 fires once 10% of the *element* is visible,
 *    so a 4000px section revealed after 400px — down at the very bottom edge of a
 *    desktop viewport, finishing long before the content reached reading position.
 *    How tall a section happens to be at a given breakpoint should not decide when
 *    it animates.
 *
 * 2. `prefers-reduced-motion` no longer bypasses the observer. It used to add
 *    `in-view` immediately and return, so the entire page was simply present with
 *    no transition at all. Vestibular guidance targets movement — translation,
 *    parallax, scale — not opacity, so the reduced-motion path still reveals on
 *    scroll and still staggers; the CSS just strips the transform.
 */
export function inview(node: HTMLElement, options: InviewOptions = {}) {
	const { dir = 'up', i, margin = 0.15 } = options;

	// A `.stagger` container animates its children, so it must not also animate itself.
	if (!node.classList.contains('stagger')) {
		node.classList.add('reveal');
		if (dir !== 'none') node.dataset.dir = dir;
	}
	if (i !== undefined) node.style.setProperty('--i', String(i));

	// IntersectionObserver cannot be constructed during SSR or in a test DOM
	// without it; showing the content is the correct fallback either way.
	if (typeof IntersectionObserver === 'undefined') {
		node.classList.add('in-view');
		return {};
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				node.classList.add('in-view');
				observer.unobserve(node);
			}
		},
		{ rootMargin: `0px 0px -${Math.round(margin * 100)}% 0px`, threshold: 0 }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}
