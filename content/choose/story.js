// As for Me and My House (Joshua 24): all Israel gathers at Shechem, Joshua
// reminds them of everything God has done, and asks them to choose. The words are
// in dialogue.csv.

import { robe, lady, discover, makeMap, soldier, taps } from '../../src/storykit.js';

export const id = 'choose';
export const title = 'As for Me and My House';
export const where = 'Shechem, between Mount Ebal and Mount Gerizim';
export const ref = 'Joshua 24';
export const place = [35.28, 32.21];   // Shechem
export const after = 'walls';

// ----------------------------------------------------------------------- map
//   .  grass    h  hillside    ,  path    #  cliff

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
export const map = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (x <= 6 || x >= 33) return 'h';
  if (y === 20 && x < 20 || x === 20 && y >= 8 && y <= 20) return ',';
  return '.';
});

export const start = [8, 22];
export const door = [4, 23];
export const barriers = [];

// -------------------------------------------------------------------- the jobs

const banners = taps('banner', { step: 'banners', total: 4, goal: 'Set up the banners of the tribes' });
const BANNERS = [[10, 16], [15, 16], [25, 16], [30, 16]].map(([x, y], i) => ({ id: `banner${i + 1}`, type: 'banner', x, y, label: 'set up the banner', onUse: banners }));
const looked = taps('stone', { step: 'remember', total: 6, goal: 'Look at the stones that remind the people of their story', keep: true });
const idle = g => g.note(g.text('stone_idle'));
const STONES = [
  { id: 'stone1', x: 9, y: 11, onUse: async (g, t) => { if (g.stepId !== 'remember') return idle(g); await g.say('recall_abraham'); g.award('abraham'); looked(g, t); } },
  { id: 'stone2', x: 13, y: 9, onUse: async (g, t) => { if (g.stepId !== 'remember') return idle(g); await g.say('recall_jacob'); g.award('isaac_jacob'); looked(g, t); } },
  { id: 'stone3', x: 17, y: 8, onUse: async (g, t) => { if (g.stepId !== 'remember') return idle(g); await g.say('recall_moses'); g.award('moses_aaron'); looked(g, t); } },
  { id: 'stone4', x: 23, y: 8, onUse: async (g, t) => { if (g.stepId !== 'remember') return idle(g); await g.say('recall_sea'); g.award('cried_out'); looked(g, t); } },
  { id: 'stone5', x: 27, y: 9, onUse: async (g, t) => { if (g.stepId !== 'remember') return idle(g); await g.say('recall_jordan'); g.award('jericho'); looked(g, t); } },
  { id: 'stone6', x: 31, y: 11, onUse: async (g, t) => { if (g.stepId !== 'remember') return idle(g); await g.say('recall_land'); g.award('did_not_toil'); looked(g, t); } },
].map(o => ({ ...o, type: 'pillar', label: 'look at the stone' }));
const cleared = taps('idol', { step: 'idols', total: 3, goal: 'Gather the foreign gods' });
const IDOLS = [[12, 19], [24, 20], [28, 17]].map(([x, y], i) => ({ id: `idol${i + 1}`, type: 'idol', x, y, label: 'pick up the idol', onUse: cleared }));

// -------------------------------------------------------------------- people

const israelite = (over = {}) => robe({ top: '#a9845a', ...over });

export const actors = [
  { id: 'joshua', name: 'Joshua', at: [20, 12], dir: 'down', chat: 'joshua_idle', look: soldier({ top: '#a9845a', hair: '#e8e8e8', beard: '#e8e8e8', head: 'band', headColor: '#7a2e2e' }) },
  { id: 'elder', name: 'an elder', at: [17, 14], dir: 'right', onUse: discover('disc_elder', 'assembled_all'), look: israelite({ top: '#7d5a8a', hair: '#e8e8e8', beard: '#e8e8e8' }) },
  { id: 'judge', name: 'a judge', at: [23, 14], dir: 'left', onUse: discover('disc_judge', 'officers'), look: israelite({ top: '#3d6fb5', beard: true, head: 'cloth', headColor: '#e8e0cc' }) },
  { id: 'family', name: 'a father with his family', at: [14, 21], dir: 'right', onUse: discover('disc_family', 'my_house'), look: israelite({ top: '#8a3a3a', beard: true }) },
  { id: 'wife', name: 'his wife', at: [16, 22], dir: 'right', onUse: discover('disc_wife', 'vineyards'), look: lady('#6b8a4f', { hair: '#2a211c' }) },
  { id: 'youth', name: 'a young man', at: [26, 21], dir: 'left', onUse: discover('disc_youth', 'sincerity'), look: israelite({ top: '#4f8a6a' }) },
  { id: 'girl', name: 'a little girl', at: [29, 22], dir: 'left', scale: 0.7, onUse: discover('disc_girl', 'witness_stone'), look: robe({ top: '#c9893f', hairStyle: 'braids', hair: '#2a211c' }) },
];

// -------------------------------------------------------------------- things

export const objects = [
  { id: 'oak', type: 'oak', x: 19, y: 6 },
  { type: 'tent', x: 5, y: 12 }, { type: 'tent', x: 34, y: 14 }, { type: 'tent', x: 5, y: 17 }, { type: 'tent', x: 35, y: 20 },
  { type: 'rock', x: 8, y: 24 }, { type: 'bigrock', x: 32, y: 24 }, { type: 'palm', x: 12, y: 6 }, { type: 'palm', x: 28, y: 5 },
];
const WITNESS = { id: 'witness', type: 'bigrock', x: 21, y: 6 };

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'meet',
    goal: 'Talk to Joshua, under the great oak.', marker: 'joshua',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'joshua' },
    async run(g) {
      await g.say('assembled');
      g.award('shechem');
      g.award('before_god');
      await g.say('banners_ask');
    },
  },
  {
    id: 'banners', spawn: [20, 18],
    begin(g) { BANNERS.forEach(b => g.addProp(b)); },
    goal: 'Set up the banners of the tribes: 0 of 4', marker: null,
    solve: ['banner1', 'banner2', 'banner3', 'banner4'],
    trigger: { signal: 'banners' },
    async run(g) {
      await g.say('banners_done');
      g.award('every_tribe');
    },
  },
  {
    id: 'remember', spawn: [20, 18],
    begin(g) { STONES.forEach(o => g.addProp(o)); },
    goal: 'Look at the stones that remind the people of their story: 0 of 6', marker: 'stone1',
    solve: ['stone1', 'stone2', 'stone3', 'stone4', 'stone5', 'stone6'],
    trigger: { signal: 'remember' },
    async intro(g) { await g.say('remember_start'); g.award('long_ago'); },
    async run(g) {
      await g.say('remember_end');
      g.award('terah');
    },
  },
  {
    id: 'choice', spawn: [20, 14],
    enter(g) { STONES.forEach(o => g.addProp(o)); },
    goal: 'Talk to Joshua. He has a question for everyone.', marker: 'joshua',
    trigger: { talk: 'joshua' },
    async run(g) {
      await g.say('fear_the_lord');
      g.award('fear_and_serve');
      g.award('cast_aside');
      await g.say('challenge');
      g.award('choose_today');
      let right = await g.choose('choice');
      while (!right) { await g.say('choice_again'); right = await g.choose('choice'); }
      await g.say('as_for_me');
      g.award('as_for_me');
      await g.say('people_reply');
      g.award('far_be_it');
      await g.say('not_able');
      g.award('holy_jealous');
      g.award('not_able');
      await g.say('no_we_will');
      g.award('we_will_serve');
      await g.say('witnesses');
      g.award('witnesses');
      await g.say('get_rid');
      g.award('get_rid');
    },
  },
  {
    id: 'idols', spawn: [20, 16],
    enter(g) { STONES.forEach(o => g.addProp(o)); },
    begin(g) { IDOLS.forEach(i => g.addProp(i)); },
    goal: 'Gather the foreign gods: 0 of 3', marker: null,
    solve: ['idol1', 'idol2', 'idol3'],
    trigger: { signal: 'idols' },
    async run(g) {
      await g.say('idols_done');
      g.award('incline');
      await g.say('we_will_obey');
      g.award('obey_voice');
    },
  },
  {
    id: 'stone', spawn: [20, 14],
    enter(g) { STONES.forEach(o => g.addProp(o)); },
    goal: 'Talk to Joshua.', marker: 'joshua',
    trigger: { talk: 'joshua' },
    async run(g) {
      await g.say('covenant');
      g.award('covenant');
      g.award('statute');
      g.addProp(WITNESS);
      g.flash(150);
      await g.say('stone_set');
      g.award('large_stone');
      g.award('witness_against');
      await g.say('sent_away');
      g.award('own_inheritance');
    },
  },
  {
    id: 'farewell', spawn: [20, 14],
    enter(g) { STONES.forEach(o => g.addProp(o)); g.addProp(WITNESS); g.place('joshua', 19, 16, 'down'); },
    goal: 'Talk to the elder, many years later.', marker: 'elder',
    trigger: { talk: 'elder' },
    async run(g) {
      await g.say('died');
      g.award('joshua_died');
      g.award('buried');
      await g.say('served');
      g.award('served_days');
      await g.say('bones');
      g.award('bones_of_joseph');
      await g.say('who_else');
      g.award('to_whom');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
