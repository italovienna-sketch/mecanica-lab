import { QUIZZES_BY_ID, QuizQuestion } from './quizzesData';
import { PracticeQuestion, PRACTICE_QUESTIONS_BY_ID } from './practiceBank';

/**
 * Estrutura pedagógica de cada aula (formato A–F):
 * A. O que você vai aprender · B. Entender · C. Ver na prática · D. Praticar · E. Verificar · F. Próximo passo
 *
 * Inspirado em princípios públicos da educação profissional por competências
 * (situações de aprendizagem, teoria ligada à prática, avaliação formativa). Não é material oficial de nenhuma instituição.
 */

export type LessonStageId = 'objetivos' | 'entender' | 'ver' | 'praticar' | 'verificar' | 'proximo';

export const LESSON_STAGES: { id: LessonStageId; letter: string; label: string; short: string }[] = [
  { id: 'objetivos', letter: 'A', label: 'O que você vai aprender', short: 'Objetivos' },
  { id: 'entender', letter: 'B', label: 'Entender', short: 'Entender' },
  { id: 'ver', letter: 'C', label: 'Ver na prática', short: 'Ver' },
  { id: 'praticar', letter: 'D', label: 'Praticar', short: 'Praticar' },
  { id: 'verificar', letter: 'E', label: 'Verificar', short: 'Verificar' },
  { id: 'proximo', letter: 'F', label: 'Próximo passo', short: 'Próximo' }
];

export interface OrderTask {
  type: 'order';
  /** Situação-problema que contextualiza a tarefa. */
  situation: string;
  prompt: string;
  /** Etapas na ordem correta. A interface embaralha antes de mostrar. */
  steps: string[];
  /** Por que essa ordem (mostrado depois de acertar). */
  explanation: string;
}

export interface LessonStructure {
  lessonId: string;
  friendlyTitle: string;
  /** Situação real que dá sentido à aula (abre a aula). */
  situation: string;
  objectives: string[];
  /** Peça destacada na prancha durante cada etapa da demonstração (mesma ordem de demonstrationSteps). */
  demoPartIds: (string | null)[];
  practice: OrderTask;
  /** Questões de verificação. Questões do banco de prática podem complementar as da aula. */
  extraCheckQuestionIds?: string[];
  practiceTopicId: string;
}

export const LESSON_STRUCTURES: Record<string, LessonStructure> = {
  'lesson-beginner-tools-fasteners': {
    lessonId: 'lesson-beginner-tools-fasteners',
    friendlyTitle: 'Ferramentas básicas e as peças de uma máquina',
    situation:
      'No seu primeiro dia na manutenção, pedem para você ajudar a abrir a tampa de uma bomba. Antes de pegar a chave, você precisa saber o que vai encontrar e como trabalhar com segurança.',
    objectives: [
      'Escolher o lado certo da chave combinada para soltar e apertar um parafuso.',
      'Explicar com suas palavras o que fazem o eixo, o rolamento e a vedação.',
      'Dizer qual é o primeiro cuidado de segurança antes de mexer em uma máquina.'
    ],
    demoPartIds: [null, 'pump-fasteners', 'pump-shaft'],
    practice: {
      type: 'order',
      situation: 'A bomba precisa de manutenção e ainda está ligada na linha.',
      prompt: 'Coloque em ordem o começo de uma manutenção segura.',
      steps: [
        'Avisar a equipe e desligar a máquina',
        'Bloquear a fonte de energia com cadeado e etiqueta',
        'Testar se a máquina realmente não liga',
        'Vestir os EPIs e começar a soltar os parafusos'
      ],
      explanation:
        'Primeiro se isola a energia (bloqueio e etiqueta), depois se confirma que ela foi isolada (teste). Só então a máquina pode ser tocada.'
    },
    extraCheckQuestionIds: ['seg-01'],
    practiceTopicId: 'ferramentas'
  },
  'lesson-centrifugal-pump': {
    lessonId: 'lesson-centrifugal-pump',
    friendlyTitle: 'Como funciona uma bomba centrífuga',
    situation:
      'Uma bomba de água de resfriamento começou a vazar pelo eixo. Para trocar o selo mecânico, você precisa entender como a bomba é montada e em que ordem ela se desmonta.',
    objectives: [
      'Explicar o papel do rotor e da voluta na bomba centrífuga.',
      'Reconhecer sinais de cavitação e como evitá-la.',
      'Descrever a ordem de desmontagem de uma bomba back-pull-out.'
    ],
    demoPartIds: ['pump-fasteners', 'pump-impeller', 'pump-shaft'],
    practice: {
      type: 'order',
      situation: 'O selo mecânico precisa ser trocado. A voluta continua presa na tubulação (construção back-pull-out).',
      prompt: 'Coloque as etapas de desmontagem na ordem correta.',
      steps: [
        'Bloquear o motor, fechar as válvulas e drenar a bomba',
        'Soltar os parafusos da carcaça e a porca do rotor',
        'Retirar o rotor do eixo',
        'Retirar o selo mecânico',
        'Retirar o eixo com os rolamentos do cavalete'
      ],
      explanation:
        'Cada peça só sai quando a que está na frente dela já saiu: fixadores, rotor, selo e, por último, o conjunto eixo e rolamentos.'
    },
    extraCheckQuestionIds: ['bom-02', 'bom-04'],
    practiceTopicId: 'bombas'
  },
  'lesson-gearbox-fundamentals': {
    lessonId: 'lesson-gearbox-fundamentals',
    friendlyTitle: 'Redutores de engrenagens e rolamentos',
    situation:
      'A esteira de uma linha de envase está fazendo ruído no redutor. O supervisor pede para abrir o equipamento e conferir engrenagens e rolamentos.',
    objectives: [
      'Explicar por que o redutor diminui a rotação e aumenta o torque.',
      'Relacionar os dentes helicoidais com o uso de rolamentos de rolos cônicos.',
      'Seguir a ordem correta de desmontagem de um redutor.'
    ],
    demoPartIds: ['part-housing-top', 'part-output-gear', 'part-input-pinion-shaft'],
    practice: {
      type: 'order',
      situation: 'O redutor já está parado e bloqueado.',
      prompt: 'Coloque as etapas de desmontagem na ordem correta.',
      steps: [
        'Drenar o óleo do redutor',
        'Soltar os parafusos da tampa em sequência cruzada',
        'Levantar a tampa superior',
        'Retirar os retentores das pontas dos eixos',
        'Retirar o eixo-pinhão e depois a coroa'
      ],
      explanation:
        'Drenar evita derramamento, o aperto cruzado protege a tampa, e os eixos só saem depois que a tampa e as vedações foram retiradas.'
    },
    extraCheckQuestionIds: ['rol-05'],
    practiceTopicId: 'rolamentos'
  },
  'lesson-professional-diagnostics': {
    lessonId: 'lesson-professional-diagnostics',
    friendlyTitle: 'Diagnóstico de falhas e ajustes',
    situation:
      'A mesma bomba voltou a vazar dois dias depois da troca do selo. Desta vez, você precisa descobrir a causa raiz antes de trocar qualquer peça.',
    objectives: [
      'Separar sintoma de causa raiz em uma falha repetitiva.',
      'Comparar uma medida com a tolerância do desenho e decidir se a peça serve.',
      'Planejar um aperto em etapas com torquímetro.'
    ],
    demoPartIds: ['pump-impeller', 'pump-shaft', 'pump-fasteners'],
    practice: {
      type: 'order',
      situation: 'Falha repetida no selo mecânico de uma bomba.',
      prompt: 'Coloque em ordem as etapas de um diagnóstico.',
      steps: [
        'Coletar os sintomas e o histórico da falha',
        'Medir batimento, folgas e diâmetros e comparar com a especificação',
        'Identificar a causa raiz',
        'Corrigir a causa e registrar a intervenção'
      ],
      explanation:
        'Sem medir, qualquer conclusão é um palpite. A correção só resolve quando ataca a causa encontrada, e o registro evita que o problema se repita.'
    },
    extraCheckQuestionIds: ['man-08'],
    practiceTopicId: 'manutencao'
  }
};

const CATEGORY_SKILL: Record<QuizQuestion['category'], string> = {
  Segurança: 'safety.loto',
  Transmissão: 'transmission.gears',
  Mancais: 'bearings.function',
  Metrologia: 'measure.dial',
  Procedimento: 'maint.routine'
};

function stripLead(text: string): string {
  return text
    .replace(/^(Correto|Excelente|Perfeito|Exato|Isso|Muito bem|Ótimo)[!.]\s*/i, '')
    .replace(/^(Incorreto|Errado|Extremamente perigoso)[!.]\s*/i, '')
    .trim();
}

/** Converte as questões originais da aula para o formato do QuestionRunner. */
export function getLessonCheckQuestions(lessonId: string): PracticeQuestion[] {
  const original = (QUIZZES_BY_ID[lessonId] || []).map((q): PracticeQuestion => {
    const correctIndex = Math.max(0, q.options.findIndex((o) => o.isCorrect));
    return {
      id: q.id,
      topicId: lessonId,
      skillId:
        lessonId === 'lesson-centrifugal-pump' && q.category !== 'Segurança' && q.category !== 'Metrologia'
          ? 'pumps.principle'
          : CATEGORY_SKILL[q.category] || 'maint.routine',
      level: q.difficulty,
      prompt: q.question,
      options: q.options.map((o) => o.text),
      correctIndex,
      why: stripLead(q.options[correctIndex]?.explanation || ''),
      optionFeedback: q.options.map((o) => stripLead(o.explanation)),
      learnMore: q.contextNote ? `Dica para pensar: ${q.contextNote}` : undefined
    };
  });
  const extras = (LESSON_STRUCTURES[lessonId]?.extraCheckQuestionIds || [])
    .map((id) => PRACTICE_QUESTIONS_BY_ID[id])
    .filter(Boolean);
  return [...original, ...extras];
}
