/**
 * Moves an element to the end of `<body>` while it is mounted.
 *
 * `<main>` sets `relative z-10` so it stacks above the ambient layer, which makes
 * it a stacking context: nothing inside it can rise above the fixed nav (z-40),
 * whatever z-index it asks for. A full-screen overlay rendered from inside a
 * section needs to escape that, so it is reparented to `<body>` instead.
 */
export function portal(node: HTMLElement) {
	document.body.appendChild(node);
	return {
		destroy() {
			node.remove();
		}
	};
}
