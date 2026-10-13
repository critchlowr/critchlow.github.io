#!/usr/bin/env node
/*
	axe-core against the real rendered page, in both themes.

	This exists alongside scripts/check-contrast.mjs because the two catch
	different things and neither subsumes the other. The contrast script resolves
	design tokens on paper, which is the only way to check a colour pair that no
	page currently renders. This one measures what the browser actually composited,
	which is the only way to catch a token that is fine in isolation and fails
	behind a translucent header or an ambient gradient.

	It reports violations and "incomplete" separately, on purpose. axe returns
	incomplete when it cannot determine a background — typically semi-transparent
	layers or backdrop-filter — and a runner that folds those into failures will
	have you "fixing" colours that were never broken. Incomplete means look at it,
	not fix it.

	Usage: node scripts/a11y-audit.mjs [url ...]   (defaults to the six standard URLs)
*/

import { chromium } from 'playwright';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axeSource = require('node:fs').readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const BASE = process.env.A11Y_BASE ?? 'http://localhost:4173';
const DEFAULT_URLS = ['/', '/?theme=dark'].map((p) => BASE + p);

const urls = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_URLS;

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

const STATES = process.env.A11Y_STATES === '1';

const KILL_MOTION =
	'*,*::before,*::after{transition:none!important;animation:none!important}' +
	'.reveal,.stagger>*{opacity:1!important;transform:none!important}';

/** Drives the page into a state that only exists after interaction. */
async function openState(page, state) {
	if (state === 'simulator') {
		const b = page.getByRole('button', { name: /simulator/i }).first();
		if (!(await b.count())) return false;
		await b.click();
		await page.waitForSelector('[role="dialog"]', { timeout: 5000 }).catch(() => {});
	} else if (state === 'lightbox') {
		const b = page.locator('.marquee-track button').first();
		if (!(await b.count())) return false;
		await b.click();
		await page.waitForSelector('[role="dialog"]', { timeout: 5000 }).catch(() => {});
	} else if (state === 'mobile-menu') {
		await page.setViewportSize({ width: 390, height: 844 });
		const b = page.getByRole('button', { name: /open menu/i }).first();
		if (!(await b.count())) return false;
		await b.click();
		await page.waitForSelector('#mobile-menu', { timeout: 5000 }).catch(() => {});
	}
	await page.waitForTimeout(400);
	return true;
}

const browser = await chromium.launch();
let violationCount = 0;
let incompleteCount = 0;

for (const url of urls) {
	const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
	await page.goto(url, { waitUntil: 'networkidle' });

	// The theme is applied by an inline script before paint, but the reveal-on-scroll
	// utilities start at opacity 0 and axe skips fully transparent text. Reveal
	// everything first so the audit sees the page a reader eventually sees.
	await page.addStyleTag({ content: KILL_MOTION });
	// Killing the transition is not optional. Without it the reveal utilities are
	// mid-fade when axe samples them and every paragraph on the page reports ~1.07:1
	// against its own ground — a measurement of the animation, not of the design.
	await page.waitForTimeout(150);

	await page.addScriptTag({ content: axeSource });
	const result = await page.evaluate(
		async (tags) => await window.axe.run(document, { runOnly: { type: 'tag', values: tags } }),
		TAGS
	);

	violationCount += result.violations.length;
	incompleteCount += result.incomplete.length;

	console.log(`\n===== ${url}`);
	console.log(
		`  violations: ${result.violations.length}   incomplete (needs human review): ${result.incomplete.length}`
	);

	for (const v of result.violations) {
		console.log(`\n  FAIL [${v.impact}] ${v.id} — ${v.help}  (${v.nodes.length} nodes)`);
		for (const n of v.nodes.slice(0, 5)) {
			console.log(`        ${n.target.join(' ').slice(0, 100)}`);
			const msg = [...n.any, ...n.all, ...n.none].map((c) => c.message).join('; ');
			if (msg) console.log(`          ${msg.slice(0, 200)}`);
		}
	}

	for (const v of result.incomplete) {
		console.log(`\n  review  ${v.id} — ${v.help}  (${v.nodes.length} nodes)`);
		const reasons = new Set(
			v.nodes.flatMap((n) => [...n.any, ...n.all, ...n.none].map((c) => c.message))
		);
		for (const r of [...reasons].slice(0, 4)) console.log(`          ${r.slice(0, 180)}`);
	}

	// Interaction states. The simulator, the lightbox and the mobile menu do not
	// exist in the served HTML — they are built on click — so an online checker can
	// never see them. They are also the most complex markup on the site, which is a
	// poor combination to leave unmeasured.
	if (STATES) {
		for (const state of ['simulator', 'lightbox', 'mobile-menu']) {
			const opened = await openState(page, state);
			if (!opened) continue;
			await page.addScriptTag({ content: axeSource });
			const r = await page.evaluate(
				async (tags) => await window.axe.run(document, { runOnly: { type: 'tag', values: tags } }),
				TAGS
			);
			violationCount += r.violations.length;
			console.log(`\n  --- state: ${state} — violations: ${r.violations.length}`);
			for (const v of r.violations) {
				console.log(`  FAIL [${v.impact}] ${v.id} — ${v.help}  (${v.nodes.length} nodes)`);
				const msgs = new Set(
					v.nodes.flatMap((n) => [...n.any, ...n.all, ...n.none].map((c) => c.message))
				);
				for (const m of [...msgs].slice(0, 12)) console.log(`        ${m.slice(0, 190)}`);
			}
			await page.reload({ waitUntil: 'networkidle' });
			await page.addStyleTag({ content: KILL_MOTION });
			await page.waitForTimeout(150);
		}
	}

	await page.close();
}

await browser.close();

console.log(
	`\n${'='.repeat(70)}\nTOTAL — violations: ${violationCount}, incomplete: ${incompleteCount}\n${'='.repeat(70)}\n`
);

// Only violations gate. Incomplete is a reading list, not a failure.
process.exit(violationCount > 0 ? 1 : 0);
