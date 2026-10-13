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

## Current site (`main` @ `bf1f6c7`)

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

## Mockups

Final run on 2026-10-13, served locally from `docs/design-review/`. All four mockups pass every check.

| Check                                            | Hybrid                               | Consensus               | Almanac                 | Selvedge                                                              |
| ------------------------------------------------ | ------------------------------------ | ----------------------- | ----------------------- | --------------------------------------------------------------------- |
| axe WCAG violations, 4 modes                     | 0                                    | 0                       | 0                       | 0                                                                     |
| axe best-practice findings                       | 0                                    | 0                       | 0                       | 0                                                                     |
| Text on illustrations or overlaps, pixel-sampled | 7–9 nodes, lowest 5.87:1             | none to sample          | 5 nodes, lowest 13.19:1 | 73–82 nodes, lowest 4.94:1 (4 decorative `aria-hidden` nodes skipped) |
| Skip link while focused                          | Passes                               | Passes                  | Passes                  | Passes                                                                |
| Keyboard walk                                    | 32 stops, all visible, none obscured | 29 stops, all visible   | 28 stops, all visible   | 28 stops, all visible                                                 |
| Forced colors                                    | Every stop keeps a ring              | Every stop keeps a ring | Every stop keeps a ring | Every stop keeps a ring                                               |
| Reflow at 320 px, text spacing                   | Pass                                 | Pass                    | Pass                    | Pass                                                                  |
| Motion under reduced motion                      | None                                 | None                    | None                    | None                                                                  |
| Token pairs (`palettes.json`)                    | 52 pass                              | 37 pass                 | 53 pass                 | 63 pass                                                               |
| Lighthouse a11y · perf · best practices · SEO    | 100 · 82 · 96 · 100                  | 100 · 92 · 96 · 100     | 100 · 83 · 96 · 100     | 100 · 87 · 96 · 100                                                   |
| LCP, CLS                                         | 3.5 s, 0                             | 2.7 s, 0                | 3.3 s, 0                | 2.9 s, 0                                                              |

Notes:

- **The mockups load Google Fonts from another origin.** That blocks rendering and accounts for most of the LCP under Lighthouse's slow-4G simulation, and it's why best practices is 96 rather than 100. Hybrid loads two families, so it's slowest. The real site self-hosts its fonts through Fontsource, which avoids this.
- **The Hybrid conveyor belt was tested on its own.** I recorded box positions frame by frame:
  - The boxes start off the belt on the very first frame, so they never flash.
  - They arrive together as one train and stop after 1.6 s.
  - "Run the belt again" replays it.
  - Under reduced motion the belt never moves and the replay button is hidden.
  - The four proof points are ordinary list text the whole time.
- **I also tested the interactions in a browser, with no console errors:**
  - Petting Georgia fills the hearts and announces the friendship level.
  - The theme toggle flips `aria-pressed` and persists across reloads.
  - "Copy" writes the email to the clipboard, or selects it when the clipboard is refused.
  - `<details>` opens.

### Limits of automated checking

These checks catch a lot, but not everything. Before shipping, test by hand:

- a screen reader pass (VoiceOver on iOS and macOS, NVDA on Windows)
- 200% and 400% browser zoom
- Windows High Contrast on real hardware
- one session with keyboard only
