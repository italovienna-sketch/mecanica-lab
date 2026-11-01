export interface AssetRegistryItem {
  id: string;
  displayName: string;
  category: 'assembly' | 'tool';
  classification: 'Modelo CAD Instrucional Simplificado (Auditado para WebGL)';
  assetPath: string;
  format: 'glTF 2.0 Binary (.glb)';
  fileSizeBytes: number;
  source: string;
  license: 'CC0 1.0 Universal (Domínio Público)';
  attributionRequired: string;
  selectableNodes: string[];
  technicalDocumentation: string;
  knownLimitations: string;
}

export const ASSET_REGISTRY: AssetRegistryItem[] = [
  {
    id: 'centrifugal-pump',
    displayName: 'Bomba centrífuga horizontal de sucção axial, construção back-pull-out (modelo educacional simplificado)',
    category: 'assembly',
    classification: 'Modelo CAD Instrucional Simplificado (Auditado para WebGL)',
    assetPath: '/assets/models/pumps/centrifugal_pump_iso2858.glb',
    format: 'glTF 2.0 Binary (.glb)',
    fileSizeBytes: 97400,
    source: 'Pipeline CAD Paramétrico Interno Mecânica Lab (Three.js GLTFExporter)',
    license: 'CC0 1.0 Universal (Domínio Público)',
    attributionRequired: 'Modelo procedural criado no próprio projeto. Proporções aproximadas, inspiradas no tipo de bomba coberto pela ISO 2858; não reproduz as cotas de nenhum modelo comercial nem da norma.',
    selectableNodes: [
      'pump-volute-casing',
      'pump-impeller',
      'pump-mechanical-seal',
      'pump-shaft',
      'pump-bearings',
      'pump-bearing-bracket',
      'pump-fasteners'
    ],
    technicalDocumentation: 'Normas ISO 2858 (Dimensões de Bombas Centrífugas), DIN EN 12756 (Selos Mecânicos), ABNT NBR ISO 1940-1 (Balanceamento G6.3).',
    knownLimitations: 'Geometria interna dos canais espirais da voluta e mola helicoidal do selo representadas de forma didática simplificada para manter 60 FPS em computadores escolares.'
  },
  {
    id: 'gearbox-reducer',
    displayName: 'Redutor de Velocidade de Eixos Paralelos (Engrenagens Helicoidais)',
    category: 'assembly',
    classification: 'Modelo CAD Instrucional Simplificado (Auditado para WebGL)',
    assetPath: '/assets/models/gearboxes/helical_gearbox_industrial.glb',
    format: 'glTF 2.0 Binary (.glb)',
    fileSizeBytes: 605504,
    source: 'Pipeline CAD Paramétrico Interno Mecânica Lab (Three.js GLTFExporter)',
    license: 'CC0 1.0 Universal (Domínio Público)',
    attributionRequired: 'Nenhuma restrição proprietária. Proporções baseadas nas normas DIN 3990 / ISO 6336, DIN 720 (30206) e DIN 3760.',
    selectableNodes: [
      'part-housing-top',
      'part-bolts-perimeter',
      'part-input-pinion-shaft',
      'part-output-gear',
      'part-taper-bearings',
      'part-radial-seals',
      'part-housing-bottom'
    ],
    technicalDocumentation: 'Normas DIN 3990 / ISO 6336 (Engrenagens Cilíndricas Helicoidais), DIN 720 (Rolamentos de Rolos Cônicos), DIN 3760 (Retentores Radiais).',
    knownLimitations: 'Perfil evolvente dos dentes helicoidais simplificado para malha leve; calços de ajuste axial representados junto aos anéis dos rolamentos.'
  },
  {
    id: 'chave-combinada',
    displayName: 'Chave Combinada 19 mm (DIN 3113)',
    category: 'tool',
    classification: 'Modelo CAD Instrucional Simplificado (Auditado para WebGL)',
    assetPath: '/assets/models/tools/chave-combinada.glb',
    format: 'glTF 2.0 Binary (.glb)',
    fileSizeBytes: 10468,
    source: 'Pipeline CAD Paramétrico Interno Mecânica Lab',
    license: 'CC0 1.0 Universal (Domínio Público)',
    attributionRequired: 'Livre para uso educacional.',
    selectableNodes: ['boca-aberta', 'haste-central', 'olhal-estriado'],
    technicalDocumentation: 'Norma DIN 3113 / ISO 7738 (Chaves Combinadas de Aço Cromo-Vanádio).',
    knownLimitations: 'Marcações em baixo-relevo na haste exibidas via interface.'
  },
  {
    id: 'chave-boca',
    displayName: 'Chave Fixa de Duas Bocas 17×19 mm (DIN 3110)',
    category: 'tool',
    classification: 'Modelo CAD Instrucional Simplificado (Auditado para WebGL)',
    assetPath: '/assets/models/tools/chave-boca.glb',
    format: 'glTF 2.0 Binary (.glb)',
    fileSizeBytes: 12300,
    source: 'Pipeline CAD Paramétrico Interno Mecânica Lab',
    license: 'CC0 1.0 Universal (Domínio Público)',
    attributionRequired: 'Livre para uso educacional.',
    selectableNodes: ['boca-17mm', 'corpo-forjado', 'boca-19mm'],
    technicalDocumentation: 'Norma DIN 3110 / ISO 10102 (Chaves Fixas de Duas Bocas com Ângulo de 15°).',
    knownLimitations: 'Representação didática das mandíbulas de 17 mm e 19 mm.'
  },
  {
    id: 'chave-inglesa',
    displayName: 'Chave Ajustável / Inglesa 10" (ISO 6787)',
    category: 'tool',
    classification: 'Modelo CAD Instrucional Simplificado (Auditado para WebGL)',
    assetPath: '/assets/models/tools/chave-inglesa.glb',
    format: 'glTF 2.0 Binary (.glb)',
    fileSizeBytes: 20392,
    source: 'Pipeline CAD Paramétrico Interno Mecânica Lab',
    license: 'CC0 1.0 Universal (Domínio Público)',
    attributionRequired: 'Livre para uso educacional.',
    selectableNodes: ['mandibula-movel', 'sem-fim-recartilhado', 'cabo-anatomico'],
    technicalDocumentation: 'Norma ISO 6787 (Chaves Ajustáveis de Mandíbula Móvel).',
    knownLimitations: 'Fuso sem-fim estático na visualização 3D; abertura explicada no painel.'
  },
  {
    id: 'chave-allen',
    displayName: 'Chave Allen / Hexagonal em L 6 mm (ISO 2936)',
    category: 'tool',
    classification: 'Modelo CAD Instrucional Simplificado (Auditado para WebGL)',
    assetPath: '/assets/models/tools/chave-allen.glb',
    format: 'glTF 2.0 Binary (.glb)',
    fileSizeBytes: 4988,
    source: 'Pipeline CAD Paramétrico Interno Mecânica Lab',
    license: 'CC0 1.0 Universal (Domínio Público)',
    attributionRequired: 'Livre para uso educacional.',
    selectableNodes: ['braco-curto', 'curva-90', 'braco-longo'],
    technicalDocumentation: 'Norma ISO 2936 / DIN 911 (Chaves para Parafusos de Sextavado Interno DIN 912).',
    knownLimitations: 'Ponta abaulada opcional descrita nas notas técnicas.'
  },
  {
    id: 'soquete-catraca',
    displayName: 'Chave Catraca Reversível 1/2" com Soquete Sextavado 19 mm',
    category: 'tool',
    classification: 'Modelo CAD Instrucional Simplificado (Auditado para WebGL)',
    assetPath: '/assets/models/tools/soquete-catraca.glb',
    format: 'glTF 2.0 Binary (.glb)',
    fileSizeBytes: 21548,
    source: 'Pipeline CAD Paramétrico Interno Mecânica Lab',
    license: 'CC0 1.0 Universal (Domínio Público)',
    attributionRequired: 'Livre para uso educacional.',
    selectableNodes: ['soquete-sextavado', 'cabeca-reversivel', 'cabo-recartilhado'],
    technicalDocumentation: 'Norma DIN 3120 / ISO 1174 (Encaixe Quadrado 1/2") e DIN 3124 (Soquetes).',
    knownLimitations: 'Mecanismo interno de lingueta reversível detalhado no texto.'
  },
  {
    id: 'torquimetro',
    displayName: 'Torquímetro de Estalo Calibrado 10–60 N·m (ISO 6789)',
    category: 'tool',
    classification: 'Modelo CAD Instrucional Simplificado (Auditado para WebGL)',
    assetPath: '/assets/models/tools/torquimetro.glb',
    format: 'glTF 2.0 Binary (.glb)',
    fileSizeBytes: 12068,
    source: 'Pipeline CAD Paramétrico Interno Mecânica Lab',
    license: 'CC0 1.0 Universal (Domínio Público)',
    attributionRequired: 'Livre para uso educacional.',
    selectableNodes: ['cabeca-catraca', 'escala-nm', 'punho-micrometrico'],
    technicalDocumentation: 'Norma ABNT NBR ISO 6789 (Ferramentas Manuais de Torque — Calibração ±4%).',
    knownLimitations: 'Leitura fina gravada no tambor representada no diagrama 2D complementar.'
  },
  {
    id: 'paquimetro',
    displayName: 'Paquímetro Universal Quadrimensional 150 mm • 0,05 mm',
    category: 'tool',
    classification: 'Modelo CAD Instrucional Simplificado (Auditado para WebGL)',
    assetPath: '/assets/models/tools/paquimetro.glb',
    format: 'glTF 2.0 Binary (.glb)',
    fileSizeBytes: 7984,
    source: 'Pipeline CAD Paramétrico Interno Mecânica Lab',
    license: 'CC0 1.0 Universal (Domínio Público)',
    attributionRequired: 'Livre para uso educacional.',
    selectableNodes: ['orelhas-internas', 'bicos-externos', 'nonio-vernier', 'haste-profundidade'],
    technicalDocumentation: 'Norma ABNT NBR NM-ISO 3611 / DIN 862 (Paquímetros para Medição Externa, Interna, Ressalto e Profundidade).',
    knownLimitations: 'A leitura milimétrica e do Nônio de 20 divisões (0,05 mm) é praticada no Simulador Interativo dedicado.'
  },
  {
    id: 'micrometro',
    displayName: 'Micrômetro Externo de Arco 0–25 mm • 0,01 mm',
    category: 'tool',
    classification: 'Modelo CAD Instrucional Simplificado (Auditado para WebGL)',
    assetPath: '/assets/models/tools/micrometro.glb',
    format: 'glTF 2.0 Binary (.glb)',
    fileSizeBytes: 16664,
    source: 'Pipeline CAD Paramétrico Interno Mecânica Lab',
    license: 'CC0 1.0 Universal (Domínio Público)',
    attributionRequired: 'Livre para uso educacional.',
    selectableNodes: ['arco-termico', 'fuso-bigorna', 'tambor-bainha', 'catraca'],
    technicalDocumentation: 'Norma DIN 863 / ISO 3611 (Micrômetros Externos Centesimais).',
    knownLimitations: 'Faces de metal duro e passo de rosca 0,5 mm explicados no guia pedagógico.'
  },
  {
    id: 'relogio-comparador',
    displayName: 'Relógio Comparador Centesimal 0,01 mm com Base Magnética',
    category: 'tool',
    classification: 'Modelo CAD Instrucional Simplificado (Auditado para WebGL)',
    assetPath: '/assets/models/tools/relogio-comparador.glb',
    format: 'glTF 2.0 Binary (.glb)',
    fileSizeBytes: 39312,
    source: 'Pipeline CAD Paramétrico Interno Mecânica Lab',
    license: 'CC0 1.0 Universal (Domínio Público)',
    attributionRequired: 'Livre para uso educacional.',
    selectableNodes: ['base-magnetica', 'mostrador-centesimal', 'fuso-apalpador'],
    technicalDocumentation: 'Norma DIN 878 / ABNT NBR 6393 (Relógios Comparadores Mecânicos 0,01 mm para Excentricidade e Alinhamento).',
    knownLimitations: 'Usado para verificação de batimento radial (run-out) e alinhamento de acoplamentos.'
  },
  {
    id: 'saca-polias',
    displayName: 'Saca-Polias / Extrator Mecânico de 3 Garras Articuladas',
    category: 'tool',
    classification: 'Modelo CAD Instrucional Simplificado (Auditado para WebGL)',
    assetPath: '/assets/models/tools/saca-polias.glb',
    format: 'glTF 2.0 Binary (.glb)',
    fileSizeBytes: 9260,
    source: 'Pipeline CAD Paramétrico Interno Mecânica Lab',
    license: 'CC0 1.0 Universal (Domínio Público)',
    attributionRequired: 'Livre para uso educacional.',
    selectableNodes: ['fuso-central', 'cruzeta-corpo', 'garras-articuladas'],
    technicalDocumentation: 'Boas práticas de fabricantes de rolamentos para extração sem choque; ISO 15243 trata da classificação de danos e falhas em rolamentos.',
    knownLimitations: 'Abertura das garras fixa na malha 3D; alinhamento explicado nas instruções.'
  }
];
