import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
await p.addStyleTag({
	content:
		'*,*::before,*::after{transition:none!important;animation:none!important}.reveal,.stagger>*{opacity:1!important;transform:none!important}'
});
await p.waitForTimeout(300);

// what is focusable, in DOM order, and which experience card owns it
const list = await p.evaluate(() => {
	const SEL =
		'a[href],button:not([disabled]),input:not([disabled]),select,textarea,summary,[tabindex]:not([tabindex="-1"])';
	return Array.from(document.querySelectorAll(SEL))
		.filter((el) => el.getClientRects().length > 0)
		.map((el) => {
			const card = el.closest('[id^="experience-"]');
			const sec = el.closest('section[id], div[id]');
			return {
				tag: el.tagName.toLowerCase(),
				name: (el.getAttribute('aria-label') || el.textContent || '')
					.replace(/\s+/g, ' ')
					.trim()
					.slice(0, 42),
				card: card ? card.id : '',
				section: sec ? sec.id : ''
			};
		});
});
const start = list.findIndex(
	(x) => x.name.toLowerCase().includes('pause') || x.name.toLowerCase().includes('play')
);
console.log('--- focusable order around the photo reel ---');
list
	.slice(Math.max(0, start - 2), start + 18)
	.forEach((x, i) =>
		console.log(
			`  ${String(Math.max(0, start - 2) + i).padStart(3)}  ${x.tag.padEnd(7)} card=${(x.card || '-').padEnd(13)} ${x.name}`
		)
	);

console.log('\n--- focusable count per experience card ---');
const cards = await p.evaluate(() => {
	const SEL =
		'a[href],button:not([disabled]),input:not([disabled]),select,textarea,summary,[tabindex]:not([tabindex="-1"])';
	return Array.from(document.querySelectorAll('[id^="experience-"]')).map((c) => ({
		id: c.id,
		title: (c.querySelector('h3')?.textContent || '').replace(/\s+/g, ' ').trim(),
		company: (c.querySelector('h3 + *')?.textContent || '')
			.replace(/\s+/g, ' ')
			.trim()
			.slice(0, 30),
		focusables: Array.from(c.querySelectorAll(SEL)).filter((e) => e.getClientRects().length > 0)
			.length
	}));
});
for (const c of cards)
	console.log(`  ${c.id.padEnd(13)} ${c.title.padEnd(26)} focusable=${c.focusables}`);
await b.close();
