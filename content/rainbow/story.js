// The Rainbow (Genesis 8-9): the waters go down, the dove and the olive leaf,
// everyone comes out of the ark, Noah's altar, and God's promise in the clouds.
// The words are in dialogue.csv.

import { ANIMAL_HEADROOM } from '../../src/art.js';
import { robe, discover, makeMap } from '../../src/storykit.js';

export const id = 'rainbow';
export const title = 'The Rainbow';
export const where = 'The mountains of Ararat';
export const ref = 'Genesis 8-9';
export const after = 'ark';
export const place = [44.3, 39.7];   // Mount Ararat (Genesis 8:4)

// ----------------------------------------------------------------------- map
// The ark rests on a ledge high on the mountain. Below, the flood goes down
// in three stages.
//   #  cliff    s  bare rock    S  floodwater    m  mud    .  grass

const LEDGE = (x, y) => x <= 18 && y <= 12;
const shape = level => makeMap((x, y) => {
  if (x < 2 || x > 37 || y < 2 || y > 26) return '#';
  if (y <= 3 && x >= 20) return '#';
  if (LEDGE(x, y)) return 's';
  if (level === 0) return 'S';
  if (level === 1) return x <= 26 && y <= 17 ? 'm' : 'S';
  return Math.sin(x * 0.55) + Math.cos(y * 0.7 + x * 0.2) > 1.25 ? 'm' : '.';   // puddles of mud left behind
});
export const map = shape(0);
const LOWER = shape(1), DRY = shape(2);

export const start = [10, 11];
export const door = [3, 11];
export const barriers = [];

// -------------------------------------------------------------------- jobs

// Leading the animals down to the open land (Genesis 8:17-19).
const PAIRS = [
  { kind: 'lion', ids: ['lion1', 'lion2'], scale: 1.3 },
  { kind: 'deer', ids: ['deer1', 'deer2'], scale: 1.2 },
  { kind: 'camel', ids: ['camel1', 'camel2'], scale: 1.4 },
];
const RAMP_FOOT = [[8, 11], [9, 11], [10, 12], [11, 12], [13, 12], [14, 12]];
function usePair(g, beast) {
  const pair = PAIRS.find(p => p.ids.includes(beast.id));
  const freed = g.state.freed || [];
  if (g.stepId !== 'out' || freed.includes(pair.kind)) return g.note(g.text('look_free'));
  if (g.state.led?.length) return g.note(g.text('one_pair'));
  g.trail(pair.ids[0], true);
  g.trail(pair.ids[1], pair.ids[0]);
  g.state.led = [...pair.ids];
  g.note(g.text('pair_follows'));
}
function useMeadow(g) {
  const led = g.state.led || [];
  if (g.stepId !== 'out' || !led.length) return g.note(g.text('look_meadow'));
  const pair = PAIRS.find(p => p.ids.includes(led[0]));
  led.forEach((id, i) => { g.trail(id, false); g.walk(id, [[33 + i * 2, 22 - i * 3]], 160).then(() => g.patrol(id, [[33 + i * 2, 22 - i * 3], [29 + i * 3, 25 - i * 4]], 50, 2)); });
  const freed = (g.state.freed ||= []);
  freed.push(pair.kind);
  g.state.led = [];
  g.note(g.text('pair_free'));
  if (freed.length >= PAIRS.length) return g.signal('out');
  g.goal(`Lead the animals down to the open land: ${freed.length} of 3`, 'meadow');
}

// Stones for Noah's altar (Genesis 8:20).
const altar = g => (g.state.altar ||= { carrying: false, set: 0 });
function useStone(g, rock) {
  const a = altar(g);
  if (g.stepId !== 'altar' || a.carrying) return g.note(g.text(a.carrying ? 'hands_full' : 'look_rock'));
  a.carrying = true;
  g.hold('bundle');
  g.removeProp(rock.id);
  g.note(g.text('stone_take'));
}
function useSite(g) {
  const a = altar(g);
  if (g.stepId !== 'altar') return;
  if (!a.carrying) return g.note(g.text('site_empty'));
  a.carrying = false;
  a.set++;
  g.hold(null);
  g.note(g.text('stone_set'));
  if (a.set >= 3) return g.signal('altar');
  g.goal(`Bring stones for Noah's altar: ${a.set} of 3`, 'site');
}

// -------------------------------------------------------------------- people and animals

const FAMILY = ['wife', 'shem', 'ham', 'japheth'];
const lady = top => robe({ top, hairStyle: 'long', head: 'cloth', headColor: '#d9c9a3' });
const animal = (id, kind, at, over = {}) => ({ id, name: `a ${kind}`, at, solid: false, look: { kind }, headroom: ANIMAL_HEADROOM, ...over });

export const actors = [
  { id: 'noah', name: 'Noah', at: [12, 10], dir: 'left', chat: 'noah_idle', look: robe({ top: '#7d6a55', hair: '#d8d8d8', beard: '#d8d8d8', item: 'staff' }) },
  { id: 'wife', name: "Noah's wife", at: [7, 11], hidden: true, chat: 'family_idle', look: lady('#8a6f9a') },
  { id: 'shem', name: 'Shem', at: [6, 12], hidden: true, onUse: discover('disc_fruitful', 'fruitful'), look: robe({ top: '#a85a4a', beard: true }) },
  { id: 'ham', name: 'Ham', at: [15, 12], hidden: true, chat: 'family_idle', look: robe({ top: '#6f7f9a', skin: '#a06a42', beard: true }) },
  { id: 'japheth', name: 'Japheth', at: [16, 11], hidden: true, chat: 'family_idle', look: robe({ top: '#7f8f6a', beard: true }) },
  animal('raven', 'raven', [11, 9], { name: 'the raven', hidden: true }),
  animal('dove', 'dove', [11, 9], { name: 'the dove', hidden: true, label: 'hold out your hand to the dove' }),
  ...PAIRS.flatMap(p => p.ids.map((id, i) => animal(id, p.kind, RAMP_FOOT[PAIRS.indexOf(p) * 2 + i], { name: `a ${p.kind}`, label: `lead the ${p.kind}s`, scale: p.scale, hidden: true, onUse: usePair }))),
  animal('goats', 'goat', [5, 9], { name: 'a goat', hidden: true, onUse: discover('disc_creature', 'creature') }),
];

// -------------------------------------------------------------------- things

export const objects = [
  { id: 'theark', type: 'ark', x: 5, y: 8, reach: 120, label: 'look at the window', onUse: g => (g.stepId === 'arrive' ? g.note(g.text('look_ark')) : discover('disc_window', 'window')(g)) },
  { id: 'lookout', type: 'rock', x: 17, y: 4, label: 'look out over the water', onUse: g => (g.state.level >= 1 ? discover('disc_peaks', 'peaks')(g) : discover('disc_enthroned', 'enthroned')(g)) },
  { type: 'rock', x: 3, y: 5 }, { type: 'bigrock', x: 15, y: 6 },
];
const MEADOW = { id: 'meadow', type: 'tree', x: 30, y: 20, label: 'let the animals go here', onUse: useMeadow };
const STONES = [{ id: 'stone1', type: 'rock', x: 21, y: 9 }, { id: 'stone2', type: 'rock', x: 24, y: 14 }, { id: 'stone3', type: 'rock', x: 19, y: 16 }];
const SITE = { id: 'site', type: 'flatstones', x: 14, y: 14, label: 'set the stone down', onUse: useSite };

// -------------------------------------------------------------------- scenes

const level = (g, n, ms) => {
  if ((g.state.level || 0) >= n) return Promise.resolve();
  g.state.level = n;
  return g.ground(n === 1 ? LOWER : DRY, ms);
};
const fly = (g, id, there, ms = 220) => { g.show(id); g.place(id, 11, 9, 'right'); return g.walk(id, there, ms); };
const comeOut = g => {
  if (g.state.out) return;
  g.state.out = true;
  g.addProp({ id: 'ramp', type: 'ramp', x: 9, y: 9 });
  g.addProp(MEADOW);
  FAMILY.forEach(id => g.show(id));
  PAIRS.forEach(p => p.ids.forEach(id => g.show(id)));
  g.show('goats');
};
const setStones = g => {
  if (g.state.stones) return;
  g.state.stones = true;
  STONES.forEach(st => g.addProp({ ...st, label: 'pick up a stone', onUse: useStone }));
  g.addProp(SITE);
};
// On a story picked up after the animals were led down, they are already out on the grass.
const freeAll = g => PAIRS.forEach((p, k) => p.ids.forEach((id, i) => {
  g.trail(id, false);
  g.place(id, 29 + k * 3, 23 - i * 2, 'left');
  g.patrol(id, [[29 + k * 3, 23 - i * 2], [26 + k * 3, 25 - i * 3]], 50, 2);
}));
const builtAltar = g => {
  if (g.state.built) return;
  g.state.built = true;
  setStones(g);
  STONES.forEach(st => g.removeProp(st.id));
  g.removeProp('site');
  g.addProp({ id: 'altar', type: 'altar', x: 14, y: 14 });
  g.addProp({ id: 'fire', type: 'fire', x: 14, y: 13 });
};

export const steps = [
  {
    id: 'arrive',
    goal: 'Talk to Noah, beside the ark.', marker: 'noah',
    async intro(g) {
      await g.wait(700);
      await g.say('arrive');
      g.award('remembered');
    },
    trigger: { talk: 'noah' },
    async run(g) {
      await g.say('noah');
      // The raven, and the dove that comes back.
      fly(g, 'raven', [[30, 20], [36, 8]], 260).then(() => g.hide('raven'));
      await g.say('raven');
      await fly(g, 'dove', [[28, 18], [12, 9]]);
      g.hide('dove');
      await g.say('dove_back');
      // Seven days.
      await g.fadeOut(600);
      await level(g, 1, 0);
      await g.fadeIn(600);
      await g.say('seven_days');
      fly(g, 'dove', [[30, 22], [20, 13], [16, 12]]).then(() => g.face('dove', 'left'));
    },
  },
  {
    id: 'olive', spawn: [11, 11],
    enter(g) { level(g, 1, 0); g.show('dove'); g.place('dove', 16, 12, 'left'); },
    goal: 'The dove is back! Go and meet her.', marker: 'dove',
    trigger: { talk: 'dove' },
    async run(g) {
      await g.say('olive');
      g.award('olive');
      await g.walk('dove', [[12, 9]], 180);
      g.hide('dove');
      // Seven more days, and the land is dry.
      await g.fadeOut(600);
      await level(g, 2, 0);
      await g.fadeIn(600);
      await g.say('dry');
      await g.say('come_out');
      comeOut(g);
    },
  },
  {
    id: 'out', spawn: [11, 12],
    enter(g) { level(g, 2, 0); comeOut(g); },
    goal: 'Lead the animals down to the open land: 0 of 3', marker: 'meadow',
    trigger: { signal: 'out' },
    async run(g) {
      await g.say('kinds');
      g.award('kinds');
      setStones(g);
      await g.say('altar_ask');
    },
  },
  {
    id: 'altar', spawn: [16, 14],
    enter(g) { setStones(g); if (g.state.freed?.length !== PAIRS.length) freeAll(g); },
    goal: "Bring stones for Noah's altar: 0 of 3", marker: 'site',
    trigger: { signal: 'altar' },
    async run(g) {
      builtAltar(g);
      g.place('noah', 16, 15, 'left');
      await g.say('offering');
      g.award('seasons');
    },
  },
  {
    id: 'promise', spawn: [17, 17],
    enter(g) { builtAltar(g); g.place('noah', 16, 15, 'left'); },
    async intro(g) {
      await g.say('covenant');
      const p = g.player;
      const bow = g.fx('rainbow', p.x, p.y - 60).setAlpha(0).setScale(1.3).setDepth(-400);   // in the sky, behind everyone
      await g.tween({ targets: bow, alpha: 1, duration: 1800 });
      await g.say('sign');
      g.award('rainbow');
    },
    goal: 'Talk to Noah when you are ready to go.', marker: 'noah',
    trigger: { talk: 'noah' },
    async run(g) {
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
