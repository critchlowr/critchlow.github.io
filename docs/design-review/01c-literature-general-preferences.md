# 01c · Literature review: what people generally prefer, and what performs

_Scope: general-population evidence on colour, light and dark mode, layout, portfolio reading, type and motion, with the owner's own tastes deliberately set aside. Builds on 01b (curvature, aesthetic-usability, Lindgaard, Tuch, Reinecke 2013, WCAG vs APCA) and 03. Compiled 2026-10-13. Evidence labels follow 01b: **strong** (systematic review, replicated, or W3C normative), **moderate** (peer-reviewed, one to a few studies), **weak** (practitioner, industry, vendor or poll data)._

> **How the sources were checked.** Full-text retrieval was blocked in this session, so every source was checked through its abstract or search-indexed excerpts, not read in full. **◊** marks a detail confirmed only from a secondary summary, not the abstract; treat it as provisional.

## Executive summary

1. **Blue is the safest accent hue.** It peaks in lab preference curves and tops favourite-colour polls in all 10 countries YouGov sampled. The least-liked region is **dark yellow to dark orange: olive and brown** [1–5]. Strong in industrialised samples, not universal [3].
2. **Use one hue family with strong lightness contrast.** Similar-hue pairs are rated more harmonious and more preferred; strongly contrasting hue pairs are rated neither [9].
3. **Keep complexity low and colourfulness low to moderate.** Complexity matters more than colourfulness, and higher education lowers preferred colourfulness, which likely describes most hiring readers [10, 19].
4. **Default to light mode, follow the OS setting, offer a toggle.** Dark-on-light wins acuity and proofreading at every age tested, most for small text; about a third of users say they prefer dark [14–18].
5. **Keep the structure conventional:** name top-left linking home, nav across the top, contact in nav and footer. Objects in typical places are found faster [22–27].
6. **Write for the "layer-cake" scan** (heading to heading). About 57% of viewing time is above the fold and 74% in the first two screens, so role, proof and contact go there [28–30].
7. **Hiring readers skim for role, process and outcomes.** The "6–7 seconds" figures measure résumé triage in industry studies, not portfolio review (**weak**) [37–40].
8. **Type size and familiarity matter more than serif vs sans.** There is no reliable serif/sans difference on screen; larger body text helps; unusual letterforms are disliked [41–50].
9. **Keep motion quiet.** Any motion pulls attention, scroll-triggered text delays readers, and parallax adds "fun" but no usability [51–53].
10. **The evidence-based default is a white, near-black and blue site with one familiar sans**, a long way from the owner's earth-tone, arch and game aesthetic (last section).

---

## 1. Colour preference (general population)

**Single colours**

- **Palmer & Schloss (2010)** [1]: 48 US adults rated 32 colours (8 hues × saturated, light, muted, dark). **Moderate–strong.**
  - Preference peaks at **saturated blue**; cool beats warm and saturated beats desaturated.
  - **Dark orange (brown)** and especially **dark yellow (olive)** fall sharply below lighter oranges and yellows; the minimum is around dark yellow-green [6]. ◊ Dark reds and greens do slightly _better_ than their muted versions, so "dark is disliked" applies mainly to yellows and oranges [6].
  - Feelings about each colour's objects (sky, water vs faeces, rot) explained 80% of the variance.
- **Limits.** A UK replication explained 66% [2]; among the Himba of Namibia none of the "universal" patterns held [3]. Say "broadly shared in industrialised samples", not "universal".
- **Hurlbert & Ling (2007)** [4]: ◊ about 200 British adults plus a small Chinese group, fast paired choices. Both sexes prefer bluish hues; women shift toward reddish-purple. **Moderate.**
- **YouGov (2015)** [5]: blue first in all 10 countries, 23% (Indonesia) to 33% (Britain), 8–18 points ahead; second place varied. **Weak–moderate** (a poll of colour names).
- **Jonauskaite et al.** Blue is the common favourite of both sexes in Swiss children and adults [8], but favourites shift with the object (more chromatic in general, lighter for walls, darker for t-shirts; n = 88) [7], so swatch preference does not transfer one-to-one to a website. **Moderate.** No newer large-sample peer-reviewed study turned up; the 2023–24 "Ipsos/CMG" blue figures exist only in blogs.

**Combinations.** Schloss & Palmer (2011) [9]: pair preference and harmony both rise with **hue similarity**; preference depends more on how much each colour is liked and on **lightness contrast**; highly contrastive hue pairs are "neither preferable nor harmonious"; a small _figure_ is liked more when its hue contrasts with its ground. **Moderate.**

**Websites**

- **Reinecke & Gajos (2014)** [10], 2.4 M ratings from ~40,000 people: complexity mattered more than colourfulness; low complexity was widely accepted and high complexity disliked; women liked colourful sites more (◊ but homogeneous schemes without stark contrasts [11]); higher education lowered the preference for colourfulness. An "over-40s prefer colour" claim could not be verified. **Moderate–strong.**
- **Hall & Hanna (2004)** [12], n = 136: higher contrast read better; chromatic schemes (blue among them) earned higher aesthetic ratings and purchase intention; ◊ black-on-white was rated most "professional". **Moderate.**
- **Cyr et al. (2010)** [13]: colour appeal predicted trust and satisfaction, with cultural differences. **Moderate** (abstract only).

**So a broadly liked palette is:** a white or neutral near-white ground (not cream); near-black, faintly cool ink; **one blue accent**, fairly saturated (OKLCH chroma ≈ 0.2) and dark enough for 4.5:1, desaturated in dark mode; neutrals tinted toward that blue; colour on ≤10% of the area; no large areas of brown, olive or mustard.

## 2. Light vs dark mode

- **Performance.** Dark-on-light won acuity and proofreading in younger (18–33) and older (60–85) adults [14], and the advantage grows as text shrinks, via higher luminance and smaller pupils [15]. **Moderate–strong** (one consistent lab series; eye disease excluded). NN/g: light is better for typical vision; dark may help people with cataract [16].
- **Individual differences.** On chart tasks (n = 134) the better polarity varied by person (~36% time differences), not by age, and often was not the one people preferred [17]. **Moderate.**
- **What users choose.** Roughly a third each say dark, light or both (◊ n = 115); users treat it as a system setting and barely noticed sites without it; NN/g recommends mirroring the OS [18]. "82% use dark mode" figures come from self-selected polls (**weak**).
- **Default:** light, switching on `prefers-color-scheme`, plus a toggle. In dark mode, body copy stays in ink.

## 3. Layout conventions that perform

- **Prototypicality and complexity (strong, convergent).** Low complexity plus high prototypicality is most appealing, visible at 17 ms [19]. Fluency explains why: easier processing feels like beauty [20]. Perceived aesthetics splits into simplicity, diversity, colourfulness and **craftsmanship** [21], so distinctiveness should come from craft, not structural novelty.
- **Where things go (moderate–strong).** People who built pages (n = 516) placed common objects consistently across gender and expertise [22]; in eye-tracking (n = 40), typically placed objects were found faster with fewer fixations, especially non-salient ones [23]. NN/g: ◊ left logos are recalled 39% vs 21% for right logos, and 4% vs 24% fail to reach home in one click (left vs centred) [24]; users look for contact top-right or in the footer [25]; 80% of fixations land on the left half [26]. Jakob's Law summarises it [27].
- **Scanning (moderate).** The F-pattern is a failure mode of unformatted text [28]; descriptive headings produce the layer-cake pattern [29].
- **The fold (moderate).** ~57% of viewing time above the fold, 74% in the first two screens (2018: 120 people, 130,000 fixations), down from 80% above the fold in 2010 [30].
- **Whitespace (weak–moderate).** Margins improved reading speed and comprehension; leading changed preference, not performance [31]. Group with space before borders [32]. **Dubious statistic:** "white space increases comprehension by almost 20%" is pinned on "Lin 2004", whose abstract covers 24 older adults, presentation media and hypertext topology, not white space [33]. Don't repeat it.
- **Photos and faces (moderate).** Users scrutinise informative images and real people, ignore generic stock, and want to see the person on personal sites; label the photo [34]. Faces looking _toward_ content raise attention to it; faces looking at the viewer pull attention away [35].
- **Cards vs lists (weak–moderate).** Cards suit heterogeneous, browsable items; homogeneous items work better as a compact vertical list [36].

## 4. Portfolio-specific conventions

- **NN/g, 204 hiring managers** [37]: they want process, role and constraints, not just polished artefacts; they rarely read word for word; show 3–5 deep case studies in plain language. Researcher guidance adds: quantify impact, state your role, admit constraints [38]. **Moderate**; the audience was UX hiring, so transfer to analyst roles is plausible but untested.
- **Speed data (weak).** Ladders: a 7.4 s initial résumé screen (6 s in 2012), favouring clear sectioned layouts; industry, sample unstated, résumés not portfolios [39]. A vendor reports ~55 s per interview decision (16 managers, 243 applications) ◊ [40]. Implication: the first screen answers _who, what role, what proof_ in seconds, then rewards the few who read on.
- **Case-study order:** problem → role → approach → outcome with numbers → constraints and what you'd change [37, 38].
- **Contact** in the top nav (right), the hero CTA and the footer, with the email as visible text [25].

## 5. Typography

- **Serif vs sans: no difference (strong).** A review of ~140 years of paper and 50 years of screen research found no difference in legibility, clarity or comfort [41]. Arditi & Cho saw a slight threshold gain from 5% serifs, attributed to spacing, and no reading-speed effect, with only 6 participants [42]; Bernard et al. found no legibility differences among popular web fonts ◊ [43].
- **Size (moderate).** Readability and comprehension improved with size; the authors recommend "18 points" or more, and line spacing mattered only at the 0.8 and 1.8 extremes (n = 104) [44]. ◊ The unit is ambiguous (18 CSS pt = 24px), so treat 18px as a floor.
- **Line length (moderate).** ~55 characters per line read effectively and was rated easiest [45]; 95 was read faster [46]; people prefer moderate, so use 60–75.
- **Familiarity (moderate).** Exposure sped reading within 20 minutes, and uncommon letter shapes were _disliked_, though not slower [47]. Each reader's fastest and slowest of 16 fonts differed by 35%, the best font was idiosyncratic, and preference did not predict speed (n = 352) [48]. Instructions in a hard-to-read script were judged nearly twice as effortful (15.1 vs 8.2 min), small n and unreplicated [49].
- **How many typefaces:** no controlled study; "one or two" is practitioner lore (**weak**). Font personality follows the family, and script and display faces read as casual [50] (**weak–moderate**).

## 6. Motion and decoration

- Motion pulls attention whether or not it means anything; use it for feedback and state. Scroll-triggered text reveals slowed participants [51, 52].
- Parallax (n = 86) was rated more fun, with no usability or satisfaction gain; two participants felt motion-sick [53]. **Moderate.**
- Decoration adds complexity (§3). Craftsmanship is the facet that delivers delight without it [21].

---

## Evidence-based default design brief

### Home page, top to bottom

1. **Skip link, then header.** Name as a wordmark top-left, linking home. Right: _Work · Experience · About · Contact_ plus _Résumé_. Mobile: name plus "Menu". Not centred.
2. **Hero**, fitting the first viewport at 1366×768 and 390×844: H1 name; a one-line role ("Product & business analyst · HCI and accessibility research"); one sentence of value; three proof points (numbers or credentials); _Email me_ (primary) and _Résumé (PDF)_ (secondary); a real, recent, labelled headshot looking toward the text. No image behind text.
3. **Selected work.** 3–4 cards in one template: informative thumbnail, title, one-line outcome with a number, role, methods. Two columns on desktop, one on mobile.
4. **Experience.** A reverse-chronological _list_: title, organisation, dates, 2–3 outcome bullets.
5. **Research and publications.** A list with venue, year and link.
6. **About.** 80–120 words; skills as a grouped text list.
7. **Contact.** Email as visible text with a copy button, LinkedIn, résumé, time zone, availability.
8. **Footer.** Repeat contact and résumé.

**Case-study template:** title → one-line outcome → summary box (role, team, timeline, methods, outcome metrics) → Problem → Constraints → Approach (2–4 captioned artefacts) → Outcome (numbers) → Reflection → next case. A descriptive H2 every 150–300 words.

### Palette

| Role         | Light                                | Dark                                 |
| ------------ | ------------------------------------ | ------------------------------------ |
| ground       | `#ffffff` · `oklch(100% 0 0)`        | `#111418` · `oklch(19.0% 0.009 256)` |
| surface      | `#f4f6f9` · `oklch(97.2% 0.005 258)` | `#1b2029` · `oklch(24.3% 0.019 262)` |
| ink          | `#111827` · `oklch(21.0% 0.032 265)` | `#e6e9ef` · `oklch(93.3% 0.009 265)` |
| muted ink    | `#4b5563` · `oklch(44.6% 0.026 257)` | `#b0b9c6` · `oklch(78.3% 0.021 257)` |
| accent       | `#1d4ed8` · `oklch(48.8% 0.217 264)` | `#8ab4f8` · `oklch(76.6% 0.108 260)` |
| accent hover | `#1e3a8a` · `oklch(37.9% 0.138 266)` | `#b3cefb` · `oklch(84.7% 0.070 261)` |
| focus ring   | `#2563eb` · `oklch(54.6% 0.215 263)` | `#7fb0ff` · `oklch(75.5% 0.126 260)` |
| border       | `#7a8494` · `oklch(61.1% 0.027 260)` | `#6c7787` · `oklch(56.6% 0.028 258)` |

**Usage rules**

- **Accent** on ≤10% of the area: links (underlined, since accent vs ink is below 3:1), the primary button, key numbers, focus. Button labels are white in light mode and the ground colour in dark mode.
- **Focus ring:** 2px outline with a 2px offset; against an accent fill it is nearly invisible, so the offset does the work.
- **Cards that are controls** need the border (surface vs ground is ~1.1:1). Separate sections with space, not rules.
- **Dark mode:** body copy in ink; muted ink for metadata only.
- **No secondary accent.** The combination data argue against a co-equal second hue [9]. If charts later need categories, derive them separately and test for colour-vision deficiency.

**Contrast**, computed with `a11y/palette-contrast.mjs` (WCAG 2.2 is pass/fail [54]; APCA Lc is informative). All 28 pairs pass. In dark mode, accent text sits near Lc 60, so keep it to links and headings. The accent fill also clears 3:1 against ground, so buttons need no outline.

| Foreground                   | Background   | Kind (min) | Light: WCAG (APCA Lc) | Dark: WCAG (APCA Lc) |
| ---------------------------- | ------------ | ---------- | --------------------- | -------------------- |
| ink                          | ground       | text (4.5) | 17.74:1 (Lc 105)      | 15.18:1 (Lc 93)      |
| ink                          | surface      | text (4.5) | 16.39:1 (Lc 99)       | 13.43:1 (Lc 91)      |
| muted ink                    | ground       | text (4.5) | 7.56:1 (Lc 86)        | 9.32:1 (Lc 63)       |
| muted ink                    | surface      | text (4.5) | 6.98:1 (Lc 81)        | 8.25:1 (Lc 62)       |
| accent                       | ground       | text (4.5) | 6.70:1 (Lc 82)        | 8.76:1 (Lc 60)       |
| accent                       | surface      | text (4.5) | 6.19:1 (Lc 77)        | 7.75:1 (Lc 59)       |
| accent hover                 | ground       | text (4.5) | 10.36:1 (Lc 94)       | 11.55:1 (Lc 75)      |
| accent hover                 | surface      | text (4.5) | 9.57:1 (Lc 88)        | 10.22:1 (Lc 74)      |
| button label                 | accent       | text (4.5) | 6.70:1 (Lc 87)        | 8.76:1 (Lc 62)       |
| button label                 | accent hover | text (4.5) | 10.36:1 (Lc 98)       | 11.55:1 (Lc 76)      |
| focus ring                   | ground       | UI (3.0)   | 5.17:1 (Lc 75)        | 8.40:1 (Lc 58)       |
| focus ring                   | surface      | UI (3.0)   | 4.77:1 (Lc 69)        | 7.44:1 (Lc 57)       |
| border                       | ground       | UI (3.0)   | 3.78:1 (Lc 65)        | 4.07:1 (Lc 29)       |
| border                       | surface      | UI (3.0)   | 3.49:1 (Lc 60)        | 3.60:1 (Lc 28)       |
| _info:_ accent vs ink        | —            | —          | 2.65:1                | 1.73:1               |
| _info:_ focus ring vs accent | —            | —          | 1.30:1                | 1.04:1               |
| _info:_ surface vs ground    | —            | —          | 1.08:1                | 1.13:1               |

### Type

- **One familiar sans for everything:** the system UI stack (`system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`), which costs zero bytes and maximises familiarity, or one common grotesque (Inter, Source Sans 3, Public Sans). Headings in the same family at 600–700; mono for code only; two families at most.
- **Scale** (1.25): 14px metadata minimum · **18px body** · 22.5 · 28 · 35 · 44px desktop H1 (32px mobile). Line height 1.6 body, 1.2 headings. Measure 65ch, 75ch at most.

### Spacing and radius

- **Spacing** (4px base): 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96. Sections 64–96px desktop, 48px mobile; gutter 16px mobile, 24–32px tablet; container 1120px.
- **Radius:** 8px cards, 6px buttons and inputs, pills for tags only. No arches. One elevation cue (border _or_ subtle shadow).

### Motion

150–200 ms ease-out on colour and opacity for hover, focus and press; 200–250 ms for disclosures. No scroll-triggered text, parallax, autoplay or ambient loops. Under `prefers-reduced-motion: reduce`, drop transforms and smooth scrolling.

---

## Where this disagrees with the owner's stated tastes

- **Earth tones.** Brown and olive are the _least_-liked colours in the most-cited preference data [1, 2, 6]. The tuned "Almanac" palette (03 §6) puts five hues in play where the combination data favour one hue family [9]. Cream grounds aren't disliked as such, but white tested most readable and ◊ most professional [12]. In fairness, preferences shift with the object [7] and aren't universal [3], and walnut ink reads near-black: earth tones are a _risk_ to broad liking, not a proven penalty.
- **Arches.** Curvature preference is real but modest (g ≈ 0.39; 01b) and was measured on shapes, not page layouts. Arch-driven layouts lower prototypicality, which first impressions penalise [19]. Small radii are a low-risk nod to curvature, though untested as such.
- **Vintage Americana and Stardew Valley.** No general-population evidence favours either. Ornament adds complexity [10, 19], pixel and display faces read as casual [50], uncommon letterforms are disliked [47], and educated audiences prefer lower colourfulness [10]. These are identity signals for people who share the references: legitimate, but taste, not evidence.
- **Fraunces and Atkinson Hyperlegible Next (03's picks).** Not contradicted on legibility, since serif vs sans is a wash [41], but both have deliberately distinctive letterforms and the familiarity evidence mildly favours a common face [47–49] (**weak**).
- **Already aligned with 03:** light default, conventional navigation, proof first, restrained motion.

---

## References

1. Palmer, S. E., & Schloss, K. B. (2010). An ecological valence theory of human color preference. _PNAS, 107_(19), 8877–8882. https://doi.org/10.1073/pnas.0906172107
2. Taylor, C., & Franklin, A. (2012). The relationship between color–object associations and color preference: Further investigation of ecological valence theory. _Psychonomic Bulletin & Review_. https://link.springer.com/article/10.3758/s13423-012-0222-1
3. Taylor, C., Clifford, A., & Franklin, A. (2013). Color preferences are not universal. _Journal of Experimental Psychology: General, 142_(4). https://pubmed.ncbi.nlm.nih.gov/23148465/
4. Hurlbert, A. C., & Ling, Y. (2007). Biological components of sex differences in color preference. _Current Biology, 17_(16), R623–R625. https://doi.org/10.1016/j.cub.2007.06.022
5. YouGov (2015, 13 May). _Why is blue the world's favourite colour?_ https://yougov.com/en-gb/articles/12331-blue-worlds-favourite-colour
6. Palmer, S. E., & Schloss, K. B. (n.d.). Color preference. Entry in _Encyclopedia of Color Science and Technology_ (Springer). https://sites.socsci.uci.edu/~kjameson/ECST/Palmer_Schloss_ColorPreference.pdf
7. Jonauskaite, D., et al. (2016). Most and least preferred colours differ according to object context. _PLoS ONE_. https://pmc.ncbi.nlm.nih.gov/articles/PMC4811414/
8. Jonauskaite, D., et al. (2019). Pink for girls, red for boys, and blue for both genders. _Sex Roles_. https://doi.org/10.1007/s11199-018-0955-z
9. Schloss, K. B., & Palmer, S. E. (2011). Aesthetic response to color combinations: Preference, harmony, and similarity. _Attention, Perception, & Psychophysics, 73_(2), 551–571. https://doi.org/10.3758/s13414-010-0027-0
10. Reinecke, K., & Gajos, K. Z. (2014). Quantifying visual preferences around the world. _CHI '14_, 11–20. https://iis.seas.harvard.edu/papers/reinecke14visual.pdf
11. LabintheWild (2014). _Website preferences around the world_ (author summary). https://labinthewild.tumblr.com/post/80185104511/website-preferences-around-the-world
12. Hall, R. H., & Hanna, P. (2004). The impact of web page text-background colour combinations on readability, retention, aesthetics and behavioural intention. _Behaviour & Information Technology, 23_(3), 183–195. https://scholarsmine.mst.edu/bio_inftec_facwork/103
13. Cyr, D., Head, M., & Larios, H. (2010). Colour appeal in website design within and across cultures. _IJHCS, 68_(1–2), 1–21. https://doi.org/10.1016/j.ijhcs.2009.08.005
14. Piepenbrock, C., Mayr, S., Mund, I., & Buchner, A. (2013). Positive display polarity is advantageous for both younger and older adults. _Ergonomics, 56_(7). Record: https://documentacion.fundacionmapfre.org/documentacion/bib/143702.do
15. Piepenbrock, C., Mayr, S., & Buchner, A. (2014). Positive display polarity is particularly advantageous for small character sizes. _Human Factors, 56_(5), 942–951. Record: https://documentacion.fundacionmapfre.org/documentacion/bib/150136.do
16. Budiu, R. (2020). _Dark mode vs. light mode: Which is better?_ NN/g. https://www.nngroup.com/articles/dark-mode/
17. While, Z., & Sarvghad, A. (2024). Dark mode or light mode? Exploring the impact of contrast polarity on visualization performance between age groups. _IEEE VIS 2024_ (short paper). https://arxiv.org/abs/2409.10841
18. Kohler, T., & Zhang, A. (2023). _Dark mode: How users think about it and issues to avoid._ NN/g. https://www.nngroup.com/articles/dark-mode-users-issues/
19. Tuch, A. N., Presslaber, E. E., Stöcklin, M., Opwis, K., & Bargas-Avila, J. A. (2012). The role of visual complexity and prototypicality regarding first impression of websites. _IJHCS, 70_(11), 794–811. https://research.google/pubs/pub38315/
20. Reber, R., Schwarz, N., & Winkielman, P. (2004). Processing fluency and aesthetic pleasure. _Personality and Social Psychology Review, 8_(4), 364–382. https://pages.ucsd.edu/~pwinkielman/reber-schwarz-winkielman-beauty-PSPR-2004.pdf
21. Moshagen, M., & Thielsch, M. T. (2010). Facets of visual aesthetics. _IJHCS, 68_(10), 689–709. https://doi.org/10.1016/j.ijhcs.2010.05.006
22. Roth, S. P., Schmutz, P., Pauwels, S. L., Bargas-Avila, J. A., & Opwis, K. (2010). Mental models for web objects. _Interacting with Computers, 22_(2), 140–152. https://doi.org/10.1016/j.intcom.2009.10.004
23. Roth, S. P., Tuch, A. N., Mekler, E. D., Bargas-Avila, J. A., & Opwis, K. (2013). Location matters, especially for non-salient features. _IJHCS, 71_(3), 228–235. https://edoc.unibas.ch/25411/
24. Whitenton, K. (c. 2016). _Website logo placement for maximum brand recall._ NN/g. https://www.nngroup.com/articles/logo-placement-brand-recall/
25. Nielsen Norman Group. _"Contact Us" page guidelines._ https://www.nngroup.com/articles/contact-us-pages/
26. Nielsen Norman Group (updated study). _Horizontal attention leans left._ https://www.nngroup.com/articles/horizontal-attention-leans-left/
27. Nielsen, J. (2000; 2017 video). _Jakob's Law of Internet User Experience._ https://www.nngroup.com/videos/jakobs-law-internet-ux/
28. Pernice, K. (2017). _F-shaped pattern of reading on the web: Misunderstood, but still relevant._ NN/g. https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/
29. Pernice, K. (2019). _Text scanning patterns: Eyetracking evidence._ NN/g. https://www.nngroup.com/articles/text-scanning-patterns-eyetracking/
30. Fessenden, T. (2018). _Scrolling and attention._ NN/g. https://www.nngroup.com/articles/scrolling-and-attention/
31. Chaparro, B. S., Shaikh, A. D., & Baker, J. R. (2004). Reading online text: A comparison of four white space layouts. _Usability News, 6_(2). SURL, Wichita State. https://works.bepress.com/barbara-chaparro/
32. Nielsen Norman Group. _The principle of common region: Containers create groupings._ https://www.nngroup.com/articles/common-region/
33. Lin, D. Y. M. (2004). Evaluating older adults' retention in hypertext perusal: Impacts of presentation media as a function of text topology. _Computers in Human Behavior_. https://doi.org/10.1016/j.chb.2003.10.024
34. Nielsen, J. (2010). _Photos as web content._ NN/g. https://www.nngroup.com/articles/photos-as-web-content/
35. Sajjacholapunt, P., & Ball, L. J. (2014). The influence of banner advertisements on attention and memory: Human faces with averted gaze can enhance advertising effectiveness. _Frontiers in Psychology, 5_, 166. https://doi.org/10.3389/fpsyg.2014.00166
36. Laubheimer, P. (2016). _Cards: UI-component definition_; and _Card view vs. list view_ (video). NN/g. https://www.nngroup.com/articles/cards-component/ · https://www.nngroup.com/videos/card-view-vs-list-view/
37. Nielsen Norman Group. _5 steps to creating a UX-design portfolio_ (survey of 204 hiring managers). https://www.nngroup.com/articles/ux-design-portfolios/
38. Nielsen Norman Group. _Portfolios for UX researchers: Top 10 recommendations._ https://www.nngroup.com/articles/ux-researcher-portfolio/
39. The Ladders (2018). _Eye-tracking study_ (industry report), via HR Dive. https://www.hrdive.com/news/eye-tracking-study-shows-recruiters-look-at-resumes-for-7-seconds/541582/
40. Presentum (n.d.). _How they evaluate your portfolio and resume_ (vendor study). https://presentum.io/design/hiring-explained/evaluating-portfolio-and-resume
41. Richardson, J. T. E. (2022). _The legibility of serif and sans serif typefaces: Reading from paper and reading from screens._ Springer (open access). https://doi.org/10.1007/978-3-030-90984-0
42. Arditi, A., & Cho, J. (2005). Serifs and font legibility. _Vision Research, 45_(23), 2926–2933. https://doi.org/10.1016/j.visres.2005.06.013
43. Bernard, M., Mills, M., Peterson, M., & Storrer, K. (2001). A comparison of popular online fonts: Which is best and when? _Usability News_ (Summer 2001), SURL, Wichita State. Secondary citation: https://webaim.org/discussion/mail_message?id=369
44. Rello, L., Pielot, M., & Marcos, M.-C. (2016). Make it big! The effect of font size and line spacing on online readability. _CHI '16_, 3637–3648. https://doi.org/10.1145/2858036.2858204
45. Dyson, M. C., & Kipping, G. J. (1998). The effects of line length and method of movement on patterns of reading from screen. _Visible Language, 32_(2). https://journals.uc.edu/index.php/vl/article/view/5671 Also Dyson, M. C., & Haselgrove, M. (2001). _IJHCS, 54_, 585–612.
46. Shaikh, A. D., & Chaparro, B. S. (c. 2005). _The effects of line length on reading performance of online news articles._ https://portfolio.erau.edu/en/publications/the-effects-of-line-length-on-reading-performance-of-online-news-/
47. Beier, S., & Larson, K. (2013). How does typeface familiarity affect reading performance and reader preference? _Information Design Journal, 20_(1), 16–31. https://www.microsoft.com/en-us/research/?p=753289
48. Wallace, S., et al. (2022). Towards individuated reading experiences: Different fonts increase reading speed for different individuals. _ACM Transactions on Computer-Human Interaction_. https://doi.org/10.1145/3502222
49. Song, H., & Schwarz, N. (2008). If it's hard to read, it's hard to do. _Psychological Science, 19_(10), 986. https://www.psychologicalscience.org/news/releases/if-its-hard-to-read-its-hard-to-do-study-shows-difficult-to-read-instructions-decrease-motivation.html
50. Shaikh, A. D., Chaparro, B. S., & Fox, D. (2006). Perception of fonts: Perceived personality traits and uses. _Usability News_ (February 2006). https://portfolio.erau.edu/en/publications/perception-of-fonts-perceived-personality-traits-and-uses/
51. Nielsen Norman Group. _The role of animation and motion in UX._ https://www.nngroup.com/articles/animation-purpose-ux/
52. Nielsen Norman Group. _Scroll-triggered text animations delay users._ https://www.nngroup.com/articles/scroll-animations/
53. Frederick, D., Mohler, J., Vorvoreanu, M., & Glotzbach, R. (2015). The effects of parallax scrolling on user experience in web design. _Journal of Usability Studies_ (February 2015). https://uxpajournal.org/wp-content/uploads/sites/7/pdf/JUS_Frederick_Feb2015.pdf
54. W3C (2023). _Web Content Accessibility Guidelines (WCAG) 2.2._ https://www.w3.org/TR/WCAG22/
