// Manna Morning: seven mornings in the desert (Exodus 16). Each morning, gather
// what your family needs, and no more. On the sixth morning, gather twice as much.
// On the seventh, there is nothing in the field: rest. What is gathered over the
// need spoils by the next day, and what is gathered under it leaves someone hungry.
// Space gathers an omer. Down (or Enter) means "that is enough".

import { characterSheet, PROPS, groundCanvas } from '../art.js';
import { drawActor, VIEW } from '../minigame.js';

// Numbers to tune after watching kids play.
const DAYS = 7;
const NEED = 3;                    // omers the family needs on an ordinary day
const MORNING = 14;                // seconds before the sun melts what is left
const GATHER = 0.55;               // seconds to gather one omer
const THREE_STARS = 7, TWO_STARS = 5;   // days done just right

const ROWS = Array(17).fill('s'.repeat(30));
const stars = n => '★'.repeat(n) + '☆'.repeat(3 - n);
const needOn = day => (day === 6 ? NEED * 2 : day === 7 ? 0 : NEED);

export const mannaMorning = {
  id: 'mannamorning',
  story: 'manna',
  intro: 'game_manna_intro',
  status(save) { const best = save.best('mannamorning'); return best === null ? null : `Best: ${best} of 7 days just right`; },

  create(env) {
    const say = id => env.text(id)[0].text;
    const msg = { how: say('game_manna_how'), rest: say('game_manna_rest') };
    const ground = groundCanvas(ROWS);
    const flake = PROPS.mannaflake.draw();
    const sheets = { gather: characterSheet({ ...env.look, item: 'basket' }) };
    const p = { x: 300, y: 380, step: 0, anim: 0, busy: 0 };
    const s = { day: 1, left: MORNING, got: 0, pressed: 0, right: 0, result: null, shown: 0, log: [], banner: 2.2 };
    const flakes = Array.from({ length: 14 }, (_, i) => ({ x: 120 + ((i * 131) % 700), y: 200 + ((i * 53) % 220) }));

    const finishDay = () => {
      const need = needOn(s.day);
      let note, ok = false;
      if (s.day === 7) { ok = s.pressed === 0; note = ok ? say('game_manna_rested') : say('game_manna_nothing'); }
      else if (s.got === need) { ok = true; note = s.day === 6 ? say('game_manna_double') : say('game_manna_just'); }
      else if (s.got > need) note = say('game_manna_spoiled');
      else note = say('game_manna_hungry');
      if (ok) s.right++;
      s.log.push(ok);
      s.result = { note, ok, for: 2.4 };
    };
    const nextDay = () => {
      s.result = null;
      if (s.day >= DAYS) { game.over = true; return; }
      s.day++; s.left = s.day === 7 ? 7 : MORNING; s.got = 0; s.pressed = 0; s.banner = 2;
    };

    const game = {
      over: false,
      state: s,
      get need() { return needOn(s.day); },

      update(dt, ctl) {
        if (s.banner > 0) { s.banner -= dt; return; }
        if (s.result) { s.result.for -= dt; if (s.result.for <= 0) nextDay(); return; }
        if (p.busy > 0) p.busy -= dt;
        s.left -= dt;
        if (ctl.took('act') && p.busy <= 0) {
          s.pressed++;
          if (s.day < 7 && flakes.length > s.got) { s.got++; p.busy = GATHER; }
        }
        if ((ctl.took('down') && s.day < 7) || s.left <= 0) finishDay();
      },

      draw(ctx) {
        ctx.drawImage(ground, 0, 0);
        ctx.fillStyle = 'rgba(255,232,160,0.25)'; ctx.fillRect(0, 0, VIEW.w, 90);
        // The manna on the ground, melting as the sun gets hot.
        if (s.day < 7) {
          const left = Math.max(0, s.left / MORNING);
          ctx.globalAlpha = Math.min(1, 0.35 + left);
          flakes.slice(s.got).forEach(f => ctx.drawImage(flake, f.x, f.y, 51, 36));
          ctx.globalAlpha = 1;
        }
        drawActor(ctx, sheets.gather, p.x, p.y, { dir: 'side', scale: 2.4, step: p.busy > 0 ? 1 : 0 });
        // The bowl: omers gathered, against what the family needs.
        ctx.fillStyle = 'rgba(30,22,14,0.75)'; ctx.fillRect(560, 40, 360, 64);
        ctx.fillStyle = '#ffd23f'; ctx.font = 'bold 24px Georgia, serif'; ctx.textAlign = 'left';
        ctx.fillText(`Omers gathered: ${s.got}`, 580, 80);
        // The seven days, as dots.
        for (let i = 0; i < DAYS; i++) {
          const x = 60 + i * 44;
          ctx.fillStyle = i < s.log.length ? (s.log[i] ? '#6fcf6f' : '#d9604a') : i === s.day - 1 ? '#ffd23f' : 'rgba(255,255,255,0.3)';
          ctx.beginPath(); ctx.arc(x, 60, 14, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#2a2118'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(String(i + 1), x, 65);
        }
        if (s.banner > 0 || s.result) {
          ctx.fillStyle = 'rgba(20,15,10,0.75)'; ctx.fillRect(0, 210, VIEW.w, 120);
          ctx.fillStyle = s.result ? (s.result.ok ? '#8fe08f' : '#f0a090') : '#ffd23f';
          ctx.font = 'bold 28px Georgia, serif'; ctx.textAlign = 'center';
          ctx.fillText(s.result ? s.result.note : `Morning ${s.day} of ${DAYS}`, VIEW.w / 2, 280);
        }
      },

      hud() {
        const need = needOn(s.day);
        const goal = s.day === 7 ? `Morning 7: the Sabbath. There is nothing in the field.` : `Morning ${s.day}: your family needs ${need}   ·   Time: ${Math.max(0, s.left).toFixed(0)}`;
        return { goal, hint: s.day === 7 ? msg.rest : msg.how };
      },

      result() {
        const best = env.save.record('mannamorning', s.right, false);
        const rating = s.right >= THREE_STARS ? 3 : s.right >= TWO_STARS ? 2 : 1;
        return {
          title: rating === 3 ? 'Just enough, every day!' : rating === 2 ? 'Nearly there' : 'Trust is hard',
          stats: [
            { value: `${s.right} of ${DAYS}`, label: 'days just right' },
            { value: stars(rating), label: 'rating' },
            { value: `${best} of ${DAYS}`, label: 'your best' },
          ],
          lines: env.text(rating === 3 ? 'game_manna_done' : 'game_manna_short'),
        };
      },
    };
    return game;
  },
};
