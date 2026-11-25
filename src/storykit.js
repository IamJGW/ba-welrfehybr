// Small helpers that story scripts share.

import { ANIMAL_HEADROOM } from './art.js';

export const GRAY = '#b9b9b9', WHITE = '#e8e8e8';

// The everyday look of the time: a tunic and sash. Pass what should differ.
export const robe = (over = {}) => ({
  kind: 'tunic', skin: '#c98f62', hair: '#2a211c', hairStyle: 'short', top: '#a9845a', sash: '#5d4526', ...over,
});
export const soldier = (over = {}) => robe({ beard: true, head: 'band', item: 'spear', ...over });

// Show a conversation, then award a badge.
export const discover = (scene, badge) => async g => { await g.say(scene); g.award(badge); };
// Just show a conversation.
export const tell = scene => g => g.say(scene);

// Build a map from a rule that says which tile goes at each spot.
export const makeMap = (tile, wide = 40, tall = 28) =>
  Array.from({ length: tall }, (_, y) => Array.from({ length: wide }, (_, x) => tile(x, y)).join(''));

// Uneven patches of grass on rocky ground, so they look natural rather than in rows.
export const patch = (x, y) => Math.sin(x * 0.9 + y * 0.4) + Math.cos(y * 0.8 - x * 0.35) > 1.15;

// ------------------------------------------------------------ small jobs
// Two jobs that stories use over and over. Each one needs a few one-line
// conversations in dialogue.csv, named after its prefix (tools/check_content.py checks them).

export const animal = (id, kind, at, over = {}) => ({ id, name: `a ${kind}`, at, solid: false, look: { kind }, headroom: ANIMAL_HEADROOM, ...over });
export const lady = (top, over = {}) => robe({ top, hairStyle: 'long', head: 'cloth', headColor: '#d9c9a3', ...over });

// Carry things from piles to one place. Use `take` on each pile and `give` on the place.
//   conversations: PREFIX_idle, PREFIX_hands, PREFIX_gone, PREFIX_take, PREFIX_empty, PREFIX_give
//   a pile may say what it is: { item: 'a sack of grain' } fills {item} in PREFIX_take
//   reuse: true lets every pile be taken from again and again
export function job(prefix, { step, total, goal, target, hold = 'bundle', reuse = false }) {
  const state = g => (g.state[prefix] ||= { holding: false, done: 0, taken: [] });
  const progress = g => g.goal(`${goal}: ${state(g).done} of ${total}`, target);
  return {
    take(g, pile) {
      const s = state(g);
      if (g.stepId !== step) return g.note(g.text(`${prefix}_idle`));
      if (s.holding) return g.note(g.text(`${prefix}_hands`));
      if (!reuse && s.taken.includes(pile.id)) return g.note(g.text(`${prefix}_gone`));
      s.holding = true;
      s.taken.push(pile.id);
      g.hold(pile.carry || hold);
      g.note(g.text(`${prefix}_take`, { item: pile.item || 'it' }));
    },
    give(g) {
      const s = state(g);
      if (g.stepId !== step) return g.note(g.text(`${prefix}_idle`));
      if (!s.holding) return g.note(g.text(`${prefix}_empty`));
      s.holding = false;
      s.done++;
      g.hold(null);
      g.note(g.text(`${prefix}_give`));
      if (s.done >= total) return g.signal(step);
      progress(g);
    },
  };
}
// The robot's list of things to use for a job: each pile, then the place.
export const trips = (piles, target) => piles.flatMap(p => [p, target]);

// Use things one at a time, and they are gone: pegs, sheaves, stones, jars.
//   conversations: PREFIX_idle, PREFIX_tap
//   keep: true leaves each thing where it is (it can still only count once)
export function taps(prefix, { step, total, goal, marker = null, keep = false }) {
  return (g, thing) => {
    const seen = (g.state[prefix] ||= { n: 0, ids: [] });
    if (g.stepId !== step) return g.note(g.text(`${prefix}_idle`));
    if (seen.ids.includes(thing.id)) return g.note(g.text(`${prefix}_tap`));
    seen.ids.push(thing.id);
    seen.n++;
    g.note(g.text(`${prefix}_tap`));
    g.shake(100, 0.002);
    if (!keep) g.removeProp(thing.id);
    if (seen.n >= total) return g.signal(step);
    g.goal(`${goal}: ${seen.n} of ${total}`, marker);
  };
}
