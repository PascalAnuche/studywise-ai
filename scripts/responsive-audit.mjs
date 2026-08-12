#!/usr/bin/env node
// Responsive audit. Loads every route at every breakpoint and reports, per
// combination, whether the page scrolls sideways and which elements cause it.
//
// Eyeballing 60 screenshots finds the obvious breakage and misses the rest.
// This names the offending element, which is what actually gets it fixed.
//
// Usage: node scripts/responsive-audit.mjs <baseUrl> [--shots]
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = process.argv[2] ?? 'http://localhost:3186';
const shots = process.argv.includes('--shots');

const ROUTES = [
  '/',
  '/assistant',
  '/planner',
  '/progress',
  '/practice',
  '/resources',
  '/flashcards',
  '/notes',
  '/achievements',
  '/profile',
  '/settings',
];

const WIDTHS = [
  { name: 'phone', width: 375, height: 780 },
  { name: 'phone-lg', width: 414, height: 860 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1024, height: 800 },
  { name: 'desktop', width: 1440, height: 900 },
];

if (shots) await mkdir('.screenshots/responsive', { recursive: true });

const browser = await chromium.launch();
let failures = 0;

for (const size of WIDTHS) {
  const page = await browser.newPage({
    viewport: { width: size.width, height: size.height },
    deviceScaleFactor: 1,
  });

  for (const route of ROUTES) {
    try {
      await page.goto(`${base}${route}`, { waitUntil: 'load', timeout: 30000 });
    } catch {
      console.log(`  ${size.name.padEnd(9)} ${route.padEnd(14)} LOAD FAILED`);
      continue;
    }
    await page.waitForTimeout(250);

    const report = await page.evaluate((viewport) => {
      const docWidth = document.documentElement.scrollWidth;
      const overflows = [];

      if (docWidth > viewport + 1) {
        for (const el of document.querySelectorAll('body *')) {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;
          // Only the element itself sticking out, not a parent clipped by it.
          if (rect.right > viewport + 1 || rect.left < -1) {
            const style = getComputedStyle(el);
            if (style.position === 'fixed') continue;
            overflows.push({
              tag: el.tagName.toLowerCase(),
              cls: (typeof el.className === 'string' ? el.className : '').slice(0, 60),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
            });
          }
        }
      }

      // Tap targets below the 24x24 minimum, per WCAG 2.2 target size.
      const small = [];
      for (const el of document.querySelectorAll('a, button, [role="button"]')) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        if (rect.width < 24 || rect.height < 24) {
          small.push(`${el.tagName.toLowerCase()}.${(typeof el.className === 'string' ? el.className : '').slice(0, 30)} ${Math.round(rect.width)}x${Math.round(rect.height)}`);
        }
      }

      return { docWidth, overflows: overflows.slice(0, 6), small: small.slice(0, 4) };
    }, size.width);

    const bad = report.docWidth > size.width + 1;
    if (bad || report.small.length) failures++;

    if (bad) {
      console.log(
        `  ${size.name.padEnd(9)} ${route.padEnd(14)} OVERFLOW ${report.docWidth}px > ${size.width}px`
      );
      for (const o of report.overflows) {
        console.log(`      ${o.tag}.${o.cls} w=${o.width} right=${o.right}`);
      }
    }
    if (report.small.length) {
      console.log(`  ${size.name.padEnd(9)} ${route.padEnd(14)} SMALL TARGETS`);
      for (const s of report.small) console.log(`      ${s}`);
    }

    if (shots) {
      await page.screenshot({
        path: `.screenshots/responsive/${size.name}${route.replace(/\//g, '_') || '_home'}.png`,
        fullPage: true,
      });
    }
  }

  await page.close();
}

await browser.close();
console.log(failures === 0 ? '\nNo overflow or small-target findings.' : `\n${failures} finding(s).`);
