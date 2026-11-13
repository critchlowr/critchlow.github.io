<script lang="ts">
	import type { ContactLink as ContactLinkType } from '$lib/types';
	import Icon from './Icon.svelte';

	interface Props {
		link: ContactLinkType;
	}

	let { link }: Props = $props();
</script>

<a
	href={link.href}
	aria-label="{link.label}: {link.display}"
	class="text-ink border-edge hover:border-edge-hover bg-surface-raised flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors motion-reduce:transition-none"
>
	<Icon name={link.icon} />
	<span>{link.display}</span>
</a>
