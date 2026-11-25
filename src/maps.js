// The maps on the time device: a map of the Bible world, where each arc of
// stories is a place to visit, and a closer map for each arc, where each story
// is a pin. Drawn in code, like the rest of the placeholder art.
//
// Places are given as [longitude, latitude], so they can be checked against
// any atlas. Shapes are simplified on purpose.

const INK = '#5a4630', SEA = '#a9cbd8', SEA_INK = '#6f97aa', LAND = '#eadcb4';

// ------------------------------------------------------------- the world

export const WORLD = {
  bounds: { west: 24, east: 50, south: 21, north: 38.5 }, ppd: 90,
  seas: [
    // The Great Sea (the Mediterranean)
    [[24, 31.0], [29, 30.95], [30.5, 31.4], [31.5, 31.5], [32.3, 31.2], [33.5, 31.1], [34.2, 31.3], [34.5, 31.6], [34.9, 32.5], [35.1, 33.1],
      [35.5, 33.9], [35.8, 34.7], [35.9, 35.5], [36.0, 36.0], [36.15, 36.6], [35.5, 36.6], [34.6, 36.8], [33.5, 36.15], [32.5, 36.1],
      [31.0, 36.8], [29.5, 36.3], [28.2, 36.8], [27.3, 37.0], [26.5, 38.5], [24, 38.5]],
    // The Red Sea, with its two gulfs on either side of Sinai
    [[32.55, 29.95], [33.2, 28.5], [33.9, 27.2], [35.0, 25.0], [35.6, 23.8], [36.5, 21], [39.2, 21], [38.3, 24.0], [37.2, 25.8], [36.2, 27.0],
      [35.2, 28.0], [34.95, 29.5], [34.6, 28.5], [34.3, 27.8], [33.6, 28.4], [32.7, 29.6]],
    // The Persian Gulf
    [[47.9, 30.0], [48.6, 30.0], [50, 29.8], [50, 26], [49.5, 26.5], [48.8, 27.5], [48.3, 28.5], [47.7, 29.4]],
    // Cyprus is land in the sea, drawn below.
  ],
  islands: [[[32.3, 35.1], [33.0, 35.4], [34.6, 35.7], [33.9, 35.0], [33.0, 34.6], [32.4, 34.8]]],
  lakes: [[[35.5, 31.75], [35.58, 31.75], [35.55, 31.1], [35.4, 31.1], [35.42, 31.5]]],
  rivers: [
    [[31.0, 31.4], [31.3, 30.0], [31.0, 29.0], [30.8, 28.0], [31.2, 27.0], [32.5, 26.0], [32.8, 25.0], [32.9, 24.0], [33.0, 21]],
    [[47.4, 31.0], [46.0, 31.3], [45.3, 32.0], [44.3, 32.6], [43.6, 33.4], [42.0, 34.4], [40.9, 34.6], [40.0, 35.3], [39.0, 35.9], [38.2, 36.6], [38.5, 37.5], [39.5, 38.5]],
    [[47.4, 31.0], [46.5, 32.0], [45.8, 32.7], [44.4, 33.3], [43.8, 34.4], [43.2, 35.5], [43.1, 36.3], [42.4, 37.1], [41.5, 38.5]],
    [[47.4, 31.0], [48.0, 30.4]],
    [[35.6, 32.8], [35.55, 31.75]],
  ],
  green: [   // the well-watered land: the Nile valley and the land between the rivers
    { width: 34, line: [[31.0, 31.4], [31.3, 30.0], [31.0, 29.0], [30.8, 28.0], [31.2, 27.0], [32.5, 26.0], [32.8, 25.0], [33.0, 21]] },
    { width: 70, line: [[47.4, 31.0], [45.3, 32.0], [44.0, 33.0], [42.0, 34.4], [40.0, 35.3], [38.2, 36.6]] },
    { width: 46, line: [[34.6, 31.4], [35.2, 32.6], [35.8, 34.0], [36.4, 35.5]] },
  ],
  mountains: [[36.5, 37.6], [34, 37.3], [32, 37.2], [38.6, 37.8], [44.5, 36.5], [45.8, 35.2], [46.8, 34.0], [47.8, 32.8], [33.9, 28.6], [34.3, 28.9], [36.6, 34.0], [35.9, 33.4]],
  labels: [
    { text: 'The Great Sea', at: [29.5, 33.6], size: 26, sea: true },
    { text: 'Red Sea', at: [37.1, 23.6], size: 20, sea: true, angle: -55 },
    { text: 'Persian Gulf', at: [49.3, 28.2], size: 15, sea: true, angle: -50 },
    { text: 'EGYPT', at: [28.5, 27.5], size: 26 },
    { text: 'Nile River', at: [32.3, 27.3], size: 14, river: true, angle: -65 },
    { text: 'SINAI', at: [33.6, 29.9], size: 15 },
    { text: 'CANAAN', at: [36.9, 32.4], size: 17 },
    { text: 'ARABIAN DESERT', at: [41.5, 28.5], size: 24 },
    { text: 'MESOPOTAMIA', at: [43.6, 32.2], size: 22, angle: -30 },
    { text: 'Euphrates', at: [40.6, 34.2], size: 14, river: true, angle: -25 },
    { text: 'Tigris', at: [44.1, 35.0], size: 14, river: true, angle: -60 },
    { text: 'ASIA MINOR', at: [31.5, 38.0], size: 18 },
  ],
};

// ------------------------------ the land between the rivers, for In the Beginning

export const CRESCENT = {
  bounds: { west: 36.0, east: 51.0, south: 29.2, north: 40.4 }, ppd: 120,
  seas: [[[47.9, 30.0], [48.6, 30.0], [49.5, 29.6], [49.5, 29.2], [47.5, 29.2], [47.7, 29.4]]],
  lakes: [
    [[42.3, 38.9], [43.0, 39.0], [43.5, 38.7], [43.2, 38.4], [42.6, 38.4], [42.2, 38.6]],   // Lake Van
    [[45.2, 38.2], [45.7, 38.0], [45.9, 37.4], [45.6, 37.1], [45.3, 37.6]],                 // Lake Urmia
  ],
  rivers: WORLD.rivers,
  green: [
    { width: 110, line: [[47.4, 31.0], [45.3, 32.0], [44.0, 33.0], [42.0, 34.4], [40.0, 35.3], [38.6, 36.4]] },
  ],
  mountains: [[44.3, 39.7], [43.6, 39.9], [41.2, 38.2], [42.4, 37.6], [44.6, 36.7], [45.8, 35.4], [46.8, 34.2], [47.8, 33.0], [40.0, 38.6]],
  towns: [{ text: 'Ur', at: [46.1, 30.96] }, { text: 'Haran', at: [39.03, 36.87] }],
  labels: [
    { text: 'MOUNTAINS OF ARARAT', at: [44.6, 40.15], size: 20 },
    { text: 'Tigris', at: [44.0, 34.6], size: 18, river: true, angle: -60 },
    { text: 'Euphrates', at: [41.6, 34.2], size: 18, river: true, angle: -25 },
    { text: 'SHINAR', at: [45.0, 32.0], size: 22 },
    { text: 'Persian Gulf', at: [48.8, 29.5], size: 16, sea: true },
    { text: 'ARABIAN DESERT', at: [41.5, 31.0], size: 24 },
  ],
};

// ------------------------ from Haran to Canaan, for The Promise (Abraham to Jacob)

export const PROMISE = {
  bounds: { west: 34.0, east: 40.2, south: 30.9, north: 37.3 }, ppd: 360,
  seas: [[[34.0, 31.2], [34.2, 31.3], [34.5, 31.6], [34.9, 32.5], [35.1, 33.1], [35.5, 33.9], [35.8, 34.7], [35.9, 35.5], [36.0, 36.0],
    [36.15, 36.6], [35.5, 36.6], [34.6, 36.8], [34.0, 36.6]]],
  islands: [[[34.0, 35.45], [34.6, 35.7], [33.9, 35.0]]],
  lakes: [
    WORLD.lakes[0],                                                                              // the Salt Sea
    [[35.52, 32.88], [35.6, 32.9], [35.65, 32.8], [35.6, 32.7], [35.54, 32.75]],                  // the Sea of Galilee
  ],
  rivers: [
    WORLD.rivers[1],                                                                             // the Euphrates
    [[35.62, 33.25], [35.6, 32.9]], [[35.6, 32.7], [35.57, 32.3], [35.55, 31.75]],                // the Jordan
    [[35.57, 32.1], [35.75, 32.2], [35.95, 32.12], [36.08, 32.0]],                                // the Jabbok
    [[39.1, 36.7], [39.25, 36.4], [39.15, 35.9], [39.0, 35.6]],                                   // the Balikh, past Haran
  ],
  green: [
    { width: 60, line: [[34.8, 31.3], [35.2, 32.2], [35.6, 33.0], [36.0, 34.0], [36.4, 35.2]] },
    { width: 70, line: [[38.2, 36.6], [39.0, 35.9], [40.0, 35.3]] },
  ],
  mountains: [[35.15, 31.6], [35.25, 32.25], [35.85, 33.4], [36.1, 34.0], [36.4, 34.5], [37.2, 37.1], [38.3, 37.2], [36.0, 31.6]],
  towns: [{ text: 'Damascus', at: [36.3, 33.51] }, { text: 'Shechem', at: [35.28, 32.21] }],
  labels: [
    { text: 'The Great Sea', at: [34.75, 34.2], size: 26, sea: true, angle: -70 },
    { text: 'Euphrates', at: [38.25, 36.05], size: 20, river: true, angle: -50 },
    { text: 'CANAAN', at: [34.95, 32.95], size: 24 },
    { text: 'PADDAN-ARAM', at: [39.4, 37.15], size: 20 },
    { text: 'NEGEV', at: [34.75, 31.0], size: 18 },
    { text: 'SYRIAN DESERT', at: [38.2, 33.8], size: 26 },
    { text: 'Salt Sea', at: [35.75, 31.35], size: 16, sea: true, angle: -80 },
  ],
};

// ------------------- Egypt, Sinai and Midian, for Joseph, Out of Egypt and The Wilderness

export const EGYPT = {
  bounds: { west: 30.2, east: 36.4, south: 27.0, north: 32.8 }, ppd: 330,
  seas: [
    // The Great Sea
    [[30.2, 31.15], [31.0, 31.5], [31.8, 31.5], [32.3, 31.25], [33.0, 31.1], [33.6, 31.2], [34.2, 31.3], [34.5, 31.6], [34.9, 32.5], [35.05, 32.8], [30.2, 32.8]],
    // The Gulf of Suez
    [[32.5, 30.0], [32.62, 29.9], [33.0, 29.2], [33.45, 28.4], [33.75, 27.8], [34.3, 27.3], [34.35, 27.0], [33.9, 27.0], [33.6, 27.55], [33.1, 28.25], [32.7, 28.95], [32.45, 29.6]],
    // The Gulf of Aqaba
    [[34.92, 29.55], [35.0, 29.52], [34.78, 28.7], [34.55, 28.0], [34.45, 27.7], [34.3, 27.7], [34.45, 28.2], [34.7, 29.0]],
  ],
  lakes: [WORLD.lakes[0]],
  rivers: [
    [[31.2, 27.0], [31.3, 28.0], [31.2, 29.0], [31.2, 30.0], [31.25, 30.2]],
    [[31.25, 30.2], [30.95, 30.9], [30.8, 31.4]],
    [[31.25, 30.2], [31.6, 30.9], [31.8, 31.5]],
    [[35.6, 32.7], [35.57, 32.3], [35.55, 31.75]],
  ],
  green: [
    { width: 26, line: [[31.2, 27.0], [31.3, 28.0], [31.2, 29.0], [31.2, 30.0]] },
    { width: 60, line: [[30.8, 31.4], [31.0, 30.7], [31.25, 30.2], [31.6, 30.9], [31.8, 31.4]] },
    { width: 44, line: [[31.8, 30.6], [32.2, 30.5]] },
    { width: 40, line: [[34.8, 31.3], [35.2, 32.2], [35.5, 32.8]] },
  ],
  mountains: [[33.9, 28.6], [34.1, 28.45], [34.2, 28.1], [33.7, 28.9], [35.15, 31.6], [35.25, 32.2], [35.7, 28.4], [35.9, 28.0]],
  towns: [
    { text: 'Memphis', at: [31.25, 29.85] }, { text: 'On', at: [31.3, 30.13] }, { text: 'Rameses', at: [31.85, 30.8] },
    { text: 'Dothan', at: [35.23, 32.42] }, { text: 'Hebron', at: [35.1, 31.53] }, { text: 'Kadesh', at: [34.42, 30.67] },
    { text: 'Beersheba', at: [34.79, 31.25] },
  ],
  labels: [
    { text: 'The Great Sea', at: [32.6, 32.15], size: 24, sea: true },
    { text: 'EGYPT', at: [30.5, 29.0], size: 26 },
    { text: 'Nile River', at: [31.5, 27.6], size: 15, river: true, angle: -85 },
    { text: 'GOSHEN', at: [32.0, 30.35], size: 15 },
    { text: 'SINAI', at: [33.6, 29.4], size: 20 },
    { text: 'Gulf of Suez', at: [33.35, 28.3], size: 13, sea: true, angle: -55 },
    { text: 'Gulf of Aqaba', at: [35.15, 28.3], size: 13, sea: true, angle: -70 },
    { text: 'MIDIAN', at: [35.7, 28.9], size: 20 },
    { text: 'NEGEV', at: [34.7, 30.95], size: 15 },
    { text: 'WILDERNESS OF PARAN', at: [34.2, 30.0], size: 16 },
    { text: 'CANAAN', at: [35.6, 32.0], size: 18 },
    { text: 'Salt Sea', at: [35.75, 31.35], size: 13, sea: true, angle: -80 },
  ],
};

// ---------------- the land of Canaan, Dan to Beersheba, for the arcs from Joshua to Samuel

export const CANAAN = {
  bounds: { west: 34.3, east: 36.3, south: 31.0, north: 33.4 }, ppd: 700,
  seas: [[[34.3, 31.2], [34.4, 31.4], [34.47, 31.52], [34.57, 31.67], [34.65, 31.8], [34.71, 31.9], [34.745, 32.0], [34.78, 32.1], [34.85, 32.4],
    [34.95, 32.8], [35.05, 33.05], [35.1, 33.4], [34.3, 33.4]]],
  lakes: [
    [[35.53, 31.77], [35.47, 31.7], [35.43, 31.6], [35.4, 31.5], [35.38, 31.4], [35.39, 31.3], [35.4, 31.15], [35.5, 31.15], [35.51, 31.2], [35.54, 31.3], [35.56, 31.45], [35.58, 31.6], [35.56, 31.72]],   // the Salt Sea
    [[35.53, 32.88], [35.6, 32.9], [35.65, 32.8], [35.6, 32.7], [35.54, 32.75]],                  // the Sea of Galilee
  ],
  rivers: [
    [[35.62, 33.25], [35.6, 32.9]], [[35.6, 32.7], [35.57, 32.3], [35.555, 31.77]],               // the Jordan
    [[35.57, 32.1], [35.75, 32.2], [35.95, 32.12], [36.08, 32.0]],                                // the Jabbok
    [[35.1, 32.55], [35.0, 32.75], [34.95, 32.8]],                                                // the Kishon
  ],
  green: [
    { width: 50, line: [[34.8, 31.4], [34.9, 32.0], [35.0, 32.5]] },
    { width: 60, line: [[35.0, 32.55], [35.3, 32.55], [35.5, 32.6]] },
    { width: 40, line: [[35.5, 32.9], [35.55, 33.3]] },
  ],
  mountains: [[34.98, 32.72], [35.15, 31.62], [35.25, 32.15], [35.4, 32.45], [35.39, 32.66], [35.7, 33.3], [35.6, 31.5]],
  towns: [
    { text: 'Dan', at: [35.65, 33.25] }, { text: 'Hazor', at: [35.57, 33.02] }, { text: 'Shechem', at: [35.28, 32.21] },
    { text: 'Jerusalem', at: [35.22, 31.78] }, { text: 'Hebron', at: [35.1, 31.53] }, { text: 'Beersheba', at: [34.79, 31.25] },
    { text: 'Gaza', at: [34.46, 31.5] },
  ],
  labels: [
    { text: 'The Great Sea', at: [34.45, 32.7], size: 24, sea: true, angle: -70 },
    { text: 'Salt Sea', at: [35.5, 31.4], size: 17, sea: true, angle: -80 },
    { text: 'Sea of Galilee', at: [35.74, 32.82], size: 13, sea: true },
    { text: 'Jordan River', at: [35.66, 32.4], size: 13, river: true, angle: -85 },
    { text: 'GALILEE', at: [35.3, 32.95], size: 20 },
    { text: 'VALLEY OF JEZREEL', at: [35.28, 32.58], size: 13 },
    { text: 'EPHRAIM', at: [35.18, 32.15], size: 18 },
    { text: 'JUDAH', at: [35.0, 31.45], size: 20 },
    { text: 'PHILISTIA', at: [34.52, 31.8], size: 18, angle: -70 },
    { text: 'GILEAD', at: [35.9, 32.35], size: 20 },
    { text: 'MOAB', at: [35.9, 31.25], size: 20 },
    { text: 'NEGEV', at: [34.9, 31.08], size: 15 },
  ],
};

// ----------------------------------------- the land of Israel, for the David arc

export const ISRAEL = {
  bounds: { west: 34.4, east: 35.72, south: 31.15, north: 32.0 }, ppd: 1700,
  seas: [[[34.4, 31.4], [34.47, 31.52], [34.57, 31.67], [34.65, 31.8], [34.71, 31.9], [34.745, 32.0], [34.4, 32.0]]],
  lakes: [[[35.53, 31.77], [35.47, 31.7], [35.43, 31.6], [35.4, 31.5], [35.38, 31.4], [35.39, 31.3], [35.4, 31.15], [35.5, 31.15],
    [35.51, 31.2], [35.54, 31.3], [35.56, 31.45], [35.58, 31.6], [35.56, 31.72]]],
  rivers: [[[35.555, 31.77], [35.55, 31.82], [35.565, 31.87], [35.555, 31.93], [35.57, 32.0]]],
  regions: [
    { color: '#d8dca4', shape: [[34.8, 31.35], [34.98, 31.3], [34.97, 31.5], [35.0, 31.75], [35.05, 32.0], [34.85, 32.0], [34.8, 31.7]] },          // the lowlands
    { color: '#c7cf93', shape: [[34.98, 31.3], [35.1, 31.3], [35.22, 31.4], [35.28, 31.6], [35.28, 31.8], [35.25, 32.0], [35.05, 32.0], [35.0, 31.75], [34.97, 31.5]] },   // the hill country
    { color: '#e2c896', shape: [[35.22, 31.4], [35.38, 31.25], [35.4, 31.5], [35.45, 31.7], [35.52, 31.8], [35.4, 31.95], [35.28, 31.8], [35.28, 31.6]] },   // the wilderness
    { color: '#ddc79c', shape: [[35.6, 31.15], [35.72, 31.15], [35.72, 32.0], [35.6, 32.0], [35.59, 31.75], [35.6, 31.45]] },   // across the Jordan
  ],
  mountains: [[35.05, 31.42], [35.15, 31.62], [35.12, 31.85], [35.2, 31.93], [35.3, 31.42], [35.34, 31.68], [35.66, 31.5], [35.66, 31.8]],
  towns: [
    { text: 'Jebus (later Jerusalem)', at: [35.235, 31.777] },
    { text: 'Gath', at: [34.85, 31.7] },
    { text: 'Ashkelon', at: [34.57, 31.665] },
    { text: 'Jericho', at: [35.444, 31.87] },
  ],
  labels: [
    { text: 'The Great Sea', at: [34.5, 31.86], size: 22, sea: true, angle: -55 },
    { text: 'Salt Sea', at: [35.48, 31.45], size: 22, sea: true, angle: -80 },
    { text: 'Jordan River', at: [35.61, 31.9], size: 15, river: true, angle: -80 },
    { text: 'PHILISTIA', at: [34.66, 31.42], size: 24 },
    { text: 'HILL COUNTRY OF JUDAH', at: [35.1, 31.25], size: 18 },
    { text: 'WILDERNESS OF JUDAH', at: [35.3, 31.3], size: 16, angle: -60 },
    { text: 'MOAB', at: [35.66, 31.25], size: 20 },
  ],
};

// ----------------------------------------------------------------- drawing

export function project(map, [lon, lat]) {
  const { west, north, south } = map.bounds;
  const squash = Math.cos(((north + south) / 2) * Math.PI / 180);
  return [(lon - west) * map.ppd * squash, (north - lat) * map.ppd];
}

export function mapSize(map) {
  const [w, h] = project(map, [map.bounds.east, map.bounds.south]);
  return { w: Math.round(w), h: Math.round(h) };
}

// A repeatable "random" number, so the paper texture is the same every time.
const rnd = i => { const n = Math.sin(i * 91.7) * 43758.5453; return n - Math.floor(n); };

export function drawMap(map) {
  const { w, h } = mapSize(map);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  const at = p => project(map, p);
  const path = (pts, close = true) => {
    ctx.beginPath();
    pts.forEach((p, i) => { const [x, y] = at(p); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
    if (close) ctx.closePath();
  };

  // Land and paper.
  ctx.fillStyle = LAND;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 1600; i++) {
    ctx.fillStyle = i % 2 ? 'rgba(120,90,40,0.06)' : 'rgba(255,255,255,0.12)';
    ctx.fillRect(rnd(i) * w, rnd(i + 5000) * h, 2 + rnd(i + 9000) * 5, 2 + rnd(i + 7000) * 4);
  }
  // Regions fade into each other, the way hills and desert do.
  ctx.filter = 'blur(14px)';
  for (const r of map.regions || []) { ctx.fillStyle = r.color; path(r.shape); ctx.fill(); }
  ctx.filter = 'none';
  for (const g of map.green || []) {
    ctx.strokeStyle = 'rgba(140,170,90,0.45)'; ctx.lineWidth = g.width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    path(g.line, false); ctx.stroke();
  }

  // Water, with a darker coastline and a few wave marks.
  for (const sea of [...(map.seas || []), ...(map.lakes || [])]) {
    ctx.fillStyle = SEA; path(sea); ctx.fill();
    ctx.strokeStyle = SEA_INK; ctx.lineWidth = 2.5; path(sea); ctx.stroke();
  }
  for (const island of map.islands || []) {
    ctx.fillStyle = LAND; path(island); ctx.fill();
    ctx.strokeStyle = SEA_INK; ctx.lineWidth = 2; path(island); ctx.stroke();
  }
  for (const river of map.rivers || []) {
    ctx.strokeStyle = SEA_INK; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    path(river, false); ctx.stroke();
  }

  // Mountains: little peaks.
  for (const m of map.mountains || []) {
    const [x, y] = at(m);
    for (const [dx, s] of [[-16, 0.8], [0, 1.15], [16, 0.9]]) {
      ctx.fillStyle = '#b59b6a';
      ctx.beginPath(); ctx.moveTo(x + dx - 13 * s, y + 9); ctx.lineTo(x + dx, y - 14 * s); ctx.lineTo(x + dx + 13 * s, y + 9); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#8e7650';
      ctx.beginPath(); ctx.moveTo(x + dx, y - 14 * s); ctx.lineTo(x + dx + 13 * s, y + 9); ctx.lineTo(x + dx + 3, y + 9); ctx.closePath(); ctx.fill();
    }
  }

  // Towns that are not stories: a dot and a name.
  ctx.textAlign = 'center';
  for (const t of map.towns || []) {
    const [x, y] = at(t.at);
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
    ctx.font = 'italic 17px Georgia, serif';
    ctx.fillText(t.text, x, y + 24);
  }

  // Names of seas, rivers and lands.
  for (const l of map.labels || []) {
    const [x, y] = at(l.at);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(((l.angle || 0) * Math.PI) / 180);
    ctx.font = `${l.sea || l.river ? 'italic ' : ''}${l.size}px Georgia, serif`;
    ctx.fillStyle = l.sea || l.river ? '#3f6e85' : 'rgba(90,70,48,0.75)';
    if (!l.sea && !l.river) ctx.letterSpacing = '4px';
    ctx.fillText(l.text, 0, 0);
    ctx.restore();
  }

  // A compass and a frame.
  const cx = w - 70, cy = h - 80;
  ctx.fillStyle = INK;
  ctx.beginPath(); ctx.moveTo(cx, cy - 34); ctx.lineTo(cx + 9, cy); ctx.lineTo(cx, cy + 34); ctx.lineTo(cx - 9, cy); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx - 34, cy); ctx.lineTo(cx, cy + 7); ctx.lineTo(cx + 34, cy); ctx.lineTo(cx, cy - 7); ctx.closePath(); ctx.fill();
  ctx.font = 'bold 18px Georgia, serif'; ctx.fillText('N', cx, cy - 40);
  ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.strokeRect(4, 4, w - 8, h - 8);
  ctx.lineWidth = 2; ctx.strokeRect(14, 14, w - 28, h - 28);
  return c;
}
