// The Ark Is Taken (1 Samuel 4-7): the ark is carried into battle and captured,
// Dagon falls before it in the temple at Ashdod, the Philistines send it back on a
// cart pulled by two cows, and Samuel sets up a stone called Ebenezer. There is a
// note for parents. The words are in dialogue.csv.

import { robe, lady, discover, makeMap, animal, soldier, job, trips, taps } from '../../src/storykit.js';

export const id = 'dagon';
export const title = 'The Ark Is Taken';
export const where = 'Ebenezer, Ashdod and Beth-shemesh';
export const ref = '1 Samuel 4-7';
export const place = [34.65, 31.8];   // the Philistine plain, Ashdod
export const after = 'listen';

// ----------------------------------------------------------------------- map
// The Israelite camp at Ebenezer first, then the temple at Ashdod, then the valley of Beth-shemesh.
//   s  desert    p  paving    .  grass    b  wheat field    ,  path    #  cliff

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
export const map = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (y === 14 && x < 28 || x === 18 && y >= 6 && y <= 14) return ',';
  return (x * 5 + y * 3) % 17 === 0 ? 'x' : 's';
});
const ASHDOD = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (x >= 10 && x <= 30 && y >= 4 && y <= 14) return 'p';
  if (y === 18 && x < 34) return ',';
  return '.';
});
const VALLEY = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (x >= 6 && x <= 34 && y >= 16 && y <= 24) return 'b';
  if (y === 12 && x < 34) return ',';
  return '.';
});

export const start = [5, 22];
export const door = [3, 23];
export const barriers = [];

// -------------------------------------------------------------------- the jobs

const stand = taps('dagon', { step: 'upright', total: 1, goal: 'Help the priests stand Dagon up again', keep: true });
const pen = taps('calf', { step: 'calves', total: 2, goal: 'Take the calves away and pen them up' });
const gold = job('gold', { step: 'gold', total: 3, goal: 'Put the gold offering in the chest', target: 'chest', hold: 'bundle' });

// -------------------------------------------------------------------- people

const israelite = (over = {}) => robe({ top: '#a9845a', ...over });
const philistine = (over = {}) => soldier({ top: '#6a3a3a', skin: '#a06a42', head: 'plume', headColor: '#a33a2a', ...over });

export const actors = [
  { id: 'elder', name: 'an elder of Israel', at: [14, 14], dir: 'right', chat: 'elder_idle', look: israelite({ top: '#7d5a8a', hair: '#e8e8e8', beard: '#e8e8e8' }) },
  { id: 'hophni', name: 'Hophni', at: [20, 16], dir: 'right', onUse: discover('disc_hophni', 'sons_of_eli'), look: robe({ top: '#f1ede0', sash: '#3d6fb5', beard: true }) },
  { id: 'soldier', name: 'a soldier of Israel', at: [9, 18], dir: 'right', onUse: discover('disc_soldier', 'four_thousand'), look: soldier({ top: '#a9845a' }) },
  { id: 'woman', name: 'a woman waiting for news', at: [12, 20], dir: 'right', onUse: discover('disc_woman', 'ichabod'), look: lady('#6a6a72', { hair: '#5a4a3a' }) },
  { id: 'philistine1', name: 'a Philistine', at: [30, 12], dir: 'left', hidden: true, solid: false, look: philistine() },
  { id: 'philistine2', name: 'a Philistine', at: [32, 15], dir: 'left', hidden: true, solid: false, look: philistine({ top: '#4a3a30' }) },
  { id: 'priest', name: 'a priest of Dagon', at: [20, 12], dir: 'down', hidden: true, chat: 'priest_idle', look: robe({ top: '#4a7ab0', skin: '#a06a42', beard: true, head: 'cloth', headColor: '#2a211c' }) },
  { id: 'ruler', name: 'a ruler of the Philistines', at: [18, 10], dir: 'down', hidden: true, chat: 'ruler_idle', look: philistine({ top: '#8a3a3a', hair: '#4a2f1b' }) },
  { id: 'diviner', name: 'a diviner', at: [22, 11], dir: 'left', hidden: true, onUse: discover('disc_diviner', 'guilt_offering'), look: robe({ top: '#6a6a72', skin: '#a06a42', head: 'cloth', headColor: '#e8e0cc', beard: true }) },
  { id: 'neighbor', name: 'a man of Ashdod', at: [8, 18], dir: 'right', hidden: true, onUse: discover('disc_ashdod', 'threshold'), look: robe({ top: '#8a3a3a', skin: '#a06a42' }) },
  animal('calf1', 'calf', [12, 20], { name: 'a calf', hidden: true, label: 'pen the calf', onUse: pen }),
  animal('calf2', 'calf', [15, 22], { name: 'a calf', hidden: true, label: 'pen the calf', onUse: pen }),
  animal('cow1', 'calf', [20, 20], { name: 'a cow', hidden: true, scale: 1.4 }),
  animal('cow2', 'calf', [20, 22], { name: 'a cow', hidden: true, scale: 1.4 }),
  animal('cart', 'cart', [22, 20], { name: 'the cart', hidden: true, scale: 1.6 }),
  { id: 'harvester', name: 'a harvester of Beth-shemesh', at: [14, 20], dir: 'right', hidden: true, onUse: discover('disc_harvest', 'overjoyed'), look: israelite({ top: '#c9893f', item: 'sheaf' }) },
  { id: 'levite', name: 'a Levite', at: [20, 14], dir: 'down', hidden: true, onUse: discover('disc_levite', 'who_can_stand'), look: robe({ top: '#f1ede0', sash: '#3d6fb5', beard: true, head: 'cloth', headColor: '#e8e0cc' }) },
  { id: 'samuel', name: 'Samuel', at: [22, 14], dir: 'left', hidden: true, chat: 'samuel_idle', look: robe({ top: '#f4f1e6', sash: '#c0415a', beard: true, hair: '#4a2f1b' }) },
];

// -------------------------------------------------------------------- things

export const objects = [
  { type: 'tent', x: 4, y: 10 }, { type: 'tent', x: 6, y: 14 }, { type: 'tent', x: 5, y: 19 }, { type: 'ptent', x: 24, y: 10 }, { type: 'rock', x: 28, y: 20 }, { type: 'bigrock', x: 34, y: 18 }, { type: 'palm', x: 26, y: 16 },
];
const CAMP = ['elder', 'hophni', 'soldier', 'woman'];
const TEMPLE = [
  { id: 'hall', type: 'palace', x: 14, y: 3 },
  { id: 'dagon', type: 'dagon', x: 18, y: 8 },
  { id: 'ark', type: 'arkcov', x: 22, y: 9 },
  { id: 'col1', type: 'column', x: 11, y: 6 }, { id: 'col2', type: 'column', x: 11, y: 11 }, { id: 'col3', type: 'column', x: 29, y: 6 }, { id: 'col4', type: 'column', x: 29, y: 11 },
];
const GOLD = [
  { id: 'gold1', type: 'sacks', x: 12, y: 19, item: 'a golden tumor', label: 'pick up the gold offering', onUse: gold.take },
  { id: 'gold2', type: 'sacks', x: 16, y: 21, item: 'a golden rat', label: 'pick up the gold offering', onUse: gold.take },
  { id: 'gold3', type: 'sacks', x: 24, y: 21, item: 'another golden rat', label: 'pick up the gold offering', onUse: gold.take },
  { id: 'chest', type: 'trough', x: 28, y: 17, label: 'put it in the chest', onUse: gold.give },
];
const VALLEY_THINGS = [
  { id: 'rock', type: 'bigrock', x: 20, y: 11 }, { id: 'oak', type: 'oak', x: 30, y: 8 }, { id: 'house1', type: 'house', x: 8, y: 6 }, { id: 'house2', type: 'house', x: 26, y: 5 },
];

const toAshdod = g => {
  if (g.state.place === 'ashdod') return;
  g.state.place = 'ashdod';
  g.ground(ASHDOD, 0);
  TEMPLE.forEach(o => g.addProp(o));
  for (const id of CAMP) g.hide(id);
  for (const id of ['priest', 'ruler', 'diviner', 'neighbor']) g.show(id);
  g.place('priest', 20, 12, 'down'); g.place('ruler', 14, 12, 'right'); g.place('diviner', 26, 12, 'left'); g.place('neighbor', 8, 17, 'right');
};
const toValley = g => {
  if (g.state.place === 'valley') return;
  g.state.place = 'valley';
  if (g.state.place0 !== false) { g.state.place0 = false; }
  g.ground(VALLEY, 0);
  for (const o of [...TEMPLE.map(t => t.id)]) g.removeProp(o);
  for (const o of GOLD) g.removeProp(o.id);
  for (const id of ['priest', 'ruler', 'diviner', 'neighbor', 'calf1', 'calf2', 'cow1', 'cow2', 'cart']) g.hide(id);
  VALLEY_THINGS.forEach(o => g.addProp(o));
  for (const id of ['harvester', 'levite']) g.show(id);
  g.place('harvester', 12, 18, 'right'); g.place('levite', 18, 13, 'down');
};

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'camp',
    goal: 'Talk to the elder of Israel.', marker: 'elder',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'elder' },
    async run(g) {
      await g.say('battle');
      g.award('ebenezer_aphek');
      await g.say('defeat');
      g.award('four_thousand_q');
      await g.say('bring_ark');
      g.award('bring_the_ark');
    },
  },
  {
    id: 'shout', spawn: [14, 15],
    begin(g) { g.show('philistine1'); g.show('philistine2'); },
    goal: 'Talk to Hophni, who has brought the ark.', marker: 'hophni',
    trigger: { talk: 'hophni' },
    async run(g) {
      await g.say('ark_comes');
      g.award('enthroned');
      await g.say('great_shout');
      g.award('ground_shook');
      g.shake(700, 0.006);
      await g.say('philistines_afraid');
      g.award('gods_entered');
      await g.say('woe');
      g.award('mighty_gods');
      await g.say('be_men');
      g.award('be_men');
      await g.say('defeated_ark');
      g.award('ark_captured');
      g.award('sons_died');
    },
  },
  {
    id: 'glory', spawn: [14, 15],
    enter(g) { g.show('philistine1'); g.show('philistine2'); },
    goal: 'Talk to the woman who is waiting for news.', marker: 'woman',
    trigger: { talk: 'woman' },
    async run(g) {
      await g.say('ichabod');
      g.award('glory_departed');
      await g.say('ichabod_think');
      await g.fadeOut(900);
    },
  },
  {
    id: 'ashdod', spawn: [18, 17],
    async intro(g) { await g.fadeOut(1); toAshdod(g); g.hide('philistine1'); g.hide('philistine2'); g.place('player', 18, 16, 'up'); await g.fadeIn(900); await g.say('to_ashdod'); g.award('to_ashdod'); },
    enter(g) { toAshdod(g); },
    goal: 'Look at the temple of Dagon, and the ark beside him.', marker: null,
    trigger: { zone: [16, 12, 20, 13] },
    async run(g) {
      await g.say('beside_statue');
      g.award('beside_statue');
      g.sky({ night: true });
      await g.fadeOut(900);
      g.removeProp('dagon');
      g.addProp({ id: 'dagonfallen', type: 'dagonBroken', x: 18, y: 8, label: 'help stand Dagon up', onUse: (g2, t) => (g2.stepId === 'upright' ? stand(g2, t) : g2.say('dagon_look')) });
      g.sky({});
      await g.fadeIn(900);
      await g.say('fallen_first');
      g.award('fallen');
    },
  },
  {
    id: 'upright', spawn: [18, 13],
    enter(g) { toAshdod(g); g.removeProp('dagon'); g.addProp({ id: 'dagonfallen', type: 'dagonBroken', x: 18, y: 8, label: 'help stand Dagon up', onUse: (g2, t) => (g2.stepId === 'upright' ? stand(g2, t) : g2.say('dagon_look')) }); },
    goal: 'Help the priests stand Dagon up again: 0 of 1', marker: 'dagonfallen',
    solve: ['dagonfallen'],
    trigger: { signal: 'upright' },
    async run(g) {
      g.removeProp('dagonfallen');
      g.addProp({ id: 'dagon', type: 'dagon', x: 18, y: 8 });
      await g.say('returned_to_place');
      g.award('returned_him');
      g.sky({ night: true });
      await g.fadeOut(900);
      g.removeProp('dagon');
      g.addProp({ id: 'dagonfallen', type: 'dagonBroken', x: 18, y: 8, label: 'look at Dagon', onUse: g2 => g2.say('dagon_look') });
      g.sky({});
      await g.fadeIn(900);
    },
  },
  {
    id: 'broken', spawn: [18, 13],
    enter(g) { toAshdod(g); g.removeProp('dagon'); g.addProp({ id: 'dagonfallen', type: 'dagonBroken', x: 18, y: 8, label: 'look at Dagon', onUse: g2 => g2.say('dagon_look') }); },
    goal: 'Talk to the priest of Dagon.', marker: 'priest',
    trigger: { talk: 'priest' },
    async run(g) {
      await g.say('fallen_second');
      g.award('head_and_hands');
      await g.say('threshold');
      g.award('do_not_step');
      await g.say('hand_heavy');
      g.award('hand_heavy');
      g.award('tumors');
      await g.say('moved_gath');
      g.award('ark_moved');
    },
  },
  {
    id: 'rulers', spawn: [18, 13],
    enter(g) { toAshdod(g); g.removeProp('dagon'); g.addProp({ id: 'dagonfallen', type: 'dagonBroken', x: 18, y: 8, label: 'look at Dagon', onUse: g2 => g2.say('dagon_look') }); },
    goal: 'Talk to the ruler of the Philistines.', marker: 'ruler',
    trigger: { talk: 'ruler' },
    async run(g) {
      await g.say('ekron');
      g.award('kill_us');
      await g.say('send_away');
      g.award('send_away');
      await g.say('seven_months');
      g.award('seven_months');
      await g.say('priests_advice');
      g.award('guilt_offering_q');
      g.award('understand');
    },
  },
  {
    id: 'calves', spawn: [18, 14],
    enter(g) { toAshdod(g); },
    begin(g) { g.show('calf1'); g.show('calf2'); g.place('calf1', 12, 20, 'right'); g.place('calf2', 15, 22, 'right'); g.show('cow1'); g.place('cow1', 20, 20, 'left'); g.show('cow2'); g.place('cow2', 20, 22, 'left'); },
    goal: 'Take the calves away and pen them up: 0 of 2', marker: null,
    solve: ['calf1', 'calf2'],
    trigger: { signal: 'calves' },
    async intro(g) { await g.say('new_cart'); g.award('new_cart'); },
    async run(g) {
      g.hide('calf1'); g.hide('calf2');
      await g.say('never_yoked');
      g.award('never_yoked');
      await g.say('test');
      g.award('test_beth_shemesh');
    },
  },
  {
    id: 'gold', spawn: [18, 14],
    enter(g) { toAshdod(g); g.show('cow1'); g.place('cow1', 20, 20, 'left'); },
    begin(g) { GOLD.forEach(o => g.addProp(o)); },
    goal: 'Put the gold offering in the chest: 0 of 3', marker: 'gold1',
    solve: trips(['gold1', 'gold2', 'gold3'], 'chest'),
    trigger: { signal: 'gold' },
    async run(g) {
      g.show('cart'); g.place('cart', 23, 20, 'right');
      await g.say('chest_beside');
      g.award('gold_objects');
      await g.say('send_on_way');
      g.award('on_its_way');
    },
  },
  {
    id: 'road', spawn: [18, 14],
    enter(g) { toAshdod(g); g.show('cart'); g.place('cart', 23, 20, 'right'); g.show('cow1'); g.place('cow1', 21, 20, 'right'); g.show('cow2'); g.place('cow2', 21, 22, 'right'); },
    goal: 'Watch the cows, and see which way they go.', marker: 'cart',
    trigger: { zone: [20, 17, 26, 19] },
    async run(g) {
      g.place('player', 22, 18, 'right');
      g.walk('cow1', [[34, 20]], 55); g.walk('cow2', [[34, 22]], 55); g.walk('cart', [[35, 20]], 55);
      await g.pan(28, 20, 900);
      await g.say('headed_straight');
      g.award('headed_straight');
      await g.wait(3500);
      await g.say('rulers_follow');
      g.award('rulers_followed');
    },
  },
  {
    id: 'valley', spawn: [14, 14],
    enter(g) { toValley(g); },
    async intro(g) { await g.fadeOut(900); toValley(g); g.place('player', 18, 13, 'down'); await g.fadeIn(900); await g.say('harvesting'); },
    goal: 'Walk up to the large rock, and see what comes.', marker: null,
    trigger: { zone: [18, 12, 22, 14] },
    async run(g) {
      g.place('player', 19, 13, 'up');
      await g.say('overjoyed');
      g.award('overjoyed_q');
      await g.say('stopped_at_rock');
      g.award('field_of_joshua');
      g.award('large_rock');
      await g.say('chopped');
      g.award('burnt_offering');
      await g.say('levites');
      g.award('levites_took_down');
    },
  },
  {
    id: 'samuel', spawn: [20, 14],
    enter(g) { toValley(g); },
    begin(g) { g.show('samuel'); g.place('samuel', 22, 14, 'left'); },
    goal: 'Talk to Samuel, twenty years later.', marker: 'samuel',
    trigger: { talk: 'samuel' },
    async intro(g) { g.show('samuel'); g.place('samuel', 22, 14, 'left'); await g.say('who_can_stand'); g.award('holy_god'); await g.say('kiriath'); g.award('kiriath_jearim'); await g.say('twenty_years'); g.award('twenty_years'); },
    async run(g) {
      await g.say('return_to_lord');
      g.award('foreign_gods');
      g.award('serve_only');
      await g.say('put_away');
      g.award('put_away');
      await g.say('ebenezer');
      g.award('ebenezer');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
