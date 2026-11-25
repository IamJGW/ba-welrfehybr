// Starts the game and moves between its screens:
// title -> character -> time device -> a story, mini-game or the wardrobe -> device.

import { loadContent } from './content.js';
import { createUI } from './ui.js';
import { createVoice } from './voice.js';
import { createWorld } from './world.js';
import { readArtSetting } from './art_storybook.js';
import { playMiniGame } from './minigame.js';
import { loadRewards, claimNew, dress, found, needs, unlocked, wardrobe } from './rewards.js';
import { save } from './save.js';
import { input } from './input.js';
import { defaultLook } from './art.js';
import './props_later.js';   // more props, added to the list in art.js
import { ARCS } from '../content/arcs.js';
import * as elah from '../content/elah/story.js';
import * as shepherd from '../content/shepherd/story.js';
import * as music from '../content/music/story.js';
import * as covenant from '../content/covenant/story.js';
import * as cave from '../content/cave/story.js';
import * as king from '../content/king/story.js';
import * as prologue from '../content/prologue/story.js';
import * as light from '../content/light/story.js';
import * as garden from '../content/garden/story.js';
import * as ark from '../content/ark/story.js';
import * as rainbow from '../content/rainbow/story.js';
import * as babel from '../content/babel/story.js';
import * as haran from '../content/haran/story.js';
import * as stars from '../content/stars/story.js';
import * as mamre from '../content/mamre/story.js';
import * as moriah from '../content/moriah/story.js';
import * as rebekah from '../content/rebekah/story.js';
import * as bethel from '../content/bethel/story.js';
import * as brothers from '../content/brothers/story.js';
import * as coat from '../content/coat/story.js';
import * as sold from '../content/sold/story.js';
import * as prison from '../content/prison/story.js';
import * as pharaoh from '../content/pharaoh/story.js';
import * as cup from '../content/cup/story.js';
import * as meant from '../content/meant/story.js';
import * as basket from '../content/basket/story.js';
import * as bush from '../content/bush/story.js';
import * as plagues from '../content/plagues/story.js';
import * as passover from '../content/passover/story.js';
import * as sea from '../content/sea/story.js';
import * as manna from '../content/manna/story.js';
import * as rock from '../content/rock/story.js';
import * as sinai from '../content/sinai/story.js';
import * as calf from '../content/calf/story.js';
import * as tabernacle from '../content/tabernacle/story.js';
import * as spies from '../content/spies/story.js';
import * as rahab from '../content/rahab/story.js';
import * as jordan from '../content/jordan/story.js';
import * as walls from '../content/walls/story.js';
import * as choose from '../content/choose/story.js';
import * as deborah from '../content/deborah/story.js';
import * as fleece from '../content/fleece/story.js';
import * as torches from '../content/torches/story.js';
import * as ruth from '../content/ruth/story.js';
import * as redeemer from '../content/redeemer/story.js';
import * as hannah from '../content/hannah/story.js';
import * as listen from '../content/listen/story.js';
import * as dagon from '../content/dagon/story.js';
import * as saul from '../content/saul/story.js';
import * as cliff from '../content/cliff/story.js';
import * as obey from '../content/obey/story.js';
import { stones } from './games/stones.js';
import { sling } from './games/sling.js';
import { verses } from './games/verses.js';
import { roundup } from './games/roundup.js';
import { lyre } from './games/lyre.js';
import { arrows } from './games/arrows.js';
import { pairs } from './games/pairs.js';
import { camels } from './games/camels.js';
import { granary } from './games/granary.js';
import { tambourine, march, jars } from './games/beats.js';
import { mannaMorning } from './games/mannamorning.js';
import { gleaning } from './games/gleaning.js';
import { donkeys } from './games/donkeys.js';

const voice = createVoice(save);
window.__voice = voice;   // lets the robot play-tester check what was read aloud
const ui = createUI(document.getElementById('ui'), voice);
input.route((key, repeat) => ui.key(key, repeat));

// Stories that can be played now, and the mini-games that rewards unlock.
// The stories, in the order they happened. Each opens when the one before it is finished.
const ORDER = [light, garden, ark, rainbow, babel, haran, stars, mamre, moriah, rebekah, bethel, brothers, coat, sold, prison, pharaoh, cup, meant, basket, bush, plagues, passover, sea, manna, rock, sinai, calf, tabernacle, spies, rahab, jordan, walls, choose, deborah, fleece, torches, ruth, redeemer, hannah, listen, dagon, saul, cliff, obey, shepherd, music, elah, covenant, cave, king];
const stories = Object.fromEntries(ORDER.map(s => [s.id, s]));
const games = { stones, sling, verses, roundup, lyre, arrows, pairs, camels, granary, tambourine, march, jars, gleaning, donkeys, mannamorning: mannaMorning };

// A story with an "after" opens once that other story has been finished. A story
// already begun stays open, so a change to the order never locks anyone out.
// The tester code opens every story and reward at once, for trying out new
// work without playing through. It is a convenience, not a lock: anyone who
// reads the game's files can find it. Change it freely (capitals do not matter).
const TESTER_CODE = 'bethlehem';
const tester = () => !!save.data.settings.tester;

const isOpen = story => tester() || !story.after || !!save.data.done[story.after] || !!save.data.done[story.id] || story.id in save.data.step;


let game = null;

// The traveler as they should be drawn, wearing whatever they have put on.
const traveler = () => ({ name: save.data.traveler.name, look: dress(save.data.traveler.look) });

function play(story, content, startStep, rewards) {
  input.clear();
  ui.loading(true);
  // A story that has been played is never announced as newly unlocked.
  if (!save.data.opened.includes(story.id)) { save.data.opened.push(story.id); save.write(); }
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: 960,
    height: 540,
    backgroundColor: '#14110f',
    pixelArt: true,
    banner: false,
    audio: { noAudio: true },
    scale: { mode: Phaser.Scale.NONE },
    scene: createWorld({
      story, content, ui, save, startStep,
      onReady: () => ui.loading(false),
      // In the opening, the traveler is still just a kid at Grandma's: own clothes, nothing earned yet.
      traveler: story.cutscene ? { ...traveler(), look: dress({ ...save.data.traveler.look, outfit: null, head: null, item: null, pet: null }) } : traveler(),
      newRewards: () => claimNew(rewards, save),
      // An animal won in a story becomes the player's companion, unless they already have one.
      onAdopt(kind) {
        const who = save.data.traveler;
        if (!who.look.pet) save.setTraveler({ ...who, look: { ...who.look, pet: kind } });
      },
      // The opening cutscene has no end page; it goes straight to the time device.
      onComplete: () => (story.cutscene ? backToDevice() : finish(story, content, rewards)),
      // Leaving by the time door: back to the device, with the story kept where it was.
      onLeave: backToDevice,
    }),
  });
  window.__game = game;   // handy when testing from the browser console
  // The loading screen goes when the first frame is drawn; this is only a backstop.
  const started = game;
  setTimeout(() => { if (game === started) ui.loading(false); }, 10000);
  window.__story = story;
}

function backToDevice() {
  closeWorld();
  hub('stories');
}

// The opening in Grandma's attic, where the traveler finds the time device.
async function playPrologue() {
  ui.loading(true);
  play(prologue, await loadContent('prologue'), null, await loadRewards());
}

function closeWorld() {
  game.destroy(true);
  game = null;
  window.__game = null;
  ui.hud(false);
}

async function finish(story, content, rewards) {
  closeWorld();
  const texts = scene => (content.scenes[scene] || []).map(line => line.text);
  await ui.end({
    title: story.title,
    truth: content.lines('end_truth', save.data.traveler.name)[0],
    think: content.lines('end_think', save.data.traveler.name).find(l => l.kind === 'think')?.text || null,
    fromBible: texts('end_bible'),
    imagined: texts('end_imagined'),
    leftOut: texts('end_left_out')[0],
    found: save.badges(story.id).length,
    total: content.badges.length,
    newRewards: claimNew(rewards, save).map(r => r.name),
    newStories: newlyOpened().map(s => s.title),
  });
  hub('rewards');
}

// Stories that have just opened. Each is only announced once.
function newlyOpened() {
  const fresh = Object.values(stories).filter(s => s.after && isOpen(s) && !save.data.opened.includes(s.id));
  if (fresh.length) { save.data.opened.push(...fresh.map(s => s.id)); save.write(); }
  return fresh;
}

async function runGame(id, rewards, contents) {
  const def = games[id];
  const who = traveler();
  // Verse Builder draws on every story the player has finished.
  const finished = ORDER.filter(s => save.data.done[s.id]);
  const env = {
    ui, save,
    verses: (finished.length ? finished : [stories[def.story]]).flatMap(s => contents[s.id].lines('game_verses', who.name)),
    reward: rewards.find(r => r.id === id),
    name: who.name,
    look: who.look,
    text: scene => contents[def.story].lines(scene, who.name),
  };
  // Most mini-games are played on a canvas; a few, like the verse puzzle, run themselves.
  if (def.play) await def.play(env); else await playMiniGame(def, env);
}

// The words and discoveries of every story, fetched all at once.
async function loadAll() {
  const ids = Object.keys(stories);
  return Object.fromEntries(await Promise.all(ids.map(async id => [id, await loadContent(id)])));
}

// The time device. Everything is reloaded each visit, so edits to the words
// or the reward levels show up without restarting.
async function hub(tab = 'stories') {
  for (;;) {
    ui.hud(false);
    ui.loading(true);
    const rewards = await loadRewards();
    const contents = await loadAll();
    claimNew(rewards, save);

    const names = {
      stories: Object.fromEntries(Object.values(stories).map(s => [s.id, s.title])),
      badges: Object.fromEntries(Object.values(contents).flatMap(c => c.badges.map(b => [b.id, b.title]))),
    };
    const have = found(save);
    const upcoming = rewards.filter(r => r.discoveries > have).sort((a, b) => a.discoveries - b.discoveries);
    const open = ui.device({
      tab,
      name: save.data.traveler.name,
      found: have,
      total: Object.values(contents).reduce((n, c) => n + c.badges.length, 0),
      next: upcoming[0] || null,
      look: save.data.traveler.look,
      tester: tester(),
      firstVisit: !Object.keys(save.data.done).some(id => stories[id]) && !Object.keys(save.data.step).some(id => stories[id]),
      arcs: ARCS.map(arc => ({
        ...arc,
        stories: (arc.stories || []).map(id => {
          const s = stories[id];
          return {
            id, title: s.title, where: s.where, ref: s.ref, place: s.place, open: isOpen(s),
            note: s.after ? `Finish ${stories[s.after].title} to unlock` : '',
            found: save.badges(id).length, total: contents[id].badges.length,
            done: !!save.data.done[id], started: id in save.data.step,
            scenes: s.steps.map(step => step.id),
          };
        }),
      })),
      rewards: rewards.map(r => ({
        ...r,
        locked: !unlocked(r, save),
        needs: needs(r, save, names),
        best: r.type === 'game' ? games[r.id].status(save, ORDER.filter(s => save.data.done[s.id]).reduce((n, s) => n + contents[s.id].lines('game_verses').length, 0)) : null,
      })),
    });
    ui.loading(false);
    const action = await open;

    if (action.type === 'story') {
      if (await parentNote(stories[action.id], contents[action.id])) return play(stories[action.id], contents[action.id], action.step || save.data.step[action.id], rewards);
      tab = action.tab;
      continue;
    }
    if (action.type === 'tester-off') setTester(false);
    if (action.type === 'game') await runGame(action.id, rewards, contents);
    if (action.type === 'wardrobe') {
      save.setTraveler(await ui.creator(save.data.traveler, { heading: 'Wardrobe', extras: wardrobe(rewards, save, names) }));
    }
    tab = action.tab;
  }
}

// A story with hard things in it (a "parent_note" in its dialogue.csv) shows that
// note before it starts, until it has been finished once. True means go ahead.
async function parentNote(story, content) {
  const note = content.scenes.parent_note;
  if (!note || save.data.done[story.id]) return true;
  const pick = await ui.card({
    kicker: 'A note for parents', title: story.title, lines: content.lines('parent_note', save.data.traveler.name),
    buttons: [{ id: 'go', label: 'Continue', primary: true }, { id: 'back', label: 'Back to the map' }],
  });
  return pick === 'go';
}

// The tester code, typed on the title screen. Typing it again turns it off.
async function enterCode() {
  const typed = await ui.ask({ title: 'Tester code', placeholder: 'Type the code' });
  if (typed === null) return;
  const right = typed.trim().toLowerCase() === TESTER_CODE.toLowerCase();
  if (right) setTester(!tester());
  await ui.card({
    kicker: 'Tester code',
    title: !right ? 'That code did not work' : tester() ? 'Tester mode is on' : 'Tester mode is off',
    lines: [{ kind: 'note', text: !right ? 'Check the spelling and try again.'
      : tester() ? 'Every story, mini-game and reward is open, and each story can start at any scene. Progress still saves as normal.'
        : 'Stories and rewards open by playing again.' }],
    buttons: [{ id: 'ok', label: 'OK', primary: true }],
  });
}

function setTester(on) {
  save.data.settings = { ...save.data.settings, tester: on };
  save.write();
}

async function boot() {
  const params = new URLSearchParams(location.search);
  readArtSetting(params, save);   // ?art=storybook turns on the art sample, ?art=plain turns it off
  // For testing: ?step=saul jumps into a story at that scene (add
  // &story=shepherd for the second story), and ?game=sling opens a mini-game
  // without having to unlock it first.
  // Adding &fresh wipes progress first (but keeps the character), for a clean test.
  if (params.get('step') || params.get('game')) {
    if (params.has('fresh')) { const who = save.data.traveler; save.reset(); if (who) save.setTraveler(who); }
    if (!save.data.traveler) save.setTraveler({ name: 'Tester', look: defaultLook() });
    const rewards = await loadRewards();
    const contents = await loadAll();
    const story = { prologue, ...stories }[params.get('story')] || ORDER[0];
    if (story === prologue) contents.prologue = await loadContent('prologue');
    if (params.get('step')) return play(story, contents[story.id], params.get('step'), rewards);
    await runGame(params.get('game'), rewards, contents);
    return hub('rewards');
  }
  let choice;
  for (;;) {
    choice = await ui.title({ canContinue: !!save.data.traveler, tester: tester() });
    if (choice !== 'code') break;
    await enterCode();
  }
  if (choice === 'intro') return playPrologue();
  if (choice === 'new') save.reset();
  if (!save.data.traveler) {
    const who = await ui.creator({ name: '', look: defaultLook() }, { skippable: true });
    save.setTraveler({ name: who.name, look: who.look });
    // "Skip the opening" goes straight to the time device; it can still be watched from the title screen.
    return who.skipIntro ? hub() : playPrologue();
  }
  hub();
}

boot().catch(err => {
  console.error(err);
  document.getElementById('ui').textContent = `Something went wrong while starting: ${err.message}`;
});
