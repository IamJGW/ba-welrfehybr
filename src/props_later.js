// More placeholder props, for the arcs after The Promise. They are added to the
// same PROPS list the earlier arcs use (see art.js for how a prop is described).

import { PROPS, canvas, poly, disc, box, shade } from './art.js';

Object.assign(PROPS, {
  // ---- Egypt
  egyptHouse: {   // a whitewashed mud-brick house with a flat roof
    foot: 3, solid: true,
    draw() {
      const [c, ctx] = canvas(104, 80);
      box(ctx, 4, 18, 96, 60, '#e8dcc0'); box(ctx, 76, 18, 24, 60, '#d4c6a6');
      box(ctx, 0, 12, 104, 8, '#cdbd98'); box(ctx, 0, 10, 104, 3, '#b8a880');
      box(ctx, 43, 44, 18, 34, '#5a3f2a'); box(ctx, 14, 32, 12, 12, '#3a2a1e'); box(ctx, 80, 32, 12, 12, '#3a2a1e');
      box(ctx, 12, 30, 16, 2, '#4a7ab0'); box(ctx, 78, 30, 16, 2, '#4a7ab0');
      return c;
    },
  },
  column: {   // a tall stone column with a lotus top, for palaces and temples
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(34, 96);
      disc(ctx, 17, 92, 14, 4, 'rgba(0,0,0,0.2)');
      box(ctx, 7, 82, 20, 10, '#cfc4a6');
      box(ctx, 10, 18, 14, 66, '#ddd2b4'); box(ctx, 20, 18, 4, 66, '#c8bd9e');
      for (const y of [30, 50, 70]) box(ctx, 10, y, 14, 3, '#4a7ab0');
      poly(ctx, [[4, 6], [30, 6], [24, 20], [10, 20]], '#cfc4a6');
      for (const x of [9, 17, 25]) poly(ctx, [[x - 4, 6], [x + 4, 6], [x, 0]], '#5a9a5a');
      return c;
    },
  },
  palace: {   // Pharaoh's hall: a wide front with columns and a dark doorway
    foot: 7, solid: true,
    draw() {
      const [c, ctx] = canvas(224, 128);
      box(ctx, 8, 30, 208, 94, '#e2d6b6'); box(ctx, 8, 30, 208, 10, '#c8b98e'); box(ctx, 0, 24, 224, 8, '#b8a880');
      for (let x = 20; x < 210; x += 36) { box(ctx, x, 40, 14, 84, '#ddd2b4'); box(ctx, x + 10, 40, 4, 84, '#c8bd9e'); box(ctx, x - 2, 38, 18, 5, '#c8b98e'); }
      box(ctx, 92, 56, 40, 68, '#2e2118'); box(ctx, 88, 52, 48, 6, '#b8a880');
      for (let x = 12; x < 212; x += 18) box(ctx, x, 26, 10, 4, '#4a7ab0');
      poly(ctx, [[100, 22], [112, 6], [124, 22]], '#e3b93a');
      return c;
    },
  },
  granary: {   // a domed storehouse for grain
    foot: 2, solid: true,
    draw() {
      const [c, ctx] = canvas(64, 70);
      disc(ctx, 32, 66, 28, 5, 'rgba(0,0,0,0.2)');
      box(ctx, 8, 30, 48, 36, '#d8c59a'); box(ctx, 44, 30, 12, 36, '#c4b085');
      poly(ctx, [[6, 32], [14, 14], [32, 4], [50, 14], [58, 32]], '#cdb98a'); poly(ctx, [[32, 4], [50, 14], [58, 32], [44, 32]], '#b8a275');
      box(ctx, 26, 46, 12, 20, '#4a3524'); box(ctx, 28, 38, 8, 5, '#4a3524');
      return c;
    },
  },
  pit: {   // a dry pit in the ground, with a ring of stones
    foot: 2, solid: false, flat: true,
    draw() {
      const [c, ctx] = canvas(64, 48);
      disc(ctx, 32, 26, 28, 18, '#8a7a5a'); disc(ctx, 32, 28, 22, 13, '#2a2118'); disc(ctx, 32, 31, 18, 9, '#1a140e');
      for (const [x, y] of [[8, 22], [14, 12], [28, 7], [46, 10], [56, 20], [54, 34], [38, 44], [18, 40]]) disc(ctx, x, y, 5, 4, '#9a9384');
      return c;
    },
  },
  cellgate: {   // iron-barred prison gate
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(32, 56);
      box(ctx, 0, 0, 32, 5, '#5a5550'); box(ctx, 0, 0, 4, 56, '#5a5550'); box(ctx, 28, 0, 4, 56, '#5a5550');
      for (let x = 8; x < 28; x += 5) box(ctx, x, 5, 2, 51, '#8a8680');
      box(ctx, 4, 28, 24, 3, '#6a6560');
      return c;
    },
  },
  wagon: {   // an Egyptian wagon sent to carry Jacob's family
    foot: 2, solid: true,
    draw() {
      const [c, ctx] = canvas(72, 52);
      disc(ctx, 36, 48, 30, 4, 'rgba(0,0,0,0.2)');
      box(ctx, 6, 20, 60, 14, '#9a6a40'); box(ctx, 6, 20, 60, 3, '#b58250'); box(ctx, 6, 31, 60, 3, '#7a5230');
      for (const x of [16, 56]) { disc(ctx, x, 40, 9, 9, '#5a3f28'); disc(ctx, x, 40, 6, 6, '#7a5230'); disc(ctx, x, 40, 2, 2, '#3a2a1c'); }
      box(ctx, 62, 12, 3, 10, '#6b4a2b'); box(ctx, 66, 24, 6, 2, '#6b4a2b');
      return c;
    },
  },
  reeds: {   // tall reeds by the river
    foot: 1, solid: false,
    draw() {
      const [c, ctx] = canvas(32, 44);
      for (const [x, h, col] of [[6, 34, '#5f8a3a'], [11, 40, '#6f9a45'], [16, 30, '#5f8a3a'], [21, 38, '#6f9a45'], [26, 32, '#5f8a3a']]) {
        box(ctx, x, 44 - h, 2, h, col); box(ctx, x - 1, 44 - h - 3, 4, 7, '#7a5a34');
      }
      return c;
    },
  },
  obelisk: {
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(34, 100);
      disc(ctx, 17, 96, 15, 4, 'rgba(0,0,0,0.2)');
      box(ctx, 6, 88, 22, 8, '#b8a880');
      poly(ctx, [[10, 88], [13, 14], [17, 2], [21, 14], [24, 88]], '#d4c6a0'); poly(ctx, [[17, 2], [21, 14], [24, 88], [18, 88]], '#bfb08a');
      for (let y = 24; y < 80; y += 8) box(ctx, 14, y, 5, 3, '#8a7a5a');
      return c;
    },
  },

  // ---- Out of Egypt
  babyBasket: {   // a papyrus basket in the reeds, with a baby asleep in it
    foot: 1, solid: false, flat: true,
    draw() {
      const [c, ctx] = canvas(40, 30);
      disc(ctx, 20, 18, 17, 9, 'rgba(0,0,0,0.18)');
      disc(ctx, 20, 15, 16, 9, '#a8803f'); disc(ctx, 20, 12, 14, 7, '#c9a45a');
      disc(ctx, 20, 11, 9, 5, '#f4f1e6'); disc(ctx, 16, 10, 4, 3, '#e8b68c');
      return c;
    },
  },
  papyrus: {   // a bundle of papyrus reeds, cut and ready
    foot: 1, solid: false, flat: true,
    draw() {
      const [c, ctx] = canvas(34, 26);
      for (const [x, r] of [[6, 0.3], [11, 0.1], [16, -0.1], [21, -0.3], [26, 0.2]]) {
        ctx.save(); ctx.translate(x + 3, 20); ctx.rotate(r);
        box(ctx, -1, -18, 3, 36, '#6f9a45'); box(ctx, -3, -22, 7, 6, '#8a6a3a');
        ctx.restore();
      }
      box(ctx, 5, 16, 24, 3, '#d8c7a0');
      return c;
    },
  },
  doorpost: {   // a doorway of two posts and a lintel, for marking with blood
    foot: 2, solid: false,
    draw() {
      const [c, ctx] = canvas(64, 84);
      box(ctx, 6, 8, 8, 74, '#7a5a34'); box(ctx, 50, 8, 8, 74, '#7a5a34'); box(ctx, 2, 4, 60, 9, '#8a6a3e');
      box(ctx, 14, 14, 36, 68, '#2e2118');
      return c;
    },
  },
  burningbush: {   // a thornbush on fire that is not burned up
    foot: 1, solid: true, glow: true,
    draw() {
      const [c, ctx] = canvas(64, 70);
      disc(ctx, 32, 62, 22, 5, 'rgba(0,0,0,0.2)');
      disc(ctx, 32, 44, 24, 18, '#5d7f3a'); disc(ctx, 20, 38, 14, 12, '#6c8f45'); disc(ctx, 44, 38, 14, 12, '#6c8f45');
      const g = ctx.createRadialGradient(32, 30, 3, 32, 30, 32);
      g.addColorStop(0, 'rgba(255,246,190,0.95)'); g.addColorStop(0.4, 'rgba(255,150,40,0.8)'); g.addColorStop(1, 'rgba(255,80,20,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 70);
      poly(ctx, [[22, 44], [26, 18], [32, 4], [38, 18], [42, 44]], 'rgba(255,170,50,0.85)');
      poly(ctx, [[27, 44], [30, 24], [32, 14], [34, 24], [37, 44]], 'rgba(255,240,150,0.9)');
      return c;
    },
  },

  peak: {   // a great rocky mountain, for Horeb and Sinai
    foot: 9, solid: true,
    draw() {
      const [c, ctx] = canvas(288, 176);
      poly(ctx, [[0, 172], [60, 70], [112, 40], [150, 6], [190, 44], [240, 74], [288, 172]], '#8a7660');
      poly(ctx, [[150, 6], [190, 44], [240, 74], [288, 172], [190, 172], [170, 90]], '#6f5d4a');
      poly(ctx, [[112, 40], [150, 6], [140, 70], [100, 120], [60, 172], [0, 172], [60, 70]], '#9a8670');
      for (const [x, y, w] of [[40, 130, 30], [110, 100, 24], [180, 120, 30], [230, 150, 26], [90, 150, 24]]) box(ctx, x, y, w, 3, '#6a5842');
      poly(ctx, [[142, 14], [150, 6], [160, 22], [150, 30]], '#e8e0d0');
      return c;
    },
  },

  hyssop: {   // a bundle of hyssop, for brushing blood on the doorframe
    foot: 1, solid: false, flat: true,
    draw() {
      const [c, ctx] = canvas(30, 24);
      for (const [x, r] of [[8, 0.4], [13, 0.15], [17, -0.15], [22, -0.4]]) {
        ctx.save(); ctx.translate(x, 20); ctx.rotate(r); box(ctx, -1, -16, 2, 18, '#6f9a45'); box(ctx, -3, -18, 6, 5, '#7faa52'); ctx.restore();
      }
      box(ctx, 7, 17, 16, 3, '#d8c7a0');
      return c;
    },
  },
  bloodmark: {   // a red mark brushed on a doorframe
    foot: 1, solid: false, flat: true,
    draw() {
      const [c, ctx] = canvas(30, 24);
      poly(ctx, [[4, 6], [24, 4], [26, 10], [18, 12], [22, 18], [8, 20], [6, 12]], '#a33a2a');
      poly(ctx, [[8, 8], [20, 7], [20, 10], [12, 12]], '#c4503a');
      return c;
    },
  },

  cloudpillar: {   // the pillar of cloud by day, and of fire by night
    foot: 1, solid: false, glow: true,
    draw() {
      const [c, ctx] = canvas(64, 150);
      const g = ctx.createLinearGradient(0, 0, 0, 150);
      g.addColorStop(0, 'rgba(255,255,255,0.1)'); g.addColorStop(0.5, 'rgba(240,244,250,0.75)'); g.addColorStop(1, 'rgba(225,230,240,0.9)');
      ctx.fillStyle = g;
      poly(ctx, [[22, 148], [18, 100], [24, 50], [20, 4], [44, 4], [40, 50], [46, 100], [42, 148]], g);
      for (const [x, y, r] of [[32, 120, 20], [26, 90, 16], [38, 62, 18], [30, 30, 14]]) disc(ctx, x, y, r, r * 0.8, 'rgba(255,255,255,0.6)');
      return c;
    },
  },
  coffin: {   // the coffin that holds Joseph's bones
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(40, 34);
      disc(ctx, 20, 30, 17, 4, 'rgba(0,0,0,0.2)');
      box(ctx, 4, 12, 32, 16, '#7a5a34'); box(ctx, 4, 12, 32, 3, '#9a7a4a'); box(ctx, 6, 18, 28, 2, '#e3b93a'); box(ctx, 18, 12, 4, 16, '#e3b93a');
      return c;
    },
  },

  // ---- The Wilderness
  mannaflake: {   // thin white flakes of manna on the ground
    foot: 1, solid: false, flat: true,
    draw() {
      const [c, ctx] = canvas(34, 24);
      for (const [x, y] of [[5, 6], [12, 12], [20, 5], [26, 13], [9, 18], [17, 17], [28, 20], [22, 22], [3, 14]]) { disc(ctx, x, y, 2.6, 2, '#f4f1e6'); disc(ctx, x - 0.8, y - 0.6, 1, 0.8, '#ffffff'); }
      return c;
    },
  },

  goldcalf: {   // the golden calf, on a stone stand
    foot: 2, solid: true,
    draw() {
      const [c, ctx] = canvas(72, 74);
      disc(ctx, 36, 68, 30, 5, 'rgba(0,0,0,0.22)');
      box(ctx, 8, 52, 56, 14, '#8d8778'); box(ctx, 8, 52, 56, 3, '#a8a290');
      const gold = '#e3b93a', dark = '#b98b3c', light = '#f2d46a';
      box(ctx, 16, 28, 38, 22, gold); box(ctx, 16, 44, 38, 6, dark);
      box(ctx, 44, 18, 18, 18, gold); box(ctx, 58, 22, 8, 10, dark); box(ctx, 46, 12, 4, 8, dark); box(ctx, 56, 12, 4, 8, dark);
      box(ctx, 20, 48, 6, 6, gold); box(ctx, 44, 48, 6, 6, gold); box(ctx, 12, 30, 6, 4, dark);
      box(ctx, 20, 30, 14, 3, light); box(ctx, 50, 22, 5, 3, light); box(ctx, 51, 24, 2, 2, '#4a3524');
      return c;
    },
  },

  tabernacle: {   // the Tent of Meeting: a long tent of goat hair under a covering of skins
    foot: 6, solid: true,
    draw() {
      const [c, ctx] = canvas(192, 116);
      disc(ctx, 96, 108, 88, 7, 'rgba(0,0,0,0.2)');
      box(ctx, 8, 40, 176, 66, '#6b4a2b'); box(ctx, 8, 40, 176, 6, '#8a6340');
      poly(ctx, [[2, 42], [40, 12], [152, 12], [190, 42]], '#4a3a30'); poly(ctx, [[40, 12], [152, 12], [168, 28], [24, 28]], '#5a4638');
      for (let x = 22; x < 180; x += 22) box(ctx, x, 46, 2, 58, '#563a22');
      box(ctx, 76, 56, 40, 50, '#2e2118');
      for (const [x, col] of [[78, '#3d6fb5'], [88, '#8a2f8a'], [98, '#c0415a'], [108, '#3d6fb5']]) box(ctx, x, 56, 8, 50, col);
      box(ctx, 8, 100, 176, 6, '#4b3a2a');
      return c;
    },
  },
  arkcov: {   // the ark of the covenant: a gold chest with two cherubim on the lid
    foot: 1, solid: true, glow: true,
    draw() {
      const [c, ctx] = canvas(48, 52);
      disc(ctx, 24, 48, 20, 4, 'rgba(0,0,0,0.2)');
      box(ctx, 6, 28, 36, 18, '#e3b93a'); box(ctx, 6, 28, 36, 3, '#f2d46a'); box(ctx, 6, 42, 36, 4, '#b98b3c');
      box(ctx, 2, 40, 44, 3, '#7a5a34'); box(ctx, 2, 32, 4, 3, '#7a5a34');
      box(ctx, 8, 22, 32, 6, '#f2d46a');
      for (const x of [8, 32]) { poly(ctx, [[x, 22], [x + 3, 8], [x + 8, 22]], '#e3b93a'); poly(ctx, [[x + 8, 22], [x + 9, 6], [x + 14, 18]], '#f2d46a'); }
      return c;
    },
  },
  lampstand: {   // a gold lampstand with seven flames
    foot: 1, solid: true, glow: true,
    draw() {
      const [c, ctx] = canvas(40, 62);
      disc(ctx, 20, 58, 14, 3, 'rgba(0,0,0,0.2)');
      box(ctx, 18, 22, 4, 34, '#e3b93a'); box(ctx, 10, 54, 20, 4, '#b98b3c');
      ctx.strokeStyle = '#e3b93a'; ctx.lineWidth = 3;
      for (const [x1, x2] of [[16, 5], [14, 11], [24, 29], [26, 35]]) { ctx.beginPath(); ctx.moveTo(20, 40); ctx.quadraticCurveTo(x1, 36, x2, 20); ctx.stroke(); }
      for (const x of [5, 11, 17, 20, 23, 29, 35]) { box(ctx, x - 2, 18, 4, 6, '#e3b93a'); poly(ctx, [[x - 2, 17], [x, 8], [x + 2, 17]], '#ffd23f'); }
      return c;
    },
  },

  vine: {   // a grapevine on a trellis, heavy with purple grapes
    foot: 2, solid: true,
    draw() {
      const [c, ctx] = canvas(64, 52);
      disc(ctx, 32, 48, 28, 4, 'rgba(0,0,0,0.18)');
      box(ctx, 4, 12, 3, 38, '#7a5a34'); box(ctx, 57, 12, 3, 38, '#7a5a34'); box(ctx, 3, 14, 58, 3, '#8a6a3e');
      for (const [x, y, r] of [[14, 20, 9], [30, 16, 11], [46, 20, 9], [22, 30, 9], [40, 30, 9]]) { disc(ctx, x, y, r, r * 0.8, '#4f7a31'); disc(ctx, x + 2, y - 2, r * 0.5, r * 0.4, '#6f9a45'); }
      for (const [x, y] of [[14, 30], [26, 38], [38, 38], [50, 30], [32, 28]]) for (const [dx, dy] of [[0, 0], [4, 3], [-4, 3], [0, 6], [4, 9], [-4, 9]]) disc(ctx, x + dx, y + dy, 3, 3, '#6a3a8a');
      return c;
    },
  },

  // ---- The Promised Land
  ropecoil: {   // a coil of rope
    foot: 1, solid: false, flat: true,
    draw() {
      const [c, ctx] = canvas(30, 24);
      disc(ctx, 15, 14, 12, 7, '#8a6a3a'); disc(ctx, 15, 13, 9, 5, '#a8824a'); disc(ctx, 15, 13, 5, 3, '#6b4a2b'); disc(ctx, 15, 12, 2, 1.5, '#4a3524');
      return c;
    },
  },
  cordwindow: {   // a window in a city wall, with a scarlet cord hanging from it
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(36, 60);
      box(ctx, 2, 4, 32, 54, '#b8a880'); box(ctx, 2, 4, 32, 4, '#a39370');
      box(ctx, 8, 14, 20, 18, '#2e2118'); box(ctx, 6, 12, 24, 3, '#8a7a5a');
      box(ctx, 16, 32, 3, 24, '#c0302a'); box(ctx, 14, 24, 7, 3, '#c0302a');
      return c;
    },
  },
  citywall: {   // a thick stone wall with a walkway on top
    foot: 4, solid: true,
    draw() {
      const [c, ctx] = canvas(128, 112);
      box(ctx, 0, 16, 128, 96, '#a89a7c'); box(ctx, 0, 16, 128, 8, '#c0b496');
      for (let x = 0; x < 128; x += 16) box(ctx, x + 2, 2, 12, 16, '#a89a7c');
      for (let y = 30; y < 112; y += 14) { box(ctx, 0, y, 128, 2, '#8a7c60'); for (let x = (y / 14) % 2 ? 0 : 10; x < 128; x += 24) box(ctx, x, y, 2, 14, '#8a7c60'); }
      return c;
    },
  },
  gatehouse: {   // the gate of a city: two towers and a dark opening (the way through stays open)
    foot: 5, solid: false,
    draw() {
      const [c, ctx] = canvas(160, 120);
      box(ctx, 0, 14, 44, 106, '#a89a7c'); box(ctx, 116, 14, 44, 106, '#a89a7c');
      for (const x of [0, 18, 116, 134]) box(ctx, x + 2, 2, 12, 14, '#a89a7c');
      box(ctx, 44, 14, 72, 20, '#8a7c60'); box(ctx, 56, 34, 48, 86, '#2e2118'); poly(ctx, [[56, 40], [80, 24], [104, 40]], '#2e2118');
      for (let y = 30; y < 120; y += 14) { box(ctx, 0, y, 44, 2, '#8a7c60'); box(ctx, 116, y, 44, 2, '#8a7c60'); }
      return c;
    },
  },

  idol: {   // a small carved idol of the kind people kept in their homes
    foot: 1, solid: false, flat: true,
    draw() {
      const [c, ctx] = canvas(28, 30);
      disc(ctx, 14, 26, 10, 3, 'rgba(0,0,0,0.2)');
      box(ctx, 8, 20, 12, 6, '#8d6a3a'); box(ctx, 9, 10, 10, 11, '#a8803f'); disc(ctx, 14, 8, 5, 5, '#a8803f');
      box(ctx, 12, 7, 2, 2, '#3a2a1c'); box(ctx, 15, 7, 2, 2, '#3a2a1c'); box(ctx, 6, 12, 3, 6, '#8d6a3a'); box(ctx, 19, 12, 3, 6, '#8d6a3a');
      return c;
    },
  },

  // ---- Judges and Ruth
  winepress: {   // a stone winepress, cut into the rock
    foot: 2, solid: true,
    draw() {
      const [c, ctx] = canvas(64, 46);
      disc(ctx, 32, 42, 30, 4, 'rgba(0,0,0,0.2)');
      box(ctx, 2, 18, 60, 24, '#8d8778'); box(ctx, 2, 18, 60, 4, '#a8a290');
      box(ctx, 8, 22, 48, 16, '#6a6454'); box(ctx, 8, 22, 48, 3, '#5a5446');
      box(ctx, 14, 26, 36, 8, '#a8402c');
      return c;
    },
  },
  fleece: {   // a fleece of wool, spread on the ground
    foot: 1, solid: false, flat: true,
    draw() {
      const [c, ctx] = canvas(40, 28);
      disc(ctx, 20, 15, 17, 10, '#ece6d4'); disc(ctx, 14, 12, 8, 5, '#f7f3e6'); disc(ctx, 27, 17, 8, 5, '#dcd6c4');
      for (const [x, y] of [[8, 14], [14, 20], [26, 10], [32, 16], [20, 8]]) disc(ctx, x, y, 3, 2, '#f7f3e6');
      return c;
    },
  },
  fleeceWet: {   // the same fleece, heavy with dew
    foot: 1, solid: false, flat: true,
    draw() {
      const [c, ctx] = canvas(40, 28);
      disc(ctx, 20, 15, 17, 10, '#cfd3d0'); disc(ctx, 14, 12, 8, 5, '#dde4e6'); disc(ctx, 27, 17, 8, 5, '#b9c0c0');
      for (const [x, y] of [[10, 12], [18, 18], [28, 12], [22, 10], [30, 18]]) disc(ctx, x, y, 2, 2, '#8ec2dc');
      return c;
    },
  },

  gleanear: {   // a few ears of barley left lying in the field
    foot: 1, solid: false, flat: true,
    draw() {
      const [c, ctx] = canvas(34, 26);
      for (const [x, r] of [[8, 0.5], [15, 0.2], [22, -0.2], [27, -0.5]]) {
        ctx.save(); ctx.translate(x, 22); ctx.rotate(r); box(ctx, -1, -16, 2, 18, '#c9a24a'); box(ctx, -3, -22, 6, 8, '#e3c35a'); box(ctx, -1, -26, 2, 4, '#e3c35a'); ctx.restore();
      }
      return c;
    },
  },

  // ---- Samuel and the first king
  mat: {   // a sleeping mat of woven reeds
    foot: 2, solid: false, flat: true,
    draw() {
      const [c, ctx] = canvas(64, 36);
      box(ctx, 4, 6, 56, 26, '#b98a4a'); box(ctx, 4, 6, 56, 3, '#d4a85e');
      for (let x = 10; x < 58; x += 8) box(ctx, x, 6, 1, 26, '#8f6a30');
      box(ctx, 6, 10, 18, 10, '#ece6d4');
      return c;
    },
  },

  dagon: {   // the statue of Dagon, the god of the Philistines
    foot: 2, solid: true,
    draw() {
      const [c, ctx] = canvas(64, 108);
      disc(ctx, 32, 102, 26, 4, 'rgba(0,0,0,0.2)');
      box(ctx, 8, 92, 48, 12, '#8d8778'); box(ctx, 14, 80, 36, 12, '#a8a290');
      poly(ctx, [[18, 80], [24, 36], [40, 36], [46, 80]], '#6a8a8a'); poly(ctx, [[24, 36], [40, 36], [38, 50], [26, 50]], '#7aa0a0');
      disc(ctx, 32, 26, 12, 14, '#7aa0a0'); box(ctx, 24, 10, 16, 6, '#6a8a8a'); box(ctx, 28, 24, 2, 3, '#2a3a3a'); box(ctx, 35, 24, 2, 3, '#2a3a3a');
      poly(ctx, [[22, 80], [32, 104], [42, 80]], '#5a7a7a');
      box(ctx, 8, 46, 12, 5, '#6a8a8a'); box(ctx, 44, 46, 12, 5, '#6a8a8a');
      return c;
    },
  },
  dagonBroken: {   // Dagon, fallen on his face, with his head and hands broken off
    foot: 2, solid: true,
    draw() {
      const [c, ctx] = canvas(64, 54);
      disc(ctx, 32, 48, 28, 4, 'rgba(0,0,0,0.2)');
      poly(ctx, [[8, 44], [14, 28], [48, 30], [56, 44]], '#6a8a8a'); poly(ctx, [[14, 28], [48, 30], [44, 34], [16, 33]], '#7aa0a0');
      disc(ctx, 56, 44, 6, 5, '#7aa0a0'); box(ctx, 2, 44, 6, 3, '#6a8a8a'); box(ctx, 58, 40, 5, 3, '#6a8a8a');
      return c;
    },
  },
});

