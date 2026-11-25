// Building the Tabernacle (Exodus 25; 35-40): the people give more than enough,
// the craftsmen build the tent where God will dwell among them, and the cloud
// fills it. The words are in dialogue.csv.

import { robe, lady, discover, makeMap, job, trips, taps } from '../../src/storykit.js';

export const id = 'tabernacle';
export const title = 'Building the Tabernacle';
export const where = 'The camp at Mount Sinai';
export const ref = 'Exodus 25; 35-40';
export const place = [33.97, 28.4];   // Mount Sinai
export const after = 'calf';

// ----------------------------------------------------------------------- map
//   s  desert    p  courtyard paving    ,  path    #  cliff

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
export const map = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (x >= 12 && x <= 28 && y >= 6 && y <= 16) return 'p';
  if (y === 20 && x < 12 || y === 20 && x > 28 || x === 20 && y >= 16 && y <= 20) return ',';
  return 's';
});

export const start = [5, 22];
export const door = [3, 23];
export const barriers = [];

// -------------------------------------------------------------------- the offerings and the building

const bring = job('offer', { step: 'offerings', total: 4, goal: 'Bring the offerings to the craftsmen', target: 'bench', hold: 'bundle' });
const raise = taps('frame', { step: 'build', total: 4, goal: 'Raise the frames of the tent', marker: null });
const FRAMES = [[14, 8], [17, 8], [20, 8], [23, 8]].map(([x, y], i) => ({ id: `frame${i + 1}`, type: 'woodpile', x, y, label: 'raise the frame', onUse: raise }));

// -------------------------------------------------------------------- people

const israelite = (over = {}) => robe({ top: '#a9845a', ...over });

export const actors = [
  { id: 'moses', name: 'Moses', at: [20, 18], dir: 'down', chat: 'moses_idle', look: robe({ top: '#a9845a', sash: '#5d4526', hair: '#d8d8d8', beard: '#d8d8d8', head: 'cloth', headColor: '#e8e0cc', item: 'staff' }) },
  { id: 'bezalel', name: 'Bezalel', at: [26, 18], dir: 'left', chat: 'bezalel_idle', look: israelite({ top: '#c9893f', sash: '#5d4526', beard: true, head: 'band', headColor: '#4f8a6a' }) },
  { id: 'oholiab', name: 'Oholiab', at: [28, 20], dir: 'left', onUse: discover('disc_oholiab', 'oholiab'), look: israelite({ top: '#4a7ab0', beard: true }) },
  { id: 'spinner', name: 'a woman spinning', at: [8, 17], dir: 'right', onUse: discover('disc_spinner', 'spun'), look: lady('#8a3a3a', { hair: '#2a211c' }) },
  { id: 'giver', name: 'a man with an offering', at: [10, 20], dir: 'right', onUse: discover('disc_giver', 'willing'), look: israelite({ top: '#7d5a8a', beard: true }) },
  { id: 'aaron', name: 'Aaron', at: [22, 21], dir: 'left', onUse: discover('disc_aaron', 'garments'), look: robe({ top: '#f1ede0', sash: '#3d6fb5', hair: '#cfcfcf', beard: '#cfcfcf', head: 'cloth', headColor: '#e8e0cc' }) },
  { id: 'child', name: 'a child', at: [6, 22], dir: 'right', scale: 0.75, onUse: discover('disc_child', 'more_than_enough'), look: robe({ top: '#d9b45a' }) },
];

// -------------------------------------------------------------------- things

export const objects = [
  { type: 'tent', x: 3, y: 12 }, { type: 'tent', x: 4, y: 18 }, { type: 'tent', x: 32, y: 13 }, { type: 'ptent', x: 34, y: 18 },
  { type: 'rock', x: 8, y: 9 }, { type: 'bigrock', x: 33, y: 7 }, { type: 'palm', x: 7, y: 13 },
  { id: 'bench', type: 'table', x: 26, y: 20, label: 'put it on the craftsmen\'s bench', onUse: bring.give },
  { id: 'gold', type: 'sacks', x: 6, y: 14, item: 'gold jewelry', label: 'pick up the gold jewelry', onUse: bring.take },
  { id: 'yarn', type: 'sheaves', x: 10, y: 24, item: 'blue and scarlet yarn', label: 'pick up the yarn', onUse: bring.take },
  { id: 'wood', type: 'woodpile', x: 32, y: 21, item: 'acacia wood', label: 'pick up the acacia wood', onUse: bring.take },
  { id: 'oil', type: 'jars', x: 30, y: 24, item: 'olive oil', label: 'pick up the oil', onUse: bring.take },
];
const TENT = { id: 'tent', type: 'tabernacle', x: 14, y: 6 };
const POSTS = [[12, 5], [12, 10], [12, 15], [28, 5], [28, 10], [28, 15], [20, 16], [24, 16]].map(([x, y], i) => ({ id: `fence${i}`, type: 'post', x, y }));
const ARK = { id: 'ark', type: 'arkcov', x: 20, y: 13 };
const LAMP = { id: 'lamp', type: 'lampstand', x: 17, y: 13 };
const ALTAR = { id: 'altar', type: 'altar', x: 20, y: 11 };

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'plan',
    goal: 'Talk to Moses, near the middle of the camp.', marker: 'moses',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'moses' },
    async run(g) {
      await g.say('dwell');
      g.award('dwell');
      g.award('pattern');
      await g.say('offering_call');
      g.award('freewill');
    },
  },
  {
    id: 'offerings', spawn: [20, 20],
    goal: 'Bring the offerings to the craftsmen: 0 of 4', marker: 'gold',
    solve: trips(['gold', 'yarn', 'wood', 'oil'], 'bench'),
    trigger: { signal: 'offerings' },
    async run(g) {
      await g.say('gifts');
      g.award('gold_jewelry');
      g.award('yarn');
      g.award('acacia');
      g.award('oil');
      g.award('freewill_all');
    },
  },
  {
    id: 'craftsmen', spawn: [24, 19],
    goal: 'Talk to Bezalel, the chief craftsman.', marker: 'bezalel',
    trigger: { talk: 'bezalel' },
    async run(g) {
      await g.say('bezalel');
      g.award('bezalel');
      g.award('filled_with_spirit');
      await g.say('skills');
      g.award('craftsmanship');
      await g.say('enough');
      g.award('more_than_enough_q');
      await g.say('stop');
      g.award('no_more');
    },
  },
  {
    id: 'build', spawn: [20, 14],
    begin(g) { FRAMES.forEach(f => g.addProp(f)); },
    goal: 'Raise the frames of the tent: 0 of 4', marker: null,
    solve: ['frame1', 'frame2', 'frame3', 'frame4'],
    trigger: { signal: 'build' },
    async intro(g) { await g.say('build_start'); },
    async run(g) {
      g.addProp(TENT);
      POSTS.forEach(p => g.addProp(p));
      g.flash(200);
      await g.say('built');
      g.award('completed');
      await g.say('just_as');
      g.award('just_as');
    },
  },
  {
    id: 'ark', spawn: [20, 18],
    enter(g) { g.addProp(TENT); POSTS.forEach(p => g.addProp(p)); },
    goal: 'Talk to Moses, by the new tent.', marker: 'moses',
    trigger: { talk: 'moses' },
    async run(g) {
      g.place('moses', 20, 17, 'up');
      await g.say('ark');
      g.award('ark');
      g.addProp(ARK);
      g.addProp(LAMP);
      g.addProp(ALTAR);
      await g.say('mercy_seat');
      g.award('mercy_seat');
      await g.say('set_up');
      g.award('first_month');
      g.award('moses_did');
    },
  },
  {
    id: 'cloud', spawn: [20, 18],
    enter(g) { g.addProp(TENT); POSTS.forEach(p => g.addProp(p)); g.addProp(ARK); g.addProp(LAMP); g.addProp(ALTAR); },
    goal: 'Walk up to the new tent.', marker: null,
    trigger: { zone: [17, 14, 23, 15] },
    async run(g) {
      g.place('moses', 18, 15, 'up');
      g.place('player', 21, 15, 'up');
      const cloud = g.fx('cloud', 20 * g.T, 5 * g.T).setScale(5).setAlpha(0);
      await g.tween({ targets: cloud, alpha: 1, duration: 1400 });
      g.flash(500);
      await g.say('cloud');
      g.award('cloud_covered');
      await g.say('glory');
      g.award('glory_filled');
      await g.say('unable');
      g.award('moses_unable');
      await g.say('journeys');
      g.award('cloud_lifted');
      g.award('fire_by_night');
      await g.say('word_became_flesh');
      g.award('dwelling');
    },
  },
  {
    id: 'farewell', spawn: [20, 18],
    enter(g) { g.addProp(TENT); POSTS.forEach(p => g.addProp(p)); g.addProp(ARK); g.addProp(LAMP); g.addProp(ALTAR); },
    goal: 'Talk to Moses, when you are ready.', marker: 'moses',
    trigger: { talk: 'moses' },
    async run(g) {
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
