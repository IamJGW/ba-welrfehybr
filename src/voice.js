// Reading aloud. Lines recorded ahead of time (by tools/make_voices.py, into
// audio/) are played when they exist. Anything else, such as a line just
// edited, is read by the voices built into the browser and computer.
//
// The built-in voices need no sound files and no internet. Each character is "cast" with a
// different voice where the device has enough of them, choosing the most
// natural-sounding voices first. Quality depends on the device: Microsoft Edge
// and Google Chrome offer more natural voices than most, and a Mac can download
// better ("Premium" or "Enhanced") voices for free in System Settings, under
// Accessibility, Spoken Content, Manage Voices.

// Who each speaker is, so they get a fitting voice: man, woman, boy, girl or
// elder (an older man), plus small changes in pitch (1 is normal) and speed.
// Speakers not listed are guessed from their name, and are otherwise men.
const CAST = {
  Narrator: { type: 'woman' },
  'Think about it': { type: 'woman', rate: 0.95 },
  Grandma: { type: 'woman', pitch: 0.9, rate: 0.9 },
  'The letter': { type: 'elder', rate: 0.88 },
  David: { type: 'boy', pitch: 1.15 },
  Goliath: { type: 'man', pitch: 0.45, rate: 0.82 },
  'King Saul': { type: 'man', pitch: 0.8, rate: 0.92 },
  Samuel: { type: 'elder', pitch: 0.8, rate: 0.88 },
  // God's words are read by the narrator's voice, slowly, never by a character's.
  'The LORD': { type: 'narrator', same: 'Narrator', rate: 0.9 },
  God: { type: 'narrator', same: 'Narrator', rate: 0.9 },
  'The LORD God': { type: 'narrator', same: 'Narrator', rate: 0.9 },
  Jesse: { type: 'elder', rate: 0.92 },
  Jonathan: { type: 'man', pitch: 1.05 },
  Eliab: { type: 'man', pitch: 0.85 },
  Boy: { type: 'boy', pitch: 1.3 },
  'The women': { type: 'woman' },
  'Servant girl': { type: 'girl' },
  Mother: { type: 'woman' },
  'Old man': { type: 'elder' },
  Keeper: { type: 'elder' },
  Elder: { type: 'elder' },
  'The elders': { type: 'elder' },
  Scribe: { type: 'man', rate: 0.95 },
  Cook: { type: 'woman' },
  'The man': { type: 'man' },
  'The woman': { type: 'woman' },
  'The serpent': { type: 'man', pitch: 1.15, rate: 0.9 },
  // The Promise
  Abram: { type: 'elder', rate: 0.92 },
  Abraham: { type: 'elder', rate: 0.92 },
  Sarai: { type: 'woman', pitch: 0.95 },
  Sarah: { type: 'woman', pitch: 0.95 },
  Rebekah: { type: 'woman', pitch: 1.05 },
  "Rebekah's nurse": { type: 'woman', pitch: 0.85, rate: 0.9 },
  Leah: { type: 'woman' },
  Rachel: { type: 'woman', pitch: 1.05 },
  Isaac: { type: 'man', pitch: 1.05 },
  Jacob: { type: 'man' },
  Esau: { type: 'man', pitch: 0.85 },
  Joseph: { type: 'boy', pitch: 1.3 },
  'The angel of the LORD': { type: 'narrator', same: 'Narrator', rate: 0.9 },
  Jesus: { type: 'narrator', same: 'Narrator', rate: 0.92 },
};

// Guesses for speakers who are not in the list above.
const guess = who => {
  if (/girl|daughter/i.test(who)) return { type: 'girl' };
  if (/woman|women|mother|wife|grandma|maid|singer/i.test(who)) return { type: 'woman' };
  if (/boy|son\b|child/i.test(who)) return { type: 'boy' };
  if (/elder|old|king|prophet|steward/i.test(who)) return { type: 'elder' };
  return { type: 'man' };
};

// Children and elders are played by adult voices, nudged higher or lower.
const SHIFT = { boy: { pitch: 1.25, rate: 1.02 }, girl: { pitch: 1.25, rate: 1.02 }, elder: { pitch: 0.85, rate: 0.9 }, man: {}, woman: {}, narrator: {} };
const GENDER = { man: 'male', boy: 'male', elder: 'male', woman: 'female', girl: 'female', narrator: 'any' };

// Voice names known to be women's or men's voices across Mac, Windows, Chrome and Edge.
const FEMALE = /\b(Ava|Zoe|Allison|Samantha|Susan|Serena|Kate|Karen|Moira|Tessa|Fiona|Victoria|Veena|Tara|Nicky|Joelle|Noelle|Sandy|Shelley|Flo|Kathy|Aria|Jenny|Michelle|Emma|Sonia|Libby|Natasha|Clara|Zira|Hazel|Ana|Jane|Nancy|Sara|Amber|Ashley|Cora|Elizabeth|Monica|Female|Grandma)\b/i;
const MALE = /\b(Evan|Nathan|Tom|Alex|Aaron|Daniel|Oliver|Arthur|Gordon|Lee|Rishi|Aman|Reed|Rocko|Eddy|Fred|Ralph|Guy|Davis|Andrew|Brian|Christopher|Eric|Roger|Steffan|Ryan|Thomas|William|Liam|Mark|George|James|Jason|Tony|Male|Grandpa)\b/i;
// Joke voices that come with a Mac. Never used.
const NOVELTY = /Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox|Junior|Albert/i;
// Older, more robotic voices. Used only when nothing better is left.
const ROBOTIC = /\b(Fred|Ralph|Kathy|Eddy|Flo|Reed|Rocko|Sandy|Shelley|Grandma|Grandpa)\b/i;

// Higher is more natural-sounding.
function quality(v) {
  let score = 0;
  if (/Natural|Neural|Online/i.test(v.name)) score += 60;
  if (/Premium/i.test(v.name)) score += 50;
  if (/Enhanced/i.test(v.name)) score += 40;
  if (/^Google/i.test(v.name)) score += 30;
  if (/\b(Samantha|Daniel|Karen|Moira|Tessa|Rishi|Ava|Allison|Alex|Zoe|Evan|Nathan|Tom|Susan|Serena)\b/i.test(v.name)) score += 15;
  if (ROBOTIC.test(v.name)) score -= 20;
  if (v.lang === 'en-US' || v.lang === 'en-GB') score += 3;
  return score;
}

const genderOf = v => (FEMALE.test(v.name) ? 'female' : MALE.test(v.name) ? 'male' : 'any');

// Small fixes so the words are spoken the way they should be heard.
const forSpeech = text => text
  .replace(/…/g, ' ')
  .replace(/\bLORD\b/g, 'Lord')
  .replace(/·/g, ',')
  .replace(/\s+/g, ' ')
  .trim();

export function createVoice(save) {
  const synth = window.speechSynthesis || null;

  // The recordings: "speaker|words" -> sound file. Missing or unreadable means none.
  let recorded = {};
  fetch(`audio/manifest.json?t=${Date.now()}`).then(r => (r.ok ? r.json() : {})).then(m => { recorded = m.lines || {}; }).catch(() => {});
  let playing = null;
  const stopRecording = () => { if (playing) { playing.pause(); playing = null; } };
  let voices = [];          // usable English voices, best first
  let cast = new Map();     // speaker -> chosen voice
  const nudge = new Map();  // speaker -> pitch change, when a voice is shared

  const load = () => {
    voices = (synth?.getVoices() || [])
      .filter(v => v.lang?.toLowerCase().startsWith('en') && !NOVELTY.test(v.name))
      .sort((a, b) => quality(b) - quality(a));
    cast = new Map();
    nudge.clear();
  };
  if (synth) {
    load();
    synth.addEventListener?.('voiceschanged', load);
  }

  // Give each speaker the best voice of the right kind that nobody else has yet.
  // When the good voices run out, one is shared at a slightly different pitch
  // rather than falling back to a robotic one.
  const voiceFor = who => {
    if (cast.has(who)) return cast.get(who);
    const role = CAST[who] || guess(who);
    if (role.same) return voiceFor(role.same);
    const want = GENDER[role.type];
    const fits = voices.filter(v => want === 'any' || genderOf(v) === want || genderOf(v) === 'any');
    const good = fits.filter(v => !ROBOTIC.test(v.name));
    const uses = v => [...cast.values()].filter(c => c === v).length;
    let pick = good.find(v => !uses(v)) || null;
    if (!pick && good.length) {
      pick = good.reduce((a, b) => (uses(b) < uses(a) ? b : a));
      const n = uses(pick);
      nudge.set(who, 1 + (n % 2 ? -0.1 : 0.1) * Math.ceil(n / 2));
    }
    pick ||= fits[0] || voices[0] || null;
    cast.set(who, pick);
    return pick;
  };

  const voice = {
    available: !!synth || typeof Audio !== 'undefined',
    last: null,   // the most recent thing spoken, for testing
    get on() { return save.data.settings.voice !== false; },
    toggle() {
      save.data.settings = { ...save.data.settings, voice: !voice.on };
      save.write();
      if (!voice.on) voice.hush();
      return voice.on;
    },
    // Who has been given which voice so far, for testing.
    cast: () => Object.fromEntries([...cast].map(([who, v]) => [who, v?.name || null])),
    // "force" speaks even when reading aloud is switched off, for a "Hear it" button.
    speak(text, { who = '', interrupt = true, force = false, spoken = null } = {}) {
      if (!text || (!voice.on && !force)) return;
      const speaker = who || 'Narrator';
      // The browser's own voice, for lines without a recording.
      const viaSynth = () => {
        if (!synth) return;
        if (interrupt) { synth.cancel(); stopRecording(); } else if (playing) return;
        const role = CAST[speaker] || guess(speaker);
        const shift = SHIFT[role.type] || {};
        const chosen = voiceFor(speaker);
        const line = new SpeechSynthesisUtterance(forSpeech(text));
        if (chosen) line.voice = chosen;
        line.lang = chosen?.lang || 'en-US';
        line.pitch = Math.max(0, Math.min(2, (role.pitch ?? 1) * (shift.pitch ?? 1) * (nudge.get(role.same || speaker) ?? 1)));
        line.rate = (role.rate ?? 1) * (shift.rate ?? 1) * 0.97;
        voice.last = { text: line.text, who: speaker, voice: chosen?.name || null, pitch: line.pitch };
        synth.speak(line);
      };
      const file = recorded[`${speaker}|${forSpeech(spoken ?? text)}`];
      if (!file) return viaSynth();
      // A recording, so every player hears the same voice.
      if (!interrupt && (playing || synth?.speaking)) return;
      synth?.cancel();
      stopRecording();
      const audio = new Audio(`audio/${file}`);
      playing = audio;
      audio.addEventListener('ended', () => { if (playing === audio) playing = null; });
      // If the browser will not play it (some block sound until the page is clicked), fall back.
      audio.play().catch(() => { if (playing === audio) { playing = null; viaSynth(); } });
      voice.last = { text: forSpeech(spoken ?? text), who: speaker, voice: 'recorded', file };
    },
    hush() { synth?.cancel(); stopRecording(); },
    // How many lines have recordings, for testing.
    get recordings() { return Object.keys(recorded).length; },
  };
  return voice;
}
