/**
 * Modal dialog behaviour: focus in, focus trapped, focus restored, everything
 * else inert, Escape from anywhere inside.
 *
 * This exists because both dialogs on the site had the same five defects. They
 * declared `role="dialog" aria-modal="true"` and then did none of what that
 * promises: focus stayed on whatever opened them, Tab walked straight out into
 * the page behind the overlay, closing dropped focus on `<body>`, and Escape was
 * bound to a container that focus never entered — so it did nothing until the
 * user had already tabbed in, which was the hard part.
 *
 * An action rather than a wrapper component, because the two dialogs (the
 * warehouse simulator and the photo lightbox) share this behaviour and nothing
 * else — no markup, no styling, no lifecycle.
 */

const TABBABLE =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
	'textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

function tabbable(root: HTMLElement) {
	// getClientRects() is the cheap "is it actually rendered" test — it catches
	// display:none, an unmounted subtree, and zero-size elements in one go.
	return Array.from(root.querySelectorAll<HTMLElement>(TABBABLE)).filter(
		(el) => el.getClientRects().length > 0
	);
}

/**
 * Walks from `node` up to <body>, marking every ancestor's other children inert.
 *
 * `inert` removes a subtree from the tab order *and* from the accessibility tree
 * in one attribute, which is what `aria-modal` only claims to do — AT support for
 * aria-modal alone is inconsistent enough that it cannot be relied on. Returns an
 * undo so nothing that was already inert gets cleared on the way out.
 */
function inertOutside(node: HTMLElement) {
	const touched: HTMLElement[] = [];
	let el: HTMLElement | null = node;

	while (el && el !== document.body) {
		const parent: HTMLElement | null = el.parentElement;
		if (!parent) break;
		for (const sib of Array.from(parent.children)) {
			if (sib !== el && sib instanceof HTMLElement && !sib.inert) {
				sib.inert = true;
				touched.push(sib);
			}
		}
		el = parent;
	}

	return () => touched.forEach((s) => (s.inert = false));
}

export function dialog(
	node: HTMLElement,
	opts: {
		onclose: () => void;
		/**
		 * Where focus lands on open.
		 *
		 * `'first'` (default) is the conventional choice and right for a dialog
		 * whose first control is its Close button — the lightbox.
		 *
		 * `'container'` focuses the labelled dialog element itself, so entry
		 * announces the dialog's name rather than a control. Use it when the first
		 * tabbable is something a user would not want to activate by reflex: the
		 * simulator's first control is Reset, and landing a keyboard user on a
		 * button that discards their progress is not a neutral default.
		 */
		initialFocus?: 'first' | 'container';
	}
) {
	// Captured before anything moves, so close can put it back where it was.
	const returnTo = document.activeElement as HTMLElement | null;
	const releaseInert = inertOutside(node);

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.stopPropagation();
			opts.onclose();
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

		if (e.shiftKey && (document.activeElement === first || document.activeElement === node)) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}

	// Focus in: the first control if there is one, otherwise the container, so
	// Escape has somewhere to land and the dialog's name is announced on entry.
	const target = opts.initialFocus === 'container' ? node : (tabbable(node)[0] ?? node);
	target.focus();
	node.addEventListener('keydown', onkeydown);

	return {
		destroy() {
			node.removeEventListener('keydown', onkeydown);
			releaseInert();
			// isConnected guards the case where the page navigated away entirely
			// and the element we came from no longer exists.
			if (returnTo?.isConnected) returnTo.focus();
		}
	};
}
