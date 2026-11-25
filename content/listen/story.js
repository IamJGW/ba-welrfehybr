// Speak, Lord (1 Samuel 3): a night in the house of the LORD at Shiloh. The boy
// Samuel hears a voice three times, and Eli tells him how to answer. The words are
// in dialogue.csv.

import { robe, lady, discover, makeMap, taps } from '../../src/storykit.js';

export const id = 'listen';
export const title = 'Speak, Lord';
export const where = 'The house of the LORD at Shiloh, at night';
export const ref = '1 Samuel 3';
export const place = [35.29, 32.06];   // Shiloh
export const after = 'hannah';

// ----------------------------------------------------------------------- map
// The inside of the tent: Eli's room on the left, the holy place on the right.
//   w  floorboards    W  wall    r  rug

const edge = (x, y) => x < 2 || x > 37 || y < 4 || y > 22;
export const map = makeMap((x, y) => {
  if (edge(x, y)) return 'W';
  if (x === 14 && y >= 5 && y <= 21 && !(y >= 12 && y <= 14)) return 'W';
  if (x >= 20 && x <= 34 && y >= 8 && y <= 20) return 'r';
  return 'w';
});

export const start = [8, 20];
export const door = [4, 20];
export const barriers = [];

// -------------------------------------------------------------------- the lamps

const light = taps('lamp', { step: 'lamps', total: 3, goal: 'Trim the lamps', keep: true });
const LAMPS = [[24, 9], [28, 9], [32, 9]].map(([x, y], i) => ({ id: `lamp${i + 1}`, type: 'lampstand', x, y, label: 'trim the lamp', onUse: light }));

// -------------------------------------------------------------------- people

const levite = (over = {}) => robe({ top: '#f1ede0', sash: '#3d6fb5', ...over });

export const actors = [
  { id: 'eli', name: 'Eli', at: [8, 10], dir: 'right', chat: 'eli_idle', look: levite({ hair: '#e8e8e8', beard: '#e8e8e8', head: 'cloth', headColor: '#e8e0cc', item: 'staff' }) },
  { id: 'samuel', name: 'Samuel', at: [22, 17], dir: 'up', scale: 0.85, chat: 'samuel_idle', look: robe({ top: '#f4f1e6', sash: '#c0415a' }) },
  { id: 'priest', name: 'a priest', at: [30, 18], dir: 'left', onUse: discover('disc_priest', 'word_rare'), look: levite({ beard: true }) },
  { id: 'servant', name: 'a servant of the house', at: [10, 17], dir: 'right', onUse: discover('disc_servant', 'doors'), look: levite({ top: '#8a6a3a' }) },
  { id: 'child', name: 'a boy who helps in the house', at: [18, 12], dir: 'down', scale: 0.8, onUse: discover('disc_child', 'lamp_of_god'), look: robe({ top: '#d9b45a' }) },
];

// -------------------------------------------------------------------- things

export const objects = [
  { id: 'ark', type: 'arkcov', x: 31, y: 16 },
  { id: 'eli_bed', type: 'mat', x: 5, y: 8 }, { id: 'sam_bed', type: 'mat', x: 24, y: 18 },
  { type: 'table', x: 22, y: 12 }, { type: 'pot', x: 6, y: 14 }, { type: 'column', x: 17, y: 7 }, { type: 'column', x: 17, y: 18 },
];

const calls = ['samuel_one', 'samuel_two', 'samuel_three'];
// Samuel runs to Eli's room and back, and tells him: "Here I am, for you have called me."
async function runToEli(g) {
  await g.walk('samuel', [[18, 13], [10, 13], [9, 11]], 150);
}
async function backToBed(g) {
  await g.walk('samuel', [[10, 13], [18, 13], [22, 17]], 130);
  g.face('samuel', 'up');
}

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'evening',
    goal: 'Talk to Eli, in his room.', marker: 'eli',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'eli' },
    async run(g) {
      await g.say('rare');
      g.award('boy_ministered');
      g.award('word_was_rare');
      await g.say('dim');
      g.award('eli_dim');
      await g.say('lamps_ask');
    },
  },
  {
    id: 'lamps', spawn: [18, 13],
    begin(g) { LAMPS.forEach(l => g.addProp(l)); },
    goal: 'Trim the lamps: 0 of 3', marker: null,
    solve: ['lamp1', 'lamp2', 'lamp3'],
    trigger: { signal: 'lamps' },
    async run(g) {
      await g.say('lamps_done');
      g.award('lamp_of_god');
      g.sky({ night: true });
    },
  },
  {
    id: 'lying', spawn: [20, 15],
    enter(g) { LAMPS.forEach(l => g.addProp(l)); g.sky({ night: true }); },
    goal: 'Talk to Samuel, who is lying down by the ark.', marker: 'samuel',
    trigger: { talk: 'samuel' },
    async run(g) {
      await g.say('lying_down');
      g.award('where_ark');
      await g.say('night');
    },
  },
  {
    id: 'first', spawn: [22, 16],
    enter(g) { LAMPS.forEach(l => g.addProp(l)); g.sky({ night: true }); },
    goal: 'Stay with Samuel, and listen.', marker: 'samuel',
    trigger: { talk: 'samuel' },
    async run(g) {
      g.sky({ night: true });
      const glow = g.fx('glow', 28 * g.T, 14 * g.T).setScale(3).setAlpha(0);
      await g.tween({ targets: glow, alpha: 1, duration: 700 });
      await g.say('called_first');
      g.award('here_i_am');
      await g.tween({ targets: glow, alpha: 0, duration: 700 });
      glow.destroy();
      await runToEli(g);
      await g.say('eli_first');
      g.award('did_not_call');
      await backToBed(g);
    },
  },
  {
    id: 'second', spawn: [22, 16],
    enter(g) { LAMPS.forEach(l => g.addProp(l)); g.sky({ night: true }); },
    goal: 'Talk to Samuel. He has heard it again.', marker: 'samuel',
    trigger: { talk: 'samuel' },
    async run(g) {
      const glow = g.fx('glow', 28 * g.T, 14 * g.T).setScale(3).setAlpha(0);
      await g.tween({ targets: glow, alpha: 1, duration: 700 });
      await g.say('called_second');
      g.award('once_again');
      await g.tween({ targets: glow, alpha: 0, duration: 700 });
      glow.destroy();
      await runToEli(g);
      await g.say('eli_second');
      g.award('my_son');
      await backToBed(g);
      await g.say('did_not_know');
      g.award('did_not_yet_know');
    },
  },
  {
    id: 'third', spawn: [22, 16],
    enter(g) { LAMPS.forEach(l => g.addProp(l)); g.sky({ night: true }); },
    goal: 'Talk to Samuel. The voice has come a third time.', marker: 'samuel',
    trigger: { talk: 'samuel' },
    async run(g) {
      const glow = g.fx('glow', 28 * g.T, 14 * g.T).setScale(3).setAlpha(0);
      await g.tween({ targets: glow, alpha: 1, duration: 700 });
      await g.say('called_third');
      g.award('third_time');
      await g.tween({ targets: glow, alpha: 0, duration: 700 });
      glow.destroy();
      await runToEli(g);
      await g.say('eli_realizes');
      g.award('eli_realized');
      await g.say('eli_tells');
      g.award('speak_lord');
      await backToBed(g);
    },
  },
  {
    id: 'speak', spawn: [22, 16],
    enter(g) { LAMPS.forEach(l => g.addProp(l)); g.sky({ night: true }); },
    goal: 'Stay with Samuel, and listen.', marker: 'samuel',
    trigger: { talk: 'samuel' },
    async run(g) {
      const glow = g.fx('glow', 28 * g.T, 14 * g.T).setScale(4).setAlpha(0);
      await g.tween({ targets: glow, alpha: 1, duration: 900 });
      await g.say('stood_there');
      g.award('samuel_samuel');
      g.award('your_servant');
      await g.say('about_to_do');
      g.award('ears_tingle');
      await g.say('judge');
      g.award('judge_house');
      await g.tween({ targets: glow, alpha: 0, duration: 900 });
      glow.destroy();
      g.sky({});
    },
  },
  {
    id: 'morning', spawn: [18, 13],
    enter(g) { LAMPS.forEach(l => g.addProp(l)); g.sky({}); },
    goal: 'Talk to Eli, in the morning.', marker: 'eli',
    trigger: { talk: 'eli' },
    async run(g) {
      g.place('samuel', 10, 12, 'right');
      await g.say('opened_doors');
      g.award('afraid_to_tell');
      await g.say('eli_asks');
      g.award('message');
      await g.say('told_all');
      g.award('did_not_hide');
      g.award('he_is_the_lord');
      await g.say('grew');
      g.award('none_fall');
      g.award('prophet');
      await g.say('revealed');
      g.award('continued_to_appear');
      await g.say('sheep');
      g.award('listen_to_my_voice');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
