import type { PlayerProfile } from '../../types/game';
import { COMPETENCIES, competencyProgress } from '../competencies';
import { masteredQuestionIds } from '../learningPaths';
import { CRITERIA, CriterionId } from './meta';
import { MISSIONS, missionProgress } from './missions';

/**
 * Relatório da turma a partir dos arquivos que os alunos exportam no Passaporte. Sem backend: roda só na memória da aba
 * do instrutor. Mostra o que os exercícios registraram; não é nota oficial.
 */

export interface StudentRow {
  file: string;
  name: string;
  missions: { id: string; code: string; done: number; total: number; complete: boolean }[];
  competencies: number;
  attempts: number;
  /** Melhor tentativa aprovada, ou a última, com as notas por critério. */
  best: { criteria: Record<CriterionId, number>; passed: boolean; critical: boolean } | null;
  openMistakes: number;
}

export interface ClassReport {
  rows: StudentRow[];
  /** Tropeços mais comuns: quantos alunos tiveram cada um, do maior para o menor. */
  mistakes: { text: string; why: string; students: number }[];
  /** Média por critério entre quem fez a avaliação. */
  criteria: { id: CriterionId; average: number; below: number }[];
  competencies: { id: string; title: string; students: number }[];
}

export function studentRow(file: string, p: PlayerProfile): StudentRow {
  const mastered = masteredQuestionIds(p);
  const runs = p.journey.assessmentRuns;
  const pick = [...runs].reverse().find((r) => r.passed) ?? runs[runs.length - 1] ?? null;
  return {
    file,
    name: p.name || file.replace(/\.json$/i, ''),
    missions: MISSIONS.map((m) => {
      const prog = missionProgress(m, p);
      return { id: m.id, code: m.code, done: prog.done, total: prog.total, complete: prog.complete };
    }),
    competencies: COMPETENCIES.filter((c) => competencyProgress(c, p, mastered).completed).length,
    attempts: runs.length,
    best: pick ? { criteria: pick.criteria, passed: pick.passed, critical: pick.critical } : null,
    openMistakes: p.journey.mistakes.filter((m) => !m.resolvedAt).length
  };
}

export function classReport(students: { file: string; profile: PlayerProfile }[], passScore: number): ClassReport {
  const rows = students.map((s) => studentRow(s.file, s.profile));

  const seen = new Map<string, { text: string; why: string; students: number }>();
  students.forEach(({ profile }) => {
    profile.journey.mistakes.forEach((m) => {
      const cur = seen.get(m.id);
      if (cur) cur.students += 1;
      else seen.set(m.id, { text: m.text, why: m.why, students: 1 });
    });
  });

  const assessed = rows.filter((r) => r.best);
  const criteria = CRITERIA.map((id) => {
    const values = assessed.map((r) => r.best!.criteria[id]);
    const need = id === 'seguranca' ? 100 : passScore;
    return {
      id,
      average: values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0,
      below: values.filter((v) => v < need).length
    };
  });

  const competencies = COMPETENCIES.map((c) => ({
    id: c.id,
    title: c.title,
    students: students.filter(({ profile }) => competencyProgress(c, profile).completed).length
  }));

  return { rows, mistakes: [...seen.values()].sort((a, b) => b.students - a.students).slice(0, 8), criteria, competencies };
}
