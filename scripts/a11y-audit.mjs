#!/usr/bin/env node
/**
 * axe-core against the built site in both themes, including states that only
 * exist after interaction: the mobile menu, and each phase of a full simulator
 * shift played through to the summary.
 *
 * Violations fail the run. axe's "incomplete" results, usually a background it
 * cannot resolve through a translucent layer, are printed for review only.
 *
 * Usage: npm run axe (starts a preview server), or node scripts/a11y-audit.mjs
 * against a running server at A11Y_BASE (default http://localhost:4173).
 */

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const BASE = process.env.A11Y_BASE ?? 'http://localhost:4173';
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const PAGES = ['/', '/simulator', '/404.html'];
const THEMES = ['light', 'dark'];

// Measure finished states, not frames of a transition.
const NO_MOTION = '*,*::before,*::after{transition:none!important;animation:none!important}';

let violations = 0;
let incomplete = 0;

async function open(browser, path, theme, viewport = { width: 1280, height: 900 }) {
	// The site's CSP correctly blocks the inline script that injects axe.
	const page = await browser.newPage({ viewport, bypassCSP: true });
	await page.goto(`${BASE}${path}?theme=${theme}`, { waitUntil: 'networkidle' });
	await page.addStyleTag({ content: NO_MOTION });
	await page.addScriptTag({ content: axeSource });
	return page;
}

async function audit(page, label, scope = 'html') {
	const result = await page.evaluate(
		async ({ tags, scope }) =>
			window.axe.run(document.querySelector(scope), { runOnly: { type: 'tag', values: tags } }),
		{ tags: TAGS, scope }
	);
	violations += result.violations.length;
	incomplete += result.incomplete.length;

	console.log(
		`\n${label}: ${result.violations.length} violations, ${result.incomplete.length} to review`
	);
	for (const v of result.violations) {
		console.log(`  FAIL [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} nodes)`);
		for (const node of v.nodes.slice(0, 5)) {
			const why = [...node.any, ...node.all, ...node.none].map((c) => c.message).join('; ');
			console.log(`    ${node.target.join(' ')}\n      ${why.slice(0, 200)}`);
		}
	}
	for (const v of result.incomplete)
		console.log(`  review ${v.id}: ${v.help} (${v.nodes.length} nodes)`);
}

/** Plays one shift by role and name, auditing the dialog once in each phase. */
async function playShift(page, theme) {
	await page.getByRole('button', { name: /run the simulator/i }).click();
	const dialog = page.locator('[role="dialog"]');
	await dialog.waitFor();

	const seen = new Set();
	const auditOnce = async (phase) => {
		if (seen.has(phase)) return;
		seen.add(phase);
		await audit(page, `/simulator ${theme}, dialog: ${phase}`, '[role="dialog"]');
	};
	const button = (name) => dialog.getByRole('button', { name }).first();
	const ready = async (name) =>
		(await button(name).count()) > 0 && (await button(name).isEnabled());

	await auditOnce('ready to start');
	await button(/wave orders/i).click();

	let holdNext = true;
	for (let step = 0; step < 100; step++) {
		if (await dialog.getByRole('heading', { name: /shift summary/i }).count()) break;

		if (await ready(/^confirm pick/i)) {
			await auditOnce('picking');
			await button(/^confirm pick/i).click();
		} else if (await ready(/^report empty/i)) {
			await button(/^report empty/i).click();
			await auditOnce('location reported empty');
		} else if (await ready(/^pack \d+ order/i)) {
			await auditOnce('pack station');
			await button(/^pack \d+ order/i).click();
		} else if ((await ready(/^hold order/i)) || (await ready(/^ship short/i))) {
			await auditOnce('pack station');
			// Exercise both decisions across short orders.
			await button(holdNext ? /^hold order/i : /^ship short/i).click();
			holdNext = !holdNext;
		} else if (await ready(/load truck/i)) {
			await auditOnce('ready to ship');
			await button(/load truck/i).click();
		}
		// Replenishment and staging run on timers; give them a moment.
		await page.waitForTimeout(450);
	}

	if (await dialog.getByRole('heading', { name: /shift summary/i }).count()) {
		await auditOnce('shift summary');
	} else {
		console.log(`\n/simulator ${theme}: FAIL the shift never reached its summary`);
		violations++;
	}
}

const browser = await chromium.launch();

for (const theme of THEMES) {
	for (const path of PAGES) {
		const page = await open(browser, path, theme);
		await audit(page, `${path} ${theme}`);
		if (path === '/simulator') await playShift(page, theme);
		await page.close();
	}

	const phone = await open(browser, '/', theme, { width: 390, height: 844 });
	await phone.getByRole('button', { name: /open menu/i }).click();
	await phone.locator('#mobile-menu').waitFor();
	await audit(phone, `/ ${theme}, mobile menu open`);
	await phone.close();
}

await browser.close();

console.log(`\nTotal: ${violations} violations, ${incomplete} to review`);
process.exit(violations > 0 ? 1 : 0);
