// Leaving Haran (Genesis 12:1-9): God calls Abram, the caravan is packed, the
// long walk to Canaan, the LORD appearing at the Oak of Moreh, and Abram's tent
// and altar in the hills near Bethel. The words are in dialogue.csv.

import { ANIMAL_HEADROOM } from '../../src/art.js';
import { robe, discover, makeMap } from '../../src/storykit.js';

export const id = 'haran';
export const title = 'Leaving Haran';
export const where = 'Haran, then the land of Canaan';
export const ref = 'Genesis 12:1-9';
export const place = [39.03, 36.87];   // Haran

// ----------------------------------------------------------------------- map
// Haran first. After the journey the ground changes to the hills of Canaan.
//   #  cliff    .  grass    ,  road    h  hillside

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
export const map = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (y === 20 || x === 20 && y >= 14 && y <= 20) return ',';
  return '.';
});
const CANAAN = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (y === 20 || x === 24 && y >= 12 && y <= 20) return ',';
  if (y <= 12 && x >= 22 || y <= 6) return 'h';
  return '.';
});

export const start = [5, 20];
export const door = [3, 21];
export const barriers = [];

// -------------------------------------------------------------------- packing

// Three loads for the camels: grain, water and the tent poles.
const pack = g => (g.state.pack ||= { holding: false, loaded: 0, taken: [] });
function useLoad(g, pile) {
  const p = pack(g);
  if (g.stepId !== 'pack') return g.note(g.text('look_load'));
  if (p.holding) return g.note(g.text('hands_full'));
  if (p.taken.includes(pile.id)) return g.note(g.text('load_gone'));
  p.holding = true;
  p.taken.push(pile.id);
  g.hold('bundle');
  g.note(g.text(`take_${pile.id}`));
}
function useCamel(g) {
  const p = pack(g);
  if (g.stepId !== 'pack') return g.note(g.text('look_camel'));
  if (!p.holding) return g.note(g.text('camel_empty'));
  p.holding = false;
  p.loaded++;
  g.hold(null);
  g.note(g.text('camel_loaded'));
  if (p.loaded >= 3) return g.signal('pack');
  g.goal(`Load the camel for the journey: ${p.loaded} of 3`, 'packcamel');
}

// -------------------------------------------------------------------- the tent

const PEGS = [{ id: 'peg1', x: 28, y: 9 }, { id: 'peg2', x: 33, y: 9 }, { id: 'peg3', x: 30, y: 12 }];
async function usePeg(g, peg) {
  if (g.stepId !== 'tent') return;
  g.note(g.text('peg_hammer'));
  g.shake(120, 0.003);
  g.removeProp(peg.id);
  const driven = (g.state.pegs = (g.state.pegs || 0) + 1);
  if (driven >= PEGS.length) return g.signal('tent');
  g.goal(`Drive in the tent pegs: ${driven} of 3`);
}

// -------------------------------------------------------------------- people

const lady = (top, over = {}) => robe({ top, hairStyle: 'long', head: 'cloth', headColor: '#d9c9a3', ...over });
const animal = (id, kind, at, over = {}) => ({ id, name: `a ${kind}`, at, solid: false, look: { kind }, headroom: ANIMAL_HEADROOM, ...over });

export const actors = [
  { id: 'abram', name: 'Abram', at: [20, 12], chat: 'abram_idle', look: robe({ top: '#7d5a8a', sash: '#e3b93a', hair: '#8a8a8a', beard: '#9a9a9a', head: 'cloth', headColor: '#e8e0cc', item: 'staff' }) },
  { id: 'sarai', name: 'Sarai', at: [17, 14], dir: 'right', onUse: discover('disc_sarai', 'sarai'), look: lady('#3d6fb5', { hair: '#5a4a3a' }) },
  { id: 'lot', name: 'Lot', at: [33, 16], dir: 'left', onUse: discover('disc_lot', 'possessions'), look: robe({ top: '#4f8a6a', beard: true }) },
  { id: 'servant', name: 'an old servant', at: [5, 16], dir: 'right', onUse: discover('disc_ur', 'ur'), look: robe({ top: '#a9845a', hair: '#e8e8e8', beard: '#e8e8e8' }) },
  { id: 'neighbor', name: 'a woman at the well', at: [11, 14], dir: 'left', onUse: discover('disc_faith', 'faith'), look: lady('#a85a4a') },
  { id: 'canaanite', name: 'a Canaanite shepherd', at: [7, 15], hidden: true, onUse: discover('disc_nations', 'nations'), look: robe({ top: '#8a3a3a', skin: '#a06a42', head: 'band', headColor: '#2a211c', item: 'staff' }) },
  animal('packcamel', 'camel', [26, 18], { name: 'the pack camel', label: 'load the camel', scale: 1.4, onUse: useCamel }),
  animal('camel2', 'camel', [30, 19], { scale: 1.4 }),
  animal('donkey', 'donkey', [23, 19]),
  animal('sheep1', 'lamb', [9, 17], { name: 'a sheep', hidden: true }),
  animal('sheep2', 'lamb', [5, 17], { name: 'a sheep', hidden: true }),
];

// -------------------------------------------------------------------- things

// Haran's houses and well, and the loads for the camel. All are cleared away
// when the story moves to Canaan.
const HARAN = [
  { id: 'h1', type: 'house', x: 3, y: 6 }, { id: 'h2', type: 'house', x: 9, y: 5 }, { id: 'h3', type: 'house', x: 3, y: 11 },
  { id: 'h4', type: 'house', x: 14, y: 4 }, { id: 'h5', type: 'house', x: 30, y: 4 },
  { id: 'well', type: 'well', x: 10, y: 13 },
  { id: 'palm', type: 'palm', x: 15, y: 9 },
  { id: 'grain', type: 'sacks', x: 24, y: 13, label: 'pick up the grain', onUse: useLoad },
  { id: 'water', type: 'jars', x: 29, y: 15, label: 'pick up the water jars', onUse: useLoad },
  { id: 'poles', type: 'woodpile', x: 33, y: 12, label: 'pick up the tent poles', onUse: useLoad },
  { id: 'oldtent', type: 'tent', x: 18, y: 9 },
];
export const objects = HARAN;

const CANAAN_THINGS = [
  { id: 'moreh', type: 'oak', x: 12, y: 11, label: 'look at the great oak', onUse: g => g.note(g.text('look_oak')) },
  { id: 'shechem1', type: 'house', x: 3, y: 4 }, { id: 'shechem2', type: 'house', x: 8, y: 3 },
  { id: 'bethel1', type: 'house', x: 16, y: 3 }, { id: 'bethel2', type: 'house', x: 20, y: 4 },
  { id: 'ai', type: 'house', x: 34, y: 4 },
  { id: 'rock1', type: 'rock', x: 26, y: 15 }, { id: 'rock2', type: 'bigrock', x: 35, y: 14 }, { id: 'tree1', type: 'tree', x: 33, y: 18 },
];

// -------------------------------------------------------------------- scenes

const toCanaan = g => {
  if (g.state.canaan) return;
  g.state.canaan = true;
  HARAN.forEach(o => g.removeProp(o.id));
  g.ground(CANAAN, 0);
  CANAAN_THINGS.forEach(o => g.addProp(o));
  g.hide('neighbor');
  for (const id of ['canaanite', 'sheep1', 'sheep2']) g.show(id);
  g.place('abram', 14, 13, 'down');
  g.place('sarai', 11, 14, 'right');
  g.place('lot', 17, 15, 'left');
  g.place('servant', 9, 13, 'right');
  g.place('packcamel', 5, 19, 'right');
  g.place('camel2', 8, 19, 'right');
  g.place('donkey', 11, 19, 'right');
  g.patrol('sheep1', [[9, 17], [12, 17]], 40, 2);
  g.patrol('sheep2', [[5, 17], [5, 15]], 40, 2.5);
  g.setChat('abram', 'abram_canaan');
};
const altarAtMoreh = g => {
  if (g.state.altar1) return;
  g.state.altar1 = true;
  g.addProp({ id: 'altar1', type: 'altar', x: 15, y: 11 });
};
const pitchCamp = g => {
  if (g.state.camp) return;
  g.state.camp = true;
  PEGS.forEach(p => g.removeProp(p.id));
  g.addProp({ id: 'tent', type: 'bigtent', x: 30, y: 10, label: 'look at the tent', onUse: discover('disc_city', 'city') });
  g.addProp({ id: 'altar2', type: 'altar', x: 26, y: 10 });
  g.place('abram', 27, 12, 'down');
  g.place('sarai', 33, 12, 'left');
  g.place('lot', 20, 14, 'right');
  g.place('servant', 30, 14, 'up');
};

export const steps = [
  {
    id: 'call',
    goal: 'Talk to Abram, by the tents.', marker: 'abram',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'abram' },
    async run(g) {
      await g.say('call');
      g.award('go');
      await g.say('bless');
      g.award('bless');
      await g.say('pack_ask');
    },
  },
  {
    id: 'pack', spawn: [20, 15],
    goal: 'Load the camel for the journey: 0 of 3', marker: 'packcamel',
    solve: ['grain', 'packcamel', 'water', 'packcamel', 'poles', 'packcamel'],
    trigger: { signal: 'pack' },
    async run(g) {
      g.place('abram', 22, 17, 'right');
      await g.say('departed');
      g.award('went');
      // The long walk to Canaan.
      await g.fadeOut(900);
      await g.say('journey');
      toCanaan(g);
      g.place('player', 10, 17, 'up');
      await g.fadeIn(900);
      await g.say('canaan');
    },
  },
  {
    id: 'moreh', spawn: [10, 17],
    enter(g) { toCanaan(g); },
    goal: 'Walk with Abram to the great oak at Shechem.', marker: 'moreh',
    trigger: { zone: [10, 12, 17, 14] },
    async run(g) {
      g.face('player', 'up');
      await g.pan(13, 8, 900);
      const light = g.fx('glow', 13 * g.T, 2 * g.T).setScale(3).setAlpha(0);
      await g.tween({ targets: light, alpha: 1, duration: 1400 });
      await g.say('appeared');
      g.award('offspring');
      await g.tween({ targets: light, alpha: 0, duration: 1000 });
      light.destroy();
      altarAtMoreh(g);
      await g.say('altar_moreh');
      await g.follow(600);
      g.walk('abram', [[24, 13], [27, 12]], 120);
      await g.say('move_on');
    },
  },
  {
    id: 'tent', spawn: [22, 15],
    enter(g) { toCanaan(g); altarAtMoreh(g); g.place('abram', 27, 12, 'down'); },
    begin(g) { if (!g.state.camp) PEGS.forEach(p => g.addProp({ ...p, type: 'peg', label: 'drive in the tent peg', onUse: usePeg })); },
    goal: 'Drive in the tent pegs: 0 of 3',
    solve: ['peg1', 'peg2', 'peg3'],
    trigger: { signal: 'tent' },
    async run(g) {
      await g.fadeOut(500);
      pitchCamp(g);
      await g.fadeIn(500);
      await g.say('called_on');
      g.award('calledon');
    },
  },
  {
    id: 'farewell', spawn: [28, 14],
    enter(g) { toCanaan(g); altarAtMoreh(g); pitchCamp(g); },
    goal: 'Talk to Abram when you are ready to go.', marker: 'abram',
    trigger: { talk: 'abram' },
    async run(g) {
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
