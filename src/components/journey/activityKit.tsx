import React, { useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, CheckCircle2, Lightbulb, XCircle } from 'lucide-react';
import type { SequenceItem } from '../../data/journey/bench';

/** Peças pequenas repetidas nas atividades: embaralhar com semente, retorno, ligar pares e sequência por pré-requisitos. */

/** Embaralha sempre do mesmo jeito para a mesma semente: evita sorteio escondido e mantém os testes estáveis. */
export function seededShuffle<T>(arr: readonly T[], seed: number): T[] {
  const out = [...arr];
  let s = (seed * 16807 + 11) % 2147483647;
  if (s <= 0) s += 2147483646;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export type Tone = 'success' | 'error' | 'hint';

export const FeedbackBox: React.FC<{ tone: Tone; title?: string; children: React.ReactNode }> = ({ tone, title, children }) => {
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'error' ? XCircle : Lightbulb;
  const cls =
    tone === 'success'
      ? 'border-emerald-700/50 bg-emerald-950/30 text-emerald-200'
      : tone === 'error'
        ? 'border-rose-800/60 bg-rose-950/30 text-rose-200'
        : 'border-sky-700/50 bg-sky-950/30 text-sky-200';
  return (
    <div role="status" className={`flex items-start gap-2.5 rounded-lg border p-3 text-sm leading-relaxed ${cls}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children}
      </div>
    </div>
  );
};

export interface MatchSlot {
  id: string;
  label: string;
  accepts: string;
}

/**
 * Ligar itens a lugares. Três jeitos de fazer a mesma coisa: arrastar (mouse), tocar no item e depois no lugar (celular)
 * ou usar Tab + Enter (teclado). O acerto é conferido na hora, com o motivo do erro.
 */
export const MatchBoard: React.FC<{
  items: { id: string; label: string }[];
  slots: MatchSlot[];
  seed?: number;
  itemsLabel: string;
  /** Texto do erro para um par item ↔ lugar. */
  explain: (itemId: string, slot: MatchSlot) => string;
  /** Texto curto ao acertar um par. */
  praise?: (slot: MatchSlot) => string;
  onError?: (itemId: string, slot: MatchSlot) => void;
  onComplete: (errors: number) => void;
}> = ({ items, slots, seed = 3, itemsLabel, explain, praise, onError, onComplete }) => {
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: Tone; text: string } | null>(null);
  const errorsRef = useRef(0);
  const shuffled = useMemo(() => seededShuffle(items, seed), [items, seed]);
  const remaining = shuffled.filter((i) => !Object.values(placed).includes(i.id));

  const place = (itemId: string, slot: MatchSlot) => {
    if (placed[slot.id]) return;
    if (itemId === slot.accepts) {
      const next = { ...placed, [slot.id]: itemId };
      setPlaced(next);
      setPicked(null);
      setMessage({ tone: 'success', text: praise?.(slot) ?? 'Certo.' });
      if (Object.keys(next).length === slots.length) onComplete(errorsRef.current);
    } else {
      errorsRef.current += 1;
      onError?.(itemId, slot);
      setPicked(null);
      setMessage({ tone: 'error', text: explain(itemId, slot) });
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-200">{itemsLabel}</p>
        <ul className="flex min-h-[2.75rem] flex-wrap gap-2" aria-label={itemsLabel}>
          {remaining.map((i) => (
            <li key={i.id}>
              <button
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', i.id)}
                onClick={() => setPicked(picked === i.id ? null : i.id)}
                aria-pressed={picked === i.id}
                data-item={i.id}
                className={`rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors ${
                  picked === i.id ? 'border-accent bg-accent-soft text-accent-text' : 'border-ink-700 bg-ink-850 text-ink-100 hover:border-ink-600'
                }`}
              >
                {i.label}
              </button>
            </li>
          ))}
          {remaining.length === 0 && <li className="py-2 text-sm text-ink-400">Tudo no lugar.</li>}
        </ul>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {slots.map((s) => {
          const filled = placed[s.id];
          return (
            <li key={s.id}>
              <button
                disabled={Boolean(filled) || !picked}
                onClick={() => picked && place(picked, s)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData('text/plain');
                  if (id) place(id, s);
                }}
                data-slot={s.id}
                className={`flex h-full min-h-[3.5rem] w-full flex-col items-start justify-center rounded-lg border-2 border-dashed p-3 text-left text-sm transition-colors disabled:cursor-default ${
                  filled ? 'border-emerald-700/60 bg-emerald-950/20' : picked ? 'border-accent/60 bg-ink-850 hover:border-accent' : 'border-ink-700'
                }`}
              >
                <span className="text-ink-200">{s.label}</span>
                {filled && (
                  <span className="mt-0.5 flex items-center gap-1 font-semibold text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> {items.find((i) => i.id === filled)?.label}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {!picked && remaining.length > 0 && <p className="text-sm text-ink-400">Toque em um item e depois no lugar dele, ou arraste com o mouse.</p>}
      {message && <FeedbackBox tone={message.tone}>{message.text}</FeedbackBox>}
    </div>
  );
};

/**
 * Sequência por pré-requisitos: o aluno escolhe o próximo passo. Não existe uma única ordem certa,
 * existe “isto depende daquilo”, que é o que acontece na oficina. Passo cedo demais diz o que falta e por quê.
 */
export const DependencySequence: React.FC<{
  items: SequenceItem[];
  seed?: number;
  /** Na avaliação não há retorno na hora: a ordem é aceita e conferida no fim. */
  silent?: boolean;
  onError?: (item: SequenceItem) => void;
  onComplete: (errors: number, order: string[]) => void;
}> = ({ items, seed = 7, silent = false, onError, onComplete }) => {
  const [order, setOrder] = useState<string[]>([]);
  const [message, setMessage] = useState<{ tone: Tone; text: string } | null>(null);
  const errorsRef = useRef(0);
  const shuffled = useMemo(() => seededShuffle(items, seed), [items, seed]);
  const remaining = shuffled.filter((i) => !order.includes(i.id));

  const choose = (item: SequenceItem) => {
    const missing = item.after.filter((a) => !order.includes(a));
    if (missing.length && !silent) {
      errorsRef.current += 1;
      onError?.(item);
      setMessage({ tone: 'error', text: `Ainda não. ${item.tooEarly}` });
      return;
    }
    if (missing.length) errorsRef.current += 1;
    const next = [...order, item.id];
    setOrder(next);
    setMessage(silent ? null : { tone: 'success', text: 'Pode seguir.' });
    if (next.length === items.length) onComplete(errorsRef.current, next);
  };

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-200">O que vem agora?</p>
        <ul className="space-y-2">
          {remaining.map((i) => (
            <li key={i.id}>
              <button onClick={() => choose(i)} data-seq={i.id} className="w-full rounded-lg border border-ink-700 bg-ink-850 px-3 py-2.5 text-left text-sm text-ink-100 transition-colors hover:border-accent">
                {i.label}
              </button>
            </li>
          ))}
          {remaining.length === 0 && <li className="text-sm text-ink-400">Todos os passos feitos.</li>}
        </ul>
      </div>
      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-200">Feito até aqui</p>
        <ol className="space-y-1.5">
          {order.map((id, n) => (
            <li key={id} className="flex items-start gap-2 rounded-lg bg-ink-850 px-3 py-2 text-sm text-ink-200">
              <span className="font-mono text-xs font-semibold text-accent-text">{String(n + 1).padStart(2, '0')}</span>
              <span>{items.find((i) => i.id === id)?.label}</span>
            </li>
          ))}
          {order.length === 0 && <li className="rounded-lg border border-dashed border-ink-700 px-3 py-4 text-center text-sm text-ink-400">Nenhum passo ainda.</li>}
        </ol>
        {message && <div className="mt-2"><FeedbackBox tone={message.tone}>{message.text}</FeedbackBox></div>}
      </div>
    </div>
  );
};

/** Pôr uma lista em ordem com botões (funciona igual no toque e no teclado). */
export const OrderList: React.FC<{ items: { id: string; label: string }[]; onChange: (ids: string[]) => void; label: string }> = ({ items, onChange, label }) => {
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = items.map((x) => x.id);
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <ol className="space-y-1.5" aria-label={label}>
      {items.map((it, i) => (
        <li key={it.id} data-order={it.id} className="flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-sm text-ink-100">
          <span className="font-mono text-xs font-semibold text-ink-400">{String(i + 1).padStart(2, '0')}</span>
          <span className="min-w-0 flex-1">{it.label}</span>
          <button className="btn-icon" disabled={i === 0} aria-label={`Subir: ${it.label}`} onClick={() => move(i, -1)}>
            <ArrowUp className="h-4 w-4" aria-hidden />
          </button>
          <button className="btn-icon" disabled={i === items.length - 1} aria-label={`Descer: ${it.label}`} onClick={() => move(i, 1)}>
            <ArrowDown className="h-4 w-4" aria-hidden />
          </button>
        </li>
      ))}
    </ol>
  );
};
