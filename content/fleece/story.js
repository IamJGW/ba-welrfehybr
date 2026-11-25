// Gideon's Fleece (Judges 6): Midian's raids, Gideon threshing wheat in a winepress,
// the angel under the oak, the offering, Baal's altar torn down at night, and the
// fleece tested twice. The words are in dialogue.csv.

import { robe, lady, discover, makeMap, animal, job, trips, taps } from '../../src/storykit.js';

export const id = 'fleece';
export const title = "Gideon's Fleece";
export const where = 'Ophrah, in the land of Manasseh';
export const ref = 'Judges 6';
export const place = [35.35, 32.45];   // near Ophrah
export const after = 'deborah';

// ----------------------------------------------------------------------- map
//   .  grass    h  hillside    c  cave floor    k  threshing floor    m  wet ground    ,  path    #  cliff

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
const ground = wet => makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (x >= 26 && x <= 34 && y >= 14 && y <= 20) return wet ? 'm' : 'k';
  if (x <= 8 && y <= 8) return 'c';
  if (y <= 5) return 'h';
  if (y === 12 && x < 26 || x === 20 && y >= 8 && y <= 12) return ',';
  return '.';
});
export const map = ground(false);
const WET = ground(true);

export const start = [5, 22];
export const door = [3, 23];
export const barriers = [];

// -------------------------------------------------------------------- the jobs

const thresh = taps('thresh', { step: 'thresh', total: 3, goal: 'Thresh the wheat quietly, out of sight', marker: null });
const WHEAT = [[12, 14], [14, 16], [9, 16]].map(([x, y], i) => ({ id: `wheat${i + 1}`, type: 'sheaves', x, y, label: 'thresh the wheat', onUse: thresh }));
const bring = job('offer', { step: 'offering', total: 3, goal: "Bring Gideon's offering to the rock", target: 'rock', hold: 'bundle' });
const tear = taps('tear', { step: 'baal', total: 3, goal: "Tear down Baal's altar", marker: null });

// -------------------------------------------------------------------- the fleece

const fleeceTest = (n, scene) => async g => {
  if (g.stepId !== `fleece${n}`) return g.say('fleece_look');
  g.signal(`fleece${n}`);
};

// -------------------------------------------------------------------- people

const israelite = (over = {}) => robe({ top: '#a9845a', ...over });
const camel = (id, at) => animal(id, 'camel', at, { name: 'a camel', hidden: true, scale: 1.4 });

export const actors = [
  { id: 'gideon', name: 'Gideon', at: [11, 15], dir: 'down', chat: 'gideon_idle', look: israelite({ top: '#8a6a3a', beard: true }) },
  { id: 'angel', name: 'the angel of the LORD', at: [21, 9], dir: 'down', hidden: true, chat: 'angel_idle', look: robe({ top: '#f8f4e8', sash: '#e3b93a', hair: '#e8d8a0', beard: false, head: 'band', headColor: '#e3b93a', item: 'staff' }) },
  { id: 'joash', name: 'Joash', at: [24, 11], dir: 'left', chat: 'joash_idle', look: israelite({ top: '#7d5a8a', hair: '#cfcfcf', beard: '#cfcfcf' }) },
  { id: 'servant1', name: 'a servant', at: [16, 18], dir: 'right', onUse: discover('disc_servant', 'ten_servants'), look: israelite({ top: '#4f8a6a' }) },
  { id: 'servant2', name: 'a servant', at: [18, 20], dir: 'right', chat: 'servant_idle', look: israelite({ top: '#c9893f' }) },
  { id: 'prophet', name: 'a prophet', at: [6, 17], dir: 'right', onUse: discover('disc_prophet', 'prophet'), look: robe({ top: '#6a6a72', hair: '#e8e8e8', beard: '#e8e8e8', item: 'staff' }) },
  { id: 'woman', name: 'a woman from the caves', at: [4, 9], dir: 'right', onUse: discover('disc_woman', 'shelters'), look: lady('#6b8a4f', { hair: '#2a211c' }) },
  { id: 'child', name: 'a child', at: [7, 12], dir: 'right', scale: 0.75, onUse: discover('disc_child', 'swarm'), look: robe({ top: '#d9b45a' }) },
  { id: 'raider1', name: 'a Midianite', at: [38, 8], dir: 'left', hidden: true, solid: false, look: robe({ top: '#8a3a3a', skin: '#a06a42', head: 'cloth', headColor: '#2a211c', beard: true }) },
  camel('camel1', [39, 9]), camel('camel2', [39, 7]),
];

// -------------------------------------------------------------------- things

export const objects = [
  { id: 'oak', type: 'oak', x: 19, y: 6 },
  { id: 'press', type: 'winepress', x: 10, y: 12 },
  { type: 'house', x: 14, y: 6 }, { type: 'house', x: 26, y: 7 }, { type: 'tent', x: 8, y: 19 },
  { type: 'rock', x: 4, y: 14 }, { type: 'bigrock', x: 35, y: 9 }, { type: 'palm', x: 23, y: 17 },
  { id: 'rock', type: 'bigrock', x: 22, y: 11, label: 'put it on the rock', onUse: bring.give },
  { id: 'goat', type: 'sacks', x: 16, y: 21, item: 'a young goat, ready to cook', label: 'pick up the meat', onUse: bring.take },
  { id: 'bread', type: 'oven', x: 24, y: 21, item: 'unleavened bread', label: 'pick up the bread', onUse: bring.take },
  { id: 'broth', type: 'pot', x: 29, y: 22, item: 'the broth', carry: 'jar', label: 'pick up the broth', onUse: bring.take },
];
const BAAL = [
  { id: 'baalaltar', type: 'altar', x: 14, y: 10, label: "tear down Baal's altar", onUse: tear },
  { id: 'asherah', type: 'pole', x: 17, y: 10, label: 'cut down the Asherah pole', onUse: tear },
  { id: 'baalstones', type: 'flatstones', x: 12, y: 9, label: "carry away Baal's stones", onUse: tear },
];
const PROPER = { id: 'altar', type: 'altar', x: 14, y: 8 };
const FLEECE = { id: 'fleece', type: 'fleece', x: 30, y: 17 };

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'winepress',
    goal: 'Talk to Gideon, by the winepress.', marker: 'gideon',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'gideon' },
    async run(g) {
      await g.say('gideon');
      g.award('winepress');
      await g.say('midian');
      g.award('hide_it');
    },
  },
  {
    id: 'thresh', spawn: [12, 17],
    enter(g) { WHEAT.forEach(w => g.addProp(w)); },
    goal: 'Thresh the wheat quietly, out of sight: 0 of 3', marker: null,
    solve: ['wheat1', 'wheat2', 'wheat3'],
    trigger: { signal: 'thresh' },
    async run(g) {
      g.show('raider1'); g.show('camel1'); g.show('camel2');
      g.walk('raider1', [[10, 4], [4, 4]], 50); g.walk('camel1', [[11, 4], [5, 4]], 50); g.walk('camel2', [[12, 5], [6, 5]], 50);
      await g.say('swarm');
      g.award('locusts');
      await g.say('hid');
      g.award('midianites');
      for (const id of ['raider1', 'camel1', 'camel2']) g.hide(id);
    },
  },
  {
    id: 'angel', spawn: [20, 12],
    enter(g) { for (const id of ['raider1', 'camel1', 'camel2']) g.hide(id); },
    begin(g) { g.show('angel'); g.place('angel', 21, 9, 'down'); },
    goal: 'Talk to the stranger sitting under the oak.', marker: 'angel',
    trigger: { talk: 'angel' },
    async intro(g) { g.show('angel'); g.place('angel', 21, 9, 'down'); await g.say('cried_out'); g.award('cried_out'); g.award('prophet_sent'); await g.say('oak'); },
    async run(g) {
      await g.say('mighty_man');
      g.award('mighty_man');
      await g.say('gideon_asks');
      g.award('where_wonders');
      await g.say('go_in_strength');
      g.award('strength');
      await g.say('weakest_clan');
      g.award('weakest');
      await g.say('with_you');
      g.award('with_you');
      await g.say('sign_please');
      g.award('sign');
    },
  },
  {
    id: 'offering', spawn: [20, 14],
    enter(g) { g.show('angel'); g.place('angel', 21, 9, 'down'); },
    goal: "Bring Gideon's offering to the rock: 0 of 3", marker: 'goat',
    solve: trips(['goat', 'bread', 'broth'], 'rock'),
    trigger: { signal: 'offering' },
    async intro(g) { await g.say('offering_prep'); g.award('young_goat'); },
    async run(g) {
      await g.say('lay_it_on_rock');
      g.award('on_the_rock');
      const flame = g.fx('flame', 22 * g.T + 16, 10 * g.T).setScale(1.2).setAlpha(0);
      await g.tween({ targets: flame, alpha: 1, duration: 700 });
      g.flash(300);
      await g.say('fire');
      g.award('fire_flared');
      await g.tween({ targets: flame, alpha: 0, duration: 900 });
      flame.destroy();
      g.hide('angel');
      await g.say('vanished');
      g.award('face_to_face');
      await g.say('peace');
      g.award('do_not_fear');
      await g.say('lord_is_peace');
      g.award('altar_peace');
    },
  },
  {
    id: 'baal', spawn: [16, 14],
    enter(g) { g.hide('angel'); },
    begin(g) { g.sky({ night: true, stars: true }); BAAL.forEach(b => g.addProp(b)); },
    goal: "Tear down Baal's altar: 0 of 3", marker: null,
    solve: ['baalaltar', 'asherah', 'baalstones'],
    trigger: { signal: 'baal' },
    async intro(g) { await g.say('that_night'); g.award('that_very_night'); g.award('tear_down_altar'); await g.say('by_night'); },
    async run(g) {
      g.addProp(PROPER);
      await g.say('proper_altar');
      g.award('proper_altar');
      g.award('too_afraid');
      g.sky({});
    },
  },
  {
    id: 'morning', spawn: [18, 14],
    enter(g) { g.hide('angel'); g.sky({}); g.addProp(PROPER); },
    goal: 'Talk to Joash, Gideon\'s father.', marker: 'joash',
    trigger: { talk: 'joash' },
    async run(g) {
      await g.say('city_men');
      g.award('who_did_this');
      await g.say('joash');
      g.award('contend');
      await g.say('jerubbaal');
      g.award('jerubbaal');
    },
  },
  {
    id: 'fleece1', spawn: [26, 14],
    enter(g) { g.hide('angel'); g.addProp(PROPER); },
    begin(g) { g.addProp({ ...FLEECE, label: 'spread the fleece on the threshing floor', onUse: fleeceTest(1) }); },
    goal: 'Spread the fleece on the threshing floor.', marker: 'fleece',
    solve: ['fleece'],
    trigger: { signal: 'fleece1' },
    async intro(g) { await g.say('test_one'); g.award('if_you_are_going'); g.award('fleece_of_wool'); },
    async run(g) {
      g.sky({ night: true, stars: true });
      await g.fadeOut(700);
      g.removeProp('fleece');
      g.addProp({ id: 'fleece', type: 'fleeceWet', x: 30, y: 17, label: 'look at the fleece', onUse: g2 => g2.say('fleece_look') });
      g.sky({});
      await g.fadeIn(900);
      await g.say('dew_on_fleece');
      g.award('dew_only');
      g.award('bowlful');
    },
  },
  {
    id: 'fleece2', spawn: [26, 14],
    enter(g) { g.hide('angel'); g.addProp(PROPER); g.addProp({ id: 'fleece', type: 'fleeceWet', x: 30, y: 17 }); },
    begin(g) { g.removeProp('fleece'); g.addProp({ ...FLEECE, label: 'spread the fleece again', onUse: fleeceTest(2) }); },
    goal: 'Spread the fleece again, for one more test.', marker: 'fleece',
    solve: ['fleece'],
    trigger: { signal: 'fleece2' },
    async intro(g) { await g.say('test_two'); g.award('do_not_be_angry'); },
    async run(g) {
      g.sky({ night: true, stars: true });
      await g.fadeOut(700);
      g.ground(WET, 0);
      g.sky({});
      await g.fadeIn(900);
      await g.say('only_fleece_dry');
      g.award('only_fleece');
      g.award('dew_on_ground');
    },
  },
  {
    id: 'farewell', spawn: [26, 14],
    enter(g) { g.hide('angel'); g.addProp(PROPER); g.ground(WET, 0); },
    goal: 'Talk to Gideon, when you are ready.', marker: 'gideon',
    begin(g) { g.place('gideon', 24, 14, 'right'); },
    trigger: { talk: 'gideon' },
    async run(g) {
      await g.say('peace_of_christ');
      g.award('my_peace');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
