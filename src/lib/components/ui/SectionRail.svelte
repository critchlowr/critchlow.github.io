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
		/**
		 * Half-width of the content column this rail sits beside — `default` for
		 * max-w-5xl (32rem), `prose` for the case study's max-w-4xl (28rem). The rail
		 * anchors its right edge to the column's left edge, so it needs to know.
		 */
		measure = 'default'
	}: {
		items: RailItem[];
		label: string;
		headingId: string;
		measure?: 'default' | 'prose';
	} = $props();

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
<nav
	class="rail-track"
	class:m-default={measure === 'default'}
	class:m-prose={measure === 'prose'}
	aria-labelledby={headingId}
>
	<div class="rail-sticky">
		<div class="rail-inner">
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

		--rail-gap: 1rem;

		position: absolute;
		inset-block: 0;
		/*
			Anchored by its RIGHT edge to the content column's LEFT edge, not by `left`
			to the viewport. The column is centred and capped, so its left edge sits at
			`50% + half-width` measured from the right — put the rail just outside that
			and it can never sit on top of the text, at any width.
		*/
		right: calc(50% + var(--rail-half) + var(--rail-gap));
		/*
			Take whatever the gutter actually offers, between a legible floor and a
			sensible ceiling, rather than picking one width and hoping. The middle term
			is exactly the space left over beside the column.
		*/
		width: clamp(7rem, calc(50vw - var(--rail-half) - var(--rail-gap)), 11rem);
		/* Without this the rail is a dead strip down the page, silently swallowing
		   clicks on anything beneath it. Only .rail-inner takes pointer events back. */
		pointer-events: none;
		/*
			The content column is a later sibling, so it would otherwise paint over the
			rail — which matters only for the hover chip, since that is the one part
			that deliberately overhangs the column. Safe to raise the whole rail because
			everything except .rail-inner is click-through.
		*/
		z-index: 20;

		/* Shown only where the gutter is genuinely wide enough — see below. */
		display: none;
	}

	.m-default {
		--rail-half: 32rem;
	}
	.m-prose {
		--rail-half: 28rem;
	}

	/*
		Appears only once the gutter can hold the 7rem floor: half the column, plus
		the gap, plus the rail, on both sides. That is 2 x (32 + 1 + 7) = 80rem for
		the max-w-5xl sections; the narrower case-study column clears it sooner, but
		both use 80rem so there is exactly one threshold on the site — below it the
		reading bar in Nav.svelte takes over, above it the rails do, and there is no
		width where you get both or neither.
	*/
	@media (min-width: 80rem) {
		.m-default,
		.m-prose {
			display: block;
		}
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
	/*
		No opacity here. Fading the separator and the total to 0.65 dropped this text
		to 2.89:1 — it is aria-hidden, but it is still visible text, and 1.4.3 exempts
		only text that is invisible to everyone. The hierarchy does not need it: the
		current number is already bold and carries --t-brand, so it reads as the
		emphasis against plain muted ink either way.
	*/

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

	/*
		Hovered or focused, the label stops being a clamped column entry and becomes a
		floating chip: full text, no truncation, and an opaque ground of its own.

		Going `position: absolute` is what lets it break the rail's 7-11rem width — at
		rest the label has to live inside the gutter, but there is no room there for
		"Western Washington University — KIND Lab", so on hover it overhangs the
		content column instead. That overhang is exactly why it needs a real
		background, border and shadow rather than bare text: it is now sitting on top
		of body copy.

		Switching `display` off -webkit-box drops the line clamp, and `width:
		max-content` with a max-width lets short labels stay compact while long ones
		wrap to a readable measure.

		The chip is a descendant of the <a>, so moving the pointer onto it keeps the
		hover alive — WCAG 1.4.13 Hoverable, which a sibling tooltip would fail.
	*/
	.rail-dot:hover .rail-label,
	.rail-dot:focus-visible .rail-label {
		position: absolute;
		/*
			Centred by auto margins against inset-block:0, NOT by translateY(-50%).
			The transform route looks broken: position:absolute applies instantly while
			transform is still being transitioned, so the chip appears at top:50% with
			no transform — a row below where the text was — and then slides up. Auto
			margins put it in the right place on the first frame, and the spec resolves
			them to equal (possibly negative) values, so it stays centred even when the
			chip is taller than the 1.75rem row.
		*/
		inset-block: 0;
		height: fit-content;
		margin-block: auto;
		/*
			Pulled left by the chip's own padding and border so the FIRST CHARACTER
			lands exactly where the resting label's first character was. The text then
			appears to gain a background in place rather than shifting sideways.
		*/
		left: calc(1.375rem - 0.5rem - 1px);
		z-index: 1;
		display: block;
		width: max-content;
		max-width: 15rem;
		overflow: visible;
		opacity: 1;
		transform: none;
		padding: 0.375rem 0.5rem;
		border: 1px solid var(--t-chip-edge);
		border-radius: 0.375rem;
		background: var(--t-chip);
		box-shadow:
			0 1px 2px rgb(0 0 0 / 0.06),
			0 4px 12px rgb(0 0 0 / 0.1);
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
