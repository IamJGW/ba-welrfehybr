// Harp Song: notes slide down four strings. Press the matching arrow key as
// each one reaches the line, and the harp plays.

import { characterSheet } from '../art.js';
import { drawActor, VIEW } from '../minigame.js';

// Numbers to tune after watching kids play.
const BEAT = 0.55;                  // seconds between beats
const LEAD_IN = 2.2;                // seconds before the first note
const FALL = 190;                   // how fast notes slide, in pixels per second
const WINDOW = 0.17;                // seconds early or late that still counts
const THREE_STARS = 0.9, TWO_STARS = 0.7;   // share of notes played

// The tune: which beat, and which string (0 to 3).
const TUNE = [
  [0, 0], [1, 1], [2, 2], [3, 3], [4, 2], [4.5, 1], [5, 0], [6, 2], [7, 3], [8, 2], [8.5, 1], [9, 0], [10, 1],
  [11, 2], [12, 3], [13, 1], [13.5, 0], [14, 2], [15, 0], [16, 1], [16.5, 2], [17, 3], [18, 3], [19, 2], [20, 1], [21, 0], [22, 0],
];
const STRINGS = [
  { key: 'left', label: '←', x: 360, tone: 262, color: '#d94a3d' },
  { key: 'down', label: '↓', x: 450, tone: 330, color: '#e6b42e' },
  { key: 'up', label: '↑', x: 540, tone: 392, color: '#3fa65a' },
  { key: 'right', label: '→', x: 630, tone: 523, color: '#3d7bd9' },
];
const LINE = 430;

const stars = n => '★'.repeat(n) + '☆'.repeat(3 - n);

// A plucked string, made by the browser. No sound files needed.
let audio = null;
function pluck(tone) {
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    const string = audio.createOscillator(), loudness = audio.createGain();
    string.type = 'triangle';
    string.frequency.value = tone;
    loudness.gain.setValueAtTime(0.22, audio.currentTime);
    loudness.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.6);
    string.connect(loudness).connect(audio.destination);
    string.start();
    string.stop(audio.currentTime + 0.6);
  } catch { /* play on in silence */ }
}

export const lyre = {
  id: 'lyre',
  story: 'music',
  intro: 'game_lyre_intro',
  status(save) { const best = save.best('lyre'); return best === null ? null : `Best: ${best}% of the notes`; },

  create(env) {
    const say = id => env.text(id)[0].text;
    const msg = { how: say('game_lyre_how') };
    const sheet = characterSheet({ ...env.look, item: 'harp' });
    const notes = TUNE.map(([beat, string]) => ({ time: LEAD_IN + beat * BEAT, string, played: false, missed: false }));
    const ends = notes[notes.length - 1].time + 1.3;
    const glow = [0, 0, 0, 0];
    let time = 0;

    const game = {
      over: false,
      notes,
      strings: STRINGS,
      get time() { return time; },

      update(dt, ctl) {
        time += dt;
        STRINGS.forEach((string, i) => {
          glow[i] = Math.max(0, glow[i] - dt * 4);
          if (!ctl.took(string.key)) return;
          const note = notes.find(n => n.string === i && !n.played && !n.missed && Math.abs(n.time - time) <= WINDOW);
          if (!note) return;
          note.played = true;
          glow[i] = 1;
          pluck(string.tone);
        });
        for (const note of notes) if (!note.played && time - note.time > WINDOW) note.missed = true;
        if (time > ends) game.over = true;
      },

      draw(ctx) {
        ctx.fillStyle = '#2a2233';
        ctx.fillRect(0, 0, VIEW.w, VIEW.h);
        ctx.fillStyle = '#3a3045';
        ctx.fillRect(300, 0, 390, VIEW.h);
        STRINGS.forEach((string, i) => {
          ctx.fillStyle = 'rgba(239,230,207,0.5)';
          ctx.fillRect(string.x - 1, 0, 2, VIEW.h);
          ctx.fillStyle = glow[i] > 0 ? string.color : 'rgba(255,255,255,0.14)';
          ctx.beginPath(); ctx.arc(string.x, LINE, 24 + glow[i] * 6, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 26px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(string.label, string.x, LINE + 9);
        });
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillRect(300, LINE - 1, 390, 2);
        for (const note of notes) {
          if (note.played) continue;
          const y = LINE - (note.time - time) * FALL;
          if (y < -20 || y > VIEW.h + 20) continue;
          ctx.globalAlpha = note.missed ? 0.25 : 1;
          ctx.fillStyle = STRINGS[note.string].color;
          ctx.beginPath(); ctx.arc(STRINGS[note.string].x, y, 17, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1;
        }
        drawActor(ctx, sheet, 170, 410, { dir: 'side', scale: 3 });
      },

      hud() {
        return { goal: `Notes played: ${notes.filter(n => n.played).length} of ${notes.length}`, hint: msg.how };
      },

      result() {
        const share = notes.filter(n => n.played).length / notes.length;
        const percent = Math.round(share * 100);
        const best = env.save.record('lyre', percent, false);
        return {
          title: share >= TWO_STARS ? 'Beautifully played!' : 'A good try!',
          stats: [
            { value: `${percent}%`, label: 'of the notes' },
            { value: stars(share >= THREE_STARS ? 3 : share >= TWO_STARS ? 2 : 1), label: 'rating' },
            { value: `${best}%`, label: 'your best' },
          ],
          lines: env.text('game_lyre_done'),
        };
      },
    };
    return game;
  },
};
