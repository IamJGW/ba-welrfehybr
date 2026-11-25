// Gideon's Three Hundred (Judges 7-8:23): too many men, the water, the dream of the
// barley loaf, three hundred men with horns, jars and torches, and Gideon refusing
// to be king. The words are in dialogue.csv.

import { robe, lady, discover, makeMap, animal, soldier, job, trips } from '../../src/storykit.js';

export const id = 'torches';
export const title = "Gideon's Three Hundred";
export const where = 'The spring of Harod and the valley of Moreh';
export const ref = 'Judges 7; 8:22-23';
export const place = [35.35, 32.55];   // the valley of Jezreel
export const after = 'fleece';

// ----------------------------------------------------------------------- map
//   .  grass    h  hillside    ~  spring and stream    ,  path    #  cliff    n  night valley

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
export const map = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (x >= 6 && x <= 10 && y >= 12 && y <= 16) return '~';
  if (x <= 12 && y <= 8 || x >= 28 && y <= 8) return 'h';
  if (y === 18 && x < 28 || x === 12 && y >= 8 && y <= 18) return ',';
  return '.';
});

export const start = [4, 22];
export const door = [3, 23];
export const barriers = [];

// -------------------------------------------------------------------- the jobs

const gear = job('gear', { step: 'gear', total: 3, goal: 'Bring the horns, jars and torches to Gideon', target: 'gideon', hold: 'bundle' });
const MEN = [
  ['amos', 'Amos', 7, 14, 'kneel'], ['dan', 'Dan', 9, 17, 'lap'], ['eli', 'Eli', 5, 13, 'kneel'],
  ['jonah', 'Jonah', 8, 11, 'lap'], ['seth', 'Seth', 11, 15, 'kneel'], ['zeke', 'Zeke', 6, 17, 'lap'],
];

// -------------------------------------------------------------------- people

const israelite = (over = {}) => robe({ top: '#a9845a', ...over });
const midian = (id, at, over = {}) => ({ id, name: 'a Midianite', at, dir: 'left', hidden: true, solid: false, look: robe({ top: '#8a3a3a', skin: '#a06a42', head: 'cloth', headColor: '#2a211c', beard: true, ...over }) });

export const actors = [
  { id: 'gideon', name: 'Gideon', at: [14, 14], dir: 'down', onUse: g => (g.stepId === 'gear' ? gear.give(g) : g.say('gideon_idle')), look: soldier({ top: '#8a6a3a', head: 'band', headColor: '#7a2e2e', beard: true }) },
  { id: 'purah', name: 'Purah', at: [16, 16], dir: 'left', onUse: discover('disc_purah', 'purah'), look: israelite({ top: '#4f8a6a' }) },
  ...MEN.map(([id, name, x, y]) => ({ id, name, at: [x, y], dir: 'down', hidden: false, solid: false, look: israelite({ top: ['#7d5a8a', '#c9893f', '#3d6fb5', '#8a3a3a', '#6b8a4f', '#a9845a'][MEN.findIndex(m => m[0] === id)], beard: id !== 'jonah' }) })),
  { id: 'afraid', name: 'a man who is afraid', at: [16, 20], dir: 'left', onUse: discover('disc_afraid', 'turn_back'), look: israelite({ top: '#6a6a72', beard: true }) },
  { id: 'wife', name: 'a soldier\'s wife', at: [10, 21], dir: 'right', onUse: discover('disc_wife', 'glorify'), look: lady('#6b8a4f', { hair: '#2a211c' }) },
  { id: 'friend1', name: 'a Midianite soldier', at: [30, 18], dir: 'left', hidden: true, onUse: discover('disc_dream', 'barley_loaf'), look: robe({ top: '#8a3a3a', skin: '#a06a42', head: 'cloth', headColor: '#2a211c', beard: true }) },
  { id: 'friend2', name: 'a Midianite soldier', at: [31, 19], dir: 'left', hidden: true, onUse: discover('disc_dream2', 'sword_of_gideon'), look: robe({ top: '#6a3a3a', skin: '#a06a42', head: 'cloth', headColor: '#2a211c' }) },
  midian('foe1', [30, 14]), midian('foe2', [32, 16]), midian('foe3', [34, 18]), midian('foe4', [31, 21]),
  animal('camel1', 'camel', [33, 12], { name: 'a camel', scale: 1.4 }), animal('camel2', 'camel', [35, 20], { name: 'a camel', scale: 1.4 }),
];

// -------------------------------------------------------------------- things

export const objects = [
  { type: 'tent', x: 4, y: 11 }, { type: 'tent', x: 3, y: 15 }, { type: 'tent', x: 6, y: 19 }, { type: 'ptent', x: 14, y: 10 },
  { type: 'ptent', x: 29, y: 12 }, { type: 'ptent', x: 33, y: 15 }, { type: 'ptent', x: 29, y: 21 }, { type: 'ptent', x: 35, y: 17 }, { type: 'ptent', x: 31, y: 10 }, { type: 'ptent', x: 35, y: 23 },
  { type: 'rock', x: 20, y: 12 }, { type: 'rock', x: 24, y: 22 }, { type: 'bigrock', x: 22, y: 16 }, { type: 'palm', x: 12, y: 21 },
  { id: 'horns', type: 'hornbag', x: 18, y: 22, item: 'rams’ horns', label: 'pick up the horns', onUse: gear.take },
  { id: 'jars', type: 'jars', x: 20, y: 20, item: 'the large jars', carry: 'jar', label: 'pick up the jars', onUse: gear.take },
  { id: 'torches', type: 'fire', x: 22, y: 21, item: 'the torches', carry: 'torch', label: 'take the torches', onUse: gear.take },
];

const foes = ['foe1', 'foe2', 'foe3', 'foe4'];

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'muster',
    goal: 'Talk to Gideon, at the spring of Harod.', marker: 'gideon',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'gideon' },
    async run(g) {
      await g.say('camped');
      g.award('harod');
      await g.say('too_many');
      g.award('too_many');
      g.award('own_hand');
      await g.say('fearful');
      g.award('fearful');
      g.award('twenty_two');
    },
  },
  {
    id: 'water', spawn: [12, 17],
    goal: 'Talk to Gideon, at the water.', marker: 'gideon',
    trigger: { talk: 'gideon' },
    async intro(g) { await g.say('still_too_many'); g.award('sift'); },
    async run(g) {
      await g.say('sift_rule');
      g.award('lap_or_kneel');
      await g.say('sift_ask');
      for (const [id, , , , how] of MEN) {
        const right = await g.choose(`man_${id}`);
        await g.say(right ? 'right_pick' : 'wrong_pick');
      }
      await g.say('three_hundred');
      g.award('three_hundred');
      await g.say('save_you');
      g.award('save_you');
      await g.say('rest_home');
      g.award('go_home');
    },
  },
  {
    id: 'night', spawn: [14, 16],
    goal: 'Go down with Gideon and Purah to listen at the camp.', marker: null,
    trigger: { zone: [26, 17, 28, 19] },
    async intro(g) { g.sky({ night: true, stars: true }); await g.say('afraid_night'); g.award('get_up'); g.award('purah_servant'); },
    async run(g) {
      for (const id of ['friend1', 'friend2']) g.show(id);
      g.place('gideon', 25, 18, 'right'); g.place('purah', 25, 19, 'right'); g.place('player', 26, 18, 'right');
      await g.say('locusts_valley');
      g.award('countless');
      await g.say('dream');
      g.award('loaf');
      await g.say('meaning');
      g.award('sword');
      await g.say('worship');
      g.award('bowed');
      g.award('delivered');
    },
  },
  {
    id: 'gear', spawn: [20, 18],
    enter(g) { g.sky({ night: true, stars: true }); for (const id of ['friend1', 'friend2']) g.show(id); },
    goal: 'Bring the horns, jars and torches to Gideon: 0 of 3', marker: 'horns',
    solve: trips(['horns', 'jars', 'torches'], 'gideon'),
    trigger: { signal: 'gear' },
    async intro(g) { g.place('gideon', 18, 18, 'down'); await g.say('three_companies'); g.award('three_companies'); },
    async run(g) {
      await g.say('gear_given');
      g.award('horn_and_jar');
      await g.say('watch_me');
      g.award('watch_me');
      g.award('for_the_lord');
    },
  },
  {
    id: 'surround', spawn: [24, 18],
    enter(g) { g.sky({ night: true, stars: true }); },
    goal: 'Take your place around the camp.', marker: null,
    trigger: { zone: [26, 17, 28, 19] },
    async run(g) {
      g.place('player', 27, 18, 'right');
      await g.say('outskirts');
      g.award('middle_watch');
      g.flash(250);
      g.shake(600, 0.006);
      await g.say('broke_jars');
      g.award('shattered_jars');
      g.award('three_companies_blew');
      await g.say('shouted');
      g.award('sword_for_the_lord');
      for (const id of foes) g.show(id);
      for (const id of ['friend1', 'friend2']) g.hide(id);
      g.walk('foe1', [[40, 10]], 160); g.walk('foe2', [[40, 14]], 160); g.walk('foe3', [[40, 18]], 150); g.walk('foe4', [[40, 22]], 150);
      g.walk('camel1', [[40, 11]], 120); g.walk('camel2', [[40, 21]], 120);
      await g.say('fled');
      g.award('fled');
      g.award('swords_against');
      for (const id of foes) g.hide(id);
      g.hide('camel1'); g.hide('camel2');
      g.sky({});
    },
  },
  {
    id: 'rule', spawn: [22, 18],
    enter(g) { g.sky({}); g.hide('camel1'); g.hide('camel2'); for (const id of foes) g.hide(id); for (const id of ['friend1', 'friend2']) g.hide(id); g.place('gideon', 20, 17, 'down'); },
    goal: 'Talk to Gideon, in the morning.', marker: 'gideon',
    trigger: { talk: 'gideon' },
    async run(g) {
      await g.say('pursued');
      g.award('pursued');
      await g.say('rule_over_us');
      g.award('rule_over_us');
      await g.say('lord_shall_rule');
      g.award('lord_shall_rule');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
