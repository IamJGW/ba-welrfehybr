// Count the Stars (Genesis 13 and 15): the herdsmen quarrel, Lot chooses the
// plain of the Jordan, Abram walks the land God promised, and at night by the
// Oaks of Mamre he is told to count the stars. The words are in dialogue.csv.

import { ANIMAL_HEADROOM } from '../../src/art.js';
import { robe, discover, makeMap } from '../../src/storykit.js';

export const id = 'stars';
export const title = 'Count the Stars';
export const where = 'The hills near Bethel, then the Oaks of Mamre';
export const ref = 'Genesis 13; 15';
export const after = 'haran';
export const place = [35.33, 32.03];   // the hills between Bethel and Ai, nudged clear of Bethel

// ----------------------------------------------------------------------- map
// Hill country. To the east the hills drop away to the green plain of the Jordan.
//   #  cliff    h  hillside    ,  path    G  the plain far below

export const map = makeMap((x, y) => {
  if (x < 2 || y < 2 || y > 26 || x > 37) return '#';
  if (x >= 34) return 'G';
  if (x === 33 && (y < 19 || y > 21)) return '#';
  if (y === 20 || x === 18 && y >= 13 && y <= 20) return ',';
  return 'h';
});

export const start = [5, 20];
export const door = [3, 21];
export const barriers = [];

// -------------------------------------------------------------------- jobs

// Two herdsmen arguing at the well (Genesis 13:7).
const heard = g => (g.state.heard ||= []);
const useHerdsman = who => async g => {
  if (g.stepId !== 'quarrel') return g.say(`${who}_idle`);
  await g.say(`quarrel_${who}`);
  if (!heard(g).includes(who)) heard(g).push(who);
  if (heard(g).length >= 2) return g.signal('quarrel');
  g.goal('Find out why the herdsmen are shouting: 1 of 2');
};

// Look north, south, east and west (Genesis 13:14).
const CAIRNS = [
  { id: 'north', x: 19, y: 4 }, { id: 'south', x: 21, y: 24 }, { id: 'east', x: 31, y: 16 }, { id: 'west', x: 3, y: 13 },
];
function useCairn(g, cairn) {
  if (g.stepId !== 'look') return g.note(g.text('look_cairn'));
  const seen = (g.state.seen ||= []);
  g.note(g.text(`see_${cairn.id}`), 3200);
  if (seen.includes(cairn.id)) return;
  seen.push(cairn.id);
  if (seen.length >= CAIRNS.length) return g.signal('look');
  g.goal(`Look north, south, east and west: ${seen.length} of 4`);
}

// Try to count the stars, from three hilltops (Genesis 15:5).
const SPOTS = [{ id: 'spot1', x: 7, y: 23 }, { id: 'spot2', x: 29, y: 23 }, { id: 'spot3', x: 25, y: 4 }];
function useSpot(g, spot) {
  if (g.stepId !== 'night') return;
  const counted = (g.state.counted ||= []);
  if (counted.includes(spot.id)) return g.note(g.text('counted_here'));
  counted.push(spot.id);
  g.note(g.text(`count_${counted.length}`), 3200);
  if (counted.length >= SPOTS.length) return g.signal('night');
  g.goal(`Try to count the stars: ${counted.length} of 3`);
}

// -------------------------------------------------------------------- people

const lady = (top, over = {}) => robe({ top, hairStyle: 'long', head: 'cloth', headColor: '#d9c9a3', ...over });
const animal = (id, kind, at, over = {}) => ({ id, name: `a ${kind}`, at, solid: false, look: { kind }, headroom: ANIMAL_HEADROOM, ...over });
const sarai = g => (g.state.night ? discover('disc_seed', 'seed')(g) : g.say('sarai_day'));

export const actors = [
  { id: 'abram', name: 'Abram', at: [9, 10], chat: 'abram_idle', look: robe({ top: '#7d5a8a', sash: '#e3b93a', hair: '#8a8a8a', beard: '#9a9a9a', head: 'cloth', headColor: '#e8e0cc', item: 'staff' }) },
  { id: 'sarai', name: 'Sarai', at: [12, 8], dir: 'left', onUse: sarai, look: lady('#3d6fb5', { hair: '#5a4a3a' }) },
  { id: 'lot', name: 'Lot', at: [26, 10], dir: 'left', chat: 'lot_idle', look: robe({ top: '#4f8a6a', beard: true }) },
  { id: 'eliezer', name: 'Eliezer', at: [5, 11], dir: 'right', onUse: discover('disc_eliezer', 'eliezer'), look: robe({ top: '#3d6f6a', sash: '#e3b93a', beard: true, head: 'band', headColor: '#e3b93a' }) },
  { id: 'abramsman', name: "Abram's herdsman", at: [16, 13], dir: 'right', onUse: useHerdsman('abrams'), look: robe({ top: '#9a7a5a', item: 'staff' }) },
  { id: 'lotsman', name: "Lot's herdsman", at: [21, 13], dir: 'left', onUse: useHerdsman('lots'), look: robe({ top: '#6f7f5a', skin: '#a06a42', item: 'staff' }) },
  { id: 'teller', name: 'a servant by the fire', at: [23, 18], hidden: true, dir: 'left', onUse: discover('disc_rescue', 'melchizedek'), look: robe({ top: '#8a6f5a', beard: true, item: 'spear' }) },
  { id: 'shepboy', name: 'a shepherd boy', at: [20, 18], hidden: true, dir: 'right', scale: 0.85, onUse: discover('disc_names', 'names'), look: robe({ top: '#b59a6e' }) },
  animal('calf', 'calf', [8, 17], { name: 'a fine calf', label: 'look at the herds', onUse: discover('disc_wealth', 'wealth') }),
  animal('goat1', 'goat', [13, 16]), animal('goat2', 'goat', [24, 15]), animal('sheep1', 'lamb', [15, 17]), animal('sheep2', 'lamb', [27, 14], { name: 'a sheep' }),
];

// -------------------------------------------------------------------- things

const LOTS_CAMP = [{ id: 'lottent1', type: 'tent', x: 25, y: 6 }, { id: 'lottent2', type: 'tent', x: 29, y: 8 }];
export const objects = [
  { id: 'abramtent', type: 'bigtent', x: 8, y: 6 }, { id: 'tent2', type: 'tent', x: 3, y: 8 },
  ...LOTS_CAMP,
  { id: 'well', type: 'well', x: 18, y: 11 }, { id: 'trough', type: 'trough', x: 19, y: 12 },
  { id: 'lookout', type: 'bigrock', x: 32, y: 12, label: 'look out over the plain', onUse: g => g.note(g.text('look_plain'), 3000) },
  { id: 'altar', type: 'altar', x: 13, y: 4 },
  { id: 'bethel', type: 'house', x: 3, y: 3 }, { id: 'ai', type: 'house', x: 29, y: 3 },
];
const MAMRE = [
  { id: 'oak1', type: 'oak', x: 13, y: 12 }, { id: 'oak2', type: 'oak', x: 26, y: 12 }, { id: 'oak3', type: 'oak', x: 16, y: 21 },
  { id: 'fire', type: 'fire', x: 21, y: 17 },
  ...SPOTS.map(s => ({ ...s, type: 'flatstones', label: 'lie back and count the stars', onUse: useSpot })),
];

// -------------------------------------------------------------------- scenes

const lotGone = g => {
  if (g.state.lotGone) return;
  g.state.lotGone = true;
  for (const id of ['lot', 'lotsman', 'goat2', 'sheep2']) g.hide(id);
  LOTS_CAMP.forEach(o => g.removeProp(o.id));
};
const addCairns = g => {
  if (g.state.cairns) return;
  g.state.cairns = true;
  CAIRNS.forEach(c => g.addProp({ ...c, type: 'rock', label: `look out to the ${c.id}`, onUse: useCairn }));
};
const toMamre = g => {
  if (g.state.mamre) return;
  g.state.mamre = true;
  lotGone(g);
  addCairns(g);
  for (const id of ['well', 'trough', 'lookout', 'altar', 'bethel', 'ai', ...CAIRNS.map(c => c.id)]) g.removeProp(id);
  MAMRE.forEach(o => g.addProp(o));
  g.addProp({ id: 'altar2', type: 'altar', x: 10, y: 13 });
  g.place('abram', 12, 15, 'down');
  g.place('abramsman', 9, 18, 'right');
};
const nightfall = g => {
  if (g.state.night) return;
  toMamre(g);
  g.state.night = true;
  g.sky({ night: true, stars: true });
  g.show('teller');
  g.show('shepboy');
  g.setChat('abram', 'abram_night');
};

export const steps = [
  {
    id: 'quarrel',
    goal: 'Find out why the herdsmen are shouting: 0 of 2', marker: 'lotsman',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { signal: 'quarrel' },
    async run(g) {
      await g.say('discord');
      g.place('abram', 14, 15, 'right');
      g.place('lot', 23, 15, 'left');
      await g.pan(18, 15, 700);
      await g.say('kinsmen');
      g.award('kinsmen');
      await g.follow(600);
      g.walk('lot', [[30, 14]], 120);
    },
  },
  {
    id: 'choose', spawn: [18, 16],
    enter(g) { g.place('lot', 30, 14, 'right'); g.place('abram', 14, 15, 'right'); },
    goal: 'Go with Lot to the lookout, and see what he sees.', marker: 'lot',
    trigger: { zone: [28, 12, 32, 16] },
    async run(g) {
      g.face('player', 'right');
      await g.pan(36, 14, 900);
      await g.say('lot_looks');
      g.award('garden');
      await g.follow(600);
      await g.say('parted');
      for (const [id, path] of [['lot', [[30, 20], [37, 20]]], ['lotsman', [[21, 20], [37, 20]]], ['goat2', [[30, 20], [37, 21]]], ['sheep2', [[30, 20], [37, 19]]]]) {
        g.walk(id, path, 120).then(() => g.hide(id));
      }
      await g.wait(2600);
      lotGone(g);
      g.place('abram', 14, 17, 'right');
    },
  },
  {
    id: 'look', spawn: [20, 16],
    enter(g) { lotGone(g); g.place('abram', 14, 17, 'right'); },
    async intro(g) {
      const light = g.fx('glow', 14 * g.T, 14 * g.T).setScale(3).setAlpha(0);
      await g.tween({ targets: light, alpha: 1, duration: 1400 });
      await g.say('lift_eyes');
      g.award('lookup');
      await g.tween({ targets: light, alpha: 0, duration: 900 });
      light.destroy();
      addCairns(g);
    },
    goal: 'Look north, south, east and west: 0 of 4',
    trigger: { signal: 'look' },
    async run(g) {
      await g.say('dust');
      g.award('dust');
      await g.fadeOut(900);
      await g.say('to_mamre');
      toMamre(g);
      g.place('player', 14, 16, 'up');
      await g.fadeIn(900);
    },
  },
  {
    id: 'night', spawn: [14, 16],
    enter(g) { nightfall(g); },
    async intro(g) {
      await g.say('after');
      await g.say('shield');
      g.award('shield');
      await g.say('heir');
    },
    goal: 'Try to count the stars: 0 of 3',
    trigger: { signal: 'night' },
    async run(g) {
      await g.say('so_shall');
      g.award('stars');
      await g.say('believed');
      g.award('believed');
    },
  },
  {
    id: 'farewell', spawn: [14, 16],
    enter(g) { nightfall(g); },
    goal: 'Talk to Abram when you are ready to go.', marker: 'abram',
    trigger: { talk: 'abram' },
    async run(g) {
      await g.say('farewell');
      await g.fadeOut(900);
      g.sky();
    },
  },
];
