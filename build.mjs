// MBT website build | assembles pages from shared partials + central data.
// Zero dependencies. Run: node build.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { company, nav, mobileNav, products, services, faqs } from "./src/data/site.mjs";

const read = (p) => readFileSync(join("src", p), "utf8");

const head = read("partials/head.html");
const SITE_URL = company.domain;
// Bump on every CSS/JS change so visitors get fresh assets immediately.
const ASSET_VER = new Date().toISOString().slice(0, 19).replaceAll(/[-:T]/g, "");

/* ---------- icon library (inline SVG, stroke style) ---------- */
const icons = {
  pos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 9 5 3h14l2 6M3 9h18M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9M9 13h6"/></svg>',
  farm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 21V9m0 0C12 5 9 3 4 3c0 5 3 7 8 6Zm0 3c0-4 3-6 8-6 0 5-3 7-8 6Z"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 17l6-6 4 4 8-8m0 0h-5m5 0v5"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 6c-1.8-1.6-4.2-2-8-2v14c3.8 0 6.2.4 8 2 1.8-1.6 4.2-2 8-2V4c-3.8 0-6.2.4-8 2Zm0 0v14"/></svg>',
  pulse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 12h4l2-7 4 14 2-7h6"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z"/><path d="M8.7 9.2c0 3.2 2.9 6.1 6.1 6.1l1.5-1.5-1.9-1.3-1 .6a4.4 4.4 0 0 1-2.5-2.5l.6-1-1.3-1.9-1.5 1.5Z" fill="currentColor" stroke="none"/></svg>',
};

const icon = (name) => icons[name] || "";

/* ---------- generated fragments ---------- */
function renderNav() {
  const links = nav
    .map((n) => `      <a class="nav-link" href="${n.href}" data-page="${n.page}">${n.label}</a>`)
    .join("\n");
  return `<header class="nav" id="navbar">
  <div class="nav-inner">
    <a class="nav-brand" href="/" aria-label="MugoByte Technologies | Home">
      <img src="/assets/img/mugobyte-logo.webp" alt="MugoByte Technologies logo" width="118" height="46">
    </a>
    <nav class="nav-links" aria-label="Primary">
${links}
      <a class="nav-link" href="${company.portal}" target="_blank" rel="noopener">Portal</a>
      <a class="btn btn-primary btn-sm nav-cta" href="/contact">Get in Touch</a>
    </nav>
    <button class="nav-burger" id="navBurger" aria-expanded="false" aria-controls="mobileMenu" aria-label="Toggle navigation menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>
<div class="mobile-menu" id="mobileMenu">
${mobileNav
  .map(
    (n) =>
      `  <a class="mobile-link" href="${n.href}" data-page="${n.page}">${n.label}</a>`
  )
  .join("\n")}
  <a class="mobile-link" href="${company.portal}" target="_blank" rel="noopener">Portal ↗</a>
  <a class="btn btn-primary mobile-cta" href="/contact">Get in Touch</a>
</div>`;
}

function renderFooter() {
  const socials = company.socials
    .map(
      (s) =>
        `          <a class="social-btn" href="${s.href}" target="_blank" rel="noopener" aria-label="${company.name} on ${s.name}" title="${s.name}">${icon(s.icon)}</a>`
    )
    .join("\n");
  return `<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="/" aria-label="MugoByte Technologies | Home">
          <img src="/assets/img/mugobyte-logo.webp" alt="MugoByte Technologies logo" width="123" height="48" loading="lazy">
        </a>
        <p>Practical software for Kenyan businesses | built, hosted and supported by the people who made it.</p>
        <div class="social-row" style="margin-top:18px">
${socials}
        </div>
      </div>
      <div>
        <h4>Products</h4>
        <div class="footer-links">
          <a href="/pos">MugoByte POS</a>
          <a href="/farm">Farm Management</a>
          <a href="/trading">AI Trading Bot</a>
          <a href="/services#pulse">Pulse</a>
          <a href="${company.examhub}" target="_blank" rel="noopener">ExamHub Kenya</a>
        </div>
      </div>
      <div>
        <h4>Company</h4>
        <div class="footer-links">
          <a href="/services">Services</a>
          <a href="/about">About MBT</a>
          <a href="/ceo">Leadership</a>
          <a href="/support">Support MBT</a>
          <a href="/contact">Contact</a>
        </div>
      </div>
      <div class="footer-newsletter">
        <h4>Stay Updated</h4>
        <p>Occasional news on new MBT products and updates. No spam.</p>
        <form class="newsletter-form" id="newsletterForm" novalidate>
          <label for="newsletterEmail" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Email address</label>
          <input class="input" type="email" id="newsletterEmail" name="email" placeholder="you@email.com" autocomplete="email" required>
          <button type="submit" class="btn btn-primary btn-sm">Subscribe</button>
        </form>
        <p class="newsletter-status" id="newsletterStatus" role="status" aria-live="polite"></p>
        <div class="footer-contact">
          <b>Call Us</b>
          <span>${company.phone} · Mon to Sat, 8AM to 6PM EAT</span>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© <span data-year>2026</span> ${company.name} (MBT). All rights reserved.</p>
      <p>${company.tagline}</p>
    </div>
  </div>
</footer>`;
}

function renderProductCards() {
  return products
    .map(
      (p, i) => `      <a class="card hoverable card-link reveal${i % 4 === 1 ? " reveal-d1" : i % 4 === 2 ? " reveal-d2" : i % 4 === 3 ? " reveal-d3" : ""}" href="${p.href}"${p.external ? ' target="_blank" rel="noopener"' : ""} style="padding:0;overflow:hidden">
        <div class="product-media" style="border:none;border-radius:0;aspect-ratio:1"><img src="${p.image}" alt="${p.name}" width="512" height="512" loading="lazy"></div>
        <div style="padding:18px 20px 22px">
          <h3 style="font-size:15.5px">${p.name}</h3>
          <p style="font-size:13px">${p.tagline}</p>
        </div>
      </a>`
    )
    .join("\n");
}

function renderProductTiles() {
  return products
    .map(
      (p) => `        <a class="card hoverable card-link reveal" href="${p.href}"${p.external ? ' target="_blank" rel="noopener"' : ""}>
          <div class="icon-tile ${p.tone}">${icon(p.icon)}</div>
          <h3>${p.name}</h3>
          <p>${p.description}</p>
          <div class="tag-row">${p.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
        </a>`
    )
    .join("\n");
}

function renderServiceOptions() {
  return services
    .map((s) => `              <option>${s}</option>`)
    .join("\n");
}

function renderFaqs() {
  return faqs
    .map(
      (f) => `            <div class="faq-item">
              <button class="faq-q" aria-expanded="false">${f.q}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
              <div class="faq-a"><p>${f.a}</p></div>
            </div>`
    )
    .join("\n");
}

/* ---------- page registry ---------- */
const pages = [
  {
    slug: "", file: "home",
    title: "MugoByte Technologies (MBT) | Software, Hosting & AI Systems in Kenya",
    desc: "MBT builds and hosts practical software for Kenyan businesses: the MBT POS System, Farm Management System, AI Trading Bot, web development and managed cloud hosting.",
  },
  {
    slug: "services", file: "services",
    title: "Services | Web Development, Cloud Hosting & AI Systems | MugoByte",
    desc: "Website design and development, MBT-managed cloud hosting, business software, farm systems, AI development, automation and technical support for Kenyan businesses.",
  },
  {
    slug: "pos", file: "pos",
    title: "MugoByte POS | Point of Sale & Business Management | MugoByte",
    desc: "The MugoByte POS System handles sales, inventory, receipts, reports and staff accounts for shops, supermarkets, pharmacies and restaurants. Request a demo.",
  },
  {
    slug: "farm", file: "farm",
    title: "MBT Farm Record Management System for Dairy Farmers | MugoByte",
    desc: "Digital record keeping for dairy farms: livestock registers, milk production, vaccination reminders, feed inventory and farm finances | replacing paper records.",
  },
  {
    slug: "trading", file: "trading",
    title: "MBT AI Trading Bot | Automated Crypto & Gold Trading | MugoByte",
    desc: "A 24/7 automated trading system for crypto and gold markets with multi-strategy analysis and built-in risk management. Live dashboard for authorised users.",
  },
  {
    slug: "ceo", file: "ceo",
    title: "Eugene Mugo | Founder & CEO of MugoByte Technologies",
    desc: "Eugene Mugo founded MBT to build practical, reliable software for Kenya. Self-taught developer behind the MBT POS System, Farm System and AI Trading Bot.",
  },
  {
    slug: "about", file: "about",
    title: "About MBT | Our Story, Values & Infrastructure | MugoByte Technologies",
    desc: "MBT is a Kenya-based technology company building and hosting its own systems since 2023 | from POS and farm management to AI trading infrastructure.",
  },
  {
    slug: "contact", file: "contact",
    title: "Contact MBT | Start a Project or Ask a Question | MugoByte",
    desc: "Talk to MugoByte Technologies about your project. Phone +254 112 863 252, email admin@mugobyte.com. We respond within one business day.",
  },
  {
    slug: "support", file: "support",
    title: "Support MBT | Keep Free Tools Like ExamHub Running | MugoByte",
    desc: "Optional contributions help MBT cover hosting and development costs for free tools like ExamHub Kenya. Support via M-Pesa or get in touch.",
  },
  {
    slug: "404", file: "404",
    title: "Page Not Found | MugoByte Technologies",
    desc: "The page you are looking for does not exist. Head back to the MugoByte Technologies homepage.",
    noindex: true,
  },
];

/* ---------- assemble ---------- */
for (const page of pages) {
  let body = read(`pages/${page.file}.html`)
    .replaceAll("{{PRODUCT_CARDS}}", renderProductCards())
    .replaceAll("{{PRODUCT_TILES}}", renderProductTiles())
    .replaceAll("{{SERVICE_OPTIONS}}", renderServiceOptions())
    .replaceAll("{{FAQS}}", renderFaqs());

  const canonical = `${SITE_URL}/${page.slug}`;
  const robots = page.noindex
    ? '<meta name="robots" content="noindex, follow">'
    : '<meta name="robots" content="index, follow">';
  const html = `<!DOCTYPE html>
<html lang="en">
${head
  .replaceAll("{{TITLE}}", page.title)
  .replaceAll("{{DESC}}", page.desc)
  .replaceAll("{{CANONICAL}}", canonical)
  .replaceAll("{{ROBOTS}}", robots)
  .replaceAll("{{OG_TYPE}}", "website")
  .replaceAll("{{VER}}", ASSET_VER)
}
<body>
${renderNav()}
<main>
${body}
</main>
${renderFooter()}
<script src="/assets/js/main.js" defer></script>
</body>
</html>
`;
  // Version every local asset reference so deploys always serve fresh files
  const finalHtml = html.replace(
    /(\/assets\/(?:img|css|js)\/[a-z0-9\-]+\.(?:webp|jpg|jpeg|png|css|js))(?!\?)/g,
    "$1?v=" + ASSET_VER
  );
  const outName = page.slug === "" ? "index.html" : `${page.slug}.html`;
  writeFileSync(outName, finalHtml);
  console.log("built", outName);
}
