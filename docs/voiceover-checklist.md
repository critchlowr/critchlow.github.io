# VoiceOver checklist

The automated suite (`npm run a11y`) proves the page has no detectable violations. It cannot prove the page is usable. Automated tools fully cover roughly half of real accessibility issues — Deque measured 57% across ~13,000 pages — and everything below falls in the other half.

Run this after any change to navigation, a dialog, the simulator, or the reveal/scroll behaviour.

**Setup:** Safari on macOS. `Cmd+F5` toggles VoiceOver. "VO" = `Control+Option`. Useful keys:

| Key                 | Does                                                                        |
| ------------------- | --------------------------------------------------------------------------- |
| `VO+A`              | Read continuously from here                                                 |
| `VO+U`              | Open the rotor (then `←`/`→` for headings, links, landmarks, form controls) |
| `VO+Cmd+H`          | Jump to next heading                                                        |
| `Tab` / `Shift+Tab` | Move between controls                                                       |
| `VO+Space`          | Activate the focused item                                                   |
| `Ctrl`              | Stop speech                                                                 |

Test both themes. Force one with `?theme=dark` or `?theme=light` on any URL.

---

## 1. Entry and bypass

- [ ] Load `/`. Press `Tab` once. The first stop is **"Skip to main content"**, and it becomes _visible_ on screen.
- [ ] Activate it. Focus lands on `<main>`, and continued reading starts at the hero — not back at the top of the header.
- [ ] `VO+U` → Landmarks. You hear banner, navigation, main, contentinfo. Both navs are distinguishable by name (the header nav and the section rail should not both be "navigation").

## 2. Heading structure

- [ ] `VO+U` → Headings on `/`. Exactly one `h1` ("Ryan Critchlow"). Levels descend without gaps. The list reads as a table of contents someone could navigate by.
- [ ] Repeat on `/resume` and `/work/you-and-i`.
- [ ] On `/work/you-and-i` the rail is a navigation landmark named "On this page" (VO rotor → Landmarks), not a heading. The first heading in the rotor should be the `h1` "You and I".

## 3. Links

- [ ] `VO+U` → Links on `/`. Every link makes sense **read out of context**. No "here", "more", "read more" standing alone.
- [ ] The three external links (KIND Lab, Atlas Northwest, ORCID) each announce "opens in a new tab".
- [ ] The resume link goes to `/resume`, not straight to a PDF. On `/resume`, the PDF link announces its format and size.
- [ ] The "RC" logo link announces something meaningful, not "RC link".

## 4. Keyboard and focus

- [ ] `Tab` all the way through `/` without VoiceOver. **Every** focused element has a visible ring, on every background — parchment bands, white cards, the golden footer, and coloured buttons.
- [ ] No focused control is ever hidden behind the fixed header (SC 2.4.11). Check especially with `Shift+Tab` moving upward.
- [ ] Focus order matches visual order. Nothing jumps sideways.
- [ ] The bartending photo reel costs **two** tab stops, not eleven: one for Pause, one for the reel itself. A third Tab leaves the reel entirely.
- [ ] Inside the reel, `←`/`→` move between photos and wrap around; `Home`/`End` jump to first/last.
- [ ] Arrowing to a photo scrolls it **fully into view** — no photo is ever focused while clipped by the container edge (SC 2.4.11).
- [ ] The reel **stops moving** while a photo has focus.
- [ ] The reel's Pause button works and its label flips between Play and Pause.

## 5. Photo lightbox

- [ ] Open a photo with the keyboard. Focus lands on **Close photo**.
- [ ] `Tab` repeatedly — focus never escapes the dialog to the page behind it.
- [ ] The photo's description is announced.
- [ ] `Escape` closes it and focus returns to **the photo you opened**, not the top of the page.

## 6. Mobile menu

- [ ] Narrow the window below 768px. The hamburger announces its expanded/collapsed state, and the state changes when activated.
- [ ] Menu links are reachable by `Tab` when open and not when closed.

## 7. The simulator — the hard one

- [ ] Open it. VoiceOver announces the **dialog and its name** ("Really Cool Big Warehouse"), not "Reset button". _(This was a real defect: focus used to land on Reset, one keypress from discarding the user's progress.)_
- [ ] `Tab` is trapped inside. The page behind is not reachable.
- [ ] Work the whole flow with the keyboard only: **Wave → Pick → Stage → Pack → Load → Ship**. Every action is reachable and operable without a mouse.
- [ ] After each action, the announcement is **heard in full** and is not cut off by a second one. Pay particular attention to a pick that triggers a replenishment — that used to fire two announcements in the same instant and the first was lost entirely. It should now be one sentence covering both.
- [ ] Fill the cart to capacity. The "Cart full" alert interrupts, as it should — that is the one state worth interrupting for.
- [ ] Expand **View Inventory**. The table announces its caption, and column headers are read when moving between cells (`VO+←/→`).
- [ ] The warehouse diorama is skipped entirely by VoiceOver. It is decoration and should be silent.
- [ ] `Escape` closes the simulator and returns focus to the button that opened it.
- [ ] Reset works and the game state is announced afterwards.

## 8. Motion

- [ ] System Settings → Accessibility → Display → **Reduce motion**. Reload.
- [ ] Content still appears — sections fade in rather than sliding, and nothing is stuck invisible.
- [ ] The photo reel does not auto-scroll, and its Pause button is gone (nothing to pause).
- [ ] The conveyor belt and scroll rails do not animate distractingly.

## 9. Zoom and reflow

- [ ] Zoom to 400% at 1280px wide (≈320px effective). No horizontal scrolling of the page itself. Wide things — the inventory table, the flow diagram — scroll inside their own containers.
- [ ] Those scrollable containers are reachable by keyboard when they actually overflow.

---

## What to do with a failure

Fix the barrier, not the report. If a change makes a checker quieter but a real user's path worse, it is not a fix. Three specific traps on this site:

1. The marquee's duplicate slides are visual filler. They must stay out of the tab order and out of the accessibility tree. Do not make them focusable to satisfy a scanner.
2. The 6px `STAGING`/`RECEIVING` labels in the diorama are decoration inside an `aria-hidden` scene. WAVE flags them as small text; that alert is accepted deliberately and documented in `WarehouseScene.svelte`.
3. `title` attributes are not labels. If something needs a name, give it real text or `aria-label`.
