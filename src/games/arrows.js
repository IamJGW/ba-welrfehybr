// Arrow Signal: three arrows, each to land just beyond the boy, the way
// Jonathan signaled to David. Hold the action key to draw the bow and let go
// when the strength is right.

import { PROPS, characterSheet } from '../art.js';
import { drawActor, VIEW } from '../minigame.js';
import { robe } from '../storykit.js';

// Numbers to tune after watching kids play.
const ARROWS = 3;
const SWING = 1.5;                    // seconds for the strength to rise and fall once
const NEAR = 190, REACH = 560;        // the weakest shot lands NEAR pixels away; the strongest, NEAR + REACH
const ZONE = { from: 26, to: 150 };   // how far beyond the boy counts
const FLIGHT = 0.75;                  // seconds an arrow is in the air

const GROUND = 430;
const PLAYER_X = 120;
const HAND = { x: 150, y: GROUND - 70 };

// Where an arrow shot with this much strength (0 to 1) comes down.
const landing = strength => HAND.x + NEAR + strength * REACH;

export const arrows = {
  id: 'arrows',
  story: 'covenant',
  intro: 'game_arrows_intro',
  status(save) { const best = save.best('arrows'); return best === null ? null : `Best: ${best} of ${ARROWS}`; },

  create(env) {
    const say = id => env.text(id)[0].text;
    const msg = {
      how: say('game_arrows_how'), short: say('game_arrows_short'), hit: say('game_arrows_hit'), far: say('game_arrows_far'),
    };
    const sheets = { player: characterSheet({ ...env.look, item: 'bow' }), boy: characterSheet(robe({ top: '#b59a6e' })) };
    const stone = PROPS.bigrock.draw(), tree = PROPS.tree.draw();
    const newBoy = () => 420 + Math.random() * 260;
    const s = { shot: 0, hits: 0, phase: 'ready', held: 0, strength: 0, boy: newBoy(), arrow: null, stuck: [], note: '', noteFor: 0, endFor: 0 };

    const game = {
      over: false,
      state: s,
      landing,
      zone: () => ({ from: s.boy + ZONE.from, to: s.boy + ZONE.to }),

      update(dt, ctl) {
        if (s.noteFor > 0) s.noteFor -= dt;
        if (s.phase === 'done') {
          s.endFor += dt;
          if (s.endFor > 1.4) game.over = true;
        } else if (s.phase === 'ready') {
          if (ctl.held('act')) { s.phase = 'draw'; s.held = 0; }
        } else if (s.phase === 'draw') {
          if (ctl.held('act')) {
            // The strength rises and falls like a slow breath.
            s.held += dt;
            s.strength = 1 - Math.abs(((s.held / SWING) * 2) % 2 - 1);
          } else {
            s.arrow = { t: 0, to: landing(s.strength) };
            s.phase = 'fly';
          }
        } else if (s.phase === 'fly') {
          s.arrow.t += dt / FLIGHT;
          if (s.arrow.t >= 1) {
            const beyond = s.arrow.to - s.boy;
            const where = beyond < ZONE.from ? 'short' : beyond > ZONE.to ? 'far' : 'hit';
            if (where === 'hit') s.hits++;
            s.stuck.push({ x: s.arrow.to, hit: where === 'hit' });
            s.note = msg[where];
            s.noteFor = 2;
            s.arrow = null;
            s.shot++;
            s.strength = 0;
            if (s.shot >= ARROWS) s.phase = 'done';
            else { s.phase = 'ready'; s.boy = newBoy(); s.stuck = []; }
          }
        }
      },

      draw(ctx) {
        ctx.fillStyle = '#cfe3ee';
        ctx.fillRect(0, 0, VIEW.w, VIEW.h);
        ctx.fillStyle = '#9db56a';
        ctx.beginPath();
        ctx.moveTo(0, 300);
        for (const [x, y] of [[240, 262], [500, 296], [760, 250], [960, 280], [960, GROUND], [0, GROUND]]) ctx.lineTo(x, y);
        ctx.fill();
        ctx.drawImage(tree, 700, 196); ctx.drawImage(tree, 60, 226);
        ctx.fillStyle = '#8fa858';
        ctx.fillRect(0, GROUND - 16, VIEW.w, VIEW.h - GROUND + 16);
        ctx.fillStyle = '#6f8a3f';
        for (let i = 0; i < 90; i++) ctx.fillRect((i * 131) % VIEW.w, GROUND - 12 + ((i * 47) % 104), 2, 7);
        ctx.drawImage(stone, 860, GROUND - 46);

        // The stretch of ground that counts as "beyond".
        const zone = game.zone();
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.fillRect(zone.from, GROUND - 6, zone.to - zone.from, 18);

        drawActor(ctx, sheets.boy, s.boy, GROUND, { dir: 'side', flip: true, scale: 1.6 });
        drawActor(ctx, sheets.player, PLAYER_X, GROUND, { dir: 'side', scale: 2 });

        for (const stuck of s.stuck) {
          ctx.strokeStyle = stuck.hit ? '#c8962a' : '#7a5a34';
          ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(stuck.x - 9, GROUND - 18); ctx.lineTo(stuck.x, GROUND + 2); ctx.stroke();
        }
        if (s.arrow) {
          const x = HAND.x + (s.arrow.to - HAND.x) * s.arrow.t;
          const y = HAND.y + (GROUND - HAND.y) * s.arrow.t - Math.sin(s.arrow.t * Math.PI) * 150;
          const tilt = Math.cos(s.arrow.t * Math.PI) * -0.7 + 0.25;
          ctx.save();
          ctx.translate(x, y); ctx.rotate(tilt);
          ctx.fillStyle = '#7a5a34'; ctx.fillRect(-14, -1, 28, 3);
          ctx.fillStyle = '#9aa0a8'; ctx.beginPath(); ctx.moveTo(14, -4); ctx.lineTo(22, 0); ctx.lineTo(14, 5); ctx.fill();
          ctx.restore();
        }
        if (s.phase === 'draw') {
          // How hard the bow is drawn.
          ctx.fillStyle = 'rgba(0,0,0,0.45)';
          ctx.fillRect(60, GROUND + 46, 180, 16);
          ctx.fillStyle = '#c8962a';
          ctx.fillRect(62, GROUND + 48, 176 * s.strength, 12);
        }
        for (let i = 0; i < ARROWS; i++) {
          ctx.fillStyle = i < ARROWS - s.shot - (s.arrow ? 1 : 0) ? '#7a5a34' : 'rgba(122,90,52,0.25)';
          ctx.fillRect(64 + i * 14, GROUND + 70, 4, 26);
        }
      },

      hud() {
        return { goal: `Arrows beyond the boy: ${s.hits} of ${ARROWS}`, hint: s.noteFor > 0 ? s.note : msg.how };
      },

      result() {
        const best = env.save.record('arrows', s.hits, false);
        return {
          title: s.hits === ARROWS ? 'Every arrow beyond!' : s.hits ? 'The signal is given' : 'Not this time',
          stats: [
            { value: `${s.hits} of ${ARROWS}`, label: 'beyond the boy' },
            { value: '★'.repeat(s.hits) + '☆'.repeat(ARROWS - s.hits), label: 'rating' },
            { value: `${best} of ${ARROWS}`, label: 'your best' },
          ],
          lines: env.text('game_arrows_done'),
        };
      },
    };
    return game;
  },
};
