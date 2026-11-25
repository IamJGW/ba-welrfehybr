// The walk-around world: the map, the people in it, and the tools a story
// uses to run its scenes. Nothing here knows about any particular story.

import { T, CW, CH, FEET_Y, PROPS, ANIMAL_HEADROOM, addCharacterTexture, addPropTextures, groundCanvas } from './art.js';
import { input } from './input.js';
import { storybookOn, storybookGround, storybookLight, storybookShadow } from './art_storybook.js';

const WALK = 140, WADE = 95;   // pixels per second
const REACH = 52;              // how close you must be to talk or look
const BODY = 18;               // how close two people can stand
const HEEL = 42;               // how closely a companion follows

const ANIMAL_SOUNDS = { lamb: 'Baa!', goat: 'Meh-eh-eh!', calf: 'Moo!', donkey: 'Hee-haw!', ibex: 'Meh!', dove: 'Coo!', camel: 'Hrrrumph!' };
const WATCH = { range: 170, half: 0.61 };   // how far and how wide a watchful soldier sees
const FACING = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };

// Where someone's feet are when they stand on a tile.
const feet = (tx, ty) => ({ x: tx * T + T / 2, y: ty * T + T - 6 });

export function createWorld({ story, content, ui, save, traveler, startStep, onComplete, onLeave = () => {}, onReady = () => {}, newRewards = () => [], onAdopt = () => {} }) {
  class World extends Phaser.Scene {
    constructor() { super('world'); }

    create() {
      this.events.once('update', onReady);
      const rows = story.map;
      this.size = { w: rows[0].length * T, h: rows.length * T };
      rows.forEach((line, i) => {
        if (line.length !== rows[0].length) console.error(`Map row ${i} is ${line.length} tiles wide, expected ${rows[0].length}`);
      });

      addPropTextures(this);
      // The storybook art sample, off unless turned on (see ART_MUSIC_PLAN.md).
      this.storybook = storybookOn(save.data.settings, story.id);
      if (this.storybook) {
        this.textures.addCanvas('sb_shadow', storybookShadow());
        this.textures.addCanvas('sb_light', storybookLight(this.scale.width, this.scale.height));
        this.add.image(0, 0, 'sb_light').setOrigin(0, 0).setScrollFactor(0).setDepth(9e4);
      }
      this.props = new Map();
      this.setGround(rows);
      this.stealth = null;
      this.lastCover = null;
      this.barriers = new Map(story.barriers.map(b => {
        const [x1, y1, x2, y2] = b.tiles;
        return [b.id, { l: x1 * T, t: y1 * T, r: (x2 + 1) * T, b: (y2 + 1) * T, bump: b.bump, on: b.on !== false }];
      }));

      story.objects.forEach((o, i) => this.addProp({ id: `object${i}`, ...o }));
      // The time door: the way back to the time device, in every story.
      if (story.door) {
        this.addProp({
          id: 'door', type: 'portal', x: story.door[0], y: story.door[1], reach: 40, label: 'step through the time door',
          async onUse(g) {
            if (await g.ask('door', { title: 'Go back to the time device?', yes: 'Go back', no: 'Stay here' })) g.leave();
          },
        });
      }

      this.actors = new Map();
      this.lookCount = 0;
      for (const a of story.actors) this.addActor(a);
      this.player = this.addActor({ id: 'player', name: traveler.name, look: traveler.look, at: story.start, dir: 'right', solid: false });
      if (traveler.look.pet) this.addCompanion(traveler.look.pet);

      const cam = this.cameras.main;
      cam.setBounds(0, 0, this.size.w, this.size.h);
      cam.startFollow(this.player.sprite, true, 0.15, 0.15);
      cam.fadeIn(500, 0, 0, 0);
      this.following = true;

      this.marker = this.add.image(0, 0, 'marker').setDepth(1e6).setVisible(false);
      this.bubble = this.add.image(0, 0, 'bubble').setDepth(1e6).setVisible(false);

      this.locks = 0;
      this.trigger = null;
      this.markerId = null;
      this.stepId = null;
      this.bump = null;
      this.lastBump = 0;
      this.hint = '';
      this.note = null;
      this.noteUntil = 0;
      this.pace = 1;
      this.state = {};
      this.api = this.makeApi();

      ui.setJournal(() => ({
        title: story.title,
        badges: content.badges.map(b => ({ ...b, found: save.hasBadge(story.id, b.id) })),
      }));
      // A cutscene can be skipped with the corner button or Esc.
      ui.hud(true, story.cutscene ? { leave: onLeave, label: 'Skip' } : {});
      this.runStory().catch(err => console.error(err));
    }

    // ------------------------------------------------------------ building

    addProp(o) {
      const def = PROPS[o.type];
      if (!def) return console.error(`Unknown object type "${o.type}"`);
      const foot = def.foot || 1;
      const x = o.x * T + (foot * T) / 2;
      const y = def.flat ? o.y * T + T / 2 : (o.y + 1) * T - 2;
      const sprite = this.add.image(x, y, o.type).setOrigin(0.5, def.flat ? 0.5 : 1).setDepth(def.flat ? -500 : y).setScale(o.scale || 1);
      const shadow = this.storybook && !def.flat ? this.add.image(x, y - 1, 'sb_shadow').setDepth(-450).setScale(Math.max(1, foot) * (o.scale || 1), 1) : null;
      if (def.glow) this.tweens.add({ targets: sprite, alpha: { from: 0.65, to: 1 }, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      const tiles = [];
      if (def.solid) for (let i = 0; i < foot; i++) tiles.push([o.x + i, o.y]);
      for (const [tx, ty] of tiles) this.solid[ty][tx] = true;
      this.props.set(o.id, { ...o, def, sprite, shadow, tiles, px: x, py: y });
    }

    // Paint the ground from map rows. A story can change it part-way, as when the
    // dry land appears or the flood goes down; with ms it fades from old to new.
    setGround(rows, ms = 0) {
      const key = `ground${(this.groundCount = (this.groundCount || 0) + 1)}`;
      this.textures.addCanvas(key, this.storybook ? storybookGround(rows) : groundCanvas(rows));
      const img = this.add.image(0, 0, key).setOrigin(0, 0).setDepth(-1000 + this.groundCount / 1000);
      const old = this.groundImg;
      this.groundImg = img;
      if (old) {
        const drop = () => { const k = old.texture.key; old.destroy(); this.textures.remove(k); };
        if (ms) { img.setAlpha(0); this.tweens.add({ targets: img, alpha: 1, duration: ms, onComplete: drop }); } else drop();
      }
      // Cliffs, walls and deep sea cannot be walked on; shallow water is waded; brush hides.
      this.solid = rows.map(line => [...line].map(ch => ch === '#' || ch === 'W' || ch === 'S'));
      this.water = rows.map(line => [...line].map(ch => ch === '~'));
      this.cover = rows.map(line => [...line].map(ch => ch === 'x'));
      for (const p of this.props.values()) for (const [tx, ty] of p.tiles) this.solid[ty][tx] = true;
    }

    removeProp(id) {
      const p = this.props.get(id);
      if (!p) return;
      for (const [tx, ty] of p.tiles) this.solid[ty][tx] = false;
      p.sprite.destroy();
      p.shadow?.destroy();
      this.props.delete(id);
    }

    addActor(a) {
      const key = `${a.id}_look0`;
      addCharacterTexture(this, key, a.look);
      const p = feet(a.at[0], a.at[1]);
      const sprite = this.add.image(p.x, p.y, key, 'down0').setOrigin(0.5, FEET_Y / CH).setScale(a.scale || 1);
      const actor = {
        id: a.id, name: a.name || '', look: { ...a.look }, key, sprite,
        x: p.x, y: p.y, dir: a.dir || 'down', frame: 0, animT: 0, moving: false,
        path: [], speed: 150, done: null, walking: null, stomp: false,
        chat: a.chat || null, onUse: a.onUse || null, label: a.label || null,
        solid: a.solid !== false, hidden: !!a.hidden, wading: false,
        trail: !!a.trail, headroom: a.headroom || 0,
        watch: a.watch ? WATCH : null, patrol: null, cone: null,
      };
      if (this.storybook) actor.shadow = this.add.image(p.x, p.y, 'sb_shadow').setDepth(-450).setScale(a.scale || 1);
      if (actor.watch) actor.cone = this.add.image(p.x, p.y, 'cone').setOrigin(0, 0.5).setAlpha(0.2).setDepth(-400).setVisible(false);
      this.actors.set(a.id, actor);
      return actor;
    }

    // An animal that follows at the player's heel.
    addCompanion(kind) {
      if (this.actors.has('pet')) return;
      const [tx, ty] = story.start;
      const pet = this.addActor({
        id: 'pet', name: `your ${kind}`, label: `pat your ${kind}`, look: { kind }, at: [tx, ty], solid: false,
        trail: true, headroom: ANIMAL_HEADROOM, onUse: g => g.note(ANIMAL_SOUNDS[kind] || '...'),
      });
      pet.x = this.player.x - 24;
      pet.y = this.player.y;
    }

    setLook(id, patch) {
      const a = this.actors.get(id);
      Object.assign(a.look, patch);
      const old = a.key;
      a.key = `${a.id}_look${++this.lookCount}`;
      addCharacterTexture(this, a.key, a.look);
      a.sprite.setTexture(a.key, 'down0');
      this.textures.remove(old);
    }

    // ------------------------------------------------------- story running

    async runStory() {
      const steps = story.steps;
      const api = this.api;
      let i = Math.max(0, steps.findIndex(s => s.id === startStep));
      for (let k = 0; k < i; k++) steps[k].enter?.(api);
      if (i > 0 && steps[i].spawn) api.place('player', ...steps[i].spawn, 'down');

      for (; i < steps.length; i++) {
        const s = steps[i];
        this.stepId = s.id;
        save.setStep(story.id, s.id);
        s.enter?.(api);
        if (s.intro) { this.locks++; await s.intro(api); this.locks--; }
        // On first arriving, point out the way home.
        if (i === 0 && story.door) api.note(api.text('door_hint'), 4500, true);
        this.setGoal(s.goal, s.marker);
        if (s.goal) ui.announce(s.goal);
        s.begin?.(api);
        // Triggers: { talk: id }, { signal: name }, { zone: [x1, y1, x2, y2] } or { choose: [ids] }.
        let answer;
        if (s.trigger) answer = await new Promise(resolve => { this.trigger = { ...s.trigger, resolve }; });
        this.locks++;
        this.setGoal(null, null);
        await s.run?.(api, answer);
        this.locks--;
      }
      save.finish(story.id);
      onComplete();
    }

    fire(answer) {
      const done = this.trigger.resolve;
      this.trigger = null;
      done(answer);
    }

    setGoal(text, markerId) {
      ui.setGoal(text ? `Goal: ${text}` : '');
      this.markerId = markerId || null;
    }

    makeApi() {
      const w = this;
      const cam = this.cameras.main;
      const wait = ms => new Promise(resolve => w.time.delayedCall(ms, resolve));
      const stop = a => { a.path = []; a.moving = false; const done = a.done; a.done = null; done?.(); };
      return {
        T, state: w.state,
        get stepId() { return w.stepId; },
        get player() { return w.player; },
        actor: id => w.actors.get(id),
        wait,
        // The text box moves to the top when it would otherwise cover the player.
        // Extra words can be dropped into a line: say('picked', { pick: 'Eliab' }) fills in {pick}.
        say(id, words = {}) {
          const low = w.following && w.player.y - cam.scrollY > 300;
          return ui.say(content.lines(id, { name: traveler.name, ...words }), { top: low });
        },
        goal: (text, markerId) => w.setGoal(text, markerId),
        // The words of a one-line conversation, for use in a quick note.
        text: (id, words = {}) => content.lines(id, { name: traveler.name, ...words })[0].text,
        signal(name) { if (w.trigger?.signal === name) w.fire(); },
        // An optional job shown under the goal. Pass nothing to clear it.
        task(text) { ui.setTask(text ? `Side task: ${text}` : ''); },
        // A short message that does not stop the game.
        // A "quiet" note gives way to the talk-or-look prompt when the player is next to something.
        note(text, ms = 1800, quiet = false) { w.note = text; w.noteQuiet = quiet; w.noteUntil = w.time.now + ms; ui.announce(text, true); },
        // A yes-or-no question on a card. The words come from a conversation in dialogue.csv.
        async ask(scene, { title, yes = 'Yes', no = 'No' }) {
          const answer = await ui.card({
            kicker: story.title, title, lines: content.lines(scene, { name: traveler.name }),
            buttons: [{ id: 'yes', label: yes, primary: true }, { id: 'no', label: no }],
          });
          return answer === 'yes';
        },
        // Go back to the time device. The story is picked up later from the current step.
        leave() { onLeave(); },
        found: id => save.hasBadge(story.id, id),
        award(id) {
          const badge = content.badge(id);
          if (!badge) return console.error(`Missing badge "${id}" in badges.csv`);
          if (!save.addBadge(story.id, id)) return;
          ui.toast(badge);
          for (const reward of newRewards()) {
            ui.toast({ kicker: 'Reward unlocked!', title: reward.name, sub: 'Waiting on your time device', reward: true });
          }
        },

        // people
        place(id, tx, ty, dir) {
          const a = w.actors.get(id);
          stop(a);
          Object.assign(a, feet(tx, ty));
          if (dir) a.dir = dir;
        },
        // Walk through a list of tiles. The promise settles on arrival.
        walk(id, tiles, speed = 150, opts = {}) {
          const a = w.actors.get(id);
          stop(a);
          a.path = tiles.map(([tx, ty]) => feet(tx, ty));
          a.speed = speed;
          a.stomp = !!opts.stomp;
          a.walking = new Promise(resolve => { a.done = resolve; });
          return a.walking;
        },
        arrive: id => w.actors.get(id).walking || Promise.resolve(),
        face(id, dir) { w.actors.get(id).dir = dir; },
        show(id) { w.actors.get(id).hidden = false; },
        hide(id) { const a = w.actors.get(id); stop(a); a.hidden = true; },
        setChat(id, scene) { w.actors.get(id).chat = scene; },
        setLook: (id, patch) => w.setLook(id, patch),
        // Make someone follow at the player's heel, or stop. Give another
        // person's id instead of true to follow them, which makes a line.
        trail(id, on = true) { w.actors.get(id).trail = on; },
        // The player runs instead of walking.
        hurry(on = true) { w.pace = on ? 1.4 : 1; },
        // The player gains an animal companion for good.
        adopt(kind) { onAdopt(kind); },
        // Walk back and forth between tiles for ever, pausing at each end. Pass no tiles to stop.
        patrol(id, tiles, speed = 70, pause = 0.9) {
          const a = w.actors.get(id);
          a.patrol = tiles ? { points: tiles.map(([tx, ty]) => feet(tx, ty)), i: 0, step: 1, speed, pause, wait: 0 } : null;
        },
        // While sneaking is on, a watchful soldier who sees the player in the open sends them
        // back to the last brush they hid in. "scene" is the line shown when that happens.
        sneak(scene, startTile) {
          w.stealth = scene ? { scene, start: startTile ? feet(...startTile) : null } : null;
          w.lastCover = null;
        },
        // A question with several answers. In dialogue.csv the right one has kind "answer"
        // and the others "option". True if the player picked the right one.
        async choose(scene) {
          const lines = content.lines(scene, { name: traveler.name });
          const ask = lines.filter(l => l.kind !== 'answer' && l.kind !== 'option');
          const options = lines.filter(l => l.kind === 'answer' || l.kind === 'option').sort(() => Math.random() - 0.5);
          const pick = await ui.card({
            kicker: story.title, title: ask[0].text, lines: ask.slice(1), stack: true,
            buttons: options.map((o, n) => ({ id: o.kind === 'answer' ? 'answer' : `option${n}`, label: o.text })),
          });
          return pick === 'answer';
        },
        // Give the player something to carry for a scene. With nothing, they get their own item back.
        hold(item) { w.setLook('player', { item: item || traveler.look.item || null }); },

        // the world
        barrier(id, on) { w.barriers.get(id).on = on; },
        // New ground from map rows, fading in over ms.
        ground(rows, ms = 1200) { w.setGround(rows, ms); return wait(ms + 40); },
        // The sky over the whole screen: { night, stars, rain }, each true or false.
        sky: opts => ui.sky(opts),
        removeProp: id => w.removeProp(id),
        addProp: object => w.addProp(object),
        fx(texture, x, y) { return w.add.image(x, y, texture).setDepth(1e5); },
        tween: config => new Promise(resolve => w.tweens.add({ ...config, onComplete: resolve })),
        dark: on => ui.dark(on),

        // the camera
        pan(tx, ty, ms = 900) { w.following = false; cam.stopFollow(); cam.pan(tx * T, ty * T, ms, 'Sine.easeInOut', true); return wait(ms + 40); },
        snap(tx, ty) { w.following = false; cam.stopFollow(); cam.centerOn(tx * T, ty * T); },
        async follow(ms = 600) {
          cam.pan(w.player.x, w.player.y, ms, 'Sine.easeInOut', true);
          await wait(ms + 40);
          cam.startFollow(w.player.sprite, true, 0.15, 0.15);
          w.following = true;
        },
        shake(ms = 200, amount = 0.006) { cam.shake(ms, amount); },
        flash(ms = 150) { cam.flash(ms, 255, 255, 255); },
        fadeOut(ms = 400) { cam.fadeOut(ms, 0, 0, 0); return wait(ms + 40); },
        fadeIn(ms = 400) { cam.fadeIn(ms, 0, 0, 0); return wait(ms + 40); },
      };
    }

    // ------------------------------------------------------------ movement

    tileAt(grid, x, y) {
      const tx = Math.floor(x / T), ty = Math.floor(y / T);
      return grid[ty]?.[tx];
    }

    // Would the player's feet be somewhere they can't stand?
    blockedAt(x, y) {
      const p = this.player;
      const l = x - 8, r = x + 8, t = y - 10, b = y;
      if (l < 0 || t < 0 || r > this.size.w || b > this.size.h) return true;
      for (const [cx, cy] of [[l, t], [r, t], [l, b], [r, b]]) if (this.tileAt(this.solid, cx, cy)) return true;
      for (const bar of this.barriers.values()) {
        if (bar.on && l < bar.r && r > bar.l && t < bar.b && b > bar.t) { this.bump = bar.bump; return true; }
      }
      for (const a of this.actors.values()) {
        // Someone following at your heel never gets in your way.
        if (a === p || a.hidden || !a.solid || a.trail) continue;
        const now = Math.hypot(a.x - p.x, a.y - p.y), next = Math.hypot(a.x - x, a.y - y);
        if (next < BODY && next < now) return true;
      }
      return false;
    }

    movePlayer(dt) {
      const p = this.player;
      let dx = (input.held('right') ? 1 : 0) - (input.held('left') ? 1 : 0);
      let dy = (input.held('down') ? 1 : 0) - (input.held('up') ? 1 : 0);
      p.moving = dx !== 0 || dy !== 0;
      if (!p.moving) return;
      p.dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
      if (dx && dy) { dx *= 0.7071; dy *= 0.7071; }
      const speed = (p.wading ? WADE : WALK) * this.pace;
      const nx = p.x + dx * speed * dt;
      if (!this.blockedAt(nx, p.y)) p.x = nx;
      const ny = p.y + dy * speed * dt;
      if (!this.blockedAt(p.x, ny)) p.y = ny;
    }

    tickActor(a, dt) {
      if (a.patrol && !a.path.length && !a.hidden) {
        a.patrol.wait -= dt;
        if (a.patrol.wait <= 0) {
          const walk = a.patrol;
          a.path = [walk.points[walk.i]];
          a.speed = walk.speed;
          walk.i += walk.step;
          if (walk.i >= walk.points.length || walk.i < 0) { walk.step *= -1; walk.i += walk.step * 2; }
          walk.wait = walk.pause;
        }
      }
      if (a.cone) {
        a.cone.setVisible(!!this.stealth && !a.hidden);
        a.cone.setPosition(Math.round(a.x), Math.round(a.y - 20)).setRotation(FACING[a.dir]);
      }
      const lead = a.trail === true ? this.player : a.trail ? this.actors.get(a.trail) : null;
      if (lead && !a.path.length && !a.hidden) {
        const p = lead;
        const dx = p.x - a.x, dy = p.y - a.y, dist = Math.hypot(dx, dy);
        if (dist > 260) {
          a.x = p.x - 24; a.y = p.y; a.moving = false;
        } else if (dist > HEEL) {
          const step = Math.min(dist - HEEL + 2, WALK * 1.6 * dt);
          a.x += (dx / dist) * step; a.y += (dy / dist) * step;
          a.moving = true;
          a.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        } else a.moving = false;
      }
      if (a.path.length) {
        const target = a.path[0];
        const dx = target.x - a.x, dy = target.y - a.y;
        const dist = Math.hypot(dx, dy), step = a.speed * dt;
        if (dist <= step) {
          a.x = target.x; a.y = target.y;
          a.path.shift();
          if (!a.path.length) { a.moving = false; const done = a.done; a.done = null; done?.(); }
        } else {
          a.x += (dx / dist) * step; a.y += (dy / dist) * step;
          a.moving = true;
          a.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        }
      }

      let frame = 0;
      if (a.moving) {
        a.animT += dt;
        frame = [1, 0, 2, 0][Math.floor(a.animT / 0.14) % 4];
        if (frame && frame !== a.frame && a.stomp) this.cameras.main.shake(110, 0.004);
      } else a.animT = 0;
      a.frame = frame;

      const wading = !!this.tileAt(this.water, a.x, a.y - 3);
      if (wading !== a.wading) {
        a.wading = wading;
        if (wading) a.sprite.setCrop(0, 0, CW, FEET_Y - 9); else a.sprite.setCrop();
      }

      const side = a.dir === 'left' || a.dir === 'right';
      a.sprite.setFrame((side ? 'side' : a.dir) + frame);
      a.sprite.setFlipX(a.dir === 'left');
      a.sprite.setPosition(Math.round(a.x), Math.round(a.y + (a.wading ? 5 : 0)));
      a.sprite.setDepth(a.y);
      a.sprite.setVisible(!a.hidden);
      if (a.shadow) a.shadow.setPosition(a.sprite.x, a.sprite.y - 1).setVisible(!a.hidden && !a.wading && a.sprite.visible);
    }

    // Has a watchful soldier seen the player out in the open?
    watchForPlayer() {
      const p = this.player;
      if (this.tileAt(this.cover, p.x, p.y - 3)) { this.lastCover = { x: p.x, y: p.y }; return; }
      for (const a of this.actors.values()) {
        if (!a.watch || a.hidden) continue;
        const dx = p.x - a.x, dy = p.y - a.y;
        if (Math.hypot(dx, dy) > a.watch.range) continue;
        const turn = Math.atan2(dy, dx) - FACING[a.dir];
        if (Math.abs(Math.atan2(Math.sin(turn), Math.cos(turn))) < a.watch.half) return this.spotted();
      }
    }

    async spotted() {
      const back = this.lastCover || this.stealth.start;
      this.locks++;
      this.api.note(this.api.text(this.stealth.scene), 2200);
      await this.api.fadeOut(180);
      if (back) { this.player.x = back.x; this.player.y = back.y; }
      await this.api.fadeIn(220);
      this.locks--;
    }

    // ---------------------------------------------------------- interaction

    nearest() {
      const p = this.player;
      let best = null, bestD = Infinity;
      const consider = (thing, x, y, reach = REACH) => {
        const d = Math.hypot(x - p.x, y - p.y);
        if (d < reach && d < bestD) { best = thing; bestD = d; }
      };
      for (const a of this.actors.values()) {
        if (a === p || a.hidden || a.trail) continue;
        if (a.chat || a.onUse || this.trigger?.talk === a.id || this.trigger?.choose?.includes(a.id)) consider(a, a.x, a.y);
      }
      for (const o of this.props.values()) if (o.onUse) consider(o, o.px, o.py, o.reach);
      // A companion at your heel is only offered when nothing else is in reach.
      if (!best) for (const a of this.actors.values()) if (a.trail && !a.hidden && a.onUse) consider(a, a.x, a.y);
      // Whoever (or whatever) the goal points at wins over anything standing nearer.
      const wantId = this.trigger?.talk || this.markerId;
      const want = wantId && (this.actors.get(wantId) || this.props.get(wantId));
      if (want && !want.hidden && (want.onUse || want.chat || this.trigger?.talk === want.id)) {
        const d = Math.hypot((want.px ?? want.x) - p.x, (want.py ?? want.y) - p.y);
        if (d < (want.reach || REACH)) return want;
      }
      return best;
    }

    async use(thing) {
      const p = this.player;
      const isActor = this.actors.get(thing.id) === thing;
      const tx = isActor ? thing.x : thing.px, ty = isActor ? thing.y : thing.py;
      const dx = tx - p.x, dy = ty - p.y;
      p.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      if (isActor && !thing.moving) {
        thing.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'left' : 'right') : (dy > 0 ? 'up' : 'down');
      }
      if (isActor && this.trigger?.talk === thing.id) return this.fire();
      if (isActor && this.trigger?.choose?.includes(thing.id)) return this.fire(thing.id);
      this.locks++;
      try {
        if (thing.onUse) await thing.onUse(this.api, thing);
        else if (thing.chat) await this.api.say(thing.chat);
      } finally {
        this.locks--;
      }
    }

    drawPointers(target, time) {
      const bob = Math.round(Math.sin(time / 180) * 2);
      if (target) {
        // Things lying on the ground are underfoot, so point from above the player instead.
        const over = target.def?.flat ? this.player : target;
        const top = over.sprite.getTopCenter();
        this.bubble.setPosition(Math.round(top.x), Math.round(top.y) + (over.headroom || 0) - 10 + bob).setVisible(true);
      } else this.bubble.setVisible(false);

      const goal = this.markerId && (this.actors.get(this.markerId) || this.props.get(this.markerId));
      if (goal && goal !== target && !goal.hidden && this.locks === 0) {
        const top = goal.sprite.getTopCenter();
        this.marker.setPosition(Math.round(top.x), Math.round(top.y) + (goal.headroom || 0) - 8 + bob * 2).setVisible(true);
      } else this.marker.setVisible(false);

      let hint = '';
      // A quiet note steps aside for a prompt, but not for a companion that is always at your heel.
      if (this.note && time < this.noteUntil && !(this.noteQuiet && target && !target.trail)) hint = this.note;
      else if (target && this.trigger?.choose?.includes(target.id)) hint = `Space: choose ${target.name}`;
      else if (target) hint = `Space: ${target.label || `talk to ${target.name}`}`;
      if (hint !== this.hint) { this.hint = hint; ui.setHint(hint); }
    }

    update(time, delta) {
      const dt = Math.min(delta, 50) / 1000;
      const free = this.locks === 0 && !ui.blocking();
      this.bump = null;
      if (free) this.movePlayer(dt); else this.player.moving = false;
      for (const a of this.actors.values()) this.tickActor(a, dt);

      let target = null;
      const act = input.took('act'), journal = input.took('journal');
      if (free && this.stealth) this.watchForPlayer();
      if (free && this.trigger?.zone) {
        const [x1, y1, x2, y2] = this.trigger.zone, p = this.player;
        if (p.x >= x1 * T && p.x < (x2 + 1) * T && p.y >= y1 * T && p.y < (y2 + 1) * T) this.fire();
      }
      if (free) {
        target = this.nearest();
        if (act && target && ui.sinceClosed() > 200) { this.use(target); target = null; }
        else if (journal) ui.openJournal();
        else if (this.bump && time - this.lastBump > 2500) {
          this.lastBump = time;
          this.locks++;
          this.api.say(this.bump).then(() => { this.locks--; });
        }
      }
      this.drawPointers(target, time);
    }
  }

  return new World();
}
