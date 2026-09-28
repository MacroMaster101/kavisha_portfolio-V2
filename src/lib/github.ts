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

const GITHUB_OWNER = 'MacroMaster101';
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
  const url = safeHttpUrl(value.url, ['github.com', 'objects.githubusercontent.com']);
  const downloads = finiteNumber(value.downloads);
  if (!version || !url || downloads === null || downloads < 0) return null;
  return { version, url, downloads };
}

// Distills a raw `GET /repos/{owner}/{repo}/releases/latest` response into what a card
// needs. Mirrors toLatestRelease() in scripts/fetch-social-previews.mjs so live and
// build-time data agree: primary (largest) asset URL, or the release page if none.
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
  if (!/^[A-Za-z0-9._-]{1,100}$/.test(repoName)) return undefined;
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${encodeURIComponent(repoName)}/releases/latest`,
      { signal, headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } },
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
  const name = typeof value.name === 'string' && /^[A-Za-z0-9._-]{1,100}$/.test(value.name)
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

export function countShippedProjects(repos: GithubRepo[]): number {
  return repos.filter(
    (repo) => !repo.fork && repo.name.toLowerCase() !== GITHUB_OWNER.toLowerCase(),
  ).length;
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

export async function fetchPublicGithubRepos(signal: AbortSignal): Promise<GithubRepo[]> {
  const response = await fetch(GITHUB_API, {
    signal,
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
  const repos = parseGithubRepos(await response.json());
  if (repos.length === 0) throw new Error('GitHub API returned no valid public repositories');
  return repos;
}
