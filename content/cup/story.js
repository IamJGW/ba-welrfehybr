// The Brothers Come (Genesis 42-44): the famine reaches Canaan, ten brothers
// come to Egypt to buy grain and bow to a ruler who is Joseph, the test, and the
// silver cup in Benjamin's sack, ending with Judah's plea. The words are in
// dialogue.csv.

import { robe, lady, discover, makeMap, animal, job, trips } from '../../src/storykit.js';

export const id = 'cup';
export const title = 'The Brothers Come';
export const where = "Joseph's house in Egypt, and Jacob's camp in Canaan";
export const ref = 'Genesis 42-44';
export const place = [31.85, 30.8];   // Rameses
export const after = 'pharaoh';

// ----------------------------------------------------------------------- map
//   .  grass    p  paving    s  desert    ,  path

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 25;
// The story opens in the dry camp in Canaan; Joseph's courtyard in Egypt takes its place.
const EGYPT_GROUND = makeMap((x, y) => {
  if (edge(x, y)) return 's';
  if (x >= 6 && x <= 31 && y >= 4 && y <= 17) return 'p';
  return '.';
});
export const map = makeMap((x, y) => {
  if (edge(x, y)) return 's';
  if (y === 18 && x < 24 || x === 17 && y >= 10 && y <= 18) return ',';
  return (x * 7 + y * 3) % 11 === 0 ? '.' : 's';
});

export const start = [6, 21];
export const door = [4, 22];
export const barriers = [];

// -------------------------------------------------------------------- jobs

const portion = job('portion', { step: 'feast', total: 5, goal: "Bring Benjamin's portions", target: 'benjamin', hold: 'bread', reuse: true });
const sacks = job('sacks', { step: 'load', total: 3, goal: 'Load the brothers\' donkeys', target: 'donkey1', hold: 'bundle' });

// -------------------------------------------------------------------- people

const SKIN = '#b07848';
const egyptian = (over = {}) => robe({ skin: SKIN, top: '#f2efe6', sash: '#4a7ab0', hair: '#1f1a17', hairStyle: 'bob', ...over });
const brother = (id, name, at, top, over = {}) => ({ id, name, at, dir: 'down', look: robe({ top, beard: true, ...over }) });

export const actors = [
  { id: 'joseph', name: 'Joseph', at: [19, 8], dir: 'down', hidden: true, chat: 'joseph_idle', look: egyptian({ skin: '#c98f62', top: '#f2efe6', sash: '#e3b93a', head: 'band', headColor: '#e3b93a', hair: '#2a211c' }) },
  { id: 'steward', name: "Joseph's steward", at: [24, 10], dir: 'left', hidden: true, chat: 'steward_idle', look: egyptian({ top: '#c9a24a', sash: '#8a3a3a' }) },
  { id: 'interpreter', name: 'the interpreter', at: [16, 9], dir: 'right', hidden: true, onUse: discover('disc_interpreter', 'interpreter'), look: egyptian({ top: '#4a7ab0' }) },
  { id: 'jacob', name: 'Jacob', at: [17, 8], dir: 'down', chat: 'jacob_idle', look: robe({ top: '#7d5a8a', sash: '#e3b93a', hair: '#cfcfcf', beard: '#cfcfcf', head: 'cloth', headColor: '#e8e0cc', item: 'staff' }) },
  brother('reuben', 'Reuben', [14, 13], '#7a5a3a'),
  brother('simeon', 'Simeon', [16, 14], '#8a3a3a'),
  brother('judah', 'Judah', [19, 13], '#4f8a6a'),
  brother('levi', 'Levi', [21, 14], '#a9845a'),
  brother('dan', 'Dan', [13, 15], '#3d6fb5'),
  brother('asher', 'Asher', [22, 12], '#b5764a'),
  { id: 'benjamin', name: 'Benjamin', at: [18, 15], dir: 'up', hidden: true, scale: 0.9, onUse: (g, t) => (g.stepId === 'feast' ? portion.give(g) : g.say('benjamin_idle')), look: robe({ top: '#d9b45a' }) },
  animal('donkey1', 'donkey', [10, 17], { hidden: true, name: 'a donkey', label: 'load the donkey', onUse: sacks.give }),
  animal('donkey2', 'donkey', [9, 19], { hidden: true, name: 'a donkey' }),
  { id: 'servant', name: 'a servant', at: [27, 8], dir: 'left', hidden: true, onUse: discover('disc_servant', 'separate'), look: egyptian({ top: '#d9c9a3' }) },
];

// -------------------------------------------------------------------- things

const EGYPT = [
  { id: 'palace', type: 'palace', x: 14, y: 3 },
  { id: 'throne', type: 'throne', x: 19, y: 6 },
  { id: 'col1', type: 'column', x: 8, y: 7 }, { id: 'col2', type: 'column', x: 8, y: 12 }, { id: 'col3', type: 'column', x: 30, y: 7 }, { id: 'col4', type: 'column', x: 30, y: 12 },
  { id: 'pile1', type: 'sacks', x: 8, y: 16, item: 'a sack of grain', label: 'lift a sack of grain', onUse: sacks.take },
  { id: 'pile2', type: 'sacks', x: 12, y: 20, item: 'a sack of grain', label: 'lift a sack of grain', onUse: sacks.take },
  { id: 'pile3', type: 'sacks', x: 6, y: 18, item: 'a sack of grain', label: 'lift a sack of grain', onUse: sacks.take },
  { id: 'dishes', type: 'oven', x: 27, y: 13, item: 'a plate of food', label: 'pick up a plate of food', onUse: portion.take },
  { id: 'table1', type: 'table', x: 14, y: 11 }, { id: 'table2', type: 'table', x: 24, y: 11 },
];
const CAMP = [
  { id: 'tent1', type: 'bigtent', x: 15, y: 5 }, { id: 'tent2', type: 'tent', x: 22, y: 6 }, { id: 'tent3', type: 'tent', x: 10, y: 7 },
  { id: 'fire', type: 'fire', x: 17, y: 12 },
  { id: 'rock1', type: 'rock', x: 28, y: 15 }, { id: 'rock2', type: 'rock', x: 7, y: 15 },
];
export const objects = [{ type: 'palm', x: 4, y: 8 }, { type: 'palm', x: 33, y: 20 }, ...CAMP];   // the story begins in Canaan
const EGYPT_ONLY = EGYPT;

const toEgypt = g => {
  if (g.state.egypt) return;
  g.state.egypt = true;
  CAMP.forEach(o => g.removeProp(o.id));
  g.ground(EGYPT_GROUND, 0);
  EGYPT_ONLY.forEach(o => g.addProp(o));
  g.hide('jacob');
  for (const id of ['joseph', 'steward', 'interpreter', 'servant']) g.show(id);
  g.place('joseph', 19, 8, 'down');
};
const toCanaan = g => {
  if (!g.state.egypt) return;
  g.state.egypt = false;
  EGYPT_ONLY.forEach(o => g.removeProp(o.id));
  g.ground(map, 0);
  CAMP.forEach(o => g.addProp(o));
  for (const id of ['joseph', 'steward', 'interpreter', 'servant', 'donkey1', 'donkey2']) g.hide(id);
  g.show('jacob'); g.place('jacob', 17, 8, 'down');
};
const group = (g, spots) => { for (const [id, x, y, dir] of spots) { g.show(id); g.place(id, x, y, dir); } };
const BROTHERS_EGYPT = [['reuben', 14, 12, 'up'], ['simeon', 16, 13, 'up'], ['judah', 19, 12, 'up'], ['levi', 21, 13, 'up'], ['dan', 13, 14, 'up'], ['asher', 23, 12, 'up']];
const BROTHERS_CAMP = [['reuben', 13, 13, 'up'], ['simeon', 15, 14, 'up'], ['judah', 19, 13, 'up'], ['levi', 21, 14, 'up'], ['dan', 12, 15, 'up'], ['asher', 22, 12, 'up']];

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'canaan',
    goal: 'Talk to Jacob, in the dry camp.', marker: 'jacob',
    enter(g) { g.sky({}); },
    async intro(g) { group(g, BROTHERS_CAMP); g.place('player', 16, 16, 'up'); await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'jacob' },
    async run(g) {
      await g.say('send');
      g.award('staring');
      await g.say('send_after');
      g.award('benjamin_stays');
      await g.fadeOut(900);
    },
  },
  {
    id: 'hall', spawn: [12, 16],
    enter(g) { toEgypt(g); },
    async intro(g) { toEgypt(g); group(g, BROTHERS_EGYPT); g.place('player', 19, 17, 'up'); await g.fadeIn(900); await g.say('hall_arrive'); },
    goal: 'Stand near Joseph and listen.', marker: null,
    trigger: { zone: [17, 10, 21, 11] },
    async run(g) {
      g.place('player', 20, 15, 'up');
      await g.say('bow');
      g.award('bowed');
      await g.say('spies');
      g.award('spies');
      await g.say('test');
      g.award('test');
      await g.say('remember');
      g.award('anguish');
      await g.say('weeps');
      g.award('wept');
      g.hide('simeon');
    },
  },
  {
    id: 'load', spawn: [14, 16],
    enter(g) { toEgypt(g); g.hide('simeon'); },
    begin(g) { g.show('donkey1'); g.show('donkey2'); g.place('donkey1', 10, 17, 'right'); g.place('donkey2', 9, 19, 'right'); },
    goal: "Load the brothers' donkeys: 0 of 3", marker: 'pile1',
    solve: trips(['pile1', 'pile2', 'pile3'], 'donkey1'),
    trigger: { signal: 'load' },
    async run(g) {
      await g.say('silver_back');
      g.award('silver');
      await g.say('silver_found');
      g.award('what_god');
      await g.fadeOut(900);
    },
  },
  {
    id: 'return', spawn: [14, 17],
    enter(g) { toCanaan(g); },
    async intro(g) { toCanaan(g); g.hide('simeon'); group(g, BROTHERS_CAMP.filter(b => b[0] !== 'simeon')); g.place('player', 16, 16, 'up'); await g.fadeIn(900); await g.say('return_arrive'); },
    goal: 'Talk to Judah, by the fire.', marker: 'judah',
    trigger: { talk: 'judah' },
    async run(g) {
      await g.say('simeon_gone');
      g.award('simeon');
      await g.say('judah_pledge');
      g.award('pledge');
      await g.say('jacob_agrees');
      g.award('bereaved');
      await g.fadeOut(900);
    },
  },
  {
    id: 'feast', spawn: [24, 14],
    enter(g) { toEgypt(g); group(g, BROTHERS_EGYPT); g.show('benjamin'); g.place('benjamin', 18, 15, 'up'); g.place('player', 25, 16, 'left'); },
    async intro(g) { toEgypt(g); group(g, BROTHERS_EGYPT); g.show('benjamin'); g.place('benjamin', 18, 15, 'up'); g.place('player', 25, 16, 'left'); await g.fadeIn(900); await g.say('feast_arrive'); },
    goal: "Bring Benjamin's portions: 0 of 5", marker: 'dishes',
    solve: trips(['dishes'], 'benjamin').concat(trips(['dishes'], 'benjamin'), trips(['dishes'], 'benjamin'), trips(['dishes'], 'benjamin'), trips(['dishes'], 'benjamin')),
    trigger: { signal: 'feast' },
    async run(g) {
      await g.say('five_times');
      g.award('portion');
      await g.say('benjamin_seen');
      g.award('gracious');
    },
  },
  {
    id: 'cup', spawn: [24, 14],
    enter(g) { toEgypt(g); group(g, BROTHERS_EGYPT); g.show('benjamin'); g.place('benjamin', 18, 15, 'up'); },
    goal: 'Talk to the steward.', marker: 'steward',
    trigger: { talk: 'steward' },
    async run(g) {
      await g.say('cup_order');
      g.award('cup_in_sack');
      await g.fadeOut(700);
      g.sky({});
      await g.fadeIn(700);
      await g.say('cup_chase');
      g.award('good_for_evil');
      await g.say('cup_found');
      g.award('found');
      await g.say('cup_back');
      g.award('tore');
      await g.say('plea');
      g.award('plea');
      await g.say('plea_end');
      g.award('misery');
    },
  },
  {
    id: 'farewell', spawn: [20, 14],
    enter(g) { toEgypt(g); group(g, BROTHERS_EGYPT); g.show('benjamin'); g.place('benjamin', 18, 15, 'up'); },
    goal: 'Talk to Judah when you are ready to go.', marker: 'judah',
    trigger: { talk: 'judah' },
    async run(g) {
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
