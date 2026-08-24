# Wulftek Website

Client website for **WulfTek Tuning** (ECU remapping, Telford, Shropshire),
built by Talon Insights.

- **Live:** https://wulftek-website.vercel.app
- **GitHub:** `TalonInsights/Wulftek-Website` (public, `main`)
- **Vercel:** `talon-insights` team, project `wulftek-website`. Pure static —
  Vercel runs no build of its own, and pushes to `main` deploy automatically.

## How the site is put together

Static multi-page site. Every page is a real URL with its own title, meta
description and canonical, so each one can rank on its own.

```
src/                 source of truth — edit here
  layout.html        the page shell (head, meta, script tags)
  partials/          header.html, footer.html — shared across every page
  pages/             the body content of each page, one file each
    _marque.html     template behind the per-make pages
tools/build.mjs      assembles src/ into the HTML files at the repo root
assets/
  css/site.css       all styling
  js/config.js       contact details and photography — start here
  js/data.js         vehicle and marque data
  js/site.js         nav, scroll reveals, placeholder images
  js/reg-lookup.js   the registration lookup
  js/home.js         home-page behaviours: counters, the headroom
                     curve, job-sheet ticks, the plate reprise
  js/booking.js      the booking enquiry form
```

The HTML files at the repo root (`index.html`, `about.html`, `remap/*.html`, …)
are **generated**. Don't edit them by hand — change `src/` or the data and run:

```bash
node tools/build.mjs
```

That rewrites all 25 pages plus `sitemap.xml`. Adding a make to `WT.MARQUE` in
`assets/js/data.js` and re-running the build is all it takes to get a new
`/remap/<make>` page, complete with its sitemap entry.

`vercel.json` sets `cleanUrls`, so `/about` serves `about.html` — keep links
extensionless.

The build stamps CSS and JS URLs with a hash of their contents
(`site.css?v=dd67d8e1`). That is what makes it safe to cache them for a year:
change a file and its URL changes with it, so nobody is left running an old
stylesheet against new markup. Images aren't hashed and are cached for a day,
so a replaced photo under the same filename takes up to a day to appear —
give it a new filename if you need it live immediately.

## Placeholders still to fill before launch

- **Contact details** — `WT.CONTACT` in `assets/js/config.js` is empty, so the
  call/email links are inert. This is the highest-priority gap.
- **Photography** — the home-page hero is WulfTek's own photo. The remaining
  slots (`road`, `van`, `field`, `engine`, `shop`, `heritage`) are still stock
  images from Wikimedia Commons; each carries an art-direction `brief` in
  `config.js` describing the photo that belongs there.
- **Address** — `[STREET]` / `[POSTCODE]` placeholders in the business schema
  in `tools/build.mjs`.
- **Registration lookup** — `WT.VEH` is a ten-vehicle demonstration dataset.
  Live lookups need a real vehicle-data API.
- **Booking form** — front-end only. Submitting shows the confirmation but
  sends nothing; it needs an email service wiring up.
- **Domain** — the site is on `wulftek-website.vercel.app`. If WulfTek owns
  `wulftektuning.com`, add it in Vercel and update `SITE` in `tools/build.mjs`,
  then rebuild so canonicals, Open Graph URLs and the sitemap follow.

## Worth raising with the client

The van in the hero photo advertises **DPF SOLUTIONS** and **GEARBOX TUNING**.
The site copy states plainly and repeatedly that WulfTek does *not* remove DPF,
EGR or AdBlue equipment, and gearbox tuning isn't offered as a service anywhere
on the site. The photo and the copy currently contradict each other — worth
settling which is right before launch.
