// The Baby in the Basket (Exodus 1:8-2:10): the Israelites are slaves in Egypt,
// a mother hides her baby for three months and then sets him in the reeds, and
// Pharaoh's daughter finds him. The words are in dialogue.csv.

import { robe, lady, discover, makeMap, taps } from '../../src/storykit.js';

export const id = 'basket';
export const title = 'The Baby in the Basket';
export const where = 'Goshen, and the banks of the Nile';
export const ref = 'Exodus 1:8-2:10';
export const place = [31.85, 30.8];   // Rameses
export const after = null;

// ----------------------------------------------------------------------- map
//   .  grass    ,  path    ~  the Nile, shallow    S  the Nile, deep    p  paving    n  black soil

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 25;
export const map = makeMap((x, y) => {
  if (edge(x, y)) return 'S';
  if (x >= 28) return 'S';
  if (x >= 23) return '~';
  if (x >= 18 && y <= 7) return 'p';
  if (y === 15 && x < 23 || x === 10 && y >= 8 && y <= 15) return ',';
  if (x >= 19 && x < 23) return 'n';
  return '.';
});

export const start = [5, 20];
export const door = [3, 21];
export const barriers = [];

// -------------------------------------------------------------------- the reeds

const gather = taps('reeds', { step: 'reeds', total: 3, goal: 'Gather papyrus reeds' });
const REEDS = [[19, 10], [20, 18], [19, 22]].map(([x, y], i) => ({ id: `reed${i + 1}`, type: 'papyrus', x, y, label: 'gather the reeds', onUse: gather }));

// -------------------------------------------------------------------- people

const SKIN = '#b07848';
const egyptian = (over = {}) => robe({ skin: SKIN, top: '#f2efe6', sash: '#4a7ab0', hair: '#1f1a17', hairStyle: 'bob', ...over });
const hebrew = (over = {}) => robe({ top: '#a9845a', ...over });

export const actors = [
  { id: 'jochebed', name: 'Jochebed', at: [8, 15], dir: 'right', chat: 'jochebed_idle', look: lady('#6b8a4f', { hair: '#2a211c' }) },
  { id: 'amram', name: 'Amram', at: [6, 17], dir: 'right', onUse: discover('disc_amram', 'faith'), look: hebrew({ top: '#7a5a3a', beard: true }) },
  { id: 'miriam', name: 'Miriam', at: [9, 18], dir: 'right', chat: 'miriam_idle', scale: 0.85, look: robe({ top: '#c9893f', hairStyle: 'braids', hair: '#2a211c' }) },
  { id: 'shiphrah', name: 'Shiphrah', at: [13, 12], dir: 'left', onUse: discover('disc_midwife', 'midwives'), look: lady('#8a3a3a', { hair: '#5a4a3a' }) },
  { id: 'taskmaster', name: 'a taskmaster', at: [13, 21], dir: 'down', onUse: discover('disc_taskmaster', 'labor'), look: egyptian({ top: '#6a6a72', item: 'spear', beard: false }) },
  { id: 'worker', name: 'a worker', at: [15, 23], dir: 'left', onUse: discover('disc_worker', 'bricks'), look: hebrew({ top: '#8a6a3a', item: 'brick' }) },
  { id: 'princess', name: "Pharaoh's daughter", at: [26, 2], dir: 'down', hidden: true, look: lady('#e8e0cc', { skin: SKIN, hair: '#1f1a17', head: 'band', headColor: '#e3b93a' }) },
  { id: 'maid', name: 'her maidservant', at: [24, 2], dir: 'down', hidden: true, look: lady('#4a7ab0', { skin: SKIN, hair: '#1f1a17', head: 'band', headColor: '#d9c9a3' }) },
];

// -------------------------------------------------------------------- things

export const objects = [
  { type: 'egyptHouse', x: 3, y: 8 }, { type: 'egyptHouse', x: 3, y: 13 }, { type: 'egyptHouse', x: 12, y: 5 },
  { type: 'kiln', x: 11, y: 22 }, { type: 'bricks', x: 14, y: 20 }, { type: 'claypit', x: 6, y: 22 },
  { type: 'palace', x: 25, y: 4 },
  { type: 'reeds', x: 22, y: 9 }, { type: 'reeds', x: 22, y: 13 }, { type: 'reeds', x: 22, y: 16 }, { type: 'reeds', x: 24, y: 20 }, { type: 'reeds', x: 25, y: 11 },
  { type: 'palm', x: 17, y: 13 }, { type: 'palm', x: 16, y: 18 },
];

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'hardship',
    goal: 'Talk to Jochebed, near her house.', marker: 'jochebed',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'jochebed' },
    async run(g) {
      await g.say('hardship');
      g.award('new_king');
      g.award('harsh');
      await g.say('baby');
      g.award('beautiful');
      await g.say('baby_ask');
    },
  },
  {
    id: 'reeds', spawn: [14, 15],
    begin(g) { REEDS.forEach(r => g.addProp(r)); },
    goal: 'Gather papyrus reeds: 0 of 3', marker: null,
    solve: ['reed1', 'reed2', 'reed3'],
    trigger: { signal: 'reeds' },
    async run(g) {
      g.place('jochebed', 15, 15, 'right');
      await g.say('weaving');
      g.award('basket');
    },
  },
  {
    id: 'float', spawn: [14, 15],
    enter(g) { g.place('jochebed', 15, 15, 'right'); },
    goal: 'Walk with Jochebed down to the river.', marker: null,
    trigger: { zone: [19, 14, 20, 16] },
    async run(g) {
      g.place('jochebed', 21, 15, 'right');
      g.walk('miriam', [[18, 17]], 80);
      await g.say('river');
      g.addProp({ id: 'babybasket', type: 'babyBasket', x: 24, y: 15 });
      g.award('river');
      g.walk('jochebed', [[10, 15]], 90);
      await g.say('stood_apart');
      g.award('distance');
    },
  },
  {
    id: 'watch', spawn: [17, 16],
    enter(g) { g.addProp({ id: 'babybasket', type: 'babyBasket', x: 24, y: 15 }); g.place('jochebed', 10, 15, 'right'); g.place('miriam', 18, 17, 'right'); },
    goal: 'Wait with Miriam, and watch the river.', marker: 'miriam',
    trigger: { talk: 'miriam' },
    async run(g) {
      await g.say('wait');
      g.show('princess'); g.show('maid');
      g.walk('maid', [[24, 8], [22, 14]], 70);
      await g.walk('princess', [[26, 8], [23, 13]], 70);
      await g.say('found');
      g.award('compassion');
      await g.walk('maid', [[23, 15]], 80);
      g.removeProp('babybasket');
      await g.say('cries');
      g.award('hebrew_child');
      await g.walk('miriam', [[22, 14]], 120);
      await g.say('offer');
      g.award('nurse');
      await g.walk('miriam', [[11, 15]], 150);
      g.walk('jochebed', [[20, 14]], 110);
      await g.walk('miriam', [[20, 15]], 130);
      await g.say('wages');
      g.award('wages');
      g.hide('princess'); g.hide('maid');
    },
  },
  {
    id: 'farewell', spawn: [14, 15],
    enter(g) { g.hide('princess'); g.hide('maid'); g.place('jochebed', 15, 15, 'right'); g.place('miriam', 17, 17, 'right'); },
    goal: 'Talk to Jochebed, when you are ready.', marker: 'jochebed',
    trigger: { talk: 'jochebed' },
    async run(g) {
      await g.say('named');
      g.award('moses');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
