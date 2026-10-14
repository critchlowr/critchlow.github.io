/**
 * Modal dialog behaviour for an element with role="dialog" aria-modal="true":
 * focus moves in on open, Tab is trapped, Escape closes from anywhere inside,
 * everything outside is inert, and focus returns to the opener on close.
 *
 * Used by the simulator and the photo lightbox.
 */

import type { Action } from 'svelte/action';

export interface DialogOptions {
	onclose: () => void;
	/**
	 * Where focus lands on open. `'first'` (default) focuses the first control,
	 * right when that is a Close button. `'container'` focuses the dialog itself so
	 * its name is announced, for dialogs whose first control is destructive (the
	 * simulator's is Reset).
	 */
	initialFocus?: 'first' | 'container';
}

const TABBABLE =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
	'textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

// Content inside a closed <details> has client rects but cannot take focus, so
// counting it would let Tab escape past the real last control.
function inClosedDetails(el: HTMLElement) {
	const details = el.closest('details:not([open])');
	return !!details && !(el.tagName === 'SUMMARY' && el.parentElement === details);
}

function tabbable(root: HTMLElement) {
	return Array.from(root.querySelectorAll<HTMLElement>(TABBABLE)).filter(
		(el) => el.getClientRects().length > 0 && !inClosedDetails(el)
	);
}

/**
 * Marks every sibling of `node` and of each of its ancestors as inert. Unlike
 * aria-modal alone, `inert` reliably removes the page from both the tab order
 * and the accessibility tree. Returns an undo that skips anything already inert.
 */
function inertOutside(node: HTMLElement) {
	const touched: HTMLElement[] = [];
	let el: HTMLElement = node;

	while (el !== document.body && el.parentElement) {
		const parent: HTMLElement = el.parentElement;
		for (const sibling of Array.from(parent.children)) {
			if (sibling !== el && sibling instanceof HTMLElement && !sibling.inert) {
				sibling.inert = true;
				touched.push(sibling);
			}
		}
		el = parent;
	}

	return () => touched.forEach((sibling) => (sibling.inert = false));
}

export const dialog: Action<HTMLElement, DialogOptions> = (node, initial) => {
	let options = initial;
	// Captured before focus moves, so close can put it back.
	const returnTo = document.activeElement as HTMLElement | null;
	const releaseInert = inertOutside(node);

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.stopPropagation();
			options.onclose();
			return;
		}

		if (e.key !== 'Tab') return;

		const items = tabbable(node);
		if (items.length === 0) {
			e.preventDefault();
			node.focus();
			return;
		}

		const first = items[0];
		const last = items[items.length - 1];
		const active = document.activeElement;

		if (e.shiftKey && (active === first || active === node)) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && active === last) {
			e.preventDefault();
			first.focus();
		}
	}

	const target = options.initialFocus === 'container' ? node : (tabbable(node)[0] ?? node);
	target.focus();
	node.addEventListener('keydown', onkeydown);

	return {
		update(next) {
			options = next;
		},
		destroy() {
			node.removeEventListener('keydown', onkeydown);
			releaseInert();
			// The opener may be gone, for example if the page navigated away.
			if (returnTo?.isConnected) returnTo.focus();
		}
	};
};
