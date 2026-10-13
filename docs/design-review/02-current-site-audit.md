# 02 — Current site audit (ryancritchlow.com)

Audited commit `bf1f6c7` on 2026-10-13. Sources: every file in `src/`, plus the config, CI and `static/` files. Evidence: the production build (`./build`) served at `localhost:4173` and measured with Playwright (1440×900 and 390×844; unthrottled and 6× CPU throttled; normal and reduced motion; JS off), scratch rebuilds with the simulator removed and with the typography plugin removed, `svelte-check`/ESLint/Prettier, and `npm outdated`. Axe and Lighthouse were not run; items marked _verify_ are left for that step.

## 0. Snapshot

| Metric           | Value                                                                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Source           | 6,352 lines. About 3,500 of them (55%) are the WMS simulator: `warehouse/*` 2,449, `warehouse.ts` 768, ConveyorBelt 174, section and store 118 |
| Page length      | 10,840 px desktop, 17,530 px mobile. Experience is 3,487 px (32% of desktop)                                                                   |
| DOM and copy     | 667 nodes, ≈1,770 words, 34 `<img>` (33 without `width`/`height`)                                                                              |
| `index.html`     | 82.7 KB raw / 13.9 KB gz. **52% of it (43 KB) is `class` attributes**                                                                          |
| JS               | 188 KB raw / 69 KB gz in 13 files, all modulepreloaded                                                                                         |
| CSS              | 85.8 KB raw / 17.4 KB gz in 2 render-blocking files                                                                                            |
| Fonts            | 15 woff2 files emitted (384 KB); only 3 latin files downloaded (125 KB)                                                                        |
| Initial transfer | ≈2.75 MB, of which **2.47 MB (90%) is 10 bartending JPEGs**                                                                                    |
| Timing (local)   | FCP = LCP = 284 ms (LCP is the hero summary `<p>`), CLS 0.0008                                                                                 |
| Idle work        | 47 rAF calls per second forever; 4 infinite animations at the top, 17 after scrolling                                                          |
| Toolchain        | svelte-check 0/0, ESLint clean, Prettier clean                                                                                                 |

---

## 1. Information architecture & content

It is one prerendered route (`+page.svelte:68-75`) with an 8-link hash nav (`content.ts:299-308`) and a theme toggle.

| #   | id / nav           | Contents                                                                                                                                                    | Height |
| --- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| —   | `hero`             | h1 name; tagline "Product · Research · Enterprise Systems"; a 75-word summary; availability; CTAs **Get in Touch** (→`#contact`) and **Resume** (PDF)       | 792    |
| 01  | `about`            | 288 px headshot and 4 paragraphs (career path, KIND Lab story, hobbies)                                                                                     | 928    |
| 02  | `experience`       | 7 role cards with 24 bullets. Körber has 10 bullets, a simulator button and a conveyor belt. Redlight has an auto-scrolling 10-photo marquee and a lightbox | 3,487  |
| 03  | `work`             | Featured ASSETS 2026 paper, then 4 project cards: You and I (**no link**), WMS Simulator, KIND Lab site, Atlas Northwest                                    | 1,316  |
| 04  | `simulator`        | 2 paragraphs, a Wave→Ship flow with a Short→Replenish branch, and "Run the simulator" (opens a modal)                                                       | 832    |
| 05  | `research`         | 1 peer-reviewed and 2 in-prep papers, each with "My contribution"; ORCID and ACM chips                                                                      | 1,500  |
| 06  | `skills`           | 16 skill pills and 12 tool tiles with CDN logos                                                                                                             | 847    |
| 07  | `education`        | M.S. CS (2026) and B.A. MIS (2020)                                                                                                                          | 745    |
| —   | `contact` (footer) | Email, phone, LinkedIn, GitHub, résumé (icon-only on mobile)                                                                                                | 393    |

**The first 5 seconds.** At 1440×900 a visitor sees the logo, 8 nav items, the name at 68 px, a tagline made of three nouns, a dense paragraph and two CTAs. There is no photo, no role title and no proof point. The best credential, the ASSETS paper, starts at about 4,300 px. At 390×844 the name wraps to two lines and **both CTAs fall below the fold** (top at 872 px).

**Positioning is muddled.** The tagline, the JSON-LD `jobTitle` ("Product, Solutions, and Business Analysis", `+page.svelte:21`), the availability line ("product, solutions, analytics, and accessibility", `content.ts:16`) and the current role (Carpenter) all say different things. "Three years… four enterprise accounts" is repeated four times.

**Content defects:**

- Power BI shows the **Azure** logo and Tableau the **Firebase** logo (`content.ts:180-181`). All 12 tool logos are hot-linked from jsDelivr (`Skills.svelte:7`) and render as broken images when it is blocked, as in the existing screenshots.
- Experience is not in chronological order: the TA role (2024–25) comes after Körber (2020–23). Date formats are mixed (`content.ts:35-107`).
- "WCAG 2.1" is listed as a skill (`:169`); 2.2 is current.
- "Atlas Woodworks" vs "Atlas Northwest" (`:33` vs `:220`).
- "Get in Touch" vs "Get In Touch".
- "ASSETS 2026" is hard-coded in `Work.svelte:27`.
- The simulator's joke data ("Photo of Your Ex", `warehouse.ts:138`) is a tone risk on a hiring page.

**Hidden and dead content:**

- The only long-form case study, `src/lib/archive/YouAndICaseStudy.svelte` (254 lines), was un-routed in `37e9a57`. Its WebP images still deploy (329 KB), and `scene-mixed-pronouns.webp` was never referenced at all.
- `ryancritchlow_old.jpeg` (232 KB) is deployed and unused.
- The root `Ryans_Resume.pdf` (Jan 2026) is stale and not deployed. The live `static/Ryans_Resume_2026.pdf` is **untagged and has an empty Title**.

---

## 2. Visual design system

**Palette "Valley"** (`app.css:14-115`): six 11-stop ramps regenerated in OKLCH against Tailwind's lightness curve.

| Ramp    | Seed / 500                                | Used for                                    |
| ------- | ----------------------------------------- | ------------------------------------------- |
| primary | Korma brown `#cb7e31`                     | Only `--t-ink-strong` (2 stops are emitted) |
| accent  | Mandalay gold `#ba8a00`                   | Brand, CTAs, focus, badges                  |
| moss    | Dark Fern `#5da853`                       | Skill pills, simulator buttons, lamp        |
| warm    | parchment `#a39074`                       | Grounds, inks, edges                        |
| ember   | Totem Pole `#ee5e3a` (renamed from `red`) | Bullets, exceptions                         |
| plum    | Loulou `#aa83af` (reduced chroma)         | Links, tags, footer                         |

**Semantic tokens** (`app.css:159-237`, `--t-*` via `@theme inline`), each with its contrast rationale recorded in comments:

| Token                       | Light                              | Dark                                                       |
| --------------------------- | ---------------------------------- | ---------------------------------------------------------- |
| surface / raised            | warm-50 / #fff                     | warm-950 / warm-800                                        |
| band / footer               | `#eee0b8` / `#e3d5b0`              | warm-900 / `#43284a`                                       |
| edge / edge-hover           | warm-300 / accent-500              | warm-600 / accent-400                                      |
| ink / muted / strong        | warm-900 / 800 / primary-900       | warm-200 / 300 / primary-200                               |
| brand / brand-strong / link | accent-800 / accent-800 / plum-800 | accent-300 / accent-700 / plum-300 (`brand-strong` unused) |

Grounds are translucent so the ambient layer shows through (`bg-surface/68`, `bg-band/80`, `bg-footer/90`). No `color-scheme` is declared, so scrollbars and form controls stay light in dark mode.

**Where components bypass the tokens:**

| Area                                                                                                             | Raw ramp classes | `dark:` variants | Off-system colour                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Portfolio components                                                                                             | 83               | 37               | `#135c73` teal in the console easter egg (`+layout.svelte:25`)                                                                           |
| Warehouse (PickingPanel 149, StatusBadge 58, Game 24, InventoryTable 22, Modal 16, OrderStatusBar 15, Victory 8) | **292**          | 138              | 14 stock `blue-*` classes (`PickingPanel.svelte:159,194,323`; `StatusBadge.svelte:9,15`); **84 hex literals** in `WarehouseScene.svelte` |

The portfolio is essentially on tokens; Badge's tone map (`Badge.svelte:20-25`) bypasses them on purpose. The simulator is an unthemed second design system.

**Typography.** Fraunces is used for display and headings (wght axis only), Inter for body text, and JetBrains Mono for 16 small uppercase labels and the simulator (`app.css:118-120`). The custom steps are `display` 4.25rem, `numeral` 3.5rem, `title` 2.25rem, `body` 1.0625rem/1.68, and `lede` (**unused**). None is fluid: the h1 is 68 px at every width. `text-wrap: balance` is set on h1–h3.

**Space, shape, depth:**

- **Three container widths give three different left edges:** hero `max-w-4xl` (x=272), sections `5xl` (x=228), Skills `6xl` (x=164) (`Hero.svelte:13`, `SectionWrapper.svelte:23-27`).
- Section padding is `py-20/28` and the gutter is 20 px.
- Radii are only 8/12/16 px plus `rounded-full`. **There are no arches, curves or organic shapes.**
- Shadows are stock and untinted: `shadow-sm` resting on cards, `lg` on hover, `2xl` on modals.
- The 1 px edge measures only 1.15:1 against the band, so the resting shadow does the separating.
- There is no grain or texture. Depth comes from radial washes in the hero and footer (mirrored) and the **Ambient** layer (`Ambient.svelte`): four 78vmax radial-gradient lamps that drift and also move with scroll position.

**Icons and imagery:**

- Icons are inline SVGs pasted across 8 files in mixed styles: Feather-style 24 px strokes, filled brand marks, a 20 px Heroicons clipboard, the CDN devicons, an ORCID SVG and a typographic "ACM" chip. There is no icon component.
- The logo is `logo-dog.png` (297×192) used as a CSS mask over `currentColor`, with a forced-colors fallback (`Nav.svelte:82,192-207`).
- `favicon.svg` is 27.5 KB because it wraps a **base64 PNG**. There is no apple-touch-icon or manifest.
- The headshot is 325 px but displays at 288 CSS px, so it is soft on 2× screens. It is also the og:image.
- The bartending photos are 724×1086 (one is 1440×1800 at 509 KB) shown 192–224 px tall: about 5× oversampled, JPEG only, no `srcset`, no lazy loading.

---

## 3. Motion inventory

| Effect (file)                                                                                     | Trigger                                                   | Timing                                             | Properties (compositor?)                                             | Reduced motion                                                  |
| ------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------- |
| `.reveal` ×21 (`app.css:279-316`)                                                                 | `use:inview`, one-shot                                    | 0.55 s ease-soft, `--i`×65 ms                      | opacity + translate/scale (yes; permanent `will-change`)             | Opacity only ✓                                                  |
| `.stagger > *` 9 containers / 49 children (`:318-329`)                                            | Observer on the container                                 | 0.45 s, up to 715 ms stagger                       | opacity + translateY (yes)                                           | Opacity only ✓                                                  |
| `.rule-draw` ×8 (`:348-364`)                                                                      | Parent `.in-view`                                         | 0.7 s, +0.15 s delay                               | scaleX (yes)                                                         | Static ✓                                                        |
| Ambient drift ×4 (`Ambient.svelte:113-187`)                                                       | Always, infinite                                          | 47/61/53/71 s                                      | translate3d + scale on 4 huge layers (yes)                           | Off ✓                                                           |
| Ambient scroll coupling (`Ambient.svelte:20-45`)                                                  | scroll (rAF)                                              | per frame                                          | `--p` custom property → transform (**no**: style recalc every frame) | Transform off; the JS still runs                                |
| Header `backdrop-blur-md` (`Nav.svelte:67`)                                                       | Always                                                    | —                                                  | Re-blurred every frame over the moving lamps                         | n/a                                                             |
| Nav underline (`Nav.svelte:170-190`)                                                              | rAF scrollspy (8 `getBoundingClientRect` calls per frame) | 0.22 s spring                                      | scaleX                                                               | Instant ✓                                                       |
| Card / tool / contact hover (`Card.svelte:29-32`, `Skills.svelte:32-38`, `ContactLink.svelte:18`) | hover                                                     | 200 ms spring                                      | translateY −2 px + **box-shadow** (repaint)                          | Lift off ✓                                                      |
| Button press (`Hero.svelte:38,44`, etc.)                                                          | active                                                    | 200 ms                                             | scale .97                                                            | ✓                                                               |
| ArrowLink glyph (`ArrowLink.svelte:33-35`)                                                        | hover                                                     | 200 ms                                             | translateX                                                           | ✓                                                               |
| **Photo marquee** (`Experience.svelte:14-94`)                                                     | JS rAF **every frame forever**, plus touch drag           | 1.2 px per frame, so speed depends on refresh rate | transform, with `$state` written 60×/s                               | **Ignored: still moves** (−54→−126 px in 1 s). No pause control |
| Marquee hover zoom (`:269,284`)                                                                   | hover                                                     | 150 ms                                             | scale 1.05                                                           | None                                                            |
| **ConveyorBelt** (`ConveyorBelt.svelte:114-151`)                                                  | IntersectionObserver at 30%, never stops                  | 6 s belt; 8 boxes bounce at 0.5–0.7 s              | translate (yes)                                                      | **Only slowed** (`:153-173`)                                    |
| Warehouse workers and cart (`WarehouseScene.svelte:648,767,844`)                                  | setTimeout choreography                                   | 0.4–0.7 s                                          | **`left`** (layout)                                                  | 0.01 s ✓ (`:1145-1160`)                                         |
| Truck, shelf glow, pack glow (`:1033`, `:701`, `:991`)                                            | game events                                               | 0.25–1 s                                           | transform / box-shadow                                               | Partial                                                         |
| `animate-pulse` (`PickingPanel.svelte:175,307`); victory bounce (`VictoryScreen.svelte:36`)       | state                                                     | 2 s / 0.6 s infinite                               | opacity / translateY                                                 | None / off ✓                                                    |
| Smooth scroll (`app.css:239-247`)                                                                 | anchors                                                   | —                                                  | —                                                                    | `auto` ✓                                                        |

There are no `svelte/transition`, `animate` or `motion` imports. The lightbox and the modal open instantly.

**How `inview` works** (`inview.ts`). It adds `.reveal`, `data-dir` and `--i`, and observes with `rootMargin: 0 0 -15% 0` and `threshold: 0`, so it fires when the element's top crosses 85% of the viewport. It then adds `.in-view` and unobserves. Each tall container reveals all of its children at once.

**Above the fold.** Nothing above the fold starts invisible. The hero is server-rendered without `.reveal`, and hydration adds `.reveal` and `.in-view` in the same frame: the h1 stayed at opacity 1 with no transform in every sampled frame at 1× and 6× CPU. So the hero "reveal" is a no-op that leaves `will-change` layers behind, and LCP is unaffected.

**The real risk is no JS.** `.stagger > *` is `opacity: 0` in the stylesheet itself. With JS off or a failed chunk, **all 49 stagger children, including every card and every footer contact link, stay invisible** (measured). Deep links such as `/#experience` also show blank cards until hydration.

---

## 4. Svelte 5 / SvelteKit practices

- **Runes throughout:** 40 `$state`, 25 `$derived`, typed `$props`, snippets, callback props. There is **no legacy syntax** (`on:`, `$:`, `export let`, slots, `svelte/store`). Shared state lives in rune modules (`stores/*.svelte.ts`).
- **The 8 `$effect`s:**
  - Legitimate side effects that could be cheaper: Ambient (could be CSS `animation-timeline: scroll()`), Nav (could be IntersectionObserver), and the modal scroll lock (native `<dialog>` would cover it).
  - Experience `:91` runs an endless rAF loop.
  - Experience `:98` and `:144` set up IntersectionObservers that would be better as actions or attachments.
  - WarehouseScene `:107` dispatches animations from a prop change inside `untrack`, an effect-as-event-handler.
  - **WarehouseScene `:121-123` writes state from an effect** (`cartDisplay = cartSkus`); it should be a writable `$derived` (available since 5.25).
- **Actions vs attachments:** `use:inview` (×21) and `use:portal` are classic actions. `{@attach}` (5.29+) is available in the installed 5.51.
- **Legacy idioms in the simulator:** 29 `x = [...x]` reassignments after mutating deep `$state` (redundant). `{#key actionKey}` (`WarehouseGame.svelte:362-371`) remounts the 1,202-line scene on every click while orphaned `setTimeout`s keep running. `marqueeOffset` and `currentSpeed` are needlessly reactive.
- **Props:** `WarehouseScene` types its props as required but also gives them defaults (`:21-35`). Classes are merged by string concatenation; `class={[…]}` (5.16+) would be cleaner.
- **Config:**
  - `prerender = true` with adapter-static `fallback: '404.html'`. There is no `+error.svelte`, so a 404 loads about 140 KB of JS to show default error text.
  - `data-sveltekit-prerender="true"` (`app.html:22`) is **not a SvelteKit attribute**.
  - No CSP; `kit.inlineStyleThreshold` is unset.
- **SEO:**
  - **Two `meta description` tags** (`app.html:6-9` and `+page.svelte:49`).
  - The og/twitter image is the 325 px square headshot under `summary_large_image`.
  - No canonical, `og:image:alt`, `theme-color`, robots.txt or sitemap.
  - The Person JSON-LD with ORCID `sameAs` is good.
- **Theme and FOUC:**
  - The inline script (`app.html:11-19`) only honours `saved === 'dark'` or _no_ saved value. **With `theme=system` saved and a dark OS, the page paints light and flips after hydration** (verified).
  - `localStorage` access is unguarded there and in `theme.svelte.ts:14,28`; blocked storage throws uncaught errors (verified).
  - The SSR icon is always "system".
- **Portal.** Needed only because `<main class="relative z-10">` creates a stacking context, and the lightbox does not use it (§7). `<dialog>.showModal()` would make the portal unnecessary.
- **Hydration.** No mismatch warnings. The © year is baked in at build time (`Footer.svelte:28`).

---

## 5. The WMS simulator

**What it is.** A game with 3 orders, 8 lines and 6 SKUs. The player releases a wave, picks into a 6-slot cart, and can report an empty location, which shorts the pick, sends a replenishment runner and re-creates the pick. Then they stage, pack (complete, or confirm shipping short), load and ship, ending on a victory screen.

- Model: `warehouse.ts` (mutable helper functions, module-level ID counters at `:219-220`).
- Orchestrator: `WarehouseGame.svelte`.
- Scene: `WarehouseScene.svelte`, about 960 lines of CSS drawing trucks, workers and racks out of divs.
- Panels: `PickingPanel` and others.

**Surfaced three times:** nav and section 04, the Work card, and the Körber card button with its conveyor. The modal is portalled to `<body>`, 90vw × 85vh on desktop and full-screen on phones, with a rotate-your-phone overlay in landscape.

**Weight.** It is imported statically (`Simulator.svelte:6-7`). Removing it in a scratch build saved **43.9 KB raw / 12.1 KB gz of JS** and **11.9 KB of render-blocking CSS**. On page load, 37% of `nodes/2.js` and 87% of `2.css` go unused.

**Keyboard and screen readers:**

- Controls are real buttons and the scene is `aria-hidden`.
- Focus is not moved into the dialog, not trapped and not returned. Tab visits the footer links first, and Escape only works once focus is inside (`WarehouseModal.svelte:11-44`).
- After "Wave Orders" **focus drops to `<body>`** (verified).
- There is no live region for phase changes or replenishment notices.
- Names that don't contain the visible label: "Report Empty" (`PickingPanel.svelte:285`), "Pack Order" (`:371`), "Pack Short" (`:429`), "Ship All Orders" (`:477`). _verify_
- White text on moss, ember, plum, blue and accent-500 measures **2.92–3.76:1**.

**Bug (verified).** `reset()` does not clear the pending timers (`WarehouseGame.svelte:159-198,225-248`). Resetting mid-replenishment corrupted the new game: BBP-01 inbound went from 5 to 0 and on-hand from 10 to 15.

**Verdict.** The concept, and the section 04 copy about the exception path, is the site's best product thinking. The execution costs too much for a portfolio:

- 55% of the source code.
- JS and CSS shipped to every visitor.
- A separate unthemed visual language.
- Focus and contrast failures that undercut an accessibility-focused candidate.
- A state bug.
- Triple placement.

At minimum it should be lazy-loaded, surfaced once and brought onto the tokens.

---

## 6. Performance

| Class       | Downloaded on load             | Notes                                                                                                                                                                                                                           |
| ----------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTML        | 13.3 KB gz                     | Class-string bloat: long utility lists repeated per Badge and Card, and on 20 marquee buttons                                                                                                                                   |
| JS          | 70.8 KB gz                     | All preloaded; about 12 KB is the simulator                                                                                                                                                                                     |
| CSS         | 17.3 KB gz                     | Two render-blocking files. **The typography plugin is unused** (`app.css:10`), but the word "prose" in `SectionWrapper.svelte:18,24` makes Tailwind emit about 77 `.prose` rules. Removing it saves **12.6 KB raw / 1.7 KB gz** |
| Fonts       | 125 KB                         | `unicode-range` works: the cyrillic, greek, vietnamese and latin-ext files are emitted but never fetched. There is **no preload** for Fraunces (the h1 face). **JetBrains Mono costs 40 KB** for a handful of 12 px labels      |
| Images      | 2.53 MB                        | Bartending 2.47 MB, all eager, no dimensions, no AVIF/WebP. Only the devicons are lazy                                                                                                                                          |
| Third-party | 12 requests to jsDelivr (lazy) | No analytics                                                                                                                                                                                                                    |

Steady-state cost: the endless marquee rAF loop, 4 ambient animations under a backdrop-filtered header, 9 more conveyor animations once seen, and 30 permanent `will-change` layers. This matters on low-end and battery-powered devices.

---

## 7. Accessibility

**In place:**

- A skip link to a focusable `<main>`.
- A global `:focus-visible` 3 px outline (`app.css:258-260`).
- Landmarks and 9 labelled regions.
- One h1 and a clean h2→h4 order.
- `aria-current` on the scrollspy and `aria-expanded`/`aria-controls` on the mobile menu.
- sr-only "(opens in a new tab)" and ORCID text.
- `aria-hidden` on decorative SVGs, alt text on photos.
- A forced-colors logo fix.
- Reduced-motion handling for most CSS motion.
- `lang="en"`.

**Risky (_verify_):**

- **The lightbox** (`Experience.svelte:296-335`) sits inside `<main>`'s stacking context, so **the nav covers its close button**: a hit-test at the button's centre returns `<header>`. It has no `aria-modal` and no focus handling, and Escape only works with focus inside.
- The simulator modal (§5).
- The marquee: no pause control, and it ignores reduced motion (2.2.2 / 2.3.3).
- **Contrast:**
  - The skip link is white on accent-500 at **3.12:1** (`SkipLink.svelte:3`).
  - **The focus outline is 2.97:1 on the surface and 2.38:1 on the band.**
  - Helper text `warm-500` is 3.09:1 and `warm-400` is 2.06:1 in the simulator.
- **12 controls use `focus:outline-none focus:ring-*`** (`Simulator.svelte:73`, `Experience.svelte:219,264,277`, 8 in PickingPanel). Tailwind 4 compiles `outline-none` to `outline-style: none`, and the box-shadow ring vanishes in forced-colors mode, so these controls have **no focus indicator in High Contrast**. They also use `:focus` rather than `:focus-visible`.
- ConveyorBelt is `role="img"` but labelled "Decorative…" (`ConveyorBelt.svelte:7-8`).
- No `scroll-padding-top` for the 61 px fixed header (focus could be obscured, 2.4.11).
- The mobile menu has no Escape handling or focus return.
- Cards that do nothing still lift on hover (`Education.svelte:14`, `Experience.svelte:171`, `Research.svelte:30`, `Work.svelte:47`).
- The résumé PDF is untagged.

---

## 8. Tooling & maintenance

- **Scripts:** `dev`, `build`, `preview`, `format`, `lint` (Prettier + ESLint), `check` (svelte-check). There are **no tests, no hooks and no Dependabot or Renovate**. TS is strict, the ESLint flat config is sensible, and all three checks pass.
- **CI** (`deploy.yml`): it only runs `npm ci` → build → deploy on push to `main`. There is **no lint, check or a11y gate and no PR workflow**. It uses **Node 20, end of life since April 2026** (`:22-25`), while the local machine runs Node 22. There is no `engines` field or `.nvmrc`.
- **Outdated dependencies:**

  | Package            | Installed | Latest                             |
  | ------------------ | --------- | ---------------------------------- |
  | svelte             | 5.51.0    | 5.57.2                             |
  | @sveltejs/kit      | 2.51.0    | 2.70.3 in range, **3.0.1** overall |
  | adapter-static     | 3.0.10    | **4.0.0**                          |
  | vite               | 6.4.1     | **8.3.4**                          |
  | vite-plugin-svelte | 5.1.1     | **7.3.1**                          |
  | tailwindcss        | 4.1.18    | 4.3.3                              |
  | typescript         | 5.9.3     | **7.0.2**                          |

  Linters are a patch or minor behind. Caret ranges like `^2.0.0` mean the lockfile is the real pin.

- **Duplicates:** the root `CNAME` (only `static/CNAME` is used), `static/.nojekyll` (unneeded with Actions), and the root résumé.
- **Dead code:**
  - `ordersAwaitingPack`.
  - The `replens` state (written 8 times, never read; `WarehouseGame.svelte:47`).
  - `about.heading` and `credentials.membership` (`content.ts:21,141`).
  - `Project.bullets` and `Experience.summary`.
  - `--t-brand-strong` and `--text-lede`.
  - `width="prose"`.
  - Card's `@container` (no container queries exist).
  - The fake body attribute.
  - The archived page, which is still type-checked and scanned by Tailwind.
- **A strength:** the comments record the _why_ behind decisions, including measured contrast values and past bugs.

---

## (a) Strengths worth keeping

1. **The semantic token layer**, with contrast reasoning recorded per token. The OKLCH ramps and the `ember` rename are good craft (`app.css:14-237`).
2. **Typed content-as-data.** The featured paper is derived from `publications`, so they cannot drift.
3. **Idiomatic, clean Svelte 5 + TS**: no legacy syntax, and lint and check are green.
4. **A fast static core**: prerendered, the hero is visible without JS, LCP = FCP, CLS ≈ 0, no trackers, self-hosted fonts with working subsetting.
5. **Thoughtful reduced-motion design for the CSS layer**: reveals become opacity-only, the ambient layer goes static, smooth scrolling turns off.
6. **Accessibility foundations**: skip link, landmarks, heading order, ARIA state, external-link text, the forced-colors logo fix.
7. **Specific, candid first-person copy** and the "My contribution" framing on papers.
8. **The simulator's concept and its section 04 narrative.**
9. **A distinctive identity**: parchment, gold and plum with Fraunces, not a template look.

## (b) Problems, ranked by severity

| Sev.     | Problem                                                                                              | Where                                                                         |
| -------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **High** | CSS hides stagger children until JS runs; with no JS, every card and every contact link is invisible | `app.css:318-329`                                                             |
| **High** | 2.47 MB of eager, ~5× oversized JPEGs (90% of page weight)                                           | `Experience.svelte:111-128,259-288`                                           |
| **High** | The marquee auto-moves with no pause, ignores reduced motion, and runs rAF forever                   | `Experience.svelte:33-94`                                                     |
| **High** | The lightbox close button is covered by the nav; no dialog semantics or focus handling               | `Experience.svelte:296-335`                                                   |
| **High** | The simulator modal has no focus move, trap or return; focus is lost after Wave; no live region      | `WarehouseModal.svelte:11-44`; `PickingPanel.svelte:113-131`                  |
| **High** | Skip link 3.12:1; focus outline 2.97:1 and 2.38:1                                                    | `SkipLink.svelte:3`; `app.css:258-260`                                        |
| Med-High | Resetting during a replenishment corrupts the new game (verified)                                    | `WarehouseGame.svelte:109-119,159-248`                                        |
| Medium   | Mobile CTAs are below the fold; the 68 px h1 isn't fluid                                             | `app.css:127`; `Hero.svelte:14-41`                                            |
| Medium   | Muddled positioning; the best proof is 4,300 px down; Experience takes 32% of the page               | `content.ts:12,16`; `+page.svelte:21`                                         |
| Medium   | 12 controls have no focus indicator in forced-colors mode                                            | `Simulator.svelte:73`; `Experience.svelte:219,264,277`; `PickingPanel.svelte` |
| Medium   | Simulator contrast fails, stock blue, label-in-name mismatches                                       | `PickingPanel.svelte:121-477`; `StatusBadge.svelte:9,15`                      |
| Medium   | The simulator's JS and CSS are on the critical path (static import)                                  | `Simulator.svelte:6-7,97-99`                                                  |
| Medium   | ConveyorBelt still animates under reduced motion; decorative content has `role=img`                  | `ConveyorBelt.svelte:5-8,153-173`                                             |
| Medium   | Theme FOUC with a saved "system" theme; unguarded `localStorage`                                     | `app.html:11-19`; `theme.svelte.ts:14,28`                                     |
| Medium   | Wrong Power BI and Tableau logos; hot-linked CDN icons break when blocked                            | `content.ts:180-181`; `Skills.svelte:7`                                       |
| Medium   | CI only builds, on end-of-life Node 20                                                               | `deploy.yml:22-31`                                                            |
| Low-Med  | Duplicate meta descriptions; square og:image; no canonical or sitemap                                | `app.html:6-9`; `+page.svelte:49-58`                                          |
| Low-Med  | Non-interactive cards lift on hover; the "You and I" card goes nowhere                               | `Card.svelte:29-32`; `Work.svelte:47`                                         |
| Low-Med  | Header backdrop blur over continuously moving full-viewport layers                                   | `Nav.svelte:67`; `Ambient.svelte:113-131`                                     |
| Low      | Soft headshot on 2× screens; 27.5 KB base64 favicon                                                  | `About.svelte:10-14`; `static/favicon.svg`                                    |
| Low      | Three container widths / left edges                                                                  | `Hero.svelte:13`; `SectionWrapper.svelte:23-27`                               |
| Low      | Experience order, mixed date formats, name mismatch, "WCAG 2.1"                                      | `content.ts:33-107,169,220`                                                   |
| Low      | An effect writes state; `{#key}` remounts; redundant reassignments                                   | `WarehouseScene.svelte:121-123`; `WarehouseGame.svelte:362-371`               |
| Low      | Unused typography plugin; no `color-scheme` or `scroll-padding-top`; build-time year; fake attribute | `app.css:10,239`; `Footer.svelte:28`; `app.html:22`                           |
| Low      | Untagged, untitled résumé; stale root duplicate                                                      | `static/Ryans_Resume_2026.pdf`; `/Ryans_Resume.pdf`                           |

## (c) Candidates to simplify or remove

| Candidate                                                                                            | Rationale                                                                         | Est. saving                                                                                         |
| ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Bartending marquee + lightbox** → 2–3 static AVIF thumbnails, or cut                               | Heaviest and least relevant content; causes the motion, stacking and CPU problems | About 185 lines (`Experience.svelte:14-142,249-348`); **2.4 MB** of initial load; the idle rAF loop |
| **Simulator: lazy-load** (`import()` on click or a `/simulator` route); surface once                 | Keeps the idea; casual visitors pay nothing                                       | 12.1 KB gz JS + 11.9 KB blocking CSS off the critical path; about 30 lines of duplicate CTAs        |
| **Simulator: refactor if kept** (tokens, `<dialog>`, cancellable timers, transform-based motion)     | 292 raw classes, 84 hex literals, focus and state bugs                            | Plausibly 40% of its 3,217 lines                                                                    |
| **ConveyorBelt**                                                                                     | A teaser for an already triple-surfaced feature; violates reduced motion          | 174 lines; 9 infinite animations                                                                    |
| **Ambient scroll JS** → static lamps or `animation-timeline: scroll()`; reconsider the header blur   | Per-frame style recalc and re-blur                                                | About 25 JS lines; 1 scroll listener                                                                |
| **Reveal system** → CSS `animation-timeline: view()` behind `@supports`, with no CSS-only hiding     | Fixes the no-JS blank page; drops 21 actions and permanent layers                 | `inview.ts` 66 lines + about 85 CSS lines                                                           |
| `@tailwindcss/typography`                                                                            | Unused                                                                            | 12.6 KB raw CSS; 1 dependency                                                                       |
| JetBrains Mono → system mono stack                                                                   | 40 KB for labels                                                                  | 40 KB per visit                                                                                     |
| Non-latin font subsets                                                                               | Emitted, never fetched                                                            | 259 KB of deploy size only                                                                          |
| Devicon CDN → self-hosted SVGs or a text list (and fix the logos)                                    | Third-party fragility; wrong marks                                                | 12 cross-origin requests                                                                            |
| Dead assets (`ryancritchlow_old.jpeg`, `scene-mixed-pronouns.webp`, root PDF and CNAME, `.nojekyll`) | Unreferenced                                                                      | 333 KB deployed + 129 KB in the repo                                                                |
| **The archived case study: restore or delete**                                                       | It is the strongest research/UX artifact and currently only costs maintenance     | 254 lines if deleted                                                                                |
| Dead code (see §8), plus `portal.ts` once `<dialog>` is used                                         | Unused                                                                            | About 60 lines                                                                                      |
| `Icon` component / sprite; component classes for Badge and Card                                      | 52% of `index.html` is class strings; icons are pasted into 8 files               | About 20–30 KB raw HTML                                                                             |

**Net effect of the top five rows:** first-load transfer falls from about 2.75 MB to about 0.3 MB, critical-path JS drops by about a sixth, idle CPU work goes to zero, and the source shrinks by somewhere between about 400 lines (lazy-loading the simulator) and about 3,500 lines (cutting it).
