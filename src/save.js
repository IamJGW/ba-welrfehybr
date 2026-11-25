// Progress is kept in the browser, on this computer only. Nothing is sent anywhere.

const KEY = 'bible-game-save-v1';
const blank = () => ({ traveler: null, badges: {}, step: {}, done: {}, rewards: [], opened: [], best: {}, verses: [], settings: { voice: true } });

function read() {
  try {
    return { ...blank(), ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return blank();
  }
}

export const save = {
  data: read(),
  write() {
    try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch { /* play on without saving */ }
  },
  // Starting over keeps the settings, such as whether reading aloud is on.
  reset() { this.data = { ...blank(), settings: this.data.settings }; this.write(); },
  hasAnyBadge(id) { return Object.values(this.data.badges).some(list => list.includes(id)); },
  setTraveler(t) { this.data.traveler = t; this.write(); },
  badges(story) { return this.data.badges[story] || []; },
  hasBadge(story, id) { return this.badges(story).includes(id); },
  addBadge(story, id) {
    if (this.hasBadge(story, id)) return false;
    this.data.badges[story] = [...this.badges(story), id];
    this.write();
    return true;
  },
  setStep(story, id) { this.data.step[story] = id; this.write(); },
  finish(story) { this.data.done[story] = true; delete this.data.step[story]; this.write(); },
  // Mini-game records. "lower" is true when a smaller number is the better score.
  best(game) { return this.data.best[game] ?? null; },
  record(game, score, lower = true) {
    const old = this.best(game);
    if (old === null || (lower ? score < old : score > old)) { this.data.best[game] = score; this.write(); }
    return this.best(game);
  },
};
