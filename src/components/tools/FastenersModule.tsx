import React, { useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, CircleHelp, ClipboardList, RotateCcw } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import {
  FASTENER_BY_ID,
  FASTENER_SIZE_TABLE,
  FASTENER_TYPES,
  SELECTION_SCENARIOS,
  SelectionScenario,
  StepVerdict,
  fastenerScenarioTask
} from '../../data/fasteners';
import { ToolViewer3D } from './ToolViewer3D';

type Sub = 'biblioteca' | 'comparar' | 'selecionar';

const FAMILY_LABEL = { parafuso: 'Parafuso', porca: 'Porca', arruela: 'Arruela', retencao: 'Retenção' } as const;

export const FastenersModule: React.FC = () => {
  const [sub, setSub] = useState<Sub>('biblioteca');
  const tabs: { id: Sub; label: string }[] = [
    { id: 'biblioteca', label: 'Tipos de fixador' },
    { id: 'comparar', label: 'Comparar em 3D' },
    { id: 'selecionar', label: 'Escolher passo a passo' }
  ];
  return (
    <div className="space-y-5">
      <div role="group" aria-label="Seções de fixadores" className="flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            aria-pressed={sub === t.id}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${
              sub === t.id ? 'border-accent bg-accent-soft text-ink-100' : 'border-ink-700 text-ink-400 hover:text-ink-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {sub === 'biblioteca' && <FastenerLibrary />}
      {sub === 'comparar' && <FastenerCompare />}
      {sub === 'selecionar' && <FastenerSelection />}
      <p className="text-xs text-ink-500">
        Modelos e desenhos em tamanho M10 com proporções representativas das normas citadas. Valores de aperto e resistência de cada junta vêm do manual do equipamento
        ou do projeto — esta biblioteca não fornece esses números.
      </p>
    </div>
  );
};

/* ───────────────────────── Biblioteca ───────────────────────── */

const FastenerLibrary: React.FC = () => {
  const [id, setId] = useState(FASTENER_TYPES[0].id);
  const f = FASTENER_BY_ID[id];
  const [partId, setPartId] = useState<string | null>(null);
  const part = f.parts.find((p) => p.id === partId);

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
      <ul className="space-y-1.5" aria-label="Tipos de fixador">
        {FASTENER_TYPES.map((t) => (
          <li key={t.id}>
            <button
              onClick={() => {
                setId(t.id);
                setPartId(null);
              }}
              aria-current={t.id === id ? 'true' : undefined}
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                t.id === id ? 'border-accent bg-ink-850 text-ink-100' : 'border-ink-800 bg-ink-900 text-ink-300 hover:border-ink-700 hover:text-ink-100'
              }`}
            >
              <span className="block font-medium">{t.name}</span>
              <span className="block text-xs text-ink-500">{FAMILY_LABEL[t.family]}</span>
            </button>
          </li>
        ))}
      </ul>
      <article className="min-w-0 space-y-4" aria-labelledby="fx-title">
        <header>
          <p className="eyebrow">{FAMILY_LABEL[f.family]}</p>
          <h2 id="fx-title" className="text-xl font-semibold text-ink-100">
            {f.name}
          </h2>
          <p className="mt-0.5 text-sm text-ink-400">{f.standards}</p>
        </header>
        <ToolViewer3D key={f.id} toolId={f.id} label={`Modelo 3D: ${f.name}`} selectedPartId={partId} onSelectPart={setPartId} />
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Partes">
          {f.parts.map((p) => (
            <button
              key={p.id}
              onClick={() => setPartId(p.id)}
              aria-pressed={partId === p.id}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                partId === p.id ? 'border-accent bg-accent-soft text-ink-100' : 'border-ink-700 text-ink-300 hover:text-ink-100'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
        {part && (
          <p className="rounded-lg border border-ink-800 bg-ink-900 p-3 text-sm text-ink-200" role="status">
            <span className="font-semibold text-ink-100">{part.name}: </span>
            {part.description}
          </p>
        )}
        <dl className="grid gap-3 sm:grid-cols-2">
          {[
            ['O que é', f.whatItIs],
            ['Quando usar', f.whenToUse],
            ['Como reconhecer', f.identify],
            ['Ferramenta', f.tool]
          ].map(([k, v]) => (
            <div key={k} className="card p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">{k}</dt>
              <dd className="mt-1 text-sm text-ink-200">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="flex gap-2 rounded-lg border border-amber-800/50 bg-amber-950/20 p-3 text-sm text-amber-100/90">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {f.watchOut}
        </p>
        <SizeTable />
      </article>
    </div>
  );
};

const SizeTable: React.FC = () => (
  <section className="card overflow-x-auto p-4" aria-labelledby="size-title">
    <h3 id="size-title" className="text-sm font-semibold text-ink-100">
      Referência rápida — rosca métrica grossa
    </h3>
    <table className="mt-2 w-full min-w-[480px] text-left text-sm">
      <thead className="text-xs text-ink-400">
        <tr>
          <th className="py-1.5 pr-3 font-medium">Rosca</th>
          <th className="py-1.5 pr-3 font-medium">Passo (mm)</th>
          <th className="py-1.5 pr-3 font-medium">Sextavado ISO 4017 / porca ISO 4032 (mm)</th>
          <th className="py-1.5 pr-3 font-medium">DIN 933/934 (mm)</th>
          <th className="py-1.5 font-medium">Allen ISO 4762 (mm)</th>
        </tr>
      </thead>
      <tbody className="font-mono text-ink-200">
        {FASTENER_SIZE_TABLE.map((r) => (
          <tr key={r.size} className="border-t border-ink-800">
            <td className="py-1.5 pr-3">{r.size}</td>
            <td className="py-1.5 pr-3">{r.pitch}</td>
            <td className="py-1.5 pr-3">{r.hexIso}</td>
            <td className={`py-1.5 pr-3 ${r.hexDin !== r.hexIso ? 'text-accent-text' : ''}`}>{r.hexDin}</td>
            <td className="py-1.5">{r.socket}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <p className="mt-2 text-xs text-ink-500">Em destaque: medidas que mudam entre a norma ISO e a DIN antiga. Confira a cabeça antes de escolher a chave.</p>
  </section>
);

/* ───────────────────────── Comparar ───────────────────────── */

const FastenerCompare: React.FC = () => {
  const [a, setA] = useState('parafuso-sextavado');
  const [b, setB] = useState('parafuso-allen');
  const fa = FASTENER_BY_ID[a];
  const fb = FASTENER_BY_ID[b];
  const [sel, setSel] = useState<string | null>(null);
  const select = (label: string, value: string, onChange: (v: string) => void) => (
    <label className="block text-sm">
      <span className="font-medium text-ink-200">{label}</span>
      <select
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setSel(null);
        }}
        className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-ink-100"
      >
        {FASTENER_TYPES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {select('Fixador de cima', a, setA)}
        {select('Fixador de baixo', b, setB)}
      </div>
      {a === b ? (
        <p className="rounded-lg border border-ink-700 p-4 text-sm text-ink-300">Escolha dois fixadores diferentes para comparar.</p>
      ) : (
        <ToolViewer3D key={`${a}|${b}`} toolId={`comparar:${a}|${b}`} label={`Comparação 3D: ${fa.name} e ${fb.name}`} selectedPartId={sel} onSelectPart={setSel} />
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="text-xs text-ink-400">
            <tr>
              <th className="w-36 py-2 pr-3 font-medium" />
              <th className="py-2 pr-3 font-semibold text-ink-100">{fa.name}</th>
              <th className="py-2 font-semibold text-ink-100">{fb.name}</th>
            </tr>
          </thead>
          <tbody className="align-top text-ink-300">
            {(
              [
                ['Normas', 'standards'],
                ['Quando usar', 'whenToUse'],
                ['Ferramenta', 'tool'],
                ['Atenção', 'watchOut']
              ] as const
            ).map(([k, field]) => (
              <tr key={k} className="border-t border-ink-800">
                <th scope="row" className="py-2 pr-3 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  {k}
                </th>
                <td className="py-2 pr-3">{fa[field]}</td>
                <td className="py-2">{fb[field]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ───────────────────────── Seleção guiada ───────────────────────── */

const VERDICT_STYLE: Record<StepVerdict, string> = {
  best: 'border-emerald-600 bg-emerald-950/30',
  ok: 'border-sky-700 bg-sky-950/30',
  missing: 'border-sky-700 bg-sky-950/30',
  wrong: 'border-amber-600/70 bg-amber-950/20'
};
const VERDICT_LABEL: Record<StepVerdict, string> = {
  best: 'Certo',
  ok: 'Possível, com ressalva',
  missing: 'Isso mesmo: falta informação',
  wrong: 'Não é a melhor escolha'
};

const FastenerSelection: React.FC = () => {
  const { playerProfile } = useGameState();
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const scenario = SELECTION_SCENARIOS.find((s) => s.id === scenarioId);
  if (scenario) return <SelectionRun key={scenario.id} scenario={scenario} onBack={() => setScenarioId(null)} />;
  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-300">
        Nove etapas, da função da junta ao aperto. Cada escolha precisa vir de um dado do desenho, do manual ou de uma medição. Quando o dado não existe, a resposta certa é
        dizer o que falta.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {SELECTION_SCENARIOS.map((s) => {
          const done = playerProfile.completedTasks.includes(fastenerScenarioTask(s.id));
          return (
            <li key={s.id}>
              <button onClick={() => setScenarioId(s.id)} className="card flex h-full w-full flex-col gap-1.5 p-4 text-left hover:border-ink-500">
                <span className="flex items-center justify-between text-xs text-ink-400">
                  {s.complete ? 'Dados completos' : 'Dados incompletos'}
                  {done && <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-label="Concluído" />}
                </span>
                <span className="font-semibold text-ink-100">{s.title}</span>
                <span className="text-sm text-ink-400">{s.context}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const SelectionRun: React.FC<{ scenario: SelectionScenario; onBack: () => void }> = ({ scenario, onBack }) => {
  const { completeTask } = useGameState();
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<Record<number, number[]>>({});
  const s = scenario.steps[step];
  const tried = picked[step] || [];
  const last = tried.length ? s.options[tried[tried.length - 1]] : undefined;
  const stepDone = (i: number) => (picked[i] || []).some((o) => scenario.steps[i].options[o].verdict !== 'wrong');
  const solved = stepDone(step);
  const finished = scenario.steps.every((_, i) => stepDone(i));
  const [showSummary, setShowSummary] = useState(false);

  const order = useMemo(() => {
    const o = s.options.map((_, i) => i);
    // ordem estável e diferente por etapa
    return o.sort((x, y) => ((x * 7 + step * 3) % 5) - ((y * 7 + step * 3) % 5));
  }, [s, step]);

  const pick = (i: number) => {
    if (solved || tried.includes(i)) return;
    setPicked((p) => ({ ...p, [step]: [...(p[step] || []), i] }));
  };

  const next = () => {
    if (step < scenario.steps.length - 1) setStep(step + 1);
    else {
      setShowSummary(true);
      completeTask(fastenerScenarioTask(scenario.id), `Seleção de fixador: ${scenario.title}`, 30);
    }
  };

  if (showSummary && finished) {
    return (
      <section className="space-y-4" aria-labelledby="sum-title">
        <h2 id="sum-title" className="flex items-center gap-2 text-lg font-semibold text-ink-100">
          <ClipboardList className="h-5 w-5 text-accent" aria-hidden /> {scenario.complete ? 'Especificação montada' : 'Seleção incompleta — e isso é o resultado certo'}
        </h2>
        <ol className="space-y-1.5">
          {scenario.steps.map((st, i) => {
            const missing = st.result.startsWith('FALTA');
            return (
              <li key={st.id} className={`flex gap-3 rounded-lg border p-3 text-sm ${missing ? 'border-sky-800 bg-sky-950/20' : 'border-ink-800 bg-ink-900'}`}>
                <span className="w-6 shrink-0 font-mono text-ink-500">{i + 1}</span>
                <span className="w-40 shrink-0 font-medium text-ink-300">{st.title}</span>
                <span className={missing ? 'text-sky-200' : 'text-ink-100'}>{st.result}</span>
              </li>
            );
          })}
        </ol>
        <p className={`rounded-xl border p-4 text-sm leading-relaxed ${scenario.complete ? 'border-emerald-800/60 bg-emerald-950/20 text-ink-100' : 'border-sky-800 bg-sky-950/20 text-ink-100'}`}>
          {scenario.conclusion}
        </p>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={onBack}>
            Outro cenário
          </button>
          <button
            className="btn-ghost"
            onClick={() => {
              setPicked({});
              setStep(0);
              setShowSummary(false);
            }}
          >
            <RotateCcw className="h-4 w-4" aria-hidden /> Refazer
          </button>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="step-title" className="space-y-4">
      <button className="btn-ghost -ml-3" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> Cenários
      </button>
      <div>
        <p className="eyebrow">{scenario.title}</p>
        <p className="mt-1 text-sm text-ink-300">{scenario.context}</p>
      </div>
      <ol className="flex flex-wrap gap-1" aria-label="Etapas">
        {scenario.steps.map((st, i) => (
          <li key={st.id}>
            <button
              onClick={() => (i <= step || stepDone(i - 1) ? setStep(i) : undefined)}
              aria-current={i === step ? 'step' : undefined}
              aria-label={`Etapa ${i + 1}: ${st.title}${stepDone(i) ? ' (resolvida)' : ''}`}
              className={`flex h-8 w-8 items-center justify-center rounded-md border text-xs font-semibold ${
                i === step ? 'border-accent bg-accent-soft text-ink-100' : stepDone(i) ? 'border-emerald-700 text-emerald-300' : 'border-ink-700 text-ink-500'
              }`}
            >
              {stepDone(i) && i !== step ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : i + 1}
            </button>
          </li>
        ))}
      </ol>
      <div className="card p-5">
        <p className="text-xs font-semibold text-ink-400">
          Etapa {step + 1} de {scenario.steps.length}
        </p>
        <h2 id="step-title" className="mt-0.5 text-lg font-semibold text-ink-100">
          {s.title}
        </h2>
        <ul className="mt-3 space-y-1 rounded-lg border border-ink-800 bg-ink-900 p-3 text-sm text-ink-200" aria-label="Dados disponíveis">
          {s.data.map((d) => (
            <li key={d}>• {d}</li>
          ))}
        </ul>
        <p className="mt-4 font-medium text-ink-100">{s.question}</p>
        <ul className="mt-2 space-y-2">
          {order.map((i) => {
            const o = s.options[i];
            const was = tried.includes(i);
            const reveal = was || solved;
            return (
              <li key={i}>
                <button
                  onClick={() => pick(i)}
                  disabled={solved || was}
                  className={`w-full rounded-xl border p-3 text-left text-sm text-ink-100 disabled:cursor-default ${
                    reveal ? VERDICT_STYLE[o.verdict] : 'border-ink-700 bg-ink-850 hover:border-ink-500'
                  } ${solved && !was ? 'opacity-60' : ''}`}
                >
                  <span className="flex items-start gap-2">
                    {o.verdict === 'missing' && reveal ? <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" aria-hidden /> : null}
                    {o.text}
                  </span>
                  {was && (
                    <span className="mt-1 block text-ink-300">
                      <span className="font-semibold">{VERDICT_LABEL[o.verdict]}:</span> {o.feedback}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        <div role="status" aria-live="polite">
          {last && !solved && <p className="mt-3 text-sm text-amber-200">Releia os dados e tente outra opção.</p>}
          {solved && (
            <p className="mt-3 text-sm text-ink-300">
              <span className="font-semibold text-ink-100">Registro desta etapa: </span>
              {s.result}
            </p>
          )}
        </div>
        {solved && (
          <div className="mt-4 flex justify-end">
            <button className="btn-primary" onClick={next}>
              {step < scenario.steps.length - 1 ? 'Próxima etapa' : 'Ver resultado'} <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
