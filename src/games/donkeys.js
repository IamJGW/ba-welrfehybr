// Lost Donkeys: Saul and his servant searched three days for Kish's donkeys
// (1 Samuel 9:3-4). Six of them are hiding behind the bushes on this hillside.
// Search each bush, and listen to the hum: the louder it is, the closer you are
// to a donkey that has not been found yet.
// Arrow keys walk, Space searches the bush beside you.

import { PROPS, groundCanvas, characterSheet } from '../art.js';
import { drawActor, VIEW } from '../minigame.js';

// Numbers to tune after watching kids play.
const TIME = 50;                       // seconds
const DONKEYS = 6, BUSHES = 16;
const SPEED = 210;
const REACH = 52;                      // how close you must be to search a bush
const THREE_STARS = 6, TWO_STARS = 4;

const ROWS = Array(17).fill('.'.repeat(30));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const stars = n => '★'.repeat(n) + '☆'.repeat(3 - n);

export const donkeys = {
  id: 'donkeys',
  story: 'saul',
  intro: 'game_donkeys_intro',
  status(save) { const best = save.best('donkeys'); return best === null ? null : `Best: ${best} of ${DONKEYS} donkeys`; },

  create(env) {
    const say = id => env.text(id)[0].text;
    const msg = { how: say('game_donkeys_how'), found: say('game_donkeys_found'), empty: say('game_donkeys_empty') };
    const ground = groundCanvas(ROWS);
    const bush = PROPS.thicket.draw(), donkey = characterSheet({ kind: 'donkey' });
    const sheet = characterSheet({ ...env.look, item: 'staff' });
    const p = { x: 120, y: 420, dir: 'right', step: 0, anim: 0 };
    // Bushes in a loose grid, with the donkeys behind a few of them (the same each game).
    const bushes = Array.from({ length: BUSHES }, (_, i) => ({
      x: 90 + (i % 4) * 215 + ((i * 37) % 60), y: 170 + Math.floor(i / 4) * 85 + ((i * 53) % 30),
      donkey: false, searched: false, flash: 0,
    }));
    [1, 4, 7, 9, 12, 14].forEach(i => { bushes[i].donkey = true; });
    const s = { left: TIME, found: 0, note: '', noteFor: 0 };
    const tell = (text, t = 1.3) => { s.note = text; s.noteFor = t; };

    const search = () => {
      let best = null, bestD = REACH;
      for (const b of bushes) { const d = Math.hypot(b.x - p.x, b.y - p.y); if (!b.searched && d < bestD) { best = b; bestD = d; } }
      if (!best) return false;
      best.searched = true; best.flash = 1.2;
      if (best.donkey) { s.found++; tell(msg.found); } else tell(msg.empty);
      return true;
    };

    const game = {
      over: false,
      player: p,
      state: s,
      bushes,
      get time() { return s.left; },
      act: search,

      update(dt, ctl) {
        if (s.noteFor > 0) s.noteFor -= dt;
        for (const b of bushes) if (b.flash > 0) b.flash -= dt;
        s.left -= dt;
        if (s.left <= 0 || s.found >= DONKEYS) { game.over = true; return; }
        let dx = (ctl.held('right') ? 1 : 0) - (ctl.held('left') ? 1 : 0);
        let dy = (ctl.held('down') ? 1 : 0) - (ctl.held('up') ? 1 : 0);
        if (dx || dy) {
          p.dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
          if (dx && dy) { dx *= 0.7071; dy *= 0.7071; }
          p.x = clamp(p.x + dx * SPEED * dt, 40, VIEW.w - 40);
          p.y = clamp(p.y + dy * SPEED * dt, 130, VIEW.h - 30);
          p.anim += dt; p.step = [1, 0, 2, 0][Math.floor(p.anim / 0.12) % 4];
        } else { p.anim = 0; p.step = 0; }
        if (ctl.took('act')) search();
      },

      draw(ctx) {
        ctx.drawImage(ground, 0, 0);
        const things = [];
        for (const b of bushes) {
          things.push({ y: b.y, draw: () => {
            ctx.globalAlpha = b.searched ? 0.55 : 1;
            ctx.drawImage(bush, b.x - 30, b.y - 50, 60, 51);
            ctx.globalAlpha = 1;
            if (b.searched && b.donkey) drawActor(ctx, donkey, b.x + 36, b.y + 4, { dir: 'down', scale: 1.4 });
            if (b.flash > 0) { ctx.fillStyle = b.donkey ? 'rgba(255,214,70,0.5)' : 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(b.x, b.y - 24, 36, 0, Math.PI * 2); ctx.fill(); }
          } });
        }
        things.push({ y: p.y, draw: () => drawActor(ctx, sheet, p.x, p.y, { dir: p.dir === 'left' || p.dir === 'right' ? 'side' : p.dir, flip: p.dir === 'left', step: p.step, scale: 1.3 }) });
        things.sort((a, c) => a.y - c.y).forEach(t => t.draw());
        // How close is the nearest donkey that is still hiding?
        const near = bushes.filter(b => b.donkey && !b.searched).reduce((m, b) => Math.min(m, Math.hypot(b.x - p.x, b.y - p.y)), Infinity);
        const warm = near === Infinity ? 0 : clamp(1 - near / 360, 0, 1);
        ctx.fillStyle = 'rgba(30,22,14,0.75)'; ctx.fillRect(40, 40, 260, 26);
        ctx.fillStyle = `rgb(${Math.round(80 + 175 * warm)},${Math.round(160 - 60 * warm)},60)`; ctx.fillRect(44, 44, 252 * warm, 18);
        ctx.fillStyle = '#fff'; ctx.font = '13px sans-serif'; ctx.textAlign = 'left'; ctx.fillText('colder  ·  warmer', 52, 58);
      },

      hud() {
        const hint = s.noteFor > 0 ? s.note : msg.how;
        return { goal: `Donkeys found: ${s.found} of ${DONKEYS}  ·  Time left: ${Math.max(0, s.left).toFixed(0)}`, hint };
      },

      result() {
        const best = env.save.record('donkeys', s.found, false);
        const rating = s.found >= THREE_STARS ? 3 : s.found >= TWO_STARS ? 2 : 1;
        return {
          title: rating === 3 ? 'Every donkey found!' : 'Good searching',
          stats: [
            { value: `${s.found} of ${DONKEYS}`, label: 'donkeys found' },
            { value: stars(rating), label: 'rating' },
            { value: `${best} of ${DONKEYS}`, label: 'your best' },
          ],
          lines: env.text(rating === 3 ? 'game_donkeys_done' : 'game_donkeys_short'),
        };
      },
    };
    return game;
  },
};
