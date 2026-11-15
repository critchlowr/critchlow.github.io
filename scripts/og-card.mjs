// Renders scripts/og-card.html to static/images/og-card.png at 1200x630.
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';

const source = new URL('./og-card.html', import.meta.url);
const out = fileURLToPath(new URL('../static/images/og-card.png', import.meta.url));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(source.href);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: out });
await browser.close();
console.log(`wrote ${out}`);
