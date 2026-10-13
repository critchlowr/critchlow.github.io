/**
 * Makes a scroll container keyboard-operable — but only while it actually
 * scrolls.
 *
 * A container that overflows cannot be scrolled with the arrow keys unless it
 * can hold focus, so its far end is unreachable without a pointer (SC 2.1.1;
 * this is axe's `scrollable-region-focusable`). The naive fix is a permanent
 * `tabindex="0"` in the markup, but that adds a tab stop on wide viewports where
 * the content fits and there is nothing to scroll — a stop that does nothing is
 * its own small accessibility problem.
 *
 * So the attributes are applied and removed as the overflow appears and
 * disappears. The role and label go on at the same time, because a focusable div
 * with no accessible name is an unlabelled tab stop.
 */
export function scrollable(
	node: HTMLElement,
	options: { label: string; role?: 'group' | 'region' }
) {
	const { label, role = 'region' } = options;

	function sync() {
		// 1px of slack: sub-pixel layout regularly leaves scrollWidth a hair over
		// clientWidth on containers that visually do not scroll at all.
		const overflows = node.scrollWidth > node.clientWidth + 1;

		if (overflows) {
			node.setAttribute('tabindex', '0');
			node.setAttribute('role', role);
			node.setAttribute('aria-label', label);
			return;
		}

		// Never pull focusability out from under the element the user is on — that
		// would drop focus to <body> mid-interaction.
		if (document.activeElement === node) return;

		node.removeAttribute('tabindex');
		node.removeAttribute('role');
		node.removeAttribute('aria-label');
	}

	sync();

	const observer =
		typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => sync()) : undefined;
	observer?.observe(node);
	window.addEventListener('resize', sync, { passive: true });

	return {
		destroy() {
			observer?.disconnect();
			window.removeEventListener('resize', sync);
		}
	};
}
