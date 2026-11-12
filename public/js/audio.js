// Audio hors ligne : synthèse vocale de l'appareil + effets sonores générés (aucun fichier à télécharger)
let voices = [];
const synth = window.speechSynthesis;
function loadVoices() { voices = synth ? synth.getVoices() : []; }
if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }

export function voiceFor(lang) {
  if (!voices.length) loadVoices();
  const base = lang.split('-')[0];
  const cands = voices.filter(v => v.lang.replace('_', '-').toLowerCase().startsWith(base));
  // préférer les voix locales (fonctionnent hors ligne)
  return cands.find(v => v.localService && v.lang.replace('_', '-') === lang) || cands.find(v => v.localService) || cands[0] || null;
}
export const ttsAvailable = lang => !!synth && !!voiceFor(lang);

export function speak(text, lang, rate = 1) {
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  const v = voiceFor(lang); if (v) u.voice = v;
  u.rate = rate;
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
    // Chrome Android / Edge : utilise le modèle local si installé
    try { r.processLocally = true; } catch {}
    let done = false;
    r.onresult = e => { done = true; resolve([...e.results[0]].map(a => a.transcript)); };
    r.onerror = e => { if (!done) reject(new Error(e.error)); };
    r.onend = () => { if (!done) resolve([]); };
    r.start();
  });
}
