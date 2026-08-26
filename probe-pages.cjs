const { chromium } = require("playwright");
(async () => {
  for (const url of ["https://examhub-kenya.pages.dev","https://trading.mugobyte.com"]) {
    const b = await chromium.launch({ headless: true });
    const p = await (await b.newContext()).newPage();
    await p.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    try { await p.waitForLoadState("networkidle", { timeout: 12000 }); } catch {}
    const h1 = await p.locator("h1").allTextContents();
    const buttons = await p.locator("button, a[role=button], input[type=submit]").allTextContents();
    const text = (await p.locator("body").innerText()).replace(/\s+/g," ").trim().slice(0,500);
    console.log(JSON.stringify({ url, title: await p.title(), h1, buttons: buttons.slice(0,15), textSnippet: text }, null, 2));
    await b.close();
  }
})();
