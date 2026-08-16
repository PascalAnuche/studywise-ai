#!/usr/bin/env node
// Drives flow 2 — create a study plan — from the Create New Plan button through
// to the saved confirmation, capturing each step.
//
// A wizard is exactly the kind of thing that typechecks and then dead-ends on
// step 3, so it is walked rather than eyeballed.
// Usage: node scripts/flowshot.mjs <baseUrl>
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = process.argv[2] ?? 'http://localhost:3220';
await mkdir('.screenshots/flow2', { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });

const shot = (name) => page.screenshot({ path: `.screenshots/flow2/${name}.png` });
const heading = () => page.locator('[class*="Wizard_title"]').first().textContent();

await page.goto(`${base}/planner`, { waitUntil: 'load' });
await page.getByRole('button', { name: /create new plan/i }).first().click();
await page.waitForTimeout(400);
console.log('1 subject   :', (await heading())?.trim());
await shot('1-subject');

await page.getByText('Data Structures', { exact: true }).click();
await page.getByRole('button', { name: /^continue$/i }).click();
await page.waitForTimeout(300);
console.log('2 goals     :', (await heading())?.trim());
await shot('2-goals');

await page.getByText('Understand concepts').click();
await page.getByText('Prepare for exam').click();
await page.getByRole('button', { name: /^continue$/i }).click();
await page.waitForTimeout(300);
console.log('3 topics    :', (await heading())?.trim());

await page.getByText('Arrays', { exact: true }).click();
await page.getByText('Linked Lists', { exact: true }).click();
await page.getByText('Recursion', { exact: true }).click();
await shot('3-topics');
await page.getByRole('button', { name: /^continue$/i }).click();
await page.waitForTimeout(300);
console.log('4 dates     :', (await heading())?.trim());
await shot('4-dates');

// Generation is a real request against the adapter.
await page.getByRole('button', { name: /generate plan/i }).click();
await page.waitForTimeout(600);
await shot('5-generating');
console.log('5 generating:', (await heading())?.trim());

await page.locator('[class*="Wizard_title"]', { hasText: /review your plan/i }).waitFor({ timeout: 30000 });
console.log('6 review    :', (await heading())?.trim());
const sessions = await page.locator('[role="dialog"] li').count();
console.log('   topics listed:', sessions);
await shot('6-review');

await page.getByRole('button', { name: /save plan/i }).click();
await page.locator('[class*="Wizard_title"]', { hasText: /plan saved/i }).waitFor({ timeout: 20000 });
console.log('7 saved     :', (await heading())?.trim());
await shot('7-saved');

// Back navigation has to actually go back, not restart.
console.log('\nback-navigation check:');
await page.goto(`${base}/planner`, { waitUntil: 'load' });
await page.getByRole('button', { name: /create new plan/i }).first().click();
await page.waitForTimeout(300);
await page.getByText('Algorithms', { exact: true }).click();
await page.getByRole('button', { name: /^continue$/i }).click();
await page.waitForTimeout(250);
await page.getByRole('button', { name: /^back$/i }).click();
await page.waitForTimeout(250);
console.log('  after Back  :', (await heading())?.trim());
const stillChecked = await page.getByRole('radio', { name: 'Algorithms' }).isChecked();
console.log('  choice kept :', stillChecked);

await browser.close();
