// The Burning Bush (Exodus 3-4): Moses, now an old shepherd in Midian, sees a
// bush that burns without burning up, and God sends him back to Egypt. The words
// are in dialogue.csv.

import { robe, lady, discover, makeMap, animal, taps } from '../../src/storykit.js';

export const id = 'bush';
export const title = 'The Burning Bush';
export const where = 'The wilderness of Midian, at Horeb';
export const ref = 'Exodus 3-4';
export const place = [35.7, 28.9];   // Midian
export const after = 'basket';

// ----------------------------------------------------------------------- map
//   #  cliff    s  desert rock    x  desert brush    h  hillside    .  grass    ,  path

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
export const map = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (y <= 5) return 'h';
  if (y === 20 && x < 20 || x === 20 && y >= 11 && y <= 20 || y === 11 && x >= 20 && x <= 28) return ',';
  if (x >= 3 && x <= 14 && y >= 14 && y <= 24 && (x + y) % 7) return '.';
  return 's';
});

export const start = [5, 22];
export const door = [3, 23];
export const barriers = [];

// -------------------------------------------------------------------- the strays

const guide = taps('strays', { step: 'strays', total: 3, goal: 'Bring the strays back to the flock' });
const stray = (id, x, y) => ({ id, type: null, x, y });
const lamb = (id, at, over = {}) => animal(id, 'lamb', at, { name: 'a sheep', ...over });

// -------------------------------------------------------------------- people

export const actors = [
  { id: 'moses', name: 'Moses', at: [8, 20], dir: 'right', chat: 'moses_idle', look: robe({ top: '#a9845a', sash: '#5d4526', hair: '#d8d8d8', beard: '#d8d8d8', head: 'cloth', headColor: '#e8e0cc', item: 'staff' }) },
  { id: 'zipporah', name: 'Zipporah', at: [5, 16], dir: 'right', onUse: discover('disc_zipporah', 'zipporah'), look: lady('#8a3a3a', { skin: '#c98f62', hair: '#2a211c' }) },
  { id: 'aaron', name: 'Aaron', at: [38, 12], dir: 'left', hidden: true, chat: 'aaron_idle', look: robe({ top: '#f1ede0', sash: '#3d6fb5', hair: '#cfcfcf', beard: '#cfcfcf', head: 'cloth', headColor: '#e8e0cc' }) },
  { id: 'elder1', name: 'an elder of Israel', at: [29, 14], dir: 'left', hidden: true, onUse: discover('disc_elders', 'bowed'), look: robe({ top: '#7d5a8a', hair: '#e8e8e8', beard: '#e8e8e8' }) },
  { id: 'serpent', name: 'a snake', at: [22, 12], hidden: true, solid: false, look: { kind: 'serpent' } },
  lamb('lamb1', [10, 16]), lamb('lamb2', [6, 19]), lamb('lamb3', [11, 22]), lamb('lamb4', [9, 23]),
  lamb('stray1', [27, 21], { label: 'guide the sheep back', onUse: guide }),
  lamb('stray2', [31, 16], { label: 'guide the sheep back', onUse: guide }),
  lamb('stray3', [17, 8], { label: 'guide the sheep back', onUse: guide }),
];

// -------------------------------------------------------------------- things

export const objects = [
  { id: 'peak', type: 'peak', x: 14, y: 5 },
  { id: 'bush', type: 'bush', x: 29, y: 9 },
  { type: 'rock', x: 25, y: 14 }, { type: 'bigrock', x: 33, y: 8 }, { type: 'rock', x: 12, y: 13 }, { type: 'bigrock', x: 34, y: 20 },
  { type: 'rock', x: 20, y: 23 }, { type: 'tree', x: 4, y: 12 }, { type: 'tree', x: 24, y: 22 }, { type: 'thicket', x: 16, y: 17 }, { type: 'thicket', x: 31, y: 12 },
  { type: 'tent', x: 5, y: 12 },
];
const FIRE = { id: 'fire', type: 'burningbush', x: 29, y: 9 };

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'flock',
    goal: 'Talk to Moses, the shepherd.', marker: 'moses',
    async intro(g) {
      g.patrol('lamb1', [[10, 16], [12, 17]], 35, 2); g.patrol('lamb2', [[6, 19], [8, 21]], 35, 2.5);
      await g.wait(700); await g.say('arrive');
    },
    trigger: { talk: 'moses' },
    async run(g) {
      await g.say('shepherd');
      g.award('shepherding');
      await g.say('strays');
    },
  },
  {
    id: 'strays', spawn: [10, 20],
    goal: 'Bring the strays back to the flock: 0 of 3', marker: null,
    solve: ['stray1', 'stray2', 'stray3'],
    trigger: { signal: 'strays' },
    async run(g) {
      g.hide('stray1'); g.hide('stray2'); g.hide('stray3');
      await g.say('strays_done');
      g.award('horeb');
    },
  },
  {
    id: 'bush', spawn: [14, 18],
    enter(g) { g.hide('stray1'); g.hide('stray2'); g.hide('stray3'); },
    goal: 'Follow Moses toward the mountain.', marker: null,
    trigger: { zone: [26, 11, 28, 13] },
    async run(g) {
      g.place('moses', 25, 12, 'right');
      g.place('player', 24, 14, 'up');
      g.face('moses', 'right');
      await g.pan(29, 9, 800);
      g.removeProp('bush');
      g.addProp(FIRE);
      g.flash(250);
      await g.say('blaze');
      g.award('blaze');
      await g.say('marvelous');
      g.award('marvelous');
      await g.say('called');
      g.award('here_i_am');
      await g.say('sandals');
      g.award('holy');
      await g.say('fathers');
      g.award('fathers');
      await g.say('seen');
      g.award('seen');
      await g.say('rescue');
      g.award('rescue');
      await g.say('sending');
      g.award('sent');
    },
  },
  {
    id: 'name', spawn: [24, 13],
    enter(g) { g.hide('stray1'); g.hide('stray2'); g.hide('stray3'); g.place('moses', 25, 12, 'right'); g.removeProp('bush'); g.addProp(FIRE); },
    goal: 'Talk to Moses, near the burning bush.', marker: 'moses',
    trigger: { talk: 'moses' },
    async run(g) {
      await g.say('who_am_i');
      g.award('who_am_i');
      await g.say('with_you');
      g.award('with_you');
      await g.say('the_name');
      g.award('i_am');
      await g.say('the_name2');
      g.award('forever');
      await g.say('staff');
      g.award('staff');
      g.show('serpent');
      g.place('serpent', 24, 13, 'right');
      await g.say('snake');
      g.hide('serpent');
      await g.say('slow');
      g.award('slow_of_speech');
      await g.say('mouth');
      g.award('mouth');
      await g.say('aaron_promise');
      g.award('spokesman');
      await g.tween({ targets: g.fx('glow', 29 * g.T, 8 * g.T).setScale(3), alpha: 0, duration: 1200 });
      g.removeProp('fire');
      g.addProp({ id: 'bush', type: 'bush', x: 29, y: 9 });
      await g.follow(700);
    },
  },
  {
    id: 'aaron', spawn: [24, 13],
    enter(g) { g.hide('stray1'); g.hide('stray2'); g.hide('stray3'); g.place('moses', 25, 12, 'right'); },
    begin(g) { g.show('aaron'); g.place('aaron', 34, 12, 'left'); },
    goal: 'Meet Aaron, on the road.', marker: 'aaron',
    trigger: { talk: 'aaron' },
    async run(g) {
      g.walk('aaron', [[28, 12]], 100);
      await g.say('aaron_meets');
      g.award('kissed');
      g.show('elder1'); g.place('elder1', 30, 13, 'left');
      await g.say('elders');
      g.award('believed');
    },
  },
  {
    id: 'farewell', spawn: [24, 13],
    enter(g) { g.hide('stray1'); g.hide('stray2'); g.hide('stray3'); g.place('moses', 25, 12, 'right'); g.show('aaron'); g.place('aaron', 28, 12, 'left'); g.show('elder1'); g.place('elder1', 30, 13, 'left'); },
    goal: 'Talk to Moses when you are ready to go.', marker: 'moses',
    trigger: { talk: 'moses' },
    async run(g) {
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
