// A Wife for Isaac (Genesis 24): Abraham's servant prays at the well, Rebekah
// waters his ten camels, her family agrees, she says "I will go," and far away
// in the Negev Isaac meets her in the field. The words are in dialogue.csv.

import { ANIMAL_HEADROOM } from '../../src/art.js';
import { robe, discover, makeMap, patch } from '../../src/storykit.js';

export const id = 'rebekah';
export const title = 'A Wife for Isaac';
export const where = "Nahor's town in Aram-naharaim, then the Negev";
export const ref = 'Genesis 24';
export const after = 'moriah';
export const place = [39.4, 36.5];   // near Haran; the Bible gives no closer place

// ----------------------------------------------------------------------- map
// Nahor's town first, with its well. Later the ground changes to the Negev.
//   #  cliff    .  grass    ,  road    s  desert rock

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
export const map = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (y === 20 || x === 30 && y >= 13 && y <= 20) return ',';
  return '.';
});
const NEGEV = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (x >= 18 && x <= 30 && y >= 9 && y <= 17) return '.';
  return patch(x, y) ? '.' : 's';
});

export const start = [5, 20];
export const door = [3, 21];
export const barriers = [];

// -------------------------------------------------------------------- watering

// Fill a jar at the well, empty it into the trough. Rebekah runs back and forth
// too, so each trip of yours waters four camels between you (Genesis 24:19-20).
const CAMELS = 10;
const water = g => (g.state.water ||= { holding: false, drunk: 0 });
function useWell(g) {
  const w = water(g);
  if (g.stepId !== 'water') return g.note(g.text('look_well'));
  if (w.holding) return g.note(g.text('jar_full'));
  w.holding = true;
  g.hold('jar');
  g.note(g.text('fill_jar'));
}
function useTrough(g) {
  const w = water(g);
  if (g.stepId !== 'water') return g.note(g.text('look_trough'));
  if (!w.holding) return g.note(g.text('trough_empty'));
  w.holding = false;
  w.drunk = Math.min(CAMELS, w.drunk + 4);
  g.hold(null);
  g.note(g.text('pour'));
  if (w.drunk >= CAMELS) return g.signal('water');
  g.goal(`Help Rebekah water the ten camels: ${w.drunk} of ${CAMELS}`, 'trough');
}

// -------------------------------------------------------------------- people

const lady = (top, over = {}) => robe({ top, hairStyle: 'long', head: 'cloth', headColor: '#d9c9a3', ...over });
const animal = (id, kind, at, over = {}) => ({ id, name: `a ${kind}`, at, solid: false, look: { kind }, headroom: ANIMAL_HEADROOM, ...over });
const KNEEL = [[9, 12], [11, 12], [13, 12], [8, 14], [10, 14], [12, 14], [9, 16], [11, 16], [13, 16], [7, 16]];
const camels = KNEEL.map(([x, y], i) => animal(`camel${i}`, 'camel', [x, y], { dir: i % 2 ? 'left' : 'right', scale: 1.25 }));

export const actors = [
  { id: 'servant', name: "Abraham's servant", at: [15, 15], dir: 'up', chat: 'servant_idle', look: robe({ top: '#3d6f6a', sash: '#e3b93a', beard: '#9a9a9a', head: 'band', headColor: '#e3b93a' }) },
  { id: 'rebekah', name: 'Rebekah', at: [30, 13], hidden: true, solid: false, chat: 'rebekah_idle', look: lady('#c9503a', { headColor: '#e8d8a8', item: 'jar' }) },
  { id: 'driver', name: 'a camel driver', at: [6, 18], dir: 'right', onUse: discover('disc_angel', 'angel'), look: robe({ top: '#8a6f5a', head: 'cloth', headColor: '#d9c9a3' }) },
  { id: 'girl', name: 'a girl at the well', at: [19, 10], dir: 'left', onUse: discover('disc_mile', 'extramile'), look: lady('#5a7ab0', { item: 'jar' }) },
  { id: 'laban', name: 'Laban', at: [30, 13], hidden: true, chat: 'laban_idle', look: robe({ top: '#8a3a3a', sash: '#e3b93a', beard: true }) },
  { id: 'mother', name: "Rebekah's mother", at: [25, 13], hidden: true, onUse: discover('disc_thousands', 'thousands'), look: lady('#7d5a8a', { hair: '#b9b9b9' }) },
  { id: 'nurse', name: "Rebekah's nurse", at: [24, 14], hidden: true, onUse: discover('disc_nurse', 'nurse'), look: lady('#8f7a5c', { hair: '#e8e8e8' }) },
  { id: 'isaac', name: 'Isaac', at: [24, 13], hidden: true, look: robe({ top: '#c9a24a', sash: '#7a5a34', beard: true }) },
  ...camels,
];

// -------------------------------------------------------------------- things

const TOWN = [
  { id: 'h1', type: 'house', x: 24, y: 4 }, { id: 'h2', type: 'house', x: 30, y: 6 }, { id: 'h3', type: 'house', x: 34, y: 3 },
  { id: 'home', type: 'house', x: 27, y: 10 },
  { id: 'well', type: 'well', x: 16, y: 11, label: 'draw water from the well', onUse: useWell },
  { id: 'trough', type: 'trough', x: 18, y: 13, label: 'pour water into the trough', onUse: useTrough },
  { id: 'palm1', type: 'palm', x: 21, y: 7 }, { id: 'palm2', type: 'palm', x: 35, y: 16 },
];
export const objects = TOWN;
const CAMP = [
  { id: 'saratent', type: 'bigtent', x: 8, y: 6 }, { id: 'tent2', type: 'tent', x: 14, y: 5 },
  { id: 'tree', type: 'tree', x: 28, y: 8 }, { id: 'rock', type: 'bigrock', x: 33, y: 20 },
];

// -------------------------------------------------------------------- scenes

const metAtWell = g => {
  if (g.state.met) return;
  g.state.met = true;
  g.show('rebekah');
  g.place('rebekah', 17, 12, 'left');
  g.place('servant', 14, 14, 'right');
};
const rebekahRuns = g => {
  if (g.state.ran) return;
  g.state.ran = true;
  metAtWell(g);
  g.patrol('rebekah', null);
  g.hide('rebekah');
  g.show('laban');
  g.place('laban', 21, 14, 'left');
  g.place('servant', 16, 14, 'right');
};
const nextMorning = g => {
  if (g.state.morning) return;
  rebekahRuns(g);
  g.state.morning = true;
  g.removeProp('trough');
  for (const id of ['rebekah', 'mother', 'nurse']) g.show(id);
  g.setLook('rebekah', { item: null });
  g.place('rebekah', 24, 13, 'down');
  g.place('mother', 26, 14, 'left');
  g.place('nurse', 22, 15, 'right');
  g.place('laban', 28, 15, 'left');
  g.place('servant', 20, 16, 'right');
  g.setChat('rebekah', 'rebekah_ready');
};
const toNegev = g => {
  if (g.state.negev) return;
  nextMorning(g);
  g.state.negev = true;
  TOWN.forEach(o => g.removeProp(o.id));
  g.ground(NEGEV, 0);
  CAMP.forEach(o => g.addProp(o));
  for (const id of ['mother', 'laban', 'girl', 'driver']) g.hide(id);
  KNEEL.forEach(([x, y], i) => g.place(`camel${i}`, x - 3, y + 4, 'right'));
  g.place('rebekah', 10, 17, 'right');
  g.place('nurse', 8, 18, 'right');
  g.place('servant', 12, 18, 'right');
  g.show('isaac');
  g.place('isaac', 24, 13, 'left');
  g.setChat('rebekah', 'rebekah_negev');
};

export const steps = [
  {
    id: 'well',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    goal: "Talk to Abraham's servant, by the camels.", marker: 'servant',
    trigger: { talk: 'servant' },
    async run(g) {
      await g.say('pray');
      g.award('prayer');
      g.show('rebekah');
      g.place('rebekah', 30, 13, 'left');
      await g.pan(22, 12, 700);
      await g.walk('rebekah', [[22, 12], [17, 12]], 130);
      await g.say('before');
      g.award('before');
      await g.walk('servant', [[16, 13]], 200);
      g.face('servant', 'right');
      await g.follow(600);
      await g.say('drink');
      g.award('camels');
      await g.walk('servant', [[14, 14]], 120);
      metAtWell(g);
    },
  },
  {
    id: 'water', spawn: [16, 15],
    enter(g) { metAtWell(g); },
    begin(g) { if (!g.state.ran) g.patrol('rebekah', [[17, 12], [20, 12]], 110, 0.4); },
    goal: `Help Rebekah water the ten camels: 0 of ${CAMELS}`, marker: 'well',
    trigger: { signal: 'water' },
    async run(g) {
      g.patrol('rebekah', null);
      g.place('rebekah', 17, 12, 'left');
      await g.say('watered');
      await g.say('ring');
      await g.say('led');
      g.award('led');
      g.setLook('rebekah', { item: null });
      await g.walk('rebekah', [[30, 13]], 170);
      rebekahRuns(g);
      g.place('laban', 30, 13, 'left');
      await g.walk('laban', [[21, 14]], 170);
      await g.say('laban');
    },
  },
  {
    id: 'house', spawn: [18, 16],
    enter(g) { rebekahRuns(g); },
    begin(g) { g.walk('laban', [[28, 14], [28, 12]], 110); },
    goal: "Follow Laban to Bethuel's house.", marker: 'laban',
    trigger: { zone: [26, 11, 30, 13] },
    async run(g) {
      await g.fadeOut(700);
      await g.say('inside');
      g.award('fromlord');
      nextMorning(g);
      g.place('player', 22, 17, 'up');
      await g.fadeIn(700);
      await g.say('will_go');
      g.award('willgo');
    },
  },
  {
    id: 'leave', spawn: [22, 17],
    enter(g) { nextMorning(g); },
    goal: 'Talk to Rebekah when it is time to set out.', marker: 'rebekah',
    trigger: { talk: 'rebekah' },
    async run(g) {
      await g.say('set_out');
      await g.fadeOut(900);
      await g.say('weeks');
      toNegev(g);
      g.place('player', 12, 16, 'right');
      await g.fadeIn(900);
      await g.say('evening');
    },
  },
  {
    id: 'negev', spawn: [12, 16],
    enter(g) { toNegev(g); },
    goal: 'Who is that man in the field? Go and meet him.', marker: 'isaac',
    trigger: { talk: 'isaac' },
    async run(g) {
      g.place('rebekah', 21, 15, 'right');
      g.place('servant', 20, 12, 'right');
      await g.say('isaac');
      g.award('loved');
      await g.say('isaac_end');
      await g.fadeOut(900);
    },
  },
];
