/* ============================================================
   WULFTEK — STATIC SITE BUILD

   Assembles src/layout.html + src/partials/* + src/pages/* into
   plain HTML files at the repo root, and generates one page per
   make under /remap/ from the data in assets/js/data.js.

   Run it after editing anything in src/ or the MARQUE data:

       node tools/build.mjs

   Output is committed, so Vercel serves pure static files with no
   build step of its own.
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://wulftek-website.vercel.app";
const read = (...p) => readFileSync(join(ROOT, ...p), "utf8");

/* ---------------- page definitions ---------------- */
const PAGES = [
  {
    key: "index", path: "/", out: "index.html", accent: "perf",
    title: "WulfTek Tuning — ECU remapping in Telford, Shropshire",
    desc: "Independent ECU remapping in Telford for cars, vans, tractors and plant. Enter your registration for an instant idea of what your vehicle could do.",
    scripts: ["data.js", "reg-lookup.js"], schema: ["business", "faq"]
  },
  {
    key: "what-is-remapping", path: "/what-is-remapping", out: "what-is-remapping.html", accent: "perf",
    title: "What is ECU remapping? A plain-English guide | WulfTek Tuning",
    desc: "What a remap actually is, whether it's safe, whether it's legal, what it does to your insurance and warranty, and how to tell a good tuner from a bad one."
  },
  {
    key: "performance", path: "/performance", out: "performance.html", accent: "perf",
    title: "Performance ECU remapping in Telford | WulfTek Tuning",
    desc: "Stage 1 and Stage 2 performance remapping in Telford. More torque through the range you actually drive in, matched to your car's hardware and verified by data logging."
  },
  {
    key: "economy", path: "/economy", out: "economy.html", accent: "eco",
    title: "Economy remapping for cars, vans and fleets | WulfTek Tuning",
    desc: "Economy ECU remapping in Shropshire for commuters, vans and small fleets. Stronger low-end torque for better mpg, with no emissions equipment removed."
  },
  {
    key: "agricultural", path: "/agricultural", out: "agricultural.html", accent: "agri",
    title: "Tractor & agricultural remapping in Shropshire | WulfTek Tuning",
    desc: "ECU remapping for tractors, telehandlers and plant across Shropshire. More torque under sustained load and better fuel use per hour."
  },
  {
    key: "vehicles", path: "/vehicles", out: "vehicles.html", accent: "perf",
    title: "Vehicles we remap — cars, vans, tractors | WulfTek Tuning",
    desc: "Find your make and see typical remap figures. Audi, BMW, Volkswagen, Mercedes, Ford, Vauxhall, plus John Deere, New Holland, Fendt, JCB and more.",
    scripts: ["data.js", "reg-lookup.js"]
  },
  {
    key: "about", path: "/about", out: "about.html", accent: "perf",
    title: "Our story — three generations in the trade | WulfTek Tuning",
    desc: "From a grandfather's workshop to modern ECU calibration. The family history behind WulfTek Tuning in Telford, Shropshire."
  },
  {
    key: "events", path: "/events", out: "events.html", accent: "perf",
    title: "Events & car meets around Telford | WulfTek Tuning",
    desc: "Where to find WulfTek Tuning — shows, meets, charity runs and open evenings across Shropshire and the Midlands."
  },
  {
    key: "book", path: "/book", out: "book.html", accent: "perf",
    title: "Book a remap in Telford | WulfTek Tuning",
    desc: "Book your car, van, tractor or plant machinery in with WulfTek Tuning in Telford. Tell us the vehicle and we'll come back with what's realistic and what it costs.",
    scripts: ["booking.js"]
  }
];

/* ---------------- structured data ---------------- */
const SCHEMA = {
  business: {
    "@context": "https://schema.org", "@type": "AutoRepair", name: "WulfTek Tuning",
    description: "Independent ECU remapping and calibration for cars, vans, tractors and plant machinery.",
    url: SITE, priceRange: "££", image: SITE + "/assets/img/hero-workshop.jpg",
    address: {
      "@type": "PostalAddress", streetAddress: "[STREET]", addressLocality: "Telford",
      addressRegion: "Shropshire", postalCode: "[POSTCODE]", addressCountry: "GB"
    },
    areaServed: ["Telford", "Shrewsbury", "Wolverhampton", "Stafford", "Shropshire", "West Midlands"],
    makesOffer: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Performance ECU remapping" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Economy ECU remapping" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Agricultural and plant ECU remapping" } }
    ]
  },
  faq: {
    "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [
      ["Is remapping legal in the UK?", "Yes. Remapping is legal. You must declare it to your insurer, and we provide the details in writing. Removing emissions equipment is not legal for road use, which is why we do not do it."],
      ["Can a remap be reversed?", "Yes. The original factory file is read off and archived against your registration before anything is changed, so the vehicle can be returned to standard at any time."],
      ["Will a remap affect my insurance?", "It must be declared. A remap is a modification like any other and an undeclared one can invalidate a claim."],
      ["Does anything get removed from the engine?", "No. On a standard remap no parts are removed or replaced. The software is read out, rewritten and written back."]
    ].map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } }))
  }
};

/* ---------------- helpers ---------------- */
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const SERVICE_PAGES = ["performance", "economy", "agricultural"];

/** Mark the nav link for the current page so it renders as active. */
function markNav(header, key) {
  let out = header.replace(
    new RegExp(`(<a[^>]*?)data-r="${key}"([^>]*?)>`),
    (m, a, b) => {
      const withCurrent = `${a}data-r="${key}"${b} aria-current="page">`;
      return /class="/.test(withCurrent)
        ? withCurrent.replace(/class="([^"]*)"/, (_, c) => `class="${c} on"`)
        : withCurrent.replace("<a ", '<a class="on" ');
    }
  );
  /* the three service pages also light up their parent dropdown */
  if (SERVICE_PAGES.includes(key)) {
    out = out.replace('<button id="ddb"', '<button class="on" id="ddb"');
  }
  return out;
}

/** Load assets/js/data.js outside a browser so the build can read WT.MARQUE. */
function loadData() {
  const win = {};
  new Function("window", read("assets", "js", "data.js"))(win);
  return win.WT;
}

/* ---------------- build ---------------- */
const layout = read("src", "layout.html");
const header = read("src", "partials", "header.html");
const footer = read("src", "partials", "footer.html");
const { MARQUE } = loadData();

function render({ key, path, accent, title, desc, scripts = [], schema = [], body, depth = 0 }) {
  const js = ["config.js", "site.js", ...scripts]
    .map((f) => `<script src="/assets/js/${f}" defer></script>`).join("\n");
  const head = schema
    .map((s) => `<script type="application/ld+json">${JSON.stringify(SCHEMA[s])}</script>`).join("\n");

  return layout
    .replace(/\{\{TITLE\}\}/g, esc(title))
    .replace(/\{\{DESC\}\}/g, esc(desc))
    .replace(/\{\{SITE\}\}/g, SITE)
    .replace(/\{\{PATH\}\}/g, path)
    .replace(/\{\{ACCENT\}\}/g, accent)
    .replace(/\{\{KEY\}\}/g, key)
    .replace(/\{\{HEAD\}\}/g, head)
    .replace(/\{\{HEADER\}\}/g, markNav(header, key))
    .replace(/\{\{CONTENT\}\}/g, body)
    .replace(/\{\{FOOTER\}\}/g, footer)
    .replace(/\{\{SCRIPTS\}\}/g, js);
}

const written = [];
const urls = [];

/* --- the vehicle index is filled in at build time so the make links
       are real HTML rather than something only a script can see --- */
function marqueLists() {
  const link = (k, m) => `<a href="/remap/${k}">${esc(m.name)}<i>${m.models.length}</i></a>`;
  const road = Object.entries(MARQUE).filter(([, m]) => m.kind !== "agri").map(([k, m]) => link(k, m)).join("");
  const agri = Object.entries(MARQUE).filter(([, m]) => m.kind === "agri").map(([k, m]) => link(k, m)).join("");
  return { road, agri };
}

/* the 404 is built like any other page but stays out of the sitemap */
const NOT_FOUND = {
  key: "404", path: "/404", out: "404.html", accent: "perf",
  title: "Page not found | WulfTek Tuning",
  desc: "That page isn't here. Enter your registration to see what your vehicle could gain, or head back to the home page.",
  scripts: ["data.js", "reg-lookup.js"]
};

for (const page of PAGES) {
  let body = read("src", "pages", page.key + ".html");
  if (page.key === "vehicles") {
    const { road, agri } = marqueLists();
    body = body
      .replace('<div class="mq rv" id="mq-road"></div>', `<div class="mq rv">${road}</div>`)
      .replace('<div class="mq rv" id="mq-agri"></div>', `<div class="mq rv">${agri}</div>`);
  }
  writeFileSync(join(ROOT, page.out), render({ ...page, body }), "utf8");
  written.push(page.out);
  urls.push({ loc: SITE + page.path, priority: page.key === "index" ? "1.0" : "0.8" });
}

writeFileSync(join(ROOT, NOT_FOUND.out),
  render({ ...NOT_FOUND, body: read("src", "pages", "404.html") }), "utf8");
written.push(NOT_FOUND.out);

/* ---------------- one page per make ---------------- */
const tpl = read("src", "pages", "_marque.html");
mkdirSync(join(ROOT, "remap"), { recursive: true });

for (const [key, m] of Object.entries(MARQUE)) {
  const rows = m.models.map((r) =>
    `<tr><td><strong>${esc(r[0])}</strong></td><td class="n">${esc(r[1])}</td><td>${esc(r[2])}</td>` +
    `<td class="n">${esc(r[3])}</td><td class="gain">+${esc(String(r[4]).replace("+", ""))}</td></tr>`
  ).join("");

  const body = tpl
    .replace("{{KICK}}", m.kind === "agri" ? "Agricultural remapping" : "ECU remapping")
    .replace("{{H1}}", esc(m.name) + " remapping")
    .replace("{{LEDE}}", esc(m.blurb))
    .replace("{{ROWS}}", rows);

  const out = join("remap", key + ".html");
  writeFileSync(join(ROOT, out), render({
    key: "vehicles", path: "/remap/" + key, accent: m.kind === "agri" ? "agri" : "perf",
    title: `${m.name} remapping in Telford | WulfTek Tuning`,
    desc: `Typical ${m.name} remap figures from WulfTek Tuning in Telford, Shropshire. Original file always archived and the work is fully reversible.`,
    body
  }), "utf8");
  written.push(out);
  urls.push({ loc: SITE + "/remap/" + key, priority: "0.6" });
}

/* ---------------- sitemap ---------------- */
const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(ROOT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<!-- Generated by tools/build.mjs — do not edit by hand. -->\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) =>
    `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${u.priority}</priority></url>`
  ).join("\n") + `\n</urlset>\n`, "utf8");

console.log(`Built ${written.length} pages:`);
for (const w of written) console.log("  " + w.replace(/\\/g, "/"));
console.log(`sitemap.xml: ${urls.length} URLs`);
