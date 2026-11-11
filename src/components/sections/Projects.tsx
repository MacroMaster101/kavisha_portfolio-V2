import { useState, useEffect, useRef, type AnchorHTMLAttributes, type PointerEvent } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from 'framer-motion';
import { ArrowUpRight, ExternalLink, Folder, FolderOpen, Star, GitFork, Download } from 'lucide-react';
import { Section } from '../ui/Section';
import { Github } from '../ui/BrandIcons';
import { GITHUB_URL } from '../../data/contact';
import { PROJECT_METADATA, SOCIAL_PREVIEWS } from '../../data/socialPreviews';
import { REPO_STACKS } from '../../data/repoStacks';
import {
  fetchLatestRelease,
  fetchPublicGithubRepos,
  isProfileRepo,
  GITHUB_REPO_CACHE_KEY,
  readGithubRepoCache,
  safeHttpUrl,
  type GithubRepo,
  type LatestRelease,
} from '../../lib/github';

const formatName = (name: string) =>
  name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

// Compact download-count label: 1204 → "1.2k", 980 → "980".
const formatDownloads = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n);

const CATEGORIES = ['All', 'Full Stack', 'Web', 'Mobile App', 'AI/ML', 'Discord Bot', 'Portfolio', 'Other'] as const;
type Category = typeof CATEGORIES[number];

// What the voice guide says for a featured project or a category filter, so they light
// up as they are named (see lib/narrationHighlights).
const SPOKEN_PROJECTS: Record<string, string> = {
  'just-for-fun-website': 'Just For Fun',
  'mazora-network': 'Mazora Network',
  travel_genie: 'TravelGenie',
  travel_genie_app: 'TravelGenie',
  vero_salon_website: 'Vero Salon',
};
const SPOKEN_CATEGORIES: Partial<Record<Category, string>> = {
  'Full Stack': 'full-stack apps',
  'AI/ML': 'machine-learning work',
  'Discord Bot': 'Discord bots',
};
type ProjectCategory = Exclude<Category, 'All'>;

const REPO_DESCRIPTION_OVERRIDES: Record<string, string> = {
  'kavisha_portfolio-v2': 'Personal portfolio built with React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, and Spline 3D, with a live GitHub project and release feed.',
};

const REPO_HOMEPAGE_OVERRIDES: Record<string, string> = {
  'kavisha_portfolio-v2': 'https://kavisha.online/',
};

const repoStack = (repo: GithubRepo) =>
  REPO_STACKS[repo.name.toLowerCase()] ?? repo.allLanguages;

function getRepoCategories(repo: GithubRepo): ProjectCategory[] {
  const haystack = [
    repo.name,
    repo.description ?? '',
    ...(repo.topics ?? []),
    ...(REPO_STACKS[repo.name.toLowerCase()] ?? []),
    ...(repo.allLanguages ?? []),
    repo.language ?? '',
  ]
    .join(' ')
    .toLowerCase();

  const has = (...keys: string[]) => keys.some(k => haystack.includes(k));
  const words = new Set(haystack.split(/[^a-z0-9+#.]+/).filter(Boolean));
  const hasTerm = (...keys: string[]) => keys.some(k => k.length <= 3 ? words.has(k) : haystack.includes(k));

  const categories: ProjectCategory[] = [];
  const add = (category: ProjectCategory) => {
    if (!categories.includes(category)) categories.push(category);
  };

  if (has('portfolio')) add('Portfolio');
  if (hasTerm('discord') && hasTerm('bot')) add('Discord Bot');
  // hasTerm, not has: a substring 'ios' would match "axios", "studios", "portfolios".
  if (hasTerm('mobile-app', 'mobile app', 'react-native', 'react native', 'flutter', 'android', 'ios', 'kotlin', 'swift', 'expo'))
    add('Mobile App');
  if (hasTerm('machine-learning', 'machine learning', 'ml', 'ai', 'tensorflow', 'pytorch', 'jupyter', 'data-science', 'nlp'))
    add('AI/ML');
  if (has('spring-boot', 'spring boot', 'express', 'nodejs', 'node.js', 'fullstack', 'full-stack', 'postgres', 'supabase', 'neon', 'prisma', 'mongodb', 'mysql', 'jwt'))
    add('Full Stack');
  if (has('react', 'vite', 'next', 'vue', 'svelte', 'tailwind', 'html', 'css', 'javascript', 'typescript', 'web'))
    add('Web');

  return categories.length > 0 ? categories : ['Other'];
}

// The "Everything Else" grid starts collapsed to keep the section compact: it shows
// INITIAL_VISIBLE cards, then reveals LOAD_STEP more each time "See more" is clicked.
const INITIAL_VISIBLE = 12;
const LOAD_STEP = 3;

// Repos pinned as "Featured", in display order (lowercase names).
const FEATURED_NAMES = [
  'just-for-fun-website',
  'mazora-network',
  'travel_genie',
  'travel_genie_app',
  'vero_salon_website',
];

// A repo's UPLOADED social preview is served from repository-images.githubusercontent.com
// (an unpredictable per-upload URL). It can't be derived client-side and the repo page is
// CORS-blocked in the browser, so scripts/fetch-social-previews.mjs reads each repo's
// og:image into the SOCIAL_PREVIEWS map, refreshed daily by
// .github/workflows/social-previews.yml. Repos absent from the map get ProjectPlaceholder —
// deliberately not GitHub's generated graph card, which clashes with the design.

// Branded placeholder shown when a repo has no real preview image — far nicer than
// GitHub's generated graph card. A brand-gradient panel with the repo name + folder.
function ProjectPlaceholder({ repoName, className }: { repoName: string; className: string }) {
  return (
    <div className={`${className} flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-900 via-slate-900 to-[#1a1438] relative overflow-hidden`}>
      {/* faint grid + glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.22),transparent_70%)]" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgba(99,102,241,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.12) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(circle at center, #000 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, #000 30%, transparent 80%)',
        }}
      />
      <Folder size={40} className="relative text-brand-primary" />
      <span className="relative font-mono text-sm md:text-base font-semibold text-slate-200 px-4 text-center">
        {formatName(repoName)}
      </span>
    </div>
  );
}

function ProjectImage({ repoName, alt, className }: { repoName: string; alt: string; className: string }) {
  const src = SOCIAL_PREVIEWS[repoName.toLowerCase()];
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // No uploaded preview, or it failed to load → branded placeholder.
  if (!src || failed) {
    return <ProjectPlaceholder repoName={repoName} className={className} />;
  }

  return (
    <>
      {/* Shimmer skeleton shown until the image finishes downloading. Sits behind
          the (initially transparent) image; the image fades in over it on load. */}
      {!loaded && (
        <div className="absolute inset-0 bg-slate-800 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      )}
      {/* GitHub social previews are 1280×640. The attributes give the browser the 2:1
          ratio before the image loads; CSS (w-full h-full) still controls the size. */}
      <img
        src={src}
        alt={alt}
        width={1280}
        height={640}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </>
  );
}

// Bundled fallback for unlucky first visits (GitHub API rate-limited).
// Mirrors data shape from the GitHub API; gets replaced as soon as a real fetch succeeds.
// Languages and releases come from PROJECT_METADATA (the daily snapshot) in mergeRepos.
const FALLBACK_REPOS: Omit<GithubRepo, 'allLanguages'>[] = [
  {
    id: -13,
    name: 'Mazora-Network',
    description: 'The official Mazora Network community platform — a production-ready Minecraft server website with live status, Discord integration, storefront, member dashboards, and role-based staff administration.',
    html_url: 'https://github.com/MacroMaster101/Mazora-Network',
    homepage: 'https://mazora.us/',
    topics: ['nextjs', 'react', 'typescript', 'tailwindcss', 'drizzle-orm', 'supabase', 'full-stack'],
    language: 'TypeScript',
    stargazers_count: 0, forks_count: 0, fork: false,
    updated_at: '2026-08-01T00:00:00Z',
  },
  {
    id: -14,
    name: 'Vero_Salon_Website',
    description: 'Full-stack salon booking platform for Vero Salon — Next.js, TypeScript, Supabase, and Tailwind CSS. Includes race-safe booking slots, customer accounts, ratings, reviews, and role-based staff administration.',
    html_url: 'https://github.com/MacroMaster101/Vero_Salon_Website',
    homepage: 'https://vero-salon-website.vercel.app/',
    topics: ['nextjs', 'react', 'typescript', 'tailwindcss', 'supabase', 'postgresql', 'full-stack'],
    language: 'TypeScript',
    stargazers_count: 0, forks_count: 0, fork: false,
    updated_at: '2026-08-01T00:00:00Z',
  },
  {
    id: -5,
    name: 'just-for-fun-website',
    description: 'Official web hub for the Just For Fun Sri Lankan gaming crew — Next.js, Supabase, Prisma, Neon-backed Postgres, YouTube sync, admin tools, and community highlights.',
    html_url: 'https://github.com/MacroMaster101/just-for-fun-website',
    homepage: 'https://just-for-fun-website-lakshankavishatt-9591s-projects.vercel.app',
    topics: ['nextjs', 'supabase', 'prisma', 'neon', 'postgresql', 'full-stack-web-development'],
    language: 'TypeScript',
    stargazers_count: 0, forks_count: 0, fork: false,
    updated_at: '2026-06-01T00:00:00Z',
  },
  {
    id: -6,
    name: 'Travel_Genie_App',
    description: 'TravelGenie mobile app built with Expo, React Native, and a Node/Express + MongoDB backend for trip planning, expense tracking, hotels, transport details, reviews, and notifications.',
    html_url: 'https://github.com/MacroMaster101/Travel_Genie_App',
    homepage: '',
    topics: ['expo', 'react-native', 'mobile-app', 'nodejs', 'express', 'mongodb'],
    language: 'JavaScript',
    stargazers_count: 0, forks_count: 0, fork: false,
    updated_at: '2026-05-22T18:07:50Z',
  },
  {
    id: -1,
    name: 'Travel_Genie',
    description: 'TravelGenie is a full-stack AI-powered travel planner — React + Vite frontend, Express API, PostgreSQL/Neon data layer, Flask ML service, JWT auth, and role-based admin.',
    html_url: 'https://github.com/MacroMaster101/Travel_Genie',
    homepage: 'https://travel-genie-da1t.vercel.app',
    topics: ['react', 'nodejs', 'express', 'postgresql', 'jwt'],
    language: 'JavaScript',
    stargazers_count: 0, forks_count: 0, fork: true,
    updated_at: '2026-05-22T18:00:00Z',
  },
  {
    id: -7,
    name: 'discord_music_bot',
    description: 'Self-hostable Discord music bot powered by yt-dlp with YouTube playback, queue management, loop/shuffle controls, rotating presence, Docker, and Nixpacks support.',
    html_url: 'https://github.com/MacroMaster101/discord_music_bot',
    homepage: '',
    topics: ['discord', 'discord-bot', 'discord-js', 'docker'],
    language: 'JavaScript',
    stargazers_count: 0, forks_count: 0, fork: false,
    updated_at: '2026-05-22T13:29:09Z',
  },
  {
    id: -8,
    name: 'discord-youtube-status-bot',
    description: 'Discord bot service for YouTube status updates, built with Python, Discord.py, and Flask.',
    html_url: 'https://github.com/MacroMaster101/discord-youtube-status-bot',
    homepage: '',
    topics: ['discord', 'discord-bot', 'discord-py', 'flask'],
    language: 'Python',
    stargazers_count: 0, forks_count: 0, fork: true,
    updated_at: '2026-05-22T13:15:42Z',
  },
  {
    id: -9,
    name: 'discord-j4fn-server-bot',
    description: 'Discord bot for gaming servers with moderation, anti-spam automod, welcome embeds, fun commands, polls, and a web admin dashboard.',
    html_url: 'https://github.com/MacroMaster101/discord-j4fn-server-bot',
    homepage: '',
    topics: ['discord', 'discord-bot', 'discord-py', 'flask'],
    language: 'Python',
    stargazers_count: 0, forks_count: 0, fork: false,
    updated_at: '2026-05-22T09:07:08Z',
  },
  {
    id: -10,
    name: 'home-tutor',
    description: 'Java-based Home Tutor web application configured with Maven and Smart Tomcat deployment settings.',
    html_url: 'https://github.com/MacroMaster101/home-tutor',
    homepage: '',
    topics: ['java', 'maven', 'web-app'],
    language: 'Java',
    stargazers_count: 0, forks_count: 0, fork: false,
    updated_at: '2026-05-26T07:06:52Z',
  },
  {
    id: -2,
    name: 'DengueRisk',
    description: 'Machine learning model classifying dengue risk levels in Sri Lankan districts from weekly case + weather data — for early outbreak prediction.',
    html_url: 'https://github.com/MacroMaster101/DengueRisk',
    homepage: '',
    topics: ['machine-learning', 'python', 'data-science'],
    language: 'Python',
    stargazers_count: 0, forks_count: 0, fork: true,
    updated_at: '2026-05-20T00:00:00Z',
  },
  {
    id: -3,
    name: 'web-voting-system',
    description: 'Secure web-based E-Voting system for campus award nominations — Spring Boot, React + Vite, MS SQL Server, admin event management.',
    html_url: 'https://github.com/MacroMaster101/web-voting-system',
    homepage: '',
    topics: ['java', 'spring-boot', 'react', 'security'],
    language: 'Java',
    stargazers_count: 0, forks_count: 0, fork: true,
    updated_at: '2026-05-19T00:00:00Z',
  },
  {
    id: -4,
    name: 'kavisha_portfolio-V2',
    description: 'Personal portfolio built with React 19, Vite, Tailwind v4, and framer-motion. The site you’re looking at right now.',
    html_url: 'https://github.com/MacroMaster101/kavisha_portfolio-V2',
    homepage: 'https://kavisha.online',
    topics: ['react', 'vite', 'tailwindcss', 'typescript'],
    language: 'TypeScript',
    stargazers_count: 0, forks_count: 0, fork: false,
    updated_at: '2026-05-18T00:00:00Z',
  },
  {
    id: -12,
    name: 'kavisha_portfolio',
    description: 'Earlier personal portfolio built with HTML, CSS, and vanilla JavaScript.',
    html_url: 'https://github.com/MacroMaster101/kavisha_portfolio',
    homepage: '',
    topics: ['portfolio', 'html', 'css', 'javascript'],
    language: 'CSS',
    stargazers_count: 0, forks_count: 0, fork: false,
    updated_at: '2026-05-17T00:00:00Z',
  },
];

// Release precedence: a live GitHub lookup beats a cached/incoming value, which beats the
// build-time snapshot. The snapshot is up to a day old, so it must never override newer data.
const mergeRepos = (repos: GithubRepo[], liveReleases?: ReadonlyMap<string, LatestRelease | null>) => {
  const byName = new Map<string, GithubRepo>();

  for (const repo of FALLBACK_REPOS) {
    const key = repo.name.toLowerCase();
    const generated = PROJECT_METADATA[key];
    // Same overrides as live data, so first-time and rate-limited visitors see the same copy.
    byName.set(key, {
      ...repo,
      description: REPO_DESCRIPTION_OVERRIDES[key] ?? repo.description,
      homepage: REPO_HOMEPAGE_OVERRIDES[key] ?? repo.homepage,
      allLanguages: generated?.allLanguages ?? [],
      latestRelease: generated?.latestRelease ?? null,
    });
  }

  for (const incoming of repos) {
    const key = incoming.name.toLowerCase();
    const generated = PROJECT_METADATA[key];
    const repo: GithubRepo = {
      ...incoming,
      description: REPO_DESCRIPTION_OVERRIDES[key] ?? incoming.description,
      allLanguages: generated?.allLanguages?.length ? generated.allLanguages : incoming.allLanguages,
      latestRelease: liveReleases?.has(key)
        ? liveReleases.get(key) ?? null
        : incoming.latestRelease ?? generated?.latestRelease ?? null,
      homepage: REPO_HOMEPAGE_OVERRIDES[key] ?? safeHttpUrl(incoming.homepage),
    };
    const previous = byName.get(key);
    byName.set(key, {
      ...previous,
      ...repo,
      allLanguages: repo.allLanguages.length ? repo.allLanguages : previous?.allLanguages ?? [],
    });
  }

  // Newest first. (Featured cards pick their repos by FEATURED_NAMES, so their place in
  // this order doesn't matter.)
  return Array.from(byName.values())
    // Final privacy guard — drop anything marked private no matter the source
    // (live API, stale cache, or bundled fallback).
    .filter(repo => repo.private !== true)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
};

const readCachedRepos = (): GithubRepo[] | null => {
  const repos = readGithubRepoCache();
  return repos ? mergeRepos(repos) : null;
};

// The pieces shared by the featured cards and the "Everything Else" grid cards.
// `compact` is the grid's smaller variant.

const primaryHref = (repo: GithubRepo) => repo.homepage || repo.html_url;

function NewTabLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a target="_blank" rel="noopener noreferrer" {...props} />;
}

function TechStack({ repo, compact = false, className = '' }: { repo: GithubRepo; compact?: boolean; className?: string }) {
  const stack = repoStack(repo);
  if (stack.length === 0) return null;
  return (
    <ul
      className={`flex flex-wrap gap-y-1 font-mono text-slate-500 dark:text-slate-500 ${
        compact ? 'gap-x-3 text-[11px]' : 'gap-x-4 text-[12px]'
      } ${className}`}
    >
      {stack.slice(0, compact ? 5 : 6).map(lang => (
        <li key={lang}>{lang}</li>
      ))}
    </ul>
  );
}

function ReleaseDownload({ release, compact = false, className = '' }: { release: LatestRelease; compact?: boolean; className?: string }) {
  return (
    <div className={`mt-5 flex items-center ${compact ? 'justify-between gap-2' : 'flex-wrap gap-x-3 gap-y-2'} ${className}`}>
      <NewTabLink
        href={release.url}
        className={
          compact
            ? 'inline-flex items-center gap-1.5 rounded-md bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white hover:-translate-y-0.5 transition-transform'
            : 'inline-flex items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_-8px] shadow-brand-primary/60 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px] hover:shadow-brand-primary/70 transition-all'
        }
      >
        <Download size={compact ? 13 : 16} /> Download {release.version}
      </NewTabLink>
      {release.downloads > 0 && (
        <span
          className={`font-mono text-slate-500 ${
            compact ? 'text-[11px] dark:text-slate-500 whitespace-nowrap' : 'text-xs dark:text-slate-400'
          }`}
        >
          {formatDownloads(release.downloads)} downloads
        </span>
      )}
    </div>
  );
}

function RepoLinks({ repo, compact = false }: { repo: GithubRepo; compact?: boolean }) {
  const size = compact ? 18 : 20;
  const linkClass = compact
    ? 'hover:text-brand-primary transition-colors'
    : 'hover:text-brand-primary hover:-translate-y-0.5 transition-all';
  return (
    <>
      <NewTabLink href={repo.html_url} aria-label="GitHub repo" className={linkClass}>
        <Github size={size} />
      </NewTabLink>
      {repo.homepage && (
        <NewTabLink href={repo.homepage} aria-label="Live demo" className={linkClass}>
          <ExternalLink size={size} />
        </NewTabLink>
      )}
    </>
  );
}

const EASE = [0.22, 1, 0.36, 1] as const;

// Feeds the pointer position to a .spotlight element (index.css) as --mx / --my.
function trackSpotlight(e: PointerEvent<HTMLElement>) {
  if (e.pointerType !== 'mouse') return;
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
}

// One light streak across a project image on hover.
function HoverSweep() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-1/3 -translate-x-[150%] -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-[400%]"
    />
  );
}

// A featured project. As it scrolls into view the image wipes open from its outer edge
// and the text slides in from the other side, one line after another; the image then
// drifts a little against the page (parallax). On hover the image zooms, a light streak
// crosses it, and the frame and description light up around the pointer.
// Everything that moves is 2D, so text stays sharp. Reduced motion keeps plain fades.
function FeaturedProject({ repo, idx }: { repo: GithubRepo; idx: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const isReverse = idx % 2 === 1;
  const align = isReverse ? 'justify-start' : 'md:justify-end';
  // The text column sits right of the image, or left when reversed: it slides in from there.
  const side = isReverse ? -1 : 1;

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], [36, -36]);

  const wipe: Variants = reduce
    ? { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: 0.5 } } }
    : {
        hidden: { clipPath: isReverse ? 'inset(0% 0% 0% 100% round 12px)' : 'inset(0% 100% 0% 0% round 12px)' },
        shown: { clipPath: 'inset(0% 0% 0% 0% round 12px)', transition: { duration: 1.05, ease: EASE } },
      };
  const zoomOut: Variants = reduce
    ? {}
    : { hidden: { scale: 1.18 }, shown: { scale: 1, transition: { duration: 1.4, ease: EASE } } };
  const column: Variants = { hidden: {}, shown: { transition: { staggerChildren: 0.08, delayChildren: reduce ? 0 : 0.3 } } };
  const line: Variants = reduce
    ? { hidden: { opacity: 0 }, shown: { opacity: 1 } }
    : { hidden: { opacity: 0, x: side * 36 }, shown: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } } };
  const rule: Variants = reduce
    ? {}
    : { hidden: { scaleX: 0 }, shown: { scaleX: 1, transition: { duration: 0.6, delay: 0.5, ease: EASE } } };

  return (
    <motion.article
      ref={ref}
      data-narration-term={SPOKEN_PROJECTS[repo.name.toLowerCase()] ?? formatName(repo.name)}
      // Runs the reveal for its children: the clipped image can't report itself in view.
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.25 }}
      className="relative grid md:grid-cols-12 items-center gap-y-6"
    >
      {/* Image — fills 7 cols on desktop, full width on mobile */}
      <motion.div
        style={reduce ? undefined : { y: imageY }}
        className={`relative md:col-span-7 ${isReverse ? 'md:col-start-6' : 'md:col-start-1'} md:row-start-1 z-0`}
      >
        <NewTabLink href={primaryHref(repo)} onPointerMove={trackSpotlight} className="group relative block">
          {/* Soft brand glow behind the frame */}
          <div className="absolute -inset-2 rounded-2xl bg-brand-primary/15 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          {/* object-contain keeps the WHOLE social-preview visible (no cropping);
              the dark brand-gradient panel makes any letterbox margin look intentional. */}
          <motion.div
            variants={wipe}
            className="spotlight relative aspect-[2/1] rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-[#161229] ring-1 ring-slate-200/70 dark:ring-white/10 shadow-[0_12px_40px_-12px_rgba(2,12,27,0.5)] dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)] group-hover:ring-brand-primary/40 transition-shadow duration-500"
          >
            <motion.div variants={zoomOut} className="absolute inset-0">
              <ProjectImage
                repoName={repo.name}
                alt={repo.name}
                className="w-full h-full object-contain group-hover:scale-[1.05] transition-transform duration-700 ease-out"
              />
            </motion.div>
            <HoverSweep />
            {/* "Open" tag that rises in on hover */}
            <span className="pointer-events-none absolute bottom-3 right-3 z-[3] inline-flex translate-y-2 items-center gap-1 rounded-full bg-slate-950/70 px-3 py-1 font-mono text-[11px] text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              Open <ArrowUpRight size={12} />
            </span>
          </motion.div>
        </NewTabLink>
      </motion.div>

      {/* Content — fills 6 cols on desktop, full width stacked below image on mobile */}
      <motion.div
        variants={column}
        className={`relative md:col-span-6 ${isReverse ? 'md:col-start-1 md:text-left' : 'md:col-start-7 md:text-right'} md:row-start-1 z-10`}
      >
        <motion.p
          variants={line}
          className={`flex items-center gap-3 font-mono text-brand-primary text-xs md:text-sm mb-2 ${isReverse ? '' : 'md:justify-end'}`}
        >
          <span className={isReverse ? '' : 'md:order-3'}>{String(idx + 1).padStart(2, '0')}</span>
          <motion.span
            aria-hidden
            variants={rule}
            className={`h-px w-8 bg-gradient-to-r from-brand-primary to-cyan-400 ${isReverse ? 'origin-left' : 'origin-left md:order-2 md:origin-right'}`}
          />
          <span className={isReverse ? '' : 'md:order-1'}>Featured Project</span>
        </motion.p>
        <motion.h3
          variants={line}
          className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4 hover:text-brand-primary transition-colors"
        >
          <NewTabLink href={primaryHref(repo)}>{formatName(repo.name)}</NewTabLink>
        </motion.h3>
        <motion.div
          variants={line}
          onPointerMove={trackSpotlight}
          className="spotlight relative md:bg-white/80 dark:md:bg-slate-900/80 md:backdrop-blur-md md:p-6 rounded-xl md:ring-1 md:ring-slate-200/70 dark:md:ring-white/10 md:shadow-[0_12px_40px_-12px_rgba(2,12,27,0.45)] dark:md:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)] text-slate-600 dark:text-slate-400 text-[15px] leading-relaxed"
        >
          {repo.description || 'A project I built — check the repo for details.'}
        </motion.div>
        <motion.div variants={line}>
          <TechStack repo={repo} className={`mt-4 ${align}`} />
        </motion.div>
        {repo.latestRelease && (
          <motion.div variants={line}>
            <ReleaseDownload release={repo.latestRelease} className={align} />
          </motion.div>
        )}
        <motion.div variants={line} className={`mt-4 flex gap-4 text-slate-500 dark:text-slate-400 ${align}`}>
          <RepoLinks repo={repo} />
        </motion.div>
      </motion.div>
    </motion.article>
  );
}

// A card in the "Everything else" grid. It fades up into view, lifts on hover, and a
// spotlight follows the pointer across its surface and border. The image zooms with a
// light streak, a gradient rule draws in under it, and the folder opens.
function ProjectCard({ repo, idx }: { repo: GithubRepo; idx: number }) {
  return (
    <motion.article
      data-narration-term={formatName(repo.name)}
      layout
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay: (idx % 3) * 0.08, ease: EASE }}
      whileHover={{ y: -7 }}
      onPointerMove={trackSpotlight}
      className="spotlight group relative flex flex-col rounded-md bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-transparent shadow-sm hover:shadow-2xl hover:shadow-brand-primary/15 transition-shadow overflow-hidden"
    >
      <NewTabLink
        href={primaryHref(repo)}
        className="relative block aspect-[2/1] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-[#161229]"
      >
        <ProjectImage
          repoName={repo.name}
          alt={repo.name}
          className="w-full h-full object-contain object-center group-hover:scale-[1.06] transition-transform duration-700 ease-out"
        />
        <HoverSweep />
        {/* Gradient rule drawing in along the image's foot */}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[2px] origin-left scale-x-0 bg-gradient-to-r from-brand-primary via-cyan-400 to-brand-secondary transition-transform duration-500 ease-out group-hover:scale-x-100" />
      </NewTabLink>
      <header className="flex items-center justify-between px-6 pt-5 mb-4">
        <span className="relative h-6 w-6 text-brand-primary">
          <Folder size={24} className="absolute inset-0 transition-all duration-300 group-hover:scale-75 group-hover:opacity-0" />
          <FolderOpen size={24} className="absolute inset-0 scale-75 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
        </span>
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          {repo.stargazers_count > 0 && (
            <span className="flex items-center gap-1 text-xs"><Star size={13} /> {repo.stargazers_count}</span>
          )}
          {repo.forks_count > 0 && (
            <span className="flex items-center gap-1 text-xs"><GitFork size={13} /> {repo.forks_count}</span>
          )}
          <RepoLinks repo={repo} compact />
        </div>
      </header>

      <div className="flex flex-col flex-1 px-6 pb-6">
        <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-brand-primary transition-colors">
          <NewTabLink href={primaryHref(repo)}>{formatName(repo.name)}</NewTabLink>
        </h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 line-clamp-3 flex-1">
          {repo.description || 'No description provided.'}
        </p>
        <TechStack repo={repo} compact />
        {repo.latestRelease && <ReleaseDownload release={repo.latestRelease} compact />}
      </div>
    </motion.article>
  );
}

export function Projects() {
  const [initialState] = useState(() => {
    const cached = readCachedRepos();
    return { repos: cached ?? mergeRepos([]), hasFreshCache: cached !== null };
  });
  const [repos, setRepos] = useState<GithubRepo[]>(initialState.repos);
  const [loading, setLoading] = useState(!initialState.hasFreshCache);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  useEffect(() => {
    if (initialState.hasFreshCache) return;
    // Aborted only on unmount. The repo list is a shared request with its own timeout;
    // the release lookups get a timeout of their own here.
    const controller = new AbortController();
    const releaseSignal = AbortSignal.any([controller.signal, AbortSignal.timeout(8000)]);
    fetchPublicGithubRepos()
      .then(async data => {
        // Only repos already known to publish releases are re-checked live, which keeps
        // the unauthenticated API budget (60/hour per visitor) to a handful of requests.
        // Repos gaining their first release are picked up by the daily metadata refresh.
        const releaseRepos = data.filter(repo => PROJECT_METADATA[repo.name.toLowerCase()]?.latestRelease);
        const liveReleases = new Map<string, LatestRelease | null>();
        await Promise.all(releaseRepos.map(async repo => {
          const release = await fetchLatestRelease(repo.name, releaseSignal);
          if (release !== undefined) liveReleases.set(repo.name.toLowerCase(), release);
        }));
        if (controller.signal.aborted) return;
        const mergedRepos = mergeRepos(data, liveReleases);
        try {
          localStorage.setItem(GITHUB_REPO_CACHE_KEY, JSON.stringify({ data: mergedRepos, timestamp: Date.now() }));
        } catch { /* ignore */ }
        setRepos(mergedRepos);
      })
      .catch(() => {
        // On API failure or timeout, keep showing the bundled fallback data and say so.
        if (!controller.signal.aborted) setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [initialState.hasFreshCache]);

  // Split into featured + rest
  const featured = FEATURED_NAMES
    .map(n => repos.find(r => r.name.toLowerCase() === n))
    .filter((r): r is GithubRepo => Boolean(r));
  const featuredIds = new Set(featured.map(r => r.id));
  const rest = repos.filter(r => !featuredIds.has(r.id) && !isProfileRepo(r));
  const filteredRest =
    activeCategory === 'All' ? rest : rest.filter(r => getRepoCategories(r).includes(activeCategory));

  // Only render up to visibleCount cards; the rest stay hidden behind "See more".
  const visibleRest = filteredRest.slice(0, visibleCount);
  const remaining = filteredRest.length - visibleRest.length;

  const handleCategory = (c: Category) => {
    setActiveCategory(c);
    // Re-collapse when switching categories so each filter starts compact.
    setVisibleCount(INITIAL_VISIBLE);
  };

  // Collapsing shortens the grid, which would otherwise strand the viewport in the
  // whitespace/footer below. Scroll the button row (bottom of the now-collapsed list)
  // back into view after the DOM has re-rendered.
  const collapseAnchorRef = useRef<HTMLDivElement>(null);
  const handleShowLess = () => {
    setVisibleCount(INITIAL_VISIBLE);
    requestAnimationFrame(() =>
      collapseAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    );
  };

  return (
    <>
      {/* Featured Projects */}
      <Section id="projects" title="Some Things I've Built">
        {loading && (
          <p className="text-slate-500 text-center pb-8 font-mono text-sm" role="status">Refreshing public projects from GitHub…</p>
        )}
        {error && (
          <p className="text-slate-500 text-center pb-8 text-sm" role="status">
            Live GitHub refresh is unavailable; showing bundled project details.{' '}
            <a href={GITHUB_URL} className="text-brand-primary hover:underline" target="_blank" rel="noopener noreferrer">
              Visit GitHub
            </a>
          </p>
        )}

        {featured.length > 0 && (
          <div className="space-y-24 md:space-y-32">
            {featured.map((repo, idx) => (
              <FeaturedProject key={repo.id} repo={repo} idx={idx} />
            ))}
          </div>
        )}
      </Section>

      {/* Other Noteworthy Projects */}
      {rest.length > 0 && (
        <section className="py-12 md:py-16" data-narration-scope="projects">
          <div className="w-full max-w-[1000px] mx-auto px-6 sm:px-10">
            <div className="text-center mb-4">
              <h3 data-narration-term="everything else" className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 rounded">Everything Else I&apos;ve Shipped</h3>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 font-mono text-sm text-brand-primary hover:underline underline-offset-4"
              >
                view the archive
              </a>
            </div>

            {/* Category filter pills */}
            <div data-narration-term="filter by category" className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-8 rounded-full">
              {CATEGORIES.map(cat => {
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    data-narration-term={SPOKEN_CATEGORIES[cat]}
                    onClick={() => handleCategory(cat)}
                    aria-pressed={active}
                    className={`px-4 py-1.5 text-[13px] font-mono rounded-full border transition-all ${
                      active
                        ? 'bg-brand-primary text-white border-brand-primary shadow-[0_6px_20px_-6px] shadow-brand-primary/60'
                        : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-brand-primary hover:text-brand-primary'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {filteredRest.length === 0 && (
              <p className="text-center text-sm text-slate-500 mt-10 font-mono">
                No projects in this category yet.
              </p>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {visibleRest.map((repo, idx) => (
                <ProjectCard key={repo.id} repo={repo} idx={idx} />
              ))}
            </div>

            {(remaining > 0 || visibleCount > INITIAL_VISIBLE) && (
              <div ref={collapseAnchorRef} className="mt-12 flex flex-wrap items-center justify-center gap-3">
                {remaining > 0 && (
                  <button
                    onClick={() => setVisibleCount(c => c + LOAD_STEP)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-mono font-medium text-brand-primary border border-brand-primary rounded-full hover:bg-brand-primary/10 hover:-translate-y-0.5 transition-all"
                  >
                    See more
                    <span className="text-brand-primary/70">({remaining})</span>
                  </button>
                )}
                {visibleCount > INITIAL_VISIBLE && (
                  <button
                    onClick={handleShowLess}
                    className="inline-flex items-center px-6 py-2.5 text-sm font-mono font-medium text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 rounded-full hover:border-brand-primary hover:text-brand-primary transition-all"
                  >
                    Show less
                  </button>
                )}
              </div>
            )}

          </div>
        </section>
      )}
    </>
  );
}
