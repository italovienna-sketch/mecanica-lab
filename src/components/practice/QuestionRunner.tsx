import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, XCircle, ChevronDown, ArrowRight, X } from 'lucide-react';
import { PracticeQuestion } from '../../data/practiceBank';
import { TechnicalIllustration } from '../illustrations/TechnicalIllustrations';
import { ProgressBar } from '../ui';

export interface AnswerResult {
  questionId: string;
  skillId: string;
  correct: boolean;
  chosenText: string;
}

interface QuestionRunnerProps {
  questions: PracticeQuestion[];
  /** Texto curto exibido acima do contador (ex.: nome do tema). */
  contextLabel: string;
  onFinish: (answers: AnswerResult[]) => void;
  onExit: () => void;
  /** Semente para embaralhar as alternativas de forma estável durante a sessão. */
  seed: number;
}

/** Embaralha as alternativas de forma determinística, para que a correta não fique sempre na mesma posição. */
function shuffledOrder(length: number, seed: number): number[] {
  const order = Array.from({ length }, (_, i) => i);
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  for (let i = length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export const QuestionRunner: React.FC<QuestionRunnerProps> = ({ questions, contextLabel, onFinish, onExit, seed }) => {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const answersRef = useRef<AnswerResult[]>([]);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const question = questions[index];
  const order = useMemo(
    () => (question ? shuffledOrder(question.options.length, seed + index * 7919 + question.id.length * 31) : []),
    [question, seed, index]
  );
  const isLast = index === questions.length - 1;
  const chosenOriginal = selected !== null ? order[selected] : null;
  const isCorrect = chosenOriginal === question?.correctIndex;

  useEffect(() => {
    setSelected(null);
    setConfirmed(false);
    setShowMore(false);
    headingRef.current?.focus();
  }, [index]);

  useEffect(() => {
    if (confirmed) feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [confirmed]);

  const confirm = () => {
    if (selected === null || confirmed || !question) return;
    setConfirmed(true);
    answersRef.current = [
      ...answersRef.current.filter((a) => a.questionId !== question.id),
      {
        questionId: question.id,
        skillId: question.skillId,
        correct: order[selected] === question.correctIndex,
        chosenText: question.options[order[selected]]
      }
    ];
  };

  const next = () => {
    if (!confirmed) return;
    if (isLast) onFinish(answersRef.current);
    else setIndex((i) => i + 1);
  };

  // Atalhos: 1–4 escolhe, Enter confirma/continua.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (!confirmed && /^[1-5]$/.test(e.key)) {
        const n = Number(e.key) - 1;
        if (question && n < question.options.length) setSelected(n);
      } else if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement)) {
        if (confirmed) next();
        else confirm();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!question) return null;

  const correctText = question.options[question.correctIndex];
  const chosenFeedback =
    !isCorrect && chosenOriginal !== null ? question.optionFeedback?.[chosenOriginal] : undefined;

  return (
    <div className="mx-auto w-full max-w-reading">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex-1">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-ink-400">{contextLabel}</span>
            <span className="font-semibold text-ink-200" aria-live="polite">
              Questão {index + 1} de {questions.length}
            </span>
          </div>
          <ProgressBar value={index + (confirmed ? 1 : 0)} max={questions.length} label="Progresso da sessão" />
        </div>
        <button onClick={onExit} className="btn-ghost px-2.5" aria-label="Sair da sessão">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="card p-5 sm:p-6">
        {question.scenario && (
          <p className="mb-3 rounded-lg border border-ink-800 bg-ink-850 px-3.5 py-2.5 text-sm text-ink-300">
            <span className="font-semibold text-ink-200">Situação: </span>
            {question.scenario}
          </p>
        )}
        <h2 ref={headingRef} tabIndex={-1} className="text-lg font-semibold leading-snug text-ink-100 outline-none sm:text-xl">
          {question.prompt}
        </h2>

        {question.illustration && (
          <figure className="mt-4 overflow-hidden rounded-lg border border-ink-700">
            <TechnicalIllustration id={question.illustration} alt={question.illustrationAlt || question.prompt} />
          </figure>
        )}

        <div role="radiogroup" aria-label="Alternativas" className="mt-5 space-y-2.5">
          {order.map((originalIdx, displayIdx) => {
            const text = question.options[originalIdx];
            const isSel = selected === displayIdx;
            const isRight = originalIdx === question.correctIndex;
            let style = 'border-ink-700 bg-ink-850 hover:border-ink-500';
            if (confirmed && isRight) style = 'border-emerald-500 bg-emerald-950/40';
            else if (confirmed && isSel) style = 'border-rose-500 bg-rose-950/30';
            else if (confirmed) style = 'border-ink-800 bg-ink-900 opacity-60';
            else if (isSel) style = 'border-accent bg-accent-soft';
            return (
              <button
                key={originalIdx}
                role="radio"
                aria-checked={isSel}
                disabled={confirmed}
                onClick={() => setSelected(displayIdx)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-base text-ink-100 transition-colors ${style}`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-sm font-semibold ${
                    isSel && !confirmed ? 'border-accent bg-accent-strong text-white' : 'border-ink-600 text-ink-300'
                  }`}
                >
                  {LETTERS[displayIdx]}
                </span>
                <span className="flex-1 pt-0.5">{text}</span>
                {confirmed && isRight && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-label="Resposta correta" />}
                {confirmed && isSel && !isRight && <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" aria-label="Sua resposta" />}
              </button>
            );
          })}
        </div>

        {confirmed && (
          <div
            ref={feedbackRef}
            role="status"
            className={`mt-5 rounded-xl border p-4 ${isCorrect ? 'border-emerald-700/60 bg-emerald-950/30' : 'border-amber-700/50 bg-amber-950/20'}`}
          >
            <p className={`text-base font-semibold ${isCorrect ? 'text-emerald-300' : 'text-amber-200'}`}>
              {isCorrect ? 'Correto!' : 'Quase. Vamos entender juntos.'}
            </p>
            {!isCorrect && (
              <p className="mt-1 text-sm text-ink-200">
                Resposta certa: <span className="font-semibold text-ink-100">{correctText}</span>
              </p>
            )}
            <p className="mt-2 text-sm leading-relaxed text-ink-200">{question.why}</p>
            {chosenFeedback && <p className="mt-2 text-sm leading-relaxed text-ink-300">Sobre a sua escolha: {chosenFeedback}</p>}
            {question.commonMistake && (
              <p className="mt-2 text-sm leading-relaxed text-ink-300">
                <span className="font-semibold text-ink-200">Erro comum: </span>
                {question.commonMistake}
              </p>
            )}
            {question.learnMore && (
              <div className="mt-3">
                <button
                  onClick={() => setShowMore((v) => !v)}
                  aria-expanded={showMore}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-accent-text hover:underline"
                >
                  Saiba mais
                  <ChevronDown className={`h-4 w-4 transition-transform ${showMore ? 'rotate-180' : ''}`} aria-hidden />
                </button>
                {showMore && <p className="mt-2 text-sm leading-relaxed text-ink-300">{question.learnMore}</p>}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          {!confirmed ? (
            <button onClick={confirm} disabled={selected === null} className="btn-primary w-full sm:w-auto">
              Confirmar resposta
            </button>
          ) : (
            <button onClick={next} className="btn-primary w-full sm:w-auto">
              {isLast ? 'Ver resultado' : 'Continuar'}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      </div>
      <p className="mt-3 hidden text-center text-xs text-ink-500 sm:block">Dica: use as teclas 1 a 4 para escolher e Enter para confirmar.</p>
    </div>
  );
};
