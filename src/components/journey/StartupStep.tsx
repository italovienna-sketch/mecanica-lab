import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ArrowRight, Play, ShieldCheck, Wrench } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import { BENCH_PARTS, BENCH_VARIANTS, BenchPartId, RETURN_SEQUENCE, STARTUP_LIMITS, startupOutcome, trend } from '../../data/journey/bench';
import type { BenchDecision } from '../../data/journey/meta';
import { DependencySequence, FeedbackBox } from './activityKit';
import { DECISION_LABEL } from './BenchStep';
import { PumpSection } from './PumpSection';
import type { StepProps } from './activities';

type Stage = 'sequencia' | 'teste' | 'decisao' | 'relatorio';

const Gauge: React.FC<{ label: string; unit: string; series: number[]; shown: number; limit: number; limitBelow?: boolean; max: number; min?: number }> = ({
  label,
  unit,
  series,
  shown,
  limit,
  limitBelow = false,
  max,
  min = 0
}) => {
  const W = 220;
  const H = 76;
  const y = (v: number) => H - ((v - min) / (max - min)) * H;
  const x = (i: number) => (i / (series.length - 1)) * W;
  const visible = series.slice(0, Math.max(1, shown));
  const value = visible[visible.length - 1];
  const bad = limitBelow ? value < limit : value > limit;
  return (
    <div className="rounded-lg border border-ink-800 bg-ink-850 p-3" data-gauge={label} data-bad={bad}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm text-ink-300">{label}</span>
        <span className={`font-mono text-lg font-semibold ${bad ? 'text-rose-300' : 'text-ink-100'}`}>
          {value.toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}
          <span className="ml-1 text-xs font-normal text-ink-400">{unit}</span>
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 h-16 w-full" aria-hidden preserveAspectRatio="none">
        <line x1="0" x2={W} y1={y(limit)} y2={y(limit)} stroke="#d97706" strokeDasharray="6 4" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <polyline points={visible.map((v, i) => `${x(i)},${y(v)}`).join(' ')} fill="none" stroke={bad ? '#f43f5e' : '#0ea5e9'} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <p className="text-xs text-ink-400">
        {bad && <AlertTriangle className="mr-1 inline h-3 w-3 text-amber-300" aria-hidden />}
        Faixa do teste: {limitBelow ? 'acima de' : 'até'} {limit.toLocaleString('pt-BR')} {unit}
      </p>
    </div>
  );
};

/**
 * OS-05: devolução em ordem, teste de partida simulado e a decisão de liberar ou parar. O que aparece nos instrumentos
 * é a soma das decisões da bancada (startupOutcome, função pura). Todos os valores são índices do exercício.
 */
export const StartupStep: React.FC<StepProps> = ({ onPass }) => {
  const { playerProfile, recordStartupRun, reducedMotion, logMistake, resolveMistakes } = useGameState();
  const lastBench = playerProfile.journey.benchRuns[playerProfile.journey.benchRuns.length - 1];
  const variant = BENCH_VARIANTS[lastBench?.variant ?? 0];
  const [decisions, setDecisions] = useState<Record<string, BenchDecision>>(() => lastBench?.decisions ?? {});
  const [stage, setStage] = useState<Stage>('sequencia');
  const [shown, setShown] = useState(0);
  const [verdict, setVerdict] = useState<{ released: boolean } | null>(null);
  const seqErrors = useRef(0);
  const outcome = useMemo(() => startupOutcome(variant, decisions), [variant, decisions]);
  const series = useMemo(
    () => ({
      leak: trend(outcome.leak, 0),
      vibration: trend(outcome.vibration, 0.6),
      temperature: trend(outcome.temperature, 28),
      flow: trend(outcome.flow, 40)
    }),
    [outcome]
  );
  const N = series.leak.length;

  useEffect(() => {
    if (stage !== 'teste') return;
    if (reducedMotion) {
      setShown(N);
      setStage('decisao');
      return;
    }
    setShown(1);
    const t = window.setInterval(() => {
      setShown((s) => {
        if (s + 1 >= N) {
          window.clearInterval(t);
          setStage('decisao');
          return N;
        }
        return s + 1;
      });
    }, 220);
    return () => window.clearInterval(t);
  }, [stage, N, reducedMotion]);

  const decide = (released: boolean) => {
    const correctCall = released === outcome.healthy;
    recordStartupRun({ at: Date.now(), variant: variant.id, healthy: outcome.healthy, released, correctCall, sequenceErrors: seqErrors.current });
    setVerdict({ released });
    setStage('relatorio');
    if (!correctCall) {
      logMistake({
        id: 'mx-partida',
        area: 'Teste de partida',
        skill: 'diagnostico',
        text: released ? 'Liberou uma bomba com instrumentos fora da faixa.' : 'Parou uma bomba com instrumentos dentro da faixa.',
        why: 'Quem decide é a leitura contra a faixa do teste, não a pressa nem o receio.'
      });
    } else if (outcome.healthy) resolveMistakes(['mx-partida']);
  };

  const retest = () => {
    setVerdict(null);
    setShown(0);
    setStage('teste');
  };

  const leaking = outcome.leak > STARTUP_LIMITS.leak && (stage === 'teste' ? shown > 6 : true);

  if (stage === 'sequencia') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-ink-300">A bomba está montada, mas ainda bloqueada. Faça a devolução para a operação: escolha sempre o próximo passo.</p>
        <DependencySequence
          items={RETURN_SEQUENCE}
          seed={29}
          onError={(item) => logMistake({ id: `mx-dev-${item.id}`, area: 'Devolução para operação', skill: 'seguranca', text: `Tentou antes da hora: ${item.label.toLowerCase()}.`, why: item.tooEarly })}
          onComplete={(errors) => {
            seqErrors.current = errors;
            setStage('teste');
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="notice-warning">Simulação com índices do exercício: não são limites de norma nem de fabricante. A faixa é a definida para este teste.</p>
      <div className="grid gap-3 lg:grid-cols-[1fr_1.1fr]">
        <div className="relative overflow-hidden rounded-lg border border-ink-800">
          <PumpSection title="Bomba em teste" showFlow={stage === 'teste' || stage === 'decisao'} />
          <svg viewBox="0 0 760 340" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
            {leaking &&
              [0, 0.3, 0.6].map((d) => (
                <circle key={d} cx={428} cy={286} r={6} fill="#0284c7" className="animate-leak" style={{ animationDelay: `${d}s` }} data-testid="leak-drop" />
              ))}
          </svg>
          {leaking && <p className="absolute bottom-2 left-2 rounded bg-rose-950/90 px-2 py-1 text-xs font-semibold text-rose-200">Vazamento visível na tampa</p>}
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Gauge label="Vibração" unit="índice" series={series.vibration} shown={shown} limit={STARTUP_LIMITS.vibration} max={9} />
          <Gauge label="Temperatura do mancal" unit="°C sim." series={series.temperature} shown={shown} limit={STARTUP_LIMITS.temperature} max={90} min={20} />
          <Gauge label="Vazamento" unit="índice" series={series.leak} shown={shown} limit={STARTUP_LIMITS.leak} max={5} />
          <Gauge label="Vazão" unit="%" series={series.flow} shown={shown} limit={STARTUP_LIMITS.flow} limitBelow max={110} min={30} />
        </div>
      </div>

      {stage === 'teste' && <p role="status" className="flex items-center gap-2 text-sm text-ink-300"><Play className="h-4 w-4 text-accent" aria-hidden /> Bomba em teste. Acompanhe os instrumentos.</p>}

      {stage === 'decisao' && (
        <div className="rounded-lg border border-ink-700 bg-ink-850 p-4">
          <p className="font-semibold text-ink-100">Sua decisão: a P-101 pode voltar para a operação?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn-primary" onClick={() => decide(true)} data-testid="startup-release">
              <ShieldCheck className="h-4 w-4" aria-hidden /> Liberar para operação
            </button>
            <button className="btn-secondary" onClick={() => decide(false)} data-testid="startup-stop">
              <AlertTriangle className="h-4 w-4" aria-hidden /> Parar e bloquear
            </button>
          </div>
        </div>
      )}

      {stage === 'relatorio' && verdict && (
        <div className="space-y-3">
          {outcome.healthy && verdict.released && (
            <FeedbackBox tone="success" title="Bomba liberada, com os instrumentos dentro da faixa.">
              <p>Suas decisões na bancada se confirmaram. Vibração, temperatura, vazamento e vazão ficaram onde deviam.</p>
              {outcome.notes.map((n) => <p key={n}>{n}</p>)}
            </FeedbackBox>
          )}
          {outcome.healthy && !verdict.released && (
            <FeedbackBox tone="hint" title="Os instrumentos estavam dentro da faixa.">
              <p>Parar por segurança nunca é errado, mas aqui não havia sinal de problema: parada sem motivo também custa. Rode o teste de novo e decida pelos números.</p>
            </FeedbackBox>
          )}
          {!outcome.healthy && (
            <FeedbackBox tone={verdict.released ? 'error' : 'success'} title={verdict.released ? 'Liberar foi um erro: os instrumentos estavam fora da faixa.' : 'Boa decisão: você parou uma bomba com problema.'}>
              {outcome.notes.map((n) => <p key={n}>{n}</p>)}
              <p className="mt-1">{verdict.released ? 'Na planta, a bomba voltaria a parar em pouco tempo, e dessa vez sem aviso.' : 'Agora volte às decisões da bancada e corrija o que causou isso.'}</p>
            </FeedbackBox>
          )}
          {outcome.wasted.length > 0 && (
            <FeedbackBox tone="hint" title="Peças e serviços além do necessário">
              {outcome.wasted.map((w) => <p key={w}>{w}</p>)}
            </FeedbackBox>
          )}

          {!outcome.healthy && (
            <fieldset className="rounded-lg border border-ink-700 p-4">
              <legend className="px-1 text-sm font-semibold text-ink-100">
                <Wrench className="mr-1 inline h-4 w-4" aria-hidden /> Voltar à bancada: mudar decisões
              </legend>
              <ul className="mt-1 divide-y divide-ink-800">
                {BENCH_PARTS.map((p) => (
                  <li key={p.id} className="grid gap-1.5 py-2 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-200">{p.name}</p>
                      <p className="text-xs text-ink-400">{variant.parts[p.id as BenchPartId].describe}</p>
                    </div>
                    <div className="segmented" role="group" aria-label={`Decisão: ${p.name}`}>
                      {(['reaproveitar', 'recondicionar', 'trocar'] as BenchDecision[]).map((d) => (
                        <button key={d} aria-pressed={decisions[p.id] === d} onClick={() => setDecisions((cur) => ({ ...cur, [p.id]: d }))} data-part-decision={`${p.id}:${d}`}>
                          {DECISION_LABEL[d]}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </fieldset>
          )}

          <div className="flex flex-wrap gap-2">
            {outcome.healthy && verdict.released ? (
              <button className="btn-primary" onClick={onPass}>
                Encerrar a OS <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            ) : (
              <button className="btn-primary" onClick={retest}>
                <Play className="h-4 w-4" aria-hidden /> Rodar o teste de novo
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
