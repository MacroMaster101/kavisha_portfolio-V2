import { useState, useEffect } from 'react';
import { Section } from '../ui/Section';
import { ProjectCard } from '../ui/ProjectCard';

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

const CATEGORIES = ['All', 'Full Stack', 'Web', 'AI/ML', 'Computer Vision', 'IoT', 'Discord Bot', 'Portfolio', 'Other'];

function getCategories(repo: GithubRepo): string[] {
  const t = repo.topics.map(s => s.toLowerCase());
  const name = repo.name.toLowerCase();
  const combined = [...t, name];
  const langs = repo.allLanguages.map(l => l.toLowerCase());
  const cats: string[] = [];

  if (combined.some(s => ['discord-bot', 'discord', 'discordpy', 'discord-js', 'discordjs', 'bot'].includes(s)))
    cats.push('Discord Bot');
  if (combined.some(s => ['portfolio', 'personal-website', 'personal-portfolio', 'portfolio-website'].includes(s)))
    cats.push('Portfolio');
  if (combined.some(s => ['computer-vision', 'opencv', 'image-processing', 'yolo', 'face-recognition', 'object-detection'].includes(s)))
    cats.push('Computer Vision');
  if (combined.some(s => ['machine-learning', 'ai', 'aiml', 'ai-ml', 'ml', 'deep-learning', 'tensorflow', 'pytorch', 'nlp', 'data-science', 'sklearn', 'scikit-learn'].includes(s)))
    cats.push('AI/ML');
  if (combined.some(s => ['iot', 'arduino', 'raspberry-pi', 'esp32', 'esp8266', 'embedded'].includes(s)))
    cats.push('IoT');
  if (combined.some(s => ['fullstack', 'full-stack', 'full_stack', 'full-stack-web-development', 'travel-planner', 'travel-website', 'django', 'flask', 'nodejs', 'express', 'spring-boot', 'laravel', 'nextjs', 'next-js', 'php', 'mysql', 'postgresql', 'mongodb'].includes(s))) {
    if (!cats.includes('Full Stack')) cats.push('Full Stack');
  }
  // Detect Full Stack by language mix: HTML/CSS + a backend language
  const hasHtml = langs.includes('html') || langs.includes('css');
  const hasBackend = langs.some(l => ['php', 'python', 'java', 'ruby', 'c#', 'go', 'kotlin'].includes(l));
  if (hasHtml && hasBackend && !cats.includes('Full Stack')) cats.push('Full Stack');

  if (combined.some(s => ['web', 'website', 'html', 'css', 'javascript', 'typescript', 'frontend', 'backend', 'react', 'vue', 'angular'].includes(s)) && !cats.includes('Web'))
    cats.push('Web');
  if (combined.some(s => ['other', 'misc', 'miscellaneous', 'utility', 'tool', 'script', 'experiment', 'demo', 'playground'].includes(s)))
    cats.push('Other');
  if (cats.length === 0) {
    if (['javascript', 'typescript', 'html', 'css'].includes((repo.language ?? '').toLowerCase())) cats.push('Web');
    else if (repo.language?.toLowerCase() === 'python') cats.push('AI/ML');
    else cats.push('Other');
  }

  return cats;
}

const CACHE_KEY = 'gh_repos_v1';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const GH_TOKEN = import.meta.env.VITE_GITHUB_TOKEN as string | undefined;
const ghHeaders: HeadersInit = GH_TOKEN ? { Authorization: `Bearer ${GH_TOKEN}` } : {};

export function Projects() {
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    // Serve from cache if still fresh
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

        // Fetch all languages for every repo from the languages API
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
            // Fallback for forks: use parent repo's languages
            if (repo.fork && allLanguages.length === 0) {
              try {
                const detailRes = await fetch(`https://api.github.com/repos/MacroMaster101/${repo.name}`, { headers: ghHeaders });
                const detail = await detailRes.json();
                if (detail.parent?.full_name) {
                  const parentLangsRes = await fetch(`https://api.github.com/repos/${detail.parent.full_name}/languages`, { headers: ghHeaders });
                  const parentLangs = await parentLangsRes.json();
                  allLanguages = Object.keys(parentLangs).slice(0, 5);
                  if (!language && allLanguages.length > 0) language = allLanguages[0];
                } else if (!language) {
                  language = detail.language ?? detail.parent?.language ?? null;
                  if (language) allLanguages = [language];
                }
              } catch { /* ignore */ }
            }
            return { ...repo, language, allLanguages };
          }),
        );

        // Save fresh data to cache
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: withLanguages, timestamp: Date.now() }));
        } catch { /* ignore */ }

        setRepos(withLanguages);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // Build filter: only show tabs that have repos
  const usedCategories = CATEGORIES.filter(
    cat => cat === 'All' || repos.some(r => getCategories(r).includes(cat)),
  );
  const filtered = activeFilter === 'All' ? repos : repos.filter(r => getCategories(r).includes(activeFilter));

  return (
    <Section id="projects" className="transition-colors duration-300">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
          GitHub Projects
        </h2>
        <div className="h-2 w-24 bg-brand-primary mx-auto rounded-full mb-4" />
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Live from{' '}
          <a
            href="https://github.com/MacroMaster101"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-primary font-semibold hover:underline"
          >
            github.com/MacroMaster101
          </a>
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <p className="text-center text-slate-500 dark:text-slate-400 py-10">
          Could not load repositories. Visit{' '}
          <a
            href="https://github.com/MacroMaster101"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-primary hover:underline"
          >
            GitHub
          </a>{' '}
          directly.
        </p>
      )}

      {!loading && !error && (
        <>
          {/* Filter tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {usedCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-300 ${
                  activeFilter === cat
                    ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/30'
                    : 'bg-transparent text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-brand-primary/50 hover:text-brand-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
            {filtered.map((repo, index) => (
              <ProjectCard
                key={repo.id}
                title={formatName(repo.name)}
                description={repo.description || 'No description provided.'}
                tags={repo.topics}
                category={getCategories(repo)}
                repoName={repo.name}
                image={`https://opengraph.githubassets.com/1/MacroMaster101/${repo.name}`}
                githubUrl={repo.html_url}
                demoUrl={repo.homepage || undefined}
                index={index}
                stars={repo.stargazers_count}
                forks={repo.forks_count}
                isFork={repo.fork}
                allLanguages={repo.allLanguages}
              />
            ))}
          </div>
        </>
      )}
    </Section>
  );
}

