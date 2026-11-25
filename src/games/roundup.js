// Round Up: the flock has scattered. Sheep move away from you, so get behind
// them and drive them through the gate into the fold on the right.

import { PROPS, groundCanvas, characterSheet } from '../art.js';
import { drawActor, VIEW } from '../minigame.js';

// Numbers to tune after watching kids play.
const SHEEP = 8;
const SCARE = 95;                          // how close you get before a sheep moves away
const SHEEP_SPEED = 135, PLAYER_SPEED = 175;
const THREE_STARS = 35, TWO_STARS = 60;    // seconds
const FENCE = 790;                         // everything right of this line is the fold
const GATE = { top: 200, bottom: 390 };    // the gap in the fence
const FIELD = { left: 20, right: VIEW.w - 20, top: 70, bottom: VIEW.h - 14 };
const EDGE = 44;   // loose sheep stay this far inside the field, so you can always get behind one

const row = ch => ch.repeat(30);
const ROWS = Array(17).fill(row('.'));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const stars = n => '★'.repeat(n) + '☆'.repeat(3 - n);

export const roundup = {
  id: 'roundup',
  story: 'shepherd',
  intro: 'game_roundup_intro',
  status(save) { const best = save.best('roundup'); return best === null ? null : `Best: ${best.toFixed(1)} seconds`; },

  create(env) {
    const say = id => env.text(id)[0].text;
    const msg = { how: say('game_roundup_how') };
    const ground = groundCanvas(ROWS);
    const wall = PROPS.foldwall.draw(), post = PROPS.gatepost.draw();
    const sheets = { player: characterSheet(env.look), sheep: characterSheet({ kind: 'lamb' }) };
    const p = { x: 120, y: 300, dir: 'right', step: 0, anim: 0 };
    const flock = [];
    while (flock.length < SHEEP) {
      const s = { x: 200 + Math.random() * 460, y: FIELD.top + EDGE + Math.random() * (FIELD.bottom - FIELD.top - EDGE * 2) };
      if (flock.every(o => Math.hypot(o.x - s.x, o.y - s.y) > 50)) {
        flock.push({ ...s, dir: 'left', step: 0, anim: 0, safe: false, drift: Math.random() * 6.28, driftFor: 0 });
      }
    }
    let time = 0, doneFor = 0;
    const safe = () => flock.filter(s => s.safe).length;

    const game = {
      over: false,
      player: p,
      flock,
      gate: { x: FENCE, y: (GATE.top + GATE.bottom) / 2 },
      get time() { return time; },

      update(dt, ctl) {
        if (safe() === SHEEP) {
          doneFor += dt;
          if (doneFor > 0.9) game.over = true;
          return;
        }
        time += dt;

        let dx = (ctl.held('right') ? 1 : 0) - (ctl.held('left') ? 1 : 0);
        let dy = (ctl.held('down') ? 1 : 0) - (ctl.held('up') ? 1 : 0);
        if (dx || dy) {
          p.dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
          if (dx && dy) { dx *= 0.7071; dy *= 0.7071; }
          p.x = clamp(p.x + dx * PLAYER_SPEED * dt, FIELD.left, FIELD.right);
          p.y = clamp(p.y + dy * PLAYER_SPEED * dt, FIELD.top, FIELD.bottom);
          p.anim += dt;
          p.step = [1, 0, 2, 0][Math.floor(p.anim / 0.13) % 4];
        } else { p.anim = 0; p.step = 0; }

        let spot = 0;
        for (const s of flock) {
          if (s.safe) {
            // Safe sheep wander over to their own spot inside the fold.
            const tx = FENCE + 46 + (spot % 2) * 52, ty = 150 + Math.floor(spot / 2) * 78;
            spot++;
            s.x += (tx - s.x) * Math.min(1, dt * 3);
            s.y += (ty - s.y) * Math.min(1, dt * 3);
            s.step = 0;
            continue;
          }
          let vx = 0, vy = 0;
          const away = Math.hypot(s.x - p.x, s.y - p.y);
          if (away < SCARE) {
            // Run from the player, faster the closer they are.
            const speed = SHEEP_SPEED * (1.15 - (away / SCARE) * 0.6);
            vx = ((s.x - p.x) / (away || 1)) * speed;
            vy = ((s.y - p.y) / (away || 1)) * speed;
          } else {
            s.driftFor -= dt;
            if (s.driftFor <= 0) { s.drift = Math.random() * 6.28; s.driftFor = 1 + Math.random() * 2; }
            vx = Math.cos(s.drift) * 10;
            vy = Math.sin(s.drift) * 10;
          }
          for (const o of flock) {
            if (o === s || o.safe) continue;
            const d = Math.hypot(s.x - o.x, s.y - o.y);
            if (d < 26 && d > 0) { vx += ((s.x - o.x) / d) * 40; vy += ((s.y - o.y) / d) * 40; }
          }
          s.y = clamp(s.y + vy * dt, FIELD.top + EDGE, FIELD.bottom - EDGE);
          let nx = Math.max(FIELD.left + EDGE, s.x + vx * dt);
          // The fence stops a sheep unless it is level with the gate. It slides along instead.
          const atGate = s.y > GATE.top + 8 && s.y < GATE.bottom - 4;
          if (nx >= FENCE - 6 && !atGate) nx = FENCE - 6;
          s.x = nx;
          if (s.x > FENCE + 6) s.safe = true;
          const moving = Math.hypot(vx, vy) > 25;
          if (Math.abs(vx) > 6) s.dir = vx > 0 ? 'right' : 'left';
          s.anim = moving ? s.anim + dt : 0;
          s.step = moving ? [1, 0, 2, 0][Math.floor(s.anim / 0.12) % 4] : 0;
        }
      },

      draw(ctx) {
        ctx.drawImage(ground, 0, 0);
        ctx.fillStyle = 'rgba(120,100,60,0.22)';
        ctx.fillRect(FENCE, 0, VIEW.w - FENCE, VIEW.h);
        const things = [];
        for (let y = FIELD.top - 26; y < VIEW.h; y += 22) {
          if (y + 20 > GATE.top - 20 && y < GATE.bottom - 4) continue;
          things.push({ y: y + 20, draw: () => ctx.drawImage(wall, FENCE - 16, y) });
        }
        for (const y of [GATE.top, GATE.bottom + 26]) things.push({ y, draw: () => ctx.drawImage(post, FENCE - 16, y - 62) });
        for (const s of flock) {
          things.push({ y: s.y, draw: () => drawActor(ctx, sheets.sheep, s.x, s.y, { dir: 'side', flip: s.dir === 'left', step: s.step, scale: 1.25 }) });
        }
        things.push({
          y: p.y,
          draw: () => drawActor(ctx, sheets.player, p.x, p.y, {
            dir: p.dir === 'left' || p.dir === 'right' ? 'side' : p.dir, flip: p.dir === 'left', step: p.step,
          }),
        });
        things.sort((a, b) => a.y - b.y).forEach(t => t.draw());
      },

      hud() {
        return { goal: `Sheep in the fold: ${safe()} of ${SHEEP}  ·  Time: ${time.toFixed(1)}`, hint: msg.how };
      },

      result() {
        const seconds = Math.round(time * 10) / 10;
        const best = env.save.record('roundup', seconds);
        const rating = seconds <= THREE_STARS ? 3 : seconds <= TWO_STARS ? 2 : 1;
        return {
          title: 'All safe!',
          stats: [
            { value: seconds.toFixed(1), label: 'seconds' },
            { value: stars(rating), label: 'rating' },
            { value: best.toFixed(1), label: 'your best' },
          ],
          lines: env.text('game_roundup_done'),
        };
      },
    };
    return game;
  },
};
