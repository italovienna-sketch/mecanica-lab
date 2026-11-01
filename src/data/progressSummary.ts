import { PlayerProfile } from '../types/game';
import { COURSE_MODULES_ORDER } from './lessonsData';
import { LAB_CONFIGS, LAB_MACHINE_LABELS, MISSION_STAGES } from './labMission';
import { LATHE_ID, LATHE_STAGES } from './latheStages';
import { MICRO_GROUPS } from './microLessons';
import { GAMES } from './games';
import { STANDALONE_GAMES } from './standaloneGames';

/**
 * Totais reais de progresso, calculados a partir do perfil salvo no navegador.
 * Usado no Início e em "Meu progresso" para que os dois mostrem os mesmos números.
 */
export function summarizeProgress(p: PlayerProfile) {
  const lessonsDone = COURSE_MODULES_ORDER.filter((l) => p.lessonProgress[l.id]?.completed).length;
  const sessions = p.practiceSessions;
  const practiceCorrect = sessions.reduce((a, s) => a + s.correct, 0);
  const practiceTotal = sessions.reduce((a, s) => a + s.total, 0);
  const practicePct = practiceTotal ? Math.round((practiceCorrect / practiceTotal) * 100) : null;

  // Equipamentos do laboratório e o número de etapas de cada um (o torno tem atividades próprias).
  const labRows = [
    ...Object.keys(LAB_CONFIGS).map((id) => ({ id, label: LAB_MACHINE_LABELS[id] || id, stages: MISSION_STAGES.map((st) => st.id as string) })),
    { id: LATHE_ID, label: 'Torno mecânico', stages: LATHE_STAGES.map((st) => st.id as string) }
  ];
  const labStagesTotal = labRows.reduce((a, r) => a + r.stages.length, 0);
  const labStagesDone = labRows.reduce((a, r) => a + r.stages.filter((st) => p.labMissionStages[r.id]?.includes(st)).length, 0);

  const microIds = MICRO_GROUPS.flatMap((g) => g.ids);
  const microDone = microIds.filter((id) => p.microLessons?.[id]?.completedAt).length;

  // Desafios de rodadas fixas e os de tela própria (Mestre da Metrologia, Montagem de rolamentos).
  const solvedOf = (gameId: string, roundIds: string[]) => roundIds.filter((r) => p.gameResults?.[gameId]?.rounds?.[r]?.solved).length;
  const gameRows = [
    ...GAMES.map((g) => ({ id: g.id, title: g.title, unit: 'rodadas', total: g.rounds.length, solved: solvedOf(g.id, g.rounds.map((r) => r.id)) })),
    ...STANDALONE_GAMES.map((g) => ({ id: g.id, title: g.title, unit: g.unit, total: g.roundIds.length, solved: solvedOf(g.id, g.roundIds) }))
  ];
  const roundsTotal = gameRows.reduce((a, r) => a + r.total, 0);
  const roundsSolved = gameRows.reduce((a, r) => a + r.solved, 0);

  const hasAnyActivity =
    sessions.length > 0 || Object.keys(p.lessonProgress).length > 0 || labStagesDone > 0 || microDone > 0 || roundsSolved > 0;

  return {
    lessonsDone,
    lessonsTotal: COURSE_MODULES_ORDER.length,
    sessions,
    practicePct,
    labRows,
    labStagesDone,
    labStagesTotal,
    microIds,
    microDone,
    gameRows,
    roundsSolved,
    roundsTotal,
    hasAnyActivity
  };
}
