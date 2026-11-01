# Bomba centrífuga — origem, licença e precisão do modelo

> **Atualização 2 (29/out/2026): `centrifugal-pump-v2.glb`** — modelo feito por script no **Blender 5.2**
> (`asset-pipeline/blender/build_centrifugal_pump.py`, fonte em `asset-pipeline/source/centrifugal-pump_web.blend`).
> - **Uso:** carregado pelo laboratório na qualidade "alta" (`modelUrl` em `src/data/centrifugalPumpLab.ts`); em qualidade
>   baixa ou se o download falhar, o app usa o modelo procedural abaixo (mesmos 10 `partId`, mesmas trajetórias).
> - **Conteúdo:** 10 peças (voluta com espiral e bocais flangeados, rotor fechado com 6 pás em espiral logarítmica, junta,
>   selo mecânico, eixo com chavetas, par de rolamentos tipo 6308 com esferas e gaiola, cavalete com lanterna e visor, parafusos,
>   porca do rotor, cubo do acoplamento) + base. ~64 mil triângulos; 455 KB com meshopt + quantização
>   (`@gltf-transform/cli` 4.2.1, MIT). Cada peça é um nó raiz com `extras.partId`.
> - **Versão de filme:** o mesmo script com `--detail film` (~145 mil triângulos) gera o modelo usado nos vídeos renderizados
>   em Cycles no Google Colab (`colab/estudio_3d_a100.ipynb`).
> - **Licença:** CC0 1.0 (geometria criada no projeto; o Blender, GPL, é só a ferramenta e não impõe licença ao arquivo gerado).
> - **QA:** peças separadas de propósito (esferas, gaiola, parafusos com folga) aparecem como "ilhas" na revisão de malha; isso é
>   esperado numa montagem mecânica. Restam 2 pares de triângulos coplanares escondidos dentro da voluta, sem efeito visível.
> - **Classificação:** continua sendo *modelo educacional simplificado* (proporções inspiradas na ISO 2858 65-50-160).
>
> **Atualização (out/2026):** o laboratório 3D passou a usar um **modelo procedural** gerado no navegador
> (`src/components/lab/models/pumpModel.ts`), mais detalhado que o `.glb` abaixo: voluta em espiral com seção crescente,
> bocais DN 65 / DN 50 com flanges furados, rotor fechado com 6 pás curvadas para trás, selo mecânico (sede, face, mola, fole),
> eixo escalonado com chavetas, dois rolamentos rígidos de esferas com esferas e gaiola, cavalete com aletas, lanterna com janelas
> de acesso ao selo, visor de óleo, respiro e base metálica. Licença: CC0 (criado no projeto).
>
> **Classificação honesta:** *modelo educacional simplificado*, com proporções inspiradas na família ISO 2858 back-pull-out
> (designação 65-50-160). Não reproduz um produto comercial específico. Anéis de desgaste internos, juntas e defletores foram
> simplificados ou omitidos. O ponto de operação (vazão/altura) não é informado porque depende do fabricante e da rotação.
>
> O arquivo `centrifugal_pump_iso2858.glb` (7 malhas, ~2 mil triângulos) foi mantido no repositório como referência histórica,
> mas não é mais carregado pela aplicação.

---

## Documento original (mantido para histórico)

# Documentação Técnica, Origem e Licenciamento dos Modelos de Bombas Centrífugas

## 1. Classificação Transparente do Modelo (Provenance & Honest Classification)
Para total transparência técnica e pedagógica (conforme diretriz de autenticidade do projeto):
- **Classificação**: **Representação Educacional Paramétrica Baseada em Norma Técnica Pública (ISO 2858 / EN 22858)** — *Não é um arquivo CAD proprietário extraído de um fabricante específico, mas sim uma montagem 3D educacional completa construída sobre as cotas geométricas públicas da norma ISO 2858 (`65-50-160`)*.
- **Equipamento Representado**: Bomba Centrífuga Horizontal de Estágio Único, Sucção Axial e Construção *Back-Pull-Out* (Desmontagem Traseira sem Desconexão da Tubulação).
- **Normas Técnicas de Referência**:
  - **ISO 2858 / EN 22858 / DIN 24256**: Dimensões nominais externas de flanges (Sucção Axial DN 65, Recalque Vertical Centralizado DN 50, Diâmetro Nominal do Rotor 160 mm — Designação `65-50-160`).
  - **EN 12756 (DIN 24960)**: Dimensões de alojamento para Selo Mecânico de fole e faces planas (Carbeto de Silício / Grafite).
  - **DIN 6885 Forma A**: Chaveta paralela retangular do eixo escalonado.
- **Aplicação Didática**: Representa a família de bombas centrífugas normalizadas amplamente encontradas em bancadas didáticas de manutenção mecânica no Brasil.

## 2. Arquivo 3D Incorporado no Projeto
- **Caminho no Repositório**: `public/assets/models/pumps/centrifugal_pump_iso2858.glb`
- **Formato**: Binary glTF 2.0 (`.glb`) — **97.4 KB** (otimizado para carregamento rápido em computadores escolares comuns e carregado via `GLTFLoader` do Three.js).
- **Licença**: **CC0 1.0 Universal (Public Domain Dedication)** — Gerado no próprio repositório a partir das tabelas geométricas públicas ISO 2858. Livre para uso educacional, redistribuição e modificação sem restrições de direitos autorais ou marcas registradas.

## 3. Árvore de Nós (Nodes) do Modelo `.glb` (Mapeamento 1:1 com a Aula Prática)
Cada subconjunto mecânico foi exportado como um nó independente nomeado no arquivo `centrifugal_pump_iso2858.glb` para permitir seleção individual via Raycasting, destaque visual, vista explodida axial e validação de desmontagem/remontagem:

1. `pump-volute-casing`: **Carcaça Espiral em Voluta (Corpo da Bomba)** — Bocal de sucção axial DN 65, bocal de recalque superior DN 50 e pés de apoio.
2. `pump-impeller`: **Rotor Centrífugo Fechado (Impulsor Radial)** — 7 pás curvas voltadas para trás, disco traseiro, coroa frontal (olhal de sucção) e cubo chavetado.
3. `pump-mechanical-seal`: **Tampa de Pressão e Selo Mecânico (EN 12756)** — Conjunto de vedação dinâmica primária composto por sede estacionária, anel rotativo lapidado e mola helicoidal.
4. `pump-shaft`: **Eixo Escalonado de Transmissão com Chaveta** — Eixo com colos de rolamento retificados e chaveta paralela DIN 6885.
5. `pump-bearings`: **Par de Rolamentos Rígidos de Esferas (Série 6309)** — Alojados nos mancais dianteiro (lado bomba) e traseiro (lado acoplamento).
6. `pump-bearing-bracket`: **Cavalete de Mancal (Suporte Back-Pull-Out)** — Corpo cilíndrico com lanterna de acoplamento, câmara de óleo e pé traseiro de sustentação.
7. `pump-fasteners`: **Conjunto de Parafusos Sextavados M12 e Chaveta** — Parafusos perimetrais Classe 8.8 que unem o cavalete à voluta e porca cônica de fixação do rotor.
