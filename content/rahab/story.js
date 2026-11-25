// Rahab and the Spies (Joshua 2): two spies slip into Jericho, Rahab hides them
// on her roof, lets them down by a rope, and ties a scarlet cord in her window.
// There is a note for parents. The words are in dialogue.csv.

import { robe, lady, discover, makeMap, soldier, job, trips, taps } from '../../src/storykit.js';

export const id = 'rahab';
export const title = 'Rahab and the Spies';
export const where = 'The city of Jericho';
export const ref = 'Joshua 2';
export const place = [35.444, 31.87];   // Jericho
export const after = null;

// ----------------------------------------------------------------------- map
//   .  grass    ,  road    #  wall    p  paving    k  roof

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
export const map = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (x >= 2 && x <= 13 && y >= 3 && y <= 8) return 'k';
  if (y < 15) return (y === 11 || x === 20 && y >= 8) ? ',' : 'p';
  if (x === 20) return ',';
  return '.';
});

export const start = [5, 23];
export const door = [3, 24];
export const barriers = [];

// -------------------------------------------------------------------- the flax and the rope

const hide = job('flax', { step: 'flax', total: 3, goal: 'Cover the spies with flax', target: 'spy1', hold: 'bundle' });
const lower = taps('rope', { step: 'rope', total: 1, goal: 'Let the spies down by the rope', keep: true });
const tie = taps('cord', { step: 'cord', total: 1, goal: 'Tie the scarlet cord in the window', keep: true });

// -------------------------------------------------------------------- people

const guard = (id, name, at) => ({ id, name, at, dir: 'down', solid: false, chat: 'guard_idle', look: soldier({ top: '#7a5a3a', skin: '#a06a42', head: 'helmet' }) });

export const actors = [
  { id: 'spy1', name: 'the first spy', at: [20, 22], dir: 'up', onUse: g => (g.stepId === 'flax' ? hide.give(g) : g.say('spy_idle')), look: robe({ top: '#7d5a8a', beard: true }) },
  { id: 'spy2', name: 'the second spy', at: [22, 23], dir: 'up', chat: 'spy_idle', look: robe({ top: '#4f8a6a', beard: true }) },
  { id: 'rahab', name: 'Rahab', at: [8, 9], dir: 'down', chat: 'rahab_idle', look: lady('#c0415a', { skin: '#c98f62', hair: '#2a211c' }) },
  { id: 'kingsman1', name: "one of the king's men", at: [20, 20], dir: 'up', hidden: true, look: soldier({ top: '#6a3a3a', skin: '#a06a42', head: 'helmet' }) },
  { id: 'kingsman2', name: "one of the king's men", at: [22, 21], dir: 'up', hidden: true, look: soldier({ top: '#6a3a3a', skin: '#a06a42', head: 'helmet' }) },
  guard('guard1', 'a city guard', [14, 12]), guard('guard2', 'a city guard', [26, 13]),
  { id: 'merchant', name: 'a merchant', at: [28, 9], dir: 'left', onUse: discover('disc_merchant', 'fear'), look: robe({ top: '#8a3a3a', skin: '#a06a42', head: 'cloth', headColor: '#e8e0cc' }) },
  { id: 'father', name: "Rahab's father", at: [11, 6], dir: 'down', onUse: discover('disc_father', 'family'), look: robe({ top: '#7a5a3a', skin: '#a06a42', hair: '#cfcfcf', beard: '#cfcfcf' }) },
  { id: 'sister', name: "Rahab's sister", at: [4, 6], dir: 'right', scale: 0.9, onUse: discover('disc_sister', 'sisters'), look: lady('#3d6fb5', { skin: '#c98f62', hair: '#2a211c' }) },
];

// -------------------------------------------------------------------- things

export const objects = [
  { id: 'gate', type: 'gatehouse', x: 17, y: 15 },
  { id: 'wall1', type: 'citywall', x: 2, y: 15 }, { id: 'wall2', type: 'citywall', x: 6, y: 15 }, { id: 'wall3', type: 'citywall', x: 10, y: 15 }, { id: 'wall4', type: 'citywall', x: 14, y: 15 },
  { id: 'wall5', type: 'citywall', x: 22, y: 15 }, { id: 'wall6', type: 'citywall', x: 26, y: 15 }, { id: 'wall7', type: 'citywall', x: 30, y: 15 }, { id: 'wall8', type: 'citywall', x: 34, y: 15 },
  { type: 'house', x: 16, y: 6 }, { type: 'house', x: 24, y: 6 }, { type: 'house', x: 30, y: 5 }, { type: 'house', x: 22, y: 9 },
  { type: 'palm', x: 28, y: 20 }, { type: 'palm', x: 6, y: 20 }, { type: 'palm', x: 33, y: 22 }, { type: 'rock', x: 14, y: 20 },
  { id: 'window', type: 'cordwindow', x: 7, y: 5, label: 'tie the cord in the window', onUse: (g, t) => (g.stepId === 'cord' ? tie(g, t) : g.say('window_look')) },
  { id: 'rope', type: 'ropecoil', x: 9, y: 8, label: 'let the spies down by the rope', onUse: (g, t) => (g.stepId === 'rope' ? lower(g, t) : g.say('rope_look')) },
  { id: 'flax1', type: 'sheaves', x: 3, y: 4, item: 'flax', label: 'gather the flax', onUse: hide.take },
  { id: 'flax2', type: 'sheaves', x: 5, y: 8, item: 'flax', label: 'gather the flax', onUse: hide.take },
  { id: 'flax3', type: 'sheaves', x: 12, y: 4, item: 'flax', label: 'gather the flax', onUse: hide.take },
];
const SPIES_AT = [['spy1', 9, 6], ['spy2', 10, 5]];

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'city',
    goal: "Follow the spies into Jericho and find Rahab's house.", marker: null,
    async intro(g) {
      g.hide('kingsman1'); g.hide('kingsman2');
      g.patrol('guard1', [[10, 13], [16, 13]], 40, 2); g.patrol('guard2', [[24, 13], [32, 13]], 40, 2);
      g.trail('spy1'); g.trail('spy2', 'spy1');
      await g.wait(700); await g.say('arrive');
    },
    trigger: { zone: [6, 9, 10, 10] },
    async run(g) {
      g.trail('spy1', false); g.trail('spy2', false);
      g.place('spy1', 8, 11, 'up'); g.place('spy2', 9, 11, 'up'); g.place('player', 7, 11, 'up');
      await g.say('rahab_house');
      g.award('shittim');
      g.award('inspect');
      await g.say('rahab_meet');
      g.award('house');
    },
  },
  {
    id: 'flax', spawn: [8, 10],
    enter(g) { g.place('spy1', 9, 6, 'down'); g.place('spy2', 10, 5, 'down'); },
    goal: 'Cover the spies with flax: 0 of 3', marker: 'flax1',
    solve: trips(['flax1', 'flax2', 'flax3'], 'spy1'),
    trigger: { signal: 'flax' },
    async intro(g) {
      for (const [id, x, y] of SPIES_AT) g.place(id, x, y, 'down');
      g.place('rahab', 8, 8, 'down');
      await g.say('king_told');
      g.award('reported');
      await g.say('roof_hide');
    },
    async run(g) {
      g.show('kingsman1'); g.show('kingsman2');
      g.place('kingsman1', 8, 11, 'up'); g.place('kingsman2', 9, 11, 'up');
      g.place('rahab', 8, 9, 'down');
      await g.say('king_asks');
      g.award('bring_them');
      await g.say('rahab_lies');
      g.award('hidden');
      g.award('pursue');
      await g.say('on_roof');
      g.award('flax');
      g.walk('kingsman1', [[8, 15], [20, 18]], 120); g.walk('kingsman2', [[9, 15], [21, 18]], 120);
      await g.say('gate_shut');
      g.award('shut');
      g.hide('kingsman1'); g.hide('kingsman2');
    },
  },
  {
    id: 'roof', spawn: [8, 10],
    enter(g) { g.hide('kingsman1'); g.hide('kingsman2'); for (const [id, x, y] of SPIES_AT) g.place(id, x, y, 'down'); g.place('rahab', 8, 8, 'down'); },
    goal: 'Talk to Rahab, up on the roof.', marker: 'rahab',
    trigger: { talk: 'rahab' },
    async run(g) {
      await g.say('roof_words');
      g.award('given_land');
      g.award('melting');
      await g.say('roof_words2');
      g.award('heard');
      g.award('god_in_heaven');
      await g.say('roof_ask');
      g.award('kindness');
      g.award('sure_sign');
      await g.say('oath');
      g.award('our_lives');
    },
  },
  {
    id: 'rope', spawn: [8, 10],
    enter(g) { for (const [id, x, y] of SPIES_AT) g.place(id, x, y, 'down'); g.place('rahab', 8, 8, 'down'); },
    goal: 'Let the spies down by the rope.', marker: 'rope',
    solve: ['rope'],
    trigger: { signal: 'rope' },
    async run(g) {
      await g.say('window');
      g.award('through_window');
      g.award('built_into_wall');
      await g.say('hill_country');
      g.award('three_days');
    },
  },
  {
    id: 'cord', spawn: [8, 10],
    enter(g) { g.hide('spy1'); g.hide('spy2'); g.place('rahab', 8, 8, 'down'); },
    goal: 'Tie the scarlet cord in the window.', marker: 'window',
    solve: ['window'],
    trigger: { signal: 'cord' },
    async intro(g) { g.hide('spy1'); g.hide('spy2'); await g.say('conditions'); g.award('scarlet_cord'); g.award('family_inside'); },
    async run(g) {
      await g.say('tied');
      g.award('tied');
      await g.say('conditions2');
      g.award('blood_on_head');
      g.award('released');
    },
  },
  {
    id: 'farewell', spawn: [8, 10],
    enter(g) { g.hide('spy1'); g.hide('spy2'); g.place('rahab', 8, 8, 'down'); },
    goal: 'Talk to Rahab, when you are ready.', marker: 'rahab',
    trigger: { talk: 'rahab' },
    async run(g) {
      await g.say('report');
      g.award('delivered');
      g.award('melting_fear');
      await g.say('by_faith');
      g.award('by_faith');
      await g.say('line_of_jesus');
      g.award('salmon');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
