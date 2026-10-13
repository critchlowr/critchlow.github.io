# Job card illustrations

The three hand-drawn scenes on the Experience cards (`static/illustrations/`) are generated, not hand-edited:

- `lib.mjs` turns simple shapes into slightly wobbly, rounded ink lines, so everything looks drawn by the same hand.
- `scenes.mjs` composes the bar (Redlight), the circular saw (Bespoke Construction) and the workbench (Atlas Woodworks).

To change one, edit `scenes.mjs` and regenerate from the repo root:

```sh
node docs/design-review/illustrations/scenes.mjs static/illustrations
```

Colors live in the `C` object at the top of `scenes.mjs`. The art uses the same colors in light and dark mode, like stickers.
