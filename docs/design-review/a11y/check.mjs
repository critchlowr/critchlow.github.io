// Accessibility checker for ryancritchlow.com and the design-review mockups.
//
//   cd docs/design-review/a11y && npm install
//   node check.mjs http://localhost:4173/ [more urls...] [--out results] [--no-lighthouse]
//
// Every URL is checked in light + dark, desktop (1440) + mobile (390):
//   1. axe-core, WCAG 2.0/2.1/2.2 A + AA rules plus best-practice rules
//   2. axe again with the first focusable element (usually a skip link) focused,
//      because axe skips visually hidden elements and a skip link that fails
//      contrast only fails while it is on screen
//   3. keyboard walk: every Tab stop must show a focus indicator (2.4.7) and must
//      not be hidden behind sticky content (2.4.11 Focus Not Obscured); repeated
//      with forced colors (Windows High Contrast), which strips box-shadow rings
//   4. reflow at 320 CSS px with no horizontal scroll (1.4.10)
//   5. text-spacing override (1.4.12) with no clipped text
//   6. reduced motion: no transform/translate/scale/rotate animation may run
//      while prefers-reduced-motion is `reduce` (2.3.3)
//   7. Lighthouse accessibility, performance, best-practices and SEO scores
//
// Exit code is 1 if any WCAG A/AA violation or any keyboard/reflow/motion failure
// is found, so this can run in CI.

import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name, fallback) => {
	const i = args.indexOf(name);
	return i === -1 ? fallback : args[i + 1];
};
const outDir = opt('--out', 'results');
const urls = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--out');
if (urls.length === 0) {
	console.error('usage: node check.mjs <url> [url...] [--out dir] [--no-lighthouse]');
	process.exit(2);
}
mkdirSync(outDir, { recursive: true });

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const VIEWPORTS = [
	{ name: 'desktop', width: 1440, height: 900 },
	{ name: 'mobile', width: 390, height: 844 }
];
const SCHEMES = ['light', 'dark'];

const browser = await chromium.launch();
const report = [];
let failed = false;

/** Scroll the whole page so every reveal-on-scroll element has fired, then settle. */
async function settle(page) {
	await page.evaluate(async () => {
		const step = Math.max(200, Math.floor(window.innerHeight / 2));
		for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
			window.scrollTo(0, y);
			await new Promise((r) => setTimeout(r, 60));
		}
		window.scrollTo(0, 0);
	});
	await page.waitForTimeout(1500);
}

/** Put the sequential-focus starting point at the very top of the document. */
async function resetFocus(page) {
	await page.evaluate(() => {
		window.scrollTo(0, 0);
		const t = document.createElement('div');
		t.tabIndex = -1;
		document.body.prepend(t);
		t.focus({ preventScroll: true });
		t.remove();
	});
}

const summariseAxe = (res) =>
	res.violations.map((v) => ({
		id: v.id,
		impact: v.impact,
		wcag: v.tags.filter((t) => /^wcag\d/.test(t)),
		help: v.help,
		nodes: v.nodes.length,
		targets: v.nodes.slice(0, 5).map((n) => n.target.join(' ')),
		detail: v.nodes[0]?.failureSummary?.split('\n').slice(0, 3).join(' ')
	}));

const luminance = ([r, g, b]) => {
	const c = [r, g, b].map((v) => {
		v /= 255;
		return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
};

/**
 * axe cannot decide contrast over gradients, images or overlapping layers and
 * reports those nodes as "incomplete". For each one: hide the element's text,
 * screenshot the box, and measure the text colour against the lightest and darkest
 * background pixel actually painted behind it. The worst of the two is the score.
 */
async function pixelContrast(page, incomplete) {
	const results = [];
	// Smooth scrolling would move the page between measuring a box and capturing it.
	await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
	for (const node of incomplete) {
		const selector = node.target[0];
		if (typeof selector !== 'string') continue;
		const el = page.locator(selector).first();
		if (!(await el.count())) continue;
		// Text hidden from assistive tech and drawn as ornament (a sign painted on a photo,
		// a stamp) is decoration; WCAG 1.4.3 exempts it. Report it, don't fail on it.
		if (await el.evaluate((e) => !!e.closest('[aria-hidden="true"]'))) {
			results.push({ target: selector, decorative: true, pass: true });
			continue;
		}
		const info = await el.evaluate((e) => {
			const cs = getComputedStyle(e);
			const m = cs.color.match(/[\d.]+/g).map(Number);
			const size = parseFloat(cs.fontSize);
			const weight = Number(cs.fontWeight);
			e.setAttribute('data-a11y-probe', '');
			// Borders are not background: skip them, the curve of a rounded corner,
			// and a pixel of anti-aliasing.
			const border = Math.max(
				...['Top', 'Right', 'Bottom', 'Left'].map((k) => parseFloat(cs[`border${k}Width`]) || 0)
			);
			const radius = parseFloat(cs.borderTopLeftRadius) || 0;
			const inset = border ? Math.ceil(border + radius * 0.3) : 0;
			return {
				color: m.slice(0, 3),
				alpha: m[3] ?? 1,
				large: size >= 24 || (size >= 18.66 && weight >= 700),
				inset: inset ? inset + 1 : 0
			};
		});
		const style = await page.addStyleTag({
			content:
				'[data-a11y-probe], [data-a11y-probe] * { color: transparent !important; text-shadow: none !important; text-decoration-color: transparent !important; caret-color: transparent !important; } [data-a11y-probe] svg, [data-a11y-probe] img { visibility: hidden !important; }'
		});
		// Scroll, settle, measure, then capture exactly that rectangle of the viewport.
		const box = await el.evaluate(async (e) => {
			e.scrollIntoView({ block: 'center', behavior: 'instant' });
			await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
			await new Promise((r) => setTimeout(r, 450));
			const r = e.getBoundingClientRect();
			return { x: r.x, y: r.y, width: r.width, height: r.height };
		});
		const png =
			box.width >= 1 && box.height >= 1
				? await page.screenshot({ clip: box, animations: 'disabled' }).catch(() => null)
				: null;
		await style.evaluate((n) => n.remove());
		await el.evaluate((e) => e.removeAttribute('data-a11y-probe'));
		if (!png) continue;
		const [lightest, darkest] = await page.evaluate(
			async ([b64, inset]) => {
				const img = await createImageBitmap(
					await (await fetch('data:image/png;base64,' + b64)).blob()
				);
				const c = new OffscreenCanvas(img.width, img.height);
				const ctx = c.getContext('2d');
				ctx.drawImage(img, 0, 0);
				const d = ctx.getImageData(0, 0, img.width, img.height).data;
				let lo = [255, 255, 255, 2],
					hi = [0, 0, 0, -1];
				const L = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
				for (let i = 0; i < d.length; i += 16) {
					const px = (i / 4) % img.width;
					const py = Math.floor(i / 4 / img.width);
					if (px < inset || py < inset || px >= img.width - inset || py >= img.height - inset)
						continue;
					const l = L(d[i], d[i + 1], d[i + 2]);
					if (l > L(...hi.slice(0, 3)) || hi[3] < 0) hi = [d[i], d[i + 1], d[i + 2], 0];
					if (l < L(...lo.slice(0, 3)) || lo[3] > 1) lo = [d[i], d[i + 1], d[i + 2], 0];
				}
				return [hi.slice(0, 3), lo.slice(0, 3)];
			},
			[png.toString('base64'), info.inset]
		);
		const worst = Math.min(ratio(info.color, lightest), ratio(info.color, darkest));
		const need = info.large ? 3 : 4.5;
		if (process.env.A11Y_DEBUG && worst < need)
			writeFileSync(
				`${outDir}/pixel-${selector.replace(/[^a-z0-9]+/gi, '_').slice(0, 60)}.png`,
				png
			);
		results.push({
			target: selector,
			text: `rgb(${info.color.join(',')})${info.alpha < 1 ? ` @${info.alpha}` : ''}`,
			bgRange: [`rgb(${lightest.join(',')})`, `rgb(${darkest.join(',')})`],
			worst: Math.round(worst * 100) / 100,
			need,
			pass: worst >= need && info.alpha === 1
		});
	}
	return results;
}

async function keyboardWalk(page, maxStops = 150) {
	// Smooth scrolling animates focus-into-view, so measurements taken straight after
	// Tab would see the element still off screen.
	await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
	await resetFocus(page);
	const stops = [];
	for (let i = 0; i < maxStops; i++) {
		await page.keyboard.press('Tab');
		await page.waitForTimeout(30);
		const info = await page.evaluate(() => {
			const el = document.activeElement;
			if (!el || el === document.body) return null;
			// Tag each stop so a second visit means focus has wrapped back to the start.
			if (el.dataset.a11yStop) return { wrapped: true };
			el.dataset.a11yStop = '1';
			const labelledby = el.getAttribute('aria-labelledby');
			const name = (
				el.getAttribute('aria-label') ||
				(labelledby && document.getElementById(labelledby)?.textContent) ||
				el.getAttribute('title') ||
				el.textContent?.trim() ||
				[...el.querySelectorAll('img[alt]')].map((i) => i.alt).join(' ') ||
				''
			)
				.trim()
				.replace(/\s+/g, ' ')
				.slice(0, 40);
			const id = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + '|' + name;
			const cs = getComputedStyle(el);
			const indicator =
				(cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none';
			const r = el.getBoundingClientRect();
			const vw = window.innerWidth;
			const vh = window.innerHeight;
			const inViewport =
				r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;
			// 2.4.11: the focused element must not be entirely hidden by author content.
			// Sample a 3x3 grid; the element passes if any sample hits itself or a descendant.
			let visibleSamples = 0;
			for (const fx of [0.2, 0.5, 0.8])
				for (const fy of [0.2, 0.5, 0.8]) {
					const x = r.left + r.width * fx;
					const y = r.top + r.height * fy;
					if (x < 0 || y < 0 || x >= vw || y >= vh) continue;
					const hit = document.elementFromPoint(x, y);
					if (hit && (hit === el || el.contains(hit) || hit.contains(el))) visibleSamples++;
				}
			return { id, indicator, inViewport, visibleSamples, tag: el.tagName.toLowerCase() };
		});
		if (!info) continue;
		if (info.wrapped) break;
		stops.push(info);
	}
	return {
		count: stops.length,
		noIndicator: stops.filter((s) => !s.indicator).map((s) => s.id),
		obscured: stops.filter((s) => s.inViewport && s.visibleSamples === 0).map((s) => s.id),
		offscreen: stops.filter((s) => !s.inViewport).map((s) => s.id),
		first: stops[0]?.id
	};
}

async function reflow(url, scheme) {
	const ctx = await browser.newContext({
		viewport: { width: 320, height: 640 },
		colorScheme: scheme
	});
	const page = await ctx.newPage();
	await page.goto(url, { waitUntil: 'networkidle' });
	await settle(page);
	const res = await page.evaluate(() => {
		const doc = document.documentElement;
		const offenders = [];
		for (const el of document.querySelectorAll('body *')) {
			const r = el.getBoundingClientRect();
			if (
				r.right > doc.clientWidth + 1 &&
				r.width > 0 &&
				getComputedStyle(el).position !== 'fixed'
			) {
				// ignore descendants of an element that is itself a horizontal scroller (tables, code)
				let p = el.parentElement;
				let scroller = false;
				while (p) {
					const ox = getComputedStyle(p).overflowX;
					if (ox === 'auto' || ox === 'scroll' || ox === 'hidden' || ox === 'clip') {
						scroller = true;
						break;
					}
					p = p.parentElement;
				}
				if (!scroller)
					offenders.push(
						el.tagName.toLowerCase() +
							(el.className && typeof el.className === 'string'
								? '.' + el.className.split(' ').slice(0, 2).join('.')
								: '')
					);
			}
		}
		return {
			scrollWidth: doc.scrollWidth,
			clientWidth: doc.clientWidth,
			offenders: offenders.slice(0, 8)
		};
	});
	await ctx.close();
	return { ...res, pass: res.scrollWidth <= res.clientWidth + 1 };
}

async function textSpacing(url) {
	const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
	const page = await ctx.newPage();
	await page.goto(url, { waitUntil: 'networkidle' });
	await settle(page);
	await page.addStyleTag({
		content:
			'* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }'
	});
	await page.waitForTimeout(300);
	const clipped = await page.evaluate(() => {
		const out = [];
		for (const el of document.querySelectorAll('body *')) {
			const cs = getComputedStyle(el);
			const clips =
				['hidden', 'clip'].includes(cs.overflowY) || ['hidden', 'clip'].includes(cs.overflowX);
			if (!clips || !el.textContent?.trim() || el.closest('[aria-hidden="true"]')) continue;
			// sr-only and similar 1px clipping is intentional
			if (el.clientWidth <= 1 || el.clientHeight <= 1) continue;
			if (el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2)
				out.push(
					el.tagName.toLowerCase() +
						(typeof el.className === 'string' && el.className
							? '.' + el.className.split(' ').slice(0, 2).join('.')
							: '')
				);
		}
		return out;
	});
	await ctx.close();
	return { clipped: clipped.slice(0, 10), count: clipped.length };
}

async function reducedMotion(url) {
	const ctx = await browser.newContext({
		viewport: { width: 1280, height: 900 },
		reducedMotion: 'reduce'
	});
	const page = await ctx.newPage();
	// Record every animation that starts, not just the ones still running at the end.
	await page.addInitScript(() => {
		window.__motion = [];
		const moving = /transform|translate|scale|rotate|offset|left|top/;
		const log = (e) => {
			const target = e.target;
			const prop = e.propertyName || e.animationName || '';
			let animatesMovement = moving.test(prop);
			if (e.animationName) {
				for (const a of target.getAnimations()) {
					if (a.animationName !== e.animationName) continue;
					const kf = a.effect?.getKeyframes?.() || [];
					animatesMovement = kf.some((k) => Object.keys(k).some((p) => moving.test(p)));
				}
			}
			if (animatesMovement)
				window.__motion.push(
					(target.tagName || '').toLowerCase() +
						(typeof target.className === 'string' && target.className
							? '.' + target.className.split(' ').slice(0, 2).join('.')
							: '') +
						' → ' +
						prop
				);
		};
		addEventListener('transitionstart', log, true);
		addEventListener('animationstart', log, true);
	});
	await page.goto(url, { waitUntil: 'networkidle' });
	await settle(page);
	const motion = await page.evaluate(() => [...new Set(window.__motion)]);
	// Script-driven motion (requestAnimationFrame loops) fires no animation events, so
	// also sample every element's transform twice, a second apart, while idle.
	const sample = () =>
		page.evaluate(() =>
			[...document.querySelectorAll('body *')].map((el) => getComputedStyle(el).transform)
		);
	// Loops are often gated on visibility, so sample one viewport at a time.
	const changed = new Set();
	const height = await page.evaluate(() => document.documentElement.scrollHeight);
	for (let y = 0; y < height; y += 800) {
		await page.evaluate((top) => window.scrollTo(0, top), y);
		await page.waitForTimeout(250);
		const before = await sample();
		await page.waitForTimeout(600);
		const after = await sample();
		before.forEach((t, i) => t !== after[i] && changed.add(i));
	}
	const scripted = await page.evaluate(
		(idx) => {
			const els = [...document.querySelectorAll('body *')];
			return idx.map((i) => {
				const el = els[i];
				const cls =
					typeof el.className === 'string' && el.className
						? '.' + el.className.split(' ').slice(0, 2).join('.')
						: '';
				return el.tagName.toLowerCase() + cls + ' → transform keeps changing while idle';
			});
		},
		[...changed]
	);
	const all = [...new Set([...motion, ...scripted])];
	await ctx.close();
	return { movingAnimations: all.slice(0, 15), count: all.length, pass: all.length === 0 };
}

async function lighthouseRun(url) {
	const { default: lighthouse } = await import('lighthouse');
	const chromeLauncher = await import('chrome-launcher');
	const chrome = await chromeLauncher.launch({
		chromePath: process.env.CHROME_PATH || chromium.executablePath(),
		chromeFlags: ['--headless=new', '--no-sandbox']
	});
	try {
		const res = await lighthouse(url, {
			port: chrome.port,
			output: 'json',
			logLevel: 'error',
			onlyCategories: ['accessibility', 'performance', 'best-practices', 'seo']
		});
		const c = res.lhr.categories;
		const audits = res.lhr.audits;
		const failedA11y = c.accessibility.auditRefs
			.filter((r) => audits[r.id].score === 0)
			.map((r) => r.id);
		return {
			accessibility: Math.round(c.accessibility.score * 100),
			performance: Math.round(c.performance.score * 100),
			bestPractices: Math.round(c['best-practices'].score * 100),
			seo: Math.round(c.seo.score * 100),
			lcp: audits['largest-contentful-paint'].displayValue,
			cls: audits['cumulative-layout-shift'].displayValue,
			tbt: audits['total-blocking-time'].displayValue,
			failedA11y
		};
	} finally {
		await chrome.kill();
	}
}

for (const url of urls) {
	const entry = { url, axe: [], keyboard: [], reflow: [], skipLinkAxe: null };
	console.log(`\n▶ ${url}`);
	for (const scheme of SCHEMES) {
		for (const vp of VIEWPORTS) {
			const ctx = await browser.newContext({
				viewport: { width: vp.width, height: vp.height },
				colorScheme: scheme
			});
			const page = await ctx.newPage();
			await page.goto(url, { waitUntil: 'networkidle' });
			await settle(page);
			const res = await new AxeBuilder({ page })
				.withTags([...WCAG_TAGS, 'best-practice'])
				.analyze();
			const violations = summariseAxe(res);
			const wcagViolations = violations.filter((v) => v.wcag.length > 0);
			if (wcagViolations.length) failed = true;
			const undecided = res.incomplete.find((v) => v.id === 'color-contrast')?.nodes ?? [];
			const pixel = await pixelContrast(page, undecided);
			const pixelFails = pixel.filter((p) => !p.pass);
			if (pixelFails.length) failed = true;
			entry.axe.push({
				scheme,
				viewport: vp.name,
				passes: res.passes.length,
				incomplete: res.incomplete.map((v) => ({ id: v.id, nodes: v.nodes.length })),
				violations,
				pixelContrast: pixel
			});
			const measured = pixel.filter((p) => !p.decorative);
			const worstPixel = measured.length ? Math.min(...measured.map((p) => p.worst)) : null;
			console.log(
				`  axe ${scheme}/${vp.name}: ${wcagViolations.length} WCAG, ${violations.length - wcagViolations.length} best-practice, ${res.passes.length} passing rules; ` +
					`pixel contrast on ${measured.length} gradient/overlap nodes: ${pixelFails.length} fail${worstPixel ? ` (lowest ${worstPixel}:1)` : ''}` +
					(pixel.length > measured.length
						? `, ${pixel.length - measured.length} decorative skipped`
						: '')
			);

			const kb = await keyboardWalk(page);
			if (kb.noIndicator.length || kb.obscured.length) failed = true;
			entry.keyboard.push({ scheme, viewport: vp.name, ...kb });
			console.log(
				`  keyboard ${scheme}/${vp.name}: ${kb.count} stops, ${kb.noIndicator.length} without indicator, ${kb.obscured.length} obscured; first stop: ${kb.first}`
			);

			// Focus the first focusable element and re-run contrast while it is visible.
			if (vp.name === 'desktop') {
				await resetFocus(page);
				await page.keyboard.press('Tab');
				await page.waitForTimeout(200);
				const skip = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
				const focused = await page.evaluate(() => document.activeElement?.outerHTML.slice(0, 80));
				entry.skipLinkAxe ??= {};
				entry.skipLinkAxe[scheme] = { focused, violations: summariseAxe(skip) };
				if (skip.violations.length) failed = true;
				console.log(
					`  first-focus contrast ${scheme}: ${skip.violations.length} violations on ${focused}`
				);
			}
			await ctx.close();
		}
		if (scheme === 'light') {
			// Windows High Contrast drops box-shadow focus rings, so walk once more with it on.
			const ctx = await browser.newContext({
				viewport: { width: 1440, height: 900 },
				forcedColors: 'active'
			});
			const page = await ctx.newPage();
			await page.goto(url, { waitUntil: 'networkidle' });
			await settle(page);
			const kb = await keyboardWalk(page);
			if (kb.noIndicator.length) failed = true;
			entry.keyboard.push({ scheme: 'forced-colors', viewport: 'desktop', ...kb });
			console.log(
				`  keyboard forced-colors: ${kb.count} stops, ${kb.noIndicator.length} without indicator, ${kb.obscured.length} obscured`
			);
			await ctx.close();
		}
		const rf = await reflow(url, scheme);
		if (!rf.pass) failed = true;
		entry.reflow.push({ scheme, ...rf });
		console.log(
			`  reflow 320px ${scheme}: ${rf.pass ? 'pass' : 'FAIL'} (scrollWidth ${rf.scrollWidth})`
		);
	}
	entry.textSpacing = await textSpacing(url);
	console.log(`  text spacing: ${entry.textSpacing.count} clipped containers`);
	entry.reducedMotion = await reducedMotion(url);
	if (!entry.reducedMotion.pass) failed = true;
	console.log(`  reduced motion: ${entry.reducedMotion.count} moving animations`);
	if (!flag('--no-lighthouse')) {
		try {
			entry.lighthouse = await lighthouseRun(url);
			const l = entry.lighthouse;
			console.log(
				`  lighthouse: a11y ${l.accessibility} · perf ${l.performance} · best ${l.bestPractices} · seo ${l.seo} · LCP ${l.lcp} · CLS ${l.cls} · TBT ${l.tbt}`
			);
		} catch (e) {
			entry.lighthouse = { error: String(e) };
			console.log(`  lighthouse: error ${e}`);
		}
	}
	report.push(entry);
}

await browser.close();
const stamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
const file = `${outDir}/a11y-${stamp}.json`;
writeFileSync(file, JSON.stringify(report, null, 2));
console.log(`\nFull results: ${file}`);
console.log(failed ? 'RESULT: issues found' : 'RESULT: all checks passed');
process.exit(failed ? 1 : 0);
