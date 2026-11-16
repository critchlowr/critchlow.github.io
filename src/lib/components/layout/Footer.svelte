<script lang="ts">
	import { contact, hero } from '$lib/data/content';
	import ContactLink from '$lib/components/ui/ContactLink.svelte';
</script>

<footer id="contact" class="bg-footer" aria-labelledby="contact-heading">
	<div class="wrap py-16">
		<h2 id="contact-heading" class="font-display text-ink-strong text-section font-extrabold">
			Get in touch
		</h2>
		<!-- The same line as the board at the top, so the two can't drift apart. -->
		<p class="text-ink-muted text-body mt-4 max-w-xl">{hero.availability}</p>
		<ul class="mt-6 flex flex-wrap items-center gap-3">
			{#each contact as link (link.href)}
				<li><ContactLink {link} /></li>
			{/each}
		</ul>
		<p class="text-ink-muted max-w-measure mt-12 text-sm">
			&copy; {new Date().getFullYear()} Ryan Critchlow. Built to WCAG 2.2 AA. Every change is checked
			with
			<a href="https://github.com/dequelabs/axe-core" class="link">axe</a>
			and
			<a href="https://pa11y.org/" class="link">pa11y</a>
			before it goes live. Found a barrier?
			<a href="mailto:critchlow.rc@gmail.com?subject=Accessibility%20barrier" class="link"
				>Email me</a
			>.
		</p>
	</div>
</footer>
