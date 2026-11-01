"""Transcreve WAVs com Whisper e mede a taxa de erro de palavras (WER) contra o texto de referência."""
import re
import sys
import unicodedata
from faster_whisper import WhisperModel

ref_path, *wavs = sys.argv[1:]
ref = open(ref_path, encoding='utf8').read()


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


m = WhisperModel('small', device='cpu', compute_type='int8')
for w in wavs:
    segs, _ = m.transcribe(w, language='pt', beam_size=5)
    hyp = ' '.join(s.text for s in segs)
    print(f'== {w.split("/")[-1]}  WER={wer(norm(ref), norm(hyp)):.3f}')
    print(hyp.strip())
