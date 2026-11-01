"""Gera a narração do modo apresentação com Kokoro-82M (Apache-2.0), uma fala por tomada.

Uso:
  python scripts/media/narrate-presentation.py [máquina] [--asr]

- Lê src/data/presentation/<máquina>.json (padrão: centrifugal-pump).
- O texto falado é o campo "narration" da tomada ou, sem ele, a legenda ("caption").
- Grava public/media/apresentacao/<máquina>/<id>.mp3 (ou .wav, se não houver ffmpeg) e narracao.json
  com a duração de cada fala. O app e o script de captura usam esse arquivo para esticar as tomadas.
- --asr: transcreve cada fala com faster-whisper e mostra a taxa de erro de palavras (a voz não pode ser
  ouvida por quem gera; a transcrição é a conferência).

Modelos: KOKORO_DIR (padrão D:/tts-kokoro/) com kokoro-v1.0.onnx e voices-v1.0.bin (releases do kokoro-onnx).
Voz pf_dora, velocidade 0,85, como nas aulas narradas do projeto.
"""
import json
import os
import re
import shutil
import subprocess
import sys
import unicodedata

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ASR = '--asr' in sys.argv
machine = args[0] if args else 'centrifugal-pump'
M = os.environ.get('KOKORO_DIR', 'D:/tts-kokoro/')
VOICE = os.environ.get('KOKORO_VOICE', 'pf_dora')
SPEED = float(os.environ.get('KOKORO_SPEED', '0.85'))
SR = 24000

# A legenda mantém o texto escrito; só a fala muda (termos em inglês e siglas).
SPOKEN = {
    'back-pull-out': 'béque pul áute',
    'Back-pull-out': 'Béque pul áute',
}

script = json.load(open(os.path.join(ROOT, 'src', 'data', 'presentation', f'{machine}.json'), encoding='utf8'))
out_dir = os.path.join(ROOT, 'public', 'media', 'apresentacao', machine)
os.makedirs(out_dir, exist_ok=True)
has_ffmpeg = shutil.which('ffmpeg') is not None

k = Kokoro(os.path.join(M, 'kokoro-v1.0.onnx'), os.path.join(M, 'voices-v1.0.bin'))


def trim(a, thr=0.004):
    idx = np.where(np.abs(a) > thr)[0]
    if not len(idx):
        return a
    pad = int(0.03 * SR)
    return a[max(0, idx[0] - pad): idx[-1] + pad]


manifest = {'voice': f'Kokoro-82M {VOICE} (velocidade {SPEED})', 'license': 'Apache-2.0', 'shots': {}}
texts = {}
for shot in script['shots']:
    text = shot.get('narration') or shot['caption']
    spoken = text
    for a_, b_ in SPOKEN.items():
        spoken = spoken.replace(a_, b_)
    audio, sr = k.create(spoken, voice=VOICE, speed=SPEED, lang='pt-br')
    assert sr == SR
    audio = trim(audio.astype(np.float32))
    wav = os.path.join(out_dir, f'{shot["id"]}.wav')
    sf.write(wav, audio, SR)
    name = f'{shot["id"]}.wav'
    if has_ffmpeg:
        mp3 = os.path.join(out_dir, f'{shot["id"]}.mp3')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', '96k', mp3], check=True)
        if not ASR:
            os.remove(wav)
        name = f'{shot["id"]}.mp3'
    seconds = round(len(audio) / SR, 2)
    manifest['shots'][shot['id']] = {'file': name, 'seconds': seconds}
    texts[shot['id']] = (text, wav)
    flag = '  (mais longa que a tomada: a tomada vai esticar)' if seconds + 0.9 > shot['duration'] else ''
    print(f'{shot["id"]}: {seconds:.1f} s{flag}')

json.dump(manifest, open(os.path.join(out_dir, 'narracao.json'), 'w', encoding='utf8', newline='\n'), ensure_ascii=False, indent=2)
print('narração salva em', out_dir)

if ASR:
    from faster_whisper import WhisperModel

    def norm(t):
        t = unicodedata.normalize('NFKD', t.lower())
        t = ''.join(c for c in t if not unicodedata.combining(c))
        return re.sub(r'[^a-z0-9 ]+', ' ', t).split()

    def wer(r, h):
        d = list(range(len(h) + 1))
        for i in range(1, len(r) + 1):
            prev, d[0] = d[0], i
            for j in range(1, len(h) + 1):
                cur = d[j]
                d[j] = min(d[j] + 1, d[j - 1] + 1, prev + (r[i - 1] != h[j - 1]))
                prev = cur
        return d[len(h)] / max(1, len(r))

    model = WhisperModel('small', device='cpu', compute_type='int8')
    worst = 0.0
    for sid, (text, wav) in texts.items():
        # Áudio já em 16 kHz como array: evita o decode_audio do faster-whisper, que quebra com versões novas do PyAV
        data, rate = sf.read(wav, dtype='float32', always_2d=False)
        if data.ndim > 1:
            data = data.mean(axis=1)
        if rate != 16000:
            data = np.interp(np.arange(0, len(data), rate / 16000), np.arange(len(data)), data).astype(np.float32)
        segs, _ = model.transcribe(data, language='pt', beam_size=5)
        hyp = ' '.join(s.text for s in segs).strip()
        w = wer(norm(text), norm(hyp))
        worst = max(worst, w)
        print(f'== {sid}  WER={w:.3f}\n   {hyp}')
        if has_ffmpeg:
            os.remove(wav)
    print(f'pior WER: {worst:.3f} (termos em inglês, como back-pull-out, costumam contar como erro)')
