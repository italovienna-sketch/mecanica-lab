import React, { useMemo, useRef, useState } from 'react';
import { ArrowRight, RotateCcw, Search } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import { BENCH_PARTS, BenchPartId, benchVariantFor } from '../../data/journey/bench';
import type { BenchDecision } from '../../data/journey/meta';
import { MicrometerScales } from '../tools/MicrometerTrainer';
import { BenchArt } from './BenchArt';
import { FeedbackBox, seededShuffle } from './activityKit';
import type { StepProps } from './activities';

export const DECISION_LABEL: Record<BenchDecision, string> = { reaproveitar: 'Reaproveitar', recondicionar: 'Recondicionar', trocar: 'Trocar' };
const DECISIONS: { id: BenchDecision; hint: string }[] = [
  { id: 'reaproveitar', hint: 'A peça volta como está.' },
  { id: 'recondicionar', hint: 'Recuperar na oficina antes de voltar.' },
  { id: 'trocar', hint: 'Comprar peça nova.' }
];

const FINDINGS_NEEDED = 3;

/**
 * OS-04. O achado (o que aconteceu com a peça) tem retorno na hora. A decisão (o que fazer com ela) fica em aberto de
 * propósito: a resposta aparece nos instrumentos do teste de partida, na OS-05, como acontece na oficina.
 */
export const BenchStep: React.FC<StepProps> = ({ onPass }) => {
  const { playerProfile, recordBenchRun, logMistake, resolveMistakes } = useGameState();
  const attempt = playerProfile.journey.benchRuns.length;
  const variant = useMemo(() => benchVariantFor(attempt), [attempt]);
  const [i, setI] = useState(0);
  const [finding, setFinding] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<'ok' | 'wrong' | null>(null);
  const [wrongOnce, setWrongOnce] = useState(false);
  const firstTryRef = useRef(0);
  const [decisions, setDecisions] = useState<Partial<Record<BenchPartId, BenchDecision>>>({});
  const [finished, setFinished] = useState(false);

  const part = BENCH_PARTS[i];
  const cond = part ? variant.parts[part.id] : null;
  const findings = useMemo(() => (part ? seededShuffle(part.findings, attempt + i + 3) : []), [part, attempt, i]);

  const confirm = () => {
    if (!part || !cond || !finding) return;
    if (finding === cond.findingId) {
      if (!wrongOnce) firstTryRef.current += 1;
      setConfirmed('ok');
      resolveMistakes([`mx-bench-${part.id}`]);
    } else {
      setWrongOnce(true);
      setConfirmed('wrong');
      logMistake({
        id: `mx-bench-${part.id}`,
        area: 'Bancada de inspeção',
        skill: 'inspecao',
        text: `${part.name}: leitura errada do estado da peça.`,
        why: part.findings.find((f) => f.id === cond.findingId)?.why ?? cond.describe
      });
    }
  };

  const decide = (d: BenchDecision) => {
    if (!part) return;
    const next = { ...decisions, [part.id]: d };
    setDecisions(next);
    setFinding(null);
    setConfirmed(null);
    setWrongOnce(false);
    if (i + 1 >= BENCH_PARTS.length) {
      recordBenchRun({
        at: Date.now(),
        variant: variant.id,
        findingsFirstTry: firstTryRef.current,
        findingsTotal: BENCH_PARTS.length,
        decisions: next as Record<string, BenchDecision>
      });
      setFinished(true);
    }
    setI((n) => n + 1);
  };

  if (finished) {
    const passed = firstTryRef.current >= FINDINGS_NEEDED;
    return (
      <div className="space-y-3">
        <h3 className="section-title">Laudo de inspeção</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <caption className="sr-only">Estado e decisão por peça</caption>
            <thead className="text-xs text-ink-400">
              <tr>
                <th scope="col" className="pb-1 font-medium">Peça</th>
                <th scope="col" className="pb-1 font-medium">Estado encontrado</th>
                <th scope="col" className="pb-1 font-medium">Sua decisão</th>
              </tr>
            </thead>
            <tbody>
              {BENCH_PARTS.map((p) => (
                <tr key={p.id} className="border-t border-ink-800 align-top">
                  <th scope="row" className="py-2 pr-3 font-medium text-ink-200">{p.name}</th>
                  <td className="py-2 pr-3 text-ink-300">{variant.parts[p.id].describe}</td>
                  <td className="py-2 font-semibold text-ink-100">{DECISION_LABEL[decisions[p.id] ?? 'reaproveitar']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <FeedbackBox tone={passed ? 'success' : 'hint'} title={`${firstTryRef.current} de ${BENCH_PARTS.length} peças lidas certo de primeira`}>
          <p>
            {passed
              ? 'As peças e suas decisões seguem para a montagem. Ninguém vai dizer agora se a decisão foi boa: quem responde é o teste de partida.'
              : `São necessárias ${FINDINGS_NEEDED}. Inspecione outro lote: as peças mudam, e você treina o olhar, não a resposta.`}
          </p>
        </FeedbackBox>
        {passed ? (
          <button className="btn-primary" onClick={onPass}>
            Enviar para a montagem <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <button
            className="btn-secondary"
            onClick={() => {
              firstTryRef.current = 0;
              setI(0);
              setDecisions({});
              setFinished(false);
            }}
          >
            <RotateCcw className="h-4 w-4" aria-hidden /> Inspecionar outro lote
          </button>
        )}
      </div>
    );
  }

  if (!part || !cond) return null;

  return (
    <div className="space-y-3">
      <p className="notice">
        <span>
          <strong className="text-ink-100">Chamado: </strong>
          {variant.report}
        </span>
      </p>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="section-title">{part.name}</h3>
        <span className="font-mono text-xs text-ink-400">
          Peça {i + 1} de {BENCH_PARTS.length}
        </span>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          {cond.measure ? (
            <>
              <div className="overflow-x-auto rounded-lg border border-ink-800">
                <MicrometerScales mm={cond.measure.mm} highlight={false} />
              </div>
              <div className="mt-2">
                <BenchArt part={part.id} state={cond.state} label="Eixo com a cota Ø 25 h6 no assento do rolamento" lens={false} />
              </div>
            </>
          ) : (
            <BenchArt part={part.id} state={cond.state} label={`${part.name} na bancada`} />
          )}
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-400">
            <Search className="h-3.5 w-3.5" aria-hidden />
            {cond.measure ? 'Micrômetro no assento do eixo. Valores do exercício.' : 'Passe o mouse ou o dedo para usar a lupa. Peças ilustradas, sem escala.'}
          </p>
        </div>
        <div>
          <p className="text-sm text-ink-300">{part.look}</p>
          {confirmed !== 'ok' ? (
            <fieldset className="mt-3">
              <legend className="mb-1.5 text-sm font-medium text-ink-200">O que você encontrou?</legend>
              <div className="space-y-2">
                {findings.map((f) => (
                  <label
                    key={f.id}
                    className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                      finding === f.id ? 'border-accent bg-accent-soft text-ink-100' : 'border-ink-700 bg-ink-850 text-ink-100 hover:border-ink-600'
                    }`}
                  >
                    <input type="radio" name={`achado-${part.id}`} className="mt-0.5 accent-[#c2410c]" checked={finding === f.id} onChange={() => { setFinding(f.id); setConfirmed(null); }} />
                    {f.label}
                  </label>
                ))}
              </div>
              <button className="btn-primary mt-3" disabled={!finding} onClick={confirm}>
                Confirmar o achado
              </button>
              {confirmed === 'wrong' && finding && (
                <div className="mt-3">
                  <FeedbackBox tone="error" title="Olhe de novo.">
                    <p>{part.findings.find((f) => f.id === finding)?.why}</p>
                  </FeedbackBox>
                </div>
              )}
            </fieldset>
          ) : (
            <div className="mt-3 space-y-3">
              <FeedbackBox tone="success" title="Achado correto.">
                <p>{cond.describe}</p>
              </FeedbackBox>
              <fieldset>
                <legend className="mb-1.5 text-sm font-medium text-ink-200">E agora, o que fazer com a peça?</legend>
                <div className="grid gap-2">
                  {DECISIONS.map((d) => (
                    <button key={d.id} onClick={() => decide(d.id)} data-decision={d.id} className="rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-left text-sm transition-colors hover:border-accent">
                      <span className="block font-semibold text-ink-100">{DECISION_LABEL[d.id]}</span>
                      <span className="block text-ink-400">{d.hint}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
