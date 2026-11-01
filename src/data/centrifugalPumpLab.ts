/**
 * Missão do Laboratório 3D da bomba centrífuga (construção back-pull-out).
 *
 * Sequência pensada para o modelo de `components/lab/models/pumpModel.ts`: liberação para manutenção,
 * parafusos → unidade para trás → junta → porca do rotor → rotor → tampa com selo → cubo do acoplamento →
 * eixo com rolamentos → rolamentos. A montagem segue a ordem inversa, mas com textos próprios
 * (`assembly`): ferramentas, cuidados e conferências mudam quando a peça volta.
 *
 * Sem torques, folgas, temperaturas ou tipo de rosca: esses valores vêm do manual do fabricante.
 * Coordenadas em unidades de cena (1 unidade ≈ 100 mm); +X = lado da sucção, −X = lado do motor.
 */

import type { MachineLabConfig, Vec3 } from './labMission';

/** A unidade back-pull-out: tudo o que sai junto quando o cavalete é puxado para trás. */
const UNIT = [
  'pump-bearing-bracket',
  'pump-shaft',
  'pump-bearings',
  'pump-mechanical-seal',
  'pump-impeller',
  'pump-impeller-nut',
  'pump-coupling-hub'
];
const BACK: Vec3 = [-2.4, 0, 0];
/**
 * Peças retiradas vão para o piso à frente da bomba (z = BENCH_Z), em fila, na ordem de retirada.
 * Cada uma sai na direção do eixo, vem para a frente e só então desliza até a sua vaga, sem cruzar as já colocadas.
 */
const BENCH_Z = 3.2;
const withAll = (ids: string[], path: Vec3[]) => Object.fromEntries(ids.map((id) => [id, path]));

export const PUMP_LAB: MachineLabConfig = {
  machineId: 'centrifugal-pump',
  purpose:
    'A bomba centrífuga empurra líquidos pela tubulação. O motor gira o eixo, o rotor gira junto e joga o líquido para fora com velocidade; a carcaça em espiral (voluta) transforma essa velocidade em pressão.',
  whereUsed: 'Água de resfriamento, abastecimento, caldeiras, irrigação e transferência de produtos em quase toda indústria.',
  source: 'procedural-pump',
  modelUrl: '/assets/models/pumps/centrifugal-pump-v2.glb',
  spinParts: ['pump-impeller', 'pump-impeller-nut', 'pump-shaft', 'pump-coupling-hub'],
  operating: {
    label: 'Ver girando',
    observe: 'Rotor, eixo e cubo giram juntos, presos pelas chavetas. A carcaça, a tampa e o cavalete ficam parados: é na passagem do eixo que o selo mecânico trabalha.'
  },
  cutawayParts: ['pump-volute-casing', 'pump-bearing-bracket', 'pump-mechanical-seal'],
  preWorkSafety: [
    'Desligar, bloquear com cadeado e etiqueta e testar a partida (LOTO).',
    'Fechar as válvulas, drenar e esperar o líquido esfriar.',
    'Nunca ligar a bomba sem líquido: o selo mecânico estraga.'
  ],
  preWorkChecklist: [
    {
      id: 'autorizacao',
      text: 'Combinar a parada com a operação e ter autorização para o serviço.',
      why: 'A intervenção é feita por profissional capacitado e formalmente autorizado, com a máquina parada.',
      kind: 'requisito',
      ref: { source: 'nr12', item: '12.11.3' }
    },
    {
      id: 'bloqueio',
      text: 'Desligar o motor e bloquear o dispositivo de corte com cadeado e etiqueta (data, hora, motivo e nome do responsável).',
      why: 'O bloqueio na posição “desligado” impede que alguém religue a bomba durante o serviço; a etiqueta diz quem bloqueou e por quê.',
      kind: 'requisito',
      ref: { source: 'nr12', item: '12.11.3, alínea b' }
    },
    {
      id: 'teste-partida',
      text: 'Tentar dar partida no comando local: o motor não pode girar.',
      why: 'Confirma que o bloqueio foi feito no circuito certo antes de colocar as mãos na bomba.',
      kind: 'boa-pratica'
    },
    {
      id: 'valvulas',
      text: 'Fechar e bloquear as válvulas de sucção e de recalque.',
      why: 'Isola a bomba da tubulação. É a mesma ideia de isolar todas as fontes de energia, aplicada ao líquido sob pressão.',
      kind: 'boa-pratica'
    },
    {
      id: 'dreno',
      text: 'Aliviar a pressão e drenar a carcaça pelo bujão de dreno, recolhendo o líquido conforme o produto bombeado.',
      why: 'Com pressão zero e carcaça vazia, nenhum jato sai quando os parafusos forem soltos.',
      kind: 'boa-pratica'
    },
    {
      id: 'temperatura',
      text: 'Esperar esfriar e conferir a temperatura da carcaça.',
      why: 'Líquido quente, vapor e peças quentes queimam.',
      kind: 'boa-pratica'
    },
    {
      id: 'protecao',
      text: 'Retirar a proteção do acoplamento e o espaçador (eles não aparecem no modelo).',
      why: 'A proteção fixa só sai com ferramenta, com o conjunto bloqueado. O espaçador permite tirar a unidade sem mexer no motor.',
      kind: 'requisito',
      ref: { source: 'nr12', item: '12.5.4' }
    },
    {
      id: 'epi',
      text: 'Usar os EPIs definidos para a tarefa (no mínimo óculos, luvas adequadas ao produto e calçado de segurança).',
      why: 'Respingos do produto, bordas cortantes e peças pesadas. Na empresa, os EPIs vêm da análise de risco da tarefa.',
      kind: 'boa-pratica'
    }
  ],
  returnToService: [
    { text: 'Girar o eixo à mão: ele deve girar livre, sem raspar nem travar.' },
    { text: 'Conferir o sentido de giro do motor antes de montar o espaçador, com liberação controlada pelo responsável: girando ao contrário, a porca do rotor pode soltar.' },
    { text: 'Montar o espaçador, alinhar o acoplamento (relógio comparador ou laser) e recolocar a proteção.' },
    { text: 'Completar o óleo do cavalete até o meio do visor.' },
    { text: 'Abrir a sucção e encher a bomba de líquido (escorva), tirando o ar. Nunca partir a seco.' },
    { text: 'Registrar a manutenção: o que foi feito, peças trocadas, condição de segurança e responsável.', ref: { source: 'nr12', item: '12.11.2' } },
    { text: 'Só o responsável retira o bloqueio, com todos fora da área.' }
  ],
  accuracy: {
    label: 'Modelo educacional simplificado',
    detail:
      'Modelo 3D construído no próprio projeto por script no Blender (licença CC0; no modo de gráficos leves, uma versão mais simples gerada no navegador), com proporções inspiradas na família de bombas normalizadas ISO 2858 de construção back-pull-out (designação 65-50-160: sucção DN 65, recalque DN 50, rotor nominal de 160 mm). Não representa um fabricante ou modelo comercial específico. Simplificações: o espaçador e a proteção do acoplamento e o motor não aparecem; anéis de desgaste do rotor, defletores e retentores dos mancais foram simplificados. A sequência é didática: no trabalho real valem o manual do fabricante e o procedimento da empresa.'
  },
  disassembly: [
    {
      partId: 'pump-fasteners',
      title: 'Soltar os parafusos da carcaça',
      instruction:
        'Com a bomba liberada (bloqueada, isolada, drenada e fria) e o cavalete apoiado, solte os parafusos que prendem a tampa e o cavalete à carcaça, em sequência cruzada e aos poucos.',
      tool: 'Chave combinada ou soquete',
      toolWhy: 'O anel estriado ou o soquete abraçam a cabeça inteira e não arredondam os cantos no primeiro giro.',
      safety: 'Afrouxe todos um pouco antes de retirar qualquer um: se ainda houver pressão ou líquido, ele aparece na junta e você para a tempo.',
      observe: 'Roscas danificadas ou parafusos esticados não voltam para a bomba: separe para troca.',
      result: 'Parafusos fora e guardados. A carcaça continua presa à tubulação.',
      quiz: {
        question: 'Por que os parafusos da carcaça são soltos (e depois apertados) em sequência cruzada?',
        options: [
          'Para a carga sobre a junta variar por igual e a tampa não inclinar',
          'Porque é mais rápido do que seguir o círculo',
          'Para o parafuso não perder a rosca ao sair'
        ],
        explanation: 'Em cruz, a tampa assenta reta. Aperto desigual inclina a tampa, e a junta e o selo podem vazar.'
      },
      toolDistractors: [
        { tool: 'Chave inglesa (ajustável)', why: 'A boca ajustável tem folga e tende a arredondar a cabeça em parafusos apertados.' },
        { tool: 'Alicate universal', why: 'Alicate não é ferramenta de aperto: escorrega e estraga a cabeça do parafuso.' }
      ],
      moves: {
        'pump-fasteners': [
          [-0.7, 0, 0],
          [-0.7, 0, BENCH_Z],
          [-0.7, -0.95, BENCH_Z],
          [2.77, -0.95, BENCH_Z]
        ]
      },
      assembly: {
        title: 'Apertar os parafusos da carcaça',
        instruction: 'Coloque os parafusos e aperte em sequência cruzada, em etapas, até o torque indicado no manual do fabricante.',
        tool: 'Soquete e torquímetro (aperto final)',
        toolWhy: 'O torquímetro garante a força de aperto especificada; aperto “no braço” fica desigual.',
        safety: 'Não use cano de extensão na chave: o excesso de torque estica o parafuso.',
        check: 'Gire o eixo à mão pelo acoplamento: ele deve girar livre, sem raspar.',
        quiz: {
          question: 'Qual é o jeito certo de dar o aperto final nos parafusos da carcaça?',
          options: [
            'Em cruz, em etapas, com torquímetro no valor do manual',
            'Um por vez, até o fim, seguindo o círculo',
            'Com cano de extensão, para garantir que não solte'
          ],
          explanation: 'Etapas em cruz assentam a tampa por igual, e o torquímetro limita a força ao valor do fabricante.'
        }
      }
    },
    {
      partId: 'pump-bearing-bracket',
      title: 'Puxar a unidade rotativa para trás (back-pull-out)',
      instruction:
        'Afaste o conjunto (cavalete, eixo, tampa com selo e rotor) para trás, alinhado com o eixo. A carcaça fica presa à tubulação, e o motor não sai do lugar graças ao espaçador do acoplamento.',
      tool: 'Talha ou apoio, e parafusos extratores (se houver)',
      toolWhy: 'O conjunto é pesado e precisa sair reto. Parafusos extratores, quando a bomba tem, descolam a tampa sem alavanca na junta.',
      safety: 'Não coloque as mãos entre a unidade e a carcaça; use talha ou apoio para o peso.',
      observe: 'Veja como a junta saiu: inteira, rasgada ou colada na face. Marcas de vazamento mostram onde ela falhou.',
      result: 'Unidade fora da carcaça, com acesso ao rotor. A tubulação não foi mexida.',
      quiz: {
        question: 'Qual é a vantagem da construção back-pull-out?',
        options: [
          'Tirar a parte que gira sem desmontar a tubulação nem mover o motor',
          'Bombear nos dois sentidos sem trocar o rotor',
          'Dispensar o alinhamento do acoplamento depois da montagem'
        ],
        explanation: 'A carcaça fica presa à tubulação e o espaçador deixa a unidade sair por trás. O alinhamento ainda deve ser conferido depois.'
      },
      toolDistractors: [
        { tool: 'Alavanca entre a carcaça e a tampa', why: 'Marca as faces de vedação e entorta a tampa.' },
        { tool: 'Puxar pela ponta do eixo', why: 'O eixo não é ponto de içamento: pode empenar e danificar o selo e os rolamentos.' }
      ],
      moves: withAll(UNIT, [BACK]),
      assembly: {
        title: 'Encaixar a unidade na carcaça',
        instruction: 'Com a junta nova na face, empurre a unidade para a frente, reta, até encostar. Se travar, recue e confira o encaixe: não force.',
        tool: 'Talha ou apoio',
        toolWhy: 'Segura o peso para a unidade entrar alinhada, sem amassar a junta nova.',
        safety: 'Mãos fora da junta enquanto a unidade avança.',
        check: 'Faces encostadas por igual, sem folga visível de um lado só.'
      }
    },
    {
      partId: 'pump-casing-gasket',
      title: 'Retirar a junta usada e limpar as faces',
      instruction: 'Retire a junta da carcaça e limpe as faces de vedação sem riscar. Junta retirada não volta para a bomba.',
      tool: 'Espátula de plástico ou de latão',
      toolWhy: 'Mais macia que o ferro fundido: tira os restos da junta sem riscar a face.',
      safety: 'Restos de junta e do produto bombeado: use luvas e descarte conforme a regra da empresa.',
      observe: 'Face da carcaça riscada ou corroída faz a junta nova vazar: avise o responsável.',
      result: 'Faces limpas e secas. Junta velha separada para descarte.',
      quiz: {
        question: 'A junta saiu inteira e parece boa. O que fazer na montagem?',
        options: [
          'Usar junta nova, do tipo indicado pelo fabricante',
          'Reaproveitar a mesma junta, já que não rasgou',
          'Montar sem junta e compensar com mais aperto'
        ],
        explanation: 'A junta usada já foi esmagada e perdeu a capacidade de vedar. Na montagem, junta nova sempre.'
      },
      toolDistractors: [
        { tool: 'Talhadeira de aço', why: 'Risca a face de vedação: a junta nova vaza.' },
        { tool: 'Lixa grossa', why: 'Tira material da face e deixa riscos.' }
      ],
      moves: {
        'pump-casing-gasket': [
          [-0.6, 0, 0],
          [-0.6, 0, BENCH_Z],
          [-0.6, -1.05, BENCH_Z],
          [1.33, -1.05, BENCH_Z]
        ]
      },
      assembly: {
        title: 'Colocar junta nova',
        instruction: 'Posicione a junta nova, do tipo, material e espessura da lista de peças do fabricante, com as faces limpas e secas.',
        tool: 'Junta nova (peça de reposição)',
        toolWhy: 'A peça certa garante a vedação. Junta improvisada ou reaproveitada vaza.',
        check: 'Junta centrada, sem dobras, sem cola ou graxa que o fabricante não indique.'
      }
    },
    {
      partId: 'pump-impeller-nut',
      title: 'Travar o eixo e soltar a porca do rotor',
      instruction: 'Trave o eixo pelo cubo do acoplamento e solte a porca do rotor. Confira no manual o sentido da rosca antes de fazer força.',
      tool: 'Chave de boca ou soquete, com o eixo travado',
      toolWhy: 'Com o eixo travado pelo cubo, a força fica na porca e não passa pelas pás do rotor.',
      safety: 'Nunca trave o eixo segurando o rotor pelas pás: as bordas cortam e as pás entortam.',
      observe: 'Rosca da ponta do eixo sem amassados e arruela em bom estado.',
      result: 'Porca e arruela fora, guardadas com os parafusos.',
      quiz: {
        question: 'A porca do rotor não solta girando para a esquerda. Qual é a atitude certa?',
        options: [
          'Conferir no manual se a rosca é esquerda antes de aumentar a força',
          'Usar um cano de extensão para ter mais força',
          'Aquecer a porca com maçarico até soltar'
        ],
        explanation: 'A rosca é escolhida para apertar com o giro da bomba e pode ser esquerda. Forçar no sentido errado estraga a rosca da ponta do eixo.'
      },
      toolDistractors: [
        { tool: 'Chave de grifo na porca', why: 'Os dentes marcam e arredondam a porca.' },
        { tool: 'Segurar o rotor pelas pás e girar a porca', why: 'Entorta as pás e corta a mão.' }
      ],
      moves: {
        'pump-impeller-nut': [
          [-1.75, 0, 0],
          [-1.75, 0, BENCH_Z],
          [-1.75, -2.02, BENCH_Z],
          [-0.2, -2.02, BENCH_Z]
        ]
      },
      assembly: {
        title: 'Apertar a porca do rotor',
        instruction: 'Monte a arruela e a porca e aperte com o eixo travado pelo cubo do acoplamento, no torque do manual.',
        tool: 'Torquímetro, com o eixo travado',
        toolWhy: 'O torque certo mantém o rotor preso sem esticar a rosca.',
        check: 'Porca apertada e travada; o rotor não tem folga no eixo.'
      }
    },
    {
      partId: 'pump-impeller',
      title: 'Retirar o rotor e a chaveta',
      instruction: 'Puxe o rotor para fora da ponta do eixo. Se estiver preso, use extrator com a força centrada. Guarde a chaveta.',
      tool: 'Extrator (saca-polias), se o rotor estiver preso',
      toolWhy: 'O extrator puxa o rotor de forma centrada. Pancadas podem empenar o eixo e desbalancear o rotor.',
      safety: 'As bordas das pás podem cortar: use luvas.',
      observe: 'Veja as pás e os anéis de desgaste: furinhos (cavitação), erosão ou marcas de raspagem indicam o que causou a falha.',
      result: 'Rotor na bancada, apoiado sem encostar as pás. Chaveta guardada.',
      quiz: {
        question: 'As pás do rotor têm muitos furinhos, como uma esponja, perto da entrada. O que isso sugere?',
        options: [
          'Cavitação: pressão baixa demais na sucção',
          'Rolamento com pouco óleo',
          'Parafusos da carcaça frouxos'
        ],
        explanation: 'Com a pressão na entrada abaixo da pressão de vapor do líquido, formam-se bolhas que implodem nas pás e arrancam material. A causa está na sucção, não no rotor.'
      },
      toolDistractors: [
        { tool: 'Martelo de aço', why: 'Pancadas empenam o eixo e podem trincar o rotor.' },
        { tool: 'Chave de fenda como alavanca', why: 'Alavancar entre peças marca as faces e não puxa o rotor de forma centrada.' }
      ],
      moves: {
        'pump-impeller': [
          [-1.3, 0, 0],
          [-1.3, 0, BENCH_Z],
          [-1.3, -1.35, BENCH_Z],
          [-0.82, -1.35, BENCH_Z]
        ]
      },
      assembly: {
        title: 'Montar o rotor e a chaveta',
        instruction: 'Limpe o furo do rotor e a ponta do eixo, coloque a chaveta e deslize o rotor até encostar no ressalto.',
        tool: 'Mãos (com luvas), sem pancadas',
        toolWhy: 'O rotor deve entrar sem esforço. Se precisar de força, há sujeira, rebarba ou chaveta alta: corrija antes.',
        check: 'Rotor encostado no ressalto do eixo; chaveta inteira no rasgo.'
      }
    },
    {
      partId: 'pump-mechanical-seal',
      title: 'Retirar a tampa com o selo mecânico',
      instruction: 'Deslize a tampa de pressão para fora pela ponta do eixo, trazendo o selo mecânico junto. Não encoste nas faces de vedação.',
      tool: 'Bucha guia de plástico na ponta do eixo',
      toolWhy: 'A bucha cobre o rasgo de chaveta e a rosca do eixo, que cortariam as borrachas do selo.',
      safety: 'As faces do selo são frágeis: apoie a tampa sobre um pano limpo, com a face para cima.',
      observe: 'Faces riscadas, trincadas ou com marcas de calor e borrachas endurecidas indicam troca do selo.',
      result: 'Tampa e selo na bancada, com as faces protegidas.',
      toolDistractors: [
        { tool: 'Nenhuma: puxar o selo pela borracha', why: 'Sem proteção, o rasgo de chaveta corta as borrachas na passagem.' },
        { tool: 'Fita isolante enrolada no eixo', why: 'Improviso: pode soltar e deixar resíduo. A bucha guia é a forma prevista.' }
      ],
      moves: {
        'pump-mechanical-seal': [
          [-0.7, 0, 0],
          [-0.7, 0, BENCH_Z],
          [-0.7, -0.8, BENCH_Z],
          [-1.66, -0.8, BENCH_Z]
        ]
      },
      assembly: {
        title: 'Montar o selo mecânico e a tampa',
        instruction:
          'Monte o selo seguindo o manual dele: sede na tampa, parte rotativa no eixo, borrachas com o lubrificante indicado e faces limpas e secas. Depois, deslize a tampa pela bucha guia.',
        tool: 'Bucha guia e lubrificante indicado pelo fabricante do selo',
        toolWhy: 'A bucha protege as borrachas; o lubrificante certo não ataca o elastômero.',
        safety: 'Não toque nas faces com os dedos: gordura e poeira causam vazamento.',
        check: 'Mola na medida de montagem do manual do selo; tampa assentada sem inclinar.',
        quiz: {
          question: 'O que vai nas faces de vedação do selo na hora da montagem?',
          options: [
            'Nada: faces limpas, secas e sem toque dos dedos',
            'Uma camada de graxa para facilitar a partida',
            'Fita veda-rosca para garantir a vedação'
          ],
          explanation: 'As faces vedam por contato muito plano. Graxa, poeira ou gordura dos dedos afastam as faces e causam vazamento.'
        }
      }
    },
    {
      partId: 'pump-coupling-hub',
      title: 'Retirar o cubo do acoplamento',
      instruction: 'Na outra ponta do eixo, retire o cubo do acoplamento com extrator, apoiando as garras no cubo. Guarde a chaveta.',
      tool: 'Extrator (saca-polias)',
      toolWhy: 'Puxa o cubo de forma centrada, sem pancadas que passariam pelo eixo até os rolamentos.',
      safety: 'Mantenha o rosto fora da linha do extrator.',
      observe: 'Furo e rasgo do cubo sem marcas. Elementos elásticos do acoplamento (se houver) ressecados ou rachados são trocados.',
      result: 'Cubo e chaveta fora. A ponta do eixo fica livre para retirar a tampa do mancal.',
      toolDistractors: [
        { tool: 'Martelo de aço no cubo', why: 'O impacto passa pelo eixo e marca as pistas dos rolamentos.' },
        { tool: 'Maçarico direto no cubo, sem controle', why: 'Aquece o eixo junto e pode danificar o retentor do mancal ao lado. Aquecimento, só com o método do fabricante.' }
      ],
      moves: {
        'pump-coupling-hub': [
          [-2.9, 0, 0],
          [-2.9, 0, BENCH_Z],
          [-2.9, -1.55, BENCH_Z],
          [0.82, -1.55, BENCH_Z]
        ]
      },
      assembly: {
        title: 'Montar o cubo do acoplamento',
        instruction: 'Coloque a chaveta e monte o cubo até a posição indicada no manual, que define a distância entre os cubos.',
        tool: 'Dispositivo de montagem (ou aquecimento controlado, se o ajuste for com interferência)',
        toolWhy: 'O cubo entra sem pancadas que marcariam os rolamentos.',
        check: 'Cubo na posição do manual. O alinhamento com o motor é feito no fim.'
      }
    },
    {
      partId: 'pump-shaft',
      title: 'Retirar as tampas do mancal e o eixo com os rolamentos',
      instruction:
        'Retire as tampas do mancal e extraia o eixo junto com os rolamentos, puxando na direção do eixo. Na bancada, confira o empeno do eixo com relógio comparador.',
      tool: 'Prensa ou extrator e relógio comparador',
      toolWhy: 'A prensa empurra o eixo de forma controlada. O relógio comparador mede o batimento em centésimos de milímetro.',
      safety: 'Use óculos de proteção ao trabalhar com prensa ou extrator sob carga.',
      observe: 'Meça o batimento com o eixo apoiado em prismas em V e compare com o limite do fabricante.',
      result: 'Eixo fora do cavalete, apoiado sem encostar os colos na bancada.',
      quiz: {
        question: 'Como conferir se o eixo está empenado?',
        options: [
          'Apoiar em prismas em V, girar devagar e ler o relógio comparador',
          'Medir o diâmetro com paquímetro em dois pontos',
          'Rolar o eixo no chão e observar'
        ],
        explanation: 'O empeno aparece como batimento: a variação lida no relógio comparador em uma volta completa.'
      },
      toolDistractors: [
        { tool: 'Martelo de aço direto na ponta do eixo', why: 'Amassa a ponta, danifica a rosca e passa o impacto pelas esferas.' },
        { tool: 'Paquímetro para medir o empeno', why: 'O paquímetro mede dimensões, não batimento. Para empeno, use o relógio comparador.' }
      ],
      moves: {
        'pump-shaft': [
          [-1.4, 0, 0],
          [-1.4, 2.6, 0]
        ],
        'pump-bearings': [
          [-1.4, 0, 0],
          [-1.4, 2.6, 0]
        ]
      },
      xrayParts: ['pump-bearing-bracket'],
      assembly: {
        title: 'Instalar o eixo no cavalete',
        instruction: 'Instale o eixo com os rolamentos no cavalete e monte as tampas do mancal com retentores novos.',
        tool: 'Bucha de montagem e martelo de face macia (ou prensa)',
        toolWhy: 'A força passa pelo anel externo, que entra no alojamento, e nunca pelas esferas.',
        check: 'O eixo gira livre à mão, sem pontos duros; folga axial conforme o manual.'
      }
    },
    {
      partId: 'pump-bearings',
      title: 'Retirar os rolamentos do eixo',
      instruction: 'Apoie o extrator no anel interno do rolamento, que é o anel montado com aperto no eixo.',
      tool: 'Extrator de rolamentos',
      toolWhy: 'Puxando pelo anel interno, a força não passa pelas esferas e o eixo não é marcado.',
      safety: 'Mantenha o rosto fora da linha do extrator durante a extração.',
      observe: 'Rolamento retirado com extrator normalmente é trocado. Examine-o para entender a falha (marcas, cor de aquecimento, sujeira).',
      result: 'Eixo livre para medição; rolamentos separados para análise.',
      quiz: {
        question: 'Onde apoiar o extrator para tirar o rolamento do eixo?',
        options: [
          'No anel interno, que tem o aperto no eixo',
          'No anel externo, que é maior e mais fácil de pegar',
          'Na gaiola, entre as esferas'
        ],
        explanation: 'A força deve passar só pelo anel que tem interferência. Puxando pelo externo, ela atravessa as esferas e marca as pistas.'
      },
      toolDistractors: [
        { tool: 'Maçarico para aquecer e soltar', why: 'Chama aquece de forma desigual e pode alterar a dureza do eixo e do rolamento.' },
        { tool: 'Talhadeira e martelo', why: 'Corta e marca o eixo; o impacto também danifica as pistas.' }
      ],
      moves: { 'pump-bearings': [[-1.4, 3.75, 0]] },
      assembly: {
        title: 'Montar os rolamentos no eixo',
        instruction:
          'Monte rolamentos novos aquecidos em aquecedor indutivo (ou com bucha de montagem apoiada no anel interno) e deixe esfriar encostados no ressalto.',
        tool: 'Aquecedor indutivo de rolamentos',
        toolWhy: 'Aquecido, o anel interno dilata e entra sem força; sem pancadas, as pistas não são marcadas.',
        safety: 'Use luvas térmicas. Nunca aqueça com chama; a temperatura máxima é a do fabricante do rolamento.',
        check: 'Rolamento encostado no ressalto e girando livre depois de esfriar.',
        quiz: {
          question: 'Como montar o rolamento novo no eixo?',
          options: [
            'Aquecido no aquecedor indutivo, ou com bucha apoiada no anel interno',
            'Com martelo de aço batendo no anel externo',
            'Aquecido com maçarico até ficar vermelho'
          ],
          explanation: 'O aperto está no anel interno: é nele que se aplica força ou calor controlado. Pancada no externo marca as pistas pelas esferas.'
        }
      }
    }
  ],
  explode: {
    // Ao longo do eixo, na ordem de montagem; o cavalete vai para trás (−Z) para mostrar eixo e rolamentos.
    'pump-volute-casing': [2.6, 0, 0],
    'pump-casing-gasket': [2.0, 0, 0],
    'pump-impeller-nut': [1.35, 0, 0],
    'pump-impeller': [0.9, 0, 0],
    'pump-mechanical-seal': [0, 0, 0],
    'pump-fasteners': [-1.9, 0, 0],
    'pump-bearing-bracket': [-1.4, 0, -2.4],
    'pump-shaft': [-1.4, 0, 0],
    'pump-bearings': [-1.4, 0, 0],
    'pump-coupling-hub': [-2.3, 0, 0]
  },
  identify: [
    { partId: 'pump-impeller', prompt: 'Clique no rotor — a peça com pás que gira e empurra o líquido.', hint: 'Ele fica dentro da carcaça em espiral, na ponta do eixo.', needsXray: true },
    { partId: 'pump-volute-casing', prompt: 'Clique na voluta — a carcaça em espiral que fica presa à tubulação.', hint: 'É a peça com os dois flanges de tubulação: entrada de frente e saída para cima.' },
    { partId: 'pump-mechanical-seal', prompt: 'Clique no selo mecânico (com a tampa de pressão).', hint: 'Fica onde o eixo atravessa a carcaça, visível pelas janelas da lanterna.', needsXray: true },
    { partId: 'pump-bearings', prompt: 'Clique em um dos rolamentos.', hint: 'Ficam dentro do cavalete, apoiando o eixo. Os anéis prateados com esferas.', needsXray: true }
  ],
  checkQuestionIds: ['bom-06', 'bom-05', 'rol-02', 'fix-01'],
  lessonId: 'lesson-centrifugal-pump'
};

/** Cuidados de segurança por componente da bomba, exibidos no painel de informações. */
export const PUMP_PART_SAFETY: Record<string, string> = {
  'pump-volute-casing': 'Antes de abrir: válvulas fechadas, carcaça drenada e despressurizada, líquido frio.',
  'pump-fasteners': 'Solte e aperte em sequência cruzada. No aperto final, use torquímetro com o valor do manual.',
  'pump-casing-gasket': 'Junta retirada vai para descarte. Restos do produto bombeado podem ser tóxicos ou corrosivos: use luvas.',
  'pump-impeller-nut': 'Trave o eixo pelo cubo do acoplamento, nunca segurando o rotor pelas pás.',
  'pump-impeller': 'Bordas das pás podem ser cortantes. Use luvas para manusear o rotor fora da máquina.',
  'pump-mechanical-seal': 'Não toque nas faces de vedação com dedos sujos. Nunca ligue a bomba a seco.',
  'pump-coupling-hub': 'Acoplamento só se toca com o motor bloqueado; a proteção volta antes de religar.',
  'pump-shaft': 'Apoie o eixo em prismas em V para medir; uma queda pode empenar ou marcar os colos.',
  'pump-bearings': 'Monte e desmonte aplicando força só no anel com aperto. Aqueça com aquecedor indutivo, nunca com chama.',
  'pump-bearing-bracket': 'Use o nível de óleo indicado pelo fabricante. Excesso de óleo aquece os rolamentos.'
};
