import type { GameScreen } from '../types/game';
import type { ClaimKind, RegRef, SourceId } from './regulatorySources';

/**
 * Desafios (mini-jogos) reutilizáveis.
 *
 * Três modelos de rodada:
 *  - `choice`: uma situação com dados, várias alternativas; pode haver mais de uma aceitável.
 *  - `multi`: marcar todos os itens necessários (ex.: EPIs para os riscos listados).
 *  - `inspection`: tocar nos problemas de uma cena da oficina.
 *
 * Regras de projeto: sem cronômetro, sem perder pontos por errar, sempre com explicação,
 * dica opcional e possibilidade de tentar de novo. As rodadas vão do nível 1 ao 3.
 * Cenários são simplificados para estudo; a decisão real segue o procedimento da empresa.
 */

export type Level = 1 | 2 | 3;
export const LEVEL_LABEL: Record<Level, string> = { 1: 'Básico', 2: 'Intermediário', 3: 'Avançado' };

export interface GivenData {
  label: string;
  value: string;
}

export interface Note {
  text: string;
  kind: ClaimKind;
  ref?: RegRef;
}

/** best = melhor resposta · ok = também aceitável · wrong = não resolve ou cria risco */
export type Verdict = 'best' | 'ok' | 'wrong';

export interface ChoiceOption {
  text: string;
  verdict: Verdict;
  feedback: string;
}

interface RoundBase {
  id: string;
  level: Level;
  title: string;
  skillId: string;
  hint: string;
  notes?: Note[];
}

export interface ChoiceRound extends RoundBase {
  type: 'choice';
  situation: string;
  given?: GivenData[];
  prompt: string;
  options: ChoiceOption[];
  explanation: string;
  /** O que mudaria (ou o que seria preciso) num local de trabalho real. */
  realWorld?: string;
}

/** required = necessário · extra = não exigido pelos riscos listados (não é erro grave) · wrong = cria risco */
export type Need = 'required' | 'extra' | 'wrong';

export interface MultiOption {
  id: string;
  text: string;
  need: Need;
  feedback: string;
}

export interface MultiRound extends RoundBase {
  type: 'multi';
  situation: string;
  given?: GivenData[];
  prompt: string;
  options: MultiOption[];
  explanation: string;
}

export interface Hotspot {
  id: string;
  /** Nome neutro do objeto (não revela se é problema). */
  name: string;
  /** Descrição usada no resultado. */
  label: string;
  /** Retângulo na cena (viewBox 640 × 360). */
  x: number;
  y: number;
  w: number;
  h: number;
  hazard: boolean;
  feedback: string;
  kind: ClaimKind;
  ref?: RegRef;
}

export interface InspectionRound extends RoundBase {
  type: 'inspection';
  scene: 'torno' | 'bomba' | 'icamento';
  intro: string;
  items: Hotspot[];
}

export type GameRound = ChoiceRound | MultiRound | InspectionRound;

export interface GameDef {
  id: string;
  /** Letra do modelo de jogo na especificação (A–F). */
  letter: string;
  title: string;
  description: string;
  pathId: string;
  rounds: GameRound[];
  sources: SourceId[];
  safety: boolean;
}

/** Desafios que vivem em outras telas (treinos de medição e etapas do laboratório 3D). */
export interface ExternalChallenge {
  id: string;
  letter: string;
  title: string;
  description: string;
  screen: GameScreen;
  param?: string;
}

/* ───────────────────────── F · Inspeção da oficina ───────────────────────── */

const INSPECAO: GameDef = {
  id: 'inspecao-oficina',
  letter: 'F',
  title: 'Inspeção de segurança da oficina',
  description: 'Olhe a cena com calma e toque no que precisa ser corrigido antes de trabalhar. Nem tudo é problema.',
  pathId: 'seguranca-oficina',
  safety: true,
  sources: ['nr12', 'nr11'],
  rounds: [
    {
      type: 'inspection',
      id: 'insp-torno',
      level: 1,
      scene: 'torno',
      title: 'Torno e bancada',
      skillId: 'safety.hazards',
      intro: 'Você vai usar este torno daqui a pouco. O que precisa ser resolvido antes?',
      hint: 'Olhe para a placa do torno (o que gira) e para o chão. Há 3 problemas.',
      items: [
        {
          id: 'chave-placa',
          name: 'Placa do torno',
          label: 'Chave de aperto esquecida na placa',
          x: 108,
          y: 84,
          w: 40,
          h: 46,
          hazard: true,
          kind: 'boa-pratica',
          feedback: 'Ao ligar, a chave esquecida na placa é arremessada. Ela deve sair da placa logo depois do aperto, sempre.'
        },
        {
          id: 'protecao-placa',
          name: 'Proteção da placa',
          label: 'Proteção da placa levantada',
          x: 52,
          y: 52,
          w: 58,
          h: 74,
          hazard: true,
          kind: 'requisito',
          ref: { source: 'nr12', item: '12.5.1' },
          feedback:
            'A zona de perigo da placa precisa de proteção. Proteção levantada: não opere — abaixe-a ou, se o intertravamento não funcionar, comunique o responsável.'
        },
        {
          id: 'oleo-piso',
          name: 'Piso perto do torno',
          label: 'Óleo derramado no piso',
          x: 168,
          y: 282,
          w: 124,
          h: 34,
          hazard: true,
          kind: 'boa-pratica',
          feedback: 'Óleo no piso causa escorregão perto de uma máquina girando. Limpe ou isole e avise antes de trabalhar.'
        },
        {
          id: 'extintor',
          name: 'Extintor',
          label: 'Extintor sinalizado e livre',
          x: 340,
          y: 160,
          w: 50,
          h: 116,
          hazard: false,
          kind: 'boa-pratica',
          feedback: 'Está certo: extintor sinalizado, à vista e sem nada na frente.'
        },
        {
          id: 'quadro-ferramentas',
          name: 'Quadro de ferramentas',
          label: 'Quadro de ferramentas organizado',
          x: 410,
          y: 58,
          w: 152,
          h: 124,
          hazard: false,
          kind: 'boa-pratica',
          feedback: 'Está certo: cada ferramenta no seu lugar facilita conferir se nada ficou dentro da máquina.'
        },
        {
          id: 'colega-epi',
          name: 'Colega na bancada',
          label: 'Colega de óculos, roupa justa e calçado',
          x: 560,
          y: 150,
          w: 70,
          h: 184,
          hazard: false,
          kind: 'boa-pratica',
          feedback: 'Está certo: óculos, roupa justa, cabelo preso e sem luvas perto de partes girando.'
        }
      ]
    },
    {
      type: 'inspection',
      id: 'insp-bomba',
      level: 2,
      scene: 'bomba',
      title: 'Manutenção de uma bomba',
      skillId: 'safety.energy',
      intro: 'Um colega começou a trocar o selo desta bomba. Encontre o que está fora do lugar.',
      hint: 'Pense em todas as energias: elétrica e pressão. E no botão de emergência. Há 3 problemas.',
      items: [
        {
          id: 'painel-sem-bloqueio',
          name: 'Painel elétrico da bomba',
          label: 'Chave do painel ligada e sem cadeado',
          x: 28,
          y: 66,
          w: 86,
          h: 168,
          hazard: true,
          kind: 'requisito',
          ref: { source: 'nr12', item: '12.11.3' },
          feedback:
            'Manutenção exige máquina parada, fontes de energia isoladas e bloqueadas na posição desligado, com etiqueta (data, horário, motivo, responsável). Um papel "não ligar" não impede a partida.'
        },
        {
          id: 'manometro-pressao',
          name: 'Manômetro da descarga',
          label: 'Manômetro ainda indica pressão na linha',
          x: 214,
          y: 94,
          w: 52,
          h: 52,
          hazard: true,
          kind: 'requisito',
          ref: { source: 'nr12', item: '12.11.3' },
          feedback:
            'Isolar não basta: a energia retida precisa ser descarregada. Feche as válvulas, alivie a pressão pelo procedimento e confirme zero antes de abrir a bomba.'
        },
        {
          id: 'emergencia-obstruida',
          name: 'Botão de emergência',
          label: 'Botão de emergência atrás de caixas',
          x: 428,
          y: 136,
          w: 104,
          h: 140,
          hazard: true,
          kind: 'requisito',
          ref: { source: 'nr12', item: '12.6.2' },
          feedback: 'O botão de emergência deve ficar de fácil acesso e permanentemente desobstruído. Tire as caixas da frente.'
        },
        {
          id: 'valvula-bloqueada',
          name: 'Válvula de sucção',
          label: 'Válvula de sucção fechada com cadeado',
          x: 76,
          y: 200,
          w: 50,
          h: 64,
          hazard: false,
          kind: 'boa-pratica',
          feedback: 'Está certo: a válvula fechada e bloqueada isola o fluido. Falta fazer o mesmo com as outras energias.'
        },
        {
          id: 'bandeja',
          name: 'Base da bomba',
          label: 'Bandeja de contenção sob a bomba',
          x: 112,
          y: 282,
          w: 200,
          h: 22,
          hazard: false,
          kind: 'boa-pratica',
          feedback: 'Está certo: a bandeja recolhe o líquido que sai ao abrir a bomba e evita piso escorregadio.'
        },
        {
          id: 'bancada',
          name: 'Bancada',
          label: 'Ferramentas separadas na bancada',
          x: 540,
          y: 196,
          w: 92,
          h: 76,
          hazard: false,
          kind: 'boa-pratica',
          feedback: 'Está certo: ferramentas separadas antes de começar evitam improviso.'
        }
      ]
    },
    {
      type: 'inspection',
      id: 'insp-icamento',
      level: 3,
      scene: 'icamento',
      title: 'Içamento de um motor',
      skillId: 'safety.handling',
      intro: 'A equipe vai levar um motor para a bancada com a talha. Encontre os problemas.',
      hint: 'Compare a capacidade da talha com o peso da carga. Olhe o gancho, quem está embaixo e as ferramentas. Há 4 problemas.',
      items: [
        {
          id: 'carga-acima',
          name: 'Motor sendo içado',
          label: 'Motor mais pesado que a capacidade da talha',
          x: 262,
          y: 128,
          w: 100,
          h: 54,
          hazard: true,
          kind: 'requisito',
          ref: { source: 'nr11', item: '11.1.3.2' },
          feedback:
            'A placa indica 250 kg e o motor tem 380 kg (valores do cenário). A carga máxima indicada no equipamento existe para ser respeitada: não içar.'
        },
        {
          id: 'gancho',
          name: 'Gancho da talha',
          label: 'Gancho deformado',
          x: 290,
          y: 92,
          w: 42,
          h: 38,
          hazard: true,
          kind: 'requisito',
          ref: { source: 'nr11', item: '11.1.3.1' },
          feedback: 'Cabos, correntes, roldanas e ganchos devem ser inspecionados e as partes defeituosas, substituídas. Gancho aberto/deformado: fora de uso.'
        },
        {
          id: 'pessoa-sob-carga',
          name: 'Pessoa perto da carga',
          label: 'Pessoa embaixo da carga suspensa',
          x: 278,
          y: 184,
          w: 66,
          h: 150,
          hazard: true,
          kind: 'boa-pratica',
          feedback: 'Ninguém fica sob carga suspensa. Isole a área de movimentação.'
        },
        {
          id: 'martelo-trincado',
          name: 'Martelo na bancada',
          label: 'Martelo com cabo trincado',
          x: 480,
          y: 216,
          w: 88,
          h: 36,
          hazard: true,
          kind: 'boa-pratica',
          feedback: 'Ferramenta danificada sai de uso e é identificada. Fita no cabo não devolve a resistência.'
        },
        {
          id: 'operador-controle',
          name: 'Operador da talha',
          label: 'Operador com capacete na botoeira',
          x: 100,
          y: 140,
          w: 80,
          h: 196,
          hazard: false,
          kind: 'boa-pratica',
          feedback: 'Está certo: quem opera fica afastado da carga, com visão da movimentação e EPIs da tarefa.'
        },
        {
          id: 'chave-boa',
          name: 'Chave de boca na bancada',
          label: 'Chave de boca em bom estado',
          x: 568,
          y: 220,
          w: 62,
          h: 32,
          hazard: false,
          kind: 'boa-pratica',
          feedback: 'Está certo: boca sem desgaste, pronta para uso.'
        },
        {
          id: 'placa-capacete',
          name: 'Placa na parede',
          label: 'Placa de uso obrigatório de capacete',
          x: 32,
          y: 38,
          w: 62,
          h: 62,
          hazard: false,
          kind: 'boa-pratica',
          feedback: 'Está certo: sinalização de EPI obrigatório na área de içamento.'
        }
      ]
    }
  ]
};

/* ───────────────────────── EPI para a tarefa ───────────────────────── */

const EPI_ITEMS = {
  oculos: 'Óculos de segurança',
  facial: 'Protetor facial (sobre os óculos)',
  auricular: 'Protetor auricular',
  calcado: 'Calçado de segurança',
  capacete: 'Capacete',
  luvaVaqueta: 'Luvas de couro (vaqueta)',
  luvaQuimica: 'Luvas resistentes ao produto químico',
  respirador: 'Respirador'
};

const EPI: GameDef = {
  id: 'epi-tarefa',
  letter: 'F',
  title: 'EPI certo para a tarefa',
  description: 'A análise de riscos da tarefa já foi feita. Marque os EPIs que respondem aos riscos listados — e evite os que criam risco.',
  pathId: 'seguranca-oficina',
  safety: true,
  sources: ['nr06', 'nr12'],
  rounds: [
    {
      type: 'multi',
      id: 'epi-torno',
      level: 1,
      title: 'Torneamento de um eixo de aço',
      skillId: 'safety.ppe',
      situation: 'Torno convencional, peça de aço girando na placa. Você acompanha o corte de perto.',
      given: [
        { label: 'Riscos levantados', value: 'cavacos projetados nos olhos; queda de peça nos pés; partes girando' },
        { label: 'Ruído no posto', value: 'abaixo do limite, segundo a avaliação do cenário' }
      ],
      prompt: 'Quais EPIs usar?',
      hint: 'Uma luva perto de algo que gira pode ser puxada junto com a mão.',
      explanation: 'Óculos para os cavacos e calçado para a queda de peças. Luvas perto da placa girando são um risco de enroscamento.',
      notes: [
        { text: 'A organização seleciona os EPIs considerando a atividade e os riscos avaliados.', kind: 'requisito', ref: { source: 'nr06', item: '6.5.2' } },
        { text: 'Cenário simplificado: no trabalho real, siga a ordem de serviço e a seleção registrada pela empresa.', kind: 'simplificado' }
      ],
      options: [
        { id: 'oculos', text: EPI_ITEMS.oculos, need: 'required', feedback: 'Protege os olhos dos cavacos.' },
        { id: 'calcado', text: EPI_ITEMS.calcado, need: 'required', feedback: 'Protege os pés da queda de peças.' },
        { id: 'luvaVaqueta', text: EPI_ITEMS.luvaVaqueta, need: 'wrong', feedback: 'Perto da placa girando, a luva pode enroscar e puxar a mão.' },
        { id: 'auricular', text: EPI_ITEMS.auricular, need: 'extra', feedback: 'Neste cenário o ruído ficou abaixo do limite; o protetor não foi exigido pela avaliação.' },
        { id: 'capacete', text: EPI_ITEMS.capacete, need: 'extra', feedback: 'Não há risco de queda de objetos de cima listado nesta tarefa.' },
        { id: 'respirador', text: EPI_ITEMS.respirador, need: 'extra', feedback: 'Nenhum risco respiratório foi listado.' }
      ]
    },
    {
      type: 'multi',
      id: 'epi-esmeril',
      level: 2,
      title: 'Rebarbar uma peça no esmeril de bancada',
      skillId: 'safety.ppe',
      situation: 'Rebolo girando, faíscas e partículas saindo em direção ao rosto.',
      given: [
        { label: 'Riscos levantados', value: 'partículas nos olhos e no rosto; ruído acima do limite; queda de peça nos pés; rebolo girando' }
      ],
      prompt: 'Quais EPIs usar?',
      hint: 'Rosto inteiro, ouvidos e pés. E lembre do que gira.',
      explanation: 'Óculos e protetor facial para olhos e rosto, protetor auricular para o ruído e calçado para os pés. Nada de luva perto do rebolo.',
      notes: [
        { text: 'O EPI só pode ser usado com Certificado de Aprovação (CA).', kind: 'requisito', ref: { source: 'nr06', item: '6.4.1' } },
        { text: 'Antes do EPI, vêm as proteções do próprio esmeril (coifa, anteparo, apoio ajustado).', kind: 'requisito', ref: { source: 'nr12', item: '12.1.8' } }
      ],
      options: [
        { id: 'oculos', text: EPI_ITEMS.oculos, need: 'required', feedback: 'Base da proteção dos olhos.' },
        { id: 'facial', text: EPI_ITEMS.facial, need: 'required', feedback: 'Protege o rosto inteiro das partículas listadas.' },
        { id: 'auricular', text: EPI_ITEMS.auricular, need: 'required', feedback: 'O ruído está acima do limite neste cenário.' },
        { id: 'calcado', text: EPI_ITEMS.calcado, need: 'required', feedback: 'Peças podem cair nos pés.' },
        { id: 'luvaVaqueta', text: EPI_ITEMS.luvaVaqueta, need: 'wrong', feedback: 'O rebolo gira: a luva pode ser puxada.' },
        { id: 'capacete', text: EPI_ITEMS.capacete, need: 'extra', feedback: 'Não há queda de objetos de cima listada.' }
      ]
    },
    {
      type: 'multi',
      id: 'epi-icamento',
      level: 2,
      title: 'Preparar o içamento de um motor',
      skillId: 'safety.ppe',
      situation: 'Você vai passar a cinta no motor e acompanhar a talha. Não há partes girando por perto.',
      given: [{ label: 'Riscos levantados', value: 'queda de objetos de cima; queda de peça nos pés; cortes nas mãos por rebarbas e na cinta' }]
      ,
      prompt: 'Quais EPIs usar?',
      hint: 'Aqui não há nada girando. Compare cada risco com uma parte do corpo.',
      explanation: 'Capacete, calçado e luvas de couro respondem aos três riscos. Sem partes girando, a luva é adequada.',
      notes: [{ text: 'O mesmo EPI pode ser certo numa tarefa e perigoso em outra: a escolha depende dos riscos.', kind: 'boa-pratica' }],
      options: [
        { id: 'capacete', text: EPI_ITEMS.capacete, need: 'required', feedback: 'Protege contra queda de objetos de cima.' },
        { id: 'calcado', text: EPI_ITEMS.calcado, need: 'required', feedback: 'Protege os pés se a peça escapar.' },
        { id: 'luvaVaqueta', text: EPI_ITEMS.luvaVaqueta, need: 'required', feedback: 'Sem partes girando, a luva protege das rebarbas.' },
        { id: 'oculos', text: EPI_ITEMS.oculos, need: 'extra', feedback: 'Não está na lista desta tarefa, mas muitas oficinas exigem óculos o tempo todo: siga a regra local.' },
        { id: 'respirador', text: EPI_ITEMS.respirador, need: 'extra', feedback: 'Nenhum risco respiratório foi listado.' }
      ]
    },
    {
      type: 'multi',
      id: 'epi-solvente',
      level: 3,
      title: 'Lavar peças com solvente',
      skillId: 'safety.ppe',
      situation: 'Lavagem de rolamentos e engrenagens numa cuba com solvente. A FISPQ do produto está disponível.',
      given: [
        { label: 'Riscos levantados', value: 'respingos nos olhos; contato do produto com a pele' },
        { label: 'Vapores', value: 'controlados pela exaustão da cuba, segundo a avaliação do cenário' }
      ],
      prompt: 'Quais EPIs usar?',
      hint: 'Luva de couro absorve o produto. Qual luva resiste a ele?',
      explanation: 'Óculos contra respingos e luvas resistentes ao produto (o tipo vem da FISPQ). Com os vapores controlados pela exaustão, o respirador não foi exigido neste cenário.',
      notes: [
        { text: 'A FISPQ (ficha de segurança do produto) indica o tipo de luva e os cuidados com o produto.', kind: 'boa-pratica' },
        { text: 'Se a exaustão falhar, pare e comunique: a avaliação muda.', kind: 'simplificado' }
      ],
      options: [
        { id: 'oculos', text: EPI_ITEMS.oculos, need: 'required', feedback: 'Protege dos respingos.' },
        { id: 'luvaQuimica', text: EPI_ITEMS.luvaQuimica, need: 'required', feedback: 'Impede o contato do produto com a pele.' },
        { id: 'luvaVaqueta', text: EPI_ITEMS.luvaVaqueta, need: 'wrong', feedback: 'Couro absorve o solvente e mantém o produto contra a pele.' },
        { id: 'respirador', text: EPI_ITEMS.respirador, need: 'extra', feedback: 'Com a exaustão funcionando, a avaliação deste cenário não exigiu respirador.' },
        { id: 'calcado', text: EPI_ITEMS.calcado, need: 'extra', feedback: 'Não está na lista desta tarefa; siga a regra geral da oficina.' }
      ]
    }
  ]
};

/* ───────────────────────── E/F · O que fazer agora? ───────────────────────── */

const DECISAO: GameDef = {
  id: 'decisao-segura',
  letter: 'F',
  title: 'O que fazer agora?',
  description: 'Situações reais de oficina, simplificadas. Escolha a atitude mais segura e veja por quê.',
  pathId: 'seguranca-oficina',
  safety: true,
  sources: ['nr12', 'nr11', 'nr10'],
  rounds: [
    {
      type: 'choice',
      id: 'dec-protecao-trincada',
      level: 1,
      title: 'Proteção trincada',
      skillId: 'safety.guards',
      situation: 'No início do turno, você nota que a proteção da correia da furadeira de bancada está trincada e solta de um lado.',
      prompt: 'O que fazer?',
      hint: 'Quem pode decidir consertar a máquina? E enquanto isso?',
      options: [
        { text: 'Não usar, sinalizar a máquina e comunicar o responsável', verdict: 'best', feedback: 'Isso: a máquina fica fora de uso até a proteção ser corrigida.' },
        { text: 'Usar com cuidado, sem encostar na correia', verdict: 'wrong', feedback: '"Com cuidado" não substitui a proteção: um descuido basta.' },
        { text: 'Retirar a proteção solta para ela não cair', verdict: 'wrong', feedback: 'Retirar ou alterar proteções por conta própria é proibido ao trabalhador.' },
        { text: 'Prender a proteção com arame e trabalhar', verdict: 'wrong', feedback: 'Remendo improvisado não garante a proteção e esconde o defeito.' }
      ],
      explanation: 'Condição insegura: pare, sinalize e comunique. O reparo é feito por quem é autorizado.',
      notes: [{ text: 'Trabalhador não deve alterar proteções ou dispositivos de segurança.', kind: 'requisito', ref: { source: 'nr12', item: '12.1.10' } }]
    },
    {
      type: 'choice',
      id: 'dec-luva-torno',
      level: 1,
      title: 'Colega de luva no torno',
      skillId: 'safety.workshop',
      situation: 'Um colega está lixando uma peça girando no torno, usando luvas de couro.',
      prompt: 'O que você faz?',
      hint: 'O que acontece se a luva encostar na peça girando?',
      options: [
        { text: 'Avisar o colega e pedir que pare a máquina antes de continuar', verdict: 'best', feedback: 'Isso: aviso direto e com a máquina parada para corrigir.' },
        { text: 'Puxar o braço do colega para longe da peça', verdict: 'wrong', feedback: 'Puxar de surpresa pode levar a mão justamente para a peça.' },
        { text: 'Não falar nada; luva protege a mão', verdict: 'wrong', feedback: 'Perto de partes girando, a luva é o que enrosca e puxa a mão.' }
      ],
      explanation: 'Perto de partes girando, luvas, adornos e roupas soltas podem enroscar. Avise de forma clara, sem surpreender quem opera.',
      notes: [{ text: 'Cada oficina tem regras de uso de luvas em máquinas rotativas; siga o procedimento local.', kind: 'boa-pratica' }]
    },
    {
      type: 'choice',
      id: 'dec-rearme',
      level: 1,
      title: 'Depois da emergência',
      skillId: 'safety.estop',
      situation: 'Um colega apertou a emergência porque uma peça se soltou da fixação. A máquina parou.',
      prompt: 'Qual é a sequência certa?',
      hint: 'O que precisa acontecer antes do rearme?',
      options: [
        { text: 'Corrigir a causa com o responsável, depois destravar o botão e rearmar', verdict: 'best', feedback: 'Isso: o rearme só vem depois da correção.' },
        { text: 'Destravar o botão e religar logo para não atrasar', verdict: 'wrong', feedback: 'Religar sem corrigir a causa repete o perigo.' },
        { text: 'Desligar a máquina pela emergência daqui em diante, sempre', verdict: 'wrong', feedback: 'A emergência não é comando de rotina.' }
      ],
      explanation: 'A parada de emergência exige rearme manual e só depois de corrigido o evento que motivou o acionamento.',
      notes: [{ text: 'Rearme manual só depois da correção do evento.', kind: 'requisito', ref: { source: 'nr12', item: '12.6.8' } }]
    },
    {
      type: 'choice',
      id: 'dec-painel',
      level: 2,
      title: 'Bloqueio elétrico de uma bomba',
      skillId: 'safety.energy',
      situation: 'Você vai trocar o selo de uma bomba. O motor é alimentado por um painel elétrico. Você é mecânico e não é autorizado para serviços em eletricidade.',
      prompt: 'Como garantir que o motor não vai partir?',
      hint: 'Quem faz o isolamento elétrico? E como você confirma?',
      options: [
        { text: 'Solicitar o bloqueio ao profissional autorizado, colocar seu cadeado conforme o procedimento e testar a partida', verdict: 'best', feedback: 'Isso: isolamento por quem é autorizado, seu bloqueio pessoal e teste.' },
        { text: 'Abrir o painel e desligar o disjuntor você mesmo', verdict: 'wrong', feedback: 'Intervir no painel é serviço em eletricidade, reservado a profissionais autorizados.' },
        { text: 'Pedir ao operador para não ligar a bomba', verdict: 'wrong', feedback: 'Um pedido não impede a reenergização. Precisa haver bloqueio físico.' },
        { text: 'Apertar a emergência e começar', verdict: 'wrong', feedback: 'A emergência não isola a energia: alguém pode destravar e rearmar.' }
      ],
      explanation: 'Intervenção com máquina parada, energias isoladas e bloqueadas, etiqueta e teste antes de começar.',
      realWorld: 'O procedimento de bloqueio da empresa define quem isola, onde vão os cadeados e como é o teste.',
      notes: [
        { text: 'Bloqueio na posição desligado e etiqueta com data, horário, motivo e responsável.', kind: 'requisito', ref: { source: 'nr12', item: '12.11.3' } },
        { text: 'Desenergização começa pelo seccionamento e impedimento de reenergização.', kind: 'requisito', ref: { source: 'nr10', item: '10.5.1' } }
      ]
    },
    {
      type: 'choice',
      id: 'dec-pressao',
      level: 2,
      title: 'Ainda tem pressão',
      skillId: 'safety.energy',
      situation: 'O motor da bomba já está bloqueado e testado. Mas o manômetro na descarga ainda indica pressão.',
      given: [{ label: 'Manômetro da descarga', value: 'acima de zero' }],
      prompt: 'O que fazer antes de soltar a tampa?',
      hint: 'Isolar é uma coisa. Descarregar é outra.',
      options: [
        { text: 'Fechar as válvulas de sucção e descarga, aliviar a pressão pelo procedimento e confirmar zero', verdict: 'best', feedback: 'Isso: isolar, descarregar e confirmar.' },
        { text: 'Soltar os parafusos aos poucos para a pressão sair', verdict: 'wrong', feedback: 'O líquido pode sair em jato, quente ou com produto perigoso.' },
        { text: 'Esperar alguns minutos e abrir', verdict: 'wrong', feedback: 'A pressão retida pode não cair sozinha. Só o manômetro em zero confirma.' }
      ],
      explanation: 'Todas as fontes de energia precisam ser isoladas e descarregadas, incluindo pressão de fluidos.',
      notes: [{ text: 'Isolamento e descarga de todas as fontes de energia.', kind: 'requisito', ref: { source: 'nr12', item: '12.11.3' } }]
    },
    {
      type: 'choice',
      id: 'dec-talha',
      level: 2,
      title: 'A talha aguenta?',
      skillId: 'safety.handling',
      situation: 'Você precisa levar um motor até a bancada.',
      given: [
        { label: 'Placa da talha', value: 'carga máxima 250 kg' },
        { label: 'Placa do motor', value: 'massa 380 kg' }
      ],
      prompt: 'O que fazer?',
      hint: 'Compare os dois números.',
      options: [
        { text: 'Não içar; comunicar e usar um equipamento com capacidade suficiente', verdict: 'best', feedback: 'Isso: a capacidade indicada é o limite.' },
        { text: 'Içar devagar, só alguns centímetros', verdict: 'wrong', feedback: 'Acima da capacidade, a falha pode acontecer já no primeiro centímetro.' },
        { text: 'Usar duas cintas para dividir o peso', verdict: 'wrong', feedback: 'As cintas não mudam a capacidade da talha nem da viga.' }
      ],
      explanation: 'Todo equipamento de içamento indica a carga máxima de trabalho permitida, em lugar visível. Ela não pode ser ultrapassada.',
      notes: [{ text: 'Carga máxima de trabalho indicada em lugar visível.', kind: 'requisito', ref: { source: 'nr11', item: '11.1.3.2' } }]
    },
    {
      type: 'choice',
      id: 'dec-sem-treinamento',
      level: 3,
      title: '“Vai lá, é fácil”',
      skillId: 'safety.supervision',
      situation: 'Pedem que você ajuste uma prensa que você nunca operou. Não há procedimento escrito e o supervisor está ocupado: "vai lá, é fácil".',
      prompt: 'Qual é a melhor atitude?',
      hint: 'Quem pode intervir em máquinas, segundo a NR-12?',
      options: [
        { text: 'Explicar que não é capacitado nem autorizado para essa máquina e pedir orientação ou acompanhamento', verdict: 'best', feedback: 'Isso: recusar com clareza e propor uma saída.' },
        { text: 'Assistir a um vídeo na internet e fazer', verdict: 'wrong', feedback: 'Vídeo não substitui capacitação na máquina nem autorização.' },
        { text: 'Fazer rápido, antes que alguém precise da máquina', verdict: 'wrong', feedback: 'Pressa numa tarefa desconhecida é uma das causas mais comuns de acidente.' }
      ],
      explanation: 'Intervenções em máquinas são feitas por trabalhadores capacitados (ou qualificados ou habilitados) e autorizados para isso.',
      realWorld: 'Muitas empresas formalizam o direito de recusa diante de risco grave e iminente. Pergunte como funciona na sua.',
      notes: [{ text: 'Intervenções por trabalhadores habilitados, qualificados ou capacitados, e autorizados.', kind: 'requisito', ref: { source: 'nr12', item: '12.16.1' } }]
    },
    {
      type: 'choice',
      id: 'dec-cadeado-sumiu',
      level: 3,
      title: 'O cadeado sumiu',
      skillId: 'safety.energy',
      situation: 'Você bloqueou a máquina e foi almoçar. Ao voltar, seu cadeado não está mais na chave.',
      prompt: 'E agora?',
      hint: 'Você sabe o estado da máquina neste momento?',
      options: [
        { text: 'Não tocar na máquina, avisar o responsável, refazer o bloqueio e testar de novo', verdict: 'best', feedback: 'Isso: sem o seu bloqueio, trate a máquina como energizada.' },
        { text: 'Colocar outro cadeado e continuar o serviço', verdict: 'ok', feedback: 'Recolocar o bloqueio está certo, mas falta testar de novo e comunicar o ocorrido.' },
        { text: 'Continuar, já que a máquina continua parada', verdict: 'wrong', feedback: 'Parada não quer dizer bloqueada. Alguém pode ter religado algo.' }
      ],
      explanation: 'Bloqueio removido por outra pessoa é uma falha grave do procedimento: refaça o bloqueio, teste e comunique.',
      notes: [{ text: 'O bloqueio deve impedir a reenergização enquanto durar a intervenção.', kind: 'requisito', ref: { source: 'nr12', item: '12.11.3' } }]
    }
  ]
};

/* ───────────────────────── A · Ferramenta certa ───────────────────────── */

const FERRAMENTA: GameDef = {
  id: 'ferramenta-certa',
  letter: 'A',
  title: 'Qual ferramenta usar?',
  description: 'Cada situação traz os dados necessários. Às vezes mais de uma ferramenta resolve — o retorno explica a melhor.',
  pathId: 'ferramentas-fixacao',
  safety: false,
  sources: [],
  rounds: [
    {
      type: 'choice',
      id: 'fer-porca-m12',
      level: 1,
      title: 'Soltar uma porca M12',
      skillId: 'tools.selection',
      situation: 'Porca sextavada M12 numa tampa, acesso livre por cima, aperto firme.',
      given: [{ label: 'Medida da porca', value: '18 mm entre faces (ISO 4032)' }],
      prompt: 'Qual ferramenta usar para soltar?',
      hint: 'Prefira a ferramenta que abraça todas as faces.',
      options: [
        { text: 'Chave estrela 18 mm', verdict: 'best', feedback: 'Abraça os cantos e não escorrega com facilidade.' },
        { text: 'Soquete 18 mm com catraca', verdict: 'best', feedback: 'Também abraça todas as faces e é rápido com acesso por cima.' },
        { text: 'Chave combinada 18 mm, pelo lado da boca', verdict: 'ok', feedback: 'Funciona, mas a boca aberta pega só duas faces: no aperto firme prefira o lado estrela.' },
        { text: 'Chave inglesa', verdict: 'wrong', feedback: 'A boca ajustável tem folga e pode arredondar a porca. Só como último recurso, e nunca em aperto firme.' }
      ],
      explanation: 'Para soltar aperto firme, use ferramentas que abraçam o sextavado (estrela ou soquete) na medida exata.',
      realWorld: 'Confira a medida antes: algumas porcas M12 de normas antigas têm 19 mm.',
      notes: [{ text: 'Puxe a chave em sua direção, com o corpo equilibrado, para não bater a mão se ela escapar.', kind: 'boa-pratica' }]
    },
    {
      type: 'choice',
      id: 'fer-allen-m8',
      level: 1,
      title: 'Parafuso com sextavado interno',
      skillId: 'tools.selection',
      situation: 'Parafuso de cabeça cilíndrica com sextavado interno fixando um mancal.',
      given: [
        { label: 'Parafuso', value: 'M8, ISO 4762' },
        { label: 'Sextavado interno da norma', value: '6 mm' }
      ],
      prompt: 'Qual ferramenta usar?',
      hint: 'A medida da chave está nos dados.',
      options: [
        { text: 'Chave Allen 6 mm, inserida até o fundo', verdict: 'best', feedback: 'Medida certa e encaixe completo: não espana.' },
        { text: 'Chave Allen 5 mm', verdict: 'wrong', feedback: 'Fica folgada e arredonda o sextavado interno.' },
        { text: 'Chave de fenda larga encaixada no sextavado', verdict: 'wrong', feedback: 'Apoia em dois cantos só: espana o parafuso e escorrega.' },
        { text: 'Alicate universal na cabeça', verdict: 'wrong', feedback: 'Marca a cabeça e não aplica torque controlado.' }
      ],
      explanation: 'Sextavado interno pede chave Allen da medida exata, inserida até o fundo.'
    },
    {
      type: 'choice',
      id: 'fer-torque',
      level: 2,
      title: 'Aperto com valor especificado',
      skillId: 'tools.selection',
      situation: 'O manual do equipamento deste cenário especifica o aperto dos parafusos da tampa.',
      given: [
        { label: 'Valor indicado no manual (cenário)', value: '25 N·m, em cruz' },
        { label: 'Torquímetro disponível', value: 'faixa de 20 a 100 N·m, calibrado' }
      ],
      prompt: 'Como apertar?',
      hint: 'Se o valor é especificado, ele precisa ser medido.',
      options: [
        { text: 'Torquímetro ajustado no valor do manual, apertando em cruz', verdict: 'best', feedback: 'O valor fica dentro da faixa do instrumento e o aperto em cruz assenta a tampa por igual.' },
        { text: 'Catraca comum e "sentir" o aperto', verdict: 'wrong', feedback: 'Sem medir, o aperto varia muito de pessoa para pessoa.' },
        { text: 'Chave combinada com um cano de extensão', verdict: 'wrong', feedback: 'Extensão improvisada aumenta a força sem controle e pode romper o parafuso.' }
      ],
      explanation: 'Quando existe valor de aperto, use torquímetro calibrado e dentro da faixa. O valor vem sempre do manual ou do projeto.',
      realWorld: 'Neste app não fornecemos valores de torque: cada junta tem o seu, definido pelo fabricante ou projeto.'
    },
    {
      type: 'choice',
      id: 'fer-anel',
      level: 2,
      title: 'Anel elástico no eixo',
      skillId: 'tools.selection',
      situation: 'Um anel elástico externo (de eixo) segura uma polia num eixo de 20 mm.',
      prompt: 'Qual ferramenta usar para retirar?',
      hint: 'O anel de eixo precisa ser aberto para sair.',
      options: [
        { text: 'Alicate para anéis externos (que abre ao apertar o cabo)', verdict: 'best', feedback: 'Encaixa nos furos do anel e o abre de forma controlada.' },
        { text: 'Alicate para anéis internos', verdict: 'wrong', feedback: 'Ele fecha ao apertar: serve para anéis de furo, não de eixo.' },
        { text: 'Chave de fenda para alavancar o anel', verdict: 'wrong', feedback: 'O anel pode saltar no rosto e o canal do eixo pode ser marcado.' },
        { text: 'Alicate universal', verdict: 'wrong', feedback: 'Não segura o anel pelos furos e deforma a peça.' }
      ],
      explanation: 'Anéis elásticos pedem alicate próprio: externo para anéis de eixo, interno para anéis de furo.',
      notes: [{ text: 'Use óculos: o anel pode escapar com força.', kind: 'boa-pratica' }]
    },
    {
      type: 'choice',
      id: 'fer-rolamento',
      level: 2,
      title: 'Rolamento preso no eixo',
      skillId: 'bearings.mounting',
      situation: 'O rolamento será reaproveitado. O anel interno tem interferência com o eixo.',
      prompt: 'Como retirar?',
      hint: 'Onde a força deve ser aplicada para não passar pelas esferas?',
      options: [
        { text: 'Extrator com placa separadora ou garras apoiadas no anel interno', verdict: 'best', feedback: 'A força vai direto no anel que está preso, sem passar pelas esferas.' },
        { text: 'Saca-polias de três garras puxando pelo anel externo', verdict: 'wrong', feedback: 'A força atravessa as esferas e marca as pistas: o rolamento não pode ser reaproveitado.' },
        { text: 'Martelo de aço batendo no anel externo', verdict: 'wrong', feedback: 'Impacto e força pelas esferas: danifica o rolamento e pode lançar lascas.' },
        { text: 'Martelo de face macia no eixo', verdict: 'wrong', feedback: 'Pode empenar o eixo e não controla a força.' }
      ],
      explanation: 'Na desmontagem, aplique a força no anel que tem interferência — aqui, o anel interno.'
    },
    {
      type: 'choice',
      id: 'fer-batimento',
      level: 3,
      title: 'O eixo está empenado?',
      skillId: 'measure.dial',
      situation: 'Um eixo apoiado entre pontas precisa ser verificado quanto a batimento radial ao girar.',
      prompt: 'Qual instrumento usar?',
      hint: 'O que se mede é a variação enquanto o eixo gira.',
      options: [
        { text: 'Relógio comparador com base magnética, girando o eixo devagar', verdict: 'best', feedback: 'Mostra a variação da superfície durante a volta.' },
        { text: 'Paquímetro em vários pontos', verdict: 'wrong', feedback: 'Mede o diâmetro, não a variação ao girar.' },
        { text: 'Micrômetro externo', verdict: 'wrong', feedback: 'Mede o diâmetro com precisão, mas o diâmetro pode estar certo e o eixo empenado.' }
      ],
      explanation: 'Batimento é variação durante o giro: relógio comparador.'
    },
    {
      type: 'choice',
      id: 'fer-acoplamento',
      level: 3,
      title: 'Posicionar um cubo de acoplamento',
      skillId: 'tools.safe-use',
      situation: 'O cubo precisa avançar alguns milímetros no eixo, com ajuste leve.',
      prompt: 'Qual ferramenta usar?',
      hint: 'Precisa empurrar sem marcar a peça.',
      options: [
        { text: 'Martelo de face macia', verdict: 'best', feedback: 'Desloca a peça sem marcar nem lascar.' },
        { text: 'Martelo de aço com um tarugo de material macio entre ele e a peça', verdict: 'ok', feedback: 'Também protege a peça, mas é menos prático e o tarugo precisa estar firme.' },
        { text: 'Martelo de aço direto na peça', verdict: 'wrong', feedback: 'Marca a peça e pode soltar lascas.' }
      ],
      explanation: 'Para posicionar peças com ajuste leve, martelo de face macia. Ajuste com interferência pede prensa ou aquecimento, conforme o procedimento.'
    },
    {
      type: 'choice',
      id: 'fer-falta-info',
      level: 3,
      title: 'Faltam dados',
      skillId: 'tools.selection',
      situation: 'A ordem de serviço diz apenas: "reapertar os parafusos do mancal".',
      prompt: 'Qual ferramenta separar?',
      hint: 'Você sabe o tipo de cabeça, a medida ou o aperto?',
      options: [
        { text: 'Ainda não dá: preciso ver o parafuso (cabeça e medida) e saber se há aperto especificado', verdict: 'best', feedback: 'Isso: sem esses dados, qualquer escolha é chute.' },
        { text: 'Chave inglesa, porque serve em tudo', verdict: 'wrong', feedback: 'Serve mal em tudo: folga, escorrega e não controla o aperto.' },
        { text: 'Torquímetro, sempre', verdict: 'wrong', feedback: 'Pode ser necessário, mas ainda falta saber o encaixe e o valor.' }
      ],
      explanation: 'A escolha da ferramenta depende do fixador e da especificação. Se faltar informação, consulte o manual ou o responsável.'
    }
  ]
};

/* ───────────────────────── E · Diagnóstico ───────────────────────── */

const DIAGNOSTICO: GameDef = {
  id: 'diagnostico',
  letter: 'E',
  title: 'Diagnóstico de falhas',
  description: 'Leia os sintomas e os dados. Escolha a causa mais provável ou a próxima verificação. Às vezes, a resposta certa é "faltam dados".',
  pathId: 'planejamento-diagnostico',
  safety: false,
  sources: [],
  rounds: [
    {
      type: 'choice',
      id: 'diag-selo',
      level: 1,
      title: 'Gotejamento no eixo',
      skillId: 'pumps.sealing',
      situation: 'Bomba centrífuga com selo mecânico.',
      given: [
        { label: 'Onde vaza', value: 'onde o eixo sai da carcaça' },
        { label: 'Histórico', value: 'o gotejamento aumentou nas últimas semanas' },
        { label: 'Junta da carcaça', value: 'seca' }
      ],
      prompt: 'Qual componente é o suspeito principal?',
      hint: 'Que peça veda exatamente o ponto onde o eixo atravessa a carcaça?',
      options: [
        { text: 'Selo mecânico', verdict: 'best', feedback: 'Ele veda a passagem do eixo; desgaste das faces aumenta o vazamento aos poucos.' },
        { text: 'Rotor', verdict: 'wrong', feedback: 'O rotor fica dentro da carcaça e não veda a saída do eixo.' },
        { text: 'Junta da carcaça', verdict: 'wrong', feedback: 'Os dados dizem que a junta está seca.' },
        { text: 'Rolamento', verdict: 'wrong', feedback: 'Rolamento gasto não causa vazamento de líquido diretamente, embora a vibração dele possa acelerar o desgaste do selo.' }
      ],
      explanation: 'Vazamento crescente na saída do eixo aponta para o selo. Antes de trocar, a bomba é parada, isolada e drenada.'
    },
    {
      type: 'choice',
      id: 'diag-cavitacao',
      level: 2,
      title: 'Barulho de cascalho',
      skillId: 'pumps.operation',
      situation: 'Bomba centrífuga de água fria.',
      given: [
        { label: 'Ruído', value: 'como se houvesse pedras passando pela bomba' },
        { label: 'Vazão', value: 'caiu e oscila' },
        { label: 'Manômetro de sucção', value: 'vácuo maior que o registrado no comissionamento' },
        { label: 'Válvula de sucção', value: 'encontrada parcialmente fechada' }
      ],
      prompt: 'Qual a causa mais provável?',
      hint: 'O que acontece quando a pressão na entrada cai demais?',
      options: [
        { text: 'Cavitação por restrição na sucção', verdict: 'best', feedback: 'Pressão baixa na entrada forma bolhas que implodem no rotor: ruído de cascalho e queda de vazão.' },
        { text: 'Selo mecânico gasto', verdict: 'wrong', feedback: 'Selo gasto vaza, mas não explica o vácuo alto nem o ruído.' },
        { text: 'Rolamento sem lubrificação', verdict: 'wrong', feedback: 'Daria ruído no mancal e temperatura alta, não queda de pressão na sucção.' }
      ],
      explanation: 'Restrição na sucção (válvula, filtro sujo) pode levar à cavitação. Corrija a sucção pelo procedimento e acompanhe o manômetro.'
    },
    {
      type: 'choice',
      id: 'diag-vibracao',
      level: 2,
      title: 'Vibração depois da troca do motor',
      skillId: 'diagnosis.reasoning',
      situation: 'O motor de uma bomba foi trocado ontem. Hoje a vibração está bem acima da medida anterior.',
      given: [
        { label: 'O que mudou', value: 'só o motor' },
        { label: 'Acoplamento', value: 'aquecendo mais que o normal' }
      ],
      prompt: 'O que verificar primeiro (com a máquina parada e bloqueada)?',
      hint: 'O que pode ter ficado diferente na montagem do motor novo?',
      options: [
        { text: 'Alinhamento entre motor e bomba, com relógio comparador ou sistema a laser', verdict: 'best', feedback: 'Desalinhamento é o suspeito principal após troca de motor e aquece o acoplamento.' },
        { text: 'Fixação dos pés do motor e calços (pé manco)', verdict: 'ok', feedback: 'Boa verificação também: pé manco causa vibração e atrapalha o alinhamento. Costuma ser feita junto.' },
        { text: 'Trocar o selo mecânico', verdict: 'wrong', feedback: 'Nada nos dados aponta para o selo.' },
        { text: 'Trocar o rotor da bomba', verdict: 'wrong', feedback: 'A bomba não foi mexida; comece pelo que mudou.' }
      ],
      explanation: 'No diagnóstico, comece pelo que mudou. Após troca de motor: alinhamento e assentamento da base.'
    },
    {
      type: 'choice',
      id: 'diag-engrenagens',
      level: 2,
      title: 'Bomba de engrenagens fraca',
      skillId: 'pumps.gear',
      situation: 'Bomba de engrenagens externas de uma unidade hidráulica, com muitas horas de uso.',
      given: [
        { label: 'Teste de vazão', value: 'feito na saída da bomba, antes da válvula de alívio' },
        { label: 'Resultado', value: 'bem abaixo da vazão do catálogo, na mesma rotação' },
        { label: 'Ruído', value: 'normal; filtro de sucção trocado ontem' },
        { label: 'Óleo', value: 'mais quente que o habitual' }
      ],
      prompt: 'Qual a causa mais provável?',
      hint: 'Se a vazão já sai baixa da bomba, para onde vai o óleo?',
      options: [
        { text: 'Desgaste interno: folgas maiores deixam o óleo voltar da saída para a entrada', verdict: 'best', feedback: 'Vazamento interno reduz a vazão real e aquece o óleo.' },
        { text: 'Válvula de alívio ajustada abaixo do necessário', verdict: 'wrong', feedback: 'O teste foi feito antes da válvula: ela não explica vazão baixa medida ali.' },
        { text: 'Cavitação na sucção', verdict: 'wrong', feedback: 'Os dados dizem ruído normal e filtro novo.' }
      ],
      explanation: 'Em bombas de deslocamento positivo, vazão abaixo do esperado na mesma rotação indica perda volumétrica, geralmente por desgaste.'
    },
    {
      type: 'choice',
      id: 'diag-rotacao',
      level: 3,
      title: 'Bomba nova, vazão baixa',
      skillId: 'diagnosis.reasoning',
      situation: 'Bomba centrífuga recém-instalada.',
      given: [
        { label: 'Vazão e pressão', value: 'bem abaixo do esperado' },
        { label: 'Corrente do motor', value: 'abaixo da nominal' },
        { label: 'Vazamentos e ruído', value: 'nenhum' },
        { label: 'Detalhe', value: 'a ligação do motor foi refeita na partida' }
      ],
      prompt: 'O que conferir primeiro?',
      hint: 'A carcaça tem uma seta. Para que serve?',
      options: [
        { text: 'Sentido de rotação, comparando com a seta da carcaça', verdict: 'best', feedback: 'Girando ao contrário, a centrífuga entrega bem menos vazão e pressão.' },
        { text: 'Trocar os rolamentos', verdict: 'wrong', feedback: 'Não há ruído nem aquecimento.' },
        { text: 'Desmontar a bomba para ver o rotor', verdict: 'ok', feedback: 'Pode ser necessário depois, mas é bem mais trabalhoso: confira antes o que é simples e mudou.' }
      ],
      explanation: 'Verifique primeiro o que é rápido, seguro e mudou recentemente. A correção da ligação é feita por profissional autorizado em eletricidade.'
    },
    {
      type: 'choice',
      id: 'diag-faltam-dados',
      level: 3,
      title: '“A bomba está fazendo barulho”',
      skillId: 'diagnosis.reasoning',
      situation: 'Chega um chamado: "a bomba está fazendo barulho". Nenhuma outra informação.',
      prompt: 'Qual a causa?',
      hint: 'Você tem dados suficientes?',
      options: [
        { text: 'Ainda não dá para concluir: preciso saber onde, desde quando, que tipo de ruído e o que mudou, e medir', verdict: 'best', feedback: 'Isso: diagnóstico começa coletando dados.' },
        { text: 'Rolamento', verdict: 'wrong', feedback: 'Pode ser, mas é um palpite sem dados.' },
        { text: 'Cavitação', verdict: 'wrong', feedback: 'Pode ser, mas é um palpite sem dados.' }
      ],
      explanation: 'Sem dados não há diagnóstico. Pergunte, observe, meça e compare com o histórico.'
    }
  ]
};

export const GAMES: GameDef[] = [INSPECAO, EPI, DECISAO, FERRAMENTA, DIAGNOSTICO];
export const GAMES_BY_ID: Record<string, GameDef> = Object.fromEntries(GAMES.map((g) => [g.id, g]));

export const EXTERNAL_CHALLENGES: ExternalChallenge[] = [
  {
    id: 'medir-paquimetro',
    letter: 'D',
    title: 'Leia o paquímetro',
    description: 'Leituras sorteadas na escala de 0,05 mm, com dica e correção.',
    screen: 'tools',
    param: 'treino-paquimetro'
  },
  {
    id: 'medir-micrometro',
    letter: 'D',
    title: 'Leia o micrômetro',
    description: 'Bainha e tambor de 0,01 mm, com explicação de cada leitura.',
    screen: 'tools',
    param: 'treino-micrometro'
  },
  {
    id: 'identificar-3d',
    letter: 'C',
    title: 'Identifique o componente',
    description: 'No laboratório 3D, encontre a peça pedida no equipamento.',
    screen: 'lab',
    param: 'centrifugal-pump'
  },
  {
    id: 'montar-3d',
    letter: 'B',
    title: 'Monte o equipamento',
    description: 'Remonte a bomba na ordem certa, escolhendo a peça de cada etapa.',
    screen: 'lab',
    param: 'gear-pump'
  }
];

export const gameRoundCount = (g: GameDef) => g.rounds.length;
