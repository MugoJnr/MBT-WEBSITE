const { chromium } = require('playwright');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'assets', 'img');
const BASE = 'http://127.0.0.1:18080';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });

  await page.fill('#lu', 'admin');
  await page.fill('#lp', 'admin.123');
  await page.click('button.l-btn');

  await page.waitForSelector('#app.on', { timeout: 15000 }).catch(async () => {
    const err = await page.textContent('#lerr').catch(() => '');
    throw new Error('Login failed: ' + (err || 'no #app.on'));
  });

  await page.waitForTimeout(1500);

  await page.evaluate(() => {
    const setText = (id, text, cls) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.textContent = text;
      if (cls) el.className = cls;
    };
    const setColor = (id, text, good) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.textContent = text;
      el.className = 'mv ' + (good ? 'g' : 'r');
    };

    document.querySelectorAll('#toast-container .toast, #toast-container > *').forEach(n => n.remove());

    const huser = document.getElementById('huser');
    if (huser) huser.textContent = 'MBT Client [CLIENT]';

    const hmb = document.getElementById('hdr-mode');
    if (hmb) {
      hmb.textContent = 'LIVE';
      hmb.className = 'hdr-mode live';
    }

    setText('m-bal', '$812.00', 'mv c');
    setText('m-balsub', 'Live USDT');

    setColor('m-dpnl', '+$18.40', true);
    const dpnlCard = document.getElementById('m-dpnl');
    if (dpnlCard && dpnlCard.nextElementSibling) dpnlCard.nextElementSibling.textContent = '+2.3% today';

    setColor('m-tpnl', '+$127.60', true);
    setText('m-tpnlpct', '+18.6% all-time');

    const mwl = document.getElementById('m-wl');
    if (mwl) mwl.innerHTML = '<span style="color:var(--green)">14</span> / <span style="color:var(--red)">6</span>';
    setText('m-wr', 'Win rate: 70%');

    const agp = document.getElementById('ap-gold-pnl');
    if (agp) {
      agp.textContent = '+$42.30';
      agp.style.color = 'var(--green)';
    }

    const modeBanner = document.getElementById('mode-banner');
    if (modeBanner) modeBanner.style.display = 'none';
    const kbanner = document.getElementById('kbanner');
    if (kbanner) kbanner.classList.remove('show');

    window.toast = () => {};
  });

  await page.waitForTimeout(500);

  const pngPath = path.join(OUT_DIR, 'trading-dashboard.png');
  await page.locator('#app').screenshot({ path: pngPath, type: 'png' });
  console.log('Saved', pngPath);

  await browser.close();
})().catch(err => {
  console.error(err);
  process.exit(1);
});
