import type { GameScreen } from '../types/game';
import type { ClaimKind, RegRef } from './regulatorySources';

/**
 * Aulas rápidas (micro-aulas): um objetivo, uma demonstração curta, uma pergunta e um próximo passo.
 *
 * Mídia: não existem vídeos filmados no projeto. Cada aula usa uma DEMONSTRAÇÃO ANIMADA em SVG
 * (cenas desenhadas no próprio projeto, sem som), com legenda sincronizada e transcrição.
 * O formato também aceita vídeo (`media.kind = 'video'`) quando houver um arquivo próprio ou
 * licenciado, com legenda em WebVTT — nunca use vídeo de terceiros sem licença.
 *
 * Cada "ponto-chave" diz se é requisito de NR (com o item conferido), boa prática ou simplificação.
 */

export interface MicroScene {
  /** Desenho da cena (ver components/micro/MicroScenes.tsx). */
  visual: string;
  /** Parâmetro opcional do desenho (ex.: valor da leitura do paquímetro). */
  param?: number;
  seconds: number;
  /** Legenda exibida durante a cena — também compõe a transcrição. */
  caption: string;
}

export type MicroMedia =
  | { kind: 'animation'; scenes: MicroScene[] }
  | { kind: 'video'; src: string; captionsSrc: string; poster?: string; durationSeconds: number; transcript: string[]; credit: string };

export interface KeyPoint {
  text: string;
  kind: ClaimKind;
  ref?: RegRef;
}

export interface MicroQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
  why: string;
  /** Comentário sobre cada alternativa (mesma ordem de `options`). */
  optionFeedback: string[];
}

export interface MicroLink {
  label: string;
  screen: GameScreen;
  param?: string;
}

export interface MicroLesson {
  id: string;
  /** Trilha de aprendizagem a que a aula pertence. */
  pathId: string;
  title: string;
  objective: string;
  skillId: string;
  media: MicroMedia;
  keyPoints: KeyPoint[];
  question: MicroQuestion;
  /** Atividade prática ligada à aula (desafio, laboratório, treino). */
  practice?: MicroLink;
  /** Aula ou conteúdo mais profundo, opcional. */
  deeper?: MicroLink;
}

/* ═════════════════════════════ TRILHA 1 — SEGURANÇA ═════════════════════════════ */

const SAFETY: MicroLesson[] = [
  {
    id: 'seg-perigos',
    pathId: 'seguranca-oficina',
    title: 'Perigo e risco: enxergar antes de agir',
    objective: 'Diferenciar perigo de risco e reconhecer os perigos mais comuns de uma oficina mecânica.',
    skillId: 'safety.hazards',
    media: {
      kind: 'animation',
      scenes: [
        { visual: 'hazard-workshop', seconds: 11, caption: 'Uma oficina mecânica tem partes girando, superfícies quentes, energia elétrica, fluidos sob pressão e cargas pesadas.' },
        { visual: 'hazard-vs-risk', seconds: 12, caption: 'Perigo é o que pode causar dano — o eixo girando. Risco é a chance de esse dano acontecer — ele cresce quando a mão chega perto.' },
        { visual: 'hazard-types', seconds: 12, caption: 'Classifique pelo tipo de energia: mecânica, elétrica, térmica e de pressão. Cada uma pede um cuidado diferente.' },
        { visual: 'hazard-workshop', param: 1, seconds: 10, caption: 'Antes de começar qualquer tarefa, pare e procure os perigos do local. Se algo estiver errado, comunique.' }
      ]
    },
    keyPoints: [
      { text: 'Perigo é a fonte de dano (ex.: eixo girando). Risco é a combinação da chance de acontecer com a gravidade do dano.', kind: 'boa-pratica' },
      { text: 'A NR-12 manda proteger as zonas de perigo das máquinas com proteções e dispositivos de segurança.', kind: 'requisito', ref: { source: 'nr12', item: '12.5.1' } },
      { text: 'A NR-12 lista riscos adicionais que também precisam de proteção, como ruído, vibração e substâncias perigosas.', kind: 'requisito', ref: { source: 'nr12', item: '12.10.1' } }
    ],
    question: {
      prompt: 'Um eixo girando sem proteção, a 2 metros de distância de onde você está. Qual frase está correta?',
      options: [
        'O eixo é um perigo; o risco aumenta se alguém se aproximar ou precisar trabalhar perto dele',
        'Como está longe, não existe perigo nenhum',
        'Perigo e risco são a mesma coisa, então tanto faz'
      ],
      correctIndex: 0,
      why: 'O perigo (eixo girando) existe mesmo de longe. O risco depende da exposição: aproximar-se, encostar a roupa ou trabalhar perto aumenta a chance de acidente.',
      optionFeedback: [
        'Isso mesmo: separar perigo de risco ajuda a decidir o que proteger primeiro.',
        'A distância reduz a exposição agora, mas o perigo continua lá — e alguém pode se aproximar.',
        'São ideias ligadas, mas diferentes: o perigo é a fonte; o risco é a chance e a gravidade do dano.'
      ]
    },
    practice: { label: 'Desafio: inspecionar a oficina', screen: 'games', param: 'inspecao-oficina' }
  },
  {
    id: 'seg-protecoes',
    pathId: 'seguranca-oficina',
    title: 'Proteções de máquinas: fixas e móveis',
    objective: 'Reconhecer proteção fixa, proteção móvel com intertravamento e por que nunca se anula uma proteção.',
    skillId: 'safety.guards',
    media: {
      kind: 'animation',
      scenes: [
        { visual: 'guard-fixed', seconds: 12, caption: 'Proteção fixa: só sai com ferramenta. É comum em correias, polias e acoplamentos.' },
        { visual: 'guard-interlock', seconds: 13, caption: 'Proteção móvel abre sem ferramenta, por isso fica ligada a um dispositivo de intertravamento: abriu, a máquina para.' },
        { visual: 'guard-interlock', param: 1, seconds: 11, caption: 'Se a parte perigosa continua girando por inércia, a proteção precisa de intertravamento com bloqueio: só abre quando parar.' },
        { visual: 'behavior-report', seconds: 10, caption: 'Proteção danificada ou retirada? Não use a máquina e comunique o seu superior.' }
      ]
    },
    keyPoints: [
      { text: 'Proteção fixa só pode ser removida ou aberta com uso de ferramentas; proteção móvel abre sem ferramentas e deve se associar a dispositivos de intertravamento.', kind: 'requisito', ref: { source: 'nr12', item: '12.5.4' } },
      { text: 'Transmissões de força acessíveis (correias, polias, acoplamentos) que ofereçam risco devem ter proteções fixas ou móveis intertravadas que impeçam o acesso por todos os lados.', kind: 'requisito', ref: { source: 'nr12', item: '12.5.9' } },
      { text: 'Cabe ao trabalhador não alterar proteções e comunicar ao superior quando uma proteção for removida, danificada ou perder a função.', kind: 'requisito', ref: { source: 'nr12', item: '12.1.10' } }
    ],
    question: {
      prompt: 'A tampa de uma furadeira de bancada abre sem ferramenta e a máquina continua funcionando com a tampa aberta. O que isso indica?',
      options: [
        'A proteção móvel não está intertravada como deveria: a máquina não deve ser usada até ser corrigida',
        'É normal: proteções móveis existem justamente para trabalhar com elas abertas',
        'Basta trabalhar com mais atenção e luvas'
      ],
      correctIndex: 0,
      why: 'Uma proteção móvel precisa de intertravamento que impeça o funcionamento perigoso com ela aberta. Se isso não acontece, a máquina está em condição insegura e o problema deve ser comunicado.',
      optionFeedback: [
        'Correto. A falha deve ser comunicada e corrigida por quem é autorizado antes do uso.',
        'Não: a proteção móvel abre sem ferramenta, mas a máquina deve parar (ou não partir) com ela aberta.',
        'Atenção não substitui proteção. E luvas perto de partes girando aumentam o risco de enroscar.'
      ]
    },
    practice: { label: 'Desafio: inspecionar a oficina', screen: 'games', param: 'inspecao-oficina' }
  },
  {
    id: 'seg-emergencia',
    pathId: 'seguranca-oficina',
    title: 'Parada de emergência: para que serve (e para que não serve)',
    objective: 'Explicar a função da parada de emergência, por que ela trava acionada e quando pode ser rearmada.',
    skillId: 'safety.estop',
    media: {
      kind: 'animation',
      scenes: [
        { visual: 'estop-press', seconds: 11, caption: 'O botão de emergência fica em local visível e livre de obstáculos. Acionado, ele tem prioridade sobre os outros comandos.' },
        { visual: 'estop-press', param: 1, seconds: 11, caption: 'Ao ser pressionado, o botão fica retido. A máquina não volta a funcionar sozinha quando você solta a mão.' },
        { visual: 'estop-reset', seconds: 13, caption: 'Primeiro corrija o que causou a emergência. Só depois destrave o botão e faça o rearme manual.' },
        { visual: 'estop-reset', param: 1, seconds: 10, caption: 'A emergência não é botão de liga/desliga do dia a dia e não substitui as proteções da máquina.' }
      ]
    },
    keyPoints: [
      { text: 'Os dispositivos de parada de emergência não devem ser utilizados como dispositivos de partida ou de acionamento.', kind: 'requisito', ref: { source: 'nr12', item: '12.6.1.1' } },
      { text: 'Devem ficar em locais de fácil acesso e visualização e mantidos permanentemente desobstruídos.', kind: 'requisito', ref: { source: 'nr12', item: '12.6.2' } },
      { text: 'A parada de emergência é medida auxiliar: não pode ser alternativa a proteções adequadas e deve prevalecer sobre os demais comandos.', kind: 'requisito', ref: { source: 'nr12', item: '12.6.3' } },
      { text: 'O acionador fica retido até ser desacionado por ação manual intencional; o rearme só ocorre após a correção do evento que motivou a parada.', kind: 'requisito', ref: { source: 'nr12', item: '12.6.5 e 12.6.8' } }
    ],
    question: {
      prompt: 'Um colega aperta a emergência do torno porque a peça soltou da placa. Qual é a sequência correta depois disso?',
      options: [
        'Manter parado, corrigir a causa (fixação da peça), avisar o responsável e só então destravar e rearmar',
        'Destravar o botão logo e religar para ver se a peça volta ao lugar',
        'Usar o botão de emergência daqui para a frente para ligar e desligar o torno'
      ],
      correctIndex: 0,
      why: 'O rearme só deve acontecer depois de corrigido o problema que levou à parada. A emergência não é um comando de operação normal.',
      optionFeedback: [
        'Isso. Emergência acionada = investigar e corrigir antes de qualquer rearme.',
        'Religar sem corrigir a causa repete o perigo — a peça pode ser lançada de novo.',
        'A NR-12 proíbe usar a parada de emergência como dispositivo de partida ou de acionamento.'
      ]
    },
    practice: { label: 'Desafio: o que fazer agora?', screen: 'games', param: 'decisao-segura' }
  },
  {
    id: 'seg-epi',
    pathId: 'seguranca-oficina',
    title: 'EPI certo para cada tarefa',
    objective: 'Entender que o EPI é a última barreira e escolher o EPI conforme o risco da tarefa.',
    skillId: 'safety.ppe',
    media: {
      kind: 'animation',
      scenes: [
        { visual: 'ppe-hierarchy', seconds: 13, caption: 'Primeiro vêm as proteções coletivas, depois a organização do trabalho e, por último, a proteção individual.' },
        { visual: 'ppe-task', seconds: 13, caption: 'O EPI depende da tarefa: óculos contra partículas, protetor auricular contra ruído, calçado contra queda de peças.' },
        { visual: 'ppe-task', param: 1, seconds: 12, caption: 'Perto de partes girando, como a placa do torno ou a broca, luvas podem enroscar e puxar a mão.' },
        { visual: 'ppe-ca', seconds: 11, caption: 'Todo EPI precisa de Certificado de Aprovação, o CA. Danificado? Avise e troque.' }
      ]
    },
    keyPoints: [
      { text: 'Na NR-12, as medidas de proteção seguem esta ordem de prioridade: coletivas, administrativas ou de organização do trabalho e, por último, individuais.', kind: 'requisito', ref: { source: 'nr12', item: '12.1.8' } },
      { text: 'O EPI só pode ser vendido ou utilizado com a indicação do Certificado de Aprovação (CA).', kind: 'requisito', ref: { source: 'nr06', item: '6.4.1' } },
      { text: 'A organização fornece o EPI gratuitamente, adequado ao risco, orienta, treina e exige o uso; a seleção considera a atividade e os riscos avaliados.', kind: 'requisito', ref: { source: 'nr06', item: '6.5.1 e 6.5.2' } },
      { text: 'O trabalhador usa o EPI fornecido, só para a finalidade dele, cuida da conservação e comunica quando estiver danificado.', kind: 'requisito', ref: { source: 'nr06', item: '6.6.1' } },
      { text: 'Evitar luvas perto de partes rotativas (placa do torno, broca) é uma boa prática consolidada: a luva pode ser agarrada.', kind: 'boa-pratica' }
    ],
    question: {
      prompt: 'Para furar uma peça presa na morsa da furadeira de bancada, qual combinação faz mais sentido?',
      options: [
        'Óculos de proteção e calçado de segurança; sem luvas perto da broca girando',
        'Luvas de raspa grossas para segurar a peça perto da broca',
        'Nenhum EPI, porque a tarefa é rápida'
      ],
      correctIndex: 0,
      why: 'Óculos protegem dos cavacos e o calçado protege de quedas de peças. Luvas perto da broca girando podem enroscar. A lista final de EPIs é definida pela avaliação de riscos da empresa.',
      optionFeedback: [
        'Boa escolha para este cenário simplificado. Na empresa, a seleção oficial do EPI vem da avaliação de riscos.',
        'A luva pode ser agarrada pela broca e puxar a mão. A peça deve ficar presa na morsa, não na mão.',
        'Tarefas rápidas também lançam cavacos. A duração não elimina o perigo.'
      ]
    },
    practice: { label: 'Desafio: escolha os EPIs', screen: 'games', param: 'epi-tarefa' }
  },
  {
    id: 'seg-comportamento',
    pathId: 'seguranca-oficina',
    title: 'Comportamento seguro na oficina',
    objective: 'Aplicar hábitos simples que evitam acidentes: organização, roupa adequada e comunicação.',
    skillId: 'safety.workshop',
    media: {
      kind: 'animation',
      scenes: [
        { visual: 'behavior-housekeeping', seconds: 12, caption: 'Chão limpo e ferramentas no lugar evitam escorregões, tropeços e ferramentas esquecidas dentro da máquina.' },
        { visual: 'behavior-adornos', seconds: 13, caption: 'Cabelo comprido preso, mangas justas, sem anéis, pulseiras ou correntes perto de partes girando.' },
        { visual: 'behavior-report', seconds: 12, caption: 'Viu uma condição insegura? Não improvise: pare, sinalize e comunique o responsável.' }
      ]
    },
    keyPoints: [
      { text: 'Cabe ao trabalhador cumprir os procedimentos seguros, não alterar proteções e comunicar quando um dispositivo de segurança for removido ou danificado.', kind: 'requisito', ref: { source: 'nr12', item: '12.1.10' } },
      { text: 'Organização (5S), roupa justa, cabelo preso e não usar adornos perto de partes móveis são boas práticas consolidadas de oficina.', kind: 'boa-pratica' }
    ],
    question: {
      prompt: 'Você vai operar o torno com supervisão. Está de pulseira e com o cabelo comprido solto. O que fazer?',
      options: [
        'Tirar a pulseira e prender o cabelo antes de se aproximar da máquina',
        'Manter assim e só tomar cuidado para não encostar',
        'Colocar luvas para proteger as mãos'
      ],
      correctIndex: 0,
      why: 'Adornos e cabelo solto podem ser agarrados pela placa ou pelo eixo em rotação. Eliminar a exposição é mais eficaz do que "tomar cuidado".',
      optionFeedback: [
        'Correto: retirar o que pode enroscar elimina o problema na origem.',
        'Um descuido de segundos basta para o cabelo ou a pulseira serem puxados.',
        'Luvas perto da placa girando também podem enroscar — não resolvem o problema.'
      ]
    },
    practice: { label: 'Desafio: inspecionar a oficina', screen: 'games', param: 'inspecao-oficina' }
  },
  {
    id: 'seg-energias',
    pathId: 'seguranca-oficina',
    title: 'Perigos mecânicos, elétricos, térmicos e de pressão',
    objective: 'Reconhecer as formas de energia de uma máquina e o cuidado básico com cada uma.',
    skillId: 'safety.hazards',
    media: {
      kind: 'animation',
      scenes: [
        { visual: 'energy-sources', seconds: 13, caption: 'Uma mesma máquina pode ter energia elétrica, mecânica, hidráulica ou pneumática, térmica e a gravidade agindo em peças elevadas.' },
        { visual: 'hazard-types', param: 1, seconds: 12, caption: 'Superfícies quentes queimam; mangueiras pressurizadas podem romper e lançar fluido; eletricidade causa choque.' },
        { visual: 'energy-sources', param: 1, seconds: 12, caption: 'Serviço em instalação elétrica é trabalho de profissional autorizado conforme a NR-10. O mecânico pede o bloqueio, não improvisa.' }
      ]
    },
    keyPoints: [
      { text: 'Mangueiras e componentes pressurizados devem ser localizados ou protegidos para que uma ruptura ou vazamento não cause acidentes.', kind: 'requisito', ref: { source: 'nr12', item: '12.7.2' } },
      { text: 'Devem existir medidas contra queimaduras por contato com superfícies aquecidas (barreiras, isolação, redução da temperatura).', kind: 'requisito', ref: { source: 'nr12', item: '12.10.4' } },
      { text: 'Na eletricidade, a proteção coletiva compreende prioritariamente a desenergização, que só vale quando segue a sequência de procedimentos da norma (seccionamento, impedimento de reenergização, constatação da ausência de tensão…).', kind: 'requisito', ref: { source: 'nr10', item: '10.2.8.2 e 10.5.1' } },
      { text: 'Caldeiras e vasos de pressão têm regras próprias na NR-13; nem todo equipamento com pressão está nessa norma — o enquadramento depende do equipamento.', kind: 'boa-pratica' }
    ],
    question: {
      prompt: 'Uma bomba foi desligada no painel há 1 minuto. Que energias ainda podem estar presentes ao abrir a carcaça?',
      options: [
        'Pressão do líquido na carcaça e na tubulação, temperatura do líquido e o eixo ainda girando por inércia',
        'Nenhuma, porque o motor foi desligado',
        'Só a energia elétrica do motor'
      ],
      correctIndex: 0,
      why: 'Desligar o motor não alivia a pressão, não esfria o líquido e não para instantaneamente as partes girando. Cada energia tem que ser controlada antes da intervenção.',
      optionFeedback: [
        'Exato. Por isso o procedimento inclui fechar válvulas, despressurizar, drenar, esperar esfriar e confirmar a parada.',
        'Desligar não é o mesmo que isolar e descarregar todas as energias.',
        'A eletricidade é só uma delas. Pressão, calor e inércia continuam.'
      ]
    },
    practice: { label: 'Desafio: o que fazer agora?', screen: 'games', param: 'decisao-segura' }
  },
  {
    id: 'seg-partida-inesperada',
    pathId: 'seguranca-oficina',
    title: 'Partida inesperada e energia armazenada',
    objective: 'Entender por que uma máquina pode se mover "desligada" e como isso causa acidentes graves.',
    skillId: 'safety.energy',
    media: {
      kind: 'animation',
      scenes: [
        { visual: 'unexpected-start', seconds: 13, caption: 'Falta de energia, alguém no painel ou um comando automático: se a máquina puder ligar enquanto você está nela, o risco é grave.' },
        { visual: 'stored-energy', seconds: 13, caption: 'Energia armazenada: mola comprimida, volante girando por inércia, acumulador com pressão, peça elevada que pode descer.' },
        { visual: 'unexpected-start', param: 1, seconds: 11, caption: 'Ao voltar a energia, a máquina não pode partir sozinha. É preciso um comando intencional.' }
      ]
    },
    keyPoints: [
      { text: 'Os comandos de partida devem possuir dispositivos que impeçam o funcionamento automático ao serem energizados.', kind: 'requisito', ref: { source: 'nr12', item: '12.4.2' } },
      { text: 'Na manutenção, são exigidas medidas adicionais quando a máquina é sustentada só por sistemas hidráulicos ou pneumáticos, e retenção com trava mecânica para partes basculadas ou articuladas.', kind: 'requisito', ref: { source: 'nr12', item: '12.11.3 d) e e)' } },
      { text: 'Volantes e eixos podem continuar girando depois do desligamento; espere a parada total e confirme antes de tocar.', kind: 'boa-pratica' }
    ],
    question: {
      prompt: 'Uma prensa hidráulica está desligada e bloqueada, mas o martelo está parado no alto. Qual é o perigo que continua?',
      options: [
        'O martelo pode descer pelo próprio peso ou pela pressão retida — precisa de calço/trava mecânica e alívio da pressão',
        'Nenhum, porque a energia elétrica foi bloqueada',
        'Apenas o ruído da máquina'
      ],
      correctIndex: 0,
      why: 'Gravidade e pressão hidráulica são energias armazenadas. O bloqueio elétrico sozinho não segura uma peça elevada.',
      optionFeedback: [
        'Correto: retenção mecânica e alívio de pressão controlam essas energias.',
        'Bloquear a eletricidade não elimina a gravidade nem a pressão retida no circuito.',
        'O ruído não é o problema aqui: o perigo é o movimento inesperado do martelo.'
      ]
    },
    practice: { label: 'Desafio: o que fazer agora?', screen: 'games', param: 'decisao-segura' }
  },
  {
    id: 'seg-bloqueio',
    pathId: 'seguranca-oficina',
    title: 'Isolamento, bloqueio e etiquetagem de energias',
    objective: 'Descrever as etapas gerais de isolamento e bloqueio exigidas para intervir em uma máquina parada.',
    skillId: 'safety.loto',
    media: {
      kind: 'animation',
      scenes: [
        { visual: 'loto-steps', param: 0, seconds: 12, caption: 'Avise a equipe e desligue a máquina pelo comando normal.' },
        { visual: 'loto-steps', param: 1, seconds: 12, caption: 'Isole todas as fontes de energia e descarregue as energias retidas: pressão, molas, peças elevadas.' },
        { visual: 'loto-tag', seconds: 13, caption: 'Bloqueie o dispositivo de corte na posição desligado com cadeado e etiqueta: data, horário, motivo e responsável.' },
        { visual: 'loto-steps', param: 2, seconds: 12, caption: 'Teste: tente partir a máquina pelo comando e confirme que nada se move. Só então comece.' }
      ]
    },
    keyPoints: [
      { text: 'Manutenção, inspeção, reparo, limpeza e ajuste: máquinas paradas e isolamento e descarga de todas as fontes de energia, de modo visível ou facilmente identificável.', kind: 'requisito', ref: { source: 'nr12', item: '12.11.3 a)' } },
      { text: 'Bloqueio mecânico e elétrico na posição "desligado" ou "fechado" e sinalização com cartão ou etiqueta contendo horário, data, motivo da manutenção e nome do responsável.', kind: 'requisito', ref: { source: 'nr12', item: '12.11.3 b)' } },
      { text: 'Cada pessoa que trabalha na máquina coloca o seu próprio cadeado; testar a partida antes de começar confirma o isolamento.', kind: 'boa-pratica' },
      { text: 'A sequência exata (quem bloqueia, onde, como testar) está no procedimento da empresa para cada máquina. Aqui o roteiro é simplificado.', kind: 'simplificado' }
    ],
    question: {
      prompt: 'Qual destas etiquetas de bloqueio atende ao que a NR-12 pede?',
      options: [
        '"Em manutenção — 17/10, 14h30 — troca do selo da bomba B-02 — João Silva"',
        '"Não ligar"',
        '"Manutenção" escrito à mão, sem nome'
      ],
      correctIndex: 0,
      why: 'A etiqueta de bloqueio deve conter horário e data do bloqueio, o motivo da manutenção e o nome do responsável (NR-12, 12.11.3 b).',
      optionFeedback: [
        'Correto: dá para saber quando, por quê e quem — e a quem perguntar antes de qualquer liberação.',
        'Faltam data, horário, motivo e o responsável.',
        'Sem nome e sem motivo, ninguém sabe quem precisa liberar a máquina.'
      ]
    },
    practice: { label: 'Laboratório: desmontar a bomba com segurança', screen: 'lab', param: 'centrifugal-pump' },
    deeper: { label: 'Aula: ferramentas e início seguro da manutenção', screen: 'quiz', param: 'lesson-beginner-tools-fasteners' }
  },
  {
    id: 'seg-manuseio',
    pathId: 'seguranca-oficina',
    title: 'Manuseio seguro de cargas, ferramentas e peças',
    objective: 'Levantar, transportar e manusear componentes respeitando capacidade, postura e o estado das ferramentas.',
    skillId: 'safety.handling',
    media: {
      kind: 'animation',
      scenes: [
        { visual: 'handling-load', seconds: 13, caption: 'Talha, cinta e corrente têm capacidade máxima indicada. Confira antes de içar e nunca fique sob a carga suspensa.' },
        { visual: 'handling-lift', seconds: 12, caption: 'No levantamento manual, mantenha a carga perto do corpo e evite torcer o tronco.' },
        { visual: 'handling-tool-damaged', seconds: 12, caption: 'Ferramenta com cabo trincado ou boca gasta sai de uso e é identificada. Nada de remendo.' }
      ]
    },
    keyPoints: [
      { text: 'Em todo equipamento de movimentação deve ser indicada, em lugar visível, a carga máxima de trabalho permitida.', kind: 'requisito', ref: { source: 'nr11', item: '11.1.3.2' } },
      { text: 'Cabos de aço, cordas, correntes, roldanas e ganchos devem ser inspecionados permanentemente, substituindo-se as partes defeituosas.', kind: 'requisito', ref: { source: 'nr11', item: '11.1.3.1' } },
      { text: 'É vedado o levantamento não eventual de cargas que comprometa a segurança quando a pega estiver a mais de 60 cm do corpo na horizontal.', kind: 'requisito', ref: { source: 'nr17', item: '17.5.2.1' } },
      { text: 'Retirar de uso ferramentas danificadas é boa prática; para componentes de máquinas que comprometam a segurança, a NR-12 exige reparo ou substituição imediata.', kind: 'requisito', ref: { source: 'nr12', item: '12.11.5' } }
    ],
    question: {
      prompt: 'O cavalete da bomba vai ser içado com uma talha. A plaqueta da talha está ilegível. O que fazer?',
      options: [
        'Não içar até confirmar a capacidade da talha e dos acessórios com o responsável',
        'Içar devagar: se a talha aguentar, está tudo certo',
        'Pedir para um colega segurar a peça por baixo, por garantia'
      ],
      correctIndex: 0,
      why: 'Sem saber a carga máxima, não há como garantir que a talha e as cintas suportam o peso. Testar "devagar" ainda pode terminar em queda da carga.',
      optionFeedback: [
        'Correto: a capacidade deve estar indicada e conferida antes do içamento.',
        'Uma falha pode acontecer no meio do içamento, com a carga no alto.',
        'Ninguém deve ficar sob carga suspensa nem segurá-la por baixo.'
      ]
    },
    practice: { label: 'Desafio: inspecionar a oficina', screen: 'games', param: 'inspecao-oficina' }
  },
  {
    id: 'seg-supervisao',
    pathId: 'seguranca-oficina',
    title: 'Quando parar e chamar o responsável',
    objective: 'Reconhecer quando uma atividade exige profissional capacitado, qualificado ou habilitado — e autorizado.',
    skillId: 'safety.supervision',
    media: {
      kind: 'animation',
      scenes: [
        { visual: 'supervision-roles', seconds: 13, caption: 'Na NR-12, só trabalhadores capacitados, qualificados ou legalmente habilitados, e autorizados, operam e fazem manutenção em máquinas.' },
        { visual: 'supervision-roles', param: 1, seconds: 12, caption: 'A capacitação é dada pela empresa antes de assumir a função, com conteúdo da própria NR. Um jogo ou curso on-line sozinho não autoriza ninguém.' },
        { visual: 'supervision-stop', seconds: 12, caption: 'Tarefa fora do seu treinamento, procedimento que não existe ou condição estranha: pare e chame o responsável.' }
      ]
    },
    keyPoints: [
      { text: 'Operação, manutenção, inspeção e demais intervenções devem ser feitas por trabalhadores habilitados, qualificados ou capacitados, e autorizados para este fim.', kind: 'requisito', ref: { source: 'nr12', item: '12.16.1' } },
      { text: 'A capacitação é providenciada pelo empregador, ocorre antes de assumir a função, sem ônus e com conteúdo conforme o Anexo II da NR-12.', kind: 'requisito', ref: { source: 'nr12', item: '12.16.2 e 12.16.3' } },
      { text: 'Serviços em eletricidade têm requisitos próprios de qualificação, habilitação e autorização na NR-10.', kind: 'requisito', ref: { source: 'nr10', item: '10.8' } },
      { text: 'Este aplicativo é material de estudo: não substitui a capacitação exigida nem autoriza o uso de máquinas reais.', kind: 'simplificado' }
    ],
    question: {
      prompt: 'Você terminou todas as aulas de segurança deste aplicativo. Isso permite operar o torno da empresa sozinho?',
      options: [
        'Não. É preciso a capacitação da empresa e a autorização formal para aquela máquina',
        'Sim, porque o aplicativo cobre a NR-12',
        'Sim, desde que use todos os EPIs'
      ],
      correctIndex: 0,
      why: 'A NR-12 exige capacitação providenciada pelo empregador e autorização. Estudar ajuda, mas não substitui esses requisitos.',
      optionFeedback: [
        'Correto. O estudo prepara você para aproveitar melhor a capacitação real.',
        'O aplicativo é material de estudo. Ele não é a capacitação prevista no item 12.16 da NR-12.',
        'EPI não substitui capacitação nem autorização.'
      ]
    },
    practice: { label: 'Desafio: o que fazer agora?', screen: 'games', param: 'decisao-segura' }
  }
];

/* ═════════════════════════════ AULAS TÉCNICAS ═════════════════════════════ */

const TECHNICAL: MicroLesson[] = [
  {
    id: 'tec-chave-combinada',
    pathId: 'ferramentas-fixacao',
    title: 'Como reconhecer e usar a chave combinada',
    objective: 'Identificar as duas pontas da chave combinada e escolher a medida pela distância entre faces do sextavado.',
    skillId: 'tools.selection',
    media: {
      kind: 'animation',
      scenes: [
        { visual: 'wrench-anatomy', seconds: 12, caption: 'A chave combinada tem uma boca aberta de um lado e um anel estriado do outro, com a mesma medida.' },
        { visual: 'wrench-fit', seconds: 13, caption: 'A medida gravada é a distância entre faces opostas do sextavado. Meça ou confira antes: cabeças parecidas podem ter medidas diferentes.' },
        { visual: 'wrench-fit', param: 1, seconds: 12, caption: 'Chave folgada escorrega e arredonda os cantos. Use o anel para soltar e prefira puxar a chave em sua direção.' }
      ]
    },
    keyPoints: [
      { text: 'A medida da chave corresponde à distância entre faces (abertura) do sextavado, em milímetros ou polegadas.', kind: 'boa-pratica' },
      { text: 'Ex.: pela ISO 4017 a cabeça do parafuso M12 mede 18 mm entre faces; pela antiga DIN 933, 19 mm. Por isso não se escolhe a chave só pelo diâmetro da rosca.', kind: 'boa-pratica' }
    ],
    question: {
      prompt: 'Um parafuso M12 precisa ser solto. A cabeça está pintada e você não sabe se segue a ISO 4017 (18 mm) ou a DIN 933 (19 mm). O que fazer?',
      options: [
        'Conferir a medida entre faces (com paquímetro ou testando a chave sem forçar) antes de aplicar força',
        'Usar a chave de 19 mm, que é o padrão de todo M12',
        'Usar uma chave inglesa para servir em qualquer caso'
      ],
      correctIndex: 0,
      why: 'O diâmetro da rosca não define sozinho a medida da cabeça. Conferir evita usar chave folgada e arredondar o sextavado.',
      optionFeedback: [
        'Correto: primeiro a informação, depois a força.',
        'Nem todo M12 tem cabeça 19 mm — pela ISO 4017 ela mede 18 mm.',
        'A chave ajustável tem folga e é a que mais arredonda cantos em aperto alto. Use a chave fixa na medida certa.'
      ]
    },
    practice: { label: 'Desafio: qual ferramenta usar?', screen: 'games', param: 'ferramenta-certa' },
    deeper: { label: 'Ficha completa da chave combinada', screen: 'tools', param: 'chave-combinada' }
  },
  {
    id: 'tec-fixador',
    pathId: 'ferramentas-fixacao',
    title: 'Como identificar um parafuso',
    objective: 'Ler cabeça, acionamento, rosca (diâmetro × passo), comprimento e classe de resistência de um parafuso.',
    skillId: 'fasteners.identification',
    media: {
      kind: 'animation',
      scenes: [
        { visual: 'fastener-anatomy', seconds: 13, caption: 'Um parafuso se descreve por cabeça, tipo de acionamento, rosca, comprimento e material ou classe de resistência.' },
        { visual: 'fastener-callout', seconds: 14, caption: 'M10 × 1,5 × 30 — 8.8: rosca métrica de 10 mm, passo 1,5 mm, 30 mm de comprimento sob a cabeça e classe 8.8.' },
        { visual: 'fastener-anatomy', param: 1, seconds: 12, caption: 'A aparência não basta: dois parafusos iguais por fora podem ter classes, passos ou materiais diferentes.' }
      ]
    },
    keyPoints: [
      { text: 'Na rosca métrica grossa (ISO 261/262), o M10 tem passo de 1,5 mm e o M12, de 1,75 mm. Existem roscas finas com o mesmo diâmetro.', kind: 'boa-pratica' },
      { text: 'Na classe 8.8 (ISO 898-1), o primeiro número indica a resistência à tração nominal (8 × 100 = 800 MPa) e o segundo, a relação de escoamento (0,8 × 800 = 640 MPa).', kind: 'boa-pratica' },
      { text: 'O comprimento de parafusos de cabeça sextavada ou cilíndrica é medido sob a cabeça; nos escareados, inclui a cabeça.', kind: 'boa-pratica' }
    ],
    question: {
      prompt: 'Na cabeça de um parafuso está gravado "8.8". O que essa marcação informa?',
      options: ['A classe de resistência do material do parafuso', 'O diâmetro de 8,8 mm', 'O torque de aperto de 8,8 N·m'],
      correctIndex: 0,
      why: 'A marcação na cabeça é a classe de resistência (ISO 898-1). Diâmetro e passo vêm da designação da rosca; o torque vem do projeto ou do manual do equipamento.',
      optionFeedback: [
        'Correto. A classe ajuda a escolher a peça de reposição equivalente.',
        'O diâmetro está na designação da rosca (ex.: M10), não na marcação da cabeça.',
        'Torque de aperto nunca é gravado no parafuso: ele depende da junta e vem do manual ou do projeto.'
      ]
    },
    practice: { label: 'Escolher um fixador passo a passo', screen: 'tools', param: 'fixadores' }
  },
  {
    id: 'tec-paquimetro',
    pathId: 'medicao',
    title: 'Ler o paquímetro em 60 segundos',
    objective: 'Somar a leitura da escala fixa com a do nônio em um paquímetro de 0,05 mm.',
    skillId: 'measure.caliper',
    media: {
      kind: 'animation',
      scenes: [
        { visual: 'caliper-read', param: 23.35, seconds: 12, caption: 'Olhe o zero do nônio: ele passou do traço 23 da escala fixa. Esse é o valor em milímetros inteiros.' },
        { visual: 'caliper-read', param: 23.35, seconds: 13, caption: 'Agora procure o traço do nônio que coincide com a escala fixa. Cada traço do nônio vale 0,05 mm: o 7º traço dá 0,35 mm.' },
        { visual: 'caliper-read', param: 41.6, seconds: 13, caption: 'Some as duas partes. Outro exemplo: 41 mm + 12 traços × 0,05 mm = 41,60 mm.' }
      ]
    },
    keyPoints: [
      { text: 'Leitura = milímetros inteiros antes do zero do nônio + (traço coincidente × resolução). Resolução deste paquímetro: 0,05 mm.', kind: 'boa-pratica' },
      { text: 'Limpe as faces, confira o zero e meça com a peça parada e na temperatura ambiente.', kind: 'boa-pratica' }
    ],
    question: {
      prompt: 'O zero do nônio passou do traço 15 da escala fixa e o 9º traço do nônio coincide (resolução 0,05 mm). Qual é a leitura?',
      options: ['15,45 mm', '15,90 mm', '15,09 mm'],
      correctIndex: 0,
      why: '15 mm + 9 × 0,05 mm = 15 + 0,45 = 15,45 mm.',
      optionFeedback: [
        'Correto: 9 × 0,05 = 0,45.',
        'Isso seria multiplicar o traço por 0,1 mm. Neste paquímetro cada traço vale 0,05 mm.',
        'O número do traço não é somado diretamente: ele é multiplicado pela resolução.'
      ]
    },
    practice: { label: 'Treino: leituras do paquímetro', screen: 'tools', param: 'treino-paquimetro' }
  },
  {
    id: 'tec-rolamento',
    pathId: 'componentes',
    title: 'O que faz um rolamento',
    objective: 'Explicar a função do rolamento e as partes de um rolamento rígido de esferas.',
    skillId: 'bearings.function',
    media: {
      kind: 'animation',
      scenes: [
        { visual: 'bearing-section', seconds: 13, caption: 'O rolamento apoia o eixo e troca o atrito de escorregamento por rolamento: anel interno, anel externo, esferas e gaiola.' },
        { visual: 'bearing-loads', seconds: 12, caption: 'Ele suporta cargas radiais, perpendiculares ao eixo, e — conforme o tipo — cargas axiais, ao longo do eixo.' },
        { visual: 'bearing-mounting', seconds: 13, caption: 'Na montagem, a força vai só no anel que tem aperto. Força passando pelas esferas marca as pistas e encurta a vida do rolamento.' }
      ]
    },
    keyPoints: [
      { text: 'Rolamentos rígidos de esferas suportam principalmente carga radial e alguma carga axial nos dois sentidos.', kind: 'boa-pratica' },
      { text: 'Montar aplicando força no anel com interferência (geralmente o interno, no eixo) é recomendação dos fabricantes de rolamentos.', kind: 'boa-pratica' }
    ],
    question: {
      prompt: 'Para montar um rolamento com interferência no eixo, onde a bucha de montagem deve apoiar?',
      options: ['No anel interno', 'No anel externo', 'Nas esferas, pela lateral'],
      correctIndex: 0,
      why: 'O anel interno é o que tem aperto no eixo. Empurrando por ele, a força não passa pelas esferas e pistas.',
      optionFeedback: [
        'Correto.',
        'Empurrar pelo anel externo faz a força passar pelas esferas até o anel interno, marcando as pistas.',
        'As esferas nunca recebem força de montagem diretamente.'
      ]
    },
    practice: { label: 'Laboratório: rolamentos da bomba', screen: 'lab', param: 'centrifugal-pump' },
    deeper: { label: 'Aula: redutores e rolamentos', screen: 'quiz', param: 'lesson-gearbox-fundamentals' }
  },
  {
    id: 'tec-selo',
    pathId: 'componentes',
    title: 'O que faz um selo mecânico',
    objective: 'Explicar como o selo mecânico veda o eixo de uma bomba e os cuidados para não danificá-lo.',
    skillId: 'pumps.sealing',
    media: {
      kind: 'animation',
      scenes: [
        { visual: 'seal-section', seconds: 13, caption: 'Onde o eixo atravessa a carcaça, o líquido tenta escapar. O selo mecânico veda esse ponto.' },
        { visual: 'seal-section', param: 1, seconds: 13, caption: 'Uma face gira com o eixo e outra fica parada na tampa. A mola mantém as duas encostadas, com um filme fino de líquido entre elas.' },
        { visual: 'seal-section', param: 2, seconds: 12, caption: 'Sem líquido, as faces aquecem e trincam: nunca funcione a bomba a seco. Na montagem, não toque nas faces.' }
      ]
    },
    keyPoints: [
      { text: 'As faces de vedação são lapidadas; sujeira ou impacto causam vazamento.', kind: 'boa-pratica' },
      { text: 'Em bombas que usam o próprio líquido para lubrificar o selo, operar a seco danifica as faces.', kind: 'boa-pratica' }
    ],
    question: {
      prompt: 'O que mantém as duas faces do selo mecânico encostadas?',
      options: ['Uma mola (ou fole) e a pressão do líquido', 'A porca do rotor', 'O aperto dos parafusos da carcaça'],
      correctIndex: 0,
      why: 'A mola (ou fole) empurra a face móvel contra a sede; a pressão do líquido também contribui, conforme o projeto do selo.',
      optionFeedback: ['Correto.', 'A porca prende o rotor no eixo, não as faces do selo.', 'Os parafusos fecham a carcaça, mas não geram a força entre as faces.']
    },
    practice: { label: 'Laboratório: retirar o selo da bomba', screen: 'lab', param: 'centrifugal-pump' }
  },
  {
    id: 'tec-bomba-tipos',
    pathId: 'bombas',
    title: 'Bomba centrífuga ou bomba de engrenagens?',
    objective: 'Diferenciar o princípio de funcionamento de uma bomba centrífuga e de uma bomba de engrenagens externas.',
    skillId: 'pumps.types',
    media: {
      kind: 'animation',
      scenes: [
        { visual: 'pump-centrifugal', seconds: 13, caption: 'Na centrífuga, o rotor gira e joga o líquido para fora com velocidade. A voluta transforma velocidade em pressão.' },
        { visual: 'pump-gear', seconds: 14, caption: 'Na bomba de engrenagens, o líquido é levado nos vãos dos dentes, pela parte de fora, da entrada até a saída. É deslocamento positivo.' },
        { visual: 'pump-compare', seconds: 13, caption: 'Fechar a saída de uma bomba de deslocamento positivo faz a pressão subir muito: o sistema precisa de válvula de alívio.' }
      ]
    },
    keyPoints: [
      { text: 'Bombas centrífugas são bombas dinâmicas: a vazão varia bastante com a pressão do sistema.', kind: 'boa-pratica' },
      { text: 'Bombas de engrenagens são de deslocamento positivo: a cada volta deslocam um volume quase fixo, comuns em óleo e hidráulica.', kind: 'boa-pratica' },
      { text: 'Bombas de deslocamento positivo precisam de proteção contra sobrepressão (válvula de alívio) no circuito.', kind: 'boa-pratica' }
    ],
    question: {
      prompt: 'Por que é perigoso fechar totalmente a válvula de saída de uma bomba de engrenagens em funcionamento, sem válvula de alívio?',
      options: [
        'Porque ela continua deslocando volume e a pressão sobe até algo romper ou o motor travar',
        'Porque a bomba passa a girar ao contrário',
        'Não há perigo: ela simplesmente para de bombear, como a centrífuga'
      ],
      correctIndex: 0,
      why: 'Cada volta das engrenagens empurra um volume de líquido. Sem saída, a pressão cresce rapidamente — por isso a válvula de alívio é indispensável.',
      optionFeedback: [
        'Correto.',
        'O sentido de giro é dado pelo motor, não pela válvula.',
        'Esse comportamento é da bomba centrífuga (que também aquece se operar muito tempo assim). A de engrenagens gera sobrepressão.'
      ]
    },
    practice: { label: 'Laboratório: bomba de engrenagens em 3D', screen: 'lab', param: 'gear-pump' },
    deeper: { label: 'Aula: como funciona uma bomba centrífuga', screen: 'quiz', param: 'lesson-centrifugal-pump' }
  },
  {
    id: 'tec-pre-inspecao',
    pathId: 'lubrificacao-preventiva',
    title: 'O que conferir antes de começar uma manutenção',
    objective: 'Organizar o início de uma manutenção: ordem de serviço, procedimento, bloqueio, ferramentas, peças e área.',
    skillId: 'maint.routine',
    media: {
      kind: 'animation',
      scenes: [
        { visual: 'preinspection-checklist', param: 0, seconds: 12, caption: 'Leia a ordem de serviço e o procedimento ou manual do equipamento. Dúvida sobre o que fazer? Pergunte antes.' },
        { visual: 'preinspection-checklist', param: 1, seconds: 12, caption: 'Confirme o bloqueio das energias e teste a partida. Combine com a operação quando a máquina vai parar.' },
        { visual: 'preinspection-checklist', param: 2, seconds: 13, caption: 'Separe ferramentas certas, instrumentos calibrados, peças de reposição e EPIs. Isole e organize a área.' }
      ]
    },
    keyPoints: [
      { text: 'As manutenções devem ser registradas com intervenções, data, serviço, peças trocadas, condições de segurança e responsável.', kind: 'requisito', ref: { source: 'nr12', item: '12.11.2' } },
      { text: 'Manutenção na forma e periodicidade determinadas pelo fabricante ou por profissional habilitado ou qualificado.', kind: 'requisito', ref: { source: 'nr12', item: '12.11.1' } },
      { text: 'A ordem dos itens do checklist é uma organização didática.', kind: 'simplificado' }
    ],
    question: {
      prompt: 'O manual pede um torque de aperto que não está na ordem de serviço. Você não tem o manual na oficina. O que fazer?',
      options: [
        'Buscar o manual ou o valor com o responsável antes do aperto final',
        'Usar um valor de uma tabela genérica da internet',
        'Apertar "bem forte" para garantir'
      ],
      correctIndex: 0,
      why: 'O torque depende do projeto da junta (parafuso, junta de vedação, lubrificação). O valor correto vem da documentação do equipamento.',
      optionFeedback: [
        'Correto: informação técnica faltando = buscar a fonte certa.',
        'Tabelas genéricas não consideram a junta específica e podem esmagar a vedação ou deixar o aperto fraco.',
        'Aperto excessivo pode romper o parafuso ou danificar a junta.'
      ]
    },
    practice: { label: 'Desafio: diagnóstico de falhas', screen: 'games', param: 'diagnostico' }
  }
];

/* ═════════════════════════════ TRILHA — INDÚSTRIA NA PRÁTICA ═════════════════════════════ */

const INDUSTRY: MicroLesson[] = [
  {
    id: 'rol-fixo-livre',
    pathId: 'rolamentos-transmissao',
    title: 'Rolamento fixo e rolamento livre',
    objective: 'Explicar por que um eixo apoiado em dois mancais usa um rolamento fixo e um rolamento livre.',
    skillId: 'bearings.arrangement',
    media: {
      kind: 'video',
      src: '/media/aulas/rolamento-fixo-livre.mp4',
      captionsSrc: '/media/aulas/rolamento-fixo-livre.vtt',
      poster: '/media/aulas/rolamento-fixo-livre.jpg',
      durationSeconds: 78,
      transcript: [
        'Neste conjunto, o eixo está apoiado em dois rolamentos diferentes. Por quê?',
        'De um lado, a polia recebe o giro. Do outro, o acoplamento entrega o giro. O eixo passa por duas caixas de mancal, cada uma com o seu rolamento.',
        'Do lado da polia fica um rolamento rígido de esferas. Ele é o rolamento fixo: segura o eixo para não andar para os lados, nos dois sentidos.',
        'Do lado do acoplamento fica um rolamento de rolos cilíndricos, tipo NU. O anel interno não tem rebordos e pode deslizar sob os rolos. Esse é o rolamento livre.',
        'Em operação, o eixo esquenta e fica um pouco mais comprido. O rolamento livre deixa o eixo crescer. Se os dois prendessem o eixo nos dois sentidos, a dilatação viraria força nos rolamentos: aquecimento e falha antes do tempo.',
        'No desenho de conjunto, veja o que segura cada anel interno: o ressalto do eixo de um lado e o anel elástico do outro. Ajustes, folgas e lubrificação vêm sempre do fabricante e do projeto.',
        'Resumo: o rolamento fixo posiciona o eixo; o rolamento livre deixa o eixo dilatar. Agora responda à pergunta e depois desmonte o conjunto no laboratório 3D.'
      ],
      credit: 'Narração sintetizada com Kokoro-82M (pesos Apache-2.0, voz pf_dora) · imagens do laboratório 3D do Mecânica Lab'
    },
    keyPoints: [
      { text: 'O rolamento fixo posiciona o eixo na direção axial, nos dois sentidos.', kind: 'boa-pratica' },
      { text: 'O rolamento livre deixa o eixo dilatar com o calor sem gerar força axial nos rolamentos.', kind: 'boa-pratica' },
      { text: 'Modelo simplificado: ajustes, folgas, lubrificante e a escolha do arranjo vêm do fabricante e do projeto.', kind: 'simplificado' }
    ],
    question: {
      prompt: 'Por que o conjunto usa um rolamento livre do lado do acoplamento?',
      options: [
        'Para o eixo poder crescer com o calor sem forçar os rolamentos',
        'Porque rolamento de rolos é mais barato',
        'Para o eixo poder girar mais rápido',
        'Para segurar o eixo nos dois sentidos'
      ],
      correctIndex: 0,
      why: 'Em operação o eixo esquenta e fica um pouco mais longo. O rolamento livre deixa esse movimento acontecer; quem posiciona o eixo é o rolamento fixo.',
      optionFeedback: [
        'Correto: a dilatação térmica precisa de um lado livre.',
        'Custo não é o motivo do arranjo; a função é acomodar a dilatação.',
        'O arranjo fixo/livre não muda a rotação do eixo.',
        'Segurar nos dois sentidos é a função do rolamento fixo, do outro lado.'
      ]
    },
    practice: { label: 'Laboratório 3D: eixo e mancais', screen: 'lab', param: 'bearing-assembly' },
    deeper: { label: 'Missão: ler o desenho de conjunto', screen: 'industry', param: 'missao-ler-desenho' }
  },
  {
    id: 'red-rotacao-torque',
    pathId: 'rolamentos-transmissao',
    title: 'Redutor: troca rotação por torque',
    objective: 'Calcular a relação de um par de engrenagens pelo número de dentes e dizer o que acontece com a rotação, o sentido e o torque na saída.',
    skillId: 'transmission.gears',
    media: {
      kind: 'video',
      src: '/media/aulas/redutor-rotacao-torque.mp4',
      captionsSrc: '/media/aulas/redutor-rotacao-torque.vtt',
      poster: '/media/aulas/redutor-rotacao-torque.jpg',
      durationSeconds: 70,
      transcript: [
        'Neste conjunto, um motor elétrico aciona um redutor de um estágio. Para que serve o redutor?',
        'O motor gira rápido. Muitas máquinas precisam de giro mais lento e de mais torque.',
        'Entre o motor e o redutor fica o acoplamento elástico, que liga os dois eixos.',
        'Dentro da carcaça, o pinhão de 14 dentes, no eixo de entrada, engrena na coroa de 43 dentes, no eixo de saída.',
        'A relação é o número de dentes da coroa dividido pelo do pinhão: 43 ÷ 14, cerca de 3,07.',
        'Então a saída gira cerca de três vezes mais devagar, e no sentido contrário. Em troca, o torque na saída fica cerca de três vezes maior, menos as perdas.',
        'No esquema, compare os dois diâmetros: a coroa é maior que o pinhão na mesma proporção do número de dentes.',
        'Na manutenção, a relação real, o lubrificante e as folgas vêm da placa e do manual do fabricante.',
        'Agora responda à pergunta e depois veja o conjunto girando no laboratório 3D.'
      ],
      credit: 'Narração sintetizada com Kokoro-82M (pesos Apache-2.0, voz pf_dora) · imagens do laboratório 3D e do esquema do Mecânica Lab'
    },
    keyPoints: [
      { text: 'Relação de um par de engrenagens = dentes da engrenagem movida ÷ dentes da motora.', kind: 'boa-pratica' },
      { text: 'A saída gira mais devagar na mesma proporção e, num par externo, no sentido contrário.', kind: 'boa-pratica' },
      { text: 'O torque na saída cresce aproximadamente na mesma proporção, descontadas as perdas.', kind: 'boa-pratica' },
      { text: 'Modelo simplificado: a relação 43 ÷ 14 é do modelo 3D; a de um redutor real vem da placa de identificação e do manual.', kind: 'simplificado' }
    ],
    question: {
      prompt: 'Um pinhão de 14 dentes aciona uma coroa de 43 dentes. O que acontece no eixo da coroa?',
      options: [
        'Gira cerca de 3 vezes mais devagar, no sentido contrário, com mais torque',
        'Gira cerca de 3 vezes mais rápido, no mesmo sentido',
        'Gira na mesma rotação, só que com mais torque',
        'Gira cerca de 3 vezes mais devagar e com menos torque'
      ],
      correctIndex: 0,
      why: 'A relação é 43 ÷ 14 ≈ 3,07: a coroa dá uma volta a cada 3,07 voltas do pinhão, gira no sentido contrário e, sem contar as perdas, entrega cerca de 3 vezes mais torque.',
      optionFeedback: [
        'Correto: rotação dividida pela relação, sentido invertido e torque multiplicado (menos as perdas).',
        'Isso seria um multiplicador: a engrenagem maior acionando a menor.',
        'Se o número de dentes muda, a rotação muda junto.',
        'Rotação e torque andam em sentidos opostos: se a rotação cai, o torque sobe.'
      ]
    },
    practice: { label: 'Laboratório 3D: motor, acoplamento e redutor', screen: 'lab', param: 'motor-gearbox' },
    deeper: { label: 'Missão: elemento elástico gastando', screen: 'industry', param: 'missao-acoplamento-desalinhado' }
  }
];

export const MICRO_LESSONS: MicroLesson[] = [...SAFETY, ...TECHNICAL, ...INDUSTRY];
export const MICRO_LESSONS_BY_ID: Record<string, MicroLesson> = Object.fromEntries(MICRO_LESSONS.map((m) => [m.id, m]));
export const SAFETY_MICRO_IDS = SAFETY.map((m) => m.id);

export const microDuration = (m: MicroLesson) =>
  m.media.kind === 'animation' ? m.media.scenes.reduce((a, s) => a + s.seconds, 0) : m.media.durationSeconds;

export const microTranscript = (m: MicroLesson) => (m.media.kind === 'animation' ? m.media.scenes.map((s) => s.caption) : m.media.transcript);

/** Grupos exibidos na página de aulas rápidas. */
export const MICRO_GROUPS: { id: string; title: string; description: string; ids: string[] }[] = [
  {
    id: 'seguranca',
    title: 'Segurança primeiro',
    description: 'Comece por aqui: riscos, proteções, emergência, EPI e bloqueio de energias.',
    ids: SAFETY.map((m) => m.id)
  },
  {
    id: 'ferramentas',
    title: 'Ferramentas, fixação e medição',
    description: 'Reconhecer ferramentas, ler parafusos e medir com o paquímetro.',
    ids: ['tec-chave-combinada', 'tec-fixador', 'tec-paquimetro']
  },
  {
    id: 'componentes',
    title: 'Componentes e bombas',
    description: 'Rolamentos, selo mecânico e os dois tipos de bomba do laboratório.',
    ids: ['tec-rolamento', 'tec-selo', 'tec-bomba-tipos', 'tec-pre-inspecao']
  },
  {
    id: 'industria',
    title: 'Indústria na prática',
    description: 'Como as peças trabalham juntas nas máquinas da planta-escola.',
    ids: INDUSTRY.map((m) => m.id)
  }
];
