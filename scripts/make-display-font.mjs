// Cuts the heading font from the full Gabarito family: weights 600 to 800, basic
// Latin only.
//
// Not part of the build. To rerun it, install the two packages it needs first:
//   npm install --no-save subset-font @fontsource-variable/gabarito
//   node scripts/make-display-font.mjs \
//     node_modules/@fontsource-variable/gabarito/files/gabarito-latin-wght-normal.woff2 \
//     src/lib/assets/fonts/gabarito-display.woff2
import subsetFont from 'subset-font';
import fs from 'node:fs';
const [src, out] = process.argv.slice(2);
let text = '';
for (let c = 0x20; c <= 0x7e; c++) text += String.fromCharCode(c);
text += 'éöü–—’‘“”&';
const buf = await subsetFont(fs.readFileSync(src), text, {
	targetFormat: 'woff2',
	variationAxes: { wght: { min: 600, max: 800 } }
});
fs.writeFileSync(out, buf);
console.log(out, buf.length);
