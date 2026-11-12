// Audio hors ligne : synthèse vocale de l'appareil + effets sonores générés (aucun fichier à télécharger)
let voices = [];
const synth = window.speechSynthesis;
function loadVoices() { voices = synth ? synth.getVoices() : []; }
if (synth) { loadVoices(); synth.addEventListener?.('voiceschanged', loadVoices); }

// Voix « gadgets » de macOS / iOS (robots, cloches…) à ne jamais choisir automatiquement — noms anglais et français
const NOVELTY = /^(albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|pipe organ|superstar|trinoids|whisper|wobble|zarvox|deranged|hysterical|bonnes nouvelles|mauvaises nouvelles|bouffon|bulles|cloches|murmure|orgue|trino[iï]des|violoncelles|ondulation|fred|junior|ralph|kathy|grandma|grandpa|rocko|eddy|flo|reed|sandy|shelley)\b/i;
// Voix de bonne qualité connues (macOS, iOS, Windows, Android)
const GOOD = /(premium|enhanced|am[ée]lior|natural|neural|siri|samantha|daniel|karen|moira|tessa|rishi|serena|thomas|am[ée]lie|audrey|aurelie|marie|m[óo]nica|paulina|jorge|juan|marisol|aria|jenny|guy|denise|henri|elvira|alvaro|google)/i;

const norm = l => (l || '').replace('_', '-').toLowerCase();

function score(v, lang) {
  const vl = norm(v.lang), want = norm(lang);
  let s = 0;
  if (vl === want) s += 20; else if (vl.split('-')[0] === want.split('-')[0]) s += 10; else return -1;
  if (NOVELTY.test(v.name)) s -= 100;
  if (GOOD.test(v.name)) s += 30;
  if (/microsoft/i.test(v.name)) s += 10;
  if (v.localService) s += 12;               // fonctionne sans Internet
  else if (!navigator.onLine) return -1;     // voix réseau inutilisable hors ligne
  return s;
}

// Liste des voix utilisables pour une langue, de la meilleure à la moins bonne
export function voicesFor(lang) {
  if (!voices.length) loadVoices();
  return voices.map(v => ({ v, s: score(v, lang) })).filter(x => x.s >= 0)
    .sort((a, b) => b.s - a.s).map(x => x.v);
}

let preferred = {}; // { 'en-US': 'Samantha' } — choisi dans les réglages
export function setPreferredVoices(map) { preferred = map || {}; }

export function voiceFor(lang) {
  const list = voicesFor(lang);
  const pick = preferred[lang] && list.find(v => v.name === preferred[lang]);
  return pick || list.find(v => !NOVELTY.test(v.name)) || list[0] || null;
}
export const ttsAvailable = lang => !!synth && !!voiceFor(lang);

export function speak(text, lang, rate = 1, voice) {
  if (!synth) return;
  synth.cancel();
  const v = voice || voiceFor(lang);
  const u = new SpeechSynthesisUtterance(text);
  u.lang = v?.lang || lang;
  if (v) u.voice = v;
  u.rate = rate; u.pitch = 1;
  // Si une voix en ligne échoue (connexion coupée), on rejoue avec la meilleure voix locale
  u.onerror = e => {
    if (v && !v.localService && e.error !== 'interrupted' && e.error !== 'canceled') {
      const local = voicesFor(lang).find(x => x.localService && !NOVELTY.test(x.name));
      if (local) speak(text, lang, rate, local);
    }
  };
  // Contournement Chrome : la synthèse reste parfois en pause
  if (synth.paused) synth.resume();
  synth.speak(u);
}

// ───────── Effets sonores (Web Audio) ─────────
let ctx;
function tone(freqs, dur = 0.12, type = 'sine', gain = 0.12) {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    let t = ctx.currentTime;
    for (const f of freqs) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur + 0.02);
      t += dur * 0.8;
    }
  } catch {}
}
export const sfx = {
  correct: () => tone([660, 880, 1320], 0.11, 'triangle'),
  wrong: () => tone([220, 165], 0.18, 'square', 0.06),
  tap: () => tone([520], 0.05, 'sine', 0.05),
  done: () => tone([523, 659, 784, 1047, 1319], 0.13, 'triangle'),
  badge: () => tone([784, 988, 1175, 1568], 0.1, 'sine'),
};

// ───────── Reconnaissance vocale ─────────
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
export const speechRecognitionAvailable = () => !!SR;

export function listen(lang) {
  return new Promise((resolve, reject) => {
    if (!SR) return reject(new Error('unavailable'));
    const r = new SR();
    r.lang = lang; r.interimResults = false; r.maxAlternatives = 3;
    try { r.processLocally = true; } catch {}
    let done = false;
    r.onresult = e => { done = true; resolve([...e.results[0]].map(a => a.transcript)); };
    r.onerror = e => { if (!done) reject(new Error(e.error)); };
    r.onend = () => { if (!done) resolve([]); };
    r.start();
  });
}
