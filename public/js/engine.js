// Génération des exercices et correction automatique
import { allLessons } from '../data/courses.js';

export const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.floor(Math.random() * a.length)];
export const alts = s => s.split('|').map(x => x.trim()).filter(Boolean);
export const first = s => alts(s)[0];

// ───────── Normalisation & correction ─────────
export function norm(s) {
  return s.toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[.,!?¿¡;:«»"“”()…\-–—/]/g, ' ')
    .replace(/'/g, "' ")
    .replace(/\s+/g, ' ').trim();
}
export const plain = s => norm(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/g, 'oe').replace(/æ/g, 'ae');

export function lev(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i), cur = new Array(n + 1);
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    [prev, cur] = [cur, prev];
  }
  return prev[n];
}

// Compare une réponse saisie à une liste de réponses acceptées.
// Retourne { ok, kind: 'exact'|'accent'|'typo'|'wrong', best }
export function checkText(input, answers) {
  const ni = norm(input), pi = plain(input);
  if (!ni) return { ok: false, kind: 'wrong', best: answers[0] };
  for (const a of answers) if (norm(a) === ni) return { ok: true, kind: 'exact', best: a };
  for (const a of answers) if (plain(a) === pi) return { ok: true, kind: 'accent', best: a };
  let best = answers[0], bd = Infinity;
  for (const a of answers) { const d = lev(plain(a), pi); if (d < bd) { bd = d; best = a; } }
  const len = plain(best).length;
  const allowed = len >= 16 ? 2 : len >= 5 ? 1 : 0;
  if (bd <= allowed) return { ok: true, kind: 'typo', best };
  return { ok: false, kind: 'wrong', best };
}

export const tokens = s => s.replace(/[.,!?¿¡;:«»"]/g, ' ').split(/\s+/).filter(Boolean);

// ───────── Matériel pédagogique ─────────
export function courseMaterial(course) {
  const words = [], sentences = [];
  for (const l of allLessons(course)) {
    l.words.forEach(([tg, src, emoji]) => words.push({ kind: 'w', target: tg, src, emoji, lesson: l }));
    l.sentences.forEach(([tg, src, note]) => sentences.push({ kind: 's', target: tg, src, note, lesson: l }));
  }
  return { words, sentences };
}

function wordDistractors(item, pool, n, field) {
  const bad = new Set(alts(item.src).map(plain).concat(plain(item.target)));
  const out = [], seen = new Set();
  const cands = shuffle(pool.filter(w => w !== item));
  // privilégier les mots de la même leçon
  cands.sort((a, b) => (b.lesson === item.lesson) - (a.lesson === item.lesson));
  for (const w of cands) {
    const val = field === 'src' ? first(w.src) : w.target;
    const key = plain(val);
    if (bad.has(key) || seen.has(key) || alts(w.src).some(x => bad.has(plain(x))) || bad.has(plain(w.target))) continue;
    seen.add(key); out.push(w);
    if (out.length >= n) break;
  }
  return out;
}

// ───────── Fabrique d'exercices ─────────
const ex = {
  image(item, mat) {
    const others = wordDistractors(item, mat.words.filter(w => w.emoji), 3, 'target');
    const opts = shuffle([item, ...others]);
    return { type: 'image', item, prompt: first(item.src), options: opts.map(o => ({ label: o.target, emoji: o.emoji, speak: o.target })), answer: opts.indexOf(item) };
  },
  mcq(item, mat) { // mot cible → sens
    const others = wordDistractors(item, mat.words, 3, 'src');
    const opts = shuffle([item, ...others]);
    return { type: 'mcq', item, prompt: item.target, speakPrompt: true, options: opts.map(o => ({ label: first(o.src) })), answer: opts.indexOf(item) };
  },
  mcqRev(item, mat) { // sens → mot cible
    const others = wordDistractors(item, mat.words, 3, 'target');
    const opts = shuffle([item, ...others]);
    return { type: 'mcqRev', item, prompt: first(item.src), options: opts.map(o => ({ label: o.target, speak: o.target })), answer: opts.indexOf(item) };
  },
  listen(item, mat) {
    const pool = item.kind === 'w' ? mat.words : mat.sentences;
    const others = wordDistractors(item, pool, 3, 'target');
    const opts = shuffle([item, ...others]);
    return { type: 'listen', item, audio: item.target, options: opts.map(o => ({ label: o.target })), answer: opts.indexOf(item) };
  },
  match(items) {
    const pairs = items.slice(0, 5).map(w => ({ target: w.target, src: first(w.src), item: w }));
    return { type: 'match', pairs, left: shuffle(pairs.map((p, i) => ({ i, label: p.target }))), right: shuffle(pairs.map((p, i) => ({ i, label: p.src }))) };
  },
  build(item, mat) {
    const tk = tokens(item.target);
    const own = new Set(tk.map(x => x.toLowerCase()));
    const extra = shuffle([...new Set(mat.sentences.filter(s => s !== item).flatMap(s => tokens(s.target)))].filter(x => !own.has(x.toLowerCase()))).slice(0, Math.min(4, Math.max(2, Math.ceil(tk.length / 2))));
    return { type: 'build', item, prompt: first(item.src), tiles: shuffle([...tk, ...extra]), answers: [item.target] };
  },
  translate(item) { // phrase cible → saisie dans la langue source
    return { type: 'translate', item, prompt: item.target, speakPrompt: true, answers: alts(item.src) };
  },
  fill(item, mat) {
    const tk = tokens(item.target);
    const lessonWords = new Set(mat.words.filter(w => !w.target.includes(' ')).map(w => w.target.toLowerCase()));
    let idx = tk.findIndex(x => lessonWords.has(x.toLowerCase()));
    if (idx < 0) idx = tk.reduce((bi, x, i) => (x.length > tk[bi].length ? i : bi), 0);
    const answer = tk[idx];
    const pool = [...new Set([...mat.words.filter(w => !w.target.includes(' ')).map(w => w.target), ...mat.sentences.flatMap(s => tokens(s.target))])]
      .filter(x => x.toLowerCase() !== answer.toLowerCase() && x.length > 1);
    // distracteurs de longueur proche
    const others = shuffle(pool).sort((a, b) => Math.abs(a.length - answer.length) - Math.abs(b.length - answer.length)).slice(0, 8);
    const opts = shuffle([answer, ...shuffle(others).slice(0, 3)]);
    // reconstruire la phrase avec un trou, en gardant la ponctuation d'origine
    let count = -1;
    const display = item.target.replace(/[^\s.,!?¿¡;:«»"]+/g, m => (++count === idx ? '____' : m));
    return { type: 'fill', item, display, hint: first(item.src), options: opts.map(o => ({ label: o })), answer: opts.indexOf(answer) };
  },
  dictation(item) {
    return { type: 'dictation', item, audio: item.target, answers: [item.target] };
  },
  speak(item) {
    return { type: 'speak', item, prompt: item.target, hint: first(item.src), answers: [item.target] };
  },
};

// Construit une leçon (~12 exercices) à partir de son contenu
export function buildLesson(lesson, course, opts) {
  const mat = courseMaterial(course);
  const W = mat.words.filter(w => w.lesson.id === lesson.id);
  const S = mat.sentences.filter(s => s.lesson.id === lesson.id);
  const audio = opts.audio, speech = opts.speech;
  const w = i => W[i % W.length], s = i => S[i % S.length];
  const seq = [
    ex.image(w(0), mat),
    ex.mcq(w(1), mat),
    ex.image(w(2), mat),
    audio ? ex.listen(w(3), mat) : ex.mcqRev(w(3), mat),
    ex.mcqRev(w(4), mat),
    ex.match(shuffle(W)),
    ex.build(s(0), mat),
    ex.image(w(5), mat),
    ex.fill(s(1), mat),
    ex.translate(s(2)),
    ex.build(s(3), mat),
    audio ? ex.dictation(pick(S.filter(x => x.target.length < 40)) || s(0)) : ex.fill(s(3), mat),
  ];
  if (S[4]) seq.push(Math.random() < 0.5 ? ex.translate(S[4]) : ex.build(S[4], mat));
  if (speech) seq.push(ex.speak(pick(S)));
  return seq;
}

// Session de révision à partir d'éléments SRS
export function buildReview(items, course, opts) {
  const mat = courseMaterial(course);
  const out = [];
  for (const it of items.slice(0, 12)) {
    const src = (it.kind === 'w' ? mat.words : mat.sentences).find(x => x.target === it.target);
    if (!src) continue;
    if (src.kind === 'w') {
      const choices = [ex.mcq, ex.mcqRev]; if (opts.audio) choices.push(ex.listen); if (src.emoji) choices.push(ex.image);
      out.push(pick(choices)(src, mat));
    } else {
      const choices = [ex.build, ex.translate, ex.fill]; if (opts.audio) choices.push(ex.dictation);
      out.push(pick(choices)(src, mat));
    }
  }
  return out;
}

// Test de niveau : 2 questions par unité, de la plus facile à la plus difficile
export function buildPlacement(course) {
  const mat = courseMaterial(course);
  const out = [];
  course.units.forEach((u, ui) => {
    const ws = shuffle(mat.words.filter(w => w.lesson.unit === u));
    const ss = shuffle(mat.sentences.filter(s => s.lesson.unit === u));
    const a = ex.mcqRev(ws[0], mat); a.unitIndex = ui; out.push(a);
    const b = (ui % 2 ? ex.translate(ss[0]) : ex.build(ss[0], mat)); b.unitIndex = ui; out.push(b);
    if (ss[1]) { const c = ex.fill(ss[1], mat); c.unitIndex = ui; out.push(c); }
  });
  return out;
}
