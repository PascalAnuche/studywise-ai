#!/usr/bin/env node
// Measures what a browser actually experiences: full page load, and the
// client-side route transitions you get from clicking the sidebar.
// Usage: node scripts/navtiming.mjs <baseUrl>
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://127.0.0.1:3136';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

console.log('Full page loads (cold cache each):');
for (const path of ['/progress', '/', '/planner', '/practice']) {
  const start = Date.now();
  await page.goto(base + path, { waitUntil: 'domcontentloaded' });
  const domReady = Date.now() - start;

  const ttfb = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    return Math.round(nav.responseStart - nav.requestStart);
  });

  console.log(`  ${path.padEnd(11)} ttfb ${String(ttfb).padStart(5)}ms   domcontentloaded ${domReady}ms`);
}

console.log('\nClicking the sidebar (client-side navigation, what a user does):');
await page.goto(base + '/', { waitUntil: 'networkidle' });

for (const label of ['Learn', 'Plan', 'Practice', 'Progress', 'Home']) {
  const start = Date.now();
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: label }).click();
  await page.waitForFunction(
    (expected) => document.querySelector('nav [aria-current="page"]')?.textContent?.includes(expected),
    label,
    { timeout: 15000 }
  );
  console.log(`  ${label.padEnd(11)} ${Date.now() - start}ms until the nav updates`);
}

await browser.close();
