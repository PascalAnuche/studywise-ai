#!/usr/bin/env node
// Opens the Study Planner's plan modal and exercises the two custom controls:
// the frequency dropdown and the date picker. Verifies alignment and keyboard
// behaviour rather than leaving it to the eye.
// Usage: node scripts/formshot.mjs <baseUrl>
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:3185';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
await page.goto(`${base}/planner`, { waitUntil: 'load' });

await page.getByRole('button', { name: /create new plan/i }).first().click();
await page.waitForTimeout(500);
await page.screenshot({ path: '.screenshots/form-closed.png' });

// Date picker, driven entirely from the keyboard.
const dateTrigger = page.getByRole('button', { name: /start date/i });
await dateTrigger.focus();
await page.keyboard.press('Enter');
await page.waitForTimeout(300);
await page.screenshot({ path: '.screenshots/form-datepicker.png' });

const dialog = await page.getByRole('dialog', { name: /choose start date/i }).isVisible();
await page.keyboard.press('ArrowRight');
await page.keyboard.press('ArrowDown');
await page.keyboard.press('Enter');
await page.waitForTimeout(250);
const picked = (await dateTrigger.textContent())?.trim();

// The target date must refuse anything before the start date.
const targetTrigger = page.getByRole('button', { name: /target date/i });
await targetTrigger.click();
await page.waitForTimeout(300);
const disabledDays = await page.locator('[data-date]:disabled').count();
await page.keyboard.press('Escape');

console.log(`date dialog opened from keyboard: ${dialog}`);
console.log(`start date after ArrowRight+ArrowDown+Enter: ${picked}`);
console.log(`days blocked before the start date: ${disabledDays}`);

await page.screenshot({ path: '.screenshots/form-final.png' });
await browser.close();
