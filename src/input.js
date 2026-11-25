// Keyboard handling. While a conversation or menu is open, keys go there
// and never reach the world, so one press can't do two things.

const NAMES = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right',
  ' ': 'act', Enter: 'act', e: 'act',
  j: 'journal', v: 'voice', Escape: 'back',
};

const held = new Set();
const pressed = new Set();
let router = null;

// Leave the key alone when it belongs to a text box or a focused button.
const typing = e => {
  const tag = e.target?.tagName;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || (tag === 'BUTTON' && (e.key === ' ' || e.key === 'Enter'));
};
const nameOf = e => NAMES[e.key.length === 1 ? e.key.toLowerCase() : e.key];

window.addEventListener('keydown', e => {
  if (typing(e) || e.metaKey || e.ctrlKey || e.altKey) return;
  const key = nameOf(e);
  if (!key) return;
  e.preventDefault();
  if (router && router(key, e.repeat)) return;
  if (!e.repeat) pressed.add(key);
  held.add(key);
});
window.addEventListener('keyup', e => {
  const key = nameOf(e);
  if (key) held.delete(key);
});
window.addEventListener('blur', () => { held.clear(); pressed.clear(); });

export const input = {
  // fn(key, isRepeat) returns true when it has used the key.
  route(fn) { router = fn; },
  held: key => held.has(key),
  // True once for each fresh press.
  took(key) { return pressed.delete(key); },
  clear() { held.clear(); pressed.clear(); },
};
