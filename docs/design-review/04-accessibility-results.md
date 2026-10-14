# 04 · Accessibility results

Checked on 2026-10-13 with [`a11y/check.mjs`](a11y/check.mjs) (axe-core 4.14 via `@axe-core/playwright` 4.13, Playwright 1.56 / Chromium, Lighthouse 13.5). Each URL is checked in light and dark mode, at 1440 px and 390 px wide.

| Check                | What it covers                                                                                                                                                      | Standard      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| axe-core             | All WCAG 2.0 / 2.1 / 2.2 A and AA rules, plus axe best practices                                                                                                    | WCAG 2.2 AA   |
| Gradient contrast    | Pixel-samples text that sits on gradients or overlapping layers, which axe reports as "incomplete"                                                                  | 1.4.3         |
| First-focus contrast | Re-runs contrast with the skip link on screen, since axe skips hidden elements                                                                                      | 1.4.3         |
| Keyboard walk        | Every Tab stop must show a focus indicator and must not be hidden behind sticky content                                                                             | 2.4.7, 2.4.11 |
| Forced colors        | Repeats the keyboard walk with Windows High Contrast on, which strips `box-shadow` rings                                                                            | 2.4.7         |
| Reflow               | No horizontal scrolling at 320 CSS px                                                                                                                               | 1.4.10        |
| Text spacing         | No clipped text with the 1.4.12 spacing overrides applied                                                                                                           | 1.4.12        |
| Reduced motion       | With `prefers-reduced-motion: reduce`, no transform animation may start, and no transform may change while the page is idle (catches `requestAnimationFrame` loops) | 2.3.3, 2.2.2  |
| Lighthouse           | Accessibility, performance, best-practices and SEO scores (simulated mid-tier mobile)                                                                               | —             |

## Current site before Phase 0 (`main` @ `bf1f6c7`)

Lighthouse: **accessibility 100 · performance 72 · best practices 100 · SEO 92**. LCP 8.9 s, CLS 0.001, TBT 40 ms.

A perfect Lighthouse accessibility score does not mean the site passes. The deeper checks found six real failures:

| #   | Failure                                                                                                                                              | WCAG             | Where                                                                             | Evidence                                        |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------- | ----------------------------------------------- |
| 1   | Skip link is white on `accent-500` at **3.12:1**                                                                                                     | 1.4.3 (AA)       | `SkipLink.svelte:3`                                                               | First-focus contrast, both themes               |
| 2   | 12 controls have **no focus indicator in forced colors**: they use `focus:outline-none focus:ring-*`, and the ring is a `box-shadow`                 | 2.4.7 (AA)       | `Simulator.svelte:73`, `Experience.svelte:219,264,277` (10 marquee photo buttons) | Forced-colors keyboard walk                     |
| 3   | Photo marquee keeps moving under reduced motion and has no pause control                                                                             | 2.2.2 (A), 2.3.3 | `Experience.svelte:33-94`                                                         | Transform sampling while idle                   |
| 4   | Conveyor belt keeps looping under reduced motion (only slower) and has no pause control                                                              | 2.2.2 (A), 2.3.3 | `ConveyorBelt.svelte:153-173`                                                     | 5 animations start under `reduce`               |
| 5   | The workflow diagram's scroll box on phones can't be reached by keyboard in Safari or Firefox (Chromium makes scrollers focusable, the others don't) | 2.1.1 (A)        | `Simulator.svelte:39`                                                             | axe `scrollable-region-focusable`, 390 px       |
| 6   | The focus outline (`accent-500`) measures **2.97:1** on the page and **2.38:1** on the gold band                                                     | 1.4.11 (AA)      | `app.css:258-260`                                                                 | Token pairs checked with `palette-contrast.mjs` |

What passed:

- All text on the hero and footer gradients passes. The lowest pixel-sampled ratio was 5.04:1 in light mode and 5.41:1 in dark mode.
- 35 Tab stops on desktop and 29 on mobile. The skip link comes first, every stop has a visible indicator in normal mode, and none is hidden behind the sticky header.
- Reflow at 320 px and text spacing both pass.

Two performance notes:

- **LCP 8.9 s (Lighthouse, simulated mid-tier mobile) is a lab artifact.** Real loads paint the hero paragraph at first paint: 0.1–0.3 s on broadband and about 1 s on throttled slow 4G (03 §1a). Lighthouse's simulation treats every request that starts before LCP as blocking, and 2.45 MB of eager bartending JPEGs start first. Adding `loading="lazy"` to those images alone moves Lighthouse LCP to 2.6–2.7 s and the performance score from about 72 to 93–94. Lighthouse also labels the hero paragraph `.reveal`, but that's only because it reads the DOM after hydration. Hero reveals should come out anyway (01a §5).
- **Total byte weight is 2.7 MB.** The ten bartending JPEGs account for 2.47 MB of it.

## After Phase 0 (live on `main` since October 14)

Run on 2026-10-13 against a production build (`npm run build`, served locally). **Every check passes.** The fixes were then ported onto `main` after PR #3 (hero stats, self-hosted icons, a 404 page) and re-checked there, on the home page and the 404 page: every check still passes (Lighthouse 100 · 92 · 100 · 100 on the home page, LCP 2.8 s). They deployed to ryancritchlow.com on October 14.

| Check                                         | Before                             | After                                                              |
| --------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------ |
| axe WCAG violations, 4 modes                  | Scroll box unreachable by keyboard | 0                                                                  |
| Skip link while focused                       | 3.12:1                             | Passes (7.7:1)                                                     |
| Focus indicator contrast                      | 2.97:1 page, 2.38:1 band           | 4.0:1 or more on every ground, both themes                         |
| Forced colors                                 | 12 controls lose their ring        | Every stop keeps a ring (26 desktop, 19 mobile)                    |
| Motion under reduced motion                   | Marquee and conveyor keep moving   | None                                                               |
| Without JavaScript                            | Cards and contact links invisible  | Nothing hidden; the conveyor boxes sit on the belt                 |
| Text on gradients, pixel-sampled              | Lowest 5.04:1                      | Lowest 5.13:1 light, 5.67:1 dark                                   |
| Reflow at 320 px, text spacing                | Pass                               | Pass                                                               |
| Lighthouse a11y · perf · best practices · SEO | 100 · 72 · 100 · 92                | 100 · 89–94 · 100 · 100 (three runs)                               |
| LCP (Lighthouse, simulated)                   | 8.9 s                              | 2.7–3.1 s                                                          |
| Page weight after scrolling the whole page    | 2.7 MB                             | About 0.67 MB uncompressed; the three drawings are 8–12 KB gzipped |

The conveyor was also tested on its own: with motion allowed the boxes wait off the belt, arrive once about 2 seconds after it scrolls into view, and "Run the belt again" replays them with keyboard focus kept on the button. With reduced motion they never move and the button isn't rendered. No console errors in either mode.

## Hybrid mockup

Run on 2026-10-13, served locally from `docs/design-review/`. Consensus, Almanac and Selvedge were retired after this review; their results are in this file's git history. Hybrid was checked in all four palettes (`hybrid.html?palette=harbor`, `navy`, `periwinkle`), and every check passes in each.

| Check                                         | Hybrid, all four palettes            |
| --------------------------------------------- | ------------------------------------ |
| axe WCAG violations, 4 modes                  | 0                                    |
| axe best-practice findings                    | 0                                    |
| Skip link while focused                       | Passes                               |
| Keyboard walk                                 | 30 stops, all visible, none obscured |
| Forced colors                                 | Every stop keeps a ring              |
| Reflow at 320 px, text spacing                | Pass                                 |
| Motion under reduced motion                   | None                                 |
| Token pairs (`palettes.json`)                 | 208 pass (26 per palette and mode)   |
| Lighthouse a11y · perf · best practices · SEO | 100 · 83 · 96 · 100 (original blue)  |
| LCP, CLS                                      | 3.3 s, 0                             |

Notes:

- **The mockup loads Google Fonts from another origin.** That blocks rendering and accounts for most of the LCP under Lighthouse's slow-4G simulation, and it's why best practices is 96 rather than 100 (scores vary a few points between runs). The real site self-hosts its fonts through Fontsource, which avoids this.
- **The Hybrid conveyor belt (on the Körber card) was tested on its own,** including the jump from the "See how I troubleshoot" link:
  - The boxes wait off the belt, clipped by the card, until it scrolls into view, so nothing visible jumps.
  - They arrive together as one train and stop after 1.4 s.
  - "Run the belt again" replays it.
  - Under reduced motion the belt never moves and the replay button is hidden.
- **I also tested the interactions in a browser, with no console errors:**
  - Petting Georgia fills the hearts and announces the friendship level.
  - The theme toggle flips `aria-pressed` and persists across reloads.
  - "Copy" writes the email to the clipboard, or selects it when the clipboard is refused.
  - `<details>` opens.
  - The palette picker switches palettes, remembers the choice, and `?palette=` opens one directly.

### Limits of automated checking

These checks catch a lot, but not everything. Before shipping, test by hand:

- a screen reader pass (VoiceOver on iOS and macOS, NVDA on Windows)
- 200% and 400% browser zoom
- Windows High Contrast on real hardware
- one session with keyboard only
