// The Coat and the Dreams (Genesis 37:1-11): Jacob's favorite son, the robe of
// many colors, binding sheaves with the brothers, and the two dreams. The words
// are in dialogue.csv.

import { robe, lady, discover, makeMap, taps } from '../../src/storykit.js';
import { ANIMAL_HEADROOM } from '../../src/art.js';

export const id = 'coat';
export const title = 'The Coat and the Dreams';
export const where = 'The valley of Hebron';
export const ref = 'Genesis 37:1-11';
export const place = [35.1, 31.53];   // Hebron
export const after = null;

// ----------------------------------------------------------------------- map
//   #  cliff    .  grass    ,  path    h  hillside    b  barley field

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
export const map = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (x >= 23 && x <= 36 && y >= 14 && y <= 23) return 'b';
  if (y === 20 && x < 23 || x === 17 && y >= 10 && y <= 20) return ',';
  if (y <= 6) return 'h';
  return '.';
});

export const start = [5, 20];
export const door = [3, 21];
export const barriers = [];

// -------------------------------------------------------------------- the field

const bind = taps('bind', { step: 'sheaves', total: 5, goal: 'Bind the sheaves with the brothers' });
const SHEAVES = [[25, 16], [28, 15], [31, 17], [26, 20], [33, 21]].map(([x, y], i) => ({ id: `sheaf${i + 1}`, type: 'sheaves', x, y, label: 'bind the sheaf', onUse: bind }));

// Joseph's coat: red, gold and blue, the finest thing in the camp.
const COAT = { top: '#c0415a', sash: '#e3b93a' };
const dressed = g => g.setLook('joseph', COAT);

// -------------------------------------------------------------------- people

const lamb = (id, at, over = {}) => ({ id, name: 'a lamb', at, solid: false, look: { kind: 'lamb' }, headroom: ANIMAL_HEADROOM, ...over });

export const actors = [
  { id: 'joseph', name: 'Joseph', at: [10, 19], dir: 'right', chat: 'joseph_idle', look: robe({ top: '#a9845a', hair: '#2a211c' }) },
  { id: 'jacob', name: 'Jacob', at: [17, 8], dir: 'down', chat: 'jacob_idle', look: robe({ top: '#7d5a8a', sash: '#e3b93a', hair: '#cfcfcf', beard: '#cfcfcf', head: 'cloth', headColor: '#e8e0cc', item: 'staff' }) },
  { id: 'reuben', name: 'Reuben', at: [27, 17], dir: 'down', onUse: discover('disc_reuben', 'reuben'), look: robe({ top: '#7a5a3a', beard: true }) },
  { id: 'judah', name: 'Judah', at: [30, 19], dir: 'left', chat: 'judah_idle', look: robe({ top: '#4f8a6a', beard: true }) },
  { id: 'simeon', name: 'Simeon', at: [24, 18], dir: 'right', chat: 'simeon_idle', look: robe({ top: '#8a3a3a', beard: true }) },
  { id: 'benjamin', name: 'Benjamin', at: [14, 12], dir: 'right', scale: 0.8, onUse: discover('disc_benjamin', 'benjamin'), look: robe({ top: '#d9b45a' }) },
  { id: 'bilhah', name: 'Bilhah', at: [21, 10], dir: 'left', onUse: discover('disc_bilhah', 'wives'), look: lady('#3d6fb5', { hair: '#3a2a1e' }) },
  { id: 'servant', name: 'an old servant', at: [19, 15], dir: 'left', onUse: discover('disc_israel', 'israel'), look: robe({ top: '#a9845a', hair: '#e8e8e8', beard: '#e8e8e8' }) },
  lamb('lamb1', [8, 16]), lamb('lamb2', [12, 22]), lamb('lamb3', [6, 23]),
];

// -------------------------------------------------------------------- things

export const objects = [
  { type: 'tent', x: 13, y: 6 }, { type: 'bigtent', x: 16, y: 5 }, { type: 'tent', x: 21, y: 6 },
  { type: 'fire', x: 17, y: 12 },
  { type: 'oak', x: 9, y: 8 }, { type: 'oak', x: 29, y: 8 },
  { type: 'rock', x: 5, y: 12 }, { type: 'rock', x: 34, y: 11 }, { type: 'tree', x: 36, y: 6 },
];

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'meet',
    goal: 'Talk to Joseph, by the flock.', marker: 'joseph',
    async intro(g) {
      g.patrol('lamb1', [[8, 16], [11, 17]], 35, 2); g.patrol('lamb2', [[12, 22], [8, 22]], 35, 2.5);
      await g.wait(700); await g.say('arrive');
    },
    trigger: { talk: 'joseph' },
    async run(g) {
      await g.say('meet');
      g.award('report');
      await g.say('come');
      g.walk('joseph', [[16, 11]], 110);
    },
  },
  {
    id: 'robe', spawn: [14, 11],
    enter(g) { g.place('joseph', 16, 11, 'up'); },
    goal: 'Follow Joseph to his father, Jacob.', marker: 'jacob',
    trigger: { talk: 'jacob' },
    async run(g) {
      await g.say('robe');
      dressed(g);
      g.award('colors');
      await g.say('robe_after');
      g.setChat('jacob', 'jacob_robe');
    },
  },
  {
    id: 'sheaves', spawn: [20, 18],
    enter(g) { dressed(g); g.place('joseph', 22, 16, 'right'); },
    begin(g) { SHEAVES.forEach(s => g.addProp(s)); },
    goal: 'Bind the sheaves with the brothers: 0 of 5',
    solve: ['sheaf1', 'sheaf2', 'sheaf3', 'sheaf4', 'sheaf5'],
    trigger: { signal: 'sheaves' },
    async intro(g) { g.place('joseph', 22, 16, 'right'); await g.say('field'); g.award('hated'); },
    async run(g) {
      await g.say('dream1');
      g.award('dream1');
      await g.say('dream1_after');
    },
  },
  {
    id: 'night', spawn: [22, 17],
    enter(g) { dressed(g); },
    goal: 'Walk back to the camp for the evening meal.',
    trigger: { zone: [15, 11, 19, 13] },
    async run(g) {
      g.sky({ night: true, stars: true });
      g.place('player', 17, 17, 'up');
      for (const [id, x, y, dir] of [['jacob', 17, 13, 'up'], ['joseph', 15, 12, 'right'], ['reuben', 19, 12, 'left'], ['judah', 16, 15, 'up'], ['simeon', 18, 15, 'up']]) g.place(id, x, y, dir);
      await g.wait(500);
      await g.say('evening');
      await g.say('dream2');
      g.award('dream2');
      await g.say('rebuke');
      g.award('jealous');
      g.setChat('jacob', 'jacob_night');
    },
  },
  {
    id: 'farewell', spawn: [17, 15],
    enter(g) { dressed(g); g.sky({ night: true, stars: true }); for (const [id, x, y, dir] of [['jacob', 17, 13, 'up'], ['joseph', 15, 12, 'right'], ['reuben', 19, 12, 'left']]) g.place(id, x, y, dir); },
    goal: 'Talk to Jacob when you are ready to go.', marker: 'jacob',
    trigger: { talk: 'jacob' },
    async run(g) {
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
