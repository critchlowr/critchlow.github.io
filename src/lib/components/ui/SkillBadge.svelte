<script lang="ts">
	interface Props {
		label: string;
	}

	let { label }: Props = $props();
</script>

<span class="inline-block rounded-full bg-moss-100 px-3 py-1 text-sm font-medium text-moss-700 dark:bg-moss-800 dark:text-moss-200">
	{label}
</span>
