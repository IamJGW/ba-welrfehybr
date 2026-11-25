// Two by Two: a matching game. Twelve cards hide six pairs of animals; turn
// two at a time to find each pair, the way the animals came to the ark.
// Arrow keys move, Space turns a card; or click a card.

import { characterSheet } from '../art.js';
import { drawActor, VIEW } from '../minigame.js';

// Numbers to tune after watching kids play.
const KINDS = ['lion', 'elephant', 'camel', 'deer', 'goat', 'dove'];
const COLS = 4, ROWS = 3;
const CARD = { w: 150, h: 130, gap: 22 };
const SHOW_MISS = 0.9;                   // seconds two wrong cards stay face up
const THREE_STARS = 10, TWO_STARS = 15;  // turns

const stars = n => '★'.repeat(n) + '☆'.repeat(3 - n);
const left = (VIEW.w - (COLS * CARD.w + (COLS - 1) * CARD.gap)) / 2;
const top = 70;

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
  return list;
}

export const pairs = {
  id: 'pairs',
  story: 'ark',
  intro: 'game_pairs_intro',
  status(save) { const best = save.best('pairs'); return best === null ? null : `Best: ${best} turns`; },

  create(env) {
    const say = id => env.text(id)[0].text;
    const msg = { how: say('game_pairs_how'), match: say('game_pairs_match') };
    const sheets = Object.fromEntries(KINDS.map(k => [k, characterSheet({ kind: k })]));
    const cards = shuffle([...KINDS, ...KINDS]).map((kind, i) => ({
      kind, open: false, matched: false,
      x: left + (i % COLS) * (CARD.w + CARD.gap), y: top + Math.floor(i / COLS) * (CARD.h + CARD.gap),
    }));
    const s = { cursor: 0, first: null, second: null, wait: 0, turns: 0, note: '', noteFor: 0, endFor: 0 };

    const flip = i => {
      const c = cards[i];
      if (c.open || c.matched || s.second !== null) return;
      c.open = true;
      if (s.first === null) { s.first = i; return; }
      s.second = i;
      s.turns++;
      if (cards[s.first].kind === c.kind) {
        cards[s.first].matched = c.matched = true;
        s.first = s.second = null;
        s.note = msg.match; s.noteFor = 1.5;
      } else s.wait = SHOW_MISS;
    };

    const game = {
      over: false,
      cards,
      state: s,
      flip,
      update(dt, ctl) {
        if (s.noteFor > 0) s.noteFor -= dt;
        if (cards.every(c => c.matched)) {
          s.endFor += dt;
          if (s.endFor > 1.2) game.over = true;
          return;
        }
        if (s.wait > 0) {
          s.wait -= dt;
          if (s.wait <= 0) { cards[s.first].open = cards[s.second].open = false; s.first = s.second = null; }
          return;
        }
        const col = s.cursor % COLS, row = Math.floor(s.cursor / COLS);
        if (ctl.took('left')) s.cursor = row * COLS + (col + COLS - 1) % COLS;
        if (ctl.took('right')) s.cursor = row * COLS + (col + 1) % COLS;
        if (ctl.took('up')) s.cursor = ((row + ROWS - 1) % ROWS) * COLS + col;
        if (ctl.took('down')) s.cursor = ((row + 1) % ROWS) * COLS + col;
        if (ctl.took('act')) {
          // A click picks the card under the pointer; a key press, the one the cursor is on.
          const { x, y } = ctl.pointer();
          const hit = cards.findIndex(c => x >= c.x && x <= c.x + CARD.w && y >= c.y && y <= c.y + CARD.h);
          if (hit >= 0 && (x || y)) s.cursor = hit;
          flip(s.cursor);
        }
      },
      draw(ctx) {
        ctx.fillStyle = '#7a5232';
        ctx.fillRect(0, 0, VIEW.w, VIEW.h);
        ctx.fillStyle = '#6a4428';
        for (let y = 0; y < VIEW.h; y += 36) ctx.fillRect(0, y, VIEW.w, 3);
        cards.forEach((c, i) => {
          const up = c.open || c.matched;
          ctx.fillStyle = up ? (c.matched ? '#e9f6ef' : '#fbf3e0') : '#3e2a18';
          ctx.fillRect(c.x, c.y, CARD.w, CARD.h);
          ctx.strokeStyle = i === s.cursor ? '#4de3ff' : '#2a1c10';
          ctx.lineWidth = i === s.cursor ? 5 : 3;
          ctx.strokeRect(c.x, c.y, CARD.w, CARD.h);
          if (up) drawActor(ctx, sheets[c.kind], c.x + CARD.w / 2, c.y + CARD.h - 4, { dir: 'side', scale: c.kind === 'elephant' ? 2.6 : c.kind === 'dove' ? 2.2 : 2.4 });
          else {
            ctx.fillStyle = '#8a6040';
            ctx.fillRect(c.x + 40, c.y + 58, 70, 24);
            ctx.fillStyle = '#6a4428';
            ctx.beginPath(); ctx.moveTo(c.x + 36, c.y + 58); ctx.lineTo(c.x + 75, c.y + 40); ctx.lineTo(c.x + 114, c.y + 58); ctx.fill();
          }
        });
      },
      hud() {
        const found = cards.filter(c => c.matched).length / 2;
        return { goal: `Pairs found: ${found} of ${KINDS.length} · Turns: ${s.turns}`, hint: s.noteFor > 0 ? s.note : msg.how };
      },
      result() {
        const best = env.save.record('pairs', s.turns, true);
        const n = s.turns <= THREE_STARS ? 3 : s.turns <= TWO_STARS ? 2 : 1;
        return {
          title: n === 3 ? 'Two by two, every one!' : 'All aboard!',
          stats: [
            { value: `${s.turns}`, label: 'turns' },
            { value: stars(n), label: 'rating' },
            { value: `${best}`, label: 'your best' },
          ],
          lines: env.text('game_pairs_done'),
        };
      },
    };
    return game;
  },
};
