// Jonathan's Daring Climb (1 Samuel 13:19-14:23): no swords in Israel, Jonathan and
// his armor-bearer climb the cliff to the Philistine outpost, panic from God, and
// the Philistines flee. The fighting is not shown. The words are in dialogue.csv.

import { robe, lady, discover, makeMap, soldier, taps } from '../../src/storykit.js';

export const id = 'cliff';
export const title = "Jonathan's Daring Climb";
export const where = 'Gibeah and the pass of Michmash';
export const ref = '1 Samuel 13:19-14:23';
export const place = [35.28, 31.86];   // Gibeah and Michmash
export const after = 'saul';

// ----------------------------------------------------------------------- map
// Saul's camp at Gibeah in the south, the pass between two cliffs, and the outpost on the north cliff.
//   .  grass    h  rocky slope    #  cliff    ,  path    s  stone

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
export const map = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  // The two cliffs, Bozez and Seneh, either side of the pass, with a narrow way up the northern one.
  if (y >= 4 && y <= 13 && (x <= 15 || x >= 25)) return '#';
  if (y >= 4 && y <= 13 && x >= 16 && x <= 24) return (y % 2 === 0 ? 'h' : (x === 20 || x === 21 ? 'h' : '#'));
  if (y >= 14 && y <= 16 && x >= 16 && x <= 24) return 'o';
  if (y === 20 && x < 28 || x === 20 && y >= 14 && y <= 20) return ',';
  return '.';
});

export const start = [5, 23];
export const door = [3, 24];
export const barriers = [];

// -------------------------------------------------------------------- the climb

const climb = taps('hold', { step: 'climb', total: 5, goal: 'Climb up behind Jonathan', keep: true });
const HOLDS = [[20, 13], [21, 11], [20, 9], [21, 7], [20, 5]].map(([x, y], i) => ({ id: `hold${i + 1}`, type: 'stoneRough', x, y, label: 'grab the handhold', onUse: climb }));

// -------------------------------------------------------------------- people

const israelite = (over = {}) => robe({ top: '#a9845a', ...over });
const philistine = (id, at, over = {}) => ({ id, name: 'a Philistine', at, dir: 'down', hidden: true, solid: false, look: soldier({ top: '#6a3a3a', skin: '#a06a42', head: 'plume', headColor: '#a33a2a', ...over }) });

export const actors = [
  { id: 'jonathan', name: 'Jonathan', at: [10, 20], dir: 'right', chat: 'jonathan_idle', look: soldier({ top: '#8a6a3a', head: 'band', headColor: '#4a7ab0', beard: false }) },
  { id: 'bearer', name: "Jonathan's armor-bearer", at: [12, 22], dir: 'right', onUse: discover('disc_bearer', 'heart_and_soul'), look: israelite({ top: '#4f8a6a', item: 'shield' }) },
  { id: 'saul', name: 'Saul', at: [5, 17], dir: 'right', onUse: discover('disc_saul', 'pomegranate'), look: robe({ top: '#8a3a3a', beard: true, sash: '#e3b93a', head: 'crown' }), scale: 1.1 },
  { id: 'ahijah', name: 'Ahijah the priest', at: [8, 15], dir: 'right', onUse: discover('disc_ahijah', 'ephod'), look: robe({ top: '#f1ede0', sash: '#3d6fb5', beard: true, head: 'cloth', headColor: '#e8e0cc' }) },
  { id: 'trooper', name: 'a soldier of Saul', at: [4, 21], dir: 'right', onUse: discover('disc_trooper', 'no_swords'), look: israelite({ top: '#6a6a72', item: 'staff' }) },
  { id: 'smith', name: 'a farmer with a plowshare', at: [14, 17], dir: 'left', onUse: discover('disc_smith', 'plowshares'), look: israelite({ top: '#8a6a3a', beard: true }) },
  { id: 'hider', name: 'an Israelite in hiding', at: [27, 21], dir: 'left', onUse: discover('disc_hider', 'hiding'), look: israelite({ top: '#7d5a8a' }) },
  philistine('ph1', [19, 3]), philistine('ph2', [22, 3]), philistine('ph3', [20, 2], { top: '#4a3a30' }),
];

// -------------------------------------------------------------------- things

export const objects = [
  { type: 'tent', x: 4, y: 12 }, { type: 'tent', x: 6, y: 19 }, { id: 'pom', type: 'tree', x: 3, y: 14 },
  { type: 'rock', x: 14, y: 14 }, { type: 'bigrock', x: 26, y: 18 }, { type: 'rock', x: 30, y: 21 }, { type: 'palm', x: 32, y: 15 },
];
const OUTPOST = [{ id: 'tower', type: 'house', x: 18, y: 3 }];

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'swords',
    goal: 'Talk to Jonathan, at the edge of Saul\'s camp.', marker: 'jonathan',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'jonathan' },
    async run(g) {
      await g.say('no_blacksmith');
      g.award('no_blacksmith');
      await g.say('sharpen');
      g.award('plowshares_q');
      await g.say('only_two');
      g.award('only_saul_and_jonathan');
      await g.say('camp_one');
      g.award('under_pomegranate');
      g.award('six_hundred');
      await g.say('secret');
      g.award('did_not_tell');
    },
  },
  {
    id: 'cross', spawn: [12, 20],
    goal: 'Follow Jonathan to the pass, and stand between the cliffs.', marker: null,
    trigger: { zone: [18, 17, 22, 18] },
    async run(g) {
      g.place('jonathan', 19, 16, 'up'); g.place('bearer', 21, 17, 'up'); g.place('player', 20, 18, 'up');
      await g.say('cliffs');
      g.award('bozez_seneh');
      g.award('north_south');
      await g.say('perhaps');
      g.award('nothing_hinders');
      await g.say('bearer_replies');
      g.award('heart_and_soul_q');
      await g.say('sign');
      g.award('our_sign');
      g.award('wait_or_come_up');
    },
  },
  {
    id: 'show', spawn: [20, 18],
    enter(g) { g.place('jonathan', 19, 16, 'up'); g.place('bearer', 21, 17, 'up'); },
    goal: 'Show yourselves to the outpost, with Jonathan.', marker: null,
    trigger: { zone: [18, 14, 22, 15] },
    async run(g) {
      g.place('player', 20, 15, 'up');
      for (const id of ['ph1', 'ph2', 'ph3']) g.show(id);
      OUTPOST.forEach(o => g.addProp(o));
      await g.say('showed');
      g.award('showed_themselves');
      await g.say('holes');
      g.award('holes');
      await g.say('come_up');
      g.award('come_up');
      await g.say('follow_me');
      g.award('follow_me');
      g.award('delivered_into_hand');
    },
  },
  {
    id: 'climb', spawn: [20, 14],
    enter(g) { OUTPOST.forEach(o => g.addProp(o)); for (const id of ['ph1', 'ph2', 'ph3']) g.show(id); g.place('jonathan', 23, 4, 'down'); g.place('bearer', 24, 4, 'down'); },
    begin(g) { HOLDS.forEach(h => g.addProp(h)); g.place('jonathan', 23, 4, 'down'); g.place('bearer', 24, 4, 'down'); },
    goal: 'Climb up behind Jonathan: 0 of 5', marker: 'hold1',
    solve: ['hold1', 'hold2', 'hold3', 'hold4', 'hold5'],
    trigger: { signal: 'climb' },
    async run(g) {
      await g.say('climbed');
      g.award('hands_and_feet');
      g.award('armor_bearer_behind');
    },
  },
  {
    id: 'panic', spawn: [20, 6],
    enter(g) { OUTPOST.forEach(o => g.addProp(o)); g.place('jonathan', 20, 4, 'down'); g.place('bearer', 22, 4, 'down'); for (const id of ['ph1', 'ph2', 'ph3']) g.hide(id); },
    goal: 'Talk to Jonathan, at the top.', marker: 'jonathan',
    trigger: { talk: 'jonathan' },
    async run(g) {
      g.hide('ph1'); g.hide('ph2'); g.hide('ph3');
      await g.say('assault');
      g.award('about_twenty');
      g.flash(250); g.shake(1100, 0.01);
      await g.say('panic');
      g.award('panic_from_god');
      g.award('earth_quaked');
      await g.say('watchmen');
      g.award('melting_away');
      await g.say('roll');
      g.award('call_the_roll');
      await g.say('ark_ask');
      g.award('withdraw_hand');
      await g.say('confusion');
      g.award('total_confusion');
      await g.say('hebrews_join');
      g.award('hebrews_joined');
      g.award('ephraim_joined');
      await g.say('saved');
      g.award('beth_aven');
    },
  },
  {
    id: 'farewell', spawn: [20, 6],
    enter(g) { OUTPOST.forEach(o => g.addProp(o)); g.place('jonathan', 20, 4, 'down'); g.place('bearer', 22, 4, 'down'); for (const id of ['ph1', 'ph2', 'ph3']) g.hide(id); },
    goal: 'Talk to Jonathan, when you are ready.', marker: 'jonathan',
    trigger: { talk: 'jonathan' },
    async run(g) {
      await g.say('romans');
      g.award('god_for_us');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
