"""Gera colab/estudio_3d_a100.ipynb: o estúdio 3D da bomba centrífuga rodando inteiro no Google Colab (GPU).

O notebook é autossuficiente: os scripts do estúdio (modelo Blender, filme, narração, montagem) vão embutidos
nele, então basta abrir o .ipynb no Colab e "Executar tudo" — não precisa enviar o projeto.

Uso: node asset-pipeline/film/export-film-data.mjs && python scripts/media/make_colab_studio.py
"""
import json
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
EMBED = [
    'asset-pipeline/blender/build_centrifugal_pump.py',
    'asset-pipeline/blender/render_pump_film.py',
    'asset-pipeline/film/compose_film.py',
    'asset-pipeline/film/pump_film.json',
    'scripts/media/narrate-presentation.py',
    'src/data/presentation/centrifugal-pump.json',
]
BLENDER_URL = 'https://download.blender.org/release/Blender5.2/blender-5.2.2-linux-x64.tar.xz'
# Do arquivo oficial blender-5.2.2.sha256 (download.blender.org)
BLENDER_SHA256 = '84098912789dc450e95697c4184fb8a90acbe5111c2ba4aede3fecb57806a168'


def md(text):
    return {'cell_type': 'markdown', 'metadata': {}, 'source': text.strip('\n').splitlines(True)}


def code(text, title=None):
    meta = {'cellView': 'form'} if title else {}
    return {'cell_type': 'code', 'metadata': meta, 'execution_count': None, 'outputs': [], 'source': text.strip('\n').splitlines(True)}


cells = [
    md('''
# Mecânica Lab · Estúdio 3D da bomba centrífuga (GPU do Colab)

Tudo o que é pesado roda aqui, não no seu PC:

1. **modelo 3D** da bomba construído por script no **Blender 5.2** (versão de filme, mais detalhada);
2. **narração** das 15 tomadas com **Kokoro-82M** (Apache-2.0, voz `pf_dora`), conferida com Whisper;
3. **filme da desmontagem** renderizado em **Cycles** na GPU (OptiX), com corte, vista explodida e as 9 etapas;
4. **giro 360°** e **vista explodida em laço** para portfólio;
5. **montagem final**: títulos, legendas, rótulos das peças, aviso de modelo educacional, narração → MP4 + SRT.

**Como usar:** `Ambiente de execução → Alterar o tipo de ambiente → GPU A100` (ou L4/T4), depois
`Ambiente de execução → Executar tudo`. Na célula 1, autorize o Google Drive: os quadros ficam salvos lá e,
se o Colab desconectar, é só executar tudo de novo que ele **continua de onde parou**.

**Duas GPUs:** se a máquina tiver duas placas, a célula 6 usa as duas sozinha (e `PROC_POR_GPU` processos em cada).
Para usar duas sessões do Colab ao mesmo tempo, faça `Arquivo → Salvar uma cópia no Drive` e abra a cópia (a mesma
cópia em duas abas divide o mesmo ambiente; o Colab Pro só deixa uma A100 por vez, então a segunda pode ser L4).
Na cópia, ponha `SENTIDO = "do_fim"`: uma sessão renderiza do começo para o fim, a outra do fim para o começo, as duas
na mesma pasta do Drive, e cada uma pula os quadros que a outra já gravou. Elas se encontram no meio, sem precisar
dividir o trabalho de antemão (a GPU mais rápida faz mais). A montagem (célula 7) roda depois, na sessão "do_inicio";
com `DESLIGAR_NO_FIM`, a sessão "do_fim" se desconecta sozinha ao terminar a parte dela.

O modelo é **educacional e simplificado** (inspirado na família ISO 2858 65-50-160, não é de fabricante).
O vídeo mostra esse aviso o tempo todo.
'''),
    code('''
#@title 0 · Configuração { display-mode: "form" }
QUALIDADE = "alta"  #@param ["rapida", "alta", "4k"]
SENTIDO = "do_inicio"  #@param ["do_inicio", "do_fim"]
PROC_POR_GPU = 2  #@param {type:"integer"}
DESLIGAR_NO_FIM = True  #@param {type:"boolean"}
FAZER_EXTRAS = True  #@param {type:"boolean"}
USAR_DRIVE = True  #@param {type:"boolean"}
PRESETS = {"rapida": ("1920x1080", 32), "alta": ("1920x1080", 96), "4k": ("3840x2160", 64)}
RES, AMOSTRAS = PRESETS[QUALIDADE]
FPS = 30
print("resolução", RES, "| amostras", AMOSTRAS, "| sentido", SENTIDO)
''', title=True),
    code('''
#@title 1 · GPU e pasta de trabalho (Google Drive)
import os, subprocess
gpus = [l for l in subprocess.run(["nvidia-smi", "-L"], capture_output=True, text=True).stdout.splitlines() if l.startswith("GPU")]
print("\\n".join(gpus) or "SEM GPU: troque o ambiente de execução para GPU (funciona em CPU, mas leva muitas horas)")
N_GPU = max(1, len(gpus))
WORK = "/content/estudio_saida"
if USAR_DRIVE:
    try:
        from google.colab import drive
        drive.mount("/content/drive")
        WORK = "/content/drive/MyDrive/MecanicaLab_Estudio"
    except Exception as e:
        print("Drive indisponível, usando o disco do Colab (some se desconectar):", e)
os.makedirs(WORK, exist_ok=True)
print("pasta de trabalho:", WORK)
''', title=True),
]

# Arquivos embutidos
files_src = []
for rel in EMBED:
    with open(os.path.join(ROOT, rel), encoding='utf8') as f:
        body = f.read()
    files_src.append(f'%%writefile /content/estudio/{rel}\n{body}')
cells.append(md('### 2 · Scripts do estúdio (embutidos; gerados por `scripts/media/make_colab_studio.py`)'))
cells.append(code('''
import os
for d in ["asset-pipeline/blender", "asset-pipeline/film", "scripts/media", "src/data/presentation"]:
    os.makedirs("/content/estudio/" + d, exist_ok=True)
'''))
for src in files_src:
    cells.append(code(src))

cells += [
    code(f'''
#@title 3 · Ferramentas: Blender 5.2.2 (oficial, conferido por SHA-256), ffmpeg, fontes IBM Plex, voz Kokoro
import os, hashlib, subprocess
os.chdir("/content/estudio")
!apt-get -qq update > /dev/null && apt-get -qq install -y ffmpeg libgl1 libegl1 libxi6 libxxf86vm1 libxfixes3 libxrender1 libxkbcommon0 libsm6 libice6 > /dev/null
BL = "/content/blender/blender"
if not os.path.exists(BL):
    !wget -q -O /content/blender.tar.xz {BLENDER_URL}
    h = hashlib.sha256(open("/content/blender.tar.xz", "rb").read()).hexdigest()
    assert h == "{BLENDER_SHA256}", "SHA-256 do Blender não confere: " + h
    !mkdir -p /content/blender && tar -xf /content/blender.tar.xz -C /content/blender --strip-components=1 && rm /content/blender.tar.xz
!{{BL}} -b --factory-startup --version | head -1
!pip -q install kokoro-onnx==0.6.1 soundfile faster-whisper pillow numpy
os.makedirs("/content/fontes", exist_ok=True)
for w in ["Regular", "SemiBold"]:
    p = f"/content/fontes/IBMPlexSans-{{w}}.ttf"
    if not os.path.exists(p):
        !wget -q -O {{p}} https://raw.githubusercontent.com/IBM/plex/master/packages/plex-sans/fonts/complete/ttf/IBMPlexSans-{{w}}.ttf
os.makedirs("/content/kokoro", exist_ok=True)
for f in ["kokoro-v1.0.onnx", "voices-v1.0.bin"]:
    if not os.path.exists("/content/kokoro/" + f):
        !wget -q -O /content/kokoro/{{f}} https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/{{f}}
print("ferramentas ok")
''', title=True),
    code('''
#@title 4 · Modelo 3D da bomba (Blender, detalhe de filme) e narração
import json, shutil
os.chdir("/content/estudio")
BLEND = WORK + "/bomba_filme.blend"
if not os.path.exists(BLEND):
    r = subprocess.run([BL, "-b", "--factory-startup", "-P", "asset-pipeline/blender/build_centrifugal_pump.py", "--",
                        "--detail", "film", "--out-blend", BLEND], capture_output=True, text=True)
    print([l for l in r.stdout.splitlines() if l.startswith("MLAB_RESULT")] or r.stdout[-3000:] + r.stderr[-2000:])
    assert os.path.exists(BLEND), "o modelo não foi gerado: veja as mensagens acima"
NARR = WORK + "/narracao"
if not os.path.exists(NARR + "/narracao.json"):
    os.environ["KOKORO_DIR"] = "/content/kokoro/"
    !python scripts/media/narrate-presentation.py centrifugal-pump --asr
    shutil.copytree("public/media/apresentacao/centrifugal-pump", NARR, dirs_exist_ok=True)
print(json.load(open(NARR + "/narracao.json"))["voice"], "|", len(os.listdir(NARR)), "arquivos de narração")
''', title=True),
    code('''
#@title 5 · Prévia: 3 imagens na qualidade final (mede o tempo por quadro antes da renderização longa)
import time, glob
from IPython.display import Image, display
PREV = WORK + "/previa_" + QUALIDADE
t = time.time()
r = subprocess.run([BL, "-b", BLEND, "-P", "asset-pipeline/blender/render_pump_film.py", "--",
                    "--film-json", "asset-pipeline/film/pump_film.json", "--out", PREV, "--res", RES, "--samples", str(AMOSTRAS),
                    "--narration", NARR + "/narracao.json", "--still", "02-funcionamento@0.9,03-pecas@0.9,09-rotor@1.0"],
                   capture_output=True, text=True)
linhas = [l for l in r.stdout.splitlines() if l.startswith("MLAB")]
print("\\n".join(linhas) or r.stdout[-3000:] + r.stderr[-2000:])
por_quadro = (time.time() - t) / 3
tl = json.load(open(PREV + "/timeline.json"))
print(f"render: {tl['render']} | ~{por_quadro:.1f} s por quadro (inclui abrir o Blender)")
print(f"filme: {tl['frames']} quadros ({tl['seconds']:.0f} s) -> estimativa ~{tl['frames'] * por_quadro * 0.8 / 60 / N_GPU:.0f} min com uma sessão")
for p in sorted(glob.glob(PREV + "/still_*.png")):
    display(Image(p, width=900))
''', title=True),
    code('''
#@title 6 · Renderização (filme + extras). Retomável: se cair, execute de novo.
import time
def renderizar(modo, pasta, segundos=None):
    # Vários processos por GPU: enquanto um monta a cena e grava o PNG, o outro usa a placa (A100 de 80 GB sobra memória)
    # Com SENTIDO = "do_fim" (segunda sessão), os processos vão do último quadro para o primeiro e pulam os já gravados
    total = N_GPU * PROC_POR_GPU
    procs = []
    for j in range(total):
        g = j % N_GPU
        parte = j + 1
        env = dict(os.environ, CUDA_VISIBLE_DEVICES=str(g))
        cmd = [BL, "-b", BLEND, "-P", "asset-pipeline/blender/render_pump_film.py", "--", "--film-json", "asset-pipeline/film/pump_film.json",
               "--out", pasta, "--mode", modo, "--res", RES, "--samples", str(AMOSTRAS), "--fps", str(FPS),
               "--narration", NARR + "/narracao.json", "--part", f"{parte}/{total}"] + (["--reverse"] if SENTIDO == "do_fim" else [])
        log = open(f"/content/render_{modo}_{j}.log", "w")
        procs.append((subprocess.Popen(cmd, env=env, stdout=log, stderr=subprocess.STDOUT, text=True), log.name))
    while any(p.poll() is None for p, _ in procs):
        time.sleep(45)
        for _, name in procs:
            prog = [l for l in open(name).read().splitlines() if l.startswith(("MLAB_PROGRESS", "MLAB_PLAN"))]
            print(modo, os.path.basename(name), prog[-1] if prog else "iniciando...", flush=True)
    for p, name in procs:
        txt = open(name).read()
        if p.returncode != 0 or "MLAB_DONE" not in txt:
            print(txt[-4000:])
            raise RuntimeError(f"a renderização ({modo}) falhou: veja o log acima")
    print(modo, "ok")

renderizar("film", WORK + "/quadros_filme")
if FAZER_EXTRAS:
    renderizar("turntable", WORK + "/quadros_giro")
    renderizar("exploded", WORK + "/quadros_explodida")
# A sessão "do_fim" só ajuda a renderizar: a montagem roda na outra. O Colab cobra por hora conectada, então ela se desliga.
if SENTIDO == "do_fim" and DESLIGAR_NO_FIM:
    from google.colab import runtime
    runtime.unassign()
''', title=True),
    code('''
#@title 7 · Montagem: MP4 com narração, legendas embutidas e versão limpa + SRT
import glob
ENT = WORK + "/entregas"
os.makedirs(ENT, exist_ok=True)
def faltam(pasta):
    tl = json.load(open(pasta + "/timeline.json"))
    return tl["frames"] - len(glob.glob(pasta + "/f_*.png"))
pendentes = {p: faltam(WORK + p) for p in ["/quadros_filme"] + (["/quadros_giro", "/quadros_explodida"] if FAZER_EXTRAS else [])}
if any(pendentes.values()):
    print("Ainda faltam quadros (outra sessão pode estar renderizando):", pendentes)
else:
    base = ["python", "asset-pipeline/film/compose_film.py", "--fonts", "/content/fontes"]
    subprocess.run(base + ["--frames", WORK + "/quadros_filme", "--out", ENT + "/bomba_centrifuga_desmontagem.mp4", "--narration-dir", NARR], check=True)
    subprocess.run(base + ["--frames", WORK + "/quadros_filme", "--out", ENT + "/bomba_centrifuga_desmontagem_limpo.mp4", "--narration-dir", NARR, "--no-captions"], check=True)
    if FAZER_EXTRAS:
        subprocess.run(base + ["--frames", WORK + "/quadros_giro", "--out", ENT + "/bomba_centrifuga_giro360.mp4", "--no-captions"], check=True)
        subprocess.run(base + ["--frames", WORK + "/quadros_explodida", "--out", ENT + "/bomba_centrifuga_explodida.mp4", "--no-captions"], check=True)
    # Pôster (quadro da vista em corte) para usar como capa do vídeo no site
    tl = json.load(open(WORK + "/quadros_filme/timeline.json"))
    s2 = next(s for s in tl["shots"] if s["id"] == "02-funcionamento")
    f = s2["startFrame"] + int(s2["seconds"] * 0.8 * tl["fps"])
    shutil.copy(WORK + f"/quadros_filme/f_{f:05d}.png", ENT + "/poster_corte.png")
    shutil.copytree(NARR, ENT + "/narracao", dirs_exist_ok=True)
    !ls -la {ENT}
''', title=True),
    code('''
#@title 8 · Ver o filme aqui e baixar as entregas
from IPython.display import Video, display
from google.colab import files
mp4 = ENT + "/bomba_centrifuga_desmontagem.mp4"
if os.path.exists(mp4):
    display(Video(mp4, embed=os.path.getsize(mp4) < 60e6, width=960))
    !cd {ENT} && rm -f ../entregas.zip && zip -qr ../entregas.zip . -x "*.wav"
    print("Tudo está também no Google Drive, em MecanicaLab_Estudio/entregas.")
    files.download(WORK + "/entregas.zip")
''', title=True),
    md('''
### Depois, no PC
Coloque o conteúdo de `entregas.zip` em `public/media/apresentacao/centrifugal-pump/` do projeto
(o vídeo, o `.srt`, o pôster e a pasta `narracao`). O laboratório passa a oferecer o filme e a narração completa.
'''),
]

nb = {
    'nbformat': 4,
    'nbformat_minor': 5,
    'metadata': {
        'accelerator': 'GPU',
        'colab': {'provenance': [], 'gpuType': 'A100', 'machine_shape': 'hm', 'name': 'estudio_3d_a100.ipynb'},
        'kernelspec': {'name': 'python3', 'display_name': 'Python 3'},
        'language_info': {'name': 'python'},
    },
    'cells': cells,
}
out = os.path.join(ROOT, 'colab', 'estudio_3d_a100.ipynb')
os.makedirs(os.path.dirname(out), exist_ok=True)
json.dump(nb, open(out, 'w', encoding='utf8', newline='\n'), ensure_ascii=False, indent=1)
print(out, f'{os.path.getsize(out) / 1024:.0f} KB')
