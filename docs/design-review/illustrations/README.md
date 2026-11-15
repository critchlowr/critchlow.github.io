# Site illustrations

The hand-drawn objects under each job's dates and the still life in the hero (`static/illustrations/`) are generated, not hand-edited:

- `lib.mjs` turns simple shapes into slightly wobbly, rounded ink lines, so everything looks drawn by the same hand. Parts drawn inside `group(name, fn)` can be exported on their own, cropped to their bounds.
- `scenes.mjs` draws four still lifes: the bar (Redlight), the circular saw and lumber (Bespoke Construction), the workbench (Atlas Woodworks), plus the research tools (clipboard, sticky notes, pencil), the cartons and the plank for the hero's shelf. Each object is a named group.

The live site uses the single objects: in a row on the hero's shelf (`src/lib/components/ui/Shelf.svelte`) and under each job's dates. To regenerate them from the repo root:

```sh
node docs/design-review/illustrations/scenes.mjs --icons static/illustrations
```

Add `--scenes <dir>` to also write the other full still lifes (the Hybrid mockup uses those).

Colors live in the `C` object at the top of `scenes.mjs`. The size and tilt of each object under a job's dates is in `src/lib/components/ui/JobStickers.svelte`.
