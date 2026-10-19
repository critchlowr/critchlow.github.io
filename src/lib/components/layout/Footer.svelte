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
			Open to UX research, accessibility engineer, and technical support engineer roles in the
			Pacific Northwest or remote. At ASSETS 2026? Come say hello.
		</p>
		<ul class="mt-6 flex flex-wrap items-center gap-2">
			{#each contact as link (link.href)}
				<li><ContactLink {link} /></li>
			{/each}
		</ul>
		<!-- The CI link is the evidence: anyone can see the accessibility checks run on each change. -->
		<p class="text-ink-muted mt-12 text-sm">
			&copy; {new Date().getFullYear()} Ryan Critchlow · Built to WCAG 2.2 AA. Every change is
			<a
				href="https://github.com/critchlowr/critchlow.github.io/actions"
				class="text-link underline underline-offset-4">checked with axe and pa11y</a
			>
			before it goes live. Found a barrier?
			<a
				href="mailto:critchlow.rc@gmail.com?subject=Accessibility%20barrier"
				class="text-link underline underline-offset-4">Email me</a
			>.
		</p>
	</div>
</footer>
