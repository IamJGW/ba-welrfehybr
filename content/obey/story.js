// To Obey Is Better (1 Samuel 15): God sends Saul against the Amalekites, Saul
// spares the best of the flocks, and Samuel tells him that obedience is better than
// sacrifice. The fighting and Agag's end are not shown. There is a note for
// parents. The words are in dialogue.csv.

import { robe, lady, discover, makeMap, animal, soldier, taps } from '../../src/storykit.js';

export const id = 'obey';
export const title = 'To Obey Is Better';
export const where = 'Saul\'s camp at Gilgal, and Carmel';
export const ref = '1 Samuel 15';
export const place = [35.44, 31.87];   // Gilgal
export const after = 'cliff';

// ----------------------------------------------------------------------- map
//   .  grass    s  desert    ,  path    #  cliff

const edge = (x, y) => x < 2 || x > 37 || y < 2 || y > 26;
export const map = makeMap((x, y) => {
  if (edge(x, y)) return '#';
  if (y === 14 && x < 30 || x === 14 && y >= 6 && y <= 14) return ',';
  return (x * 5 + y * 3) % 19 === 0 ? 'x' : '.';
});

export const start = [5, 22];
export const door = [3, 23];
export const barriers = [];

// -------------------------------------------------------------------- the jobs

const pack = taps('pack', { step: 'kenites', total: 3, goal: 'Help the Kenites pack their tents' });
const PACKS = [[24, 16], [27, 19], [30, 16]].map(([x, y], i) => ({ id: `kpack${i + 1}`, type: 'sacks', x, y, label: 'help pack', onUse: pack }));
const looked = taps('best', { step: 'spared', total: 3, goal: 'Look at the animals the soldiers kept', keep: true });
const lamb = (id, at, kind = 'lamb', over = {}) => animal(id, kind, at, { name: kind === 'lamb' ? 'a fat lamb' : 'a fat calf', scale: kind === 'calf' ? 1.2 : 1, ...over });

// -------------------------------------------------------------------- people

const israelite = (over = {}) => robe({ top: '#a9845a', ...over });

export const actors = [
  { id: 'samuel', name: 'Samuel', at: [8, 14], dir: 'right', chat: 'samuel_idle', look: robe({ top: '#f4f1e6', sash: '#c0415a', beard: true, hair: '#cfcfcf', head: 'cloth', headColor: '#e8e0cc' }) },
  { id: 'saul', name: 'King Saul', at: [20, 12], dir: 'down', hidden: false, chat: 'saul_idle', look: robe({ top: '#8a3a3a', beard: true, sash: '#e3b93a', head: 'crown' }), scale: 1.1 },
  { id: 'kenite', name: 'a Kenite elder', at: [26, 14], dir: 'left', onUse: discover('disc_kenite', 'kindness'), look: robe({ top: '#7d5a8a', skin: '#a06a42', beard: true, hair: '#e8e8e8' }) },
  { id: 'soldier1', name: 'a soldier', at: [12, 20], dir: 'right', onUse: discover('disc_soldier', 'two_hundred_thousand'), look: soldier({ top: '#a9845a' }) },
  { id: 'soldier2', name: 'a soldier', at: [18, 22], dir: 'left', onUse: discover('disc_soldier2', 'unwilling'), look: soldier({ top: '#8a6a3a' }) },
  { id: 'agag', name: 'a prisoner', at: [6, 20], dir: 'right', hidden: true, onUse: discover('disc_agag', 'captured_alive'), look: robe({ top: '#6a3a3a', skin: '#a06a42', beard: true, head: 'plume', headColor: '#a33a2a' }) },
  { id: 'servant', name: 'a servant of Samuel', at: [10, 18], dir: 'right', onUse: discover('disc_servant', 'distressed'), look: israelite({ top: '#4f8a6a' }) },
  lamb('lamb1', [16, 18]), lamb('lamb2', [20, 19]), lamb('calf1', [24, 20], 'calf'), lamb('lamb3', [28, 22]),
];
// The animals Saul spared, in the pen at Gilgal.
const BEST = ['lamb1', 'lamb2', 'calf1'];
for (const a of actors) if (BEST.includes(a.id)) { a.onUse = async (g, t) => { if (g.stepId !== 'spared') return g.note(g.text('pen_look')); await g.say(`best_${a.id}`); looked(g, t); }; a.label = 'look at the animal'; }

// -------------------------------------------------------------------- things

export const objects = [
  { type: 'tent', x: 4, y: 9 }, { type: 'tent', x: 8, y: 18 }, { type: 'ptent', x: 21, y: 8 }, { type: 'rock', x: 30, y: 8 }, { type: 'palm', x: 33, y: 20 }, { type: 'bigrock', x: 4, y: 14 },
  { id: 'fold', type: 'foldwall', x: 15, y: 20 }, { type: 'foldwall', x: 16, y: 20 }, { type: 'foldwall', x: 17, y: 20 },
];
const MONUMENT = { id: 'monument', type: 'pillar', x: 28, y: 10, label: 'look at the monument', onUse: g => (g.stepId === 'monument' ? g.signal('monument') : g.say('monument_look')) };

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'word',
    goal: 'Talk to Samuel, who has come to Saul\'s camp.', marker: 'samuel',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'samuel' },
    async run(g) {
      await g.say('sent_to_anoint');
      g.award('anointed_you');
      g.award('listen_to_the_lord');
      await g.say('amalek');
      g.award('what_amalek_did');
      await g.say('devote');
      g.award('devote_to_destruction');
      await g.say('kenites_ask');
    },
  },
  {
    id: 'kenites', spawn: [20, 15],
    begin(g) { PACKS.forEach(p => g.addProp(p)); },
    goal: 'Help the Kenites pack their tents: 0 of 3', marker: null,
    solve: ['kpack1', 'kpack2', 'kpack3'],
    trigger: { signal: 'kenites' },
    async intro(g) { await g.say('telaim'); g.award('telaim'); g.award('two_hundred_thousand_q'); await g.say('warn_kenites'); },
    async run(g) {
      await g.say('kenites_move');
      g.award('moved_away');
      g.award('showed_kindness');
      await g.say('struck');
      g.award('havilah_shur');
      await g.say('agag');
      g.award('agag_alive');
    },
  },
  {
    id: 'spared', spawn: [18, 17],
    enter(g) { g.show('agag'); g.place('agag', 6, 20, 'right'); },
    goal: 'Look at the animals the soldiers kept: 0 of 3', marker: null,
    solve: ['lamb1', 'lamb2', 'calf1'],
    trigger: { signal: 'spared' },
    async intro(g) { g.show('agag'); g.place('agag', 6, 20, 'right'); await g.say('spared'); g.award('spared_best'); g.award('unwilling_q'); },
    async run(g) {
      await g.say('worthless');
      g.award('despised_worthless');
    },
  },
  {
    id: 'night', spawn: [8, 15],
    enter(g) { g.show('agag'); },
    goal: 'Talk to Samuel, who looks troubled.', marker: 'samuel',
    trigger: { talk: 'samuel' },
    async run(g) {
      g.sky({ night: true, stars: true });
      await g.say('word_came');
      g.award('word_of_lord');
      await g.say('regret');
      g.award('i_regret');
      g.award('turned_away');
      await g.say('distressed');
      g.award('cried_all_night');
      g.sky({});
    },
  },
  {
    id: 'monument', spawn: [20, 12],
    enter(g) { g.show('agag'); g.sky({}); g.addProp(MONUMENT); },
    goal: 'Look at the monument at Carmel.', marker: 'monument',
    solve: ['monument'],
    trigger: { signal: 'monument' },
    async run(g) {
      await g.say('carmel');
      g.award('gone_to_carmel');
      g.award('monument_himself');
      await g.say('gilgal');
      g.award('down_to_gilgal');
    },
  },
  {
    id: 'confront', spawn: [18, 13],
    enter(g) { g.show('agag'); g.addProp(MONUMENT); g.place('saul', 20, 12, 'down'); g.place('samuel', 14, 13, 'right'); },
    goal: 'Talk to Samuel, who has found Saul.', marker: 'samuel',
    trigger: { talk: 'samuel' },
    async run(g) {
      await g.say('may_bless');
      g.award('carried_out');
      await g.say('bleating');
      g.award('bleating');
      await g.say('saul_answers');
      g.award('spared_best_sheep');
      await g.say('stop');
      g.award('what_lord_said');
      await g.say('small_in_own_eyes');
      g.award('small_in_your_eyes');
      await g.say('why_not_obey');
      g.award('rush_upon_plunder');
      await g.say('did_obey');
      g.award('but_i_did');
      await g.say('obedience');
      g.award('obedience_better');
      g.award('attentiveness');
      await g.say('rebellion');
      g.award('rebellion');
      g.award('rejected_as_king');
      await g.say('i_have_sinned');
      g.award('feared_people');
      await g.say('torn');
      g.award('hem_tore');
      await g.say('torn_kingdom');
      g.award('torn_from_you');
      g.award('glory_of_israel');
      await g.say('honor_me');
      g.award('honor_me');
      await g.say('mercy_note');
      g.award('mercy_not_sacrifice');
    },
  },
  {
    id: 'farewell', spawn: [14, 14],
    enter(g) { g.show('agag'); g.addProp(MONUMENT); },
    goal: 'Talk to Samuel, before he leaves.', marker: 'samuel',
    trigger: { talk: 'samuel' },
    async run(g) {
      await g.say('worshiped');
      g.award('saul_worshiped');
      await g.say('parted');
      g.award('never_visited');
      g.award('mourned');
      await g.say('how_long');
      g.award('how_long');
      g.award('jesse_of_bethlehem');
      await g.say('farewell');
      await g.fadeOut(900);
    },
  },
];
