// Let There Be Light (Genesis 1:1-2:3): the six days of creation and the
// seventh day of rest. The traveler is there from the start, standing on a
// rock in the dark waters. The words are in dialogue.csv.

import { ANIMAL_HEADROOM } from '../../src/art.js';
import { discover, makeMap } from '../../src/storykit.js';

export const id = 'light';
export const title = 'Let There Be Light';
export const where = 'The beginning';
export const ref = 'Genesis 1:1-2:3';
export const place = [46.7, 31.15];   // no place on earth yet; shown in the land of the rivers, near the garden

// ----------------------------------------------------------------------- map
//   S  deep water    ~  shallows    s  sand    .  grass    G  lush grass    f  flowers

// Before the third day there is only water, and a rock to stand on.
const ROCK = [[11, 12], [12, 12], [13, 12], [11, 13], [12, 13], [13, 13], [11, 14], [12, 14], [13, 14]];
export const map = makeMap((x, y) => (ROCK.some(([rx, ry]) => rx === x && ry === y) ? 's' : 'S'));

// The third day: dry land, then plants.
const shore = (x, y) => (x >= 30 || y >= 23 ? 'S' : x === 29 || y === 22 ? '~' : x === 28 || y === 21 ? 's' : null);
const LAND = makeMap((x, y) => shore(x, y) || '.');
const GREEN = makeMap((x, y) => {
  const edge = shore(x, y);
  if (edge) return edge;
  if ((x - 7) ** 2 + (y - 7) ** 2 < 14 || (x - 20) ** 2 + (y - 15) ** 2 < 18) return (x * 7 + y * 3) % 5 === 0 ? 'f' : 'G';
  if ((x + y * 2) % 13 === 0) return 'f';
  return '.';
});

export const start = [12, 13];
export const door = [11, 14];
export const barriers = [];

// -------------------------------------------------------------------- living things

const animal = (id, kind, at, over = {}) => ({ id, name: `a ${kind}`, at, hidden: true, solid: false, look: { kind }, headroom: ANIMAL_HEADROOM, ...over });
const FISH = [['fish1', [32, 6]], ['fish2', [35, 12]], ['fish3', [33, 25]]];
const BIRDS = [['bird1', [8, 4], 'bird'], ['bird2', [18, 10], 'dove'], ['bird3', [24, 5], 'bird']];
const BEASTS = [
  animal('lion', 'lion', [16, 10], { name: 'the lion', label: 'go up to the lion', scale: 1.3 }),
  animal('elephant', 'elephant', [22, 8], { name: 'an elephant', label: 'look at the elephant', scale: 1.9, onUse: discover('disc_gentle', 'gentle') }),
  animal('deer', 'deer', [19, 14], { name: 'a deer', label: 'look at the deer', scale: 1.2, onUse: discover('disc_works', 'works') }),
  animal('camel', 'camel', [9, 17], { scale: 1.4, onUse: g => g.note(g.text('look_camel')) }),
  animal('lambkin', 'lamb', [13, 17], { onUse: g => g.note('Baa!') }),
  animal('kid', 'goat', [15, 18], { onUse: g => g.note('Meh-eh-eh!') }),
];

export const actors = [
  ...FISH.map(([id, at]) => animal(id, 'fish', at, { name: 'a fish', onUse: g => g.note(g.text('look_fish')) })),
  animal('whale', 'bigfish', [34, 16], { name: 'a great sea creature', scale: 3.2 }),
  ...BIRDS.map(([id, at, kind]) => animal(id, kind, at, { name: 'a bird', onUse: g => g.note(g.text('look_bird')) })),
  ...BEASTS,
  { id: 'man', name: 'the man', at: [14, 11], hidden: true, chat: 'man_idle', look: { kind: 'tunic', skin: '#b07a4e', hair: '#2a1d14', hairStyle: 'short', beard: true, top: '#5f8a3a' } },
  { id: 'woman', name: 'the woman', at: [15, 11], hidden: true, chat: 'man_idle', look: { kind: 'tunic', skin: '#b98256', hair: '#2a1d14', hairStyle: 'long', top: '#5f8a3a' } },
];

// -------------------------------------------------------------------- things

// What grows on the third day.
const PLANTS = [
  { id: 'firsttree', type: 'fruittree', x: 8, y: 9, label: 'look at the tree', onUse: g => g.signal('tree') },
  { type: 'tree', x: 5, y: 5 }, { type: 'tree', x: 20, y: 5 }, { type: 'tree', x: 16, y: 18 }, { type: 'tree', x: 24, y: 13 },
  { type: 'fruittree', x: 4, y: 12 }, { type: 'fruittree', x: 18, y: 7 },
  { type: 'palm', x: 27, y: 6 }, { type: 'palm', x: 27, y: 16 }, { type: 'bush', x: 10, y: 19 }, { type: 'bush', x: 23, y: 3 },
  { id: 'hill', type: 'rock', x: 22, y: 3, label: 'look up at the sky', onUse: g => (g.state.day >= 4 ? discover('disc_heavens', 'heavens')(g) : g.note(g.text('look_sky_early'))) },
  { id: 'surf', type: 'rock', x: 26, y: 20, label: 'listen to the waves', onUse: discover('disc_shore', 'shore') },
  { id: 'reststone', type: 'bigrock', x: 6, y: 15, reach: 60, label: 'sit down and rest', onUse: g => (g.stepId === 'rest' ? g.signal('rest') : g.note(g.text('look_stone'))) },
];

export const objects = [];

// -------------------------------------------------------------------- scenes

const day = (g, n) => { g.state.day = n; };
const growLand = (g, ms) => {
  if (g.state.grown) return Promise.resolve();
  g.state.grown = true;
  const done = g.ground(GREEN, ms);
  PLANTS.forEach(p => g.addProp(p));
  return done;
};
const fill = (g, ids) => ids.forEach(id => g.show(id));
// Each kind of life appears once; on a story picked up part-way, earlier days fill in at once.
const once = (name, fn) => g => { if (g.state[name]) return; g.state[name] = true; fn(g); };
const swim = once('swim', g => {
  fill(g, [...FISH.map(f => f[0]), 'whale']);
  g.patrol('fish1', [[32, 6], [36, 9], [33, 12]], 50, 0.4);
  g.patrol('fish2', [[35, 12], [31, 15], [37, 18]], 45, 0.6);
  g.patrol('fish3', [[33, 25], [38, 24], [35, 26]], 55, 0.3);
  g.patrol('whale', [[34, 16], [35, 8], [36, 20]], 30, 1.5);
});
const fly = once('fly', g => {
  fill(g, BIRDS.map(b => b[0]));
  g.patrol('bird1', [[8, 4], [16, 3], [12, 8]], 90, 0.2);
  g.patrol('bird2', [[18, 10], [24, 4], [26, 12]], 80, 0.3);
  g.patrol('bird3', [[24, 5], [10, 6], [6, 3]], 95, 0.2);
});
const roam = once('roam', g => {
  fill(g, BEASTS.map(b => b.id));
  g.patrol('deer', [[19, 14], [23, 17], [21, 11]], 40, 2);
  g.patrol('camel', [[9, 17], [5, 19]], 30, 3);
  g.patrol('kid', [[15, 18], [17, 16]], 45, 1.5);
});
const people = g => { g.show('man'); g.show('woman'); g.face('man', 'down'); g.face('woman', 'down'); };

// Something that rises over the scene for a moment: the sun, the moon, a cloud.
async function rise(g, texture, dx, from, to, ms) {
  const p = g.player;
  const fx = g.fx(texture, p.x + dx, p.y + from).setAlpha(0);
  await g.tween({ targets: fx, y: p.y + to, alpha: 1, duration: ms });
  return fx;
}

export const steps = [
  {
    id: 'dark',
    async intro(g) {
      g.dark(true);
      await g.wait(800);
      await g.say('beginning');
      await g.say('let_light');
      g.dark(false);
      g.flash(700);
      await g.wait(500);
      await g.say('day1');
      g.award('light');
      day(g, 1);
      // The second day: the sky.
      const clouds = [await rise(g, 'cloud', -220, -60, -180, 900), await rise(g, 'cloud', 160, -40, -150, 900)];
      await g.say('day2');
      clouds.forEach(c => g.tween({ targets: c, alpha: 0, duration: 1200 }).then(() => c.destroy()));
      day(g, 2);
    },
  },
  {
    id: 'land',
    enter(g) { day(g, 3); growLand(g, 0); },
    async intro(g) {
      await g.say('day3_waters');
      g.shake(900, 0.004);
      await g.ground(LAND, 1600);
      await g.say('day3_land');
      g.award('seas');
      await g.say('day3_grow');
      await growLand(g, 1400);
    },
    goal: 'Day 3: Go and look at the first tree.', marker: 'firsttree',
    trigger: { signal: 'tree' },
    async run(g) {
      await g.say('day3_plants');
      g.award('seed');
    },
  },
  {
    id: 'lights', spawn: [10, 10],
    enter(g) { day(g, 4); },
    async intro(g) {
      await g.say('day4_ask');
      g.sky({ night: true, stars: true });
      const moon = await rise(g, 'moon', 120, -60, -170, 1400);
      await g.say('day4_night');
      g.tween({ targets: moon, alpha: 0, duration: 1000 }).then(() => moon.destroy());
      g.sky({});
      const sun = await rise(g, 'sun', -160, -40, -190, 1600);
      await g.say('day4_day');
      g.tween({ targets: sun, alpha: 0, duration: 1500 }).then(() => sun.destroy());
      g.award('lights');
    },
  },
  {
    id: 'creatures', spawn: [10, 10],
    enter(g) { day(g, 5); },
    async intro(g) {
      await g.say('day5');
      swim(g);
      fly(g);
    },
    goal: 'Day 5: Go down to the shore and watch the sea.',
    trigger: { zone: [27, 1, 29, 22] },
    async run(g) {
      g.face('player', 'right');
      await g.pan(34, 15, 900);
      await g.say('day5_sea');
      g.award('creatures');
      await g.follow(700);
    },
  },
  {
    id: 'beasts', spawn: [26, 12],
    enter(g) { day(g, 6); swim(g); fly(g); },
    async intro(g) { await g.say('day6_beasts'); roam(g); },
    goal: 'Day 6: Go and meet the lion.', marker: 'lion',
    trigger: { talk: 'lion' },
    async run(g) {
      await g.say('lion');
      // People: made in God's image.
      await g.pan(14, 11, 800);
      const glow = g.fx('glow', 14.5 * g.T, 11 * g.T).setAlpha(0).setScale(0.5);
      await g.tween({ targets: glow, alpha: 1, scale: 2.2, duration: 1000 });
      people(g);
      await g.tween({ targets: glow, alpha: 0, duration: 900 });
      glow.destroy();
      await g.say('image');
      g.award('image');
      await g.say('very_good');
      await g.follow(600);
    },
  },
  {
    id: 'rest', spawn: [15, 13],
    enter(g) { roam(g); people(g); },
    goal: 'Day 7: Find a quiet place to sit and rest.', marker: 'reststone',
    trigger: { signal: 'rest' },
    async run(g) {
      g.face('player', 'down');
      await g.say('rest');
      g.award('rest');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
