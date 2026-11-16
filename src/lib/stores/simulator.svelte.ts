/**
 * Whether the warehouse simulator dialog is open. The dialog is mounted once, in
 * the layout, and any button on the page can open it: the board at the top, the
 * Körber row in Experience, and the /simulator address.
 */
let open = $state(false);
let opener: HTMLElement | null = null;

export const simulator = {
	get open() {
		return open;
	},
	/**
	 * Opens the dialog. Used directly as a click handler, so the button that was
	 * pressed is remembered. Safari does not focus a button when it is clicked, so
	 * the dialog cannot find the opener from the focused element alone.
	 */
	show: (event?: Event) => {
		opener = event?.currentTarget instanceof HTMLElement ? event.currentTarget : null;
		open = true;
	},
	hide: () => {
		open = false;
	},
	/** Puts focus back on the button that opened the dialog, if there was one. */
	restoreFocus: () => {
		if (opener?.isConnected) opener.focus();
		opener = null;
	}
};
