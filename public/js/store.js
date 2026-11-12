// Stockage 100 % local (localStorage) : profils, progression, répétition espacée, gamification.
const K = 'gidro.';
const uid = () => Math.random().toString(36).slice(2, 10);
export const today = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const DAY = 86400000;

function read(key, def) {
  try { const v = localStorage.getItem(K + key); return v ? JSON.parse(v) : def; } catch { return def; }
}
function write(key, val) {
  try { localStorage.setItem(K + key, JSON.stringify(val)); } catch (e) { console.warn('Stockage plein ?', e); }
}

// Demande au navigateur de ne pas effacer les données
if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});

// ───────── Profils ─────────
export const AVATARS = ['🦊', '🐼', '🐯', '🐸', '🦁', '🐨', '🐵', '🦉', '🐙', '🦄', '🐢', '🐬'];
export const COLORS = ['#58cc02', '#1cb0f6', '#ce82ff', '#ff9600', '#ff4b4b', '#2b70c9', '#00cd9c', '#ffc800'];

export function listProfiles() { return read('profiles', []); }
export function currentProfileId() { return read('current', null); }
export function setCurrentProfile(id) { write('current', id); }

function blankProfileData() {
  return {
    settings: { ui: 'fr', sound: true, speech: false, rate: 1, goal: 30 },
    courses: {}, currentCourse: null,
    xp: 0, gems: 0, xpDays: {},
    streak: { count: 0, last: null, best: 0 },
    srs: {}, history: [], quests: null, badges: {},
    stats: { lessons: 0, reviews: 0, perfect: 0, maxCombo: 0, seconds: 0, correct: 0, answered: 0 },
    accepted: {},
  };
}

export function createProfile({ name, avatar, color, course, ui }) {
  const id = uid();
  const profiles = listProfiles();
  profiles.push({ id, name, avatar, color, created: Date.now() });
  write('profiles', profiles);
  const data = blankProfileData();
  data.settings.ui = ui || 'fr';
  data.currentCourse = course;
  data.courses[course] = { lessons: {}, unlocked: 0 };
  write('p.' + id, data);
  setCurrentProfile(id);
  return id;
}

export function deleteProfile(id) {
  write('profiles', listProfiles().filter(p => p.id !== id));
  localStorage.removeItem(K + 'p.' + id);
  if (currentProfileId() === id) localStorage.removeItem(K + 'current');
}

export function loadProfile(id) {
  const meta = listProfiles().find(p => p.id === id);
  if (!meta) return null;
  const data = Object.assign(blankProfileData(), read('p.' + id, {}));
  data.settings = Object.assign(blankProfileData().settings, data.settings);
  data.stats = Object.assign(blankProfileData().stats, data.stats);
  return { meta, data };
}

export function saveProfile(p) { write('p.' + p.meta.id, p.data); }

export function exportAll() {
  const out = { app: 'gidro', version: 1, exported: new Date().toISOString(), profiles: listProfiles(), data: {} };
  out.profiles.forEach(p => { out.data[p.id] = read('p.' + p.id, {}); });
  return out;
}
export function importAll(obj) {
  if (!obj || obj.app !== 'gidro' || !Array.isArray(obj.profiles)) throw new Error('bad');
  const existing = listProfiles();
  obj.profiles.forEach(p => {
    if (!existing.find(e => e.id === p.id)) existing.push(p);
    write('p.' + p.id, obj.data[p.id] || {});
  });
  write('profiles', existing);
}

// ───────── Cours ─────────
export function ensureCourse(p, courseId) {
  if (!p.data.courses[courseId]) p.data.courses[courseId] = { lessons: {}, unlocked: 0 };
  return p.data.courses[courseId];
}

// ───────── XP, séries, niveaux ─────────
export function levelFromXp(xp) {
  let lvl = 1;
  while (xp >= 25 * (lvl + 1) * lvl) lvl++;
  const base = 25 * lvl * (lvl - 1), next = 25 * (lvl + 1) * lvl;
  return { level: lvl, into: xp - base, need: next - base };
}

export function addXp(p, amount) {
  const d = today();
  const before = levelFromXp(p.data.xp).level;
  p.data.xp += amount;
  p.data.xpDays[d] = (p.data.xpDays[d] || 0) + amount;
  // série de jours
  const s = p.data.streak;
  if (s.last !== d) {
    const y = today(new Date(Date.now() - DAY));
    s.count = s.last === y ? s.count + 1 : 1;
    s.last = d;
    s.best = Math.max(s.best, s.count);
  }
  return levelFromXp(p.data.xp).level > before;
}

export function streakAlive(p) {
  const s = p.data.streak;
  if (!s.last) return 0;
  return (s.last === today() || s.last === today(new Date(Date.now() - DAY))) ? s.count : 0;
}

// ───────── Répétition espacée (système de Leitner) ─────────
const INTERVALS = [0, 0.007, 1, 3, 7, 16, 35]; // en jours (boîte 1 ≈ 10 min)

export function srsKey(courseId, kind, target) { return `${courseId}|${kind}|${target}`; }

export function srsSeen(p, courseId, kind, target, src, ok) {
  const key = srsKey(courseId, kind, target);
  let it = p.data.srs[key];
  if (!it) it = p.data.srs[key] = { course: courseId, kind, target, src, box: 0, due: 0, right: 0, wrong: 0, last: 0 };
  it.src = src;
  if (ok) { it.right++; it.box = Math.min(it.box + 1, 6); }
  else { it.wrong++; it.box = 1; }
  it.last = Date.now();
  it.due = Date.now() + INTERVALS[it.box] * DAY;
}

export function srsDue(p, courseId) {
  const now = Date.now();
  return Object.values(p.data.srs).filter(it => it.course === courseId && it.due <= now)
    .sort((a, b) => (b.wrong - b.right * 0.3) - (a.wrong - a.right * 0.3) || a.due - b.due);
}
export function srsWeak(p, courseId, n = 12) {
  return Object.values(p.data.srs).filter(it => it.course === courseId && it.wrong > 0)
    .sort((a, b) => (b.wrong / (b.right + b.wrong)) - (a.wrong / (a.right + a.wrong)) || b.wrong - a.wrong)
    .slice(0, n);
}
export function srsCount(p, courseId) { return Object.values(p.data.srs).filter(it => it.course === courseId).length; }

// ───────── Défis quotidiens ─────────
function seeded(seed) { let s = 0; for (const c of seed) s = (s * 31 + c.charCodeAt(0)) >>> 0; return () => ((s = (s * 1103515245 + 12345) >>> 0) / 4294967296); }

export function dailyQuests(p) {
  const d = today();
  if (p.data.quests?.date === d) return p.data.quests.items;
  const rnd = seeded(d + p.meta.id);
  const pool = [
    { type: 'xp', n: [30, 50, 80][Math.floor(rnd() * 3)], reward: 10 },
    { type: 'lessons', n: [2, 3][Math.floor(rnd() * 2)], reward: 10 },
    { type: 'perfect', n: 1, reward: 15 },
    { type: 'review', n: 1, reward: 10 },
    { type: 'combo', n: [8, 10, 12][Math.floor(rnd() * 3)], reward: 10 },
  ];
  pool.sort(() => rnd() - 0.5);
  const items = [pool.find(q => q.type === 'xp'), ...pool.filter(q => q.type !== 'xp').slice(0, 2)]
    .map(q => ({ ...q, progress: 0, claimed: false }));
  p.data.quests = { date: d, items };
  return items;
}

export function questProgress(p, ev) {
  const items = dailyQuests(p);
  for (const q of items) {
    if (q.type === 'xp' && ev.xp) q.progress += ev.xp;
    if (q.type === 'lessons' && ev.lesson) q.progress += 1;
    if (q.type === 'perfect' && ev.perfect) q.progress += 1;
    if (q.type === 'review' && ev.review) q.progress += 1;
    if (q.type === 'combo' && ev.combo) q.progress = Math.max(q.progress, ev.combo);
    q.progress = Math.min(q.progress, q.n);
  }
}

// ───────── Badges ─────────
export const BADGES = [
  { id: 'first', icon: '🌱', test: p => p.data.stats.lessons >= 1 },
  { id: 'perfect', icon: '💯', test: p => p.data.stats.perfect >= 1 },
  { id: 'streak3', icon: '🔥', test: p => p.data.streak.best >= 3 },
  { id: 'streak7', icon: '⚡', test: p => p.data.streak.best >= 7 },
  { id: 'streak30', icon: '👑', test: p => p.data.streak.best >= 30 },
  { id: 'xp100', icon: '⭐', test: p => p.data.xp >= 100 },
  { id: 'xp500', icon: '🌟', test: p => p.data.xp >= 500 },
  { id: 'xp2000', icon: '🏆', test: p => p.data.xp >= 2000 },
  { id: 'review5', icon: '🐘', test: p => p.data.stats.reviews >= 5 },
  { id: 'combo15', icon: '☄️', test: p => p.data.stats.maxCombo >= 15 },
  { id: 'unit', icon: '🎓', test: (p, ctx) => ctx?.unitDone },
  { id: 'poly', icon: '🌍', test: p => Object.values(p.data.courses).filter(c => Object.keys(c.lessons).length > 0).length >= 2 },
];

export function checkBadges(p, ctx) {
  const fresh = [];
  for (const b of BADGES) {
    if (!p.data.badges[b.id] && b.test(p, ctx)) { p.data.badges[b.id] = Date.now(); fresh.push(b); }
  }
  return fresh;
}
