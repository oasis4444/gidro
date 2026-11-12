// Exporte la liste de tous les textes à enregistrer (mots, phrases et mots isolés des phrases)
import { COURSES } from '../public/data/courses.js';
const tokens = s => s.replace(/[.,!?¿¡;:«»"]/g, ' ').split(/\s+/).filter(Boolean);
const out = {};
for (const c of COURSES) {
  const items = new Map(); // clé minuscule → texte
  const add = t => { const k = t.toLowerCase(); if (!items.has(k)) items.set(k, t); };
  for (const u of c.units) for (const l of u.lessons) {
    l.words.forEach(w => add(w[0]));
    l.sentences.forEach(s => add(s[0]));
  }
  for (const u of c.units) for (const l of u.lessons) l.sentences.forEach(s => tokens(s[0]).forEach(add));
  out[c.id] = { lang: c.target, items: [...items.values()] };
}
console.log(JSON.stringify(out));
