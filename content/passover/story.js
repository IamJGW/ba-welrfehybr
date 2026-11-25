// The Passover (Exodus 12): a Hebrew family chooses the lamb, makes the meal,
// marks the doorframe, and waits through the night the LORD passes over Egypt.
// There is a note for parents before this story. The words are in dialogue.csv.

import { robe, lady, discover, makeMap, animal, job, trips, taps } from '../../src/storykit.js';

export const id = 'passover';
export const title = 'The Passover';
export const where = 'A Hebrew house in Goshen';
export const ref = 'Exodus 12';
export const place = [31.9, 30.7];   // near Rameses
export const after = 'plagues';

// ----------------------------------------------------------------------- map
//   .  grass    ,  path    k  brick ground    n  black soil

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 25;
export const map = makeMap((x, y) => {
  if (edge(x, y)) return 's';
  if (y === 17 || x === 20 && y >= 8 && y <= 17) return ',';
  if (x >= 4 && x <= 14 && y >= 18 && y <= 23) return 'k';
  return '.';
});

export const start = [5, 21];
export const door = [3, 22];
export const barriers = [];

// -------------------------------------------------------------------- the lamb

function pickLamb(g, thing) {
  if (g.stepId !== 'lamb') return g.note(g.text('lamb_idle'));
  if (thing.id !== 'lamb2') return g.note(g.text(`lamb_${thing.id}`));
  g.signal('lamb');
}

// -------------------------------------------------------------------- the meal and the doorframe

const meal = job('meal', { step: 'meal', total: 3, goal: 'Bring the Passover meal to the table', target: 'table', hold: 'bundle' });
const brush = taps('blood', { step: 'doorway', total: 3, goal: 'Mark the doorframe with the blood', keep: true });
const mark = (g, thing) => { if (g.stepId === 'doorway' && !g.state.blood?.ids.includes(thing.id)) g.addProp({ id: `${thing.id}_mark`, type: 'bloodmark', x: thing.x, y: thing.y }); return brush(g, thing); };

// -------------------------------------------------------------------- people

const hebrew = (over = {}) => robe({ top: '#a9845a', ...over });

export const actors = [
  { id: 'father', name: 'the father', at: [24, 12], dir: 'down', chat: 'father_idle', look: hebrew({ top: '#7a5a3a', beard: true, head: 'cloth', headColor: '#e8e0cc' }) },
  { id: 'mother', name: 'the mother', at: [27, 13], dir: 'left', onUse: discover('disc_mother', 'bread'), look: lady('#6b8a4f', { hair: '#2a211c' }) },
  { id: 'son', name: 'the oldest son', at: [25, 14], dir: 'down', scale: 0.9, onUse: discover('disc_son', 'firstborn'), look: hebrew({ top: '#d9b45a' }) },
  { id: 'daughter', name: 'the little girl', at: [28, 15], dir: 'left', scale: 0.7, onUse: discover('disc_girl', 'children'), look: robe({ top: '#c9893f', hairStyle: 'braids', hair: '#2a211c' }) },
  { id: 'neighbor', name: 'the neighbor', at: [12, 15], dir: 'right', onUse: discover('disc_neighbor', 'share'), look: hebrew({ top: '#8a3a3a', beard: true }) },
  { id: 'elder', name: 'an elder', at: [16, 18], dir: 'left', onUse: discover('disc_elder', 'month'), look: hebrew({ top: '#7d5a8a', hair: '#e8e8e8', beard: '#e8e8e8' }) },
  { id: 'moses', name: 'Moses', at: [15, 12], dir: 'right', hidden: true, chat: 'moses_idle', look: robe({ top: '#a9845a', sash: '#5d4526', hair: '#d8d8d8', beard: '#d8d8d8', head: 'cloth', headColor: '#e8e0cc', item: 'staff' }) },
  animal('lamb1', 'lamb', [8, 20], { name: 'a lamb', label: 'look at the lamb', onUse: pickLamb }),
  animal('lamb2', 'lamb', [10, 21], { name: 'a lamb', label: 'look at the lamb', onUse: pickLamb }),
  animal('lamb3', 'lamb', [12, 22], { name: 'a lamb', label: 'look at the lamb', onUse: pickLamb }),
];

// -------------------------------------------------------------------- things

export const objects = [
  { type: 'egyptHouse', x: 22, y: 5 }, { type: 'egyptHouse', x: 29, y: 5 }, { type: 'egyptHouse', x: 6, y: 8 }, { type: 'egyptHouse', x: 12, y: 5 },
  { id: 'house', type: 'house', x: 24, y: 8 },
  { id: 'table', type: 'table', x: 26, y: 15, label: 'put it on the table', onUse: meal.give },
  { id: 'herbs', type: 'pot', x: 30, y: 19, item: 'bitter herbs', label: 'pick up the bitter herbs', onUse: meal.take },
  { id: 'bread', type: 'oven', x: 34, y: 18, item: 'unleavened bread', label: 'pick up the bread', onUse: meal.take },
  { id: 'roast', type: 'fire', x: 33, y: 22, item: 'the roasted lamb', label: 'take the roast lamb', onUse: meal.take },
  { id: 'doorway', type: 'doorpost', x: 24, y: 11 },
  { type: 'palm', x: 33, y: 10 }, { type: 'palm', x: 4, y: 13 },
];

// The family stands well back from the doorway while it is marked.
const clear = g => { for (const [id, x, y] of [['father', 31, 13], ['mother', 33, 14], ['son', 31, 16], ['daughter', 34, 16]]) g.place(id, x, y, 'left'); };
const HYSSOP = [
  { id: 'hyssop1', type: 'hyssop', x: 22, y: 12, label: 'brush the blood on the left post', onUse: mark },
  { id: 'hyssop2', type: 'hyssop', x: 27, y: 12, label: 'brush the blood on the right post', onUse: mark },
  { id: 'hyssop3', type: 'hyssop', x: 24, y: 13, label: 'brush the blood above the door', onUse: mark },
];

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'family',
    goal: 'Talk to the father, by the lambs.', marker: 'father',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'father' },
    async run(g) {
      g.show('moses');
      await g.say('instructions');
      g.award('beginning');
      await g.say('lamb_rules');
      g.award('lamb');
      await g.say('lamb_ask');
    },
  },
  {
    id: 'lamb', spawn: [14, 18],
    goal: 'Look at each of the three lambs and choose one without a blemish.', marker: null,
    solve: ['lamb1', 'lamb3', 'lamb2'],
    trigger: { signal: 'lamb' },
    async run(g) {
      await g.say('lamb_chosen');
      g.award('unblemished');
    },
  },
  {
    id: 'meal', spawn: [20, 17],
    goal: 'Bring the Passover meal to the table: 0 of 3', marker: 'roast',
    solve: trips(['roast', 'bread', 'herbs'], 'table'),
    trigger: { signal: 'meal' },
    async run(g) {
      await g.say('meal_rules');
      g.award('roasted');
      g.award('bitter');
      await g.say('dressed');
      g.award('haste');
    },
  },
  {
    id: 'doorway', spawn: [22, 14],
    goal: 'Mark the doorframe with the blood: 0 of 3', marker: null,
    solve: ['hyssop1', 'hyssop2', 'hyssop3'],
    trigger: { signal: 'doorway' },
    enter(g) { clear(g); },
    begin(g) { clear(g); HYSSOP.forEach(h => g.addProp(h)); },
    async intro(g) { await g.say('doorway'); g.award('blood_sign'); },
    async run(g) {
      await g.say('hyssop');
      g.award('pass_over');
    },
  },
  {
    id: 'night', spawn: [24, 14],
    goal: 'Go inside with the family.', marker: null,
    trigger: { zone: [23, 10, 25, 10] },
    async run(g) {
      await g.fadeOut(900);
      g.sky({ night: true });
      for (const [id, x, y] of [['father', 13, 19], ['mother', 17, 20], ['son', 20, 19], ['daughter', 16, 23], ['moses', 11, 22]]) g.place(id, x, y, 'down');
      g.place('player', 20, 22, 'left');
      await g.fadeIn(900);
      await g.say('inside');
      g.award('inside');
      await g.say('midnight');
      g.award('midnight');
      await g.say('wailing');
      g.award('wailing');
      await g.say('summoned');
      g.award('go');
      await g.say('memorial');
      g.award('memorial');
    },
  },
  {
    id: 'leave', spawn: [17, 22],
    enter(g) { g.sky({ night: true }); for (const [id, x, y] of [['father', 13, 19], ['mother', 17, 20], ['son', 20, 19], ['daughter', 16, 23], ['moses', 11, 22]]) g.place(id, x, y, 'down'); },
    goal: 'Talk to the father, when you are ready.', marker: 'father',
    trigger: { talk: 'father' },
    async run(g) {
      await g.say('departure');
      g.award('plunder');
      await g.say('exodus');
      g.award('six_hundred');
      await g.say('why');
      g.award('what_mean');
      await g.say('lamb_of_god');
      g.award('christ');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
