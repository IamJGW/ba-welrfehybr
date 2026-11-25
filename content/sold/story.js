// Sold to Egypt (Genesis 37:12-36): Joseph is sent to find his brothers, the pit
// at Dothan, the caravan, and the bloodied robe carried home to Jacob. The player
// is a watcher, hidden on the hillside. The words are in dialogue.csv.

import { robe, discover, makeMap, animal } from '../../src/storykit.js';

export const id = 'sold';
export const title = 'Sold to Egypt';
export const where = 'Hebron, Shechem and Dothan';
export const ref = 'Genesis 37:12-36';
export const place = [35.23, 32.42];   // Dothan
export const after = 'coat';

// ----------------------------------------------------------------------- map
// Hebron in the south-west, Shechem in the middle, Dothan up in the north-east.
//   #  cliff    .  grass    ,  path    h  hillside    o  stony ground    x  brush

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
export const map = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (y === 22 && x < 16 || x === 15 && y >= 16 && y <= 22 || y === 16 && x >= 15 && x <= 24 || x === 24 && y >= 12 && y <= 16 || y === 12 && x >= 24 && x <= 30) return ',';
  if (x >= 26 && x <= 36 && y >= 3 && y <= 12) return 'o';
  if (x >= 26 && x <= 28 && y >= 13 && y <= 14) return 'x';
  if (y <= 5 || x >= 30 && y <= 8) return 'h';
  return '.';
});

export const start = [5, 22];
export const door = [3, 23];
export const barriers = [];

// -------------------------------------------------------------------- people

const trader = (id, at) => ({ id, name: 'a trader', at, hidden: true, dir: 'left', look: robe({ top: '#8a3a3a', skin: '#a06a42', head: 'band', headColor: '#2a211c', beard: true }) });
const brother = (id, name, at, top, over = {}) => ({ id, name, at, dir: 'down', look: robe({ top, beard: true, ...over }) });

export const actors = [
  { id: 'jacob', name: 'Jacob', at: [8, 20], dir: 'down', chat: 'jacob_idle', look: robe({ top: '#7d5a8a', sash: '#e3b93a', hair: '#cfcfcf', beard: '#cfcfcf', head: 'cloth', headColor: '#e8e0cc', item: 'staff' }) },
  { id: 'joseph', name: 'Joseph', at: [6, 20], dir: 'right', chat: 'joseph_idle', look: robe({ top: '#c0415a', sash: '#e3b93a' }) },
  { id: 'wanderer', name: 'a man in the field', at: [20, 14], hidden: true, dir: 'left', chat: 'wanderer_idle', look: robe({ top: '#a9845a', hair: '#e8e8e8', beard: '#e8e8e8' }) },
  brother('reuben', 'Reuben', [29, 9], '#7a5a3a'),
  brother('judah', 'Judah', [32, 10], '#4f8a6a'),
  brother('simeon', 'Simeon', [33, 7], '#8a3a3a'),
  brother('levi', 'Levi', [28, 6], '#a9845a'),
  trader('trader1', [38, 5]), trader('trader2', [38, 7]),
  animal('camel1', 'camel', [39, 6], { hidden: true, scale: 1.4, name: 'a camel' }),
  animal('camel2', 'camel', [39, 8], { hidden: true, scale: 1.4, name: 'a camel' }),
  { id: 'benjamin', name: 'Benjamin', at: [10, 23], dir: 'up', scale: 0.8, onUse: discover('disc_benjamin', 'comfort'), look: robe({ top: '#d9b45a' }) },
];

// -------------------------------------------------------------------- things

const DOTHAN = [
  { id: 'pit', type: 'pit', x: 30, y: 8, label: 'look into the pit', onUse: g => g.signal('pit') },
  { id: 'fire', type: 'fire', x: 33, y: 9 },
  { id: 'rock1', type: 'bigrock', x: 27, y: 5 }, { id: 'rock2', type: 'rock', x: 35, y: 11 },
];
export const objects = [
  { type: 'tent', x: 7, y: 17 }, { type: 'tent', x: 11, y: 18 }, { type: 'fire', x: 9, y: 22 },
  { type: 'oak', x: 4, y: 12 }, { type: 'oak', x: 18, y: 20 }, { type: 'tree', x: 20, y: 9 },
  { type: 'rock', x: 12, y: 8 }, { type: 'bigrock', x: 22, y: 5 }, { type: 'rock', x: 17, y: 12 },
  ...DOTHAN.filter(o => o.id !== 'pit'),
];
const pit = DOTHAN[0];

// Home in Hebron, used again at the end.
const toHome = g => {
  g.place('jacob', 8, 20, 'down'); g.place('benjamin', 10, 23, 'up');
  for (const id of ['reuben', 'judah', 'simeon', 'levi', 'wanderer']) g.hide(id);
};

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'send',
    goal: 'Talk to Jacob, by the tents.', marker: 'jacob',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'jacob' },
    async run(g) {
      await g.say('send');
      g.award('send');
      g.walk('joseph', [[15, 22], [15, 16]], 110);
      await g.say('send_after');
    },
  },
  {
    id: 'shechem', spawn: [12, 22],
    enter(g) { g.place('joseph', 15, 18, 'up'); },
    goal: 'Follow Joseph north to Shechem.',
    trigger: { zone: [17, 15, 23, 17] },
    async run(g) {
      g.show('wanderer');
      g.place('joseph', 21, 16, 'right');
      g.face('wanderer', 'left');
      await g.say('wandering');
      g.award('wandering');
      g.walk('joseph', [[24, 14], [24, 12], [29, 12]], 100);
      g.hide('wanderer');
      await g.say('wandering_after');
    },
  },
  {
    id: 'dothan', spawn: [26, 12],
    enter(g) { g.place('joseph', 25, 12, 'right'); },
    goal: 'Hide in the brush and watch.', marker: null,
    trigger: { zone: [26, 13, 28, 14] },
    async run(g) {
      g.face('player', 'up');
      g.place('joseph', 25, 12, 'right');
      await g.pan(30, 8, 900);
      await g.say('plot');
      g.award('plot');
      await g.say('reuben_plan');
      g.award('reuben');
      // Joseph walks into the camp.
      await g.walk('joseph', [[27, 11], [29, 10]], 100);
      await g.say('stripped');
      g.award('pit');
      g.setLook('joseph', { top: '#a9845a', sash: '#5d4526' });
      g.hide('joseph');
      await g.say('meal');
      g.award('caravan');
      // The brothers sit to eat; Reuben goes off by himself.
      g.walk('reuben', [[26, 6], [20, 5]], 90);
      for (const id of ['trader1', 'trader2', 'camel1', 'camel2']) g.show(id);
      g.walk('trader1', [[34, 6], [31, 9]], 80);
      g.walk('trader2', [[35, 7], [32, 8]], 80);
      g.walk('camel1', [[35, 5], [32, 6]], 80);
      await g.walk('camel2', [[36, 8], [34, 8]], 80);
      await g.say('judah_plan');
      g.award('judah');
      g.show('joseph');
      g.place('joseph', 30, 9, 'down');
      await g.say('sold');
      g.award('sold');
      // Away to Egypt with the caravan.
      g.walk('trader1', [[34, 6], [38, 5]], 90);
      g.walk('camel1', [[35, 5], [38, 5]], 90);
      g.walk('trader2', [[36, 8], [38, 7]], 90);
      g.walk('camel2', [[36, 8], [38, 8]], 90);
      await g.walk('joseph', [[33, 8], [38, 6]], 90);
      for (const id of ['joseph', 'trader1', 'trader2', 'camel1', 'camel2']) g.hide(id);
      await g.say('reuben_back');
      g.award('empty');
      g.place('reuben', 29, 10, 'left');
      await g.say('lie');
      g.award('goat');
      for (const id of ['reuben', 'judah', 'simeon', 'levi']) g.hide(id);
      await g.follow(800);
      g.addProp(pit);
    },
  },
  {
    id: 'pit', spawn: [28, 11],
    enter(g) { for (const id of ['reuben', 'judah', 'simeon', 'levi', 'joseph']) g.hide(id); g.addProp(pit); },
    goal: 'Look into the empty pit.', marker: 'pit',
    trigger: { signal: 'pit' },
    solve: ['pit'],
    async run(g) {
      await g.say('pit_look');
      g.award('footprints');
      await g.say('acts');
      g.award('acts');
      await g.fadeOut(900);
      toHome(g);
      g.place('player', 7, 22, 'up');
      g.sky({ night: true });
      await g.fadeIn(900);
    },
  },
  {
    id: 'home', spawn: [7, 22],
    enter(g) { toHome(g); g.sky({ night: true }); },
    goal: 'Go to Jacob, in the camp.', marker: 'jacob',
    trigger: { talk: 'jacob' },
    async run(g) {
      await g.say('mourn');
      g.award('mourn');
      await g.say('egypt');
      g.award('potiphar');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
