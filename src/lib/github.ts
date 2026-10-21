export interface LatestRelease {
  version: string;
  url: string;
  downloads: number;
}

export interface GithubRepo {
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

// Shared with scripts/fetch-social-previews.mjs, which imports this file directly.
export const GITHUB_OWNER = 'MacroMaster101';
export const REPO_NAME_RE = /^[A-Za-z0-9._-]{1,100}$/;
export const GITHUB_API_HEADERS = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
} as const;
const GITHUB_API = `https://api.github.com/users/${GITHUB_OWNER}/repos?sort=updated&per_page=100&type=public`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const finiteNumber = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

export function safeHttpUrl(value: unknown, allowedHosts?: readonly string[]): string | null {
  if (typeof value !== 'string' || value.length > 2048) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    if (url.username || url.password) return null;
    if (allowedHosts && !allowedHosts.includes(url.hostname.toLowerCase())) return null;
    return url.href;
  } catch {
    return null;
  }
}

function parseRelease(value: unknown): LatestRelease | null {
  if (!isRecord(value)) return null;
  const version = typeof value.version === 'string' ? value.version.slice(0, 80) : '';
  const url = safeHttpUrl(value.url, ['github.com']);
  const downloads = finiteNumber(value.downloads);
  if (!version || !url || downloads === null || downloads < 0) return null;
  return { version, url, downloads };
}

// Distills a raw `GET /repos/{owner}/{repo}/releases/latest` response into what a card
// needs. scripts/fetch-social-previews.mjs uses it too, so live and build-time data
// agree: primary (largest) asset URL, or the release page if none.
export function parseGithubReleaseResponse(value: unknown): LatestRelease | null {
  if (!isRecord(value) || value.draft === true) return null;
  const assets = (Array.isArray(value.assets) ? value.assets : []).filter(
    (asset): asset is Record<string, unknown> =>
      isRecord(asset) &&
      typeof asset.browser_download_url === 'string' &&
      finiteNumber(asset.download_count) !== null &&
      finiteNumber(asset.size) !== null,
  );
  const primary = [...assets].sort((a, b) => (b.size as number) - (a.size as number))[0];
  const version = typeof value.tag_name === 'string' && value.tag_name
    ? value.tag_name
    : typeof value.name === 'string' && value.name ? value.name : 'latest';
  return parseRelease({
    version,
    url: primary?.browser_download_url ?? value.html_url,
    downloads: assets.reduce((sum, asset) => sum + Math.max(0, asset.download_count as number), 0),
  });
}

// Live lookup so a new release shows up without waiting for the daily metadata refresh.
// Resolves null when the repo has no published release, undefined when GitHub could not
// answer (rate limit, network) so callers keep whatever release data they already have.
export async function fetchLatestRelease(
  repoName: string,
  signal: AbortSignal,
): Promise<LatestRelease | null | undefined> {
  if (!REPO_NAME_RE.test(repoName)) return undefined;
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${encodeURIComponent(repoName)}/releases/latest`,
      { signal, headers: GITHUB_API_HEADERS },
    );
    if (response.status === 404) return null;
    if (!response.ok) return undefined;
    return parseGithubReleaseResponse(await response.json()) ?? undefined;
  } catch {
    return undefined;
  }
}

export function parseGithubRepo(value: unknown): GithubRepo | null {
  if (!isRecord(value)) return null;

  const id = finiteNumber(value.id);
  const name = typeof value.name === 'string' && REPO_NAME_RE.test(value.name)
    ? value.name
    : null;
  const htmlUrl = safeHttpUrl(value.html_url, ['github.com']);
  const updatedAt = typeof value.updated_at === 'string' && !Number.isNaN(Date.parse(value.updated_at))
    ? value.updated_at
    : null;
  if (id === null || !name || !htmlUrl || !updatedAt || value.private === true) return null;

  const repoUrl = new URL(htmlUrl);
  const expectedPrefix = `/${GITHUB_OWNER.toLowerCase()}/${name.toLowerCase()}`;
  const repoPath = repoUrl.pathname.toLowerCase().replace(/\/$/, '');
  if (repoPath !== expectedPrefix) return null;

  const topics = Array.isArray(value.topics)
    ? value.topics.filter((topic): topic is string => typeof topic === 'string').slice(0, 30)
    : [];
  const allLanguages = Array.isArray(value.allLanguages)
    ? value.allLanguages.filter((language): language is string => typeof language === 'string').slice(0, 10)
    : [];
  const language = typeof value.language === 'string' ? value.language.slice(0, 80) : null;
  const description = typeof value.description === 'string' ? value.description.slice(0, 500) : null;

  return {
    id,
    name,
    description,
    html_url: htmlUrl,
    homepage: safeHttpUrl(value.homepage),
    topics,
    language,
    stargazers_count: Math.max(0, finiteNumber(value.stargazers_count) ?? 0),
    forks_count: Math.max(0, finiteNumber(value.forks_count) ?? 0),
    fork: value.fork === true,
    private: false,
    updated_at: updatedAt,
    allLanguages,
    latestRelease: parseRelease(value.latestRelease),
  };
}

export function parseGithubRepos(value: unknown): GithubRepo[] {
  if (!Array.isArray(value)) return [];
  return value.map(parseGithubRepo).filter((repo): repo is GithubRepo => repo !== null);
}

// The profile README repo (MacroMaster101/MacroMaster101) is not a project.
export const isProfileRepo = (repo: { name: string }) => repo.name.toLowerCase() === GITHUB_OWNER.toLowerCase();

export function countShippedProjects(repos: GithubRepo[]): number {
  return repos.filter((repo) => !repo.fork && !isProfileRepo(repo)).length;
}

export function parseGithubRepoCache(
  raw: string,
  ttlMs: number,
  now = Date.now(),
): GithubRepo[] | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || typeof parsed.timestamp !== 'number' || !Number.isFinite(parsed.timestamp)) return null;
    if (parsed.timestamp > now + 60_000 || now - parsed.timestamp >= ttlMs) return null;
    const repos = parseGithubRepos(parsed.data);
    return repos.length > 0 ? repos : null;
  } catch {
    return null;
  }
}

// Bump this when the cached shape or fallback set changes, to discard stale caches
// in returning visitors' browsers (e.g. one that cached a now-private repo).
export const GITHUB_REPO_CACHE_KEY = 'gh_repos_v10';
// Short enough that a newly published release reaches returning visitors the same hour.
export const GITHUB_REPO_CACHE_TTL = 60 * 60 * 1000; // 1 hour

// The repo list Projects cached within the TTL, or null. About reads it too, so a
// cached visit makes no repo-list request at all.
export function readGithubRepoCache(): GithubRepo[] | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const cached = localStorage.getItem(GITHUB_REPO_CACHE_KEY);
    return cached ? parseGithubRepoCache(cached, GITHUB_REPO_CACHE_TTL) : null;
  } catch {
    try { localStorage.removeItem(GITHUB_REPO_CACHE_KEY); } catch { /* storage unavailable */ }
    return null;
  }
}

const REPOS_TIMEOUT_MS = 8000;
let reposRequest: Promise<GithubRepo[]> | null = null;

// One request per page load, shared by every section that needs the list (About's count,
// Projects' cards), so a visit spends one call of the 60/hour unauthenticated budget.
// It isn't tied to any caller's lifetime — callers that unmount just ignore the result —
// and it rejects with a TimeoutError after 8 s. A failed request is forgotten so a later
// caller can retry.
export function fetchPublicGithubRepos(): Promise<GithubRepo[]> {
  reposRequest ??= requestPublicGithubRepos().catch((error: unknown) => {
    reposRequest = null;
    throw error;
  });
  return reposRequest;
}

async function requestPublicGithubRepos(): Promise<GithubRepo[]> {
  const response = await fetch(GITHUB_API, {
    signal: AbortSignal.timeout(REPOS_TIMEOUT_MS),
    headers: GITHUB_API_HEADERS,
  });
  if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
  const repos = parseGithubRepos(await response.json());
  if (repos.length === 0) throw new Error('GitHub API returned no valid public repositories');
  return repos;
}
