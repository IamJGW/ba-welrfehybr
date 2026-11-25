// The Twelve Spies (Numbers 13-14): twelve men are sent into Canaan, they bring
// back grapes from Eshcol, ten are afraid, and Caleb and Joshua trust God. The
// words are in dialogue.csv.

import { robe, lady, discover, makeMap, soldier, job, trips } from '../../src/storykit.js';

export const id = 'spies';
export const title = 'The Twelve Spies';
export const where = 'Kadesh, and the land of Canaan';
export const ref = 'Numbers 13-14';
export const place = [34.42, 30.67];   // Kadesh
export const after = 'tabernacle';

// ----------------------------------------------------------------------- map
// Kadesh in the desert first; then the hill country of Canaan.
//   s  desert    .  grass    h  hillside    g  vineyard grass    ,  path    #  cliff

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
export const map = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (y === 15 && x < 30 || x === 20 && y >= 6 && y <= 15) return ',';
  return (x * 5 + y * 3) % 17 === 0 ? 'x' : 's';
});
const CANAAN = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (x >= 22 && x <= 36 && y >= 14 && y <= 23) return 'g';
  if (y === 15 && x < 22 || x === 20 && y >= 6 && y <= 15) return ',';
  if (y <= 6) return 'h';
  return '.';
});

export const start = [5, 22];
export const door = [3, 23];
export const barriers = [];

// -------------------------------------------------------------------- the fruit

const fruit = job('fruit', { step: 'grapes', total: 3, goal: 'Bring back the fruit of the land', target: 'caleb', hold: 'bundle' });

// -------------------------------------------------------------------- people

const israelite = (over = {}) => robe({ top: '#a9845a', ...over });
const spy = (id, name, at, top) => ({ id, name, at, dir: 'down', hidden: true, solid: false, look: israelite({ top, beard: true }) });

export const actors = [
  { id: 'moses', name: 'Moses', at: [20, 10], dir: 'down', chat: 'moses_idle', look: robe({ top: '#a9845a', sash: '#5d4526', hair: '#d8d8d8', beard: '#d8d8d8', head: 'cloth', headColor: '#e8e0cc', item: 'staff' }) },
  { id: 'caleb', name: 'Caleb', at: [14, 17], dir: 'right', onUse: (g, t) => (g.stepId === 'grapes' ? fruit.give(g) : g.say('caleb_idle')), look: israelite({ top: '#4f8a6a', beard: true, head: 'band', headColor: '#e3b93a' }) },
  { id: 'joshua', name: 'Joshua', at: [16, 19], dir: 'right', chat: 'joshua_idle', look: soldier({ top: '#a9845a', head: 'band', headColor: '#7a2e2e' }) },
  spy('spy1', 'a spy', [12, 20], '#8a3a3a'), spy('spy2', 'a spy', [10, 18], '#3d6fb5'), spy('spy3', 'a spy', [18, 21], '#7d5a8a'), spy('spy4', 'a spy', [12, 15], '#c9893f'),
  { id: 'elder', name: 'an elder of the camp', at: [24, 9], dir: 'left', onUse: discover('disc_elder', 'tribes'), look: israelite({ top: '#7d5a8a', hair: '#e8e8e8', beard: '#e8e8e8' }) },
  { id: 'mother', name: 'a worried mother', at: [26, 12], dir: 'left', onUse: discover('disc_mother', 'plunder'), look: lady('#6b8a4f', { hair: '#2a211c' }) },
  { id: 'farmer', name: 'a Canaanite farmer', at: [28, 12], dir: 'left', hidden: true, onUse: discover('disc_farmer', 'fertile'), look: robe({ top: '#8a3a3a', skin: '#a06a42', head: 'cloth', headColor: '#e8e0cc' }) },
  { id: 'anak1', name: 'a very tall man', at: [31, 8], dir: 'left', hidden: true, scale: 1.7, onUse: discover('disc_anak', 'anak'), look: soldier({ top: '#6a3a3a', skin: '#a06a42', head: 'plume', headColor: '#2a211c' }) },
  { id: 'anak2', name: 'a very tall man', at: [34, 10], dir: 'left', hidden: true, scale: 1.7, onUse: discover('disc_hebron', 'hebron'), look: soldier({ top: '#4a3a30', skin: '#a06a42' }) },
];

// -------------------------------------------------------------------- things

export const objects = [
  { type: 'tent', x: 4, y: 12 }, { type: 'tent', x: 5, y: 18 }, { type: 'ptent', x: 8, y: 13 }, { type: 'tent', x: 3, y: 22 },
  { id: 'tabernacle', type: 'tabernacle', x: 26, y: 5 },
  { type: 'rock', x: 12, y: 8 }, { type: 'bigrock', x: 32, y: 17 }, { type: 'rock', x: 24, y: 22 },
];
const VINES = [
  { id: 'vine1', type: 'vine', x: 24, y: 18, item: 'a heavy cluster of grapes', carry: 'grapes', label: 'cut the cluster of grapes', onUse: fruit.take },
  { id: 'vine2', type: 'vine', x: 28, y: 18, item: 'pomegranates', label: 'pick pomegranates', onUse: fruit.take },
  { id: 'vine3', type: 'vine', x: 32, y: 18, item: 'figs', label: 'pick figs', onUse: fruit.take },
];
const CANAAN_THINGS = [
  { id: 'tree1', type: 'tree', x: 12, y: 10 }, { id: 'tree2', type: 'tree', x: 4, y: 8 }, { id: 'tree3', type: 'oak', x: 16, y: 7 },
  { id: 'house1', type: 'house', x: 30, y: 5 }, { id: 'house2', type: 'house', x: 34, y: 6 },
  { id: 'rock3', type: 'rock', x: 8, y: 19 },
];

const toCanaan = g => {
  if (g.state.canaan) return;
  g.state.canaan = true;
  g.removeProp('tabernacle');
  g.ground(CANAAN, 0);
  CANAAN_THINGS.forEach(o => g.addProp(o));
  VINES.forEach(v => g.addProp(v));
  g.hide('moses'); g.hide('elder'); g.hide('mother');
  for (const id of ['farmer', 'anak1', 'anak2', 'spy1', 'spy2', 'spy3', 'spy4']) g.show(id);
};
const toKadesh = g => {
  if (g.state.canaan === false) return;
  const was = g.state.canaan;
  g.state.canaan = false;
  if (!was) return;
  VINES.forEach(v => g.removeProp(v.id));
  CANAAN_THINGS.forEach(o => g.removeProp(o.id));
  g.ground(map, 0);
  g.addProp({ id: 'tabernacle', type: 'tabernacle', x: 26, y: 5 });
  for (const id of ['farmer', 'anak1', 'anak2', 'spy1', 'spy2', 'spy3', 'spy4']) g.hide(id);
  g.show('moses'); g.show('elder'); g.show('mother');
};

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'commission',
    goal: 'Talk to Moses.', marker: 'moses',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'moses' },
    async run(g) {
      await g.say('send');
      g.award('spy_out');
      g.award('leaders');
      await g.say('look_for');
      g.award('see_the_land');
      g.award('be_courageous');
      await g.say('go_with');
    },
  },
  {
    id: 'journey', spawn: [18, 14],
    goal: 'Walk north with the spies into the land.', marker: null,
    trigger: { zone: [18, 7, 22, 8] },
    async intro(g) { return; },
    async run(g) {
      await g.fadeOut(900);
      toCanaan(g);
      g.place('caleb', 18, 12, 'up'); g.place('joshua', 21, 12, 'up');
      g.place('player', 20, 15, 'up');
      for (const [id, x, y] of [['spy1', 17, 14], ['spy2', 23, 14], ['spy3', 15, 13], ['spy4', 25, 13]]) g.place(id, x, y, 'up');
      await g.fadeIn(900);
      await g.say('hill_country');
      g.award('negev');
      await g.say('hebron');
      g.award('anak_built');
    },
  },
  {
    id: 'grapes', spawn: [20, 14],
    enter(g) { toCanaan(g); },
    goal: 'Bring back the fruit of the land: 0 of 3', marker: 'vine1',
    solve: trips(['vine1', 'vine2', 'vine3'], 'caleb'),
    trigger: { signal: 'grapes' },
    async intro(g) { await g.say('eshcol'); g.award('season'); },
    async run(g) {
      await g.say('pole');
      g.award('cluster');
      g.award('pomegranates_figs');
      await g.say('eshcol_named');
      g.award('eshcol');
      await g.fadeOut(900);
    },
  },
  {
    id: 'report', spawn: [20, 14],
    enter(g) { toKadesh(g); },
    async intro(g) {
      toKadesh(g);
      for (const [id, x, y] of [['caleb', 17, 11], ['joshua', 23, 11]]) { g.place(id, x, y, 'down'); }
      g.place('moses', 20, 9, 'down');
      g.place('player', 20, 15, 'up');
      await g.fadeIn(900);
      await g.say('forty_days');
      g.award('forty_days');
    },
    goal: 'Listen to the spies report to Moses.', marker: null,
    trigger: { zone: [18, 11, 22, 12] },
    async run(g) {
      await g.say('report');
      g.award('milk_and_honey');
      await g.say('but');
      g.award('fortified');
      await g.say('caleb');
      g.award('we_can');
      await g.say('bad_report');
      g.award('grasshoppers');
      g.award('bad_report');
      await g.say('weeping');
      g.award('wept');
      g.award('go_back');
      await g.say('joshua_caleb');
      g.award('good_land');
      g.award('not_afraid');
      await g.say('stone');
      g.award('stone_them');
    },
  },
  {
    id: 'forty', spawn: [20, 14],
    enter(g) { toKadesh(g); g.place('moses', 20, 9, 'down'); },
    goal: 'Talk to Moses.', marker: 'moses',
    trigger: { talk: 'moses' },
    async run(g) {
      await g.say('pardoned');
      g.award('pardoned');
      await g.say('different_spirit');
      g.award('different_spirit');
      await g.say('forty_years');
      g.award('forty_years');
      await g.say('children_enter');
      g.award('children_enter');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
