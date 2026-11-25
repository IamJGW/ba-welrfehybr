// The beginning: Grandma's attic, where the traveler finds the time device.
// It plays before the first story, and can be watched again from the title
// screen. The words are in dialogue.csv.

import { robe, makeMap } from '../../src/storykit.js';

export const id = 'prologue';
export const title = 'The Old Trunk';
export const where = "Grandma's attic";
export const ref = '';
export const cutscene = true;   // no end page, and a Skip button in the corner

// ----------------------------------------------------------------------- map
//   W  wall    w  floorboards    r  rug

export const map = makeMap((x, y) => {
  if (y <= 3 || y >= 14 || x <= 3 || x >= 26) return 'W';
  if (x >= 11 && x <= 18 && y >= 8 && y <= 11) return 'r';
  return 'w';
}, 30, 17);

export const start = [10, 12];
export const barriers = [];

// -------------------------------------------------------------------- people

export const actors = [
  {
    id: 'grandma', name: 'Grandma', at: [13, 10], dir: 'left', chat: 'grandma_idle',
    look: robe({ kind: 'modern', skin: '#e8b68c', hair: '#c9c9c9', hairStyle: 'bun', glasses: true, top: '#8a6f9a', bottom: '#55585e' }),
  },
];

// -------------------------------------------------------------------- things

export const objects = [
  { type: 'atticwindow', x: 19, y: 3 },
  { id: 'trunk', type: 'trunk', x: 19, y: 5, label: 'open the old trunk', onUse: g => g.signal('trunk') },
  { type: 'shelf', x: 5, y: 4 },
  { type: 'lamp', x: 9, y: 4 },
  { type: 'sheet', x: 13, y: 4 },
  { type: 'boxes', x: 23, y: 5 }, { type: 'boxes', x: 24, y: 7 }, { type: 'boxes', x: 22, y: 12 },
  { type: 'boxes', x: 5, y: 12 }, { type: 'boxes', x: 6, y: 13 },
];

// -------------------------------------------------------------------- scenes

export const steps = [
  {
    id: 'attic',
    goal: 'Open the old trunk by the window.', marker: 'trunk',
    enter(g) { g.setLook('player', { device: false }); },
    async intro(g) { await g.wait(600); await g.say('attic'); },
    trigger: { signal: 'trunk' },
    async run(g) {
      g.face('player', 'up');
      g.removeProp('trunk');
      g.addProp({ id: 'opened', type: 'trunkOpen', x: 19, y: 5 });
      g.walk('grandma', [[17, 7]], 90).then(() => g.face('grandma', 'right'));
      await g.say('trunk');

      // The band goes onto the traveler's wrist and wakes up.
      g.setLook('player', { device: true });
      const p = g.player;
      const glow = g.fx('glow', p.x, p.y - 28).setAlpha(0).setScale(0.4);
      await g.tween({ targets: glow, alpha: 1, scale: 1.1, duration: 700 });
      await g.say('linked');
      g.face('player', 'left');
      await g.say('goodbye');

      g.shake(1200, 0.008);
      await g.tween({ targets: glow, scale: 9, duration: 1100 });
      g.flash(500);
      await g.say('away');
      await g.fadeOut(900);
    },
  },
];
