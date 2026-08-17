<script lang="ts">
	import { createSpy } from '$lib/scroll/spy.svelte';
	import { goToHash } from '$lib/scroll/scroller';

	interface RailItem {
		id: string;
		label: string;
	}

	let {
		items,
		label,
		headingId,
		/** How much of each label to show at rest. Case-study titles need more room. */
		wide = false
	}: { items: RailItem[]; label: string; headingId: string; wide?: boolean } = $props();

	const spy = createSpy(() =>
		items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => !!el)
	);

	// 0..1 along the track. Derived, not assigned from an effect.
	const fill = $derived(items.length > 1 ? spy.active / (items.length - 1) : 0);

	function jump(e: MouseEvent, index: number, id: string) {
		// The delegated handler in +layout.svelte would catch this anyway; taking it
		// here as well lets the rail update before the scroll starts.
		e.preventDefault();
		spy.active = index;
		goToHash('#' + id);
	}

	const pad = (n: number) => String(n).padStart(2, '0');
</script>

<!--
	Footer-proof by construction.

	`.rail-track` is absolutely positioned and spans its containing block exactly,
	and a sticky element can never be painted outside its containing block — so as
	long as this is dropped inside the section or article it belongs to, the browser
	itself stops the rail where that element ends. No footer sentinel, no scroll
	maths, nothing to resynchronise on resize.

	The inner box is a full-viewport-height sticky pinned at top:0, with its
	contents centred by flexbox. The obvious alternative — top:50% with
	translateY(-50%) — is subtly wrong: transform is applied after layout and is
	invisible to the browser's stick/unstick calculation, so the rail overshoots
	its container by half its own height and bleeds into whatever follows.
-->
<nav class="rail-track hidden lg:block" aria-labelledby={headingId}>
	<div class="rail-sticky">
		<div class="rail-inner" class:rail-wide={wide}>
			<h2 id={headingId} class="sr-only">{label}</h2>

			<!--
				The counter is the most direct answer to "how many are left" — more direct
				than any visual encoding, and on-brand for a site whose whole language is
				numbered sections. aria-hidden because aria-current already carries
				position to assistive tech, and a live-updating count would be noise.
			-->
			<p class="rail-count" aria-hidden="true">
				<span class="rail-count-now">{pad(spy.active + 1)}</span>
				<span class="rail-count-sep">/</span>
				<span class="rail-count-all">{pad(items.length)}</span>
			</p>

			<ol class="rail-list" style="--fill: {fill}">
				{#each items as item, i (item.id)}
					<li>
						<!--
							The active state is styled off [aria-current], set here in the
							template rather than toggled as a class from JS. Two reasons: Svelte
							deletes scoped selectors it cannot see used in the markup, so a
							JS-added class would compile to nothing; and it makes the visual
							state and the accessible state literally the same fact.

							"location" rather than "true" — non-true values get announced, so a
							screen reader says "current location" instead of a bare "current".
						-->
						<a
							href="#{item.id}"
							class="rail-dot"
							data-state={i < spy.active ? 'passed' : i === spy.active ? 'current' : 'upcoming'}
							aria-current={i === spy.active ? 'location' : undefined}
							onclick={(e) => jump(e, i, item.id)}
						>
							<span class="rail-mark" aria-hidden="true"></span>
							<span class="rail-label">{item.label}</span>
						</a>
					</li>
				{/each}
			</ol>
		</div>
	</div>
</nav>

<style>
	.rail-track {
		/*
			Dim tone for passed and upcoming dots. 70% of the brand rather than the
			--t-edge hairline colour, which measured 1.15:1 against the parchment band
			— the upcoming dots were effectively invisible, so the rail could not
			convey how many were left, which is the one thing it exists to do.
		*/
		--rail-dim: color-mix(in srgb, var(--t-brand) 70%, transparent);

		position: absolute;
		inset-block: 0;
		/* Parks in the gutter beside the content column rather than at the window
		   edge, and collapses to a fixed inset once the viewport stops being wide
		   enough for a gutter to exist. */
		left: max(1.5rem, calc(50vw - 41rem));
		/* Without this the rail is a dead strip roughly 40px wide running down the
		   page, silently swallowing clicks on anything beneath it. */
		pointer-events: none;
	}

	.rail-sticky {
		position: sticky;
		top: 0;
		height: 100dvh;
		display: flex;
		align-items: center;
	}

	.rail-inner {
		pointer-events: auto;
		width: 11rem;
	}
	.rail-wide {
		width: 13rem;
	}

	.rail-count {
		display: flex;
		align-items: baseline;
		gap: 0.2rem;
		margin: 0 0 0.9rem 0.3rem;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-variant-numeric: tabular-nums;
		letter-spacing: 0.06em;
		color: var(--t-ink-muted);
	}
	.rail-count-now {
		color: var(--t-brand);
		font-weight: 700;
	}
	.rail-count-sep,
	.rail-count-all {
		opacity: 0.65;
	}

	.rail-list {
		position: relative;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	/* Track and fill. Both stop at the first and last dot centres rather than
	   running the full height, so the line reads as connecting the dots. */
	.rail-list::before,
	.rail-list::after {
		content: '';
		position: absolute;
		left: 0.6875rem;
		width: 1px;
		top: 0.875rem;
		bottom: 0.875rem;
	}
	.rail-list::before {
		background: color-mix(in srgb, var(--t-brand) 30%, transparent);
	}
	.rail-list::after {
		bottom: auto;
		height: calc(var(--fill, 0) * (100% - 1.75rem));
		background: var(--t-brand);
		transition: height 0.28s var(--ease-soft);
	}

	.rail-dot {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.625rem;
		/* The row IS the hit area — 28px clears SC 2.5.8's 24x24 outright rather
		   than leaning on the spacing exception. */
		height: 1.75rem;
		padding-inline: 0.375rem;
		text-decoration: none;
	}

	.rail-mark {
		flex: none;
		width: 0.375rem;
		height: 0.375rem;
		border-radius: 50%;
		background: transparent;
		/* Transform and colour only — both compositor properties. Animating width
		   and height instead would trigger layout on every dot, every frame. */
		transition:
			transform 0.18s var(--ease-soft),
			background-color 0.18s var(--ease-soft);
	}

	.rail-label {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.03em;
		line-height: 1.3;
		color: var(--t-ink-muted);
		/* Always in the accessibility tree; only the appearance changes. Never
		   display:none or width:0, both of which would take it out. */
		opacity: 0;
		transform: translateX(-0.25rem);
		transition:
			opacity 0.18s var(--ease-soft),
			transform 0.18s var(--ease-soft),
			color 0.18s var(--ease-soft);
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}

	/*
		Three states, not two. Passed dots stay filled in the accent at reduced
		strength, upcoming ones stay hollow — so the split point in the column tells
		you how far in you are and how many are left without counting anything.
		Set as a data attribute from the template, for the same reason as
		aria-current: a class added from JS would be compiled away.
	*/
	.rail-dot[data-state='passed'] .rail-mark {
		background: var(--rail-dim);
	}
	.rail-dot[data-state='upcoming'] .rail-mark {
		background: transparent;
		box-shadow: inset 0 0 0 1.5px var(--rail-dim);
	}

	.rail-dot:hover .rail-mark,
	.rail-dot:focus-visible .rail-mark {
		background: var(--t-brand);
		box-shadow: none;
		transform: scale(1.5);
	}

	.rail-dot[aria-current] .rail-mark {
		background: var(--t-brand);
		box-shadow: none;
		transform: scale(1.9);
	}

	.rail-dot:hover .rail-label,
	.rail-dot:focus-visible .rail-label {
		opacity: 1;
		transform: none;
		color: var(--t-ink-strong);
	}

	/*
		The active label stays visible. This is the single thing that stops the rail
		reading as decoration: at rest, a hover-only rail is just a column of grey
		dots, which is exactly the "I can't see it doing anything" problem.
	*/
	.rail-dot[aria-current] .rail-label {
		opacity: 1;
		transform: none;
		color: var(--t-ink-strong);
		font-weight: 600;
	}

	@media (prefers-reduced-motion: reduce) {
		.rail-mark,
		.rail-label,
		.rail-list::after {
			transition-duration: 0.01ms;
		}
	}
</style>
