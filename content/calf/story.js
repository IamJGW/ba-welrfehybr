// The Golden Calf (Exodus 32): Moses is late coming down the mountain, the people
// ask Aaron for a god they can see, the calf is made, Moses pleads for the people,
// and comes down to break the tablets. The words are in dialogue.csv.

import { robe, lady, discover, makeMap, soldier } from '../../src/storykit.js';

export const id = 'calf';
export const title = 'The Golden Calf';
export const where = 'The camp at the foot of Mount Sinai';
export const ref = 'Exodus 32';
export const place = [33.97, 28.4];   // Mount Sinai
export const after = 'sinai';

// ----------------------------------------------------------------------- map
//   s  desert    h  mountain slope    ,  path    #  cliff

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
export const map = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (y <= 9) return 'h';
  if (x === 18 && y >= 10 && y <= 17) return ',';
  return 's';
});

export const start = [5, 22];
export const door = [3, 23];
export const barriers = [
  { id: 'mountain', tiles: [2, 9, 37, 9], bump: 'bump_mountain' },
];

// -------------------------------------------------------------------- people

const israelite = (over = {}) => robe({ top: '#a9845a', ...over });
const dancer = (id, at, top) => ({ id, name: 'a dancer', at, dir: 'down', hidden: true, solid: false, look: israelite({ top }) });

export const actors = [
  { id: 'moses', name: 'Moses', at: [18, 6], dir: 'down', hidden: true, chat: 'moses_idle', look: robe({ top: '#a9845a', sash: '#5d4526', hair: '#d8d8d8', beard: '#d8d8d8', head: 'cloth', headColor: '#e8e0cc', item: 'staff' }) },
  { id: 'joshua', name: 'Joshua', at: [17, 7], dir: 'down', hidden: true, onUse: discover('disc_joshua', 'sound_of_war'), look: soldier({ top: '#a9845a', head: 'band', headColor: '#7a2e2e' }) },
  { id: 'aaron', name: 'Aaron', at: [20, 14], dir: 'left', chat: 'aaron_idle', look: robe({ top: '#f1ede0', sash: '#3d6fb5', hair: '#cfcfcf', beard: '#cfcfcf', head: 'cloth', headColor: '#e8e0cc' }) },
  { id: 'hur', name: 'Hur', at: [24, 16], dir: 'left', onUse: discover('disc_hur', 'hur'), look: israelite({ top: '#4f8a6a', beard: true, head: 'cloth', headColor: '#e8e0cc' }) },
  { id: 'restless', name: 'a restless man', at: [12, 17], dir: 'right', chat: 'restless_idle', look: israelite({ top: '#8a3a3a', beard: true }) },
  { id: 'woman', name: 'a woman with earrings', at: [10, 20], dir: 'right', chat: 'woman_idle', look: lady('#6b8a4f', { hair: '#2a211c' }) },
  { id: 'faithful', name: 'a worried elder', at: [26, 21], dir: 'left', onUse: discover('disc_elder', 'stiff_necked'), look: israelite({ top: '#7d5a8a', hair: '#e8e8e8', beard: '#e8e8e8' }) },
  { id: 'child', name: 'a child', at: [30, 20], dir: 'left', scale: 0.75, onUse: discover('disc_child', 'revelry'), look: robe({ top: '#d9b45a' }) },
  dancer('dancer1', [14, 15], '#c0415a'), dancer('dancer2', [22, 15], '#3d6fb5'), dancer('dancer3', [14, 19], '#c9893f'), dancer('dancer4', [22, 19], '#6b8a4f'),
];

// -------------------------------------------------------------------- things

export const objects = [
  { id: 'peak', type: 'peak', x: 14, y: 2 },
  { type: 'tent', x: 4, y: 13 }, { type: 'tent', x: 5, y: 18 }, { type: 'ptent', x: 9, y: 14 }, { type: 'tent', x: 31, y: 14 }, { type: 'tent', x: 33, y: 19 },
  { type: 'rock', x: 28, y: 12 }, { type: 'bigrock', x: 34, y: 23 }, { type: 'rock', x: 24, y: 24 },
];
const CALF = { id: 'goldcalf', type: 'goldcalf', x: 18, y: 16 };
const ALTAR = { id: 'altar', type: 'altar', x: 18, y: 19 };
const DANCERS = ['dancer1', 'dancer2', 'dancer3', 'dancer4'];

const dance = g => {
  for (const id of DANCERS) g.show(id);
  g.patrol('dancer1', [[14, 15], [14, 19]], 60, 0.2); g.patrol('dancer2', [[22, 15], [22, 19]], 60, 0.2);
  g.patrol('dancer3', [[14, 19], [18, 21]], 60, 0.2); g.patrol('dancer4', [[22, 19], [18, 21]], 60, 0.2);
};
const stopDance = g => { for (const id of DANCERS) { g.patrol(id, null); g.hide(id); } };

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'waiting',
    goal: 'Talk to the restless man.', marker: 'restless',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'restless' },
    async run(g) {
      await g.say('delayed');
      g.award('delayed');
      await g.say('make_gods');
      g.award('make_us_gods');
    },
  },
  {
    id: 'gold', spawn: [16, 18],
    goal: 'Talk to Aaron.', marker: 'aaron',
    trigger: { talk: 'aaron' },
    async run(g) {
      await g.say('aaron_says');
      g.award('earrings');
      g.award('brought');
      const give = await g.ask('your_gold', { title: 'Will you give your gold to Aaron?', yes: 'Give it', no: 'Keep it' });
      await g.say(give ? 'gave' : 'kept');
      g.award('you_chose');
      g.addProp(CALF);
      g.flash(250);
      await g.say('calf_made');
      g.award('molten_calf');
      g.award('your_gods');
      g.addProp(ALTAR);
      await g.say('feast');
      g.award('feast');
      dance(g);
    },
  },
  {
    id: 'mountain', spawn: [18, 14],
    enter(g) { g.addProp(CALF); g.addProp(ALTAR); dance(g); },
    goal: 'Look up at the mountain.', marker: null,
    trigger: { zone: [16, 12, 20, 12] },
    async run(g) {
      g.show('moses');
      g.place('moses', 18, 7, 'down');
      await g.pan(18, 6, 1100);
      g.sky({ night: true });
      await g.say('corrupted');
      g.award('corrupted');
      await g.say('stiff_necked');
      g.award('leave_me');
      await g.say('moses_pleads');
      g.award('pleads');
      await g.say('remember');
      g.award('remember');
      await g.say('relented');
      g.award('relented');
      g.sky({});
      await g.follow(900);
    },
  },
  {
    id: 'down', spawn: [18, 13],
    enter(g) { g.addProp(CALF); g.addProp(ALTAR); dance(g); g.show('moses'); },
    goal: 'Watch Moses come down.', marker: null,
    trigger: { zone: [16, 11, 20, 12] },
    async run(g) {
      g.show('moses'); g.show('joshua');
      g.place('moses', 18, 8, 'down'); g.place('joshua', 19, 8, 'down');
      await g.pan(18, 9, 800);
      await g.say('tablets');
      g.award('tablets');
      await g.say('sound');
      g.award('sound_of_war_q');
      g.walk('joshua', [[19, 12]], 100);
      await g.walk('moses', [[18, 12]], 100);
      await g.follow(500);
      await g.say('broken');
      g.award('shattered');
      g.shake(600, 0.01); g.flash(250);
      stopDance(g);
      await g.say('burned');
      g.award('powder');
      g.removeProp('goldcalf');
      g.removeProp('altar');
      await g.say('aaron_excuse');
      g.award('out_came_calf');
    },
  },
  {
    id: 'plea', spawn: [18, 14],
    enter(g) { stopDance(g); g.show('moses'); g.place('moses', 18, 12, 'down'); },
    goal: 'Talk to Moses, the next day.', marker: 'moses',
    trigger: { talk: 'moses' },
    async run(g) {
      await g.say('great_sin');
      g.award('great_sin');
      await g.say('blot_me_out');
      g.award('blot');
      await g.say('go_lead');
      g.award('angel');
      await g.say('advocate');
      g.award('advocate');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
