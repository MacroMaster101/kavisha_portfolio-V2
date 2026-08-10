import assert from 'node:assert/strict';
import test from 'node:test';
import { parseGithubRepo, parseGithubRepoCache, parseGithubRepos, safeHttpUrl } from '../src/lib/github';

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
