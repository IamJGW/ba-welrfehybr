// Jacob's Ladder (Genesis 25:27-34; 27; 28:10-22): the stew and the birthright,
// the stolen blessing, Esau's anger, Jacob running away, and his dream of the
// stairway to heaven at Bethel. The words are in dialogue.csv.

import { ANIMAL_HEADROOM } from '../../src/art.js';
import { robe, discover, makeMap, patch } from '../../src/storykit.js';

export const id = 'bethel';
export const title = "Jacob's Ladder";
export const where = 'Beersheba, then Bethel';
export const ref = 'Genesis 25:27-34; 27; 28:10-22';
export const after = 'rebekah';
export const place = [34.8, 31.24];   // Beersheba, where the story starts

// ----------------------------------------------------------------------- map
// Isaac's camp at Beersheba first. Later the ground changes to the stony
// hilltop at Bethel.
//   #  cliff    .  grass    s  desert rock    ,  path

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
export const map = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (y === 20) return ',';
  return x >= 26 || patch(x, y) ? '.' : 's';
});
const HILLTOP = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (y === 20 || x === 20 && y >= 15) return ',';
  return patch(x + 9, y + 4) ? '.' : 's';
});

export const start = [5, 20];
export const door = [3, 21];
export const barriers = [];

// -------------------------------------------------------------------- jobs

// A stone for a pillow (Genesis 28:11). Only one of them will do.
const STONES = [
  { id: 'stoneA', type: 'bigrock', x: 9, y: 9, say: 'stone_heavy' },
  { id: 'stoneB', type: 'rock', x: 27, y: 9, say: 'stone_sharp' },
  { id: 'stoneC', type: 'rock', x: 30, y: 17, say: 'stone_good' },
];
function useStone(g, rock) {
  if (g.stepId !== 'stone') return g.note(g.text('look_stone'));
  const kind = STONES.find(s => s.id === rock.id);
  if (kind.say !== 'stone_good') return g.note(g.text(kind.say), 2600);
  if (g.state.holding) return;
  g.state.holding = true;
  g.removeProp(rock.id);
  g.hold('stone');
  g.note(g.text('stone_good'), 2600);
  g.goal('Bring the stone to Jacob.', 'jacob');
}
// The oil for the pillar (Genesis 28:18).
function usePack(g) {
  if (g.stepId !== 'pillar') return g.note(g.text('look_pack'));
  if (g.state.oil) return;
  g.state.oil = true;
  g.hold('horn');
  g.note(g.text('take_oil'));
  g.goal('Take the oil to Jacob, by his stone.', 'jacob');
}
function useJacob(g) {
  if (g.stepId === 'stone' && g.state.holding) return g.signal('stone');
  if (g.stepId === 'pillar' && g.state.oil) return g.signal('oil');
  return g.say(g.state.bethel ? 'jacob_night' : 'jacob_idle');
}

// -------------------------------------------------------------------- people

const lady = (top, over = {}) => robe({ top, hairStyle: 'long', head: 'cloth', headColor: '#d9c9a3', ...over });
const animal = (id, kind, at, over = {}) => ({ id, name: `a ${kind}`, at, solid: false, look: { kind }, headroom: ANIMAL_HEADROOM, ...over });
const ESAU = robe({ top: '#8a5a32', skin: '#b5764a', hair: '#a8402c', beard: '#a8402c', hairStyle: 'curly', item: 'bow' });

export const actors = [
  { id: 'jacob', name: 'Jacob', at: [11, 13], dir: 'left', onUse: useJacob, look: robe({ top: '#3d6fb5', sash: '#e3b93a', beard: true }) },
  { id: 'esau', name: 'Esau', at: [37, 15], hidden: true, chat: 'esau_idle', look: ESAU },
  { id: 'isaac', name: 'Isaac', at: [17, 10], chat: 'isaac_idle', look: robe({ top: '#c9a24a', sash: '#7a5a34', hair: '#e8e8e8', beard: '#e8e8e8', item: 'staff' }) },
  { id: 'rebekah', name: 'Rebekah', at: [7, 11], dir: 'right', onUse: g => (g.stepId === 'stew' ? discover('disc_twonations', 'twonations')(g) : g.say('rebekah_idle')), look: lady('#c9503a', { hair: '#7a6a5a', headColor: '#e8d8a8' }) },
  { id: 'nurse', name: 'an old servant', at: [24, 8], dir: 'left', onUse: discover('disc_twins', 'twins'), look: robe({ top: '#a9845a', hair: '#e8e8e8', beard: '#e8e8e8' }) },
  { id: 'goatherd', name: 'the goatherd', at: [29, 16], dir: 'left', onUse: g => (g.stepId === 'stew' ? g.say('goatherd_idle') : discover('disc_reap', 'reap')(g)), look: robe({ top: '#7f8f6a', skin: '#a06a42', item: 'staff' }) },
  animal('goat1', 'goat', [31, 15]), animal('goat2', 'goat', [32, 17]), animal('goat3', 'goat', [30, 18]),
];

// -------------------------------------------------------------------- things

const CAMP = [
  { id: 'isaactent', type: 'bigtent', x: 16, y: 7 }, { id: 'rebekahtent', type: 'tent', x: 5, y: 7 },
  { id: 'tamarisk', type: 'tree', x: 23, y: 4 }, { id: 'well', type: 'well', x: 13, y: 4 },
  { id: 'stew', type: 'stew', x: 10, y: 13 },
];
export const objects = CAMP;
const BETHEL = [
  ...STONES.map(s => ({ id: s.id, type: s.type, x: s.x, y: s.y, label: 'look at the stone', onUse: useStone })),
  { id: 'sky', type: 'flatstones', x: 33, y: 6, label: 'look up at the sky', onUse: discover('disc_slumber', 'slumber') },
  { id: 'luz1', type: 'house', x: 30, y: 2 }, { id: 'luz2', type: 'house', x: 34, y: 3 },
  { id: 'tree1', type: 'tree', x: 5, y: 15 }, { id: 'rock1', type: 'rock', x: 14, y: 22 }, { id: 'rock2', type: 'bigrock', x: 25, y: 23 },
];

// -------------------------------------------------------------------- scenes

const SLEEP = [18, 13];
const yearsLater = g => {
  if (g.state.years) return;
  g.state.years = true;
  g.removeProp('stew');
  g.hide('esau');
  g.place('jacob', 10, 12, 'right');
  g.place('rebekah', 12, 11, 'left');
  g.place('isaac', 17, 10, 'down');
};
const blessed = g => {
  if (g.state.blessed) return;
  yearsLater(g);
  g.state.blessed = true;
  g.place('jacob', 12, 13, 'left');
  g.place('rebekah', 10, 12, 'right');
  g.show('esau');
  g.place('esau', 19, 11, 'left');
  g.setChat('esau', 'esau_angry');
};
const atBethel = g => {
  if (g.state.bethel) return;
  blessed(g);
  g.state.bethel = true;
  CAMP.forEach(o => g.removeProp(o.id));
  g.ground(HILLTOP, 0);
  BETHEL.forEach(o => g.addProp(o));
  for (const id of ['esau', 'isaac', 'rebekah', 'nurse', 'goatherd', 'goat1', 'goat2', 'goat3']) g.hide(id);
  g.place('jacob', ...SLEEP, 'down');
  g.addProp({ id: 'pack', type: 'hornbag', x: 21, y: 15, label: "look in Jacob's pack", onUse: usePack });
  g.sky({ night: true, stars: true });
};
const morning = g => {
  if (g.state.morning) return;
  atBethel(g);
  g.state.morning = true;
  g.sky();
  g.removeProp('stoneC');
  g.addProp({ id: 'pillar', type: 'pillar', x: 18, y: 12 });
  g.place('jacob', 19, 13, 'left');
};

export const steps = [
  {
    id: 'stew',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    goal: 'Talk to Jacob, at the cooking fire.', marker: 'jacob',
    trigger: { talk: 'jacob' },
    async run(g) {
      await g.say('cooking');
      g.show('esau');
      g.place('esau', 37, 15, 'left');
      await g.walk('esau', [[20, 15], [12, 14]], 170);
      await g.say('stew');
      g.award('birthright');
      await g.say('years');
      await g.fadeOut(900);
      yearsLater(g);
      g.place('player', 13, 16, 'up');
      await g.fadeIn(900);
      await g.say('old_isaac');
    },
  },
  {
    id: 'tent', spawn: [13, 16],
    enter(g) { yearsLater(g); },
    goal: "Something is going on. Go closer to Isaac's tent.", marker: 'isaac',
    trigger: { zone: [14, 11, 21, 13] },
    async run(g) {
      g.face('player', 'up');
      await g.say('plan');
      await g.walk('jacob', [[13, 12], [16, 11]], 80);
      g.face('jacob', 'right');
      await g.say('deceive');
      g.award('voice');
      await g.say('blessing');
      await g.walk('jacob', [[13, 12], [12, 13]], 120);
      blessed(g);
      g.place('esau', 37, 12, 'left');
      await g.walk('esau', [[19, 11]], 170);
    },
  },
  {
    id: 'esau', spawn: [16, 14],
    enter(g) { blessed(g); },
    goal: 'Esau is back from hunting. Go and see.', marker: 'esau',
    trigger: { talk: 'esau' },
    async run(g) {
      await g.say('esau_back');
      g.award('bitter');
      await g.say('grudge');
    },
  },
  {
    id: 'flee', spawn: [16, 14],
    enter(g) { blessed(g); },
    goal: 'Talk to Rebekah.', marker: 'rebekah',
    trigger: { talk: 'rebekah' },
    async run(g) {
      await g.say('flee');
      await g.fadeOut(900);
      await g.say('journey');
      atBethel(g);
      g.place('player', 20, 18, 'up');
      await g.fadeIn(900);
      await g.say('sunset');
    },
  },
  {
    id: 'stone', spawn: [20, 18],
    enter(g) { atBethel(g); },
    goal: 'Find a smooth stone for Jacob to rest his head on.', marker: 'jacob',
    trigger: { signal: 'stone' },
    async run(g) {
      g.hold(null);
      await g.say('pillow');
      // The dream: a stairway from the ground beside Jacob up into the sky.
      const [jx, jy] = SLEEP;
      await g.pan(jx, jy - 5, 900);
      const stair = g.fx('stairway', jx * g.T + 16, jy * g.T - 200).setAlpha(0);
      await g.tween({ targets: stair, alpha: 1, duration: 1600 });
      const angels = [0, 1, 2, 3].map(i => {
        const a = g.fx('glow', jx * g.T + 16 + (i % 2 ? 14 : -14), jy * g.T - (i * 90)).setScale(0.35);
        g.tween({ targets: a, y: (jy - 12) * g.T + (i % 2 ? 0 : 260), duration: 2600 + i * 300, yoyo: true, repeat: -1 });
        return a;
      });
      const top = g.fx('glow', jx * g.T + 16, (jy - 13) * g.T).setScale(2.4).setAlpha(0);
      await g.say('dream');
      g.award('ladder');
      await g.tween({ targets: top, alpha: 1, duration: 1200 });
      await g.say('the_lord');
      g.award('withyou');
      await g.say('son_of_man');
      // The angels' tweens repeat for ever, so the pictures are faded out and left, not destroyed.
      for (const a of [stair, top, ...angels]) g.tween({ targets: a, alpha: 0, duration: 1200 });
      await g.wait(1300);
      await g.follow(600);
      await g.say('woke');
      g.award('inthisplace');
      await g.fadeOut(900);
      morning(g);
      await g.fadeIn(900);
      await g.say('dawn');
    },
  },
  {
    id: 'pillar', spawn: [20, 17],
    enter(g) { morning(g); },
    goal: "Fetch the oil from Jacob's pack.", marker: 'pack',
    trigger: { signal: 'oil' },
    async run(g) {
      g.hold(null);
      g.removeProp('pillar');
      g.addProp({ id: 'pillar2', type: 'pillarOil', x: 18, y: 12 });
      await g.say('bethel');
      g.award('bethel');
      await g.say('vow');
      g.walk('jacob', [[20, 13], [20, 3]], 90).then(() => g.hide('jacob'));
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
