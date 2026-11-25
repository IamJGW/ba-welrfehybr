// Loads the words of the game: conversations, badges and Bible verses.
// The words live in content/ so they can be edited without touching code.

export function parseCSV(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  text = text.replace(/^﻿/, '');
  const endRow = () => {
    row.push(field); field = '';
    if (row.some(f => f.trim() !== '')) rows.push(row);
    row = [];
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      endRow();
    } else field += c;
  }
  if (field !== '' || row.length) endRow();
  const head = rows.shift().map(h => h.trim().toLowerCase());
  return rows.map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? '').trim()])));
}

// Scripture is stored exactly as written. A "|" marks where the narrator's
// "he said" was left out, and "…" marks where words were skipped. For display
// we join the pieces and tidy the comma a removed "he said" leaves behind.
export function formatQuote(text) {
  const parts = text.split('|').map(s => s.trim());
  let out = parts[0];
  for (let i = 1; i < parts.length; i++) {
    if (out.endsWith(',') && /^[A-Z]/.test(parts[i])) out = out.slice(0, -1) + '.';
    out += ' ' + parts[i];
  }
  if (out.endsWith(',')) out = out.slice(0, -1) + '.';
  return out;
}

const pretty = s => s.replace(/'/g, '’');

// What a recorded voice says for a line. The player's name cannot be recorded
// ahead of time, so it is left out ("Stay close, {name}." becomes "Stay close.").
// tools/make_voices.py does exactly the same, so the two always match.
export function spokenText(text, fill = {}) {
  return text
    .replace(/(^|[.!?]\s+)\{name\}[,!?.]\s*(\S)/g, (m, before, next) => before + next.toUpperCase())
    .replace(/,\s*\{name\}(?=[.!?])/g, '')
    .replace(/\{name\}/g, 'you')
    .replace(/\{(\w+)\}/g, (blank, key) => (key in fill ? fill[key] : blank));
}

// On this computer every visit re-reads the files, so edits to the words show up without restarting.
// On a web host the files are read once per visit to the page: the time device needs all of them
// every time it opens, and fetching about 150 small files each time left a black screen.
const DEV = ['localhost', '127.0.0.1', ''].includes(location.hostname);
const kept = new Map();

async function get(path, as) {
  const res = await fetch(DEV ? `${path}?t=${Date.now()}` : path);
  if (!res.ok) throw new Error(`Could not load ${path}`);
  return res[as]();
}

let sourceOnce = null;
const source = () => (DEV ? get('content/bible/source.json', 'json') : (sourceOnce ||= get('content/bible/source.json', 'json').catch(err => { sourceOnce = null; throw err; })));

export function loadContent(storyId) {
  if (DEV) return readContent(storyId);
  if (!kept.has(storyId)) kept.set(storyId, readContent(storyId).catch(err => { kept.delete(storyId); throw err; }));
  return kept.get(storyId);
}

async function readContent(storyId) {
  const [bible, dialogue, badges] = await Promise.all([
    source(),
    get(`content/${storyId}/dialogue.csv`, 'text'),
    get(`content/${storyId}/badges.csv`, 'text'),
  ]);

  const scenes = {};
  for (const row of parseCSV(dialogue)) {
    if (!row.scene) continue;
    const isQuote = row.kind === 'quote';
    (scenes[row.scene] ||= []).push({
      speaker: row.speaker,
      kind: row.kind || 'say',
      text: isQuote ? formatQuote(row.text) : pretty(row.text),
      ref: row.ref,
    });
  }

  const badgeList = parseCSV(badges).map(b => ({
    id: b.id,
    title: pretty(b.title),
    text: b.ref ? formatQuote(b.text) : pretty(b.text),
    ref: b.ref,
  }));

  return {
    translation: bible.translation,
    scenes,
    badges: badgeList,
    badge: id => badgeList.find(b => b.id === id),
    // The lines of one conversation. "words" fills in the blanks: { name: 'Sam' }
    // puts Sam wherever a line says {name}. A plain name is also accepted.
    lines(sceneId, words) {
      const fill = typeof words === 'string' ? { name: words } : (words || {});
      const put = text => text.replace(/\{(\w+)\}/g, (blank, key) => (key in fill ? fill[key] : blank));
      const lines = scenes[sceneId];
      if (!lines) {
        console.error(`Missing conversation "${sceneId}" in dialogue.csv`);
        return [{ speaker: '', kind: 'note', text: `(Missing conversation: ${sceneId})`, ref: '' }];
      }
      return lines.map(l => ({ ...l, text: put(l.text), speaker: put(l.speaker), spoken: spokenText(l.text, fill) }));
    },
  };
}
