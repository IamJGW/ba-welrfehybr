// The "storybook" art sample: a softer, painted look drawn entirely in code.
// It is off unless turned on (see ART_MUSIC_PLAN.md), and for now it only
// changes one story, The Shepherd of Bethlehem. With it off, nothing here runs.
//
// Turn it on:  http://localhost:8765/?art=storybook   (remembered on this computer)
// Turn it off: http://localhost:8765/?art=plain

import { T } from './art.js';

// The stories the sample restyles. Add ids here to try it on more maps.
export const SAMPLE_STORIES = ['shepherd'];

export function storybookOn(settings, storyId) {
  return settings?.art === 'storybook' && SAMPLE_STORIES.includes(storyId);
}

// Reads ?art=storybook or ?art=plain from the address and remembers the choice.
export function readArtSetting(params, save) {
  const want = params.get('art');
  if (want !== 'storybook' && want !== 'plain') return;
  const settings = { ...save.data.settings };
  if (want === 'storybook') settings.art = 'storybook'; else delete settings.art;
  save.data.settings = settings;
  save.write();
}

// A warm, low-contrast palette: each ground gets a light and a shade so the
// painting can model hills and hollows instead of flat squares.
const PAINT = {
  '.': { mid: '#a7b26a', lite: '#c4c983', dark: '#859250' },   // grass
  ',': { mid: '#d1ad7c', lite: '#e3c697', dark: '#b28e61' },   // road
  ':': { mid: '#d4c08a', lite: '#e6d6a3', dark: '#b8a26f' },   // packed earth in town
  'h': { mid: '#9d9a62', lite: '#b7b379', dark: '#7d7a4b' },   // hillside
  'o': { mid: '#c7bc9d', lite: '#ded5ba', dark: '#a39a80' },   // pebble bank
  '~': { mid: '#6aaec8', lite: '#9fd0e0', dark: '#4b8fb0' },   // stream
  'b': { mid: '#dcc25e', lite: '#efd982', dark: '#bfa344' },   // barley
  '#': { mid: '#8a7c66', lite: '#a8987e', dark: '#665a49' },   // cliff
};
const FALLBACK = PAINT['.'];

// Smooth, repeatable noise, so the same map always paints the same way.
function hash(x, y, s) {
  const n = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
  return n - Math.floor(n);
}
function noise(x, y, s = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

const SOLID = ch => ch === '#';

export function storybookGround(rows) {
  const W = rows[0].length, H = rows.length;
  const c = document.createElement('canvas');
  c.width = W * T; c.height = H * T;
  const ctx = c.getContext('2d');
  const at = (tx, ty) => rows[Math.max(0, Math.min(H - 1, ty))][Math.max(0, Math.min(W - 1, tx))];

  // 1. Paint every pixel from a softly blended mix of the nearby tiles, with
  //    broad light and shade from noise. Hard edges stay hard where they
  //    matter for play: cliffs and the water's edge.
  const img = ctx.createImageData(c.width, c.height);
  const cache = {};
  const pal = ch => cache[ch] || (cache[ch] = Object.fromEntries(Object.entries(PAINT[ch] || FALLBACK).map(([k, v]) => [k, rgb(v)])));
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const fx = x / T, fy = y / T;
      // A little wobble so tile borders do not run in straight lines.
      const wx = fx + (noise(fx * 1.7, fy * 1.7, 3) - 0.5) * 0.55;
      const wy = fy + (noise(fx * 1.7, fy * 1.7, 9) - 0.5) * 0.55;
      let ch = at(Math.floor(wx), Math.floor(wy));
      const true_ = at(Math.floor(fx), Math.floor(fy));
      // Play-critical tiles keep their true outline.
      if (SOLID(true_) || SOLID(ch) || true_ === '~' || ch === '~') ch = true_;
      const p = pal(ch);
      const light = noise(fx * 0.35, fy * 0.35, 1) * 0.7 + noise(fx * 1.3, fy * 1.3, 2) * 0.3;
      let col = light > 0.5 ? mix(p.mid, p.lite, (light - 0.5) * 1.6) : mix(p.dark, p.mid, light * 2);
      // Fine grain like brush texture.
      const grain = (hash(x, y, 5) - 0.5) * 10;
      const i = (y * c.width + x) * 4;
      img.data[i] = col[0] + grain; img.data[i + 1] = col[1] + grain; img.data[i + 2] = col[2] + grain; img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  // 2. Details on top, tile by tile.
  rows.forEach((line, ty) => {
    for (let tx = 0; tx < line.length; tx++) {
      const ch = line[tx], px = tx * T, py = ty * T;
      const r = i => hash(tx, ty, i);
      if (ch === '.' || ch === 'h') {
        // Grass tufts: three short strokes fanned out.
        for (let k = 0; k < 3; k++) {
          if (r(k) < 0.45) continue;
          const gx = px + r(k + 10) * (T - 6) + 3, gy = py + r(k + 20) * (T - 6) + 5;
          ctx.strokeStyle = r(k + 30) < 0.5 ? 'rgba(80,100,45,0.7)' : 'rgba(205,215,140,0.8)';
          ctx.lineWidth = 1.2;
          for (const dx of [-2.5, 0, 2.5]) { ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + dx, gy - 5 + Math.abs(dx) * 0.4); ctx.stroke(); }
        }
        if (ch === '.' && r(40) > 0.93) {   // the odd small flower
          ctx.fillStyle = r(41) < 0.5 ? '#f2ecd6' : '#e8c35a';
          const fx = px + r(42) * (T - 6) + 3, fy = py + r(43) * (T - 6) + 3;
          for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2]]) { ctx.beginPath(); ctx.arc(fx + dx, fy + dy, 1.5, 0, 7); ctx.fill(); }
          ctx.fillStyle = '#b8742e'; ctx.beginPath(); ctx.arc(fx, fy, 1.2, 0, 7); ctx.fill();
        }
      } else if (ch === '~') {
        // Ripples: soft light curves that run with the stream.
        ctx.strokeStyle = 'rgba(235,248,252,0.55)'; ctx.lineWidth = 1.5;
        for (let k = 0; k < 2; k++) {
          const rx = px + 4 + r(k) * (T - 14), ry = py + 4 + r(k + 5) * (T - 8);
          ctx.beginPath(); ctx.moveTo(rx, ry); ctx.quadraticCurveTo(rx + 4, ry + 3, rx + 1, ry + 8); ctx.stroke();
        }
      } else if (ch === 'o') {
        for (let k = 0; k < 4; k++) {
          ctx.fillStyle = ['#a99f86', '#e2dac2', '#8f8670'][k % 3];
          ctx.beginPath(); ctx.ellipse(px + r(k) * T, py + r(k + 9) * T, 2.6, 1.8, 0, 0, 7); ctx.fill();
        }
      } else if (ch === ',') {
        // Cart ruts along the road.
        ctx.fillStyle = 'rgba(140,105,65,0.35)';
        ctx.fillRect(px, py + 9 + Math.round((r(1) - 0.5) * 2), T, 2);
        ctx.fillRect(px, py + 21 + Math.round((r(2) - 0.5) * 2), T, 2);
      } else if (ch === 'b') {
        // Barley: rows of upright strokes with light heads.
        for (let k = 0; k < 7; k++) {
          const bx = px + 2 + k * 4.4 + (r(k) - 0.5) * 2, by = py + 6 + r(k + 7) * (T - 12);
          ctx.strokeStyle = 'rgba(150,120,40,0.7)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(bx, by + 8); ctx.lineTo(bx, by); ctx.stroke();
          ctx.fillStyle = 'rgba(250,232,150,0.9)'; ctx.fillRect(bx - 1, by - 2, 2, 3);
        }
      } else if (ch === '#') {
        // Layered rock with a lit top edge where the cliff meets open ground.
        ctx.fillStyle = 'rgba(60,50,40,0.25)';
        for (let k = 0; k < 3; k++) ctx.fillRect(px + r(k) * 8, py + 7 + k * 9, T - r(k + 3) * 10, 2);
        if (!SOLID(at(tx, ty + 1))) { ctx.fillStyle = 'rgba(45,36,28,0.55)'; ctx.fillRect(px, py + T - 4, T, 4); }
        if (!SOLID(at(tx, ty - 1))) { ctx.fillStyle = 'rgba(240,225,190,0.45)'; ctx.fillRect(px, py, T, 2); }
      }
    }
  });

  // 3. A soft ink line where open ground meets cliff or water, so the edges of
  //    where you can walk still read clearly.
  ctx.strokeStyle = 'rgba(55,45,35,0.45)'; ctx.lineWidth = 1.5;
  rows.forEach((line, ty) => {
    for (let tx = 0; tx < line.length; tx++) {
      const ch = line[tx];
      if (!SOLID(ch) && ch !== '~') continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const n = at(tx + dx, ty + dy);
        if (n === ch || SOLID(n) || (ch === '~' && n === '~')) continue;
        const px = tx * T, py = ty * T;
        ctx.beginPath();
        if (dx === 1) { ctx.moveTo(px + T, py); ctx.lineTo(px + T, py + T); }
        if (dx === -1) { ctx.moveTo(px, py); ctx.lineTo(px, py + T); }
        if (dy === 1) { ctx.moveTo(px, py + T); ctx.lineTo(px + T, py + T); }
        if (dy === -1) { ctx.moveTo(px, py); ctx.lineTo(px + T, py); }
        ctx.stroke();
      }
    }
  });
  return c;
}

// Warm late-afternoon light and a gentle vignette, laid over the whole view.
export function storybookLight(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  const sun = ctx.createLinearGradient(0, 0, w, h);
  sun.addColorStop(0, 'rgba(255,206,120,0.2)');
  sun.addColorStop(0.55, 'rgba(255,214,140,0)');
  sun.addColorStop(1, 'rgba(60,40,80,0.10)');
  ctx.fillStyle = sun; ctx.fillRect(0, 0, w, h);
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(30,20,10,0)');
  vig.addColorStop(1, 'rgba(30,20,10,0.22)');
  ctx.fillStyle = vig; ctx.fillRect(0, 0, w, h);
  return c;
}

// A soft round shadow to sit under people, animals and standing props.
export function storybookShadow() {
  const c = document.createElement('canvas');
  c.width = 36; c.height = 14;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(18, 7, 1, 18, 7, 17);
  g.addColorStop(0, 'rgba(40,30,20,0.38)');
  g.addColorStop(1, 'rgba(40,30,20,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(18, 7, 18, 7, 0, 0, Math.PI * 2); ctx.fill();
  return c;
}
