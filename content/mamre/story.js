// Visitors at Mamre (Genesis 18:1-16, and 21:1-7): three visitors in the heat
// of the day, the meal Abraham hurries to serve, the promise of a son, Sarah's
// laugh, and a year later, baby Isaac. The words are in dialogue.csv.

import { ANIMAL_HEADROOM } from '../../src/art.js';
import { robe, discover, makeMap } from '../../src/storykit.js';

export const id = 'mamre';
export const title = 'Visitors at Mamre';
export const where = 'The Oaks of Mamre, near Hebron';
export const ref = 'Genesis 18:1-15; 21:1-7';
export const after = 'stars';
export const place = [34.98, 31.52];   // Mamre, by Hebron

// ----------------------------------------------------------------------- map
//   #  cliff    .  grass    ,  path

export const map = makeMap((x, y) => {
  if (x < 2 || x > 37 || y < 2 || y > 26) return '#';
  if (y === 20 || x === 12 && y >= 11 && y <= 20) return ',';
  return '.';
});

export const start = [5, 22];
export const door = [3, 23];
export const barriers = [];

// -------------------------------------------------------------------- serving

// Water for the guests' feet, flour for Sarah's bread, and curds and milk
// (Genesis 18:4-8). Only one thing can be carried at a time.
const serve = g => (g.state.serve ||= { holding: null, done: [] });
const pick = (what, item) => g => {
  const s = serve(g);
  if (g.stepId !== 'serve') return g.note(g.text(`look_${what}`));
  if (s.done.includes(what)) return g.note(g.text('done_already'));
  if (s.holding) return g.note(g.text('hands_full'));
  s.holding = what;
  g.hold(item);
  g.note(g.text(`take_${what}`));
};
function served(g, what) {
  const s = serve(g);
  s.holding = null;
  s.done.push(what);
  g.hold(null);
  if (s.done.length >= 3) return g.signal('serve');
  g.goal(`Help Abraham serve his guests: ${s.done.length} of 3`);
}
const useVisitor = n => async g => {
  const s = serve(g);
  if (g.stepId !== 'serve') return g.say('visitor_idle');
  if (s.holding === 'water' || s.holding === 'milk') {
    g.note(g.text(`give_${s.holding}`), 2600);
    return served(g, s.holding);
  }
  if (s.holding === 'flour') return g.note(g.text('flour_to_sarah'));
  return g.say(`visitor_${n}`);
};
async function useSarah(g) {
  const s = serve(g);
  if (g.stepId === 'year') return;   // the step's own trigger: talk to Sarah
  if (g.stepId !== 'serve') return g.say(g.state.laughed ? 'sarah_after' : 'sarah_idle');
  if (s.holding !== 'flour') return g.say('sarah_wait');
  g.note(g.text('give_flour'), 2600);
  served(g, 'flour');
}

// -------------------------------------------------------------------- people

const lady = (top, over = {}) => robe({ top, hairStyle: 'long', head: 'cloth', headColor: '#d9c9a3', ...over });
const visitor = (top, at) => robe({ top, sash: '#d9c9a3', beard: true, head: 'cloth', headColor: '#f1ede0', item: 'staff' });
const animal = (id, kind, at, over = {}) => ({ id, name: `a ${kind}`, at, solid: false, look: { kind }, headroom: ANIMAL_HEADROOM, ...over });
const girl = g => (g.stepId === 'year' || g.stepId === 'farewell' ? discover('disc_sarahfaith', 'sarahfaith')(g) : g.say('girl_idle'));

export const actors = [
  { id: 'abraham', name: 'Abraham', at: [15, 10], chat: 'abraham_idle', look: robe({ top: '#7d5a8a', sash: '#e3b93a', hair: '#d8d8d8', beard: '#d8d8d8', head: 'cloth', headColor: '#e8e0cc', item: 'staff' }) },
  { id: 'sarah', name: 'Sarah', at: [11, 12], dir: 'right', onUse: useSarah, look: lady('#3d6fb5', { hair: '#b9b9b9' }) },
  { id: 'v1', name: 'a visitor', at: [2, 20], hidden: true, dir: 'right', onUse: useVisitor(1), look: visitor('#e8e2d0') },
  { id: 'v2', name: 'a visitor', at: [2, 20], hidden: true, dir: 'right', onUse: useVisitor(2), look: visitor('#d8d2c0') },
  { id: 'v3', name: 'a visitor', at: [2, 20], hidden: true, dir: 'right', onUse: useVisitor(3), look: visitor('#f1ede0') },
  { id: 'eliezer', name: 'Eliezer', at: [19, 10], dir: 'left', onUse: discover('disc_laughed', 'abrahamlaughed'), look: robe({ top: '#3d6f6a', sash: '#e3b93a', beard: '#9a9a9a', head: 'band', headColor: '#e3b93a' }) },
  { id: 'herdsman', name: 'a herdsman', at: [8, 17], dir: 'right', onUse: discover('disc_newname', 'newname'), look: robe({ top: '#9a7a5a', item: 'staff' }) },
  { id: 'cook', name: 'a servant', at: [31, 18], dir: 'left', onUse: discover('disc_angels', 'angels'), look: robe({ top: '#a9845a', sash: '#8a3a3a' }) },
  { id: 'girl', name: 'a servant girl', at: [8, 11], dir: 'right', onUse: girl, look: lady('#a85a4a') },
  animal('goat1', 'goat', [34, 12]), animal('goat2', 'goat', [35, 14]),
  animal('calf1', 'calf', [34, 19]), animal('calf2', 'calf', [36, 17]),
];

// -------------------------------------------------------------------- things

export const objects = [
  { id: 'tent', type: 'bigtent', x: 14, y: 8 }, { id: 'tent2', type: 'tent', x: 5, y: 8 },
  { id: 'oven', type: 'oven', x: 10, y: 10 },
  { id: 'tree', type: 'oak', x: 24, y: 14, label: 'rest in the shade', onUse: g => g.note(g.text('look_tree')) },
  { type: 'oak', x: 4, y: 3 }, { type: 'oak', x: 30, y: 6 }, { type: 'oak', x: 19, y: 23 },
  { id: 'well', type: 'well', x: 21, y: 6, label: 'fill a jar with water', onUse: pick('water', 'jar') },
  { id: 'flour', type: 'sacks', x: 7, y: 14, label: 'scoop up fine flour', onUse: pick('flour', 'bundle') },
  { id: 'milk', type: 'jars', x: 33, y: 13, label: 'take the curds and milk', onUse: pick('milk', 'jar') },
  { id: 'pot', type: 'pot', x: 30, y: 17 },
  { id: 'altar', type: 'altar', x: 4, y: 15 },
];

// -------------------------------------------------------------------- scenes

const SEATS = { v1: [22, 15], v2: [26, 15], v3: [24, 17] };
const seated = g => {
  if (g.state.seated) return;
  g.state.seated = true;
  for (const [id, [x, y]] of Object.entries(SEATS)) { g.show(id); g.place(id, x, y, id === 'v3' ? 'up' : id === 'v1' ? 'right' : 'left'); }
  g.place('abraham', 24, 13, 'down');
};
const meal = g => {
  if (g.state.meal) return;
  g.state.meal = true;
  seated(g);
  g.addProp({ id: 'table', type: 'table', x: 23, y: 16 });
};
const aYearLater = g => {
  if (g.state.year) return;
  g.state.year = true;
  meal(g);
  g.removeProp('table');
  for (const id of ['v1', 'v2', 'v3']) g.hide(id);
  g.place('abraham', 15, 10, 'down');
  g.place('sarah', 13, 12, 'down');
  g.setLook('sarah', { item: 'baby' });
  g.place('player', 13, 16, 'up');
  g.setChat('abraham', 'abraham_year');
};

export const steps = [
  {
    id: 'heat',
    goal: 'Talk to Abraham, resting in the doorway of his tent.', marker: 'abraham',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'abraham' },
    async run(g) {
      await g.say('heat');
      g.award('oaks');
      // Three men on the road.
      for (const id of ['v1', 'v2', 'v3']) { g.show(id); g.place(id, 2, 20, 'right'); }
      await g.pan(10, 18, 800);
      g.walk('v1', [[10, 20], [10, 17]], 90);
      g.walk('v2', [[9, 20], [9, 18]], 90);
      await g.walk('v3', [[11, 20], [11, 18]], 90);
      await g.say('three_men');
      await g.walk('abraham', [[12, 13], [12, 16], [11, 16]], 230);
      g.face('abraham', 'left');
      await g.say('ran');
      g.award('ran');
      // To the shade of the tree.
      g.walk('abraham', [[12, 16], [24, 16], [24, 13]], 130);
      g.walk('v1', [[10, 16], [22, 16], [22, 15]], 110);
      g.walk('v2', [[9, 16], [26, 16], [26, 15]], 110);
      await g.walk('v3', [[11, 17], [24, 17]], 110);
      seated(g);
      await g.follow(600);
      await g.say('serve_ask');
    },
  },
  {
    id: 'serve', spawn: [20, 14],
    enter(g) { seated(g); },
    goal: 'Help Abraham serve his guests: 0 of 3',
    trigger: { signal: 'serve' },
    async run(g) {
      await g.say('hurried');
      await g.fadeOut(500);
      meal(g);
      g.place('player', 21, 13, 'right');
      await g.fadeIn(500);
      await g.say('ate');
      g.award('feast');
      await g.say('where_sarah');
      g.award('son');
      // Sarah, listening at the tent.
      g.place('sarah', 13, 10, 'right');
      await g.pan(14, 11, 700);
      await g.say('laughed');
      g.state.laughed = true;
      await g.follow(600);
      await g.say('too_difficult');
      g.award('difficult');
    },
  },
  {
    id: 'seeoff', spawn: [21, 13],
    enter(g) { meal(g); },
    begin(g) {
      g.walk('abraham', [[24, 13], [28, 13], [28, 20], [31, 20]], 90);
      g.walk('v1', [[22, 18], [30, 18], [32, 20]], 90);
      g.walk('v2', [[27, 15], [27, 19], [33, 19]], 90);
      g.walk('v3', [[24, 18], [32, 21]], 90);
    },
    goal: 'Walk with Abraham to see the visitors on their way.', marker: 'abraham',
    trigger: { zone: [27, 18, 34, 22] },
    async run(g) {
      await g.say('see_off');
      for (const id of ['v1', 'v2', 'v3']) g.walk(id, [[37, 20]], 110).then(() => g.hide(id));
      await g.wait(1800);
      await g.say('a_year');
      await g.fadeOut(900);
      aYearLater(g);
      await g.fadeIn(900);
    },
  },
  {
    id: 'year', spawn: [13, 16],
    enter(g) { aYearLater(g); },
    async intro(g) { await g.say('year_later'); },
    goal: 'A year later. Go and see Sarah.', marker: 'sarah',
    trigger: { talk: 'sarah' },
    async run(g) {
      await g.say('isaac');
      g.award('laughter');
    },
  },
  {
    id: 'farewell', spawn: [13, 16],
    enter(g) { aYearLater(g); },
    goal: 'Talk to Abraham when you are ready to go.', marker: 'abraham',
    trigger: { talk: 'abraham' },
    async run(g) {
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
