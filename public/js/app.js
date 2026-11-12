// Gidro — application principale
import { COURSES, getCourse, allLessons } from '../data/courses.js';
import * as S from './store.js';
import { t, setLang, getLang } from './i18n.js';
import * as E from './engine.js';
import { speak, ttsAvailable, sfx, listen, speechRecognitionAvailable, voicesFor, voiceFor, setPreferredVoices } from './audio.js';
import { mascot } from './mascot.js';

const app = document.getElementById('app');
let P = null;               // profil courant { meta, data }
let deferredInstall = null; // invite d'installation PWA
let swReady = false;

// ───────── Utilitaires ─────────
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const save = () => S.saveProfile(P);
const course = () => getCourse(P.data.currentCourse) || COURSES[0];
const cdata = () => S.ensureCourse(P, course().id);
const snd = n => { if (P?.data.settings.sound) sfx[n](); };
const say = (text, rate) => speak(text, course().tts, (rate || 1) * P.data.settings.rate);
const audioOk = () => ttsAvailable(course().tts);
const levelName = lv => t(lv);
const fmtTime = s => s >= 60 ? `${Math.floor(s / 60)} ${t('min')} ${s % 60} ${t('sec')}` : `${s} ${t('sec')}`;

function toast(icon, text, ms = 2800) {
  let zone = $('.toast-zone');
  if (!zone) { zone = document.createElement('div'); zone.className = 'toast-zone'; document.body.append(zone); }
  const el = document.createElement('div');
  el.className = 'toast'; el.innerHTML = `<span class="ti">${icon}</span><span>${esc(text)}</span>`;
  zone.append(el);
  setTimeout(() => { el.style.transition = 'opacity .3s'; el.style.opacity = 0; setTimeout(() => el.remove(), 300); }, ms);
}

function modal(html, bind) {
  const bg = document.createElement('div');
  bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal" role="dialog">${html}</div>`;
  const close = () => bg.remove();
  bg.addEventListener('click', e => { if (e.target === bg) close(); });
  document.body.append(bg);
  bind?.(bg, close);
  return close;
}

function showTip(lesson) {
  modal(`<div class="center">${mascot('idle', 80)}</div><h2>💡 ${esc(lesson.tip.title)}</h2><p class="tip-body">${esc(lesson.tip.body)}</p>
    <h3 style="margin-top:18px">${esc(lesson.title)}</h3>
    ${lesson.words.map(w => `<div class="weak"><span class="say"><button class="icon-btn" data-say="${esc(w[0])}">🔊</button><span class="wt">${esc(w[2])} ${esc(w[0])}</span></span><span class="ws">${esc(E.first(w[1]))}</span></div>`).join('')}
    <button class="btn block" style="margin-top:18px" data-close>OK</button>`,
  (el, close) => { $('[data-close]', el).onclick = close; $$('[data-say]', el).forEach(b => b.onclick = () => say(b.dataset.say)); });
}

function confetti() {
  const c = document.createElement('canvas'); c.id = 'confetti'; document.body.append(c);
  const ctx = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight;
  const colors = ['#58cc02', '#1cb0f6', '#ff9600', '#ffc800', '#ce82ff', '#ff4b4b'];
  const parts = Array.from({ length: 140 }, () => ({ x: Math.random() * c.width, y: -20 - Math.random() * c.height * .5, vx: (Math.random() - .5) * 4, vy: 2 + Math.random() * 4, r: Math.random() * 6.28, vr: (Math.random() - .5) * .3, w: 6 + Math.random() * 6, h: 8 + Math.random() * 8, col: colors[Math.floor(Math.random() * colors.length)] }));
  let frames = 0;
  (function loop() {
    ctx.clearRect(0, 0, c.width, c.height);
    for (const p of parts) { p.x += p.vx; p.y += p.vy; p.vy += .05; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.col; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); }
    if (++frames < 220) requestAnimationFrame(loop); else c.remove();
  })();
}

// ───────── Démarrage ─────────
function boot() {
  const id = S.currentProfileId();
  if (id && (P = S.loadProfile(id))) { setLang(P.data.settings.ui); showMain('learn'); }
  else { setLang((navigator.language || '').startsWith('mg') ? 'mg' : 'fr'); showProfiles(); }
}

// ───────── Profils ─────────
function showProfiles() {
  const list = S.listProfiles();
  if (!list.length) return showOnboarding();
  app.innerHTML = `<div class="welcome">
    ${mascot('happy', 110)}
    <div class="logo">gidro</div>
    <p class="muted">${t('appTagline')}</p>
    <h2 style="margin-top:26px">${t('whoLearns')}</h2>
    <div class="profiles">
      ${list.map(p => { const d = S.loadProfile(p.id).data; return `<button class="pcard" data-id="${p.id}">
        <div class="pav" style="background:${p.color}33">${p.avatar}</div>
        <div class="pname">${esc(p.name)}</div>
        <div class="psub">${(d.currentCourse && getCourse(d.currentCourse)?.flag) || ''} · ⚡ ${d.xp} XP</div></button>`; }).join('')}
      <button class="pcard" data-new><div class="pav" style="background:var(--bg2)">＋</div><div class="pname">${t('newProfile')}</div></button>
    </div></div>`;
  $$('[data-id]').forEach(b => b.onclick = () => { S.setCurrentProfile(b.dataset.id); P = S.loadProfile(b.dataset.id); setLang(P.data.settings.ui); showMain('learn'); });
  $('[data-new]').onclick = showOnboarding;
}

function showOnboarding() {
  const st = { name: '', avatar: S.AVATARS[0], color: S.COLORS[0], ui: getLang(), course: getLang() === 'mg' ? 'fr-mg' : 'en-fr' };
  const draw = () => {
    setLang(st.ui);
    app.innerHTML = `<div class="welcome stack">
      ${mascot('happy', 100)}
      <div class="logo">gidro</div>
      <p class="muted">${t('appTagline')}</p>
      <div class="seg" style="margin:auto">${['fr', 'mg'].map(l => `<button data-ui="${l}" class="${st.ui === l ? 'on' : ''}">${l === 'fr' ? 'Français' : 'Malagasy'}</button>`).join('')}</div>
      <h2>${t('newProfile')}</h2>
      <input class="field" id="pname" maxlength="20" placeholder="${t('yourName')}" value="${esc(st.name)}" autocomplete="off">
      <h3>${t('chooseAvatar')}</h3>
      <div class="picker" id="av">${S.AVATARS.map(a => `<button data-a="${a}" class="${a === st.avatar ? 'on' : ''}">${a}</button>`).join('')}</div>
      <div class="picker colors">${S.COLORS.map(c => `<button data-c="${c}" style="background:${c}" class="${c === st.color ? 'on' : ''}" aria-label="${c}"></button>`).join('')}</div>
      <h3>${t('chooseCourse')}</h3>
      <div class="stack">${COURSES.map(c => `<button class="course-opt ${st.course === c.id ? 'on' : ''}" data-course="${c.id}"><span class="flag">${c.flag}</span><span><div>${esc(c.name[st.ui])}</div><div class="psub">${t('from_' + c.from)}</div></span></button>`).join('')}</div>
      <button class="btn block" id="go" ${st.name.trim() ? '' : 'disabled'}>${t('createProfile')}</button>
      ${S.listProfiles().length ? `<button class="btn flat" id="back">${t('cancel')}</button>` : ''}
      <p class="offline-note">🔒 ${t('about')}</p>
    </div>`;
    const inp = $('#pname');
    inp.oninput = () => { st.name = inp.value; $('#go').disabled = !st.name.trim(); };
    $$('[data-ui]').forEach(b => b.onclick = () => { st.ui = b.dataset.ui; draw(); });
    $$('[data-a]').forEach(b => b.onclick = () => { st.avatar = b.dataset.a; draw(); });
    $$('[data-c]').forEach(b => b.onclick = () => { st.color = b.dataset.c; draw(); });
    $$('[data-course]').forEach(b => b.onclick = () => { st.course = b.dataset.course; draw(); });
    $('#go').onclick = () => {
      const id = S.createProfile({ name: st.name.trim(), avatar: st.avatar, color: st.color, course: st.course, ui: st.ui });
      P = S.loadProfile(id); showMain('learn'); confetti();
    };
    $('#back') && ($('#back').onclick = showProfiles);
  };
  draw();
}

// ───────── Coque principale ─────────
const NAV = [['learn', '🏠'], ['review', '🔄'], ['quests', '🎯'], ['stats', '📊'], ['settings', '⚙️']];

function showMain(tab) {
  const c = course();
  setPreferredVoices(P.data.settings.voices);
  S.ensureCourse(P, c.id);
  S.dailyQuests(P); save();
  const streak = S.streakAlive(P);
  const due = S.srsDue(P, c.id).length;
  const nav = NAV.map(([k, i]) => `<button class="navbtn ${tab === k ? 'on' : ''}" data-tab="${k}"><span class="ni">${i}</span><span>${t(k)}${k === 'review' && due ? ` (${due})` : ''}</span></button>`).join('');
  app.innerHTML = `<div class="shell">
    <nav class="side"><div class="brand">${mascot('idle', 36)} gidro</div>${nav}</nav>
    <main class="main">
      <header class="topbar">
        <button class="chip" id="flagbtn" title="${t('myCourses')}"><span class="flag">${c.flag}</span></button>
        <span class="grow"></span>
        <button class="chip fire ${streak ? '' : 'dim'}" data-tab="stats" title="${t('dayStreak')}">🔥 ${streak}</button>
        <button class="chip gem" data-tab="quests" title="${t('gems')}">💎 ${P.data.gems}</button>
        <button class="chip xp" data-tab="stats" title="XP">⚡ ${P.data.xp}</button>
        <button class="chip" id="avatarbtn" title="${esc(P.meta.name)}"><span class="pav" style="width:34px;height:34px;font-size:1.2rem;margin:0;background:${P.meta.color}33">${P.meta.avatar}</span></button>
      </header>
      <section id="content"></section>
    </main>
    <nav class="bottomnav">${nav}</nav></div>`;
  $$('[data-tab]').forEach(b => b.onclick = () => showMain(b.dataset.tab));
  $('#flagbtn').onclick = courseSwitcher;
  $('#avatarbtn').onclick = () => { S.setCurrentProfile(null); showProfiles(); };
  const content = $('#content');
  ({ learn: renderLearn, review: renderReview, quests: renderQuests, stats: renderStats, settings: renderSettings })[tab](content);
  window.scrollTo(0, 0);
}

function courseSwitcher() {
  modal(`<h2>${t('myCourses')}</h2><div class="stack">${COURSES.map(c => {
    const cd = P.data.courses[c.id]; const n = cd ? Object.keys(cd.lessons).length : 0; const tot = allLessons(c).length;
    return `<button class="course-opt ${c.id === P.data.currentCourse ? 'on' : ''}" data-c="${c.id}"><span class="flag">${c.flag}</span><span class="grow"><div>${esc(c.name[getLang()])}</div><div class="psub">${t('from_' + c.from)}${cd ? ` · ${n}/${tot}` : ''}</div></span></button>`;
  }).join('')}</div>`, (el, close) => $$('[data-c]', el).forEach(b => b.onclick = () => { P.data.currentCourse = b.dataset.c; S.ensureCourse(P, b.dataset.c); save(); close(); showMain('learn'); }));
}

// ───────── Onglet Apprendre ─────────
function isUnlocked(lessons, i, cd) {
  return i === 0 || i < (cd.unlocked || 0) || !!cd.lessons[lessons[i].id] || !!cd.lessons[lessons[i - 1].id];
}

function renderLearn(el) {
  const c = course(), cd = cdata(), lessons = allLessons(c);
  const todayXp = P.data.xpDays[S.today()] || 0, goal = P.data.settings.goal;
  const currentIdx = lessons.findIndex((l, i) => !cd.lessons[l.id] && isUnlocked(lessons, i, cd));
  const OFF = [0, 52, 78, 52, 0, -52, -78, -52];
  let html = `<div class="card goal-card">${mascot(todayXp >= goal ? 'happy' : 'idle', 64)}
    <div class="grow"><b>${todayXp >= goal ? t('goalDone') : t('goal')}</b>
    <div class="bar"><i style="width:${Math.min(100, todayXp / goal * 100)}%"></i><span>${todayXp} / ${goal} XP</span></div></div></div>`;
  let gi = 0;
  c.units.forEach((u, ui) => {
    html += `<div class="unit-banner" style="background:${u.color}">
      <div><div class="ul">${t('unit')} ${ui + 1} · ${levelName(u.level)}</div><div class="ut">${esc(u.title)}</div></div>
      <button class="tipbtn" data-unittip="${ui}">📘 ${t('tip')}</button></div><div class="path"><div class="path-mascot ${ui % 2 ? 'l' : 'r'}">${mascot(ui % 2 ? 'wow' : 'idle', 100)}</div>`;
    u.lessons.forEach((l, li) => {
      const idx = gi++;
      const rec = cd.lessons[l.id], unlocked = isUnlocked(lessons, idx, cd), isCur = idx === currentIdx;
      const cls = rec ? 'done' : unlocked ? (isCur ? 'current' : '') : 'locked';
      html += `<div class="node-wrap" style="transform:translateX(${OFF[idx % 8]}px)">
        ${isCur ? `<div class="start-bubble">${t('startLesson')}</div>` : ''}
        <button class="node ${cls}" data-idx="${idx}" style="${unlocked && !rec ? `--c:${u.color};--cd:color-mix(in srgb, ${u.color} 75%, black)` : ''}">${unlocked ? l.icon : '🔒'}</button>
        ${rec ? `<div class="node-stars">${'⭐'.repeat(rec.stars)}</div>` : ''}
      </div>`;
    });
    html += `</div>`;
  });
  if (currentIdx === -1) html += `<div class="card center" style="margin-top:20px">${mascot('happy', 90)}<h2>${t('allDone')}</h2></div>`;
  el.innerHTML = html;

  $$('[data-unittip]', el).forEach(b => b.onclick = () => {
    const u = c.units[+b.dataset.unittip];
    modal(`<h2>📘 ${t('unitTips')} — ${esc(u.title)}</h2>${u.lessons.map(l => `<h3 style="margin-top:16px">${l.icon} ${esc(l.tip.title)}</h3><p class="tip-body">${esc(l.tip.body)}</p>`).join('')}<button class="btn block" data-close>OK</button>`,
      (m, close) => $('[data-close]', m).onclick = close);
  });

  $$('.node', el).forEach(b => b.onclick = e => {
    e.stopPropagation();
    const had = b.parentElement.querySelector('.popover');
    $$('.popover', el).forEach(p => p.remove());
    if (had) return;
    snd('tap');
    const idx = +b.dataset.idx, l = lessons[idx], rec = cd.lessons[l.id], unlocked = isUnlocked(lessons, idx, cd);
    const pop = document.createElement('div');
    pop.className = 'popover' + (unlocked ? '' : ' locked');
    pop.style.background = l.unit.color; pop.style.setProperty('--pc', l.unit.color);
    pop.innerHTML = unlocked
      ? `<h3>${esc(l.title)}</h3><p>${t('lessonOf', { a: l.lessonIndex + 1, b: l.unit.lessons.length })}${rec ? ` · ${'⭐'.repeat(rec.stars)}` : ''}</p>
         <button class="btn" data-start>${rec ? t('practice') + ' +10 XP' : t('startLesson') + ' +10 XP'}</button>
         <button class="btn flat" data-tip style="color:#fff;width:100%;margin-top:6px">💡 ${t('tip')}</button>`
      : `<h3>${esc(l.title)}</h3><p>${t('locked')}</p>`;
    b.parentElement.append(pop);
    pop.onclick = ev => ev.stopPropagation();
    $('[data-start]', pop)?.addEventListener('click', () => startLesson(l));
    $('[data-tip]', pop)?.addEventListener('click', () => showTip(l));
  });
  el.onclick = () => $$('.popover', el).forEach(p => p.remove());
  // faire défiler jusqu'à la leçon en cours
  const cur = $('.node.current', el);
  if (cur) setTimeout(() => cur.scrollIntoView({ block: 'center', behavior: 'smooth' }), 120);
}

// ───────── Onglet Réviser ─────────
function renderReview(el) {
  const c = course(), due = S.srsDue(P, c.id), weak = S.srsWeak(P, c.id), total = S.srsCount(P, c.id);
  el.innerHTML = `<div class="card hero">${mascot('idle', 90)}<div><h2>${t('reviewTitle')}</h2><p class="muted" style="margin:0">${t('reviewBody')}</p></div></div>
    <div class="stat-grid" style="margin-top:14px">
      <div class="stat"><span class="si">⏰</span><div><div class="sv">${due.length}</div><div class="sl">${t('dueNow')}</div></div></div>
      <div class="stat"><span class="si">🧠</span><div><div class="sv">${total}</div><div class="sl">${t('learned')}</div></div></div>
    </div>
    <div class="stack" style="margin-top:16px">
      ${due.length ? `<button class="btn block" id="rv">${t('startReview')}</button>` : `<p class="muted center">${t('nothingDue')}</p>`}
      ${weak.length ? `<button class="btn ghost block" id="wk">${t('practiceWeak')}</button>` : ''}
    </div>
    <div class="section-title">${t('weakItems')}</div>
    <div class="card">${weak.length ? weak.map(w => `<div class="weak"><span class="say"><button class="icon-btn" data-say="${esc(w.target)}">🔊</button><span><div class="wt">${esc(w.target)}</div><div class="ws">${esc(E.first(w.src))}</div></span></span><span class="pill">✗ ${w.wrong}</span></div>`).join('') : `<p class="muted" style="margin:0">${t('noWeak')}</p>`}</div>`;
  $('#rv')?.addEventListener('click', () => startSession({ mode: 'review', exercises: E.buildReview(due, c, { audio: audioOk() }) }));
  $('#wk')?.addEventListener('click', () => startSession({ mode: 'review', exercises: E.buildReview(E.shuffle(weak), c, { audio: audioOk() }) }));
  $$('[data-say]', el).forEach(b => b.onclick = () => say(b.dataset.say));
}

// ───────── Onglet Défis ─────────
function renderQuests(el) {
  const qs = S.dailyQuests(P), todayXp = P.data.xpDays[S.today()] || 0, goal = P.data.settings.goal;
  const qIcon = { xp: '⚡', lessons: '📚', perfect: '💯', review: '🔄', combo: '🔥' };
  el.innerHTML = `<div class="card hero">${mascot('happy', 80)}<div class="grow"><h2>${t('goal')}</h2>
    <div class="bar"><i style="width:${Math.min(100, todayXp / goal * 100)}%"></i><span>${todayXp} / ${goal} XP</span></div></div></div>
    <div class="section-title">${t('dailyQuests')}</div>
    <div class="card">${qs.map((q, i) => `<div class="quest"><span class="qi">${qIcon[q.type]}</span><div class="grow"><b>${t('q_' + q.type, { n: q.n })}</b>
      <div class="bar"><i style="width:${q.progress / q.n * 100}%"></i><span>${q.progress} / ${q.n}</span></div></div>
      ${q.claimed ? `<span class="muted">✓ ${t('claimed')}</span>` : `<button class="btn gold" data-claim="${i}" ${q.progress >= q.n ? '' : 'disabled'}>+${q.reward} 💎</button>`}</div>`).join('')}</div>
    <div class="section-title">${t('badges')}</div>
    <div class="badges">${S.BADGES.map(b => `<div class="badge ${P.data.badges[b.id] ? '' : 'off'}"><div class="bi">${b.icon}</div><div class="bn">${t('b_' + b.id)}</div><div class="bd">${t('b_' + b.id + '_d')}</div></div>`).join('')}</div>`;
  $$('[data-claim]', el).forEach(b => b.onclick = () => {
    const q = qs[+b.dataset.claim]; q.claimed = true; P.data.gems += q.reward; save(); snd('badge'); confetti(); showMain('quests');
  });
}

// ───────── Onglet Progrès ─────────
function renderStats(el) {
  const c = course(), cd = cdata(), lessons = allLessons(c), lv = S.levelFromXp(P.data.xp), st = P.data.stats;
  const doneCount = lessons.filter(l => cd.lessons[l.id]).length;
  // niveau dans le cours = niveau de la dernière unité entièrement terminée (ou débloquée par le test)
  let lvlUnit = -1;
  c.units.forEach((u, ui) => { if (u.lessons.every(l => cd.lessons[l.id])) lvlUnit = ui; });
  if (cd.unlocked > 0) lvlUnit = Math.max(lvlUnit, lessons[Math.min(cd.unlocked, lessons.length) - 1].unitIndex);
  const courseLevel = lvlUnit >= 0 ? levelName(c.units[lvlUnit].level) : '—';
  const days = [...Array(7)].map((_, i) => { const d = new Date(Date.now() - (6 - i) * 86400000); return { d, xp: P.data.xpDays[S.today(d)] || 0 }; });
  const max = Math.max(20, ...days.map(x => x.xp));
  el.innerHTML = `<div class="card center">
      <div class="lvl-ring" style="--p:${lv.into / lv.need * 100}"><div><div><b>${lv.level}</b><span class="muted">${t('level')}</span></div></div></div>
      <p class="muted" style="margin:10px 0 0">${lv.into} / ${lv.need} XP</p></div>
    <div class="stat-grid" style="margin-top:14px">
      <div class="stat"><span class="si">⚡</span><div><div class="sv">${P.data.xp}</div><div class="sl">${t('totalXp')}</div></div></div>
      <div class="stat"><span class="si">🔥</span><div><div class="sv">${P.data.streak.best}</div><div class="sl">${t('bestStreak')}</div></div></div>
      <div class="stat"><span class="si">📚</span><div><div class="sv">${st.lessons}</div><div class="sl">${t('lessonsDone')}</div></div></div>
      <div class="stat"><span class="si">🎯</span><div><div class="sv">${st.answered ? Math.round(st.correct / st.answered * 100) : 0}%</div><div class="sl">${t('accuracy')}</div></div></div>
      <div class="stat"><span class="si">🧠</span><div><div class="sv">${S.srsCount(P, c.id)}</div><div class="sl">${t('wordsLearned')}</div></div></div>
      <div class="stat"><span class="si">⏱️</span><div><div class="sv">${Math.round(st.seconds / 60)} ${t('min')}</div><div class="sl">${t('time')}</div></div></div>
    </div>
    <div class="section-title">${t('last7')}</div>
    <div class="card"><div class="chart">${days.map((x, i) => `<div class="col"><span class="v">${x.xp || ''}</span><div class="b ${i === 6 ? 'today' : ''}" style="height:${x.xp / max * 100}%"></div><span class="d">${t('days')[x.d.getDay()]}</span></div>`).join('')}</div></div>
    <div class="section-title">${c.flag} ${t('courseLevel')}</div>
    <div class="card"><div class="row"><b class="grow">${courseLevel}</b><span class="muted">${doneCount} / ${lessons.length}</span></div>
      <div class="bar"><i style="width:${doneCount / lessons.length * 100}%;background:var(--green)"></i></div>
      <p class="muted">${t('levelTestBody')}</p><button class="btn blue block" id="test">${t('takeTest')}</button></div>
    <div class="section-title">${t('history')}</div>
    <div class="card">${P.data.history.length ? P.data.history.slice(-15).reverse().map(h => `<div class="hist"><span class="hi">${h.icon}</span><div class="grow"><b>${esc(h.title)}</b><div class="muted" style="font-size:.8rem">${new Date(h.ts).toLocaleString(getLang() === 'mg' ? 'fr-MG' : 'fr-FR', { dateStyle: 'short', timeStyle: 'short' })} · ${getCourse(h.course)?.flag || ''}</div></div><span>${Math.round(h.acc * 100)}%</span><b style="color:var(--gold)">+${h.xp}</b></div>`).join('') : `<p class="muted" style="margin:0">${t('noHistory')}</p>`}</div>`;
  $('#test').onclick = () => startSession({ mode: 'test', exercises: E.buildPlacement(c) });
}

// ───────── Onglet Réglages ─────────
function renderSettings(el) {
  const s = P.data.settings;
  const sw = (k, on) => `<button class="switch ${on ? 'on' : ''}" data-sw="${k}" aria-pressed="${on}"></button>`;
  const seg = (k, vals, cur, fmt = v => v) => `<div class="seg">${vals.map(v => `<button data-seg="${k}" data-v="${v}" class="${cur == v ? 'on' : ''}">${fmt(v)}</button>`).join('')}</div>`;
  el.innerHTML = `<h1>${t('settings')}</h1>
    <div class="card">
      <div class="setting"><b>${t('uiLang')}</b>${seg('ui', ['fr', 'mg'], s.ui, v => v === 'fr' ? 'Français' : 'Malagasy')}</div>
      <div class="setting"><b>${t('sound')}</b>${sw('sound', s.sound)}</div>
      <div class="setting"><div><b>${t('speech')}</b><div class="muted" style="font-size:.82rem">${speechRecognitionAvailable() ? t('speechNote') : t('speakUnavailable')}</div></div>${sw('speech', s.speech)}</div>
      <div class="setting"><div class="grow"><b>${t('voice')} ${course().flag}</b>
        <div class="row" style="margin-top:8px"><select class="field grow" id="voicesel" style="padding:10px 12px">${voicesFor(course().tts).map(v => `<option value="${esc(v.name)}" ${voiceFor(course().tts)?.name === v.name ? 'selected' : ''}>${esc(v.name)} — ${v.localService ? t('voiceOffline') : t('voiceOnline')}</option>`).join('')}</select>
        <button class="btn blue" id="voicetest" style="padding:10px 14px">▶</button></div>
        <div class="muted" style="font-size:.8rem;margin-top:6px">${t('voiceHelp')}</div></div></div>
      <div class="setting"><b>${t('voiceRate')}</b>${seg('rate', [0.7, 0.85, 1], s.rate, v => v + '×')}</div>
      <div class="setting"><b>${t('dailyGoal')}</b>${seg('goal', [10, 20, 30, 50], s.goal)}</div>
      ${audioOk() ? '' : `<p class="muted" style="font-size:.85rem">⚠️ ${t('voiceMissing')}</p>`}
    </div>
    <div class="section-title">${t('myCourses')}</div>
    <div class="card"><button class="btn ghost block" id="courses">${course().flag} ${esc(course().name[getLang()])} — ${t('addCourse')}</button></div>
    <div class="section-title">${t('backup')}</div>
    <div class="card stack">
      <button class="btn blue block" id="exp">⬇️ ${t('exportData')}</button>
      <label class="btn ghost block">⬆️ ${t('importData')}<input type="file" id="imp" accept=".json,application/json" hidden></label>
      ${deferredInstall ? `<button class="btn block" id="inst">📲 ${t('install')}</button>` : ''}
      <p class="muted center" style="margin:0;font-size:.85rem">${swReady ? t('offlineReady') : t('offlineNot')}</p>
    </div>
    <div class="section-title">${esc(P.meta.avatar)} ${esc(P.meta.name)}</div>
    <div class="card stack">
      <button class="btn ghost block" id="switch">${t('switchProfile')}</button>
      <button class="btn red block" id="del">${t('deleteProfile')}</button>
    </div>
    <p class="offline-note">${mascot('idle', 50)}<br>Gidro v1.0 — ${t('about')}</p>`;
  $$('[data-sw]', el).forEach(b => b.onclick = () => { s[b.dataset.sw] = !s[b.dataset.sw]; save(); showMain('settings'); });
  $$('[data-seg]', el).forEach(b => b.onclick = () => {
    const k = b.dataset.seg; s[k] = k === 'ui' ? b.dataset.v : +b.dataset.v; save();
    if (k === 'ui') setLang(s.ui);
    if (k === 'rate') say(course().units[0].lessons[0].sentences[0][0]);
    showMain('settings');
  });
  const vs = $('#voicesel');
  if (vs) vs.onchange = () => { (s.voices ||= {})[course().tts] = vs.value; save(); setPreferredVoices(s.voices); say(course().units[0].lessons[0].sentences[0][0]); };
  $('#voicetest').onclick = () => say(course().units[0].lessons[0].sentences[0][0]);
  $('#courses').onclick = courseSwitcher;
  $('#exp').onclick = () => {
    const blob = new Blob([JSON.stringify(S.exportAll(), null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `gidro-sauvegarde-${S.today()}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  $('#imp').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then(txt => { S.importAll(JSON.parse(txt)); P = S.loadProfile(P.meta.id) || P; toast('✅', t('importOk')); showMain('settings'); })
      .catch(() => toast('⚠️', t('importBad')));
  };
  $('#inst')?.addEventListener('click', async () => { deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; showMain('settings'); });
  $('#switch').onclick = () => { S.setCurrentProfile(null); showProfiles(); };
  $('#del').onclick = () => modal(`<h2>${t('deleteProfile')}</h2><p>${t('deleteConfirm')}</p><div class="row"><button class="btn ghost grow" data-no>${t('cancel')}</button><button class="btn red grow" data-yes>${t('deleteProfile')}</button></div>`,
    (m, close) => { $('[data-no]', m).onclick = close; $('[data-yes]', m).onclick = () => { S.deleteProfile(P.meta.id); P = null; close(); showProfiles(); }; });
}

// ───────── Leçons & sessions ─────────
function startLesson(lesson) {
  const c = course();
  const exercises = E.buildLesson(lesson, c, { audio: audioOk(), speech: P.data.settings.speech && speechRecognitionAvailable() });
  startSession({ mode: 'lesson', lesson, exercises });
}

function startSession({ mode, lesson, exercises }) {
  if (!exercises.length) return;
  const c = course();
  const ss = { mode, lesson, queue: [...exercises], total: exercises.length, done: 0, firstOk: 0, combo: 0, maxCombo: 0, start: Date.now(), unitScores: {} };
  let cur = null, ex = null, phase = 'answer', lastResult = null;

  app.innerHTML = `<div class="lesson">
      <div class="lesson-top"><button class="icon-btn" id="quit" aria-label="Quitter">✕</button><div class="progress"><i style="width:0%"></i></div><span class="combo-badge" id="combo"></span></div>
      <div id="stage"></div></div>
    <div class="footer" id="footer"><div class="footer-in" id="footin"></div></div>`;
  const stage = $('#stage'), footer = $('#footer'), footin = $('#footin');

  $('#quit').onclick = () => modal(`<div class="center">${mascot('sad', 90)}</div><h2 class="center">${t('quit')}</h2><p class="center muted">${t('quitBody')}</p>
    <div class="stack"><button class="btn block" data-no>${t('quitNo')}</button><button class="btn flat block" data-yes style="color:var(--red)">${t('quitYes')}</button></div>`,
    (m, close) => { $('[data-no]', m).onclick = close; $('[data-yes]', m).onclick = () => { close(); document.onkeydown = null; showMain(mode === 'review' ? 'review' : mode === 'test' ? 'stats' : 'learn'); }; });

  const setProgress = () => { $('.progress > i').style.width = (ss.done / ss.total * 100) + '%'; };
  const setCombo = () => { const cb = $('#combo'); cb.textContent = ss.combo >= 3 ? `🔥 ${ss.combo}` : ''; if (ss.combo >= 3) { cb.classList.remove('pop'); void cb.offsetWidth; cb.classList.add('pop'); } };

  function footerAnswer() {
    footer.className = 'footer';
    const skippable = ['listen', 'dictation', 'speak'].includes(ex.type);
    footin.innerHTML = `${skippable ? `<button class="btn ghost" id="skip">${t(ex.type === 'speak' ? 'cantSpeak' : 'cantListen')}</button>` : '<span></span>'}
      <button class="btn" id="check" disabled>${t('check')}</button>`;
    $('#check').onclick = check;
    $('#skip')?.addEventListener('click', () => skipExercise());
  }
  const setReady = r => { const b = $('#check'); if (b) b.disabled = !r; };

  function next() {
    document.querySelectorAll('.popover').forEach(p => p.remove());
    if (!ss.queue.length) return finish();
    ex = ss.queue.shift(); phase = 'answer';
    footerAnswer();
    stage.innerHTML = '';
    const wrap = document.createElement('div'); wrap.className = 'ex'; stage.append(wrap);
    cur = renderExercise(ex, wrap, { setReady, autoCheck: () => check(), course: c });
  }

  function skipExercise() {
    // désactive l'audio ou le micro pour le reste de la session
    ss.queue = ss.queue.filter(q => !['listen', 'dictation', 'speak'].includes(q.type));
    ss.done++; setProgress(); next();
  }

  function check() {
    if (phase !== 'answer' || !cur) return;
    const r = cur.evaluate(); if (!r) return;
    phase = 'feedback';
    apply(r);
  }

  function apply(r) {
    const first = !ex._seen; ex._seen = true;
    if (r.ok) { ss.done++; ss.combo++; if (first) ss.firstOk++; snd('correct'); }
    else {
      ss.combo = 0; snd('wrong');
      if (!ex._requeued && ss.mode !== 'test') { ex._requeued = true; ss.queue.push(ex); } else ss.done++;
      stage.firstElementChild?.classList.add('shake');
    }
    ss.maxCombo = Math.max(ss.maxCombo, ss.combo);
    if (ss.mode !== 'test') {
      if (ex.type === 'match') ex.pairs.forEach(p => S.srsSeen(P, c.id, 'w', p.item.target, p.item.src, true));
      else if (ex.item && first) S.srsSeen(P, c.id, ex.item.kind, ex.item.target, ex.item.src, r.ok);
    } else {
      const u = ss.unitScores[ex.unitIndex] ||= { ok: 0, n: 0 }; u.n++; if (r.ok) u.ok++;
    }
    lastResult = r;
    setProgress(); setCombo(); showFeedback(r);
  }

  function showFeedback(r) {
    footer.className = 'footer ' + (r.ok ? 'ok' : 'bad');
    const praise = t('correct'); const title = r.ok ? praise[Math.floor(Math.random() * praise.length)] : t('wrong');
    let detail = '';
    if (!r.ok) detail = `<div class="fb-d"><b>${t('correctAnswer')}</b> ${esc(r.correct)}</div>`;
    else if (r.kind === 'accent') detail = `<div class="fb-d">${t('accentNote')}<b>${esc(r.correct)}</b></div>`;
    else if (r.kind === 'typo') detail = `<div class="fb-d">${t('typoNote')}<b>${esc(r.correct)}</b></div>`;
    if (r.meaning) detail += `<div class="fb-note">${t('meaning')} ${esc(r.meaning)}</div>`;
    if (ex.item?.note) detail += `<div class="fb-note">💡 ${esc(ex.item.note)}</div>`;
    const canClaim = !r.ok && r.input && ['translate', 'dictation'].includes(ex.type);
    const lessonForTip = ex.item?.lesson;
    footin.innerHTML = `<div class="fb"><div class="fb-ic">${r.ok ? '✅' : '❌'}</div><div><div class="fb-t">${title}</div>${detail}
        <div class="row wrap" style="gap:14px">${canClaim ? `<button class="fb-link" id="claim">${t('iWasRight')}</button>` : ''}${!r.ok && lessonForTip ? `<button class="fb-link" id="tipl">💡 ${t('tip')}</button>` : ''}</div></div></div>
      <button class="btn ${r.ok ? '' : 'red'}" id="cont">${t('continue')}</button>`;
    $('#cont').onclick = next;
    $('#cont').focus({ preventScroll: true });
    $('#tipl')?.addEventListener('click', () => showTip(lessonForTip));
    $('#claim')?.addEventListener('click', () => {
      // l'apprenant signale que sa réponse est juste : on l'accepte et on la mémorise
      const key = `${c.id}|${ex.item.target}`;
      (P.data.accepted[key] ||= []).push(r.input);
      if (ex._requeued && ss.queue[ss.queue.length - 1] === ex) { ss.queue.pop(); ex._requeued = false; }
      ss.done++; ss.firstOk++; ss.combo = 1;
      S.srsSeen(P, c.id, ex.item.kind, ex.item.target, ex.item.src, true);
      setProgress(); setCombo(); save();
      showFeedback({ ok: true, kind: 'exact', correct: r.input, meaning: r.meaning });
      toast('👍', t('accepted'));
    });
  }

  document.onkeydown = e => {
    if (!$('.lesson')) { document.onkeydown = null; return; }
    if ($('.modal-bg')) return;
    if (e.key === 'Enter') {
      if (phase === 'feedback') { e.preventDefault(); next(); }
      else if (!$('#check')?.disabled && !(e.target.tagName === 'TEXTAREA' && e.shiftKey)) { e.preventDefault(); check(); }
    } else if (phase === 'answer' && /^[1-9]$/.test(e.key) && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) cur?.onKey?.(+e.key);
  };

  function finish() {
    document.onkeydown = null;
    const secs = Math.round((Date.now() - ss.start) / 1000);
    const acc = ss.total ? ss.firstOk / ss.total : 1;
    const perfect = ss.firstOk >= ss.total;
    const cd = cdata();
    const goalBefore = (P.data.xpDays[S.today()] || 0) >= P.data.settings.goal;
    let xp = 0, stars = 0, ctx = {}, testInfo = null;
    if (ss.mode === 'lesson') {
      const unitBefore = ss.lesson.unit.lessons.every(l => cd.lessons[l.id]);
      xp = 10 + (perfect ? 5 : 0) + Math.floor(ss.maxCombo / 5);
      stars = acc >= 0.95 ? 3 : acc >= 0.75 ? 2 : 1;
      const rec = cd.lessons[ss.lesson.id] || { stars: 0, best: 0, count: 0 };
      rec.stars = Math.max(rec.stars, stars); rec.best = Math.max(rec.best, acc); rec.count++; rec.last = Date.now();
      cd.lessons[ss.lesson.id] = rec;
      P.data.stats.lessons++; if (perfect) P.data.stats.perfect++;
      ctx.unitDone = !unitBefore && ss.lesson.unit.lessons.every(l => cd.lessons[l.id]);
    } else if (ss.mode === 'review') {
      xp = 10 + Math.floor(ss.maxCombo / 5); P.data.stats.reviews++;
    } else {
      xp = 5;
      let reached = -1;
      for (let ui = 0; ui < c.units.length; ui++) { const u = ss.unitScores[ui]; if (u && u.ok / u.n >= 0.6) reached = ui; else break; }
      const lessons = allLessons(c);
      const unlockTo = reached + 1 < c.units.length ? lessons.findIndex(l => l.unitIndex === reached + 1) : lessons.length;
      cd.unlocked = Math.max(cd.unlocked || 0, unlockTo);
      testInfo = { reached, level: reached >= 0 ? c.units[reached].level : 'beginner', unit: Math.min(reached + 2, c.units.length) };
    }
    const leveled = S.addXp(P, xp);
    S.questProgress(P, { xp, lesson: ss.mode === 'lesson', perfect: ss.mode === 'lesson' && perfect, review: ss.mode === 'review', combo: ss.maxCombo });
    const st = P.data.stats;
    st.maxCombo = Math.max(st.maxCombo, ss.maxCombo); st.seconds += secs; st.correct += ss.firstOk; st.answered += ss.total;
    P.data.history.push({ ts: Date.now(), course: c.id, mode: ss.mode, title: ss.mode === 'lesson' ? ss.lesson.title : ss.mode === 'review' ? t('review') : t('levelTest'), icon: ss.mode === 'lesson' ? ss.lesson.icon : ss.mode === 'review' ? '🔄' : '🧪', xp, acc });
    if (P.data.history.length > 300) P.data.history = P.data.history.slice(-300);
    const badges = S.checkBadges(P, ctx);
    const goalAfter = (P.data.xpDays[S.today()] || 0) >= P.data.settings.goal;
    save();

    snd('done'); confetti();
    const title = ss.mode === 'lesson' ? t('lessonDone') : ss.mode === 'review' ? t('reviewDone') : t('testDone');
    app.innerHTML = `<div class="result">
      ${mascot('happy', 140)}
      <h1>${title}</h1>
      ${ss.mode === 'lesson' ? `<div class="stars-big">${[1, 2, 3].map(i => `<span class="${i <= stars ? '' : 'star-off'}">⭐</span>`).join('')}</div>` : ''}
      ${testInfo ? `<h2>${t('levelEstimated', { l: levelName(testInfo.level) })}</h2><p class="muted">${t('unlockedUpTo', { n: testInfo.unit })}</p>` : ''}
      <div class="result-stats">
        <div class="rstat" style="--c:var(--gold)"><div class="rl">${t('xpEarned')}</div><div class="rv">⚡ ${xp}</div></div>
        <div class="rstat" style="--c:var(--green)"><div class="rl">${t('accuracy')}</div><div class="rv">🎯 ${Math.round(acc * 100)}%</div></div>
        <div class="rstat" style="--c:var(--blue)"><div class="rl">${t('time')}</div><div class="rv">⏱️ ${fmtTime(secs)}</div></div>
      </div>
      ${ss.maxCombo >= 3 ? `<p class="muted">🔥 ${t('combo')} : ${ss.maxCombo}</p>` : ''}
    </div>
    <div class="footer"><div class="footer-in"><span></span><button class="btn" id="cont">${t('continue')}</button></div></div>`;
    const go = () => {
      showMain(ss.mode === 'review' ? 'review' : ss.mode === 'test' ? 'learn' : 'learn');
      let delay = 300;
      if (leveled) setTimeout(() => { snd('badge'); toast('🆙', `${t('levelUp')} ${t('level')} ${S.levelFromXp(P.data.xp).level}`); }, delay += 400);
      if (!goalBefore && goalAfter) setTimeout(() => toast('🎯', t('goalDone')), delay += 400);
      badges.forEach(b => setTimeout(() => { snd('badge'); toast(b.icon, `${t('newBadge')} ${t('b_' + b.id)}`, 3500); }, delay += 600));
    };
    $('#cont').onclick = go; $('#cont').focus();
    document.onkeydown = e => { if (e.key === 'Enter') { document.onkeydown = null; go(); } };
  }

  next();
}

// ───────── Rendu de chaque type d'exercice ─────────
function speakerBtn(text, cls = '', rate) { return `<button class="spk ${cls}" data-speak="${esc(text)}" ${rate ? `data-rate="${rate}"` : ''} aria-label="Écouter">${cls.includes('slow') ? '🐢' : '🔊'}</button>`; }
function bindSpeakers(root) { $$('[data-speak]', root).forEach(b => b.onclick = e => { e.stopPropagation(); say(b.dataset.speak, +b.dataset.rate || 1); }); }

function renderExercise(ex, root, api) {
  const it = ex.item;
  const meaningOf = () => it ? `${it.target} = ${E.first(it.src)}` : '';
  const choice = (sel, opts, render, onPick) => {
    let picked = -1;
    root.insertAdjacentHTML('beforeend', render);
    const btns = $$(sel, root);
    const pickIdx = i => {
      if (i < 0 || i >= btns.length) return;
      picked = i; btns.forEach((b, j) => b.classList.toggle('sel', j === i)); snd('tap'); api.setReady(true); onPick?.(i);
    };
    btns.forEach((b, i) => b.onclick = () => pickIdx(i));
    return { get: () => picked, pick: pickIdx, mark: ok => { btns.forEach((b, j) => { b.classList.add('off'); b.classList.remove('sel'); }); btns[ex.answer].classList.replace('off', 'ok'); if (!ok && picked >= 0) btns[picked].classList.replace('off', 'bad'); } };
  };
  const mcqEval = (ch, correct) => () => {
    const p = ch.get(); if (p < 0) return null;
    const ok = p === ex.answer; ch.mark(ok);
    return { ok, kind: 'exact', correct, meaning: meaningOf() };
  };
  const optList = cls => ex.options.map((o, i) => `<button class="opt ${cls || ''}"><span class="k">${i + 1}</span><span class="grow">${esc(o.label)}</span></button>`).join('');

  switch (ex.type) {
    case 'image': {
      root.innerHTML = `<div class="muted" style="font-weight:800">${t('selectImage')}</div><div class="ex-title">« ${esc(ex.prompt)} »</div>`;
      const ch = choice('.imgopt', ex.options, `<div class="grid-img">${ex.options.map((o, i) => `<button class="opt imgopt"><div class="emo">${o.emoji}</div><div class="lbl"><span>${esc(o.label)}</span><span class="k">${i + 1}</span></div></button>`).join('')}</div>`, i => say(ex.options[i].speak));
      return { evaluate: mcqEval(ch, it.target), onKey: k => ch.pick(k - 1) };
    }
    case 'mcq': {
      root.innerHTML = `<div class="ex-title">${t('whichMeans')}</div><div class="speech-row">${mascot('idle', 90)}<div class="bubble say">${speakerBtn(ex.prompt)}<span class="word-under">${esc(ex.prompt)}</span></div></div>`;
      bindSpeakers(root); setTimeout(() => say(ex.prompt), 250);
      const ch = choice('.opt', ex.options, `<div class="stack">${optList()}</div>`);
      return { evaluate: mcqEval(ch, E.first(it.src)), onKey: k => ch.pick(k - 1) };
    }
    case 'mcqRev': {
      root.innerHTML = `<div class="ex-title">${t('howSay', { w: esc(ex.prompt) })}</div>`;
      const ch = choice('.opt', ex.options, `<div class="stack">${optList()}</div>`, i => say(ex.options[i].speak));
      return { evaluate: mcqEval(ch, it.target), onKey: k => ch.pick(k - 1) };
    }
    case 'listen': {
      root.innerHTML = `<div class="ex-title">${t('tapHear')}</div><div class="listen-row">${speakerBtn(ex.audio, 'big')}${speakerBtn(ex.audio, 'slow', 0.6)}</div>`;
      bindSpeakers(root); setTimeout(() => say(ex.audio), 300);
      const ch = choice('.opt', ex.options, `<div class="grid2">${optList()}</div>`);
      return { evaluate: mcqEval(ch, it.target), onKey: k => ch.pick(k - 1) };
    }
    case 'match': {
      root.innerHTML = `<div class="ex-title">${t('matchPairs')}</div><div class="match-grid"><div class="col">${ex.left.map((o, i) => `<button class="opt" data-side="l" data-i="${o.i}"><span class="k">${i + 1}</span><span class="grow">${esc(o.label)}</span></button>`).join('')}</div><div class="col">${ex.right.map((o, i) => `<button class="opt" data-side="r" data-i="${o.i}"><span class="k">${i + 1 + ex.left.length}</span><span class="grow">${esc(o.label)}</span></button>`).join('')}</div></div>`;
      let sel = { l: null, r: null }, matched = 0, mistakes = 0;
      const all = $$('[data-side]', root);
      const tap = b => {
        if (b.classList.contains('gone')) return;
        const side = b.dataset.side;
        if (side === 'l') say(ex.pairs[+b.dataset.i].target); else snd('tap');
        if (sel[side]) sel[side].classList.remove('sel');
        sel[side] = b; b.classList.add('sel');
        if (sel.l && sel.r) {
          const a = sel.l, c = sel.r; sel = { l: null, r: null };
          if (a.dataset.i === c.dataset.i) {
            [a, c].forEach(x => { x.classList.remove('sel'); x.classList.add('ok'); setTimeout(() => { x.classList.remove('ok'); x.classList.add('gone'); }, 350); });
            snd('correct'); matched++;
            if (matched === ex.pairs.length) setTimeout(() => { api.setReady(true); api.autoCheck(); }, 450);
          } else {
            mistakes++; snd('wrong');
            [a, c].forEach(x => { x.classList.remove('sel'); x.classList.add('bad', 'shake'); setTimeout(() => x.classList.remove('bad', 'shake'), 450); });
          }
        }
      };
      all.forEach(b => b.onclick = () => tap(b));
      return { evaluate: () => matched === ex.pairs.length ? { ok: true, kind: 'exact', correct: '' } : null, onKey: k => all[k - 1] && tap(all[k - 1]) };
    }
    case 'build': {
      root.innerHTML = `<div class="ex-title">${t('translate')}</div><div class="speech-row">${mascot('idle', 90)}<div class="bubble">${esc(ex.prompt)}</div></div>
        <div class="answer-area" id="ans"></div><div class="bank" id="bank">${ex.tiles.map((w, i) => `<button class="tile" data-t="${i}">${esc(w)}</button>`).join('')}</div>`;
      const ans = $('#ans', root), order = [];
      const redraw = () => {
        ans.innerHTML = order.map(i => `<button class="tile" data-a="${i}">${esc(ex.tiles[i])}</button>`).join('');
        $$('[data-a]', ans).forEach(b => b.onclick = () => { order.splice(order.indexOf(+b.dataset.a), 1); $(`[data-t="${b.dataset.a}"]`, root).classList.remove('used'); snd('tap'); redraw(); });
        api.setReady(order.length > 0);
      };
      $$('[data-t]', root).forEach(b => b.onclick = () => { if (b.classList.contains('used')) return; b.classList.add('used'); order.push(+b.dataset.t); say(ex.tiles[+b.dataset.t]); redraw(); });
      return {
        evaluate: () => {
          if (!order.length) return null;
          const input = order.map(i => ex.tiles[i]).join(' ');
          const r = E.checkText(input, ex.answers);
          $$('.tile', root).forEach(b => b.disabled = true);
          if (r.ok) say(it.target);
          return { ok: r.ok && r.kind !== 'typo', kind: r.kind === 'typo' ? 'exact' : r.kind, correct: it.target, meaning: E.first(it.src) };
        },
      };
    }
    case 'translate':
    case 'dictation': {
      const isDict = ex.type === 'dictation';
      root.innerHTML = isDict
        ? `<div class="ex-title">${t('typeHeard')}</div><div class="listen-row">${speakerBtn(ex.audio, 'big')}${speakerBtn(ex.audio, 'slow', 0.6)}</div>`
        : `<div class="ex-title">${t('translate')}</div><div class="speech-row">${mascot('idle', 90)}<div class="bubble say">${speakerBtn(ex.prompt)}<span>${esc(ex.prompt)}</span></div></div>`;
      root.insertAdjacentHTML('beforeend', `<textarea class="field" id="txt" placeholder="${t('typeHere')}" autocomplete="off" autocapitalize="off" spellcheck="false" lang="${isDict ? api.course.target : api.course.from}"></textarea>`);
      bindSpeakers(root); setTimeout(() => say(isDict ? ex.audio : ex.prompt), 300);
      const ta = $('#txt', root);
      ta.oninput = () => api.setReady(ta.value.trim().length > 0);
      setTimeout(() => ta.focus({ preventScroll: true }), 50);
      return {
        evaluate: () => {
          const input = ta.value.trim(); if (!input) return null;
          const extra = P.data.accepted[`${api.course.id}|${it.target}`] || [];
          const r = E.checkText(input, [...ex.answers, ...extra]);
          ta.disabled = true;
          return { ok: r.ok, kind: r.kind, correct: r.ok ? r.best : ex.answers[0], meaning: isDict ? E.first(it.src) : it.target, input };
        },
      };
    }
    case 'fill': {
      root.innerHTML = `<div class="ex-title">${t('fillBlank')}</div>
        <div class="speech-row">${mascot('idle', 80)}<div><div class="fill-sentence">${esc(ex.display).replace('____', '<span class="blank" id="blank">&nbsp;</span>')}</div><div class="muted">${esc(ex.hint)}</div></div></div>`;
      const ch = choice('.opt', ex.options, `<div class="grid2">${optList()}</div>`, i => { $('#blank', root).textContent = ex.options[i].label; });
      return {
        evaluate: () => {
          const p = ch.get(); if (p < 0) return null;
          const ok = p === ex.answer || E.plain(ex.options[p].label) === E.plain(ex.options[ex.answer].label);
          ch.mark(ok); if (ok) say(it.target);
          return { ok, kind: 'exact', correct: it.target, meaning: E.first(it.src) };
        }, onKey: k => ch.pick(k - 1),
      };
    }
    case 'speak': {
      root.innerHTML = `<div class="ex-title">${t('speakThis')}</div><div class="speech-row">${mascot('idle', 90)}<div class="bubble say">${speakerBtn(ex.prompt)}<span>${esc(ex.prompt)}</span></div></div>
        <p class="muted">${esc(ex.hint)}</p><button class="mic" id="mic">🎤 ${t('tapToSpeak')}</button><p class="center" id="heard"></p>`;
      bindSpeakers(root);
      let result = null;
      $('#mic', root).onclick = async () => {
        const mic = $('#mic', root); mic.classList.add('rec'); mic.textContent = '🎤 ' + t('listening');
        try {
          const outs = await listen(api.course.tts);
          mic.classList.remove('rec'); mic.textContent = '🎤 ' + t('tapToSpeak');
          if (!outs.length) return;
          // similarité entre ce qui a été entendu et la phrase attendue
          const target = E.plain(it.target);
          const score = Math.max(...outs.map(o => { const p = E.plain(o); return 1 - E.lev(p, target) / Math.max(p.length, target.length); }));
          $('#heard', root).innerHTML = `${t('heard')} <b>« ${esc(outs[0])} »</b>`;
          result = { ok: score >= 0.75, kind: 'exact', correct: it.target, meaning: E.first(it.src) };
          api.setReady(true); api.autoCheck();
        } catch (e) {
          mic.classList.remove('rec'); mic.textContent = '🎤 ' + t('tapToSpeak');
          $('#heard', root).textContent = t('speakUnavailable');
        }
      };
      return { evaluate: () => result };
    }
  }
}

// ───────── Hors ligne (service worker) & installation ─────────
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').then(() => navigator.serviceWorker.ready).then(() => { swReady = true; }).catch(() => {});
}
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; });

boot();
