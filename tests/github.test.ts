import assert from 'node:assert/strict';
import test from 'node:test';
import {
  countShippedProjects,
  fetchLatestRelease,
  fetchPublicGithubRepos,
  isProfileRepo,
  parseGithubRepo,
  parseGithubRepoCache,
  parseGithubReleaseResponse,
  parseGithubRepos,
  safeHttpUrl,
} from '../src/lib/github';

const validRepo = {
  id: 42,
  name: 'public-project',
  description: 'A public project',
  html_url: 'https://github.com/MacroMaster101/public-project',
  homepage: 'https://example.com/demo',
  topics: ['react'],
  language: 'TypeScript',
  stargazers_count: 3,
  forks_count: 1,
  fork: false,
  private: false,
  updated_at: '2026-08-01T00:00:00Z',
  allLanguages: ['TypeScript', 'CSS'],
};

test('accepts and normalizes a valid public repository', () => {
  const parsed = parseGithubRepo(validRepo);
  assert.equal(parsed?.name, 'public-project');
  assert.equal(parsed?.homepage, 'https://example.com/demo');
  assert.deepEqual(parsed?.allLanguages, ['TypeScript', 'CSS']);
});

test('rejects private repositories regardless of other fields', () => {
  assert.equal(parseGithubRepo({ ...validRepo, private: true }), null);
});

test('rejects repositories outside the intended GitHub owner and exact path', () => {
  assert.equal(parseGithubRepo({ ...validRepo, html_url: 'https://github.com/another-owner/public-project' }), null);
  assert.equal(parseGithubRepo({ ...validRepo, html_url: 'https://github.com/MacroMaster101/public-project-evil' }), null);
});

test('blocks unsafe and credential-bearing URLs', () => {
  assert.equal(safeHttpUrl('javascript:alert(1)'), null);
  assert.equal(safeHttpUrl('http://example.com'), null);
  assert.equal(safeHttpUrl('https://user:pass@example.com'), null);
  assert.equal(safeHttpUrl('https://github.com/example', ['github.com']), 'https://github.com/example');
});

test('drops malformed array entries instead of trusting cached/API data', () => {
  const parsed = parseGithubRepos([validRepo, null, 'bad', { ...validRepo, id: '42' }]);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].id, 42);
});

test('sanitizes malformed optional fields', () => {
  const parsed = parseGithubRepo({
    ...validRepo,
    homepage: 'data:text/html,bad',
    description: 123,
    topics: ['safe', 123],
    stargazers_count: -5,
  });
  assert.equal(parsed?.homepage, null);
  assert.equal(parsed?.description, null);
  assert.deepEqual(parsed?.topics, ['safe']);
  assert.equal(parsed?.stargazers_count, 0);
});

test('rejects corrupt, expired, future-dated, and schema-invalid cache entries', () => {
  const now = Date.parse('2026-08-10T00:00:00Z');
  const ttl = 24 * 60 * 60 * 1000;
  assert.equal(parseGithubRepoCache('{bad json', ttl, now), null);
  assert.equal(parseGithubRepoCache(JSON.stringify({ timestamp: now - ttl, data: [validRepo] }), ttl, now), null);
  assert.equal(parseGithubRepoCache(JSON.stringify({ timestamp: now + 120_000, data: [validRepo] }), ttl, now), null);
  assert.equal(parseGithubRepoCache(JSON.stringify({ timestamp: now, data: [{ bad: true }] }), ttl, now), null);
});

test('accepts a fresh cache only after validating every repository', () => {
  const now = Date.parse('2026-08-10T00:00:00Z');
  const parsed = parseGithubRepoCache(
    JSON.stringify({ timestamp: now - 1_000, data: [validRepo, { ...validRepo, private: true }] }),
    24 * 60 * 60 * 1000,
    now,
  );
  assert.equal(parsed?.length, 1);
  assert.equal(parsed?.[0].name, 'public-project');
});

test('picks the largest asset and totals downloads from a latest-release response', () => {
  const release = parseGithubReleaseResponse({
    tag_name: 'v1.0.12',
    html_url: 'https://github.com/MacroMaster101/app/releases/tag/v1.0.12',
    assets: [
      { browser_download_url: 'https://github.com/MacroMaster101/app/releases/download/v1.0.12/small.yml', size: 10, download_count: 4 },
      { browser_download_url: 'https://github.com/MacroMaster101/app/releases/download/v1.0.12/Setup.exe', size: 9000, download_count: 20 },
    ],
  });
  assert.deepEqual(release, {
    version: 'v1.0.12',
    url: 'https://github.com/MacroMaster101/app/releases/download/v1.0.12/Setup.exe',
    downloads: 24,
  });
});

test('falls back to the release page and rejects drafts or off-site URLs', () => {
  assert.deepEqual(
    parseGithubReleaseResponse({ tag_name: 'v2.0.0', html_url: 'https://github.com/MacroMaster101/app/releases/tag/v2.0.0', assets: [] }),
    { version: 'v2.0.0', url: 'https://github.com/MacroMaster101/app/releases/tag/v2.0.0', downloads: 0 },
  );
  assert.equal(parseGithubReleaseResponse({ draft: true, tag_name: 'v3', html_url: 'https://github.com/x' }), null);
  assert.equal(parseGithubReleaseResponse({ tag_name: 'v3', html_url: 'https://evil.example/x', assets: [] }), null);
});

test('counts shipped projects without forks or the profile repository', () => {
  const project = parseGithubRepo(validRepo);
  const fork = parseGithubRepo({ ...validRepo, id: 43, name: 'forked', html_url: 'https://github.com/MacroMaster101/forked', fork: true });
  const profileRepo = parseGithubRepo({ ...validRepo, id: 44, name: 'MacroMaster101', html_url: 'https://github.com/MacroMaster101/MacroMaster101' });
  assert.ok(project && fork && profileRepo);
  assert.equal(countShippedProjects([project, fork, profileRepo]), 1);
});

test('rejects hosts outside an allow-list, invalid names, bad dates, and accepts a trailing slash', () => {
  assert.equal(safeHttpUrl('https://evil.example/x', ['github.com']), null);
  assert.equal(parseGithubRepo({ ...validRepo, name: '../escape' }), null);
  assert.equal(parseGithubRepo({ ...validRepo, updated_at: 'not a date' }), null);
  assert.equal(parseGithubRepo({ ...validRepo, html_url: 'https://github.com/MacroMaster101/public-project/' })?.name, 'public-project');
});

test('re-validates release data carried in cached repositories', () => {
  const release = { version: 'v1', url: 'https://github.com/MacroMaster101/public-project/releases/tag/v1', downloads: 5 };
  assert.deepEqual(parseGithubRepo({ ...validRepo, latestRelease: release })?.latestRelease, release);
  assert.equal(parseGithubRepo({ ...validRepo, latestRelease: { ...release, url: 'https://evil.example/x' } })?.latestRelease, null);
  assert.equal(parseGithubRepo({ ...validRepo, latestRelease: { ...release, downloads: -1 } })?.latestRelease, null);
});

test('names a release by tag, then name, then "latest", and skips assets without a usable size', () => {
  const page = 'https://github.com/MacroMaster101/app/releases/tag/x';
  assert.equal(parseGithubReleaseResponse({ name: 'Spring build', html_url: page, assets: [] })?.version, 'Spring build');
  assert.equal(parseGithubReleaseResponse({ html_url: page, assets: [] })?.version, 'latest');
  const release = parseGithubReleaseResponse({
    tag_name: 'v1',
    html_url: page,
    assets: [
      { browser_download_url: 'https://github.com/MacroMaster101/app/releases/download/v1/a.zip', size: Infinity, download_count: 7 },
      { browser_download_url: 'https://github.com/MacroMaster101/app/releases/download/v1/b.zip', size: 10, download_count: 2 },
    ],
  });
  assert.deepEqual(release, { version: 'v1', url: 'https://github.com/MacroMaster101/app/releases/download/v1/b.zip', downloads: 2 });
});

test('recognises the profile README repository case-insensitively', () => {
  assert.equal(isProfileRepo({ name: 'macromaster101' }), true);
  assert.equal(isProfileRepo({ name: 'public-project' }), false);
});

// Stubs global fetch for one test, recording the URLs it was called with.
function stubFetch(t: { after: (fn: () => void) => void }, respond: (url: string) => Response | Promise<Response>) {
  const original = globalThis.fetch;
  const calls: string[] = [];
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input);
    calls.push(url);
    return respond(url);
  }) as typeof fetch;
  t.after(() => { globalThis.fetch = original; });
  return calls;
}

test('fetchLatestRelease: null without a release, undefined when GitHub cannot answer', async (t) => {
  const signal = new AbortController().signal;
  const calls = stubFetch(t, (url) => {
    if (url.includes('/none/')) return new Response('', { status: 404 });
    if (url.includes('/limited/')) return new Response('', { status: 403 });
    return Response.json({ tag_name: 'v2', html_url: 'https://github.com/MacroMaster101/app/releases/tag/v2', assets: [] });
  });
  assert.equal(await fetchLatestRelease('none', signal), null);
  assert.equal(await fetchLatestRelease('limited', signal), undefined);
  assert.equal((await fetchLatestRelease('app', signal))?.version, 'v2');
  assert.equal(await fetchLatestRelease('../evil', signal), undefined);
  assert.equal(calls.length, 3, 'an invalid repo name never reaches the network');
});

test('fetchPublicGithubRepos: callers share one request, and a failed one is retried', async (t) => {
  let fail = true;
  const calls = stubFetch(t, () => (fail ? new Response('', { status: 500 }) : Response.json([validRepo])));
  const first = fetchPublicGithubRepos();
  assert.equal(fetchPublicGithubRepos(), first, 'a second caller gets the same request');
  await assert.rejects(first);
  assert.equal(calls.length, 1);

  fail = false;
  const repos = await fetchPublicGithubRepos();
  assert.equal(calls.length, 2, 'the failed request was forgotten');
  assert.equal(repos[0].name, 'public-project');
  await fetchPublicGithubRepos();
  assert.equal(calls.length, 2, 'a successful request is reused');
});
