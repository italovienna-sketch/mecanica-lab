import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Box,
  CheckCircle2,
  ChevronDown,
  Clock,
  RotateCcw,
  ShieldAlert,
  Target,
  Wrench,
  Lightbulb
} from 'lucide-react';
import { useGameState, LESSON_PASS_RATIO } from '../../context/GameStateContext';
import { COURSE_MODULES_ORDER, LESSONS_BY_ID, MachineLesson } from '../../data/lessonsData';
import { OrderTaskView } from '../practice/OrderTaskView';
import { LESSON_STAGES, LESSON_STRUCTURES, LessonStageId, getLessonCheckQuestions } from '../../data/lessonStructure';
import { MACHINES_CATALOG } from '../../data/mechanicalMachines';
import { PRACTICE_TOPICS } from '../../data/practiceBank';
import { LevelBadge, LoadingState, Page, ErrorState } from '../ui';
import { PumpIsoFigure } from '../illustrations/PumpIsoFigure';
import { QuestionRunner, AnswerResult } from '../practice/QuestionRunner';

const AnatomyMechanicalExplorer = lazy(() =>
  import('../iso/AnatomyMechanicalExplorer').then((m) => ({ default: m.AnatomyMechanicalExplorer }))
);

export const QuizEngine: React.FC = () => {
  const { activeParam, navigateTo } = useGameState();
  const lesson = activeParam ? LESSONS_BY_ID[activeParam] : undefined;

  if (!lesson) {
    return (
      <Page width="reading">
        <ErrorState
          title="Aula não encontrada"
          message="Esta aula não existe ou mudou de endereço. Escolha uma aula na lista de cursos."
          action={
            <button className="btn-primary" onClick={() => navigateTo('courses')}>
              Ver cursos
            </button>
          }
        />
      </Page>
    );
  }
  // Remonta a aula ao trocar de identificador (zera etapas internas com segurança).
  return <LessonView key={lesson.id} lesson={lesson} />;
};

const LessonView: React.FC<{ lesson: MachineLesson }> = ({ lesson }) => {
  const { navigateTo, playerProfile, recordLessonStage, setLastActivity } = useGameState();
  const structure = LESSON_STRUCTURES[lesson.id];
  const progress = playerProfile.lessonProgress[lesson.id];
  const lessonNumber = COURSE_MODULES_ORDER.findIndex((l) => l.id === lesson.id) + 1;

  const [stage, setStage] = useState<LessonStageId>(() => {
    if (!progress || progress.completed) return 'objetivos';
    return LESSON_STAGES.find((s) => !progress.stagesDone.includes(s.id))?.id || 'objetivos';
  });

  useEffect(() => {
    recordLessonStage(lesson.id, stage);
    setLastActivity('quiz', structure?.friendlyTitle || lesson.title, lesson.id);
    document.getElementById('conteudo')?.scrollTo({ top: 0 });
  }, [stage, lesson.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const stageIdx = LESSON_STAGES.findIndex((s) => s.id === stage);
  const goNext = () => setStage(LESSON_STAGES[Math.min(LESSON_STAGES.length - 1, stageIdx + 1)].id);
  const title = structure?.friendlyTitle || lesson.title;

  return (
    <Page width="reading">
      <button onClick={() => navigateTo('courses')} className="btn-ghost -ml-3 mb-3">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Trilhas
      </button>

      <header className="mb-5">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-ink-400">
          <LevelBadge level={lesson.level} />
          <span>Aula {lessonNumber} de {COURSE_MODULES_ORDER.length}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden /> {lesson.estimatedTime}
          </span>
          {progress?.completed && (
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" aria-hidden /> Concluída
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-100 sm:text-3xl">{title}</h1>
      </header>

      {/* Etapas da aula (A–F): seis colunas iguais, sem rolagem lateral */}
      <nav aria-label="Etapas da aula" className="mb-6">
        <ol className="grid grid-cols-6 gap-1.5">
          {LESSON_STAGES.map((s, i) => {
            const done = progress?.stagesDone.includes(s.id) && s.id !== stage;
            const active = s.id === stage;
            return (
              <li key={s.id} className="min-w-0">
                <button
                  onClick={() => setStage(s.id)}
                  aria-current={active ? 'step' : undefined}
                  className="group flex w-full min-w-0 flex-col gap-1.5 rounded-md pb-1 pt-1 text-left"
                >
                  <span
                    className={`h-1.5 w-full rounded-full transition-colors ${
                      active ? 'bg-accent' : done ? 'bg-emerald-500' : 'bg-ink-800 group-hover:bg-ink-700'
                    }`}
                    aria-hidden
                  />
                  <span
                    aria-hidden
                    className={`flex min-w-0 items-center gap-1 text-xs ${
                      active ? 'font-semibold text-ink-100' : done ? 'text-ink-300' : 'text-ink-500 group-hover:text-ink-300'
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden />
                    ) : (
                      <span className="font-mono">{s.letter}</span>
                    )}
                    <span className="hidden truncate md:inline">{s.short}</span>
                  </span>
                  <span className="sr-only">{`${s.label}, etapa ${i + 1} de ${LESSON_STAGES.length}${done ? ', concluída' : ''}`}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <p className="mt-1 text-sm text-ink-400 md:hidden" aria-hidden>
          Etapa {stageIdx + 1} de {LESSON_STAGES.length} · <span className="font-medium text-ink-200">{LESSON_STAGES[stageIdx].label}</span>
        </p>
      </nav>

      {stage === 'objetivos' && <ObjectivesStage lesson={lesson} onNext={goNext} />}
      {stage === 'entender' && <UnderstandStage lesson={lesson} onNext={goNext} />}
      {stage === 'ver' && <SeeStage lesson={lesson} onNext={goNext} />}
      {stage === 'praticar' && <PracticeStage lesson={lesson} onNext={goNext} />}
      {stage === 'verificar' && <CheckStage lesson={lesson} onNext={goNext} onReview={() => setStage('entender')} />}
      {stage === 'proximo' && <NextStage lesson={lesson} onRetry={() => setStage('verificar')} />}
    </Page>
  );
};

const StageFooter: React.FC<{ label: string; onNext: () => void; secondary?: React.ReactNode }> = ({ label, onNext, secondary }) => (
  <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-between">
    <div>{secondary}</div>
    <button onClick={onNext} className="btn-primary w-full sm:w-auto">
      {label} <ArrowRight className="h-4 w-4" aria-hidden />
    </button>
  </div>
);

/* A. O que você vai aprender */
const ObjectivesStage: React.FC<{ lesson: MachineLesson; onNext: () => void }> = ({ lesson, onNext }) => {
  const s = LESSON_STRUCTURES[lesson.id];
  return (
    <section aria-labelledby="st-a">
      <h2 id="st-a" className="sr-only">O que você vai aprender</h2>
      {s && (
        <div className="card mb-4 border-l-4 border-l-accent p-5">
          <p className="eyebrow mb-1.5">Situação de trabalho</p>
          <p className="text-base leading-relaxed text-ink-200">{s.situation}</p>
        </div>
      )}
      <div className="card p-5">
        <h3 className="flex items-center gap-2 text-base font-semibold text-ink-100">
          <Target className="h-5 w-5 text-accent" aria-hidden /> Ao final desta aula, você vai conseguir:
        </h3>
        <ul className="mt-3 space-y-2.5">
          {(s?.objectives || [lesson.learningObjective]).map((o) => (
            <li key={o} className="flex gap-2.5 text-base text-ink-200">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-ink-500" aria-hidden />
              {o}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-ink-400">Tempo estimado: {lesson.estimatedTime}. Seu progresso fica salvo a cada etapa.</p>
      </div>
      {lesson.level === 'Profissional' && (
        <p className="mt-3 text-sm text-ink-400">
          “Prática profissional” indica conteúdo avançado de estudo. Não é habilitação, certificação ou curso oficial.
        </p>
      )}
      <StageFooter label="Começar a aula" onNext={onNext} />
    </section>
  );
};

/* B. Entender — um conceito por vez, detalhes em "Saiba mais" */
const UnderstandStage: React.FC<{ lesson: MachineLesson; onNext: () => void }> = ({ lesson, onNext }) => {
  const [i, setI] = useState(0);
  const [more, setMore] = useState(false);
  const [glossary, setGlossary] = useState(false);
  const topic = lesson.topics[i];
  const isLast = i === lesson.topics.length - 1;
  useEffect(() => setMore(false), [i]);
  const cleanTitle = topic.title.replace(/^\d+\.\s*/, '');

  return (
    <section aria-labelledby="st-b">
      <div className="mb-3 flex items-center justify-between text-sm text-ink-400">
        <span>
          Conceito {i + 1} de {lesson.topics.length}
        </span>
      </div>
      <article className="card p-5 sm:p-6">
        <h2 id="st-b" className="text-xl font-semibold leading-snug text-ink-100">
          {cleanTitle}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-ink-200">{topic.conceptSummary}</p>
        <p className="mt-3 text-base leading-relaxed text-ink-300">
          {topic.whatIsIt} {topic.whatDoesItDo}
        </p>

        <div className="mt-4 flex gap-3 rounded-xl border border-emerald-800/60 bg-emerald-950/30 p-4">
          <Lightbulb className="h-5 w-5 shrink-0 text-emerald-300" aria-hidden />
          <p className="text-base font-medium text-emerald-100">
            <span className="sr-only">Para lembrar: </span>
            {topic.keyCheck}
          </p>
        </div>

        <div className="mt-3 flex gap-3 rounded-xl border border-amber-800/50 bg-amber-950/20 p-4">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-300" aria-hidden />
          <p className="text-sm leading-relaxed text-amber-100">
            <span className="font-semibold">Segurança: </span>
            {topic.safetyPrerequisite}
          </p>
        </div>

        <button
          onClick={() => setMore((v) => !v)}
          aria-expanded={more}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-text hover:underline"
        >
          Saiba mais sobre este conceito
          <ChevronDown className={`h-4 w-4 transition-transform ${more ? 'rotate-180' : ''}`} aria-hidden />
        </button>
        {more && (
          <dl className="mt-3 space-y-3 text-sm leading-relaxed">
            <div>
              <dt className="font-semibold text-ink-200">Onde fica</dt>
              <dd className="text-ink-300">{topic.whereIsItLocated}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink-200">Por que é necessário</dt>
              <dd className="text-ink-300">{topic.whyIsItNeeded}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink-200">Como se relaciona com outras peças</dt>
              <dd className="text-ink-300">{topic.interactionWithOthers}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink-200">Como reconhecer</dt>
              <dd className="text-ink-300">{topic.howToIdentify}</dd>
            </div>
          </dl>
        )}
      </article>

      <div className="mt-4">
        <button
          onClick={() => setGlossary((v) => !v)}
          aria-expanded={glossary}
          className="inline-flex items-center gap-1 text-sm font-medium text-ink-300 hover:text-ink-100"
        >
          <BookOpen className="h-4 w-4" aria-hidden /> Termos técnicos desta aula ({lesson.glossary.length})
          <ChevronDown className={`h-4 w-4 transition-transform ${glossary ? 'rotate-180' : ''}`} aria-hidden />
        </button>
        {glossary && (
          <dl className="card mt-2 divide-y divide-ink-800">
            {lesson.glossary.map((g) => (
              <div key={g.term} className="p-3.5">
                <dt className="text-sm font-semibold text-ink-100">{g.term}</dt>
                <dd className="text-sm text-ink-300">{g.definition}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <StageFooter
        label={isLast ? 'Ver na prática' : 'Próximo conceito'}
        onNext={isLast ? onNext : () => setI(i + 1)}
        secondary={
          i > 0 && (
            <button onClick={() => setI(i - 1)} className="btn-ghost w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4" aria-hidden /> Conceito anterior
            </button>
          )
        }
      />
    </section>
  );
};

/* C. Ver na prática — demonstração passo a passo ligada à prancha e ao laboratório 3D */
const SeeStage: React.FC<{ lesson: MachineLesson; onNext: () => void }> = ({ lesson, onNext }) => {
  const { navigateTo } = useGameState();
  const [i, setI] = useState(0);
  const steps = lesson.demonstrationSteps;
  const step = steps[i];
  const partId = LESSON_STRUCTURES[lesson.id]?.demoPartIds[i] ?? null;
  const machine = MACHINES_CATALOG[lesson.machineId];
  const [selectedPart, setSelectedPart] = useState(machine?.parts[0] ?? null);
  const [anatomyStep, setAnatomyStep] = useState(0);

  return (
    <section aria-labelledby="st-c">
      <h2 id="st-c" className="sr-only">Ver na prática</h2>
      <div className="card overflow-hidden">
        {lesson.machineId === 'centrifugal-pump' ? (
          <div className="border-b border-ink-800 bg-paper">
            <PumpIsoFigure
              label={`Prancha isométrica da bomba centrífuga. Destaque: ${step.visualFocus}`}
              exploded={0.55}
              highlightPartId={partId}
              showLabels
            />
          </div>
        ) : (
          machine &&
          selectedPart && (
            <div className="border-b border-ink-800">
              <Suspense fallback={<LoadingState label="Carregando ilustração…" />}>
                <AnatomyMechanicalExplorer
                  machine={machine}
                  selectedPart={selectedPart}
                  onSelectPart={(p) => p && setSelectedPart(p)}
                  currentStepIdx={anatomyStep}
                  onStepChange={setAnatomyStep}
                  onSwitchTo3D={() => navigateTo('lab', lesson.machineId)}
                />
              </Suspense>
            </div>
          )
        )}
        <div className="p-5 sm:p-6">
          <p className="text-sm text-ink-400">
            Etapa {i + 1} de {steps.length}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-ink-100">{step.title}</h3>
          <p className="mt-2 text-base leading-relaxed text-ink-200">{step.narration}</p>
          <p className="mt-3 rounded-lg border border-ink-800 bg-ink-850 px-3.5 py-2.5 text-sm text-ink-200">
            <span className="font-semibold">Por que isso importa: </span>
            {step.keyTakeaway}
          </p>
          <div className="mt-4 flex items-center justify-between gap-2">
            <button onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} className="btn-ghost">
              <ArrowLeft className="h-4 w-4" aria-hidden /> Anterior
            </button>
            <div className="flex gap-1.5" aria-hidden>
              {steps.map((_, k) => (
                <span key={k} className={`h-2 w-2 rounded-full ${k === i ? 'bg-accent' : 'bg-ink-700'}`} />
              ))}
            </div>
            <button onClick={() => setI(Math.min(steps.length - 1, i + 1))} disabled={i === steps.length - 1} className="btn-ghost">
              Próxima <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
      <StageFooter
        label="Praticar"
        onNext={onNext}
        secondary={
          <button onClick={() => navigateTo('lab', lesson.machineId)} className="btn-secondary w-full sm:w-auto">
            <Box className="h-4 w-4" aria-hidden /> Abrir no laboratório 3D
          </button>
        }
      />
    </section>
  );
};

/* D. Praticar — tarefa de sequência (tocar nas etapas na ordem certa) */
const PracticeStage: React.FC<{ lesson: MachineLesson; onNext: () => void }> = ({ lesson, onNext }) => {
  const { navigateTo, completeTask } = useGameState();
  const task = LESSON_STRUCTURES[lesson.id]?.practice;
  return (
    <section aria-labelledby="st-d">
      <h2 id="st-d" className="sr-only">Praticar</h2>
      {task && <OrderTaskView task={task} onSolved={() => completeTask(`order-${lesson.id}`, 'Sequência correta na aula', 30)} />}
      <div className="card mt-4 p-5">
        <p className="eyebrow mb-1">Prática na bancada virtual (opcional)</p>
        <p className="text-base text-ink-200">{lesson.practiceTaskDescription}</p>
        <button
          onClick={() => navigateTo(lesson.practiceTargetScreen, lesson.practiceTargetParam)}
          className="btn-secondary mt-3"
        >
          {lesson.practiceTargetScreen === 'lab' ? <Box className="h-4 w-4" aria-hidden /> : <Wrench className="h-4 w-4" aria-hidden />}
          {lesson.practiceTargetScreen === 'lab' ? 'Abrir o laboratório 3D' : 'Abrir a ferramenta'}
        </button>
      </div>
      <StageFooter label="Verificar o que aprendi" onNext={onNext} />
    </section>
  );
};

/* E. Verificar — questões uma por vez, aprovação a partir de 60% */
const CheckStage: React.FC<{ lesson: MachineLesson; onNext: () => void; onReview: () => void }> = ({ lesson, onNext, onReview }) => {
  const { recordLessonResult } = useGameState();
  const questions = useMemo(() => getLessonCheckQuestions(lesson.id), [lesson.id]);
  const [phase, setPhase] = useState<'intro' | 'running' | 'done'>('intro');
  const [result, setResult] = useState<{ score: number; total: number; passed: boolean } | null>(null);
  const [seed, setSeed] = useState(() => Date.now());
  const minCorrect = Math.ceil(questions.length * LESSON_PASS_RATIO);

  const finish = (answers: AnswerResult[]) => {
    const score = answers.filter((a) => a.correct).length;
    const { passed } = recordLessonResult(
      lesson.id,
      score,
      answers.length,
      answers.map((a) => ({ skillId: a.skillId, correct: a.correct }))
    );
    setResult({ score, total: answers.length, passed });
    setPhase('done');
  };

  if (phase === 'running') {
    return <QuestionRunner questions={questions} contextLabel="Verificação da aula" seed={seed} onFinish={finish} onExit={() => setPhase('intro')} />;
  }

  if (phase === 'done' && result) {
    return (
      <section className="card p-6 text-center" role="status">
        <p className="text-4xl font-bold text-ink-100">
          {result.score} <span className="text-2xl font-semibold text-ink-400">de {result.total}</span>
        </p>
        {result.passed ? (
          <>
            <p className="mt-3 text-lg font-semibold text-emerald-300">Aula concluída!</p>
            <p className="mt-1 text-base text-ink-300">Você mostrou que domina os objetivos desta aula.</p>
          </>
        ) : (
          <>
            <p className="mt-3 text-lg font-semibold text-amber-200">Ainda não foi desta vez — e está tudo bem.</p>
            <p className="mt-1 text-base text-ink-300">
              Para concluir, são necessários {minCorrect} acertos. Revise os conceitos e tente de novo quando quiser.
            </p>
          </>
        )}
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          {result.passed ? (
            <button onClick={onNext} className="btn-primary">
              Ver próximo passo <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          ) : (
            <button onClick={onReview} className="btn-primary">
              <BookOpen className="h-4 w-4" aria-hidden /> Revisar conceitos
            </button>
          )}
          <button
            onClick={() => {
              setSeed(Date.now());
              setPhase('running');
            }}
            className="btn-secondary"
          >
            <RotateCcw className="h-4 w-4" aria-hidden /> Refazer verificação
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="card p-5 sm:p-6" aria-labelledby="st-e">
      <h2 id="st-e" className="text-lg font-semibold text-ink-100">
        Verifique o que você aprendeu
      </h2>
      <p className="mt-2 text-base text-ink-300">
        São {questions.length} questões, uma por vez. Para concluir a aula, acerte pelo menos {minCorrect}. Você pode tentar
        quantas vezes quiser.
      </p>
      <button onClick={() => setPhase('running')} className="btn-primary mt-5 w-full sm:w-auto">
        Começar verificação
      </button>
    </section>
  );
};

/* F. Próximo passo — uma recomendação clara */
const NextStage: React.FC<{ lesson: MachineLesson; onRetry: () => void }> = ({ lesson, onRetry }) => {
  const { navigateTo, playerProfile } = useGameState();
  const completed = playerProfile.lessonProgress[lesson.id]?.completed;
  const idx = COURSE_MODULES_ORDER.findIndex((l) => l.id === lesson.id);
  const nextLesson = COURSE_MODULES_ORDER[idx + 1];
  const topicId = LESSON_STRUCTURES[lesson.id]?.practiceTopicId;
  const topic = PRACTICE_TOPICS.find((t) => t.id === topicId);

  return (
    <section className="card p-6" aria-labelledby="st-f">
      <h2 id="st-f" className="text-lg font-semibold text-ink-100">
        Próximo passo
      </h2>
      {!completed ? (
        <>
          <p className="mt-2 text-base text-ink-300">Para concluir esta aula, faça a verificação (etapa E).</p>
          <button onClick={onRetry} className="btn-primary mt-5">
            Ir para a verificação <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </>
      ) : nextLesson ? (
        <>
          <p className="mt-2 text-base text-ink-300">
            Recomendado: <span className="font-semibold text-ink-100">{LESSON_STRUCTURES[nextLesson.id]?.friendlyTitle || nextLesson.title}</span>
          </p>
          <button onClick={() => navigateTo('quiz', nextLesson.id)} className="btn-primary mt-5">
            Começar a próxima aula <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </>
      ) : (
        <>
          <p className="mt-2 text-base text-ink-300">Você concluiu a última aula da trilha. Continue praticando para fixar.</p>
          <button onClick={() => navigateTo('progress')} className="btn-primary mt-5">
            Ver meu progresso
          </button>
        </>
      )}
      {topic && (
        <button onClick={() => navigateTo('practice', topic.id)} className="btn-ghost mt-3 block">
          Ou pratique mais: {topic.title} (5 questões)
        </button>
      )}
    </section>
  );
};
