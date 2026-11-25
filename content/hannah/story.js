// Hannah's Prayer (1 Samuel 1-2:26): a woman who longs for a child, her silent
// prayer at Shiloh, Eli's blessing, the birth of Samuel, and the day she brings
// him to the LORD's house. The words are in dialogue.csv.

import { robe, lady, discover, makeMap, animal, soldier, job, trips } from '../../src/storykit.js';

export const id = 'hannah';
export const title = "Hannah's Prayer";
export const where = 'Shiloh, where the tabernacle stood';
export const ref = '1 Samuel 1-2:26';
export const place = [35.29, 32.06];   // Shiloh
export const after = null;

// ----------------------------------------------------------------------- map
//   .  grass    p  courtyard    ,  path    #  cliff

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
export const map = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (x >= 10 && x <= 30 && y >= 4 && y <= 14) return 'p';
  if (y === 18 && x < 34 || x === 20 && y >= 14 && y <= 18) return ',';
  return '.';
});

export const start = [5, 22];
export const door = [3, 23];
export const barriers = [];

// -------------------------------------------------------------------- the jobs

const portions = job('portion', { step: 'meal', total: 3, goal: 'Carry the sacrifice portions to the family', target: 'family', hold: 'bundle' });
const gifts = job('gift', { step: 'gifts', total: 3, goal: 'Bring the offering to the house of the LORD', target: 'altar', hold: 'bundle' });

// -------------------------------------------------------------------- people

const levite = (over = {}) => robe({ top: '#f1ede0', sash: '#3d6fb5', ...over });

export const actors = [
  { id: 'hannah', name: 'Hannah', at: [14, 20], dir: 'right', chat: 'hannah_idle', look: lady('#6b8a4f', { skin: '#c98f62', hair: '#2a211c' }) },
  { id: 'elkanah', name: 'Elkanah', at: [12, 21], dir: 'right', chat: 'elkanah_idle', look: robe({ top: '#7d5a8a', beard: true, hair: '#4a2f1b' }) },
  { id: 'peninnah', name: 'Peninnah', at: [18, 20], dir: 'left', chat: 'peninnah_idle', look: lady('#c0415a', { skin: '#c98f62', hair: '#2a211c' }) },
  { id: 'children', name: "Peninnah's children", at: [20, 22], dir: 'left', scale: 0.8, onUse: discover('disc_children', 'children'), look: robe({ top: '#d9b45a' }) },
  { id: 'eli', name: 'Eli', at: [20, 12], dir: 'down', chat: 'eli_idle', look: levite({ hair: '#e8e8e8', beard: '#e8e8e8', head: 'cloth', headColor: '#e8e0cc' }) },
  { id: 'hophni', name: 'Hophni', at: [26, 11], dir: 'left', onUse: discover('disc_priest', 'hophni'), look: levite({ beard: true, top: '#8a6a3a' }) },
  { id: 'servant', name: 'a woman at Shiloh', at: [8, 16], dir: 'right', onUse: discover('disc_woman', 'bitter_distress'), look: lady('#7d5a8a', { hair: '#5a4a3a' }) },
  { id: 'pilgrim', name: 'a pilgrim', at: [28, 18], dir: 'left', onUse: discover('disc_pilgrim', 'year_after_year'), look: robe({ top: '#a9845a', beard: true }) },
  { id: 'baby', name: 'a baby', at: [15, 21], dir: 'down', hidden: true, scale: 0.5, look: robe({ top: '#f4f1e6' }) },
  animal('bull', 'calf', [8, 22], { name: 'a three-year-old bull', hidden: true, scale: 1.5, item: 'a three-year-old bull', label: 'lead the bull', onUse: gifts.take }),
];

// -------------------------------------------------------------------- things

export const objects = [
  { id: 'tab', type: 'tabernacle', x: 14, y: 4 },
  { id: 'altar', type: 'altar', x: 24, y: 9, label: 'bring it to the altar', onUse: gifts.give },
  { id: 'family', type: 'table', x: 16, y: 18, label: 'set it before the family', onUse: portions.give },
  { id: 'meat', type: 'fire', x: 8, y: 19, item: 'a portion of the sacrifice', label: 'take a portion', onUse: portions.take },
  { id: 'bread', type: 'oven', x: 25, y: 21, item: 'bread', label: 'take the bread', onUse: portions.take },
  { id: 'wine', type: 'jars', x: 30, y: 21, item: 'a jar of wine', carry: 'jar', label: 'take the wine', onUse: portions.take },
  { type: 'tent', x: 5, y: 14 }, { type: 'tent', x: 33, y: 16 }, { type: 'palm', x: 31, y: 8 }, { type: 'palm', x: 6, y: 9 }, { type: 'rock', x: 28, y: 24 },
];
const OFFERINGS = [
  { id: 'flour', type: 'sacks', x: 16, y: 16, item: 'an ephah of flour', label: 'carry the flour', onUse: gifts.take },
  { id: 'skin', type: 'jars', x: 21, y: 20, item: 'a skin of wine', carry: 'jar', label: 'carry the wine', onUse: gifts.take },
];

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'shiloh',
    goal: 'Talk to Elkanah, who has come to Shiloh with his family.', marker: 'elkanah',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'elkanah' },
    async run(g) {
      await g.say('elkanah');
      g.award('elkanah');
      await g.say('two_wives');
      g.award('hannah_none');
      await g.say('year_after_year');
      g.award('worship_sacrifice');
      await g.say('portions_ask');
    },
  },
  {
    id: 'meal', spawn: [16, 20],
    goal: 'Carry the sacrifice portions to the family: 0 of 3', marker: 'meat',
    solve: trips(['meat', 'bread', 'wine'], 'family'),
    trigger: { signal: 'meal' },
    async run(g) {
      await g.say('portions');
      g.award('double_portion');
      g.award('closed_womb');
      await g.say('taunt');
      g.award('provoke');
      g.award('wept');
    },
  },
  {
    id: 'weeping', spawn: [16, 20],
    goal: 'Talk to Hannah.', marker: 'hannah',
    trigger: { talk: 'hannah' },
    async run(g) {
      await g.say('why_crying');
      g.award('why_crying');
      g.award('better_than_ten');
      await g.say('hannah_answers');
      await g.say('go_pray');
    },
  },
  {
    id: 'prayer', spawn: [18, 16],
    goal: 'Follow Hannah to the doorway of the house of the LORD.', marker: null,
    trigger: { zone: [18, 13, 22, 14] },
    async run(g) {
      g.place('hannah', 17, 13, 'up');
      g.place('player', 20, 15, 'up');
      await g.say('stood_up');
      g.award('doorpost');
      await g.say('bitter');
      g.award('prayed_wept');
      await g.say('vow');
      g.award('vow');
      g.award('no_razor');
      await g.say('eli_watched');
      g.award('thought_drunk');
      await g.say('hannah_reply');
      g.award('poured_out_soul');
      await g.say('go_in_peace');
      g.award('go_in_peace');
      await g.say('face_not_downcast');
      g.award('no_longer_downcast');
    },
  },
  {
    id: 'samuel', spawn: [16, 20],
    async intro(g) {
      await g.fadeOut(900);
      g.show('baby'); g.place('baby', 15, 21, 'down'); g.setLook('hannah', { item: 'baby' });
      await g.fadeIn(900);
      await g.say('remembered');
    },
    goal: 'Talk to Hannah, and meet her baby.', marker: 'hannah',
    trigger: { talk: 'hannah' },
    async run(g) {
      await g.say('conceived');
      g.award('remembered');
      g.award('samuel');
      await g.say('weaned');
      g.award('until_weaned');
      await g.say('confirm');
      g.award('confirm_word');
    },
  },
  {
    id: 'gifts', spawn: [16, 20],
    enter(g) { g.show('baby'); g.setLook('hannah', { item: 'baby' }); g.place('baby', 15, 21, 'down'); },
    begin(g) { g.show('bull'); g.place('bull', 22, 20, 'left'); OFFERINGS.forEach(o => g.addProp(o)); },
    goal: 'Bring the offering to the house of the LORD: 0 of 3', marker: null,
    solve: trips(['flour', 'skin', 'bull'], 'altar'),
    trigger: { signal: 'gifts' },
    async intro(g) { await g.say('bring_ask'); },
    async run(g) {
      await g.say('three_year_old');
      g.award('bull_flour_wine');
      g.award('house_at_shiloh');
      await g.say('presented');
      g.award('brought_to_eli');
      await g.say('hannah_speaks');
      g.award('woman_who_stood');
      await g.say('dedicate');
      g.award('prayed_for_this_boy');
      g.award('dedicated');
      g.award('worshiped');
    },
  },
  {
    id: 'song', spawn: [16, 20],
    enter(g) { g.show('baby'); g.setLook('hannah', { item: 'baby' }); },
    begin(g) { g.setLook('hannah', { item: null }); g.hide('baby'); g.place('hannah', 20, 14, 'down'); },
    goal: 'Listen to Hannah.', marker: 'hannah',
    trigger: { talk: 'hannah' },
    async run(g) {
      await g.say('hannah_song');
      g.award('heart_rejoices');
      g.award('no_one_holy');
      await g.say('minister');
      g.award('ministering');
      await g.say('little_robe');
      g.award('little_robe');
      await g.say('more_children');
      g.award('five_children');
      await g.say('grew');
      g.award('stature_favor');
      await g.say('mary');
      g.award('mary_song');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
