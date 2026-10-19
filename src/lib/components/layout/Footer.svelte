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
		<p class="text-ink-muted mt-12 text-sm">
			&copy; {new Date().getFullYear()} Ryan Critchlow · Built to WCAG 2.2 AA. Every change is checked
			with
			<a href="https://github.com/dequelabs/axe-core" class="text-link underline underline-offset-4"
				>axe</a
			>
			and
			<a href="https://pa11y.org/" class="text-link underline underline-offset-4">pa11y</a>
			before it goes live. Found a barrier?
			<a
				href="mailto:critchlow.rc@gmail.com?subject=Accessibility%20barrier"
				class="text-link underline underline-offset-4">Email me</a
			>.
		</p>
	</div>
</footer>
