// The Mountain of God (Exodus 19-20): the camp below Mount Sinai, the washing,
// the boundary, thunder and smoke, and the Ten Commandments. The words are in
// dialogue.csv.

import { robe, lady, discover, makeMap, taps } from '../../src/storykit.js';

export const id = 'sinai';
export const title = 'The Mountain of God';
export const where = 'The Wilderness of Sinai';
export const ref = 'Exodus 19-20';
export const place = [33.97, 28.4];   // Mount Sinai
export const after = 'rock';

// ----------------------------------------------------------------------- map
//   s  desert    h  mountain slope    ~  stream    ,  path    #  cliff

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
export const map = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (x >= 29 && x <= 30 && y >= 12) return '~';
  if (y <= 9) return 'h';
  if (x === 18 && y >= 10 && y <= 20) return ',';
  return 's';
});

export const start = [5, 22];
export const door = [3, 23];
// Not to be crossed: the boundary around the mountain.
export const barriers = [
  { id: 'boundary', tiles: [2, 10, 37, 10], bump: 'bump_boundary' },
];

// -------------------------------------------------------------------- the washing

const wash = taps('wash', { step: 'wash', total: 3, goal: 'Wash the clothes in the stream' });
const LAUNDRY = [[27, 15], [27, 18], [27, 21]].map(([x, y], i) => ({ id: `cloth${i + 1}`, type: 'sacks', x, y, label: 'wash the clothes', onUse: wash }));

// -------------------------------------------------------------------- people

const israelite = (over = {}) => robe({ top: '#a9845a', ...over });

export const actors = [
  { id: 'moses', name: 'Moses', at: [18, 16], dir: 'down', chat: 'moses_idle', look: robe({ top: '#a9845a', sash: '#5d4526', hair: '#d8d8d8', beard: '#d8d8d8', head: 'cloth', headColor: '#e8e0cc', item: 'staff' }) },
  { id: 'aaron', name: 'Aaron', at: [21, 17], dir: 'left', onUse: discover('disc_aaron', 'aaron'), look: robe({ top: '#f1ede0', sash: '#3d6fb5', hair: '#cfcfcf', beard: '#cfcfcf', head: 'cloth', headColor: '#e8e0cc' }) },
  { id: 'elder', name: 'an elder', at: [14, 18], dir: 'right', onUse: discover('disc_elder', 'will_do'), look: israelite({ top: '#7d5a8a', hair: '#e8e8e8', beard: '#e8e8e8' }) },
  { id: 'woman', name: 'a woman at the stream', at: [26, 17], dir: 'right', onUse: discover('disc_woman', 'washed'), look: lady('#6b8a4f', { hair: '#2a211c' }) },
  { id: 'boy', name: 'a boy', at: [11, 20], dir: 'right', scale: 0.8, onUse: discover('disc_boy', 'trembled'), look: israelite({ top: '#d9b45a' }) },
  { id: 'sentry', name: 'a guard at the boundary', at: [22, 12], dir: 'up', onUse: discover('disc_sentry', 'boundary_rule'), look: israelite({ top: '#6a6a72', item: 'spear', beard: true }) },
  { id: 'father', name: 'a father', at: [8, 17], dir: 'right', onUse: discover('disc_father', 'consecrate'), look: israelite({ top: '#8a3a3a', beard: true }) },
];

// -------------------------------------------------------------------- things

export const objects = [
  { id: 'peak', type: 'peak', x: 14, y: 3 },
  { type: 'tent', x: 5, y: 13 }, { type: 'tent', x: 6, y: 18 }, { type: 'ptent', x: 10, y: 14 }, { type: 'tent', x: 3, y: 22 }, { type: 'tent', x: 12, y: 22 },
  { type: 'rock', x: 24, y: 24 }, { type: 'bigrock', x: 34, y: 14 }, { type: 'rock', x: 33, y: 22 }, { type: 'palm', x: 31, y: 15 },
  { type: 'post', x: 6, y: 11 }, { type: 'post', x: 12, y: 11 }, { type: 'post', x: 26, y: 11 }, { type: 'post', x: 33, y: 11 },
];

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'camp',
    goal: 'Talk to Moses, in the middle of the camp.', marker: 'moses',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'moses' },
    async run(g) {
      await g.say('message');
      g.award('eagles_wings');
      g.award('treasured');
      await g.say('kingdom');
      g.award('kingdom_of_priests');
      await g.say('answer');
      g.award('we_will');
      await g.say('wash_ask');
    },
  },
  {
    id: 'wash', spawn: [20, 17],
    begin(g) { LAUNDRY.forEach(l => g.addProp(l)); },
    goal: 'Wash the clothes in the stream: 0 of 3', marker: null,
    solve: ['cloth1', 'cloth2', 'cloth3'],
    trigger: { signal: 'wash' },
    async run(g) {
      await g.say('washed_done');
      g.award('third_day');
      await g.say('boundary_words');
      g.award('boundary');
      g.award('whoever_touches');
    },
  },
  {
    id: 'limit', spawn: [20, 15],
    goal: 'Walk up to the boundary at the mountain.', marker: null,
    trigger: { zone: [14, 11, 24, 11] },
    async run(g) {
      g.place('player', 19, 12, 'up');
      await g.say('boundary_look');
      g.award('only_horn');
    },
  },
  {
    id: 'thunder', spawn: [18, 14],
    goal: 'Go back to the people, at the foot of the mountain.', marker: null,
    trigger: { zone: [8, 13, 28, 14] },
    async run(g) {
      g.place('player', 18, 14, 'up');
      g.place('moses', 18, 12, 'up');
      g.sky({ night: true });
      g.dark(true);
      await g.say('third_day_morning');
      g.award('thunder');
      g.flash(300); g.shake(1500, 0.006);
      await g.say('horn');
      g.award('trembled_all');
      await g.say('smoke');
      g.award('smoke');
      g.award('quaked');
      await g.say('horn_louder');
      g.award('thunder_answer');
      await g.walk('moses', [[18, 11], [18, 6]], 90);
      await g.say('summit');
      g.award('summit');
      await g.say('warn');
      g.award('warn');
      g.hide('moses');
      g.dark(false);
      g.sky({});
    },
  },
  {
    id: 'words', spawn: [18, 14],
    enter(g) { g.sky({}); g.hide('moses'); },
    goal: 'Wait for Moses to come back down.', marker: null,
    trigger: { zone: [16, 12, 20, 13] },
    async run(g) {
      g.show('moses');
      g.place('moses', 18, 11, 'down');
      g.place('player', 18, 14, 'up');
      g.sky({ night: true });
      await g.say('god_spoke');
      g.award('god_spoke');
      await g.say('first');
      g.award('first');
      await g.say('idols');
      g.award('idols');
      await g.say('name');
      g.award('name');
      await g.say('sabbath');
      g.award('sabbath');
      await g.say('parents');
      g.award('honor');
      await g.say('neighbor');
      g.award('murder');
      g.award('steal');
      g.award('witness');
      g.award('covet');
      g.sky({});
    },
  },
  {
    id: 'distance', spawn: [18, 14],
    enter(g) { g.sky({}); g.place('moses', 18, 11, 'down'); },
    goal: 'Talk to Moses.', marker: 'moses',
    trigger: { talk: 'moses' },
    async run(g) {
      await g.say('distance');
      g.award('at_a_distance');
      await g.say('speak_to_us');
      g.award('speak_to_us');
      await g.say('not_afraid');
      g.award('test_you');
      await g.say('love');
      g.award('greatest');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
