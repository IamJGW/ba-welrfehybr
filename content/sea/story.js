// Through the Sea (Exodus 13:17-15:21): the pillar of cloud, Pharaoh's army
// behind and the sea in front, the sea divided, and Miriam's song. The army is
// shown only as the waters returning. The words are in dialogue.csv.

import { robe, lady, discover, makeMap, soldier } from '../../src/storykit.js';

export const id = 'sea';
export const title = 'Through the Sea';
export const where = 'By the sea, at Pi-hahiroth';
export const ref = 'Exodus 13:17-15:21';
export const place = [32.6, 29.3];   // the Red Sea
export const after = 'passover';

// ----------------------------------------------------------------------- map
//   s  desert    ~  shallow    S  deep sea (cannot be walked on)    m  wet sea floor    #  cliff

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
const sea = phase => makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (x < 26 || x > 33) return 's';
  if (phase === 'open' && y >= 12 && y <= 16) return 'm';
  if (phase === 'before' && x <= 27) return '~';
  return 'S';
});
export const map = sea('before');
const OPEN = sea('open'), CLOSED = sea('closed');

export const start = [5, 22];
export const door = [3, 23];
export const barriers = [];

// -------------------------------------------------------------------- people

const israelite = (over = {}) => robe({ top: '#a9845a', ...over });
const egyptian = (over = {}) => soldier({ skin: '#b07848', top: '#f2efe6', sash: '#4a7ab0', hair: '#1f1a17', hairStyle: 'bob', beard: false, ...over });

export const actors = [
  { id: 'moses', name: 'Moses', at: [12, 14], dir: 'right', chat: 'moses_idle', look: robe({ top: '#a9845a', sash: '#5d4526', hair: '#d8d8d8', beard: '#d8d8d8', head: 'cloth', headColor: '#e8e0cc', item: 'staff' }) },
  { id: 'aaron', name: 'Aaron', at: [14, 16], dir: 'right', chat: 'aaron_idle', look: robe({ top: '#f1ede0', sash: '#3d6fb5', hair: '#cfcfcf', beard: '#cfcfcf', head: 'cloth', headColor: '#e8e0cc' }) },
  { id: 'miriam', name: 'Miriam', at: [36, 14], dir: 'left', hidden: true, chat: 'miriam_idle', look: lady('#c9893f', { hair: '#2a211c', item: 'tambourine' }) },
  { id: 'father', name: 'a frightened father', at: [18, 19], dir: 'right', onUse: discover('disc_father', 'terrified'), look: israelite({ top: '#8a3a3a', beard: true }) },
  { id: 'mother', name: 'a mother with a baby', at: [16, 21], dir: 'right', onUse: discover('disc_mother', 'women'), look: lady('#6b8a4f', { hair: '#2a211c', item: 'baby' }) },
  { id: 'boy', name: 'a boy', at: [21, 17], dir: 'right', scale: 0.8, onUse: discover('disc_boy', 'dry_ground'), look: israelite({ top: '#d9b45a' }) },
  { id: 'elder', name: 'an old man', at: [8, 18], dir: 'right', onUse: discover('disc_bones', 'bones'), look: israelite({ top: '#7d5a8a', hair: '#e8e8e8', beard: '#e8e8e8' }) },
  { id: 'general', name: "Pharaoh's officer", at: [-2, 8], dir: 'right', hidden: true, look: egyptian({ top: '#4a7ab0', head: 'plume', headColor: '#4a7ab0' }) },
  { id: 'army1', name: 'a charioteer', at: [-2, 11], dir: 'right', hidden: true, look: egyptian() },
  { id: 'army2', name: 'a charioteer', at: [-2, 14], dir: 'right', hidden: true, look: egyptian() },
  { id: 'army3', name: 'a charioteer', at: [-2, 17], dir: 'right', hidden: true, look: egyptian() },
];

// -------------------------------------------------------------------- things

export const objects = [
  { type: 'tent', x: 4, y: 9 }, { type: 'tent', x: 5, y: 20 }, { type: 'ptent', x: 8, y: 13 }, { type: 'tent', x: 10, y: 20 }, { type: 'tent', x: 6, y: 8 },
  { id: 'coffin', type: 'coffin', x: 9, y: 17 },
  { id: 'pillar', type: 'cloudpillar', x: 14, y: 11 },
  { type: 'rock', x: 20, y: 9 }, { type: 'bigrock', x: 22, y: 22 }, { type: 'rock', x: 24, y: 14 },
  { type: 'palm', x: 35, y: 8 }, { type: 'palm', x: 36, y: 20 }, { type: 'palm', x: 34, y: 22 },
];

// Stand still for a few seconds, the way Moses asked.
const STILL_FOR = 5000;   // milliseconds
async function standStill(g) {
  let last = [g.player.x, g.player.y], still = 0;
  while (g.stepId === 'still') {
    await g.wait(120);
    const p = g.player;
    if (Math.hypot(p.x - last[0], p.y - last[1]) > 3) {
      last = [p.x, p.y]; still = 0;
      g.goal('Stand still, and watch what the LORD does', null);
      continue;
    }
    still += 120;
    g.goal(`Be still: ${Math.max(0, Math.ceil((STILL_FOR - still) / 1000))}`, null);
    if (still >= STILL_FOR) return g.signal('still');
  }
}

const army = ['general', 'army1', 'army2', 'army3'];
const crowd = [['father', 35, 12], ['mother', 35, 16], ['boy', 36, 17], ['elder', 34, 13], ['aaron', 36, 12], ['moses', 35, 14]];
const camp = [['father', 18, 19], ['mother', 16, 21], ['boy', 21, 17], ['elder', 8, 18], ['aaron', 14, 16], ['moses', 12, 14]];

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'camp',
    goal: 'Talk to Moses, by the pillar of cloud.', marker: 'moses',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'moses' },
    async run(g) {
      await g.say('led');
      g.award('shorter_road');
      g.award('arrayed');
      await g.say('pillar');
      g.award('pillar_cloud');
      g.award('did_not_leave');
      await g.say('camp_ask');
    },
  },
  {
    id: 'army', spawn: [13, 16],
    goal: 'Talk to the frightened father.', marker: 'father',
    trigger: { talk: 'father' },
    async run(g) {
      for (const id of army) g.show(id);
      for (const [id, x, y] of [['general', 3, 12], ['army1', 2, 14], ['army2', 3, 16], ['army3', 2, 18]]) g.walk(id, [[x, y]], 70);
      await g.pan(5, 14, 900);
      await g.say('pursuit');
      g.award('changed_minds');
      await g.say('terrified');
      g.award('cried_out');
      await g.follow(800);
      await g.say('graves');
      g.award('graves');
    },
  },
  {
    id: 'still', spawn: [14, 17],
    enter(g) { for (const id of army) g.show(id); for (const [id, x, y] of [['general', 3, 12], ['army1', 2, 14], ['army2', 3, 16], ['army3', 2, 18]]) g.place(id, x, y, 'right'); },
    begin(g) { standStill(g); },
    goal: 'Stand still, and watch what the LORD does', marker: null,
    solve: ['wait:6500'],
    trigger: { signal: 'still' },
    async intro(g) { await g.say('be_still'); g.award('not_afraid'); g.award('fight'); },
    async run(g) {
      await g.say('forward');
      g.award('divide');
      // The cloud moves behind the people, and the night falls.
      g.sky({ night: true, stars: true });
      await g.say('cloud_behind');
      g.award('between');
      await g.fadeOut(500);
      g.ground(OPEN, 0);
      g.flash(200);
      await g.fadeIn(600);
      g.shake(900, 0.005);
      await g.say('divided');
      g.award('east_wind');
      g.award('walls');
      for (const [id, x, y] of crowd) g.walk(id, [[22, 14], [x, y]], 70 + (id === 'moses' ? 0 : 10));
    },
  },
  {
    id: 'cross', spawn: [24, 14],
    enter(g) { g.ground(OPEN, 0); g.sky({ night: true, stars: true }); for (const id of army) g.show(id); for (const [id, x, y] of [['general', 3, 12], ['army1', 2, 14], ['army2', 3, 16], ['army3', 2, 18]]) g.place(id, x, y, 'right'); for (const [id, x, y] of crowd) g.place(id, x, y, 'down'); },
    goal: 'Cross the sea on dry ground.', marker: null,
    trigger: { zone: [34, 12, 36, 16] },
    async run(g) {
      g.place('player', 34, 15, 'right');
      await g.pan(20, 14, 900);
      await g.say('dry_ground');
      g.award('dry');
      g.sky({});
      for (const [id, x, y] of [['general', 28, 13], ['army1', 28, 14], ['army2', 28, 15], ['army3', 27, 14]]) g.walk(id, [[x, y]], 120);
      await g.wait(2200);
      await g.say('confusion');
      g.award('wheels');
      await g.say('flee');
      g.award('fighting');
      g.shake(800, 0.007);
      g.ground(CLOSED, 1500);
      await g.wait(900);
      for (const id of army) g.hide(id);
      await g.wait(800);
      await g.say('returned');
      g.award('returned');
      await g.follow(900);
      await g.say('believed');
      g.award('believed');
    },
  },
  {
    id: 'song', spawn: [35, 15],
    enter(g) { g.ground(CLOSED, 0); g.sky({}); for (const id of army) g.hide(id); for (const [id, x, y] of crowd) g.place(id, x, y, 'down'); },
    begin(g) { g.show('miriam'); g.place('miriam', 34, 18, 'up'); },
    goal: 'Talk to Miriam, with her tambourine.', marker: 'miriam',
    trigger: { talk: 'miriam' },
    async run(g) {
      await g.say('tambourine');
      g.award('tambourine');
      await g.say('song');
      g.award('sing');
      g.award('strength');
      await g.say('warrior');
      g.award('warrior');
      await g.say('faith');
      g.award('by_faith');
    },
  },
  {
    id: 'farewell', spawn: [35, 15],
    enter(g) { g.ground(CLOSED, 0); g.sky({}); for (const id of army) g.hide(id); for (const [id, x, y] of crowd) g.place(id, x, y, 'down'); g.show('miriam'); g.place('miriam', 34, 18, 'up'); },
    goal: 'Talk to Moses, when you are ready.', marker: 'moses',
    trigger: { talk: 'moses' },
    async run(g) {
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
