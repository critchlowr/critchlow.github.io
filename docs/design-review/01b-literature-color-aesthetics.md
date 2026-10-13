# 01b · Literature review: aesthetics, design psychology and colour

_Scope: curvature, enjoyment, colour, palette sources, type, texture. Animation, Svelte and the CSS platform are covered elsewhere. Compiled 2026-10-13. Evidence labels: **strong** (meta-analysis, replicated, or a W3C normative standard), **moderate** (peer-reviewed, a few studies), **weak** (practitioner heuristic, industry study, or blog)._

## Executive summary

- **People prefer curves, but modestly.** A 61-study meta-analysis found g = 0.39, cross-cultural but not universal, and weaker or absent for whole interiors and in VR [1–9]. Use arches as a **framing accent**, not a structural rule.
- **Arches can play "refuge" to a landscape hero's "prospect"** [11]. This is a design metaphor; prospect–refuge evidence is mixed [12].
- **Round reads soft and comfortable; angular reads hard and durable** [10]. Workwear is about durability, so pair arches with square slab type and straight stitch rules. All-round reads childish.
- **Aesthetic-usability runs both ways.** Beauty raises perceived usability before use [14, 15], and poor usability later drags beauty down [16]. Fun must sit on an efficient site.
- **First impressions form in 17–50 ms and favour low complexity plus high prototypicality** [19–21]. Make the skin distinctive and keep the structure conventional.
- **Hiring managers want process, role and outcomes, and they scan** [22]. Keep delight at the edges.
- **Build colour in OKLCH** [27–29], and hue-shift ramps like pixel artists (shadows to red/purple, highlights to straw) so browns stay "wood", not salmon [37].
- **WCAG 2.2 AA is the only normative contrast target.** APCA left the WCAG 3 draft in 2023, and the Sep 2026 draft calls the algorithm "yet to be determined" [24–26]. Use APCA as a second opinion for dark mode.
- **Colour-psychology claims are weak** [33–36]. Choose colours for identity and discriminability, test for CVD, and give every earth palette a cool counterpoint for links and focus.
- **Three script-verified palettes follow**, each with nine roles in light and dark mode, and every listed pair passes AA.

---

## 1. Curvature, arches and biophilic framing

**What the evidence supports**

- **Original finding.** Objects and meaningless patterns differing only in contour, shown for about 84 ms: the curved versions were liked more. The authors proposed that sharp angles signal threat [1].
- **Curves are liked, not just angles disliked.** Curved lines beat both angular and _straight_ lines, and an approach/avoidance task showed approach to curves but no avoidance of angles [6].
- **Effect size.** 61 studies (106 samples, 309 effects) give Hedges' g = 0.39: "reliable but not universal", moderated by presentation time, stimulus type, expertise and task [4]; see [3] for theory (**strong**).
- **Across cultures.** In 80 ms forced choices, Spain, Mexico (Oaxaca) and Ghana (Bawku) chose curves at .59, .55 and .58 against chance .50. Real, but small [5] (**moderate**).

**Architecture specifically (weaker than the hype)**

- **Vartanian et al. (2013).** Curvilinear rooms were judged _beautiful_ more often and activated anterior cingulate cortex, but contour did **not** change "would you enter?" decisions [2].
- **Immersive VR.** Free exploration of matched photorealistic living rooms showed no curvature preference; 2 of 33 outcomes survived correction, both favouring _angular_ rooms [7].
- **Static images.** The same group's photographs restored the preference (n = 198), concentrated in women [8]. The effect is weaker for interiors than for abstract shapes [9].
- **Bottom line.** "Arches feel comfortable" holds up for _images and framing_, not whole environments. A website is mostly images and framing, which is the favourable case.

**Biophilic design.** Terrapin Bright Green's _14 Patterns_ (2014; "Awe" added as a 15th in 2020) is a practitioner synthesis [11]. Three patterns apply:

- **Biomorphic Forms & Patterns:** symbolic references to natural contours and patterns.
- **Prospect:** an unimpeded view over a distance.
- **Refuge:** a place of withdrawal, protected from behind and overhead.

A meta-analysis of 34 prospect–refuge studies found mixed support, small samples (often n < 20) and student-only participants [12]. Even _pictures_ of nature modestly restore directed attention [13], which argues for national-park-poster landscapes.

**Translating it to UI**

- **Arch-top image masks** (`border-radius: 999px 999px 0 0` on a fixed aspect ratio) for the portrait and case-study heroes: the refuge's "canopy".
- **Prospect then refuge.** A wide landscape hero leads into a narrower reading column (65ch, roomy margins, subtle surface tint) under an arched header band.
- **Arched section dividers** as decorative inline SVG (`aria-hidden="true"`): one shape language, at most one arch per viewport.
- **Radii.** 4–8px on cards and buttons; save the full arch for 1–3 hero moments per page.
- **Focus rings.** `outline` now follows `border-radius` (Chrome/Edge 94+, Firefox 88+, Safari 16.4+), so rings trace arches [45].

**Pitfalls**

- **Over-rounding.** Pill-everything plus bubbly type reads juvenile. That is practitioner consensus (**weak**), but it fits the softness/hardness associations in [10].
- **Text inside curves** gets crowded or clipped. Pad the top by about 30% of the radius.
- **Arched cards in grids** waste space and break scan lines. Keep listing cards rectangular.

## 2. Aesthetics, enjoyment and first impressions

**Aesthetic-usability effect**

- **Original studies.** _Apparent_ usability of ATM layouts tracked aesthetics more than _inherent_ usability [14], and aesthetics, not actual usability, shaped _post-use_ perceived usability [15].
- **The reversal.** Under a strong usability manipulation (n = 80), poor usability lowered post-use _aesthetic_ ratings, while aesthetics left perceived usability unchanged [16].
- **Hassenzahl.** "Beauty" rides on hedonic, identity-signalling qualities; "goodness" draws on hedonic and pragmatic ones [17].
- **For a portfolio:** beauty buys a generous first look and signals identity, and friction erodes it.

**Norman's three levels [18] applied to this site**

- **Visceral:** palette, arches and texture, judged in under 100 ms.
- **Behavioural:** fast navigation, legible type, no blocking animations.
- **Reflective:** "a thoughtful HCI/accessibility analyst with taste." Americana and Stardew references earn their place here, as identity signals, like woven labels and chain-stitching on clothing.

**First impressions**

- **Speed.** Appeal judged at 50 ms correlates with appeal judged after longer viewing [19].
- **Complexity and prototypicality** affect ratings at **17 ms**; low-complexity, high-prototypicality sites score best [20].
- **Colourfulness and complexity** explain about half the variance in appeal at 500 ms, moderated by demographics [21] (**moderate–strong**).
- **Implication.** Stand out through materials (colour, type, ornament), not unconventional layout or navigation.

**What hiring managers want**

- **NN/g (survey of 204 hiring managers):** process, constraints, role and research influence, not just final visuals. They rarely read word for word, so be scannable and pick your top three takeaways first [22].
- **Recruiter speed.** An industry eye-tracking study clocked a 7.4 s initial résumé screen and favoured simple, sectioned layouts [23] (**weak**: industry, small sample, résumés).
- **For a business/product analyst:** open each case study with problem → role → method → measurable outcome. Keep playful elements (a pixel "almanac" badge, a stamped "Est." date, a seasonal easter egg) away from the evidence.

## 3. Colour practice for 2026

- **60-30-10** is an untested interior-design heuristic with no documented origin (**weak**). It still works as an _area budget_: ~60% ground, ~30% surfaces and secondary hue (wood or denim), ≤10% accent. In UI, keep accent nearer 5%: links, CTAs, focus.
- **OKLCH** (CSS Color 4) has a perceptual L axis, so equal L steps look equal and contrast is predictable [27, 28]. Tailwind v4 defines its palette in `oklch()` [29].
- **Building ramps in OKLCH:**
  - Fix hue, step L, and taper chroma at both ends, where high chroma leaves the sRGB gamut.
  - Then **hue-shift**: Slynyrd uses consistent steps of up to ~20° and warns that "straight ramps" lack interest and harmonise poorly [37]. Shadows go red/purple, highlights yellow (§4).
- **WCAG 2.2 AA** [24]:
  - **1.4.3:** text 4.5:1; large text (24px, or 18.66px bold) 3:1. Over images or grain, test the _lowest_-contrast area.
  - **1.4.11:** 3:1 for control boundaries, icons and focus indicators.
  - **1.4.1:** colour is never the only cue.
  - **2.4.7 / 2.4.11:** focus visible and not obscured.
  - **2.4.13 (AAA):** a ≥2px ring with 3:1 change is a good voluntary target.
- **APCA (October 2026):**
  - Not normative: pulled from the WCAG 3 draft in July 2023, and the 10 Sep 2026 Working Draft says the algorithm is "yet to be determined" [25].
  - Useful diagnostically. The WCAG 2 ratio _overstates_ light-on-dark contrast; APCA asks for ~Lc 75 for body text and ~Lc 60 for other content text [26].
- **Dark mode:**
  - Use a dark grey or tinted ground, not #000; desaturate brand colours; show elevation with _lighter_ surfaces [30].
  - Light mode measurably aids acuity and proofreading for typical vision; dark mode can help some low-vision users, such as those with cataracts [31].
  - Ship both: honour `prefers-color-scheme` with a toggle, plus `prefers-contrast: more` and `forced-colors` [46]. Give boundaries real borders, not only fills, so they survive forced colours.
- **Colour-vision deficiency:**
  - About 8% of men and 0.4% of women of European descent have red–green CVD, mostly deuteranomaly [48].
  - Separate colours that must be told apart by **lightness**, not hue alone; simulate with Machado (2009) [32]; underline links.
  - Worked example: wood brown and fern green both at L 0.47 differ by only ΔE_OK 3.0 under deuteranopia, effectively one colour. Moving them apart in L fixed it (Palette B).
- **Colour psychology:**
  - Colour-in-context theory concedes methodological weaknesses [33], and a meta-analysis found limited evidence that red impairs performance [36].
  - "Blue = competent, red = exciting" is an associative brand finding, not a causal hiring effect [34].
  - Colour–emotion associations are broadly shared across 30 nations (r = .88) but shaped by language and geography [35]. "Indigo = trustworthy" is flavour, not mechanism (**weak**).
- **Warm–cool balance.** All-earth palettes collapse into one hue family: monotonous, and hard for red–green-deficient viewers to separate. A cool counterpoint (indigo, sky, slate teal or night-purple) on links and focus adds rhythm and uses the blue–yellow axis, which survives red–green CVD.

## 4. Source palettes

**Provenance key.** _Repo_ means the seeds already in `src/app.css`. _Approx._ means published approximations that disagree with each other. _Derived_ means my characterisation, not sampled from game files or garments. No authoritative Stardew Valley palette is published, and US flag colours are defined by physical cable samples, so hex values are approximations [47].

| Family               | Swatch                     | Hex       | `oklch()`                | Provenance   |
| -------------------- | -------------------------- | --------- | ------------------------ | ------------ |
| Stardew Valley       | Repo seed: Korma (wood)    | `#95560e` | `oklch(51.5% 0.114 62)`  | Repo         |
|                      | Repo seed: Mandalay (gold) | `#b18816` | `oklch(64.9% 0.127 86)`  | Repo         |
|                      | Repo seed: Dark Fern       | `#15560b` | `oklch(39.7% 0.123 141)` | Repo         |
|                      | Repo seed: Totem Pole      | `#a22a06` | `oklch(47.2% 0.161 35)`  | Repo         |
|                      | Repo seed: Loulou (night)  | `#490846` | `oklch(28.9% 0.120 330)` | Repo         |
|                      | Dialogue parchment         | `#f6d69a` | `oklch(88.9% 0.085 83)`  | Derived      |
|                      | Frame wood                 | `#b4652d` | `oklch(58.7% 0.123 53)`  | Derived      |
|                      | Frame outline              | `#5a2e14` | `oklch(35.4% 0.075 49)`  | Derived      |
|                      | Spring grass               | `#6dab3c` | `oklch(67.6% 0.157 134)` | Derived      |
|                      | Summer sunflower           | `#f2c23a` | `oklch(83.5% 0.154 88)`  | Derived      |
|                      | Fall pumpkin               | `#d86a1f` | `oklch(64.5% 0.160 49)`  | Derived      |
|                      | Winter sky                 | `#8fb8de` | `oklch(76.7% 0.070 247)` | Derived      |
|                      | Night                      | `#2e2350` | `oklch(29.4% 0.079 292)` | Derived      |
| Americana / workwear | Old Glory Red              | `#b31942` | `oklch(49.8% 0.185 14)`  | Approx. [47] |
|                      | Old Glory Blue             | `#0a3161` | `oklch(31.7% 0.095 256)` | Approx. [47] |
|                      | Raw indigo                 | `#1f2a44` | `oklch(28.8% 0.050 266)` | Derived      |
|                      | Rinsed indigo              | `#2b3a5c` | `oklch(35.2% 0.063 265)` | Derived      |
|                      | Stonewash indigo           | `#5b7aa6` | `oklch(57.4% 0.077 257)` | Derived      |
|                      | Chambray                   | `#8fa6c4` | `oklch(71.8% 0.051 255)` | Derived      |
|                      | Selvedge ID red            | `#b0322e` | `oklch(50.9% 0.163 27)`  | Derived      |
|                      | Brown duck canvas          | `#9b6b3c` | `oklch(56.8% 0.088 64)`  | Derived      |
|                      | Waxed field tan            | `#7a6a45` | `oklch(53.0% 0.057 87)`  | Derived      |
|                      | Olive drab                 | `#57553a` | `oklch(44.4% 0.041 104)` | Derived      |
|                      | Hickory / flag cream       | `#ece4d2` | `oklch(92.0% 0.026 87)`  | Derived      |
|                      | Varsity gold felt          | `#e0a526` | `oklch(75.8% 0.147 81)`  | Derived      |
| Earth tones          | Terracotta                 | `#b85c3c` | `oklch(57.9% 0.128 40)`  | Derived      |
|                      | Ochre                      | `#c58b2a` | `oklch(67.8% 0.128 75)`  | Derived      |
|                      | Sage                       | `#9caf88` | `oklch(72.9% 0.059 129)` | Derived      |
|                      | Clay                       | `#c9a38a` | `oklch(74.3% 0.057 55)`  | Derived      |
|                      | Rust                       | `#9c4a26` | `oklch(50.7% 0.120 43)`  | Derived      |
|                      | Umber                      | `#5b4030` | `oklch(39.7% 0.046 52)`  | Derived      |

**Stardew Valley** reads as:

- warm saturated mid-tones on parchment
- orange-brown wood frames with a dark-brown outline
- seasons that swap the dominant hue (spring green → summer gold → fall pumpkin → winter sky)
- a purple-blue night.

**Americana workwear** reads as:

- deep, low-chroma indigo with a red selvedge ID line
- duck-canvas tan and olive
- cream felt with varsity gold
- WPA/NPS posters: five or six flat screen-print colours of earth, water and sky.

**Hue shifting in practice.** Here is the same wood ramp built two ways in OKLCH:

- **Straight** (h fixed at 55): `#482304 #753b07 #a65c20 #d1834b #f7b385 #ffe1ce`. The highlights go salmon/peach.
- **Hue-shifted** (h 30 → 92, with chroma peaking mid-ramp): `#4b1e18 #79371e #a75a25 #ca883f #e5be77 #f4e8c3`. The shadows go oxblood and the highlights go straw, which reads as varnished wood and parchment.

## 5. Typography

- **Keep Fraunces for display.** It is an "Old Style" soft serif that explicitly nods to **Windsor, Souvenir and the Cooper series**, which is the vernacular of early-20th-century American signage and catalogues [41].
  - Turn up `SOFT` for a chain-stitch warmth.
  - Use `WONK` only on hero headings.
  - Let `opsz` track the size.
- **Body text.** Inter is competent but generic. Two candidates with American roots:
  - **Public Sans**, the US Web Design System face, derived from Libre Franklin's Franklin Gothic lineage [43].
  - **Atkinson Hyperlegible Next** (Braille Institute, 2025; 7 weights, variable) if you want the accessibility story to show [42].
- **Slab/wood-type accents.**
  - Zilla Slab, Roboto Slab, Bitter or Hepta Slab for labels and "woven-label" badges.
  - **Ultra**, an ultra-bold slab with nods to Clarendon and Egyptian wood type, for big numerals only [44].
  - Graduate for a varsity-chip moment.
  - Big Shoulders, a condensed Chicago gothic, for tag lines.
- **Pixel accents.** Pixelify Sans (variable 400–700) or Silkscreen, at 20px or larger, at integer multiples of the font's pixel grid, for one or two game-flavoured labels. Never use them for body or links.
- **Scripts** (sign-painter): one decorative instance at most. They are hard for dyslexic readers.
- **Readability evidence:**
  - Eye-tracking found readability and comprehension improved with larger sizes, recommending 18pt or more for text-heavy pages [38]. Set body at about **18px** (`1.125rem`) with line-height 1.5–1.7.
  - Moderate lines of about 55 characters gave the best balance of speed and comprehension, and 100-character lines were read faster but liked less [39].
  - Use 50–75 characters (Baymard) [40]. Aim for `max-inline-size: 65ch` and never exceed 80 (WCAG 1.4.8, AAA).

## 6. Texture and ornament, tastefully

| Motif             | How                                                                     | Cost / risk                                                                                                        | Guardrail                                                                                                        |
| ----------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Paper grain       | Pre-rendered 128–256px noise tile (WebP/AVIF, a few KB) at 3–8% opacity | SVG `feTurbulence` is CPU-rasterised, and large filtered layers or `mix-blend-mode` add paint and compositing cost | Never animate it. Measure text contrast against the darkest grain pixel. Disable under `prefers-contrast: more`. |
| Stitched border   | `border: 2px dashed` or SVG `stroke-dasharray` with inset               | Low                                                                                                                | If it bounds a _control_, the dashes need 3:1 (1.4.11)                                                           |
| Woven-label badge | Small slab caps on a tinted chip with a folded-edge SVG                 | Tiny text gets illegible                                                                                           | Badge text 4.5:1, at least 14px, letter-spacing ≤ 0.08em                                                         |
| Stamp / patch     | Rotated SVG roundel ("EST. 2019")                                       | Decorative noise                                                                                                   | `aria-hidden`, at most one per view                                                                              |
| Halftone          | `radial-gradient` dot pattern or a pre-processed image                  | Dots behind text break contrast                                                                                    | Keep halftone in illustrations, never under body text. Give meaningful images alt text.                          |
| Pixel art         | PNG with `image-rendering: pixelated`                                   | Blurry at non-integer scales                                                                                       | Integer scaling only, with alt text                                                                              |

---

## Proposed palette directions

**Method.** Roles were set in OKLCH, gamut-mapped to sRGB by chroma reduction and quantised to hex; the `oklch()` shown is re-derived _from_ the hex. A Python script computed the WCAG 2.x ratio (normative), APCA 0.0.98G-4g Lc (informative) and ΔE_OK under Machado (2009) CVD simulation [27, 32].

**Shared rules:**

- The background colour is the label colour on `primary` buttons.
- Links are always underlined: link vs ink is only 1.4–2.0:1, below WCAG's 3:1 colour-only threshold.
- Focus ring: 2–3px outline, 2px offset. Control border: inputs and other bounded controls.
- Surface vs background is ~1.1:1, so cards that _are_ controls need a hairline or shadow.

### A. Selvedge & Canvas (Americana-forward)

- **Look:** raw-canvas ground, indigo ink, denim primary, selvedge-red accent, burnt-orange focus. Dark mode is rinsed-indigo night with chambray and varsity-gold focus.
- **Budget:** 60 canvas, 30 indigo, 10 red. The sharpest professional read.

| Role           | Light hex | Light `oklch()`          | Dark hex  | Dark `oklch()`           |
| -------------- | --------- | ------------------------ | --------- | ------------------------ |
| background     | `#f8f2e5` | `oklch(96.2% 0.018 86)`  | `#101725` | `oklch(20.5% 0.030 264)` |
| surface        | `#fefbf6` | `oklch(98.9% 0.007 81)`  | `#1a2333` | `oklch(25.5% 0.033 262)` |
| ink            | `#192239` | `oklch(25.6% 0.046 267)` | `#f0e9db` | `oklch(93.6% 0.020 85)`  |
| muted ink      | `#4b5669` | `oklch(45.1% 0.034 261)` | `#c3b9a9` | `oklch(79.0% 0.025 80)`  |
| primary        | `#25488c` | `oklch(41.5% 0.120 262)` | `#95bfe9` | `oklch(78.9% 0.075 249)` |
| accent         | `#b5352d` | `oklch(52.0% 0.166 28)`  | `#e98a77` | `oklch(73.0% 0.120 32)`  |
| link           | `#294c9f` | `oklch(44.0% 0.141 264)` | `#96caf8` | `oklch(81.9% 0.085 246)` |
| focus ring     | `#b95200` | `oklch(56.1% 0.152 48)`  | `#f3c358` | `oklch(84.0% 0.135 85)`  |
| control border | `#778193` | `oklch(60.1% 0.030 262)` | `#6e788a` | `oklch(57.1% 0.030 262)` |

### B. Pelican Town Almanac (Stardew-forward; extends the current "Valley" tokens)

- **Look:** parchment ground, walnut ink, fern-green primary, wood-orange accent, plum link, sky focus. Dark mode is Valley-night purple with spring-green primary and harvest-gold accent.
- **Accent rule:** the light-mode wood accent passes **3:1, not 4.5:1**. Use it for frames, rules, icons, outlined badges and text ≥24px only, never small text or a fill under small labels (ink on it is 4.0:1).
- The most _fun_. Seasonal accent hues can rotate, each re-verified.

| Role           | Light hex | Light `oklch()`          | Dark hex  | Dark `oklch()`           |
| -------------- | --------- | ------------------------ | --------- | ------------------------ |
| background     | `#f9edd5` | `oklch(94.9% 0.034 85)`  | `#1d142b` | `oklch(21.5% 0.045 301)` |
| surface        | `#fff9ea` | `oklch(98.3% 0.021 89)`  | `#291f3a` | `oklch(26.5% 0.051 300)` |
| ink            | `#381f11` | `oklch(26.9% 0.046 49)`  | `#f3e8d3` | `oklch(93.4% 0.030 84)`  |
| muted ink      | `#664c3b` | `oklch(44.0% 0.044 54)`  | `#c4b9a5` | `oklch(78.9% 0.030 83)`  |
| primary        | `#26652b` | `oklch(45.1% 0.111 145)` | `#69b27a` | `oklch(70.1% 0.110 150)` |
| accent         | `#c36d19` | `oklch(62.0% 0.140 58)`  | `#f8c562` | `oklch(85.0% 0.130 82)`  |
| link           | `#673682` | `oklch(43.0% 0.129 312)` | `#d1b7f1` | `oklch(82.1% 0.085 305)` |
| focus ring     | `#1174b4` | `oklch(54.0% 0.130 245)` | `#77d2f5` | `oklch(82.0% 0.100 225)` |
| control border | `#937b69` | `oklch(60.0% 0.040 59)`  | `#7b728c` | `oklch(56.9% 0.041 301)` |

### C. Adobe & Sage (earth-forward, biophilic)

- **Look:** clay-white ground, olive-charcoal ink, terracotta primary, deep-sage accent, slate-teal link, cobalt focus. Dark mode is warm loam.
- **Caveat:** light-mode primary text is the tightest pair (4.78:1); keep it at weight 600+.
- The calmest, most "home with arches" feel.

| Role           | Light hex | Light `oklch()`          | Dark hex  | Dark `oklch()`           |
| -------------- | --------- | ------------------------ | --------- | ------------------------ |
| background     | `#f8f1e9` | `oklch(96.1% 0.013 71)`  | `#1d1711` | `oklch(21.0% 0.015 67)`  |
| surface        | `#fefbf7` | `oklch(98.9% 0.006 75)`  | `#29231b` | `oklch(26.0% 0.017 75)`  |
| ink            | `#24271b` | `oklch(26.6% 0.022 119)` | `#efe9df` | `oklch(93.6% 0.015 81)`  |
| muted ink      | `#57584a` | `oklch(45.5% 0.022 111)` | `#c0b8ab` | `oklch(78.6% 0.020 80)`  |
| primary        | `#ae4e2a` | `oklch(54.1% 0.135 40)`  | `#dd8364` | `oklch(70.0% 0.120 40)`  |
| accent         | `#2c4a37` | `oklch(37.9% 0.049 156)` | `#b0dab8` | `oklch(84.9% 0.064 150)` |
| link           | `#195a73` | `oklch(43.9% 0.075 228)` | `#8ecce2` | `oklch(81.1% 0.070 222)` |
| focus ring     | `#1666aa` | `oklch(50.1% 0.130 250)` | `#eac26b` | `oklch(83.1% 0.115 85)`  |
| control border | `#818174` | `oklch(59.9% 0.019 107)` | `#7c7368` | `oklch(56.0% 0.020 73)`  |

### Computed contrast: WCAG 2.x ratio (APCA Lc, informative)

| Pair (WCAG 2.2 minimum)                                               | A light        | A dark        | B light       | B dark        | C light        | C dark        |
| --------------------------------------------------------------------- | -------------- | ------------- | ------------- | ------------- | -------------- | ------------- |
| ink / background (4.5)                                                | 14.16 (Lc 95)  | 14.84 (Lc 93) | 13.19 (Lc 92) | 14.57 (Lc 92) | 13.58 (Lc 94)  | 14.70 (Lc 93) |
| ink / surface (4.5)                                                   | 15.30 (Lc 100) | 13.05 (Lc 91) | 14.57 (Lc 99) | 12.80 (Lc 91) | 14.74 (Lc 100) | 12.88 (Lc 91) |
| muted ink / background (4.5)                                          | 6.64 (Lc 78)   | 9.25 (Lc 64)  | 6.80 (Lc 77)  | 9.12 (Lc 64)  | 6.47 (Lc 77)   | 9.03 (Lc 63)  |
| muted ink / surface (4.5)                                             | 7.18 (Lc 84)   | 8.13 (Lc 63)  | 7.51 (Lc 84)  | 8.01 (Lc 62)  | 7.02 (Lc 83)   | 7.91 (Lc 62)  |
| primary text / background (4.5)                                       | 7.89 (Lc 82)   | 9.31 (Lc 65)  | 6.08 (Lc 74)  | 6.95 (Lc 51)  | 4.78 (Lc 68)   | 6.34 (Lc 47)  |
| primary text / surface (4.5)                                          | 8.53 (Lc 88)   | 8.19 (Lc 63)  | 6.71 (Lc 81)  | 6.10 (Lc 49)  | 5.19 (Lc 74)   | 5.56 (Lc 46)  |
| button label (background colour) on primary fill (4.5)                | 7.89 (Lc 86)   | 9.31 (Lc 66)  | 6.08 (Lc 78)  | 6.95 (Lc 53)  | 4.78 (Lc 73)   | 6.34 (Lc 49)  |
| accent / background (4.5; B light: 3.0, non-text and large text only) | 5.36 (Lc 71)   | 7.14 (Lc 52)  | 3.28 (Lc 55)  | 11.08 (Lc 75) | 8.75 (Lc 85)   | 11.47 (Lc 77) |
| accent / surface (4.5; B light: 3.0)                                  | 5.79 (Lc 77)   | 6.28 (Lc 50)  | 3.62 (Lc 62)  | 9.73 (Lc 73)  | 9.50 (Lc 90)   | 10.05 (Lc 75) |
| link / background (4.5)                                               | 7.16 (Lc 80)   | 10.33 (Lc 70) | 7.46 (Lc 79)  | 9.90 (Lc 68)  | 6.81 (Lc 78)   | 10.05 (Lc 69) |
| link / surface (4.5)                                                  | 7.74 (Lc 85)   | 9.08 (Lc 69)  | 8.24 (Lc 86)  | 8.70 (Lc 67)  | 7.40 (Lc 84)   | 8.80 (Lc 68)  |
| focus ring / background (3.0)                                         | 4.41 (Lc 66)   | 10.89 (Lc 73) | 4.33 (Lc 64)  | 10.38 (Lc 71) | 5.33 (Lc 72)   | 10.51 (Lc 72) |
| focus ring / surface (3.0)                                            | 4.76 (Lc 71)   | 9.58 (Lc 72)  | 4.78 (Lc 71)  | 9.12 (Lc 70)  | 5.79 (Lc 77)   | 9.20 (Lc 70)  |
| control border / background (3.0)                                     | 3.52 (Lc 59)   | 4.03 (Lc 30)  | 3.43 (Lc 57)  | 3.90 (Lc 29)  | 3.52 (Lc 59)   | 3.81 (Lc 28)  |
| control border / surface (3.0)                                        | 3.81 (Lc 64)   | 3.54 (Lc 28)  | 3.79 (Lc 64)  | 3.42 (Lc 27)  | 3.82 (Lc 65)   | 3.34 (Lc 27)  |
| link vs ink (info: why links are underlined)                          | 1.98 (Lc 12)   | 1.44 (Lc 19)  | 1.77 (Lc 10)  | 1.47 (Lc 20)  | 1.99 (Lc 13)   | 1.46 (Lc 20)  |

**Dark mode, cross-checked with APCA.** Every dark pair passes WCAG, but primary and accent sit at Lc 46–66 and muted ink at Lc 62–64. In dark mode, set **body copy in ink** (Lc 91–93), keep muted ink for secondary text ≥16px, and use primary/accent for headings, UI and text ≥18px.

### Colour-blind separation (ΔE_OK × 100; a just-noticeable difference is about 2)

| primary ↔ accent | normal | deuteranopia | protanopia | tritanopia |
| ---------------- | ------ | ------------ | ---------- | ---------- |
| A light          | 27.7   | 25.2         | 17.0       | 30.1       |
| A dark           | 19.5   | 15.2         | 17.4       | 24.0       |
| B light          | 24.2   | 19.1         | 10.2       | 28.6       |
| B dark           | 20.2   | 17.8         | 11.4       | 21.9       |
| C light          | 22.9   | 19.0         | 10.0       | 26.9       |
| C dark           | 21.5   | 15.1         | 21.8       | 24.7       |

Every palette keeps primary and accent at ΔE_OK ≥ 10 under all three simulated dichromacies. Even so, never encode state by hue alone.

---

## Do / Don't

**Do**

- Use the full arch for 1–3 framing moments: portrait, hero, section header. Use 4–8px radii elsewhere and straight stitch rules for sturdiness.
- Keep layout prototypical: standard nav, clear H1–H3, and case studies in problem → role → method → outcome order.
- Define tokens in `oklch()` and generate ramps with a lightness curve plus a hue shift. Verify contrast at the _semantic token_ layer, as `app.css` already does.
- Meet WCAG 2.2 AA (4.5 / 3 / 3), add AAA-style 2px focus rings, and underline links.
- Separate any two meaningful colours by lightness, and test them under deuteranopia and protanopia.
- Pair the warm earth tones with one cool voice (indigo, sky, teal or night-purple) for links and focus.
- Set body at about 18px, line-height about 1.6 and 60–70ch, with Fraunces (SOFT up) for display.
- Bake texture into small tiles at low opacity, and drop it under `prefers-contrast: more`.

**Don't**

- Don't claim "curves make visitors trust you". The evidence covers liking images, not behaviour.
- Don't round everything into pills or arch every card. It reads juvenile and wastes space.
- Don't use pure black dark mode or full-saturation accents on dark grounds.
- Don't cite APCA as compliance, or the 60-30-10 rule or colour psychology as evidence.
- Don't put grain, halftone or wood-accent fills behind small text.
- Don't use pixel or script fonts for body, links or anything under 20px.
- Don't let a seasonal or "fun" mode change contrast without re-running the checks.

---

## References

1. Bar, M., & Neta, M. (2006). Humans prefer curved visual objects. _Psychological Science, 17_(8), 645–648. https://doi.org/10.1111/j.1467-9280.2006.01759.x
2. Vartanian, O., et al. (2013). Impact of contour on aesthetic judgments and approach-avoidance decisions in architecture. _PNAS, 110_(Suppl. 2), 10446–10453. https://doi.org/10.1073/pnas.1301227110
3. Gómez-Puerto, G., Munar, E., & Nadal, M. (2016). Preference for curvature: A historical and conceptual framework. _Frontiers in Human Neuroscience, 9_, 712. https://doi.org/10.3389/fnhum.2015.00712
4. Chuquichambi, E. G., Vartanian, O., Skov, M., Corradi, G. B., Nadal, M., Silvia, P. J., & Munar, E. (2022). How universal is preference for visual curvature? A systematic review and meta-analysis. _Annals of the New York Academy of Sciences, 1518_, 151–165. https://pmc.ncbi.nlm.nih.gov/articles/PMC10091794/
5. Gómez-Puerto, G., Rosselló, J., Corradi, G., Acedo-Carmona, C., Munar, E., & Nadal, M. (2018). Preference for curved contours across cultures. _Psychology of Aesthetics, Creativity, and the Arts, 12_(4), 432–439. https://doi.org/10.1037/aca0000135
6. Bertamini, M., Palumbo, L., Gheorghes, T. N., & Galatsidas, M. (2016). Do observers like curvature or do they dislike angularity? _British Journal of Psychology, 107_(1), 154–178. https://pmc.ncbi.nlm.nih.gov/articles/PMC4975689/
7. Tawil, N., Sztuka, I. M., Pohlmann, K., Sudimac, S., & Kühn, S. (2021). The living space: Psychological well-being and mental health in response to interiors presented in virtual reality. _IJERPH, 18_(23), 12510. https://doi.org/10.3390/ijerph182312510
8. Tawil, N., Ascone, L., & Kühn, S. (2022). The contour effect: Differences in the aesthetic preference and stress response to photo-realistic living environments. _Frontiers in Psychology, 13_, 933344. https://doi.org/10.3389/fpsyg.2022.933344
9. Palumbo, L., Rampone, G., Bertamini, M., Sinico, M., Clarke, E., & Vartanian, O. (2020). Visual preference for abstract curvature and for interior spaces: Beyond undergraduate student samples. _Psychology of Aesthetics, Creativity, and the Arts_. https://hira.hope.ac.uk/id/eprint/3220/
10. Jiang, Y., Gorn, G. J., Galli, M., & Chattopadhyay, A. (2016). Does your company have the right logo? How and why circular- and angular-logo shapes influence brand attribute judgments. _Journal of Consumer Research, 42_(5), 709–726. https://doi.org/10.1093/jcr/ucv049
11. Browning, W. D., Ryan, C. O., & Clancy, J. O. (2014). _14 Patterns of Biophilic Design_. Terrapin Bright Green. https://www.terrapinbrightgreen.com/reports/14-patterns/ (quick-reference definitions: https://biophilicdesign.umn.edu/frameworks)
12. Dosen, A. S., & Ostwald, M. J. (2016). Evidence for prospect-refuge theory: A meta-analysis of the findings of environmental preference research. _City, Territory and Architecture, 3_, 4. https://doi.org/10.1186/s40410-016-0033-1
13. Berman, M. G., Jonides, J., & Kaplan, S. (2008). The cognitive benefits of interacting with nature. _Psychological Science, 19_(12), 1207–1212. https://doi.org/10.1111/j.1467-9280.2008.02225.x
14. Kurosu, M., & Kashimura, K. (1995). Apparent usability vs. inherent usability. _CHI '95 Conference Companion_. https://chi1995.chistatic.hosting.acm.org/proceedings/shortppr/mk_bdy.htm
15. Tractinsky, N., Katz, A. S., & Ikar, D. (2000). What is beautiful is usable. _Interacting with Computers, 13_(2), 127–145. https://doi.org/10.1016/S0953-5438(00)00031-X
16. Tuch, A. N., Roth, S. P., Hornbæk, K., Opwis, K., & Bargas-Avila, J. A. (2012). Is beautiful really usable? Toward understanding the relation between usability, aesthetics, and affect in HCI. _Computers in Human Behavior, 28_(5), 1596–1607. https://research.google/pubs/is-beautiful-really-usable-toward-understanding-the-relation-between-usability-aesthetics-and-affect-in-hci/
17. Hassenzahl, M. (2004). The interplay of beauty, goodness, and usability in interactive products. _Human–Computer Interaction, 19_(4), 319–349. https://doi.org/10.1207/s15327051hci1904_2
18. Norman, D. A. (2004). _Emotional Design: Why We Love (or Hate) Everyday Things_. Basic Books. https://jnd.org/emotional-design-why-we-love-or-hate-everyday-things/
19. Lindgaard, G., Fernandes, G., Dudek, C., & Brown, J. (2006). Attention web designers: You have 50 milliseconds to make a good first impression! _Behaviour & Information Technology, 25_(2), 115–126. https://doi.org/10.1080/01449290500330448
20. Tuch, A. N., Presslaber, E. E., Stöcklin, M., Opwis, K., & Bargas-Avila, J. A. (2012). The role of visual complexity and prototypicality regarding first impression of websites. _International Journal of Human-Computer Studies, 70_(11), 794–811. https://research.google/pubs/pub38315/
21. Reinecke, K., Yeh, T., Miratrix, L., Mardiko, R., Zhao, Y., Liu, J., & Gajos, K. Z. (2013). Predicting users' first impressions of website aesthetics with a quantification of perceived visual complexity and colorfulness. _CHI '13_, 2049–2058. https://kgajos.seas.harvard.edu/papers/reinecke13aesthetics.pdf
22. Nielsen Norman Group. _5 Steps to Creating a UX-Design Portfolio_ (https://www.nngroup.com/articles/ux-design-portfolios/); _UX Portfolios: What Hiring Managers Look For_ (video; survey of 204 hiring managers) (https://www.nngroup.com/videos/ux-portfolios-hiring/); _Portfolios for UX Researchers: Top 10 Recommendations_ (https://www.nngroup.com/articles/ux-researcher-portfolio/).
23. The Ladders (2018). Eye-tracking study (industry report), via HR Dive. https://www.hrdive.com/news/eye-tracking-study-shows-recruiters-look-at-resumes-for-7-seconds/541582/
24. W3C (2023, updated). _Web Content Accessibility Guidelines (WCAG) 2.2_, W3C Recommendation, with Understanding documents for SC 1.4.1, 1.4.3, 1.4.11, 2.4.7, 2.4.11 and 2.4.13. https://www.w3.org/TR/WCAG22/
25. W3C (2026). _W3C Accessibility Guidelines (WCAG) 3.0_, Working Draft, 10 September 2026. https://www.w3.org/TR/wcag-3.0/ Also Roselli, A. (2026). _WCAG3 Contrast as of April 2026_. https://adrianroselli.com/2026/04/wcag3-contrast-as-of-april-2026.html
26. Somers, A. (Myndex). _APCA introduction_ and _apca-w3_. https://github.com/Myndex/apca-introduction · https://github.com/Myndex/apca-w3
27. Ottosson, B. (2020). _A perceptual color space for image processing_ (Oklab). https://bottosson.github.io/posts/oklab/ Also W3C, _CSS Color Module Level 4_. https://www.w3.org/TR/css-color-4/
28. Sitnik, A., & Turner, T. (2022, updated 2023). _OKLCH in CSS: Why we moved from RGB and HSL_. Evil Martians. https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl
29. Tailwind Labs (2025). _Tailwind CSS v4.0_ ("Modernized P3 color palette"). https://tailwindcss.com/blog/tailwindcss-v4 · https://tailwindcss.com/docs/colors
30. Google. _Material Design 2: Dark theme_. https://m2.material.io/design/color/dark-theme.html
31. Budiu, R. (2020). _Dark Mode vs. Light Mode: Which Is Better?_ Nielsen Norman Group. https://www.nngroup.com/articles/dark-mode/
32. Machado, G. M., Oliveira, M. M., & Fernandes, L. A. F. (2009). A physiologically-based model for simulation of color vision deficiency. _IEEE TVCG, 15_(6), 1291–1298. https://doi.org/10.1109/TVCG.2009.113
33. Elliot, A. J., & Maier, M. A. (2014). Color psychology: Effects of perceiving color on psychological functioning in humans. _Annual Review of Psychology, 65_, 95–120. https://doi.org/10.1146/annurev-psych-010213-115035
34. Labrecque, L. I., & Milne, G. R. (2012). Exciting red and competent blue: The importance of color in marketing. _Journal of the Academy of Marketing Science, 40_(5), 711–727. https://doi.org/10.1007/s11747-010-0245-y
35. Jonauskaite, D., et al. (2020). Universal patterns in color-emotion associations are further shaped by linguistic and geographic proximity. _Psychological Science, 31_(10), 1245–1260. https://doi.org/10.1177/0956797620948810
36. Gnambs, T. (2020). Limited evidence for the effect of red color on cognitive performance: A meta-analysis. _Psychonomic Bulletin & Review, 27_, 1374–1382. https://link.springer.com/article/10.3758/s13423-020-01772-1
37. Schlitter, R. (2018). _Pixelblog 1: Color Palettes_. Slynyrd. https://www.slynyrd.com/blog/2018/1/10/pixelblog-1-color-palettes
38. Rello, L., Pielot, M., & Marcos, M.-C. (2016). Make it big! The effect of font size and line spacing on online readability. _CHI '16_, 3637–3648. https://doi.org/10.1145/2858036.2858204
39. Dyson, M. C., & Kipping, G. J. (1998). The effects of line length and method of movement on patterns of reading from screen. _Visible Language, 32_(2). https://journals.uc.edu/index.php/vl/article/view/5671
40. Baymard Institute. _Readability: The Optimal Line Length_. https://baymard.com/blog/line-length-readability
41. Undercase Type (Charles, P., & Zimbardi, F.). _Fraunces_. Google Fonts. https://fonts.google.com/specimen/Fraunces/about · https://design.google/library/wonky-goofy-fraunces-typeface/
42. Braille Institute (2025). _Atkinson Hyperlegible Next_. https://fontsource.org/fonts/atkinson-hyperlegible-next/about
43. U.S. Web Design System. _Public Sans_. https://fontsource.org/fonts/public-sans/about
44. Astigmatic. _Ultra_. Google Fonts. https://fonts.google.com/specimen/Ultra/about
45. MDN Web Docs. _outline_ (browser compatibility: outline follows border-radius). https://developer.mozilla.org/en-US/docs/Web/CSS/outline
46. W3C. _Media Queries Level 5_ (`prefers-contrast`, `forced-colors`). https://www.w3.org/TR/mediaqueries-5/
47. Flags of the World. _United States_ (colour specifications; Pantone and hex equivalents vary by source). https://crwflags.com/fotw/flags/us.html
48. Birch, J. (2012). Worldwide prevalence of red-green color deficiency. _Journal of the Optical Society of America A, 29_(3), 313–320. https://doi.org/10.1364/JOSAA.29.000313
