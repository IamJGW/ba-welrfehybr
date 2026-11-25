// The Walls of Jericho (Joshua 5:13-6:27): the Commander of the LORD's army, six
// silent marches around the city, the seventh day, the shout, and Rahab brought
// out safe. There is a note for parents. The words are in dialogue.csv.

import { robe, lady, discover, makeMap, soldier } from '../../src/storykit.js';

export const id = 'walls';
export const title = 'The Walls of Jericho';
export const where = 'Outside the city of Jericho';
export const ref = 'Joshua 5:13-6:27';
export const place = [35.444, 31.87];   // Jericho
export const after = 'jordan';

// ----------------------------------------------------------------------- map
// The city in the middle, a path around it, and the camp to the south.
//   .  grass    ,  path    #  cliff

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
export const map = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (x === 8 && y >= 3 && y <= 17 || x === 32 && y >= 3 && y <= 17 || y === 3 && x >= 8 && x <= 32 || y === 17 && x >= 8 && x <= 32) return ',';
  if (x === 20 && y >= 17 && y <= 22) return ',';
  return '.';
});

export const start = [5, 22];
export const door = [3, 23];
export const barriers = [];

// -------------------------------------------------------------------- the march

// The corners of the walk around the city, in order.
const CORNERS = [[8, 17], [8, 3], [32, 3], [32, 17], [20, 19]];
async function marching(g, signal, laps) {
  let at = 0;
  g.state.lap = g.state.lap || 0;
  while (g.stepId === signal.step) {
    await g.wait(150);
    const p = g.player;
    const [cx, cy] = CORNERS[at];
    if (Math.hypot(p.x - (cx * g.T + 16), p.y - (cy * g.T + 26)) < 56) {
      at++;
      if (at >= CORNERS.length) return g.signal(signal.name);
      g.goal(`Follow the ark in silence around Jericho: ${at} of ${CORNERS.length - 1}`, null);
    }
  }
}

// The procession walks the circuit ahead of the player.
function procession(g) {
  const route = CORNERS.map(([x, y]) => [x, y]);
  g.walk('priest1', route, 62); g.walk('priest2', route, 62); g.walk('priest3', route, 62);
  g.walk('ark', route, 62);
  g.walk('soldier1', route, 66); g.walk('soldier2', route, 66);
}

// -------------------------------------------------------------------- people

const israelite = (over = {}) => robe({ top: '#a9845a', ...over });
const horn = over => robe({ top: '#f1ede0', sash: '#3d6fb5', beard: true, head: 'cloth', headColor: '#e8e0cc', item: 'trumpet', ...over });

export const actors = [
  { id: 'joshua', name: 'Joshua', at: [20, 20], dir: 'up', onUse: g => (g.stepId === 'shout' ? shoutNow(g) : g.say('joshua_idle')), look: soldier({ top: '#a9845a', head: 'band', headColor: '#7a2e2e' }) },
  { id: 'commander', name: 'a man with a sword', at: [20, 15], dir: 'down', hidden: true, chat: 'commander_idle', look: robe({ top: '#f8f4e8', sash: '#e3b93a', hair: '#e8d8a0', beard: false, head: 'band', headColor: '#e3b93a', item: 'spear' }) },
  { id: 'priest1', name: 'a priest', at: [8, 22], dir: 'right', hidden: true, solid: false, look: horn() },
  { id: 'priest2', name: 'a priest', at: [9, 23], dir: 'right', hidden: true, solid: false, look: horn({ top: '#e8e4d0' }) },
  { id: 'priest3', name: 'a priest', at: [10, 22], dir: 'right', hidden: true, solid: false, look: horn({ top: '#dcd4bc' }) },
  { id: 'ark', name: 'a priest with the ark', at: [11, 23], dir: 'right', hidden: true, solid: false, look: robe({ top: '#f1ede0', sash: '#3d6fb5', beard: true, head: 'cloth', headColor: '#e8e0cc', item: 'ark' }) },
  { id: 'soldier1', name: 'a soldier', at: [7, 20], dir: 'right', hidden: true, solid: false, look: soldier({ top: '#a9845a' }) },
  { id: 'soldier2', name: 'a soldier', at: [7, 24], dir: 'right', hidden: true, solid: false, look: soldier({ top: '#8a6a3a' }) },
  { id: 'rahab', name: 'Rahab', at: [14, 13], dir: 'down', hidden: true, chat: 'rahab_idle', look: lady('#c0415a', { skin: '#c98f62', hair: '#2a211c' }) },
  { id: 'family', name: "Rahab's father", at: [15, 14], dir: 'down', hidden: true, onUse: discover('disc_father', 'whole_family'), look: robe({ top: '#7a5a3a', skin: '#a06a42', hair: '#cfcfcf', beard: '#cfcfcf' }) },
  { id: 'watcher', name: 'a man on the wall', at: [19, 9], dir: 'down', onUse: discover('disc_watcher', 'shut_up'), look: robe({ top: '#7a3a3a', skin: '#a06a42', head: 'helmet', item: 'spear' }) },
  { id: 'camper', name: 'a woman in the camp', at: [13, 21], dir: 'right', onUse: discover('disc_camper', 'silent'), look: lady('#6b8a4f', { hair: '#2a211c' }) },
  { id: 'boy', name: 'a boy', at: [24, 21], dir: 'left', scale: 0.8, onUse: discover('disc_boy', 'seven_horns'), look: israelite({ top: '#d9b45a' }) },
];

// -------------------------------------------------------------------- things

export const objects = [
  { id: 'gate', type: 'gatehouse', x: 17, y: 12 },
  { id: 'wall1', type: 'citywall', x: 12, y: 12 }, { id: 'wall2', type: 'citywall', x: 25, y: 12 }, { id: 'wall3', type: 'citywall', x: 12, y: 6 }, { id: 'wall4', type: 'citywall', x: 25, y: 6 },
  { id: 'wall5', type: 'citywall', x: 16, y: 6 }, { id: 'wall6', type: 'citywall', x: 21, y: 6 },
  { type: 'house', x: 17, y: 9 }, { type: 'house', x: 22, y: 8 },
  { type: 'tent', x: 12, y: 19 }, { type: 'tent', x: 14, y: 22 }, { type: 'ptent', x: 22, y: 22 }, { type: 'tent', x: 26, y: 20 },
  { type: 'palm', x: 4, y: 12 }, { type: 'palm', x: 35, y: 10 }, { type: 'palm', x: 36, y: 20 }, { type: 'rock', x: 4, y: 6 }, { type: 'rock', x: 35, y: 5 },
];
const WALLS = ['gate', 'wall1', 'wall2', 'wall3', 'wall4', 'wall5', 'wall6'];

// The horn blows only after a wait; shouting before it is too soon.
const horn_ = { blown: false };
function shoutNow(g) {
  if (!horn_.blown) return g.note(g.text('too_soon'), 2400);
  g.signal('shout');
}
async function waitForHorn(g) {
  horn_.blown = false;
  await g.wait(3500);
  if (g.stepId !== 'shout') return;
  horn_.blown = true;
  g.flash(250);
  g.note(g.text('horn_note'), 6000);
}

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'commander',
    goal: 'Talk to Joshua.', marker: 'joshua',
    async intro(g) { g.hide('rahab'); g.hide('family'); await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'joshua' },
    async run(g) {
      await g.say('joshua');
      g.show('commander');
      g.place('commander', 20, 15, 'down');
      await g.pan(20, 15, 800);
      await g.say('are_you_for_us');
      g.award('for_us');
      await g.say('neither');
      g.award('commander');
      await g.say('sandals');
      g.award('holy_ground');
      g.hide('commander');
      await g.follow(700);
    },
  },
  {
    id: 'plan', spawn: [20, 19],
    goal: 'Talk to Joshua again.', marker: 'joshua',
    trigger: { talk: 'joshua' },
    async run(g) {
      await g.say('shut_up');
      g.award('tightly_shut');
      await g.say('delivered');
      g.award('delivered');
      await g.say('march_plan');
      g.award('six_days');
      g.award('seven_horns');
      await g.say('mighty_shout');
      g.award('mighty_shout');
      await g.say('silence');
      g.award('no_word');
    },
  },
  {
    id: 'march', spawn: [8, 18],
    begin(g) {
      for (const id of ['priest1', 'priest2', 'priest3', 'ark', 'soldier1', 'soldier2']) g.show(id);
      for (const [id, x, y] of [['soldier1', 8, 19], ['soldier2', 9, 20], ['priest1', 8, 21], ['priest2', 9, 22], ['priest3', 8, 23], ['ark', 9, 24]]) g.place(id, x, y, 'up');
      procession(g);
      marching(g, { step: 'march', name: 'march' }, 1);
    },
    goal: 'Follow the ark in silence around Jericho: 0 of 4', marker: null,
    solve: ['go:8,17', 'go:8,3', 'go:32,3', 'go:32,17', 'go:20,19'],
    trigger: { signal: 'march' },
    async intro(g) { g.place('player', 6, 19, 'up'); await g.say('first_march'); },
    async run(g) {
      for (const id of ['priest1', 'priest2', 'priest3', 'ark', 'soldier1', 'soldier2']) { g.hide(id); }
      await g.say('camp_night');
      g.award('first_circle');
      g.award('spent_night');
      await g.say('six_days_pass');
      g.award('six_days_done');
      g.award('dawn');
    },
  },
  {
    id: 'shout', spawn: [20, 19],
    begin(g) { waitForHorn(g); },
    goal: 'Wait in silence. When you hear the long blast, shout!', marker: 'joshua',
    solve: ['wait:5000', 'joshua'],
    trigger: { signal: 'shout' },
    async intro(g) {
      g.sky({});
      await g.say('seventh_day');
      g.award('seventh');
      await g.say('only_day');
      g.award('only_day');
    },
    async run(g) {
      g.flash(300); g.shake(900, 0.006);
      await g.say('shout');
      g.award('shout');
      await g.say('collapse');
      g.award('collapsed');
      for (const id of WALLS) g.removeProp(id);
      g.shake(1500, 0.01);
      await g.wait(900);
      await g.say('dust');
    },
  },
  {
    id: 'rahab', spawn: [20, 19],
    enter(g) { for (const id of WALLS) g.removeProp(id); },
    begin(g) { g.show('rahab'); g.show('family'); g.place('rahab', 20, 14, 'down'); g.place('family', 22, 15, 'down'); },
    goal: 'Talk to Rahab, who has been brought out of the city.', marker: 'rahab',
    trigger: { talk: 'rahab' },
    async intro(g) {
      g.show('rahab'); g.show('family'); g.place('rahab', 20, 14, 'down'); g.place('family', 22, 15, 'down');
      await g.say('rahab_out');
      g.award('brought_out');
      g.award('whole_family');
    },
    async run(g) {
      await g.say('rahab_thanks');
      g.award('spared');
      await g.say('spared');
      g.award('lives_among');
      await g.say('by_faith');
      g.award('by_faith');
      await g.say('fame');
      g.award('fame');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
