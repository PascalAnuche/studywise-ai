#!/usr/bin/env node
// Renders pages and writes PNGs, so the UI can be looked at rather than inferred.
// Usage: node scripts/screenshot.mjs [baseUrl] [outDir]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const baseUrl = process.argv[2] ?? 'http://localhost:3131';
const outDir = path.resolve(process.argv[3] ?? '.screenshots');

const PAGES = [
  { name: 'dashboard', path: '/' },
  { name: 'assistant', path: '/assistant' },
  { name: 'planner', path: '/planner' },
  { name: 'practice', path: '/practice' },
  { name: 'preview', path: '/preview' },
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 420, height: 900 },
];

fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();

for (const viewport of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  for (const target of PAGES) {
    await page.goto(baseUrl + target.path, { waitUntil: 'networkidle' });
    const file = path.join(outDir, `${target.name}-${viewport.name}.png`);
    await page.screenshot({ path: file, fullPage: viewport.name === 'desktop' });
    console.log(`  ${path.relative(process.cwd(), file)}`);
  }

  await context.close();
}

await browser.close();
