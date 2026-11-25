// The Garden (Genesis 2-3): the man names the animals, the woman is made,
// the serpent, and the way out of the garden. The words are in dialogue.csv.

import { ANIMAL_HEADROOM } from '../../src/art.js';
import { discover, makeMap } from '../../src/storykit.js';

export const id = 'garden';
export const title = 'The Garden';
export const where = 'The garden in Eden';
export const ref = 'Genesis 2-3';
export const after = 'light';
export const place = [46.2, 31.75];   // Eden: Genesis 2:14 names the Tigris and Euphrates; where it was is not known

// ----------------------------------------------------------------------- map
// A river comes in from the north, fills a pool, and leaves as four streams.
// The way out of the garden is on the east side.
//   #  hedge    G  lush grass    f  flowers    ~  water

export const map = makeMap((x, y) => {
  if (y >= 15 && y <= 17 && x >= 37) return 'G';                        // the east gate
  if (x < 2 || x > 37 || y < 2 || y > 26) return '#';
  if ((x === 19 || x === 20) && y <= 9) return '~';                      // the river from Eden
  if (y === 9 && (x <= 18 || x >= 21)) return '~';                       // flowing west and east
  if ((x === 8 || x === 31) && y >= 10) return '~';                      // and south
  if ((x * 5 + y * 3) % 11 === 0) return 'f';
  return 'G';
});

export const start = [4, 21];
export const door = [3, 23];
export const barriers = [];

// -------------------------------------------------------------------- people and animals

const TO_NAME = ['deer', 'camel', 'ibex'];
const named = g => (g.state.named ||= []);
const following = g => (g.state.following ||= []);

function useAnimal(g, beast) {
  if (g.stepId !== 'names' || named(g).includes(beast.id) || following(g).includes(beast.id)) return g.note(g.text(`look_${beast.id}`));
  const line = following(g);
  g.trail(beast.id, line.length ? line[line.length - 1] : true);
  line.push(beast.id);
  g.note(g.text('animal_follows'));
}

async function useMan(g) {
  if (g.stepId !== 'names') return g.say('man_idle');
  const line = following(g);
  if (!line.length) return g.say('man_waiting');
  for (const beast of line) {
    g.trail(beast, false);
    named(g).push(beast);
    await g.say('naming');
    g.patrol(beast, null);
  }
  g.state.following = [];
  if (named(g).length >= TO_NAME.length) return g.signal('names');
  g.goal(`Help bring the animals to the man to be named: ${named(g).length} of 3`, 'man');
}

// Side task: carry water to the young plants (Genesis 2:15).
const water = g => (g.state.water ||= { carrying: false, done: [] });
function usePool(g) {
  if (['meet', 'names', 'woman'].indexOf(g.stepId) < 0 || water(g).done.length >= 3) return g.note(g.text('look_pool'));
  if (!water(g).carrying) {
    water(g).carrying = true;
    g.hold('jar');
    g.note(g.text('water_take'));
    g.task('Water the three young plants: ' + water(g).done.length + ' of 3');
  }
}
const useSprout = n => async (g, prop) => {
  const w = water(g);
  if (!w.carrying || w.done.includes(n)) return g.note(g.text(w.done.includes(n) ? 'sprout_done' : 'sprout_dry'));
  w.carrying = false;
  w.done.push(n);
  g.hold(null);
  g.removeProp(prop.id);
  g.addProp({ id: `bloom${n}`, type: 'bloom', x: prop.x, y: prop.y });
  if (w.done.length < 3) return g.task(`Water the three young plants: ${w.done.length} of 3`);
  g.task(null);
  await g.say('disc_tend');
  g.award('tend');
};

const PERSON = { kind: 'tunic', hair: '#2a1d14', top: '#5f8a3a' };
const animal = (id, kind, at, over = {}) => ({ id, name: `the ${kind}`, at, solid: false, look: { kind }, headroom: ANIMAL_HEADROOM, ...over });

export const actors = [
  { id: 'man', name: 'the man', at: [12, 21], dir: 'left', onUse: useMan, look: { ...PERSON, skin: '#b07a4e', hairStyle: 'short', beard: true } },
  { id: 'woman', name: 'the woman', at: [13, 21], hidden: true, onUse: discover('disc_wonderful', 'wonderful'), look: { ...PERSON, skin: '#b98256', hairStyle: 'long' } },
  { id: 'serpent', name: 'the serpent', at: [15, 17], hidden: true, look: { kind: 'serpent' }, headroom: ANIMAL_HEADROOM, scale: 1.2 },
  animal('deer', 'deer', [27, 5], { label: 'bring the deer', onUse: useAnimal, scale: 1.2 }),
  animal('camel', 'camel', [34, 22], { label: 'bring the camel', onUse: useAnimal, scale: 1.4 }),
  animal('ibex', 'ibex', [5, 25], { name: 'the wild goat', label: 'bring the wild goat', onUse: useAnimal }),
  animal('lion', 'lion', [24, 22], { scale: 1.3, onUse: g => g.note(g.text('look_lion')) }),
  animal('elephant', 'elephant', [33, 12], { scale: 1.9, onUse: g => g.note(g.text('look_elephant')) }),
  animal('lambkin', 'lamb', [16, 24], { onUse: g => g.note('Baa!') }),
  animal('dove', 'dove', [10, 12], { name: 'a dove', onUse: g => g.note(g.text('look_dove')) }),
];

// -------------------------------------------------------------------- things

function useKnowledge(g) {
  if (g.stepId === 'woman') return g.signal('trees');
  return g.note(g.text('look_knowtree'));
}

export const objects = [
  { id: 'knowtree', type: 'treeknow', x: 13, y: 15, label: 'look at the tree', onUse: useKnowledge },
  { id: 'lifetree', type: 'treelife', x: 24, y: 15, label: 'look at the tree', onUse: g => g.note(g.text('look_lifetree')) },
  { id: 'pool', type: 'flatstones', x: 18, y: 7, label: 'fill a jar at the river', onUse: usePool },
  { id: 'sprout1', type: 'sprout', x: 10, y: 18, label: 'water the young plant', onUse: useSprout(1) },
  { id: 'sprout2', type: 'sprout', x: 16, y: 21, label: 'water the young plant', onUse: useSprout(2) },
  { id: 'sprout3', type: 'sprout', x: 22, y: 19, label: 'water the young plant', onUse: useSprout(3) },
  { type: 'fruittree', x: 10, y: 5, label: 'look at the fruit trees', onUse: discover('disc_trees', 'trees') },
  { type: 'fruittree', x: 13, y: 4 }, { type: 'fruittree', x: 6, y: 6 },
  { type: 'rock', x: 3, y: 10, label: 'look at the glint in the water', onUse: discover('disc_gold', 'gold') },
  { type: 'rock', x: 36, y: 10, label: 'look at the river', onUse: discover('disc_rivers', 'rivers') },
  // Where the man and the woman hide.
  { type: 'tree', x: 30, y: 4 }, { type: 'tree', x: 32, y: 5 }, { type: 'tree', x: 34, y: 4 }, { type: 'tree', x: 29, y: 6 },
  { type: 'tree', x: 4, y: 14 }, { type: 'tree', x: 27, y: 24 }, { type: 'tree', x: 35, y: 24 }, { type: 'tree', x: 20, y: 24 },
  { type: 'palm', x: 15, y: 11 }, { type: 'palm', x: 25, y: 11 },
  { type: 'bush', x: 35, y: 14 }, { type: 'bush', x: 35, y: 18 },
];

// -------------------------------------------------------------------- scenes

const HIDE = { man: [31, 6], woman: [33, 6] };
const fallen = g => { g.setLook('man', { top: '#3f6a2a' }); g.setLook('woman', { top: '#3f6a2a' }); };
const clothed = g => { g.setLook('man', { top: '#8a6a45', sash: '#5a4430' }); g.setLook('woman', { top: '#8a6a45', sash: '#5a4430' }); };
const both = (g, fn) => ['man', 'woman'].forEach(fn);

export const steps = [
  {
    id: 'meet',
    goal: 'Talk to the man.', marker: 'man',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'man' },
    async run(g) {
      await g.say('garden');
      g.award('garden');
    },
  },
  {
    id: 'names', spawn: [11, 21],
    goal: 'Help bring the animals to the man to be named: 0 of 3', marker: 'man',
    async intro(g) { await g.say('animals'); },
    trigger: { signal: 'names' },
    async run(g) {
      await g.say('named');
      g.award('names');
    },
  },
  {
    id: 'woman', spawn: [11, 21],
    enter(g) { g.show('woman'); g.place('woman', 13, 21, 'left'); },
    async intro(g) {
      await g.say('sleep');
      await g.fadeOut(700);
      g.show('woman');
      g.place('woman', 13, 21, 'left');
      g.face('man', 'right');
      await g.fadeIn(700);
      await g.say('woman');
      g.award('woman');
    },
    goal: 'Explore the garden. Find the two trees in the middle.', marker: 'knowtree',
    trigger: { signal: 'trees' },
    async run(g) {
      await g.say('trees');
      // The serpent.
      g.walk('woman', [[14, 18], [15, 18]], 90);
      await g.walk('man', [[13, 19], [14, 19]], 90);
      g.face('woman', 'up');
      g.show('serpent');
      g.place('serpent', 15, 17, 'left');
      await g.say('serpent');
      await g.say('ate');
      fallen(g);
      await g.say('opened');
      g.award('doubt');
    },
  },
  {
    id: 'hide', spawn: [14, 20],
    enter(g) {
      fallen(g); g.hide('serpent');
      g.state.presence ||= true;
      both(g, who => g.place(who, ...HIDE[who], 'down'));
    },
    async intro(g) {
      // The LORD God walking in the garden in the breeze of the day.
      const p = g.player;
      const breeze = g.fx('glow', p.x + 300, p.y - 40).setAlpha(0).setScale(1.6);
      g.tween({ targets: breeze, alpha: 0.8, x: p.x + 120, duration: 1600 });
      await g.say('hear');
      g.state.breeze = breeze;
      g.hide('serpent');
      g.walk('woman', [[16, 12], [33, 7], HIDE.woman], 140);
      await g.walk('man', [[15, 12], [31, 7], HIDE.man], 140);
      g.face('man', 'down'); g.face('woman', 'down');
    },
    goal: 'The man and the woman have hidden among the trees. Find them.',
    trigger: { talk: 'man' },
    async run(g) {
      const breeze = g.state.breeze;
      if (breeze?.active) g.tween({ targets: breeze, x: g.actor('man').x, y: g.actor('man').y - 60, duration: 900 });
      await g.say('where');
      await g.say('promise');
      g.award('promise');
      await g.say('dust');
      clothed(g);
      await g.say('clothed');
      g.award('clothed');
      if (breeze?.active) g.tween({ targets: breeze, alpha: 0, duration: 900 }).then(() => breeze.destroy());
    },
  },
  {
    id: 'leave', spawn: [31, 8],
    enter(g) {
      fallen(g); clothed(g); g.hide('serpent');
      // They walk ahead slowly; the player can pass them without being blocked.
      both(g, who => { g.place(who, ...HIDE[who], 'down'); g.actor(who).solid = false; });
    },
    begin(g) {
      g.walk('woman', [[33, 10], [36, 16]], 70);
      g.walk('man', [[31, 10], [35, 16]], 70);
    },
    goal: 'Walk with them to the east side of the garden.',
    trigger: { zone: [32, 13, 37, 19] },
    async run(g) {
      await Promise.all([g.arrive('man'), g.arrive('woman')]);
      await g.walk('man', [[39, 16]], 60).then(() => g.hide('man'));
      g.walk('woman', [[39, 15]], 60).then(() => g.hide('woman'));
      await g.wait(900);
      const flame = g.fx('flame', 38 * g.T, 16 * g.T).setAlpha(0).setScale(1.2);
      await g.tween({ targets: flame, alpha: 1, duration: 900 });
      g.tween({ targets: flame, scaleX: 1.35, duration: 500, yoyo: true, repeat: -1 });
      await g.say('sent_out');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
