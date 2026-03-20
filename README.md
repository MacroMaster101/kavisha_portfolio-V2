# Kavisha Liyanage — Portfolio V2

Personal portfolio website built with React, TypeScript, Vite, and Tailwind CSS.

**Live:** https://macromaster101.github.io/kavisha_portfolio/

## Tech Stack
- React 19 + TypeScript
- Vite
- Tailwind CSS v3
- Framer Motion
- GitHub API (live projects feed)
- Formspree (contact form)

## Setup

```bash
npm install
cp .env.example .env   # fill in your tokens
npm run dev
```

## Environment Variables

See `.env.example` for all required variables:
- `VITE_GITHUB_TOKEN` — GitHub read-only token (raises API rate limit to 5000/hr)
- `VITE_FORMSPREE_ID` — Formspree form ID for contact form email delivery

## Build & Deploy

```bash
npm run build   # outputs to dist/
```

Upload `dist/` contents to GitHub Pages (`gh-pages` branch) or cPanel `public_html/`.

> **Note:** If deploying to a subdirectory (e.g. GitHub Pages), `vite.config.ts` already has `base: '/kavisha_portfolio/'`.  
> For a root domain (cPanel), change `base` to `'/'` before building.
