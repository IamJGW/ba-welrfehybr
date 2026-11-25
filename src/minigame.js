// Runs a mini-game: an intro card, the game itself on its own canvas, then a
// result card. The games live in src/games/ and only have to say how to
// update, how to draw, and what their result is.

import { CW, CH, FEET_Y } from './art.js';
import { input } from './input.js';

export const VIEW = { w: 960, h: 540 };

const ROW = { down: 0, up: 1, side: 2 };

// Draw one frame of a character sheet with the feet at (x, y).
// "crop" hides rows at the bottom (for wading); "angle" tips the figure over.
export function drawActor(ctx, sheet, x, y, { dir = 'down', step = 0, scale = 1, flip = false, crop = 0, angle = 0 } = {}) {
  const rows = CH - crop;
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  if (angle) ctx.rotate(angle);
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(sheet, step * CW, ROW[dir] * CH, CW, rows, (-CW * scale) / 2, -FEET_Y * scale, CW * scale, rows * scale);
  ctx.restore();
}

// One round. Settles with the game's result, or null if the player left early.
function round(def, env) {
  const { ui } = env;
  return new Promise(resolve => {
    const canvas = document.createElement('canvas');
    canvas.width = VIEW.w;
    canvas.height = VIEW.h;
    document.getElementById('game').append(canvas);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // A finger or mouse held on the game counts as holding the action key.
    const pointer = { held: false, pressed: false, x: 0, y: 0 };
    const down = e => {
      pointer.held = true; pointer.pressed = true;
      const box = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - box.left) / box.width) * VIEW.w;
      pointer.y = ((e.clientY - box.top) / box.height) * VIEW.h;
    };
    const up = () => { pointer.held = false; };
    canvas.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    const controls = {
      held: key => input.held(key) || (key === 'act' && pointer.held),
      took(key) {
        const tapped = key === 'act' && pointer.pressed;
        if (tapped) pointer.pressed = false;
        return input.took(key) || tapped;
      },
      // Where the game was last tapped or clicked, in game pixels.
      pointer: () => ({ x: pointer.x, y: pointer.y }),
    };

    const game = def.create(env);
    let done = false, frameId = 0, last = performance.now(), shown = { goal: null, hint: null };

    const finish = value => {
      if (done) return;
      done = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener('pointerup', up);
      canvas.remove();
      ui.hud(false);
      window.__mini = null;
      resolve(value);
    };
    const step = dt => {
      if (done) return;
      if (input.took('back')) return finish(null);
      game.update(dt, controls);
      game.draw(ctx);
      const hud = game.hud();
      if (hud.goal !== shown.goal) ui.setGoal(hud.goal);
      if (hud.hint !== shown.hint) ui.setHint(hud.hint);
      shown = hud;
      if (game.over) finish(game.result());
    };
    const frame = now => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      step(dt);
      if (!done) frameId = requestAnimationFrame(frame);
    };

    input.clear();
    ui.hud(true, { leave: () => finish(null) });
    window.__mini = { game, step, finish };   // lets the robot play-tester drive the game
    frameId = requestAnimationFrame(frame);
  });
}

// env: { ui, save, reward, name, look, text(sceneId) }
export async function playMiniGame(def, env) {
  const { ui, reward } = env;
  const start = await ui.card({
    kicker: 'Mini-game', title: reward.name, lines: env.text(def.intro),
    buttons: [{ id: 'play', label: 'Start', primary: true }, { id: 'back', label: 'Back' }],
  });
  if (start !== 'play') return;
  for (;;) {
    const result = await round(def, env);
    if (!result) return;
    const next = await ui.card({
      kicker: reward.name, ...result,
      buttons: [{ id: 'again', label: 'Play again', primary: true }, { id: 'back', label: 'Back to the device' }],
    });
    if (next !== 'again') return;
  }
}
