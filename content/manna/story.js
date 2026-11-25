// Bread from Heaven (Exodus 16): the people grumble in the desert, quail come
// in the evening, and the manna falls every morning: enough for each day, twice as
// much before the Sabbath, and none kept overnight. The words are in dialogue.csv.

import { robe, lady, discover, makeMap, animal, taps } from '../../src/storykit.js';

export const id = 'manna';
export const title = 'Bread from Heaven';
export const where = 'The Desert of Sin';
export const ref = 'Exodus 16';
export const place = [33.97, 28.4];   // between Elim and Sinai
export const after = null;

// ----------------------------------------------------------------------- map
//   s  desert    x  desert brush    ,  path    #  cliff

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
export const map = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (y === 15 && x < 30 || x === 15 && y >= 8 && y <= 15) return ',';
  return (x * 5 + y * 3) % 17 === 0 ? 'x' : 's';
});

export const start = [5, 22];
export const door = [3, 23];
export const barriers = [];

// -------------------------------------------------------------------- the manna

// A family of three in the tent: one omer each. On the sixth day, two each.
const gather1 = taps('omer', { step: 'morning', total: 3, goal: 'Gather an omer of manna for each person in the tent', keep: false });
const gather6 = taps('twice', { step: 'sixth', total: 6, goal: 'Gather two omers for each person in the tent', keep: false });
const FLAKES1 = [[20, 18], [24, 20], [28, 17]].map(([x, y], i) => ({ id: `manna${i + 1}`, type: 'mannaflake', x, y, label: 'gather the manna', onUse: gather1 }));
const FLAKES6 = [[19, 17], [22, 21], [25, 18], [27, 22], [30, 19], [32, 16]].map(([x, y], i) => ({ id: `flake${i + 1}`, type: 'mannaflake', x, y, label: 'gather the manna', onUse: gather6 }));

// -------------------------------------------------------------------- people

const israelite = (over = {}) => robe({ top: '#a9845a', ...over });
const quail = (id, at) => ({ id, name: 'a quail', at, hidden: true, solid: false, look: { kind: 'bird' }, headroom: 30 });

export const actors = [
  { id: 'moses', name: 'Moses', at: [18, 12], dir: 'down', chat: 'moses_idle', look: robe({ top: '#a9845a', sash: '#5d4526', hair: '#d8d8d8', beard: '#d8d8d8', head: 'cloth', headColor: '#e8e0cc', item: 'staff' }) },
  { id: 'aaron', name: 'Aaron', at: [21, 12], dir: 'down', chat: 'aaron_idle', look: robe({ top: '#f1ede0', sash: '#3d6fb5', hair: '#cfcfcf', beard: '#cfcfcf', head: 'cloth', headColor: '#e8e0cc' }) },
  { id: 'grumbler', name: 'a hungry man', at: [10, 19], dir: 'right', chat: 'grumbler_idle', look: israelite({ top: '#8a3a3a', beard: true }) },
  { id: 'mother', name: 'the mother', at: [8, 15], dir: 'right', onUse: discover('disc_mother', 'omer'), look: lady('#6b8a4f', { hair: '#2a211c' }) },
  { id: 'girl', name: 'the little girl', at: [10, 22], dir: 'right', scale: 0.7, onUse: discover('disc_girl', 'what_is_it'), look: robe({ top: '#c9893f', hairStyle: 'braids', hair: '#2a211c' }) },
  { id: 'neighbor', name: 'the neighbor', at: [13, 17], dir: 'right', chat: 'neighbor_idle', look: israelite({ top: '#7d5a8a', beard: true }) },
  { id: 'elder', name: 'an old woman', at: [26, 9], dir: 'left', onUse: discover('disc_elder', 'honey'), look: lady('#a85a4a', { hair: '#e8e8e8' }) },
  quail('quail1', [24, 12]), quail('quail2', [26, 14]), quail('quail3', [28, 11]), quail('quail4', [22, 16]), quail('quail5', [30, 14]), quail('quail6', [20, 14]),
];

// -------------------------------------------------------------------- things

export const objects = [
  { type: 'tent', x: 6, y: 13 }, { type: 'tent', x: 5, y: 20 }, { type: 'ptent', x: 12, y: 20 }, { type: 'tent', x: 14, y: 11 }, { type: 'tent', x: 3, y: 17 },
  { type: 'fire', x: 9, y: 18 },
  { type: 'rock', x: 28, y: 8 }, { type: 'bigrock', x: 33, y: 12 }, { type: 'rock', x: 24, y: 24 }, { type: 'bigrock', x: 34, y: 23 },
  { id: 'jar', type: 'jars', x: 22, y: 12, label: 'look at the jar of manna', onUse: g => g.say('jar_look') },
];

const settle = (g, spots) => { for (const [id, x, y, dir] of spots) g.place(id, x, y, dir || 'down'); };
const OPEN = [['moses', 18, 12], ['aaron', 21, 12]];

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'grumble',
    goal: 'Talk to the hungry man, by the fire.', marker: 'grumbler',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'grumbler' },
    async run(g) {
      await g.say('grumble');
      g.award('grumbled');
      await g.say('grumble2');
      g.award('pots_of_meat');
    },
  },
  {
    id: 'promise', spawn: [14, 17],
    goal: 'Talk to Moses.', marker: 'moses',
    trigger: { talk: 'moses' },
    async run(g) {
      await g.say('promise');
      g.award('bread_from_heaven');
      g.award('test');
      await g.say('glory');
      g.award('glory');
      await g.pan(26, 6, 900);
      const light = g.fx('glow', 26 * g.T, 4 * g.T).setScale(3).setAlpha(0);
      await g.tween({ targets: light, alpha: 1, duration: 900 });
      await g.say('twilight');
      await g.tween({ targets: light, alpha: 0, duration: 900 });
      light.destroy();
      await g.follow(700);
      // Evening: the quail come.
      g.sky({ night: true });
      for (const id of ['quail1', 'quail2', 'quail3', 'quail4', 'quail5', 'quail6']) { g.show(id); g.patrol(id, [[20 + Math.floor(Math.random() * 12), 10 + Math.floor(Math.random() * 8)], [18 + Math.floor(Math.random() * 12), 12 + Math.floor(Math.random() * 8)]], 50, 0.4); }
      await g.say('quail');
      g.award('quail');
    },
  },
  {
    id: 'morning', spawn: [14, 17],
    enter(g) { g.sky({}); },
    begin(g) { g.sky({}); FLAKES1.forEach(f => g.addProp(f)); },
    goal: 'Gather an omer of manna for each person in the tent: 0 of 3', marker: null,
    solve: ['manna1', 'manna2', 'manna3'],
    trigger: { signal: 'morning' },
    async intro(g) {
      for (const id of ['quail1', 'quail2', 'quail3', 'quail4', 'quail5', 'quail6']) g.hide(id);
      g.sky({});
      await g.say('dew');
      g.award('dew');
      await g.say('flakes');
      g.award('flakes');
      g.award('what_is_it_q');
    },
    async run(g) {
      await g.say('measured');
      g.award('no_excess');
      await g.say('none_overnight');
      g.award('none_until_morning');
    },
  },
  {
    id: 'spoiled', spawn: [14, 17],
    begin(g) { g.setChat('neighbor', 'neighbor_spoiled'); },
    goal: 'Talk to the neighbor. Something smells.', marker: 'neighbor',
    trigger: { talk: 'neighbor' },
    async run(g) {
      await g.say('spoiled');
      g.award('maggots');
      await g.say('melts');
      g.award('melted');
    },
  },
  {
    id: 'sixth', spawn: [14, 17],
    begin(g) { FLAKES6.forEach(f => g.addProp(f)); },
    goal: 'Gather two omers for each person in the tent: 0 of 6', marker: null,
    solve: ['flake1', 'flake2', 'flake3', 'flake4', 'flake5', 'flake6'],
    trigger: { signal: 'sixth' },
    async intro(g) { await g.say('sixth_start'); g.award('twice'); },
    async run(g) {
      await g.say('sixth_report');
      g.award('two_omers');
      await g.say('sabbath_rule');
      g.award('sabbath');
      await g.say('kept');
      g.award('did_not_spoil');
    },
  },
  {
    id: 'sabbath', spawn: [14, 17],
    goal: 'Walk out to the field and look for manna.', marker: null,
    trigger: { zone: [24, 18, 30, 20] },
    async run(g) {
      await g.say('seventh');
      g.award('nothing');
      await g.say('rest');
      g.award('rested');
      await g.say('how_long');
      g.award('keep_commandments');
    },
  },
  {
    id: 'farewell', spawn: [20, 14],
    goal: 'Talk to Aaron, by the jar.', marker: 'aaron',
    trigger: { talk: 'aaron' },
    async run(g) {
      await g.say('named');
      g.award('manna_named');
      await g.say('jar');
      g.award('jar');
      await g.say('forty_years');
      g.award('forty');
      await g.say('bread_of_life');
      g.award('true_bread');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
