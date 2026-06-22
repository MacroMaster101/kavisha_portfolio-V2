import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Folder, Star, GitFork, Download } from 'lucide-react';
import { Section } from '../ui/Section';
import { Github } from '../ui/BrandIcons';
import { SOCIAL_PREVIEWS } from '../../data/socialPreviews';

// Latest GitHub Release for a repo, distilled to what the card needs: a version label,
// total downloads across all assets, and a direct download URL (primary asset, or the
// release page if a release has no uploaded binaries — e.g. source-only tags).
interface LatestRelease {
  version: string;
  url: string;
  downloads: number;
}

interface GithubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  topics: string[];
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  private?: boolean;
  updated_at: string;
  allLanguages: string[];
  latestRelease?: LatestRelease | null;
}

// Raw shape from GET /repos/{owner}/{repo}/releases/latest (only the bits we use).
interface GithubReleaseResponse {
  tag_name: string;
  name: string | null;
  html_url: string;
  draft: boolean;
  prerelease: boolean;
  assets: { browser_download_url: string; download_count: number; size: number }[];
}

const formatName = (name: string) =>
  name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

// Compact download-count label: 1204 → "1.2k", 980 → "980".
const formatDownloads = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n);

// Map the releases/latest payload onto our distilled LatestRelease, or null when there's
// no usable published release. Picks the largest asset as the primary download (installers
// dwarf checksums/sig files), and falls back to the release page when a tag has no binaries.
const toLatestRelease = (r: GithubReleaseResponse | null): LatestRelease | null => {
  if (!r || r.draft) return null;
  const assets = r.assets ?? [];
  const downloads = assets.reduce((sum, a) => sum + (a.download_count ?? 0), 0);
  const primary = [...assets].sort((a, b) => b.size - a.size)[0];
  return {
    version: r.tag_name || r.name || 'latest',
    url: primary?.browser_download_url ?? r.html_url,
    downloads,
  };
};

const CATEGORIES = ['All', 'Full Stack', 'Web', 'Mobile App', 'AI/ML', 'Discord Bot', 'Portfolio', 'Other'] as const;
type Category = typeof CATEGORIES[number];

// GitHub's language API only returns source languages, so these manifest-checked
// stacks keep project chips aligned with the actual frameworks/tools in each repo.
const REPO_STACKS: Record<string, string[]> = {
  'just-for-fun-website': ['Next.js', 'TypeScript', 'Supabase', 'Neon', 'Prisma', 'PostgreSQL'],
  'travel_genie': ['React', 'Vite', 'Node.js', 'Express', 'PostgreSQL', 'Sequelize', 'Flask', 'Pandas', 'NumPy'],
  'travel_genie_app': ['Expo', 'React Native', 'Node.js', 'Express', 'MongoDB', 'JWT'],
  'web-voting-system': ['Spring Boot', 'React', 'Vite', 'MS SQL Server', 'JWT'],
  'kavisha_portfolio-v2': ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Framer Motion'],
  'kavisha_portfolio': ['React', 'Vite', 'CSS'],
  'discord_music_bot': ['Node.js', 'Discord.js', 'Docker', 'yt-dlp'],
  'discord-youtube-status-bot': ['Python', 'Discord.py', 'Flask'],
  'discord-j4fn-server-bot': ['Python', 'Discord.py', 'Flask'],
  'home-tutor': ['Java', 'Maven'],
  'denguerisk': ['Python', 'Pandas', 'NumPy', 'Scikit-learn'],
};

const repoStack = (repo: GithubRepo) =>
  REPO_STACKS[repo.name.toLowerCase()] ?? repo.allLanguages;

function classifyRepo(repo: GithubRepo): Exclude<Category, 'All'> {
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

  if (has('portfolio')) return 'Portfolio';
  if (has('discord', 'bot')) return 'Discord Bot';
  if (has('mobile-app', 'mobile app', 'react-native', 'react native', 'flutter', 'android', 'ios', 'kotlin', 'swift', 'expo'))
    return 'Mobile App';
  if (has('machine-learning', 'machine learning', 'ml', 'ai', 'tensorflow', 'pytorch', 'jupyter', 'data-science', 'nlp'))
    return 'AI/ML';
  if (has('spring-boot', 'spring boot', 'express', 'nodejs', 'node.js', 'fullstack', 'full-stack', 'postgres', 'supabase', 'neon', 'prisma', 'mongodb', 'mysql', 'jwt'))
    return 'Full Stack';
  if (has('react', 'vite', 'next', 'vue', 'svelte', 'tailwind', 'html', 'css', 'javascript', 'typescript', 'web'))
    return 'Web';
  return 'Other';
}

// Bump this when the cached shape or fallback set changes, to discard stale caches
// in returning visitors' browsers (e.g. one that cached a now-private repo).
const CACHE_KEY = 'gh_repos_v6';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const GH_TOKEN = import.meta.env.VITE_GITHUB_TOKEN as string | undefined;
const ghHeaders: HeadersInit = GH_TOKEN ? { Authorization: `Bearer ${GH_TOKEN}` } : {};

// Names of repos we want pinned as "Featured" (in display order, lowercased).
// Anything matching will appear in the featured section.
const FEATURED_NAMES = [
  'just-for-fun-website',
  'travel_genie',
  'travel_genie_app',
  'web-voting-system',
  'kavisha_portfolio-v2',
].map(n => n.toLowerCase());

// Optional local-image overrides for files that do not match the repo name.
// Repo-name files in public/projects are discovered automatically.
const LOCAL_IMAGE_OVERRIDES: Record<string, string> = {
  // 'repo-name': `${import.meta.env.BASE_URL}projects/custom-file-name.png`,
};

const PROJECT_IMAGE_EXTENSIONS = ['webp', 'png', 'jpg', 'jpeg'];

// A repo's UPLOADED social preview is served from repository-images.githubusercontent.com
// (an unpredictable per-upload URL). It can't be derived client-side and the repo page is
// CORS-blocked in the browser, so we resolve it at BUILD TIME: scripts/fetch-social-previews.mjs
// reads each repo's og:image and writes the SOCIAL_PREVIEWS map. New repos with an uploaded
// preview are picked up automatically on the next build — no manual editing.
// Repos absent from the map fall back to GitHub's generated graph card.
const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const repoImageCandidates = (repoName: string) => {
  const key = repoName.toLowerCase();
  const base = `${import.meta.env.BASE_URL}projects/`;
  const names = unique([
    repoName,
    key,
    key.replace(/_/g, '-'),
    key.replace(/-/g, '_'),
  ]);

  // Resolution order, first that loads wins:
  //   1. Local image in /public/projects matching the repo name (full manual control)
  //   2. Explicit local override (LOCAL_IMAGE_OVERRIDES)
  //   3. The repo's real uploaded social preview (SOCIAL_PREVIEWS, build-generated) —
  //      the actual custom image, not the graph card.
  // NOTE: we intentionally do NOT include GitHub's generated graph card here — it's an
  // ugly white avatar/stats card that clashes with the design. Repos with none of the
  // above get a clean branded placeholder (see ProjectImage) instead.
  return unique([
    ...names.flatMap(name => PROJECT_IMAGE_EXTENSIONS.map(ext => `${base}${name}.${ext}`)),
    LOCAL_IMAGE_OVERRIDES[key],
    SOCIAL_PREVIEWS[key],
  ]);
};

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

function ProjectImage({
  repoName,
  alt,
  className,
  loading,
}: {
  repoName: string;
  alt: string;
  className: string;
  loading?: 'lazy' | 'eager';
}) {
  const sources = repoImageCandidates(repoName);
  const [srcIndex, setSrcIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // No candidate image at all, or every candidate failed → branded placeholder.
  if (sources.length === 0 || failed) {
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
      <img
        src={sources[srcIndex]}
        alt={alt}
        loading={loading}
        onLoad={() => setLoaded(true)}
        onError={() => {
          // Advance to the next candidate; if this was the last one, show the placeholder.
          setSrcIndex(index => {
            if (index >= sources.length - 1) {
              setFailed(true);
              return index;
            }
            return index + 1;
          });
        }}
        className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </>
  );
}

// Bundled fallback for unlucky first visits (GitHub API rate-limited).
// Mirrors data shape from the GitHub API; gets replaced as soon as a real fetch succeeds.
const FALLBACK_REPOS: GithubRepo[] = [
  {
    id: -5,
    name: 'just-for-fun-website',
    description: 'Official web hub for the Just For Fun Sri Lankan gaming crew — Next.js, Supabase, Prisma, Neon-backed Postgres, YouTube sync, admin tools, and community highlights.',
    html_url: 'https://github.com/MacroMaster101/just-for-fun-website',
    homepage: 'https://just-for-fun-website-lakshankavishatt-9591s-projects.vercel.app',
    topics: ['nextjs', 'supabase', 'prisma', 'neon', 'postgresql', 'full-stack-web-development'],
    language: 'TypeScript',
    stargazers_count: 0, forks_count: 0, fork: false,
    updated_at: new Date().toISOString(),
    allLanguages: ['TypeScript', 'CSS', 'JavaScript'],
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
    allLanguages: ['JavaScript'],
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
    updated_at: new Date().toISOString(),
    allLanguages: ['JavaScript', 'TypeScript', 'CSS'],
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
    allLanguages: ['JavaScript'],
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
    allLanguages: ['Python', 'HTML'],
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
    allLanguages: ['Python', 'HTML'],
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
    allLanguages: ['Java'],
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
    updated_at: new Date().toISOString(),
    allLanguages: ['Python', 'Jupyter Notebook'],
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
    updated_at: new Date().toISOString(),
    allLanguages: ['Java', 'TypeScript', 'CSS'],
  },
  {
    id: -4,
    name: 'kavisha_portfolio-V2',
    description: 'Personal portfolio built with React 19, Vite, Tailwind v4, and framer-motion. The site you’re looking at right now.',
    html_url: 'https://github.com/MacroMaster101/kavisha_portfolio-V2',
    homepage: 'https://kavisha-portfolio-v2.vercel.app',
    topics: ['react', 'vite', 'tailwindcss', 'typescript'],
    language: 'TypeScript',
    stargazers_count: 0, forks_count: 0, fork: false,
    updated_at: new Date().toISOString(),
    allLanguages: ['TypeScript', 'CSS', 'JavaScript'],
  },
  {
    id: -12,
    name: 'kavisha_portfolio',
    description: 'Earlier personal portfolio built with React, Vite, and CSS.',
    html_url: 'https://github.com/MacroMaster101/kavisha_portfolio',
    homepage: '',
    topics: ['portfolio', 'react', 'vite'],
    language: 'CSS',
    stargazers_count: 0, forks_count: 0, fork: false,
    updated_at: new Date().toISOString(),
    allLanguages: ['CSS', 'JavaScript'],
  },
];

const mergeRepos = (repos: GithubRepo[]) => {
  const byName = new Map<string, GithubRepo>();

  for (const repo of FALLBACK_REPOS) {
    byName.set(repo.name.toLowerCase(), repo);
  }

  for (const repo of repos) {
    byName.set(repo.name.toLowerCase(), {
      ...byName.get(repo.name.toLowerCase()),
      ...repo,
      allLanguages: repo.allLanguages?.length
        ? repo.allLanguages
        : byName.get(repo.name.toLowerCase())?.allLanguages ?? [],
    });
  }

  return Array.from(byName.values())
    // Final privacy guard — drop anything marked private no matter the source
    // (live API, stale cache, or bundled fallback).
    .filter(repo => repo.private !== true)
    .sort((a, b) => {
      const featuredA = FEATURED_NAMES.indexOf(a.name.toLowerCase());
      const featuredB = FEATURED_NAMES.indexOf(b.name.toLowerCase());
      if (featuredA !== -1 || featuredB !== -1) {
        if (featuredA === -1) return 1;
        if (featuredB === -1) return -1;
        return featuredA - featuredB;
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
};

const readCachedRepos = () => {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp >= CACHE_TTL) return null;

    return mergeRepos(data);
  } catch {
    return null;
  }
};

export function Projects() {
  // Start with bundled fallback so something is always visible
  const [repos, setRepos] = useState<GithubRepo[]>(() => readCachedRepos() ?? mergeRepos([]));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  useEffect(() => {
    // Cache-bust the GitHub API call: api.github.com caches responses at its edge
    // for up to ~60s, so a freshly made-private / renamed / deleted repo can linger.
    // A per-load timestamp param + no-store forces a fresh list every visit, so
    // visibility changes reflect on the site within seconds, not a minute.
    const apiUrl =
      `https://api.github.com/users/MacroMaster101/repos?sort=updated&per_page=100&_=${Date.now()}`;
    fetch(apiUrl, { headers: ghHeaders, cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error('GitHub API error');
        return res.json();
      })
      .then(async (data: GithubRepo[]) => {
        // Defensive privacy guard: never display a repo the API marks private, even
        // if the token happens to have private access. Public repos are the only
        // thing that should ever appear in the portfolio.
        const publicOnly = data.filter(repo => repo.private !== true);
        const sorted = publicOnly.sort(
          (a, b) =>
            b.stargazers_count - a.stargazers_count ||
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        );
        const withLanguages = await Promise.all(
          sorted.map(async repo => {
            let language = repo.language;
            let allLanguages: string[] = [];
            try {
              const langsRes = await fetch(`https://api.github.com/repos/MacroMaster101/${repo.name}/languages`, { headers: ghHeaders });
              const langsData = await langsRes.json();
              allLanguages = Object.keys(langsData).slice(0, 5);
              if (!language && allLanguages.length > 0) language = allLanguages[0];
            } catch { /* ignore */ }

            // Latest published release, if any. 404 (no releases) is the common case and
            // is treated as "no download button" rather than an error.
            let latestRelease: LatestRelease | null = null;
            try {
              const relRes = await fetch(`https://api.github.com/repos/MacroMaster101/${repo.name}/releases/latest`, { headers: ghHeaders });
              if (relRes.ok) latestRelease = toLatestRelease(await relRes.json());
            } catch { /* ignore */ }

            return { ...repo, language, allLanguages, latestRelease };
          }),
        );
        const mergedRepos = mergeRepos(withLanguages);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: mergedRepos, timestamp: Date.now() }));
        } catch { /* ignore */ }
        setRepos(mergedRepos);
      })
      .catch(() => {
        // On API failure, keep showing cached/bundled fallback data.
        setError(false);
      })
      .finally(() => setLoading(false));
  }, []);

  // Split into featured + rest
  const featured = FEATURED_NAMES
    .map(n => repos.find(r => r.name.toLowerCase() === n))
    .filter((r): r is GithubRepo => Boolean(r))
    .slice(0, 4);
  const featuredIds = new Set(featured.map(r => r.id));
  // Exclude the "MacroMaster101" GitHub profile repo (it's just a README)
  const rest = repos.filter(r => !featuredIds.has(r.id) && r.name !== 'MacroMaster101');
  const filteredRest =
    activeCategory === 'All' ? rest : rest.filter(r => classifyRepo(r) === activeCategory);
  const visibleRest = showAll ? filteredRest : filteredRest.slice(0, 6);

  const handleCategory = (c: Category) => {
    setActiveCategory(c);
    setShowAll(false);
  };

  return (
    <>
      {/* Featured Projects */}
      <Section id="projects" num="03." title="Some Things I've Built">
        {loading && (
          <p className="text-slate-500 text-center py-10 font-mono text-sm">Loading projects from GitHub…</p>
        )}
        {error && (
          <p className="text-slate-500 text-center py-10 text-sm">
            Could not load repositories.{' '}
            <a href="https://github.com/MacroMaster101" className="text-brand-primary hover:underline" target="_blank" rel="noopener noreferrer">
              Visit GitHub
            </a>
          </p>
        )}

        {!loading && !error && featured.length > 0 && (
          <div className="space-y-24 md:space-y-32">
            {featured.map((repo, idx) => {
              const isReverse = idx % 2 === 1;
              const techStack = repoStack(repo);
              return (
                <motion.article
                  key={repo.id}
                  initial={false}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6 }}
                  className="relative grid md:grid-cols-12 items-center gap-y-6"
                >
                  {/* Image — fills 7 cols on desktop, full width on mobile */}
                  <a
                    href={repo.homepage || repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative md:col-span-7 ${isReverse ? 'md:col-start-6' : 'md:col-start-1'} md:row-start-1 z-0`}
                  >
                    {/* Soft brand glow behind the frame */}
                    <div className="absolute -inset-2 rounded-2xl bg-brand-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    {/* object-contain keeps the WHOLE social-preview visible (no cropping);
                        the dark brand-gradient panel makes any letterbox margin look intentional. */}
                    <div className="relative aspect-[2/1] rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-[#161229] ring-1 ring-slate-200/70 dark:ring-white/10 shadow-[0_12px_40px_-12px_rgba(2,12,27,0.5)] dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)] group-hover:ring-brand-primary/40 transition-all duration-500">
                      <ProjectImage
                        repoName={repo.name}
                        alt={repo.name}
                        loading="lazy"
                        className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-700"
                      />
                    </div>
                  </a>

                  {/* Content — fills 6 cols on desktop, full width stacked below image on mobile */}
                  <div
                    className={`relative md:col-span-6 ${isReverse ? 'md:col-start-1 md:text-left' : 'md:col-start-7 md:text-right'} md:row-start-1 z-10`}
                  >
                    <p className="font-mono text-brand-primary text-xs md:text-sm mb-2">Featured Project</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4 hover:text-brand-primary transition-colors">
                      <a href={repo.homepage || repo.html_url} target="_blank" rel="noopener noreferrer">
                        {formatName(repo.name)}
                      </a>
                    </h3>
                    <div className="md:bg-white/80 dark:md:bg-slate-900/80 md:backdrop-blur-md md:p-6 md:rounded-xl md:ring-1 md:ring-slate-200/70 dark:md:ring-white/10 md:shadow-[0_12px_40px_-12px_rgba(2,12,27,0.45)] dark:md:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)] text-slate-600 dark:text-slate-400 text-[15px] leading-relaxed">
                      {repo.description || 'A project I built — check the repo for details.'}
                    </div>
                    {techStack.length > 0 && (
                      <ul className={`mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[12px] text-slate-500 dark:text-slate-500 ${isReverse ? 'justify-start' : 'md:justify-end'}`}>
                        {techStack.slice(0, 6).map(lang => (
                          <li key={lang}>{lang}</li>
                        ))}
                      </ul>
                    )}
                    {repo.latestRelease && (
                      <div className={`mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 ${isReverse ? 'justify-start' : 'md:justify-end'}`}>
                        <a
                          href={repo.latestRelease.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_-8px] shadow-brand-primary/60 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px] hover:shadow-brand-primary/70 transition-all"
                        >
                          <Download size={16} /> Download {repo.latestRelease.version}
                        </a>
                        {repo.latestRelease.downloads > 0 && (
                          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                            {formatDownloads(repo.latestRelease.downloads)} downloads
                          </span>
                        )}
                      </div>
                    )}
                    <div className={`mt-4 flex gap-4 text-slate-500 dark:text-slate-400 ${isReverse ? 'justify-start' : 'md:justify-end'}`}>
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub repo"
                        className="hover:text-brand-primary hover:-translate-y-0.5 transition-all"
                      >
                        <Github size={20} />
                      </a>
                      {repo.homepage && (
                        <a
                          href={repo.homepage}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Live demo"
                          className="hover:text-brand-primary hover:-translate-y-0.5 transition-all"
                        >
                          <ExternalLink size={20} />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </Section>

      {/* Other Noteworthy Projects */}
      {!loading && !error && rest.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="w-full max-w-[1000px] mx-auto px-6 sm:px-10">
            <div className="text-center mb-4">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">Everything Else I&apos;ve Shipped</h3>
              <a
                href="https://github.com/MacroMaster101"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 font-mono text-sm text-brand-primary hover:underline underline-offset-4"
              >
                view the archive
              </a>
            </div>

            {/* Category filter pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-8">
              {CATEGORIES.map(cat => {
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategory(cat)}
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
              {visibleRest.map((repo, idx) => {
                const techStack = repoStack(repo);
                return (
                  <motion.article
                    key={repo.id}
                    initial={false}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.3) }}
                    whileHover={{ y: -7 }}
                    className="group relative flex flex-col rounded-md bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-transparent shadow-sm hover:shadow-2xl hover:shadow-brand-primary/10 transition-shadow overflow-hidden"
                  >
                    <a
                      href={repo.homepage || repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative block aspect-[2/1] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-[#161229]"
                    >
                      <ProjectImage
                        repoName={repo.name}
                        alt={repo.name}
                        loading="lazy"
                        className="w-full h-full object-contain object-center group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    </a>
                    <header className="flex items-center justify-between px-6 pt-5 mb-4">
                      <Folder size={24} className="text-brand-primary" />
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                        {repo.stargazers_count > 0 && (
                          <span className="flex items-center gap-1 text-xs"><Star size={13} /> {repo.stargazers_count}</span>
                        )}
                        {repo.forks_count > 0 && (
                          <span className="flex items-center gap-1 text-xs"><GitFork size={13} /> {repo.forks_count}</span>
                        )}
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="GitHub"
                          className="hover:text-brand-primary transition-colors"
                        >
                          <Github size={18} />
                        </a>
                        {repo.homepage && (
                          <a
                            href={repo.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Live demo"
                            className="hover:text-brand-primary transition-colors"
                          >
                            <ExternalLink size={18} />
                          </a>
                        )}
                      </div>
                    </header>

                    <div className="flex flex-col flex-1 px-6 pb-6">
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-brand-primary transition-colors">
                        <a href={repo.homepage || repo.html_url} target="_blank" rel="noopener noreferrer">
                          {formatName(repo.name)}
                        </a>
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 line-clamp-3 flex-1">
                        {repo.description || 'No description provided.'}
                      </p>
                      {techStack.length > 0 && (
                        <ul className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-slate-500 dark:text-slate-500">
                          {techStack.slice(0, 5).map(lang => (
                            <li key={lang}>{lang}</li>
                          ))}
                        </ul>
                      )}
                      {repo.latestRelease && (
                        <div className="mt-5 flex items-center justify-between gap-2">
                          <a
                            href={repo.latestRelease.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-md bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white hover:-translate-y-0.5 transition-transform"
                          >
                            <Download size={13} /> Download {repo.latestRelease.version}
                          </a>
                          {repo.latestRelease.downloads > 0 && (
                            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-500 whitespace-nowrap">
                              {formatDownloads(repo.latestRelease.downloads)} downloads
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </div>

            {filteredRest.length > 6 && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setShowAll(s => !s)}
                  className="px-6 py-3 font-mono text-sm font-medium text-brand-primary border border-brand-primary rounded hover:bg-brand-primary/10 hover:-translate-y-0.5 transition-all"
                >
                  {showAll ? 'Show Less' : `Show More (${filteredRest.length - 6})`}
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
