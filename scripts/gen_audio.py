"""Génère les voix naturelles de Gidro avec Kokoro (modèle open source, licence Apache 2.0).
Usage : python scripts/gen_audio.py textes.json  (lancé automatiquement par GitHub Actions)"""
import hashlib, json, os, subprocess, sys
import soundfile as sf
from kokoro_onnx import Kokoro

# langue cible → (voix Kokoro, langue espeak)
VOICES = {'en': ('af_heart', 'en-us'), 'es': ('ef_dora', 'es'), 'fr': ('ff_siwis', 'fr-fr')}
ROOT = 'public/audio'
# Style « dessin animé » : voix plus aiguë et pétillante (hauteur +25 %, même rythme), un peu compressée.
# Mettre STYLE = 'natural' pour revenir à la voix d'origine.
STYLE = 'cartoon'
PITCH = 1.25
def cartoon(sr):
    return (f'asetrate={sr}*{PITCH},aresample={sr},atempo={1 / PITCH * 1.04:.4f},highpass=f=120,'
            'acompressor=threshold=-18dB:ratio=3:attack=5:release=60,volume=1.5,')
TRIM = ('silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
        'silenceremove=start_periods=1:start_threshold=-45dB,areverse,apad=pad_dur=0.08')

texts = json.load(open(sys.argv[1], encoding='utf-8'))
kokoro = Kokoro('models/kokoro-v1.0.onnx', 'models/voices-v1.0.bin')
index, made = {}, 0
for cid, d in texts.items():
    voice, lang = VOICES[d['lang']]
    folder = f'{ROOT}/{cid}'
    os.makedirs(folder, exist_ok=True)
    files = {}
    for text in d['items']:
        h = hashlib.sha1(f'{voice}|{STYLE}|{text}'.encode()).hexdigest()[:12]
        path = f'{folder}/{h}.mp3'
        if not os.path.exists(path):
            speed = 0.9 if len(text.split()) <= 2 else 0.95
            samples, sr = kokoro.create(text, voice=voice, speed=speed, lang=lang)
            sf.write('/tmp/clip.wav', samples, sr)
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', '/tmp/clip.wav', '-af', (cartoon(sr) if STYLE == 'cartoon' else '') + TRIM,
                            '-ac', '1', '-ar', '24000', '-b:a', '48k', path], check=True)
            made += 1
        files[text] = h
    keep = {f'{h}.mp3' for h in files.values()}
    for f in os.listdir(folder):
        if f not in keep:
            os.remove(f'{folder}/{f}')
    index[cid] = {'voice': voice, 'style': STYLE, 'files': files}
    print(f'{cid}: {len(files)} clips ({voice})')
with open(f'{ROOT}/index.json', 'w', encoding='utf-8') as f:
    json.dump(index, f, ensure_ascii=False, separators=(',', ':'))
print(f'{made} nouveaux fichiers audio')
