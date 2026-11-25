// The Kinsman-Redeemer (Ruth 3-4): Naomi's plan, the threshing floor at night,
// Boaz at the town gate, and the birth of Obed. There is a note for parents. The
// words are in dialogue.csv.

import { robe, lady, discover, makeMap, soldier, job, trips, taps } from '../../src/storykit.js';

export const id = 'redeemer';
export const title = 'The Kinsman-Redeemer';
export const where = 'Bethlehem: the threshing floor and the town gate';
export const ref = 'Ruth 3-4';
export const place = [35.2, 31.7];   // Bethlehem
export const after = 'ruth';

// ----------------------------------------------------------------------- map
//   .  grass    k  threshing floor    p  town square    ,  path    #  cliff

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
export const map = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (x >= 4 && x <= 14 && y >= 14 && y <= 22) return 'k';
  if (x >= 22 && x <= 34 && y >= 4 && y <= 10) return 'p';
  if (y === 12 && x > 10 && x < 30 || x === 28 && y >= 10 && y <= 12) return ',';
  return '.';
});

export const start = [16, 22];
export const door = [18, 23];
export const barriers = [];

// -------------------------------------------------------------------- the jobs

const prepare = job('ready', { step: 'prepare', total: 3, goal: 'Help Ruth get ready', target: 'ruth', hold: 'bundle' });
const winnow = taps('winnow', { step: 'winnow', total: 4, goal: 'Help the workers winnow the barley' });
const HEAPS = [[6, 16], [9, 18], [12, 16], [7, 20]].map(([x, y], i) => ({ id: `heap${i + 1}`, type: 'sheaves', x, y, label: 'toss the barley in the wind', onUse: winnow }));
const call1 = async g => { if (g.stepId !== 'elders') return g.say('elder_idle'); await g.say('elder_one'); g.hide('elder1'); calledOne(g); };
const call2 = async g => { if (g.stepId !== 'elders') return g.say('elder_idle'); await g.say('elder_two'); g.hide('elder2'); calledOne(g); };
const call3 = async g => { if (g.stepId !== 'elders') return g.say('elder_idle'); await g.say('elder_three'); g.hide('elder3'); calledOne(g); };
const calledOne = g => {
  g.state.called = (g.state.called || 0) + 1;
  if (g.state.called >= 3) return g.signal('elders');
  g.goal(`Call the elders to the gate: ${g.state.called} of 3`, null);
};

// -------------------------------------------------------------------- people

const israelite = (over = {}) => robe({ top: '#a9845a', ...over });
const elder = (id, at, top, onUse) => ({ id, name: 'an elder of the town', at, dir: 'down', hidden: false, solid: true, onUse, look: israelite({ top, hair: '#e8e8e8', beard: '#e8e8e8' }) });

export const actors = [
  { id: 'naomi', name: 'Naomi', at: [18, 20], dir: 'up', chat: 'naomi_idle', look: lady('#6a6a72', { skin: '#c98f62', hair: '#cfcfcf' }) },
  { id: 'ruth', name: 'Ruth', at: [14, 21], dir: 'right', onUse: g => (g.stepId === 'prepare' ? prepare.give(g) : g.say('ruth_idle')), look: lady('#c0415a', { skin: '#c98f62', hair: '#2a211c' }) },
  { id: 'boaz', name: 'Boaz', at: [10, 17], dir: 'down', chat: 'boaz_idle', look: robe({ top: '#4f8a6a', beard: true, hair: '#4a2f1b', sash: '#e3b93a', head: 'band', headColor: '#e3b93a' }) },
  { id: 'redeemer', name: 'the other relative', at: [31, 16], dir: 'left', hidden: true, chat: 'redeemer_idle', look: robe({ top: '#7d5a8a', beard: true, hair: '#2a211c', head: 'cloth', headColor: '#e8e0cc' }) },
  elder('elder1', [27, 8], '#7d5a8a', call1), elder('elder2', [31, 9], '#3d6fb5', call2), elder('elder3', [24, 6], '#8a3a3a', call3),
  { id: 'worker', name: 'a worker on the floor', at: [5, 19], dir: 'right', onUse: discover('disc_worker', 'winnowing'), look: israelite({ top: '#c9893f', beard: true }) },
  { id: 'woman1', name: 'a woman of the town', at: [20, 12], dir: 'right', hidden: true, onUse: discover('disc_women', 'blessed_the_lord'), look: lady('#8a3a3a', { hair: '#5a4a3a' }) },
  { id: 'woman2', name: 'another woman', at: [23, 14], dir: 'left', hidden: true, onUse: discover('disc_women2', 'better_than_seven'), look: lady('#7d5a8a', { hair: '#2a211c' }) },
  { id: 'child', name: 'a boy at the gate', at: [30, 12], dir: 'left', scale: 0.8, onUse: discover('disc_child', 'sandal'), look: robe({ top: '#d9b45a' }) },
  { id: 'baker', name: 'a bread seller', at: [16, 14], dir: 'right', onUse: discover('disc_baker', 'perez'), look: lady('#a85a4a', { hair: '#2a211c' }) },
];

// -------------------------------------------------------------------- things

export const objects = [
  { id: 'gate', type: 'gatepost', x: 22, y: 11 }, { type: 'gatepost', x: 33, y: 11 },
  { type: 'house', x: 4, y: 6 }, { type: 'house', x: 9, y: 5 }, { type: 'house', x: 14, y: 6 }, { type: 'tent', x: 18, y: 16 },
  { type: 'palm', x: 24, y: 17 }, { type: 'rock', x: 28, y: 20 }, { type: 'bigrock', x: 34, y: 18 },
  { id: 'water', type: 'jars', x: 8, y: 23, item: 'a jar of water to wash with', carry: 'jar', label: 'pick up the water', onUse: prepare.take },
  { id: 'clothes', type: 'sheaves', x: 22, y: 21, item: 'Ruth\'s best clothes', label: 'pick up the clothes', onUse: prepare.take },
  { id: 'perfume', type: 'pot', x: 28, y: 22, item: 'perfume', label: 'pick up the perfume', onUse: prepare.take },
  { id: 'heap', type: 'bigrock', x: 2, y: 20 },
  { id: 'lamp', type: 'fire', x: 15, y: 18 },
];

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'plan',
    goal: 'Talk to Naomi.', marker: 'naomi',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'naomi' },
    async run(g) {
      await g.say('resting_place');
      g.award('resting_place');
      await g.say('boaz_winnowing');
      g.award('winnowing_tonight');
      await g.say('instructions');
      g.award('wash_and_dress');
      await g.say('ruth_agrees');
      g.award('everything_you_say');
    },
  },
  {
    id: 'prepare', spawn: [16, 21],
    goal: 'Help Ruth get ready: 0 of 3', marker: 'water',
    solve: trips(['water', 'clothes', 'perfume'], 'ruth'),
    trigger: { signal: 'prepare' },
    async run(g) {
      await g.say('ready_done');
      g.award('did_everything');
    },
  },
  {
    id: 'winnow', spawn: [12, 20],
    begin(g) { HEAPS.forEach(h => g.addProp(h)); },
    goal: 'Help the workers winnow the barley: 0 of 4', marker: null,
    solve: ['heap1', 'heap2', 'heap3', 'heap4'],
    trigger: { signal: 'winnow' },
    async intro(g) { g.sky({}); await g.say('floor_arrive'); },
    async run(g) {
      g.sky({ night: true, stars: true });
      await g.say('boaz_eats');
      g.award('good_spirits');
    },
  },
  {
    id: 'floor', spawn: [12, 20],
    enter(g) { g.sky({ night: true, stars: true }); },
    goal: 'Wait quietly by the edge of the threshing floor.', marker: null,
    trigger: { zone: [8, 19, 10, 20] },
    async run(g) {
      g.place('player', 9, 20, 'up');
      g.place('ruth', 12, 21, 'up');
      await g.say('quietly');
      g.award('end_of_heap');
      g.walk('ruth', [[11, 19]], 70);
      await g.wait(2000);
      await g.say('midnight');
      g.award('startled');
      await g.say('who_are_you');
      g.award('servant_ruth');
      g.award('spread_garment');
      await g.say('blessing');
      g.award('more_kindness');
      g.award('noble_character');
      await g.say('nearer_redeemer');
      g.award('redeemer_nearer');
      await g.say('as_the_lord_lives');
      g.award('i_will');
      await g.say('before_dawn');
      g.award('before_anyone');
      g.award('six_measures');
    },
  },
  {
    id: 'home', spawn: [14, 20],
    enter(g) { g.sky({}); },
    goal: 'Talk to Naomi, back home.', marker: 'naomi',
    trigger: { talk: 'naomi' },
    async run(g) {
      g.sky({});
      await g.say('how_did_it_go');
      g.award('how_did_it_go');
      await g.say('not_empty_handed');
      g.award('not_empty_handed');
      await g.say('wait_daughter');
      g.award('will_not_rest');
    },
  },
  {
    id: 'elders', spawn: [22, 14],
    enter(g) { g.sky({}); for (const id of ['elder1', 'elder2', 'elder3']) g.show(id); },
    begin(g) { for (const [id, x, y] of [['elder1', 27, 8], ['elder2', 31, 9], ['elder3', 24, 6]]) { g.show(id); g.place(id, x, y, 'down'); } g.show('redeemer'); g.place('redeemer', 31, 16, 'left'); g.place('boaz', 28, 12, 'down'); },
    goal: 'Call the elders to the gate: 0 of 3', marker: null,
    solve: ['elder1', 'elder2', 'elder3'],
    trigger: { signal: 'elders' },
    async intro(g) { g.place('boaz', 28, 12, 'down'); g.show('redeemer'); g.place('redeemer', 31, 16, 'left'); await g.say('gate_start'); g.award('went_to_the_gate'); },
    async run(g) {
      await g.say('ten_elders');
      g.award('ten_elders');
    },
  },
  {
    id: 'gate', spawn: [26, 12],
    enter(g) { g.show('redeemer'); g.place('redeemer', 30, 12, 'left'); g.place('boaz', 28, 12, 'down'); for (const id of ['elder1', 'elder2', 'elder3']) g.hide(id); },
    goal: 'Talk to Boaz, at the town gate.', marker: 'boaz',
    trigger: { talk: 'boaz' },
    async run(g) {
      await g.say('friend');
      g.award('come_over');
      await g.say('buy_back');
      g.award('land_of_elimelech');
      g.award('next_after_you');
      await g.say('i_will_redeem');
      await g.say('and_ruth');
      g.award('acquire_the_widow');
      await g.say('cannot_redeem');
      g.award('jeopardize');
      await g.say('sandal');
      g.award('removed_sandal');
      g.award('buy_it');
      await g.say('witnesses');
      g.award('you_are_witnesses');
      g.award('name_will_not_disappear');
      await g.say('blessing_elders');
      g.award('rachel_leah');
      g.award('house_of_perez');
    },
  },
  {
    id: 'baby', spawn: [24, 13],
    enter(g) { g.sky({}); g.show('woman1'); g.show('woman2'); g.place('naomi', 24, 12, 'down'); g.place('ruth', 20, 14, 'right'); g.place('woman1', 18, 11, 'right'); g.place('woman2', 28, 14, 'left'); g.hide('redeemer'); },
    begin(g) { g.show('woman1'); g.show('woman2'); g.setLook('naomi', { item: 'baby' }); },
    goal: 'Talk to Naomi, who is holding the new baby.', marker: 'naomi',
    trigger: { talk: 'naomi' },
    async run(g) {
      await g.say('took_ruth');
      g.award('boaz_took_ruth');
      await g.say('women_say');
      g.award('without_a_redeemer');
      g.award('renew_your_life');
      await g.say('nurse');
      g.award('her_lap');
      await g.say('obed');
      g.award('obed');
      await g.say('generations');
      g.award('perez_line');
      await g.say('david');
      g.award('father_of_david');
      await g.say('jesus_line');
      g.award('jesus_line');
      await g.say('redemption');
      g.award('redemption');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
