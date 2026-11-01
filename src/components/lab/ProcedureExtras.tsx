import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, ClipboardCheck, Film, HelpCircle, Lock, ShieldAlert, XCircle } from 'lucide-react';
import { PreWorkItem, StepQuiz } from '../../data/labMission';
import { RegRef } from '../../data/regulatorySources';
import { ClaimBadge, RefLink } from '../safety/SourceBits';

/** Embaralha as alternativas de forma estável (mesma semente → mesma ordem). A correta é sempre o índice 0 nos dados. */
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

/**
 * Liberação para manutenção: o aluno confirma cada item antes da primeira etapa de desmontagem.
 * Cada item diz se é requisito de NR (com o item citado) ou boa prática.
 */
export const PreWorkChecklist: React.FC<{ items: PreWorkItem[]; onRelease: () => void }> = ({ items, onRelease }) => {
  const [checked, setChecked] = useState<string[]>([]);
  const all = checked.length === items.length;
  return (
    <section aria-labelledby="prework-title" className="rounded-xl border border-amber-800/60 bg-amber-950/15 p-4" data-testid="prework-checklist">
      <h3 id="prework-title" className="flex items-center gap-2 text-base font-semibold text-amber-100">
        <Lock className="h-4 w-4" aria-hidden /> Antes de desmontar: liberar a bomba
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-ink-300">
        Nenhuma ferramenta encosta na bomba antes disto. Confirme cada item ({checked.length}/{items.length}).
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((it) => {
          const on = checked.includes(it.id);
          return (
            <li key={it.id} className={`rounded-lg border p-3 ${on ? 'border-emerald-700/60 bg-emerald-950/20' : 'border-ink-700 bg-ink-900'}`}>
              <label className="flex cursor-pointer gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 shrink-0 accent-[#e8590c]"
                  checked={on}
                  onChange={() => setChecked((c) => (c.includes(it.id) ? c.filter((x) => x !== it.id) : [...c, it.id]))}
                />
                <span className="text-sm leading-relaxed text-ink-100">{it.text}</span>
              </label>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 pl-7">
                <ClaimBadge kind={it.kind} />
                {it.ref && <RefLink r={it.ref} />}
              </div>
              <p className="mt-1 pl-7 text-xs leading-relaxed text-ink-400">{it.why}</p>
            </li>
          );
        })}
      </ul>
      <button className="btn-primary mt-4 w-full" disabled={!all} onClick={onRelease}>
        <ClipboardCheck className="h-4 w-4" aria-hidden /> {all ? 'Bomba liberada: começar a desmontagem' : 'Confirme todos os itens'}
      </button>
      <p className="mt-2 text-xs leading-relaxed text-ink-500">
        Simulação para estudo. No trabalho real vale o procedimento de bloqueio da empresa e a liberação do responsável.
      </p>
    </section>
  );
};

/**
 * Pergunta de verificação entre etapas. Só libera a próxima etapa com a resposta certa;
 * resposta errada mostra o motivo e deixa tentar de novo.
 */
export const StepQuizBox: React.FC<{ quiz: StepQuiz; seed: number; onPass: () => void; continueLabel: string }> = ({ quiz, seed, onPass, continueLabel }) => {
  const order = useMemo(() => shuffledOrder(quiz.options.length, seed), [quiz, seed]);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number[]>([]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    setPicked(null);
    setWrong([]);
    headingRef.current?.focus();
  }, [quiz]);
  const correct = picked === 0;
  return (
    <fieldset className="mt-3 rounded-lg border border-sky-800/60 bg-sky-950/20 p-3" data-testid="step-quiz">
      <legend className="sr-only">Pergunta da etapa</legend>
      <h4 ref={headingRef} tabIndex={-1} className="flex gap-2 text-sm font-semibold text-sky-100 outline-none">
        <HelpCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {quiz.question}
      </h4>
      <div className="mt-2 flex flex-col gap-1.5">
        {order.map((i) => {
          const isWrong = wrong.includes(i);
          const isRight = correct && i === 0;
          return (
            <button
              key={i}
              disabled={correct || isWrong}
              onClick={() => {
                setPicked(i);
                if (i !== 0) setWrong((w) => [...w, i]);
              }}
              aria-pressed={picked === i}
              className={`rounded-lg border px-3 py-2 text-left text-sm ${
                isRight
                  ? 'border-emerald-600 bg-emerald-950/40 text-emerald-100'
                  : isWrong
                  ? 'border-amber-800/60 text-ink-500 line-through'
                  : 'border-ink-700 bg-ink-900 text-ink-100 hover:border-ink-500'
              }`}
            >
              {quiz.options[i]}
            </button>
          );
        })}
      </div>
      <div role="status" aria-live="polite">
        {picked !== null && !correct && (
          <p className="mt-2 flex gap-2 text-sm text-amber-100">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Ainda não. Pense no que pode dar errado na peça ou na pessoa, e tente outra.
          </p>
        )}
        {correct && (
          <p className="mt-2 flex gap-2 text-sm text-emerald-100">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {quiz.explanation}
          </p>
        )}
      </div>
      {correct && (
        <button className="btn-primary mt-3 w-full" onClick={onPass}>
          {continueLabel}
        </button>
      )}
    </fieldset>
  );
};

/** O que fazer antes de devolver o equipamento para operação. */
export const ReturnToService: React.FC<{ items: { text: string; ref?: RegRef }[] }> = ({ items }) => (
  <section className="mt-3 rounded-lg border border-amber-800/50 bg-amber-950/15 p-3" aria-labelledby="rts-title" data-testid="return-to-service">
    <h4 id="rts-title" className="flex items-center gap-2 text-sm font-semibold text-amber-100">
      <ShieldAlert className="h-4 w-4" aria-hidden /> Antes de devolver para a operação
    </h4>
    <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-ink-200">
      {items.map((it) => (
        <li key={it.text}>
          {it.text} {it.ref && <RefLink r={it.ref} />}
        </li>
      ))}
    </ol>
  </section>
);

/** `public/media/apresentacao/<máquina>/filme.json`, escrito quando os vídeos renderizados no Colab entram no projeto. */
type FilmManifest = {
  video: string;
  poster?: string;
  captions?: string;
  seconds?: number;
  extras?: { label: string; video: string }[];
};

/**
 * Filme da desmontagem renderizado em Cycles (Blender, no Colab). Só aparece se o manifesto existir;
 * o vídeo não é baixado até a pessoa apertar o play (preload="none").
 */
export const RenderedFilm: React.FC<{ machineId: string }> = ({ machineId }) => {
  const base = `${import.meta.env.BASE_URL}media/apresentacao/${machineId}/`;
  const [film, setFilm] = useState<FilmManifest | null>(null);
  useEffect(() => {
    let alive = true;
    fetch(`${base}filme.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((m: FilmManifest | null) => alive && setFilm(m && typeof m.video === 'string' ? m : null))
      .catch(() => alive && setFilm(null));
    return () => {
      alive = false;
    };
  }, [base]);
  if (!film) return null;
  const secs = film.seconds ? Math.round(film.seconds) : 0;
  const min = secs ? `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}` : null;
  return (
    <details className="mt-3 rounded-xl border border-ink-800 bg-ink-850" data-testid="rendered-film">
      <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-semibold text-ink-100">
        <Film className="h-4 w-4 text-accent" aria-hidden /> Filme da desmontagem{min ? ` (${min})` : ''}
      </summary>
      <div className="border-t border-ink-800 p-3">
        <video
          className="w-full rounded-lg bg-black"
          controls
          preload="none"
          playsInline
          poster={film.poster ? base + film.poster : undefined}
          aria-label="Filme da desmontagem da bomba centrífuga, com narração"
        >
          <source src={base + film.video} type="video/mp4" />
          {film.captions && <track kind="captions" src={base + film.captions} srcLang="pt-BR" label="Português" default />}
        </video>
        <p className="mt-2 text-xs leading-relaxed text-ink-400">
          Renderizado a partir do modelo educacional simplificado (não é de fabricante). Mostra as mesmas etapas da missão.
        </p>
        {film.extras && film.extras.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {film.extras.map((x) => (
              <li key={x.video}>
                <a className="text-accent-text underline-offset-2 hover:underline" href={base + x.video} target="_blank" rel="noreferrer">
                  {x.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
};
