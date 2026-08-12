#!/usr/bin/env node
// Viewport-sized screenshot, scrolled to the bottom.
// Full-page capture flattens sticky elements to wherever they happened to be,
// which makes a sticky composer look like it is overlapping content. This shows
// what a person actually sees.
// Usage: node scripts/viewshot.mjs <url> <outFile> [width] [height]
import { chromium } from 'playwright';

const [url, out, width = '1440', height = '900'] = process.argv.slice(2);

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: Number(width), height: Number(height) },
});

// 'load', not 'networkidle': a page that keeps a connection open (streaming a
// Suspense boundary, for instance) never goes idle and the capture times out.
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(600);
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(400);
await page.screenshot({ path: out });
await browser.close();

console.log(`captured ${out}`);
