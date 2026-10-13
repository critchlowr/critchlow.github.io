# Accessibility checks

Two scripts. They're separate from the site's own `package.json`, so they add nothing to the build.

```sh
cd docs/design-review/a11y
npm install
node check.mjs http://localhost:4173/ [more urls] [--out results] [--no-lighthouse]
node palette-contrast.mjs palettes.json
```

## `check.mjs`

This runs every URL in light and dark mode, at 1440 px and 390 px. It exits with code 1 if any check fails.

| Check                                                    | Catches                                                                                                                                                                                                                                                           |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| axe-core, WCAG 2.0 / 2.1 / 2.2 A + AA and best practices | The standard automated rules                                                                                                                                                                                                                                      |
| Pixel contrast                                           | Text on gradients, images or overlapping layers. axe reports these as "incomplete", so this check hides the text, screenshots what's behind it, and measures against the lightest and darkest pixels. Decorative `aria-hidden` text is reported but doesn't fail. |
| First-focus contrast                                     | Skip links, which are invisible until focused, so axe never sees them                                                                                                                                                                                             |
| Keyboard walk                                            | Every Tab stop needs a visible indicator (2.4.7) and must not be covered by sticky content (2.4.11)                                                                                                                                                               |
| Forced-colors walk                                       | Focus rings built from `box-shadow`, which Windows High Contrast removes                                                                                                                                                                                          |
| Reflow                                                   | Horizontal scrolling at 320 px (1.4.10)                                                                                                                                                                                                                           |
| Text spacing                                             | Clipped text under the 1.4.12 spacing overrides                                                                                                                                                                                                                   |
| Reduced motion                                           | Any transform animation that starts under `prefers-reduced-motion: reduce`, plus transforms that keep changing while idle (catches `requestAnimationFrame` loops)                                                                                                 |
| Lighthouse                                               | Accessibility, performance, best-practices and SEO scores                                                                                                                                                                                                         |

Set `A11Y_DEBUG=1` to save the screenshot behind every failed pixel-contrast sample.

## `palette-contrast.mjs`

This prints the WCAG 2.2 ratio and the APCA Lc for each foreground/background pair in a palette file. Only WCAG decides pass or fail; APCA is shown for reference and isn't a standard yet. Pairs are tagged `text` (4.5:1), `large` (3:1) or `ui` (3:1). `palettes.json` holds both mockup palettes, 116 pairs in total. The module also exports `wcag()` and `apca()` for use in other scripts.
