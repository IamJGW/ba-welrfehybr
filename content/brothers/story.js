// Brothers Meet Again (Genesis 32-33): Jacob comes home after twenty years,
// afraid of Esau. His prayer, the gift herds sent ahead, the night he wrestles
// at the Jabbok and is named Israel, and Esau running to embrace him.
// The words are in dialogue.csv.

import { ANIMAL_HEADROOM } from '../../src/art.js';
import { robe, discover, makeMap } from '../../src/storykit.js';

export const id = 'brothers';
export const title = 'Brothers Meet Again';
export const where = 'The ford of the Jabbok, east of the Jordan';
export const ref = 'Genesis 32-33';
export const after = 'bethel';
export const place = [35.8, 32.2];   // Peniel, by the Jabbok

// ----------------------------------------------------------------------- map
// The Jabbok runs across the middle, too deep to cross except at the ford.
// Jacob's camp is on the north bank; Esau comes from the south.
//   #  cliff    .  grass    S  deep water    ~  the ford    h  hillside    ,  path

export const map = makeMap((x, y) => {
  if (x < 2 || x > 37 || y < 2 || y > 26) return '#';
  if (y === 13 || y === 14) return x >= 18 && x <= 21 ? '~' : 'S';
  if (y >= 15) return x >= 19 && x <= 20 || y === 22 && x >= 20 ? ',' : 'h';
  return '.';
});

export const start = [5, 9];
export const door = [3, 10];
export const barriers = [];

// -------------------------------------------------------------------- the gift

// Three herds go ahead to Esau, one at a time (Genesis 32:13-21).
const HERDS = [
  { kind: 'goat', ids: ['goat1', 'goat2'], at: [[28, 8], [30, 9]] },
  { kind: 'camel', ids: ['camel1', 'camel2'], at: [[32, 4], [34, 5]], scale: 1.3 },
  { kind: 'donkey', ids: ['donkey1', 'donkey2'], at: [[4, 12], [7, 12]] },
];
function useHerd(g, beast) {
  const herd = HERDS.find(h => h.ids.includes(beast.id));
  const sent = g.state.sent || [];
  if (g.stepId !== 'gifts' || sent.includes(herd.kind)) return g.note(g.text('look_herd'));
  if (g.state.led?.length) return g.note(g.text('one_herd'));
  g.trail(herd.ids[0], true);
  g.trail(herd.ids[1], herd.ids[0]);
  g.state.led = [...herd.ids];
  g.note(g.text('herd_follows'));
  g.goal('Take the herd to the drover at the ford.', 'drover');
}
function useDrover(g) {
  const led = g.state.led || [];
  if (g.stepId !== 'gifts') return g.say('drover_idle');
  if (!led.length) return g.say('drover_wait');
  const herd = HERDS.find(h => h.ids.includes(led[0]));
  led.forEach((id, i) => {
    g.trail(id, false);
    g.walk(id, [[19 + i, 12], [19 + i, 18], [30 + i * 2, 22], [37, 24]], 110).then(() => g.hide(id));
  });
  const sent = (g.state.sent ||= []);
  sent.push(herd.kind);
  g.state.led = [];
  g.note(g.text('herd_sent'), 2400);
  if (sent.length >= HERDS.length) return g.signal('gifts');
  g.goal(`Send the gift herds ahead to Esau: ${sent.length} of 3`);
}

// -------------------------------------------------------------------- people

const lady = (top, over = {}) => robe({ top, hairStyle: 'long', head: 'cloth', headColor: '#d9c9a3', ...over });
const animal = (id, kind, at, over = {}) => ({ id, name: `a ${kind}`, at, solid: false, look: { kind }, headroom: ANIMAL_HEADROOM, ...over });
const ESAU = robe({ top: '#8a5a32', skin: '#b5764a', hair: '#a8402c', beard: '#a8402c', hairStyle: 'curly', sash: '#3a2a1e' });
const MEN = [[25, 25], [27, 25], [29, 25], [31, 25], [26, 24], [30, 24], [33, 25], [23, 25]];

export const actors = [
  { id: 'jacob', name: 'Jacob', at: [15, 9], chat: 'jacob_idle', look: robe({ top: '#3d6fb5', sash: '#e3b93a', beard: true, hair: '#5a4a3a', item: 'staff' }) },
  { id: 'rachel', name: 'Rachel', at: [9, 8], dir: 'right', chat: 'rachel_idle', look: lady('#b05a8a') },
  { id: 'leah', name: 'Leah', at: [11, 10], dir: 'right', onUse: discover('disc_judah', 'judah'), look: lady('#5a8a6a') },
  { id: 'joseph', name: 'Joseph', at: [8, 9], dir: 'right', scale: 0.72, onUse: discover('disc_joseph', 'joseph'), look: robe({ top: '#e3b93a', sash: '#b05a8a' }) },
  { id: 'maid1', name: 'Bilhah', at: [5, 6], dir: 'down', chat: 'maid_idle', look: lady('#8f7a5c') },
  { id: 'maid2', name: 'Zilpah', at: [14, 6], dir: 'down', chat: 'maid_idle', look: lady('#7a6a8a') },
  { id: 'son1', name: 'Reuben', at: [13, 11], scale: 0.9, chat: 'son_idle', look: robe({ top: '#9a7a5a' }) },
  { id: 'son2', name: 'Judah', at: [18, 7], scale: 0.85, chat: 'son_idle', look: robe({ top: '#8a3a3a' }) },
  { id: 'messenger', name: 'a messenger', at: [22, 8], dir: 'left', onUse: discover('disc_camp', 'mahanaim'), look: robe({ top: '#a9845a', head: 'band', headColor: '#5d4526' }) },
  { id: 'drover', name: 'the drover', at: [20, 11], dir: 'up', onUse: useDrover, look: robe({ top: '#7f8f6a', skin: '#a06a42', item: 'staff' }) },
  { id: 'counter', name: 'a herdsman', at: [26, 10], dir: 'left', onUse: discover('disc_count', 'count'), look: robe({ top: '#9a7a5a', beard: true }) },
  { id: 'man', name: 'a man', at: [21, 10], hidden: true, look: robe({ top: '#d8d2c0', sash: '#a8a090', beard: '#8a8a8a', hair: '#8a8a8a' }) },
  { id: 'esau', name: 'Esau', at: [26, 25], hidden: true, chat: 'esau_idle', look: ESAU },
  ...MEN.map(([x, y], i) => ({ id: `man${i}`, name: "one of Esau's men", at: [x, y], hidden: true, onUse: g => (g.state.reunited ? discover('disc_kind', 'kind')(g) : g.say('men_wait')), look: robe({ top: i % 2 ? '#6a5a4a' : '#7a6a52', beard: true, item: 'spear' }) })),
  ...HERDS.flatMap(h => h.ids.map((id, i) => animal(id, h.kind, h.at[i], { label: `lead the ${h.kind}s`, scale: h.scale || 1, onUse: useHerd }))),
];

// -------------------------------------------------------------------- things

export const objects = [
  { type: 'bigtent', x: 4, y: 3 }, { type: 'tent', x: 11, y: 3 }, { type: 'tent', x: 17, y: 4 }, { type: 'ptent', x: 25, y: 3 },
  { type: 'fire', x: 12, y: 7 }, { type: 'tree', x: 34, y: 10 }, { type: 'tree', x: 3, y: 17 }, { type: 'bigrock', x: 30, y: 17 },
  { type: 'bush', x: 10, y: 19 }, { type: 'bush', x: 34, y: 20 }, { type: 'rock', x: 14, y: 24 },
];

// -------------------------------------------------------------------- scenes

const FAMILY_SOUTH = {
  maid1: [15, 17], maid2: [24, 17], son1: [16, 18], son2: [23, 18], leah: [14, 18], rachel: [12, 17], joseph: [11, 17],
};
const herdsGone = g => {
  if (g.state.herdsGone) return;
  g.state.herdsGone = true;
  HERDS.forEach(h => h.ids.forEach(id => { g.trail(id, false); g.hide(id); }));
};
const familyAcross = g => {
  if (g.state.across) return;
  herdsGone(g);
  g.state.across = true;
  for (const [id, [x, y]] of Object.entries(FAMILY_SOUTH)) g.place(id, x, y, 'down');
  for (const id of ['messenger', 'counter']) g.place(id, ...(id === 'messenger' ? [26, 17] : [28, 18]), 'down');
  g.place('drover', 22, 16, 'down');
  g.place('jacob', 20, 10, 'down');
};
const dawn = g => {
  if (g.state.dawn) return;
  familyAcross(g);
  g.state.dawn = true;
  g.sky();
  g.hide('man');
  g.place('jacob', 20, 19, 'down');
  g.setChat('jacob', 'israel_idle');
};
const esauComing = g => {
  if (g.state.esau) return;
  dawn(g);
  g.state.esau = true;
  g.show('esau');
  g.place('esau', 26, 25, 'up');
  MEN.forEach(([x, y], i) => { g.show(`man${i}`); g.place(`man${i}`, x, y, 'up'); });
  // Rachel and Joseph at the rear (Genesis 33:2).
  g.place('maid1', 18, 20, 'down'); g.place('maid2', 22, 20, 'down');
  g.place('son1', 17, 19, 'down'); g.place('son2', 23, 19, 'down');
  g.place('leah', 16, 18, 'down'); g.place('rachel', 13, 16, 'down'); g.place('joseph', 12, 16, 'down');
};
const reunited = g => {
  if (g.state.reunited) return;
  esauComing(g);
  g.state.reunited = true;
  g.place('jacob', 22, 22, 'right');
  g.place('esau', 23, 22, 'left');
  g.setChat('esau', 'esau_after');
};

export const steps = [
  {
    id: 'camp',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    goal: 'Talk to Jacob. He looks worried.', marker: 'jacob',
    trigger: { talk: 'jacob' },
    async run(g) {
      await g.say('news');
      await g.say('prayer');
      g.award('unworthy');
      await g.say('gift_plan');
    },
  },
  {
    id: 'gifts', spawn: [15, 11],
    goal: 'Send the gift herds ahead to Esau: 0 of 3', marker: 'drover',
    trigger: { signal: 'gifts' },
    async run(g) {
      await g.say('gifts_sent');
      g.award('gift');
      await g.fadeOut(900);
      g.sky({ night: true, stars: true });
      herdsGone(g);
      await g.fadeIn(900);
      await g.say('night');
    },
  },
  {
    id: 'ford', spawn: [17, 10],
    enter(g) { herdsGone(g); g.sky({ night: true, stars: true }); },
    begin(g) {
      if (g.state.across) return;
      for (const [id, [x, y]] of Object.entries(FAMILY_SOUTH)) g.walk(id, [[x < 20 ? 19 : 20, 12], [x < 20 ? 19 : 20, 16], [x, y]], 90);
    },
    goal: 'Cross the ford with Jacob\'s family.', marker: 'rachel',
    trigger: { zone: [12, 15, 28, 19] },
    async run(g) {
      familyAcross(g);
      g.face('player', 'up');
      await g.say('alone');
      // Across the water, in the dark, Jacob wrestles until daybreak.
      await g.pan(20, 10, 900);
      g.show('man');
      g.place('man', 21, 10, 'left');
      for (let i = 0; i < 5; i++) {
        g.walk('jacob', [[20.4, 10]], 60); await g.walk('man', [[20.8, 10]], 60);
        g.walk('jacob', [[19.8, 10.1]], 60); await g.walk('man', [[21.2, 10]], 60);
        g.shake(120, 0.003);
      }
      await g.say('wrestle');
      g.award('israel');
      await g.say('peniel');
      g.award('peniel');
      g.sky();
      g.hide('man');
      await g.wait(800);
      await g.walk('jacob', [[20, 12], [20, 19]], 45);
      await g.follow(600);
      await g.say('limping');
    },
  },
  {
    id: 'meet', spawn: [20, 17],
    enter(g) { dawn(g); },
    async intro(g) {
      esauComing(g);
      await g.pan(26, 22, 900);
      await g.say('four_hundred');
      await g.follow(600);
    },
    begin(g) { if (!g.state.reunited) g.walk('jacob', [[20, 22], [21, 22]], 40); },
    goal: 'Go with Jacob to meet his brother.', marker: 'jacob',
    trigger: { zone: [18, 21, 26, 24] },
    async run(g) {
      await g.walk('jacob', [[22, 22]], 50);
      g.face('jacob', 'right');
      await g.say('bowed');
      await g.walk('esau', [[26, 22], [23, 22]], 240);
      reunited(g);
      await g.say('embraced');
      g.award('ran');
      await g.say('who_are_these');
      g.award('face');
    },
  },
  {
    id: 'farewell', spawn: [20, 20],
    enter(g) { reunited(g); },
    goal: 'Talk to Jacob when you are ready to go.', marker: 'jacob',
    trigger: { talk: 'jacob' },
    async run(g) {
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
