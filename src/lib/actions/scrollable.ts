/**
 * Makes a horizontal scroll container keyboard-operable, but only while it
 * actually overflows.
 *
 * An overflowing region must be focusable or its far end is unreachable without
 * a pointer (SC 2.1.1, axe's scrollable-region-focusable). A permanent
 * tabindex="0" would add a useless tab stop on wide screens, so the tabindex,
 * role and accessible name are added and removed as the overflow comes and goes.
 */

import type { Action } from 'svelte/action';

export interface ScrollableOptions {
	label: string;
	role?: 'group' | 'region';
}

export const scrollable: Action<HTMLElement, ScrollableOptions> = (node, initial) => {
	let options = initial;

	function sync() {
		// 1px of slack: sub-pixel layout can leave scrollWidth a hair over
		// clientWidth on a container that does not visibly scroll.
		const overflows = node.scrollWidth > node.clientWidth + 1;

		if (overflows) {
			node.setAttribute('tabindex', '0');
			node.setAttribute('role', options.role ?? 'region');
			node.setAttribute('aria-label', options.label);
			return;
		}

		// Never remove focusability from the focused element; focus would drop to <body>.
		if (document.activeElement === node) return;

		node.removeAttribute('tabindex');
		node.removeAttribute('role');
		node.removeAttribute('aria-label');
	}

	// Watching the content as well as the container catches overflow that comes
	// from the content growing, not just from the container shrinking.
	const observer = new ResizeObserver(sync);
	observer.observe(node);
	if (node.firstElementChild) observer.observe(node.firstElementChild);
	sync();

	return {
		update(next) {
			options = next;
			sync();
		},
		destroy() {
			observer.disconnect();
		}
	};
};
