import React from 'react';
import { ArrowRight, BookOpen, Box, CheckCircle2, Circle, Target, Wrench, Award, Clock, PlayCircle, Puzzle } from 'lucide-react';
import { summarizeProgress } from '../../data/progressSummary';
import { useGameState } from '../../context/GameStateContext';
import { COURSE_MODULES_ORDER } from '../../data/lessonsData';
import { LESSON_STAGES, LESSON_STRUCTURES } from '../../data/lessonStructure';
import { PRACTICE_QUESTIONS, PRACTICE_TOPICS, SKILLS } from '../../data/practiceBank';
import { MICRO_GROUPS } from '../../data/microLessons';
import { COMPETENCIES, competencyProgress } from '../../data/competencies';
import { masteredQuestionIds } from '../../data/learningPaths';
import { MECHANICAL_TOOLS_CATALOG } from '../../data/mechanicalToolsData';
import { ACHIEVEMENTS_LIST } from '../../data/achievementsData';
import { LEVEL_TEXT } from '../../data/competencies';
import { DIAGNOSIS_CASE_IDS } from '../../data/diagnosis/meta';
import { COMPONENTS } from '../../data/machine/motorPump';
import { DataPanel, DiagnosisResults, LEVEL_BADGE, LevelLegend, PassportOverview } from './PassportPanels';
import { JourneyPassport } from './JourneyPassport';
import { Page, PageHeader, ProgressBar } from '../ui';

/** Tema de prática que treina uma habilidade (para o botão "Praticar"). */
const topicForSkill = (skillId: string) => {
  const q = PRACTICE_QUESTIONS.find((x) => x.skillId === skillId);
  return PRACTICE_TOPICS.find((t) => t.id === q?.topicId);
};

const dateFmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export const StudentProgressView: React.FC = () => {
  const { playerProfile, navigateTo } = useGameState();
  const p = playerProfile;

  const { lessonsDone, sessions, practicePct, labRows, labStagesDone, labStagesTotal, microIds, microDone, gameRows, roundsSolved, roundsTotal, hasAnyActivity } =
    summarizeProgress(p);
  const mastered = masteredQuestionIds(p);
  const competencies = COMPETENCIES.map((c) => ({ c, ...competencyProgress(c, p, mastered) }));

  const skills = Object.entries(p.skillStats)
    .map(([id, s]) => ({ id, label: SKILLS[id] || id, ...s, ratio: s.total ? s.correct / s.total : 0 }))
    .sort((a, b) => a.ratio - b.ratio);
  const toReview = skills.filter((s) => s.total >= 2 && s.ratio < 0.6).slice(0, 3);
  const unlocked = ACHIEVEMENTS_LIST.filter((a) => p.unlockedAchievements.includes(a.id));

  return (
    <Page>
      <PageHeader
        eyebrow="Meu progresso"
        title="Passaporte de competências"
        description="O que você já praticou e demonstrou nos exercícios do Mecânica Lab. Fica salvo neste navegador; não é nota oficial nem certificação."
      />

      {!hasAnyActivity && <p className="mb-4 text-sm text-ink-400">Você ainda não começou: a recomendação abaixo é o melhor primeiro passo.</p>}

      <PassportOverview rows={competencies} />

      <JourneyPassport />

      {/* Resumo */}
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Aulas rápidas concluídas', value: `${microDone} de ${microIds.length}` },
          { label: 'Rodadas de desafios resolvidas', value: `${roundsSolved} de ${roundsTotal}` },
          { label: 'Aulas concluídas', value: `${lessonsDone} de ${COURSE_MODULES_ORDER.length}` },
          { label: 'Sessões de prática', value: String(sessions.length) },
          { label: 'Acerto na prática', value: practicePct === null ? '—' : `${practicePct}%` },
          { label: 'Etapas no laboratório 3D', value: `${labStagesDone} de ${labStagesTotal}` },
          {
            label: 'Casos de diagnóstico concluídos',
            value: `${DIAGNOSIS_CASE_IDS.filter((id) => p.diagnosisRuns.some((r) => r.caseId === id && r.passed)).length} de ${DIAGNOSIS_CASE_IDS.length}`
          },
          { label: 'Componentes verificados (máquina)', value: `${Object.values(p.componentChecks).filter((c) => c.correct).length} de ${COMPONENTS.length}` }
        ].map((k) => (
          <div key={k.label} className="card p-4">
            <dt className="text-sm text-ink-400">{k.label}</dt>
            <dd className="mt-1 text-2xl font-semibold text-ink-100">{k.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="min-w-0 space-y-6 lg:col-span-3">
          {/* Marcos de competência */}
          <section className="card p-5" aria-labelledby="pg-comp">
            <h2 id="pg-comp" className="flex items-center gap-2 text-base font-semibold text-ink-100">
              <Award className="h-4 w-4 text-accent" aria-hidden /> Competências
            </h2>
            <p className="mt-1 text-sm text-ink-400">
              Cada competência tem requisitos definidos. Elas não expiram e não dependem de pontos. São marcos de estudo no app: não são certificado,
              avaliação oficial nem prova de competência prática na indústria.
            </p>
            <LevelLegend />
            <ul className="mt-3 space-y-3">
              {competencies.map(({ c, items, done, total, completed, level }) => (
                <li key={c.id} className={`rounded-lg border p-3 ${completed ? 'border-emerald-700/60 bg-emerald-950/20' : 'border-ink-800 bg-ink-850'}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="flex items-center gap-2 text-sm font-semibold text-ink-100">
                      {completed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-label="Alcançado" />
                      ) : (
                        <Circle className="h-4 w-4 text-ink-600" aria-label="Em andamento" />
                      )}
                      {c.title}
                    </p>
                    <span className="flex items-center gap-2 text-xs text-ink-400">
                      <span className={LEVEL_BADGE[level]}>{LEVEL_TEXT[level].label}</span>
                      {done} de {total} requisitos
                    </span>
                  </div>
                  {completed ? (
                    <p className="mt-1 text-sm text-emerald-200/90">{c.evidence}</p>
                  ) : (
                    <>
                      <ul className="mt-2 space-y-1 text-sm">
                        {items.map((i) => (
                          <li key={i.req.label} className="flex items-center justify-between gap-2 text-ink-300">
                            <span className={i.done >= i.total ? 'text-ink-500 line-through' : ''}>{i.req.label}</span>
                            <span className="shrink-0 font-mono text-xs text-ink-400">
                              {i.done}/{i.total}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <button onClick={() => navigateTo(c.start.screen, c.start.param)} className="btn-ghost mt-1 px-0 text-sm">
                        {items.some((i) => i.done > 0) ? 'Continuar' : 'Começar'} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <DiagnosisResults p={p} />

          {/* Aulas rápidas */}
          <section className="card p-5" aria-labelledby="pg-micro">
            <h2 id="pg-micro" className="flex items-center gap-2 text-base font-semibold text-ink-100">
              <PlayCircle className="h-4 w-4 text-accent" aria-hidden /> Aulas rápidas
            </h2>
            <ul className="mt-3 space-y-3">
              {MICRO_GROUPS.map((g) => {
                const done = g.ids.filter((id) => p.microLessons?.[id]?.completedAt).length;
                const next = g.ids.find((id) => !p.microLessons?.[id]?.completedAt);
                return (
                  <li key={g.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-200">{g.title}</span>
                      <span className="text-ink-400">
                        {done}/{g.ids.length}
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <ProgressBar value={done} max={g.ids.length} label={`Aulas rápidas: ${g.title}`} tone="success" />
                    </div>
                    {next && (
                      <button onClick={() => navigateTo('micro', next)} className="btn-ghost mt-1 px-0 text-sm">
                        {done ? 'Continuar' : 'Começar'} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Desafios */}
          <section className="card p-5" aria-labelledby="pg-games">
            <h2 id="pg-games" className="flex items-center gap-2 text-base font-semibold text-ink-100">
              <Puzzle className="h-4 w-4 text-accent" aria-hidden /> Desafios
            </h2>
            <ul className="mt-3 divide-y divide-ink-800">
              {gameRows.map((g) => (
                <li key={g.id} className="flex items-center gap-3 py-2.5">
                  {g.solved >= g.total ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" aria-label="Concluído" />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-ink-600" aria-label={g.solved ? 'Em andamento' : 'Não iniciado'} />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-100">{g.title}</p>
                    <p className="text-xs text-ink-400">
                      {g.solved} de {g.total} {g.unit === 'níveis' ? 'níveis concluídos' : 'rodadas resolvidas'}
                    </p>
                  </div>
                  <button onClick={() => navigateTo('games', g.id)} className="btn-ghost px-2.5 py-1.5 text-sm">
                    {g.solved >= g.total ? 'Rever' : g.solved ? 'Continuar' : 'Começar'}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Aulas */}
          <section className="card p-5" aria-labelledby="pg-aulas">
            <h2 id="pg-aulas" className="flex items-center gap-2 text-base font-semibold text-ink-100">
              <BookOpen className="h-4 w-4 text-accent" aria-hidden /> Aulas
            </h2>
            <ul className="mt-3 divide-y divide-ink-800">
              {COURSE_MODULES_ORDER.map((l) => {
                const lp = p.lessonProgress[l.id];
                const stagesPct = lp ? Math.round((lp.stagesDone.length / LESSON_STAGES.length) * 100) : 0;
                return (
                  <li key={l.id} className="flex items-center gap-3 py-3">
                    {lp?.completed ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" aria-label="Concluída" />
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-ink-600" aria-label={lp ? 'Em andamento' : 'Não iniciada'} />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-100">{LESSON_STRUCTURES[l.id]?.friendlyTitle || l.title}</p>
                      <p className="text-xs text-ink-400">
                        {lp?.completed
                          ? `Concluída · melhor resultado ${lp.bestScore} de ${lp.total}`
                          : lp
                          ? lp.attempts
                            ? `Verificação: ${lp.lastScore} de ${lp.total} (ainda não aprovada)`
                            : `${stagesPct}% das etapas vistas`
                          : 'Não iniciada'}
                      </p>
                    </div>
                    <button onClick={() => navigateTo('quiz', l.id)} className="btn-ghost px-2.5 py-1.5 text-sm">
                      {lp?.completed ? 'Revisar' : lp ? 'Continuar' : 'Começar'}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Habilidades */}
          <section className="card p-5" aria-labelledby="pg-hab">
            <h2 id="pg-hab" className="flex items-center gap-2 text-base font-semibold text-ink-100">
              <Target className="h-4 w-4 text-accent" aria-hidden /> Habilidades praticadas
            </h2>
            {skills.length === 0 ? (
              <p className="mt-2 text-sm text-ink-400">As habilidades aparecem aqui depois das primeiras questões respondidas.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {[...skills].sort((a, b) => b.total - a.total).map((s) => (
                  <li key={s.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-200">{s.label}</span>
                      <span className="font-mono text-ink-400">
                        {s.correct}/{s.total}
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <ProgressBar value={s.correct} max={s.total} label={s.label} tone={s.ratio >= 0.6 ? 'success' : 'accent'} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="min-w-0 space-y-6 lg:col-span-2">
          {/* Revisar */}
          <section className="card p-5" aria-labelledby="pg-rev">
            <h2 id="pg-rev" className="text-base font-semibold text-ink-100">
              Para revisar
            </h2>
            {toReview.length === 0 ? (
              <p className="mt-2 text-sm text-ink-400">
                {skills.length ? 'Nenhuma habilidade abaixo de 60% de acerto. Continue praticando!' : 'Ainda não há dados suficientes.'}
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {toReview.map((s) => {
                  const topic = topicForSkill(s.id);
                  return (
                    <li key={s.id} className="rounded-lg border border-ink-800 bg-ink-850 p-3">
                      <p className="text-sm font-medium text-ink-100">{s.label}</p>
                      <p className="text-xs text-ink-400">
                        {Math.round(s.ratio * 100)}% de acerto em {s.total} questões
                      </p>
                      {topic && (
                        <button onClick={() => navigateTo('practice', topic.id)} className="btn-ghost mt-1 px-0 text-sm">
                          Praticar {topic.title.toLowerCase()} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Laboratório 3D */}
          <section className="card p-5" aria-labelledby="pg-lab">
            <h2 id="pg-lab" className="flex items-center gap-2 text-base font-semibold text-ink-100">
              <Box className="h-4 w-4 text-accent" aria-hidden /> Laboratório 3D
            </h2>
            <ul className="mt-3 space-y-3">
              {labRows.map((r) => {
                const done = r.stages.filter((st) => p.labMissionStages[r.id]?.includes(st)).length;
                return (
                  <li key={r.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-200">{r.label}</span>
                      <span className="text-ink-400">
                        {done}/{r.stages.length} etapas
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <ProgressBar value={done} max={r.stages.length} label={`Etapas: ${r.label}`} tone="success" />
                    </div>
                    {done < r.stages.length && (
                      <button onClick={() => navigateTo('lab', r.id)} className="btn-ghost mt-1 px-0 text-sm">
                        {done ? 'Continuar' : 'Começar'} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Ferramentas */}
          <section className="card p-5" aria-labelledby="pg-fer">
            <h2 id="pg-fer" className="flex items-center gap-2 text-base font-semibold text-ink-100">
              <Wrench className="h-4 w-4 text-accent" aria-hidden /> Ferramentas estudadas
            </h2>
            <p className="mt-2 text-sm text-ink-300">
              {p.masteredTools.length} de {MECHANICAL_TOOLS_CATALOG.length}
            </p>
            <div className="mt-1.5">
              <ProgressBar value={p.masteredTools.length} max={MECHANICAL_TOOLS_CATALOG.length} label="Ferramentas estudadas" tone="success" />
            </div>
          </section>

          {/* Histórico */}
          {sessions.length > 0 && (
            <section className="card p-5" aria-labelledby="pg-hist">
              <h2 id="pg-hist" className="flex items-center gap-2 text-base font-semibold text-ink-100">
                <Clock className="h-4 w-4 text-accent" aria-hidden /> Últimas sessões de prática
              </h2>
              <ul className="mt-3 divide-y divide-ink-800">
                {[...sessions]
                  .reverse()
                  .slice(0, 5)
                  .map((s) => (
                    <li key={s.id} className="flex items-center justify-between py-2 text-sm">
                      <span className="text-ink-200">
                        {s.topicId === 'simulado' ? 'Simulado misto' : PRACTICE_TOPICS.find((t) => t.id === s.topicId)?.title || s.topicId}
                        <span className="block text-xs text-ink-500">{dateFmt.format(s.completedAt)}</span>
                      </span>
                      <span className="font-mono text-ink-300">
                        {s.correct}/{s.total}
                      </span>
                    </li>
                  ))}
              </ul>
            </section>
          )}

          <DataPanel />

          {unlocked.length > 0 && (
            <section className="card p-5" aria-labelledby="pg-conq">
              <h2 id="pg-conq" className="flex items-center gap-2 text-base font-semibold text-ink-100">
                <Award className="h-4 w-4 text-accent" aria-hidden /> Conquistas
              </h2>
              <ul className="mt-2 space-y-1.5">
                {unlocked.map((a) => (
                  <li key={a.id} className="text-sm text-ink-300">
                    <span className="font-medium text-ink-200">{a.title}</span> — {a.description}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </Page>
  );
};
