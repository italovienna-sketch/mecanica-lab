import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Circle, RotateCcw, Shuffle, Sparkles, Target, Wrench, Box } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import {
  PRACTICE_TOPICS,
  PRACTICE_QUESTIONS_BY_TOPIC,
  SKILLS,
  PracticeQuestion,
  PracticeTopic,
  buildPracticeSession
} from '../../data/practiceBank';
import { LESSONS_BY_ID } from '../../data/lessonsData';
import { Page, PageHeader } from '../ui';
import { AnswerResult, QuestionRunner } from './QuestionRunner';

type Phase = 'choose' | 'running' | 'result';

const SIMULADO: PracticeTopic = {
  id: 'simulado',
  title: 'Simulado misto',
  description: 'Questões de todos os temas, para revisar tudo de uma vez.'
};

export const PracticePage: React.FC = () => {
  const { activeParam, navigateTo, playerProfile, recordPracticeSession, setLastActivity } = useGameState();
  const topic: PracticeTopic | null =
    activeParam === 'simulado' ? SIMULADO : PRACTICE_TOPICS.find((t) => t.id === activeParam) || null;

  const [phase, setPhase] = useState<Phase>('choose');
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [answers, setAnswers] = useState<AnswerResult[]>([]);
  const [seed, setSeed] = useState(() => Date.now());

  // Mudou o tema pelo endereço (ou voltar do navegador): recomeça do passo de escolha.
  useEffect(() => {
    setPhase('choose');
    setAnswers([]);
  }, [activeParam]);

  /** Questões que o aluno já acertou em alguma sessão (para priorizar as que ainda não domina). */
  const masteredIds = useMemo(() => {
    const ids = new Set<string>();
    playerProfile.practiceSessions.forEach((s) =>
      (s.questionIds || []).forEach((id) => {
        if (!s.wrongQuestionIds.includes(id)) ids.add(id);
      })
    );
    return ids;
  }, [playerProfile.practiceSessions]);

  const start = (size: number, exclude?: Set<string>) => {
    if (!topic) return;
    const s = Date.now();
    setSeed(s);
    setQuestions(buildPracticeSession({ topicId: topic.id, size, masteredIds, exclude, seed: s }));
    setAnswers([]);
    setPhase('running');
    setLastActivity('practice', `Praticar: ${topic.title}`, topic.id);
  };

  const finish = (result: AnswerResult[]) => {
    if (!topic) return;
    const correct = result.filter((a) => a.correct).length;
    recordPracticeSession(
      {
        topicId: topic.id,
        correct,
        total: result.length,
        questionIds: result.map((a) => a.questionId),
        wrongQuestionIds: result.filter((a) => !a.correct).map((a) => a.questionId)
      },
      result.map((a) => ({ skillId: a.skillId, correct: a.correct }))
    );
    setAnswers(result);
    setPhase('result');
  };

  if (phase === 'running' && topic) {
    return (
      <Page width="reading">
        <QuestionRunner
          questions={questions}
          contextLabel={topic.title}
          seed={seed}
          onFinish={finish}
          onExit={() => setPhase('choose')}
        />
      </Page>
    );
  }

  if (phase === 'result' && topic) {
    return <PracticeResult topic={topic} answers={answers} questions={questions} onMore={() => start(5, new Set(questions.map((q) => q.id)))} />;
  }

  if (topic) {
    const pool = topic.id === 'simulado' ? null : PRACTICE_QUESTIONS_BY_TOPIC[topic.id] || [];
    const mastered = pool ? pool.filter((q) => masteredIds.has(q.id)).length : 0;
    return (
      <Page width="reading">
        <button onClick={() => navigateTo('practice')} className="btn-ghost -ml-3 mb-4">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Escolher outro tema
        </button>
        <PageHeader eyebrow="Passo 2 de 2 · Sessão" title={topic.title} description={topic.description} />
        {pool && (
          <p className="mb-5 text-sm text-ink-400">
            Você já acertou {mastered} de {pool.length} questões deste tema.
          </p>
        )}
        <div className="card p-5 sm:p-6">
          <h2 className="text-base font-semibold text-ink-100">Quantas questões você quer fazer agora?</h2>
          <p className="mt-1 text-sm text-ink-400">Uma questão por vez, com explicação logo depois de cada resposta.</p>
          <button onClick={() => start(topic.id === 'simulado' ? 15 : 5)} className="btn-primary mt-5 w-full py-3.5 text-base" autoFocus>
            <Target className="h-5 w-5" aria-hidden />
            {topic.id === 'simulado' ? 'Começar simulado · 15 questões (≈ 10 min)' : 'Começar · 5 questões (≈ 3 min)'}
          </button>
          {topic.id !== 'simulado' && (
            <button onClick={() => start(10)} className="btn-secondary mt-2.5 w-full">
              Sessão mais longa · 10 questões
            </button>
          )}
        </div>
      </Page>
    );
  }

  // Passo 1: escolher o tema
  const recommended = recommendTopic(playerProfile.skillStats, playerProfile.practiceSessions.map((s) => s.topicId));
  return (
    <Page width="reading">
      <PageHeader
        eyebrow="Passo 1 de 2 · Tema"
        title="Praticar com questões"
        description="Escolha um tema e responda 5 questões curtas. Errar faz parte: cada resposta vem com uma explicação."
      />
      <ul className="space-y-2.5">
        {PRACTICE_TOPICS.map((t) => {
          const pool = PRACTICE_QUESTIONS_BY_TOPIC[t.id] || [];
          const mastered = pool.filter((q) => masteredIds.has(q.id)).length;
          const isRec = t.id === recommended;
          return (
            <li key={t.id}>
              <button
                onClick={() => navigateTo('practice', t.id)}
                className={`card flex w-full items-center gap-4 p-4 text-left transition-colors hover:border-ink-600 ${
                  isRec ? 'border-accent/60' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-semibold text-ink-100">{t.title}</span>
                    {isRec && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent-text">
                        <Sparkles className="h-3 w-3" aria-hidden /> Recomendado
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-ink-400">{t.description}</p>
                </div>
                <span className="shrink-0 text-right text-xs text-ink-400">
                  <span className="block font-mono text-sm text-ink-200">
                    {mastered}/{pool.length}
                  </span>
                  acertadas
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-ink-500" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
      <button onClick={() => navigateTo('practice', 'simulado')} className="btn-ghost mt-4">
        <Shuffle className="h-4 w-4" aria-hidden /> Prefere misturar tudo? Fazer um simulado com todos os temas
      </button>
    </Page>
  );
};

/** Tema recomendado: o de pior desempenho já praticado; senão, o primeiro ainda não praticado. */
function recommendTopic(stats: Record<string, { correct: number; total: number }>, practiced: string[]): string {
  let worst: { id: string; ratio: number } | null = null;
  for (const t of PRACTICE_TOPICS) {
    const skills = new Set((PRACTICE_QUESTIONS_BY_TOPIC[t.id] || []).map((q) => q.skillId));
    let c = 0;
    let n = 0;
    skills.forEach((s) => {
      c += stats[s]?.correct || 0;
      n += stats[s]?.total || 0;
    });
    if (n >= 3) {
      const ratio = c / n;
      if (ratio < 0.7 && (!worst || ratio < worst.ratio)) worst = { id: t.id, ratio };
    }
  }
  if (worst) return worst.id;
  return PRACTICE_TOPICS.find((t) => !practiced.includes(t.id))?.id || PRACTICE_TOPICS[0].id;
}

const PracticeResult: React.FC<{
  topic: PracticeTopic;
  answers: AnswerResult[];
  questions: PracticeQuestion[];
  onMore: () => void;
}> = ({ topic, answers, questions, onMore }) => {
  const { navigateTo } = useGameState();
  const correct = answers.filter((a) => a.correct).length;
  const total = answers.length;
  const ratio = total ? correct / total : 0;
  const reviewSkills = Array.from(new Set(answers.filter((a) => !a.correct).map((a) => a.skillId)));
  const lesson = topic.lessonId ? LESSONS_BY_ID[topic.lessonId] : undefined;

  const message =
    ratio === 1
      ? 'Excelente! Você acertou tudo nesta sessão.'
      : ratio >= 0.6
      ? 'Bom trabalho! Você está no caminho certo.'
      : 'Cada erro mostra o que estudar a seguir. Vale revisar e tentar de novo.';

  // Um único próximo passo recomendado
  let next: { label: string; action: () => void; icon: React.ReactNode } | null = null;
  if (ratio < 0.6 && lesson) {
    next = { label: `Revisar a aula “${lesson.title}”`, action: () => navigateTo('quiz', lesson.id), icon: <BookOpen className="h-4 w-4" /> };
  } else if (topic.machineId) {
    next = { label: 'Ver as peças no laboratório 3D', action: () => navigateTo('lab', topic.machineId), icon: <Box className="h-4 w-4" /> };
  } else if (topic.toolId) {
    next = { label: 'Conhecer a ferramenta na biblioteca', action: () => navigateTo('tools', topic.toolId), icon: <Wrench className="h-4 w-4" /> };
  }

  return (
    <Page width="reading">
      <div className="card p-6 text-center sm:p-8" role="status">
        <p className="eyebrow">{topic.title} · resultado</p>
        <p className="mt-3 text-4xl font-bold text-ink-100">
          {correct} <span className="text-2xl font-semibold text-ink-400">de {total}</span>
        </p>
        <div className="mt-3 flex justify-center gap-1.5" aria-label={`${correct} acertos em ${total} questões`}>
          {answers.map((a) =>
            a.correct ? (
              <CheckCircle2 key={a.questionId} className="h-6 w-6 text-emerald-400" aria-hidden />
            ) : (
              <Circle key={a.questionId} className="h-6 w-6 text-ink-600" aria-hidden />
            )
          )}
        </div>
        <p className="mx-auto mt-4 max-w-sm text-base text-ink-200">{message}</p>

        {reviewSkills.length > 0 && (
          <div className="mt-6 rounded-xl border border-ink-800 bg-ink-850 p-4 text-left">
            <h2 className="text-sm font-semibold text-ink-100">Para revisar</h2>
            <ul className="mt-2 space-y-1.5">
              {reviewSkills.map((s) => {
                const wrongQ = questions.find((q) => q.skillId === s && answers.some((a) => a.questionId === q.id && !a.correct));
                return (
                  <li key={s} className="text-sm text-ink-300">
                    <span className="font-medium text-ink-200">{SKILLS[s] || s}</span>
                    {wrongQ && <span className="block text-ink-400">“{wrongQ.prompt}”</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {next && (
          <button onClick={next.action} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-text hover:underline">
            {next.icon}
            Próximo passo recomendado: {next.label}
          </button>
        )}

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <button onClick={onMore} className="btn-primary">
            <RotateCcw className="h-4 w-4" aria-hidden />
            Praticar mais 5
          </button>
          {lesson ? (
            <button onClick={() => navigateTo('quiz', lesson.id)} className="btn-secondary">
              <BookOpen className="h-4 w-4" aria-hidden /> Voltar para a aula
            </button>
          ) : (
            <button onClick={() => navigateTo('practice')} className="btn-secondary">
              Escolher outro tema
            </button>
          )}
        </div>
      </div>
    </Page>
  );
};
