const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const outDir = process.argv[2];
const targets = [
  { url: "https://examhub-kenya.pages.dev", file: "examhub-raw.png", fullPage: true },
  { url: "https://trading.mugobyte.com", file: "trading-raw.png", fullPage: true },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const results = [];
  for (const t of targets) {
    const page = await context.newPage();
    let status = "error";
    let title = "";
    let finalUrl = t.url;
    let loginHint = "";
    try {
      const resp = await page.goto(t.url, { waitUntil: "domcontentloaded", timeout: 90000 });
      status = resp ? String(resp.status()) : "no-response";
      finalUrl = page.url();
      title = await page.title();
      try { await page.waitForLoadState("networkidle", { timeout: 15000 }); } catch {}
      const bodyText = (await page.locator("body").innerText()).slice(0, 3000).toLowerCase();
      if (/sign in|log in|login|password|email|authenticate/.test(bodyText)) loginHint = "likely-login";
      if (/dashboard|portfolio|positions|orders/.test(bodyText)) loginHint = loginHint ? loginHint + ";maybe-dashboard" : "maybe-dashboard";
      await page.waitForTimeout(1500);
      const outPath = path.join(outDir, t.file);
      await page.screenshot({ path: outPath, fullPage: t.fullPage });
      results.push({ ...t, outPath, status, title, finalUrl, loginHint, saved: fs.existsSync(outPath), bytes: fs.statSync(outPath).size });
    } catch (e) {
      results.push({ ...t, error: String(e), status, title, finalUrl, loginHint });
    } finally {
      await page.close();
    }
  }
  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})();
