# Job card illustrations

The hand-drawn stickers on the Experience cards (`static/illustrations/`) are generated, not hand-edited:

- `lib.mjs` turns simple shapes into slightly wobbly, rounded ink lines, so everything looks drawn by the same hand. Parts drawn inside `group(name, fn)` can be exported on their own, cropped to their bounds.
- `scenes.mjs` draws three still lifes: the bar (Redlight), the circular saw and lumber (Bespoke Construction), and the workbench (Atlas Woodworks). Each object is a named group.

The live site uses the single objects as stickers. To regenerate them from the repo root:

```sh
node docs/design-review/illustrations/scenes.mjs --icons static/illustrations
```

Add `--scenes <dir>` to also write the full still lifes (the Hybrid mockup uses those).

Colors live in the `C` object at the top of `scenes.mjs`. Where each sticker sits on each card (edge, position, tilt, size) is in `src/lib/components/ui/JobStickers.svelte`. Stickers overlap a card by at most 14 px, inside its 24 px padding, so they can't cover text.
