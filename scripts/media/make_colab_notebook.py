"""Gera colab/apresentacao_lab3d.ipynb (notebook do Google Colab que grava o vídeo do modo apresentação).

Uso: python scripts/media/make_colab_notebook.py
"""
import json
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))


def md(text):
    return {'cell_type': 'markdown', 'metadata': {}, 'source': text.strip('\n').splitlines(True)}


def code(text):
    return {'cell_type': 'code', 'metadata': {}, 'execution_count': None, 'outputs': [], 'source': text.strip('\n').splitlines(True)}


cells = [
    md('''
# Mecânica Lab: vídeo do modo apresentação (bomba centrífuga)

Este notebook faz no Colab o trabalho pesado, sem usar o seu PC:

1. narração com **Kokoro-82M** (licença Apache-2.0, voz `pf_dora`), conferida com o Whisper;
2. gravação do **modo apresentação** do laboratório 3D, quadro a quadro, em tempo virtual
   (o vídeo sai liso mesmo que a renderização seja lenta);
3. montagem do **MP4 1920×1080** com narração e legendas `.srt`.

**Como usar:** `Ambiente de execução → Alterar o tipo de ambiente → GPU (T4 ou melhor)`, depois
`Ambiente de execução → Executar tudo`. Na célula 2, envie o arquivo `mecanica-lab.zip`
(gerado no PC com `python scripts/media/pack_colab.py`). No fim, o navegador baixa `resultado.zip`.

O modelo 3D é educacional e simplificado; o vídeo mostra esse aviso o tempo todo.
'''),
    code('''
# 1. Máquina do Colab
!nvidia-smi --query-gpu=name,memory.total --format=csv || echo "sem GPU: funciona, só demora mais"
!nproc && free -h | head -2
'''),
    code('''
# 2. Enviar o projeto (mecanica-lab.zip)
import os, zipfile
from google.colab import files
os.chdir('/content')
if not os.path.isdir('/content/mecanica-lab'):
    up = files.upload()
    name = next(iter(up))
    zipfile.ZipFile(name).extractall('/content')
os.chdir('/content/mecanica-lab')
print(os.getcwd(), len(os.listdir('.')), 'itens')
'''),
    code('''
# 3. Ferramentas: Node 20, dependências do projeto, Chromium do Playwright e ffmpeg
!apt-get -qq update > /dev/null && apt-get -qq install -y ffmpeg espeak-ng > /dev/null
!node -v 2>/dev/null | grep -q "^v2[0-9]" || (curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null && apt-get -qq install -y nodejs > /dev/null)
!node -v && npm -v
!npm ci --no-audit --no-fund --loglevel=error
!npx playwright install --with-deps chromium > /dev/null && echo "chromium ok"
'''),
    code('''
# 4. Narração (Kokoro-82M) com conferência por transcrição (Whisper)
!pip -q install kokoro-onnx==0.6.1 soundfile faster-whisper
import os
os.makedirs('/content/kokoro', exist_ok=True)
base = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/'
for f in ['kokoro-v1.0.onnx', 'voices-v1.0.bin']:
    if not os.path.exists('/content/kokoro/' + f):
        !wget -q -O /content/kokoro/{f} {base}{f}
os.environ['KOKORO_DIR'] = '/content/kokoro/'
!python scripts/media/narrate-presentation.py centrifugal-pump --asr
'''),
    code('''
# 5. Compilar o site e servir localmente (porta 4173)
!npx vite build --logLevel error && echo "build ok"
import subprocess, time, urllib.request
server = subprocess.Popen(['npx', 'vite', 'preview', '--port', '4173', '--strictPort'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
for _ in range(60):
    try:
        urllib.request.urlopen('http://localhost:4173/'); print('servidor no ar'); break
    except Exception:
        time.sleep(1)
'''),
    code('''
# 6. Prévia de 8 s: testa a placa de vídeo e mostra o resultado antes da gravação longa
import subprocess, time
def previa(gpu):
    cmd = ['node', 'scripts/media/capture-presentation.mjs', '--seconds', '8', '--out', 'saida/previa']
    if gpu: cmd += ['--gpu', gpu]
    t = time.time()
    r = subprocess.run(cmd, capture_output=True, text=True)
    print(f'--- modo {gpu or "software"}: {time.time() - t:.0f} s')
    print(r.stdout[-1200:], r.stderr[-800:])
    return r.returncode == 0, r.stdout
SOFTWARE = ('SwiftShader', 'llvmpipe', 'sem WebGL')
USE_GPU = None
for modo in ['vulkan', 'egl']:
    ok, out = previa(modo)
    if ok and not any(s in out for s in SOFTWARE):
        USE_GPU = modo
        break
if USE_GPU:
    print('Usando a GPU (modo', USE_GPU + ')')
else:
    print('Chrome sem aceleração por GPU aqui: usando renderização por software (mais lenta, mesmo resultado).')
    ok, out = previa(None)
    assert ok, 'A prévia falhou também em software: veja as mensagens acima.'
from IPython.display import Video
Video('saida/previa/apresentacao.mp4', embed=True, width=720)
'''),
    code('''
# 7. Gravação completa (com legendas embutidas: troque LEGENDAS para False para vídeo limpo + .srt)
LEGENDAS = True
# Pode levar de 20 min (GPU) a ~1 h (software). Deixe esta aba aberta: o Colab gratuito desconecta abas esquecidas.
args = ['--out', 'saida/apresentacao'] + (['--gpu', USE_GPU] if USE_GPU else []) + (['--legendas'] if LEGENDAS else [])
!node scripts/media/capture-presentation.mjs {' '.join(args)}
'''),
    code('''
# 8. Baixar: vídeo, legendas, linha do tempo e a narração (para pôr em public/media/apresentacao/ no PC)
!cd saida && rm -rf previa && cp -r ../public/media/apresentacao narracao && zip -qr ../resultado.zip . && ls -la
from google.colab import files
files.download('resultado.zip')
'''),
]

nb = {
    'nbformat': 4,
    'nbformat_minor': 5,
    'metadata': {
        'accelerator': 'GPU',
        'colab': {'provenance': [], 'gpuType': 'T4'},
        'kernelspec': {'name': 'python3', 'display_name': 'Python 3'},
        'language_info': {'name': 'python'},
    },
    'cells': cells,
}
out = os.path.join(ROOT, 'colab', 'apresentacao_lab3d.ipynb')
os.makedirs(os.path.dirname(out), exist_ok=True)
json.dump(nb, open(out, 'w', encoding='utf8', newline='\n'), ensure_ascii=False, indent=1)
print(out)
