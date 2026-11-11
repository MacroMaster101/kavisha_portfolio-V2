import assert from 'node:assert/strict';
import test from 'node:test';
import { CHAT_LIMITS, createChatHandler, createRateLimiter, parseChatBody, type ChatStream } from '../server/chat/handler';
import { buildTurns, linkify } from '../src/lib/chat';

const ORIGIN = 'https://kavisha.online';

function post(body: unknown, headers: Record<string, string> = { origin: ORIGIN }) {
  return new Request(`${ORIGIN}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

const ask = (content = 'What has he built?') => ({ messages: [{ role: 'user', content }] });

// A stand-in for the model stream: yields text, then how the answer ended.
function fakeStream(texts: string[], reason: 'stop' | 'refusal' | 'length' = 'stop', failAfter?: number) {
  let aborted = false;
  const stream: ChatStream = {
    async *[Symbol.asyncIterator]() {
      for (const [i, text] of texts.entries()) {
        if (failAfter === i) throw new Error('network down');
        yield { type: 'text', text };
      }
      yield { type: 'end', reason };
    },
    abort: () => {
      aborted = true;
    },
  };
  return { stream, wasAborted: () => aborted };
}

function handlerWith(stream: ChatStream | null, allow = () => true) {
  return createChatHandler({ startStream: () => stream, allow });
}

test('parseChatBody accepts an alternating conversation ending on the visitor', () => {
  const result = parseChatBody({
    messages: [
      { role: 'user', content: ' Hi ' },
      { role: 'assistant', content: 'Hello!' },
      { role: 'user', content: 'Projects?' },
    ],
  });
  assert.deepEqual(result, {
    turns: [
      { role: 'user', content: 'Hi' },
      { role: 'assistant', content: 'Hello!' },
      { role: 'user', content: 'Projects?' },
    ],
  });
});

test('parseChatBody rejects malformed conversations', () => {
  const bad = [
    null,
    {},
    { messages: 'hi' },
    { messages: [] },
    { messages: [{ role: 'system', content: 'x' }] },
    { messages: [{ role: 'user', content: 42 }] },
    { messages: [{ role: 'user', content: '   ' }] },
    { messages: [{ role: 'user', content: 'x'.repeat(CHAT_LIMITS.maxUserChars + 1) }] },
    { messages: [{ role: 'assistant', content: 'hi' }, { role: 'user', content: 'x' }] },
    { messages: [{ role: 'user', content: 'a' }, { role: 'user', content: 'b' }] },
    { messages: [{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }] },
  ];
  for (const body of bad) assert.ok('error' in parseChatBody(body), JSON.stringify(body));
});

test('parseChatBody keeps only the latest turns, starting on a visitor message', () => {
  const messages = Array.from({ length: 15 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `m${i}` }));
  const result = parseChatBody({ messages });
  assert.ok('turns' in result);
  assert.ok(result.turns.length <= CHAT_LIMITS.maxTurns);
  assert.equal(result.turns[0].role, 'user');
  assert.equal(result.turns.at(-1)?.content, 'm14');
});

test('createRateLimiter allows a burst, then blocks until the window passes', () => {
  let now = 0;
  const allow = createRateLimiter(2, 1000, () => now);
  assert.equal(allow('a'), true);
  assert.equal(allow('a'), true);
  assert.equal(allow('a'), false);
  assert.equal(allow('b'), true);
  now = 1000;
  assert.equal(allow('a'), true);
});

test('the handler rejects bad requests before calling the model', async () => {
  let called = false;
  const handler = createChatHandler({
    startStream: () => {
      called = true;
      return null;
    },
    allow: () => true,
  });
  const cases: [Request, number][] = [
    [new Request(`${ORIGIN}/api/chat`), 405],
    [post(ask(), {}), 403],
    [post(ask(), { origin: 'https://evil.example' }), 403],
    [post('{not json'), 400],
    [post({ messages: [] }), 400],
    [post('x'.repeat(CHAT_LIMITS.maxBodyBytes + 1)), 413],
  ];
  for (const [request, status] of cases) assert.equal((await handler(request)).status, status);
  assert.equal(called, false);
});

test('the handler returns 429 when the visitor is over the limit', async () => {
  const response = await handlerWith(null, () => false)(post(ask()));
  assert.equal(response.status, 429);
});

test('the handler returns 503 when no API key is configured', async (t) => {
  t.mock.method(console, 'error', () => {});
  const response = await handlerWith(null)(post(ask()));
  assert.equal(response.status, 503);
  assert.match(((await response.json()) as { error: string }).error, /unavailable/);
});

test('the handler streams the answer as plain text', async () => {
  const { stream } = fakeStream(['Kavisha built ', 'Mazora Network.']);
  const response = await handlerWith(stream)(post(ask()));
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') ?? '', /text\/plain/);
  assert.equal(await response.text(), 'Kavisha built Mazora Network.');
});

test('the handler replaces a refusal with a friendly redirect', async () => {
  const { stream } = fakeStream([], 'refusal');
  const text = await (await handlerWith(stream)(post(ask()))).text();
  assert.match(text, /can't help with that/);
});

test('the handler marks an answer cut off at the length limit', async () => {
  const { stream } = fakeStream(['A long answer'], 'length');
  assert.equal(await (await handlerWith(stream)(post(ask()))).text(), 'A long answer…');
});

test('the handler ends a failed stream with the fallback message', async (t) => {
  t.mock.method(console, 'error', () => {});
  const { stream } = fakeStream(['Partial ', 'answer'], 'stop', 1);
  const text = await (await handlerWith(stream)(post(ask()))).text();
  assert.match(text, /^Partial \n\nSorry, the assistant is unavailable/);
});

test('buildTurns sends completed exchanges and drops failed ones', () => {
  const turns = buildTurns(
    [
      { role: 'user', content: 'Q1' },
      { role: 'assistant', content: 'A1' },
      { role: 'user', content: 'Q2' },
      { role: 'assistant', content: 'Oops', failed: true },
    ],
    'Q3',
  );
  assert.deepEqual(turns, [
    { role: 'user', content: 'Q1' },
    { role: 'assistant', content: 'A1' },
    { role: 'user', content: 'Q3' },
  ]);
});

test('buildTurns caps the history and starts on a visitor message', () => {
  const history = Array.from({ length: 20 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `m${i}` }) as const);
  const turns = buildTurns(history, 'last');
  assert.ok(turns.length <= 12);
  assert.equal(turns[0].role, 'user');
  assert.equal(turns.at(-1)?.content, 'last');
});

test('linkify turns URLs and emails into links, leaving punctuation out', () => {
  assert.deepEqual(linkify('See https://kavisha.online. Or email a.b@gmail.com!'), [
    { type: 'text', text: 'See ' },
    { type: 'link', text: 'https://kavisha.online', href: 'https://kavisha.online' },
    { type: 'text', text: '. Or email ' },
    { type: 'link', text: 'a.b@gmail.com', href: 'mailto:a.b@gmail.com' },
    { type: 'text', text: '!' },
  ]);
  assert.deepEqual(linkify('No links here'), [{ type: 'text', text: 'No links here' }]);
});
