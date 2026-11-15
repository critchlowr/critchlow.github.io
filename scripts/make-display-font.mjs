// Cuts the heading font used on the main page from the full Bricolage Grotesque
// family: width pinned at 75, optical size 60, weights 600 to 800, basic Latin only.
//
// Not part of the build. To rerun it, install the two packages it needs first:
//   npm install --no-save subset-font @fontsource-variable/bricolage-grotesque
//   node scripts/make-display-font.mjs \
//     node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-standard-normal.woff2 \
//     src/lib/assets/fonts/bricolage-grotesque-condensed.woff2
import subsetFont from 'subset-font';
import fs from 'node:fs';
const [src, out] = process.argv.slice(2);
let text = '';
for (let c = 0x20; c <= 0x7e; c++) text += String.fromCharCode(c);
text += 'éöü–—’‘“”&';
const buf = await subsetFont(fs.readFileSync(src), text, {
	targetFormat: 'woff2',
	variationAxes: { wdth: 75, opsz: 60, wght: { min: 600, max: 800 } }
});
fs.writeFileSync(out, buf);
console.log(out, buf.length);
