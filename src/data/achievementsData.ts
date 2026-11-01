// Conquistas desbloqueadas automaticamente pelo GameStateContext (inspeção no Lab 3D, quiz 100%, desmontagem).
// As competências (`competencies.ts`) são o sistema principal; esta lista só nomeia os marcos já existentes.
export interface Achievement {
  id: string;
  title: string;
  description: string;
}

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: 'ach-first-inspect',
    title: 'Olho Clínico de Inspetor',
    description: 'Inspecionou os detalhes técnicos e metalúrgicos do primeiro componente mecânico na bancada.'
  },
  {
    id: 'ach-all-parts-inspected',
    title: 'Especialista em Redutores',
    description: 'Inspecionou com sucesso todos os 7 componentes do redutor de velocidade no Laboratório 3D.'
  },
  {
    id: 'ach-quiz-master',
    title: 'Aprovado na Banca Técnica',
    description: 'Obteve 100% de acertos na avaliação conceitual de transmissão e procedimentos.'
  },
  {
    id: 'ach-disassembly-pop',
    title: 'Mestre da Desmontagem Lógica',
    description: 'Concluiu todas as 5 etapas do Procedimento Operacional Padronizado sem danificar peças.'
  }
];
