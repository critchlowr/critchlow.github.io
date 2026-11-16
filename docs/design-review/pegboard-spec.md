# Pegboard design: tokens and spec

The main page as built in November 2026. Tokens live in `src/app.css`; this file says
what each is for and how the page behaves, so a later change can stay consistent.

## Tokens

### Colour

Components ask for a role. Each role resolves per theme in `src/app.css`.

| Role                       | Light     | Dark      | Used for                                          |
| -------------------------- | --------- | --------- | ------------------------------------------------- |
| `surface`                  | `#efe4cf` | `#1a1410` | Page ground (kraft)                               |
| `surface-raised`           | `#fbf4e6` | `#261d16` | Plain tiles, secondary buttons                    |
| `band` / `footer`          | `#e6d7bc` | `#211913` | Experience section and footer                     |
| `ink`                      | `#2b1e16` | `#f2e7d6` | Body text                                         |
| `ink-muted`                | `#5a4a3c` | `#cdbda6` | Dates, bullets, notes                             |
| `brand` / `link`           | `#7a2a26` | `#f0a898` | Brick burgundy: primary buttons, links            |
| `hero` / `on-hero`         | `#7a2a26` | `#6f2623` | The name tile; text on it is `#fff3e0`            |
| `feature` / `on-feature`   | `#454e22` | `#353d1a` | Olive: the published paper, here and on the board |
| `espresso` / `on-espresso` | `#2b1e16` | `#2e2219` | The simulator tile and callout; text `#f5efe2`    |
| `tan` / `on-tan`           | `#d8b98f` | `#d8b98f` | The availability tile; text `#2b1e16`             |
| `chip`                     | `#dfd0b0` | `#3a2e22` | Skill chips, the degree tile, row hover           |
| `olive`                    | `#4a5325` | `#c5d49a` | Employer and school names                         |
| `edge`                     | `#bfa98a` | `#5a4937` | Rules between rows, the header's bottom rule      |

Rules: brick is the only colour used for actions on the page ground. Blocks are told
apart by colour alone: no outlines and no shadows. Every text pair is 4.5:1 or better;
axe and pa11y check the rendered pages.

### Type

| Token          | Value                                 | Used for                      |
| -------------- | ------------------------------------- | ----------------------------- |
| `font-display` | Gabarito, 600–800                     | Headings                      |
| `font-sans`    | Atkinson Hyperlegible Next            | All text and controls         |
| `font-mono`    | Atkinson Hyperlegible Mono            | Simulator codes               |
| name           | `clamp(3rem, 9vw, 6.25rem)` / 0.9     | The name on its tile          |
| `text-section` | `clamp(2.25rem, 5vw, 3.5rem)` / 1     | Section headings              |
| `text-row`     | `clamp(1.4rem, 2.5vw, 1.75rem)` / 1.1 | Experience row titles         |
| tile heading   | `clamp(1.35rem, 2.2vw, 1.7rem)` / 1.1 | Headings on the board's tiles |
| `text-body`    | 1.0625rem / 1.6                       | Body copy                     |

Nothing is set in italics, so no italic font file is loaded.

### Space, shape, motion

- Page width: the `wrap` utility, 68rem with a `clamp(1.25rem, 4vw, 2.5rem)` gutter.
- Section padding: 4rem, 6rem from `md`. Reading measure: 38rem.
- Tile: the `tile` utility, a `--radius-tile` (1.75rem) corner. Tiles on the board sit
  0.75rem apart.
- Buttons are pills. Chips and status pills are also fully round.
- Easing: `--ease-out` for things arriving; `--ease-spring` for objects being tipped.

## Page order

The board, Research, Experience, Education beside Skills, footer. The header's links
follow the same order. There is no About section: its content is on the board.

## The board

One fact per tile, in this order in the markup:

| Tile         | Ground           | Content                                       | Action                        |
| ------------ | ---------------- | --------------------------------------------- | ----------------------------- |
| Name         | `hero`           | Name (h1), tagline, one sentence, two buttons | Get in touch, résumé          |
| Photo        | image            | Portrait                                      | none                          |
| Availability | `tan`            | The availability line, shared with the footer | none                          |
| Paper        | `feature`        | "Presented at ASSETS 2026", title, nomination | Whole tile links to Research  |
| Körber       | `espresso`       | Three years in technical support engineering  | Button opens the simulator    |
| Degree       | `chip`           | M.S. in Computer Science, HCI                 | Whole tile links to Education |
| Personal     | `surface-raised` | The lab logo and one personal line            | none                          |

The paper tile takes its title and nomination from the publications list in
`content.ts`, so the two cannot drift apart.

## Components and states

| Element             | Rest                         | Hover                    | Pressed       | Focus                        |
| ------------------- | ---------------------------- | ------------------------ | ------------- | ---------------------------- |
| `btn btn-primary`   | Brick fill                   | Darker brick             | Scales to 97% | 3px outline, 2px offset      |
| `btn btn-secondary` | Raised fill, 2px inset ring  | Chip fill                | Scales to 97% | Outline                      |
| `btn btn-light`     | Cream fill, for dark tiles   | Warmer cream             | Scales to 97% | Outline                      |
| `btn btn-ghost`     | Cream ring, for dark tiles   | 12% cream wash           | Scales to 97% | Outline                      |
| Linked tile         | Underlined heading           | Lifts 3px (mouse only)   | Follows link  | Outline just inside the tile |
| Experience row      | Title, employer, dates, plus | Chip ground; objects tip | Opens, closes | Outline on the summary       |
| Nav link            | Muted text                   | Strong text              | n/a           | Outline                      |
| Text link (`link`)  | Brick, underlined            | n/a                      | n/a           | Outline                      |

Focus outlines are ink on light grounds and `#fff3e0` inside `.on-dark` blocks (the
name, paper and Körber tiles, the published paper and the simulator callout).

### Experience rows

- Each role is a native `<details>`. Roles with `open: true` in `content.ts` start
  unfolded (currently KIND Lab and Körber).
- A link to a role's id (`#korber`, `#kind-lab`) opens that row.
- Closed rows are still found by the browser's find-in-page.

### The simulator

- One dialog, mounted in the layout (`SimulatorDialog.svelte`) and opened through
  `src/lib/stores/simulator.svelte.ts`. There is no simulator page.
- Entry points: the Körber tile on the board, the callout in the Körber row, and the
  `/simulator` address, which moves to `/` and opens the dialog.
- First screen: two sentences, the Wave to Ship sequence, a note on empty locations,
  and "Start the shift". The game replaces it in the same dialog.
- Focus moves into the dialog on open, to the dialog again when the game starts, and
  back to the button that opened it on close. Escape and the Close button close it.
  Closing ends the shift; reopening starts at the first screen.
- On phones the dialog fills the screen.

## Motion

| Element     | Trigger           | Motion                            | Duration | Reduced motion |
| ----------- | ----------------- | --------------------------------- | -------- | -------------- |
| Board tiles | Page load, once   | Fade in from 96% size, 60ms apart | 0.45s    | No motion      |
| Linked tile | Mouse hover       | Lifts 3px                         | 0.15s    | No motion      |
| Button      | Press             | Scales to 97%                     | 0.12s    | No motion      |
| Row         | Open, close       | Slides to its height              | 0.3s     | Opens at once  |
| Row objects | Row hover         | Tip further on their tilt         | 0.35s    | No motion      |
| Conveyor    | Scrolls into view | Delivers its boxes once           | 1.8s     | Boxes at rest  |

The row slide needs `interpolate-size`; other browsers open the row at once.

## Responsive behaviour

| Width        | Changes                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------ |
| Under 40rem  | Row dates move under the employer.                                                                           |
| Under 48rem  | Menu button replaces the nav links. Paper cards stack. Dialog fills the screen.                              |
| Under 60rem  | Board is two columns: photo beside availability, every other tile full width.                                |
| 60rem and up | Board is twelve columns: name 7 by 2 rows, photo 2, availability 3, paper 5, Körber 5, degree 3, personal 4. |
| Under 64rem  | Education stacks on Skills.                                                                                  |
| 64rem and up | Row objects sit to the right of the text.                                                                    |

## Accessibility notes

- Header buttons, phone menu links and all buttons are 44px or taller. A linked tile's
  whole area is its target.
- Illustrations and the large logo are decorative and hidden from assistive tech.
- The heading order is h1 on the name tile, h2 per tile and per section, h3 per
  entry, h4 inside the paper.
- Forced-colours mode: tiles and buttons get a border, since their fills are removed;
  masked logos and the plus sign are redrawn in system colours.
- `scripts/a11y-audit.mjs` plays a full shift from the Körber row and checks the
  `/simulator` address lands on `/` with the dialog open.

## Rebuilding the heading font

`scripts/make-display-font.mjs` cuts the 19 KB file from the full family. It needs
`subset-font` and `@fontsource-variable/gabarito` installed first; neither is a project
dependency.
