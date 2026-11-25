// Deborah under the Palm (Judges 4-5): Israel is oppressed, Deborah judges under
// her palm tree, Barak goes out with ten thousand men, the River Kishon floods,
// and Deborah and Barak sing. Jael's part is named and not shown. There is a
// note for parents. The words are in dialogue.csv.

import { robe, lady, discover, makeMap, soldier, taps } from '../../src/storykit.js';

export const id = 'deborah';
export const title = 'Deborah under the Palm';
export const where = 'The hill country of Ephraim, Mount Tabor and the River Kishon';
export const ref = 'Judges 4-5';
export const place = [35.35, 32.75];   // Mount Tabor and the Kishon
export const after = null;

// ----------------------------------------------------------------------- map
//   .  grass    h  hillside    ,  path    ~  river (the Kishon)    S  flood water    #  cliff

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
const ground = flood => makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (y >= 19 && y <= (flood ? 23 : 20)) return flood ? '~' : '~';
  if (flood && y >= 21 && y <= 23) return 'S';
  if (y <= 6 && x >= 24) return 'h';
  if (y === 13 && x < 28 || x === 20 && y >= 9 && y <= 18) return ',';
  return '.';
});
export const map = ground(false);
const FLOOD = ground(true);

export const start = [5, 16];
export const door = [3, 17];
export const barriers = [];

// -------------------------------------------------------------------- the petitioners and the army

// Listening to a petitioner, and calling a recruit: each says its piece, goes away, and counts.
const listen = async (g, who, scene) => {
  if (g.stepId !== 'cases') { await g.say('petition_idle'); return false; }
  await g.say(scene);
  g.hide(who);
  return true;
};
const counted = g => {
  g.state.heard = (g.state.heard || 0) + 1;
  if (g.state.heard >= 3) return g.signal('cases');
  g.goal(`Listen to the people waiting for Deborah: ${g.state.heard} of 3`, null);
};
const call = async (g, who, scene) => {
  if (g.stepId !== 'tabor') { await g.say('recruit_idle'); return false; }
  await g.say(scene);
  g.hide(who);
  return true;
};
const rallied = g => {
  g.state.rallied = (g.state.rallied || 0) + 1;
  if (g.state.rallied >= 3) return g.signal('tabor');
  g.goal(`Call the men of Naphtali and Zebulun to Mount Tabor: ${g.state.rallied} of 3`, null);
};

// -------------------------------------------------------------------- people

const israelite = (over = {}) => robe({ top: '#a9845a', ...over });
const sisera = (id, at, over = {}) => ({ id, name: "one of Sisera's men", at, dir: 'right', hidden: true, solid: false, look: soldier({ top: '#6a3a3a', skin: '#a06a42', head: 'helmet', ...over }) });

export const actors = [
  { id: 'deborah', name: 'Deborah', at: [20, 8], dir: 'down', chat: 'deborah_idle', look: lady('#3d6fb5', { skin: '#c98f62', hair: '#2a211c', head: 'cloth', headColor: '#e8e0cc' }) },
  { id: 'barak', name: 'Barak', at: [26, 12], dir: 'left', hidden: true, chat: 'barak_idle', look: soldier({ top: '#a9845a', head: 'band', headColor: '#7a2e2e', beard: true }) },
  { id: 'farmer', name: 'a farmer', at: [14, 12], dir: 'right', onUse: async g => { if (!(await listen(g, 'farmer', 'case_farmer'))) return; g.award('water_rights'); counted(g); }, look: israelite({ top: '#8a6a3a', beard: true }) },
  { id: 'widow', name: 'a widow', at: [12, 14], dir: 'right', onUse: async g => { if (!(await listen(g, 'widow', 'case_widow'))) return; g.award('widow_case'); counted(g); }, look: lady('#6a6a72', { hair: '#cfcfcf' }) },
  { id: 'brothers', name: 'two brothers', at: [14, 16], dir: 'right', onUse: async g => { if (!(await listen(g, 'brothers', 'case_brothers'))) return; g.award('inheritance_case'); counted(g); }, look: israelite({ top: '#4f8a6a', beard: true }) },
  { id: 'man1', name: 'a man of Naphtali', at: [8, 20], dir: 'right', hidden: true, onUse: async g => { if (!(await call(g, 'man1', 'recruit_one'))) return; g.award('naphtali'); rallied(g); }, look: israelite({ top: '#7d5a8a', beard: true }) },
  { id: 'man2', name: 'a man of Zebulun', at: [10, 17], dir: 'right', hidden: true, onUse: async g => { if (!(await call(g, 'man2', 'recruit_two'))) return; g.award('zebulun'); rallied(g); }, look: israelite({ top: '#3d6fb5' }) },
  { id: 'man3', name: 'a shepherd', at: [30, 15], dir: 'left', hidden: true, onUse: async g => { if (!(await call(g, 'man3', 'recruit_three'))) return; g.award('ten_thousand'); rallied(g); }, look: israelite({ top: '#c9893f' }) },
  { id: 'jael', name: 'Jael', at: [33, 13], dir: 'left', hidden: true, chat: 'jael_idle', look: lady('#8a3a3a', { skin: '#c98f62', hair: '#2a211c' }) },
  { id: 'sisera', name: 'Sisera', at: [4, 21], dir: 'right', hidden: true, chat: 'sisera_idle', look: soldier({ top: '#6a3a3a', skin: '#a06a42', head: 'plume', headColor: '#a33a2a', beard: true }) },
  sisera('foe1', [5, 19]), sisera('foe2', [6, 23]), sisera('foe3', [4, 17]),
  { id: 'scout', name: 'a scout', at: [18, 14], dir: 'right', onUse: discover('disc_scout', 'iron_chariots'), look: israelite({ top: '#6a6a72', head: 'band', headColor: '#2a211c' }) },
  { id: 'child', name: 'a child', at: [24, 15], dir: 'left', scale: 0.75, onUse: discover('disc_child', 'twenty_years'), look: robe({ top: '#d9b45a' }) },
];

// -------------------------------------------------------------------- things

export const objects = [
  { id: 'palm', type: 'palm', x: 19, y: 6 }, { type: 'palm', x: 22, y: 6 },
  { id: 'tabor', type: 'peak', x: 26, y: 1 },
  { type: 'tent', x: 5, y: 9 }, { type: 'tent', x: 9, y: 8 }, { type: 'tent', x: 12, y: 6 },
  { type: 'rock', x: 30, y: 10 }, { type: 'bigrock', x: 6, y: 13 }, { type: 'oak', x: 34, y: 16 },
];
const CHARIOTS = [{ id: 'chariot1', type: 'wagon', x: 5, y: 20 }, { id: 'chariot2', type: 'wagon', x: 8, y: 22 }, { id: 'chariot3', type: 'wagon', x: 11, y: 20 }];
const JAEL_TENT = { id: 'heber', type: 'tent', x: 34, y: 14 };

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'palm',
    goal: 'Talk to Deborah, under the palm tree.', marker: 'deborah',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'deborah' },
    async run(g) {
      await g.say('oppressed');
      g.award('again_evil');
      g.award('sold_to_jabin');
      await g.say('cried_out');
      g.award('cried_out');
      g.award('iron_chariots_q');
      await g.say('deborah');
      g.award('prophetess');
      g.award('palm_of_deborah');
      await g.say('petitioners');
    },
  },
  {
    id: 'cases', spawn: [18, 13],
    goal: 'Listen to the people waiting for Deborah: 0 of 3', marker: null,
    solve: ['farmer', 'widow', 'brothers'],
    trigger: { signal: 'cases' },
    async run(g) {
      await g.say('cases_done');
      g.award('judgment');
    },
  },
  {
    id: 'barak', spawn: [20, 11],
    begin(g) { g.show('barak'); g.place('barak', 24, 12, 'left'); },
    goal: 'Talk to Barak, whom Deborah has sent for.', marker: 'barak',
    trigger: { talk: 'barak' },
    async intro(g) { g.show('barak'); g.place('barak', 24, 12, 'left'); await g.say('barak_arrives'); },
    async run(g) {
      await g.say('summoned');
      g.award('commanding_you');
      g.award('mount_tabor');
      await g.say('if_you_go');
      g.award('if_you_go');
      await g.say('no_honor');
      g.award('no_honor');
    },
  },
  {
    id: 'tabor', spawn: [24, 13],
    enter(g) { g.show('barak'); g.place('barak', 24, 12, 'left'); },
    begin(g) { g.show('man1'); g.show('man2'); g.show('man3'); g.place('man1', 14, 15, 'right'); g.place('man2', 17, 17, 'right'); g.place('man3', 28, 15, 'left'); },
    goal: 'Call the men of Naphtali and Zebulun to Mount Tabor: 0 of 3', marker: null,
    solve: ['man1', 'man2', 'man3'],
    trigger: { signal: 'tabor' },
    async run(g) {
      await g.say('kedesh');
      g.award('kedesh');
      await g.say('ten_thousand');
      g.award('followed');
      await g.say('heber');
      g.award('heber');
    },
  },
  {
    id: 'valley', spawn: [24, 14],
    enter(g) { g.hide('man1'); g.hide('man2'); g.hide('man3'); },
    begin(g) { CHARIOTS.forEach(c => g.addProp(c)); for (const id of ['sisera', 'foe1', 'foe2', 'foe3']) g.show(id); g.place('sisera', 4, 21, 'right'); g.place('foe1', 5, 19, 'right'); g.place('foe2', 6, 23, 'right'); g.place('foe3', 4, 17, 'right'); },
    goal: 'Go down to the River Kishon, and watch from the bank.', marker: null,
    trigger: { zone: [14, 15, 22, 17] },
    async run(g) {
      g.place('player', 18, 16, 'down');
      for (const id of ['sisera', 'foe1', 'foe2', 'foe3']) g.show(id);
      await g.pan(8, 20, 900);
      await g.say('sisera_told');
      g.award('sisera_called');
      g.award('nine_hundred');
      await g.follow(700);
      await g.say('arise');
      g.award('arise');
      g.award('day_delivered');
      g.sky({ rain: true });
      g.shake(900, 0.005);
      g.walk('foe1', [[9, 20]], 60); g.walk('foe2', [[10, 22]], 60); g.walk('foe3', [[9, 18]], 60);
      await g.wait(1500);
      g.ground(FLOOD, 1400);
      await g.say('kishon');
      g.award('stars_fought');
      g.award('kishon_swept');
      for (const c of CHARIOTS) g.removeProp(c.id);
      for (const id of ['foe1', 'foe2', 'foe3']) g.hide(id);
      await g.say('routed');
      g.award('routed');
      g.sky({});
    },
  },
  {
    id: 'jael', spawn: [26, 14],
    enter(g) { g.ground(FLOOD, 0); for (const c of CHARIOTS) g.removeProp(c.id); for (const id of ['foe1', 'foe2', 'foe3']) g.hide(id); },
    begin(g) { g.addProp(JAEL_TENT); g.show('jael'); g.place('jael', 32, 14, 'left'); g.show('sisera'); g.place('sisera', 28, 16, 'right'); },
    goal: 'Follow Sisera to Heber\'s tent.', marker: null,
    trigger: { zone: [30, 14, 33, 16] },
    async run(g) {
      g.place('player', 29, 15, 'right');
      await g.say('fled');
      g.award('fled_on_foot');
      await g.say('jael_greets');
      g.award('jael');
      await g.say('milk');
      g.award('milk');
      await g.fadeOut(700);
      g.hide('sisera');
      await g.wait(600);
      g.sky({});
      await g.fadeIn(900);
      await g.say('subdued');
      g.award('subdued');
    },
  },
  {
    id: 'song', spawn: [20, 11],
    enter(g) { g.ground(FLOOD, 0); g.hide('sisera'); for (const c of CHARIOTS) g.removeProp(c.id); g.place('deborah', 20, 8, 'down'); g.addProp(JAEL_TENT); g.show('jael'); g.place('jael', 33, 13, 'left'); g.show('barak'); g.place('barak', 22, 10, 'left'); },
    begin(g) { g.show('barak'); g.place('barak', 22, 10, 'left'); },
    goal: 'Talk to Deborah and Barak.', marker: 'deborah',
    trigger: { talk: 'deborah' },
    async run(g) {
      await g.say('song');
      g.award('sang');
      await g.say('song2');
      g.award('volunteered');
      await g.say('peace');
      g.award('rest_forty');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
