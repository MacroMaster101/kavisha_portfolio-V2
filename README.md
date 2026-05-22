# Kavisha Liyanage — Portfolio

Personal portfolio for Kavisha Liyanage — software engineering & AI intern candidate at SLIIT. Built with React 19, TypeScript, Vite, and Tailwind CSS v4.

**Live:** https://kavisha-portfolio-v2.vercel.app

## Features

- Animated hero with typewriter tagline and interactive 3D Spline robot
- Live GitHub repository feed with filterable categories (auto-fetches from the GitHub API)
- Featured projects with custom social-preview images
- Theme toggle (light / dark) with system-preference detection
- Animated section transitions via Framer Motion
- Responsive across mobile, tablet, and desktop
- Contact form powered by Formspree

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| 3D | Spline (lazy-loaded) |
| Icons | lucide-react + simple-icons / devicon CDNs |
| Hosting | Vercel |

## Setup

```bash
npm install
cp .env.example .env   # fill in your tokens
npm run dev            # starts dev server on http://localhost:5173
```

## Environment Variables

See `.env.example` — both are optional, the site falls back gracefully if missing:

- `VITE_GITHUB_TOKEN` — GitHub read-only PAT (raises API rate limit from 60/hr to 5000/hr for the live projects feed)
- `VITE_FORMSPREE_ID` — Formspree form ID for the contact form

## Scripts

```bash
npm run dev       # dev server
npm run build     # production build → dist/
npm run preview   # preview the production build locally
npm run lint      # eslint
```

## Customizing

| What | Where |
|---|---|
| Featured project order | `FEATURED_NAMES` in `src/components/sections/Projects.tsx` |
| Project category rules | `classifyRepo()` in `src/components/sections/Projects.tsx` |
| Custom project images | `IMAGE_OVERRIDES` in `src/components/sections/Projects.tsx` (drop files in `public/projects/`) |
| Skill list & logos | `groups` in `src/components/sections/Skills.tsx` |
| Hero 3D scene | `SPLINE_ROBOT` URL in `src/components/sections/Hero.tsx` |
| Typewriter tagline | `roles` array in `src/components/sections/Hero.tsx` |
| Resume PDF | Replace `public/Kavisha_Liyanage_CV.pdf` |

## Deploying

The site is configured for Vercel with `vercel.json` handling SPA rewrites. To deploy elsewhere:

- **Vercel / Netlify**: connect the repo, set env vars, deploy. No config changes needed.
- **GitHub Pages subdirectory**: change `base` in `vite.config.ts` from `'/'` to `'/<repo-name>/'` before building.
- **Static host (cPanel etc.)**: run `npm run build`, upload `dist/` contents to your `public_html/`.

## License

Code is MIT — feel free to fork, adapt, and learn from. Please don't copy the personal content (photo, bio, project descriptions) verbatim.

---

Built by [Kavisha Liyanage](https://github.com/MacroMaster101) · © 2026
