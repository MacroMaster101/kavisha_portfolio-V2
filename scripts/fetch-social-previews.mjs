// Refreshes repository preview URLs plus language/release metadata for the client.
// Authentication is build-side only: GITHUB_TOKEN is never exposed through Vite.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
// Node 24 strips the types, so the client's validation is reused as-is.
import {
  GITHUB_API_HEADERS,
  GITHUB_OWNER as GH_USER,
  parseGithubReleaseResponse,
  REPO_NAME_RE,
} from '../src/lib/github.ts';

const OUT_PATH = fileURLToPath(new URL('../src/data/socialPreviews.ts', import.meta.url));
const REQUEST_TIMEOUT_MS = 10_000;
const CONCURRENCY = 5;
const token = process.env.GITHUB_TOKEN;

const apiHeaders = {
  ...GITHUB_API_HEADERS,
  'User-Agent': 'kavisha-portfolio-metadata-generator',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function fetchWithTimeout(url, options = {}) {
  return fetch(url, {
    ...options,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

async function fetchJsonResult(url) {
  const response = await fetchWithTimeout(url, { headers: apiHeaders });
  if (!response.ok) return { ok: false, status: response.status, data: null };
  return { ok: true, status: response.status, data: await response.json() };
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

async function readExistingData() {
  try {
    const source = await readFile(OUT_PATH, 'utf8');
    const previewsMatch = source.match(
      /export const SOCIAL_PREVIEWS[^=]*=\s*(\{[\s\S]*?\});\s*export const PROJECT_METADATA/,
    );
    const metadataMatch = source.match(
      /export const PROJECT_METADATA[\s\S]*?>\s*=\s*(\{[\s\S]*\});\s*$/,
    );
    const previews = previewsMatch ? JSON.parse(previewsMatch[1]) : {};
    const metadata = metadataMatch ? JSON.parse(metadataMatch[1]) : {};
    return {
      previews: previews && typeof previews === 'object' && !Array.isArray(previews) ? previews : {},
      metadata: metadata && typeof metadata === 'object' && !Array.isArray(metadata) ? metadata : {},
    };
  } catch {
    return { previews: {}, metadata: {} };
  }
}

async function main() {
  console.log(`[project-data] fetching public repositories for ${GH_USER}…`);
  const repoResult = await fetchJsonResult(`https://api.github.com/users/${GH_USER}/repos?per_page=100&type=public`);
  const repos = repoResult.data;
  if (!Array.isArray(repos)) {
    throw new Error(`repository list unavailable (HTTP ${repoResult.status})`);
  }

  const publicRepos = repos.filter((repo) =>
    repo && repo.private !== true && typeof repo.name === 'string' && REPO_NAME_RE.test(repo.name)
  );
  const existing = await readExistingData();
  const previews = {};
  const metadata = {};

  await mapWithConcurrency(publicRepos, async (repo) => {
    const key = repo.name.toLowerCase();
    let preview = typeof existing.previews[key] === 'string' ? existing.previews[key] : null;
    const previousMetadata = existing.metadata[key];
    let languages = Array.isArray(previousMetadata?.allLanguages)
      ? previousMetadata.allLanguages
      : repo.language ? [repo.language] : [];
    let latestRelease = previousMetadata?.latestRelease ?? null;

    try {
      const page = await fetchWithTimeout(`https://github.com/${GH_USER}/${encodeURIComponent(repo.name)}`, {
        headers: { 'User-Agent': apiHeaders['User-Agent'] },
      });
      if (page.ok) preview = extractCustomPreview(await page.text());
    } catch {
      // A preview is optional; keep generating useful API metadata.
    }

    try {
      const result = await fetchJsonResult(`https://api.github.com/repos/${GH_USER}/${encodeURIComponent(repo.name)}/languages`);
      if (result.ok && result.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
        languages = Object.keys(result.data).slice(0, 5);
      }
    } catch {
      // The list response's primary language remains a useful fallback.
    }

    try {
      const result = await fetchJsonResult(
        `https://api.github.com/repos/${GH_USER}/${encodeURIComponent(repo.name)}/releases/latest`,
      );
      if (result.ok) latestRelease = parseGithubReleaseResponse(result.data);
      else if (result.status === 404) latestRelease = null;
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
  console.error('[project-data] generation failed:', error instanceof Error ? error.message : 'unknown error');
  process.exitCode = 1;
});
