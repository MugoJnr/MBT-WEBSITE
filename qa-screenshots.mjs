import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const outDir = 'C:\\Users\\mugoj\\.cursor\\projects\\c-Users-mugoj-OneDrive-Desktop-MBT-WEBSITE-repo\\qa-shots';
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const base = 'http://localhost:3456/';

const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await desktop.goto(base, { waitUntil: 'networkidle' });
await desktop.screenshot({ path: path.join(outDir, 'desktop-1440-hero.png') });
await desktop.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
await desktop.waitForTimeout(500);
await desktop.screenshot({ path: path.join(outDir, 'desktop-1440-mid.png') });
await desktop.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await desktop.waitForTimeout(500);
await desktop.screenshot({ path: path.join(outDir, 'desktop-1440-footer.png') });
await desktop.close();

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(base, { waitUntil: 'networkidle' });
await mobile.screenshot({ path: path.join(outDir, 'mobile-390-hero.png') });
await mobile.click('#navBurger');
await mobile.waitForTimeout(400);
await mobile.screenshot({ path: path.join(outDir, 'mobile-390-nav-open.png') });
await mobile.close();

await browser.close();
console.log('Screenshots saved to', outDir);
