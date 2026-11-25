// Verse Builder: a verse is cut into pieces and shuffled. Tap the pieces in
// the right order to put it back together.
//
// The verses come from the "game_verses" lines in dialogue.csv, so they are
// checked word-for-word like every other quote. Add a line there to add a verse.

const stars = n => '★'.repeat(n) + '☆'.repeat(3 - n);

// Cut a verse into pieces of a few words each, breaking at punctuation.
export function pieces(text) {
  const out = [];
  let piece = [];
  for (const word of text.replace(/[“”]/g, '').split(/\s+/).filter(Boolean)) {
    piece.push(word);
    if (/[,;.!?:]$/.test(word) || piece.length >= 4) { out.push(piece.join(' ')); piece = []; }
  }
  if (piece.length) out.push(piece.join(' '));
  // A piece of one word is too easy to lose; join it to the piece before.
  for (let i = out.length - 1; i > 0; i--) {
    if (!out[i].includes(' ')) { out[i - 1] += ` ${out[i]}`; out.splice(i, 1); }
  }
  return out;
}

function shuffle(list) {
  const out = list.slice();
  do {
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
  } while (out.length > 1 && out.every((piece, i) => piece === list[i]));
  return out;
}

export const verses = {
  id: 'verses',
  story: 'shepherd',
  intro: 'game_verses_intro',
  // "total" is how many verses the finished stories offer so far.
  status(save, total) {
    return save.data.verses.length ? `${save.data.verses.length} of ${total} built` : null;
  },

  // env: { ui, save, reward, verses, text(sceneId) }. The verses come from every finished story.
  async play(env) {
    const { ui, save, reward } = env;
    const list = env.verses;
    const start = await ui.card({
      kicker: 'Mini-game', title: reward.name, lines: env.text('game_verses_intro'),
      buttons: [{ id: 'play', label: 'Start', primary: true }, { id: 'back', label: 'Back' }],
    });
    if (start !== 'play') return;

    // Begin with the first verse not yet built, then carry on round the list.
    let at = Math.max(0, list.findIndex(v => !save.data.verses.includes(v.ref)));
    for (;;) {
      const verse = list[at % list.length];
      const parts = pieces(verse.text);
      const result = await ui.puzzle({
        kicker: `Verse ${(at % list.length) + 1} of ${list.length}`, ref: verse.ref,
        pieces: parts, shuffled: shuffle(parts), full: verse.text,
      });
      if (!result) return;
      if (!save.data.verses.includes(verse.ref)) { save.data.verses.push(verse.ref); save.write(); }

      const slips = result.mistakes;
      const next = await ui.card({
        kicker: reward.name,
        title: slips === 0 ? 'Word for word!' : 'You built it!',
        stats: [
          { value: String(slips), label: slips === 1 ? 'slip' : 'slips' },
          { value: stars(slips === 0 ? 3 : slips <= 2 ? 2 : 1), label: 'rating' },
          { value: `${save.data.verses.length} of ${list.length}`, label: 'verses built' },
        ],
        lines: [verse],
        buttons: [{ id: 'again', label: 'Next verse', primary: true }, { id: 'back', label: 'Back to the device' }],
      });
      if (next !== 'again') return;
      at++;
    }
  },
};
