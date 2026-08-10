// Refreshes repository preview URLs plus language/release metadata for the client.
// Authentication is build-side only: GITHUB_TOKEN is never exposed through Vite.

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const GH_USER = 'MacroMaster101';
const OUT_PATH = fileURLToPath(new URL('../src/data/socialPreviews.ts', import.meta.url));
const REQUEST_TIMEOUT_MS = 10_000;
const CONCURRENCY = 5;
const token = process.env.GITHUB_TOKEN;

const apiHeaders = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'kavisha-portfolio-metadata-generator',
  'X-GitHub-Api-Version': '2022-11-28',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function fetchWithTimeout(url, options = {}) {
  return fetch(url, {
    ...options,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

async function fetchJson(url) {
  const response = await fetchWithTimeout(url, { headers: apiHeaders });
  if (!response.ok) return null;
  return response.json();
}

function extractMetaContent(html, property) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const propertyMatch = tag.match(/\bproperty=["']([^"']+)["']/i);
    if (propertyMatch?.[1]?.toLowerCase() !== property.toLowerCase()) continue;
    const contentMatch = tag.match(/\bcontent=["']([^"']+)["']/i);
    if (contentMatch) return contentMatch[1].replaceAll('&amp;', '&');
  }
  return null;
}

function extractCustomPreview(html) {
  const raw = extractMetaContent(html, 'og:image');
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' || url.hostname !== 'repository-images.githubusercontent.com') return null;
    url.search = '';
    url.hash = '';
    return url.href;
  } catch {
    return null;
  }
}

function toLatestRelease(value) {
  if (!value || typeof value !== 'object' || value.draft === true) return null;
  const assets = Array.isArray(value.assets) ? value.assets : [];
  const validAssets = assets.filter((asset) =>
    asset && typeof asset.browser_download_url === 'string' &&
    Number.isFinite(asset.download_count) && Number.isFinite(asset.size)
  );
  const primary = [...validAssets].sort((a, b) => b.size - a.size)[0];
  const version = typeof value.tag_name === 'string' && value.tag_name
    ? value.tag_name
    : typeof value.name === 'string' && value.name
      ? value.name
      : 'latest';
  const url = primary?.browser_download_url ?? value.html_url;
  if (typeof url !== 'string' || !url.startsWith('https://github.com/')) return null;
  return {
    version: version.slice(0, 80),
    url,
    downloads: validAssets.reduce((sum, asset) => sum + Math.max(0, asset.download_count), 0),
  };
}

async function mapWithConcurrency(items, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;
  async function run() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await worker(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, run));
  return results;
}

function safeJson(value) {
  return JSON.stringify(value, null, 2).replaceAll('<', '\\u003c');
}

async function main() {
  console.log(`[project-data] fetching public repositories for ${GH_USER}…`);
  const repos = await fetchJson(`https://api.github.com/users/${GH_USER}/repos?per_page=100&type=public`);
  if (!Array.isArray(repos)) {
    console.warn('[project-data] repository list unavailable; existing generated file left untouched.');
    return;
  }

  const publicRepos = repos.filter((repo) =>
    repo && repo.private !== true && typeof repo.name === 'string' && /^[A-Za-z0-9._-]{1,100}$/.test(repo.name)
  );
  const previews = {};
  const metadata = {};

  await mapWithConcurrency(publicRepos, async (repo) => {
    const key = repo.name.toLowerCase();
    let preview = null;
    let languages = repo.language ? [repo.language] : [];
    let latestRelease = null;

    try {
      const page = await fetchWithTimeout(`https://github.com/${GH_USER}/${encodeURIComponent(repo.name)}`, {
        headers: { 'User-Agent': apiHeaders['User-Agent'] },
      });
      if (page.ok) preview = extractCustomPreview(await page.text());
    } catch {
      // A preview is optional; keep generating useful API metadata.
    }

    try {
      const response = await fetchJson(`https://api.github.com/repos/${GH_USER}/${encodeURIComponent(repo.name)}/languages`);
      if (response && typeof response === 'object' && !Array.isArray(response)) {
        languages = Object.keys(response).slice(0, 5);
      }
    } catch {
      // The list response's primary language remains a useful fallback.
    }

    try {
      latestRelease = toLatestRelease(
        await fetchJson(`https://api.github.com/repos/${GH_USER}/${encodeURIComponent(repo.name)}/releases/latest`),
      );
    } catch {
      // Most repositories have no releases; null is the intended representation.
    }

    if (preview) previews[key] = preview;
    metadata[key] = { allLanguages: languages, latestRelease };
  });

  const sortObject = (value) => Object.fromEntries(
    Object.entries(value).sort(([a], [b]) => a.localeCompare(b)),
  );
  const body = `// AUTO-GENERATED by scripts/fetch-social-previews.mjs — do not edit by hand.
// Metadata is resolved outside the browser so client loads need only one public API request.

export const SOCIAL_PREVIEWS: Record<string, string> = ${safeJson(sortObject(previews))};

export const PROJECT_METADATA: Record<string, {
  allLanguages: string[];
  latestRelease?: { version: string; url: string; downloads: number } | null;
}> = ${safeJson(sortObject(metadata))};
`;

  await mkdir(dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, body, 'utf8');
  console.log(`[project-data] wrote ${Object.keys(previews).length} previews and ${Object.keys(metadata).length} metadata entries.`);
}

main().catch((error) => {
  console.warn('[project-data] generation skipped:', error instanceof Error ? error.message : 'unknown error');
});
