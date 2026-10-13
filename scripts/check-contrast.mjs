#!/usr/bin/env node
/*
	Contrast regression test for the design system.

	app.css does not just define colours, it *claims* ratios: "accent-600 measured
	3.95:1 on the alt ground", "moss-700 5.58", "definition against the worst ground
	went 1.31 to 1.42". Those claims were true when written and there is nothing
	stopping the next ramp regeneration from quietly falsifying them — which is
	exactly how the -500 action fills and the 1.04:1 hover border got shipped the
	first time.

	So this asserts them. It resolves every --t-* semantic token through the ramps
	for both themes, then checks a curated pair list: the semantic layer, plus the
	ad hoc `text-x-N on bg-y-M` pairs in the warehouse simulator that bypass the
	token layer entirely. The simulator is the part no online checker can reach —
	it only exists after a click — so it is the part most likely to rot unseen.

	Curated, not N x N: most token pairs never meet on screen, and a report full of
	combinations nobody renders is a report nobody reads.
*/

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const css = await readFile(resolve(root, 'src/app.css'), 'utf8');

/* ---------- parse ---------- */

// Tailwind's stock blue is used (--t-action-neutral: var(--color-blue-700)) but
// never redefined in @theme, so it has to come from somewhere. These are v4's values.
const ramps = {
	'blue-100': '#dbeafe',
	'blue-300': '#93c5fd',
	'blue-700': '#1d4ed8',
	'blue-800': '#1e40af',
	'blue-900': '#1e3a8a'
};

for (const m of css.matchAll(/--color-([a-z]+)-(\d+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
	ramps[`${m[1]}-${m[2]}`] = m[3].toLowerCase();
}

function block(selector) {
	// Non-greedy to the first closing brace at column 0 — every :root block in this
	// file is top level, so this is sufficient and avoids a real CSS parser.
	const re = new RegExp(`^${selector.replace('.', '\\.')}\\s*\\{([\\s\\S]*?)^\\}`, 'm');
	const m = css.match(re);
	if (!m) throw new Error(`could not find CSS block for ${selector}`);
	return m[1];
}

function tokensFrom(text) {
	const out = {};
	for (const m of text.matchAll(/(--t-[a-z-]+):\s*([^;]+);/g)) out[m[1]] = m[2].trim();
	return out;
}

// :root appears more than once (tokens, then --nav-h, then html rules). Merge every
// top-level :root block so a token defined in a later one is not missed.
const rootText = [...css.matchAll(/^:root\s*\{([\s\S]*?)^\}/gm)].map((m) => m[1]).join('\n');
const light = tokensFrom(rootText);
const dark = { ...light, ...tokensFrom(block(':root.dark')) };

function resolve1(value, table) {
	let v = value.trim();
	for (let i = 0; i < 5; i++) {
		if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toLowerCase();
		const varMatch = v.match(/^var\((--[a-z0-9-]+)\)$/);
		if (!varMatch) break;
		const name = varMatch[1];
		if (name.startsWith('--color-')) {
			const hex = ramps[name.slice('--color-'.length)];
			if (!hex) throw new Error(`unknown ramp stop: ${name}`);
			return hex;
		}
		v = (table[name] ?? '').trim();
		if (!v) throw new Error(`unresolved token: ${name}`);
	}
	throw new Error(`could not resolve colour value: ${value}`);
}

/** Accepts "--t-ink", "warm-700", or "#ffffff". */
function colorOf(ref, theme) {
	if (ref.startsWith('#')) return ref.toLowerCase();
	if (ref.startsWith('--t-')) {
		const table = theme === 'dark' ? dark : light;
		const raw = table[ref];
		if (!raw) throw new Error(`token ${ref} not defined for ${theme}`);
		return resolve1(raw, table);
	}
	const hex = ramps[ref];
	if (!hex) throw new Error(`unknown ramp stop: ${ref}`);
	return hex;
}

/* ---------- WCAG maths ---------- */

function luminance(hex) {
	const ch = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
	const [r, g, b] = ch.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
	const [x, y] = [luminance(a), luminance(b)];
	return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/* ---------- the pair list ---------- */

// min: 4.5 body text | 3 large text (>=24px, or >=18.66px bold) and non-text/UI
const AA = 4.5;
const LARGE = 3;

/** @type {{name:string, fg:string, bg:string, min?:number, themes?:string[], note?:string}[]} */
const pairs = [
	// --- semantic layer, page grounds ---
	{ name: 'body ink on page', fg: '--t-ink', bg: '--t-surface' },
	{ name: 'muted ink on page', fg: '--t-ink-muted', bg: '--t-surface' },
	{ name: 'strong ink on page', fg: '--t-ink-strong', bg: '--t-surface' },
	{ name: 'body ink on card', fg: '--t-ink', bg: '--t-surface-raised' },
	{ name: 'muted ink on card', fg: '--t-ink-muted', bg: '--t-surface-raised' },
	{ name: 'strong ink on card', fg: '--t-ink-strong', bg: '--t-surface-raised' },
	// app.css:208-209 claims muted text measured 4.50:1 on the band, "right on the line"
	{ name: 'body ink on alt band', fg: '--t-ink', bg: '--t-band' },
	{ name: 'muted ink on alt band', fg: '--t-ink-muted', bg: '--t-band' },
	{ name: 'strong ink on alt band', fg: '--t-ink-strong', bg: '--t-band' },
	{ name: 'body ink on footer', fg: '--t-ink', bg: '--t-footer' },
	{ name: 'muted ink on footer', fg: '--t-ink-muted', bg: '--t-footer' },

	// --- brand and link, which carry real copy at body size ---
	// app.css:208 "brand carries company names at 16px, not just the big numerals"
	{ name: 'brand on page', fg: '--t-brand', bg: '--t-surface' },
	{ name: 'brand on card', fg: '--t-brand', bg: '--t-surface-raised' },
	{ name: 'brand on alt band', fg: '--t-brand', bg: '--t-band' },
	{ name: 'link on page', fg: '--t-link', bg: '--t-surface' },
	{ name: 'link on card', fg: '--t-link', bg: '--t-surface-raised' },
	{ name: 'link on alt band', fg: '--t-link', bg: '--t-band' },

	// --- action fills carrying white text (app.css:224-228 claims 5.86/5.58/6.34/6.70/6.13) ---
	{ name: 'white on action', fg: '#ffffff', bg: '--t-action' },
	{ name: 'white on action:hover', fg: '#ffffff', bg: '--t-action-hover' },
	{ name: 'white on action-go', fg: '#ffffff', bg: '--t-action-go' },
	{ name: 'white on action-go:hover', fg: '#ffffff', bg: '--t-action-go-hover' },
	{ name: 'white on action-warn', fg: '#ffffff', bg: '--t-action-warn' },
	{ name: 'white on action-warn:hover', fg: '#ffffff', bg: '--t-action-warn-hover' },
	{ name: 'white on action-neutral', fg: '#ffffff', bg: '--t-action-neutral' },
	{ name: 'white on action-neutral:hov', fg: '#ffffff', bg: '--t-action-neutral-hover' },
	{ name: 'white on action-ship', fg: '#ffffff', bg: '--t-action-ship' },
	{ name: 'white on action-ship:hover', fg: '#ffffff', bg: '--t-action-ship-hover' },

	// --- rail hover chip ---
	{ name: 'ink on rail chip', fg: '--t-ink', bg: '--t-chip' },
	{ name: 'strong ink on rail chip', fg: '--t-ink-strong', bg: '--t-chip' },

	// --- warehouse simulator: ad hoc ramp pairs that bypass the token layer ---
	// Modal panel ground is bg-warm-50 / dark:bg-warm-900 (WarehouseModal.svelte:65).
	{ name: 'sim: table header', fg: 'warm-700', bg: 'warm-50', themes: ['light'] },
	{ name: 'sim: table header', fg: 'warm-300', bg: 'warm-900', themes: ['dark'] },
	{ name: 'sim: location cell', fg: 'warm-700', bg: 'warm-50', themes: ['light'] },
	{ name: 'sim: location cell', fg: 'warm-300', bg: 'warm-900', themes: ['dark'] },
	{ name: 'sim: item / qty cell', fg: 'warm-700', bg: 'warm-50', themes: ['light'] },
	{ name: 'sim: item / qty cell', fg: 'warm-200', bg: 'warm-900', themes: ['dark'] },
	{ name: 'sim: zero-qty cell', fg: 'warm-700', bg: 'warm-50', themes: ['light'] },
	{ name: 'sim: zero-qty cell', fg: 'warm-300', bg: 'warm-900', themes: ['dark'] },
	{ name: 'sim: allocated qty', fg: 'accent-700', bg: 'warm-50', themes: ['light'] },
	{ name: 'sim: allocated qty', fg: 'accent-400', bg: 'warm-900', themes: ['dark'] },
	{ name: 'sim: inventory summary', fg: 'warm-700', bg: 'warm-50', themes: ['light'] },
	{ name: 'sim: inventory summary', fg: 'warm-300', bg: 'warm-900', themes: ['dark'] },

	/*
		The diorama in WarehouseScene. It is aria-hidden decoration, but it is
		visible text on a hard-coded tan floor, and 1.4.3 exempts only text that is
		invisible to everyone. These colours are literals in that component rather
		than tokens, which is exactly why they drifted to 2.2:1 unnoticed.
	*/
	{ name: 'scene: building sign', fg: '#5a3a1a', bg: '#d2b48c', themes: ['light'] },
	{ name: 'scene: building sign', fg: 'warm-300', bg: '#5a4a3a', themes: ['dark'] },
	{ name: 'scene: dock labels', fg: '#5a3a1a', bg: '#d2b48c', themes: ['light'] },
	{ name: 'scene: dock labels', fg: 'warm-300', bg: '#5a4a3a', themes: ['dark'] }
];

// StatusBadge.svelte maps every order status onto a `bg-X-100 text-X-700` pill
// (dark: `bg-X-900 text-X-300`) at text-xs, so 4.5:1 applies. Generated rather than
// listed so adding a status colour cannot skip the check.
for (const ramp of ['accent', 'moss', 'blue', 'plum', 'ember']) {
	pairs.push({
		name: `sim: ${ramp} status pill`,
		fg: `${ramp}-700`,
		bg: `${ramp}-100`,
		themes: ['light']
	});
	pairs.push({
		name: `sim: ${ramp} status pill`,
		fg: `${ramp}-300`,
		bg: `${ramp}-900`,
		themes: ['dark']
	});
}
pairs.push({ name: 'sim: neutral status pill', fg: 'warm-700', bg: 'warm-200', themes: ['light'] });
pairs.push({ name: 'sim: neutral status pill', fg: 'warm-200', bg: 'warm-700', themes: ['dark'] });

/* ---------- run ---------- */

const themes = ['light', 'dark'];
const rows = [];
let failed = 0;

for (const p of pairs) {
	for (const theme of p.themes ?? themes) {
		const fg = colorOf(p.fg, theme);
		const bg = colorOf(p.bg, theme);
		const ratio = contrast(fg, bg);
		const min = p.min ?? AA;
		const pass = ratio >= min;
		if (!pass) failed++;
		rows.push({ name: p.name, theme, fg, bg, ratio, min, pass });
	}
}

/*
	The focus indicator is checked differently, and this is the whole reason it is
	built as two tones. No single hue clears 3:1 against parchment bands, white
	cards, near-black grounds and saturated button fills at once — so the assertion
	is not "the ring passes" but "at least one of ring/halo passes on every ground
	the indicator can land on". That is the property the design actually relies on.
*/
const focusGrounds = [
	['page', '--t-surface'],
	['card', '--t-surface-raised'],
	['alt band', '--t-band'],
	['footer', '--t-footer'],
	['rail chip', '--t-chip'],
	['action fill', '--t-action'],
	['action-go fill', '--t-action-go'],
	['action-warn fill', '--t-action-warn'],
	['action-neutral fill', '--t-action-neutral'],
	['action-ship fill', '--t-action-ship']
];

const focusRows = [];
for (const theme of themes) {
	const ring = colorOf('--t-focus', theme);
	const halo = colorOf('--t-focus-halo', theme);
	for (const [label, token] of focusGrounds) {
		const bg = colorOf(token, theme);
		const best = Math.max(contrast(ring, bg), contrast(halo, bg));
		const pass = best >= LARGE;
		if (!pass) failed++;
		focusRows.push({ label, theme, bg, best, pass });
	}
}

/* ---------- report ---------- */

const pad = (s, n) => String(s).padEnd(n);
const num = (n, w) => n.toFixed(2).padStart(w);

console.log('\nContrast check — src/app.css semantic tokens + warehouse ad hoc pairs\n');
console.log(pad('pair', 30) + pad('theme', 7) + pad('fg', 10) + pad('bg', 10) + '  ratio   min  ');
console.log('-'.repeat(78));
for (const r of rows) {
	console.log(
		pad(r.name, 30) +
			pad(r.theme, 7) +
			pad(r.fg, 10) +
			pad(r.bg, 10) +
			num(r.ratio, 7) +
			num(r.min, 6) +
			'  ' +
			(r.pass ? 'ok' : 'FAIL')
	);
}

console.log('\nFocus indicator — best of {ring, halo} per ground, needs 3:1 (SC 1.4.11)\n');
console.log(pad('ground', 30) + pad('theme', 7) + pad('bg', 10) + '   best  ');
console.log('-'.repeat(62));
for (const r of focusRows) {
	console.log(
		pad(r.label, 30) +
			pad(r.theme, 7) +
			pad(r.bg, 10) +
			num(r.best, 7) +
			'  ' +
			(r.pass ? 'ok' : 'FAIL')
	);
}

const total = rows.length + focusRows.length;
if (failed > 0) {
	console.error(`\n${failed} of ${total} checks FAILED\n`);
	process.exit(1);
}
console.log(`\nAll ${total} checks passed.\n`);
