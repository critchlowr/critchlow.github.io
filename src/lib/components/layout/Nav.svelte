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

<header class="border-edge bg-surface/85 fixed top-0 right-0 left-0 z-40 border-b backdrop-blur-md">
	<nav
		aria-label="Main navigation"
		class="mx-auto flex max-w-5xl items-center justify-between px-5 py-3"
	>
		<a
			href="/#hero"
			class="text-ink-strong font-display flex items-center gap-2 text-xl font-semibold"
			aria-label="Ryan Critchlow - back to top"
		>
			<!--
				Drawn as a mask over currentColor rather than an <img>, so the line art
				takes the wordmark's colour and stays visible in dark mode.
			-->
			<span class="logo-mark h-8 w-[3.1rem] bg-current" aria-hidden="true"></span>
			RC
		</a>

		<!-- Desktop nav -->
		<div class="hidden items-center gap-1 md:flex">
			{#each navLinks as link (link.href)}
				<a
					href={link.href}
					class="nav-link relative px-3 py-1.5 text-sm font-medium transition-colors {activeSection ===
					hashOf(link.href)
						? 'text-ink-strong is-active'
						: 'text-ink-muted hover:text-ink-strong'}"
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
				class="text-ink-muted hover:bg-warm-200 dark:hover:bg-warm-800 rounded-lg p-2 transition-colors"
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
		<div id="mobile-menu" class="border-edge bg-surface border-t px-5 py-2 md:hidden">
			{#each navLinks as link (link.href)}
				<a
					href={link.href}
					onclick={closeMobile}
					class="block rounded-md px-3 py-2 text-sm font-medium transition-colors {activeSection ===
					hashOf(link.href)
						? 'bg-accent-100 text-accent-800 dark:bg-accent-950 dark:text-accent-200'
						: 'text-ink-muted hover:bg-warm-100 dark:hover:bg-warm-900'}"
					aria-current={activeSection === hashOf(link.href) ? 'true' : undefined}
				>
					{link.label}
				</a>
			{/each}
		</div>
	{/if}
</header>

<style>
	/*
		The active-section marker grows from the centre rather than appearing. The
		scrollspy updates continuously while scrolling, so a hard swap between links
		reads as a flicker; a 220ms grow reads as the page tracking where you are.
	*/
	.nav-link::after {
		content: '';
		position: absolute;
		inset-inline: 0.75rem;
		bottom: 0.15rem;
		height: 2px;
		border-radius: 2px;
		background: var(--color-accent-500);
		transform: scaleX(0);
		transition: transform 0.22s var(--ease-spring);
	}

	.nav-link.is-active::after {
		transform: scaleX(1);
	}

	@media (prefers-reduced-motion: reduce) {
		.nav-link::after {
			transition: none;
		}
	}

	.logo-mark {
		mask: url('/images/logo-dog.png') center / contain no-repeat;
		-webkit-mask: url('/images/logo-dog.png') center / contain no-repeat;
	}
</style>
