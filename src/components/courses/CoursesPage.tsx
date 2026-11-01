import React, { useMemo } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Box, CheckCircle2, Circle, ClipboardCheck, ClipboardList, Clock, Cog, PlayCircle, Puzzle, Stethoscope, Target, Wrench } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import {
  LEARNING_PATHS,
  LEARNING_PATHS_BY_ID,
  LearningPath,
  PATH_STATUS_LABEL,
  PathActivity,
  PathStatus,
  activityProgress,
  masteredQuestionIds,
  pathProgress,
  recommendedPath
} from '../../data/learningPaths';
import { Page, PageHeader, ProgressBar } from '../ui';
import { NotQualificationNote, SourcesFooter } from '../safety/SourceBits';
import { PUMP_CATALOG, PUMP_FAMILY_LABEL } from '../../data/pumpCatalog';

const STATUS_STYLE: Record<PathStatus, string> = {
  disponivel: 'border-emerald-700/60 bg-emerald-950/30 text-emerald-200',
  parcial: 'border-ink-600 bg-ink-800 text-ink-200',
  'em-preparacao': 'border-ink-700 bg-ink-850 text-ink-400'
};

const StatusChip: React.FC<{ status: PathStatus }> = ({ status }) => (
  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[status]}`}>{PATH_STATUS_LABEL[status]}</span>
);

export const CoursesPage: React.FC = () => {
  const { activeParam } = useGameState();
  const path = activeParam ? LEARNING_PATHS_BY_ID[activeParam] : undefined;
  return path ? <PathDetail path={path} /> : <PathsOverview />;
};

/* ───────────────────────── Visão geral ───────────────────────── */

const PathsOverview: React.FC = () => {
  const { navigateTo, playerProfile } = useGameState();
  const mastered = useMemo(() => masteredQuestionIds(playerProfile), [playerProfile]);
  const progress = useMemo(() => Object.fromEntries(LEARNING_PATHS.map((p) => [p.id, pathProgress(p, playerProfile, mastered)])), [playerProfile, mastered]);
  const recommended = useMemo(() => recommendedPath(playerProfile), [playerProfile]);
  const completedCount = LEARNING_PATHS.filter((p) => progress[p.id].completed).length;
  const preparingCount = LEARNING_PATHS.filter((p) => p.status === 'em-preparacao').length;

  return (
    <Page>
      <PageHeader
        eyebrow="Trilhas de aprendizagem"
        title="Manutenção mecânica industrial"
        description="13 trilhas, da segurança na oficina ao diagnóstico de falhas. Cada uma junta aulas curtas, atividades práticas e uma verificação."
      />

      {recommended && (
        <section aria-labelledby="rec-title" className="card mb-6 border-accent/50 p-5 sm:p-6">
          <p className="eyebrow mb-1">{progress[recommended.id].started ? 'Continue de onde parou' : 'Sugestão para começar'}</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <h2 id="rec-title" className="text-xl font-semibold text-ink-100">
                Trilha {recommended.number} · {recommended.title}
              </h2>
              <p className="mt-1 text-sm text-ink-300">{recommended.summary}</p>
              <div className="mt-3 max-w-sm">
                <ProgressBar value={progress[recommended.id].done} max={progress[recommended.id].total} label="Progresso da trilha sugerida" tone="success" />
                <p className="mt-1 text-xs text-ink-400">
                  {progress[recommended.id].done} de {progress[recommended.id].total} requisitos concluídos
                </p>
              </div>
            </div>
            <button className="btn-primary shrink-0" onClick={() => navigateTo('courses', recommended.id)}>
              Abrir trilha <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </section>
      )}

      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-ink-100">Todas as trilhas</h2>
        <p className="text-sm text-ink-400">
          {completedCount} de {LEARNING_PATHS.length} concluídas · {preparingCount} ainda em preparação
        </p>
      </div>

      <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {LEARNING_PATHS.map((p) => {
          const pr = progress[p.id];
          return (
            <li key={p.id}>
              <button
                onClick={() => navigateTo('courses', p.id)}
                className={`card flex h-full w-full flex-col gap-3 p-4 text-left transition-colors hover:border-ink-500 ${p.status === 'em-preparacao' ? 'border-dashed' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-mono text-sm font-semibold ${
                      pr.completed ? 'border-emerald-600 text-emerald-300' : 'border-ink-700 text-ink-200'
                    }`}
                    aria-hidden
                  >
                    {pr.completed ? <CheckCircle2 className="h-5 w-5" /> : p.number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold leading-snug text-ink-100">{p.title}</span>
                    <span className="mt-1.5 block">
                      <StatusChip status={p.status} />
                    </span>
                  </span>
                </div>
                <span className="line-clamp-2 text-sm text-ink-400">{p.summary}</span>
                <span className="mt-auto block">
                  {pr.total > 0 ? (
                    <>
                      <ProgressBar value={pr.done} max={pr.total} label={`Progresso da trilha ${p.number}`} tone="success" />
                      <span className="mt-1 block text-xs text-ink-500">
                        {pr.completed ? 'Concluída' : `${pr.done} de ${pr.total} requisitos`}
                      </span>
                    </>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-ink-500">
                      <Clock className="h-3.5 w-3.5" aria-hidden /> Conteúdo em preparação
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <p className="mt-6 text-sm text-ink-500">
        Organização própria deste projeto, inspirada na progressão comum de cursos técnicos de mecânica. Não é material oficial de nenhuma instituição e não emite
        certificado.
      </p>
    </Page>
  );
};

/* ───────────────────────── Detalhe da trilha ───────────────────────── */

const ACTIVITY_ICON: Record<PathActivity['kind'], React.ReactNode> = {
  lesson: <BookOpen className="h-4 w-4" aria-hidden />,
  practice: <Target className="h-4 w-4" aria-hidden />,
  lab: <Box className="h-4 w-4" aria-hidden />,
  tasks: <Wrench className="h-4 w-4" aria-hidden />,
  tools: <Wrench className="h-4 w-4" aria-hidden />,
  micro: <PlayCircle className="h-4 w-4" aria-hidden />,
  game: <Puzzle className="h-4 w-4" aria-hidden />,
  diagnosis: <Stethoscope className="h-4 w-4" aria-hidden />,
  components: <Cog className="h-4 w-4" aria-hidden />,
  journey: <ClipboardList className="h-4 w-4" aria-hidden />
};

const PathDetail: React.FC<{ path: LearningPath }> = ({ path }) => {
  const { navigateTo, playerProfile } = useGameState();
  const mastered = useMemo(() => masteredQuestionIds(playerProfile), [playerProfile]);
  const pr = pathProgress(path, playerProfile, mastered);

  const open = (a: PathActivity) => {
    switch (a.kind) {
      case 'lesson':
        return navigateTo('quiz', a.lessonId);
      case 'practice':
        return navigateTo('practice', a.topicId);
      case 'lab':
        return navigateTo('lab', a.machineId);
      case 'tasks':
        return navigateTo(a.screen, a.param);
      case 'tools':
        return navigateTo('tools', a.toolIds.find((t) => !playerProfile.masteredTools.includes(t)) || a.toolIds[0]);
      case 'micro':
        return navigateTo('micro', a.microIds.find((id) => playerProfile.microLessons[id]?.completedAt === undefined) || a.microIds[0]);
      case 'game':
        return navigateTo('games', a.gameId);
      case 'diagnosis':
        return navigateTo('diagnosis');
      case 'components':
        return navigateTo('machine');
      case 'journey':
        return navigateTo('missions');
    }
  };

  const activityRow = (a: PathActivity) => {
    const p = activityProgress(a, playerProfile, mastered);
    const done = p.done >= p.total;
    return (
      <li key={a.label} className="flex flex-col gap-3 rounded-xl border border-ink-800 bg-ink-850 p-4 sm:flex-row sm:items-center">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${done ? 'bg-emerald-950/60 text-emerald-300' : 'bg-ink-800 text-ink-300'}`}>
          {done ? <CheckCircle2 className="h-4 w-4" aria-label="Concluída" /> : ACTIVITY_ICON[a.kind]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink-100">{a.label}</p>
          {p.total > 1 && (
            <div className="mt-2 flex max-w-xs items-center gap-2">
              <ProgressBar value={p.done} max={p.total} label={a.label} tone="success" />
              <span className="shrink-0 text-xs text-ink-400">
                {p.done}/{p.total}
              </span>
            </div>
          )}
        </div>
        <button className={done ? 'btn-ghost shrink-0' : 'btn-secondary shrink-0'} onClick={() => open(a)}>
          {done ? 'Revisar' : p.done > 0 ? 'Continuar' : 'Começar'} <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </li>
    );
  };

  const availableLessons = path.lessons.filter((l) => l.lessonId || l.microId);

  return (
    <Page width="reading">
      <button onClick={() => navigateTo('courses')} className="btn-ghost -ml-3 mb-4">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Todas as trilhas
      </button>
      <PageHeader eyebrow={`Trilha ${path.number} de ${LEARNING_PATHS.length}`} title={path.title} description={path.summary} />
      <div className="-mt-3 mb-6 flex flex-wrap items-center gap-3">
        <StatusChip status={path.status} />
        {pr.total > 0 && (
          <span className="text-sm text-ink-400">
            {pr.completed ? 'Trilha concluída' : `${pr.done} de ${pr.total} requisitos concluídos`}
          </span>
        )}
      </div>

      {path.prerequisites.length > 0 && (
        <section className="mb-6" aria-labelledby="prereq-title">
          <h2 id="prereq-title" className="text-sm font-semibold text-ink-300">
            Recomendado fazer antes
          </h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {path.prerequisites.map((id) => {
              const pre = LEARNING_PATHS_BY_ID[id];
              const done = pathProgress(pre, playerProfile, mastered).completed;
              return (
                <li key={id}>
                  <button onClick={() => navigateTo('courses', id)} className="inline-flex items-center gap-1.5 rounded-lg border border-ink-700 px-3 py-1.5 text-sm text-ink-200 hover:border-ink-500">
                    {done ? <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-label="Concluída" /> : <Circle className="h-4 w-4 text-ink-500" aria-hidden />}
                    {pre.number}. {pre.title}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-1.5 text-xs text-ink-500">É só uma recomendação: você pode abrir esta trilha a qualquer momento.</p>
        </section>
      )}

      <section className="card mb-6 p-5" aria-labelledby="obj-title">
        <h2 id="obj-title" className="text-base font-semibold text-ink-100">
          O que você vai aprender
        </h2>
        <ul className="mt-3 space-y-2">
          {path.objectives.map((o) => (
            <li key={o} className="flex gap-2 text-sm text-ink-300">
              <Target className="mt-0.5 h-4 w-4 shrink-0 text-ink-500" aria-hidden /> {o}
            </li>
          ))}
        </ul>
      </section>

      {path.lessons.length > 0 && (
        <section className="mb-6" aria-labelledby="lessons-title">
          <h2 id="lessons-title" className="mb-3 text-base font-semibold text-ink-100">
            Aulas
          </h2>
          <ul className="space-y-2">
            {availableLessons.map((l) =>
              activityRow(l.microId ? { kind: 'micro', microIds: [l.microId], label: l.title } : { kind: 'lesson', lessonId: l.lessonId!, label: l.title })
            )}
            {path.lessons
              .filter((l) => !l.lessonId && !l.microId)
              .map((l) => (
                <li key={l.title} className="flex items-center gap-3 rounded-xl border border-dashed border-ink-800 p-4 text-sm text-ink-500">
                  <Clock className="h-4 w-4 shrink-0" aria-hidden /> {l.title} <span className="ml-auto text-xs">em preparação</span>
                </li>
              ))}
          </ul>
        </section>
      )}

      {path.activities.length > 0 && (
        <section className="mb-6" aria-labelledby="act-title">
          <h2 id="act-title" className="mb-3 text-base font-semibold text-ink-100">
            Atividades práticas
          </h2>
          <ul className="space-y-2">
            {path.activities.map((a) => activityRow(a))}
          </ul>
        </section>
      )}

      {path.check && (
        <section className="mb-6" aria-labelledby="check-title">
          <h2 id="check-title" className="mb-3 text-base font-semibold text-ink-100">
            Verificação
          </h2>
          <ul>
            {activityRow(path.check)}
          </ul>
        </section>
      )}

      {path.id === 'bombas' && <PumpCatalog />}

      <section className={`mb-6 rounded-xl border p-5 ${pr.completed ? 'border-emerald-700/60 bg-emerald-950/20' : 'border-ink-700 bg-ink-900'}`} aria-labelledby="done-title">
        <h2 id="done-title" className="flex items-center gap-2 text-base font-semibold text-ink-100">
          <ClipboardCheck className="h-5 w-5 text-ink-400" aria-hidden /> Para concluir a trilha
        </h2>
        <p className="mt-1.5 text-sm text-ink-300">{path.completionText}</p>
        {pr.total > 0 && (
          <div className="mt-3 max-w-sm">
            <ProgressBar value={pr.done} max={pr.total} label="Requisitos da trilha" tone="success" />
          </div>
        )}
        {pr.completed && <p className="mt-2 text-sm font-medium text-emerald-300">Você concluiu todos os requisitos desta trilha.</p>}
      </section>

      {path.planned.length > 0 && (
        <section className="mb-6" aria-labelledby="planned-title">
          <h2 id="planned-title" className="text-sm font-semibold text-ink-300">
            Ainda em preparação nesta trilha
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-500">
            {path.planned.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </section>
      )}

      {path.sources && path.sources.length > 0 && (
        <>
          <SourcesFooter ids={path.sources} className="mb-3" />
          <NotQualificationNote className="mb-6" />
        </>
      )}

      {path.next.length > 0 && (
        <section aria-labelledby="next-title">
          <h2 id="next-title" className="mb-2 text-base font-semibold text-ink-100">
            Próximos passos
          </h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {path.next.map((id) => {
              const n = LEARNING_PATHS_BY_ID[id];
              return (
                <button key={id} className="btn-secondary justify-between sm:justify-center" onClick={() => navigateTo('courses', id)}>
                  Trilha {n.number}: {n.title} <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              );
            })}
          </div>
        </section>
      )}
    </Page>
  );
};

/** Catálogo de tipos de bomba: os que têm 3D abrem o laboratório; os demais são explicação em texto. */
const PumpCatalog: React.FC = () => {
  const { navigateTo } = useGameState();
  return (
    <section className="mb-6" aria-labelledby="pump-catalog-title">
      <h2 id="pump-catalog-title" className="text-base font-semibold text-ink-100">
        Catálogo de bombas
      </h2>
      <p className="mt-1 text-sm text-ink-400">
        Os tipos com laboratório 3D podem ser desmontados no simulador. Os outros, por enquanto, têm só a explicação em texto.
      </p>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {PUMP_CATALOG.map((p) => (
          <li key={p.id} className="card flex flex-col p-4" data-testid={`pump-${p.id}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="font-semibold text-ink-100">{p.name}</h3>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  p.labId ? 'bg-emerald-950/50 text-emerald-300' : 'bg-ink-800 text-ink-300'
                }`}
              >
                {p.labId ? 'Laboratório 3D' : 'Só explicação (sem 3D)'}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-ink-400">{PUMP_FAMILY_LABEL[p.family]}</p>
            <p className="mt-2 text-sm text-ink-300">{p.principle}</p>
            <p className="mt-1.5 text-sm text-ink-400">
              <span className="font-medium text-ink-300">Onde se usa: </span>
              {p.usedFor}
            </p>
            <p className="mt-1.5 text-sm text-ink-400">
              <span className="font-medium text-ink-300">Cuidado: </span>
              {p.care}
            </p>
            {(p.labId || p.microId) && (
              <div className="mt-auto flex flex-wrap gap-2 pt-3">
                {p.labId && (
                  <button className="btn-secondary px-3 py-1.5 text-sm" onClick={() => navigateTo('lab', p.labId)}>
                    <Box className="h-4 w-4" aria-hidden /> Abrir no laboratório 3D
                  </button>
                )}
                {p.microId && (
                  <button className="btn-ghost px-2 py-1.5 text-sm" onClick={() => navigateTo('micro', p.microId)}>
                    <PlayCircle className="h-4 w-4" aria-hidden /> Aula rápida
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};
