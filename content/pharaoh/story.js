// Pharaoh's Dreams (Genesis 41): the dream of the cows and the grain, Joseph
// brought out of prison, the seven good years of storing grain, and the famine.
// The words are in dialogue.csv.

import { robe, lady, discover, makeMap, animal, job, taps } from '../../src/storykit.js';

export const id = 'pharaoh';
export const title = "Pharaoh's Dreams";
export const where = "Pharaoh's palace, and the storehouses of Egypt";
export const ref = 'Genesis 41';
export const place = [31.3, 30.13];   // On
export const after = 'prison';

// ----------------------------------------------------------------------- map
//   .  grass    p  paving    b  grain field    ~  the Nile    s  desert    ,  path

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
const field = (x, y) => x >= 4 && x <= 16 && y >= 17 && y <= 24;
export const map = makeMap((x, y) => {
  if (edge(x, y)) return 's';
  if (x >= 34) return '~';
  if (x >= 6 && x <= 30 && y >= 4 && y <= 13) return 'p';
  if (field(x, y)) return 'b';
  if (y === 15 && x < 33 || x === 20 && y >= 13 && y <= 15) return ',';
  return '.';
});
// After seven years, the dry years: the fields are bare.
const FAMINE = makeMap((x, y) => {
  if (edge(x, y)) return 's';
  if (x >= 34) return '~';
  if (x >= 6 && x <= 30 && y >= 4 && y <= 13) return 'p';
  if (y === 15 && x < 33 || x === 20 && y >= 13 && y <= 15) return ',';
  return 's';
});

export const start = [6, 20];
export const door = [4, 21];
export const barriers = [];

// -------------------------------------------------------------------- jobs

const store = job('store', { step: 'store', total: 7, goal: 'Store the grain, one year at a time', target: 'granary1', hold: 'bundle', reuse: true });
const dress = taps('ready', { step: 'ready', total: 2, goal: 'Help Joseph get ready for Pharaoh', keep: true });

// -------------------------------------------------------------------- people

const SKIN = '#b07848';
const egyptian = (over = {}) => robe({ skin: SKIN, top: '#f2efe6', sash: '#4a7ab0', hair: '#1f1a17', hairStyle: 'bob', ...over });
const calf = (id, at, over = {}) => animal(id, 'calf', at, { name: 'a cow', hidden: true, ...over });

export const actors = [
  { id: 'pharaoh', name: 'Pharaoh', at: [19, 7], dir: 'down', chat: 'pharaoh_idle', look: egyptian({ head: 'nemes', headColor: '#4a7ab0', sash: '#e3b93a', item: 'staff' }) },
  { id: 'cupbearer', name: 'the cupbearer', at: [15, 9], dir: 'right', chat: 'cupbearer_idle', look: egyptian({ top: '#c9a24a', sash: '#8a3a3a' }) },
  { id: 'magician1', name: 'a magician', at: [24, 9], dir: 'left', onUse: discover('disc_magician', 'magicians'), look: egyptian({ top: '#4a7ab0', sash: '#e3b93a', head: 'cloth', headColor: '#e8e0cc' }) },
  { id: 'magician2', name: 'a wise man', at: [13, 11], dir: 'right', chat: 'magician_idle', look: egyptian({ top: '#8a3a3a', sash: '#e3b93a', head: 'cloth', headColor: '#e8e0cc' }) },
  { id: 'joseph', name: 'Joseph', at: [9, 17], dir: 'right', hidden: true, chat: 'joseph_idle', look: robe({ skin: '#c98f62', top: '#8a8a82', beard: true }) },
  { id: 'asenath', name: 'Asenath', at: [24, 16], dir: 'down', hidden: true, onUse: discover('disc_asenath', 'asenath'), look: lady('#e8e0cc', { skin: SKIN, hair: '#1f1a17', head: 'band', headColor: '#4a7ab0' }) },
  { id: 'overseer', name: 'an overseer', at: [10, 20], dir: 'right', onUse: discover('disc_overseer', 'plenty'), look: egyptian({ top: '#a9845a' }) },
  { id: 'farmer', name: 'a farmer', at: [25, 18], dir: 'left', onUse: discover('disc_farmer', 'nile'), look: egyptian({ top: '#d9c9a3' }) },
  { id: 'stranger', name: 'a traveler from far away', at: [28, 16], dir: 'left', hidden: true, onUse: discover('disc_stranger', 'nations'), look: robe({ top: '#4f8a6a', skin: '#a06a42', head: 'cloth', headColor: '#2a211c', beard: true }) },
  { id: 'mother', name: 'a hungry mother', at: [27, 18], dir: 'left', hidden: true, onUse: discover('disc_bread', 'bread'), look: lady('#8a3a3a', { skin: SKIN, hair: '#1f1a17' }) },
  calf('fat1', [34, 6], { scale: 1.3 }), calf('fat2', [35, 8], { scale: 1.3 }), calf('fat3', [34, 10], { scale: 1.3 }),
  calf('thin1', [36, 16], { scale: 0.8 }), calf('thin2', [36, 18], { scale: 0.8 }), calf('thin3', [36, 20], { scale: 0.8 }),
];

// -------------------------------------------------------------------- things

export const objects = [
  { id: 'palace', type: 'palace', x: 14, y: 3 },
  { id: 'throne', type: 'throne', x: 19, y: 6 },
  { type: 'column', x: 8, y: 7 }, { type: 'column', x: 8, y: 11 }, { type: 'column', x: 29, y: 7 }, { type: 'column', x: 29, y: 11 },
  { type: 'obelisk', x: 22, y: 14 },
  { type: 'palm', x: 31, y: 4 }, { type: 'palm', x: 32, y: 14 }, { type: 'palm', x: 3, y: 14 },
  { type: 'reeds', x: 33, y: 8 }, { type: 'reeds', x: 33, y: 17 }, { type: 'reeds', x: 33, y: 21 },
  { id: 'granary1', type: 'granary', x: 20, y: 22, label: 'put the grain in the storehouse', onUse: store.give },
  { id: 'granary2', type: 'granary', x: 24, y: 22 }, { id: 'granary3', type: 'granary', x: 28, y: 22 },
  { id: 'heap1', type: 'sacks', x: 9, y: 18, item: 'a sack of the harvest', label: 'lift a sack of grain', onUse: store.take },
  { id: 'heap2', type: 'sacks', x: 12, y: 21, item: 'a sack of the harvest', label: 'lift a sack of grain', onUse: store.take },
  { id: 'heap3', type: 'sacks', x: 15, y: 18, item: 'a sack of the harvest', label: 'lift a sack of grain', onUse: store.take },
  { id: 'basin', type: 'well', x: 11, y: 15, label: 'bring water for Joseph to wash', onUse: dress },
  { id: 'linen', type: 'sheaves', x: 13, y: 16, label: 'bring fine linen for Joseph', onUse: dress },
];

const SEVEN = 'store';

// -------------------------------------------------------------------- the dream

// Seven fat cows come up by the river; seven thin ones eat them.
async function cows(g) {
  await g.pan(33, 12, 900);
  g.sky({ night: true });
  for (const id of ['fat1', 'fat2', 'fat3']) g.show(id);
  g.walk('fat1', [[30, 6]], 40); g.walk('fat2', [[30, 9]], 40); await g.walk('fat3', [[30, 12]], 40);
  for (const id of ['thin1', 'thin2', 'thin3']) g.show(id);
  g.walk('thin1', [[30, 7]], 55); g.walk('thin2', [[30, 10]], 55); await g.walk('thin3', [[30, 13]], 55);
  for (const id of ['fat1', 'fat2', 'fat3']) g.hide(id);
  await g.wait(600);
  g.sky({});
  for (const id of ['thin1', 'thin2', 'thin3']) g.hide(id);
  await g.follow(700);
}

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'dream',
    goal: 'Talk to Pharaoh. He looks troubled.', marker: 'pharaoh',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'pharaoh' },
    async run(g) {
      await g.say('dream_start');
      await g.say('dream_cows');
      g.award('cows');
      await cows(g);
      await g.say('dream_grain');
      g.award('grain');
      await g.say('troubled');
      g.award('troubled');
      await g.say('remember');
      g.award('failures');
      g.show('joseph');
    },
  },
  {
    id: 'ready', spawn: [14, 14],
    enter(g) { g.show('joseph'); },
    goal: 'Help Joseph get ready for Pharaoh: 0 of 2', marker: 'joseph',
    solve: ['basin', 'linen'],
    trigger: { signal: 'ready' },
    async run(g) {
      g.setLook('joseph', { skin: '#c98f62', top: '#f2efe6', sash: '#5d4526', beard: false, hair: '#2a211c' });
      await g.say('shaved');
      g.award('shaved');
      g.walk('joseph', [[20, 14], [20, 10]], 110);
    },
  },
  {
    id: 'interpret', spawn: [18, 13],
    enter(g) { g.show('joseph'); g.setLook('joseph', { skin: '#c98f62', top: '#f2efe6', sash: '#5d4526', beard: false, hair: '#2a211c' }); g.place('joseph', 20, 10, 'up'); },
    goal: 'Follow Joseph before Pharaoh.', marker: null,
    trigger: { zone: [17, 9, 22, 11] },
    async run(g) {
      g.place('joseph', 19, 9, 'up');
      g.place('player', 17, 11, 'up');
      await g.say('before');
      g.award('god');
      await g.say('meaning');
      g.award('one');
      g.award('years');
      await g.say('famine_warning');
      g.award('famine');
      await g.say('advice');
      g.award('wise');
      await g.say('appointed');
      g.award('spirit');
      g.setLook('joseph', { top: '#f2efe6', sash: '#e3b93a', head: 'band', headColor: '#e3b93a' });
      await g.say('ring');
      g.award('ring');
      await g.say('bow');
      g.award('bow');
      await g.say('name');
      g.award('name');
    },
  },
  {
    id: 'store', spawn: [18, 16],
    enter(g) { g.show('joseph'); g.setLook('joseph', { top: '#f2efe6', sash: '#e3b93a', head: 'band', headColor: '#e3b93a' }); g.place('joseph', 18, 16, 'down'); },
    goal: 'Store the grain, one year at a time: 0 of 7', marker: 'heap2',
    solve: [...['heap1', 'granary1', 'heap2', 'granary1', 'heap3', 'granary1', 'heap1', 'granary1', 'heap2', 'granary1', 'heap3', 'granary1', 'heap1', 'granary1']],
    trigger: { signal: SEVEN },
    async intro(g) { g.place('joseph', 18, 16, 'down'); await g.say('store_start'); g.award('thirty'); },
    async run(g) {
      await g.say('stored');
      g.award('abundance');
      g.show('asenath'); g.place('asenath', 22, 17, 'down');
      await g.say('sons');
      g.award('manasseh');
      g.award('ephraim');
    },
  },
  {
    id: 'famine', spawn: [20, 16],
    enter(g) { g.show('joseph'); g.setLook('joseph', { top: '#f2efe6', sash: '#e3b93a', head: 'band', headColor: '#e3b93a' }); },
    begin(g) {
      if (g.state.dry) return;
      g.state.dry = true;
      g.ground(FAMINE, 0);
      g.hide('overseer');
      g.show('asenath'); g.place('asenath', 23, 17, 'down');
      g.show('stranger'); g.show('mother');
      g.place('joseph', 21, 20, 'down');
      g.place('stranger', 17, 20, 'right'); g.place('mother', 19, 21, 'right');
    },
    goal: 'Talk to Joseph at the storehouse.', marker: 'joseph',
    trigger: { talk: 'joseph' },
    async intro(g) { await g.fadeOut(600); g.sky({}); await g.fadeIn(600); await g.say('famine_begins'); g.award('hunger'); await g.say('whatever'); g.award('whatever'); },
    async run(g) {
      await g.say('opened');
      g.award('nations_come');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
