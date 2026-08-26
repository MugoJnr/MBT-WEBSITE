const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("https://trading.mugobyte.com", { waitUntil: "domcontentloaded", timeout: 60000 });
  try { await page.waitForLoadState("networkidle", { timeout: 15000 }); } catch {}
  await page.waitForTimeout(2000);
  const out = "C:\\Users\\mugoj\\.cursor\\projects\\c-Users-mugoj-OneDrive-Desktop-MBT-WEBSITE-repo\\mbt-work\\assets\\img\\trading-raw.png";
  await page.screenshot({ path: out, fullPage: true });
  const dims = await page.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, scrollH: document.documentElement.scrollHeight, bodyH: document.body.scrollHeight }));
  console.log(JSON.stringify(dims));
  await browser.close();
})();
