// God Meant It for Good (Genesis 45; 46:28-30; 50:15-26): Joseph makes himself
// known to his brothers, the wagons for Jacob, the meeting in Goshen, the
// brothers' fear after Jacob's death, and Joseph's last words. The words are in
// dialogue.csv.

import { robe, lady, discover, makeMap, animal, job, trips } from '../../src/storykit.js';

export const id = 'meant';
export const title = 'God Meant It for Good';
export const where = "Joseph's house in Egypt, and the land of Goshen";
export const ref = 'Genesis 45; 46:28-30; 50:15-26';
export const place = [32.0, 30.35];   // Goshen
export const after = 'cup';

// ----------------------------------------------------------------------- map
//   .  grass    p  paving    s  desert    ,  path    b  barley field

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 25;
export const map = makeMap((x, y) => {
  if (edge(x, y)) return 's';
  if (x >= 6 && x <= 31 && y >= 4 && y <= 17) return 'p';
  return '.';
});
const GOSHEN = makeMap((x, y) => {
  if (edge(x, y)) return 's';
  if (x >= 24 && x <= 36 && y >= 14 && y <= 23) return 'b';
  if (y === 14 && x < 24 || x === 18 && y >= 8 && y <= 14) return ',';
  return '.';
});

export const start = [6, 21];
export const door = [4, 22];
export const barriers = [];

// -------------------------------------------------------------------- jobs

const load = job('wagon', { step: 'wagons', total: 4, goal: "Load the wagons for Jacob's family", target: 'wagon1', hold: 'bundle', reuse: true });

// -------------------------------------------------------------------- people

const SKIN = '#b07848';
const egyptian = (over = {}) => robe({ skin: SKIN, top: '#f2efe6', sash: '#4a7ab0', hair: '#1f1a17', hairStyle: 'bob', ...over });
const brother = (id, name, at, top, over = {}) => ({ id, name, at, dir: 'down', look: robe({ top, beard: true, ...over }) });
const JOSEPH = { skin: '#c98f62', top: '#f2efe6', sash: '#e3b93a', head: 'band', headColor: '#e3b93a', hair: '#2a211c', hairStyle: 'bob' };

export const actors = [
  { id: 'joseph', name: 'Joseph', at: [19, 8], dir: 'down', chat: 'joseph_idle', look: egyptian(JOSEPH) },
  { id: 'guard1', name: 'an attendant', at: [17, 9], dir: 'down', look: egyptian({ top: '#6a6a72', item: 'spear' }) },
  { id: 'guard2', name: 'an attendant', at: [21, 9], dir: 'down', look: egyptian({ top: '#6a6a72', item: 'spear' }) },
  { id: 'jacob', name: 'Jacob', at: [18, 10], dir: 'down', hidden: true, chat: 'jacob_idle', look: robe({ top: '#7d5a8a', sash: '#e3b93a', hair: '#e8e8e8', beard: '#e8e8e8', head: 'cloth', headColor: '#e8e0cc', item: 'staff' }) },
  brother('reuben', 'Reuben', [15, 12], '#7a5a3a'),
  brother('simeon', 'Simeon', [17, 13], '#8a3a3a'),
  brother('judah', 'Judah', [19, 12], '#4f8a6a'),
  brother('levi', 'Levi', [21, 13], '#a9845a'),
  brother('dan', 'Dan', [14, 14], '#3d6fb5'),
  brother('asher', 'Asher', [23, 12], '#b5764a'),
  { id: 'benjamin', name: 'Benjamin', at: [18, 14], dir: 'up', scale: 0.9, onUse: discover('disc_benjamin', 'clothes'), look: robe({ top: '#f2efe6', sash: '#c0415a' }) },
  { id: 'servant', name: 'an Egyptian servant', at: [26, 9], dir: 'left', onUse: discover('disc_servant', 'heard'), look: egyptian({ top: '#d9c9a3' }) },
  { id: 'herder', name: 'a young shepherd', at: [30, 12], dir: 'left', hidden: true, onUse: discover('disc_goshen', 'goshen'), look: robe({ top: '#a9845a' }) },
  animal('donkey1', 'donkey', [10, 17], { hidden: true, name: 'a donkey' }),
  animal('donkey2', 'donkey', [9, 19], { hidden: true, name: 'a donkey' }),
];

// -------------------------------------------------------------------- things

const COURT = [
  { id: 'palace', type: 'palace', x: 14, y: 3 },
  { id: 'throne', type: 'throne', x: 19, y: 6 },
  { id: 'col1', type: 'column', x: 8, y: 7 }, { id: 'col2', type: 'column', x: 8, y: 12 }, { id: 'col3', type: 'column', x: 30, y: 7 }, { id: 'col4', type: 'column', x: 30, y: 12 },
  { id: 'wagon1', type: 'wagon', x: 7, y: 17, label: 'load the wagon', onUse: load.give },
  { id: 'clothes', type: 'sheaves', x: 11, y: 20, item: 'new clothes', label: 'pick up clothes for the family', onUse: load.take },
  { id: 'bread', type: 'oven', x: 14, y: 18, item: 'bread and provisions', label: 'pick up provisions', onUse: load.take },
  { id: 'gifts', type: 'jars', x: 24, y: 18, item: 'the best of Egypt', label: 'pick up gifts for Jacob', onUse: load.take },
];
const CAMP = [
  { id: 'tent1', type: 'bigtent', x: 20, y: 6 }, { id: 'tent2', type: 'tent', x: 11, y: 7 }, { id: 'tent3', type: 'tent', x: 26, y: 6 },
  { id: 'fire', type: 'fire', x: 17, y: 16 },
  { id: 'palm', type: 'palm', x: 5, y: 12 }, { id: 'palm2', type: 'palm', x: 34, y: 10 },
];
export const objects = COURT;

const swap = (g, to) => {
  if (g.state.place === to) return;
  const first = g.state.place === undefined;
  g.state.place = to;
  (to === 'goshen' ? COURT : CAMP).forEach(o => g.removeProp(o.id));
  g.ground(to === 'goshen' ? GOSHEN : map, 0);
  (to === 'goshen' ? CAMP : COURT).forEach(o => g.addProp(o));
};
const toGoshen = g => swap(g, 'goshen');
const toCourt = g => swap(g, 'court');
const BROTHERS = ['reuben', 'simeon', 'judah', 'levi', 'dan', 'asher', 'benjamin'];
const OLD = { hair: '#e8e8e8', beard: '#e8e8e8' };

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'outside',
    goal: 'Wait by the door and listen.', marker: null,
    async intro(g) {
      await g.wait(500);
      await g.say('arrive');
      await g.say('away');
      g.walk('guard1', [[17, 16]], 130); g.walk('guard2', [[21, 16]], 130);
      g.walk('servant', [[26, 18]], 110);
      g.place('player', 19, 18, 'up');
      await g.wait(700);
    },
    trigger: { zone: [17, 13, 21, 15] },
    async run(g) {
      g.place('player', 19, 16, 'up');
      await g.say('weeping');
      g.award('weeping');
      await g.say('reveal');
      g.award('i_am');
      await g.say('reveal2');
      g.award('save_lives');
      await g.say('reveal3');
      g.award('god_sent');
      await g.say('embrace');
      g.award('embraced');
      g.hide('guard1'); g.hide('guard2');
    },
  },
  {
    id: 'wagons', spawn: [14, 17],
    enter(g) { toCourt(g); g.hide('guard1'); g.hide('guard2'); },
    begin(g) { g.show('donkey1'); g.show('donkey2'); },
    goal: "Load the wagons for Jacob's family: 0 of 4", marker: 'clothes',
    solve: trips(['clothes', 'bread', 'gifts', 'clothes'], 'wagon1'),
    trigger: { signal: 'wagons' },
    async intro(g) { await g.say('pharaoh_pleased'); g.award('pleased'); await g.say('wagons_start'); },
    async run(g) {
      await g.say('gifts_given');
      g.award('benjamin_gift');
      await g.say('quarrel');
      g.award('no_quarrel');
      await g.fadeOut(900);
      for (const id of BROTHERS) g.hide(id);
    },
  },
  {
    id: 'goshen', spawn: [18, 18],
    enter(g) { toGoshen(g); },
    async intro(g) {
      toGoshen(g);
      for (const id of ['donkey1', 'donkey2']) g.hide(id);
      g.show('jacob'); g.show('herder');
      for (const [id, x, y, dir] of [['jacob', 18, 9, 'down'], ['judah', 17, 10, 'down'], ['reuben', 16, 11, 'down'], ['simeon', 20, 10, 'down'], ['levi', 21, 11, 'down'], ['dan', 15, 12, 'down'], ['asher', 22, 12, 'down'], ['benjamin', 19, 11, 'down']]) { g.show(id); g.place(id, x, y, dir); }
      g.place('joseph', 18, 20, 'up');
      g.place('player', 14, 18, 'right');
      await g.fadeIn(900);
      await g.say('jacob_back');
      g.award('revived');
    },
    goal: 'Watch for Joseph. He is coming to Goshen.', marker: 'joseph',
    trigger: { zone: [16, 12, 20, 14] },
    async run(g) {
      g.place('player', 14, 14, 'right');
      await g.walk('joseph', [[18, 12]], 130);
      await g.say('meet');
      g.award('wept');
      await g.say('meet2');
      g.award('finally');
      await g.say('settled');
      g.award('settle');
    },
  },
  {
    id: 'grudge', spawn: [18, 18],
    enter(g) { toGoshen(g); g.show('jacob'); },
    async intro(g) {
      await g.fadeOut(900);
      toCourt(g);
      g.hide('jacob'); g.hide('herder');
      for (const id of ['donkey1', 'donkey2']) g.hide(id);
      for (const [id, x, y, dir] of [['reuben', 15, 12, 'down'], ['simeon', 17, 13, 'down'], ['judah', 19, 12, 'down'], ['levi', 21, 13, 'down'], ['dan', 14, 14, 'down'], ['asher', 23, 12, 'down'], ['benjamin', 18, 14, 'up']]) { g.show(id); g.place(id, x, y, dir); }
      g.place('joseph', 19, 8, 'down');
      g.place('player', 19, 18, 'up');
      await g.fadeIn(900);
      await g.say('years');
      g.award('years');
    },
    goal: 'Talk to Judah. The brothers are afraid.', marker: 'judah',
    trigger: { talk: 'judah' },
    async run(g) {
      await g.say('grudge');
      g.award('grudge');
      await g.say('message');
      g.award('forgive');
      await g.walk('judah', [[19, 10]], 120);
      await g.say('slaves');
      g.award('slaves');
      await g.say('meant');
      g.award('place_of_god');
      await g.say('meant2');
      g.award('meant');
      g.award('kindly');
    },
  },
  {
    id: 'bones', spawn: [18, 18],
    enter(g) { toCourt(g); g.hide('jacob'); g.hide('herder'); g.place('joseph', 19, 8, 'down'); },
    goal: 'Talk to Joseph, who is very old now.', marker: 'joseph',
    begin(g) { g.setLook('joseph', { hair: '#e8e8e8', beard: '#e8e8e8' }); },
    trigger: { talk: 'joseph' },
    async run(g) {
      await g.say('old');
      g.award('generations');
      await g.say('oath');
      g.award('bones');
      await g.say('end_of_life');
      g.award('died');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
