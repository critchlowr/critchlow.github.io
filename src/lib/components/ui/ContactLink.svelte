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
	class="btn btn-secondary px-4 py-2.5 text-sm"
>
	<Icon name={link.icon} />
	<span>{link.display}</span>
</a>
