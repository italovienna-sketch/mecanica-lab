# Documentação Técnica e Licenciamento — Modelos 3D de Ferramentas Mecânicas (`.GLB`)

## 1. Classificação e Origem
- **Classificação**: **Representações 3D Educacionais Paramétricas Baseadas em Normas DIN/ISO** (geradas no projeto em formato binário glTF 2.0 `.glb` com subcomponentes nomeados para seleção individual via Raycasting no Three.js).
- **Licença**: **CC0 1.0 Universal (Public Domain Dedication)** — Livres para uso educacional, redistribuição e modificação.

## 2. Catálogo de Arquivos `.GLB` (`public/assets/models/tools/`)

Todos os arquivos abaixo são gerados por `asset-pipeline/build.mjs` a partir do script indicado em
`asset-pipeline/blender/`, passam pela QA (`blender-asset-qa`) e ficam registrados em `asset-pipeline/asset-manifest.json`.
Versões anteriores (primitivas), quando existiam, estão em `asset-pipeline/legacy/<id>_v1.glb`.

| Arquivo | Norma / descrição | Nós 3D (`extras.partId`) | Gerador | Triângulos | Tamanho | Observações |
|---|---|---|---|---|---|---|
| `chave-boca.glb` | DIN 3110 / ISO 3318 — fixa 17×19 mm | `boca-17mm`, `corpo-forjado`, `boca-19mm` | `build_open_end_wrench.py` | 9558 | 99,2 KB | L 220, cabeças 40/43 mm, espessura 7, bocas a 15° (catálogo Hoffmann/Stahlwille 40031719 só para medidas) |
| `chave-combinada.glb` | DIN 3113 A / ISO 7738 — combinada 19 mm | `boca-aberta`, `haste-central`, `olhal-estriado` | `build_combination_wrench.py` | 8657 | 97,5 KB | L ≈ 230, olhal Ø 28,1 × 10,5, olhal a 15° (catálogos Teng e Hoffmann 613800-19 só para medidas) |
| `chave-allen.glb` | DIN 911 / ISO 2936 — hexagonal em L 6 mm | `braco-curto`, `curva-90`, `braco-longo` | `build_allen_key.py` | 1208 | 20,0 KB | braços 90 × 32 mm (série normal) |
| `chave-estrela.glb` | tipo DIN 838 — estrela 17×19 mm, anéis rebaixados | `anel-17`, `cotovelo`, `anel-19` | `build_box_wrench.py` | 9018 | 105,2 KB | 12 pontas; Ø dos anéis, comprimento e desnível aproximados de modelos comerciais |
| `chave-fenda-phillips.glb` | ISO 2380 / ISO 8764 — fenda 6,5×1,2 e Phillips PH2 | `ponta`, `haste`, `cabo` | `build_screwdrivers.py` | 7288 | 75,0 KB | hastes 150 e 100 mm; cabo Ø 32 × 110 aproximado |
| `alicate-universal.glb` | ISO 5746 — universal 180 mm | `mordentes`, `corte`, `articulacao`, `cabos` | `build_pliers.py` | 7552 | 99,7 KB | a norma define ensaios e dimensões gerais, não o desenho: medidas de modelos comerciais |
| `alicate-aneis.glb` | DIN 5254 forma A — anéis externos, pontas retas | `pontas`, `articulacao`, `cabos` | `build_snap_ring_pliers.py` | 7274 | 95,7 KB | pinos Ø 1,8; metades não cruzadas (apertar o cabo abre as pontas) |
| `chave-inglesa.glb` | ISO 6787 — ajustável 250 mm | `mandibula-movel`, `sem-fim-recartilhado`, `cabo-anatomico` | `build_adjustable_wrench.py` | 8968 | 103,3 KB | cabeça a 15°, abertura mostrada 24 mm |
| `soquete-catraca.glb` | ISO 3315 (catraca 1/2") / DIN 3124 (soquete 19 mm) | `soquete-sextavado`, `cabeca-reversivel`, `cabo-recartilhado` | `build_ratchet.py` | 10832 | 121,2 KB | quadrado 12,5 mm; soquete 38 mm, Ø 25–27 |
| `torquimetro.glb` | ISO 6789 — de estalo 10–60 N·m, 1/2" | `cabeca-catraca`, `escala-nm`, `punho-micrometrico` | `build_torque_wrench.py` | 8570 | 98,9 KB | escala só com a faixa da ferramenta; nenhum torque de aperto é sugerido |
| `martelo-face-macia.glb` | sem norma de desenho — face macia Ø 40 | `face-1`, `cabeca`, `cabo` | `build_soft_hammer.py` | 4720 | 55,3 KB | cores das faces só diferenciam dureza |
| `saca-polias.glb` | sem norma de desenho — extrator de 3 garras | `fuso-central`, `cruzeta-corpo`, `garras-articuladas` | `build_puller.py` | 10244 | 149,2 KB | fuso M16 (rosca visual em sulcos anelares) |
| `extrator-rolamentos.glb` | sem norma de desenho — placa separadora bipartida | `fuso`, `ponte`, `placa` | `build_bearing_separator.py` | 9280 | 134,6 KB | placa 130 × 60 × 14, recorte Ø 34, tirantes M10 |
| `relogio-comparador.glb` | DIN 878 — relógio comparador 0,01 mm em base magnética | `base-magnetica`, `mostrador-centesimal`, `fuso-apalpador` | `build_dial_indicator.py` | 6596 | 99,4 KB | caixa Ø 58 e haste Ø 8 (DIN 878); leitura do ponteiro só ilustrativa |

**Paquímetro e micrômetro** (`paquimetro.glb`, `micrometro.glb`): arquivos antigos, **não usados** pelo visualizador —
o app gera esses dois instrumentos no navegador (`src/components/tools/models/measuringTools.ts`), com nônio e escalas
legíveis. Os `.glb` ficam só como referência.

## 3. Proveniência dos modelos do pipeline Blender
- Geometria 100% gerada por script no projeto (nenhuma malha de terceiros) → dedicada ao domínio público (CC0 1.0).
- Normas e catálogos foram usados apenas como fonte de **medidas**; nenhuma imagem, logotipo ou marca de fabricante
  foi reproduzida. As gravações do modelo são genéricas ("DIN 3110 Cr-V", medida em mm).
- Fotos de referência consultadas (Wikimedia Commons, CC BY / CC BY-SA) **não** foram copiadas para o projeto.
- Versões anteriores (primitivas) guardadas em `asset-pipeline/legacy/` para comparação.
