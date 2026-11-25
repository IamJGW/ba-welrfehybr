// The Cave at En Gedi (1 Samuel 24): where everything is, and what happens
// when. The words people say are in dialogue.csv.

import { ANIMAL_HEADROOM } from '../../src/art.js';
import { robe, soldier, discover, makeMap } from '../../src/storykit.js';

export const id = 'cave';
export const title = 'The Cave at En Gedi';
export const where = 'The wilderness of En Gedi';
export const ref = '1 Samuel 24';
export const after = 'covenant';
export const place = [35.39, 31.46];   // En Gedi, as [longitude, latitude], for the map

// ----------------------------------------------------------------------- map
// A dry canyon. The spring is at the bottom, the cave is in the cliff at the
// top, and soldiers walk back and forth across the slope between.
//   #  cliff    s  bare rock    x  brush to hide in    ~  the spring    c  the cave floor

// Clumps of brush, each two tiles wide: [x, y] of the left tile.
const BRUSH = [[8, 24], [10, 21], [22, 21], [16, 17], [28, 17], [8, 13], [20, 13], [14, 9], [26, 9], [19, 8]];

export const map = makeMap((x, y) => {
  if (x < 2 || x > 37 || y < 1 || y > 26) return '#';
  if (y <= 7) {
    if (y >= 2 && y <= 6 && x >= 12 && x <= 27) return 'c';
    if (y === 7 && (x === 19 || x === 20)) return 'c';
    return '#';
  }
  if (y <= 21 && (x <= 4 || x >= 35)) return '#';
  if (x >= 30 && x <= 34 && y >= 23 && y <= 25) return '~';
  if (BRUSH.some(([bx, by]) => y === by && (x === bx || x === bx + 1))) return 'x';
  return 's';
});

export const start = [6, 25];
export const door = [3, 25];
export const barriers = [];

// The three lanes the soldiers walk.
const LANES = { guard1: [[7, 19], [32, 19]], guard2: [[32, 15], [7, 15]], guard3: [[7, 11], [32, 11]] };
const GUARDS = Object.keys(LANES);

// -------------------------------------------------------------------- people

// Side task: carry water from the spring up to David's men.
const water = g => (g.state.water ||= { stage: 'none' });

async function useScout(g) {
  const w = water(g);
  if (g.found('spring') || w.stage === 'done') return g.say('scout_idle');
  if (w.stage !== 'none') return g.say('water_remind');
  await g.say('water_ask');
  w.stage = 'fetch';
  g.task('Fill the skin at the spring');
}

function useSpring(g) {
  const w = water(g);
  if (w.stage !== 'fetch') return g.note(g.text('water_none'));
  w.stage = 'carry';
  g.hold('skin');
  g.note(g.text('water_fill'));
  g.task('Carry the water up to the men in the cave');
}

// One of David's men takes the water. After the meeting with Saul he has a story to tell.
async function useThirsty(g) {
  const w = water(g);
  if (w.stage === 'carry') {
    w.stage = 'done';
    g.hold(null);
    g.task(null);
    await g.say('disc_spring');
    return g.award('spring');
  }
  if (g.stepId === 'farewell') { await g.say('disc_flea'); return g.award('flea'); }
  return g.say('man_idle');
}

const man = (over = {}) => robe({ beard: true, head: 'band', headColor: '#5d4526', ...over });

export const actors = [
  {
    id: 'david', name: 'David', at: [19, 3], chat: 'david_idle',
    look: robe({ hair: '#7a3b22', hairStyle: 'curly', beard: true, top: '#b59a6e', sash: '#5d4526', armor: '#8a6b45' }),
  },
  {
    id: 'saul', name: 'King Saul', at: [20, 12], scale: 1.1, hidden: true, solid: false,
    look: robe({ top: '#6b3fa0', sash: '#e3b93a', head: 'crown', beard: true }),
  },
  { id: 'scout', name: "David's scout", at: [9, 24], dir: 'left', onUse: useScout, look: man({ top: '#8f7a5c' }) },
  { id: 'man1', name: "one of David's men", at: [16, 3], onUse: useThirsty, look: man({ skin: '#a06a42' }) },
  { id: 'man2', name: "one of David's men", at: [23, 3], onUse: discover('disc_fourhundred', 'fourhundred'), look: man({ top: '#7d6a55' }) },
  { id: 'man3', name: "one of David's men", at: [14, 5], dir: 'right', chat: 'man_idle', look: man({ top: '#9a7a5a', beard: false }) },
  ...GUARDS.map(n => ({ id: n, name: 'a soldier', at: LANES[n][0], solid: false, watch: true, look: soldier() })),
  {
    id: 'ibex', name: 'a wild goat', label: 'look at the wild goat', at: [33, 9], dir: 'left', scale: 0.9, solid: false,
    look: { kind: 'ibex' }, headroom: ANIMAL_HEADROOM, onUse: discover('disc_goats', 'goats'),
  },
];

// -------------------------------------------------------------------- things

export const objects = [
  { type: 'harp', x: 25, y: 3, label: 'look at the harp', onUse: discover('disc_psalm', 'psalm') },
  { type: 'rock', x: 13, y: 2 }, { type: 'rock', x: 26, y: 6 },
  { id: 'spring', type: 'palm', x: 29, y: 24, label: 'kneel at the spring', onUse: useSpring },
  { type: 'palm', x: 35, y: 23 }, { type: 'palm', x: 32, y: 22 },
  { type: 'rock', x: 12, y: 23 }, { type: 'rock', x: 18, y: 25 }, { type: 'rock', x: 24, y: 23 },
  { type: 'rock', x: 12, y: 16 }, { type: 'rock', x: 24, y: 18 }, { type: 'rock', x: 30, y: 12 }, { type: 'rock', x: 11, y: 10 },
];

// -------------------------------------------------------------------- scenes

const startPatrols = g => GUARDS.forEach(n => { g.show(n); g.patrol(n, LANES[n]); });
const sendGuardsAway = g => GUARDS.forEach(n => { g.patrol(n, null); g.hide(n); });

export const steps = [
  {
    id: 'scout',
    goal: 'Talk to the man hiding in the brush.', marker: 'scout',
    enter(g) { startPatrols(g); },
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'scout' },
    async run(g) {
      await g.say('scout');
      g.award('hunt');
    },
  },
  {
    id: 'sneak', spawn: [8, 25],
    goal: 'Sneak up to the cave. Soldiers cannot see you in the brush.',
    enter(g) { g.sneak('spotted', [8, 24]); },
    trigger: { zone: [19, 6, 20, 7] },
    async run(g) {
      g.sneak(null);
      g.note(g.text('inside'));
    },
  },
  {
    id: 'back', spawn: [19, 6],
    goal: 'Go to David at the back of the cave.', marker: 'david',
    enter(g) { g.sneak(null); },
    trigger: { talk: 'david' },
    async run(g) {
      g.face('david', 'down');
      await g.say('quiet');
      g.show('saul');
      g.place('saul', 20, 10, 'up');
      await g.walk('saul', [[20, 7], [20, 6]], 80);
      g.face('saul', 'down');
      await g.say('saul_enters');
      await g.say('men');
      await g.walk('david', [[20, 4], [20, 5]], 40);
      await g.say('cut');
      g.award('robe');
      await g.walk('david', [[19, 3]], 60);
      g.face('david', 'down');
      await g.say('forbid');
      g.award('anointed');
      await g.walk('saul', [[20, 7], [20, 11]], 80);
      await g.say('saul_leaves');
    },
  },
  {
    id: 'call', spawn: [19, 5],
    goal: 'Follow David out of the cave.', marker: 'david',
    enter(g) {
      g.sneak(null);
      sendGuardsAway(g);
      g.show('saul');
      g.place('saul', 20, 12, 'down');
      g.place('david', 19, 3, 'down');
    },
    begin(g) { g.walk('david', [[19, 6], [19, 8]], 110); },
    trigger: { zone: [16, 8, 23, 10] },
    async run(g) {
      await g.arrive('david');
      g.face('david', 'down');
      await g.say('call');
      g.face('saul', 'up');
      await g.tween({ targets: g.actor('david').sprite, angle: 80, duration: 320, yoyo: true });
      g.actor('david').sprite.setAngle(0);
      await g.say('plea');
      g.award('mercy');
      await g.say('weeps');
      g.award('king');
      g.walk('saul', [[20, 20]], 90).then(() => g.hide('saul'));
      await g.say('parted');
    },
  },
  {
    id: 'farewell', spawn: [20, 9],
    goal: 'Talk to David when you are ready to go.', marker: 'david',
    enter(g) {
      g.sneak(null);
      sendGuardsAway(g);
      g.hide('saul');
      g.place('david', 19, 8, 'down');
    },
    trigger: { talk: 'david' },
    async run(g) {
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
