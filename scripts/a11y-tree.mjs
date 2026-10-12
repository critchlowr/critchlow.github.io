#!/usr/bin/env node
/*
	Dumps the accessibility tree — roles, accessible names, heading levels, in DOM
	order — for every route, both themes, and the states that only exist after a
	click. Output is plain Markdown under a11y-reports/, so it can be read, diffed
	and reviewed in a pull request.

	This is not a replacement for VoiceOver. It shows *what* would be announced,
	never *when* or *how it sounds*, and it cannot tell you whether an accessible
	name is a good one. It is here so that a reviewer can see the structure a
	screen-reader user navigates without having to drive a screen reader for every
	change, and so that a regression in that structure shows up as a diff.

	Live-region text is captured separately from the tree, because the tree is a
	snapshot and an announcement is an event: what matters is the exact string
	written into [role="status"] at each step, and that a step writes exactly one.

	Usage: node scripts/a11y-tree.mjs        (server must already be running)
	       npm run a11y:tree                 (starts the server for you)
*/

import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = process.env.A11Y_BASE ?? 'http://localhost:4173';
const OUT = 'a11y-reports';

const KILL_MOTION =
	'*,*::before,*::after{transition:none!important;animation:none!important}' +
	'.reveal,.stagger>*{opacity:1!important;transform:none!important}';

const ROUTES = [['home', '/']];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();

async function prep(page, url, viewport) {
	if (viewport) await page.setViewportSize(viewport);
	await page.goto(url, { waitUntil: 'networkidle' });
	await page.addStyleTag({ content: KILL_MOTION });
	await page.waitForTimeout(200);
}

async function snap(page, selector = 'body') {
	return await page.locator(selector).ariaSnapshot();
}

async function write(name, title, body) {
	const file = `${OUT}/${name}.md`;
	await writeFile(file, `# ${title}\n\n\`\`\`yaml\n${body}\n\`\`\`\n`, 'utf8');
	console.log(`  wrote ${file}`);
}

/* ---------- static snapshots: 3 routes x 2 themes ---------- */

for (const [name, path] of ROUTES) {
	for (const theme of ['light', 'dark']) {
		const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
		const url =
			BASE + path + (theme === 'dark' ? (path.includes('?') ? '&' : '?') + 'theme=dark' : '');
		await prep(page, url);
		await write(`${name}-${theme}`, `${name} — ${theme}`, await snap(page));
		await page.close();
	}
}

/* ---------- interaction states ---------- */

// Mobile menu
{
	const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
	await prep(page, BASE + '/');
	await page
		.getByRole('button', { name: /open menu/i })
		.first()
		.click();
	await page.waitForSelector('#mobile-menu');
	await write('home-mobile-menu-open', 'home — mobile menu open', await snap(page, 'header'));
	await page.close();
}

// Photo lightbox: open, check focus, check Escape restores focus
{
	const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
	await prep(page, BASE + '/');
	const photo = page.locator('.marquee-track button').first();
	await photo.click();
	await page.waitForSelector('[role="dialog"]');
	const focusedOnOpen = await page.evaluate(
		() => document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.tagName
	);
	await write(
		'home-lightbox-open',
		'home — photo lightbox open',
		await snap(page, '[role="dialog"]')
	);
	await page.keyboard.press('Escape');
	await page.waitForTimeout(300);
	const dialogGone = (await page.locator('[role="dialog"]').count()) === 0;
	const focusRestored = await page.evaluate(() => {
		const a = document.activeElement;
		return !!a?.closest('.marquee-track');
	});
	console.log(
		`  lightbox: focus on open = ${focusedOnOpen}; Escape closed = ${dialogGone}; focus restored to photo = ${focusRestored}`
	);
	await page.close();
}

// Simulator: walk the fulfilment flow, capturing each live-region announcement
{
	const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
	await prep(page, BASE + '/');
	await page
		.getByRole('button', { name: /simulator/i })
		.first()
		.click();
	await page.waitForSelector('[role="dialog"]');
	const focusedOnOpen = await page.evaluate(
		() =>
			document.activeElement?.textContent?.trim().slice(0, 40) ?? document.activeElement?.tagName
	);
	console.log(`  simulator: focus on open = ${JSON.stringify(focusedOnOpen)}`);

	await write('simulator-open', 'simulator — on open', await snap(page, '[role="dialog"]'));

	// Drive the flow. Each label is tried in turn; missing ones are skipped, so this
	// keeps working if the wording changes without silently claiming a pass.
	const steps = [/wave orders/i, /pick/i, /stage cart/i, /pack/i, /load/i, /ship/i];
	const heard = [];
	for (const label of steps) {
		const btn = page.getByRole('button', { name: label }).first();
		if (!(await btn.count()) || !(await btn.isEnabled().catch(() => false))) continue;
		await btn.click();
		await page.waitForTimeout(600);
		const status = (await page.locator('[role="status"]').first().textContent()) ?? '';
		const alert = (await page.locator('[role="alert"]').first().textContent()) ?? '';
		heard.push({
			step: String(label),
			// The zero-width space announce() alternates to defeat repeat-suppression.
			status: status.replace(/\u200b/g, '').trim(),
			alert: alert.trim()
		});
	}

	const lines = heard
		.map(
			(h) =>
				`${h.step}\n  status: ${h.status || '(nothing)'}${h.alert ? `\n  alert : ${h.alert}` : ''}`
		)
		.join('\n\n');
	await write('simulator-announcements', 'simulator — live region text per step', lines);
	await write(
		'simulator-after-flow',
		'simulator — after the flow',
		await snap(page, '[role="dialog"]')
	);

	// Inventory table, behind a <details>
	const summary = page.getByText(/view inventory/i).first();
	if (await summary.count()) {
		await summary.click();
		await page.waitForTimeout(300);
		const table = page.locator('table').first();
		if (await table.count()) {
			await write(
				'simulator-inventory-table',
				'simulator — inventory table',
				await snap(page, 'table')
			);
		}
	}
	await page.close();
}

await browser.close();
console.log(`\nReports written to ${OUT}/. Read them; they are the point.\n`);
