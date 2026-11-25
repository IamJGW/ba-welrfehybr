// A Friend's Covenant (1 Samuel 18:1-9 and chapter 20): where everything is,
// and what happens when. The words people say are in dialogue.csv.

import { GRAY, robe, soldier, discover, tell, makeMap } from '../../src/storykit.js';

export const id = 'covenant';
export const title = 'A Friend’s Covenant';
export const where = 'Gibeah, and the field beyond it';
export const ref = '1 Samuel 18 and 20';
export const after = 'elah';
export const place = [35.285, 31.85];   // the field by Gibeah, as [longitude, latitude], for the map

// ----------------------------------------------------------------------- map
// Gibeah is on the west. A road leads east to a field of tall grass, where
// the great stone Ezel stands.
//   #  cliff    h  hillside    .  grass    g  tall grass    ,  road    :  the town

export const map = makeMap((x, y) => {
  if (x < 2 || x > 37 || y < 2 || y > 26) return '#';
  if (y <= 3) return 'h';
  if (y === 14 && x >= 12 && x <= 27) return ',';
  if (x <= 15 && y >= 6 && y <= 22) return ':';
  if (x >= 26 && y >= 7 && y <= 21) return (x + y) % 5 === 0 ? '.' : 'g';
  return '.';
});

export const start = [14, 14];
export const door = [2, 18];
export const barriers = [];

// -------------------------------------------------------------------- people

// Where Jonathan's three arrows fall. The last is beyond the stone.
const ARROWS = [{ at: [29, 11] }, { at: [31, 17] }, { at: [36, 14], far: true }];

function useRack(g) {
  if (g.stepId !== 'bow' || g.state.hasBow) return g.say('look_rack');
  g.state.hasBow = true;
  g.hold('bow');
  g.note(g.text('bow_take'));
  g.goal('Bring the bow to Jonathan.', 'jonathan');
}

// Jonathan is the one to bring things back to.
function useJonathan(g) {
  if (g.stepId === 'bow' && g.state.hasBow) return g.signal('bow');
  if (g.stepId === 'find' && g.state.arrows >= 3) return g.signal('arrows');
  return g.say('jonathan_idle');
}

async function useArrow(g, arrow) {
  if (g.stepId !== 'find') return;
  g.removeProp(arrow.id);
  g.state.arrows = (g.state.arrows || 0) + 1;
  if (arrow.far) await g.say('beyond'); else g.note(g.text('arrow_found'));
  if (g.state.arrows >= 3) g.goal('Bring the arrows back to Jonathan.', 'jonathan');
  else g.goal(`Find the three arrows: ${g.state.arrows} of 3`);
}

const layArrows = g => {
  if (g.state.arrowsLaid) return;
  g.state.arrowsLaid = true;
  g.state.arrows = 0;
  ARROWS.forEach((a, i) => g.addProp({
    id: `arrow${i}`, type: 'arrow', x: a.at[0], y: a.at[1], far: !!a.far, scale: 1.3, reach: 30, label: 'pick up the arrow', onUse: useArrow,
  }));
};

// Side task: ask three people what they think of David.
const admire = n => async g => {
  const heard = (g.state.heard ||= new Set());
  await g.say(`town_${n}`);
  heard.add(n);
  if (heard.size === 3 && !g.found('loved')) {
    await g.say('disc_loved');
    g.award('loved');
  }
};

// "From that day forward" means from the day of the song, so not before it.
const useSaul = g => (['meet', 'bow'].includes(g.stepId) ? g.say('saul_idle') : discover('disc_jealous', 'jealous')(g));

const lady = top => robe({ top, hairStyle: 'long', head: 'cloth', headColor: '#e9e2cf' });

export const actors = [
  {
    id: 'saul', name: 'King Saul', at: [6, 11], scale: 1.1, onUse: useSaul,
    look: robe({ top: '#6b3fa0', sash: '#e3b93a', head: 'crown', beard: true }),
  },
  {
    id: 'jonathan', name: 'Jonathan', at: [9, 13], onUse: useJonathan,
    look: robe({ top: '#3d6fb5', sash: '#e3b93a', head: 'band', headColor: '#e3b93a' }),
  },
  {
    id: 'david', name: 'David', at: [10, 13], chat: 'david_idle',
    look: robe({ hair: '#7a3b22', hairStyle: 'curly', top: '#e3d6b0', sash: '#8a5a2b', armor: '#8a6b45' }),
  },
  { id: 'boy', name: 'the small boy', at: [27, 15], scale: 0.8, hidden: true, chat: 'boy_idle', look: robe({ top: '#b59a6e' }) },
  { id: 'singer1', name: 'a singer', at: [11, 17], chat: 'women_idle', look: lady('#a85a4a') },
  { id: 'singer2', name: 'a singer', at: [12, 18], chat: 'women_idle', look: lady('#7f8f6a') },
  { id: 'singer3', name: 'a singer', at: [13, 17], chat: 'women_idle', look: lady('#b08a3a') },
  { id: 'veteran', name: 'a soldier', at: [12, 8], onUse: discover('disc_withhim', 'withhim'), look: soldier() },
  { id: 'towns1', name: 'a townsman', at: [3, 16], onUse: admire(1), look: robe({ top: '#8a7a9a', beard: true }) },
  { id: 'towns2', name: 'a mother', at: [8, 19], onUse: admire(2), look: lady('#9a6a8a') },
  { id: 'towns3', name: 'an old man', at: [13, 21], onUse: admire(3), look: robe({ top: '#8f7a5c', hair: GRAY, beard: GRAY }) },
];

// -------------------------------------------------------------------- things

export const objects = [
  // Gibeah
  { type: 'hall', x: 4, y: 8 },
  { type: 'throne', x: 6, y: 10 },
  { type: 'table', x: 5, y: 12 },
  { id: 'rack', type: 'rack', x: 12, y: 10, label: 'look at the rack', onUse: useRack },
  { type: 'tambourine', x: 10, y: 17, label: 'shake the tambourine', onUse: discover('disc_tambourine', 'tambourine') },
  { type: 'gatepost', x: 15, y: 13 }, { type: 'gatepost', x: 15, y: 15 },
  { type: 'house', x: 9, y: 22 }, { type: 'house', x: 2, y: 22 },
  { type: 'tree', x: 2, y: 25 }, { type: 'tree', x: 14, y: 25 },

  // The field
  { id: 'ezel', type: 'bigrock', x: 33, y: 12, reach: 60, label: 'look at the great stone', onUse: tell('look_ezel') },
  { type: 'tree', x: 29, y: 6, label: 'look at the tree', onUse: discover('disc_friend', 'friend') },
  { type: 'tree', x: 36, y: 8 }, { type: 'tree', x: 30, y: 20 }, { type: 'tree', x: 37, y: 20 },
  { type: 'tree', x: 21, y: 10 }, { type: 'tree', x: 20, y: 19 }, { type: 'rock', x: 24, y: 22 },
];

// -------------------------------------------------------------------- scenes

// The morning of the signal: Jonathan in the field with his bow and a small boy.
const morning = g => {
  g.hide('david');
  g.place('jonathan', 26, 14, 'right');
  g.setLook('jonathan', { item: 'bow' });
  g.show('boy');
  g.place('boy', 27, 15, 'right');
};

// Where the boy waits once he has been sent back, and where Jonathan goes home to.
const BOY_AT_GATE = [18, 15], JONATHAN_HOME = [9, 13];

export const steps = [
  {
    id: 'meet',
    goal: "Talk to Jonathan, the king's son.", marker: 'jonathan',
    async intro(g) { await g.wait(700); await g.say('arrive'); },
    trigger: { talk: 'jonathan' },
    async run(g) { await g.say('covenant'); },
  },
  {
    id: 'bow', spawn: [10, 15],
    goal: "Fetch Jonathan's bow from the rack by the hall.", marker: 'rack',
    trigger: { signal: 'bow' },
    async run(g) {
      g.hold(null);
      g.setLook('david', { item: 'bow' });
      await g.say('gift');
      g.award('covenant');

      // The women's song comes after the covenant, as it does in 1 Samuel 18.
      for (const singer of ['singer1', 'singer2', 'singer3']) {
        g.tween({ targets: g.actor(singer).sprite, scaleY: 1.12, duration: 240, yoyo: true, repeat: 5 });
      }
      await g.say('song');
      g.award('song');
      await g.say('plan');
    },
  },
  {
    id: 'ezel', spawn: [11, 14],
    goal: 'Go with David to the great stone in the field.', marker: 'ezel',
    enter(g) { g.setLook('david', { item: 'bow' }); g.trail('david'); },
    trigger: { zone: [31, 12, 36, 15] },
    async run(g) {
      g.trail('david', false);
      await g.walk('david', [[34, 13]], 130);
      g.hide('david');
      await g.say('hide');
      g.award('ezel');
    },
  },
  {
    id: 'feast', spawn: [30, 14],
    goal: "Go back to the king's table.", marker: 'saul',
    enter(g) { g.trail('david', false); g.hide('david'); },
    trigger: { zone: [3, 12, 11, 15] },
    async run(g) {
      await g.say('feast');
      // The next morning, out in the field.
      await g.fadeOut(500);
      morning(g);
      g.place('player', 27, 13, 'right');
      await g.follow(1);
      await g.fadeIn(500);
      await g.say('shoot');
      layArrows(g);
    },
  },
  {
    id: 'find', spawn: [27, 13],
    goal: 'Find the three arrows: 0 of 3',
    enter(g) { morning(g); layArrows(g); },
    trigger: { signal: 'arrows' },
    async run(g) {
      await g.say('sendback');
      g.award('arrows');

      // The boy goes back to the city (20:40-41). The traveler looks back.
      g.setLook('jonathan', { item: null });
      g.walk('boy', [BOY_AT_GATE], 150).then(() => g.face('boy', 'right'));
      await g.say('linger');
      g.show('david');
      g.place('david', 34, 13, 'left');
      await g.pan(30, 13, 700);
      await g.walk('david', [[29, 14]], 110);
      g.face('david', 'left');
      await g.tween({ targets: g.actor('david').sprite, angle: 80, duration: 280, yoyo: true, repeat: 2 });
      g.actor('david').sprite.setAngle(0);
      await g.say('peace');
      g.award('peace');
      g.walk('david', [[37, 14]], 120).then(() => g.hide('david'));
      g.walk('jonathan', [[12, 14], JONATHAN_HOME], 130);
      await g.follow(700);
    },
  },
  {
    id: 'home', spawn: [28, 14],
    goal: 'Talk to the small boy by the town gate when you are ready to go.', marker: 'boy',
    enter(g) {
      morning(g);
      g.setLook('jonathan', { item: null });
      g.place('boy', ...BOY_AT_GATE, 'right');
      g.place('jonathan', ...JONATHAN_HOME, 'down');
    },
    trigger: { talk: 'boy' },
    async run(g) {
      await g.say('home');
      await g.fadeOut(900);
    },
  },
];
