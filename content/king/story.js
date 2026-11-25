// King at Last (2 Samuel 2:1-4 and 5:1-5): where everything is, and what
// happens when. The words people say are in dialogue.csv.

import { ANIMAL_HEADROOM } from '../../src/art.js';
import { GRAY, WHITE, robe, discover, makeMap } from '../../src/storykit.js';

export const id = 'king';
export const title = 'King at Last';
export const where = 'Hebron, many years later';
export const ref = '2 Samuel 2 and 5';
export const after = 'cave';
export const place = [35.10, 31.53];   // Hebron, as [longitude, latitude], for the map

// ----------------------------------------------------------------------- map
// Hebron's gathering place is in the middle, with a road in from each side.
//   #  cliff    h  hillside    .  grass    ,  road    :  the gathering place

export const map = makeMap((x, y) => {
  if (x < 2 || x > 37 || y < 2 || y > 26) return '#';
  if (y <= 3) return 'h';
  if ((x === 19 || x === 20) && (y <= 7 || y >= 21)) return ',';
  if (y === 14 && (x <= 11 || x >= 28)) return ',';
  if (x >= 12 && x <= 27 && y >= 8 && y <= 20) return ':';
  return '.';
});

export const start = [19, 24];
export const door = [22, 25];
export const barriers = [];

// -------------------------------------------------------------------- people

// The elders of four tribes wait at the four roads. Each follows whoever
// greets him, and David gives them their places.
const TRIBES = [
  { id: 'benjamin', name: 'an elder of Benjamin', at: [19, 4] },
  { id: 'asher', name: 'an elder of Asher', at: [4, 14] },
  { id: 'zebulun', name: 'an elder of Zebulun', at: [35, 14] },
  { id: 'reuben', name: 'an elder of Reuben', at: [30, 22] },
];
const SEATS = [[16, 11], [23, 11], [16, 15], [23, 15]];
const CROWD = [[14, 19], [17, 19], [20, 19], [22, 19]];
const gather = g => (g.state.gather ||= { following: [], seated: [] });
const gatherGoal = g => `Welcome the elders at the four roads and bring them to David: ${gather(g).seated.length} of 4`;

const useElder = tribe => async g => {
  const t = gather(g);
  if (g.stepId !== 'tribes' || t.following.includes(tribe.id) || t.seated.includes(tribe.id)) return g.say('elder_idle');
  await g.say(`tribe_${tribe.id}`);
  g.trail(tribe.id, t.following.length ? t.following[t.following.length - 1] : true);
  t.following.push(tribe.id);
  g.goal(gatherGoal(g), 'david');
};

function useDavid(g) {
  const t = gather(g);
  if (g.stepId !== 'tribes' || !t.following.length) return g.say('david_idle');
  for (const elder of t.following) {
    g.trail(elder, false);
    g.walk(elder, [SEATS[t.seated.length]], 130).then(() => g.face(elder, t.seated.indexOf(elder) % 2 ? 'left' : 'right'));
    t.seated.push(elder);
  }
  t.following = [];
  if (t.seated.length >= TRIBES.length) return g.signal('tribes');
  g.note(g.text('seated'));
  g.goal(gatherGoal(g));
}

// Side task: three days of feasting need a lot of carrying.
const feast = g => (g.state.feast ||= { on: false, carrying: false, set: 0 });

async function useCook(g) {
  const f = feast(g);
  if (g.found('joy') || f.set >= 3) return g.say('cook_done');
  if (f.on) return g.say('cook_remind');
  f.on = true;
  await g.say('cook_ask');
  g.task('Carry three loads from the donkeys to the table: 0 of 3');
}

function useDonkey(g) {
  const f = feast(g);
  if (!f.on || f.carrying || f.set >= 3) return g.note(g.text('load_none'));
  f.carrying = true;
  g.hold('bundle');
  g.note(g.text('load_take'));
}

async function useTable(g) {
  const f = feast(g);
  if (!f.carrying) return g.note(g.text('table_none'));
  f.carrying = false;
  f.set++;
  g.hold(null);
  g.note(g.text('load_set'));
  if (f.set < 3) return g.task(`Carry three loads from the donkeys to the table: ${f.set} of 3`);
  g.task(null);
  await g.say('disc_joy');
  g.award('joy');
}

const elderLook = (over = {}) => robe({ top: '#9a9a8a', hair: GRAY, beard: GRAY, head: 'cloth', headColor: '#e9e2cf', ...over });
const TOPS = ['#8a7a9a', '#7f8f6a', '#a85a4a', '#b08a3a'];

export const actors = [
  {
    id: 'david', name: 'David', at: [19, 12], onUse: useDavid,
    look: robe({ hair: '#7a3b22', hairStyle: 'curly', beard: true, top: '#8a3a3a', sash: '#e3b93a', head: 'band', headColor: '#e3b93a' }),
  },
  { id: 'elder', name: 'an elder of Israel', at: [21, 12], dir: 'left', chat: 'elder_idle', look: elderLook({ hair: WHITE, beard: WHITE, top: '#6f7f9a' }) },
  ...TRIBES.map((tribe, i) => ({ ...tribe, onUse: useElder(tribe), look: elderLook({ top: TOPS[i] }) })),
  ...CROWD.map((at, i) => ({ id: `crowd${i}`, name: 'one of the crowd', at, dir: 'up', chat: 'crowd_idle', look: robe({ top: TOPS[(i + 1) % 4], beard: i % 2 === 0 }) })),
  { id: 'cook', name: 'the cook', at: [8, 18], dir: 'right', onUse: useCook, look: robe({ top: '#9a8a6a', head: 'cloth', headColor: '#c9b48a' }) },
  ...[[6, 19], [7, 20]].map((at, i) => ({
    id: `donkey${i}`, name: 'a donkey', label: 'unload the donkey', at, dir: 'right', scale: 1.3, solid: false,
    look: { kind: 'donkey' }, headroom: ANIMAL_HEADROOM, onUse: useDonkey,
  })),
  { id: 'scribe', name: 'a scribe', at: [26, 12], dir: 'left', onUse: discover('disc_thirty', 'thirty'), look: robe({ top: '#d8c7a0', sash: '#3d4a63' }) },
  { id: 'oldman', name: 'a very old man', at: [14, 17], onUse: discover('disc_heart', 'heart'), look: robe({ top: '#8f7a5c', hair: WHITE, beard: WHITE, item: 'staff' }) },
];

// -------------------------------------------------------------------- things

export const objects = [
  { type: 'throne', x: 19, y: 11 },
  { type: 'banner', x: 13, y: 9, label: 'look at the banner', onUse: discover('disc_greater', 'greater') },
  { type: 'banner', x: 26, y: 9 }, { type: 'banner', x: 13, y: 20 }, { type: 'banner', x: 26, y: 20 },
  { type: 'rack', x: 10, y: 8, label: 'look at the bow', onUse: discover('disc_brother', 'brother') },
  { id: 'feasttable', type: 'table', x: 24, y: 17, label: 'set it on the table', onUse: useTable },
  { type: 'jars', x: 9, y: 17 },
  { type: 'tent', x: 4, y: 9 }, { type: 'tent', x: 8, y: 6 }, { type: 'tent', x: 30, y: 7 }, { type: 'tent', x: 34, y: 10 },
  { type: 'tent', x: 3, y: 21 }, { type: 'tent', x: 33, y: 19 }, { type: 'tent', x: 10, y: 24 }, { type: 'tent', x: 27, y: 25 },
  { type: 'tree', x: 2, y: 6 }, { type: 'tree', x: 37, y: 6 }, { type: 'tree', x: 2, y: 25 }, { type: 'tree', x: 36, y: 25 }, { type: 'tree', x: 14, y: 23 },
];

// -------------------------------------------------------------------- scenes

const seatAll = g => {
  const t = gather(g);
  t.following = [];
  t.seated = TRIBES.map(tribe => tribe.id);
  TRIBES.forEach((tribe, i) => { g.trail(tribe.id, false); g.place(tribe.id, ...SEATS[i], i % 2 ? 'left' : 'right'); });
};

// Three things the traveler saw in earlier stories. A wrong answer just means trying again.
async function testimony(g) {
  for (const question of ['q1', 'q2', 'q3']) {
    while (!(await g.choose(question))) await g.say('q_wrong');
  }
}

export const steps = [
  {
    id: 'arrive',
    goal: 'Find David.', marker: 'david',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'david' },
    async run(g) {
      await g.say('hebron');
      g.award('hebron');
    },
  },
  {
    id: 'tribes', spawn: [19, 14],
    goal: 'Welcome the elders at the four roads and bring them to David: 0 of 4',
    trigger: { signal: 'tribes' },
    async run(g) {
      await Promise.all(TRIBES.map(tribe => g.arrive(tribe.id)));
      await g.say('tribes');
      g.award('tribes');
    },
  },
  {
    id: 'witness', spawn: [19, 14],
    goal: 'Talk to the elder beside David.', marker: 'elder',
    enter(g) { seatAll(g); },
    trigger: { talk: 'elder' },
    async run(g) {
      await g.say('witness_ask');
      await testimony(g);
      await g.say('witness');
      g.award('witness');

      // The anointing.
      const david = g.actor('david');
      await g.say('anoint');
      const glow = g.fx('glow', david.x, david.y - 30).setAlpha(0).setScale(0.6);
      await g.tween({ targets: glow, alpha: 1, scale: 1.4, duration: 800 });
      g.setLook('david', { head: 'crown' });
      await g.tween({ targets: glow, alpha: 0, duration: 800 });
      glow.destroy();
      for (const one of [...CROWD.map((at, i) => `crowd${i}`), ...TRIBES.map(tribe => tribe.id)]) {
        g.tween({ targets: g.actor(one).sprite, scaleY: 1.15, duration: 200, yoyo: true, repeat: 5 });
      }
      await g.say('crowned');
      g.award('king');
    },
  },
  {
    id: 'farewell', spawn: [19, 14],
    goal: 'Talk to King David when you are ready to go.', marker: 'david',
    enter(g) { seatAll(g); g.setLook('david', { head: 'crown' }); },
    trigger: { talk: 'david' },
    async run(g) {
      await g.say('farewell');
      g.award('shepherdking');
      await g.say('home');
      await g.fadeOut(900);
    },
  },
];
