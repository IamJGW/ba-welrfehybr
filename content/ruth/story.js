// Ruth and Naomi (Ruth 1-2): a family's loss in Moab, the road back to Bethlehem,
// Ruth's promise, and gleaning in the barley fields of Boaz. The words are in
// dialogue.csv.

import { robe, lady, discover, makeMap, soldier, taps } from '../../src/storykit.js';

export const id = 'ruth';
export const title = 'Ruth and Naomi';
export const where = 'Moab, the road, and the barley fields of Bethlehem';
export const ref = 'Ruth 1-2';
export const place = [35.2, 31.7];   // Bethlehem
export const after = 'torches';

// ----------------------------------------------------------------------- map
// Moab first, dry and brown. Then the green fields around Bethlehem.
//   s  desert    .  grass    b  barley field    ,  path    #  cliff

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
export const map = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (y === 14 && x < 30 || x === 20 && y >= 8 && y <= 14) return ',';
  return (x * 5 + y * 3) % 13 === 0 ? 'x' : 's';
});
const BETHLEHEM = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (x >= 4 && x <= 32 && y >= 15 && y <= 24) return 'b';
  if (y === 12 && x < 30 || x === 20 && y >= 6 && y <= 12) return ',';
  return '.';
});

export const start = [5, 22];
export const door = [3, 23];
export const barriers = [];

// -------------------------------------------------------------------- the jobs

const pack = taps('pack', { step: 'pack', total: 3, goal: 'Pack Naomi\'s things for the journey' });
const PACK = [[8, 17], [12, 20], [10, 22]].map(([x, y], i) => ({ id: `pack${i + 1}`, type: i === 1 ? 'jars' : 'sacks', x, y, label: 'pack it for the journey', onUse: pack }));
const glean1 = taps('glean', { step: 'glean', total: 3, goal: 'Glean behind the harvesters' });
const EARS1 = [[10, 18], [15, 20], [21, 19]].map(([x, y], i) => ({ id: `ear${i + 1}`, type: 'gleanear', x, y, label: 'gather the ears of barley', onUse: glean1 }));
const glean2 = taps('extra', { step: 'extra', total: 3, goal: 'Gather the stalks Boaz had left for Ruth' });
const EARS2 = [[11, 21], [17, 22], [24, 21]].map(([x, y], i) => ({ id: `extra${i + 1}`, type: 'gleanear', x, y, label: 'gather the stalks left for Ruth', onUse: glean2 }));

// -------------------------------------------------------------------- people

const lamb = (id, at) => ({ id, name: 'a sheep', at, solid: false, hidden: true, look: { kind: 'lamb' }, headroom: 30 });
const reaper = (id, at, top) => ({ id, name: 'a harvester', at, dir: 'right', hidden: true, solid: false, look: robe({ top, item: 'sheaf' }) });

export const actors = [
  { id: 'naomi', name: 'Naomi', at: [10, 14], dir: 'down', chat: 'naomi_idle', look: lady('#6a6a72', { skin: '#c98f62', hair: '#cfcfcf' }) },
  { id: 'ruth', name: 'Ruth', at: [8, 14], dir: 'right', chat: 'ruth_idle', look: lady('#c0415a', { skin: '#c98f62', hair: '#2a211c' }) },
  { id: 'orpah', name: 'Orpah', at: [14, 17], dir: 'left', hidden: true, chat: 'orpah_idle', look: lady('#3d6fb5', { skin: '#c98f62', hair: '#2a211c' }) },
  { id: 'boaz', name: 'Boaz', at: [28, 17], dir: 'left', hidden: true, chat: 'boaz_idle', look: robe({ top: '#4f8a6a', beard: true, hair: '#4a2f1b', sash: '#e3b93a', head: 'band', headColor: '#e3b93a' }) },
  { id: 'foreman', name: 'the foreman', at: [26, 19], dir: 'left', hidden: true, onUse: discover('disc_foreman', 'foreman'), look: robe({ top: '#8a6a3a', beard: true }) },
  reaper('reaper1', [18, 17], '#a9845a'), reaper('reaper2', [20, 18], '#8a6a3a'), reaper('reaper3', [23, 17], '#c9893f'),
  { id: 'girl', name: 'a servant girl', at: [14, 22], dir: 'right', hidden: true, onUse: discover('disc_girl', 'close'), look: lady('#6b8a4f', { hair: '#2a211c' }) },
  { id: 'woman1', name: 'a woman of Bethlehem', at: [14, 10], dir: 'down', hidden: true, onUse: discover('disc_woman', 'whole_town'), look: lady('#8a3a3a', { hair: '#5a4a3a' }) },
  { id: 'woman2', name: 'another woman', at: [24, 10], dir: 'down', hidden: true, onUse: discover('disc_woman2', 'mara'), look: lady('#7d5a8a', { hair: '#2a211c' }) },
  { id: 'trader', name: 'a Moabite neighbor', at: [6, 18], dir: 'right', onUse: discover('disc_moab', 'moabites'), look: robe({ top: '#8a3a3a', skin: '#a06a42', head: 'cloth', headColor: '#e8e0cc', beard: true }) },
  { id: 'child', name: 'a child', at: [12, 12], dir: 'down', scale: 0.75, onUse: discover('disc_child', 'famine'), look: robe({ top: '#d9b45a' }) },
];

// -------------------------------------------------------------------- things

export const objects = [
  { id: 'house', type: 'house', x: 4, y: 8 }, { type: 'tent', x: 14, y: 8 }, { type: 'rock', x: 28, y: 20 }, { type: 'bigrock', x: 34, y: 18 }, { type: 'palm', x: 25, y: 12 },
];
const TOWN = [{ id: 'bh1', type: 'house', x: 6, y: 6 }, { id: 'bh2', type: 'house', x: 12, y: 5 }, { id: 'bh3', type: 'house', x: 24, y: 5 }, { id: 'bh4', type: 'house', x: 29, y: 8 }, { id: 'bwell', type: 'well', x: 18, y: 8 }];
const MOAB_ONLY = ['house'];
const toBethlehem = g => {
  if (g.state.green) return;
  g.state.green = true;
  MOAB_ONLY.forEach(id => g.removeProp(id));
  g.ground(BETHLEHEM, 0);
  TOWN.forEach(o => g.addProp(o));
  g.hide('trader'); g.hide('child');
  g.show('woman1'); g.show('woman2');
  g.place('naomi', 16, 10, 'down'); g.place('ruth', 14, 10, 'down');
};

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'moab',
    goal: 'Talk to Naomi, outside her house in Moab.', marker: 'naomi',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'naomi' },
    async run(g) {
      await g.say('elimelech');
      g.award('judges_days');
      g.award('famine');
      await g.say('sons');
      g.award('sons');
      await g.say('died');
      g.award('without_husband');
      await g.say('heard');
      g.award('food_provided');
      await g.say('pack_ask');
    },
  },
  {
    id: 'pack', spawn: [10, 16],
    begin(g) { PACK.forEach(p => g.addProp(p)); },
    goal: "Pack Naomi's things for the journey: 0 of 3", marker: null,
    solve: ['pack1', 'pack2', 'pack3'],
    trigger: { signal: 'pack' },
    async run(g) {
      await g.say('road_start');
      g.award('set_out');
    },
  },
  {
    id: 'road', spawn: [10, 15],
    enter(g) { g.show('orpah'); g.place('orpah', 12, 14, 'left'); },
    begin(g) { g.show('orpah'); g.place('orpah', 12, 14, 'left'); g.place('naomi', 21, 13, 'right'); g.place('ruth', 19, 13, 'right'); },
    goal: 'Talk to Naomi, on the road to Judah.', marker: 'naomi',
    trigger: { talk: 'naomi' },
    async run(g) {
      g.place('orpah', 22, 13, 'left');
      await g.say('go_back');
      g.award('go_back');
      await g.say('kiss');
      g.award('wept_aloud');
      await g.say('naomi_urges');
      g.award('too_old');
      await g.say('orpah_goes');
      g.award('orpah');
      g.award('ruth_clung');
      await g.say('vow');
      g.award('wherever_you_go');
      g.award('your_people');
      await g.say('vow2');
      g.award('where_you_die');
      await g.say('stopped_persuading');
      g.award('determined');
    },
  },
  {
    id: 'bethlehem', spawn: [10, 16],
    async intro(g) { await g.fadeOut(900); g.hide('orpah'); toBethlehem(g); g.place('player', 17, 12, 'down'); await g.fadeIn(900); await g.say('arrive_bethlehem'); },
    goal: 'Talk to Naomi, in the street of Bethlehem.', marker: 'naomi',
    trigger: { talk: 'naomi' },
    async run(g) {
      await g.say('stirred');
      g.award('whole_town');
      await g.say('mara');
      g.award('call_me_mara');
      await g.say('empty');
      g.award('came_back_empty');
      await g.say('barley_harvest');
      g.award('barley_harvest');
    },
  },
  {
    id: 'glean', spawn: [14, 12],
    enter(g) { g.hide('orpah'); toBethlehem(g); },
    begin(g) { EARS1.forEach(e => g.addProp(e)); g.show('reaper1'); g.show('reaper2'); g.show('reaper3'); g.place('reaper1', 18, 17, 'right'); g.place('reaper2', 21, 18, 'right'); g.place('reaper3', 24, 17, 'right'); },
    goal: 'Glean behind the harvesters: 0 of 3', marker: null,
    solve: ['ear1', 'ear2', 'ear3'],
    trigger: { signal: 'glean' },
    async intro(g) {
      g.hide('woman1'); g.hide('woman2');
      await g.say('glean_ask');
      g.award('please_glean');
      g.award('find_favor');
      g.place('player', 14, 14, 'down'); g.place('ruth', 12, 15, 'right'); g.place('naomi', 14, 11, 'down');
    },
    async run(g) {
      await g.say('happened_to_come');
      g.award('field_of_boaz');
    },
  },
  {
    id: 'boaz', spawn: [20, 16],
    enter(g) { g.hide('orpah'); toBethlehem(g); for (const id of ['reaper1', 'reaper2', 'reaper3']) g.show(id); g.hide('woman1'); g.hide('woman2'); g.place('ruth', 14, 19, 'right'); },
    begin(g) { g.show('boaz'); g.show('foreman'); g.show('girl'); g.place('boaz', 28, 17, 'left'); g.place('foreman', 25, 19, 'left'); g.place('girl', 18, 21, 'right'); },
    goal: 'Talk to Boaz, who has just arrived in the field.', marker: 'boaz',
    trigger: { talk: 'boaz' },
    async run(g) {
      await g.say('boaz_arrives');
      g.award('lord_be_with_you');
      await g.say('whose_young_woman');
      g.award('whose');
      await g.say('foreman');
      g.award('moabitess');
      g.award('shelter');
      await g.say('stay_here');
      g.award('stay_close');
      g.award('drink');
      await g.say('why_favor');
      g.award('foreigner');
      await g.say('boaz_knows');
      g.award('under_wings');
      await g.say('mealtime');
      g.award('had_some_left');
    },
  },
  {
    id: 'extra', spawn: [20, 18],
    enter(g) { g.hide('orpah'); toBethlehem(g); for (const id of ['reaper1', 'reaper2', 'reaper3', 'boaz', 'foreman', 'girl']) g.show(id); g.hide('woman1'); g.hide('woman2'); g.place('ruth', 14, 19, 'right'); },
    begin(g) { EARS2.forEach(e => g.addProp(e)); },
    goal: 'Gather the stalks Boaz had left for Ruth: 0 of 3', marker: null,
    solve: ['extra1', 'extra2', 'extra3'],
    trigger: { signal: 'extra' },
    async intro(g) { await g.say('leave_extra'); g.award('do_not_insult'); g.award('pull_out'); },
    async run(g) {
      await g.say('evening');
      g.award('ephah');
      await g.say('beat_out');
      g.award('until_evening');
    },
  },
  {
    id: 'home', spawn: [14, 12],
    enter(g) { g.hide('orpah'); toBethlehem(g); for (const id of ['reaper1', 'reaper2', 'reaper3', 'boaz', 'foreman', 'girl']) g.hide(id); g.place('naomi', 14, 11, 'down'); g.place('ruth', 12, 12, 'right'); },
    goal: 'Talk to Naomi, back in the town.', marker: 'naomi',
    trigger: { talk: 'naomi' },
    async run(g) {
      await g.say('brought_home');
      g.award('gave_naomi');
      await g.say('where_glean');
      g.award('blessed_be_the_man');
      await g.say('kinsman');
      g.award('kinsman_redeemer');
      await g.say('stay_with');
      g.award('barley_and_wheat');
      await g.say('citizen');
      g.award('fellow_citizens');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
