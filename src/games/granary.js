// Seven Good Years: Joseph's storehouses (Genesis 41:47-49). Each year the
// harvest comes in, more than anyone can eat. Carry the sacks, one at a time,
// from the field to the storehouse before the year ends; whatever is left lies
// in the field and spoils. After seven years comes the famine, and the grain
// you stored must last through it.
// Arrow keys run, Space lifts a sack or sets it down in the storehouse.

import { PROPS, groundCanvas, characterSheet } from '../art.js';
import { drawActor, VIEW } from '../minigame.js';

// Numbers to tune after watching kids play.
const YEARS = 7;
const YEAR_TIME = 14;                      // seconds in one year
const SACKS = 8;                           // sacks that come in each year
const NEED = 5;                            // sacks the land eats in each famine year
const THREE_STARS = NEED * YEARS, TWO_STARS = Math.round(NEED * YEARS * 0.65);
const SPEED = 215, SPEED_FULL = 165;
const REACH = 46;
const STORE = { x: 820, y: 300 };
const FIELD = { left: 380, right: 720, top: 130, bottom: 470 };

const ROWS = Array(17).fill('b'.repeat(30));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const stars = n => '★'.repeat(n) + '☆'.repeat(3 - n);

export const granary = {
  id: 'granary',
  story: 'pharaoh',
  intro: 'game_granary_intro',
  status(save) { const best = save.best('granary'); return best === null ? null : `Best: ${best} sacks stored`; },

  create(env) {
    const say = id => env.text(id)[0].text;
    const msg = { how: say('game_granary_how'), full: say('game_granary_hands'), year: say('game_granary_year') };
    const ground = groundCanvas(ROWS);
    const sack = PROPS.sacks.draw(), barn = PROPS.granary.draw();
    const sheets = { player: characterSheet({ ...env.look, item: null }), carrying: characterSheet({ ...env.look, item: 'bundle' }) };
    const p = { x: 600, y: 300, dir: 'right', step: 0, anim: 0, carrying: false };
    const s = { year: 1, left: YEAR_TIME, stored: 0, spoiled: 0, banner: 2, note: '', noteFor: 0 };
    let sacks = [];
    // Sacks land at repeatable spots, so every game is much the same.
    const harvest = year => Array.from({ length: SACKS }, (_, i) => ({
      x: FIELD.left + 20 + ((i * 97 + year * 53) % (FIELD.right - FIELD.left - 40)),
      y: FIELD.top + 20 + ((i * 61 + year * 29) % (FIELD.bottom - FIELD.top - 40)),
    }));
    sacks = harvest(1);
    const tell = (text, t = 1.2) => { s.note = text; s.noteFor = t; };
    const nearStore = () => Math.hypot(p.x - STORE.x, p.y - (STORE.y + 30)) < REACH + 40;

    const act = () => {
      if (p.carrying) {
        if (nearStore()) { p.carrying = false; s.stored++; }
        return;
      }
      let best = -1, bestD = REACH;
      sacks.forEach((k, i) => { const d = Math.hypot(p.x - k.x, p.y - k.y); if (d < bestD) { best = i; bestD = d; } });
      if (best >= 0) { sacks.splice(best, 1); p.carrying = true; }
    };

    const game = {
      over: false,
      player: p,
      state: s,
      store: { x: STORE.x - 40, y: STORE.y + 30 },
      get sacks() { return sacks; },
      act,

      update(dt, ctl) {
        if (s.noteFor > 0) s.noteFor -= dt;
        if (s.banner > 0) { s.banner -= dt; return; }
        let dx = (ctl.held('right') ? 1 : 0) - (ctl.held('left') ? 1 : 0);
        let dy = (ctl.held('down') ? 1 : 0) - (ctl.held('up') ? 1 : 0);
        if (dx || dy) {
          p.dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
          if (dx && dy) { dx *= 0.7071; dy *= 0.7071; }
          const speed = p.carrying ? SPEED_FULL : SPEED;
          p.x = clamp(p.x + dx * speed * dt, 40, VIEW.w - 40);
          p.y = clamp(p.y + dy * speed * dt, 110, VIEW.h - 20);
          p.anim += dt;
          p.step = [1, 0, 2, 0][Math.floor(p.anim / 0.12) % 4];
        } else { p.anim = 0; p.step = 0; }
        if (ctl.took('act')) act();

        s.left -= dt;
        if (s.left <= 0) {
          s.spoiled += sacks.length;
          if (s.year >= YEARS) { game.over = true; return; }
          s.year++;
          s.left = YEAR_TIME;
          s.banner = 1.6;
          sacks = harvest(s.year);
        }
      },

      draw(ctx) {
        ctx.drawImage(ground, 0, 0);
        ctx.fillStyle = 'rgba(138,106,60,0.35)'; ctx.fillRect(FIELD.left - 40, FIELD.top - 30, FIELD.right - FIELD.left + 80, FIELD.bottom - FIELD.top + 60);
        const things = [];
        things.push({ y: STORE.y + 80, draw: () => ctx.drawImage(barn, STORE.x - 70, STORE.y - 70, 140, 154) });
        for (const k of sacks) things.push({ y: k.y, draw: () => ctx.drawImage(sack, k.x - 24, k.y - 40, 48, 45) });
        const sheet = p.carrying ? sheets.carrying : sheets.player;
        things.push({ y: p.y, draw: () => drawActor(ctx, sheet, p.x, p.y, { dir: p.dir === 'left' || p.dir === 'right' ? 'side' : p.dir, flip: p.dir === 'left', step: p.step, scale: 1.3 }) });
        things.sort((a, b) => a.y - b.y).forEach(t => t.draw());
        // The storehouse fills as you go: a row of stored sacks under it.
        ctx.fillStyle = '#4a3524'; ctx.fillRect(STORE.x - 70, STORE.y + 96, 140, 10);
        ctx.fillStyle = '#e3b93a'; ctx.fillRect(STORE.x - 68, STORE.y + 98, Math.min(136, 136 * s.stored / THREE_STARS), 6);
        if (s.banner > 0) {
          ctx.fillStyle = 'rgba(20,15,10,0.7)'; ctx.fillRect(0, 200, VIEW.w, 110);
          ctx.fillStyle = '#ffd23f'; ctx.font = 'bold 34px Georgia, serif'; ctx.textAlign = 'center';
          ctx.fillText(`Year ${s.year} of ${YEARS}`, VIEW.w / 2, 262);
        }
      },

      hud() {
        const hint = s.noteFor > 0 ? s.note : p.carrying ? msg.full : msg.how;
        return { goal: `Year ${s.year} of ${YEARS}  ·  Time left: ${Math.max(0, s.left).toFixed(0)}  ·  Stored: ${s.stored}`, hint };
      },

      result() {
        const best = env.save.record('granary', s.stored, false);
        const lasts = Math.min(YEARS, Math.floor(s.stored / NEED));
        const rating = s.stored >= THREE_STARS ? 3 : s.stored >= TWO_STARS ? 2 : 1;
        return {
          title: rating === 3 ? 'Enough for every famine year!' : rating === 2 ? 'Nearly enough' : 'The famine will be hard',
          stats: [
            { value: String(s.stored), label: 'sacks stored' },
            { value: `${lasts} of ${YEARS}`, label: 'famine years fed' },
            { value: stars(rating), label: 'rating' },
            { value: String(best), label: 'your best' },
          ],
          lines: env.text(rating === 3 ? 'game_granary_done' : 'game_granary_short'),
        };
      },
    };
    return game;
  },
};
