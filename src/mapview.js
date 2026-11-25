// The map screen on the time device. First a map of the Bible world with a
// pin for each arc of stories; choosing an arc zooms into its own map, with a
// pin for each story. Drag to look around, use the arrow keys to move from
// pin to pin, and Space or Enter to open one. Esc goes back out to the world.

import { WORLD, ISRAEL, CRESCENT, PROMISE, EGYPT, CANAAN, drawMap, mapSize, project } from './maps.js';
import { drawCharacter, CW, CH } from './art.js';

const MAPS = { world: WORLD, israel: ISRAEL, crescent: CRESCENT, promise: PROMISE, egypt: EGYPT, canaan: CANAAN };
const VISIBLE = { world: 820, arc: 600 };   // how many map pixels tall the view shows

function el(tag, props = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k === 'style') e.style.cssText = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) e.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid) e.append(kid);
  return e;
}

const drawn = new Map();   // each map is painted once
const paint = key => { if (!drawn.has(key)) drawn.set(key, drawMap(MAPS[key])); return drawn.get(key); };

// state: { level: 'world' | 'arc', arc, picked: { world, arc } }, kept by the caller between visits.
// arcs: [{ id, title, when, blurb, at, map, later, stories: [...] }]
// Each story: { id, title, where, ref, place, open, done, started, found, total, note }
export function mapView({ state, arcs, look, onPlay, tester = false }) {
  const view = el('div', { class: 'map-view' });
  const layer = el('div', { class: 'map-layer' });
  const info = el('div', { class: 'map-info' });
  const head = el('div', { class: 'map-head' });
  const hint = el('div', { class: 'map-hint', text: 'Drag to look around · ← → to choose · Space to open' });
  view.append(layer, head, info, hint);

  let items = [], cam = { x: 0, y: 0 }, size = { w: 0, h: 0 }, scale = 1, mapKey = 'world';
  const arc = () => arcs.find(a => a.id === state.arc) || arcs[0];

  // ------------------------------------------------------------ camera

  const clamp = () => {
    const vw = view.clientWidth / scale, vh = view.clientHeight / scale;
    cam.x = size.w <= vw ? size.w / 2 : Math.min(Math.max(cam.x, vw / 2), size.w - vw / 2);
    cam.y = size.h <= vh ? size.h / 2 : Math.min(Math.max(cam.y, vh / 2), size.h - vh / 2);
  };
  const place = (smooth = true) => {
    clamp();
    layer.style.transition = smooth ? 'transform 0.45s ease' : 'none';
    layer.style.transform = `translate(${view.clientWidth / 2 - cam.x * scale}px, ${view.clientHeight / 2 - cam.y * scale}px) scale(${scale})`;
  };
  const fit = () => { scale = (view.clientHeight || 1) / VISIBLE[state.level]; place(false); };
  new ResizeObserver(fit).observe(view);

  // Drag the map to look around. A press that hardly moves still counts as a click.
  let drag = null;
  view.addEventListener('pointerdown', e => {
    if (e.target.closest('.map-info, .map-head')) return;
    drag = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y, moved: false };
    view.setPointerCapture?.(e.pointerId);
  });
  view.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.hypot(dx, dy) > 6) drag.moved = true;
    if (!drag.moved) return;
    cam.x = drag.cx - dx / scale; cam.y = drag.cy - dy / scale;
    place(false);
  });
  const release = e => {
    if (!drag) return;
    const moved = drag.moved;
    drag = null;
    if (moved) return;
    // A click: on a pin, choose it (or open it if it was already chosen).
    const pin = document.elementFromPoint(e.clientX, e.clientY)?.closest('.map-pin');
    if (pin) { const i = items.findIndex(it => it.id === pin.dataset.id); if (i === pick()) open(); else select(i); }
  };
  view.addEventListener('pointerup', release);
  view.addEventListener('pointercancel', () => { drag = null; });
  view.addEventListener('wheel', e => { e.preventDefault(); cam.x += e.deltaX / scale; cam.y += e.deltaY / scale; place(false); }, { passive: false });

  // ------------------------------------------------------------ choosing

  const pick = () => Math.max(0, items.findIndex(it => it.id === state.picked[state.level]));
  function select(i, smooth = true) {
    const it = items[(i + items.length) % items.length];
    state.picked[state.level] = it.id;
    layer.querySelectorAll('.map-pin').forEach(p => p.classList.toggle('on', p.dataset.id === it.id));
    // Aim a little right of the pin, so the card in the corner does not cover it.
    cam.x = it.xy[0] + (view.clientWidth * 0.22) / scale;
    cam.y = it.xy[1] + (view.clientHeight * 0.08) / scale;
    place(smooth);
    showInfo(it);
  }

  function open() {
    const it = items[pick()];
    if (state.level === 'world') {
      if (it.later) return;
      // Zoom in towards the arc, then show its own map.
      scale *= 2.5;
      place(true);
      view.classList.add('fading');
      setTimeout(() => { state.level = 'arc'; state.arc = it.id; render(); view.classList.remove('fading'); }, 420);
    } else if (it.open) onPlay(it.id, scenePick?.value || null);
  }
  let scenePick = null;   // in tester mode, which scene to start at

  function back() {
    if (state.level !== 'arc') return;
    view.classList.add('fading');
    setTimeout(() => { state.level = 'world'; render(); view.classList.remove('fading'); }, 250);
  }

  const fill = (box, ...kids) => box.replaceChildren(...kids.filter(Boolean));
  const button = (label, fn, primary = true) => el('button', { type: 'button', class: primary ? 'primary' : '', onclick: e => { e.currentTarget.blur(); fn(); } }, label);

  function showInfo(it) {
    if (state.level === 'world') {
      const done = it.stories?.filter(s => s.done).length || 0;
      fill(info,
        el('div', { class: 'map-kicker', text: it.later ? 'Coming later' : it.when }),
        el('div', { class: 'map-title', text: it.title }),
        el('div', { class: 'map-meta', text: it.later ? (it.planned ? `Planned: ${it.planned.join(', ')}.` : 'This part of the Bible is not built yet.') : `${it.blurb} ${it.stories.length} stories · ${done} finished` }),
        it.later ? null : button('Open the map', open));
      return;
    }
    const status = !it.open ? it.note
      : it.done ? `Finished · ${it.found} of ${it.total} discoveries`
        : it.started ? `In progress · ${it.found} of ${it.total} discoveries` : 'Not started yet';
    // Tester mode: start at any scene, to try something without playing up to it.
    scenePick = tester && it.open && it.scenes ? el('select', { class: 'scene-pick', 'aria-label': 'Start at scene' },
      it.started ? el('option', { value: '', text: 'Continue where I left off' }) : null,
      it.scenes.map((s, i) => el('option', { value: s, text: i ? `Start at: ${s}` : 'Start at the beginning' }))) : null;
    fill(info,
      el('div', { class: 'map-kicker', text: `Story ${it.n} · ${it.where}` }),
      el('div', { class: 'map-title', text: it.title }),
      el('div', { class: 'map-meta', text: `${it.ref} · ${status}` }),
      scenePick,
      it.open ? button(scenePick ? 'Play' : it.done ? 'Play again' : it.started ? 'Continue' : 'Start', open) : null);
  }

  // ------------------------------------------------------------ building

  function traveler() {
    const c = el('canvas', { width: CW, height: CH, class: 'map-me' });
    drawCharacter(c.getContext('2d'), 0, 0, look, 'down', 0);
    return c;
  }

  function render() {
    const world = state.level === 'world';
    mapKey = world ? 'world' : arc().map;
    const map = MAPS[mapKey];
    size = mapSize(map);
    const canvas = paint(mapKey);
    layer.replaceChildren();
    layer.style.width = `${size.w}px`; layer.style.height = `${size.h}px`;
    layer.append(canvas);

    if (world) {
      items = arcs.map(a => ({ ...a, xy: project(map, a.at) }));
    } else {
      items = arc().stories.map((s, i) => ({ ...s, n: i + 1, xy: project(map, s.place) }));
      // The road from story to story, solid where the traveler has already been.
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', size.w); svg.setAttribute('height', size.h); svg.setAttribute('class', 'map-road');
      for (let i = 1; i < items.length; i++) {
        const line = document.createElementNS(svg.namespaceURI, 'line');
        const [[x1, y1], [x2, y2]] = [items[i - 1].xy, items[i].xy];
        Object.entries({ x1, y1, x2, y2 }).forEach(([k, v]) => line.setAttribute(k, v));
        line.setAttribute('class', items[i - 1].done && items[i].open ? 'walked' : 'ahead');
        svg.append(line);
      }
      layer.append(svg);
    }

    for (const it of items) {
      const [x, y] = it.xy;
      // A name goes above its pin when another pin sits just below it, so the two never overlap.
      const crowded = items.some(o => o !== it && o.xy[1] > y && o.xy[1] - y < 110 && Math.abs(o.xy[0] - x) < 240);
      const kind = world ? (it.later ? 'later' : 'open') : !it.open ? 'locked' : it.done ? 'done' : 'open';
      const mark = world ? (it.later ? '🔒' : '★') : !it.open ? '🔒' : it.done ? '✓' : String(it.n);
      layer.append(el('div', { class: `map-pin ${kind}${crowded ? ' above' : ''}`, 'data-id': it.id, style: `left:${x}px;top:${y}px` },
        el('span', { class: 'map-dot', text: mark }),
        el('span', { class: 'map-name', text: it.title })));
    }

    // Where the traveler is: the next story to play, or the arc on the world map.
    const here = world ? items.find(it => it.id === state.arc && !it.later) : (items.find(it => it.open && !it.done) || items[items.length - 1]);
    if (here) {
      const me = traveler();
      me.style.left = `${here.xy[0]}px`; me.style.top = `${here.xy[1]}px`;
      layer.append(me);
    }

    head.replaceChildren(world
      ? el('span', { class: 'map-place', text: 'The Bible world' })
      : el('span', {}, button('‹ Bible world', back, false), el('span', { class: 'map-place', text: ` ${arc().title}` })));

    if (!items.some(it => it.id === state.picked[state.level])) state.picked[state.level] = here?.id || items[0].id;
    scale = (view.clientHeight || 1) / VISIBLE[state.level];
    select(pick(), false);
  }

  requestAnimationFrame(() => render());
  render();

  return {
    el: view,
    // Keys while the map is showing. Returns true when one was used.
    key(key) {
      if (key === 'left' || key === 'up') { select(pick() - 1); return true; }
      if (key === 'right' || key === 'down') { select(pick() + 1); return true; }
      if (key === 'act') { open(); return true; }
      if (key === 'back') { back(); return true; }
      return false;
    },
    // For the robot play-tester.
    get level() { return state.level; },
    get picked() { return items[pick()]?.id; },
    open,
    select: id => select(items.findIndex(it => it.id === id)),
  };
}
