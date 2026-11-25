// One Stone: a sling skill game. Hold the action key to whirl the sling and
// let go to throw. Goliath is armored almost everywhere, with a shield bearer
// in front, so only a shot to the forehead counts.
//
// This is a replay on the time device, outside the story. The story's duel is
// never played by the player and never depends on a score.

import { PROPS, characterSheet } from '../art.js';
import { drawActor, VIEW } from '../minigame.js';
import { looks } from '../../content/elah/story.js';

// Numbers to tune after watching kids play.
const STONES = 5;                          // David carried five
const SPEED = 900, GRAVITY = 1100;         // how the stone flies
const AIM_MID = 26, AIM_SWING = 20;        // the aim swings this many degrees either side of the middle
const SWING_SLOW = 2.0, SWING_GAIN = 0.6, SWING_EXTRA = 2.3;   // the longer you whirl, the faster it swings
const SPIN_MIN = 0.45;                     // whirl for less than this and the stone drops short
const HEAD_R = 27;                         // size of the target on his forehead
const START_X = 840, TOO_CLOSE = 430;      // where Goliath starts, and where the round ends
const STRIDE = { speed: 26, walk: 1.0, rest: 1.5 };   // he steps forward, then stands

const GROUND = 440;
const PLAYER_X = 150;
const HAND = { x: 176, y: GROUND - 84 };
const SMALL = 2, BIG = 3.6;                // Goliath is drawn 1.8 times anyone else's size
const BEARER_GAP = 96;

const stars = n => '★'.repeat(n) + '☆'.repeat(3 - n);

// Where a stone at (x, y) has struck, if anywhere. gx is where Goliath stands.
function strike(x, y, gx) {
  if (Math.hypot(x - (gx - 7), y - (GROUND - 133)) < HEAD_R) return 'hit';
  const bx = gx - BEARER_GAP;
  if (x > bx - 36 && x < bx + 18 && y > GROUND - 108) return 'shield';
  if (Math.abs(x - gx) < 24 && y > GROUND - 178) return y < GROUND - 150 ? 'helmet' : y < GROUND - 54 ? 'mail' : 'legs';
  if (y >= GROUND) return 'ground';
  if (x > VIEW.w + 20) return 'gone';
  return null;
}

// Follow a throw until it lands. Used by the game and by the robot play-tester.
function flight(stone, gx, dt) {
  let left = dt;
  while (left > 0) {
    const h = Math.min(0.003, left);
    left -= h;
    stone.vy += GRAVITY * h;
    stone.x += stone.vx * h;
    stone.y += stone.vy * h;
    const where = strike(stone.x, stone.y, gx);
    if (where) return where;
  }
  return null;
}

const launch = (degrees, speed) => {
  const a = (degrees * Math.PI) / 180;
  return { x: HAND.x, y: HAND.y, vx: speed * Math.cos(a), vy: -speed * Math.sin(a) };
};

export const sling = {
  id: 'sling',
  story: 'elah',
  intro: 'game_sling_intro',
  status(save) { const best = save.best('sling'); return best === null ? null : `Best: ${best === 1 ? '1 stone' : `${best} stones`}`; },

  create(env) {
    const say = id => env.text(id)[0].text;
    const msg = {
      how: say('game_sling_how'), letGo: say('game_sling_let_go'),
      shield: say('game_sling_shield'), helmet: say('game_sling_helmet'), mail: say('game_sling_mail'),
      legs: say('game_sling_legs'), short: say('game_sling_short'), miss: say('game_sling_miss'),
      hit: say('game_sling_struck'), out: say('game_sling_out'), close: say('game_sling_close'),
    };
    const sheets = { player: characterSheet(env.look), goliath: characterSheet(looks.goliath), bearer: characterSheet(looks.bearer) };
    const tent = PROPS.ptent.draw();

    const g = { x: START_X, t: 0, moving: false, step: 0, fall: 0 };
    const s = { left: STONES, thrown: 0, phase: 'ready', spin: 0, swing: 0, aim: AIM_MID, stone: null, note: '', noteFor: 0, ending: null, endFor: 0 };

    const end = kind => { s.ending = kind; s.endFor = 0; s.stone = null; s.note = msg[kind]; s.noteFor = 9; };

    const game = {
      over: false,
      state: s,
      goliath: g,
      // What a full-strength throw at this angle would strike if Goliath stood still.
      preview(degrees) {
        const stone = launch(degrees, SPEED);
        for (let t = 0; t < 4; t += 0.02) {
          const where = flight(stone, g.x, 0.02);
          if (where) return { where, seconds: t + 0.02 };
        }
        return { where: 'gone', seconds: 4 };
      },
      get restLeft() { const beat = g.t % (STRIDE.walk + STRIDE.rest); return beat < STRIDE.walk ? 0 : STRIDE.walk + STRIDE.rest - beat; },

      update(dt, ctl) {
        if (s.ending) {
          s.endFor += dt;
          if (s.ending === 'hit') g.fall = Math.min(1, g.fall + dt * 2.2);
          if (s.endFor > (s.ending === 'hit' ? 1.8 : 1.4)) game.over = true;
          return;
        }
        if (s.noteFor > 0) s.noteFor -= dt;

        g.t += dt;
        const beat = g.t % (STRIDE.walk + STRIDE.rest);
        g.moving = beat < STRIDE.walk;
        g.step = g.moving ? [1, 0, 2, 0][Math.floor(beat / 0.25) % 4] : 0;
        if (g.moving) g.x -= STRIDE.speed * dt;

        if (s.phase === 'ready') {
          if (g.x <= TOO_CLOSE) return end('close');
          if (s.left === 0) return end('out');
          if (ctl.held('act')) { s.phase = 'spin'; s.spin = 0; }
        } else if (s.phase === 'spin') {
          if (!ctl.held('act')) {
            // Let go: the stone leaves along the arrow exactly as it is shown.
            const weak = s.spin < SPIN_MIN;
            s.stone = { ...launch(s.aim, weak ? 330 : SPEED), weak };
            s.left--;
            s.thrown++;
            s.phase = 'fly';
          } else {
            s.spin += dt;
            s.swing += (SWING_SLOW + Math.min(SWING_EXTRA, s.spin * SWING_GAIN)) * dt;
            s.aim = AIM_MID + AIM_SWING * Math.sin(s.swing);
          }
        } else if (s.phase === 'fly') {
          const where = flight(s.stone, g.x, dt);
          if (where === 'hit') return end('hit');
          if (where) {
            s.note = where === 'ground' ? (s.stone.weak ? msg.short : msg.miss) : where === 'gone' ? msg.miss : msg[where];
            s.noteFor = 2.2;
            s.stone = null;
            s.phase = 'ready';
          }
        }
      },

      draw(ctx) {
        // Sky, the far hill with the Philistine camp, and the valley floor.
        ctx.fillStyle = '#cfe3ee';
        ctx.fillRect(0, 0, VIEW.w, VIEW.h);
        ctx.fillStyle = '#9c9a62';
        ctx.beginPath();
        ctx.moveTo(0, 310);
        for (const [x, y] of [[200, 262], [430, 300], [660, 246], [960, 286], [960, GROUND], [0, GROUND]]) ctx.lineTo(x, y);
        ctx.fill();
        ctx.drawImage(tent, 640, 232, 51, 48);
        ctx.drawImage(tent, 770, 244, 51, 48);
        ctx.drawImage(tent, 880, 262, 51, 48);
        ctx.fillStyle = '#cdbd85';
        ctx.fillRect(0, GROUND - 16, VIEW.w, VIEW.h - GROUND + 16);
        ctx.fillStyle = '#bcab74';
        for (let i = 0; i < 60; i++) ctx.fillRect((i * 167) % VIEW.w, GROUND - 10 + ((i * 53) % 100), 3, 2);

        const fleeing = s.ending === 'hit' ? s.endFor * 240 : 0;
        drawActor(ctx, sheets.bearer, g.x - BEARER_GAP + fleeing, GROUND, {
          dir: 'side', flip: !fleeing, scale: SMALL, step: fleeing ? [1, 0, 2, 0][Math.floor(s.endFor / 0.1) % 4] : g.step,
        });
        drawActor(ctx, sheets.goliath, g.x, GROUND, { dir: 'side', flip: true, scale: BIG, step: g.step, angle: (-g.fall * Math.PI) / 2 });
        drawActor(ctx, sheets.player, PLAYER_X, GROUND, { dir: 'side', scale: SMALL });

        if (s.phase === 'spin') {
          // The whirling sling, and an arrow showing where a throw would go right now.
          const turn = s.swing * 3.1;
          const sx = PLAYER_X + 8 + Math.cos(turn) * 30, sy = GROUND - 124 + Math.sin(turn) * 10;
          ctx.strokeStyle = '#5d4526';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(HAND.x, HAND.y); ctx.lineTo(sx, sy); ctx.stroke();
          ctx.fillStyle = '#e8e4da';
          ctx.beginPath(); ctx.arc(sx, sy, 4, 0, Math.PI * 2); ctx.fill();

          const a = (s.aim * Math.PI) / 180, ready = s.spin >= SPIN_MIN;
          const tipX = HAND.x + Math.cos(a) * 74, tipY = HAND.y - Math.sin(a) * 74;
          ctx.strokeStyle = ctx.fillStyle = ready ? '#c8962a' : 'rgba(60,50,40,0.45)';
          ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(HAND.x + Math.cos(a) * 20, HAND.y - Math.sin(a) * 20); ctx.lineTo(tipX, tipY); ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(tipX + Math.cos(a) * 12, tipY - Math.sin(a) * 12);
          ctx.lineTo(tipX + Math.cos(a + 2.4) * 9, tipY - Math.sin(a + 2.4) * 9);
          ctx.lineTo(tipX + Math.cos(a - 2.4) * 9, tipY - Math.sin(a - 2.4) * 9);
          ctx.fill();
        }
        if (s.stone) {
          ctx.fillStyle = '#3a2f24';
          ctx.beginPath(); ctx.arc(s.stone.x, s.stone.y, 5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#e8e4da';
          ctx.beginPath(); ctx.arc(s.stone.x, s.stone.y, 3.5, 0, Math.PI * 2); ctx.fill();
        }
        // The stones you have left, lying at your feet.
        for (let i = 0; i < STONES; i++) {
          ctx.fillStyle = i < s.left ? '#3f5f73' : 'rgba(63,95,115,0.2)';
          ctx.beginPath(); ctx.ellipse(60 + i * 24, GROUND + 52, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
        }
      },

      hud() {
        return {
          goal: `Stones left: ${s.left} of ${STONES}`,
          hint: s.noteFor > 0 ? s.note : s.phase === 'spin' ? msg.letGo : msg.how,
        };
      },

      result() {
        if (s.ending !== 'hit') {
          return { title: s.ending === 'close' ? 'Too close!' : 'Out of stones', lines: env.text(s.ending === 'close' ? 'game_sling_close' : 'game_sling_out') };
        }
        const best = env.save.record('sling', s.thrown);
        const rating = s.thrown === 1 ? 3 : s.thrown <= 3 ? 2 : 1;
        return {
          title: s.thrown === 1 ? 'One stone!' : 'A hit!',
          stats: [
            { value: String(s.thrown), label: s.thrown === 1 ? 'stone used' : 'stones used' },
            { value: stars(rating), label: 'rating' },
            { value: String(best), label: 'your best' },
          ],
          lines: env.text('game_sling_hit'),
        };
      },
    };
    return game;
  },
};
