import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Folder, Star, GitFork } from 'lucide-react';
import { Section } from '../ui/Section';
import { Github } from '../ui/BrandIcons';

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
  updated_at: string;
  allLanguages: string[];
}

const formatName = (name: string) =>
  name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const CATEGORIES = ['All', 'Full Stack', 'Web', 'Mobile App', 'AI/ML', 'Discord Bot', 'Portfolio', 'Other'] as const;
type Category = typeof CATEGORIES[number];

function classifyRepo(repo: GithubRepo): Exclude<Category, 'All'> {
  const haystack = [
    repo.name,
    repo.description ?? '',
    ...(repo.topics ?? []),
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
  if (has('spring-boot', 'spring boot', 'express', 'nodejs', 'node.js', 'fullstack', 'full-stack', 'postgres', 'mongodb', 'mysql', 'jwt'))
    return 'Full Stack';
  if (has('react', 'vite', 'next', 'vue', 'svelte', 'tailwind', 'html', 'css', 'javascript', 'typescript', 'web'))
    return 'Web';
  return 'Other';
}

const CACHE_KEY = 'gh_repos_v2';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const GH_TOKEN = import.meta.env.VITE_GITHUB_TOKEN as string | undefined;
const ghHeaders: HeadersInit = GH_TOKEN ? { Authorization: `Bearer ${GH_TOKEN}` } : {};

// Names of repos we want pinned as "Featured" (in display order, lowercased).
// Anything matching will appear in the featured section.
const FEATURED_NAMES = [
  'travel_genie',
  'travel_genie_app',
  'web-voting-system',
  'kavisha_portfolio-v2',
].map(n => n.toLowerCase());

// Optional per-repo image overrides. Keys are lowercased repo names.
// Drop a file in public/projects/ and reference it as `${BASE_URL}projects/filename.ext`.
// If a repo isn't listed here, falls back to GitHub's social preview / OG image.
//
// Why use local overrides at all? GitHub's opengraph CDN caches social previews for
// ~6+ hours and is slow to pick up new uploads. Local images update instantly.
const IMAGE_OVERRIDES: Record<string, string> = {
  'discord-youtube-status-bot': `${import.meta.env.BASE_URL}projects/discord-youtube-status-bot.jpg`,
  'kavisha_portfolio-v2': `${import.meta.env.BASE_URL}projects/kavisha_portfolio-V2.png`,
  'kavisha_portfolio': `${import.meta.env.BASE_URL}projects/kavisha_portfolio.png`,
  // Add more here as you save images to public/projects/:
  // 'travel_genie': `${import.meta.env.BASE_URL}projects/travel_genie.png`,
  // 'travel_genie_app': `${import.meta.env.BASE_URL}projects/travel_genie_app.png`,
  // 'web-voting-system': `${import.meta.env.BASE_URL}projects/web-voting-system.png`,
  // 'denguerisk': `${import.meta.env.BASE_URL}projects/denguerisk.png`,
};

// GitHub's OG image CDN caches for ~6 hours. Bump this string after uploading a
// new social preview to force browsers to refetch.
const OG_CACHE_BUST = 'v2';

const repoImage = (repoName: string) =>
  IMAGE_OVERRIDES[repoName.toLowerCase()] ||
  `https://opengraph.githubassets.com/1/MacroMaster101/${repoName}?cb=${OG_CACHE_BUST}`;

// Bundled fallback for unlucky first visits (GitHub API rate-limited).
// Mirrors data shape from the GitHub API; gets replaced as soon as a real fetch succeeds.
const FALLBACK_REPOS: GithubRepo[] = [
  {
    id: -1,
    name: 'Travel_Genie',
    description: 'TravelGenie is a full-stack AI-powered travel planner — itineraries, expense tracking, hotel stays, JWT auth, role-based admin.',
    html_url: 'https://github.com/MacroMaster101/Travel_Genie',
    homepage: 'https://travel-genie-da1t.vercel.app',
    topics: ['react', 'nodejs', 'express', 'postgresql', 'jwt'],
    language: 'JavaScript',
    stargazers_count: 0, forks_count: 0, fork: true,
    updated_at: new Date().toISOString(),
    allLanguages: ['JavaScript', 'TypeScript', 'CSS'],
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
];

export function Projects() {
  // Start with bundled fallback so something is always visible
  const [repos, setRepos] = useState<GithubRepo[]>(FALLBACK_REPOS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setRepos(data);
          setLoading(false);
          return;
        }
      }
    } catch { /* ignore */ }

    fetch('https://api.github.com/users/MacroMaster101/repos?sort=updated&per_page=100', { headers: ghHeaders })
      .then(res => {
        if (!res.ok) throw new Error('GitHub API error');
        return res.json();
      })
      .then(async (data: GithubRepo[]) => {
        const sorted = data.sort(
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
            return { ...repo, language, allLanguages };
          }),
        );
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: withLanguages, timestamp: Date.now() }));
        } catch { /* ignore */ }
        setRepos(withLanguages);
      })
      .catch(() => {
        // On API failure, keep showing the bundled fallback we initialized with.
        // Only flag error if we don't even have fallback data.
        if (repos.length === 0) setError(true);
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
                    <div className="relative aspect-[16/10] rounded-md overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
                      <img
                        src={repoImage(repo.name)}
                        alt={repo.name}
                        onError={(e) => {
                          const img = e.currentTarget;
                          const fallback = `https://opengraph.githubassets.com/1/MacroMaster101/${repo.name}?cb=${OG_CACHE_BUST}`;
                          if (img.src !== fallback) img.src = fallback;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                    <div className="md:bg-slate-50 dark:md:bg-slate-900 md:p-6 md:rounded-md md:shadow-xl text-slate-600 dark:text-slate-400 text-[15px] leading-relaxed">
                      {repo.description || 'A project I built — check the repo for details.'}
                    </div>
                    {repo.allLanguages.length > 0 && (
                      <ul className={`mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[12px] text-slate-500 dark:text-slate-500 ${isReverse ? 'justify-start' : 'md:justify-end'}`}>
                        {repo.allLanguages.slice(0, 5).map(lang => (
                          <li key={lang}>{lang}</li>
                        ))}
                      </ul>
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
              {visibleRest.map((repo, idx) => (
                <motion.article
                  key={repo.id}
                  initial={false}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.3) }}
                  whileHover={{ y: -7 }}
                  className="group relative flex flex-col rounded-md bg-slate-50 dark:bg-slate-900 shadow-sm hover:shadow-2xl hover:shadow-brand-primary/10 transition-shadow overflow-hidden"
                >
                  <a
                    href={repo.homepage || repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block aspect-[16/9] overflow-hidden bg-white dark:bg-slate-800"
                  >
                    <img
                      src={repoImage(repo.name)}
                      alt={repo.name}
                      loading="lazy"
                      onError={(e) => {
                        const img = e.currentTarget;
                        const fallback = `https://opengraph.githubassets.com/1/MacroMaster101/${repo.name}?cb=${OG_CACHE_BUST}`;
                        if (img.src !== fallback) img.src = fallback;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                    {repo.allLanguages.length > 0 && (
                      <ul className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-slate-500 dark:text-slate-500">
                        {repo.allLanguages.slice(0, 4).map(lang => (
                          <li key={lang}>{lang}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.article>
              ))}
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
