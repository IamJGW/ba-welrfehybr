// The Valley of Elah (1 Samuel 17): where everything is, and what happens when.
// The words people say are in dialogue.csv. This file only places things and
// orders the scenes.

import { BRONZE, ANIMAL_HEADROOM } from '../../src/art.js';

export const id = 'elah';
export const title = 'The Valley of Elah';
export const where = 'Israel, in the days of King Saul';
export const ref = '1 Samuel 17';
export const after = 'music';   // this story opens once that one is finished
export const place = [34.96, 31.69];   // the Valley of Elah, as [longitude, latitude], for the map

// ----------------------------------------------------------------------- map
// 40 tiles wide, 28 tall. North is up.
//   #  cliff      h  hillside      :  valley floor     o  pebble bank
//   ~  brook      .  grass         ,  path

const full = ch => '##' + ch.repeat(36) + '##';
const withPath = ch => '##' + ch.repeat(16) + ',,' + ch.repeat(18) + '##';

export const map = [
  '#'.repeat(40), '#'.repeat(40),
  full('h'), full('h'), full('h'), full('h'),                      // 2-5   the Philistines' hill
  full(':'), full(':'), full(':'), full(':'),                      // 6-9   the valley floor
  full('o'),                                                       // 10    far bank
  full('~'), full('~'),                                            // 11-12 the brook
  full('o'),                                                       // 13    near bank
  withPath('h'),                                                   // 14    slope below Israel's line
  withPath('.'), withPath('.'), withPath('.'),                     // 15-17 the battle line
  withPath('.'), withPath('.'), withPath('.'),                     // 18-20 the camp
  '##' + '.'.repeat(5) + ','.repeat(27) + '.'.repeat(4) + '##',    // 21    track through the camp
  withPath('.'), withPath('.'),                                    // 22-23
  ','.repeat(20) + '.'.repeat(18) + '##',                          // 24    the road from Bethlehem
  full('.'), full('.'),                                            // 25-26
  '#'.repeat(40),
];

export const start = [3, 24];
export const door = [2, 25];   // the time door, the way back to the time device

// Invisible walls. "bump" is the conversation shown when the player walks into one.
export const barriers = [
  { id: 'line', tiles: [2, 14, 37, 14], bump: 'bump_line' },
  { id: 'valley', tiles: [0, 0, 39, 9], bump: 'bump_valley' },
  { id: 'road', tiles: [0, 24, 1, 24], bump: 'bump_road' },
];

// -------------------------------------------------------------------- people

const tunic = (over = {}) => ({
  kind: 'tunic', skin: '#c98f62', hair: '#2a211c', hairStyle: 'short', top: '#a9845a', sash: '#5d4526', ...over,
});
const soldier = (over = {}) => tunic({ beard: true, head: 'band', item: 'spear', ...over });
const philistine = (over = {}) => tunic({
  top: '#7a3030', sash: '#3a2020', beard: true, head: 'plume', headColor: '#c94f3d', item: 'spear', ...over,
});

const SKINS = ['#c98f62', '#a06a42', '#e8b68c'];
const TUNICS = ['#a9845a', '#8f7a5c', '#b59a6e'];

// Where Israel's men stand on the battle line, and where they run to.
const LINE = {
  soldier0: [6, 15], soldier1: [8, 15], soldier2: [11, 15], soldier3: [14, 15],
  soldier4: [23, 15], soldier5: [26, 15], soldier6: [29, 15],
  eliab: [17, 15], abinadab: [20, 15], shammah: [21, 16], commander: [33, 15],
};
const FLED = {
  soldier0: [6, 17], soldier1: [8, 18], soldier2: [12, 18], soldier3: [14, 17],
  soldier4: [23, 17], soldier5: [26, 18], soldier6: [29, 17],
  eliab: [16, 17], abinadab: [21, 17], shammah: [22, 18], commander: [34, 17],
};
const ARMY = Object.keys(LINE);
const PHILISTINES = [7, 11, 15, 24, 28, 32];

const discover = (scene, badge) => async g => { await g.say(scene); g.award(badge); };
const tell = scene => g => g.say(scene);

// Side task: water for the men at the front. Any three soldiers on the line
// will do, and each one says what is on his mind.
const waterTask = g => (g.state.water ||= { stage: 'none', served: new Set() });

const lineSoldier = n => async (g, me) => {
  const water = waterTask(g);
  if (g.stepId === 'farewell') return g.say('soldier_after');
  if (water.stage !== 'carrying' || water.served.has(me.id)) return g.say(`soldier_${n}`);
  water.served.add(me.id);
  await g.say(`water_${water.served.size}`);
  if (water.served.size < 3) return g.task(`Take water to three soldiers at the front: ${water.served.size} of 3`);
  water.stage = 'done';
  g.hold(null);
  g.task(null);
  await g.say('disc_afraid');
  g.award('afraid');
};

async function useCook(g) {
  const water = waterTask(g);
  if (g.stepId === 'meet' || g.stepId === 'supplies') return g.say('cook_busy');
  if (g.found('afraid') || water.stage === 'done') return g.say('cook_done');
  if (g.stepId === 'farewell') return g.say('cook_after');
  if (water.stage === 'carrying') return g.say('cook_remind');
  await g.say('cook_ask');
  water.stage = 'carrying';
  g.hold('jar');
  g.task('Take water to three soldiers at the front: 0 of 3');
}

// Side task: something is bleating behind the tents. Bring it to the soldier
// who heard it, and it stays with you as a companion.
const lambTask = g => (g.state.lamb ||= { stage: 'none' });

async function useLamb(g) {
  const lamb = lambTask(g);
  if (lamb.stage !== 'none') return g.note('Baa!');
  lamb.stage = 'following';
  g.trail('lamb');
  await g.say('lamb_found');
  g.task('Take the lamb to the soldier by the fire');
}

async function useFireside(g) {
  const lamb = lambTask(g);
  if (lamb.stage === 'following') {
    lamb.stage = 'done';
    g.task(null);
    await g.say('lamb_done');
    g.award('lamb');
    g.adopt('lamb');
    return;
  }
  if (lamb.stage === 'done' || g.found('lamb')) return g.say('soldier_fire');
  await g.say('lamb_ask');
  g.task('Find what is bleating behind the tents');
}

const brother = name => async g => {
  await g.say(`brother_${name}`);
  const met = (g.state.brothers ||= new Set());
  met.add(name);
  if (met.size === 3 && !g.state.brothersDone) {
    g.state.brothersDone = true;
    await g.say('disc_brothers');
    g.award('brothers');
  }
};

// Looks that the mini-games borrow.
export const looks = {
  goliath: tunic({ top: '#5a2e2e', armor: BRONZE, greaves: true, head: 'helmet', beard: true, item: 'spear', javelin: true }),
  bearer: philistine({ item: 'shield' }),
};

export const actors = [
  {
    id: 'david', name: 'David', at: [7, 24], dir: 'left', scale: 0.92, chat: 'david_idle',
    look: tunic({ hair: '#7a3b22', hairStyle: 'curly', top: '#e3d6b0', sash: '#8a5a2b', item: 'bundle' }),
  },
  {
    id: 'quartermaster', name: 'the quartermaster', at: [7, 20], chat: 'quartermaster_idle',
    look: tunic({ top: '#b9a27a', head: 'cloth', headColor: '#e9e2cf', hair: '#b9b9b9', beard: '#b9b9b9' }),
  },
  {
    id: 'saul', name: 'King Saul', at: [32, 20], scale: 1.1, chat: 'saul_idle',
    look: tunic({ top: '#6b3fa0', sash: '#e3b93a', head: 'crown', beard: true }),
  },
  { id: 'eliab', name: 'Eliab', at: LINE.eliab, dir: 'up', look: soldier({ top: '#8f6f4e' }), onUse: brother('eliab') },
  { id: 'abinadab', name: 'Abinadab', at: LINE.abinadab, dir: 'up', look: soldier({ skin: '#a06a42' }), onUse: brother('abinadab') },
  { id: 'shammah', name: 'Shammah', at: LINE.shammah, dir: 'up', look: soldier({ top: '#b59a6e', beard: false }), onUse: brother('shammah') },
  ...ARMY.filter(n => n.startsWith('soldier')).map((n, i) => ({
    id: n, name: 'a soldier', at: LINE[n], dir: 'up', onUse: lineSoldier((i % 3) + 1),
    look: soldier({ skin: SKINS[i % 3], top: TUNICS[i % 3] }),
  })),

  // People with something to discover.
  { id: 'tally', name: 'a soldier', at: [4, 16], dir: 'left', look: soldier({ item: null }), onUse: discover('disc_forty', 'forty') },
  { id: 'measurer', name: 'a soldier', at: [28, 23], look: soldier({ skin: '#a06a42' }), onUse: discover('disc_height', 'height') },
  { id: 'fireside1', name: 'a soldier', at: [12, 22], dir: 'right', look: soldier({ item: null }), onUse: discover('disc_reward', 'reward') },
  { id: 'fireside2', name: 'a soldier', at: [14, 22], dir: 'left', look: soldier({ item: null, skin: '#e8b68c' }), onUse: useFireside },
  {
    id: 'commander', name: 'the commander', at: LINE.commander, dir: 'up', onUse: discover('disc_terms', 'terms'),
    look: soldier({ top: '#6f5a45', head: 'helmet', item: null }),
  },
  {
    id: 'cook', name: 'the cook', at: [7, 25], dir: 'left', onUse: useCook,
    look: tunic({ top: '#9a8a6a', head: 'cloth', headColor: '#c9b48a' }),
  },
  {
    id: 'lamb', name: 'a lamb', label: 'look at the lamb', at: [36, 24], dir: 'left', solid: false,
    look: { kind: 'lamb' }, headroom: ANIMAL_HEADROOM, onUse: useLamb,
  },
  {
    id: 'armorer', name: 'the armorer', at: [25, 19], onUse: discover('disc_mail', 'mail'),
    look: tunic({ top: '#7d6a55', beard: true, head: 'band', headColor: '#3a3a3a' }),
  },

  // The Philistines. Goliath and his shield bearer stay out of sight until their scenes.
  {
    id: 'goliath', name: 'Goliath', at: [19, 3], scale: 1.8, hidden: true, solid: false, look: looks.goliath,
  },
  { id: 'bearer', name: 'Shield bearer', at: [18, 4], hidden: true, solid: false, look: looks.bearer },
  ...PHILISTINES.map((x, i) => ({ id: `philistine${i}`, name: 'Philistine', at: [x, 5], solid: false, look: philistine() })),
];

// -------------------------------------------------------------------- things

async function useHelmet(g) {
  if (!g.state.helmetOpen) return g.say('helmet_locked');
  await g.say('helmet_on');
  g.dark(true);
  await g.wait(1300);
  await g.say('helmet_off');
  g.dark(false);
  g.award('helmet');
}

async function useLookout(g) {
  await g.say('lookout_climb');
  await g.pan(19.5, 8, 1300);
  await g.say('disc_hills');
  await g.follow(900);
  g.award('hills');
}

function useStone(g, stone) {
  if (g.stepId !== 'stones') return g.note(g.text('stone_idle'));
  if (!stone.smooth) return g.note(g.text(`stone_rough${stone.rough}`));
  g.removeProp(stone.id);
  g.state.stones = (g.state.stones || 0) + 1;
  g.note(g.text('stone_smooth'));
  if (g.state.stones >= 5) g.signal('stones');
  else g.goal(`Find smooth stones in the brook: ${g.state.stones} of 5`);
}

// Just for fun: skip a flat stone across the brook.
async function skipStone(g) {
  const skips = 1 + Math.floor(Math.random() * 7);
  const stone = g.fx('pebble', g.player.x, g.player.y - 18);
  for (let i = 0; i < skips; i++) await g.tween({ targets: stone, y: stone.y - 10, duration: 120, ease: 'Quad.easeOut' });
  await g.tween({ targets: stone, alpha: 0, duration: 160 });
  stone.destroy();
  g.state.bestSkips = Math.max(g.state.bestSkips || 0, skips);
  g.note(skips === 1 ? 'Plop. One skip.' : `${skips} skips! Your best: ${g.state.bestSkips}`);
}

// Stones in the brook: [x, y, smooth?, which "rough" line to show]
const STONES = [
  [5, 11.2, true], [7, 12.1, false, 1], [9, 11.9, true], [11, 11.1, false, 2], [13, 11.3, true],
  [15, 12.2, false, 3], [17, 11.6, true], [21, 12.0, false, 1], [23, 11.2, true], [25, 12.2, false, 2],
  [27, 11.4, true], [29, 12.1, false, 3], [31, 11.5, true], [33, 11.9, false, 1],
];

export const objects = [
  // Israel's camp
  { type: 'tent', x: 4, y: 19 },
  { type: 'jars', x: 6, y: 19, label: 'look in the jars', onUse: tell('look_grain') },
  { type: 'tent', x: 10, y: 19, label: 'peek inside', onUse: tell('look_tent') },
  { type: 'tent', x: 15, y: 20 }, { type: 'tent', x: 22, y: 20 },
  { type: 'tent', x: 24, y: 23 }, { type: 'tent', x: 3, y: 22 }, { type: 'tent', x: 35, y: 22 },
  { type: 'bigtent', x: 31, y: 18, reach: 64, label: "listen at the king's tent", onUse: tell('look_kingtent') },
  { type: 'fire', x: 13, y: 22, label: 'warm your hands', onUse: tell('look_fire') },
  { type: 'anvil', x: 26, y: 19 },
  { type: 'rack', x: 27, y: 19, label: 'try to lift a spear', onUse: discover('disc_spear', 'spear') },
  { type: 'pole', x: 29, y: 23, label: 'stand next to the pole', onUse: discover('disc_height', 'height') },
  { type: 'pot', x: 6, y: 25, label: 'smell the stew', onUse: tell('look_pot') },
  { type: 'jars', x: 5, y: 25 },
  { type: 'flatstones', x: 25, y: 13, label: 'skip a stone', onUse: skipStone },
  { id: 'armorstand', type: 'armorstand', x: 34, y: 19, label: "look at the king's armor", onUse: useHelmet },
  { id: 'post', type: 'post', x: 3, y: 16, label: 'look at the post', onUse: discover('disc_forty', 'forty') },
  { id: 'lookout', type: 'bigrock', x: 35, y: 15, reach: 60, label: 'climb the rock', onUse: useLookout },
  { type: 'tree', x: 2, y: 18, label: 'look at the tree', onUse: tell('look_tree') },
  { type: 'tree', x: 37, y: 20 }, { type: 'tree', x: 9, y: 26 },
  { type: 'tree', x: 12, y: 26 }, { type: 'tree', x: 22, y: 26 }, { type: 'tree', x: 31, y: 25 }, { type: 'tree', x: 37, y: 26 },

  // The valley
  { type: 'tree', x: 4, y: 7 }, { type: 'tree', x: 34, y: 8 }, { type: 'tree', x: 28, y: 6 },
  { type: 'rock', x: 12, y: 7 }, { type: 'rock', x: 25, y: 9 }, { type: 'rock', x: 8, y: 9 }, { type: 'rock', x: 31, y: 7 },
  { type: 'rock', x: 3, y: 13 }, { type: 'rock', x: 36, y: 10 },

  // The Philistines' camp
  { type: 'ptent', x: 5, y: 3 }, { type: 'ptent', x: 11, y: 2 }, { type: 'ptent', x: 26, y: 2 }, { type: 'ptent', x: 33, y: 3 },

  ...STONES.map(([x, y, smooth, rough], i) => ({
    id: `stone${i}`, type: smooth ? 'stoneSmooth' : 'stoneRough', x, y, smooth, rough,
    scale: 1.5, reach: 30, label: 'check the stone', onUse: useStone,
  })),
];

// -------------------------------------------------------------------- scenes

const toLine = g => ARMY.forEach(n => g.place(n, ...LINE[n], 'up'));
const toFled = g => ARMY.forEach(n => g.place(n, ...FLED[n], 'up'));
const hideGiant = g => { g.hide('goliath'); g.hide('bearer'); };
const bringGiant = g => {
  g.show('goliath'); g.show('bearer');
  g.place('goliath', 19, 3, 'down'); g.place('bearer', 18, 4, 'down');
};

// David tries to walk in the king's armor.
async function wobble(g) {
  const david = g.actor('david');
  g.walk('david', [[29, 20]], 25);
  await g.tween({ targets: david.sprite, angle: { from: -9, to: 9 }, duration: 170, yoyo: true, repeat: 5 });
  david.sprite.setAngle(0);
  await g.arrive('david');
}

async function sling(g) {
  const david = g.actor('david'), goliath = g.actor('goliath');
  const stone = g.fx('pebble', david.x, david.y - 44);
  const spin = { a: 0 };
  await g.tween({
    targets: spin, a: Math.PI * 6, duration: 900, ease: 'Quad.easeIn',
    onUpdate: () => stone.setPosition(david.x + Math.cos(spin.a) * 13, david.y - 44 + Math.sin(spin.a) * 5),
  });
  const head = goliath.sprite.getTopCenter();
  await g.tween({ targets: stone, x: head.x, y: head.y + 22, duration: 170 });
  stone.destroy();
  g.flash(140);
  g.shake(160, 0.006);
}

async function fall(g) {
  const goliath = g.actor('goliath');
  await g.wait(350);
  await g.tween({ targets: goliath.sprite, angle: 90, duration: 520, ease: 'Quad.easeIn' });
  g.shake(380, 0.012);
  const dust = g.fx('dust', goliath.x + 50, goliath.y - 6);
  g.tween({ targets: dust, alpha: 0, y: dust.y - 14, scale: 1.6, duration: 900 }).then(() => dust.destroy());
}

// Each step: where things stand when it begins (enter), what the player is
// asked to do (goal, trigger), and the scene that follows (run).
export const steps = [
  {
    id: 'meet',
    goal: 'Talk to the boy on the road.', marker: 'david',
    // The lost lamb is only there to find once.
    enter(g) { if (g.found('lamb')) g.hide('lamb'); },
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'david' },
    async run(g) {
      await g.say('meet_david');
      g.hold('bundle');
    },
  },
  {
    id: 'supplies', spawn: [8, 25],
    goal: 'Carry the cheese to the quartermaster.', marker: 'quartermaster',
    enter(g) { g.hold('bundle'); },
    begin(g) { g.walk('david', [[9, 24], [9, 21], [6, 21], [5, 20]], 160).then(() => g.face('david', 'right')); },
    trigger: { talk: 'quartermaster' },
    async run(g) {
      await g.arrive('david');
      g.hold(null);
      g.setLook('david', { item: 'bag' });
      await g.say('quartermaster');
      g.award('cheese');
    },
  },
  {
    id: 'line', spawn: [8, 22],
    goal: 'Follow David to the battle line.', marker: 'david',
    enter(g) {
      g.place('david', 5, 20, 'right');
      g.hold(null);
      g.setLook('david', { item: 'bag' });
    },
    begin(g) { g.walk('david', [[6, 21], [18, 21], [18, 17], [19, 16]], 170).then(() => g.face('david', 'up')); },
    trigger: { talk: 'david' },
    async run(g) {
      await g.arrive('david');
      g.face('david', 'up');
      bringGiant(g);
      await g.pan(19.5, 9, 1300);
      g.walk('bearer', [[18, 8]], 55);
      const coming = g.walk('goliath', [[19, 7]], 45, { stomp: true });
      await g.say('brothers_greet');
      await coming;
      await g.say('goliath_challenge');

      await g.pan(19.5, 14, 800);
      await Promise.all(ARMY.map((n, i) => g.wait(i * 60).then(() => g.walk(n, [FLED[n]], 230))));
      ARMY.forEach(n => g.face(n, 'up'));
      await g.say('israel_flees');

      g.walk('bearer', [[18, 4]], 70);
      g.walk('goliath', [[19, 3]], 60).then(() => { if (g.stepId === 'line') hideGiant(g); });
      await g.follow(700);
      await g.say('david_asks');
      g.award('champion');
    },
  },
  {
    id: 'saul', spawn: [19, 17],
    goal: "Go with David to King Saul's tent.", marker: 'saul',
    enter(g) { g.place('david', 19, 16, 'down'); toFled(g); hideGiant(g); },
    begin(g) { g.walk('david', [[19, 21], [30, 21], [30, 20]], 170).then(() => g.face('david', 'right')); },
    trigger: { talk: 'saul' },
    async run(g) {
      await g.arrive('david');
      g.face('david', 'right');
      g.face('saul', 'left');
      await g.say('saul');
      await g.say('armor_on');
      g.setLook('david', { armor: BRONZE, head: 'helmet', item: null });
      await g.wait(500);
      await wobble(g);
      await g.say('armor_off');
      g.setLook('david', { armor: null, head: null, item: 'bag' });
      g.award('armor');
      g.face('saul', 'down');
      await g.say('to_brook');
    },
  },
  {
    id: 'brook', spawn: [31, 21],
    goal: 'Go down to the brook with David.', marker: 'david',
    enter(g) {
      g.place('david', 29, 20, 'down');
      g.barrier('line', false);
      g.state.helmetOpen = true;
      g.setChat('saul', 'saul_after');
    },
    begin(g) { g.walk('david', [[29, 21], [19, 21], [19, 13]], 180).then(() => g.face('david', 'up')); },
    trigger: { talk: 'david' },
    async run(g) {
      await g.arrive('david');
      await g.say('brook_intro');
    },
  },
  {
    id: 'stones', spawn: [20, 13],
    goal: 'Find smooth stones in the brook: 0 of 5',
    enter(g) {
      g.place('david', 19, 13, 'up');
      g.setChat('david', 'david_brook');
      g.state.stones = 0;
    },
    trigger: { signal: 'stones' },
    async run(g) {
      await g.say('stones_done');
      g.award('stones');
    },
  },
  {
    id: 'duel', spawn: [20, 13],
    enter(g) { g.place('david', 19, 13, 'up'); },
    async run(g) {
      await g.say('duel_watch');
      await g.fadeOut(350);
      toLine(g);
      g.place('player', 19, 16, 'up');
      g.setLook('david', { item: 'staff' });
      bringGiant(g);
      g.snap(19.5, 9);
      await g.fadeIn(350);

      const davidWalk = g.walk('david', [[19, 10]], 60);
      g.walk('bearer', [[18, 7]], 50);
      const goliathWalk = g.walk('goliath', [[19, 6]], 40, { stomp: true });
      await g.say('duel_approach');
      await Promise.all([davidWalk, goliathWalk]);
      await g.say('duel_words');

      // 1 Samuel 17:48: Goliath starts forward and David runs to meet him.
      await Promise.all([g.walk('goliath', [[19, 7]], 45, { stomp: true }), g.walk('david', [[19, 9]], 190)]);

      await g.say('duel_sling');
      await sling(g);
      await fall(g);
      await g.say('duel_fall');

      g.walk('bearer', [[18, 1]], 260).then(() => g.hide('bearer'));
      PHILISTINES.forEach((x, i) => g.walk(`philistine${i}`, [[x, 1]], 240).then(() => g.hide(`philistine${i}`)));
      await g.wait(1100);
      await g.say('philistines_run');
      ARMY.forEach((n, i) => g.wait(i * 50).then(() => g.walk(n, [[LINE[n][0], 9]], 250)));
      await g.wait(1700);
      g.award('battle');
      await g.wait(2200);
      await g.fadeOut(600);
    },
  },
  {
    id: 'farewell', spawn: [20, 17],
    goal: 'Talk to David.', marker: 'david',
    enter(g) {
      toLine(g);
      hideGiant(g);
      g.actor('goliath').sprite.setAngle(0);
      PHILISTINES.forEach((x, i) => g.hide(`philistine${i}`));
      g.place('david', 19, 16, 'left');
      g.place('saul', 18, 16, 'right');
      g.setLook('david', { item: 'bag' });
      g.barrier('line', false);
      g.state.helmetOpen = true;
      // Nobody needs water carried to them now.
      if (waterTask(g).stage === 'carrying') { waterTask(g).stage = 'none'; g.hold(null); g.task(null); }
    },
    async intro(g) {
      g.place('player', 20, 17, 'left');
      await g.follow(1);
      await g.fadeIn(500);
    },
    trigger: { talk: 'david' },
    async run(g) {
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
