<script lang="ts">
	import Icon from './Icon.svelte';

	interface Props {
		label: string;
		href: string;
		/** Opens in a new tab, adds an external-link mark, and says so to screen readers. */
		external?: boolean;
	}

	let { label, href, external = false }: Props = $props();
</script>

<a
	{href}
	class="link inline-flex items-center gap-1.5 font-semibold"
	target={external ? '_blank' : undefined}
	rel={external ? 'noopener noreferrer' : undefined}
>
	{label}
	{#if external}
		<Icon name="external" class="h-3.5 w-3.5" />
		<span class="sr-only">(opens in a new tab)</span>
	{/if}
</a>
