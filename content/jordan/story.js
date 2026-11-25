// Crossing the Jordan (Joshua 3-4): the ark goes first, the river stands up in a
// heap, all Israel crosses on dry ground, and twelve stones are set up at Gilgal.
// The words are in dialogue.csv.

import { robe, lady, discover, makeMap, soldier, job, trips } from '../../src/storykit.js';

export const id = 'jordan';
export const title = 'Crossing the Jordan';
export const where = 'The Jordan River, opposite Jericho';
export const ref = 'Joshua 3-4';
export const place = [35.55, 31.8];   // the Jordan, opposite Jericho
export const after = 'rahab';

// ----------------------------------------------------------------------- map
//   .  grass    ~  shallow water    S  deep water    m  dry river bed    ,  path

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
const river = phase => makeMap((x, y) => {
  if (edge(x, y)) return phase === 'dry' ? '#' : '#';
  if (x >= 18 && x <= 23) {
    if (phase === 'dry' && (y >= 11 && y <= 17 || y >= 18)) return 'm';
    return 'S';
  }
  if (x === 17 || x === 24) return phase === 'dry' ? '.' : '~';
  if (y === 14 && x < 17) return ',';
  return '.';
});
export const map = river('flood');
const DRY = river('dry'), FLOOD = river('flood');

export const start = [5, 22];
export const door = [3, 23];
// The people keep well back from the ark until it has gone ahead.
export const barriers = [
  { id: 'bank', tiles: [16, 2, 24, 26], bump: 'bump_bank' },
];

// -------------------------------------------------------------------- the stones

const stones = job('stone', { step: 'stones', total: 2, goal: 'Carry the stones from the river bed to Gilgal', target: 'cairn', hold: 'stone', reuse: true });

// -------------------------------------------------------------------- people

const israelite = (over = {}) => robe({ top: '#a9845a', ...over });
const priest = (id, name, at, extra = {}) => ({ id, name, at, dir: 'right', solid: false, look: robe({ top: '#f1ede0', sash: '#3d6fb5', beard: true, head: 'cloth', headColor: '#e8e0cc', item: 'ark' }), ...extra });

export const actors = [
  { id: 'joshua', name: 'Joshua', at: [9, 16], dir: 'right', chat: 'joshua_idle', look: soldier({ top: '#a9845a', head: 'band', headColor: '#7a2e2e' }) },
  priest('priest1', 'a priest', [10, 13]), priest('priest2', 'a priest', [10, 15], { look: robe({ top: '#f1ede0', sash: '#3d6fb5', beard: true, head: 'cloth', headColor: '#e8e0cc' }), onUse: discover('disc_priest', 'priests') }),
  { id: 'officer', name: 'an officer', at: [7, 11], dir: 'right', onUse: discover('disc_officer', 'distance'), look: israelite({ top: '#6a6a72', item: 'spear', beard: true }) },
  { id: 'elder', name: 'an old man', at: [8, 20], dir: 'right', onUse: discover('disc_elder', 'red_sea'), look: israelite({ top: '#7d5a8a', hair: '#e8e8e8', beard: '#e8e8e8' }) },
  { id: 'woman', name: 'a woman', at: [5, 17], dir: 'right', onUse: discover('disc_woman', 'harvest'), look: lady('#6b8a4f', { hair: '#2a211c' }) },
  { id: 'child', name: 'a child', at: [11, 19], dir: 'right', scale: 0.75, onUse: discover('disc_child', 'meaning'), look: robe({ top: '#d9b45a' }) },
  { id: 'tribesman', name: 'a man of the tribes', at: [28, 20], dir: 'left', onUse: discover('disc_tribe', 'twelve'), look: israelite({ top: '#8a3a3a', beard: true }) },
  { id: 'crowd1', name: 'an Israelite', at: [5, 12], dir: 'right', solid: false, look: israelite({ top: '#c9893f' }) },
  { id: 'crowd2', name: 'an Israelite', at: [6, 14], dir: 'right', solid: false, look: israelite({ top: '#4f8a6a', beard: true }) },
  { id: 'crowd3', name: 'an Israelite', at: [4, 19], dir: 'right', solid: false, look: israelite({ top: '#3d6fb5' }) },
];

// -------------------------------------------------------------------- things

export const objects = [
  { type: 'tent', x: 4, y: 8 }, { type: 'tent', x: 3, y: 15 }, { type: 'ptent', x: 8, y: 6 }, { type: 'tent', x: 12, y: 22 },
  { type: 'palm', x: 14, y: 9 }, { type: 'palm', x: 14, y: 20 }, { type: 'reeds', x: 16, y: 6 }, { type: 'reeds', x: 16, y: 22 },
  { type: 'palm', x: 33, y: 7 }, { type: 'rock', x: 28, y: 9 }, { type: 'bigrock', x: 34, y: 20 },
];
const RIVERBED = { id: 'riverbed', type: 'flatstones', x: 20, y: 16, item: 'a stone from the river bed', label: 'lift a stone from the river bed', onUse: stones.take };
const CAIRN = { id: 'cairn', type: 'altar', x: 30, y: 14, label: 'set the stone down at Gilgal', onUse: stones.give };
const ARK = { id: 'ark', type: 'arkcov', x: 20, y: 13 };

const crowd = ['crowd1', 'crowd2', 'crowd3'];

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'shittim',
    goal: 'Talk to Joshua, by the river.', marker: 'joshua',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'joshua' },
    async run(g) {
      await g.say('camp');
      g.award('camped');
      await g.say('officers');
      g.award('follow_the_ark');
      g.award('keep_distance');
      await g.say('consecrate');
      g.award('consecrate');
      await g.say('ahead');
      g.award('go_ahead');
    },
  },
  {
    id: 'ark', spawn: [8, 14],
    goal: 'Follow the ark, but stay well back from it.', marker: null,
    trigger: { zone: [12, 13, 13, 15] },
    async run(g) {
      g.place('player', 12, 14, 'right');
      await g.say('exalt');
      g.award('exalt');
      await g.say('listen');
      g.award('living_god');
      g.award('twelve_men');
      g.award('heap');
      g.walk('priest2', [[16, 15]], 70); g.walk('joshua', [[12, 17]], 80);
      await g.walk('priest1', [[17, 14]], 70);
      await g.say('feet_touched');
      g.award('overflows');
      g.award('stood_still');
      g.barrier('bank', false);
      g.ground(DRY, 1400);
      await g.wait(1200);
      g.shake(500, 0.004);
      await g.say('crossed_opposite');
      g.award('opposite_jericho');
      for (const id of crowd) g.walk(id, [[19, 14], [28, 13]], 80);
      g.walk('priest2', [[19, 15], [20, 15]], 70);
      g.walk('priest1', [[20, 14]], 70);
    },
  },
  {
    id: 'cross', spawn: [16, 14],
    enter(g) { g.barrier('bank', false); g.ground(DRY, 0); g.place('priest1', 20, 14, 'down'); g.place('priest2', 20, 15, 'down'); },
    goal: 'Cross the Jordan on dry ground.', marker: null,
    trigger: { zone: [26, 11, 28, 17] },
    async run(g) {
      await g.say('dry_ground');
      g.award('firm');
      await g.say('whole_nation');
      g.award('all_crossed');
      for (const id of crowd) g.place(id, 29, 12 + crowd.indexOf(id) * 2, 'right');
    },
  },
  {
    id: 'stones', spawn: [27, 14],
    enter(g) { g.barrier('bank', false); g.ground(DRY, 0); g.place('priest1', 20, 14, 'down'); g.place('priest2', 20, 15, 'down'); for (const id of crowd) g.place(id, 29, 12 + crowd.indexOf(id) * 2, 'right'); },
    begin(g) { g.addProp(RIVERBED); g.addProp(CAIRN); g.place('joshua', 28, 15, 'left'); },
    goal: 'Carry the stones from the river bed to Gilgal: 0 of 2', marker: 'riverbed',
    solve: trips(['riverbed', 'riverbed'], 'cairn'),
    trigger: { signal: 'stones' },
    async intro(g) {
      g.place('joshua', 28, 15, 'left');
      await g.say('twelve_stones');
      g.award('twelve_stones');
      await g.say('stones_sign');
      g.award('sign');
      g.award('memorial');
    },
    async run(g) {
      await g.say('stones_done');
      g.award('carried');
      g.award('there_to_this_day');
    },
  },
  {
    id: 'waters', spawn: [27, 14],
    enter(g) { g.barrier('bank', false); g.ground(DRY, 0); g.place('priest1', 20, 14, 'down'); g.place('priest2', 20, 15, 'down'); g.place('joshua', 28, 15, 'left'); g.addProp(CAIRN); },
    goal: 'Talk to Joshua, at the new camp.', marker: 'joshua',
    trigger: { talk: 'joshua' },
    async run(g) {
      await g.say('come_up');
      g.award('come_up');
      g.walk('priest1', [[25, 14]], 90); await g.walk('priest2', [[25, 15]], 90);
      g.ground(FLOOD, 1400);
      g.shake(700, 0.005);
      await g.say('returned');
      g.award('returned');
      await g.say('gilgal');
      g.award('gilgal');
      await g.say('meaning');
      g.award('what_do_they_mean');
      g.award('hand_mighty');
      await g.say('name_joshua');
      g.award('joshua_name');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
