<script lang="ts">
	import { navLinks } from '$lib/data/content';
	import ThemeToggle from './ThemeToggle.svelte';

	let activeSection = $state('');
	let mobileOpen = $state(false);

	function closeMobile() {
		mobileOpen = false;
	}

	$effect(() => {
		const sections = navLinks.map((l) => document.querySelector(l.href) as HTMLElement).filter(Boolean);

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						activeSection = '#' + entry.target.id;
					}
				}
			},
			{ rootMargin: '-20% 0px -40% 0px' }
		);

		sections.forEach((s) => observer.observe(s));

		function handleScroll() {
			if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
				activeSection = '#contact';
			}
		}

		window.addEventListener('scroll', handleScroll, { passive: true });

		return () => {
			observer.disconnect();
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<header class="fixed top-0 right-0 left-0 z-40 border-b border-warm-200 bg-warm-50/90 backdrop-blur-md dark:border-warm-700 dark:bg-warm-900/90">
	<nav aria-label="Main navigation" class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
		<a href="#hero" class="text-lg font-bold text-primary-700 dark:text-primary-200" aria-label="Ryan Critchlow - back to top">
			RC
		</a>

		<!-- Desktop nav -->
		<div class="hidden items-center gap-1 md:flex">
			{#each navLinks as link}
				<a
					href={link.href}
					class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors {activeSection === link.href
						? 'bg-accent-100 text-accent-700 dark:bg-plum-600 dark:text-plum-100'
						: 'text-warm-600 hover:bg-warm-100 hover:text-warm-800 dark:text-warm-400 dark:hover:bg-warm-800 dark:hover:text-warm-200'}"
					aria-current={activeSection === link.href ? 'true' : undefined}
				>
					{link.label}
				</a>
			{/each}
			<ThemeToggle />
		</div>

		<!-- Mobile menu button -->
		<div class="flex items-center gap-2 md:hidden">
			<ThemeToggle />
			<button
				onclick={() => (mobileOpen = !mobileOpen)}
				aria-expanded={mobileOpen}
				aria-controls="mobile-menu"
				aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
				class="rounded-lg p-2 text-warm-600 hover:bg-warm-200 dark:text-warm-300 dark:hover:bg-warm-700"
			>
				{#if mobileOpen}
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
						<line x1="3" y1="12" x2="21" y2="12" />
						<line x1="3" y1="6" x2="21" y2="6" />
						<line x1="3" y1="18" x2="21" y2="18" />
					</svg>
				{/if}
			</button>
		</div>
	</nav>

	<!-- Mobile menu -->
	{#if mobileOpen}
		<div id="mobile-menu" class="border-t border-warm-200 bg-warm-50 px-4 py-2 md:hidden dark:border-warm-700 dark:bg-warm-900">
			{#each navLinks as link}
				<a
					href={link.href}
					onclick={closeMobile}
					class="block rounded-md px-3 py-2 text-sm font-medium transition-colors {activeSection === link.href
						? 'bg-accent-100 text-accent-700 dark:bg-plum-600 dark:text-plum-100'
						: 'text-warm-600 hover:bg-warm-100 dark:text-warm-400 dark:hover:bg-warm-800'}"
					aria-current={activeSection === link.href ? 'true' : undefined}
				>
					{link.label}
				</a>
			{/each}
		</div>
	{/if}
</header>
