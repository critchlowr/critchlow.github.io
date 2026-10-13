# 03 · Cross-reference: current site vs best practice

_Compiled 2026-10-13 against `main` @ `bf1f6c7`. Inputs: 01a (motion/platform), 01b (colour/aesthetics), 02 (audit), 04 (accessibility results). The key audit claims were spot-checked in `src/`. New evidence gathered for this report: Playwright LCP traces (Chromium 141, 18 loads), two Lighthouse 13.5 runs on the build plus two on a patched copy, contrast checks with `a11y/palette-contrast.mjs`, and a Machado CVD check (it reproduces 01b's Palette B numbers exactly). The scratch scripts are not committed. Effort key: **S** < ½ day · **M** ½–2 days · **L** > 2 days._

## 1. Summary

- **Verdict.** The foundation is good: a prerendered static core, idiomatic Svelte 5, a semantic token layer with recorded contrast reasoning, and accessibility basics in place. Two features and one CSS rule undermine it. The bartending marquee and the WMS simulator account for most of the weight, all the Level-A motion failures and the focus traps. A `.stagger` rule blanks the page without JS.
- **Fix first (Phase 0, about 2 days).** There are six WCAG failures (04) and one robustness bug:
  - skip-link and focus-ring contrast
  - 12 controls with no focus ring in forced colours
  - two auto-moving loops that ignore reduced motion (Level A, rated **Critical**)
  - a scroller that keyboard users can't reach
  - the no-JS blank page.
- **LCP is fine for real users. Lighthouse's 8.9 s is a simulation artifact caused by the 2.45 MB of eager JPEGs, not by `.reveal`.** Adding `loading="lazy"` to the JPEGs alone moved Lighthouse LCP from 8.9–9.0 s to 2.6–2.7 s and the performance score from 70–72 to 93–94 (§1a).
- **Simplify before you reskin.**
  - Cut the nav from 8 links to 5.
  - Move the simulator to its own `/simulator` route, linked once.
  - Delete the marquee, conveyor belt and ambient drift.
  - Restore the archived _You and I_ case study.
  - Put role and proof in the first screen.
- **Visual identity: the tuned Palette B, "Almanac"**, with two values changed from 01b so every ground passes. Pair it with Fraunces (SOFT axis) and Atkinson Hyperlegible Next, and drop JetBrains Mono. All 76 text/ground pairs pass WCAG 2.2 AA (§6).
- **Arches are a framing accent, not a system:** 1–3 per page (portrait, hero band, contact "door"). Cards stay rectangular at 6 px (01b §1).
- **Motion: less and faster.** Reveals go on card groups only (250 ms, 8 px, a 30 ms stagger capped at 8 items) and never on the hero or text. Springs are for spatial properties only. The motion tokens come from 01a.
- **Toolchain.** Move CI to Node 22 and add a PR gate that runs the existing `a11y/check.mjs`. SvelteKit 3 is a separate track after Phase 1: `src/` uses none of the APIs it breaks.

## 1a. LCP: what is actually true

| Measurement (this report)                                                     | FCP            | LCP (element)                  | Hydration adds `.reveal`                 |
| ----------------------------------------------------------------------------- | -------------- | ------------------------------ | ---------------------------------------- |
| Unthrottled, 1440 px, 5 cold loads                                            | 208–292 ms     | **= FCP** (hero summary `<p>`) | 223–334 ms; `in-view` 18–23 ms later     |
| Unthrottled, 412 px, 3 cold loads                                             | 156–204 ms     | = FCP                          | 225–244 ms; `in-view` 20–33 ms later     |
| Warm cache, 6 loads                                                           | 76–176 ms      | = FCP                          | 86–100 ms; `in-view` 9–44 ms later       |
| **Slow 4G + 4× CPU, applied (not simulated), gzip, 412 px**                   | **948–968 ms** | **= FCP**                      | 1,601–1,647 ms; `in-view` 50–74 ms later |
| Lighthouse 13.5 (simulated), current build                                    | 2.4 s          | **8.9–9.0 s** · perf 70–72     | —                                        |
| Lighthouse, same build with only `loading="lazy"` on the 21 JPEG `<img>` tags | 2.4 s          | **2.6–2.7 s** · perf 93–94     | —                                        |

**What happens, step by step**

1. The prerendered `<p>` paints at opacity 1. `grep -c reveal build/index.html` returns 0, and the LCP entry is emitted at FCP every time.
2. Hydration then adds `.reveal`. This starts a 1 → 0 transition, but `in-view` arrives 9–74 ms later, inside the paragraph's 130 ms transition delay (`--i: 2`), so it never visibly dims. Often both classes land before first paint.
3. Lighthouse's Lantern model averages an optimistic and a pessimistic graph 50/50. The pessimistic LCP graph treats **every request that started before the observed LCP** as render-blocking (`treatNodeAsRenderBlocking: _ => true` in `trace_engine/…/lantern/metrics/LargestContentfulPaint.js`).
4. On a fast run, 32 requests start before FCP: 2.7 MB, including 11 JPEGs worth 2.45 MB. At 1.6 Mbps those requests alone take about 13.5 s, and averaging that with the optimistic graph gives about 9 s.
5. Lighthouse prints the LCP node from the _post-hydration_ DOM (`class="… reveal in-view"`). That is why 04 blamed `.reveal`.

**What real users get**

- About 0.1–0.3 s on broadband.
- About 1 s on a mid-tier phone on slow 4G.
- The eager JPEGs still compete with fonts and JS for bandwidth, and the load event lands at about 17 s on slow 4G (measured).

**The fix**

1. Lazy-load, size and re-encode the photos, or remove the marquee (Phase 0).
2. Remove `use:inview` from all six hero elements (`Hero.svelte:16,21,25,27,31,35`) anyway. It is harmless only because of timing luck, it leaves `will-change` layers behind, and it contradicts 01a §5 [46].
3. The remaining 2.6 s is FCP, held back by two render-blocking CSS files. The Phase 1 CSS and font items take it under 2.5 s.

## 2. Gap matrix

| Best practice (source)                                                                                    | Current state (evidence)                                                                                                                                                                            | Severity                    | Recommendation                                                                                                                    | Effort |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------ |
| **Accessibility**                                                                                         |                                                                                                                                                                                                     |                             |                                                                                                                                   |        |
| Auto-moving content > 5 s can be paused; interaction motion can be disabled — 01a §4 [27][28]             | Marquee rAF moves under `reduce`, no pause (`Experience.svelte:33-94`). Conveyor loops under `reduce` (`ConveyorBelt.svelte:153-173`). (04 #3, #4)                                                  | **Critical** (Level A)      | Remove both (§4c)                                                                                                                 | S      |
| Text 4.5:1, including the skip link — 01b §3 [24]                                                         | White on accent-500: 3.12:1 (`SkipLink.svelte:3`; 04 #1)                                                                                                                                            | High                        | `bg-accent-800` (7.66:1); `primary`/`on-primary` in Phase 2                                                                       | S      |
| Focus ring ≥ 3:1 — 01b §3 [24]                                                                            | accent-500: 2.97:1 on the page, 2.38:1 on the band (`app.css:258-260`; 04 #6)                                                                                                                       | High                        | `outline-accent-700 dark:outline-accent-300` (≥ 4.02 / ≥ 5.04:1 on all grounds); `--t-focus` later                                | S      |
| Focus visible in forced colours — 01b §3 [46]                                                             | 12 controls use `focus:outline-none focus:ring-*` (`Simulator.svelte:73`, `Experience.svelte:219,264,277`, PickingPanel ×8; 04 #2)                                                                  | High                        | Delete them so the global `:focus-visible` applies; ban `outline-none` in CI                                                      | S      |
| Content never waits for JS — 01a §5 [46]                                                                  | `.stagger > *` is `opacity: 0` unconditionally (`app.css:318-325`): with no JS, 49 children (cards, contact links) are invisible                                                                    | High                        | Hide only what the attachment armed, and arm only below the fold                                                                  | S      |
| Scrollers keyboard-reachable (2.1.1) — 04 #5                                                              | Flow diagram `overflow-x-auto`, unfocusable in Safari/Firefox (`Simulator.svelte:39`)                                                                                                               | High (A, narrow scope)      | Wrap the flow at small widths; else `tabindex="0" role="region" aria-label`                                                       | S      |
| Dialogs: focus in, contained, returned; top layer — 02 §4, §7                                             | Lightbox close button under the nav, no focus handling (`Experience.svelte:296-335`). Simulator modal never takes focus; it drops to `<body>` after Wave (`WarehouseModal.svelte:11-44`)            | High                        | Remove the lightbox; make the simulator a route; any remaining dialog uses `<dialog>.showModal()`                                 | M      |
| Simulator: contrast, label-in-name (2.5.3), status messages (4.1.3) — 02 §5                               | White on moss/ember/plum/blue: 2.92–3.76:1; 4 name mismatches (`PickingPanel.svelte:285,371,429,477`); no live region                                                                               | High (in simulator)         | `on-primary` tokens, labels that start with the visible text, one `aria-live="polite"` line                                       | M      |
| Accessible documents — 02 §1                                                                              | Résumé PDF untagged, empty Title                                                                                                                                                                    | Medium                      | Re-export tagged; check in PAC/veraPDF                                                                                            | S      |
| Focus not obscured (2.4.11); links not by colour alone (1.4.1) — 01a §4 [31]; 01b §3                      | No `scroll-padding-top` (none obscured in 04's walk); ArrowLinks underline on hover only, but have a glyph                                                                                          | Low                         | `scroll-padding-top: 5rem`; underline inline links                                                                                | S      |
| Skip link, landmarks, heading order, ARIA state, reflow, text spacing, gradient text ≥ 5.04:1 — 02 §7; 04 | All pass                                                                                                                                                                                            | None                        | Lock in with CI (Tooling)                                                                                                         | —      |
| **Performance**                                                                                           |                                                                                                                                                                                                     |                             |                                                                                                                                   |        |
| LCP ≤ 2.5 s; never reveal the LCP element — 01a §5 [45][46]                                               | Real users: LCP = FCP, 0.1–1.0 s. Lighthouse 8.9 s is an artifact (§1a). `use:inview` ×6 on the hero                                                                                                | Medium (lab score, fragile) | Remove hero reveals; lazy JPEGs                                                                                                   | S      |
| Right-sized modern images with dimensions, lazy below the fold — 01a §5 [11][50]                          | 2.47 MB of eager JPEGs, about 5× oversampled; 33 of 34 `<img>` lack dimensions (02 §6)                                                                                                              | High                        | Phase 0: `loading="lazy" decoding="async" width height`. Phase 1: drop the marquee; 2× AVIF headshot; `enhanced:img` after Vite 8 | S→M    |
| Minimal render-blocking CSS — 01a §5 [12]                                                                 | 17.3 KB gz in 2 files: about 12 KB simulator CSS (static import, `Simulator.svelte:6-7`), 77 unused `.prose` rules (`app.css:10`)                                                                   | Medium                      | Drop the typography plugin; route-split the simulator                                                                             | S      |
| Preload critical fonts; justify each face — 01a §5 [12][48][49]                                           | No preload; 125 KB fonts, of which JetBrains Mono is 40 KB for 16 labels                                                                                                                            | Medium                      | `hooks.server.ts` preload filtered to `/-latin-(soft\|wght)-normal\./`; system mono (§6: 96 KB)                                   | S      |
| No idle work; `will-change` only while animating — 01a §5 [16]                                            | 47 rAF/s forever; scrollspy does 8 `getBoundingClientRect` per frame (`Nav.svelte:32,52`); Ambient restyles on scroll; blur over moving layers (`Nav.svelte:67`); 30 permanent `will-change` layers | Medium                      | Remove the marquee and Ambient; IntersectionObserver scrollspy; drop `will-change`                                                | S      |
| No fragile third parties; lean HTML — 02 §0, §6                                                           | 12 jsDelivr devicon requests; 52% of `index.html` is `class` strings                                                                                                                                | Medium / Low                | Text skills list; `Icon`, `Badge` and `Card` component classes                                                                    | S/M    |
| CLS ≤ 0.1, INP ≤ 200 ms — 01a §5 [45]                                                                     | CLS 0.001; TBT 20–40 ms                                                                                                                                                                             | None                        | —                                                                                                                                 | —      |
| **Motion**                                                                                                |                                                                                                                                                                                                     |                             |                                                                                                                                   |        |
| Reveal once, ≤ 400 ms, 8–12 px, stagger ≤ 300 ms total — 01a §3 [39]                                      | 550/450 ms, 28 px, a 65 ms stagger reaching 715 ms (`app.css:279-329`)                                                                                                                              | Medium                      | 250 ms, 8 px, 30 ms × ≤ 8 (§6)                                                                                                    | S      |
| Never animate headlines or text on scroll — 01a §3 [40]                                                   | 21 `.reveal` (hero, headings, paragraphs) plus 8 `.rule-draw`                                                                                                                                       | Medium                      | Card groups only; text and rules static                                                                                           | S      |
| Decorative loops stop in 5 s or pause — 01a §4 [28]                                                       | 4 infinite Ambient drifts for every user without `reduce`, plus scroll coupling (`Ambient.svelte:20-45,113-187`)                                                                                    | High                        | Remove; keep the static washes                                                                                                    | S      |
| Springs for spatial properties only — 01a §3 [35]                                                         | `ease-spring` (y = 1.4) on `transition-[background-color,transform]` (`Hero.svelte:38,44`, plus 3 more)                                                                                             | Low                         | `press` utility (§6)                                                                                                              | S      |
| Compositor-only properties — 01a §5 [47]                                                                  | `box-shadow` hover (`Card.svelte:29-32`); `left` in `WarehouseScene.svelte:648,767,844`                                                                                                             | Low                         | Pseudo-element shadow; `translate`                                                                                                | S      |
| Reduce, don't remove: 150–200 ms crossfade — 01a §4 [34]                                                  | Opacity-only ✓, but 400 ms linear (`app.css:338-345`)                                                                                                                                               | Low                         | `--dur-2`                                                                                                                         | S      |
| View transitions; site motion toggle — 01a §1 [9][10], §4                                                 | One route; OS setting only                                                                                                                                                                          | None now / Low              | Phase 3                                                                                                                           | M      |
| **Visual identity · colour · type**                                                                       |                                                                                                                                                                                                     |                             |                                                                                                                                   |        |
| Contrast verified at the token layer — 01b Do                                                             | `--t-*` with per-token rationale (`app.css:146-237`)                                                                                                                                                | None                        | Keep (§6 extends it)                                                                                                              | —      |
| Components use tokens only — 01b §3                                                                       | Portfolio: 83 ramp classes, 37 `dark:`. Simulator: 292 ramp classes, 138 `dark:`, 84 hex (02 §2)                                                                                                    | Medium                      | Migrate in Phase 2, then delete the ramps                                                                                         | L      |
| `color-scheme`; theme set before paint — 01a §2 [14]; 01b §3 [46]                                         | No `color-scheme`. A saved `system` theme on a dark OS paints light, then flips (`app.html:13-16`, verified). Unguarded `localStorage`                                                              | Medium                      | Declare `color-scheme`; resolve `system` inline; try/catch                                                                        | S      |
| Curvature as a framing accent — 01b §1 [1–11]                                                             | No arches; radii 8–16 px plus pills                                                                                                                                                                 | Medium (owner's goal)       | Arched portrait, hero band and footer door; 6 px cards                                                                            | M      |
| Warm palette, one cool voice, separation by lightness — 01b §3 [32][37]                                   | Valley: gold and a single plum link ✓                                                                                                                                                               | Low                         | Tuned Almanac (§6)                                                                                                                | M      |
| Body about 18 px, 50–75 ch, fluid display — 01b §5 [38–40]                                                | Body 17 px/1.68 (close); h1 fixed at 68 px; mobile CTAs at 872 px, below the fold                                                                                                                   | Medium                      | `1.125rem` body; `clamp()` display 44→68 px; 65 ch                                                                                | S      |
| Distinctive type, ≤ 2 families — 01b §5 [41–43]                                                           | Fraunces (wght only), Inter, JetBrains Mono: 125 KB                                                                                                                                                 | Medium                      | Fraunces SOFT + Atkinson Hyperlegible Next (§3)                                                                                   | S      |
| Low complexity; small static texture; one icon language — 01b §2 [20], §6; 02 §2                          | 3 container widths; no texture; 5 icon styles; 27.5 KB base64 favicon                                                                                                                               | Low                         | One container; optional ≤ 5% grain tile; `Icon` component; real SVG favicon                                                       | S      |
| **Information architecture & content**                                                                    |                                                                                                                                                                                                     |                             |                                                                                                                                   |        |
| Role and proof in the first screen — 01b §2 [19–23]                                                       | No role, photo or proof; ASSETS paper at about 4,300 px (02 §1)                                                                                                                                     | High                        | Hero rewrite (§4a-1)                                                                                                              | S      |
| Case studies as problem → role → method → outcome — 01b §2 [22]                                           | The only case study is un-routed (`lib/archive/`); the _You and I_ card has no link (`Work.svelte:47`)                                                                                              | High                        | `/work/you-and-i`                                                                                                                 | M      |
| Few, scannable nav choices — 01b §2 [20][22]                                                              | 8 hash links (`content.ts:299-308`)                                                                                                                                                                 | Medium                      | 5 links (§4b)                                                                                                                     | S      |
| Evidence over biography; one positioning line — 01b §2 [22]                                               | Experience is 32% of the page with 24 bullets and is not chronological; 4 different role statements                                                                                                 | Medium                      | Reverse-chronological, ≤ 3 outcome bullets; one line, reused everywhere                                                           | M      |
| Accurate content — 02 §1                                                                                  | Azure/Firebase logos for Power BI/Tableau (`content.ts:180-181`); "WCAG 2.1"; Atlas name mismatch; mixed dates                                                                                      | Medium                      | Fix; drop the logos                                                                                                               | S      |
| Delight at the edges — 01b §2 [22]; 01a §6                                                                | Simulator surfaced 3×; "Photo of Your Ex" SKU (`warehouse.ts:138`)                                                                                                                                  | Medium                      | One entry point; neutral SKUs                                                                                                     | S      |
| Meta hygiene — 02 §4                                                                                      | 2 meta descriptions; square 325 px OG image; no canonical, `theme-color`, sitemap or `+error.svelte`; fake `data-sveltekit-prerender`                                                               | Low                         | Fix; 1200×630 OG card                                                                                                             | S      |
| **Svelte/SvelteKit code practice**                                                                        |                                                                                                                                                                                                     |                             |                                                                                                                                   |        |
| Runes, typed props, CSS-first motion — 01a §1 [4]                                                         | ✓ no legacy syntax (02 §4)                                                                                                                                                                          | None                        | —                                                                                                                                 | —      |
| Attachments over actions; `$effect` only for side effects — 01a §1 [5][7]                                 | `use:inview` ×21, `use:portal`; an effect writes state (`WarehouseScene.svelte:121-123`)                                                                                                            | Low                         | `{@attach reveal()}`; writable `$derived`; delete `portal`                                                                        | S      |
| Lazy-load heavy optional features; cancellable timers — 01a §5 [12]; 02 §5                                | Simulator statically imported (12.1 KB gz JS + 11.9 KB CSS). `reset()` leaves timers live and corrupts state (verified). `{#key}` remounts a 1,202-line scene                                       | Medium (bug)                | `/simulator` route; timer registry; drop `{#key}`; Vitest for `warehouse.ts`                                                      | M      |
| Unique `<title>` per route — 01a §1 [10]                                                                  | Single route ✓                                                                                                                                                                                      | None now                    | Needed for the new routes                                                                                                         | S      |
| **Tooling/CI**                                                                                            |                                                                                                                                                                                                     |                             |                                                                                                                                   |        |
| PR gate on lint, type-check and a11y; supported Node — 02 §8                                              | Deploy-only workflow on Node 20, which is end of life (`deploy.yml:22-25`); no `engines`                                                                                                            | Medium                      | `ci.yml`: lint, check, build, `a11y/check.mjs`, `palette-contrast.mjs`; Node 22 + `.nvmrc`                                        | M      |
| Budgets and updates — 01a §5 [45]; 02 §8                                                                  | None                                                                                                                                                                                                | Low                         | Lighthouse CI (LCP ≤ 2.5 s, ≤ 500 KB); Dependabot                                                                                 | S      |
| Lint, format, check clean — 02 §8                                                                         | ✓                                                                                                                                                                                                   | None                        | —                                                                                                                                 | —      |

## 3. Conflicts and judgment calls

| Tension                                                                                          | What each side says                                                                                                                                                                                                                                        | Recommendation                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`animation-timeline: view()` reveals** (02 §(c)) vs **one-shot IntersectionObserver** (01a §2) | `view()` is CSS-only and fixes the no-JS problem. But it is not Baseline (no Firefox), and it scrubs, so it replays on scroll-up, which NN/g says not to do [39]                                                                                           | **IntersectionObserver.** Use a `{@attach}` reveal on card groups only, armed only below the fold. Keep scroll timelines for progress-style decoration (a header condense) behind `@supports`, in Phase 3 or never                                                                                |
| **Arches everywhere** (owner) vs **framing accent** (01b §1)                                     | Curvature preference is real but modest (g = 0.39) and weaker for whole environments [4][7]. Round reads soft; workwear reads durable [10]; all-round reads juvenile                                                                                       | **1–3 arches per page:** portrait, hero band, contact "door". Rectangular 6 px cards, straight stitch rules. Focus outlines follow the arch for free [45]                                                                                                                                         |
| **Fun and delight** vs **NN/g: scroll text delays users** (01a §3 [40])                          | Delight helps identity and the reflective level (01b §2 [18]), but passive motion taxes scanning hiring managers [22]                                                                                                                                      | Put delight in **materials** (palette, Fraunces SOFT, arches, stitch rules, pixel sprites) and **user-caused moments** (press squash, easter eggs, the simulator). There is **zero passive text motion**: no marquee, drift or conveyor                                                           |
| **Keep the WMS simulator** vs **its cost** (02 §5: 55% of source, failures, a bug)               | It is the site's best product thinking and its signature play piece. In its current form it is also its biggest liability                                                                                                                                  | **Keep it, as a route.** `/simulator` gets the section 04 narrative as its intro, a static diagram for people who don't play, and the game below with no modal. Fix timers, focus, the live region and tokens. If that refactor slips, unlink it rather than ship failures                        |
| **SvelteKit 3 now** vs **later**                                                                 | 3.0.1 is 7 days old [13]. `src/` uses none of the removed APIs (grep: 0 × `$app/stores`, `goto`, `keepFocus`, `onNavigate`). `@tailwindcss/vite` 4.3.3 accepts Vite 8. `enhanced-img` 1.0 needs Vite 8                                                     | **Later, as its own track after Phase 1.** Don't mix toolchain churn with a11y fixes. Do the in-range bumps now (Kit 2.70.3, Svelte 5.57.2, Tailwind 4.3.3)                                                                                                                                       |
| **Body face:** Atkinson Hyperlegible Next (34 KB) vs Public Sans (27 KB) vs Inter (48 KB)        | Atkinson shows the accessibility story [42], and the mockup already uses it. Public Sans has USWDS/Americana roots and is smallest [43]. Inter is generic and heaviest                                                                                     | **Atkinson Hyperlegible Next** for body and UI, Fraunces SOFT for display, system mono. Don't over-claim: the legibility case is design-led, not trial evidence. Keep Public Sans as the fallback if long paragraphs feel quirky in testing. WONK needs the 121 KB full Fraunces file, so skip it |
| **Palette A / B / C** (01b)                                                                      | A is the sharpest professional read but loses the Stardew warmth and continuity. C is the calmest, but its primary text is the tightest pair (4.78:1) and reads "interiors". B extends the current Valley identity (02 strength #9) and matches the mockup | **B, tuned (§6).** Americana comes through materials (slab-like Fraunces SOFT, stitch rules, woven-label badges), not a second palette                                                                                                                                                            |
| **`light-dark()`** vs the **`.dark` class + `--t-*`**                                            | `light-dark()` would make "system" mode free, but 175 `dark:` variants still depend on the class                                                                                                                                                           | Keep the class tokens through Phase 2. Reconsider once `dark:` usage reaches zero                                                                                                                                                                                                                 |
| **Bartending photos:** personality vs 2.47 MB                                                    | They show character, but they are the heaviest and least relevant content                                                                                                                                                                                  | One line in Experience, plus at most 2 static AVIF thumbnails in About                                                                                                                                                                                                                            |

## 4. Proposals to the owner

**(a) Edits**

| #   | Change                                                                                                                                                                                              | Rationale                                                          | Impact |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------ |
| 1   | Hero: **"Ryan Critchlow / Product & business analyst · HCI and accessibility research"**, chips **ASSETS 2026 · 3 yrs enterprise WMS · M.S. CS**, CTAs _Get in touch_ and _Résumé_, arched portrait | First impressions form in 50 ms, and hiring managers scan [19][22] | High   |
| 2   | Restore _You and I_ as `/work/you-and-i` (problem → role → method → outcome)                                                                                                                        | It is the strongest research artifact, and it is hidden            | High   |
| 3   | Fix the six 04 failures and the no-JS blank page (Phase 0)                                                                                                                                          | An a11y researcher's site must pass                                | High   |
| 4   | Adopt the tuned Almanac palette, Fraunces SOFT and Atkinson (§6)                                                                                                                                    | A distinctive, verified identity with one fewer font               | High   |
| 5   | Add three arch moments (portrait, hero band, footer door)                                                                                                                                           | Your taste, with the evidence used where it holds                  | Medium |
| 6   | Experience: reverse-chronological, ≤ 3 outcome bullets, consistent dates                                                                                                                            | Evidence over biography                                            | Medium |
| 7   | One positioning line everywhere; fix the logos, "WCAG 2.2" and Atlas naming                                                                                                                         | Credibility                                                        | Medium |
| 8   | Tagged résumé PDF with a Title                                                                                                                                                                      | It is an accessibility deliverable                                 | Medium |
| 9   | Meta: one description, a 1200×630 OG card, canonical, `theme-color`, sitemap/robots, `+error.svelte`                                                                                                | Hygiene                                                            | Low    |

**(b) Simplify**

| #   | Change                                                                                                       | Rationale                                                           | Impact |
| --- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | ------ |
| 1   | **Nav from 8 links to 5: Work, Experience, Research, About, Contact.** Skills and Education fold into About  | Low complexity [20]; puts proof first                               | Medium |
| 2   | **Section order:** Hero → Work → Experience → Research → About → Contact                                     | The best evidence moves from 4,300 px to the second screen          | High   |
| 3   | Simulator becomes a page linked from one Work card. Delete the modal, portal, scroll lock and rotate overlay | Saves 12 KB JS and 12 KB CSS on home and removes the focus failures | High   |
| 4   | Reveals on card groups only: 250 ms, 8 px, 30 ms × 8, armed below the fold                                   | Faster scanning; no blank page                                      | Medium |
| 5   | Six 11-stop ramps (66 colours) become about 16 semantic tokens and 8 swatches                                | One system, verified once                                           | Medium |
| 6   | One container width plus a 65 ch column                                                                      | One left edge                                                       | Low    |
| 7   | Skills as a grouped text list (no logo tiles)                                                                | No CDN dependency, no wrong logos                                   | Low    |
| 8   | Scrollspy on IntersectionObserver; theme logic in one place                                                  | Less JS, no flash                                                   | Low    |

**(c) Remove**

| #   | Remove                                                                                                                                                                                         | Rationale                                                | Impact |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------ |
| 1   | **Photo marquee and lightbox** (`Experience.svelte:14-142, 249-348`)                                                                                                                           | 2.4 MB, two failures (one Critical), an endless rAF loop | High   |
| 2   | **ConveyorBelt** (174 lines)                                                                                                                                                                   | Level-A failure; a teaser for a triple-surfaced feature  | High   |
| 3   | **Ambient layer** (`Ambient.svelte`, 202 lines) and the header `backdrop-blur`                                                                                                                 | Infinite drift (2.2.2), per-frame work                   | Medium |
| 4   | **Section 04 on the home page** (its copy moves to `/simulator`)                                                                                                                               | Delight at the edges                                     | Medium |
| 5   | Devicon CDN tiles                                                                                                                                                                              | Wrong marks, 12 third-party requests                     | Medium |
| 6   | `@tailwindcss/typography` and the `prose` class                                                                                                                                                | Unused; 12.6 KB raw CSS                                  | Low    |
| 7   | JetBrains Mono                                                                                                                                                                                 | 40 KB for 16 labels                                      | Low    |
| 8   | Dead files and code: `ryancritchlow_old.jpeg`, `scene-mixed-pronouns.webp`, root PDF and `CNAME`, `.nojekyll`, `--t-brand-strong`, `--text-lede`, dead content fields, the fake body attribute | 333 KB deployed; clutter                                 | Low    |
| 9   | Hover lift on non-interactive cards; joke SKU data                                                                                                                                             | False affordance; tone                                   | Low    |

## 5. Phased roadmap

**Phase 0: fix now** (small PRs, about 2 days). _Exit: `a11y/check.mjs` reports 0 failures and Lighthouse LCP is ≤ 2.5 s._

| PR  | Task                                                                                       | Files                                                                                                               |
| --- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| 0.1 | Skip-link and focus colours; strip `focus:outline-none focus:ring-*`                       | `SkipLink.svelte`, `app.css:258-260`, `Simulator.svelte:73`, `Experience.svelte:219,264,277`, `PickingPanel.svelte` |
| 0.2 | Remove the conveyor and marquee/lightbox; freeze the Ambient drift                         | `ConveyorBelt.svelte`, `Experience.svelte`, `Ambient.svelte`, `+layout.svelte`                                      |
| 0.3 | No-JS-safe reveals; no hero reveals                                                        | `app.css:279-329`, `actions/inview.ts`, `Hero.svelte`                                                               |
| 0.4 | `loading="lazy" decoding="async" width height` on all `<img>`                              | `About.svelte`, `Experience.svelte` (if photos remain)                                                              |
| 0.5 | Make the flow diagram wrap; fix the reset-timer bug, or unlink the simulator until Phase 1 | `Simulator.svelte:39`, `WarehouseGame.svelte:109-248`                                                               |
| 0.6 | Theme script resolves `system`; guarded storage; `color-scheme`; `scroll-padding-top`      | `app.html:11-19`, `theme.svelte.ts`, `app.css`                                                                      |
| 0.7 | CI on Node 22 with a PR gate                                                               | `.github/workflows/deploy.yml`, new `ci.yml`, `package.json` (`engines`), `.nvmrc`                                  |

**Phase 1: simplify and speed up** (about 1 week). _Exit: home page ≤ 400 KB, JS ≤ 60 KB gz, Lighthouse performance ≥ 95._

- **IA:** 5-link nav and the new section order (`content.ts:299-308`, `+page.svelte`). Merge Skills and Education into About (`About.svelte`; delete `Skills.svelte` and `Education.svelte`). Condense Experience (`content.ts`, `Experience.svelte`).
- **Hero rewrite** with fluid display type and both CTAs in the first mobile viewport (`Hero.svelte`, `content.ts`, `app.css`).
- **Simulator route:**
  - Create `src/routes/simulator/+page.svelte` and remove `Simulator.svelte` from home.
  - Delete `WarehouseModal.svelte`, `actions/portal.ts` and `stores/simulator.svelte.ts`.
  - Add a timer registry, a live region and label fixes (`WarehouseGame.svelte`, `PickingPanel.svelte`).
- **Case study:** create `src/routes/work/you-and-i/+page.svelte` from `lib/archive/` and link it from `Work.svelte`.
- **Weight:**
  - Remove the typography plugin (`app.css:10`, `SectionWrapper.svelte:18,24`) and JetBrains Mono (`app.css:8,120`).
  - Remove the devicons (`Skills.svelte`, `content.ts` tools).
  - Add `src/hooks.server.ts` for the font preload.
  - Serve the headshot as AVIF and WebP at 2×.
- **Code:** rewrite `inview` as an attachment with the new timing; IntersectionObserver scrollspy (`Nav.svelte`); writable `$derived` (`WarehouseScene.svelte:121`).
- **Hygiene:**
  - Meta and OG fixes (`app.html`, `+page.svelte`).
  - Add `static/robots.txt`, `static/sitemap.xml` and `src/routes/+error.svelte`.
  - Delete the dead assets.
  - Tag the résumé.

**Phase 2: new visual identity** (1–2 weeks). _Exit: 0 raw ramp classes, the palette-contrast CI step passes, and the 04 checks are rerun._

- **Tokens:** replace `app.css:14-237` with §6. Migrate the portfolio components (`Card`, `Badge`, `Nav`, `Footer`, `ContactLink`, `ArrowLink`, `ThemeToggle`, sections), then the simulator (`PickingPanel`, `StatusBadge`, `InventoryTable`, `OrderStatusBar`, `VictoryScreen`, and the hex values in `WarehouseScene`, which become CSS variables). Then delete the ramps.
- **Type:** `@fontsource-variable/fraunces/soft.css` and `@fontsource-variable/atkinson-hyperlegible-next`; heading `font-variation-settings: 'SOFT' 50`.
- **Shape:**
  - `rounded-arch` on the portrait and hero band (`Hero.svelte`, `About.svelte`) and on the footer door (`Footer.svelte`).
  - `rounded-card` (6 px) everywhere else.
  - A stitch-rule divider: a `border-block-start: 2px dashed var(--t-edge-strong)` utility.
  - A woven-label `Badge`.
- **Motion:** the `.press` utility replaces `ease-spring` on the CTAs; shadow pseudo-elements; reveal tokens.
- **Texture (optional):** add `static/grain.webp` behind `@media (prefers-contrast: no-preference)`.
- **CI:** commit `docs/design-review/a11y/almanac-tokens.json` and run `palette-contrast.mjs` in `ci.yml`.

**Phase 3: delight** (optional, about 1 week)

- **View transitions** via `onNavigate` in `+layout.svelte`: 250 ms, a crossfade under `reduce`, and `view-transition-name` on the header and logo.
- **A Display popover** (theme plus a Motion on/off toggle setting `data-motion`), using `[popover]` and `@starting-style` (`ThemeToggle.svelte`).
- **Easter eggs:**
  - Clicking the dog logo makes a pixel-sprite Georgia trot across the footer: ≤ 1 s, `image-rendering: pixelated`, announced politely.
  - The Konami code swaps the accent through the seasons (spring green, summer gold, fall pumpkin, winter sky), with each season added to the contrast JSON.
  - Re-token the console egg (`+layout.svelte:25`).
- **Simulator juice:** a ship confetti burst (≤ 1 s, no flashing [29]) and an opt-in truck honk (off by default).
- **One "Est." stamp** roundel, `aria-hidden`.

**Track U: SvelteKit 3 / Vite 8** (after Phase 1, about ½ day plus verification)

- **`package.json`:** `@sveltejs/kit` ^3, `adapter-static` ^4, `vite` ^8, `vite-plugin-svelte` ^7, `svelte` ≥ 5.56.4, `tailwindcss`/`@tailwindcss/vite` 4.3.x; Node ≥ 22.17 in CI.
- **`svelte.config.js`:** check the adapter options. No `src/` changes are expected.
- **Then** adopt `@sveltejs/enhanced-img` 1.0 for the case-study images.
- **TypeScript 7:** hold, and confirm that `svelte-check` and `typescript-eslint` support it first.

## 6. Proposed design tokens: "Almanac" (01b Palette B, tuned)

**Why B.**

- It continues the current parchment-gold-plum identity that 02 rates as a strength, and the Almanac mockup was built on it (since retired; it is in the branch history).
- It is the most Stardew of the three.
- Its warm–cool balance holds: plum is the only cool _text_ colour, and the sky focus ring is transient.

**Changes from 01b, each verified:**

| Token                          | Change                    | Why                                                                         | Trade-off                                                                                                                                                                                                                      |
| ------------------------------ | ------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `accent`                       | `#c36d19` → **`#b4621a`** | It failed 3:1 on the band (2.98) and footer (2.64)                          | Protanopia ΔE_OK vs `primary` drops from 10.2 to 6.4 (3× a just-noticeable difference). Acceptable because accent is decorative and never encodes state. No wood hue kept both properties; the best candidate drifted to olive |
| `edge-strong` (control border) | `#937b69` → **`#86705f`** | It failed 3:1 on the footer (2.77)                                          | —                                                                                                                                                                                                                              |
| New: `band`, `footer`          | Taken from the mockup     | The real site needs them                                                    | —                                                                                                                                                                                                                              |
| New: `ink-strong`              | Added                     | —                                                                           | —                                                                                                                                                                                                                              |
| New: `brand`                   | Text-safe wood, `#8a4513` | Company names at 16 px need 4.5:1, which the 3:1-only accent cannot provide | —                                                                                                                                                                                                                              |
| New: `selection`               | Added                     | —                                                                           | —                                                                                                                                                                                                                              |

```css
@import 'tailwindcss';
@import '@fontsource-variable/fraunces/soft.css'; /* wght + SOFT, latin 62 KB */
@import '@fontsource-variable/atkinson-hyperlegible-next'; /* latin 34 KB */

@custom-variant dark (&:where(.dark, .dark *));

@theme {
	/* Almanac swatches: decoration and illustration only. Text uses --t-* roles. */
	--color-parchment: #f9edd5; /* oklch(94.9% 0.034 85) */
	--color-walnut: #381f11; /* oklch(26.9% 0.046 49) */
	--color-fern: #26652b; /* oklch(45.1% 0.111 145) */
	--color-wood: #b4621a; /* oklch(58.0% 0.132 56) */
	--color-plum: #673682; /* oklch(43.0% 0.129 312) */
	--color-sky: #1174b4; /* oklch(54.0% 0.130 245) */
	--color-harvest: #f8c562; /* oklch(85.0% 0.130 82) */
	--color-night: #1d142b; /* oklch(21.5% 0.045 301) */

	--font-sans: 'Atkinson Hyperlegible Next Variable', system-ui, sans-serif;
	--font-display: 'Fraunces Variable', Georgia, serif;
	--font-mono: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;

	--text-display: clamp(2.75rem, 1.9rem + 3.6vw, 4.25rem); /* 44 → 68 px */
	--text-display--line-height: 1.04;
	--text-title: clamp(1.75rem, 1.4rem + 1.4vw, 2.25rem);
	--text-title--line-height: 1.15;
	--text-body: 1.125rem;
	--text-body--line-height: 1.6;

	--radius-card: 0.375rem; /* rounded-card */
	--radius-arch: 999px 999px 0 0; /* rounded-arch: 1–3 per page */

	/* Motion: 01a "Recommended motion tokens". Springs: transform/translate/scale only. */
	--ease-enter: cubic-bezier(0.05, 0.7, 0.1, 1);
	--ease-exit: cubic-bezier(0.3, 0, 0.8, 0.15);
	--ease-move: cubic-bezier(0.2, 0, 0, 1);
	--ease-spring-gentle: linear(
		0,
		0.006 1.5%,
		0.024 3%,
		0.056 4.8%,
		0.104 6.8%,
		0.198 10%,
		0.534 20.5%,
		0.632 24%,
		0.711 27.3%,
		0.78 30.5%,
		0.837 33.8%,
		0.883 37%,
		0.923 40.5%,
		0.957 44.5%,
		0.982 48.8%,
		1.01 58.8%,
		1.015 70.8%,
		1
	);
	--ease-spring-snappy: linear(
		0,
		0.008 1.2%,
		0.03 2.5%,
		0.072 4%,
		0.127 5.5%,
		0.252 8.2%,
		0.641 16%,
		0.751 18.5%,
		0.845 21%,
		0.916 23.2%,
		0.98 25.8%,
		1.027 28.2%,
		1.063 31%,
		1.089 34.8%,
		1.094 38.8%,
		1.081 43.8%,
		1.019 57.8%,
		0.998 66%,
		0.991 76.5%,
		1
	);
	--ease-spring-playful: linear(
		0,
		0.009 1%,
		0.035 2%,
		0.087 3.2%,
		0.157 4.5%,
		0.313 6.8%,
		0.755 12.5%,
		0.888 14.5%,
		0.986 16.2%,
		1.066 18%,
		1.127 19.8%,
		1.17 21.5%,
		1.195 23.2%,
		1.205 25.8%,
		1.19 28.5%,
		1.156 31.2%,
		1.014 40.8%,
		0.979 44.5%,
		0.961 48.2%,
		0.961 53.8%,
		0.997 66%,
		1.007 72.8%,
		1
	);
}

@theme inline {
	--color-surface: var(--t-surface);
	--color-surface-raised: var(--t-surface-raised);
	--color-band: var(--t-band);
	--color-footer: var(--t-footer);
	--color-edge: var(--t-edge);
	--color-edge-strong: var(--t-edge-strong);
	--color-ink: var(--t-ink);
	--color-ink-strong: var(--t-ink-strong);
	--color-ink-muted: var(--t-ink-muted);
	--color-brand: var(--t-brand);
	--color-primary: var(--t-primary);
	--color-on-primary: var(--t-on-primary);
	--color-accent: var(--t-accent);
	--color-link: var(--t-link);
	--color-focus: var(--t-focus);
}

:root {
	color-scheme: light;
	--t-surface: #f9edd5; /* page ground */
	--t-surface-raised: #fff9ea; /* cards */
	--t-band: #f3e2c0; /* oklch(91.8% 0.048 85) */
	--t-footer: #ead5ab; /* oklch(88.0% 0.060 84) */
	--t-edge: #e2cda4; /* decorative hairline only, 1.34:1; never a control's sole boundary */
	--t-edge-strong: #86705f; /* control boundaries: ≥ 3.25:1 on every ground */
	--t-ink: #381f11;
	--t-ink-strong: #2b170c; /* oklch(22.9% 0.038 49) */
	--t-ink-muted: #664c3b;
	--t-brand: #8a4513; /* text-safe wood, oklch(46.9% 0.111 51): ≥ 4.97:1 */
	--t-primary: #26652b;
	--t-on-primary: #fff9ea;
	--t-accent: #b4621a; /* 3:1 ONLY: frames, rules, icons, text ≥ 24px */
	--t-link: #673682; /* always underline inline links (1.77:1 vs ink) */
	--t-focus: #1174b4;
	--t-selection: #f8c562;
	--t-shadow: oklch(26.9% 0.046 49 / 0.14); /* walnut-tinted */
}

:root.dark {
	color-scheme: dark;
	--t-surface: #1d142b;
	--t-surface-raised: #291f3a;
	--t-band: #241a35; /* oklch(24.4% 0.051 300) */
	--t-footer: #150e20; /* oklch(18.3% 0.037 301) */
	--t-edge: #3b2f52; /* decorative only */
	--t-edge-strong: #7b728c;
	--t-ink: #f3e8d3; /* body copy stays in ink in dark mode (APCA Lc 91–93) */
	--t-ink-strong: #fff6e6;
	--t-ink-muted: #c4b9a5; /* secondary text ≥ 16px */
	--t-brand: #f8c562;
	--t-primary: #69b27a; /* Lc ~50: headings, UI, text ≥ 18px */
	--t-on-primary: #1d142b;
	--t-accent: #f8c562;
	--t-link: #d1b7f1;
	--t-focus: #77d2f5;
	--t-selection: #4a3a6b;
	--t-shadow: oklch(10% 0.03 300 / 0.5);
}

@media (prefers-contrast: more) {
	:root,
	:root.dark {
		--t-ink-muted: var(--t-ink);
		--t-edge: var(--t-edge-strong);
	}
}

/* Motion scalars (Tailwind has no duration namespace: use `duration-(--dur-2)`). */
:root {
	--dur-1: 100ms; /* press, toggles */
	--dur-2: 150ms; /* hover colour, reduced-motion crossfade */
	--dur-3: 200ms; /* exits, popovers */
	--dur-4: 250ms; /* entrances, reveals, view transitions */
	--dur-5: 300ms; /* ceiling for UI chrome */
	--dur-6: 400ms; /* rare: game moments */
	--dur-spring-gentle: 400ms;
	--dur-spring-snappy: 366ms;
	--dur-spring-playful: 618ms;
	--dur-reveal: var(--dur-4);
	--stagger: 30ms; /* × at most 8 items */
	--reveal-distance: 8px;
}
@media (prefers-reduced-motion: reduce) {
	:root:not([data-motion='full']) {
		--ease-spring-gentle: var(--ease-enter);
		--ease-spring-snappy: var(--ease-enter);
		--ease-spring-playful: var(--ease-enter);
		--dur-spring-gentle: var(--dur-2);
		--dur-spring-snappy: var(--dur-2);
		--dur-spring-playful: var(--dur-2);
		--dur-reveal: var(--dur-2);
		--reveal-distance: 0px;
	}
}
:root[data-motion='reduce'] {
	--ease-spring-gentle: var(--ease-enter);
	--ease-spring-snappy: var(--ease-enter);
	--ease-spring-playful: var(--ease-enter);
	--dur-spring-gentle: var(--dur-2);
	--dur-spring-snappy: var(--dur-2);
	--dur-spring-playful: var(--dur-2);
	--dur-reveal: var(--dur-2);
	--reveal-distance: 0px;
}

@layer base {
	html {
		scroll-padding-top: 5rem;
		scroll-behavior: smooth;
	}
	@media (prefers-reduced-motion: reduce) {
		html {
			scroll-behavior: auto;
		}
	}
	body {
		background: var(--t-surface);
		color: var(--t-ink);
		font-family: var(--font-sans);
		font-size: var(--text-body);
		line-height: 1.6;
	}
	h1,
	h2,
	h3 {
		font-family: var(--font-display);
		font-variation-settings: 'SOFT' 50;
		text-wrap: balance;
	}
	:focus-visible {
		outline: 3px solid var(--t-focus);
		outline-offset: 2px;
	}
	::selection {
		background: var(--t-selection);
		color: var(--t-ink);
	}
}

/* Tactile press: spring on space, plain ease on colour (01a §3 [35]). */
@utility press {
	transition:
		translate var(--dur-spring-snappy) var(--ease-spring-snappy),
		scale var(--dur-1) var(--ease-exit),
		background-color var(--dur-2) ease-out,
		color var(--dur-2) ease-out;
	&:active {
		scale: 0.97;
	}
	@media (hover: hover) and (prefers-reduced-motion: no-preference) {
		&:hover {
			translate: 0 -2px;
		}
	}
}

/* One-shot reveal: only children of groups the attachment armed (below the fold at hydration). */
.armed > * {
	transition:
		opacity var(--dur-reveal) var(--ease-enter),
		translate var(--dur-reveal) var(--ease-enter);
	transition-delay: calc(min(var(--i, 0), 7) * var(--stagger));
}
.armed:not(.in-view) > * {
	opacity: 0;
	translate: 0 var(--reveal-distance);
}
```

**Computed contrast** (`a11y/palette-contrast.mjs`). Each cell is the WCAG 2.2 ratio, with APCA Lc in brackets for information only. Text rows need 4.5:1; the UI rows (accent, focus, edge-strong) need 3:1. **All 76 pairs pass.**

| fg ↓ / ground →       | L surface  | L raised    | L band     | L footer   | D surface   | D raised    | D band      | D footer    |
| --------------------- | ---------- | ----------- | ---------- | ---------- | ----------- | ----------- | ----------- | ----------- |
| ink                   | 13.19 (92) | 14.57 (99)  | 11.99 (86) | 10.64 (79) | 14.57 (92)  | 12.80 (91)  | 13.57 (92)  | 15.50 (93)  |
| ink-strong            | 14.71 (94) | 16.24 (100) | 13.37 (88) | 11.87 (81) | 16.49 (101) | 14.49 (100) | 15.36 (100) | 17.55 (102) |
| ink-muted             | 6.80 (77)  | 7.51 (84)   | 6.18 (71)  | 5.49 (64)  | 9.12 (64)   | 8.01 (62)   | 8.50 (63)   | 9.71 (65)   |
| brand                 | 6.15 (74)  | 6.80 (81)   | 5.59 (68)  | 4.97 (61)  | 11.08 (75)  | 9.73 (73)   | 10.32 (74)  | 11.79 (76)  |
| primary (as text)     | 6.08 (74)  | 6.71 (81)   | 5.52 (68)  | 4.90 (61)  | 6.95 (51)   | 6.10 (49)   | 6.47 (50)   | 7.40 (52)   |
| link                  | 7.46 (79)  | 8.24 (86)   | 6.78 (73)  | 6.02 (66)  | 9.90 (68)   | 8.70 (67)   | 9.23 (68)   | 10.54 (69)  |
| accent (UI, 3:1)      | 3.85 (60)  | 4.25 (67)   | 3.50 (54)  | 3.11 (47)  | 11.08 (75)  | 9.73 (73)   | 10.32 (74)  | 11.79 (76)  |
| focus (UI, 3:1)       | 4.33 (64)  | 4.78 (71)   | 3.93 (58)  | 3.49 (51)  | 10.38 (71)  | 9.12 (70)   | 9.67 (70)   | 11.05 (72)  |
| edge-strong (UI, 3:1) | 4.03 (62)  | 4.45 (69)   | 3.66 (56)  | 3.25 (49)  | 3.90 (29)   | 3.42 (27)   | 3.63 (28)   | 4.15 (30)   |

Two more pairs:

| Pair                                     | Light     | Dark      |
| ---------------------------------------- | --------- | --------- |
| `on-primary` on `primary` (button label) | 6.71 (85) | 6.95 (53) |
| `ink` on `selection`                     | 9.59 (73) | 8.20 (83) |

**Notes**

- **Dark-mode `primary`** sits at Lc 49–53. Use it for headings, UI and text ≥ 18px, and keep body copy in ink (01b).
- **Colour-blind separation of `primary` vs `accent`** (ΔE_OK × 100: normal / deuteranopia / protanopia / tritanopia):
  - light: 21.4 / 15.0 / 6.4 / 25.8
  - dark: 20.2 / 17.8 / 11.4 / 21.9
- **Phase 0 stopgap** before the reskin, using the current ramps:
  - focus: `accent-700` light (4.02–5.86:1) and `accent-300` dark (5.04–10.39:1)
  - skip link: `bg-accent-800 text-white` (7.66:1).
