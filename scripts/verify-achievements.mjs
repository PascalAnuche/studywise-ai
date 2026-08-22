import { chromium } from 'playwright';
const base = process.argv[2] ?? 'http://localhost:3413';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 1100 } });
await p.goto(base + '/achievements', { waitUntil: 'load' });
await p.waitForTimeout(900);
const tab = (n) => p.getByRole('tab', { name: new RegExp(n, 'i') });
const shot = (n) => p.screenshot({ path: `.screenshots/ach2-${n}.png`, clip: { x: 260, y: 60, width: 860, height: 760 } });

await tab('milestones').click(); await p.waitForTimeout(400);
const ms = await p.locator('[class*="timelineItem"]').count();
const titles = await p.locator('[class*="timelineTitle"]').allTextContents();
console.log('milestones      :', ms, '|', titles.join(' / '));
await shot('milestones');

await tab('streaks').click(); await p.waitForTimeout(400);
const figs = await p.locator('[class*="streakFigureValue"]').allTextContents();
console.log('streak figures  :', figs.join(' | '));
console.log('heatmap cells   :', await p.locator('[class*="heatGrid"] [class*="heatCell"]').count());

// The defect: each label must sit on the row it names.
const align = await p.evaluate(() => {
  const labels = [...document.querySelectorAll('[class*="heatDays"] span')];
  const firstWeek = document.querySelector('[class*="heatWeek"]');
  const cells = [...firstWeek.children];
  const mid = (el) => { const r = el.getBoundingClientRect(); return Math.round(r.top + r.height / 2); };
  return [0, 2, 4].map(i => ({ label: labels[i].textContent, delta: mid(labels[i]) - mid(cells[i]) }));
});
console.log('label alignment :', align.map(a => `${a.label}=${a.delta}px`).join(' '));
await shot('streaks');

await tab('leaderboard').click(); await p.waitForTimeout(400);
const recs = await p.locator('[class*="bestValue"]').allTextContents();
const dets = await p.locator('[class*="bestDetail"]').allTextContents();
console.log('records         :', recs.join(' | '));
console.log('details         :', dets.join(' | '));
await shot('leaderboard');
await b.close();
