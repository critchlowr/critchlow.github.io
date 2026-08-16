// Shared open/close state for the WMS simulator modal.
//
// The modal itself lives in Simulator.svelte, but the Selected Work card and the
// Körber experience card both need to launch it. Routing those through a module-level
// rune avoids prop-drilling the state up through +page.svelte just to pass it back down.

let open = $state(false);

export const simulator = {
	get open() {
		return open;
	},
	launch() {
		open = true;
	},
	close() {
		open = false;
	}
};
