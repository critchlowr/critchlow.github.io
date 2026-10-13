# 01a — Literature review: motion, interaction and the front-end platform

_Compiled 2026-10-13 for the SvelteKit 2 + Svelte 5 + Tailwind v4 portfolio redesign. Colour, aesthetics and design psychology are covered in a separate review._

> **Method note.** This sandbox could not reach svelte.dev, MDN, web.dev, w3.org, nngroup.com or m3.material.io. Official text was read from the canonical source repositories instead: `sveltejs/*`, `mdn/content`, `w3c/wcag`, `androidx`, `material-web`, `GoogleChrome/web-vitals`, `chromium` and `web-platform-tests/interop`, plus the developer.apple.com HIG JSON. Baseline status comes from `web-features` 3.42.0 (2026-10-09) [14]. Items marked _(via search)_ come from search summaries, not a full read.

## Executive summary

1. **Svelte motion APIs.** Use `Spring`/`Tween` (5.8.0; the `spring`/`tweened` stores are deprecated), `prefersReducedMotion` (5.7.0) and `{@attach}` (5.29, now preferred over `use:`) [3][5][6]. The locked Svelte 5.51.0 has all of them. **SvelteKit 3.0.1 shipped on 2026-10-06** with breaking changes [13]: stay on 2.x for the redesign or migrate first.
2. **Svelte transitions ignore CSS reduced-motion resets.** They run on the Web Animations API [1], so branch on `prefersReducedMotion.current` in code.
3. **Page transitions.** Same-document View Transitions are **Baseline Newly available (2025-10-14)** [14]. Wire them through `onNavigate` [9], keep them at or under 300 ms, and crossfade under reduced motion.
4. **Platform status.**
   - **Widely available:** `linear()`, individual transforms, AVIF.
   - **Newly available:** `@starting-style`, `allow-discrete`, `@property`, `light-dark()`, `content-visibility`.
   - **Not Baseline:** scroll-driven animations, cross-document View Transitions, `interpolate-size`.
   - **Anchor positioning:** in all engines but not yet flagged Baseline [14].
5. **Timing.**
   - About 100 ms for feedback, 150–200 ms for hover and exits, 200–300 ms for entrances.
   - Ease-out in, a short ease-in out [36][44].
   - Springs for spatial moves only, **never for opacity or colour** [35].
6. **Scroll reveals.** Run each reveal once, in 100–400 ms, and never on the hero or headline [39][40]. No scrolljacking or parallax [41]. Never start the LCP element at `opacity: 0` [46].
7. **Accessibility.** Build to WCAG 2.2 AA plus 2.3.3. Any auto-playing loop longer than 5 s needs a pause control (2.2.2, Level A) [28]. Under reduced motion, swap movement for fades rather than deleting feedback [34]. WCAG 3 is still a draft [32].
8. **Performance.** Animate only `transform` and `opacity` [16]. Targets: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 [45]. Preload the Latin font files, use `<enhanced:img>`, and set `fetchpriority="high"` on the LCP image [11][12].
9. **Delight.**
   - **Good:** tactile springs, easter eggs, an optional mini-game, opt-in sound.
   - **Bad:** cursor replacement, scrolljacking, preloaders, screen shake, endless marquees.
   - **Cozy-game style:** 9-slice panels, pixel accents, and "juice" only on success the user caused.
10. **Repo gaps.** The current reveal system, the conveyor loops and the `left` transitions miss this guidance (see the end of the checklist).

---

## 1. Svelte 5 and SvelteKit: official guidance

**Versions (npm, 2026-10-13).**

| Package       | Locked in repo | Latest                           |
| ------------- | -------------- | -------------------------------- |
| svelte        | 5.51.0         | 5.57.2                           |
| @sveltejs/kit | 2.51.0         | 3.0.1 (last 2.x release: 2.70.3) |

SvelteKit 3 requires:

- Vite 8
- vite-plugin-svelte 7
- Node 22.17
- Svelte 5.56.4 or later

It also makes these breaking changes [13]:

- removes `$app/stores`
- replaces `goto`'s `keepFocus` and `noScroll` with `reset`
- moves the `OnNavigate` types to `$app/navigation`

The docs quoted below come from `main`, which is Kit 3. Differences from 2.x are noted where they matter.

**`svelte/transition` and `svelte/easing`** [1][8]

- **Defaults are slower than UI guidance.** Every built-in transition defaults to 400 ms.
  - `fade` uses `linear`.
  - `fly`, `slide` and `scale` use `cubicOut`.
  - Always pass a duration between 150 and 300 ms.
- **Local by default.** Transitions play "only when the block they belong to is created or destroyed". Add `|global` to opt out.
- **Prefer `css` over `tick`.** "If it's possible to use `css` instead of `tick`, do so — web animations can run off the main thread."
- **Reduced motion needs code.** The docs' Accessibility section says to "use `prefersReducedMotion` to adjust (or completely disable) the transition".
- **Easing choices.** Use `cubicOut` or `quartOut` for entrances, `cubicIn` for exits, and `backOut` for occasional overshoot.

```svelte
<div
	in:fly={{ y: prefersReducedMotion.current ? 0 : 12, duration: 250, easing: cubicOut }}
	out:fade={{ duration: 150 }}
>
	…
</div>
```

**`svelte/animate`** [2][8]

- `flip` runs only when a keyed `{#each}` block is reordered.
- Its duration defaults to `√distance × 120` ms, with `cubicOut`.
- It also runs on the Web Animations API, so gate it on reduced motion too.

**`svelte/motion`** [3]

- **`Spring`**
  - Defaults are `stiffness 0.15`, `damping 0.8` and `precision 0.01`.
  - `Spring.of(() => v)` binds a spring to reactive state.
  - Call `.set(v, { instant: true })` under reduced motion.
- **`Tween`** defaults to 400 ms.
- **When to use them.** Use these classes for values driven from JavaScript: pointer tilt, drag, counters and the warehouse game. Use CSS for everything else.

**`MediaQuery`** [4]

- `prefersReducedMotion` is literally `new MediaQuery('(prefers-reduced-motion: reduce)')`.
- The docs warn: "during server-side rendering, there is no way to know what the correct value should be … If you can use the media query in CSS to achieve the same effect, do that."
- For this prerendered site, style with CSS and read `.current` only to configure JavaScript-driven animation.

**Attachments vs actions** [5][6]

- The `use:` docs say: "In Svelte 5.29 and newer, consider using attachments instead, as they are more flexible and composable."
- Attachments are "fully reactive", so they re-run when their arguments change.
  - Falsy values attach nothing: `{@attach enabled && fx}`.
  - Attachments pass through components that spread props.
  - `fromAction` converts an existing action.
- Port `src/lib/actions/inview.ts` to `{@attach inview({ dir: 'up' })}`.

**`$effect`** [7]

- The docs call it "an escape hatch — useful for things like analytics and direct DOM manipulation … avoid using it to synchronise state". Use `$derived` instead.

**`onNavigate` and View Transitions** [9][10]

- `onNavigate` fires "immediately before the new page is rendered … after any data loading". Returning a promise holds the navigation until the transition has started:

```js
onNavigate((navigation) => {
	if (!document.startViewTransition) return;
	return new Promise((resolve) => {
		document.startViewTransition(async () => {
			resolve();
			await navigation.complete;
		});
	});
});
```

- **Global styles.** `::view-transition-*` rules must be global, so put them in `app.css` or scope them as `:root::view-transition-…`.
- **Shared chrome.** Give persistent elements, such as the header and the active-nav indicator, a unique `view-transition-name`.
- **Reduced motion.** The blog: "reduced motion does not necessarily mean no animation … disable the sliding animation, but leave the default crossfade".
- **Focus and announcements.** After each navigation, SvelteKit announces the page `<title>` through a live region and moves focus to `<body>`. Every route therefore needs a unique title. To keep focus, use `keepFocus` on 2.x or `reset: false` on 3.x, and only when the focused element survives the navigation.

---

## 2. CSS platform status, October 2026 [14]

| Feature                                                         | Baseline (web-features 3.42.0)                                                                                           | How to use it here                                                                                                 |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `linear()` easing                                               | **Widely** (2026-06-11)                                                                                                  | CSS springs and bounces [20]. No fallback needed.                                                                  |
| Individual transforms, Web Animations, `prefers-reduced-motion` | **Widely**                                                                                                               | Compose hover lift with press squash.                                                                              |
| Same-document View Transitions                                  | **Newly** (2025-10-14, Firefox 144)                                                                                      | Page transitions via `onNavigate` [23]. Unsupported browsers just skip them.                                       |
| VT `types`, `:active-view-transition-type()`                    | **Newly** (2026-01-13, Firefox 147)                                                                                      | Forward/back direction-aware slides.                                                                               |
| Cross-document `@view-transition`                               | Limited (Chrome 126, Safari 18.2)                                                                                        | Not needed for an SPA. Interop 2026 [15].                                                                          |
| `@starting-style`, `transition-behavior: allow-discrete`        | **Newly** (2024-08-06)                                                                                                   | Entry and exit for `popover` and `<dialog>` [17][18]. Tailwind: `starting:`, `transition-discrete` [51].           |
| `@property`                                                     | **Newly** (2024-07-09)                                                                                                   | Typed, animatable custom properties. They repaint every frame, so keep them small.                                 |
| `light-dark()`                                                  | **Newly** (2024-05-13); Widely around Nov 2026                                                                           | Needs `color-scheme`, so the `.dark` class must also set `color-scheme: dark`.                                     |
| `content-visibility: auto`                                      | **Newly** (2025-09-15)                                                                                                   | Long below-fold sections, plus `contain-intrinsic-size: auto 600px`. Content stays in the accessibility tree [22]. |
| `fetchpriority`, Popover                                        | **Newly** (2024-10-29; 2025-01-27)                                                                                       | LCP image; tooltips and menus without JS.                                                                          |
| Scroll-driven animations                                        | **Not Baseline** (Chrome 115, Safari 26; no Firefox)                                                                     | `@supports` enhancement only [24]. Interop 2026.                                                                   |
| Anchor positioning                                              | Core in Chrome 125, Firefox 147 and Safari 26; not flagged Baseline because two `position-visibility` values are missing | Tooltips with a fallback [25]. Interop 2026.                                                                       |
| `interpolate-size`, `calc-size()`                               | **Not Baseline** (Chromium 129 only)                                                                                     | `:root { interpolate-size: allow-keywords }` lets `<details>` animate where supported and snap elsewhere [19].     |

**Notes.**

- **Scroll-driven animations scrub both ways.** They replay when the user scrolls back up, while NN/g says to animate once [39]. Use them for progress-like decoration, such as a reading bar or a condensing header, inside `@media (prefers-reduced-motion: no-preference) { @supports (animation-timeline: scroll()) {…} }`. Use a one-shot IntersectionObserver for content reveals.
- **Popover entry and exit.** Combine `@starting-style` with `allow-discrete`:

```css
[popover] {
	transition:
		opacity 150ms,
		translate 200ms var(--ease-enter),
		display 200ms allow-discrete,
		overlay 200ms allow-discrete;
}
[popover]:not(:popover-open) {
	opacity: 0;
	translate: 0 4px;
}
@starting-style {
	[popover]:popover-open {
		opacity: 0;
		translate: 0 4px;
	}
}
```

---

## 3. Motion design principles

**Purpose**

- **What motion is for.** NN/g lists feedback, state change, navigation metaphor and signifier reinforcement, and asks for motion that is "restrained and subtle" [37]. Microinteractions are "trigger-feedback pairs" [38] _(via search)_.
- **Apple's guidance [33]:**
  - "Add motion purposefully … Don't add motion for the sake of adding motion."
  - "Aim for brevity and precision."
  - "Generally avoid adding motion to UI interactions that occur frequently."
  - "Let people cancel motion."

**Durations**

- **NN/g** [36] _(via search)_:
  - 100–500 ms overall.
  - About 100 ms for toggles.
  - 200–300 ms for modal-scale changes.
  - Entrances slightly slower than exits, for example 300 ms in and 200–250 ms out.
- **Kowalski** (blog [44]): keep UI animation "shorter than 300 ms", with ease-out.
- **Perception thresholds:**
  - Response-time limits are 0.1 s (instant), 1 s (flow) and 10 s (attention) [42].
  - The Doherty threshold, about 400 ms, is a 1982 IBM heuristic [43].
- **Material 3 tokens [35]:**
  - `short1–4` = 50, 100, 150, 200 ms.
  - `medium1–4` = 250–400 ms.
  - `long` = 450–600 ms.
  - M3 pairs entrances with emphasized-decelerate at about 400 ms and exits with emphasized-accelerate at about 200 ms. Those values are tuned for mobile full-screen surfaces, so stay lower for web UI chrome.

**Easing.** Exact M3 values from source [35]:

- Emphasized/standard: `cubic-bezier(0.2, 0, 0, 1)`.
- Emphasized-decelerate, for entering: `cubic-bezier(0.05, 0.7, 0.1, 1)`.
- Emphasized-accelerate, for exiting: `cubic-bezier(0.3, 0, 0.8, 0.15)`.
- Tailwind v4's default `transition` is 150 ms with `cubic-bezier(0.4, 0, 0.2, 1)` [51].

**Springs**

- **M3 Expressive** (2025) has two families [35]:
  - _Spatial_ springs, for position, size and shape, may overshoot. Default: stiffness 380, damping ratio 0.8. Fast: 800 / 0.6.
  - _Effects_ springs, for opacity and colour, are always critically damped (ratio 1.0).
- **Rule:** bounce position and scale, never opacity or colour.

**Disney's principles applied to UI** [54] _(blog; Thomas & Johnston 1981)_

- Slow in / slow out → easing.
- Squash and stretch → a `:active` press at `scale: 0.97` with a spring release.
- Follow-through and overlap → short staggers.
- Anticipation and exaggeration → only in deliberate delight moments.
- Arcs → `offset-path` (Widely).

**Scroll** _(via search)_

- Scroll fades longer than 500 ms "feel too slow"; aim for 100–400 ms [39].
- Animate on first reach only, and don't fade text and images together [39].
- Avoid scroll fades on mobile [39].
- Scroll-triggered text "delays users". Never animate the logo, tagline or headline [40].
- Scrolljacking harms "user control and freedom, discoverability, attention, efficiency, and task success". Parallax slows reading and can trigger vestibular symptoms [41].

**Stagger.** No canonical rule exists. Practice is 20–50 ms per item; Flutter's cookbook uses 50 ms. Cap the whole sequence at about 250–300 ms.

---

## 4. Accessibility of motion

**WCAG 2.2 criteria that apply**

- **2.3.3 Animation from Interactions (AAA)** [27]
  - Interaction-triggered motion "can be disabled, unless the animation is essential".
  - The Understanding text names parallax and non-essential scroll-linked movement as vestibular triggers.
  - It accepts either of two approaches:
    - honouring the OS reduce-motion setting (technique C39 [30])
    - a site-wide toggle
- **2.2.2 Pause, Stop, Hide (A)** [28]
  - Covers anything that moves and:
    1. starts automatically,
    2. lasts more than 5 s, and
    3. sits alongside other content.
  - That content needs a pause, stop or hide mechanism.
  - A loop that pauses only on hover or focus "would not be considered a mechanism".
  - So decorative infinite loops need a visible pause control, or they must stop within 5 s, whatever the user's motion preference.
- **2.3.1 Three Flashes (A)** [29]
  - No more than three flashes per second; red is the most sensitive colour.
  - Check confetti and celebration effects against this.
- **1.4.2 Audio Control (A)** [31]
  - Any audio that autoplays for more than 3 s needs a pause or volume control.
  - Browsers already gate audio behind a user gesture [26].
- **Also relevant** [31]:
  - 1.4.13: content shown on hover or focus must be dismissible, hoverable and persistent.
  - 2.4.11 Focus Not Obscured (AA): use `scroll-padding-top` under a sticky header.
  - 2.5.8: targets at least 24 × 24 px.

**Reduce, don't remove**

- **MDN** [21]: reduced motion "removes, reduces, or replaces" motion, and "scaling or panning large objects" is a vestibular trigger.
- **Apple** [34]:
  - "Tightening animation springs to reduce bounce effects."
  - "Replacing transitions in x-, y-, and z-axes with fades."
  - "Avoiding animating into and out of blurs."
  - Reduce "zooming, scaling, and peripheral motion".
- **Browser defaults.** The CSSWG discussed making a crossfade the UA default for view transitions under reduced motion [56] _(reported, not specified)_. Implement it yourself.
- **What to change under `reduce`:**
  - translation, scale and parallax → a 150–200 ms opacity crossfade
  - springs → ease-out with no overshoot, or `instant`
  - loops → static
  - `scroll-behavior` → `auto`
- **Site toggle.** Add a persisted "Reduce motion" toggle that sets `data-motion="reduce"` on `<html>` and is read alongside `prefersReducedMotion`.

**Focus and View Transitions**

- The old view is "a static image, so that the user can't interact with it"; the new view is live DOM [23].
- Duplicate `view-transition-name` values make the transition skip [23].
- Keep transitions at or under 300 ms, rely on SvelteKit's focus reset and title announcement [10], and never animate or delay `:focus-visible` rings.

**WCAG 3.** The latest Working Draft is dated 10 Sep 2026 [32]. W3C says it is years from final, and no regulation references it. Build to WCAG 2.2 AA plus 2.3.3.

---

## 5. Performance

**Compositor-friendly animation**

- Animate `transform`, the individual transform properties and `opacity`. Svelte `css` transitions qualify; `tick` transitions do not [1].
- web.dev: "never animate or transition CSS properties that require the browser to update the page layout, unless you're doing it in response to a user tap or key press (though not hover)" [47] _(via search)_.
- To animate a shadow, fade the opacity of a pseudo-element that carries it.
- Throttle `pointermove` handlers to `requestAnimationFrame`, and prefer IntersectionObserver over scroll listeners.

**`will-change`** [16]

- MDN: use it "as a last resort … Don't use it to anticipate performance problems".
- Overuse causes "excessive memory use".
- Toggle it from script around the animation; note that it creates a stacking context.

**Core Web Vitals** [45][47]

- From the `web-vitals` 6.2.3 source, at the 75th percentile:

| Metric | Good      | Poor      |
| ------ | --------- | --------- |
| LCP    | ≤ 2500 ms | > 4000 ms |
| INP    | ≤ 200 ms  | > 500 ms  |
| CLS    | ≤ 0.1     | > 0.25    |

- INP replaced FID in March 2024.
- Layout shifts within 500 ms of a discrete input are excused, but **hover-triggered shifts always count**.

**Reveals vs LCP** [46]

- Since Chrome 86, "Largest Contentful Paint ignores paints with opacity 0". A page whose largest element starts at `opacity: 0` will "see a longer LCP, reflecting the time until [it] is visible".
- So never reveal-animate the hero or LCP element.
- Apply the initial hidden state before first paint, through an inline script in `app.html`, never at hydration. Doing it at hydration produces a visible → hidden → visible flash.
- Keep content visible without JavaScript. Transform-based reveals cause no CLS.

**Fonts**

- The `@fontsource-variable/*` packages already ship variable `woff2` files split by `unicode-range`, with `font-display: swap` (verified in the package) [49].
- SvelteKit does not preload fonts by default. Preload only the Latin `wght-normal` files, using `resolve(event, { preload })` in `handle` [12].
- Those files are about 37 KB for Fraunces, 48 KB for Inter and 40 KB for JetBrains Mono, so ask whether the mono face earns its place.
- web.dev recommends `optional` for body text and `swap` for brand text, with `size-adjust` to match fallback metrics [48] _(via search)_. Metric overrides are not supported in Safari [14].

**Images**

- `<enhanced:img>` produces AVIF and WebP, adds intrinsic `width` and `height` "to avoid layout shift", generates `srcset` and strips EXIF [11].
- Provide sources at 2× and set `sizes` on wide images.
- For the LCP image: "set `fetchpriority="high"` and avoid `loading="lazy"`" [11].
- **Version constraints** [50]:
  - `enhanced-img` 1.0.0 needs Vite 8.
  - 0.11.0 needs vite-plugin-svelte 6 or 7.
  - The repo's vite-plugin-svelte 5.1.1 caps it at **0.6.1**.

---

## 6. Delight and playful interaction

2026 trend coverage highlights gamified navigation, with Bruno Simon's driveable 3D portfolio as the touchstone [55] _(blog)_. The consistent caveat is that the play must still serve a purpose.

| Pattern                                                                              | Verdict                | Doing it well                                                                                    |
| ------------------------------------------------------------------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------ |
| Tactile hover/press (lift 2 px; `scale: 1.02`, or 0.97 on `:active`; spring release) | ✅ Core delight        | Only under `(hover: hover)`, which is Tailwind v4's default for hover [51]. 100–200 ms.          |
| Easter eggs (Konami code, logo clicks, achievements)                                 | ✅ Cheap and memorable | Never block content. Reachable by keyboard; announce via a polite live region.                   |
| Optional mini-game (the warehouse sim)                                               | ✅ Signature piece     | Skippable, pausable, keyboard-operable, with a static summary for people who skip it.            |
| View-transition page changes                                                         | ✅                     | Up to 300 ms; crossfade under reduced motion.                                                    |
| One-shot celebration (confetti, a truck honk)                                        | ✅ Sparingly           | Only for success the user caused. At most 1 s, with no flashing [29].                            |
| Sound                                                                                | ⚠️ Opt-in              | Off by default behind a persisted toggle. `AudioContext` needs a user gesture [26].              |
| Pointer-reactive tilt, magnetic buttons                                              | ⚠️ Desktop only        | `(pointer: fine)`, small amplitude, off under reduced motion.                                    |
| Cursor replacement or trailing followers                                             | ❌ Gimmick             | The native cursor honours OS size and contrast settings; a replacement loses that [57] _(blog)_. |
| Scrolljacking, horizontal-scroll hijack, parallax                                    | ❌ Harmful             | See [41].                                                                                        |
| Preloaders, intro sequences                                                          | ❌                     | They delay LCP and break "let people cancel motion" [33].                                        |
| Endless marquees and tickers                                                         | ❌ unless pausable     | WCAG 2.2.2 [28].                                                                                 |
| Screen shake                                                                         | ❌                     | Xbox guidelines treat camera shake as a comfort risk that must be optional [53] _(via search)_.  |

**Cozy-game (Stardew-like) styling, done with taste**

- **Wood and parchment panels.** Use a single 9-slice `border-image` (Widely) or layered gradients, not full-bleed textures. Text stays real HTML.
- **Pixel accents.** Apply `image-rendering: pixelated` (Widely) to small sprites at whole-number scales (2×, 3×). Keep pixel fonts to short labels only.
- **"Juice."** Squash and stretch, particles and tweened pops [52] belong to user-initiated success moments only, never to passive scrolling or idle loops.
- **Hover bounce.** Use the _snappy_ spring below with ≤ 3 px of travel, on press release rather than continuously. Under reduced motion, keep only the colour or shadow change.

---

## Recommended motion tokens

| Token                                            | Value                                                                                                                                                                                                                                                                            | Use                                               | Basis                                            |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------ |
| `--dur-1`                                        | 100ms                                                                                                                                                                                                                                                                            | Press feedback, toggles                           | NN/g [36]; M3 short2                             |
| `--dur-2`                                        | 150ms                                                                                                                                                                                                                                                                            | Hover colour and shadow; reduced-motion crossfade | Tailwind default [51]; M3 short3                 |
| `--dur-3`                                        | 200ms                                                                                                                                                                                                                                                                            | Exits, tooltips, popovers                         | NN/g; M3 short4                                  |
| `--dur-4`                                        | 250ms                                                                                                                                                                                                                                                                            | Entrances, menus, reveals, view transitions       | NN/g; M3 medium1                                 |
| `--dur-5`                                        | 300ms                                                                                                                                                                                                                                                                            | Modals and large panels; ceiling for UI chrome    | NN/g; [44]                                       |
| `--dur-6`                                        | 400ms                                                                                                                                                                                                                                                                            | Rare: hero-scale moves, game moments              | M3 medium4                                       |
| `--ease-enter`                                   | `cubic-bezier(0.05, 0.7, 0.1, 1)`                                                                                                                                                                                                                                                | Entering                                          | M3 emphasized-decelerate [35]                    |
| `--ease-exit`                                    | `cubic-bezier(0.3, 0, 0.8, 0.15)`                                                                                                                                                                                                                                                | Leaving (keep it short)                           | M3 emphasized-accelerate                         |
| `--ease-move`                                    | `cubic-bezier(0.2, 0, 0, 1)`                                                                                                                                                                                                                                                     | On-screen moves and resizes                       | M3 emphasized/standard                           |
| `--ease-spring-gentle` (399 ms, 1.5 % overshoot) | `linear(0, 0.006 1.5%, 0.024 3%, 0.056 4.8%, 0.104 6.8%, 0.198 10%, 0.534 20.5%, 0.632 24%, 0.711 27.3%, 0.78 30.5%, 0.837 33.8%, 0.883 37%, 0.923 40.5%, 0.957 44.5%, 0.982 48.8%, 1.01 58.8%, 1.015 70.8%, 1)`                                                                 | Panels and cards settling                         | M3 Expressive default spatial (k = 380, ζ = 0.8) |
| `--ease-spring-snappy` (366 ms, 9.5 % overshoot) | `linear(0, 0.008 1.2%, 0.03 2.5%, 0.072 4%, 0.127 5.5%, 0.252 8.2%, 0.641 16%, 0.751 18.5%, 0.845 21%, 0.916 23.2%, 0.98 25.8%, 1.027 28.2%, 1.063 31%, 1.089 34.8%, 1.094 38.8%, 1.081 43.8%, 1.019 57.8%, 0.998 66%, 0.991 76.5%, 1)`                                          | Hover lift, press release, toggles                | M3 Expressive fast spatial (k = 800, ζ = 0.6)    |
| `--ease-spring-playful` (618 ms, 20 % overshoot) | `linear(0, 0.009 1%, 0.035 2%, 0.087 3.2%, 0.157 4.5%, 0.313 6.8%, 0.755 12.5%, 0.888 14.5%, 0.986 16.2%, 1.066 18%, 1.127 19.8%, 1.17 21.5%, 1.195 23.2%, 1.205 25.8%, 1.19 28.5%, 1.156 31.2%, 1.014 40.8%, 0.979 44.5%, 0.961 48.2%, 0.961 53.8%, 0.997 66%, 1.007 72.8%, 1)` | Delight moments only (game, easter eggs)          | Custom (k = 500, ζ = 0.45)                       |
| `--stagger`                                      | 30ms per item; at most 8 items (≤ 240 ms total)                                                                                                                                                                                                                                  | Lists and grids                                   | Practice (§3)                                    |
| `--reveal-distance`                              | 8–12px; scale from ≥ 0.95, never 0                                                                                                                                                                                                                                               | Entrances                                         | NN/g, Apple                                      |

**About the spring curves**

- They were generated for this review from the damped-spring equation with unit mass, starting at rest.
- They were sampled until the motion settled within 0.2 %, with no more than 0.5 % fitting error.
- Always use each spring with its stated duration.
- Apply springs to `transform`, `translate` or `scale` only.
- Under reduced motion, every spring becomes `--ease-enter` at `--dur-2` with zero travel.

In Tailwind v4, declare the `--ease-*` tokens in `@theme` to generate `ease-enter` and the other easing utilities [51].

---

## Do / Don't checklist

**Do**

- [ ] Write motion-safe first: put movement inside `@media (prefers-reduced-motion: no-preference)` or Tailwind's `motion-safe:`, and keep crossfades for `reduce` [30][51].
- [ ] Gate every Svelte transition, `animate:`, `Spring` and `Tween` on `prefersReducedMotion.current` and the site toggle. Pass explicit durations of 150–300 ms [1][3][8].
- [ ] Use `css`-based transitions (not `tick`), the `Spring` and `Tween` classes, and `{@attach}` [1][3][5].
- [ ] Add view transitions with `onNavigate`, unique names on persistent chrome, ≤ 300 ms, and a crossfade under reduced motion. Give every route a unique `<title>` [9][10].
- [ ] Give any loop longer than 5 s a visible pause control, and offer a persisted "Reduce motion" toggle [27][28].
- [ ] Animate only transforms and `opacity`. Toggle `will-change` around the animation and remove it afterwards [16].
- [ ] Keep the hero and LCP element visible at first paint, with `fetchpriority="high"`. Run reveals once, quickly and sparingly [11][39][46].
- [ ] Preload the critical Latin `woff2` files, and pin `<enhanced:img>` to a version that matches the toolchain [12][50].
- [ ] Put scroll-driven animations, `interpolate-size` and anchor positioning behind `@supports` [14].

**Don't**

- [ ] Count on a global CSS duration reset to cover Svelte transitions [1].
- [ ] Bounce opacity or colour, scale from 0, or animate frequent or keyboard-driven actions [33][35].
- [ ] Use scrolljacking, parallax, preloaders, endless marquees, screen shake or cursor replacement [41][53].
- [ ] Let reveal fades run longer than 400 ms, or fade text and images together [39].
- [ ] Animate `left`, `top`, `width`, `height` or `box-shadow` frame by frame [47].
- [ ] Autoplay sound, or flash more than three times per second [29][31].
- [ ] Make content wait for JavaScript or hydration before it becomes visible [46].

**Implications for this repo (observed 2026-10-13)**

- **`src/app.css`, the `.reveal` and `.stagger` classes**
  - Durations are 550 ms and 450 ms; the guidance is 400 ms or less.
  - Travel is 28 px (`1.75rem`); the guidance is 8–12 px.
  - Stagger is 65 ms with no cap.
  - `will-change` is set permanently.
  - The hidden state is applied after hydration.
  - The reduced-motion path is already a crossfade, which is good, but at 400 ms linear. Use 150–200 ms instead.
- **`ConveyorBelt.svelte`** loops forever, and under `reduce` it only slows down. Add a pause control and make it static under reduced motion (2.2.2 and 2.3.3).
- **`WarehouseScene.svelte`** transitions `left`. Switch to `translate`.
- **`src/lib/actions/inview.ts`** should become an attachment, and above-the-fold sections should be excluded from reveals.

---

## References

1. Svelte docs, "transition:" (incl. Accessibility). https://svelte.dev/docs/svelte/transition — source `sveltejs/svelte` main, Svelte 5.57.2, read 2026-10-13.
2. Svelte docs, "animate:". https://svelte.dev/docs/svelte/animate
3. Svelte docs, "svelte/motion" (`Spring`/`Tween` @since 5.8.0; `prefersReducedMotion` @since 5.7.0; `spring`/`tweened` @deprecated). https://svelte.dev/docs/svelte/svelte-motion
4. Svelte docs, "svelte/reactivity — MediaQuery". https://svelte.dev/docs/svelte/svelte-reactivity#MediaQuery
5. Svelte docs, "{@attach …}" (Svelte ≥ 5.29). https://svelte.dev/docs/svelte/@attach
6. Svelte docs, "use:". https://svelte.dev/docs/svelte/use
7. Svelte docs, "$effect". https://svelte.dev/docs/svelte/$effect
8. Svelte source, transition, animate and easing defaults. https://github.com/sveltejs/svelte/tree/main/packages/svelte/src
9. G. Rich, "Unlocking view transitions in SvelteKit 1.24", svelte.dev blog, 2023-08-31. https://svelte.dev/blog/view-transitions
10. SvelteKit docs, "Accessibility". https://svelte.dev/docs/kit/accessibility
11. SvelteKit docs, "Images". https://svelte.dev/docs/kit/images
12. SvelteKit docs, "Performance". https://svelte.dev/docs/kit/performance
13. SvelteKit CHANGELOG 3.0.0/3.0.1 (Oct 2026); npm dist-tags read 2026-10-13. https://github.com/sveltejs/kit/blob/main/packages/kit/CHANGELOG.md
14. W3C WebDX CG, `web-features` 3.42.0 (2026-10-09). https://www.npmjs.com/package/web-features · https://webstatus.dev
15. Interop 2026. https://github.com/web-platform-tests/interop/blob/main/2026/README.md
16. MDN, `will-change`. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/will-change
17. MDN, `@starting-style`. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@starting-style
18. MDN, `transition-behavior`. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transition-behavior
19. MDN, `interpolate-size`. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/interpolate-size
20. MDN, `linear()`. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/easing-function/linear
21. MDN, `prefers-reduced-motion`. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion
22. MDN, `content-visibility`. https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/content-visibility
23. MDN, View Transition API; "Using the View Transition API". https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API
24. MDN, Scroll-driven animations guide. https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations
25. MDN, Anchor positioning guide. https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Anchor_positioning
26. MDN, Autoplay guide for media and Web Audio APIs. https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay
27. W3C, Understanding SC 2.3.3 Animation from Interactions. https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions
28. W3C, Understanding SC 2.2.2 Pause, Stop, Hide. https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide
29. W3C, Understanding SC 2.3.1 Three Flashes or Below Threshold. https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold
30. W3C, Technique C39 (prefers-reduced-motion). https://www.w3.org/WAI/WCAG22/Techniques/css/C39
31. W3C, WCAG 2.2 (SC 1.4.2, 1.4.13, 2.4.11, 2.5.8). https://www.w3.org/TR/WCAG22/
32. W3C WAI, "For Review: WCAG 3 Working Draft", 2026-09-10; "WCAG 3 Introduction". https://www.w3.org/WAI/news/2026-09-10/wcag3/ · https://www.w3.org/WAI/standards-guidelines/wcag/wcag3-intro/
33. Apple HIG, Motion. https://developer.apple.com/design/human-interface-guidelines/motion
34. Apple HIG, Accessibility — Motion. https://developer.apple.com/design/human-interface-guidelines/accessibility
35. Material Design 3 motion tokens: `material-web` `tokens/versions/v0_192/_md-sys-motion.scss`; AndroidX Compose `MotionTokens.kt`, `ExpressiveMotionTokens.kt`, `StandardMotionTokens.kt` (androidx-main, Oct 2026). Spec: https://m3.material.io/styles/motion/easing-and-duration
36. NN/g, "Executing UX Animations: Duration and Motion Characteristics" _(via search)_. https://www.nngroup.com/articles/animation-duration/
37. NN/g, "The Role of Animation and Motion in UX" _(via search)_. https://www.nngroup.com/articles/animation-purpose-ux/
38. NN/g, "Microinteractions in User Experience" _(via search)_. https://www.nngroup.com/articles/microinteractions/
39. NN/g, "Scroll Fading 101" _(via search)_. https://www.nngroup.com/articles/scroll-fading-101/
40. NN/g, "Scroll-Triggered Text Animations Delay Users", 2017 _(via search)_. https://www.nngroup.com/articles/scroll-animations/
41. NN/g, "Scrolljacking 101" (2023); "What Parallax Lacks" (2019) _(via search)_. https://www.nngroup.com/articles/scrolljacking-101/ · https://www.nngroup.com/articles/parallax-usability/
42. J. Nielsen, "Response Times: The 3 Important Limits", NN/g. https://www.nngroup.com/articles/response-times-3-important-limits/
43. W. J. Doherty & A. J. Thadani, "The Economic Value of Rapid Response Time", IBM, 1982 (primary not retrieved; summary _(blog)_: https://lawsofux.com/doherty-threshold/).
44. E. Kowalski, "Great Animations" _(blog, via search)_. https://emilkowal.ski/ui/great-animations
45. GoogleChrome `web-vitals` v6.2.3 (threshold constants in `src/onLCP.ts`, `onINP.ts`, `onCLS.ts`). https://github.com/GoogleChrome/web-vitals
46. Chromium, LCP metric changelog (M86 "ignores paints with opacity 0"; M144 fix). https://chromium.googlesource.com/chromium/src/+/main/docs/speed/metrics_changelog/lcp.md
47. web.dev, "Cumulative Layout Shift"; "The most effective ways to improve Core Web Vitals" _(via search)_. https://web.dev/articles/cls · https://web.dev/articles/top-cwv
48. web.dev, "Optimize web fonts"; "Best practices for fonts"; "CSS size-adjust" _(via search)_. https://web.dev/learn/performance/optimize-web-fonts · https://web.dev/articles/font-best-practices · https://web.dev/articles/css-size-adjust
49. Fontsource, `@fontsource-variable/{inter,fraunces,jetbrains-mono}` (package CSS and files inspected). https://fontsource.org
50. npm registry, `@sveltejs/enhanced-img` versions and peer dependencies, read 2026-10-13. https://www.npmjs.com/package/@sveltejs/enhanced-img
51. Tailwind CSS v4 docs (states: `motion-safe`, `motion-reduce`, `starting:`; transition-behavior; upgrade guide: hover media query) and `theme.css`. https://tailwindcss.com/docs/hover-focus-and-other-states · https://tailwindcss.com/docs/upgrade-guide
52. M. Jonasson & P. Purho, "Juice it or lose it", 2012 talk. https://www.gamedeveloper.com/design/video-is-your-game-juicy-enough-
53. Microsoft, Xbox Accessibility Guidelines _(via search)_. https://devdocs.xbox.com/build/game-principles/accessibility/xbox-accessibility-guidelines
54. F. Thomas & O. Johnston, _The Illusion of Life_ (1981); UI application, IxDF _(blog)_. https://ixdf.org/literature/article/ui-animation-how-to-apply-disney-s-12-principles-of-animation-to-ui-design
55. Envato, "Portfolio design trends for 2026" _(blog)_. https://elements.envato.com/learn/portfolio-trends
56. CSSWG, reduced motion and view transitions discussion (#10267), Sep 2024. https://lists.w3.org/Archives/Public/public-css-archive/2024Sep/0857.html
57. 21st.dev, "Custom cursor in React" _(blog)_. https://21st.dev/blog/custom-cursor-react
