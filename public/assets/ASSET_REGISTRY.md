# Registro Oficial de Ativos 3D (`.GLB`) — Mecânica Lab

Este documento registra todos os modelos 3D (`glTF 2.0 Binary .glb`) utilizados no **Mecânica Lab**, suas origens, classificações técnicas, normas de referência, subcomponentes selecionáveis e licenças.

> **Transparência Pedagógica e Técnica**: Todos os modelos abaixo são **Modelos CAD Instrucionais Simplificados** gerados por pipeline paramétrico (`GLTFExporter` / Three.js) com base nas proporções e nomenclaturas das normas ABNT/DIN/ISO. Eles são otimizados para rodar a 60 FPS em computadores escolares comuns sem violar direitos autorais de fabricantes.

| ID | Nome do Ativo | Caminho (`.glb`) | Tamanho | Nós Selecionáveis | Norma de Referência | Licença |
|---|---|---|---|---|---|---|
| `centrifugal-pump` | Bomba Centrífuga Horizontal Back-Pull-Out (**pipeline Blender** `asset-pipeline/blender/build_centrifugal_pump.py`, ~64 mil triângulos, meshopt; usado na qualidade alta, com o **modelo procedural** `src/components/lab/models/pumpModel.ts` como reserva; detalhes em `models/pumps/LICENSE_AND_SOURCES.md`) | `/assets/models/pumps/centrifugal-pump-v2.glb` | 444,4 KB | `pump-volute-casing`, `pump-casing-gasket`, `pump-impeller`, `pump-impeller-nut`, `pump-mechanical-seal`, `pump-shaft`, `pump-bearings`, `pump-bearing-bracket`, `pump-fasteners`, `pump-coupling-hub` | ISO 2858 / EN 12756 | CC0 1.0 |
| `centrifugal-pump` (histórico) | Primeira versão, não carregada pelo app | `/assets/models/pumps/centrifugal_pump_iso2858.glb` | 97,4 KB | 7 nós | ISO 2858 | CC0 1.0 |
| `gearbox-reducer` | Redutor de Velocidade de Eixos Paralelos | `/assets/models/gearboxes/helical_gearbox_industrial.glb` | 605,5 KB | `part-housing-top`, `part-bolts-perimeter`, `part-input-pinion-shaft`, `part-output-gear`, `part-taper-bearings`, `part-radial-seals`, `part-housing-bottom` | DIN 3990 / ISO 6336 / DIN 720 | CC0 1.0 |
| `chave-combinada` | Chave Combinada 19 mm (**pipeline Blender** `asset-pipeline/blender/build_combination_wrench.py`; meshopt; QA aprovada; v1 primitiva em `asset-pipeline/legacy/`) | `/assets/models/tools/chave-combinada.glb` | 97,5 KB | `boca-aberta`, `haste-central`, `olhal-estriado` | DIN 3113 A / ISO 7738 | CC0 1.0 |
| `chave-boca` | Chave Fixa de Duas Bocas 17×19 mm (**pipeline Blender** `asset-pipeline/blender/build_open_end_wrench.py`; meshopt; QA aprovada; v1 primitiva em `asset-pipeline/legacy/`) | `/assets/models/tools/chave-boca.glb` | 99,2 KB | `boca-17mm`, `corpo-forjado`, `boca-19mm` | DIN 3110 / ISO 3318 | CC0 1.0 |
| `chave-fenda-phillips` | Chaves de Fenda 6,5×1,2 e Phillips PH2 (**pipeline Blender** `asset-pipeline/blender/build_screwdrivers.py`; QA aprovada; modelo novo) | `/assets/models/tools/chave-fenda-phillips.glb` | 75,0 KB | `ponta`, `haste`, `cabo` | ISO 2380 / ISO 8764 | CC0 1.0 |
| `alicate-universal` | Alicate Universal 180 mm (**pipeline Blender** `asset-pipeline/blender/build_pliers.py`; QA aprovada; modelo novo) | `/assets/models/tools/alicate-universal.glb` | 99,7 KB | `mordentes`, `corte`, `articulacao`, `cabos` | ISO 5746 | CC0 1.0 |
| `chave-inglesa` | Chave Ajustável / Inglesa 10" (**pipeline Blender** `asset-pipeline/blender/build_adjustable_wrench.py`; QA aprovada; v1 em `asset-pipeline/legacy/`) | `/assets/models/tools/chave-inglesa.glb` | 103,3 KB | `mandibula-movel`, `sem-fim-recartilhado`, `cabo-anatomico` | ISO 6787 | CC0 1.0 |
| `chave-allen` | Chave Allen / Hexagonal em L 6 mm (**pipeline Blender** `asset-pipeline/blender/build_allen_key.py`; QA aprovada; v1 em `asset-pipeline/legacy/`) | `/assets/models/tools/chave-allen.glb` | 20,0 KB | `braco-curto`, `curva-90`, `braco-longo` | DIN 911 / ISO 2936 | CC0 1.0 |
| `chave-estrela` | Chave Estrela 17×19 mm, anéis rebaixados (**pipeline Blender** `asset-pipeline/blender/build_box_wrench.py`; QA aprovada; modelo novo) | `/assets/models/tools/chave-estrela.glb` | 105,2 KB | `anel-17`, `cotovelo`, `anel-19` | tipo DIN 838 | CC0 1.0 |
| `soquete-catraca` | Chave Catraca Reversível 1/2" + Soquete 19 mm (**pipeline Blender** `asset-pipeline/blender/build_ratchet.py`; QA aprovada; v1 em `asset-pipeline/legacy/`) | `/assets/models/tools/soquete-catraca.glb` | 121,2 KB | `soquete-sextavado`, `cabeca-reversivel`, `cabo-recartilhado` | DIN 3120 / DIN 3124 | CC0 1.0 |
| `martelo-face-macia` | Martelo de Face Macia Ø 40 (**pipeline Blender** `asset-pipeline/blender/build_soft_hammer.py`; QA aprovada; modelo novo) | `/assets/models/tools/martelo-face-macia.glb` | 55,3 KB | `face-1`, `cabeca`, `cabo` | sem norma de desenho | CC0 1.0 |
| `alicate-aneis` | Alicate para Anéis Elásticos Externos, pontas retas (**pipeline Blender** `asset-pipeline/blender/build_snap_ring_pliers.py`; QA aprovada; modelo novo) | `/assets/models/tools/alicate-aneis.glb` | 95,7 KB | `pontas`, `articulacao`, `cabos` | DIN 5254 A | CC0 1.0 |
| `extrator-rolamentos` | Extrator de Rolamentos com Placa Separadora (**pipeline Blender** `asset-pipeline/blender/build_bearing_separator.py`; QA aprovada; modelo novo) | `/assets/models/tools/extrator-rolamentos.glb` | 134,6 KB | `fuso`, `ponte`, `placa` | sem norma de desenho | CC0 1.0 |
| `torquimetro` | Torquímetro de Estalo Calibrado 10–60 N·m (**pipeline Blender** `asset-pipeline/blender/build_torque_wrench.py`; QA aprovada; v1 em `asset-pipeline/legacy/`) | `/assets/models/tools/torquimetro.glb` | 98,9 KB | `cabeca-catraca`, `escala-nm`, `punho-micrometrico` | ABNT NBR ISO 6789 | CC0 1.0 |
| `paquimetro` | Paquímetro Universal Quadrimensional 0,05 mm | `/assets/models/tools/paquimetro.glb` | 8,0 KB | `orelhas-internas`, `bicos-externos`, `nonio-vernier`, `haste-profundidade` | ABNT NBR NM-ISO 3611 | CC0 1.0 |
| `micrometro` | Micrômetro Externo de Arco 0–25 mm • 0,01 mm | `/assets/models/tools/micrometro.glb` | 16,7 KB | `arco-termico`, `fuso-bigorna`, `tambor-bainha`, `catraca` | DIN 863 | CC0 1.0 |
| `relogio-comparador` | Relógio Comparador Centesimal 0,01 mm (**pipeline Blender** `asset-pipeline/blender/build_dial_indicator.py`; QA aprovada; v1 em `asset-pipeline/legacy/`) | `/assets/models/tools/relogio-comparador.glb` | 99,4 KB | `base-magnetica`, `mostrador-centesimal`, `fuso-apalpador` | DIN 878 / ABNT NBR 6393 | CC0 1.0 |
| `saca-polias` | Saca-Polias / Extrator de 3 Garras (**pipeline Blender** `asset-pipeline/blender/build_puller.py`; QA aprovada; v1 em `asset-pipeline/legacy/`) | `/assets/models/tools/saca-polias.glb` | 149,2 KB | `fuso-central`, `cruzeta-corpo`, `garras-articuladas` | — (ISO 15243 trata de danos em rolamentos, não de extratores) | CC0 1.0 |

> **Modelos do pipeline Blender** (`asset-pipeline/`): os `.glb` usam compressão **meshopt** (`EXT_meshopt_compression`)
> e exigem `MeshoptDecoder` no `GLTFLoader` (já configurado em `ToolViewer3D.tsx`). As peças selecionáveis são
> identificadas por `extras.partId` (vira `userData.partId` no three.js). Números medidos (triângulos, bbox, bytes, QA)
> ficam em `asset-pipeline/asset-manifest.json`, atualizado a cada `node asset-pipeline/build.mjs <id>`.

## Mídia de aulas (`public/media/aulas/`)

| Arquivo | Conteúdo | Origem | Licença |
|---|---|---|---|
| `rolamento-fixo-livre.mp4` | Aula narrada "Rolamento fixo e rolamento livre", 1280×720, 78 s, H.264 + AAC mono, −17,4 LUFS medidos (alvo −16, pico limitado a −1,5 dBFS) | **Narração regravada em 18/out/2026** com Kokoro-82M (voz `pf_dora`, velocidade 0,85, ~164 palavras/min) via `kokoro-onnx`; imagens = trilha de vídeo da versão anterior (capturas do lab 3D e do desenho de conjunto do projeto), cortada nos tempos de cada legenda e reajustada à nova duração. Script: `scripts/media/renarrate.py`. Conferência: transcrição automática (faster-whisper `small`) com 0,5 % de erro de palavras contra o roteiro | Imagens e roteiro: CC0 1.0. Voz: pesos do Kokoro-82M sob **Apache-2.0** (hexgrad/Kokoro-82M); `kokoro-onnx` MIT. O cartão do modelo declara treino com áudio de domínio público, licenças permissivas e áudio sintético de provedores comerciais — ver "Licença das vozes" abaixo |
| `rolamento-fixo-livre.vtt` | Legendas WebVTT pt-BR; tempos = duração real de cada trecho narrado | gerado pelo script | CC0 1.0 |
| `rolamento-fixo-livre.jpg` | Pôster (corte do rolamento fixo no lab 3D) | captura do projeto | CC0 1.0 |
| `redutor-rotacao-torque.mp4` | Aula narrada "Redutor: troca rotação por torque", 1280×720, 70 s, H.264 + AAC mono, −17,2 LUFS medidos | Kokoro-82M (`pf_dora`, 0,85, ~159 palavras/min); imagens: capturas do lab 3D `motor-gearbox` (vista normal e em corte) e do esquema `MotorGearboxSchematic`, com zoom lento. Script: `scripts/media/build_lesson_redutor.py`. Conferência por transcrição automática: texto correto (diferenças só em números escritos como algarismos) | Imagens e roteiro: CC0 1.0. Voz: como acima |
| `redutor-rotacao-torque.vtt` | Legendas WebVTT pt-BR | gerado pelo script | CC0 1.0 |
| `redutor-rotacao-torque.jpg` | Pôster (vista do conjunto no lab 3D) | captura do projeto | CC0 1.0 |

## Filme da bomba centrífuga (`public/media/apresentacao/centrifugal-pump/`)

Renderizado em 29–30/out/2026 no Google Colab (Blender 5.2.2, Cycles, OptiX, 1920×1080, 96 amostras, denoiser OIDN, 30 quadros/s),
em duas sessões ao mesmo tempo (A100 80 GB e L4) gravando na mesma pasta do Drive. Modelo: versão de filme de
`build_centrifugal_pump.py`; roteiro: `asset-pipeline/film/pump_film.json`; montagem: `asset-pipeline/film/compose_film.py`.
O app lê `filme.json` e mostra o painel "Filme da desmontagem" na etapa "Conhecer" da missão (`RenderedFilm`).

| Arquivo | Conteúdo | Licença |
|---|---|---|
| `bomba_centrifuga_desmontagem_limpo.mp4` | Filme narrado, 133,7 s, H.264 + AAC, sem legenda gravada (o app usa o `.vtt`) | CC0 1.0 (imagem); voz Kokoro-82M Apache-2.0 (ver abaixo) |
| `bomba_centrifuga_desmontagem.mp4` | O mesmo filme com legendas gravadas, para projetar em aula | idem |
| `bomba_centrifuga_desmontagem.vtt` / `.srt` | Legendas pt-BR (mesmo texto da narração) | CC0 1.0 |
| `bomba_centrifuga_giro360.mp4`, `bomba_centrifuga_explodida.mp4` | Laços de 10 s: giro 360° e vista explodida, sem áudio | CC0 1.0 |
| `poster_corte.jpg` | Capa: quadro da vista em corte | CC0 1.0 |
| `filme.json` | Manifesto lido pelo app | CC0 1.0 |
| `NN-*.mp3` / `.wav`, `narracao.json` | Narração por tomada (Kokoro-82M `pf_dora`), usada pelo modo apresentação | voz: como abaixo |

Textos sobre o vídeo em IBM Plex Sans (SIL OFL 1.1, baixada do repositório IBM/plex no Colab; a fonte não é redistribuída aqui).

**Licença das vozes (pesquisa de 18/out/2026).** A versão anterior usava a voz do Windows (Microsoft Maria), sem termos verificados para
publicação. Alternativas avaliadas:
- Piper pt_BR `cadu`, `faber`, `jeff`: datasets CC0 (OHF-Voice/voice-datasets), mas **ajustados a partir da voz inglesa `lessac`**, cujo dataset
  (Blizzard 2013) é licenciado só para pesquisa, sem uso comercial. Cadeia de licença não limpa → descartadas.
- Piper pt_BR `edresson`: dataset CC BY 4.0, mas ajustado a partir de `ryan` (dataset RyanSpeech, CC BY-NC-SA 4.0) → descartada.
- **Kokoro-82M** (escolhida): pesos Apache-2.0; vozes pt-BR `pf_dora`, `pm_alex`, `pm_santa`. Ressalva registrada: o cartão do modelo diz que parte
  do treino usou áudio sintético de modelos fechados de grandes provedores; os pesos e a saída seguem sob Apache-2.0, mas, para uso comercial
  amplo, a opção mais segura continua sendo narração humana gravada com cessão de direitos.
- Modelos baixados (não versionados): `kokoro-v1.0.onnx` (SHA-256 `beb0d184…f0df3a`) e `voices-v1.0.bin` (`bca610b8…fbf7d`) das releases
  `model-files-v1.1` do repositório thewh1teagle/kokoro-onnx.


> Modelos 3D das máquinas `bearing-assembly`, `belt-conveyor`, `diaphragm-pump` e `motor-gearbox` são **procedurais** (three.js, sem arquivo `.glb`), como a bomba centrífuga.

