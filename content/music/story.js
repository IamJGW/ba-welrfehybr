// Music for the King (1 Samuel 16:14-23): where everything is, and what
// happens when. The words people say are in dialogue.csv.

import { ANIMAL_HEADROOM } from '../../src/art.js';
import { GRAY, robe, discover, tell, makeMap } from '../../src/storykit.js';

export const id = 'music';
export const title = 'Music for the King';
export const where = "Gibeah, King Saul's home";
export const ref = '1 Samuel 16:14-23';
export const after = 'shepherd';
export const place = [35.232, 31.823];   // Gibeah, as [longitude, latitude], for the map

// ----------------------------------------------------------------------- map
// Jesse's farm at Bethlehem is on the west, King Saul's hall at Gibeah on the
// east, with a long road between.
//   #  cliff    h  hillside    .  grass    ,  road    :  the king's courtyard

export const map = makeMap((x, y) => {
  if (x < 2 || x > 37 || y < 2 || y > 26) return '#';
  if (y <= 4) return 'h';
  if (y === 14 && x >= 6 && x <= 31) return ',';
  if (x >= 27 && y >= 7 && y <= 20) return ':';
  return '.';
});

export const start = [30, 16];
export const door = [36, 19];
export const barriers = [];

// -------------------------------------------------------------------- people

// Loading the donkey: bread from the oven, wine from the store, and a young
// goat that does not want to be caught.
const load = g => (g.state.load ||= { carry: null, done: new Set(), bolts: 0, kid: 'loose' });
const KID_RUNS_TO = [[11, 20], [6, 22]];
const loadGoal = g => `Load the donkey: bread, a skin of wine and a young goat: ${load(g).done.size} of 3`;

function take(what, item, scene, idle) {
  return g => {
    const l = load(g);
    if (g.stepId !== 'load' || l.done.has(what) || l.carry) return g.say(idle);
    l.carry = what;
    g.hold(item);
    g.note(g.text(scene));
  };
}

function useKid(g) {
  const l = load(g);
  if (g.stepId !== 'load' || l.kid === 'caught') return g.note('Meh-eh-eh!');
  if (l.bolts < KID_RUNS_TO.length) {
    g.walk('kid', [KID_RUNS_TO[l.bolts++]], 230);
    return g.note(g.text('kid_bolts'));
  }
  l.kid = 'caught';
  g.trail('kid');
  g.note(g.text('kid_caught'));
}

function useDonkey(g) {
  const l = load(g);
  if (g.stepId !== 'load') return g.note('Hee-haw!');
  if (l.carry) { l.done.add(l.carry); l.carry = null; g.hold(null); }
  else if (l.kid === 'caught' && !l.done.has('goat')) { l.done.add('goat'); g.trail('kid', 'donkey'); }
  else return g.note(g.text('donkey_wait'));
  g.note(g.text('donkey_loaded'));
  if (l.done.size >= 3) g.signal('loaded'); else g.goal(loadGoal(g), 'donkey');
}

// Side task: the king's house is too loud for a man in distress.
const quiet = g => (g.state.quiet ||= { on: false, done: new Set() });

async function useMaid(g) {
  const q = quiet(g);
  if (g.found('quiet') || q.done.size >= 3) return g.say('maid_done');
  if (q.on) return g.say('maid_remind');
  q.on = true;
  await g.say('maid_ask');
  g.task('Quiet three noisy things in the court: 0 of 3');
}

const hush = what => async g => {
  const q = quiet(g);
  if (q.done.has(what)) return g.note(g.text(`hush_${what}`));
  if (!q.on) return g.note(g.text(`noise_${what}`));
  q.done.add(what);
  g.note(g.text(`hush_${what}`));
  if (q.done.size < 3) return g.task(`Quiet three noisy things in the court: ${q.done.size} of 3`);
  g.task(null);
  await g.say('maid_thanks');
  g.award('quiet');
};

const servant = (over = {}) => robe({ top: '#9aa0a8', sash: '#55585e', ...over });

export const actors = [
  {
    id: 'saul', name: 'King Saul', at: [32, 11], scale: 1.1, chat: 'saul_idle',
    look: robe({ top: '#6b3fa0', sash: '#e3b93a', head: 'crown', beard: true }),
  },
  { id: 'servant1', name: 'a servant', at: [30, 12], chat: 'servant_idle', look: servant({ beard: true }) },
  { id: 'servant2', name: 'a servant', at: [34, 12], chat: 'servant_idle', look: servant({ skin: '#a06a42' }) },
  { id: 'messenger', name: 'the messenger', at: [28, 13], dir: 'left', chat: 'messenger_idle', look: servant({ top: '#7f8f6a', head: 'band' }) },
  { id: 'maid', name: 'a servant girl', at: [28, 10], onUse: useMaid, look: servant({ top: '#a85a4a', hairStyle: 'long', head: 'cloth', headColor: '#d9c9a3' }) },
  { id: 'steward', name: 'the old steward', at: [36, 12], dir: 'left', onUse: discover('disc_rejected', 'rejected'), look: servant({ hair: GRAY, beard: GRAY }) },
  { id: 'smith', name: 'the smith', label: 'hush the smith', at: [35, 15], dir: 'right', onUse: hush('smith'), look: robe({ top: '#7d6a55', beard: true, head: 'band', headColor: '#3a3a3a' }) },
  { id: 'jarboy', name: 'a boy', label: 'hush the boy', at: [29, 19], dir: 'left', scale: 0.85, onUse: hush('jars'), look: servant({ top: '#b59a6e' }) },
  { id: 'arguer1', name: 'a servant', label: 'hush the two servants', at: [33, 18], dir: 'right', onUse: hush('argue'), look: servant({ beard: true }) },
  { id: 'arguer2', name: 'a servant', label: 'hush the two servants', at: [34, 18], dir: 'left', onUse: hush('argue'), look: servant({ top: '#8f7a5c' }) },

  // Bethlehem
  {
    id: 'jesse', name: 'Jesse', at: [5, 10], chat: 'jesse_idle',
    look: robe({ top: '#7d6a55', sash: '#3a2f25', hair: GRAY, beard: GRAY, head: 'band', headColor: '#5d4526' }),
  },
  {
    id: 'keeper', name: 'the keeper', at: [11, 12], dir: 'left', onUse: discover('disc_backforth', 'backforth'),
    look: robe({ top: '#8f7a5c', hair: GRAY, beard: GRAY, head: 'cloth', headColor: '#c9b48a', item: 'staff' }),
  },
  {
    id: 'donkey', name: 'the donkey', label: 'load the donkey', at: [8, 11], dir: 'right', scale: 1.3, solid: false,
    look: { kind: 'donkey' }, headroom: ANIMAL_HEADROOM, onUse: useDonkey,
  },
  {
    id: 'kid', name: 'the young goat', label: 'catch the young goat', at: [4, 17], scale: 0.9, solid: false,
    look: { kind: 'goat' }, headroom: ANIMAL_HEADROOM, onUse: useKid,
  },
  {
    id: 'david', name: 'David', at: [3, 6], scale: 0.92, hidden: true, chat: 'david_idle',
    look: robe({ hair: '#7a3b22', hairStyle: 'curly', top: '#e3d6b0', sash: '#8a5a2b', item: 'harp' }),
  },
];

// -------------------------------------------------------------------- things

export const objects = [
  // Gibeah
  { type: 'hall', x: 30, y: 8 },
  { type: 'throne', x: 32, y: 10 },
  { type: 'gatepost', x: 26, y: 13, label: 'read the gatepost', onUse: discover('disc_gibeah', 'gibeah') },
  { type: 'gatepost', x: 26, y: 15 },
  { type: 'anvil', x: 36, y: 15 },
  { type: 'jars', x: 28, y: 19 },
  { type: 'tree', x: 37, y: 22 }, { type: 'tree', x: 28, y: 23 },

  // The road
  { type: 'bigrock', x: 19, y: 12, reach: 60, label: 'sit on the flat stone', onUse: discover('disc_praise', 'praise') },
  { type: 'tree', x: 21, y: 11 }, { type: 'tree', x: 15, y: 17 }, { type: 'tree', x: 23, y: 20 },

  // Jesse's farm
  { type: 'house', x: 3, y: 8 },
  { type: 'oven', x: 7, y: 8, label: 'take the bread', onUse: take('bread', 'bread', 'bread_take', 'look_oven') },
  { type: 'jars', x: 2, y: 11, label: 'take a skin of wine', onUse: take('wine', 'skin', 'wine_take', 'look_jars') },
  { type: 'woodpile', x: 9, y: 8 },
  { type: 'bush', x: 3, y: 18 }, { type: 'bush', x: 12, y: 21 }, { type: 'bush', x: 5, y: 23 },
  { type: 'tree', x: 13, y: 7 }, { type: 'tree', x: 2, y: 21 }, { type: 'tree', x: 12, y: 25 },
];

// -------------------------------------------------------------------- scenes

// Notes drift up from the harp while David plays.
async function playHarp(g) {
  const david = g.actor('david');
  for (let i = 0; i < 7; i++) {
    const note = g.fx('note', david.x + 14 + (i % 3) * 8, david.y - 34);
    g.tween({ targets: note, y: note.y - 46, x: note.x + 10, alpha: 0, duration: 1100 }).then(() => note.destroy());
    await g.wait(260);
  }
}

const atCourt = g => {
  g.trail('donkey', false); g.trail('kid', false);
  g.place('donkey', 28, 17, 'right'); g.place('kid', 29, 17, 'right');
  g.show('david');
};

export const steps = [
  {
    id: 'court',
    goal: "Talk to the king's servants.", marker: 'servant1',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'servant1' },
    async run(g) {
      await g.say('court');
      g.award('seek');
    },
  },
  {
    id: 'road', spawn: [29, 14],
    goal: 'Go with the messenger to Bethlehem and find Jesse.', marker: 'jesse',
    begin(g) { g.walk('messenger', [[27, 14], [8, 14], [6, 11]], 150).then(() => g.face('messenger', 'left')); },
    trigger: { talk: 'jesse' },
    async run(g) {
      await g.arrive('messenger');
      await g.say('message');
      g.award('message');
    },
  },
  {
    id: 'load', spawn: [6, 12],
    goal: 'Load the donkey: bread, a skin of wine and a young goat: 0 of 3', marker: 'donkey',
    enter(g) { g.place('messenger', 6, 11, 'left'); },
    trigger: { signal: 'loaded' },
    // David comes in from the sheep.
    async run(g) {
      g.show('david');
      g.place('david', 12, 10, 'left');
      await g.walk('david', [[9, 12], [7, 12]], 150);
      await g.say('gifts');
      g.award('gifts');
    },
  },
  {
    id: 'journey', spawn: [8, 13],
    goal: "Lead the donkey to the king's house with David.",
    enter(g) {
      g.show('david'); g.place('david', 7, 12, 'right');
      g.place('donkey', 8, 11, 'right'); g.trail('donkey'); g.trail('kid', 'donkey');
      load(g).kid = 'caught';
    },
    begin(g) { g.walk('david', [[8, 14], [26, 14], [28, 14]], 128); },
    trigger: { zone: [27, 12, 29, 16] },
    async run(g) {
      atCourt(g);
      await g.arrive('david');
      await g.say('service');
      g.award('service');
      await g.say('pleased');

      // The king is troubled, and David plays.
      await g.walk('david', [[31, 13], [31, 12]], 120);
      g.face('david', 'right');
      const saul = g.actor('saul');
      await g.tween({ targets: saul.sprite, angle: { from: -5, to: 5 }, duration: 90, yoyo: true, repeat: 9 });
      saul.sprite.setAngle(0);
      await playHarp(g);
      await g.say('relief');
      g.award('relief');
    },
  },
  {
    id: 'farewell', spawn: [30, 15],
    goal: 'Talk to David when you are ready to go.', marker: 'david',
    enter(g) { atCourt(g); g.place('david', 31, 12, 'down'); },
    trigger: { talk: 'david' },
    async run(g) {
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
