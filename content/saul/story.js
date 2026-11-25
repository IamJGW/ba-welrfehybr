// Give Us a King (1 Samuel 8-10): the elders ask for a king, Saul looks for his
// father's donkeys, Samuel anoints him, and he is found hiding among the baggage
// at Mizpah. The words are in dialogue.csv.

import { robe, lady, discover, makeMap, animal, soldier, job, trips } from '../../src/storykit.js';

export const id = 'saul';
export const title = 'Give Us a King';
export const where = 'Ramah, the hill country of Benjamin, and Mizpah';
export const ref = '1 Samuel 8-10';
export const place = [35.3, 31.87];   // Ramah, Gibeah and Mizpah
export const after = 'dagon';

// ----------------------------------------------------------------------- map
// Ramah in the west, the search hills in the middle, Mizpah in the east.
//   .  grass    h  hillside    p  plaza    ,  path    #  cliff

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
export const map = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (x >= 28 && x <= 36 && y >= 6 && y <= 14) return 'p';
  if (x >= 14 && x <= 26 && y >= 4 && y <= 12) return 'h';
  if (y === 18 && x < 34 || x === 12 && y >= 6 && y <= 18 || y === 10 && x > 12 && x < 28) return ',';
  return '.';
});

export const start = [5, 22];
export const door = [3, 23];
export const barriers = [];

// -------------------------------------------------------------------- the search, the oil and the baggage

const look = (g, scene) => async () => {};
const seen = (g, who) => { g.state.looked = (g.state.looked || 0) + 1; if (g.state.looked >= 3) return g.signal('search'); g.goal(`Look for the donkeys: ${g.state.looked} of 3`, null); };
const SIGNS = [
  { id: 'sign1', x: 16, y: 14, onUse: async g => { if (g.stepId !== 'search') return g.say('sign_idle'); await g.say('look_ephraim'); g.award('ephraim'); seen(g); } },
  { id: 'sign2', x: 22, y: 14, onUse: async g => { if (g.stepId !== 'search') return g.say('sign_idle'); await g.say('look_shalishah'); g.award('shalishah'); seen(g); } },
  { id: 'sign3', x: 26, y: 16, onUse: async g => { if (g.stepId !== 'search') return g.say('sign_idle'); await g.say('look_benjamin'); g.award('benjamin'); seen(g); } },
].map(o => ({ ...o, type: 'pillar', label: 'look around for the donkeys' }));
const anoint = job('oil', { step: 'oil', total: 1, goal: 'Bring Samuel the flask of oil', target: 'samuel', hold: 'horn' });
const baggage = async (g, n) => {
  if (g.stepId !== 'baggage') return g.say('bag_idle');
  if (n < 3) return g.say(`bag_${n}`);
  g.signal('baggage');
};

// -------------------------------------------------------------------- people

const israelite = (over = {}) => robe({ top: '#a9845a', ...over });

export const actors = [
  { id: 'samuel', name: 'Samuel', at: [8, 16], dir: 'right', onUse: (g, t) => (g.stepId === 'oil' ? anoint.give(g) : g.say('samuel_idle')), look: robe({ top: '#f4f1e6', sash: '#c0415a', beard: true, hair: '#cfcfcf', head: 'cloth', headColor: '#e8e0cc' }) },
  { id: 'elder1', name: 'an elder of Israel', at: [9, 18], dir: 'left', onUse: discover('disc_elder', 'like_nations'), look: israelite({ top: '#7d5a8a', hair: '#e8e8e8', beard: '#e8e8e8' }) },
  { id: 'elder2', name: 'an elder of Israel', at: [10, 14], dir: 'left', onUse: discover('disc_elder2', 'your_sons'), look: israelite({ top: '#3d6fb5', beard: true }) },
  { id: 'saul', name: 'Saul', at: [18, 20], dir: 'right', chat: 'saul_idle', look: robe({ top: '#8a3a3a', beard: true, hair: '#2a211c', sash: '#e3b93a' }), scale: 1.12 },
  { id: 'servant', name: "Saul's servant", at: [20, 22], dir: 'right', chat: 'servant_idle', look: israelite({ top: '#4f8a6a' }) },
  { id: 'kish', name: 'Kish', at: [4, 10], dir: 'right', onUse: discover('disc_kish', 'kish'), look: israelite({ top: '#8a6a3a', beard: true, hair: '#cfcfcf' }) },
  { id: 'women', name: 'young women at the well', at: [11, 8], dir: 'down', onUse: g => (g.stepId === 'seer' ? seerGuide(g) : g.say('women_idle')), look: lady('#6b8a4f', { hair: '#2a211c' }) },
  { id: 'donkey', name: 'a donkey', at: [30, 22], dir: 'left', solid: false, look: { kind: 'donkey' }, headroom: 30, onUse: discover('disc_donkey', 'found_donkeys') },
  { id: 'tribesman', name: 'a man of the tribes', at: [32, 10], dir: 'left', hidden: true, onUse: discover('disc_tribe', 'tribes_come'), look: israelite({ top: '#c9893f', beard: true }) },
  { id: 'chief', name: 'a chief of Mizpah', at: [30, 12], dir: 'left', hidden: true, onUse: discover('disc_chief', 'matri'), look: israelite({ top: '#6a6a72', beard: true, head: 'cloth', headColor: '#e8e0cc' }) },
];

async function seerGuide(g) {
  await g.say('women_say');
  g.award('is_seer_here');
  g.award('he_is_ahead');
  g.signal('seer');
}

// -------------------------------------------------------------------- things

export const objects = [
  { type: 'house', x: 6, y: 6 }, { type: 'house', x: 9, y: 11 }, { id: 'well', type: 'well', x: 12, y: 8 }, { type: 'tent', x: 4, y: 15 },
  { type: 'rock', x: 17, y: 8 }, { type: 'rock', x: 24, y: 7 }, { type: 'bigrock', x: 20, y: 18 }, { type: 'tree', x: 25, y: 20 }, { type: 'palm', x: 33, y: 20 },
  { id: 'oil', type: 'hornbag', x: 5, y: 20, item: 'a flask of oil', label: 'take the flask of oil', onUse: anoint.take },
];
const BAGS = [
  { id: 'bag1', type: 'sacks', x: 31, y: 18, label: 'search the baggage', onUse: g => baggage(g, 1) },
  { id: 'bag2', type: 'sacks', x: 34, y: 20, label: 'search the baggage', onUse: g => baggage(g, 2) },
  { id: 'bag3', type: 'sacks', x: 33, y: 23, label: 'search the baggage', onUse: g => baggage(g, 3) },
];

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'ramah',
    goal: 'Talk to Samuel, in Ramah.', marker: 'samuel',
    async intro(g) { g.hide('tribesman'); g.hide('chief'); await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'samuel' },
    async run(g) {
      await g.say('elders_came');
      g.award('elders_gathered');
      await g.say('give_us_a_king');
      g.award('like_other_nations');
      await g.say('displeasing');
      g.award('displeasing');
      await g.say('rejected_me');
      g.award('rejected_me');
      await g.say('manner');
      g.award('manner_of_king');
      g.award('beg_for_relief');
      await g.say('we_must_have');
      g.award('we_must_have');
      await g.say('appoint');
      g.award('appoint_a_king');
    },
  },
  {
    id: 'saul', spawn: [14, 18],
    goal: 'Talk to Saul and his servant, who are looking for something.', marker: 'saul',
    trigger: { talk: 'saul' },
    async run(g) {
      await g.say('kish');
      g.award('kish_son');
      await g.say('saul_head');
      g.award('head_taller');
      await g.say('donkeys_wandered');
      g.award('donkeys_lost');
      await g.say('search_ask');
    },
  },
  {
    id: 'search', spawn: [18, 19],
    begin(g) { SIGNS.forEach(s => g.addProp(s)); },
    goal: 'Look for the donkeys: 0 of 3', marker: null,
    solve: ['sign1', 'sign2', 'sign3'],
    trigger: { signal: 'search' },
    async run(g) {
      await g.say('search_failed');
      g.award('did_not_find');
      g.award('father_will_worry');
    },
  },
  {
    id: 'seer', spawn: [16, 18],
    enter(g) { SIGNS.forEach(s => g.addProp(s)); },
    goal: 'Ask the young women at the well about the seer.', marker: 'women',
    solve: ['women'],
    trigger: { signal: 'seer' },
    async intro(g) { await g.say('servant_suggests'); g.award('man_of_god'); },
    async run(g) {
      await g.say('hurry');
      g.award('high_place');
      g.award('bless_the_sacrifice');
    },
  },
  {
    id: 'meet', spawn: [14, 16],
    enter(g) { SIGNS.forEach(s => g.addProp(s)); g.place('saul', 10, 17, 'left'); g.place('servant', 12, 19, 'left'); },
    goal: 'Talk to Samuel, who is coming down the street.', marker: 'samuel',
    trigger: { talk: 'samuel' },
    async run(g) {
      await g.say('lord_revealed');
      g.award('revealed_day_before');
      await g.say('send_a_man');
      g.award('anoint_him');
      g.award('their_cry');
      await g.say('here_is_the_man');
      g.award('here_is_the_man');
      await g.say('where_seer');
      g.award('i_am_the_seer');
      await g.say('donkeys_found');
      g.award('been_found');
      await g.say('desire_of_israel');
      g.award('desire_of_israel');
      await g.say('smallest_tribe');
      g.award('smallest_tribe');
    },
  },
  {
    id: 'oil', spawn: [8, 18],
    enter(g) { SIGNS.forEach(s => g.addProp(s)); g.place('saul', 10, 17, 'left'); g.place('servant', 14, 19, 'left'); },
    goal: 'Bring Samuel the flask of oil: 0 of 1', marker: 'oil',
    solve: trips(['oil'], 'samuel'),
    trigger: { signal: 'oil' },
    async intro(g) { await g.say('morning'); g.award('stay_a_while'); },
    async run(g) {
      await g.say('anointed');
      g.award('flask_of_oil');
      g.award('anointed_ruler');
      await g.say('signs');
      g.award('different_person');
      g.award('god_is_with_you');
    },
  },
  {
    id: 'mizpah', spawn: [26, 18],
    enter(g) { SIGNS.forEach(s => g.addProp(s)); },
    begin(g) { g.show('tribesman'); g.show('chief'); g.place('samuel', 29, 10, 'down'); g.place('tribesman', 32, 11, 'left'); g.place('chief', 31, 13, 'left'); },
    goal: 'Go to Mizpah, where Samuel has called all the tribes.', marker: null,
    trigger: { zone: [28, 12, 34, 14] },
    async intro(g) { g.show('tribesman'); g.show('chief'); g.place('samuel', 29, 10, 'down'); },
    async run(g) {
      g.place('player', 30, 14, 'up');
      await g.say('mizpah');
      g.award('summoned_people');
      await g.say('rescued_you');
      g.award('rescued_you');
      await g.say('rejected_your_god');
      g.award('rejected_your_god');
      await g.say('lots');
      g.award('benjamin_selected');
      g.award('matri');
      g.award('saul_selected');
      await g.say('could_not_find');
      g.award('could_not_find');
      await g.say('hidden');
      g.award('hidden_in_baggage');
    },
  },
  {
    id: 'baggage', spawn: [30, 15],
    begin(g) { BAGS.forEach(b => g.addProp(b)); },
    goal: 'Look for Saul among the baggage.', marker: null,
    solve: ['bag1', 'bag2', 'bag3'],
    trigger: { signal: 'baggage' },
    async run(g) {
      g.place('saul', 33, 22, 'down');
      await g.say('found_saul');
      g.award('brought_saul');
      await g.say('head_taller2');
      g.award('head_above');
      await g.say('long_live');
      g.award('long_live');
      await g.say('kingdom_not_of_this_world');
      g.award('my_kingdom');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
