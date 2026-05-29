<div align="center">

# 🚀 Kavisha Liyanage — Portfolio v2

### ✨ A modern, animated developer portfolio with a cursor-following 3D robot 🤖

Software Engineering & AI intern candidate @ SLIIT 🎓

[![Live Site](https://img.shields.io/badge/🌐_Live_Demo-Visit_Site-6366f1?style=for-the-badge)](https://kavisha-portfolio-v2.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#-license)

</div>

---

## 🎯 What's Inside

My personal corner of the internet — a fast, polished, single-page portfolio that pulls my **real projects straight from GitHub** and shows them off with style. ⚡

> 💡 **Live & breathing:** the Projects section fetches my repos from the GitHub API in real time (with smart caching), so it's always up to date — no manual edits needed.

---

## 🌟 Features

| | |
|---|---|
| 🤖 **Interactive 3D Robot** | A lazy-loaded Spline scene in the hero that follows your cursor |
| ⌨️ **Typewriter Tagline** | The hero cycles through what I build, letter by letter |
| 📡 **Live GitHub Feed** | Repos auto-fetched, categorized & filterable from the GitHub API |
| 🖼️ **Smart Image Loading** | Shimmer skeletons + fade-in, with branded fallbacks for missing previews |
| 🎨 **Build-time Social Previews** | A script grabs each repo's real preview image at build time |
| 🌗 **Dark / Light Mode** | System-preference detection + a first-visit "try the other mode" hint |
| 📱 **Floating Bottom Dock** | Mobile/tablet nav that tracks the active section and auto-centers it |
| 💫 **Framer Motion** | Buttery scroll & hover animations throughout |
| 📨 **Contact Form** | Powered by Formspree — no backend needed |

---

## 🛠️ Tech Stack

| Layer | Choice |
|---|---|
| ⚛️ Framework | **React 19** + **TypeScript** |
| ⚡ Build | **Vite 8** |
| 🎨 Styling | **Tailwind CSS v4** |
| 💫 Animation | **Framer Motion** |
| 🤖 3D | **Spline** (lazy-loaded) |
| 🎯 Icons | **lucide-react** + simple-icons / devicon CDNs |
| 📊 Analytics | **Vercel Analytics** |
| ☁️ Hosting | **Vercel** |

---

## 🚀 Getting Started

```bash
# 📦 Install dependencies
npm install

# 🔑 Set up your env (optional — site works without it)
cp .env.example .env

# 🔥 Start the dev server → http://localhost:5173
npm run dev
```

### 📜 Scripts

```bash
npm run dev       # 🔥 dev server
npm run build     # 🏗️ production build → dist/
npm run preview   # 👀 preview the production build locally
npm run lint      # 🧹 eslint
```

---

## 🔑 Environment Variables

Everything is **optional** — the site falls back gracefully if a variable is missing. See `.env.example`.

| Variable | What it does |
|---|---|
| `VITE_GITHUB_TOKEN` | Read-only GitHub PAT — raises the API rate limit from **60/hr → 5000/hr** for the live projects feed |

---

## 📂 Project Structure

```
src/
├── 🧩 components/
│   ├── sections/   → Hero, About, Skills, Projects, Experience, Education, Contact…
│   └── ui/         → Navbar, BottomNav, ThemeToggle, RobotBackdrop & friends
├── 🎨 theme/        → Brand colors & theming
├── 🔌 contexts/     → Theme context + hooks
└── 📄 data/         → Build-generated social previews

scripts/
└── 🖼️ fetch-social-previews.mjs  → grabs repo preview images at build time
```

---

## 🎛️ Customizing

| What | Where |
|---|---|
| ⭐ Featured project order | `FEATURED_NAMES` in `src/components/sections/Projects.tsx` |
| 🏷️ Project category rules | `classifyRepo()` in `src/components/sections/Projects.tsx` |
| 🖼️ Custom project images | Drop files in `public/projects/` named after the repo (e.g. `travel_genie.png`, `Travel_Genie.webp`). Order: local upload → repo social preview → branded placeholder |
| 🧠 Skill list & logos | `groups` in `src/components/sections/Skills.tsx` |
| 🤖 Hero 3D scene | `SPLINE_ROBOT` URL in `src/components/sections/Hero.tsx` |
| ⌨️ Typewriter tagline | `roles` array in `src/components/sections/Hero.tsx` |
| 📱 Mobile dock items | `navItems` in `src/components/ui/BottomNav.tsx` |
| 📄 Resume PDF | Replace `public/Kavisha_Liyanage_CV.pdf` |

---

## 🚢 Deploying

The site is configured for **Vercel** with `vercel.json` handling SPA rewrites.

- ▲ **Vercel / Netlify** — connect the repo, set env vars, deploy. No config changes needed.
- 📄 **GitHub Pages (subdir)** — change `base` in `vite.config.ts` from `'/'` to `'/<repo-name>/'` before building.
- 🗂️ **Static host (cPanel etc.)** — run `npm run build`, upload the `dist/` contents to `public_html/`.

---

## 📜 License

Code is **MIT** — feel free to fork, adapt, and learn from it. 🙌
Please don't copy the personal content (photo, bio, project descriptions) verbatim. 🙏

---

<div align="center">

### 💌 Get in Touch

Built with 💜 by **Kavisha Liyanage** · © 2026

[![Portfolio](https://img.shields.io/badge/🌐_Portfolio-6366f1?style=for-the-badge)](https://kavisha-portfolio-v2.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/MacroMaster101)

⭐ **Star this repo if you like it!** ⭐

</div>
