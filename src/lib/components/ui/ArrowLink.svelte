<script lang="ts">
	import Icon from './Icon.svelte';

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
		<Icon name="external" class="h-3.5 w-3.5" />
		<span class="sr-only">(opens in a new tab)</span>
	{:else}
		<!-- Nudges right on hover; held still when the OS asks for reduced motion. -->
		<span
			class="ease-spring inline-block transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
			aria-hidden="true">→</span
		>
	{/if}
</a>
