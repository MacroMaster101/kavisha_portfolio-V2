# Kavisha Liyanage — Portfolio v2

A responsive single-page portfolio for Kavisha Liyanage, built with React 19, TypeScript, Vite 8, Tailwind CSS 4, Framer Motion, Spline, and Vercel Analytics.

Live site: [kavisha.online](https://kavisha.online)

## Features

- Interactive, lazy-loaded Spline robot with reduced-motion and background-tab safeguards
- System-aware light/dark theme with persisted user preference
- Responsive desktop navigation and mobile navigation hub
- Public GitHub project feed with validated local cache and bundled fallback data
- Build-side GitHub social previews, language details, and release metadata
- Accessible focus styles, skip navigation, semantic sections, and motion preferences
- Open Graph, Twitter Card, structured data, robots, sitemap, and Vercel security headers

The contact call to action uses a `mailto:` link. The site has no contact-form backend, authentication, database, or admin panel.

## Development

Requirements: Node.js 20 or newer and npm.

```bash
npm ci
npm run dev
```

Available commands:

```bash
npm run lint             # ESLint
npm run build            # TypeScript project build + Vite production build
npm run preview          # Preview the production build
npm run social-previews  # Refresh generated GitHub project metadata
```

`npm run build` is deterministic and does not require network access. Generated project metadata is committed so Vercel can deploy it without a secret.

## GitHub data and token security

The browser makes at most one unauthenticated request to GitHub's public repository-list endpoint when its validated 24-hour cache is empty. Per-repository language, release, and social-preview requests run only in `scripts/fetch-social-previews.mjs`.

An optional `GITHUB_TOKEN` can raise rate limits for the metadata generator:

```bash
cp .env.example .env
# Add GITHUB_TOKEN to .env, then:
npm run social-previews
```

Important security rules:

- Never use `VITE_GITHUB_TOKEN` or any other `VITE_*` name for a secret. Vite exposes referenced `VITE_*` variables to browser JavaScript.
- Keep `GITHUB_TOKEN` local, in GitHub Actions secrets, or in another trusted build environment.
- Use the smallest possible token permissions. Public repository metadata is sufficient.
- Do not add `.env` to source control.

The scheduled GitHub Actions workflow uses the repository-scoped built-in `GITHUB_TOKEN` and commits `src/data/socialPreviews.ts` only when refreshed data changes.

## Project structure

```text
public/                       Static images, resume, robots, and sitemap
scripts/fetch-social-previews.mjs
src/components/sections/     Portfolio sections
src/components/ui/           Shared navigation and visual components
src/contexts/                Theme state
src/data/socialPreviews.ts    Generated public project metadata
src/lib/github.ts             Runtime GitHub validation and fetch logic
src/pages/Portfolio.tsx       Page composition
```

To customize the project feed, update the featured ordering and stack overrides in `src/components/sections/Projects.tsx`. Place intentional local project images in `public/projects/` and add their paths to `LOCAL_IMAGE_OVERRIDES`; the app does not probe nonexistent filenames.

## Deployment

Vercel can use the standard Vite settings:

- Build command: `npm run build`
- Output directory: `dist`
- No production secret is required for the browser application

`vercel.json` supplies security and immutable hashed-asset cache headers. This portfolio has no client-side routes, so unknown paths keep normal 404 behavior instead of being rewritten to a soft-404 HTML response.

## Privacy

The site stores only theme preference, a one-session intro flag, a one-time theme-hint flag, and a validated public-repository cache. Browser requests may go to GitHub, Spline, Google Fonts, jsDelivr/Simple Icons, and Vercel Analytics. No claim of blanket GDPR or CCPA compliance is made.

## License

Code is MIT licensed. Personal biography, photographs, and project descriptions are not included in that reuse permission.
