"""Regrava a narração de uma aula em vídeo com Kokoro-82M (Apache-2.0), mantendo as imagens do vídeo atual.

Uso: python renarrate.py <video.mp4> <legendas.vtt> <pasta de trabalho> <voz>
Saída na pasta de trabalho: out.mp4, out.vtt, cues.json (tempos novos).
Cada cue da legenda antiga vira um WAV; cues contíguos (mesmo trecho) ficam a GAP_IN um do outro e trechos a GAP_OUT.
O pedaço de vídeo de cada cue (do início dele ao início do próximo) é reajustado (setpts) para a nova duração.
"""
import json
import os
import re
import subprocess
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

video, vtt, work, voice = sys.argv[1:5]
M = os.environ.get('KOKORO_DIR', 'D:/tts-kokoro/')  # kokoro-v1.0.onnx e voices-v1.0.bin (releases do kokoro-onnx)
SR = 24000
GAP_IN = 0.15
GAP_OUT = 0.6
LEAD = 0.25  # silêncio antes da primeira fala
SPEED = float(sys.argv[5]) if len(sys.argv) > 5 else 0.85
# Pronúncia: a legenda mantém o texto original; só a fala muda.
SPOKEN = {'tipo NU.': 'tipo ene, u.'}


def ts(t):
    h, m, s = t.split(':')
    return int(h) * 3600 + int(m) * 60 + float(s)


def fmt(t):
    h = int(t // 3600)
    m = int(t % 3600 // 60)
    return f'{h:02d}:{m:02d}:{t % 60:06.3f}'


cues = []
for block in open(vtt, encoding='utf8').read().split('\n\n'):
    m = re.search(r'([\d:.]+) --> ([\d:.]+)\n(.+)', block, re.S)
    if m:
        cues.append({'s': ts(m.group(1)), 'e': ts(m.group(2)), 'text': ' '.join(m.group(3).split())})

vdur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video]).decode())

k = Kokoro(M + 'kokoro-v1.0.onnx', M + 'voices-v1.0.bin')


def trim(a, thr=0.004):
    idx = np.where(np.abs(a) > thr)[0]
    if not len(idx):
        return a
    pad = int(0.03 * SR)
    return a[max(0, idx[0] - pad): idx[-1] + pad]


audio = [np.zeros(int(LEAD * SR), dtype=np.float32)]
t = LEAD
for i, c in enumerate(cues):
    spoken = c['text']
    for a_, b_ in SPOKEN.items():
        spoken = spoken.replace(a_, b_)
    a, sr = k.create(spoken, voice=voice, speed=SPEED, lang='pt-br')
    assert sr == SR
    a = trim(a.astype(np.float32))
    sf.write(f'{work}/cue_{i:02d}.wav', a, SR)
    c['ns'] = t
    c['ne'] = t + len(a) / SR
    audio.append(a)
    t = c['ne']
    if i + 1 < len(cues):
        contiguous = cues[i + 1]['s'] - c['e'] < 0.05
        gap = GAP_IN if contiguous else GAP_OUT
        audio.append(np.zeros(int(round(gap * SR)), dtype=np.float32))
        t += int(round(gap * SR)) / SR
tail = max(0.6, vdur - cues[-1]['e'])
audio.append(np.zeros(int(tail * SR), dtype=np.float32))
total = t + int(tail * SR) / SR
sf.write(f'{work}/narration.wav', np.concatenate(audio), SR)

# Vídeo: pedaço antigo de cada cue → nova duração
old_b = [0.0] + [c['s'] for c in cues[1:]] + [vdur]
new_b = [0.0] + [c['ns'] for c in cues[1:]] + [total]
parts = []
for i in range(len(cues)):
    o0, o1 = old_b[i], old_b[i + 1]
    n0, n1 = new_b[i], new_b[i + 1]
    f = (n1 - n0) / (o1 - o0)
    parts.append(f'[0:v]trim=start={o0:.3f}:end={o1:.3f},setpts=(PTS-STARTPTS)*{f:.5f}[v{i}]')
    cues[i]['factor'] = round(f, 3)
graph = ';'.join(parts) + ';' + ''.join(f'[v{i}]' for i in range(len(cues))) + f'concat=n={len(cues)}:v=1:a=0,fps=25,format=yuv420p[v]'
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', video, '-i', f'{work}/narration.wav', '-filter_complex',
                graph + ';[1:a]loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100[a]', '-map', '[v]', '-map', '[a]',
                '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-c:a', 'aac', '-b:a', '128k', '-ac', '1',
                '-movflags', '+faststart', '-t', f'{total:.3f}', f'{work}/out.mp4'], check=True)

with open(f'{work}/out.vtt', 'w', encoding='utf8', newline='\n') as fh:
    fh.write('WEBVTT\n')
    for c in cues:
        fh.write(f"\n{fmt(c['ns'])} --> {fmt(c['ne'])}\n{c['text']}\n")
json.dump({'total': total, 'cues': cues}, open(f'{work}/cues.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('total', round(total, 2), 'factors', [c['factor'] for c in cues])
