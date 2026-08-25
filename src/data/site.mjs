// Single source of truth for repeated site content.
// build.mjs imports this and generates nav, footer, product cards and FAQs.

export const company = {
  name: "MugoByte Technologies",
  shortName: "MBT",
  domain: "https://mugobyte.com",
  tagline: "Smart Technology. Real Results.",
  description:
    "MugoByte Technologies builds and hosts practical software for Kenyan businesses.",
  phone: "+254 112 863 252",
  phoneHref: "tel:+254112863252",
  whatsapp: "https://wa.me/254112863252",
  email: "admin@mugobyte.com",
  location: "Nairobi, Kenya — serving clients across East Africa",
  hours: "Monday – Saturday · 8:00 AM – 6:00 PM EAT",
  socials: [
    { name: "Instagram", href: "https://www.instagram.com/mugobyte/", icon: "instagram" },
    { name: "WhatsApp", href: "https://wa.me/254112863252", icon: "whatsapp" },
  ],
  portal: "https://portal.mugobyte.com",
  trading: "https://trading.mugobyte.com",
  examhub: "https://examhub-kenya.pages.dev",
};

export const nav = [
  { label: "Home", href: "/", page: "home" },
  { label: "Services", href: "/services", page: "services" },
  { label: "POS", href: "/pos", page: "pos" },
  { label: "Farm", href: "/farm", page: "farm" },
  { label: "Trading", href: "/trading", page: "trading" },
  { label: "About", href: "/about", page: "about" },
];

export const mobileNav = [
  ...nav,
  { label: "Leadership", href: "/ceo", page: "ceo" },
  { label: "Support MBT", href: "/support", page: "support" },
];

export const products = [
  {
    id: "pos",
    name: "MugoByte POS",
    shortName: "POS",
    tagline: "Point of sale for Kenyan retail",
    description:
      "Sales, stock, receipts, staff and reports in one system — on your phone or computer, backed up to the cloud.",
    tags: ["Inventory", "Receipts", "Reports"],
    href: "/pos",
    image: "/assets/img/pos.webp",
    icon: "pos",
    tone: "gold",
  },
  {
    id: "farm",
    name: "Farm Management",
    shortName: "Farm",
    tagline: "Farm records without paper",
    description:
      "Livestock registers, milk production, vaccination schedules and farm finances tracked automatically.",
    tags: ["Livestock", "Milk Records", "Alerts"],
    href: "/farm",
    image: "/assets/img/farm.webp",
    icon: "farm",
    tone: "green",
  },
  {
    id: "trading",
    name: "AI Trading Bot",
    shortName: "Trading",
    tagline: "Automated crypto & gold trading",
    description:
      "Runs 24/7 across crypto and gold markets with multi-strategy analysis and hard risk limits.",
    tags: ["Crypto", "Gold", "24/7"],
    href: "/trading",
    image: "/assets/img/trading.webp",
    icon: "chart",
    tone: "",
  },
  {
    id: "examhub",
    name: "ExamHub Kenya",
    shortName: "ExamHub",
    tagline: "Free study platform for students",
    description:
      "Past papers, notes and an AI study assistant for every Kenyan university. Free, forever.",
    tags: ["Free Forever", "All Universities"],
    href: company.examhub,
    image: "/assets/img/examhub.webp",
    icon: "book",
    tone: "green",
    external: true,
  },
];

export const services = [
  "Website Design & Development",
  "Cloud Hosting",
  "MugoByte POS",
  "Farm Record Management System",
  "AI Trading Bot",
  "Business Software Development",
  "System Automation",
  "Technical Support",
  "Other",
];

export const faqs = [
  {
    q: "How long does a website take to build?",
    a: "Most standard websites are completed within 7–14 days. Complex web applications, e-commerce sites or custom systems may take 3–6 weeks depending on features and requirements.",
  },
  {
    q: "Does MBT provide hosting for all projects?",
    a: "Yes. MBT provides fully managed hosting on our own infrastructure for client websites and systems — performance, security and monitoring included, with a 99.9% uptime target.",
  },
  {
    q: "Is the MBT POS System available for small shops?",
    a: "Absolutely. The MBT POS System works for businesses of all sizes — from small kiosks to large supermarkets and wholesalers. Pricing is flexible to match your scale.",
  },
  {
    q: "How does MBT support clients after delivery?",
    a: "Ongoing technical support Monday–Saturday. Hosted projects include server monitoring, security updates and bug fixes. Premium support packages with faster response times are also available.",
  },
];
