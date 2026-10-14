<script lang="ts">
	import { navLinks } from '$lib/data/content';
	import ThemeToggle from './ThemeToggle.svelte';

	let activeSection = $state('');
	let mobileOpen = $state(false);
	let menuButton = $state<HTMLButtonElement>();

	function closeMobile() {
		mobileOpen = false;
	}

	function onWindowKeydown(e: KeyboardEvent) {
		if (e.key !== 'Escape' || !mobileOpen) return;
		closeMobile();
		menuButton?.focus();
	}

	// Close once focus leaves the header, so an open menu never covers the content
	// a keyboard user has moved on to.
	function onHeaderFocusout(e: FocusEvent) {
		const header = e.currentTarget as HTMLElement;
		if (!header.contains(e.relatedTarget as Node | null)) closeMobile();
	}

	// Nav hrefs are root-relative ("/#about") so they also work from sub-pages.
	// querySelector needs the bare hash.
	function hashOf(href: string) {
		const i = href.indexOf('#');
		return i === -1 ? '' : href.slice(i);
	}

	// Scrollspy. The active link is recomputed from the scroll position on each
	// frame, so it cannot drift out of step with the page.
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

			// The last section can be too short to reach the line, so it wins at the
			// bottom of the page.
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

<svelte:window onkeydown={onWindowKeydown} />

<header
	class="border-edge bg-surface/85 fixed top-0 right-0 left-0 z-40 border-b backdrop-blur-md"
	onfocusout={onHeaderFocusout}
>
	<nav
		aria-label="Main navigation"
		class="mx-auto flex max-w-4xl items-center justify-between px-5 py-3"
	>
		<a href="/" class="text-ink-strong flex items-center" aria-label="Ryan Critchlow - back to top">
			<!--
				Drawn as a mask over currentColor rather than an <img>, so the line art
				takes the ink colour and stays visible in dark mode. The negative margin
				lets it run larger without making the header taller.
			-->
			<span class="logo-mark -my-1.5 h-10 w-[3.9rem] bg-current" aria-hidden="true"></span>
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
				bind:this={menuButton}
				onclick={() => (mobileOpen = !mobileOpen)}
				aria-expanded={mobileOpen}
				aria-controls="mobile-menu"
				aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
				class="text-ink-muted hover:bg-band rounded-lg p-2 transition-colors"
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

	<!--
		Capped to the space under the header and scrollable, so at 400% zoom the last
		links can still be reached (SC 1.4.10).
	-->
	{#if mobileOpen}
		<div
			id="mobile-menu"
			class="border-edge bg-surface max-h-[calc(100dvh-4rem)] overflow-y-auto border-t px-5 py-2 md:hidden"
		>
			{#each navLinks as link (link.href)}
				<a
					href={link.href}
					onclick={closeMobile}
					class="block rounded-md px-3 py-2 text-sm font-medium transition-colors {activeSection ===
					hashOf(link.href)
						? 'bg-chip text-ink-strong'
						: 'text-ink-muted hover:bg-band'}"
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
		The active marker grows from the centre. The scrollspy updates continuously,
		so an instant swap between links would flicker.
	*/
	.nav-link::after {
		content: '';
		position: absolute;
		inset-inline: 0.75rem;
		bottom: 0.15rem;
		height: 2px;
		border-radius: 2px;
		background: var(--t-brand);
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

	/*
		Forced-colours mode (Windows High Contrast) replaces background colours with
		the system Canvas colour, which would paint the masked logo invisible. Opt
		this element out and draw it in the system link colour instead.
	*/
	@media (forced-colors: active) {
		.logo-mark {
			forced-color-adjust: none;
			background-color: LinkText;
		}
	}
</style>
