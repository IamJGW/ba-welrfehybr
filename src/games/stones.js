// Stone Search: wade through a murky brook and find five smooth stones as
// fast as you can. Stones all look the same until you are close.

import { T, CH, FEET_Y, PROPS, groundCanvas, characterSheet } from '../art.js';
import { drawActor, VIEW } from '../minigame.js';

// Numbers to tune after watching kids play.
const NEED = 5;                          // smooth stones to find
const SMOOTH = 7, ROUGH = 14;            // how many of each are in the brook
const PENALTY = 3;                       // seconds added for a rough stone
const CLEAR = 96;                        // how far you can see through the water
const REACH = 30;                        // how close you must be to pick one up
const THREE_STARS = 25, TWO_STARS = 40;  // seconds

const row = ch => ch.repeat(30);
const ROWS = [row('h'), row('h'), row('o'), ...Array(11).fill(row('~')), row('o'), row('.'), row('.')];
const WATER = { top: 3 * T, bottom: 14 * T };

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const stars = n => '★'.repeat(n) + '☆'.repeat(3 - n);

function scatter() {
  const list = [];
  for (const smooth of [...Array(SMOOTH).fill(true), ...Array(ROUGH).fill(false)]) {
    for (let tries = 0; tries < 300; tries++) {
      const x = 50 + Math.random() * (VIEW.w - 100);
      const y = WATER.top + 26 + Math.random() * (WATER.bottom - WATER.top - 52);
      if (list.every(s => Math.hypot(s.x - x, s.y - y) > 62)) { list.push({ x, y, smooth, taken: false }); break; }
    }
  }
  return list;
}

export const stones = {
  id: 'stones',
  story: 'elah',
  intro: 'game_stones_intro',
  status(save) { const best = save.best('stones'); return best === null ? null : `Best: ${best.toFixed(1)} seconds`; },

  create(env) {
    const say = id => env.text(id)[0].text;
    const msg = { smooth: say('game_stones_smooth'), rough: say('game_stones_rough') };
    const ground = groundCanvas(ROWS);
    const sheet = characterSheet(env.look);
    const pics = { smooth: PROPS.stoneSmooth.draw(), rough: PROPS.stoneRough.draw() };
    const p = { x: VIEW.w / 2, y: 14 * T + 24, dir: 'up', step: 0, anim: 0 };
    const all = scatter();
    let time = 0, found = 0, flash = '', flashFor = 0, doneFor = 0;

    const wading = () => p.y - 3 > WATER.top && p.y - 3 < WATER.bottom;
    const nearest = () => {
      let best = null, bestD = REACH;
      for (const s of all) {
        const d = Math.hypot(s.x - p.x, s.y - (p.y - 4));
        if (!s.taken && d < bestD) { best = s; bestD = d; }
      }
      return best;
    };

    const game = {
      over: false,
      stones: all,
      player: p,
      get found() { return found; },
      get time() { return time; },

      update(dt, ctl) {
        if (found >= NEED) {
          doneFor += dt;
          if (doneFor > 0.9) game.over = true;
          return;
        }
        time += dt;
        if (flashFor > 0) flashFor -= dt;

        let dx = (ctl.held('right') ? 1 : 0) - (ctl.held('left') ? 1 : 0);
        let dy = (ctl.held('down') ? 1 : 0) - (ctl.held('up') ? 1 : 0);
        if (dx || dy) {
          p.dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
          if (dx && dy) { dx *= 0.7071; dy *= 0.7071; }
          const speed = wading() ? 125 : 160;
          p.x = clamp(p.x + dx * speed * dt, 14, VIEW.w - 14);
          p.y = clamp(p.y + dy * speed * dt, 2 * T + 14, VIEW.h - 6);
          p.anim += dt;
          p.step = [1, 0, 2, 0][Math.floor(p.anim / 0.14) % 4];
        } else {
          p.anim = 0;
          p.step = 0;
        }

        const stone = nearest();
        if (ctl.took('act') && stone) {
          stone.taken = true;
          if (stone.smooth) found++; else time += PENALTY;
          flash = stone.smooth ? msg.smooth : msg.rough;
          flashFor = 1.6;
        }
      },

      draw(ctx) {
        ctx.drawImage(ground, 0, 0);
        if (p.y < WATER.bottom + 40) {
          ctx.fillStyle = 'rgba(255,255,255,0.13)';
          ctx.beginPath();
          ctx.ellipse(p.x, p.y - 4, CLEAR, CLEAR * 0.82, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        for (const s of all) {
          if (s.taken) continue;
          if (Math.hypot(s.x - p.x, s.y - (p.y - 4)) < CLEAR) {
            const pic = s.smooth ? pics.smooth : pics.rough;
            ctx.drawImage(pic, s.x - pic.width * 0.85, s.y - pic.height * 0.85, pic.width * 1.7, pic.height * 1.7);
          } else {
            // Too far to tell what it is: just a dark shape under the water.
            ctx.fillStyle = 'rgba(47,79,99,0.55)';
            ctx.beginPath();
            ctx.ellipse(s.x, s.y, 13, 8, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        const wet = wading();
        const side = p.dir === 'left' || p.dir === 'right';
        drawActor(ctx, sheet, p.x, p.y + (wet ? 5 : 0), {
          dir: side ? 'side' : p.dir, flip: p.dir === 'left', step: p.step, crop: wet ? CH - (FEET_Y - 9) : 0,
        });
      },

      hud() {
        return {
          goal: `Smooth stones: ${found} of ${NEED}  ·  Time: ${time.toFixed(1)}`,
          hint: flashFor > 0 ? flash : nearest() ? 'Space: pick it up' : 'Wade close to see which stones are smooth',
        };
      },

      result() {
        const seconds = Math.round(time * 10) / 10;
        const best = env.save.record('stones', seconds);
        const rating = seconds <= THREE_STARS ? 3 : seconds <= TWO_STARS ? 2 : 1;
        return {
          title: 'Five smooth stones!',
          stats: [
            { value: seconds.toFixed(1), label: 'seconds' },
            { value: stars(rating), label: 'rating' },
            { value: best.toFixed(1), label: 'your best' },
          ],
          lines: env.text('game_stones_done'),
        };
      },
    };
    return game;
  },
};
