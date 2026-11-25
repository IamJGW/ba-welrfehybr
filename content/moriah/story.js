// God Will Provide (Genesis 22:1-19): God tests Abraham, the three-day journey,
// Isaac's question on the mountain, the angel stopping Abraham, and the ram in
// the thicket. A hard story: it has a note for parents (parent_note), shows the
// hardest moment only as words on a dark screen, and never shows Isaac on the
// altar. The words are in dialogue.csv.

import { ANIMAL_HEADROOM } from '../../src/art.js';
import { robe, discover, makeMap, patch } from '../../src/storykit.js';

export const id = 'moriah';
export const title = 'God Will Provide';
export const where = 'Beersheba, then a mountain in the land of Moriah';
export const ref = 'Genesis 22:1-19';
export const after = 'mamre';
export const place = [35.2, 31.76];   // Mount Moriah, later Jerusalem (2 Chronicles 3:1)

// ----------------------------------------------------------------------- map
// Beersheba first. After the journey the ground changes to the mountain: a
// path that zigzags up between rock ledges to the top.
//   #  cliff    s  desert rock    .  grass    ,  path    h  hillside

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
export const map = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (y === 20) return ',';
  return patch(x, y) ? '.' : 's';
});
const MOUNTAIN = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (y === 18 && (x < 31 || x > 33)) return '#';
  if (y === 10 && (x < 7 || x > 9)) return '#';
  if (y <= 9) return 's';
  return 'h';
});

export const start = [5, 20];
export const door = [3, 21];
export const barriers = [];

// -------------------------------------------------------------------- jobs

// Load the split wood onto the donkey (Genesis 22:3).
const wood = g => (g.state.wood ||= { holding: false, loaded: 0 });
function usePile(g) {
  const w = wood(g);
  if (g.stepId !== 'morning') return g.note(g.text('look_pile'));
  if (w.holding) return g.note(g.text('hands_full'));
  w.holding = true;
  g.hold('wood');
  g.note(g.text('take_wood'));
}
function useDonkey(g) {
  const w = wood(g);
  if (g.stepId !== 'morning') return g.note(g.text('look_donkey'));
  if (!w.holding) return g.note(g.text('donkey_empty'));
  w.holding = false;
  w.loaded++;
  g.hold(null);
  g.note(g.text('wood_loaded'));
  if (w.loaded >= 2) return g.signal('wood');
  g.goal('Load the split wood onto the donkey: 1 of 2', 'donkey');
}

// The ram caught in the thicket (Genesis 22:13).
function useRam(g) {
  if (g.stepId !== 'ram' || g.state.led) return;
  g.state.led = true;
  g.trail('ram', true);
  g.note(g.text('ram_follows'));
  g.goal('Bring the ram to Abraham.', 'abraham');
}
function useAbraham(g) {
  if (g.stepId === 'ram' && g.state.led) return g.signal('ram');
  if (g.stepId === 'ram') return g.say('abraham_ram');
  return g.say(g.state.provided ? 'abraham_after' : 'abraham_idle');
}
const useServant = g => (g.state.mountain ? discover('disc_return', 'reasoned')(g) : g.say('servant_ready'));
const useIsaac = g => (g.state.provided ? discover('disc_spare', 'spare')(g) : g.say('isaac_idle'));

// -------------------------------------------------------------------- people

const animal = (id, kind, at, over = {}) => ({ id, name: `a ${kind}`, at, solid: false, look: { kind }, headroom: ANIMAL_HEADROOM, ...over });

export const actors = [
  { id: 'abraham', name: 'Abraham', at: [9, 10], onUse: useAbraham, look: robe({ top: '#7d5a8a', sash: '#e3b93a', hair: '#e8e8e8', beard: '#e8e8e8', head: 'cloth', headColor: '#e8e0cc', item: 'staff' }) },
  { id: 'isaac', name: 'Isaac', at: [11, 10], scale: 0.88, onUse: useIsaac, look: robe({ top: '#c9a24a', sash: '#7a5a34', hair: '#3a2a1e' }) },
  { id: 'servant1', name: 'a servant', at: [16, 12], dir: 'left', onUse: useServant, look: robe({ top: '#9a7a5a', beard: true }) },
  { id: 'servant2', name: 'a servant', at: [22, 15], dir: 'left', chat: 'servant_idle', look: robe({ top: '#7f8f6a', skin: '#a06a42' }) },
  animal('donkey', 'donkey', [19, 17], { name: 'the donkey', label: 'load the donkey', onUse: useDonkey }),
  animal('ram', 'ram', [31, 5], { name: 'a ram', label: 'free the ram from the thicket', hidden: true, onUse: useRam }),
];

// -------------------------------------------------------------------- things

const BEERSHEBA = [
  { id: 'tent1', type: 'bigtent', x: 5, y: 6 }, { id: 'tent2', type: 'tent', x: 12, y: 5 },
  { id: 'tamarisk', type: 'tree', x: 23, y: 7, label: 'look at the tamarisk tree', onUse: discover('disc_tamarisk', 'tamarisk') },
  { id: 'well', type: 'well', x: 27, y: 12, label: 'look at the well', onUse: discover('disc_well', 'oath') },
  { id: 'pile', type: 'woodpile', x: 12, y: 15, label: 'pick up the split wood', onUse: usePile },
];
export const objects = BEERSHEBA;

const MORIAH = [
  { id: 'thicket', type: 'thicket', x: 30, y: 4 },
  { id: 'lookout', type: 'bigrock', x: 34, y: 7, label: 'look out from the mountain', onUse: discover('disc_moriah', 'moriah') },
  { id: 'r1', type: 'rock', x: 14, y: 22 }, { id: 'r2', type: 'rock', x: 25, y: 24 }, { id: 'r3', type: 'bigrock', x: 15, y: 13 },
  { id: 'r4', type: 'rock', x: 27, y: 15 }, { id: 'r5', type: 'rock', x: 13, y: 4 }, { id: 'b1', type: 'bush', x: 35, y: 21 },
];

// -------------------------------------------------------------------- scenes

const toMountain = g => {
  if (g.state.mountain) return;
  g.state.mountain = true;
  BEERSHEBA.forEach(o => g.removeProp(o.id));
  g.ground(MOUNTAIN, 0);
  MORIAH.forEach(o => g.addProp(o));
  g.place('servant1', 6, 22, 'right');
  g.place('servant2', 5, 24, 'right');
  g.place('donkey', 9, 23, 'left');
  g.place('abraham', 11, 21, 'right');
  g.place('isaac', 12, 22, 'right');
  g.setLook('isaac', { item: 'wood' });
  g.setChat('servant2', 'servant_wait');
};
const atTheTop = g => {
  if (g.state.top) return;
  g.state.top = true;
  toMountain(g);
  g.place('abraham', 22, 6, 'left');
  g.place('isaac', 19, 6, 'right');
};
const altarBuilt = g => {
  if (g.state.altar) return;
  g.state.altar = true;
  atTheTop(g);
  g.addProp({ id: 'altar', type: 'altar', x: 20, y: 4 });
  g.setLook('isaac', { item: null });
  g.place('abraham', 22, 5, 'left');
  g.place('isaac', 19, 6, 'right');
  g.show('ram');
  g.place('ram', 31, 5, 'left');
};
const provided = g => {
  if (g.state.provided) return;
  altarBuilt(g);
  g.state.provided = true;
  g.trail('ram', false);
  g.hide('ram');
  g.addProp({ id: 'fire', type: 'fire', x: 21, y: 3 });
};

export const steps = [
  {
    id: 'morning',
    async intro(g) {
      await g.wait(700);
      await g.say('arrive');
      await g.say('tested');
      g.award('tested');
    },
    goal: 'Load the split wood onto the donkey: 0 of 2', marker: 'donkey',
    trigger: { signal: 'wood' },
    async run(g) {
      await g.say('set_out');
      await g.fadeOut(900);
      await g.say('journey');
      toMountain(g);
      g.place('player', 13, 21, 'left');
      await g.fadeIn(900);
      await g.say('third_day');
      g.award('worship');
      g.walk('abraham', [[32, 21], [32, 15], [21, 15]], 75);
      g.walk('isaac', [[32, 22], [32, 16], [22, 16]], 75);
    },
  },
  {
    id: 'climb', spawn: [13, 21],
    enter(g) { toMountain(g); },
    begin(g) {
      if (g.actor('abraham').path.length) return;
      g.place('abraham', 21, 15, 'left');
      g.place('isaac', 22, 16, 'left');
    },
    goal: 'Follow Abraham and Isaac up the mountain.', marker: 'isaac',
    trigger: { zone: [17, 11, 30, 17] },
    async run(g) {
      g.place('abraham', 21, 15, 'left');
      g.place('isaac', 22, 16, 'left');
      g.face('abraham', 'right');
      await g.say('together');
      g.award('lamb');
      g.walk('abraham', [[8, 15], [8, 8], [22, 6]], 75);
      g.walk('isaac', [[8, 16], [8, 8], [19, 6]], 75);
    },
  },
  {
    id: 'summit', spawn: [20, 14],
    enter(g) { toMountain(g); },
    begin(g) { if (!g.actor('abraham').path.length) atTheTop(g); },
    goal: 'Climb to the top of the mountain.', marker: 'abraham',
    trigger: { zone: [2, 2, 37, 8] },
    async run(g) {
      atTheTop(g);
      await g.say('wait_here');
      await g.pan(20, 2, 900);
      await g.say('altar');
      await g.fadeOut(1200);
      altarBuilt(g);
      await g.say('knife');
      await g.say('angel');
      await g.fadeIn(1200);
      await g.follow(600);
      await g.say('safe');
    },
  },
  {
    id: 'ram', spawn: [18, 8],
    enter(g) { altarBuilt(g); },
    goal: 'Free the ram from the thicket.', marker: 'ram',
    trigger: { signal: 'ram' },
    async run(g) {
      g.trail('ram', false);
      await g.walk('ram', [[21, 5]], 120);
      await g.say('instead');
      g.award('ram');
      await g.fadeOut(600);
      provided(g);
      await g.fadeIn(600);
      await g.say('provide');
      g.award('provide');
      await g.say('second_time');
      g.award('blessed');
    },
  },
  {
    id: 'down', spawn: [18, 8],
    enter(g) { provided(g); },
    goal: 'Go back down the mountain to the servants.', marker: 'servant1',
    trigger: { zone: [2, 19, 14, 25] },
    async run(g) {
      // Abraham and Isaac come down behind the player.
      g.place('abraham', 12, 21, 'left');
      g.place('isaac', 11, 22, 'left');
      await g.say('back_down');
      await g.fadeOut(900);
    },
  },
];
