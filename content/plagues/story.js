// Let My People Go (Exodus 5-11): Moses and Aaron before Pharaoh, bricks without
// straw, the plagues, and the warning of the last one. Goshen is spared, and the
// story is seen from there. The words are in dialogue.csv.

import { robe, lady, discover, makeMap, animal, taps } from '../../src/storykit.js';

export const id = 'plagues';
export const title = 'Let My People Go';
export const where = "Pharaoh's palace, the brickyards, and Goshen";
export const ref = 'Exodus 5-11';
export const place = [31.8, 30.6];   // Goshen, near Rameses
export const after = 'bush';

// ----------------------------------------------------------------------- map
// The palace in the north, the Nile in the east, and the brickyards and
// Goshen in the south-west.
//   .  grass    p  paving    ~  the Nile    S  deep water    k  brick ground    n  black soil    R  blood

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
const ground = water => makeMap((x, y) => {
  if (edge(x, y)) return 'S';
  if (x >= 34) return water ? 'R' : 'S';
  if (x >= 32) return water ? 'R' : '~';
  if (y >= 3 && y <= 11 && x >= 8 && x <= 28) return 'p';
  if (y >= 16 && y <= 24 && x >= 4 && x <= 18) return 'k';
  if (y === 13 && x < 32 || x === 20 && y >= 11 && y <= 13) return 'n';
  return '.';
});
export const map = ground(false);
const BLOOD = ground(true);

export const start = [10, 20];
export const door = [4, 22];
export const barriers = [];

// -------------------------------------------------------------------- the straw

const gather = taps('straw', { step: 'straw', total: 5, goal: 'Gather straw for the brickmakers' });
const STRAW = [[22, 15], [25, 19], [28, 15], [23, 22], [29, 21]].map(([x, y], i) => ({ id: `straw${i + 1}`, type: 'sheaves', x, y, label: 'gather the straw', onUse: gather }));

// -------------------------------------------------------------------- people

const SKIN = '#b07848';
const egyptian = (over = {}) => robe({ skin: SKIN, top: '#f2efe6', sash: '#4a7ab0', hair: '#1f1a17', hairStyle: 'bob', ...over });
const hebrew = (over = {}) => robe({ top: '#a9845a', ...over });
const lamb = (id, at, over = {}) => animal(id, 'lamb', at, { name: 'a sheep', ...over });

export const actors = [
  { id: 'moses', name: 'Moses', at: [8, 20], dir: 'right', chat: 'moses_idle', look: robe({ top: '#a9845a', sash: '#5d4526', hair: '#d8d8d8', beard: '#d8d8d8', head: 'cloth', headColor: '#e8e0cc', item: 'staff' }) },
  { id: 'aaron', name: 'Aaron', at: [10, 21], dir: 'right', chat: 'aaron_idle', look: robe({ top: '#f1ede0', sash: '#3d6fb5', hair: '#cfcfcf', beard: '#cfcfcf', head: 'cloth', headColor: '#e8e0cc' }) },
  { id: 'pharaoh', name: 'Pharaoh', at: [18, 5], dir: 'down', hidden: false, chat: 'pharaoh_idle', look: egyptian({ head: 'nemes', headColor: '#4a7ab0', sash: '#e3b93a', item: 'staff' }) },
  { id: 'official', name: 'an official', at: [14, 7], dir: 'right', chat: 'official_idle', look: egyptian({ top: '#c9a24a', sash: '#8a3a3a' }) },
  { id: 'magician', name: 'a magician', at: [22, 7], dir: 'left', onUse: discover('disc_magician', 'finger'), look: egyptian({ top: '#4a7ab0', head: 'cloth', headColor: '#e8e0cc' }) },
  { id: 'taskmaster', name: 'a taskmaster', at: [12, 17], dir: 'down', chat: 'taskmaster_idle', look: egyptian({ top: '#6a6a72', item: 'spear' }) },
  { id: 'foreman', name: 'a Hebrew foreman', at: [15, 21], dir: 'left', onUse: discover('disc_foreman', 'foremen'), look: hebrew({ top: '#8a6a3a', beard: true }) },
  { id: 'worker', name: 'a brickmaker', at: [7, 24], dir: 'right', onUse: discover('disc_worker', 'quota'), look: hebrew({ item: 'brick' }) },
  { id: 'woman', name: 'a Hebrew mother', at: [26, 17], dir: 'down', onUse: discover('disc_woman', 'light'), look: lady('#6b8a4f', { hair: '#2a211c' }) },
  { id: 'herder', name: 'a Hebrew shepherd', at: [29, 20], dir: 'left', onUse: discover('disc_herder', 'livestock'), look: hebrew({ top: '#7a5a3a' }) },
  lamb('lamb1', [30, 18]), lamb('lamb2', [27, 21]),
];

// -------------------------------------------------------------------- things

export const objects = [
  { type: 'palace', x: 14, y: 2 }, { type: 'throne', x: 18, y: 4 },
  { type: 'column', x: 9, y: 5 }, { type: 'column', x: 9, y: 9 }, { type: 'column', x: 27, y: 5 }, { type: 'column', x: 27, y: 9 },
  { type: 'kiln', x: 10, y: 19 }, { type: 'bricks', x: 14, y: 23 }, { type: 'claypit', x: 6, y: 18 }, { type: 'bricks', x: 8, y: 23 },
  { type: 'egyptHouse', x: 22, y: 25 }, { type: 'tent', x: 24, y: 14 },
  { type: 'reeds', x: 32, y: 8 }, { type: 'reeds', x: 32, y: 15 }, { type: 'reeds', x: 32, y: 20 },
  { type: 'palm', x: 30, y: 12 }, { type: 'palm', x: 20, y: 14 },
];

// One plague: some sky and ground, a few words, and a discovery for each.
const PLAGUES = [
  async g => { await g.ground(BLOOD, 1000); await g.say('plague_blood'); g.award('blood'); },
  async g => { g.ground(map, 600); g.shake(500, 0.004); await g.say('plague_frogs'); g.award('frogs'); },
  async g => { g.shake(300, 0.002); await g.say('plague_gnats'); g.award('gnats'); },
  async g => { g.flash(200); await g.say('plague_flies'); g.award('flies'); },
  async g => { g.shake(250, 0.003); await g.say('plague_livestock'); g.award('livestock'); },
  async g => { g.shake(250, 0.002); await g.say('plague_boils'); g.award('boils'); },
  async g => { g.sky({ rain: true }); g.shake(900, 0.006); await g.say('plague_hail'); g.award('hail'); },
  async g => { g.sky({ night: true }); await g.say('plague_locusts'); g.award('locusts'); },
  async g => { g.sky({}); g.dark(true); await g.say('plague_darkness'); g.award('darkness'); },
];

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'moses',
    goal: 'Talk to Moses and Aaron.', marker: 'moses',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'moses' },
    async run(g) {
      await g.say('moses');
      g.walk('moses', [[18, 13], [19, 11]], 100);
      g.walk('aaron', [[20, 13], [21, 11]], 100);
    },
  },
  {
    id: 'palace', spawn: [18, 14],
    enter(g) { g.place('moses', 19, 12, 'up'); g.place('aaron', 21, 12, 'up'); },
    goal: "Follow Moses and Aaron into Pharaoh's hall.", marker: null,
    trigger: { zone: [17, 8, 22, 9] },
    async run(g) {
      g.place('moses', 18, 9, 'up'); g.place('aaron', 20, 9, 'up');
      g.place('player', 19, 11, 'up');
      await g.say('before');
      g.award('let_go');
      await g.say('who_is');
      g.award('who_is');
      await g.say('three_days');
      g.award('three_days');
      await g.say('back_to_work');
      g.award('labor');
      await g.say('no_straw');
      g.award('no_straw');
      g.walk('moses', [[19, 13], [12, 20]], 110);
      await g.walk('aaron', [[20, 13], [13, 21]], 110);
    },
  },
  {
    id: 'straw', spawn: [18, 14],
    enter(g) { g.place('moses', 12, 20, 'right'); g.place('aaron', 13, 21, 'right'); },
    begin(g) { STRAW.forEach(s => g.addProp(s)); },
    goal: 'Gather straw for the brickmakers: 0 of 5', marker: null,
    solve: ['straw1', 'straw2', 'straw3', 'straw4', 'straw5'],
    trigger: { signal: 'straw' },
    async intro(g) { await g.say('straw_start'); g.award('gather_straw'); },
    async run(g) {
      await g.say('quota');
      g.award('quota_same');
      await g.say('complaint');
      g.award('stench');
      await g.say('prayer');
      g.award('why');
      await g.say('answer');
      g.award('know_lord');
    },
  },
  {
    id: 'plagues', spawn: [28, 14],
    enter(g) { g.place('moses', 30, 13, 'right'); g.place('aaron', 30, 15, 'left'); },
    goal: 'Talk to Moses at the Nile.', marker: 'moses',
    begin(g) { g.place('moses', 30, 13, 'right'); g.place('aaron', 30, 15, 'left'); },
    trigger: { talk: 'moses' },
    async run(g) {
      await g.say('plagues_start');
      for (const plague of PLAGUES) {
        await plague(g);
        await g.wait(250);
      }
      g.dark(false);
      g.sky({});
      g.ground(map, 900);
      await g.say('plagues_end');
    },
  },
  {
    id: 'goshen', spawn: [24, 14],
    enter(g) { g.place('moses', 30, 13, 'right'); g.place('aaron', 30, 15, 'left'); },
    goal: 'Talk to the mother in the Hebrew camp.', marker: 'woman',
    trigger: { talk: 'woman' },
    async run(g) {
      await g.say('goshen_spared');
      g.award('goshen');
      await g.say('goshen_think');
    },
  },
  {
    id: 'warning', spawn: [24, 14],
    enter(g) { g.place('moses', 30, 13, 'right'); g.place('aaron', 30, 15, 'left'); },
    goal: 'Talk to Moses, by the river.', marker: 'moses',
    trigger: { talk: 'moses' },
    async run(g) {
      await g.say('last_plague');
      g.award('midnight');
      await g.say('distinction');
      g.award('distinction');
      await g.say('hardened');
      g.award('hardened');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
