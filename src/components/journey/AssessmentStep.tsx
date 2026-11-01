import React, { useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, RotateCcw, X } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import {
  ASSESSMENT_RELEASE,
  AssessmentAnswers,
  AssessmentResult,
  DISASSEMBLY_PARTS,
  assessmentCaseFor,
  scoreAssessment
} from '../../data/journey/assessment';
import { BENCH_PARTS } from '../../data/journey/bench';
import { CRITERIA, CRITERION_LABEL } from '../../data/journey/meta';
import type { BenchDecision } from '../../data/journey/meta';
import { PumpPartId, spotLabel } from '../../data/journey/pumpSection';
import { ProgressBar } from '../ui';
import { BenchArt } from './BenchArt';
import { DECISION_LABEL } from './BenchStep';
import { PumpSection } from './PumpSection';
import { DependencySequence, FeedbackBox, OrderList, seededShuffle } from './activityKit';
import type { StepProps } from './activities';

const STAGES = ['Liberação', 'Sintomas', 'Testes', 'Hipóteses', 'Ação', 'Desmontagem', 'Peças', 'Medida e desenho'];

const Choice: React.FC<{ type: 'radio' | 'checkbox'; name: string; checked: boolean; disabled?: boolean; onChange: () => void; children: React.ReactNode }> = ({
  type,
  name,
  checked,
  disabled,
  onChange,
  children
}) => (
  <label
    className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
      disabled ? 'cursor-not-allowed border-ink-800 opacity-60' : `cursor-pointer ${checked ? 'border-accent bg-accent-soft' : 'border-ink-700 bg-ink-850 hover:border-ink-600'}`
    } text-ink-100`}
  >
    <input type={type} name={name} className="mt-0.5 accent-[#c2410c]" checked={checked} disabled={disabled} onChange={onChange} />
    <span>{children}</span>
  </label>
);

/** Toda a prova corre sem retorno de certo ou errado. O relatório sai no fim, com o raciocínio de cada critério. */
export const AssessmentStep: React.FC<StepProps> = ({ onPass }) => {
  const { playerProfile, recordAssessmentRun, courseConfig, logMistake, navigateTo } = useGameState();
  const runs = playerProfile.journey.assessmentRuns;
  const [attempt, setAttempt] = useState(runs.length);
  const c = useMemo(() => assessmentCaseFor(attempt), [attempt]);
  const [stage, setStage] = useState(0);
  const releaseErrors = useRef(0);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [tests, setTests] = useState<string[]>([]);
  const [discarded, setDiscarded] = useState<string[]>([]);
  const [cause, setCause] = useState('');
  const [action, setAction] = useState('');
  const [disassembly, setDisassembly] = useState<string[]>(() => seededShuffle(DISASSEMBLY_PARTS, attempt + 41));
  const [bench, setBench] = useState<Record<string, { finding: string; decision: BenchDecision | '' }>>({});
  const [drawingPick, setDrawingPick] = useState<PumpPartId | ''>('');
  const [measureOk, setMeasureOk] = useState<boolean | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const usedTests = tests.length;

  const finish = () => {
    const answers: AssessmentAnswers = {
      releaseOrder: [],
      releaseErrors: releaseErrors.current,
      symptoms,
      tests,
      discarded,
      cause,
      action,
      disassembly,
      bench: bench as AssessmentAnswers['bench'],
      drawingPick,
      measureOk
    };
    const r = scoreAssessment(c, answers, courseConfig.passScore);
    recordAssessmentRun({ at: Date.now(), variant: c.id, criteria: r.criteria, passed: r.passed, critical: r.critical });
    r.lines
      .filter((l) => !l.ok)
      .slice(0, 6)
      .forEach((l, i) => logMistake({ id: `mx-prova-${c.id}-${l.criterion}-${i}`, area: `Avaliação prática (${c.tag})`, skill: l.criterion, text: CRITERION_LABEL[l.criterion], why: l.text }));
    setResult(r);
    setStage(STAGES.length);
  };

  const retake = () => {
    const next = attempt + 1;
    setAttempt(next);
    setStage(0);
    releaseErrors.current = 0;
    setSymptoms([]);
    setTests([]);
    setDiscarded([]);
    setCause('');
    setAction('');
    setDisassembly(seededShuffle(DISASSEMBLY_PARTS, next + 41));
    setBench({});
    setDrawingPick('');
    setMeasureOk(null);
    setResult(null);
  };

  if (result) {
    return (
      <div className="space-y-4" data-testid="assessment-result" data-passed={result.passed}>
        <FeedbackBox tone={result.passed ? 'success' : 'error'} title={result.passed ? `${c.tag}: caso resolvido.` : result.critical ? 'Não aprovado: houve decisão insegura.' : 'Não aprovado nesta tentativa.'}>
          <p>
            {result.critical
              ? 'Uma decisão insegura reprova, seja qual for o resto: na oficina, ela não se compensa com acertos.'
              : `Segurança precisa de 100. Os demais critérios precisam de ${courseConfig.passScore}.`}
          </p>
        </FeedbackBox>

        <ul className="grid gap-3 sm:grid-cols-2">
          {CRITERIA.map((k) => {
            const need = k === 'seguranca' ? 100 : courseConfig.passScore;
            const ok = result.criteria[k] >= need;
            return (
              <li key={k} className="rounded-lg border border-ink-800 bg-ink-850 p-3" data-criterion={k}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="font-medium text-ink-200">{CRITERION_LABEL[k]}</span>
                  <span className={`font-mono font-semibold ${ok ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {result.criteria[k]}<span className="text-xs font-normal text-ink-400"> / mín. {need}</span>
                  </span>
                </div>
                <div className="mt-1.5">
                  <ProgressBar value={result.criteria[k]} max={100} label={`${CRITERION_LABEL[k]}: ${result.criteria[k]}`} tone={ok ? 'success' : 'accent'} />
                </div>
              </li>
            );
          })}
        </ul>

        <section aria-labelledby="raciocinio">
          <h3 id="raciocinio" className="section-title mb-2">O raciocínio de cada parte</h3>
          {CRITERIA.map((k) => (
            <details key={k} className="border-t border-ink-800 py-2" open={result.criteria[k] < (k === 'seguranca' ? 100 : courseConfig.passScore)}>
              <summary className="cursor-pointer text-sm font-semibold text-ink-100">{CRITERION_LABEL[k]}</summary>
              <ul className="mt-2 space-y-2">
                {result.lines
                  .filter((l) => l.criterion === k)
                  .map((l, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink-300">
                      {l.ok ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-label="Certo" /> : <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-label="A rever" />}
                      <span>{l.text}</span>
                    </li>
                  ))}
              </ul>
            </details>
          ))}
        </section>

        {result.passed ? (
          <button className="btn-primary" onClick={onPass}>
            Encerrar a jornada <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-ink-300">Antes de tentar de novo, reveja o que ficou fraco: a próxima tentativa traz outro caso, e repetir logo em seguida mede sorte, não domínio.</p>
            <div className="flex flex-wrap gap-2">
              <button className="btn-primary" onClick={() => navigateTo('missions', 'revisao')}>
                Revisar primeiro
              </button>
              <button className="btn-secondary" onClick={retake}>
                <RotateCcw className="h-4 w-4" aria-hidden /> Novo caso
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const nextBtn = (enabled: boolean, onClick: () => void = () => setStage((s) => s + 1), label = 'Avançar') => (
    <button className="btn-primary" disabled={!enabled} onClick={onClick}>
      {label} <ArrowRight className="h-4 w-4" aria-hidden />
    </button>
  );

  const benchFilled = c.benchParts.every((b) => bench[b.part]?.finding && bench[b.part]?.decision);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-baseline justify-between gap-2">
          <p className="eyebrow">
            Etapa {stage + 1} de {STAGES.length}: {STAGES[stage]}
          </p>
          <span className="font-mono text-xs text-ink-400">Bomba {c.tag} · fictícia</span>
        </div>
        <div className="mt-1.5">
          <ProgressBar value={stage} max={STAGES.length} label="Progresso na avaliação" />
        </div>
      </div>
      <p className="notice">
        <span>{c.chamado}</span>
      </p>

      {stage === 0 && (
        <div className="space-y-3">
          <p className="text-sm text-ink-300">Sem retorno durante a prova. Escolha sempre o próximo passo da liberação.</p>
          <DependencySequence
            items={ASSESSMENT_RELEASE}
            seed={attempt + 13}
            silent
            onComplete={(errors) => {
              releaseErrors.current = errors;
              setStage(1);
            }}
          />
        </div>
      )}

      {stage === 1 && (
        <fieldset className="space-y-2">
          <legend className="mb-1 text-sm font-medium text-ink-200">Quais informações do chamado importam para o diagnóstico?</legend>
          {c.symptoms.map((s) => (
            <Choice key={s.id} type="checkbox" name="sintoma" checked={symptoms.includes(s.id)} onChange={() => setSymptoms((l) => toggle(l, s.id))}>
              {s.label}
            </Choice>
          ))}
          <div className="pt-1">{nextBtn(symptoms.length > 0)}</div>
        </fieldset>
      )}

      {stage === 2 && (
        <fieldset className="space-y-2">
          <legend className="mb-1 text-sm font-medium text-ink-200">
            A janela de parada é curta: escolha até {c.testBudget} verificações. {usedTests} de {c.testBudget}.
          </legend>
          {c.tests.map((t) => {
            const on = tests.includes(t.id);
            return (
              <div key={t.id}>
                <Choice type="checkbox" name="teste" checked={on} disabled={!on && usedTests >= c.testBudget} onChange={() => setTests((l) => toggle(l, t.id))}>
                  {t.label}
                </Choice>
                {on && t.safety !== 'inseguro' && <p className="ml-7 mt-1 text-sm text-ink-300"><span className="font-semibold text-ink-200">Resultado: </span>{t.result}</p>}
                {on && t.safety === 'inseguro' && <p className="ml-7 mt-1 text-sm text-ink-400">Registrado.</p>}
              </div>
            );
          })}
          <div className="pt-1">{nextBtn(usedTests > 0)}</div>
        </fieldset>
      )}

      {stage === 3 && (
        <fieldset className="space-y-2">
          <legend className="mb-1 text-sm font-medium text-ink-200">Marque as hipóteses que as evidências permitem descartar.</legend>
          {c.hypotheses.map((h) => (
            <Choice key={h.id} type="checkbox" name="hipotese" checked={discarded.includes(h.id)} onChange={() => setDiscarded((l) => toggle(l, h.id))}>
              {h.label}
            </Choice>
          ))}
          <p className="pt-2 text-sm font-medium text-ink-200">Qual é a causa mais provável?</p>
          {c.hypotheses.map((h) => (
            <Choice key={h.id} type="radio" name="causa" checked={cause === h.id} onChange={() => setCause(h.id)}>
              {h.label}
            </Choice>
          ))}
          <div className="pt-1">{nextBtn(Boolean(cause))}</div>
        </fieldset>
      )}

      {stage === 4 && (
        <fieldset className="space-y-2">
          <legend className="mb-1 text-sm font-medium text-ink-200">O que fazer agora?</legend>
          {seededShuffle(c.actions, attempt + 3).map((a) => (
            <Choice key={a.id} type="radio" name="acao" checked={action === a.id} onChange={() => setAction(a.id)}>
              {a.label}
            </Choice>
          ))}
          <div className="pt-1">{nextBtn(Boolean(action))}</div>
        </fieldset>
      )}

      {stage === 5 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-ink-200">A intervenção foi autorizada. Ordene a retirada das peças, da primeira à última.</p>
          <OrderList items={disassembly.map((id) => ({ id, label: spotLabel(id as PumpPartId) }))} onChange={setDisassembly} label="Ordem de retirada" />
          {nextBtn(true)}
        </div>
      )}

      {stage === 6 && (
        <div className="space-y-5">
          {c.benchParts.map(({ part, condition }) => {
            const info = BENCH_PARTS.find((b) => b.id === part)!;
            const cur = bench[part] ?? { finding: '', decision: '' };
            const set = (patch: Partial<typeof cur>) => setBench((b) => ({ ...b, [part]: { ...cur, ...patch } }));
            return (
              <section key={part} className="grid gap-3 lg:grid-cols-2" aria-label={info.name}>
                <BenchArt part={part} state={condition.state} label={`${info.name} na bancada`} />
                <div className="space-y-3">
                  <fieldset className="space-y-2">
                    <legend className="mb-1 text-sm font-medium text-ink-200">{info.name}: o que você encontrou?</legend>
                    {info.findings.map((f) => (
                      <Choice key={f.id} type="radio" name={`p-achado-${part}`} checked={cur.finding === f.id} onChange={() => set({ finding: f.id })}>
                        {f.label}
                      </Choice>
                    ))}
                  </fieldset>
                  <fieldset className="space-y-2">
                    <legend className="mb-1 text-sm font-medium text-ink-200">Destino da peça</legend>
                    <div className="segmented" role="group" aria-label={`Destino: ${info.name}`}>
                      {(['reaproveitar', 'recondicionar', 'trocar'] as BenchDecision[]).map((d) => (
                        <button key={d} aria-pressed={cur.decision === d} onClick={() => set({ decision: d })}>
                          {DECISION_LABEL[d]}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </section>
            );
          })}
          {nextBtn(benchFilled)}
        </div>
      )}

      {stage === 7 && (
        <div className="space-y-4">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-ink-200">
              {c.measure.label}. Desenho: {c.measure.nominal}. Leitura: {c.measure.reading.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} mm.
            </legend>
            <div className="flex flex-wrap gap-2">
              <button className={measureOk === true ? 'btn-primary' : 'btn-secondary'} aria-pressed={measureOk === true} onClick={() => setMeasureOk(true)}>
                Dentro da tolerância
              </button>
              <button className={measureOk === false ? 'btn-primary' : 'btn-secondary'} aria-pressed={measureOk === false} onClick={() => setMeasureOk(false)}>
                Fora da tolerância
              </button>
            </div>
          </fieldset>
          <div>
            <p className="mb-1 text-sm font-medium text-ink-200">{c.drawingPrompt.prompt}</p>
            {drawingPick && <p className="mb-1 text-sm text-ink-300" role="status">Marcado: {spotLabel(drawingPick)}</p>}
            <div className="overflow-hidden rounded-lg border border-ink-800">
              <PumpSection title="Corte da bomba: aponte a peça" mode="parts" active={drawingPick || null} onPick={(id) => setDrawingPick(id as PumpPartId)} />
            </div>
          </div>
          {nextBtn(measureOk !== null && Boolean(drawingPick), finish, 'Entregar a avaliação')}
        </div>
      )}
    </div>
  );
};
