/**
 * Whether the warehouse simulator dialog is open. The dialog is mounted once, in
 * the layout, and any button on the page can open it: the board at the top, the
 * Körber row in Experience, and the /simulator address.
 */
let open = $state(false);

export const simulator = {
	get open() {
		return open;
	},
	show: () => {
		open = true;
	},
	hide: () => {
		open = false;
	}
};
