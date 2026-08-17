<script lang="ts">
	interface Props {
		label: string;
		/** Omit to render a button instead of a link — used to open the simulator. */
		href?: string;
		/** Opens in a new tab and swaps the arrow for an external-link mark. */
		external?: boolean;
		/** Down arrow for links that jump further down the same page. */
		direction?: 'right' | 'down';
		size?: 'sm' | 'base';
		onclick?: () => void;
	}

	let {
		label,
		href,
		external = false,
		direction = 'right',
		size = 'base',
		onclick
	}: Props = $props();

	// Written out rather than interpolated: Tailwind scans for literal class strings,
	// so `text-${size}` would never be emitted into the stylesheet.
	const sizes = { sm: 'text-sm', base: 'text-base' };

	// The arrow nudges on hover — the smallest possible signal that this goes somewhere.
	// Grouped so the glyph animates from a hover anywhere on the link, not just on itself.
	const classes = $derived(
		'group text-link inline-flex items-center gap-1.5 font-semibold underline-offset-4 ' +
			`hover:underline ${sizes[size]}`
	);
	const glyph =
		'inline-block transition-transform duration-200 ease-spring ' +
		'group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0';
</script>

{#if href}
	<a
		{href}
		class={classes}
		target={external ? '_blank' : undefined}
		rel={external ? 'noopener noreferrer' : undefined}
	>
		{label}
		{#if external}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-3.5 w-3.5"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
				<polyline points="15 3 21 3 21 9" />
				<line x1="10" y1="14" x2="21" y2="3" />
			</svg>
			<span class="sr-only">(opens in a new tab)</span>
		{:else}
			<span class={glyph} aria-hidden="true">{direction === 'down' ? '↓' : '→'}</span>
		{/if}
	</a>
{:else}
	<button type="button" class={classes} {onclick}>
		{label}
		<span class={glyph} aria-hidden="true">{direction === 'down' ? '↓' : '→'}</span>
	</button>
{/if}
