// MBT website build — assembles pages from shared partials.
// Zero dependencies. Run: node build.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const read = (p) => readFileSync(join("src", p), "utf8");

const head = read("partials/head.html");
const nav = read("partials/nav.html");
const footer = read("partials/footer.html");

const SITE_URL = "https://mugobyte.com";
// Bump on every CSS/JS change so visitors get fresh assets immediately.
const ASSET_VER = new Date().toISOString().slice(0, 19).replaceAll(/[-:T]/g, "");

// Every route in one place — single source of truth for titles/descriptions.
const pages = [
  {
    slug: "", file: "home",
    title: "MugoByte Technologies (MBT) — Software, Hosting & AI Systems in Kenya",
    desc: "MBT builds and hosts practical software for Kenyan businesses: the MBT POS System, Farm Management System, AI Trading Bot, web development and managed cloud hosting.",
  },
  {
    slug: "services", file: "services",
    title: "Services — Web Development, Cloud Hosting & AI Systems | MugoByte",
    desc: "Website design and development, MBT-managed cloud hosting, business software, farm systems, AI development, automation and technical support for Kenyan businesses.",
  },
  {
    slug: "pos", file: "pos",
    title: "MBT POS System — Point of Sale & Business Management | MugoByte",
    desc: "The MBT POS System handles sales, inventory, receipts, reports and staff accounts for shops, supermarkets, pharmacies and restaurants. Request a demo.",
  },
  {
    slug: "farm", file: "farm",
    title: "MBT Farm Record Management System for Dairy Farmers | MugoByte",
    desc: "Digital record keeping for dairy farms: livestock registers, milk production, vaccination reminders, feed inventory and farm finances — replacing paper records.",
  },
  {
    slug: "trading", file: "trading",
    title: "MBT AI Trading Bot — Automated Crypto & Gold Trading | MugoByte",
    desc: "A 24/7 automated trading system for crypto and gold markets with multi-strategy analysis and built-in risk management. Live dashboard for authorised users.",
  },
  {
    slug: "ceo", file: "ceo",
    title: "Eugene Mugo — Founder & CEO of MugoByte Technologies",
    desc: "Eugene Mugo founded MBT to build practical, reliable software for Kenya. Self-taught developer behind the MBT POS System, Farm System and AI Trading Bot.",
  },
  {
    slug: "about", file: "about",
    title: "About MBT — Our Story, Values & Infrastructure | MugoByte Technologies",
    desc: "MBT is a Kenya-based technology company building and hosting its own systems since 2023 — from POS and farm management to AI trading infrastructure.",
  },
  {
    slug: "contact", file: "contact",
    title: "Contact MBT — Start a Project or Ask a Question | MugoByte",
    desc: "Talk to MugoByte Technologies about your project. Phone +254 112 863 252, email admin@mugobyte.com. We respond within one business day.",
  },
  {
    slug: "support", file: "support",
    title: "Support MBT — Keep Free Tools Like ExamHub Running | MugoByte",
    desc: "Optional contributions help MBT cover hosting and development costs for free tools like ExamHub Kenya. Support via M-Pesa or get in touch.",
  },
  {
    slug: "404", file: "404",
    title: "Page Not Found | MugoByte Technologies",
    desc: "The page you are looking for does not exist. Head back to the MugoByte Technologies homepage.",
    noindex: true,
  },
];

for (const page of pages) {
  const body = read(`pages/${page.file}.html`);
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
  .replaceAll("{{OG_TYPE}}", page.file === "home" ? "website" : "website")
  .replaceAll("{{VER}}", ASSET_VER)
}
<body>
${nav}
<main>
${body}
</main>
${footer}
<script src="/assets/js/main.js?v=${ASSET_VER}" defer></script>
</body>
</html>
`;
  const outName = page.slug === "" ? "index.html" : `${page.slug === "404" ? "404" : page.slug}.html`;
  writeFileSync(outName, html);
  console.log("built", outName);
}
