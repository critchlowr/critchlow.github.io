<script lang="ts">
	import { contact } from '$lib/data/content';
	import ContactLink from '$lib/components/ui/ContactLink.svelte';
</script>

<footer id="contact" class="bg-warm-100 dark:bg-warm-800/50" aria-labelledby="contact-heading">
	<div class="mx-auto max-w-5xl px-4 py-16">
		<h2 id="contact-heading" class="mb-8 text-center text-2xl font-bold text-primary-700 dark:text-primary-300">
			Get In Touch
		</h2>
		<div class="flex flex-wrap items-center justify-center gap-6">
			{#each contact as link}
				<ContactLink {link} />
			{/each}
		</div>
		<p class="mt-12 text-center text-sm text-warm-700 dark:text-plum-200">
			&copy; {new Date().getFullYear()} Ryan Critchlow
		</p>
	</div>
</footer>
