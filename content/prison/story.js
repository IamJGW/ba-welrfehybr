// Faithful in Prison (Genesis 39-40): Joseph runs Potiphar's household, is
// accused of something he did not do, and ends up in prison, where he serves the
// king's cupbearer and baker. The words are in dialogue.csv.

import { robe, lady, discover, makeMap, job, trips, taps } from '../../src/storykit.js';

export const id = 'prison';
export const title = 'Faithful in Prison';
export const where = "Potiphar's house and the king's prison, in Egypt";
export const ref = 'Genesis 39-40';
export const place = [31.25, 29.85];   // Memphis, the capital
export const after = 'sold';

// ----------------------------------------------------------------------- map
// Potiphar's courtyard first; the prison replaces it after Joseph is accused.
//   #  cliff    .  grass    p  paving    s  desert    W  wall    d  prison floor

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 25;
export const map = makeMap((x, y) => {
  if (edge(x, y)) return 's';
  if (x >= 7 && x <= 29 && y >= 9 && y <= 21) return 'p';
  return '.';
});
const PRISON = makeMap((x, y) => {
  if (x < 2 || x > 37 || y < 2 || y > 25) return 'W';
  if (y === 10 && x > 2 && x < 37 && ![7, 15, 23, 31].includes(x)) return 'W';
  if (y < 10 && (x === 12 || x === 20 || x === 28)) return 'W';
  return 'd';
});

export const start = [5, 23];
export const door = [4, 23];
export const barriers = [];

// -------------------------------------------------------------------- the carrying

const SKIN = '#b07848';
const egyptian = (over = {}) => robe({ skin: SKIN, top: '#f2efe6', sash: '#4a7ab0', hair: '#1f1a17', hairStyle: 'bob', ...over });
const serve = job('serve', { step: 'carry', total: 3, goal: "Carry food to Potiphar's table", target: 'table' });
const water = taps('water', { step: 'rounds', total: 3, goal: 'Take water to the prisoners', keep: true });

// -------------------------------------------------------------------- people

export const actors = [
  { id: 'joseph', name: 'Joseph', at: [12, 14], dir: 'down', chat: 'joseph_idle', look: robe({ skin: '#c98f62', top: '#f2efe6', sash: '#5d4526' }) },
  { id: 'potiphar', name: 'Potiphar', at: [19, 11], dir: 'down', chat: 'potiphar_idle', look: egyptian({ head: 'band', headColor: '#e3b93a' }) },
  { id: 'mistress', name: "Potiphar's wife", at: [22, 8], dir: 'down', hidden: true, look: lady('#4a7ab0', { skin: SKIN, hair: '#1f1a17', head: 'band', headColor: '#e3b93a' }) },
  { id: 'steward', name: 'a household servant', at: [9, 18], dir: 'right', onUse: discover('disc_house', 'prosper'), look: egyptian({ top: '#d9c9a3' }) },
  { id: 'cook', name: 'the cook', at: [25, 18], dir: 'left', onUse: discover('disc_cook', 'attendant'), look: lady('#a85a4a', { skin: SKIN, hair: '#1f1a17', head: 'band', headColor: '#d9c9a3' }) },
  { id: 'warden', name: 'the warden', at: [30, 15], dir: 'left', hidden: true, look: egyptian({ top: '#6a6a72', beard: false, item: 'spear' }) },
  { id: 'prisoner1', name: 'a prisoner', at: [7, 7], dir: 'down', hidden: true, onUse: discover('disc_prisoner', 'irons'), look: robe({ top: '#8a8a82', skin: '#a06a42' }) },
  { id: 'prisoner2', name: 'a prisoner', at: [15, 7], dir: 'down', hidden: true, chat: 'prisoner_idle', look: robe({ top: '#8a8a82', skin: '#c98f62', beard: true }) },
  { id: 'prisoner3', name: 'a prisoner', at: [23, 7], dir: 'down', hidden: true, chat: 'prisoner_idle', look: robe({ top: '#8a8a82', skin: '#6e4428' }) },
  { id: 'cupbearer', name: 'the cupbearer', at: [34, 22], dir: 'left', hidden: true, look: egyptian({ top: '#c9a24a', sash: '#8a3a3a' }) },
  { id: 'baker', name: 'the baker', at: [34, 23], dir: 'left', hidden: true, look: egyptian({ top: '#e8dcc0', sash: '#a9845a' }) },
];

// -------------------------------------------------------------------- things

const HOUSE = [
  { id: 'villa', type: 'egyptHouse', x: 17, y: 5 }, { id: 'villa2', type: 'egyptHouse', x: 24, y: 5 }, { id: 'villa3', type: 'egyptHouse', x: 10, y: 5 },
  { id: 'palm1', type: 'palm', x: 5, y: 8 }, { id: 'palm2', type: 'palm', x: 32, y: 8 }, { id: 'palm3', type: 'palm', x: 5, y: 20 }, { id: 'palm4', type: 'palm', x: 33, y: 19 },
  { id: 'granary', type: 'granary', x: 30, y: 11 },
  { id: 'table', type: 'table', x: 18, y: 10, label: "put it on Potiphar's table", onUse: serve.give },
  { id: 'grain', type: 'sacks', x: 8, y: 14, item: 'a sack of grain', label: 'pick up the grain', onUse: serve.take },
  { id: 'oil', type: 'jars', x: 14, y: 19, item: 'a jar of oil', carry: 'jar', label: 'pick up the oil jar', onUse: serve.take },
  { id: 'bread', type: 'oven', x: 26, y: 20, item: 'a basket of bread', carry: 'basket', label: 'pick up the bread', onUse: serve.take },
];
export const objects = HOUSE;

const CELLS = [
  { id: 'cell1', type: 'cellgate', x: 7, y: 10, label: 'give water to the prisoner', onUse: water },
  { id: 'cell2', type: 'cellgate', x: 15, y: 10, label: 'give water to the prisoner', onUse: water },
  { id: 'cell3', type: 'cellgate', x: 23, y: 10, label: 'give water to the prisoner', onUse: water },
  { id: 'cell4', type: 'cellgate', x: 31, y: 10 },
  { id: 'jar1', type: 'jars', x: 8, y: 13 },
  { id: 'bench', type: 'rack', x: 28, y: 19 },
];

const toPrison = g => {
  if (g.state.prison) return;
  g.state.prison = true;
  HOUSE.forEach(o => g.removeProp(o.id));
  g.ground(PRISON, 0);
  CELLS.forEach(o => g.addProp(o));
  for (const id of ['potiphar', 'mistress', 'steward', 'cook']) g.hide(id);
  for (const id of ['warden', 'prisoner1', 'prisoner2', 'prisoner3']) g.show(id);
  g.place('warden', 30, 14, 'left');
  g.show('joseph');
  g.place('joseph', 12, 14, 'down');
  g.setLook('joseph', { skin: '#c98f62', top: '#a9845a', sash: '#5d4526' });
};

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'house',
    goal: "Talk to Joseph, in Potiphar's courtyard.", marker: 'joseph',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'joseph' },
    async run(g) {
      await g.say('house');
      g.award('with');
      await g.say('house_ask');
    },
  },
  {
    id: 'carry', spawn: [12, 15],
    goal: "Carry food to Potiphar's table: 0 of 3", marker: 'grain',
    solve: trips(['grain', 'oil', 'bread'], 'table'),
    trigger: { signal: 'carry' },
    async run(g) {
      await g.say('potiphar');
      g.award('charge');
      g.setChat('potiphar', 'potiphar_after');
      await g.say('potiphar_after');
      g.award('blessing');
      // Some time later.
      await g.fadeOut(700);
      g.show('mistress');
      g.place('potiphar', 28, 17, 'left');
      g.place('mistress', 15, 11, 'down');
      g.place('joseph', 14, 13, 'up');
      g.place('player', 10, 18, 'up');
      await g.fadeIn(700);
      await g.say('refuse');
      g.award('evil');
      await g.walk('joseph', [[10, 14], [4, 14]], 150);
      g.hide('joseph');
      await g.say('cloak');
      g.award('cloak');
      await g.say('lie');
      g.award('burned');
      await g.fadeOut(900);
      toPrison(g);
      g.place('player', 6, 23, 'up');
      await g.fadeIn(900);
      await g.say('thrown');
      g.award('thrown');
    },
  },
  {
    id: 'warden', spawn: [6, 23],
    enter(g) { toPrison(g); },
    goal: 'Talk to Joseph, in the prison.', marker: 'joseph',
    trigger: { talk: 'joseph' },
    async run(g) {
      await g.say('warden');
      g.award('favor');
      await g.say('warden_after');
    },
  },
  {
    id: 'rounds', spawn: [12, 15],
    enter(g) { toPrison(g); },
    goal: 'Take water to the prisoners: 0 of 3', marker: 'cell1',
    solve: ['cell1', 'cell2', 'cell3'],
    trigger: { signal: 'rounds' },
    async run(g) {
      await g.say('rounds_done');
      g.award('all');
      // Two new prisoners come in.
      g.show('cupbearer'); g.show('baker');
      g.walk('cupbearer', [[30, 18], [25, 13]], 80);
      await g.walk('baker', [[30, 19], [27, 14]], 80);
      await g.say('officers');
      g.award('officers');
    },
  },
  {
    id: 'dreams', spawn: [20, 16],
    enter(g) { toPrison(g); g.show('cupbearer'); g.show('baker'); g.place('cupbearer', 25, 13, 'left'); g.place('baker', 27, 14, 'left'); },
    goal: 'Talk to the cupbearer. He looks upset.', marker: 'cupbearer',
    trigger: { talk: 'cupbearer' },
    async run(g) {
      g.place('joseph', 23, 13, 'right');
      await g.say('morning');
      g.award('downcast');
      await g.say('cup_dream');
      g.award('vine');
      await g.say('cup_meaning');
      g.award('interpret');
      await g.say('baker_dream');
      await g.say('baker_meaning');
      await g.fadeOut(900);
      g.hide('baker');
      g.place('cupbearer', 33, 22, 'left');
      await g.fadeIn(900);
      await g.say('feast');
      g.award('restored');
    },
  },
  {
    id: 'forgotten', spawn: [20, 16],
    enter(g) { toPrison(g); g.hide('baker'); g.place('joseph', 23, 13, 'right'); },
    begin(g) { g.hide('cupbearer'); },
    goal: 'Talk to Joseph, when you are ready.', marker: 'joseph',
    trigger: { talk: 'joseph' },
    async run(g) {
      await g.say('forgot');
      g.award('forgot');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
