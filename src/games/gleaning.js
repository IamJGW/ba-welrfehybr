// Gleaning: Ruth in the barley field of Boaz (Ruth 2:2-17). The harvesters cut the
// barley and let a few ears fall behind them, and the young men of Boaz leave extra
// stalks for you on purpose. Gather what you can before evening.
// Arrow keys walk, Space gathers the ears near you.

import { characterSheet, PROPS, groundCanvas } from '../art.js';
import { drawActor, VIEW } from '../minigame.js';

// Numbers to tune after watching kids play.
const TIME = 45;                       // seconds until evening
const SPEED = 210;
const REACH = 44;                      // how close an ear must be to gather it
const DROP_EVERY = 1.1;                // seconds between ears falling behind each harvester
const GIFT_EVERY = 5;                  // seconds between the stalks Boaz's young men leave for you
const LAST = 9;                        // seconds an ear lies there before it is lost
const THREE_STARS = 70, TWO_STARS = 45;

const ROWS = Array(17).fill('b'.repeat(30));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const stars = n => '★'.repeat(n) + '☆'.repeat(3 - n);

export const gleaning = {
  id: 'gleaning',
  story: 'ruth',
  intro: 'game_glean_intro',
  status(save) { const best = save.best('gleaning'); return best === null ? null : `Best: ${best} ears of barley`; },

  create(env) {
    const say = id => env.text(id)[0].text;
    const msg = { how: say('game_glean_how'), gift: say('game_glean_gift') };
    const ground = groundCanvas(ROWS);
    const ear = PROPS.gleanear.draw();
    const sheets = { ruth: characterSheet({ ...env.look, item: 'basket' }), reaper: characterSheet({ kind: 'tunic', skin: '#c98f62', hair: '#2a211c', hairStyle: 'short', top: '#a9845a', sash: '#5d4526', item: 'sheaf' }) };
    const p = { x: 200, y: 400, dir: 'right', step: 0, anim: 0 };
    const reapers = [
      { x: 100, y: 190, speed: 70, row: 190, drop: 0 },
      { x: 500, y: 290, speed: 55, row: 290, drop: 0.4 },
      { x: 300, y: 390, speed: 62, row: 390, drop: 0.8 },
    ];
    const s = { left: TIME, got: 0, gift: GIFT_EVERY, note: '', noteFor: 0, tick: 0 };
    let ears = [];
    const tell = (text, t = 1.4) => { s.note = text; s.noteFor = t; };

    const gather = () => {
      let any = false;
      ears = ears.filter(e => {
        if (Math.hypot(e.x - p.x, e.y - 12 - p.y) < REACH) { s.got += e.gift ? 2 : 1; any = true; return false; }
        return true;
      });
      return any;
    };

    const game = {
      over: false,
      player: p,
      state: s,
      get ears() { return ears; },
      act: gather,

      update(dt, ctl) {
        if (s.noteFor > 0) s.noteFor -= dt;
        s.left -= dt;
        if (s.left <= 0) { game.over = true; return; }
        let dx = (ctl.held('right') ? 1 : 0) - (ctl.held('left') ? 1 : 0);
        let dy = (ctl.held('down') ? 1 : 0) - (ctl.held('up') ? 1 : 0);
        if (dx || dy) {
          p.dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
          if (dx && dy) { dx *= 0.7071; dy *= 0.7071; }
          p.x = clamp(p.x + dx * SPEED * dt, 40, VIEW.w - 40);
          p.y = clamp(p.y + dy * SPEED * dt, 140, VIEW.h - 30);
          p.anim += dt; p.step = [1, 0, 2, 0][Math.floor(p.anim / 0.12) % 4];
        } else { p.anim = 0; p.step = 0; }
        if (ctl.took('act')) gather();

        // The harvesters walk along their rows, letting ears fall.
        for (const r of reapers) {
          r.x += r.speed * dt;
          if (r.x > VIEW.w - 40) r.x = 40;
          r.drop -= dt;
          if (r.drop <= 0) { r.drop = DROP_EVERY; ears.push({ x: r.x - 44, y: r.row + (Math.random() * 40 - 10), age: 0, gift: false }); }
        }
        // The young men of Boaz leave extra stalks near you.
        s.gift -= dt;
        if (s.gift <= 0) {
          s.gift = GIFT_EVERY;
          ears.push({ x: clamp(p.x + 80 + Math.random() * 60, 60, VIEW.w - 60), y: clamp(p.y + Math.random() * 60 - 30, 150, VIEW.h - 40), age: 0, gift: true });
          tell(msg.gift);
        }
        for (const e of ears) e.age += dt;
        ears = ears.filter(e => e.age < LAST);
      },

      draw(ctx) {
        ctx.drawImage(ground, 0, 0);
        const sky = ctx.createLinearGradient(0, 0, 0, 120);
        sky.addColorStop(0, `rgba(232,${Math.round(160 - 60 * (1 - s.left / TIME))},96,0.5)`); sky.addColorStop(1, 'rgba(232,160,96,0)');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, VIEW.w, 120);
        const things = [];
        for (const r of reapers) things.push({ y: r.y, draw: () => drawActor(ctx, sheets.reaper, r.x, r.y, { dir: 'side', step: Math.floor(r.x / 14) % 3, scale: 1.3 }) });
        for (const e of ears) things.push({ y: e.y, draw: () => { ctx.globalAlpha = e.age > LAST - 2 ? 0.45 : 1; if (e.gift) { ctx.fillStyle = 'rgba(255,214,70,0.45)'; ctx.beginPath(); ctx.arc(e.x, e.y - 6, 22, 0, Math.PI * 2); ctx.fill(); } ctx.drawImage(ear, e.x - 17, e.y - 24); ctx.globalAlpha = 1; } });
        things.push({ y: p.y, draw: () => drawActor(ctx, sheets.ruth, p.x, p.y, { dir: p.dir === 'left' || p.dir === 'right' ? 'side' : p.dir, flip: p.dir === 'left', step: p.step, scale: 1.3 }) });
        things.sort((a, b) => a.y - b.y).forEach(t => t.draw());
      },

      hud() {
        const hint = s.noteFor > 0 ? s.note : msg.how;
        return { goal: `Ears gathered: ${s.got}  ·  Until evening: ${Math.max(0, s.left).toFixed(0)}`, hint };
      },

      result() {
        const best = env.save.record('gleaning', s.got, false);
        const rating = s.got >= THREE_STARS ? 3 : s.got >= TWO_STARS ? 2 : 1;
        return {
          title: rating === 3 ? 'A full ephah of barley!' : 'A good day of gleaning',
          stats: [
            { value: String(s.got), label: 'ears gathered' },
            { value: stars(rating), label: 'rating' },
            { value: String(best), label: 'your best' },
          ],
          lines: env.text('game_glean_done'),
        };
      },
    };
    return game;
  },
};
