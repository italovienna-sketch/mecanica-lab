export interface StudentPerformanceRecord {
  id: string;
  name: string;
  avatarId: string;
  roleTitle: string;
  progressPercent: number;
  quizScore: number;
  timeSpentMinutes: number;
  completedTasksCount: number;
  criticalMistakeConcept?: string;
  status: 'Excelente' | 'No Prazo' | 'Precisa Atenção';
}

export interface TeacherDemoClassStats {
  classCode: string;
  className: string;
  instructorName: string;
  academicPeriod: string;
  totalStudents: number;
  activeNow: number;
  averageQuizScore: number;
  completionRatePercent: number;
  averageDisassemblyTimeMinutes: number;
  missedConceptsList: {
    concept: string;
    errorRate: number;
    severity: 'Alta' | 'Média' | 'Baixa';
    pedagogicalTip: string;
  }[];
  students: StudentPerformanceRecord[];
}

export const TEACHER_DEMO_DATA: TeacherDemoClassStats = {
  classCode: 'MEC-IND-2026-TURMA-A',
  className: 'Mecânica Industrial & Ajustagem de Máquinas — Módulo Transmissões',
  instructorName: 'Prof. Carlos Eduardo Silveira (Eng. Mecânico)',
  academicPeriod: 'Semestre 2026.2 • Turno Noturno',
  totalStudents: 24,
  activeNow: 18,
  averageQuizScore: 84.5,
  completionRatePercent: 88,
  averageDisassemblyTimeMinutes: 14.2,
  missedConceptsList: [
    {
      concept: 'Esforço Axial em Rolamentos de Rolos Cônicos',
      errorRate: 38,
      severity: 'Alta',
      pedagogicalTip: 'Reforçar visualmente na vista explodida do laboratório 3D como a inclinação dos dentes helicoidais empurra o eixo contra a capa cônica do mancal.'
    },
    {
      concept: 'Uso Indevido de Junta de Papelão na Partição Bipartida',
      errorRate: 29,
      severity: 'Média',
      pedagogicalTip: 'Demonstrar na metrologia que qualquer espessura adicionada na junta altera a distância entre centros e prende as engrenagens.'
    },
    {
      concept: 'Sequência em Cruz de Desaperto de Parafusos Perimetrais',
      errorRate: 21,
      severity: 'Média',
      pedagogicalTip: 'Fazer o estudante repetir a etapa 1 do modo guiado prestando atenção no alívio de tensões opostas.'
    },
    {
      concept: 'Procedimento LOTO antes da Abertura da Carcaça',
      errorRate: 8,
      severity: 'Baixa',
      pedagogicalTip: 'A maioria dos alunos assimilou a obrigatoriedade do bloqueio elétrico e teste de partida zero.'
    }
  ],
  students: [
    {
      id: 'st-01',
      name: 'Lucas Martins Ferreira',
      avatarId: 'avatar-tech-1',
      roleTitle: 'Aprendiz Ajustador Jr.',
      progressPercent: 100,
      quizScore: 95,
      timeSpentMinutes: 32,
      completedTasksCount: 6,
      status: 'Excelente'
    },
    {
      id: 'st-02',
      name: 'Beatriz Vasconcelos',
      avatarId: 'avatar-tech-2',
      roleTitle: 'Inspetora de Qualidade Jr.',
      progressPercent: 100,
      quizScore: 100,
      timeSpentMinutes: 28,
      completedTasksCount: 6,
      status: 'Excelente'
    },
    {
      id: 'st-03',
      name: 'Gabriel Souza Lima',
      avatarId: 'avatar-tech-1',
      roleTitle: 'Operador Mecânico',
      progressPercent: 85,
      quizScore: 78,
      timeSpentMinutes: 22,
      completedTasksCount: 5,
      criticalMistakeConcept: 'Esforço Axial em Rolamentos Cônicos',
      status: 'No Prazo'
    },
    {
      id: 'st-04',
      name: 'Mariana Duarte Prado',
      avatarId: 'avatar-tech-3',
      roleTitle: 'Técnica em Usinagem',
      progressPercent: 92,
      quizScore: 88,
      timeSpentMinutes: 25,
      completedTasksCount: 5,
      status: 'No Prazo'
    },
    {
      id: 'st-05',
      name: 'Rodrigo Antunes Becker',
      avatarId: 'avatar-tech-1',
      roleTitle: 'Aprendiz Manutenção',
      progressPercent: 45,
      quizScore: 55,
      timeSpentMinutes: 12,
      completedTasksCount: 2,
      criticalMistakeConcept: 'Uso Indevido de Junta de Papelão',
      status: 'Precisa Atenção'
    },
    {
      id: 'st-06',
      name: 'Camila Ribeiro Santos',
      avatarId: 'avatar-tech-2',
      roleTitle: 'Auxiliar de Oficina',
      progressPercent: 60,
      quizScore: 68,
      timeSpentMinutes: 18,
      completedTasksCount: 3,
      criticalMistakeConcept: 'Sequência em Cruz de Parafusos',
      status: 'Precisa Atenção'
    }
  ]
};
