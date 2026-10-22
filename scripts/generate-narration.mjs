// Renders the voice-guide clips in src/data/narration.ts to src/assets/narration/<id>.mp3
// with ElevenLabs text-to-speech, plus <id>.json: when each word is spoken, which drives
// the player's live captions. Authentication is build-side only: ELEVENLABS_API_KEY
// is never exposed through Vite, and the site ships the finished MP3s as static assets.
//
//   npm run narration                 render clips that don't exist yet
//   npm run narration -- --force      re-render every clip (after changing the voice)
//   npm run narration -- about blogs  re-render just these clips (after editing their text)

import { access, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { NARRATION } from '../src/data/narration.ts';

const OUT_DIR = fileURLToPath(new URL('../src/assets/narration/', import.meta.url));
const REQUEST_TIMEOUT_MS = 60_000;
const apiKey = process.env.ELEVENLABS_API_KEY;
// Default voice: "Brian - Deep, Resonant and Comforting", an ElevenLabs premade voice. Premade voices
// work on the free plan; voice-library voices need a paid plan for API use.
const voiceId = process.env.ELEVENLABS_VOICE_ID || 'nPczCjzI2devNBz1zQrb';
const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';

const args = process.argv.slice(2);
const force = args.includes('--force');
const onlyIds = args.filter((arg) => !arg.startsWith('--'));

const exists = (path) => access(path).then(() => true, () => false);

// ElevenLabs returns a start/end time per character; captions only need words.
function toWords({ characters, character_start_times_seconds: starts, character_end_times_seconds: ends }) {
  const words = [];
  let word = null;
  characters.forEach((char, i) => {
    if (/\s/.test(char)) {
      word = null;
    } else if (word) {
      word[0] += char;
      word[2] = ends[i];
    } else {
      word = [char, starts[i], ends[i]];
      words.push(word);
    }
  });
  // [text, start, end] in seconds, rounded to keep the file small.
  return words.map(([text, start, end]) => [text, Math.round(start * 100) / 100, Math.round(end * 100) / 100]);
}

async function render(clip) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: clip.text, model_id: modelId }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    },
  );
  if (!response.ok) {
    throw new Error(`ElevenLabs returned ${response.status}: ${(await response.text()).slice(0, 300)}`);
  }
  const { audio_base64: audio, alignment } = await response.json();
  return { audio: Buffer.from(audio, 'base64'), words: toWords(alignment) };
}

async function main() {
  if (!apiKey) throw new Error('Set ELEVENLABS_API_KEY in .env (see .env.example).');

  const unknown = onlyIds.filter((id) => !NARRATION.some((clip) => clip.id === id));
  if (unknown.length > 0) throw new Error(`Unknown clip id(s): ${unknown.join(', ')}`);

  await mkdir(OUT_DIR, { recursive: true });

  // One at a time: a burst of parallel requests can trip ElevenLabs' abuse detection.
  for (const clip of NARRATION) {
    const outPath = `${OUT_DIR}${clip.id}.mp3`;
    const wanted = onlyIds.length > 0 ? onlyIds.includes(clip.id) : force || !(await exists(outPath));
    if (!wanted) {
      console.log(`skip  ${clip.id} (${onlyIds.length > 0 ? 'not selected' : 'already rendered'})`);
      continue;
    }
    const { audio, words } = await render(clip);
    await writeFile(outPath, audio);
    await writeFile(`${OUT_DIR}${clip.id}.json`, `${JSON.stringify(words)}\n`);
    console.log(`wrote ${clip.id}.mp3 + ${clip.id}.json (${words.length} words)`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
