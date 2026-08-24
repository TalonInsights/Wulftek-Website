# Wulftek Website

Client website for **Wulftek** (vehicle remapping / tuning), built by Talon Insights.

## Status

`index.html` is a single-file SPA (hash-routed views: home, what-is-remapping,
performance, economy, agricultural, vehicles, per-marque tables, about, events,
booking). Imported from the design draft `wulftek-tuning_7.html` on 24 Aug 2026.

The client's brief in `..\WULFTEK PROMPT.txt` is satisfied by this version:
reg lookup dominates the hero over a background photo, the engine-software
diagram and "paper" element are gone, and a "What is remapping?" page exists
with a shortened version on the home page.

## Placeholders still to fill before launch

- **Photos** — the `IMG` config in the script currently points at freely
  licensed Wikimedia Commons stock; swap for WulfTek's own photography
  (each slot has an art-direction `brief` written in the config).
- **Contact details** — `CONTACT.phone` / `CONTACT.email` in the script are
  empty, so call/email links are inert.
- **Address** — `[STREET]` / `[POSTCODE]` placeholders in the LocalBusiness
  JSON-LD in the head.
- **Reg lookup** — `VEH` is a small demo dataset; a real DVLA/vehicle-data API
  is needed for live lookups.
- **Booking form** — front-end only; submissions go nowhere yet.

## Deployment

- **Live:** https://wulftek-website.vercel.app
- **GitHub:** `TalonInsights/Wulftek-Website` (public, `main`)
- **Vercel:** `talon-insights` team, project `wulftek-website`. Static site,
  no build step — pushes to `main` deploy automatically.
- Security headers are set in `vercel.json`. No rewrites are needed because
  the site is hash-routed, so every route is served from `index.html` at `/`.

## Known limitation: hash routing and SEO

All nine views live behind `#/` fragments, which search engines do not index as
separate URLs. The per-route `<title>` and `<meta description>` the script sets
are never seen by a crawler, so the whole site competes as a single page. For a
local-search business ("ECU remapping Telford", "tractor remapping Shropshire")
this is worth converting to real paths before any SEO push — it needs a router
change plus one rewrite per route in `vercel.json`.
