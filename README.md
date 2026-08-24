# MugoByte Technologies — Website

The public website of MugoByte Technologies (MBT). Static multi-page site deployed on Vercel at https://mugobyte.com.

## Structure

- `src/partials/` — shared head, navigation and footer
- `src/pages/` — page content (one file per route)
- `build.mjs` — zero-dependency build script; assembles partials + pages into root `.html` files
- `assets/` — CSS design system, shared JS, optimized images
- `api/newsletter.js` — Vercel serverless function (Brevo newsletter signup)

## Editing content

1. Edit files in `src/pages/` or `src/partials/`.
2. Run `node build.mjs` to regenerate the HTML files at the repo root.
3. Commit both the source and the built files — Vercel deploys the built output.

Routes are defined in `build.mjs` (single source of truth for titles, descriptions and canonicals).
