// Camel Water: Rebekah's ten thirsty camels (Genesis 24:19-20). Run to the
// well and fill your jar, run to the trough and pour. The camels drink
// whatever is in the trough, so keep it from running dry. A full jar slows
// you down, and a full trough spills.
// Arrow keys run, Space fills or pours.

import { PROPS, groundCanvas, characterSheet } from '../art.js';
import { drawActor, VIEW } from '../minigame.js';

// Numbers to tune after watching kids play.
const CAMELS = 10;
const NEED = 3;                            // water each camel drinks before it has had enough
const JAR = 4, TROUGH_MAX = 8;             // water in one jar, and the most the trough can hold
const DRINK = 0.6;                         // water a camel drinks per second while there is some
const FILL_TIME = 0.5;                     // seconds to draw a jar at the well
const SPEED = 210, SPEED_FULL = 150;       // running empty-handed, and carrying a full jar
const THREE_STARS = 40, TWO_STARS = 60;    // seconds
const WELL = { x: 140, y: 440 };   // the well and the player stay below the trough
const TROUGH = { x: 330, y: 360, w: 520 };
const REACH = 70;
const FIELD = { left: 30, right: VIEW.w - 30, top: 90, bottom: VIEW.h - 20 };

const ROWS = Array(17).fill('s'.repeat(30));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const stars = n => '★'.repeat(n) + '☆'.repeat(3 - n);

export const camels = {
  id: 'camels',
  story: 'rebekah',
  intro: 'game_camels_intro',
  status(save) { const best = save.best('camels'); return best === null ? null : `Best: ${best.toFixed(1)} seconds`; },

  create(env) {
    const say = id => env.text(id)[0].text;
    const msg = { how: say('game_camels_how'), full: say('game_camels_full') };
    const ground = groundCanvas(ROWS);
    const well = PROPS.well.draw(), trough = PROPS.trough.draw();
    const sheets = { player: characterSheet({ ...env.look, item: null }), carrying: characterSheet({ ...env.look, item: 'jar' }), camel: characterSheet({ kind: 'camel' }) };
    const p = { x: 240, y: 450, dir: 'right', step: 0, anim: 0, jar: false, filling: 0 };
    // The camels stand in a row behind the trough.
    const herd = Array.from({ length: CAMELS }, (_, i) => ({
      x: TROUGH.x + 24 + i * ((TROUGH.w - 48) / (CAMELS - 1)), y: TROUGH.y - 34 - (i % 2) * 22,
      need: NEED, full: false, flash: 0,
    }));
    const s = { water: 0, time: 0, doneFor: 0, note: '', noteFor: 0, spilled: 0 };
    const near = (x, y) => Math.hypot(p.x - x, p.y - y) < REACH;
    const atTrough = () => p.x > TROUGH.x - 30 && p.x < TROUGH.x + TROUGH.w + 30 && Math.abs(p.y - (TROUGH.y + 30)) < REACH;
    const watered = () => herd.filter(c => c.full).length;
    const tell = (text, t = 1.2) => { s.note = text; s.noteFor = t; };

    const act = () => {
      if (p.filling > 0) return;
      if (!p.jar && near(WELL.x, WELL.y)) { p.filling = FILL_TIME; return; }
      if (p.jar && atTrough()) {
        p.jar = false;
        const room = TROUGH_MAX - s.water;
        if (room < JAR) { s.spilled += JAR - room; tell('Splash! The trough overflows.'); }
        s.water = Math.min(TROUGH_MAX, s.water + JAR);
      }
    };

    const game = {
      over: false,
      player: p,
      herd,
      state: s,
      well: WELL,
      trough: { x: TROUGH.x + 40, y: TROUGH.y + 34 },   // the near end, where the robot pours
      get time() { return s.time; },
      act,

      update(dt, ctl) {
        if (s.noteFor > 0) s.noteFor -= dt;
        herd.forEach(c => { if (c.flash > 0) c.flash -= dt; });
        if (watered() === CAMELS) {
          s.doneFor += dt;
          if (s.doneFor > 1.2) game.over = true;
          return;
        }
        s.time += dt;

        if (p.filling > 0) {
          p.filling -= dt;
          if (p.filling <= 0) { p.filling = 0; p.jar = true; }
        } else {
          let dx = (ctl.held('right') ? 1 : 0) - (ctl.held('left') ? 1 : 0);
          let dy = (ctl.held('down') ? 1 : 0) - (ctl.held('up') ? 1 : 0);
          if (dx || dy) {
            p.dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
            if (dx && dy) { dx *= 0.7071; dy *= 0.7071; }
            const speed = p.jar ? SPEED_FULL : SPEED;
            p.x = clamp(p.x + dx * speed * dt, FIELD.left, FIELD.right);
            p.y = clamp(p.y + dy * speed * dt, Math.max(FIELD.top, TROUGH.y + 26), FIELD.bottom);
            p.anim += dt;
            p.step = [1, 0, 2, 0][Math.floor(p.anim / 0.12) % 4];
          } else { p.anim = 0; p.step = 0; }
          if (ctl.took('act')) act();
        }

        // Every thirsty camel drinks from the trough while there is water in it.
        const thirsty = herd.filter(c => !c.full);
        if (s.water > 0 && thirsty.length) {
          const each = Math.min(DRINK * dt, s.water / thirsty.length);
          for (const c of thirsty) {
            c.need -= each;
            s.water -= each;
            if (c.need <= 0.001) { c.full = true; c.flash = 1.2; tell(msg.full); }
          }
          if (s.water < 0.001) s.water = 0;
        }
      },

      draw(ctx) {
        ctx.drawImage(ground, 0, 0);
        // Evening sky along the top.
        const sky = ctx.createLinearGradient(0, 0, 0, 80);
        sky.addColorStop(0, '#e8a060'); sky.addColorStop(1, 'rgba(232,160,96,0)');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, VIEW.w, 80);

        const things = [];
        things.push({ y: WELL.y + 20, draw: () => ctx.drawImage(well, WELL.x - 32, WELL.y - 44, 64, 84) });
        for (const c of herd) {
          things.push({
            y: c.y,
            draw: () => {
              drawActor(ctx, sheets.camel, c.x, c.y, { dir: 'down', scale: 1.5 });
              // How thirsty: a little bar over each camel, or a heart when full.
              if (c.full) {
                ctx.fillStyle = c.flash > 0 ? '#ffd23f' : '#d94a3d';
                ctx.font = '18px sans-serif'; ctx.textAlign = 'center';
                ctx.fillText('♥', c.x, c.y - 66);
              } else {
                const left = c.need / NEED;
                ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(c.x - 16, c.y - 74, 32, 6);
                ctx.fillStyle = '#4f9fd0'; ctx.fillRect(c.x - 16, c.y - 74, 32 * (1 - left), 6);
              }
            },
          });
        }
        things.push({
          y: TROUGH.y + 26,
          draw: () => {
            ctx.drawImage(trough, TROUGH.x, TROUGH.y, TROUGH.w, 40);
            ctx.fillStyle = 'rgba(127,176,200,0.9)';
            const level = s.water / TROUGH_MAX;
            if (level > 0) ctx.fillRect(TROUGH.x + 14, TROUGH.y + 12 + (1 - level) * 12, (TROUGH.w - 28), 12 * level + 2);
          },
        });
        const sheet = p.jar ? sheets.carrying : sheets.player;
        things.push({
          y: p.y,
          draw: () => drawActor(ctx, sheet, p.x, p.y, { dir: p.dir === 'left' || p.dir === 'right' ? 'side' : p.dir, flip: p.dir === 'left', step: p.step, scale: 1.3 }),
        });
        things.sort((a, b) => a.y - b.y).forEach(t => t.draw());
        if (p.filling > 0) {
          ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(p.x - 24, p.y - 90, 48, 7);
          ctx.fillStyle = '#4f9fd0'; ctx.fillRect(p.x - 24, p.y - 90, 48 * (1 - p.filling / FILL_TIME), 7);
        }
      },

      hud() {
        const hint = s.noteFor > 0 ? s.note : p.jar ? 'Your jar is full: pour it into the trough.' : msg.how;
        return { goal: `Camels watered: ${watered()} of ${CAMELS}  ·  Time: ${s.time.toFixed(1)}`, hint };
      },

      result() {
        const seconds = Math.round(s.time * 10) / 10;
        const best = env.save.record('camels', seconds);
        const rating = seconds <= THREE_STARS ? 3 : seconds <= TWO_STARS ? 2 : 1;
        return {
          title: rating === 3 ? 'Quick as Rebekah!' : 'Every camel watered!',
          stats: [
            { value: seconds.toFixed(1), label: 'seconds' },
            { value: stars(rating), label: 'rating' },
            { value: best.toFixed(1), label: 'your best' },
          ],
          lines: env.text('game_camels_done'),
        };
      },
    };
    return game;
  },
};
