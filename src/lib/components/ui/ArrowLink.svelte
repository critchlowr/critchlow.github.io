<script lang="ts">
	interface Props {
		label: string;
		href: string;
		/** Opens in a new tab, swaps the arrow for an external-link mark, and says so to screen readers. */
		external?: boolean;
	}

	let { label, href, external = false }: Props = $props();
</script>

<a
	{href}
	class="group text-link inline-flex items-center gap-1.5 font-semibold underline-offset-4 hover:underline"
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
		<!-- Nudges right on hover; held still when the OS asks for reduced motion. -->
		<span
			class="ease-spring inline-block transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
			aria-hidden="true">→</span
		>
	{/if}
</a>
