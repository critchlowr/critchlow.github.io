<script lang="ts">
	import { skills, tools } from '$lib/data/content';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';

	// Plain text, like a résumé: a logo wall is decoration that doesn't say how well
	// someone knows a tool.
	const groups = [
		...skills.map((s) => ({ label: s.label, items: s.items })),
		{ label: 'Data & Tools', items: tools.map((t) => t.name) }
	];
</script>

<SectionWrapper id="skills" headingId="skills-heading" title="Skills" alt>
	<dl class="grid gap-6 md:grid-cols-3">
		{#each groups as group (group.label)}
			<div>
				<dt class="text-ink-strong font-semibold">{group.label}</dt>
				<dd class="text-ink-muted text-body mt-2">{group.items.join(' · ')}</dd>
			</div>
		{/each}
	</dl>
</SectionWrapper>
