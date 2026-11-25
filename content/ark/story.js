// Noah Builds the Ark (Genesis 6-7): loading food, the animals coming two by
// two, and the LORD shutting the door as the rain begins. The words are in
// dialogue.csv.

import { ANIMAL_HEADROOM } from '../../src/art.js';
import { robe, discover, makeMap } from '../../src/storykit.js';

export const id = 'ark';
export const title = 'Noah Builds the Ark';
export const where = 'Where Noah lived, before the flood';
export const ref = 'Genesis 6-7';
export const after = 'garden';
export const place = [45.7, 34.0];   // the Bible does not say where Noah built the ark

// ----------------------------------------------------------------------- map
//   #  cliff    .  grass    ,  path    b  grain field

export const map = makeMap((x, y) => {
  if (x < 2 || x > 37 || y < 2 || y > 26) return '#';
  if (x >= 27 && x <= 35 && y >= 16 && y <= 24) return 'b';
  if (y === 13 && x >= 3 && x <= 36) return ',';
  return '.';
});

export const start = [6, 15];
export const door = [3, 17];
export const barriers = [];

// -------------------------------------------------------------------- jobs

// Carrying food to the ark (Genesis 6:21).
const food = g => (g.state.food ||= { carrying: false, loads: 0 });
const take = scene => g => {
  const f = food(g);
  if (g.stepId !== 'food' || f.carrying) return g.note(g.text(f.carrying ? 'hands_full' : 'look_food'));
  f.carrying = true;
  g.hold('bundle');
  g.note(g.text(scene));
};

// The ramp to the ark's door: where food and animals go in.
async function useRamp(g) {
  if (g.stepId === 'food') {
    const f = food(g);
    if (!f.carrying) return g.note(g.text('ramp_empty'));
    f.carrying = false;
    f.loads++;
    g.hold(null);
    g.note(g.text('food_in'));
    if (f.loads >= 3) return g.signal('food');
    return g.goal(`Help gather food and carry it into the ark: ${f.loads} of 3`, 'ramp');
  }
  if (g.stepId === 'animals') {
    const led = g.state.led || [];
    if (!led.length) return g.note(g.text('ramp_animals'));
    for (const id of led) {
      g.trail(id, false);
      g.walk(id, [[18, 9], [18, 8]], 110).then(() => g.hide(id));
    }
    const done = (g.state.boarded ||= []);
    done.push(PAIRS.find(p => p.ids.includes(led[0])).kind);
    g.state.led = [];
    g.note(g.text('pair_in'));
    if (done.length >= PAIRS.length) return g.signal('animals');
    return g.goal(`Lead the animals to the ark, two by two: ${done.length} of 3`, 'ramp');
  }
  return g.note(g.text('look_ramp'));
}

// Each pair follows together: talk to either one.
const PAIRS = [
  { kind: 'lion', ids: ['lion1', 'lion2'], at: [[4, 22], [5, 23]], scale: 1.3 },
  { kind: 'elephant', ids: ['eleph1', 'eleph2'], at: [[24, 24], [26, 24]], scale: 1.8 },
  { kind: 'camel', ids: ['camel1', 'camel2'], at: [[35, 4], [35, 6]], scale: 1.4 },
];
function usePair(g, beast) {
  const pair = PAIRS.find(p => p.ids.includes(beast.id));
  const done = g.state.boarded || [];
  if (g.stepId !== 'animals' || done.includes(pair.kind)) return g.note(g.text(`look_${pair.kind}`));
  if (g.state.led?.length) return g.note(g.text('one_pair'));
  g.trail(pair.ids[0], true);
  g.trail(pair.ids[1], pair.ids[0]);
  g.state.led = [...pair.ids];
  g.note(g.text('pair_follows'));
}

// Side task: Japheth needs pitch for the hull (Genesis 6:14).
const pitch = g => (g.state.pitch ||= 'none');
async function useJapheth(g) {
  if (g.found('pitch') || g.state.pitch === 'done') return g.say('japheth_done');
  if (g.state.pitch === 'carrying') {
    g.state.pitch = 'done';
    g.hold(null);
    g.task(null);
    await g.say('disc_pitch');
    return g.award('pitch');
  }
  if (pitch(g) === 'none') {
    g.state.pitch = 'asked';
    await g.say('japheth_ask');
    return g.task('Bring a jar of pitch from the tar pit to Japheth');
  }
  return g.say('japheth_remind');
}
function useTar(g) {
  if (g.state.pitch !== 'asked') return g.note(g.text('look_tar'));
  if (food(g).carrying) return g.note(g.text('hands_full'));
  g.state.pitch = 'carrying';
  g.hold('jar');
  g.note(g.text('tar_take'));
}

// -------------------------------------------------------------------- people and animals

const FAMILY = ['noah', 'wife', 'shem', 'ham', 'japheth', 'wife1', 'wife2', 'wife3'];
const lady = top => robe({ top, hairStyle: 'long', head: 'cloth', headColor: '#d9c9a3' });
const animal = (id, kind, at, over = {}) => ({ id, name: `a ${kind}`, at, solid: false, look: { kind }, headroom: ANIMAL_HEADROOM, ...over });

export const actors = [
  { id: 'noah', name: 'Noah', at: [16, 10], dir: 'right', chat: 'noah_idle', look: robe({ top: '#7d6a55', hair: '#d8d8d8', beard: '#d8d8d8', item: 'staff' }) },
  { id: 'wife', name: "Noah's wife", at: [21, 11], chat: 'family_idle', look: lady('#8a6f9a') },
  { id: 'shem', name: 'Shem', at: [11, 11], onUse: discover('disc_sons', 'sons'), look: robe({ top: '#a85a4a', beard: true }) },
  { id: 'ham', name: 'Ham', at: [26, 11], dir: 'left', chat: 'family_idle', look: robe({ top: '#6f7f9a', skin: '#a06a42', beard: true }) },
  { id: 'japheth', name: 'Japheth', at: [13, 9], dir: 'right', onUse: useJapheth, look: robe({ top: '#7f8f6a', beard: true, item: 'staff' }) },
  { id: 'wife1', name: "Shem's wife", at: [22, 15], chat: 'family_idle', look: lady('#b08a3a') },
  { id: 'wife2', name: "Ham's wife", at: [26, 15], chat: 'family_idle', look: lady('#9a6a8a') },
  { id: 'wife3', name: "Japheth's wife", at: [21, 17], chat: 'family_idle', look: lady('#7f8f6a') },
  { id: 'neighbor', name: 'a neighbor', at: [5, 11], dir: 'right', onUse: discover('disc_preacher', 'preacher'), look: robe({ top: '#a9845a', beard: true }) },
  ...PAIRS.flatMap(p => p.ids.map((id, i) => animal(id, p.kind, p.at[i], { name: `a ${p.kind}`, label: `lead the ${p.kind}s`, scale: p.scale, hidden: true, onUse: usePair }))),
  ...[[31, 9], [32, 10], [33, 9]].map((at, i) => animal(`sheep${i}`, i === 1 ? 'goat' : 'lamb', at, { onUse: g => g.note(i === 1 ? 'Meh-eh-eh!' : 'Baa!') })),
  ...[[9, 5], [27, 4]].map((at, i) => animal(`dove${i}`, 'dove', at, { name: 'a dove', onUse: g => g.note(g.text('look_dove')) })),
];

// -------------------------------------------------------------------- things

export const objects = [
  { id: 'theark', type: 'ark', x: 14, y: 8, reach: 160, label: 'look at the ark', onUse: discover('disc_size', 'size') },
  { id: 'ramp', type: 'ramp', x: 18, y: 9, reach: 70, label: 'go up to the door', onUse: useRamp },
  { type: 'sheaves', x: 30, y: 19, label: 'gather grain', onUse: take('take_grain') },
  { type: 'sheaves', x: 33, y: 22 },
  { type: 'fruittree', x: 7, y: 20, label: 'pick fruit', onUse: take('take_fruit') },
  { type: 'fruittree', x: 9, y: 23 },
  { type: 'jars', x: 12, y: 18, label: 'take a jar of oil', onUse: take('take_oil') },
  { type: 'tarpit', x: 4, y: 5, reach: 70, label: 'fill a jar with pitch', onUse: useTar },
  { type: 'house', x: 2, y: 9 },
  { type: 'foldwall', x: 30, y: 7 }, { type: 'foldwall', x: 34, y: 7 }, { type: 'foldgate', x: 32, y: 12, label: 'look into the pen', onUse: discover('disc_clean', 'clean') },
  { type: 'woodpile', x: 10, y: 8 }, { type: 'woodpile', x: 25, y: 8 },
  { type: 'tree', x: 36, y: 14 }, { type: 'tree', x: 2, y: 25 }, { type: 'tree', x: 20, y: 22 },
];

// -------------------------------------------------------------------- scenes

const arrivePairs = g => PAIRS.forEach(p => p.ids.forEach(id => g.show(id)));
const boardFamily = g => FAMILY.forEach(id => g.hide(id));

export const steps = [
  {
    id: 'meet',
    goal: 'Talk to Noah, by the ark.', marker: 'noah',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'noah' },
    async run(g) {
      await g.say('noah');
      g.award('walked');
    },
  },
  {
    id: 'food', spawn: [17, 11],
    goal: 'Help gather food and carry it into the ark: 0 of 3', marker: 'ramp',
    async intro(g) { await g.say('food_ask'); },
    trigger: { signal: 'food' },
    async run(g) {
      await g.say('obeyed');
      g.award('obeyed');
    },
  },
  {
    id: 'animals', spawn: [17, 11],
    enter(g) { arrivePairs(g); },
    async intro(g) {
      await g.say('go_in');
      g.award('go');
    },
    goal: 'Lead the animals to the ark, two by two: 0 of 3', marker: 'ramp',
    trigger: { signal: 'animals' },
    async run(g) {
      await g.say('two_by_two');
      g.award('twobytwo');
    },
  },
  {
    id: 'door', spawn: [17, 12],
    enter(g) { PAIRS.forEach(p => p.ids.forEach(id => g.hide(id))); },
    async intro(g) {
      // Noah's family goes in, and the animals in the pen with them.
      for (const id of FAMILY) { g.trail(id, false); g.walk(id, [[18, 10], [18, 9], [18, 8]], 120).then(() => g.hide(id)); await g.wait(250); }
      ['sheep0', 'sheep1', 'sheep2'].forEach(id => g.walk(id, [[31, 13], [19, 10], [18, 8]], 120).then(() => g.hide(id)));
      await g.say('enter');
    },
    goal: 'Stand back from the ark and watch.',
    trigger: { zone: [12, 14, 26, 26] },
    async run(g) {
      g.face('player', 'up');
      boardFamily(g);
      g.flash(400);
      g.shake(500, 0.006);
      g.removeProp('ramp');
      await g.say('shut');
      g.award('shut');
      g.sky({ rain: true, night: true });
      await g.say('rain');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
