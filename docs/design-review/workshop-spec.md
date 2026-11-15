# Workshop design: tokens and spec

The main page as built in November 2026. Tokens live in `src/app.css`; this file says
what each is for and how the page behaves, so a later change can stay consistent.

## Tokens

### Colour

Components ask for a role. Each role resolves per theme in `src/app.css`.

| Role                 | Light     | Dark               | Used for                                           |
| -------------------- | --------- | ------------------ | -------------------------------------------------- |
| `surface`            | `#f5efe2` | `#1c1712`          | Page ground (bone)                                 |
| `surface-raised`     | `#fffaf0` | `#272019`          | Cards, secondary buttons                           |
| `band` / `footer`    | `#eadfc8` | `#241e17`          | Experience section and footer (sand)               |
| `ink`                | `#231a12` | `#f1e9dc`          | Body text                                          |
| `ink-muted`          | `#54473a` | `#c8bba8`          | Dates, bullets, notes                              |
| `brand` / `link`     | `#7a2a26` | `#f0a898`          | Brick burgundy: primary buttons, links, nav marker |
| `hero` / `on-hero`   | `#7a2a26` | `#5e1f1d`          | The hero block; text on it is `#fff3e0`            |
| `feature`            | `#3b4420` | `#2f3619`          | Deep olive, used once: the published paper         |
| `olive`              | `#4a5325` | `#c5d49a`          | Employer and school names                          |
| `chip`               | `#dfe0bd` | `#37402a`          | Skill chips, row hover, text selection             |
| `outline` / `shadow` | `#231a12` | `#f1e9dc` / `#000` | Ink borders and hard shadows                       |

Rules: brick is the only colour used for actions. Olive never carries a link or a
button. Every text pair is 4.5:1 or better; axe and pa11y check the rendered pages.

### Type

| Token          | Value                                  | Used for                     |
| -------------- | -------------------------------------- | ---------------------------- |
| `font-display` | Bricolage Grotesque, width 75, 600–800 | Headings on the main page    |
| `font-sans`    | Atkinson Hyperlegible Next             | All text and controls        |
| `font-mono`    | Atkinson Hyperlegible Mono             | Simulator codes              |
| hero name      | `clamp(3rem, 17.2vw, 12.25rem)` / 0.82 | Fills the column on one line |
| `text-section` | `clamp(2.75rem, 7vw, 4.5rem)` / 0.95   | Section headings             |
| `text-row`     | `clamp(1.6rem, 3vw, 2.1rem)` / 1.05    | Experience row titles        |
| `text-lede`    | 1.25rem / 1.5                          | Hero summary, About          |
| `text-body`    | 1.0625rem / 1.6                        | Body copy                    |

Nothing is set in italics, so no italic font file is loaded.

### Space, shape, motion

- Page width: the `wrap` utility, 68rem with a `clamp(1.25rem, 4vw, 2.5rem)` gutter.
- Section padding: 4rem, 6rem from `md`. Reading measure: 38rem.
- Outlined block: the `inked` utility, a 2.5px ink border and a hard shadow offset by
  `--lift` (4px by default, 6px on the paper, 3px on buttons).
- Radius: 8px buttons, 16px cards and the paper, full for pills and chips.
- Easing: `--ease-spring` for objects being set down or tipped.

## Page order

Hero, About, Research, Experience, Education beside Skills, footer. The header's
links follow the same order.

## Components and states

| Element            | Rest                              | Hover                          | Pressed              | Focus                   |
| ------------------ | --------------------------------- | ------------------------------ | -------------------- | ----------------------- |
| Button (`btn`)     | Ink border, 3px hard shadow       | Moves 1px into its shadow      | Moves 3px, no shadow | 3px outline, 2px offset |
| Experience row     | Title, employer, dates, plus sign | Pale olive ground; objects tip | Opens or closes      | Outline on the summary  |
| Nav link           | Muted text                        | Strong text                    | n/a                  | Outline                 |
| Text link (`link`) | Brick, underlined                 | n/a                            | n/a                  | Outline                 |

Focus outlines are ink on light grounds and `#fff3e0` inside `.on-dark` blocks (the
hero and the paper).

### Experience rows

- Each role is a native `<details>`. Roles with `open: true` in `content.ts` start
  unfolded (currently Atlas, KIND Lab and Körber).
- A link to a role's id (`#korber`, `#kind-lab`) opens that row.
- Closed rows are still found by the browser's find-in-page.

## Motion

| Element       | Trigger           | Motion                          | Duration | Reduced motion |
| ------------- | ----------------- | ------------------------------- | -------- | -------------- |
| Shelf objects | Page load, once   | Drop 14px into place, staggered | 0.45s    | No motion      |
| Button        | Hover, press      | Moves into its shadow           | 0.12s    | No motion      |
| Row           | Open, close       | Slides to its height            | 0.3s     | Opens at once  |
| Row objects   | Row hover         | Tip further on their tilt       | 0.35s    | No motion      |
| Conveyor      | Scrolls into view | Delivers its boxes once         | 1.8s     | Boxes at rest  |

The row slide needs `interpolate-size`; other browsers open the row at once.

## Responsive behaviour

| Width        | Changes                                                                   |
| ------------ | ------------------------------------------------------------------------- |
| Under 40rem  | Row dates move under the employer. Shelf shows six objects.               |
| Under 48rem  | Menu button replaces the nav links. Paper cards stack.                    |
| Under 64rem  | Hero photo sits beside the availability line. Education stacks on Skills. |
| 64rem and up | Hero photo in its own column. Row objects sit to the right of the text.   |

## Accessibility notes

- Header buttons and phone menu links are 44px or taller.
- Illustrations and the large logo are decorative and hidden from assistive tech.
- The heading order is h1, then h2 per section, h3 per entry, h4 inside the paper.
- Forced-colours mode: masked logos and the plus sign are redrawn in system colours.

## Rebuilding the heading font

`scripts/make-display-font.mjs` cuts the 23 KB file from the full family. It needs
`subset-font` and `@fontsource-variable/bricolage-grotesque` installed first; neither
is a project dependency.
