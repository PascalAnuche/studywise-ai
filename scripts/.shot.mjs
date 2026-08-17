import { chromium } from 'playwright';
const [url, out, w, h] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto(url, { waitUntil: 'load' });
await p.waitForTimeout(500);
await p.screenshot({ path: out, fullPage: true });
await b.close();
console.log('ok ' + out);
