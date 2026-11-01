"""Monta a aula narrada "Redutor: troca rotação por torque" (public/media/aulas/redutor-rotacao-torque.*).

Uso: python build_lesson_redutor.py <pasta com as imagens> <pasta de saída>
Imagens (capturas do próprio projeto, ver ASSET_REGISTRY): a-iso.png, c-cut-zoom.png (lab 3D motor-gearbox, 1520×855)
e d-schematic.png (esquema MotorGearboxSchematic).
Voz: Kokoro-82M (pesos Apache-2.0), voz pf_dora, via kokoro-onnx (MIT). Pasta dos modelos em KOKORO_DIR.
Saída: .mp4 (H.264 + AAC mono, −16 LUFS alvo), .vtt e .jpg (pôster).
"""
import os
import subprocess
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

src, out = sys.argv[1:3]
M = os.environ.get('KOKORO_DIR', 'D:/tts-kokoro/')
VOICE = 'pf_dora'
SPEED = 0.85
SR = 24000
GAP_IN = 0.15
GAP_OUT = 0.6
NAME = 'redutor-rotacao-torque'

# (imagem, recorte w:h:x:y na captura (sintaxe do crop do ffmpeg), trechos). Cada trecho é uma lista de (legenda, fala) — fala None = igual à legenda.
SEGMENTS = [
    ('a-iso.png', '1120:630:280:150', [
        [('Neste conjunto, um motor elétrico aciona um redutor de um estágio. Para que serve o redutor?', None)],
        [('O motor gira rápido. Muitas máquinas precisam de giro mais lento e de mais torque.', None)],
    ]),
    ('c-cut-zoom.png', '1120:630:300:190', [
        [('Entre o motor e o redutor fica o acoplamento elástico, que liga os dois eixos.', None)],
        [('Dentro da carcaça, o pinhão de 14 dentes, no eixo de entrada,',
          'Dentro da carcaça, o pinhão de catorze dentes, no eixo de entrada,'),
         ('engrena na coroa de 43 dentes, no eixo de saída.', 'engrena na coroa de quarenta e três dentes, no eixo de saída.')],
        [('A relação é o número de dentes da coroa dividido pelo do pinhão:',
          None),
         ('43 ÷ 14, cerca de 3,07.', 'quarenta e três dividido por catorze, cerca de três vírgula zero sete.')],
        [('Então a saída gira cerca de três vezes mais devagar, e no sentido contrário.', None),
         ('Em troca, o torque na saída fica cerca de três vezes maior, menos as perdas.', None)],
    ]),
    ('d-schematic.png', None, [
        [('No esquema, compare os dois diâmetros: a coroa é maior que o pinhão na mesma proporção do número de dentes.', None)],
        [('Na manutenção, a relação real, o lubrificante e as folgas vêm da placa e do manual do fabricante.', None)],
    ]),
    ('a-iso.png', '1120:630:280:150', [
        [('Agora responda à pergunta e depois veja o conjunto girando no laboratório 3D.', None)],
    ]),
]


def fmt(t):
    return f'{int(t // 3600):02d}:{int(t % 3600 // 60):02d}:{t % 60:06.3f}'


def trim(a, thr=0.004):
    idx = np.where(np.abs(a) > thr)[0]
    pad = int(0.03 * SR)
    return a if not len(idx) else a[max(0, idx[0] - pad): idx[-1] + pad]


k = Kokoro(M + 'kokoro-v1.0.onnx', M + 'voices-v1.0.bin')
audio = [np.zeros(int(0.4 * SR), np.float32)]
t = 0.4
cues = []
seg_bounds = [0.0]
for si, (_, _, groups) in enumerate(SEGMENTS):
    for gi, group in enumerate(groups):
        for ci, (cap, spoken) in enumerate(group):
            a, sr = k.create(spoken or cap, voice=VOICE, speed=SPEED, lang='pt-br')
            assert sr == SR
            a = trim(a.astype(np.float32))
            cues.append((t, t + len(a) / SR, cap))
            audio.append(a)
            t += len(a) / SR
            last = si == len(SEGMENTS) - 1 and gi == len(groups) - 1 and ci == len(group) - 1
            if not last:
                gap = GAP_IN if ci < len(group) - 1 else GAP_OUT
                n = int(round(gap * SR))
                audio.append(np.zeros(n, np.float32))
                t += n / SR
    seg_bounds.append(t)
tail = 1.0
audio.append(np.zeros(int(tail * SR), np.float32))
total = t + tail
seg_bounds[-1] = total
sf.write(f'{out}/{NAME}-narration.wav', np.concatenate(audio), SR)

# Vídeo: cada imagem com zoom lento (zoompan) pela duração do segmento; transições cortadas.
inputs, chains = [], []
for i, (img, crop, _) in enumerate(SEGMENTS):
    dur = seg_bounds[i + 1] - seg_bounds[i]
    frames = int(round(dur * 25))
    inputs += ['-loop', '1', '-framerate', '25', '-t', f'{dur:.3f}', '-i', f'{src}/{img}']
    if crop:
        base = f'crop={crop},scale=2560:1440'
    else:  # esquema 2:1 centralizado num quadro 16:9 com o fundo do desenho
        base = 'scale=2400:-1,pad=2560:1440:(ow-iw)/2:(oh-ih)/2:color=0x0f1216'
    chains.append(f"[{i}:v]{base},zoompan=z='1+0.05*on/{frames}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1280x720:fps=25,trim=end_frame={frames},setsar=1[v{i}]")
n = len(SEGMENTS)
graph = ';'.join(chains) + ';' + ''.join(f'[v{i}]' for i in range(n)) + f'concat=n={n}:v=1:a=0,format=yuv420p[v]'
graph += f';[{n}:a]loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100[a]'
subprocess.run(['ffmpeg', '-y', '-v', 'error', *inputs, '-i', f'{out}/{NAME}-narration.wav', '-filter_complex', graph,
                '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-c:a', 'aac', '-b:a', '128k',
                '-ac', '1', '-movflags', '+faststart', '-t', f'{total:.3f}', f'{out}/{NAME}.mp4'], check=True)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', '2', '-i', f'{out}/{NAME}.mp4', '-frames:v', '1', '-q:v', '4', f'{out}/{NAME}.jpg'], check=True)

with open(f'{out}/{NAME}.vtt', 'w', encoding='utf8', newline='\n') as fh:
    fh.write('WEBVTT\n')
    for s, e, cap in cues:
        fh.write(f'\n{fmt(s)} --> {fmt(e)}\n{cap}\n')
words = sum(len(c[2].split()) for c in cues)
speech = sum(e - s for s, e, _ in cues)
print('total', round(total, 2), 'cues', len(cues), 'wpm', round(words / speech * 60))
