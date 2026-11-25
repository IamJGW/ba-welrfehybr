// Water from the Rock (Exodus 17): no water at Rephidim, the rock at Horeb, and
// the battle with the Amalekites while Aaron and Hur hold up Moses' hands. The
// words are in dialogue.csv.

import { robe, lady, discover, makeMap, soldier, job, trips } from '../../src/storykit.js';

export const id = 'rock';
export const title = 'Water from the Rock';
export const where = 'Rephidim, near Horeb';
export const ref = 'Exodus 17';
export const place = [33.97, 28.4];   // near Horeb
export const after = 'manna';

// ----------------------------------------------------------------------- map
//   s  desert    h  hillside    ~  water    ,  path    #  cliff

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
const ground = wet => makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (wet && (x >= 18 && x <= 19 && y >= 10 && y <= 13 || y === 14 && x >= 12 && x <= 19)) return '~';
  if (x >= 26 && y <= 9) return 'h';
  if (y === 20 && x > 3 && x < 30) return ',';
  return 's';
});
export const map = ground(false);
const WET = ground(true);

export const start = [5, 22];
export const door = [3, 23];
export const barriers = [];

// -------------------------------------------------------------------- the water

const fetch = job('water', { step: 'fill', total: 4, goal: 'Carry water to the thirsty people', target: 'trough', hold: 'jar', reuse: true });

// -------------------------------------------------------------------- the battle

const NEED = 7000;   // milliseconds of steady hands
const HOLD = 64;     // how close to Moses counts as holding his hand (pixels)
const FOES = [['amal1', 15, 17], ['amal2', 15, 19], ['amal3', 15, 21]];
const FRIENDS = [['joshua', 11, 18], ['israel1', 11, 20], ['israel2', 11, 22]];

async function holdHands(g) {
  let last = [g.player.x, g.player.y], steady = 0, shown = -1;
  const moses = g.actor('moses');
  while (g.stepId === 'battle') {
    await g.wait(150);
    const p = g.player;
    const moved = Math.hypot(p.x - last[0], p.y - last[1]) > 3;
    last = [p.x, p.y];
    const near = Math.hypot(p.x - moses.x, p.y - moses.y) < HOLD;
    if (near && !moved) steady = Math.min(NEED, steady + 150); else steady = Math.max(0, steady - 200);
    const part = steady / NEED;
    // The Amalekites are pushed back while Moses' hands are up, and win ground when they drop.
    const push = Math.round(part * 12);
    if (push !== shown) {
      shown = push;
      FOES.forEach(([id, x, y]) => g.place(id, x + push, y, 'left'));
      FRIENDS.forEach(([id, x, y]) => g.place(id, x + Math.round(part * 6), y, 'right'));
    }
    g.goal(near ? (moved ? 'Stand still beside Moses and hold up his hand' : `Hold Moses' hand up: ${Math.ceil((NEED - steady) / 1000)}`) : "Stand beside Moses and hold up his hand", null);
    if (steady >= NEED) return g.signal('battle');
  }
}

// -------------------------------------------------------------------- people

const israelite = (over = {}) => robe({ top: '#a9845a', ...over });
const amalekite = (id, name, at) => ({ id, name, at, dir: 'left', hidden: true, solid: false, look: soldier({ top: '#6a3a3a', skin: '#a06a42', head: 'plume', headColor: '#2a211c' }) });

export const actors = [
  { id: 'moses', name: 'Moses', at: [16, 12], dir: 'down', chat: 'moses_idle', look: robe({ top: '#a9845a', sash: '#5d4526', hair: '#d8d8d8', beard: '#d8d8d8', head: 'cloth', headColor: '#e8e0cc', item: 'staff' }) },
  { id: 'aaron', name: 'Aaron', at: [14, 12], dir: 'down', chat: 'aaron_idle', look: robe({ top: '#f1ede0', sash: '#3d6fb5', hair: '#cfcfcf', beard: '#cfcfcf', head: 'cloth', headColor: '#e8e0cc' }) },
  { id: 'hur', name: 'Hur', at: [20, 12], dir: 'down', onUse: discover('disc_hur', 'hur'), look: israelite({ top: '#4f8a6a', beard: true, head: 'cloth', headColor: '#e8e0cc' }) },
  { id: 'elder', name: 'a thirsty elder', at: [8, 16], dir: 'right', chat: 'elder_idle', look: israelite({ top: '#7d5a8a', hair: '#e8e8e8', beard: '#e8e8e8' }) },
  { id: 'mother', name: 'a mother', at: [6, 18], dir: 'right', onUse: discover('disc_mother', 'children'), look: lady('#6b8a4f', { hair: '#2a211c' }) },
  { id: 'shepherd', name: 'a shepherd', at: [9, 21], dir: 'right', onUse: discover('disc_shepherd', 'livestock'), look: israelite({ top: '#8a6a3a' }) },
  { id: 'joshua', name: 'Joshua', at: [11, 18], dir: 'right', hidden: true, chat: 'joshua_idle', look: soldier({ top: '#a9845a', head: 'band', headColor: '#7a2e2e' }) },
  { id: 'israel1', name: 'an Israelite soldier', at: [11, 20], dir: 'right', hidden: true, solid: false, look: soldier({ top: '#a9845a' }) },
  { id: 'israel2', name: 'an Israelite soldier', at: [11, 22], dir: 'right', hidden: true, solid: false, look: soldier({ top: '#8a6a3a' }) },
  amalekite('amal1', 'an Amalekite', [15, 17]), amalekite('amal2', 'an Amalekite', [15, 19]), amalekite('amal3', 'an Amalekite', [15, 21]),
];

// -------------------------------------------------------------------- things

export const objects = [
  { id: 'rock', type: 'bigrock', x: 17, y: 8 },
  { type: 'tent', x: 4, y: 13 }, { type: 'tent', x: 5, y: 17 }, { type: 'tent', x: 9, y: 12 }, { type: 'ptent', x: 8, y: 19 },
  { type: 'bigrock', x: 30, y: 12 }, { type: 'rock', x: 24, y: 16 }, { type: 'rock', x: 22, y: 22 }, { type: 'bigrock', x: 33, y: 20 },
  { id: 'trough', type: 'trough', x: 8, y: 14, label: 'pour the water into the trough', onUse: fetch.give },
  { id: 'jars', type: 'jars', x: 16, y: 15, item: 'a jar of water', label: 'fill a jar at the stream', onUse: fetch.take },
];

const army = ['joshua', 'israel1', 'israel2', 'amal1', 'amal2', 'amal3'];

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'thirst',
    goal: 'Talk to the thirsty elder, by the tents.', marker: 'elder',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'elder' },
    async run(g) {
      await g.say('thirst');
      g.award('no_water');
      await g.say('contend');
      g.award('give_us_water');
      await g.say('grumble');
      g.award('die_of_thirst');
    },
  },
  {
    id: 'moses', spawn: [10, 16],
    goal: 'Talk to Moses.', marker: 'moses',
    trigger: { talk: 'moses' },
    async run(g) {
      await g.say('cry');
      g.award('stone_me');
      await g.say('command');
      g.award('walk_ahead');
      await g.say('rock_promise');
      g.award('stand_before');
    },
  },
  {
    id: 'rock', spawn: [14, 14],
    goal: 'Follow Moses to the rock at Horeb.', marker: null,
    trigger: { zone: [15, 10, 20, 11] },
    async run(g) {
      g.place('moses', 17, 10, 'up');
      g.place('player', 16, 12, 'up');
      await g.say('strike');
      g.shake(250, 0.006);
      g.ground(WET, 1400);
      await g.wait(1000);
      await g.say('water_came');
      g.award('water_came');
      await g.say('massah');
      g.award('massah');
      await g.say('rock_christ');
      g.award('spiritual_rock');
      await g.say('living_water');
      g.award('living_water');
    },
  },
  {
    id: 'fill', spawn: [14, 15],
    enter(g) { g.ground(WET, 0); g.place('moses', 17, 10, 'up'); },
    goal: 'Carry water to the thirsty people: 0 of 4', marker: 'jars',
    solve: trips(['jars', 'jars', 'jars', 'jars'], 'trough'),
    trigger: { signal: 'fill' },
    async run(g) {
      await g.say('fill_done');
      g.award('drink');
    },
  },
  {
    id: 'battle', spawn: [20, 13],
    enter(g) { g.ground(WET, 0); },
    begin(g) {
      for (const id of army) g.show(id);
      FOES.forEach(([id, x, y]) => g.place(id, x, y, 'left'));
      FRIENDS.forEach(([id, x, y]) => g.place(id, x, y, 'right'));
      g.place('moses', 28, 8, 'down'); g.place('aaron', 26, 8, 'right'); g.place('hur', 30, 8, 'left');
      g.place('player', 29, 10, 'up');
      g.addProp({ id: 'seat', type: 'flatstones', x: 28, y: 8 });
      holdHands(g);
    },
    goal: "Stand beside Moses and hold up his hand", marker: null,
    solve: ['moses', 'wait:9000'],
    trigger: { signal: 'battle' },
    async intro(g) {
      g.place('moses', 28, 8, 'down'); g.place('aaron', 26, 8, 'right'); g.place('hur', 30, 8, 'left');
      g.place('player', 29, 10, 'up');
      for (const id of army) g.show(id);
      FOES.forEach(([id, x, y]) => g.place(id, x, y, 'left'));
      FRIENDS.forEach(([id, x, y]) => g.place(id, x, y, 'right'));
      await g.say('amalek');
      g.award('amalekites');
      await g.say('joshua');
      g.award('joshua');
      await g.say('hands');
      g.award('hands_up');
      g.award('hands_down');
    },
    async run(g) {
      await g.say('steady');
      g.award('stone');
      g.award('steady');
      await g.say('overwhelmed');
      g.award('overwhelmed');
      for (const id of army) g.hide(id);
    },
  },
  {
    id: 'altar', spawn: [29, 10],
    enter(g) { g.ground(WET, 0); for (const id of army) g.hide(id); g.place('moses', 28, 8, 'down'); g.place('aaron', 26, 8, 'right'); g.place('hur', 30, 8, 'left'); },
    goal: 'Talk to Moses, on the hilltop.', marker: 'moses',
    trigger: { talk: 'moses' },
    async run(g) {
      await g.say('scroll');
      g.award('scroll');
      await g.say('banner');
      g.award('banner');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
