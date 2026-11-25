// Placeholder art, drawn in code so the prototype needs no image files.
// Everything here is meant to be replaced once we choose a real art style.

export const T = 32;            // tile size in pixels
export const CW = 40, CH = 56;  // one character frame
export const FEET_Y = 52;       // where the feet sit inside a frame
export const DIRS = ['down', 'up', 'side'];

export const BRONZE = '#b98b3c';

// Clothing colors offered on the character screen.
export const OPTIONS = {
  top: ['#d94a3d', '#3d7bd9', '#3fa65a', '#e6b42e', '#8a55c9', '#28a6a0'],
  bottom: ['#33507a', '#55585e', '#a58f63', '#2b2b30'],
};

// The travelers a player can choose from. Each is a face and hair; clothes are
// chosen separately. Add, remove or reorder freely.
export const AVATARS = [
  { skin: '#e8b68c', hairStyle: 'short', hair: '#4a2f1b' },
  { skin: '#6e4428', hairStyle: 'afro', hair: '#1f1a17' },
  { skin: '#f6d3b3', hairStyle: 'tied', hair: '#d9b45a' },
  { skin: '#a06a42', hairStyle: 'braids', hair: '#1f1a17' },
  { skin: '#f0c8a0', hairStyle: 'bob', hair: '#1f1a17' },
  { skin: '#c98f62', hairStyle: 'curly', hair: '#2a211c' },
  { skin: '#f6d3b3', hairStyle: 'short', hair: '#b5532a', freckles: true },
  { skin: '#6e4428', hairStyle: 'buzz', hair: '#1f1a17' },
  { skin: '#a06a42', hairStyle: 'puffs', hair: '#2a211c' },
  { skin: '#e8b68c', hairStyle: 'bun', hair: '#1f1a17', glasses: true },
  { skin: '#c98f62', hairStyle: 'long', hair: '#1f1a17' },
  { skin: '#8a5634', hairStyle: 'short', hair: '#1f1a17', glasses: true },
  { skin: '#f6d3b3', hairStyle: 'long', hair: '#7a4a26', freckles: true },
  { skin: '#8a5634', hairStyle: 'curly', hair: '#1f1a17' },
];

// Put an avatar's face and hair onto a look, keeping its clothes.
export function withAvatar(look, n) {
  const i = ((n % AVATARS.length) + AVATARS.length) % AVATARS.length;
  return { ...look, glasses: false, freckles: false, ...AVATARS[i], avatar: i };
}

export function defaultLook() {
  return withAvatar({ kind: 'modern', device: true, top: OPTIONS.top[1], bottom: OPTIONS.bottom[0] }, 0);
}

export function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(v * f))));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}

// A repeatable "random" number for a tile, so the ground never flickers.
function rnd(x, y, i) {
  const n = Math.sin(x * 127.1 + y * 311.7 + i * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

// ---------------------------------------------------------------- characters

// Animals use the same frame layout as people, so they can walk around like anyone else.
const ANIMALS = {
  lamb: { wool: '#f4f1e6', dark: '#dcd6c4', face: '#e7d3bd', legs: '#6a5a4a', horns: false },
  goat: { wool: '#9a7550', dark: '#7f5f40', face: '#b08a62', legs: '#4a3a2a', horns: true },
  calf: { wool: '#a8703f', dark: '#8a5a32', face: '#c08a55', legs: '#5a3f28', horns: false },
  donkey: { wool: '#8f8a84', dark: '#75706a', face: '#a39e98', legs: '#4f4a45', horns: false, ears: true },
  ibex: { wool: '#c9a878', dark: '#a98a5e', face: '#d8bc90', legs: '#6a5438', horns: true },
  lion: { wool: '#d1a85a', dark: '#b08840', face: '#ddb86c', legs: '#a07a38', mane: '#8a5a28' },
  deer: { wool: '#a8784a', dark: '#8a6038', face: '#c09060', legs: '#5a3f28', antlers: true },
  elephant: { wool: '#8e8e96', dark: '#74747c', face: '#9e9ea6', legs: '#6a6a72', trunk: true },
  camel: { wool: '#c9a272', dark: '#a8845a', face: '#d4b080', legs: '#8a6a44', hump: true },
  ram: { wool: '#ece6d4', dark: '#d2cab4', face: '#d9c7ae', legs: '#6a5a4a', curl: '#b8a888' },
};
// Creatures drawn their own way: birds fly a little above the ground, fish swim.
const FLYERS = { dove: { body: '#f4f4f0', wing: '#d8d8d2' }, raven: { body: '#2a2a30', wing: '#3e3e48' }, bird: { body: '#4f7ac9', wing: '#e6b42e' } };
const SWIMMERS = { fish: { body: '#e8823a', fin: '#c4602a' }, bigfish: { body: '#4f6f9a', fin: '#3a557a' } };
const CRAWLERS = { serpent: { body: '#5f9a3a', mark: '#3a6a22', belly: '#c9d27a' } };
const CARTS = { cart: { wood: '#7a5230', gold: '#e3b93a' } };
export const ANIMAL_HEADROOM = 30;   // empty rows above an animal in its frame

function drawFlyer(ctx, ox, oy, kind, dir, step) {
  const f = FLYERS[kind];
  const r = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(ox + x, oy + y, w, h); };
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath(); ctx.ellipse(ox + 20, oy + FEET_Y, 6, 2, 0, 0, Math.PI * 2); ctx.fill();
  const up = step === 1;
  r(15, 28, 11, 7, f.body); r(25, 26, 5, 5, f.body); r(30, 28, 3, 2, '#e6a23a'); r(27, 27, 1, 1, '#1a1a1a');
  r(11, 30, 4, 3, f.wing);
  if (up) { r(16, 20, 8, 8, f.wing); } else { r(16, 34, 8, 5, f.wing); }
  if (dir === 'up') r(15, 28, 11, 7, shade(f.body, 0.9));
}

function drawSwimmer(ctx, ox, oy, kind, dir, step) {
  const f = SWIMMERS[kind];
  const r = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(ox + x, oy + y, w, h); };
  const wag = step === 1 ? 1 : step === 2 ? -1 : 0;
  r(12, 42, 16, 7, f.body); r(14, 41, 12, 1, f.body); r(14, 49, 12, 1, f.body);
  r(6, 41 + wag, 6, 3, f.fin); r(6, 46 - wag, 6, 3, f.fin); r(17, 39, 6, 2, f.fin);
  r(24, 44, 2, 2, '#1a1a1a');
}

function drawCart(ctx, ox, oy, kind, dir, step) {
  const c = CARTS[kind];
  const r = (x, y, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(ox + x, oy + y, w, h); };
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.ellipse(ox + 20, oy + FEET_Y, 16, 3, 0, 0, Math.PI * 2); ctx.fill();
  r(6, 36, 28, 6, c.wood); r(6, 42, 28, 2, shade(c.wood, 0.7));
  r(2, 38, 5, 2, c.wood); r(33, 38, 5, 2, c.wood);
  // the wheels turn as it rolls
  const spin = step === 1 ? 1 : step === 2 ? 2 : 0;
  for (const x of [10, 28]) { r(x, 42, 5, 8, '#4a3524'); r(x + 1, 43 + spin % 2, 3, 2, '#7a5a3a'); }
  r(10, 28, 20, 8, c.gold); r(10, 28, 20, 2, shade(c.gold, 1.2)); r(8, 30, 2, 3, '#f2d46a'); r(30, 30, 2, 3, '#f2d46a');
}

function drawCrawler(ctx, ox, oy, kind, dir, step) {
  const c = CRAWLERS[kind];
  const r = (x, y, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(ox + x, oy + y, w, h); };
  const wave = step === 1 ? 1 : step === 2 ? -1 : 0;
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath(); ctx.ellipse(ox + 20, oy + FEET_Y, 12, 2.5, 0, 0, Math.PI * 2); ctx.fill();
  // An S of body along the ground, and a raised head.
  r(6, 48 + wave, 10, 4, c.body); r(14, 45 - wave, 10, 4, c.body); r(22, 48 + wave, 8, 4, c.body);
  r(26, 38, 4, 11, c.body); r(25, 34, 8, 6, c.body); r(31, 36, 3, 2, c.body);
  for (const [x, y] of [[8, 49], [16, 46], [24, 49], [27, 42]]) r(x, y + (y === 42 ? 0 : wave * (x === 16 ? -1 : 1)), 2, 2, c.mark);
  r(30, 36, 1, 1, '#1a1a1a'); r(33, 38, 2, 1, '#c8302a');
}

function drawAnimal(ctx, ox, oy, kind, dir, step) {
  if (CRAWLERS[kind]) return drawCrawler(ctx, ox, oy, kind, dir, step);
  if (FLYERS[kind]) return drawFlyer(ctx, ox, oy, kind, dir, step);
  if (SWIMMERS[kind]) return drawSwimmer(ctx, ox, oy, kind, dir, step);
  const a = ANIMALS[kind];
  const r = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(ox + x, oy + y, w, h); };
  const eye = '#2a2222', horn = '#e8e0cc';
  const liftA = step === 1 ? 2 : 0, liftB = step === 2 ? 2 : 0;
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(ox + 20, oy + FEET_Y, 10, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  if (dir === 'side') {
    r(12, 46, 2, 6 - liftA, a.legs); r(15, 46, 2, 6 - liftB, a.legs); r(23, 46, 2, 6 - liftB, a.legs); r(26, 46, 2, 6 - liftA, a.legs);
    r(10, 37, 19, 10, a.wool); r(11, 36, 17, 1, a.wool); r(10, 45, 19, 2, a.dark);
    r(8, 39, 2, 4, a.wool);
    if (a.hump) { r(13, 31, 9, 6, a.wool); r(15, 29, 5, 2, a.wool); }
    if (a.mane) { r(23, 28, 10, 14, a.mane); r(8, 37, 3, 6, a.mane); }
    r(27, 32, 7, 8, a.face); r(33, 36, 2, 3, a.face); r(26, 31, 4, 3, a.wool); r(25, 33, 2, 4, a.dark);
    r(31, 34, 1, 2, eye);
    if (a.horns) { r(28, 27, 2, 5, horn); r(26, 27, 2, 2, horn); r(32, 40, 2, 3, a.dark); }
    if (a.ears) { r(26, 25, 2, 7, a.dark); r(29, 25, 2, 7, a.wool); }
    if (a.curl) { r(25, 29, 5, 2, a.curl); r(24, 31, 2, 4, a.curl); r(25, 35, 3, 1, a.curl); }
    if (a.antlers) { r(28, 22, 1, 9, '#7a5a34'); r(26, 23, 2, 1, '#7a5a34'); r(29, 24, 3, 1, '#7a5a34'); r(30, 21, 1, 3, '#7a5a34'); }
    if (a.trunk) { r(33, 37, 3, 10, a.face); r(31, 47, 4, 2, a.face); r(22, 30, 6, 11, a.dark); }
  } else {
    r(15, 47, 2, 5 - liftA, a.legs); r(23, 47, 2, 5 - liftB, a.legs);
    r(12, 35, 16, 13, a.wool); r(13, 34, 14, 1, a.wool); r(12, 46, 16, 2, a.dark);
    if (dir === 'down') {
      r(15, 37, 10, 9, a.face); r(14, 35, 12, 3, a.wool); r(12, 38, 3, 3, a.dark); r(25, 38, 3, 3, a.dark);
      r(17, 40, 1, 2, eye); r(22, 40, 1, 2, eye); r(19, 44, 2, 1, '#b98a7a');
      if (a.horns) { r(15, 31, 2, 5, horn); r(23, 31, 2, 5, horn); r(19, 46, 2, 3, a.dark); }
      if (a.ears) { r(13, 29, 3, 8, a.dark); r(24, 29, 3, 8, a.dark); }
      if (a.curl) { r(11, 34, 4, 2, a.curl); r(10, 36, 2, 4, a.curl); r(25, 34, 4, 2, a.curl); r(28, 36, 2, 4, a.curl); }
      if (a.mane) { r(11, 33, 3, 12, a.mane); r(26, 33, 3, 12, a.mane); r(13, 32, 14, 3, a.mane); }
      if (a.antlers) { r(14, 26, 1, 8, '#7a5a34'); r(25, 26, 1, 8, '#7a5a34'); r(12, 27, 2, 1, '#7a5a34'); r(26, 27, 2, 1, '#7a5a34'); }
      if (a.trunk) { r(18, 44, 4, 8, a.face); r(9, 34, 4, 9, a.dark); r(27, 34, 4, 9, a.dark); }
      if (a.hump) r(15, 31, 10, 4, a.wool);
    } else {
      r(15, 32, 10, 5, a.wool); r(12, 35, 3, 3, a.dark); r(25, 35, 3, 3, a.dark); r(19, 47, 2, 3, a.wool);
      if (a.horns) { r(15, 29, 2, 4, horn); r(23, 29, 2, 4, horn); }
      if (a.curl) { r(11, 33, 4, 2, a.curl); r(25, 33, 4, 2, a.curl); }
    }
  }
}

export function drawCharacter(ctx, ox, oy, look, dir = 'down', step = 0) {
  if (CARTS[look.kind]) return drawCart(ctx, ox, oy, look.kind, dir, step);
  if (ANIMALS[look.kind] || FLYERS[look.kind] || SWIMMERS[look.kind] || CRAWLERS[look.kind]) return drawAnimal(ctx, ox, oy, look.kind, dir, step);
  const r = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(ox + x, oy + y, w, h); };
  const skin = look.skin, skinD = shade(skin, 0.82), mouth = shade(skin, 0.68);
  const top = look.top, topD = shade(top, 0.8);
  const hair = look.hair;
  const robe = look.kind !== 'modern';
  const eye = '#2a2222';

  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(ox + 20, oy + FEET_Y, 11, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (look.javelin && dir !== 'up') r(6, 22, 28, 2, BRONZE);

  // legs and feet
  const leg = look.greaves ? BRONZE : (robe ? skin : look.bottom);
  const shoe = robe ? '#6b4a2b' : '#f2f2f2';
  if (dir === 'side') {
    const s = step === 1 ? -3 : step === 2 ? 3 : 0;
    r(17 - s, 40, 5, 10, shade(leg, 0.85)); r(17 - s, 50, 7, 3, shade(shoe, 0.85));
    r(18 + s, 40, 5, 10, leg); r(18 + s, 50, 7, 3, shoe);
  } else {
    const liftL = step === 1 ? 2 : 0, liftR = step === 2 ? 2 : 0;
    r(14, 40, 5, 10 - liftL, leg); r(13, 50 - liftL, 6, 3, shoe);
    r(21, 40, 5, 10 - liftR, leg); r(21, 50 - liftR, 6, 3, shoe);
  }

  // body
  if (robe) {
    r(12, 24, 16, 22, top);
    r(12, 44, 16, 2, topD);
    if (look.sash) r(12, 35, 16, 3, look.sash);
  } else {
    r(13, 24, 14, 16, top);
    r(13, 38, 14, 2, topD);
  }
  if (look.armor) {
    r(12, 24, 16, 13, look.armor);
    const dot = shade(look.armor, 0.7);
    for (let yy = 26; yy < 36; yy += 3) for (let xx = 13 + (yy % 2); xx < 27; xx += 3) r(xx, yy, 1, 1, dot);
  }

  // arms
  const sleeve = look.armor ? shade(look.armor, 0.9) : top;
  if (dir === 'side') {
    const sw = step === 1 ? 2 : step === 2 ? -2 : 0;
    r(18 + sw, 25, 5, 6, shade(sleeve, 0.9)); r(18 + sw, 31, 5, 6, skin); r(18 + sw, 37, 5, 3, skinD);
  } else {
    const sw = step === 1 ? 1 : step === 2 ? -1 : 0;
    r(8, 25 + sw, 4, 6, sleeve); r(8, 31 + sw, 4, 6, skin); r(8, 37 + sw, 4, 3, skinD);
    r(28, 25 - sw, 4, 6, sleeve); r(28, 31 - sw, 4, 6, skin); r(28, 37 - sw, 4, 3, skinD);
    if (look.device) r(8, 34 + sw, 4, 2, '#4de3ff');
  }

  // head
  r(18, 22, 4, 3, skinD);
  r(13, 8, 14, 16, skin); r(12, 9, 16, 14, skin);
  if (dir === 'down') {
    r(16, 15, 2, 3, eye); r(22, 15, 2, 3, eye);
    r(18, 20, 4, 1, mouth);
  } else if (dir === 'side') {
    r(23, 15, 2, 3, eye); r(28, 16, 1, 3, skin);
    r(24, 20, 3, 1, mouth);
  }
  if (look.freckles && dir === 'down') for (const [fx, fy] of [[14, 18], [16, 19], [23, 19], [25, 18]]) r(fx, fy, 1, 1, mouth);
  if (look.glasses && dir !== 'up') {
    const frame = '#2b2b30', lens = '#d6eef5';
    if (dir === 'down') {
      for (const gx of [15, 21]) { r(gx, 14, 4, 5, frame); r(gx + 1, 15, 2, 3, lens); r(gx + 1, 16, 2, 2, eye); }
      r(19, 15, 2, 1, frame);
    } else {
      r(22, 14, 4, 5, frame); r(23, 15, 2, 3, lens); r(23, 16, 2, 2, eye); r(16, 15, 6, 1, frame);
    }
  }
  if (look.beard && dir !== 'up') {
    const b = look.beard === true ? hair : look.beard;
    if (dir === 'down') {
      r(12, 17, 3, 6, b); r(25, 17, 3, 6, b); r(13, 21, 14, 4, b); r(15, 19, 10, 2, b);
      r(18, 20, 4, 1, mouth);
    } else {
      r(17, 18, 4, 6, b); r(19, 21, 9, 4, b); r(22, 19, 6, 2, b);
    }
  }

  // hair
  const style = look.hairStyle || 'short';
  if (style === 'buzz') {
    const fuzz = shade(hair, 1.25);
    if (dir === 'up') r(12, 6, 16, 12, fuzz);
    else if (dir === 'down') { r(12, 6, 16, 3, fuzz); r(13, 5, 14, 1, fuzz); r(12, 8, 2, 3, fuzz); r(26, 8, 2, 3, fuzz); }
    else { r(12, 6, 16, 3, fuzz); r(13, 5, 14, 1, fuzz); r(12, 8, 6, 6, fuzz); }
  } else if (dir === 'up') {
    r(12, 6, 16, 15, hair); r(13, 5, 14, 2, hair);
    if (style === 'long') r(11, 9, 18, 17, hair);
    if (style === 'curly') { r(10, 4, 20, 14, hair); r(12, 2, 5, 3, hair); r(23, 2, 5, 3, hair); }
    if (style === 'tied') r(17, 16, 6, 11, hair);
    if (style === 'afro') r(8, 1, 24, 21, hair);
    if (style === 'braids') for (let bx = 11; bx < 29; bx += 3) { r(bx, 18, 2, 9, hair); r(bx, 27, 2, 2, '#e6b42e'); }
    if (style === 'bun' || style === 'puffs') r(16, 0, 8, 7, hair);
    if (style === 'puffs') { r(7, 2, 7, 7, hair); r(26, 2, 7, 7, hair); }
    if (style === 'bob') r(11, 7, 18, 15, hair);
  } else if (dir === 'down') {
    r(12, 6, 16, 5, hair); r(13, 5, 14, 2, hair); r(12, 9, 2, 5, hair); r(26, 9, 2, 5, hair);
    if (style === 'long') { r(10, 9, 3, 17, hair); r(27, 9, 3, 17, hair); }
    if (style === 'curly') {
      r(10, 5, 20, 5, hair); r(10, 9, 3, 6, hair); r(27, 9, 3, 6, hair);
      r(12, 3, 4, 3, hair); r(18, 2, 5, 3, hair); r(25, 3, 4, 3, hair);
    }
    if (style === 'tied') r(17, 1, 6, 5, hair);
    if (style === 'afro') { r(10, 0, 20, 9, hair); r(8, 3, 24, 6, hair); r(8, 9, 4, 8, hair); r(28, 9, 4, 8, hair); }
    if (style === 'braids') for (const bx of [10, 13, 25, 28]) { r(bx, 9, 2, 18, hair); r(bx, 27, 2, 2, '#e6b42e'); }
    if (style === 'bun') r(16, 0, 8, 6, hair);
    if (style === 'puffs') { r(7, 2, 7, 7, hair); r(26, 2, 7, 7, hair); }
    if (style === 'bob') { r(10, 9, 3, 12, hair); r(27, 9, 3, 12, hair); r(13, 8, 14, 3, hair); }
  } else {
    r(12, 6, 16, 5, hair); r(13, 5, 14, 2, hair); r(12, 9, 6, 9, hair);
    if (style === 'long') r(10, 9, 7, 17, hair);
    if (style === 'curly') { r(10, 5, 19, 5, hair); r(10, 9, 7, 8, hair); r(12, 3, 4, 3, hair); r(19, 2, 5, 3, hair); }
    if (style === 'tied') { r(8, 10, 5, 4, hair); r(6, 13, 4, 8, hair); }
    if (style === 'afro') { r(9, 0, 21, 10, hair); r(7, 4, 12, 15, hair); }
    if (style === 'braids') for (const bx of [10, 13]) { r(bx, 10, 2, 17, hair); r(bx, 27, 2, 2, '#e6b42e'); }
    if (style === 'bun') r(9, 2, 7, 6, hair);
    if (style === 'puffs') { r(8, 2, 7, 7, hair); r(20, 0, 7, 6, hair); }
    if (style === 'bob') { r(10, 9, 8, 12, hair); r(13, 8, 13, 3, hair); }
  }

  // things worn on the head
  const hc = look.headColor || '#7a2e2e';
  if (look.head === 'band') {
    r(12, 10, 16, 2, hc);
  } else if (look.head === 'cloth') {
    if (dir === 'up') r(10, 4, 20, 21, hc);
    else if (dir === 'down') { r(11, 4, 18, 7, hc); r(10, 9, 3, 15, hc); r(27, 9, 3, 15, hc); r(11, 10, 18, 2, shade(hc, 0.7)); }
    else { r(11, 4, 18, 7, hc); r(10, 9, 8, 15, hc); r(11, 10, 18, 2, shade(hc, 0.7)); }
  } else if (look.head === 'helmet') {
    r(12, 4, 16, dir === 'up' ? 13 : 7, BRONZE); r(11, 10, 18, 2, shade(BRONZE, 0.75)); r(19, 1, 2, 4, shade(BRONZE, 0.75));
  } else if (look.head === 'bighelmet') {
    // The king's helmet on a child: so big it sits down over the eyes.
    r(10, 3, 20, dir === 'up' ? 17 : 13, BRONZE); r(9, 15, 22, 3, shade(BRONZE, 0.75)); r(19, 0, 2, 4, shade(BRONZE, 0.75));
  } else if (look.head === 'crown') {
    r(12, 6, 16, 3, '#e3b93a'); r(13, 3, 2, 3, '#e3b93a'); r(19, 2, 2, 4, '#e3b93a'); r(25, 3, 2, 3, '#e3b93a');
  } else if (look.head === 'nemes') {
    // An Egyptian striped headcloth, falling in two lappets at the sides.
    const gold = '#e3b93a';
    if (dir === 'up') { r(10, 4, 20, 22, hc); for (let yy = 6; yy < 26; yy += 4) r(10, yy, 20, 1, gold); }
    else {
      r(11, 3, 18, 8, hc); r(10, 9, 4, 17, hc); r(26, 9, 4, 17, hc);
      for (let yy = 4; yy < 26; yy += 4) { r(10, yy, 4, 1, gold); r(26, yy, 4, 1, gold); }
      r(11, 9, 18, 2, gold);
    }
  } else if (look.head === 'plume') {
    r(12, 7, 16, 3, shade(hc, 0.7));
    for (let xx = 12; xx < 28; xx += 2) r(xx, 1, 1, 6, hc);
  }

  // things carried
  const wood = '#7a5a34';
  if (look.item === 'staff') r(dir === 'up' ? 5 : 33, 12, 2, 40, wood);
  if (look.item === 'spear') { r(34, 0, 2, 52, wood); r(33, 0, 4, 6, '#9aa0a8'); }
  if (look.item === 'shield' && dir !== 'up') {
    const sx = dir === 'side' ? 22 : 0;
    r(3 + sx, 24, 13, 20, '#8f6a2a'); r(4 + sx, 25, 11, 18, BRONZE); r(8 + sx, 32, 3, 3, '#8f6a2a');
  }
  if (look.item === 'bag' || look.item === 'staff') {
    if (dir !== 'up') for (let i = 0; i < 6; i++) r(14 + i * 2, 25 + i * 2, 2, 1, '#5d4526');
    r(25, 37, 6, 6, wood); r(25, 37, 6, 1, '#5d4526');
  }
  if (look.item === 'horn' && dir !== 'up') {
    // A horn of oil, held in the hand.
    r(27, 33, 7, 4, '#efe6cf'); r(32, 30, 3, 4, '#efe6cf'); r(27, 33, 2, 4, '#8f6a2a');
  }
  if (look.item === 'harp' && dir !== 'up') {
    r(26, 27, 2, 12, wood); r(33, 27, 2, 12, wood); r(26, 27, 9, 2, wood); r(26, 37, 9, 2, wood);
    r(29, 29, 1, 8, '#efe6cf'); r(31, 29, 1, 8, '#efe6cf');
  }
  if (look.item === 'bread' && dir !== 'up') {
    r(13, 31, 14, 7, '#c98f4f'); r(14, 30, 12, 2, '#dba865'); r(17, 32, 1, 4, '#a06a30'); r(22, 32, 1, 4, '#a06a30');
  }
  if (look.item === 'skin' && dir !== 'up') {
    r(14, 29, 12, 10, '#6b4a2b'); r(18, 26, 4, 4, '#6b4a2b'); r(18, 25, 4, 2, '#3a2a18');
  }
  if (look.item === 'bow') {
    const bx = dir === 'up' ? 5 : 32;
    r(bx, 14, 2, 30, wood); r(bx - 1, 12, 2, 4, wood); r(bx - 1, 42, 2, 4, wood); r(bx + (dir === 'up' ? 2 : -2), 14, 1, 30, '#efe6cf');
  }
  if (look.item === 'jar' && dir !== 'up') {
    r(14, 28, 12, 12, '#b5764a'); r(16, 25, 8, 4, '#b5764a'); r(15, 24, 10, 2, '#8f5a36');
  }
  if (look.item === 'clay' && dir !== 'up') {
    r(14, 30, 12, 8, '#9a6a44'); r(15, 29, 10, 2, '#a87a50');
  }
  if (look.item === 'brick' && dir !== 'up') {
    r(13, 30, 14, 8, '#c0703a'); r(13, 30, 14, 1, '#d8884a'); r(13, 37, 14, 1, '#8a4a22');
  }
  if (look.item === 'bundle' && dir !== 'up') {
    r(13, 30, 14, 9, '#eadfb5'); r(13, 34, 14, 1, '#b9a36a'); r(19, 30, 1, 9, '#b9a36a');
  }
  if (look.item === 'stone' && dir !== 'up') {   // a smooth stone, carried in both arms
    r(13, 30, 14, 9, '#9a9384'); r(14, 30, 10, 3, '#b0a998'); r(13, 37, 14, 2, '#7a7466');
  }
  if (look.item === 'baby' && dir !== 'up') {   // a baby wrapped in cloth
    r(12, 29, 16, 8, '#f4f1e6'); r(12, 33, 16, 1, '#dcd6c4');
    r(13, 29, 6, 6, '#e8b68c'); r(14, 31, 1, 1, '#2a2222'); r(17, 31, 1, 1, '#2a2222'); r(13, 28, 6, 2, '#5a4a3a');
  }
  if (look.item === 'sheaf' && dir !== 'up') {   // a bundle of grain, ears upward
    r(14, 31, 12, 8, '#d9b84a'); r(13, 29, 3, 3, '#e8cd6a'); r(18, 27, 3, 5, '#e8cd6a'); r(24, 29, 3, 3, '#e8cd6a'); r(14, 34, 12, 1, '#8f7550');
  }
  if (look.item === 'tambourine' && dir !== 'up') {
    disc(ctx, ox + 30, oy + 30, 6, 6, '#c98f4f'); disc(ctx, ox + 30, oy + 30, 4, 4, '#ecd9a6');
    r(24, 29, 1, 1, '#e3b93a'); r(35, 29, 1, 1, '#e3b93a'); r(30, 23, 1, 1, '#e3b93a');
  }
  if (look.item === 'torch' && dir !== 'up') {
    r(30, 26, 2, 14, '#6b4a2b'); r(28, 20, 6, 7, '#e8742c'); r(29, 17, 4, 5, '#ffd23f');
  }
  if (look.item === 'trumpet' && dir !== 'up') {
    r(26, 30, 9, 3, '#efe6cf'); r(33, 27, 3, 9, '#efe6cf'); r(26, 30, 2, 3, '#8f6a2a');
  }
  if (look.item === 'grapes' && dir !== 'up') {   // a huge cluster of grapes on a pole
    r(33, 8, 2, 44, wood);
    for (const [gx, gy] of [[28, 16], [32, 14], [36, 16], [29, 20], [34, 20], [31, 24], [35, 24], [32, 28]]) disc(ctx, ox + gx + 2, oy + gy + 2, 3, 3, '#6a3a8a');
    r(32, 11, 3, 3, '#4f7a31');
  }
  if (look.item === 'basket' && dir !== 'up') {
    r(13, 31, 14, 8, '#b98a4a'); r(13, 31, 14, 2, '#d4a85e'); r(13, 35, 14, 1, '#8f6a30');
  }
  if (look.item === 'ark') {   // a gold chest carried on poles, shoulder high
    r(6, 14, 28, 9, '#e3b93a'); r(6, 14, 28, 3, '#f2d46a'); r(6, 21, 28, 2, '#b98b3c');
    r(2, 22, 36, 2, '#7a5a34'); r(8, 8, 5, 6, '#f2d46a'); r(27, 8, 5, 6, '#f2d46a');
  }
  if (look.item === 'wood' && dir !== 'up') {   // a bundle of firewood on the back
    r(10, 24, 20, 4, '#7a5a34'); r(10, 28, 20, 4, '#8f6a3e'); r(10, 32, 20, 3, '#6b4a2b'); r(18, 23, 2, 13, '#5d4526');
  }
}

export function characterSheet(look) {
  const c = document.createElement('canvas');
  c.width = CW * 3; c.height = CH * 3;
  const ctx = c.getContext('2d');
  DIRS.forEach((d, row) => { for (let s = 0; s < 3; s++) drawCharacter(ctx, s * CW, row * CH, look, d, s); });
  return c;
}

export function addCharacterTexture(scene, key, look) {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const tex = scene.textures.addCanvas(key, characterSheet(look));
  DIRS.forEach((d, row) => { for (let s = 0; s < 3; s++) tex.add(d + s, 0, s * CW, row * CH, CW, CH); });
}

// -------------------------------------------------------------------- ground

const GROUND = {
  '.': { base: '#a9b46c', specks: ['#98a45d', '#bcc47c'] },   // grass
  ',': { base: '#c9a777', specks: ['#b8946a', '#d8b98b'] },   // path
  ':': { base: '#cdbd85', specks: ['#bcab74', '#dccd98'] },   // valley floor
  'h': { base: '#9c9a62', specks: ['#878553', '#aeac74'] },   // hillside
  'o': { base: '#bfb59a', specks: ['#8f8a7c', '#d6cfb8'] },   // pebble bank
  '~': { base: '#5fa8c9', specks: ['#4a90b3', '#8cc7de'] },   // brook
  'b': { base: '#d9c15a', specks: ['#c4a945', '#ecd97a'] },   // barley field
  'g': { base: '#8fa858', specks: ['#6f8a3f', '#a9c06c'] },   // tall grass
  's': { base: '#d8c08f', specks: ['#c4ab78', '#e6d2a6'] },   // desert rock
  'x': { base: '#d8c08f', specks: ['#6f8a3f', '#8fa858'] },   // desert brush, good for hiding
  'c': { base: '#5a5148', specks: ['#4a423a', '#6a6157'] },   // cave floor
  '#': { base: '#7b6f5c', specks: ['#665b4a', '#8d8170'] },   // cliff
  'w': { base: '#9a7048', specks: ['#8a6240', '#a87c52'] },   // floorboards (the attic)
  'r': { base: '#8a3a3a', specks: ['#7a3030', '#9e4a44'] },   // rug
  'W': { base: '#5a4434', specks: ['#4e3a2c', '#664e3c'] },   // wall
  'v': { base: '#12141c', specks: ['#0d0f15', '#1a1d28'] },   // formless, before the light
  'S': { base: '#2f5f8a', specks: ['#2a5680', '#3a6c98'] },   // deep sea, cannot be walked on
  'G': { base: '#7fb35a', specks: ['#6ea04c', '#93c56a'] },   // the garden's lush grass
  'f': { base: '#7fb35a', specks: ['#e8d24a', '#e86a8a'] },   // flowers
  'k': { base: '#b98a5c', specks: ['#a87a50', '#c99a6a'] },   // clay and brick ground
  'm': { base: '#8a7a5a', specks: ['#7a6a4a', '#9a8a6a'] },   // wet mud, where the flood has just gone
  'p': { base: '#d9cfb4', specks: ['#c8bd9e', '#e8dfc6'] },   // pale paving, for palaces and courts
  'd': { base: '#6a6560', specks: ['#5a5550', '#7a756f'] },   // dark stone floor, for prisons
  'n': { base: '#6b5a3e', specks: ['#5a4a30', '#7d6b4c'] },   // black Nile soil
  'R': { base: '#8a2a2a', specks: ['#6f2020', '#a33a3a'] },   // water turned to blood
};

export function groundCanvas(rows) {
  const c = document.createElement('canvas');
  c.width = rows[0].length * T; c.height = rows.length * T;
  const ctx = c.getContext('2d');
  rows.forEach((line, ty) => {
    for (let tx = 0; tx < line.length; tx++) {
      const ch = line[tx];
      const g = GROUND[ch] || GROUND['.'];
      const px = tx * T, py = ty * T;
      ctx.fillStyle = g.base;
      ctx.fillRect(px, py, T, T);
      for (let i = 0; i < 9; i++) {
        ctx.fillStyle = g.specks[i % 2];
        const sx = Math.floor(rnd(tx, ty, i) * (T - 4)), sy = Math.floor(rnd(tx, ty, i + 20) * (T - 3));
        if (ch === '~') ctx.fillRect(px + sx, py + sy, 7, 1);
        else if (ch === '#') ctx.fillRect(px + sx, py + sy, 5, 3);
        else if (ch === 'o') ctx.fillRect(px + sx, py + sy, 3, 2);
        else if (ch === 'b' || ch === 'g') ctx.fillRect(px + sx, py + sy, 1, 5);
        else if (ch === 'x') ctx.fillRect(px + sx, py + sy, 6, 5);
        else if (ch === 'w' || ch === 'W') ctx.fillRect(px + sx, py + sy, 5, 1);
        else if (ch === 'S') ctx.fillRect(px + sx, py + sy, 8, 1);
        else if (ch === 'G') ctx.fillRect(px + sx, py + sy, 1, 4);
        else if (ch === 'f') ctx.fillRect(px + sx, py + sy, 3, 3);
        else ctx.fillRect(px + sx, py + sy, 2, 2);
      }
      if (ch === '#') { ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(px, py + T - 3, T, 3); }
      if (ch === 'w') { ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(px, py + T - 1, T, 1); if ((tx + ty) % 3 === 0) ctx.fillRect(px + T - 1, py, 1, T); }
      if (ch === 'W') {
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        for (let i = 0; i < T; i += 8) ctx.fillRect(px + i, py, 1, T);
        if (rows[ty + 1] && rows[ty + 1][tx] !== 'W') { ctx.fillStyle = '#3a2a1e'; ctx.fillRect(px, py + T - 5, T, 5); }
      }
      if (ch === 'r') { ctx.fillStyle = '#d9b45a'; if (rows[ty - 1]?.[tx] !== 'r') ctx.fillRect(px, py + 2, T, 2); if (rows[ty + 1]?.[tx] !== 'r') ctx.fillRect(px, py + T - 4, T, 2); }
      if (ch === 'x') {
        // Thick enough that it plainly looks like somewhere to hide.
        for (let i = 9; i < 30; i++) {
          ctx.fillStyle = ['#5d7a35', '#6f8a3f', '#8fa858'][i % 3];
          ctx.fillRect(px + Math.floor(rnd(tx, ty, i) * (T - 5)), py + Math.floor(rnd(tx, ty, i + 40) * (T - 5)), 6, 5);
        }
      }
    }
  });
  return c;
}

// --------------------------------------------------------------------- props

export function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}
export function poly(ctx, pts, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fill();
}
export function disc(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}
export function box(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }

function tent(body) {
  const [c, ctx] = canvas(64, 60);
  poly(ctx, [[2, 58], [32, 6], [62, 58]], body);
  poly(ctx, [[32, 6], [62, 58], [44, 58]], shade(body, 0.82));
  poly(ctx, [[25, 58], [32, 30], [39, 58]], '#4b3a2a');
  box(ctx, 31, 2, 2, 8, '#6b4a2b');
  return c;
}

// Each prop: the picture, how many tiles wide its base is, and whether it blocks walking.
export const PROPS = {
  // In the Beginning: the ark, the garden and Babel.
  ark: {
    foot: 10, solid: true,
    draw() {
      const [c, ctx] = canvas(320, 180);
      poly(ctx, [[0, 96], [320, 96], [300, 176], [20, 176]], '#7a5232');               // hull
      for (let y = 104; y < 176; y += 12) box(ctx, 10, y, 300, 2, '#5e3e24');
      box(ctx, 30, 40, 260, 58, '#8a6040');                                             // cabin
      for (let x = 34; x < 290; x += 16) box(ctx, x, 40, 2, 58, '#6e4a2c');
      box(ctx, 40, 52, 240, 10, '#2e2118');                                             // the window strip
      poly(ctx, [[20, 42], [160, 4], [300, 42]], '#6a4428');                            // roof
      poly(ctx, [[160, 4], [300, 42], [230, 42]], '#5a3820');
      box(ctx, 140, 118, 40, 58, '#3e2a18'); box(ctx, 144, 122, 32, 54, '#2a1c10');   // the door
      return c;
    },
  },
  ramp: {
    foot: 2, flat: true,
    draw() {
      const [c, ctx] = canvas(64, 64);
      box(ctx, 8, 0, 48, 64, '#8a6040');
      for (let y = 4; y < 64; y += 8) box(ctx, 8, y, 48, 2, '#6e4a2c');
      return c;
    },
  },
  fruittree: {
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(64, 80);
      box(ctx, 28, 46, 8, 32, '#6b4a2b');
      disc(ctx, 32, 28, 24, 22, '#5f9a3a'); disc(ctx, 19, 38, 14, 12, '#4f8a31'); disc(ctx, 45, 36, 15, 13, '#6faa45');
      for (const [x, y] of [[20, 24], [36, 16], [44, 32], [26, 38], [34, 30]]) disc(ctx, x, y, 3, 3, '#e8823a');
      return c;
    },
  },
  treelife: {
    foot: 2, solid: true, glow: true,
    draw() {
      const [c, ctx] = canvas(96, 112);
      disc(ctx, 48, 44, 46, 42, 'rgba(255,236,150,0.25)');
      box(ctx, 42, 62, 12, 48, '#7a5634');
      disc(ctx, 48, 40, 36, 30, '#4f9a4a'); disc(ctx, 28, 52, 20, 16, '#3f8a3a'); disc(ctx, 68, 50, 22, 17, '#5faa55');
      for (const [x, y] of [[30, 34], [52, 24], [66, 42], [40, 50], [58, 56], [24, 50]]) disc(ctx, x, y, 4, 4, '#ffd23f');
      return c;
    },
  },
  treeknow: {
    foot: 2, solid: true,
    draw() {
      const [c, ctx] = canvas(96, 112);
      box(ctx, 42, 62, 12, 48, '#5e4026');
      disc(ctx, 48, 40, 36, 30, '#3f7a3a'); disc(ctx, 28, 52, 20, 16, '#356a32'); disc(ctx, 68, 50, 22, 17, '#4a8a44');
      for (const [x, y] of [[32, 32], [54, 26], [64, 46], [42, 52], [26, 48]]) disc(ctx, x, y, 4, 4, '#c8302a');
      return c;
    },
  },
  sprout: {
    foot: 1, solid: false,
    draw() {
      const [c, ctx] = canvas(32, 30);
      box(ctx, 15, 14, 2, 14, '#4f7a31'); disc(ctx, 11, 14, 5, 3, '#6faa45'); disc(ctx, 21, 11, 5, 3, '#6faa45'); disc(ctx, 16, 26, 7, 3, '#7a5a34');
      return c;
    },
  },
  bloom: {
    foot: 1, solid: false,
    draw() {
      const [c, ctx] = canvas(32, 34);
      box(ctx, 15, 12, 2, 18, '#4f7a31'); disc(ctx, 10, 16, 6, 3, '#6faa45'); disc(ctx, 22, 13, 6, 3, '#6faa45');
      for (const [x, y] of [[16, 6], [10, 9], [22, 8]]) disc(ctx, x, y, 4, 4, '#e86a8a');
      disc(ctx, 16, 30, 7, 3, '#7a5a34');
      return c;
    },
  },
  kiln: {
    foot: 2, solid: true,
    draw() {
      const [c, ctx] = canvas(64, 60);
      disc(ctx, 32, 34, 28, 24, '#9a6a44'); disc(ctx, 32, 34, 22, 18, '#8a5a38');
      box(ctx, 24, 40, 16, 18, '#2e1c10'); disc(ctx, 32, 48, 6, 5, '#e8742c');
      return c;
    },
  },
  bricks: {
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(32, 34);
      for (let row = 0; row < 4; row++) for (let i = 0; i < 2; i++) box(ctx, 2 + i * 14 + (row % 2) * 4, 30 - row * 7, 12, 6, row % 2 ? '#b0602e' : '#c0703a');
      return c;
    },
  },
  claypit: {
    foot: 2, flat: true,
    draw() {
      const [c, ctx] = canvas(64, 48);
      disc(ctx, 32, 24, 30, 20, '#8a5a3a'); disc(ctx, 32, 24, 24, 15, '#a06a44'); disc(ctx, 26, 20, 6, 3, '#b07a50');
      return c;
    },
  },
  tarpit: {
    foot: 2, flat: true,
    draw() {
      const [c, ctx] = canvas(64, 48);
      disc(ctx, 32, 24, 28, 18, '#3a3028'); disc(ctx, 32, 24, 22, 13, '#1e1a16'); disc(ctx, 24, 20, 5, 2, '#4a4038');
      return c;
    },
  },
  tower: {
    foot: 6, solid: true,
    draw() {
      const [c, ctx] = canvas(192, 260);
      const tiers = [[0, 200, 192], [16, 150, 160], [32, 100, 128], [48, 56, 96], [64, 20, 64]];
      tiers.forEach(([x, y, w], i) => {
        box(ctx, x, y, w, 60 - (i === 4 ? 20 : 0) + (i === 0 ? 0 : 0), i % 2 ? '#b0703c' : '#c0804a');
        for (let yy = y + 6; yy < y + 56 && yy < 260; yy += 8) box(ctx, x, yy, w, 1, '#8a5a30');
      });
      box(ctx, 84, 200, 24, 60, '#5a3a20');                               // the doorway
      for (let i = 0; i < 6; i++) box(ctx, 120 + i * 6, 196 - i * 30, 4, 34, '#7a5232');   // scaffolding
      return c;
    },
  },
  // The attic at Grandma's house, where the game begins.
  trunk: {
    foot: 2, solid: true,
    draw() {
      const [c, ctx] = canvas(64, 44);
      box(ctx, 4, 14, 56, 28, '#6b4a2b'); box(ctx, 2, 8, 60, 10, '#7d5a35');
      for (const x of [12, 48]) { box(ctx, x, 8, 4, 34, '#c9a04a'); }
      box(ctx, 28, 16, 8, 8, '#c9a04a'); box(ctx, 31, 19, 2, 3, '#3a2a18');
      box(ctx, 4, 40, 56, 2, '#4a3220');
      return c;
    },
  },
  trunkOpen: {
    foot: 2, solid: true,
    draw() {
      const [c, ctx] = canvas(64, 52);
      box(ctx, 2, 0, 60, 14, '#7d5a35'); box(ctx, 12, 0, 4, 14, '#c9a04a'); box(ctx, 48, 0, 4, 14, '#c9a04a');
      box(ctx, 4, 22, 56, 28, '#6b4a2b'); box(ctx, 6, 20, 52, 6, '#2e2118');
      box(ctx, 12, 18, 18, 6, '#3a2a5a'); box(ctx, 13, 19, 16, 1, '#e9e2cf');        // the old Bible
      box(ctx, 36, 19, 14, 4, '#efe6cf');                                             // the letter
      for (const x of [12, 48]) box(ctx, x, 22, 4, 28, '#c9a04a');
      box(ctx, 4, 48, 56, 2, '#4a3220');
      return c;
    },
  },
  boxes: {
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(32, 46);
      box(ctx, 2, 22, 28, 22, '#c4a27a'); box(ctx, 2, 30, 28, 2, '#a88660'); box(ctx, 15, 22, 2, 22, '#e2d2a8');
      box(ctx, 6, 4, 22, 18, '#b8956c'); box(ctx, 6, 11, 22, 2, '#9c7b56'); box(ctx, 16, 4, 2, 18, '#e2d2a8');
      return c;
    },
  },
  shelf: {
    foot: 2, solid: true,
    draw() {
      const [c, ctx] = canvas(64, 76);
      box(ctx, 2, 2, 60, 72, '#5d4126'); box(ctx, 6, 6, 52, 64, '#3a2a1c');
      const spines = ['#8a2f2f', '#3d6fb5', '#3fa65a', '#d9b45a', '#6b3fa0', '#a85a4a', '#2b5a5a'];
      for (const y of [6, 28, 50]) {
        for (let x = 7, i = y; x < 56; i++) { const w = 4 + (i % 3); box(ctx, x, y + 4 + (i % 4), w, 16 - (i % 4), spines[i % spines.length]); x += w + 1; }
        box(ctx, 6, y + 20, 52, 2, '#5d4126');
      }
      return c;
    },
  },
  lamp: {
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(40, 70);
      disc(ctx, 20, 16, 20, 18, 'rgba(255,214,120,0.22)');
      box(ctx, 19, 22, 2, 44, '#3a3a3a'); box(ctx, 12, 64, 16, 4, '#3a3a3a');
      poly(ctx, [[10, 22], [14, 6], [26, 6], [30, 22]], '#e8d9a8');
      return c;
    },
  },
  atticwindow: {
    foot: 2, solid: false,
    draw() {
      const [c, ctx] = canvas(64, 52);
      box(ctx, 4, 2, 56, 46, '#6b4a2b'); box(ctx, 8, 6, 48, 38, '#7f94a8');
      box(ctx, 31, 6, 2, 38, '#6b4a2b'); box(ctx, 8, 24, 48, 2, '#6b4a2b');
      ctx.fillStyle = 'rgba(220,235,255,0.6)';
      for (let i = 0; i < 14; i++) ctx.fillRect(10 + ((i * 17) % 44), 8 + ((i * 11) % 32), 1, 5);   // rain
      box(ctx, 2, 46, 60, 4, '#5d4126');
      return c;
    },
  },
  sheet: {
    foot: 2, solid: true,
    draw() {
      const [c, ctx] = canvas(64, 50);
      poly(ctx, [[4, 48], [8, 12], [20, 4], [46, 4], [58, 14], [60, 48]], '#e6e2d6');
      poly(ctx, [[20, 4], [46, 4], [58, 14], [30, 16]], '#f4f1e8');
      box(ctx, 16, 20, 2, 26, '#cfcabc'); box(ctx, 40, 22, 2, 24, '#cfcabc');
      return c;
    },
  },
  tent: { draw: () => tent('#d9c9a3'), foot: 2, solid: true },
  ptent: { draw: () => tent('#8c4a3a'), foot: 2, solid: true },
  bigtent: {
    foot: 3, solid: true,
    draw() {
      const [c, ctx] = canvas(112, 88);
      box(ctx, 8, 40, 96, 46, '#d9c9a3');
      box(ctx, 78, 40, 26, 46, '#c4b38c');
      poly(ctx, [[2, 42], [56, 8], [110, 42]], '#cdbb92');
      box(ctx, 8, 40, 96, 4, '#6b3fa0');
      box(ctx, 46, 54, 20, 32, '#4b3a2a');
      box(ctx, 55, 0, 2, 10, '#6b4a2b');
      poly(ctx, [[57, 0], [72, 4], [57, 8]], '#6b3fa0');
      return c;
    },
  },
  tree: {
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(64, 80);
      box(ctx, 28, 46, 8, 32, '#6b4a2b');
      disc(ctx, 32, 28, 24, 22, '#5f8a3a');
      disc(ctx, 19, 38, 14, 12, '#4f7a31');
      disc(ctx, 45, 36, 15, 13, '#6f9a45');
      return c;
    },
  },
  rock: {
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(32, 28);
      poly(ctx, [[2, 26], [5, 10], [14, 3], [25, 6], [30, 18], [29, 26]], '#8d8778');
      poly(ctx, [[14, 3], [25, 6], [30, 18], [20, 14]], '#a39d8d');
      return c;
    },
  },
  bigrock: {
    foot: 2, solid: true,
    draw() {
      const [c, ctx] = canvas(72, 52);
      poly(ctx, [[3, 50], [8, 22], [24, 6], [50, 4], [66, 20], [70, 50]], '#8d8778');
      poly(ctx, [[24, 6], [50, 4], [66, 20], [40, 22]], '#a39d8d');
      box(ctx, 20, 30, 14, 2, '#7a7466'); box(ctx, 44, 36, 12, 2, '#7a7466');
      return c;
    },
  },
  fire: {
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(32, 32);
      box(ctx, 4, 24, 24, 4, '#5d4526'); box(ctx, 8, 21, 16, 4, '#6b4a2b');
      poly(ctx, [[8, 24], [16, 2], [24, 24]], '#e8742c');
      poly(ctx, [[12, 24], [16, 11], [20, 24]], '#f6d14a');
      return c;
    },
  },
  jars: {
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(32, 34);
      disc(ctx, 10, 22, 8, 10, '#b5764a'); box(ctx, 7, 8, 6, 5, '#b5764a'); box(ctx, 6, 7, 8, 2, '#8f5a36');
      disc(ctx, 23, 25, 7, 8, '#c58a5c'); box(ctx, 20, 14, 6, 4, '#c58a5c'); box(ctx, 19, 13, 8, 2, '#8f5a36');
      return c;
    },
  },
  post: {
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(16, 46);
      box(ctx, 5, 2, 6, 44, '#7a5a34');
      for (let y = 6; y < 40; y += 3) box(ctx, 6, y, 4, 1, '#d8c7a0');
      return c;
    },
  },
  armorstand: {
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(32, 52);
      box(ctx, 15, 12, 2, 40, '#6b4a2b'); box(ctx, 6, 22, 20, 2, '#6b4a2b'); box(ctx, 10, 50, 12, 2, '#6b4a2b');
      box(ctx, 10, 3, 12, 9, BRONZE); box(ctx, 9, 10, 14, 2, shade(BRONZE, 0.75)); box(ctx, 15, 0, 2, 4, shade(BRONZE, 0.75));
      box(ctx, 8, 24, 16, 15, BRONZE);
      for (let y = 26; y < 38; y += 3) for (let x = 9 + (y % 2); x < 23; x += 3) box(ctx, x, y, 1, 1, shade(BRONZE, 0.7));
      return c;
    },
  },
  anvil: {
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(32, 26);
      box(ctx, 4, 18, 24, 8, '#6b4a2b');
      box(ctx, 6, 10, 12, 8, BRONZE); box(ctx, 16, 13, 12, 5, shade(BRONZE, 0.8)); box(ctx, 9, 5, 8, 6, shade(BRONZE, 1.15));
      return c;
    },
  },
  pot: {
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(32, 36);
      box(ctx, 4, 30, 24, 4, '#5d4526');
      poly(ctx, [[9, 30], [16, 22], [23, 30]], '#e8742c');
      disc(ctx, 16, 20, 11, 9, '#3a3430'); box(ctx, 5, 11, 22, 3, '#55504a');
      disc(ctx, 12, 6, 3, 2, 'rgba(255,255,255,0.5)'); disc(ctx, 19, 3, 4, 2, 'rgba(255,255,255,0.4)');
      return c;
    },
  },
  rack: {
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(32, 58);
      box(ctx, 3, 22, 3, 36, '#6b4a2b'); box(ctx, 26, 22, 3, 36, '#6b4a2b'); box(ctx, 3, 28, 26, 3, '#6b4a2b');
      for (const [x, top] of [[9, 3], [15, 0], [21, 4]]) { box(ctx, x, top, 2, 56 - top, '#7a5a34'); box(ctx, x - 1, top, 4, 6, '#9aa0a8'); }
      return c;
    },
  },
  // A tent pole with a notch at Goliath's height and another at an ordinary man's.
  pole: {
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(16, 100);
      box(ctx, 6, 2, 4, 98, '#7a5a34');
      box(ctx, 3, 12, 10, 3, '#b3392e'); box(ctx, 4, 52, 8, 2, '#f0e6c8');
      return c;
    },
  },
  flatstones: {
    foot: 1, solid: false,
    draw() {
      const [c, ctx] = canvas(30, 16);
      disc(ctx, 10, 11, 9, 4, '#8f8a7c'); disc(ctx, 20, 12, 8, 3.5, '#a39d8d'); disc(ctx, 15, 6, 8, 3.5, '#b5af9f');
      return c;
    },
  },
  // ---- palaces, fields and wild places
  hall: {
    foot: 5, solid: true,
    draw() {
      const [c, ctx] = canvas(168, 108);
      box(ctx, 4, 30, 160, 76, '#c9b48a'); box(ctx, 124, 30, 40, 76, '#b8a278');
      box(ctx, 0, 20, 168, 11, '#a58a63'); box(ctx, 0, 17, 168, 4, '#8f7550');
      for (let x = 6; x < 166; x += 16) box(ctx, x, 12, 9, 7, '#a58a63');
      box(ctx, 72, 58, 24, 48, '#4b3a2a'); box(ctx, 68, 54, 32, 5, '#8f7550');
      for (const x of [22, 44, 112, 134]) box(ctx, x, 50, 10, 14, '#4b3a2a');
      box(ctx, 4, 30, 160, 3, '#6b3fa0');
      return c;
    },
  },
  throne: {
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(32, 46);
      box(ctx, 5, 2, 22, 30, '#7a5a34'); box(ctx, 7, 4, 18, 20, '#6b3fa0'); box(ctx, 3, 26, 26, 8, '#8f7550');
      box(ctx, 4, 34, 4, 12, '#6b4a2b'); box(ctx, 24, 34, 4, 12, '#6b4a2b'); box(ctx, 3, 0, 4, 6, '#e3b93a'); box(ctx, 25, 0, 4, 6, '#e3b93a');
      return c;
    },
  },
  palm: {
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(64, 84);
      for (let i = 0; i < 7; i++) box(ctx, 29 + (i % 2), 34 + i * 7, 6, 8, i % 2 ? '#8f6a3a' : '#7a5a34');
      for (const [x, y, rx, ry] of [[18, 22, 16, 6], [46, 22, 16, 6], [32, 12, 8, 12], [14, 34, 12, 5], [50, 34, 12, 5], [32, 26, 12, 8]]) disc(ctx, x, y, rx, ry, '#5f8a3a');
      disc(ctx, 32, 24, 7, 6, '#4f7a31');
      return c;
    },
  },
  banner: {
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(32, 78);
      box(ctx, 14, 2, 3, 76, '#6b4a2b'); poly(ctx, [[17, 4], [31, 8], [31, 30], [17, 34]], '#3d6fb5'); box(ctx, 17, 16, 14, 4, '#e3b93a');
      return c;
    },
  },
  tambourine: {
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(32, 26);
      box(ctx, 5, 20, 22, 3, '#7a5a34'); box(ctx, 8, 23, 3, 3, '#6b4a2b'); box(ctx, 21, 23, 3, 3, '#6b4a2b');
      disc(ctx, 16, 12, 10, 9, '#8f6a2a'); disc(ctx, 16, 12, 7, 6, '#efe6cf');
      for (const [x, y] of [[6, 12], [26, 12], [16, 3], [16, 21]]) disc(ctx, x, y, 2, 2, '#e3b93a');
      return c;
    },
  },
  arrow: {
    foot: 1, solid: false, flat: true,
    draw() {
      const [c, ctx] = canvas(26, 10);
      box(ctx, 3, 4, 18, 2, '#7a5a34'); poly(ctx, [[20, 1], [26, 5], [20, 9]], '#9aa0a8'); poly(ctx, [[0, 1], [5, 4], [5, 6], [0, 9]], '#efe6cf');
      return c;
    },
  },

  // ---- The Promise: Abraham, Isaac and Jacob
  oak: {   // a great spreading tree, like the Oak of Moreh and the oaks of Mamre
    foot: 2, solid: true,
    draw() {
      const [c, ctx] = canvas(96, 112);
      box(ctx, 42, 62, 13, 48, '#5d4026'); box(ctx, 36, 100, 25, 10, '#5d4026');
      disc(ctx, 48, 40, 40, 30, '#4f7a31'); disc(ctx, 24, 54, 22, 17, '#466f2b');
      disc(ctx, 72, 52, 23, 18, '#5f8a3a'); disc(ctx, 48, 22, 28, 18, '#6f9a45');
      for (const [x, y] of [[30, 34], [60, 30], [44, 50], [70, 44], [22, 50]]) disc(ctx, x, y, 5, 4, '#7faa52');
      return c;
    },
  },
  sacks: {
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(32, 30);
      for (const [x, y] of [[9, 20], [23, 20], [16, 11]]) {
        disc(ctx, x, y, 8, 9, '#cdb98a'); disc(ctx, x - 2, y - 3, 3, 3, '#ddcca0');
        box(ctx, x - 3, y - 10, 6, 3, '#8f7550');
      }
      return c;
    },
  },
  peg: {   // a tent peg waiting to be driven in, with its rope
    foot: 1, solid: false, flat: true,
    draw() {
      const [c, ctx] = canvas(30, 22);
      box(ctx, 13, 4, 4, 14, '#7a5a34'); box(ctx, 11, 3, 8, 3, '#6b4a2b');
      ctx.strokeStyle = '#d8c7a0'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(15, 7); ctx.lineTo(2, 1); ctx.stroke();
      return c;
    },
  },
  trough: {   // a stone watering trough beside a well
    foot: 2, solid: true,
    draw() {
      const [c, ctx] = canvas(64, 26);
      box(ctx, 2, 6, 60, 18, '#8d8778'); box(ctx, 2, 20, 60, 4, '#7a7466');
      box(ctx, 6, 9, 52, 8, '#4f7f9a'); box(ctx, 6, 9, 52, 2, '#7fb0c8');
      return c;
    },
  },
  thicket: {   // a tangle of thorny brush
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(40, 34);
      disc(ctx, 12, 22, 11, 9, '#6a6a3a'); disc(ctx, 27, 21, 11, 10, '#5d5d32'); disc(ctx, 20, 13, 10, 8, '#77773f');
      ctx.strokeStyle = '#4a3a24'; ctx.lineWidth = 1.5;
      for (const [x1, y1, x2, y2] of [[4, 12, 18, 28], [34, 10, 20, 30], [10, 6, 30, 26], [2, 24, 38, 18]]) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
      return c;
    },
  },
  pillar: {   // a standing stone set up as a marker
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(32, 52);
      disc(ctx, 16, 48, 13, 4, 'rgba(0,0,0,0.2)');
      poly(ctx, [[8, 48], [6, 14], [11, 4], [21, 3], [26, 12], [25, 48]], '#9a9384');
      poly(ctx, [[21, 3], [26, 12], [25, 48], [19, 48], [19, 6]], '#857e70');
      return c;
    },
  },
  pillarOil: {   // the same stone, with oil poured on top
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(32, 52);
      disc(ctx, 16, 48, 13, 4, 'rgba(0,0,0,0.2)');
      poly(ctx, [[8, 48], [6, 14], [11, 4], [21, 3], [26, 12], [25, 48]], '#9a9384');
      poly(ctx, [[21, 3], [26, 12], [25, 48], [19, 48], [19, 6]], '#857e70');
      poly(ctx, [[9, 6], [22, 4], [24, 10], [20, 22], [17, 12], [13, 18], [10, 10]], '#d9b84a');
      return c;
    },
  },
  stew: {   // a pot of red lentil stew over the fire
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(32, 36);
      box(ctx, 4, 30, 24, 4, '#5d4526');
      poly(ctx, [[9, 30], [16, 22], [23, 30]], '#e8742c');
      disc(ctx, 16, 20, 11, 9, '#3a3430'); box(ctx, 5, 11, 22, 3, '#55504a'); box(ctx, 7, 12, 18, 2, '#a8402c');
      disc(ctx, 12, 6, 3, 2, 'rgba(255,255,255,0.5)'); disc(ctx, 19, 3, 4, 2, 'rgba(255,255,255,0.4)');
      return c;
    },
  },

  // The way back to the time device: a glowing doorway where the player arrived.
  portal: {
    foot: 1, solid: true, glow: true,
    draw() {
      const [c, ctx] = canvas(48, 68);
      disc(ctx, 24, 63, 19, 4, 'rgba(0,0,0,0.22)');
      const light = ctx.createRadialGradient(24, 34, 2, 24, 34, 27);
      light.addColorStop(0, 'rgba(235,253,255,0.95)');
      light.addColorStop(1, 'rgba(77,227,255,0.3)');
      ctx.fillStyle = light;
      ctx.beginPath(); ctx.ellipse(24, 34, 15, 26, 0, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 5; ctx.strokeStyle = '#4de3ff';
      ctx.beginPath(); ctx.ellipse(24, 34, 17, 28, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 1.5; ctx.strokeStyle = '#d9fbff';
      ctx.beginPath(); ctx.ellipse(24, 34, 17, 28, 0, 0, Math.PI * 2); ctx.stroke();
      return c;
    },
  },

  // ---- Bethlehem
  house: {
    foot: 3, solid: true,
    draw() {
      const [c, ctx] = canvas(104, 84);
      box(ctx, 4, 22, 96, 60, '#d2b48c'); box(ctx, 76, 22, 24, 60, '#c0a27a');
      box(ctx, 0, 14, 104, 9, '#b89b72'); box(ctx, 0, 12, 104, 3, '#a58a63');
      for (let x = 8; x < 100; x += 14) box(ctx, x, 24, 4, 3, '#8f7550');
      box(ctx, 43, 46, 18, 36, '#4b3a2a'); box(ctx, 16, 38, 10, 10, '#4b3a2a'); box(ctx, 80, 38, 10, 10, '#4b3a2a');
      return c;
    },
  },
  well: {
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(32, 42);
      box(ctx, 4, 6, 3, 28, '#6b4a2b'); box(ctx, 25, 6, 3, 28, '#6b4a2b'); box(ctx, 4, 6, 24, 3, '#6b4a2b');
      box(ctx, 15, 9, 1, 12, '#d8c7a0'); box(ctx, 12, 20, 7, 6, '#7a5a34');
      disc(ctx, 16, 33, 14, 8, '#8d8778'); disc(ctx, 16, 31, 10, 5, '#2f4f63');
      return c;
    },
  },
  altar: {
    foot: 2, solid: true,
    draw() {
      const [c, ctx] = canvas(64, 44);
      const stones = ['#8d8778', '#a39d8d', '#7a7466'];
      let n = 0;
      for (let y = 34; y >= 10; y -= 12) for (let x = 2 + (y % 24 ? 0 : 8); x < 54; x += 16) disc(ctx, x + 8, y + 5, 9, 6, stones[n++ % 3]);
      box(ctx, 6, 6, 52, 5, '#6b6558');
      return c;
    },
  },
  foldwall: {
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(32, 22);
      disc(ctx, 8, 15, 8, 6, '#8d8778'); disc(ctx, 23, 15, 9, 6, '#7a7466'); disc(ctx, 15, 8, 9, 6, '#a39d8d');
      return c;
    },
  },
  foldgate: {
    foot: 1, solid: false,
    draw() {
      const [c, ctx] = canvas(32, 24);
      box(ctx, 1, 2, 3, 22, '#6b4a2b'); box(ctx, 28, 2, 3, 22, '#6b4a2b');
      box(ctx, 1, 7, 12, 2, '#8f7550'); box(ctx, 1, 15, 12, 2, '#8f7550');
      return c;
    },
  },
  bush: {
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(32, 26);
      disc(ctx, 11, 16, 10, 8, '#5d7f3a'); disc(ctx, 22, 15, 9, 9, '#6c8f45'); disc(ctx, 16, 9, 8, 6, '#7a9c50');
      return c;
    },
  },
  harp: {
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(32, 38);
      poly(ctx, [[2, 36], [5, 24], [14, 19], [26, 22], [30, 36]], '#8d8778');
      box(ctx, 10, 4, 2, 18, '#7a5a34'); box(ctx, 20, 2, 2, 20, '#7a5a34'); box(ctx, 9, 4, 14, 2, '#7a5a34'); box(ctx, 9, 18, 14, 3, '#6b4a2b');
      for (let x = 13; x < 20; x += 2) box(ctx, x, 6, 1, 12, '#efe6cf');
      return c;
    },
  },
  oven: {
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(32, 30);
      disc(ctx, 16, 20, 14, 12, '#b5764a'); box(ctx, 2, 20, 28, 10, '#b5764a');
      disc(ctx, 16, 22, 6, 6, '#3a2418'); disc(ctx, 16, 24, 4, 3, '#e8742c');
      return c;
    },
  },
  sheaves: {
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(32, 32);
      for (const x of [9, 16, 23]) { poly(ctx, [[x - 6, 30], [x, 4], [x + 6, 30]], '#d9b84a'); box(ctx, x - 5, 18, 10, 2, '#8f6a2a'); }
      return c;
    },
  },
  table: {
    foot: 2, solid: true,
    draw() {
      const [c, ctx] = canvas(64, 28);
      box(ctx, 2, 10, 60, 8, '#8f7550'); box(ctx, 5, 18, 4, 10, '#6b4a2b'); box(ctx, 55, 18, 4, 10, '#6b4a2b');
      disc(ctx, 14, 9, 6, 3, '#d9b98a'); disc(ctx, 30, 8, 7, 4, '#c58a5c'); disc(ctx, 48, 9, 6, 3, '#d9b98a');
      return c;
    },
  },
  gatepost: {
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(32, 62);
      box(ctx, 5, 8, 22, 54, '#b89b72'); box(ctx, 21, 8, 6, 54, '#a58a63'); box(ctx, 2, 2, 28, 8, '#a58a63');
      for (let y = 18; y < 60; y += 12) box(ctx, 5, y, 22, 1, '#8f7550');
      return c;
    },
  },
  woodpile: {
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(32, 24);
      for (const [x, y] of [[4, 16], [14, 16], [24, 16], [9, 9], [19, 9]]) { disc(ctx, x + 2, y + 2, 5, 4, '#7a5a34'); disc(ctx, x + 2, y + 2, 2.5, 2, '#b5946a'); }
      return c;
    },
  },
  // Samuel's things: a bag, and the horn he filled with oil.
  hornbag: {
    foot: 1, solid: true,
    draw() {
      const [c, ctx] = canvas(32, 28);
      box(ctx, 4, 18, 24, 3, '#7a5a34'); box(ctx, 6, 21, 3, 7, '#6b4a2b'); box(ctx, 23, 21, 3, 7, '#6b4a2b');
      disc(ctx, 11, 13, 7, 6, '#9a8a6a'); poly(ctx, [[17, 16], [27, 12], [29, 5], [25, 6], [23, 11], [16, 13]], '#efe6cf');
      box(ctx, 16, 13, 2, 4, '#8f6a2a');
      return c;
    },
  },
  stoneSmooth: {
    foot: 1, solid: false, flat: true,
    draw() {
      const [c, ctx] = canvas(18, 12);
      disc(ctx, 9, 6, 8, 5, '#3f5f73'); disc(ctx, 8, 5, 5, 2.5, '#7393a6');
      return c;
    },
  },
  stoneRough: {
    foot: 1, solid: false, flat: true,
    draw() {
      const [c, ctx] = canvas(18, 12);
      poly(ctx, [[1, 9], [3, 3], [7, 5], [9, 1], [13, 4], [17, 3], [16, 10], [9, 11]], '#3f5f73');
      poly(ctx, [[7, 5], [9, 1], [13, 4], [11, 7]], '#7393a6');
      return c;
    },
  },
};

// Small pictures used for effects and pointers.
export const ICONS = {
  rainbow() {
    const [c, ctx] = canvas(640, 330);
    ['#e84a4a', '#f08a3a', '#f2d24a', '#5ab05a', '#4a8ad8', '#5a4ab0', '#8a4ab0'].forEach((color, i) => {
      ctx.strokeStyle = color; ctx.globalAlpha = 0.55; ctx.lineWidth = 16;
      ctx.beginPath(); ctx.arc(320, 330, 300 - i * 15, Math.PI, 0); ctx.stroke();
    });
    return c;
  },
  sun() {
    const [c, ctx] = canvas(120, 120);
    const g = ctx.createRadialGradient(60, 60, 10, 60, 60, 58);
    g.addColorStop(0, '#fff6c0'); g.addColorStop(0.45, '#ffd23f'); g.addColorStop(1, 'rgba(255,210,63,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 120, 120);
    return c;
  },
  moon() {
    const [c, ctx] = canvas(60, 60);
    disc(ctx, 30, 30, 24, 24, '#f2efe0'); disc(ctx, 40, 24, 22, 22, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'destination-out'; disc(ctx, 42, 24, 20, 20, '#000');
    return c;
  },
  flame() {
    const [c, ctx] = canvas(96, 120);
    const g = ctx.createRadialGradient(48, 64, 6, 48, 64, 54);
    g.addColorStop(0, '#fff2b0'); g.addColorStop(0.4, '#ff9a2a'); g.addColorStop(1, 'rgba(255,90,20,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 96, 120);
    return c;
  },
  cloud() {
    const [c, ctx] = canvas(160, 70);
    for (const [x, y, r] of [[40, 42, 26], [72, 32, 32], [108, 40, 28], [130, 48, 20], [24, 50, 18]]) disc(ctx, x, y, r, r * 0.8, 'rgba(255,255,255,0.85)');
    return c;
  },
  marker() {
    const [c, ctx] = canvas(18, 16);
    poly(ctx, [[1, 1], [17, 1], [9, 15]], '#3a2a10');
    poly(ctx, [[4, 3], [14, 3], [9, 12]], '#ffd23f');
    return c;
  },
  bubble() {
    const [c, ctx] = canvas(24, 22);
    box(ctx, 1, 1, 22, 14, '#2b2118'); box(ctx, 2, 2, 20, 12, '#fffaf0');
    poly(ctx, [[8, 14], [14, 14], [10, 21]], '#2b2118'); poly(ctx, [[9, 13], [13, 13], [10, 18]], '#fffaf0');
    box(ctx, 6, 7, 2, 2, '#2b2118'); box(ctx, 11, 7, 2, 2, '#2b2118'); box(ctx, 16, 7, 2, 2, '#2b2118');
    return c;
  },
  pebble() {
    const [c, ctx] = canvas(6, 6);
    disc(ctx, 3, 3, 3, 3, '#e8e4da');
    return c;
  },
  // What a watchful soldier can see: a wedge pointing right, turned to face the way he looks.
  cone() {
    const [c, ctx] = canvas(170, 200);
    ctx.fillStyle = 'rgba(255,236,150,0.9)';
    ctx.beginPath(); ctx.moveTo(0, 100); ctx.arc(0, 100, 170, -0.61, 0.61); ctx.closePath(); ctx.fill();
    return c;
  },
  note() {
    const [c, ctx] = canvas(14, 18);
    box(ctx, 9, 1, 2, 12, '#2b2118'); disc(ctx, 6, 13, 5, 4, '#2b2118'); box(ctx, 9, 1, 5, 3, '#2b2118');
    return c;
  },
  // Jacob's dream: a stairway of light reaching up into the sky.
  stairway() {
    const [c, ctx] = canvas(120, 420);
    const g = ctx.createLinearGradient(0, 0, 0, 420);
    g.addColorStop(0, 'rgba(255,248,210,0)'); g.addColorStop(0.25, 'rgba(255,244,200,0.75)'); g.addColorStop(1, 'rgba(255,240,190,0.9)');
    ctx.fillStyle = g;
    poly(ctx, [[40, 0], [80, 0], [110, 420], [10, 420]], 'rgba(255,244,200,0.25)');
    ctx.fillStyle = g;
    for (let y = 20; y < 420; y += 26) { const k = y / 420; ctx.fillRect(40 - 30 * k, y, 40 + 60 * k, 4); }
    return c;
  },
  // A soft light.
  glow() {
    const [c, ctx] = canvas(96, 96);
    const light = ctx.createRadialGradient(48, 48, 4, 48, 48, 46);
    light.addColorStop(0, 'rgba(255,244,200,0.85)');
    light.addColorStop(1, 'rgba(255,244,200,0)');
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, 96, 96);
    return c;
  },
  dust() {
    const [c, ctx] = canvas(48, 20);
    disc(ctx, 12, 12, 10, 7, '#d9cba0'); disc(ctx, 26, 9, 12, 8, '#e3d7b0'); disc(ctx, 38, 13, 9, 6, '#d9cba0');
    return c;
  },
};

export function addPropTextures(scene) {
  for (const [key, def] of Object.entries(PROPS)) {
    if (!scene.textures.exists(key)) scene.textures.addCanvas(key, def.draw());
  }
  for (const [key, draw] of Object.entries(ICONS)) {
    if (!scene.textures.exists(key)) scene.textures.addCanvas(key, draw());
  }
}
