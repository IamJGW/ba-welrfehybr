// The Tower of Babel (Genesis 11:1-9): making bricks for the tower, the LORD
// coming down, the confusion of languages and the scattering. The words are in
// dialogue.csv.

import { robe, discover, makeMap } from '../../src/storykit.js';

export const id = 'babel';
export const title = 'The Tower of Babel';
export const where = 'The plain of Shinar';
export const ref = 'Genesis 11:1-9';
export const after = 'rainbow';
export const place = [44.42, 32.54];   // Babylon, on the plain of Shinar

// ----------------------------------------------------------------------- map
//   #  cliff    k  clay and brick ground    ,  road    .  grass

export const map = makeMap((x, y) => {
  if (x < 2 || x > 37 || y < 2 || y > 26) return '#';
  if (y === 20 || x === 20 && y >= 13) return ',';
  if (x <= 6 || x >= 33 || y >= 24) return '.';
  return 'k';
});

export const start = [10, 22];
export const door = [3, 23];
export const barriers = [];

// -------------------------------------------------------------------- making bricks

// Dig clay, bake it in the kiln, stack it on the tower (Genesis 11:3).
const brick = g => (g.state.brick ||= { holding: null, stacked: 0 });
function useClay(g) {
  const b = brick(g);
  if (g.stepId !== 'bricks') return g.note(g.text('look_clay'));
  if (b.holding) return g.note(g.text('hands_full'));
  b.holding = 'clay';
  g.hold('clay');
  g.note(g.text('clay_take'));
}
async function useKiln(g) {
  const b = brick(g);
  if (g.stepId !== 'bricks' || b.holding !== 'clay') return g.note(g.text(b.holding === 'brick' ? 'kiln_done' : 'look_kiln'));
  g.note(g.text('kiln_bake'));
  await g.wait(900);
  b.holding = 'brick';
  g.hold('brick');
  g.note(g.text('kiln_ready'));
}
function useStack(g) {
  const b = brick(g);
  if (g.stepId !== 'bricks') return g.note(g.text('look_stack'));
  if (b.holding !== 'brick') return g.note(g.text(b.holding === 'clay' ? 'stack_clay' : 'stack_empty'));
  b.holding = null;
  b.stacked++;
  g.hold(null);
  g.note(g.text('stack_set'));
  if (b.stacked >= 3) return g.signal('bricks');
  g.goal(`Make bricks and bring them to the tower: ${b.stacked} of 3`, 'stack');
}

// After the LORD confuses their language, nobody can understand anybody.
const BUILDERS = ['builder1', 'builder2', 'builder3'];
const heard = g => (g.state.heard ||= []);
const useBuilder = n => async g => {
  if (g.stepId !== 'confused') return g.say(`builder_${n}`);
  await g.say(`babble_${n}`);
  if (!heard(g).includes(n)) heard(g).push(n);
  if (heard(g).length >= BUILDERS.length) return g.signal('confused');
  g.goal(`Talk to the builders: ${heard(g).length} of 3`);
};

// -------------------------------------------------------------------- people

export const actors = [
  { id: 'foreman', name: 'the foreman', at: [20, 14], chat: 'foreman_idle', look: robe({ top: '#8a3a3a', sash: '#e3b93a', beard: true, head: 'band', headColor: '#e3b93a' }) },
  { id: 'builder1', name: 'a builder', at: [13, 13], dir: 'right', onUse: useBuilder(1), look: robe({ top: '#a9845a', beard: true }) },
  { id: 'builder2', name: 'a builder', at: [27, 12], dir: 'left', onUse: useBuilder(2), look: robe({ top: '#7f8f6a', skin: '#a06a42' }) },
  { id: 'builder3', name: 'a builder', at: [25, 17], dir: 'left', onUse: useBuilder(3), look: robe({ top: '#9a7a5a', hairStyle: 'long', head: 'cloth', headColor: '#d9c9a3' }) },
  { id: 'oldman', name: 'an old man', at: [5, 9], dir: 'right', onUse: discover('disc_nations', 'nations'), look: robe({ top: '#8f7a5c', hair: '#e8e8e8', beard: '#e8e8e8', item: 'staff' }) },
  { id: 'climber', name: 'a builder on the scaffold', at: [26, 8], dir: 'left', onUse: discover('disc_proud', 'proud'), look: robe({ top: '#b08a62' }) },
  { id: 'crier', name: 'a town crier', at: [9, 18], onUse: discover('disc_plans', 'plans'), look: robe({ top: '#3d6fb5', sash: '#e3b93a' }) },
];

// -------------------------------------------------------------------- things

export const objects = [
  { id: 'tower', type: 'tower', x: 17, y: 11 },
  { id: 'stack', type: 'bricks', x: 23, y: 11, label: 'stack your brick on the tower', onUse: useStack },
  { id: 'claypit', type: 'claypit', x: 7, y: 21, label: 'dig some clay', onUse: useClay },
  { id: 'kiln', type: 'kiln', x: 12, y: 16, label: 'bake it in the kiln', onUse: useKiln },
  { type: 'tarpit', x: 29, y: 22, label: 'look at the tar', onUse: discover('disc_tar', 'tar') },
  { type: 'gatepost', x: 4, y: 19, label: 'read the gatepost', onUse: discover('disc_shinar', 'shinar') },
  { type: 'bricks', x: 15, y: 17 }, { type: 'bricks', x: 26, y: 14 }, { type: 'bricks', x: 10, y: 11 },
  { type: 'house', x: 3, y: 6 }, { type: 'house', x: 9, y: 4 }, { type: 'house', x: 29, y: 4 }, { type: 'house', x: 34, y: 9 },
  { type: 'house', x: 33, y: 16 }, { type: 'house', x: 14, y: 23 }, { type: 'house', x: 25, y: 24 },
  { type: 'palm', x: 36, y: 22 }, { type: 'palm', x: 3, y: 12 },
];

// -------------------------------------------------------------------- scenes

// Where everyone goes when they are scattered: off along the roads and edges.
const SCATTER = { foreman: [[20, 20], [37, 20]], builder1: [[13, 20], [2, 20]], builder2: [[27, 20], [37, 26]], builder3: [[20, 24], [20, 26]], climber: [[31, 6], [37, 3]], crier: [[9, 20], [2, 24]] };
const scatter = (g, now) => Object.entries(SCATTER).forEach(([id, path]) => {
  if (now) return g.hide(id);
  g.walk(id, path, 110).then(() => g.hide(id));
});

export const steps = [
  {
    id: 'arrive',
    goal: 'Talk to the foreman by the tower.', marker: 'foreman',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'foreman' },
    async run(g) {
      await g.say('foreman');
      g.award('bricks');
    },
  },
  {
    id: 'bricks', spawn: [20, 16],
    goal: 'Make bricks and bring them to the tower: 0 of 3', marker: 'claypit',
    trigger: { signal: 'bricks' },
    async run(g) {
      await g.say('name');
      g.award('name');
      // The LORD comes down.
      await g.pan(20, 6, 900);
      const light = g.fx('glow', 20 * g.T, -2 * g.T).setScale(3).setAlpha(0);
      await g.tween({ targets: light, y: 5 * g.T, alpha: 1, duration: 1600 });
      await g.say('came_down');
      g.award('down');
      await g.tween({ targets: light, alpha: 0, duration: 1000 });
      light.destroy();
      g.shake(600, 0.005);
      await g.follow(600);
    },
  },
  {
    id: 'confused', spawn: [20, 16],
    goal: 'Talk to the builders: 0 of 3',
    trigger: { signal: 'confused' },
    async run(g) {
      await g.say('scattered');
      g.award('scattered');
      scatter(g);
      await g.wait(1500);
      await g.say('babel');
      g.award('babel');
    },
  },
  {
    id: 'farewell', spawn: [20, 16],
    enter(g) { scatter(g, true); },
    goal: 'The city is empty. Walk to the road and look back at the tower.',
    trigger: { zone: [3, 19, 37, 21] },
    async run(g) {
      g.face('player', 'up');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
