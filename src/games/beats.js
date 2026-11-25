// Beat games: notes slide down one or more lanes, and the player presses the
// matching key as each one reaches the line. Miriam's Song (a tambourine) and
// Seven Days (a march) are both made here, with their own lanes, tunes and sounds.
// Their words are in the dialogue.csv of the story each one belongs to.

import { characterSheet } from '../art.js';
import { drawActor, VIEW } from '../minigame.js';

const LINE = 430;
const stars = n => '★'.repeat(n) + '☆'.repeat(3 - n);

// Sounds made by the browser, so no sound files are needed.
let audio = null;
const play = make => {
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    make(audio, audio.currentTime);
  } catch { /* play on in silence */ }
};
const SOUNDS = {
  // A tambourine: a burst of noise with a few bright pings.
  jingle: () => play((a, t) => {
    const buf = a.createBuffer(1, a.sampleRate * 0.25, a.sampleRate), data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const noise = a.createBufferSource(), high = a.createBiquadFilter(), loud = a.createGain();
    noise.buffer = buf; high.type = 'highpass'; high.frequency.value = 5000;
    loud.gain.setValueAtTime(0.35, t); loud.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    noise.connect(high).connect(loud).connect(a.destination); noise.start(t);
    for (const f of [3200, 4100, 5200]) {
      const o = a.createOscillator(), g = a.createGain();
      o.frequency.value = f; g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      o.connect(g).connect(a.destination); o.start(t); o.stop(t + 0.3);
    }
  }),
  // A drum: a short low thump.
  drum: tone => play((a, t) => {
    const o = a.createOscillator(), g = a.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(tone || 140, t); o.frequency.exponentialRampToValueAtTime(50, t + 0.2);
    g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + 0.3);
  }),
  // A trumpet blast: the shout at the end of a march.
  horn: () => play((a, t) => {
    const o = a.createOscillator(), g = a.createGain();
    o.type = 'sawtooth'; o.frequency.value = 330;
    g.gain.setValueAtTime(0.0, t); g.gain.linearRampToValueAtTime(0.22, t + 0.05); g.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + 1.0);
  }),
};

// cfg: id, story, prefix (words are <prefix>_intro, _how, _done), item, background, lanes, tune, timing, ratings
export function beatGame(cfg) {
  const { id, story, prefix, item, bg, lanes, tune, beat = 0.55, leadIn = 2.2, fall = 190, window: slack = 0.17, three = 0.9, two = 0.7 } = cfg;
  return {
    id, story,
    intro: `${prefix}_intro`,
    status(save) { const best = save.best(id); return best === null ? null : `Best: ${best}% of the beats`; },

    create(env) {
      const say = scene => env.text(scene)[0].text;
      const how = say(`${prefix}_how`);
      const sheet = characterSheet({ ...env.look, item });
      const notes = tune.map(([b, lane]) => ({ time: leadIn + b * beat, lane, played: false, missed: false }));
      const ends = notes[notes.length - 1].time + 1.3;
      const glow = lanes.map(() => 0);
      let time = 0;
      const x0 = VIEW.w / 2 - ((lanes.length - 1) * 90) / 2;
      const laneX = i => x0 + i * 90;

      const game = {
        over: false,
        notes,
        lanes,
        get time() { return time; },

        update(dt, ctl) {
          time += dt;
          lanes.forEach((lane, i) => {
            glow[i] = Math.max(0, glow[i] - dt * 4);
            if (![].concat(lane.key).some(k => ctl.took(k))) return;
            const note = notes.find(n => n.lane === i && !n.played && !n.missed && Math.abs(n.time - time) <= slack);
            if (!note) return;
            note.played = true;
            glow[i] = 1;
            (SOUNDS[lane.sound] || SOUNDS.drum)(lane.tone);
          });
          for (const note of notes) if (!note.played && time - note.time > slack) note.missed = true;
          if (time > ends) game.over = true;
        },

        draw(ctx) {
          ctx.fillStyle = bg[0];
          ctx.fillRect(0, 0, VIEW.w, VIEW.h);
          ctx.fillStyle = bg[1];
          ctx.fillRect(x0 - 70, 0, (lanes.length - 1) * 90 + 140, VIEW.h);
          lanes.forEach((lane, i) => {
            const x = laneX(i);
            ctx.fillStyle = 'rgba(239,230,207,0.5)';
            ctx.fillRect(x - 1, 0, 2, VIEW.h);
            ctx.fillStyle = glow[i] > 0 ? lane.color : 'rgba(255,255,255,0.14)';
            ctx.beginPath(); ctx.arc(x, LINE, 26 + glow[i] * 6, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 22px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(lane.label, x, LINE + 8);
          });
          ctx.fillStyle = 'rgba(255,255,255,0.35)';
          ctx.fillRect(x0 - 70, LINE - 1, (lanes.length - 1) * 90 + 140, 2);
          for (const note of notes) {
            if (note.played) continue;
            const y = LINE - (note.time - time) * fall;
            if (y < -20 || y > VIEW.h + 20) continue;
            ctx.globalAlpha = note.missed ? 0.25 : 1;
            ctx.fillStyle = lanes[note.lane].color;
            ctx.beginPath(); ctx.arc(laneX(note.lane), y, 18, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
          }
          drawActor(ctx, sheet, 170, 410, { dir: 'side', scale: 3 });
        },

        hud() {
          return { goal: `Beats played: ${notes.filter(n => n.played).length} of ${notes.length}`, hint: how };
        },

        result() {
          const share = notes.filter(n => n.played).length / notes.length;
          const percent = Math.round(share * 100);
          const best = env.save.record(id, percent, false);
          return {
            title: share >= two ? say(`${prefix}_good`) : say(`${prefix}_try`),
            stats: [
              { value: `${percent}%`, label: 'of the beats' },
              { value: stars(share >= three ? 3 : share >= two ? 2 : 1), label: 'rating' },
              { value: `${best}%`, label: 'your best' },
            ],
            lines: env.text(`${prefix}_done`),
          };
        },
      };
      return game;
    },
  };
}

// Miriam's Song (Exodus 15:20-21): press Space with each tambourine beat.
const TAMBOURINE = [0, 1, 2, 2.5, 3, 4, 5, 6, 6.5, 7, 8, 8.5, 9, 10, 11, 12, 12.5, 13, 14, 14.5, 15, 16, 17, 18, 18.5, 19, 20, 21, 22, 22.5, 23, 24];
export const tambourine = beatGame({
  id: 'tambourine',
  story: 'sea',
  prefix: 'game_tambourine',
  item: 'tambourine',
  bg: ['#35261f', '#4a3328'],
  lanes: [{ key: ['act', 'up'], label: 'Space', color: '#e3b93a', sound: 'jingle' }],
  tune: TAMBOURINE.map(b => [b, 0]),
  beat: 0.42, window: 0.15,
});

// Seven Days (Joshua 6): march to the drum with the left and right arrows, and keep
// time for six days. On the seventh, wait for the long blast of the horn, and then shout.
const MARCH = [];
for (let day = 0; day < 6; day++) for (let step = 0; step < 4; step++) MARCH.push([day * 4 + step, step % 2]);
MARCH.push([29, 2]);
export const march = beatGame({
  id: 'march',
  story: 'walls',
  prefix: 'game_march',
  item: 'trumpet',
  bg: ['#2a2418', '#3a3022'],
  lanes: [
    { key: ['left'], label: '←', color: '#d94a3d', sound: 'drum', tone: 120 },
    { key: ['right'], label: '→', color: '#3d7bd9', sound: 'drum', tone: 150 },
    { key: ['act', 'up'], label: 'Shout', color: '#e3b93a', sound: 'horn' },
  ],
  tune: MARCH,
  beat: 0.5,
  window: 0.16,
});

// Jars and Torches (Judges 7:16-22): break the jars, raise the torches and blow the
// horn, all on the same night. Left breaks a jar, Up raises the torch, Right blows the horn.
const NIGHT = [];
for (let i = 0; i < 4; i++) NIGHT.push([i, 0]);                          // jars, one at a time
for (let i = 0; i < 4; i++) NIGHT.push([5 + i * 0.5, 1]);                // torches go up
for (let i = 0; i < 6; i++) NIGHT.push([8 + i * 0.5, 2]);                // horns
for (let i = 0; i < 6; i++) { NIGHT.push([12 + i * 2, 0]); NIGHT.push([12.5 + i * 2, 1]); NIGHT.push([13 + i * 2, 2]); }
export const jars = beatGame({
  id: 'jars',
  story: 'torches',
  prefix: 'game_jars',
  item: 'torch',
  bg: ['#141a2a', '#222c44'],
  lanes: [
    { key: ['left'], label: 'Jar', color: '#c9893f', sound: 'jingle' },
    { key: ['up'], label: 'Torch', color: '#e8742c', sound: 'drum', tone: 200 },
    { key: ['right'], label: 'Horn', color: '#e3b93a', sound: 'horn' },
  ],
  tune: NIGHT.sort((a, b) => a[0] - b[0]),
  beat: 0.55,
  window: 0.17,
});
