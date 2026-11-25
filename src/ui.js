// Everything the player reads: conversations, goals, the journal and the
// menu screens. These are ordinary web page elements laid over the game.

import { OPTIONS, AVATARS, withAvatar, drawCharacter, CW, CH } from './art.js';
import { dress } from './rewards.js';
import { mapView } from './mapview.js';

function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid) el.append(kid);
  return el;
}

const REWARD_KINDS = { game: 'Mini-game', wear: 'To wear', pet: 'Companion' };

export function createUI(root, voice) {
  const goalEl = h('div', { class: 'goal', hidden: true });
  const taskEl = h('div', { class: 'task', hidden: true });
  const hintEl = h('div', { class: 'hint', hidden: true });
  const voiceBtn = h('button', { class: 'corner-btn', type: 'button', hidden: !voice.available });
  const journalBtn = h('button', { class: 'corner-btn', type: 'button' }, 'Journal ', h('kbd', { text: 'J' }));
  const leaveBtn = h('button', { class: 'corner-btn', type: 'button', hidden: true }, 'Leave ', h('kbd', { text: 'Esc' }));
  const hudEl = h('div', { class: 'hud', hidden: true },
    h('div', { class: 'goals' }, goalEl, taskEl), h('div', { class: 'corner' }, voiceBtn, journalBtn, leaveBtn), hintEl);
  const darkEl = h('div', { class: 'dark', hidden: true });
  // Night, stars and rain, laid over the world.
  const skyEl = h('div', { class: 'sky' }, h('div', { class: 'sky-night' }), h('div', { class: 'sky-stars' }), h('div', { class: 'sky-rain' }));
  const speakerEl = h('span', { class: 'dlg-speaker' });
  const refEl = h('span', { class: 'dlg-ref' });
  const textEl = h('div', { class: 'dlg-text' });
  const dialogueEl = h('div', { class: 'dialogue', hidden: true },
    h('div', { class: 'dlg-head' }, speakerEl, refEl), textEl, h('div', { class: 'dlg-next', text: '▶' }));
  const toastsEl = h('div', { class: 'toasts' });
  const journalEl = h('div', { class: 'journal', hidden: true });
  const screenEl = h('div', { class: 'screen', hidden: true });
  // Shown while the next screen or story is getting ready, so it is never a black screen.
  const loadingMsg = h('div', { class: 'loading-msg' });
  const loadingEl = h('div', { class: 'loading', hidden: true },
    h('div', { class: 'loading-ring' }, h('div', { class: 'loading-core', text: '⏳' })),
    h('div', { class: 'loading-trail' }, h('span', { text: '🐑' }), h('span', { text: '🐪' }), h('span', { text: '🐑' }), h('span', { text: '🕊️' })),
    loadingMsg);
  root.replaceChildren(skyEl, hudEl, darkEl, dialogueEl, toastsEl, journalEl, screenEl, loadingEl);

  // ----------------------------------------------------------- read aloud

  const voiceLabel = () => `Read aloud: ${voice.on ? 'On' : 'Off'}`;
  const showVoice = () => voiceBtn.replaceChildren(voiceLabel() + ' ', h('kbd', { text: 'V' }));
  const toggleVoice = () => { voice.toggle(); showVoice(); return voice.on; };
  voiceBtn.addEventListener('click', () => { voiceBtn.blur(); toggleVoice(); });
  showVoice();

  // ------------------------------------------------------- conversations

  const dlg = { queue: [], resolve: null, shownAt: 0 };
  let lastClosed = 0;

  function showLine(line) {
    dialogueEl.dataset.kind = line.kind;
    const fromBible = line.kind === 'quote';
    const label = { quote: 'From the Bible', note: 'Did you know?', think: 'Think about it' }[line.kind] || '';
    speakerEl.textContent = line.speaker || label;
    refEl.textContent = fromBible && line.ref ? line.ref : '';
    textEl.textContent = line.text;
    dlg.shownAt = performance.now();
    voice.speak(line.text, { who: line.speaker || (line.kind === 'think' ? 'Think about it' : ''), spoken: line.spoken });
  }

  function advance() {
    if (dialogueEl.hidden || performance.now() - dlg.shownAt < 180) return;
    const next = dlg.queue.shift();
    if (next) return showLine(next);
    dialogueEl.hidden = true;
    lastClosed = performance.now();
    voice.hush();
    const done = dlg.resolve;
    dlg.resolve = null;
    done?.();
  }
  dialogueEl.addEventListener('click', advance);

  // Drop a conversation part-way, when the player leaves the scene altogether.
  function closeDialogue() {
    dlg.queue = [];
    dlg.resolve = null;
    dialogueEl.hidden = true;
    voice.hush();
  }

  function say(lines, { top = false } = {}) {
    return new Promise(resolve => {
      dialogueEl.classList.toggle('top', top);
      dlg.queue = lines.slice();
      dlg.resolve = resolve;
      dialogueEl.hidden = false;
      showLine(dlg.queue.shift());
    });
  }

  // --------------------------------------------------------------- journal

  let journalSource = null;

  function openJournal() {
    if (!journalSource || !dialogueEl.hidden || !screenEl.hidden) return;
    const { title, badges } = journalSource();
    const found = badges.filter(b => b.found).length;
    journalEl.replaceChildren(
      h('div', { class: 'journal-head' },
        h('div', {}, h('div', { class: 'kicker', text: 'Journal' }), h('h2', { text: title })),
        h('div', { class: 'journal-count', text: `${found} of ${badges.length} discoveries` }),
        h('button', { type: 'button', onclick: closeJournal }, 'Close')),
      h('div', { class: 'badge-grid' }, badges.map(b => b.found
        ? h('div', { class: 'badge found' },
          h('div', { class: 'badge-title', text: b.title }),
          h('div', { class: 'badge-text', text: b.text }),
          b.ref ? h('div', { class: 'badge-ref', text: b.ref }) : null)
        : h('div', { class: 'badge' }, h('div', { class: 'badge-q', text: '?' }), h('div', { class: 'badge-text', text: 'Not found yet' })))),
    );
    journalEl.hidden = false;
  }
  function closeJournal() {
    journalEl.hidden = true;
    lastClosed = performance.now();
  }
  journalBtn.addEventListener('click', () => { journalBtn.blur(); openJournal(); });

  // Small notices that stack in the corner and clear themselves.
  function toast({ kicker = 'Discovery!', title, sub = 'Added to your journal', reward = false }) {
    const el = h('div', { class: reward ? 'toast reward' : 'toast' },
      h('div', { class: 'kicker', text: kicker }),
      h('div', { class: 'toast-title', text: title }),
      h('div', { class: 'toast-sub', text: sub }));
    toastsEl.append(el);
    setTimeout(() => el.remove(), reward ? 5200 : 3600);
  }

  // --------------------------------------------------------------- screens

  // Keys pressed while a screen is open go to it, if it wants them.
  let screenKeys = null;
  // Which map the time device shows, and what is chosen on it, kept between visits.
  const mapState = { level: 'world', arc: null, picked: {} };

  function screen(build) {
    return new Promise(resolve => {
      const done = value => { voice.hush(); screenKeys = null; screenEl.hidden = true; screenEl.replaceChildren(); resolve(value); };
      screenEl.replaceChildren(build(done));
      screenEl.hidden = false;
      screenEl.scrollTop = 0;
      // Put the keyboard on the main button, so Enter or Space presses it.
      screenEl.querySelector('button.primary')?.focus();
    });
  }

  function title({ canContinue, tester = false }) {
    return screen(done => {
      let armed = false;
      const fresh = h('button', {
        type: 'button', class: canContinue ? '' : 'primary',
        onclick() {
          if (canContinue && !armed) { armed = true; fresh.textContent = 'Erase saved game?'; return; }
          done('new');
        },
      }, 'New game');
      const reading = h('button', { type: 'button', class: 'quiet', onclick() { toggleVoice(); reading.textContent = voiceLabel(); } }, voiceLabel());
      return h('div', { class: 'panel title-screen' },
        h('div', { class: 'kicker', text: 'Prototype' }),
        h('h1', { text: 'Bible Adventure' }),
        h('p', { class: 'sub', text: 'Step into the story.' }),
        h('div', { class: 'btn-row' },
          canContinue ? h('button', { type: 'button', class: 'primary', onclick: () => done('continue') }, 'Continue') : null,
          fresh),
        canContinue ? h('div', { class: 'btn-row' }, h('button', { type: 'button', onclick: () => done('intro') }, 'Watch the beginning')) : null,
        voice.available ? h('div', { class: 'btn-row' }, reading) : null,
        h('p', { class: 'fine' }, 'Working title and placeholder art. ',
          h('button', { type: 'button', class: 'link', onclick: () => done('code') }, tester ? 'Tester mode is on' : 'Tester code')));
    });
  }

  // A question with a typed answer. Answers with the text, or null for Cancel.
  function ask({ title: heading, placeholder = '' }) {
    return screen(done => {
      const input = h('input', { type: 'text', placeholder, autocomplete: 'off', onkeydown: e => { if (e.key === 'Enter') done(input.value); if (e.key === 'Escape') done(null); } });
      setTimeout(() => input.focus(), 0);
      return h('div', { class: 'panel card' },
        h('h2', { text: heading }),
        h('div', { class: 'btn-row' }, input),
        h('div', { class: 'btn-row' },
          h('button', { type: 'button', class: 'primary', onclick: () => done(input.value) }, 'OK'),
          h('button', { type: 'button', onclick: () => done(null) }, 'Cancel')));
    });
  }

  // The character screen. With "extras" it is also the wardrobe, where earned
  // clothing, items and companions can be chosen.
  function creator(start, { heading = 'Who is traveling?', extras = null, skippable = false } = {}) {
    return screen(done => {
      // A look from before travelers were chosen from a list gets the closest match.
      const same = a => a.skin === start.look.skin && a.hairStyle === start.look.hairStyle && a.hair === start.look.hair;
      const look = start.look.avatar == null ? withAvatar(start.look, Math.max(0, AVATARS.findIndex(same))) : { ...start.look };
      const preview = h('canvas', { width: CW, height: CH });
      const ctx = preview.getContext('2d');
      let frame = 0;
      const draw = () => { ctx.clearRect(0, 0, CW, CH); drawCharacter(ctx, 0, 0, dress(look), 'down', [0, 1, 0, 2][frame % 4]); };
      const timer = setInterval(() => { frame++; draw(); }, 280);
      const name = h('input', { type: 'text', maxlength: 12, placeholder: 'Your name', value: start.name || '', autocomplete: 'off' });

      // Cycle through the travelers with the arrows beside the picture, or the arrow keys.
      const count = h('div', { class: 'avatar-count' });
      const cycle = step => { Object.assign(look, withAvatar(look, look.avatar + step)); refresh(); };
      const arrow = (step, text, label) => h('button', { type: 'button', class: 'cycle', 'aria-label': label, 'data-cycle': step, onclick: () => cycle(step) }, text);
      const onKey = e => {
        if (e.target.tagName === 'INPUT' || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
        cycle(e.key === 'ArrowLeft' ? -1 : 1);
      };
      document.addEventListener('keydown', onKey);

      const rows = [];
      const refresh = () => {
        for (const { key, buttons, values } of rows) buttons.forEach((b, i) => b.classList.toggle('on', values[i] === (look[key] ?? null)));
        count.textContent = `Traveler ${look.avatar + 1} of ${AVATARS.length}`;
        draw();
      };
      const row = (key, label, options, swatch) => {
        const buttons = options.map(o => h('button', {
          type: 'button', class: swatch ? 'swatch' : o.locked ? 'chip locked' : 'chip', style: swatch ? `background:${o.value}` : null,
          'aria-label': `${label}: ${o.label}`, disabled: !!o.locked,
          onclick() { look[key] = o.value; refresh(); },
        }, swatch ? '' : o.label, o.locked ? h('small', { text: o.needs }) : null));
        rows.push({ key, buttons, values: options.map(o => o.value) });
        return h('div', { class: 'opt' }, h('span', { text: label }), h('div', { class: 'choices' }, buttons));
      };
      const basic = (key, label, swatch) => row(key, label, OPTIONS[key].map(value => ({ value, label: value })), swatch);

      const me = [h('label', { class: 'opt' }, h('span', { text: 'Name' }), name)];
      const clothes = [basic('top', 'Shirt', true), basic('bottom', 'Pants', true)];

      let body;
      if (extras) {
        const extra = (page, test) => extras.filter(e => e.page === page && test(e)).map(e => row(e.key, e.label, e.options, false));
        const pages = {
          Me: h('div', { class: 'options' }, me, extra('Me', () => true)),
          Clothes: h('div', { class: 'options' }, extra('Clothes', e => e.key === 'outfit'), clothes, extra('Clothes', e => e.key !== 'outfit')),
        };
        const tabs = Object.keys(pages).map(label => h('button', { type: 'button', class: 'tab', onclick: () => show(label) }, label));
        const show = label => Object.keys(pages).forEach((l, i) => { pages[l].hidden = l !== label; tabs[i].classList.toggle('on', l === label); });
        show('Clothes');
        body = h('div', { class: 'pages' }, h('div', { class: 'tabs' }, tabs), Object.values(pages));
      } else {
        body = h('div', { class: 'options' }, me, clothes);
      }

      const finish = (skipIntro = false) => { clearInterval(timer); document.removeEventListener('keydown', onKey); done({ name: name.value.trim() || 'Traveler', look, ...(skippable ? { skipIntro } : {}) }); };
      const pick = list => list[Math.floor(Math.random() * list.length)];
      const el = h('div', { class: 'panel creator' },
        h('h2', { text: heading }),
        h('div', { class: 'creator-body' },
          h('div', { class: 'preview' }, h('div', { class: 'avatar-pick' }, arrow(-1, '◀', 'Previous traveler'), preview, arrow(1, '▶', 'Next traveler')), count),
          body),
        h('div', { class: 'btn-row' },
          h('button', {
            type: 'button',
            onclick() {
              for (const k of Object.keys(OPTIONS)) look[k] = pick(OPTIONS[k]);
              Object.assign(look, withAvatar(look, Math.floor(Math.random() * AVATARS.length)));
              refresh();
            },
          }, 'Surprise me'),
          skippable ? h('button', { type: 'button', onclick: () => finish(true) }, 'Skip the opening') : null,
          h('button', { type: 'button', class: 'primary', onclick: () => finish(false) }, extras ? 'Done' : 'Ready')));
      refresh();
      return el;
    });
  }

  // The time device: the hub between stories. It answers with what the player
  // chose: { type: 'story' | 'game' | 'wardrobe', id, tab }.
  function device({ name, look, arcs, rewards, found, total, next, tab = 'stories', firstVisit = false, tester = false }) {
    return screen(finish => {
      let current = tab;
      const done = action => finish({ ...action, tab: current });
      // The very first visit starts on the world map; after that, where the player left off.
      if (firstVisit && !mapState.seen) mapState.level = 'world';
      mapState.seen = true;
      // Until the player has chosen an arc, the map starts at the first one in Bible order.
      mapState.arc ||= arcs.find(a => !a.later)?.id;
      const map = mapView({ state: mapState, arcs, look: dress(look), tester, onPlay: (id, step) => done({ type: 'story', id, step }) });
      window.__map = map;   // for the robot play-tester
      const storyList = map.el;
      screenKeys = key => current === 'stories' && map.key(key);

      const rewardList = h('div', { class: 'reward-list' }, rewards.map(r => {
        const kind = REWARD_KINDS[r.type];
        if (r.locked) {
          return h('div', { class: 'reward locked' },
            h('div', { class: 'reward-kind', text: kind }),
            h('div', { class: 'dest-title', text: r.name }),
            h('div', { class: 'dest-meta', text: r.needs }));
        }
        const action = r.type === 'game' ? { type: 'game', id: r.id } : { type: 'wardrobe' };
        return h('button', { type: 'button', class: 'reward', 'data-reward': r.id, onclick: () => done(action) },
          h('div', { class: 'reward-kind', text: kind }),
          h('div', { class: 'dest-title', text: r.name }),
          h('div', { class: 'dest-prog', text: r.type === 'game' ? (r.best ? `Play · ${r.best}` : 'Play') : 'Open the wardrobe' }));
      }));

      const pages = { stories: storyList, rewards: rewardList };
      const earned = rewards.filter(r => !r.locked).length;
      const tabs = [
        h('button', { type: 'button', class: 'tab', 'data-tab': 'stories', onclick: () => show('stories') }, 'Map'),
        h('button', { type: 'button', class: 'tab', 'data-tab': 'rewards', onclick: () => show('rewards') }, `Rewards ${earned} of ${rewards.length}`),
      ];
      const show = which => {
        current = which;
        Object.keys(pages).forEach((key, i) => { pages[key].hidden = key !== which; tabs[i].classList.toggle('on', key === which); });
      };
      show(tab);

      return h('div', { class: 'panel device' },
        h('div', { class: 'device-top' }, h('span', { class: 'led' }), `Time device · linked to ${name}`,
          tester ? h('span', { class: 'tester' }, 'Tester mode ', h('button', { type: 'button', class: 'link', onclick: () => done({ type: 'tester-off' }) }, 'turn off')) : null),
        h('div', { class: 'device-bar' },
          h('div', { class: 'tabs' }, tabs),
          h('button', { type: 'button', class: 'tab', onclick: () => done({ type: 'wardrobe' }) }, 'Wardrobe')),
        h('div', { class: 'device-progress' },
          h('strong', { text: `${found} of ${total} discoveries` }),
          next ? ` · Next reward at ${next.discoveries}: ${next.name}` : ''),
        storyList, rewardList);
    });
  }

  // A simple card: a heading, some lines, optional numbers, and buttons.
  // Used before and after mini-games. Answers with the id of the button pressed.
  function card({ kicker, title: heading, lines = [], stats = [], buttons, stack = false }) {
    voice.speak([heading, ...lines.map(l => l.text)].map(t => (/[.!?…]$/.test(t) ? t : `${t}.`)).join(' '));
    const shown = performance.now();
    return screen(done => h('div', { class: 'panel card' },
      kicker ? h('div', { class: 'kicker', text: kicker }) : null,
      h('h2', { text: heading }),
      stats.length ? h('div', { class: 'stats' }, stats.map(s => h('div', { class: 'stat' },
        h('div', { class: 'stat-value', text: s.value }), h('div', { class: 'stat-label', text: s.label })))) : null,
      lines.map(l => l.kind === 'quote'
        ? h('blockquote', { class: 'truth' }, l.text, h('cite', { text: l.ref }))
        : h('p', { class: `card-line ${l.kind}`, text: l.text })),
      h('div', { class: stack ? 'btn-row stack' : 'btn-row' }, buttons.map(b => h('button', {
        type: 'button', class: b.primary ? 'primary' : '', 'data-id': b.id,
        onclick: () => { if (performance.now() - shown > 300) done(b.id); },
      }, b.label)))));
  }

  // The verse puzzle: tap the pieces of a verse in the right order.
  // Answers with { mistakes }, or null if the player backed out.
  function puzzle({ kicker, ref, pieces, shuffled, full }) {
    return screen(done => {
      let next = 0, mistakes = 0;
      const built = h('span', { class: 'verse-built' });
      const refresh = () => built.replaceChildren(pieces.slice(0, next).join(' '), next < pieces.length ? h('span', { class: 'verse-gap', text: next ? ' …' : 'Tap the first words' }) : '');
      const buttons = shuffled.map(text => {
        const b = h('button', {
          type: 'button', class: 'piece',
          onclick() {
            if (text !== pieces[next]) {
              mistakes++;
              b.classList.remove('wrong');
              void b.offsetWidth;   // restart the shake
              b.classList.add('wrong');
              return;
            }
            next++;
            b.disabled = true;
            refresh();
            if (next === pieces.length) done({ mistakes });
          },
        }, text);
        return b;
      });
      refresh();
      window.__puzzle = { pieces, buttons, get mistakes() { return mistakes; } };   // for the robot play-tester
      return h('div', { class: 'panel puzzle' },
        h('div', { class: 'kicker', text: kicker }),
        h('h2', { text: 'Put the words back in order' }),
        h('blockquote', { class: 'truth' }, built, h('cite', { text: ref })),
        h('div', { class: 'pieces' }, buttons),
        h('div', { class: 'btn-row' },
          voice.available ? h('button', { type: 'button', onclick: () => voice.speak(full, { force: true }) }, 'Hear it') : null,
          h('button', { type: 'button', onclick: () => done(null) }, 'Back')));
    });
  }

  function end({ title: storyTitle, truth, think = null, fromBible, imagined, leftOut, found, total, newRewards = [], newStories = [] }) {
    const list = items => h('ul', {}, items.map(t => h('li', { text: t })));
    voice.speak(truth.text, { spoken: truth.spoken });
    return screen(done => h('div', { class: 'panel end' },
      h('div', { class: 'kicker', text: 'Story complete' }),
      h('h2', { text: storyTitle }),
      h('blockquote', { class: 'truth' }, truth.text, h('cite', { text: truth.ref })),
      think ? h('p', { class: 'end-think', text: `💡 ${think}` }) : null,
      h('div', { class: 'end-cols' },
        h('section', {}, h('h3', { text: 'From the Bible' }), list(fromBible)),
        h('section', {}, h('h3', { text: 'What we imagined' }), list(imagined))),
      h('p', { class: 'left-out', text: leftOut }),
      h('p', { class: 'end-count', text: `You found ${found} of ${total} discoveries. Play again to find the rest.` }),
      newStories.length ? h('p', { class: 'end-new', text: `New story unlocked: ${newStories.join(', ')}` }) : null,
      newRewards.length ? h('p', { class: 'end-new', text: `New on your device: ${newRewards.join(', ')}` }) : null,
      h('div', { class: 'btn-row' }, h('button', { type: 'button', class: 'primary', onclick: () => done() }, 'Back to the device'))));
  }

  // ------------------------------------------------------------------ misc

  const show = (el, text) => { el.textContent = text || ''; el.hidden = !text; };
  let onLeave = null;
  leaveBtn.addEventListener('click', () => { leaveBtn.blur(); if (onLeave) { closeDialogue(); onLeave(); } });

  const LOADING_LINES = [
    'Winding up the time device…', 'Counting the stars…', 'Herding the sheep…', 'Watering the camels…',
    'Dusting off the scrolls…', 'Sharpening the quill…', 'Packing bread for the journey…', 'Looking for the right century…',
    'Waking up the donkeys…', 'Sweeping the sand off the map…', 'Lighting the lamps…', 'Checking the way to the well…',
  ];
  let loadingTimer = null;
  // On: show the loading screen with a changing line. Off: take it away. Safe to call twice.
  function loading(on) {
    if (!on) { clearInterval(loadingTimer); loadingTimer = null; loadingEl.hidden = true; return; }
    if (!loadingEl.hidden) return;
    let n = Math.floor(Math.random() * LOADING_LINES.length);
    const next = () => { loadingMsg.textContent = LOADING_LINES[n++ % LOADING_LINES.length]; };
    next();
    loadingEl.hidden = false;
    loadingTimer = setInterval(next, 1800);
  }

  return {
    loading, say, title, ask, creator, device, card, puzzle, end, toast, openJournal, toggleVoice,
    setGoal: text => show(goalEl, text),
    setTask: text => show(taskEl, text),
    setHint: text => show(hintEl, text),
    // Say something aloud that is not part of a conversation, such as a new goal.
    announce: (text, interrupt = false) => voice.speak(text, { interrupt }),
    setJournal(source) { journalSource = source; },
    // Stories show the journal button; mini-games show a "Leave" button instead.
    hud(on, { leave = null, label = 'Leave' } = {}) {
      hudEl.hidden = !on;
      onLeave = leave;
      leaveBtn.replaceChildren(`${label} `, h('kbd', { text: 'Esc' }));
      journalBtn.hidden = !!leave;
      leaveBtn.hidden = !leave;
      if (!on) { this.sky(); voice.hush(); toastsEl.replaceChildren(); journalEl.hidden = true; show(goalEl, ''); show(taskEl, ''); show(hintEl, ''); }
    },
    dark(on) { darkEl.hidden = !on; },
    sky({ night = false, stars = false, rain = false } = {}) {
      skyEl.classList.toggle('night', night);
      skyEl.classList.toggle('stars', stars);
      skyEl.classList.toggle('rain', rain);
    },
    blocking: () => !dialogueEl.hidden || !journalEl.hidden || !screenEl.hidden,
    sinceClosed: () => performance.now() - lastClosed,
    // Keys pressed while something is open. Returns true when the key was used.
    key(key, repeat) {
      if (key === 'voice') { if (!repeat) toggleVoice(); return true; }
      // Esc leaves whatever offers a way out, even in the middle of a conversation.
      if (key === 'back' && onLeave && screenEl.hidden) { if (!repeat) { closeDialogue(); onLeave(); } return true; }
      if (!screenEl.hidden) { if (!repeat) screenKeys?.(key); return true; }
      if (!journalEl.hidden) { if (!repeat && key !== 'up' && key !== 'down' && key !== 'left' && key !== 'right') closeJournal(); return true; }
      if (!dialogueEl.hidden) { if (!repeat && key === 'act') advance(); return true; }
      return false;
    },
  };
}
