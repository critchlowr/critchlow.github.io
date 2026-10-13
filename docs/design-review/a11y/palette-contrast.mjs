// Contrast table for a palette's text/background pairs.
//
//   node palette-contrast.mjs palettes.json
//
// palettes.json: { "<palette>": { "<mode>": { "tokens": {name: hex}, "pairs": [[fg, bg, kind]] } } }
// kind is "text" (4.5:1), "large" (3:1, 24px+ or 18.66px+ bold) or "ui" (3:1, WCAG 1.4.11).
//
// WCAG 2.2 ratio is the pass/fail test (it is what the law and audits use in 2026).
// APCA Lc is printed alongside as a perceptual cross-check: it is not normative, but
// it catches dark-mode pairs that pass 2.x on paper and still read poorly.

import { readFileSync } from 'node:fs';

const hexToRgb = (hex) => {
	const h = hex.replace('#', '');
	const v =
		h.length === 3
			? h
					.split('')
					.map((c) => c + c)
					.join('')
			: h;
	return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255);
};

const wcagLum = (rgb) =>
	rgb
		.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
		.reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0);

export const wcag = (fg, bg) => {
	const [a, b] = [wcagLum(hexToRgb(fg)), wcagLum(hexToRgb(bg))].sort((x, y) => y - x);
	return (a + 0.05) / (b + 0.05);
};

// APCA-W3 0.0.98G-4g
export const apca = (fg, bg) => {
	const y = (hex) => {
		const [r, g, b] = hexToRgb(hex);
		let Y = 0.2126729 * r ** 2.4 + 0.7151522 * g ** 2.4 + 0.072175 * b ** 2.4;
		if (Y < 0.022) Y += (0.022 - Y) ** 1.414;
		return Y;
	};
	const [txt, bgY] = [y(fg), y(bg)];
	if (Math.abs(bgY - txt) < 0.0005) return 0;
	let out;
	if (bgY > txt) {
		const s = (bgY ** 0.56 - txt ** 0.57) * 1.14;
		out = s < 0.1 ? 0 : s - 0.027;
	} else {
		const s = (bgY ** 0.65 - txt ** 0.62) * 1.14;
		out = s > -0.1 ? 0 : s + 0.027;
	}
	return out * 100;
};

const NEED = { text: 4.5, large: 3, ui: 3 };

if (import.meta.url === `file://${process.argv[1]}`) {
	const spec = JSON.parse(readFileSync(process.argv[2], 'utf8'));
	let fails = 0;
	for (const [palette, modes] of Object.entries(spec)) {
		for (const [mode, { tokens, pairs }] of Object.entries(modes)) {
			console.log(`\n${palette} — ${mode}`);
			console.log(
				'  fg'.padEnd(20) + 'bg'.padEnd(16) + 'kind'.padEnd(7) + 'WCAG'.padEnd(9) + 'APCA Lc'
			);
			for (const [fg, bg, kind = 'text'] of pairs) {
				const f = tokens[fg] ?? fg;
				const b = tokens[bg] ?? bg;
				const r = wcag(f, b);
				const lc = Math.abs(apca(f, b));
				const ok = r >= NEED[kind];
				if (!ok) fails++;
				console.log(
					`  ${fg.padEnd(18)}${bg.padEnd(16)}${kind.padEnd(7)}${(r.toFixed(2) + ':1').padEnd(9)}${lc.toFixed(0).padStart(3)}${ok ? '' : '   ✗ FAIL'}`
				);
			}
		}
	}
	console.log(fails ? `\n${fails} pair(s) fail WCAG 2.2 AA` : '\nAll pairs pass WCAG 2.2 AA');
	process.exit(fails ? 1 : 0);
}
