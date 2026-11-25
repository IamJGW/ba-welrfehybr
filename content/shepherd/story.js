// The Shepherd of Bethlehem (1 Samuel 16:1-13): where everything is, and what
// happens when. The words people say are in dialogue.csv.

import { ANIMAL_HEADROOM } from '../../src/art.js';

export const id = 'shepherd';
export const title = 'The Shepherd of Bethlehem';
export const where = 'Bethlehem, in the days of King Saul';
export const ref = '1 Samuel 16:1-13';
export const place = [35.202, 31.705];   // Bethlehem, as [longitude, latitude], for the map

// ----------------------------------------------------------------------- map
// 40 tiles wide, 28 tall. The pasture is on the west, a stream runs down the
// middle with a ford where the road crosses, and Bethlehem is on the east.
//   #  cliff    h  hillside    .  grass    ,  road    ~  stream    o  bank
//   :  the town's packed earth              b  barley fields

const tile = (x, y) => {
  if (x < 2 || x > 37 || y < 2 || y > 26) return '#';
  if (y <= 4) return 'h';
  if (y === 16 && x >= 12 && x <= 27) return ',';
  if (x === 20 || x === 21) return '~';
  if (x === 19 || x === 22) return 'o';
  if (x >= 24 && y >= 7 && y <= 23) return ':';
  if (x >= 24 && y >= 24) return 'b';
  return '.';
};
export const map = Array.from({ length: 28 }, (_, y) => Array.from({ length: 40 }, (_, x) => tile(x, y)).join(''));

export const start = [9, 18];
export const door = [2, 20];   // the time door, the way back to the time device

export const barriers = [
  // Nobody crosses to town until the strays are safe.
  { id: 'ford', tiles: [19, 2, 22, 26], bump: 'bump_ford' },
];

// -------------------------------------------------------------------- people

const robe = (over = {}) => ({
  kind: 'tunic', skin: '#c98f62', hair: '#2a211c', hairStyle: 'short', top: '#a9845a', sash: '#5d4526', ...over,
});
const GRAY = '#b9b9b9', WHITE = '#e8e8e8';

// Jesse's seven older sons, in birth order. Nethanel, Raddai and Ozem are
// named in 1 Chronicles 2:14-15; one brother is never named.
const SONS = [
  { id: 'eliab', name: 'Eliab', at: [27, 10], scale: 1.14, look: robe({ top: '#8f6f4e', beard: true }) },
  { id: 'abinadab', name: 'Abinadab', at: [27, 13], scale: 1.06, look: robe({ skin: '#a06a42', beard: true }) },
  { id: 'shammah', name: 'Shammah', at: [35, 13], look: robe({ top: '#b59a6e' }) },
  { id: 'nethanel', name: 'Nethanel', at: [33, 19], scale: 1.02, look: robe({ top: '#7f8f6a', beard: true }) },
  { id: 'raddai', name: 'Raddai', at: [28, 25], scale: 0.98, look: robe({ skin: '#e8b68c', top: '#9a7a5a' }) },
  { id: 'ozem', name: 'Ozem', at: [25, 9], scale: 0.96, look: robe({ top: '#b08a62', hairStyle: 'curly' }) },
  { id: 'brother7', name: 'the seventh brother', at: [34, 6], look: robe({ skin: '#a06a42', top: '#8a8a6a' }) },
];
const SON_IDS = SONS.map(s => s.id);
// Where each stands when they line up before Samuel.
const LINEUP = Object.fromEntries(SONS.map((s, i) => [s.id, [27 + i, 15]]));
const BEFORE_SAMUEL = [32, 13];
// Where the sheep stand inside the fold.
const PEN = [[10, 9], [11, 10], [10, 10]];

const discover = (scene, badge) => async g => { await g.say(scene); g.award(badge); };
const tell = scene => g => g.say(scene);
const baa = g => g.note('Baa.');

// A stray sheep follows whoever finds it, each behind the one before.
function useStray(g, sheep) {
  const chain = (g.state.chain ||= []);
  if (g.stepId !== 'strays' || chain.includes(sheep.id) || g.state.safe?.includes(sheep.id)) return baa(g);
  g.trail(sheep.id, chain.length ? chain[chain.length - 1] : true);
  chain.push(sheep.id);
  g.note(g.text('stray_found'));
}

// The gate of the fold lets in whatever sheep are following.
function useGate(g) {
  const chain = g.state.chain || [];
  if (g.stepId !== 'strays') return g.note(g.text('gate_idle'));
  if (!chain.length) return g.note(g.text('gate_none'));
  const safe = (g.state.safe ||= []);
  for (const sheep of chain) {
    g.trail(sheep, false);
    g.walk(sheep, [[10, 11], PEN[safe.length]], 120);
    safe.push(sheep);
  }
  g.state.chain = [];
  g.note(g.text('gate_in'));
  if (safe.length >= 3) g.signal('strays');
  else g.goal(`Find the stray sheep and bring them to the fold: ${safe.length} of 3 safe`, 'foldgate');
}

// Calling Jesse's sons to the sacrifice. Before that, they are busy.
const useSon = son => async g => {
  const called = (g.state.called ||= []);
  if (called.includes(son.id)) return g.say('son_waiting');
  if (g.stepId !== 'sons') return g.say('son_busy');
  called.push(son.id);
  await g.say(`son_${son.id}`);
  g.walk(son.id, [LINEUP[son.id]], 160).then(() => g.face(son.id, 'up'));
  if (called.length >= SONS.length) g.signal('sons');
  else g.goal(`Call Jesse's seven sons to the sacrifice: ${called.length} of 7`);
};

const useHungry = g => g.say(['send', 'fetch', 'bring'].includes(g.stepId) ? 'hungry_waiting' : 'hungry');

export const actors = [
  {
    id: 'david', name: 'David', at: [11, 13], scale: 0.92, chat: 'david_idle',
    look: robe({ hair: '#7a3b22', hairStyle: 'curly', top: '#e3d6b0', sash: '#8a5a2b', item: 'staff' }),
  },
  {
    id: 'keeper', name: 'the keeper', at: [14, 12], dir: 'left', chat: 'keeper_idle',
    look: robe({ top: '#8f7a5c', hair: GRAY, beard: GRAY, head: 'cloth', headColor: '#c9b48a', item: 'staff' }),
  },
  {
    id: 'samuel', name: 'Samuel', at: [12, 16], dir: 'right', hidden: true, chat: 'samuel_idle',
    look: robe({ top: '#6f7f9a', sash: '#3d4a63', hair: WHITE, beard: WHITE, hairStyle: 'long', item: 'horn' }),
  },
  {
    id: 'heifer', name: 'the heifer', label: 'look at the heifer', at: [11, 16], dir: 'right', scale: 1.5, hidden: true, solid: false,
    look: { kind: 'calf' }, headroom: ANIMAL_HEADROOM, onUse: discover('disc_heifer', 'heifer'),
  },
  {
    id: 'jesse', name: 'Jesse', at: [29, 10], onUse: discover('disc_eight', 'eight'),
    look: robe({ top: '#7d6a55', sash: '#3a2f25', hair: GRAY, beard: GRAY, head: 'band', headColor: '#5d4526' }),
  },
  ...['elder1', 'elder2'].map((n, i) => ({
    id: n, name: 'an elder', at: [25, 15 + i * 2], dir: 'left', chat: 'elder_idle',
    look: robe({ top: '#9a9a8a', hair: GRAY, beard: GRAY, head: 'cloth', headColor: '#e9e2cf' }),
  })),
  ...SONS.map(son => ({ ...son, onUse: useSon(son) })),
  {
    id: 'neighbor', name: 'a neighbor', at: [29, 20], onUse: discover('disc_taller', 'taller'),
    look: robe({ top: '#a85a4a', hairStyle: 'long', head: 'cloth', headColor: '#d9c9a3' }),
  },
  { id: 'hungry', name: 'a townsman', at: [34, 16], dir: 'right', look: robe({ top: '#8a7a9a', beard: true }), onUse: useHungry },

  // The flock. Three have wandered.
  ...[[9, 9], [11, 9], [9, 10]].map((at, i) => ({
    id: `ewe${i}`, name: 'a sheep', label: 'pat the sheep', at, scale: 1.25, solid: false, look: { kind: 'lamb' }, headroom: ANIMAL_HEADROOM, onUse: baa,
  })),
  ...[[4, 8], [16, 21], [5, 23]].map((at, i) => ({
    id: `stray${i}`, name: 'a stray sheep', label: 'call the sheep', at, scale: 1.25, solid: false, look: { kind: 'lamb' }, headroom: ANIMAL_HEADROOM, onUse: useStray,
  })),
];

// -------------------------------------------------------------------- things

const fold = [
  ...[8, 9, 10, 11, 12].map(x => ({ type: 'foldwall', x, y: 8 })),
  ...[9, 10].flatMap(y => [{ type: 'foldwall', x: 8, y }, { type: 'foldwall', x: 12, y }]),
  ...[8, 9, 11, 12].map(x => ({ type: 'foldwall', x, y: 11 })),
  { id: 'foldgate', type: 'foldgate', x: 10, y: 11, label: 'open the gate', onUse: useGate },
];

export const objects = [
  // The pasture
  ...fold,
  { id: 'lionrock', type: 'bigrock', x: 3, y: 6, reach: 60, label: 'look at the scratched rock', onUse: discover('disc_lion', 'lion') },
  { type: 'harp', x: 15, y: 10, label: 'look at the harp', onUse: discover('disc_psalm', 'psalm') },
  { type: 'bush', x: 5, y: 8 }, { type: 'bush', x: 17, y: 21 }, { type: 'bush', x: 6, y: 23 }, { type: 'bush', x: 16, y: 6 },
  { type: 'tree', x: 2, y: 12 }, { type: 'tree', x: 7, y: 20 }, { type: 'tree', x: 13, y: 24 }, { type: 'tree', x: 17, y: 12 },
  { type: 'rock', x: 12, y: 5 }, { type: 'rock', x: 3, y: 18 }, { type: 'rock', x: 15, y: 15 },

  // Bethlehem
  { type: 'gatepost', x: 24, y: 15 }, { type: 'gatepost', x: 24, y: 17 },
  { type: 'well', x: 26, y: 13, label: 'look down the well', onUse: discover('disc_well', 'well') },
  { type: 'house', x: 28, y: 9, reach: 60, label: "look at Jesse's house", onUse: tell('look_house') },
  { type: 'house', x: 34, y: 9 }, { type: 'house', x: 25, y: 21 }, { type: 'house', x: 30, y: 22 }, { type: 'house', x: 35, y: 21 },
  { type: 'woodpile', x: 26, y: 10 },
  { type: 'altar', x: 31, y: 11 },
  { type: 'oven', x: 36, y: 12, label: 'smell the bread', onUse: tell('look_oven') },
  { type: 'table', x: 35, y: 15 },
  { type: 'jars', x: 34, y: 19 },
  { type: 'tree', x: 36, y: 6 }, { type: 'tree', x: 24, y: 6 },
  { type: 'sheaves', x: 31, y: 25, label: 'look at the barley', onUse: discover('disc_ruth', 'ruth') },
  { type: 'sheaves', x: 35, y: 25 }, { type: 'sheaves', x: 26, y: 26 },
];

// -------------------------------------------------------------------- scenes

// Samuel has come and set his things down by the altar.
function samuelInTown(g) {
  g.show('samuel'); g.show('heifer');
  g.trail('heifer', false);
  g.place('samuel', 32, 12, 'down');
  g.place('heifer', 30, 12, 'right');
  g.place('elder1', 26, 17, 'up'); g.place('elder2', 36, 17, 'up');
  if (!g.state.hornbag) {
    g.state.hornbag = true;
    g.addProp({ id: 'hornbag', type: 'hornbag', x: 33, y: 11, label: "look at Samuel's things", onUse: discover('disc_horn', 'horn') });
  }
}
const lineUp = g => {
  g.state.called = SON_IDS.slice();
  SON_IDS.forEach(n => g.place(n, ...LINEUP[n], 'up'));
  g.place('jesse', 35, 13, 'left');
};

// One son steps up before Samuel, waits, and steps back.
async function pass(g, son, pause = 500) {
  await g.walk(son, [BEFORE_SAMUEL], 170);
  g.face(son, 'up');
  await g.wait(pause);
}
const stepBack = (g, son) => g.walk(son, [LINEUP[son]], 170).then(() => g.face(son, 'up'));

export const steps = [
  {
    id: 'meet',
    goal: 'Talk to the shepherd boy.', marker: 'david',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'david' },
    async run(g) { await g.say('meet'); },
  },
  {
    id: 'strays', spawn: [10, 15],
    goal: 'Find the stray sheep and bring them to the fold: 0 of 3 safe',
    trigger: { signal: 'strays' },
    async run(g) {
      g.award('sheep');
      await g.say('strays_done');
    },
  },
  {
    id: 'gate', spawn: [11, 14],
    goal: 'Cross the ford and go to the town gate.', marker: 'elder1',
    enter(g) {
      g.barrier('ford', false);
      g.state.safe = ['stray0', 'stray1', 'stray2'];
      g.state.safe.forEach((n, i) => { g.trail(n, false); g.place(n, ...PEN[i]); });
    },
    trigger: { zone: [23, 14, 24, 18] },
    async run(g) {
      // Samuel comes up the road behind the player, leading a heifer.
      g.show('samuel'); g.show('heifer');
      g.place('samuel', 14, 16, 'right'); g.place('heifer', 12, 16, 'right');
      g.trail('heifer', 'samuel');
      await g.pan(22, 16, 700);
      await g.walk('samuel', [[21, 16]], 110);
      for (const elder of ['elder1', 'elder2']) {
        g.tween({ targets: g.actor(elder).sprite, angle: { from: -4, to: 4 }, duration: 70, yoyo: true, repeat: 7 }).then(() => g.actor(elder).sprite.setAngle(0));
      }
      await g.say('gate');
      g.award('peace');
      g.walk('elder1', [[26, 16], [26, 17]], 150); g.walk('elder2', [[25, 16], [36, 16], [36, 17]], 150);
      await g.walk('samuel', [[32, 16], [32, 12]], 150);
      await g.follow(600);
    },
  },
  {
    id: 'jesse', spawn: [26, 16],
    goal: 'Talk to Jesse.', marker: 'jesse',
    enter(g) { samuelInTown(g); },
    trigger: { talk: 'jesse' },
    async run(g) { await g.say('jesse_ask'); },
  },
  {
    id: 'sons', spawn: [29, 12],
    goal: "Call Jesse's seven sons to the sacrifice: 0 of 7",
    trigger: { signal: 'sons' },
    // Wait until the last of them has taken his place.
    async run(g) {
      const jesse = g.walk('jesse', [[35, 12], [35, 13]], 140);
      await Promise.all([jesse, ...SON_IDS.map(n => g.arrive(n))]);
      g.face('jesse', 'left');
    },
  },
  {
    id: 'choose', spawn: [30, 16],
    goal: 'Who looks like a king to you? Stand by one of the brothers and press Space.',
    enter(g) { lineUp(g); g.place('david', 6, 6, 'down'); },
    trigger: { choose: SON_IDS },
    async run(g, pick) {
      const who = SONS.find(s => s.id === pick).name;
      const picked = who[0].toUpperCase() + who.slice(1);
      await g.say('picked', { pick: who });

      await pass(g, 'eliab', 300);
      await g.say('lineup');
      if (pick === 'eliab') g.note(g.text('not_pick', { pick: picked }));
      stepBack(g, 'eliab');
      await pass(g, 'abinadab', 300);
      await g.say('lineup_next');
      if (pick === 'abinadab') g.note(g.text('not_pick', { pick: picked }));
      stepBack(g, 'abinadab');
      for (const son of SON_IDS.slice(2)) {
        await pass(g, son);
        if (pick === son) g.note(g.text('not_pick', { pick: picked }));
        stepBack(g, son);
      }
      await g.wait(500);
      await g.say('lineup_all');
      g.award('heart');
    },
  },
  {
    id: 'send', spawn: [30, 16],
    enter(g) { lineUp(g); g.place('david', 6, 6, 'down'); },
    async run(g) {
      g.face('jesse', 'left');
      await g.say('send');
      g.award('youngest');
    },
  },
  {
    id: 'fetch', spawn: [30, 16],
    goal: 'Run to the pasture and fetch David!', marker: 'david',
    enter(g) { lineUp(g); g.place('david', 6, 6, 'down'); g.hurry(true); },
    trigger: { talk: 'david' },
    async run(g) {
      await g.say('fetch');
      g.trail('david');
    },
  },
  {
    id: 'bring', spawn: [7, 7],
    goal: 'Bring David to Samuel.', marker: 'samuel',
    enter(g) { g.trail('david'); g.hurry(true); },
    trigger: { zone: [27, 12, 35, 17] },
    async run(g) {
      g.hurry(false);
      g.trail('david', false);
      await g.walk('david', [BEFORE_SAMUEL], 150);
      g.face('david', 'up');
      await g.say('anoint_word');
      const david = g.actor('david');
      const glow = g.fx('glow', david.x, david.y - 30).setAlpha(0).setScale(0.6);
      await g.tween({ targets: glow, alpha: 1, scale: 1.4, duration: 900 });
      await g.say('anoint');
      await g.tween({ targets: glow, alpha: 0, duration: 900 });
      glow.destroy();
      g.award('anointed');
      await g.walk('david', [[32, 14], [32, 17], [31, 17]], 130);
      g.face('david', 'down');
    },
  },
  {
    id: 'farewell', spawn: [29, 17],
    goal: 'Talk to David when you are ready to go.', marker: 'david',
    enter(g) {
      g.hurry(false);
      g.trail('david', false);
      g.place('david', 31, 17, 'down');
      g.hide('samuel');
    },
    // Samuel leaves for Ramah as the step begins.
    async intro(g) {
      g.show('samuel');
      g.place('samuel', 32, 12, 'down');
      g.walk('samuel', [[33, 13], [33, 16], [23, 16]], 130).then(() => g.hide('samuel'));
      await g.say('samuel_leaves');
    },
    trigger: { talk: 'david' },
    async run(g) {
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
