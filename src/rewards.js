// Rewards: things unlocked by finding discoveries. Their names and what each
// one needs are in content/rewards.csv. This file says what each reward does.

import { parseCSV } from './content.js';

// What each wearable reward puts on the character, and which animal each
// companion is. The wardrobe page each one appears on is set in SLOTS.
const WEAR = {
  headband: { slot: 'head', value: 'band' },
  cloth: { slot: 'head', value: 'cloth' },
  helmet: { slot: 'head', value: 'bighelmet' },
  shepherd: { slot: 'outfit', value: 'shepherd' },
  soldier: { slot: 'outfit', value: 'soldier' },
  feast: { slot: 'outfit', value: 'feast' },
  royal: { slot: 'outfit', value: 'royal' },
  bag: { slot: 'item', value: 'bag' },
  harp: { slot: 'item', value: 'harp' },
  bow: { slot: 'item', value: 'bow' },
  staff: { slot: 'item', value: 'staff' },
  lamb: { slot: 'pet', value: 'lamb' },
  goat: { slot: 'pet', value: 'goat' },
  calf: { slot: 'pet', value: 'calf' },
  donkey: { slot: 'pet', value: 'donkey' },
  ibex: { slot: 'pet', value: 'ibex' },
  dove: { slot: 'pet', value: 'dove' },
  traveler: { slot: 'outfit', value: 'traveler' },
  jar: { slot: 'item', value: 'jar' },
  camel: { slot: 'pet', value: 'camel' },
  coat: { slot: 'outfit', value: 'coat' },
  linen: { slot: 'outfit', value: 'linen' },
  nemes: { slot: 'head', value: 'nemes' },
  miriam: { slot: 'item', value: 'tambourine' },
  mannabasket: { slot: 'item', value: 'basket' },
  priest: { slot: 'outfit', value: 'priest' },
  grapes: { slot: 'item', value: 'grapes' },
  quail: { slot: 'pet', value: 'bird' },
  ramhorn: { slot: 'item', value: 'trumpet' },
  memorial: { slot: 'item', value: 'stone' },
  ruthsheaf: { slot: 'item', value: 'sheaf' },
  gideontorch: { slot: 'item', value: 'torch' },
  ram: { slot: 'pet', value: 'ram' },
  oilhorn: { slot: 'item', value: 'horn' },
  crown: { slot: 'head', value: 'crown' },
  prophet: { slot: 'outfit', value: 'prophet' },
};

// The wardrobe's rows, and what the "nothing special" choice is called.
export const SLOTS = [
  { key: 'outfit', label: 'Outfit', none: 'My clothes', page: 'Clothes' },
  { key: 'head', label: 'Head', none: 'Nothing', page: 'Clothes' },
  { key: 'item', label: 'Carry', none: 'Nothing', page: 'Clothes' },
  { key: 'pet', label: 'Companion', none: 'None', page: 'Me' },
];

const OUTFITS = {
  shepherd: { kind: 'tunic', top: '#e3d6b0', sash: '#8a5a2b' },
  soldier: { kind: 'tunic', top: '#a9845a', sash: '#5d4526', armor: '#8a6b45' },
  feast: { kind: 'tunic', top: '#f1ede0', sash: '#3d6fb5' },
  royal: { kind: 'tunic', top: '#8a2f2f', sash: '#e3b93a' },
  traveler: { kind: 'tunic', top: '#7d5a8a', sash: '#e3b93a' },
  coat: { kind: 'tunic', top: '#c0415a', sash: '#e3b93a' },
  linen: { kind: 'tunic', top: '#f2efe6', sash: '#4a7ab0' },
  priest: { kind: 'tunic', top: '#f1ede0', sash: '#3d6fb5' },
  prophet: { kind: 'tunic', top: '#f4f1e6', sash: '#c0415a' },
};
const HEAD_COLORS = { band: '#7a2e2e', cloth: '#e9e2cf', nemes: '#4a7ab0' };

// Turn the player's saved choices into something the artist code can draw.
export function dress(look) {
  return { ...look, ...(OUTFITS[look.outfit] || {}), headColor: HEAD_COLORS[look.head] };
}

export async function loadRewards() {
  const res = await fetch(`content/rewards.csv?t=${Date.now()}`);
  if (!res.ok) throw new Error('Could not load content/rewards.csv');
  return parseCSV(await res.text()).map(row => ({
    id: row.id,
    type: row.type,
    name: row.name.replace(/'/g, '’'),
    description: row.description.replace(/'/g, '’'),
    discoveries: Number(row.discoveries) || 0,
    finish: row.finish_story || null,
    discovery: row.needs_discovery || null,
    wear: WEAR[row.id] || null,
  }));
}

export const found = save => Object.values(save.data.badges).reduce((n, list) => n + list.length, 0);

// Truly earned by playing.
const earned = (reward, save) =>
  found(save) >= reward.discoveries
  && (!reward.finish || !!save.data.done[reward.finish])
  && (!reward.discovery || save.hasAnyBadge(reward.discovery));

// Ready to use: earned, or opened by the tester code.
export const unlocked = (reward, save) => !!save.data.settings.tester || earned(reward, save);

// What is still needed, in words. Empty when the reward is unlocked.
// names: { stories: { id: title }, badges: { id: title } }
export function needs(reward, save, names) {
  if (save.data.settings.tester) return '';
  const parts = [];
  if (found(save) < reward.discoveries) parts.push(`find ${reward.discoveries} discoveries`);
  if (reward.discovery && !save.hasAnyBadge(reward.discovery)) parts.push(`find “${names.badges[reward.discovery] || 'a certain discovery'}”`);
  if (reward.finish && !save.data.done[reward.finish]) parts.push(`finish ${names.stories[reward.finish] || 'the story'}`);
  const text = parts.join(' and ');
  return text && text[0].toUpperCase() + text.slice(1);
}

// Rewards that have just been earned. Each is only reported once. The tester
// code opens everything without announcing it.
export function claimNew(rewards, save) {
  const fresh = rewards.filter(r => earned(r, save) && !save.data.rewards.includes(r.id));
  if (fresh.length) {
    save.data.rewards.push(...fresh.map(r => r.id));
    save.write();
  }
  return fresh;
}

// The wardrobe rows for the character screen, with locked choices marked.
export function wardrobe(rewards, save, names) {
  return SLOTS.map(slot => ({
    key: slot.key,
    label: slot.label,
    page: slot.page,
    options: [
      { value: null, label: slot.none },
      ...rewards.filter(r => r.wear?.slot === slot.key).map(r => ({
        value: r.wear.value,
        label: r.name,
        locked: !unlocked(r, save),
        needs: needs(r, save, names),
      })),
    ],
  }));
}
