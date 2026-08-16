<script lang="ts">
	import { navLinks } from '$lib/data/content';
	import ThemeToggle from './ThemeToggle.svelte';

	let activeSection = $state('');
	let mobileOpen = $state(false);

	function closeMobile() {
		mobileOpen = false;
	}

	// Nav hrefs are root-relative ("/#about") so they also work from sub-pages.
	// querySelector needs the bare hash.
	function hashOf(href: string) {
		const i = href.indexOf('#');
		return i === -1 ? '' : href.slice(i);
	}

	// Scrollspy. Recomputed from scratch on every frame rather than accumulated,
	// so no state can get stuck: the active link is always a pure function of the
	// current scroll position.
	$effect(() => {
		const hashes = navLinks.map((l) => hashOf(l.href)).filter(Boolean);

		function update() {
			// A section is "current" once its top passes this line down the viewport.
			const line = window.innerHeight * 0.3;

			let current = '';
			for (const hash of hashes) {
				const el = document.querySelector(hash);
				if (el && el.getBoundingClientRect().top <= line) {
					current = hash;
				}
			}

			// The last section can be too short to ever reach the line, so at the
			// bottom of the page it wins. Re-evaluated every frame, so scrolling back
			// up releases it.
			const atBottom =
				window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
			if (atBottom && hashes.length > 0) {
				current = hashes[hashes.length - 1];
			}

			activeSection = current;
		}

		let frame = 0;
		function schedule() {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(update);
		}

		update();
		window.addEventListener('scroll', schedule, { passive: true });
		window.addEventListener('resize', schedule, { passive: true });

		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
		};
	});
</script>

<header
	class="border-warm-200 bg-warm-50/90 dark:border-warm-700 dark:bg-warm-900/90 fixed top-0 right-0 left-0 z-40 border-b backdrop-blur-md"
>
	<nav
		aria-label="Main navigation"
		class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3"
	>
		<a
			href="/#hero"
			class="text-primary-700 dark:text-primary-200 text-lg font-bold"
			aria-label="Ryan Critchlow - back to top"
		>
			RC
		</a>

		<!-- Desktop nav -->
		<div class="hidden items-center gap-1 md:flex">
			{#each navLinks as link (link.href)}
				<a
					href={link.href}
					class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors {activeSection ===
					hashOf(link.href)
						? 'bg-accent-100 text-accent-700 dark:bg-plum-600 dark:text-plum-100'
						: 'text-warm-600 hover:bg-warm-100 hover:text-warm-800 dark:text-warm-400 dark:hover:bg-warm-800 dark:hover:text-warm-200'}"
					aria-current={activeSection === hashOf(link.href) ? 'true' : undefined}
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
				class="text-warm-600 hover:bg-warm-200 dark:text-warm-300 dark:hover:bg-warm-700 rounded-lg p-2"
			>
				{#if mobileOpen}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						aria-hidden="true"
					>
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						aria-hidden="true"
					>
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
		<div
			id="mobile-menu"
			class="border-warm-200 bg-warm-50 dark:border-warm-700 dark:bg-warm-900 border-t px-4 py-2 md:hidden"
		>
			{#each navLinks as link (link.href)}
				<a
					href={link.href}
					onclick={closeMobile}
					class="block rounded-md px-3 py-2 text-sm font-medium transition-colors {activeSection ===
					hashOf(link.href)
						? 'bg-accent-100 text-accent-700 dark:bg-plum-600 dark:text-plum-100'
						: 'text-warm-600 hover:bg-warm-100 dark:text-warm-400 dark:hover:bg-warm-800'}"
					aria-current={activeSection === hashOf(link.href) ? 'true' : undefined}
				>
					{link.label}
				</a>
			{/each}
		</div>
	{/if}
</header>
