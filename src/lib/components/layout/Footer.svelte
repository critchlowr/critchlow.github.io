<script lang="ts">
	import { contact } from '$lib/data/content';
	import ContactLink from '$lib/components/ui/ContactLink.svelte';
</script>

<footer id="contact" class="bg-footer border-edge border-t" aria-labelledby="contact-heading">
	<div class="mx-auto max-w-4xl px-5 py-16">
		<h2 id="contact-heading" class="text-ink-strong font-display text-title font-semibold">
			Get in touch
		</h2>
		<p class="text-ink-muted text-body mt-3 max-w-xl">
			Open to UX research, accessibility, and technical support roles in the Pacific Northwest or
			remote. At ASSETS 2026? Come say hello.
		</p>
		<ul class="mt-6 flex flex-wrap items-center gap-2">
			{#each contact as link (link.href)}
				<li><ContactLink {link} /></li>
			{/each}
		</ul>
		<p class="text-ink-muted mt-12 text-sm">
			&copy; {new Date().getFullYear()} Ryan Critchlow · This site is built and tested to WCAG 2.2 AA.
		</p>
	</div>
</footer>
