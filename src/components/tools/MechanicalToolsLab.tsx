import React, { useEffect, useRef, useState } from 'react';
import { useGameState } from '../../context/GameStateContext';
import { MECHANICAL_TOOLS_CATALOG, TOOL_SELECTION_SCENARIOS, MechanicalToolProfile } from '../../data/mechanicalToolsData';
import { LESSONS_BY_ID } from '../../data/lessonsData';
import { PRACTICE_TOPICS } from '../../data/practiceBank';
import { Page, PageHeader } from '../ui';
import { ToolViewer3D, TOOLS_WITH_3D_MODEL } from './ToolViewer3D';
import { ToolIllustration2D } from './ToolIllustration2D';
import { ToolChoicePractice } from './ToolChoicePractice';
import { FastenersModule } from './FastenersModule';
import { SELECTION_SCENARIOS, fastenerScenarioTask } from '../../data/fasteners';
import { CaliperTrainer, CALIPER_CHALLENGES } from './CaliperTrainer';
import { MicrometerTrainer, MICROMETER_CHALLENGES, micrometerTask } from './MicrometerTrainer';
import { AlertTriangle, ArrowRight, BookOpen, CheckCircle2, Search, ShieldCheck, Target } from 'lucide-react';

/** Normaliza texto para busca sem acentos e sem diferenciar maiúsculas. */
const normalize = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const CATEGORY_FILTERS: { id: 'todas' | MechanicalToolProfile['category']; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'manuais', label: 'Manuais' },
  { id: 'medicao', label: 'Medição' },
  { id: 'manutencao', label: 'Manutenção' }
];

const CATEGORY_LABEL: Record<MechanicalToolProfile['category'], string> = {
  manuais: 'Ferramenta manual',
  medicao: 'Instrumento de medição',
  manutencao: 'Ferramenta de manutenção'
};

/** Onde cada categoria é praticada e estudada (tema de prática + aula da trilha). */
const RELATED: Record<MechanicalToolProfile['category'], { topicId: string; lessonId: string }> = {
  manuais: { topicId: 'ferramentas', lessonId: 'lesson-beginner-tools-fasteners' },
  medicao: { topicId: 'medicao', lessonId: 'lesson-centrifugal-pump' },
  manutencao: { topicId: 'rolamentos', lessonId: 'lesson-gearbox-fundamentals' }
};

type Mode = 'biblioteca' | 'fixadores' | 'escolher' | 'paquimetro' | 'micrometro';
/** Endereços diretos das atividades (#/ferramentas/qual-ferramenta, #/ferramentas/treino-paquimetro). */
const MODE_PARAMS: Record<string, Mode> = { fixadores: 'fixadores', 'qual-ferramenta': 'escolher', 'treino-paquimetro': 'paquimetro', 'treino-micrometro': 'micrometro' };

const Section: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <section className="card p-5">
    <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-ink-100">
      {icon}
      {title}
    </h3>
    {children}
  </section>
);

const ToolDetail: React.FC<{ tool: MechanicalToolProfile }> = ({ tool }) => {
  const { playerProfile, markToolMastered, navigateTo } = useGameState();
  const has3D = TOOLS_WITH_3D_MODEL.includes(tool.id);
  const [view, setView] = useState<'3d' | '2d'>(has3D ? '3d' : '2d');
  const [partId, setPartId] = useState(tool.parts[0]?.id ?? null);
  const [answer, setAnswer] = useState<number | null>(null);
  const mastered = playerProfile.masteredTools.includes(tool.id);
  const part = tool.parts.find((p) => p.id === partId) || tool.parts[0];
  const related = RELATED[tool.category];
  const topic = PRACTICE_TOPICS.find((t) => t.id === related.topicId);
  const lesson = LESSONS_BY_ID[related.lessonId];
  const picked = answer !== null ? tool.knowledgeQuestion.options[answer] : null;

  const choose = (i: number) => {
    setAnswer(i);
    if (tool.knowledgeQuestion.options[i].isCorrect && !mastered) markToolMastered(tool.id, tool.name);
  };

  return (
    <div className="space-y-4">
      <section className="card p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow">{CATEGORY_LABEL[tool.category]}</p>
            <h2 className="mt-1 text-xl font-bold text-ink-100">{tool.name}</h2>
            <p className="mt-1 text-sm text-ink-300">{tool.subtitle}</p>
          </div>
          {mastered && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-800 px-2.5 py-1 text-xs font-semibold text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              Estudada
            </span>
          )}
        </div>

        {has3D && (
          <div role="tablist" aria-label="Forma de visualizar" className="mb-3 inline-flex rounded-lg border border-ink-800 bg-ink-950 p-1">
            {(['3d', '2d'] as const).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={`rounded-md px-3 py-1 text-sm font-medium ${view === v ? 'bg-ink-800 text-ink-100' : 'text-ink-400 hover:text-ink-100'}`}
              >
                {v === '3d' ? 'Modelo 3D' : 'Desenho'}
              </button>
            ))}
          </div>
        )}

        {view === '3d' && has3D ? (
          <ToolViewer3D toolId={tool.id} selectedPartId={part?.id ?? null} onSelectPart={setPartId} />
        ) : (
          <div className="overflow-hidden rounded-lg border border-ink-800 bg-paper">
            <svg viewBox="0 0 500 220" role="img" aria-label={`Desenho esquemático: ${tool.name}`} className="mx-auto h-56 w-full max-w-[520px]">
              <ToolIllustration2D toolId={tool.id} />
              {tool.parts.map((p, i) => {
                const active = part?.id === p.id;
                return (
                  <g key={p.id} onClick={() => setPartId(p.id)} className="cursor-pointer">
                    <circle cx={p.svgX} cy={p.svgY} r={active ? 14 : 12} fill={active ? '#e8590c' : '#1d1e1b'} stroke="#fff" strokeWidth="2.5" />
                    <text x={p.svgX} y={p.svgY + 4} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" fontFamily="Inter, sans-serif">
                      {i + 1}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        <p className="mt-4 mb-2 text-sm font-medium text-ink-200">Como identificar — partes da ferramenta</p>
        <div className="flex flex-wrap gap-2">
          {tool.parts.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setPartId(p.id)}
              aria-pressed={part?.id === p.id}
              className={`rounded-lg border px-3 py-1.5 text-sm ${
                part?.id === p.id ? 'border-accent bg-accent-soft text-ink-100' : 'border-ink-700 text-ink-300 hover:text-ink-100'
              }`}
            >
              {i + 1}. {p.name}
            </button>
          ))}
        </div>
        {part && <p className="mt-3 rounded-lg bg-ink-950 p-3 text-sm leading-relaxed text-ink-200">{part.description}</p>}
      </section>

      <Section title="Para que serve">
        <p className="text-sm leading-relaxed text-ink-200">{tool.purpose}</p>
        <p className="mt-3 text-sm font-medium text-ink-200">Onde se usa na prática</p>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink-300">
          {tool.commonApplications.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </Section>

      <Section title="Quando escolher esta ferramenta">
        <p className="text-sm leading-relaxed text-ink-200">{tool.selectionCriteria}</p>
        <details className="mt-3 rounded-lg border border-ink-800 bg-ink-950 p-3">
          <summary className="cursor-pointer text-sm font-medium text-ink-200">Comparar: {tool.comparison.comparedWith}</summary>
          <p className="mt-2 text-sm leading-relaxed text-ink-300">{tool.comparison.differenceExplanation}</p>
        </details>
      </Section>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Erros comuns" icon={<AlertTriangle className="h-4 w-4 text-amber-400" aria-hidden />}>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-300">
            {tool.typicalMistakes.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </Section>
        <Section title="Segurança" icon={<ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden />}>
          <p className="text-sm leading-relaxed text-ink-300">{tool.safetyNotes}</p>
        </Section>
      </div>

      <section className="card p-5" aria-labelledby="check-title">
        <h3 id="check-title" className="text-base font-semibold text-ink-100">
          Verifique o que aprendeu
        </h3>
        <p className="mt-2 text-base text-ink-100">{tool.knowledgeQuestion.question}</p>
        <div className="mt-3 space-y-2">
          {tool.knowledgeQuestion.options.map((opt, i) => {
            const isPicked = answer === i;
            const style = !isPicked
              ? 'border-ink-700 bg-ink-950 text-ink-200 hover:border-ink-500'
              : opt.isCorrect
              ? 'border-emerald-600 bg-emerald-950/50 text-emerald-100'
              : 'border-amber-600 bg-amber-950/40 text-amber-100';
            return (
              <button
                key={opt.text}
                onClick={() => choose(i)}
                disabled={Boolean(picked?.isCorrect)}
                aria-pressed={isPicked}
                className={`w-full rounded-lg border p-3 text-left text-sm disabled:cursor-default ${style}`}
              >
                {opt.text}
              </button>
            );
          })}
        </div>
        {picked && (
          <p role="status" className="mt-3 rounded-lg bg-ink-950 p-3 text-sm leading-relaxed text-ink-200">
            <strong className="text-ink-100">{picked.isCorrect ? 'Isso mesmo. ' : 'Ainda não — tente outra opção. '}</strong>
            {picked.feedback}
          </p>
        )}
      </section>

      <Section title="Continue aprendendo" icon={<BookOpen className="h-4 w-4 text-ink-400" aria-hidden />}>
        <div className="flex flex-wrap gap-2">
          {topic && (
            <button onClick={() => navigateTo('practice', topic.id)} className="btn-secondary">
              <Target className="h-4 w-4" aria-hidden />
              Praticar: {topic.title}
            </button>
          )}
          {lesson && (
            <button onClick={() => navigateTo('quiz', lesson.id)} className="btn-ghost">
              Aula relacionada
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      </Section>
    </div>
  );
};

export const MechanicalToolsLab: React.FC = () => {
  const { activeParam, playerProfile, navigateTo } = useGameState();
  const [mode, setMode] = useState<Mode>(() => MODE_PARAMS[activeParam || ''] || 'biblioteca');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORY_FILTERS)[number]['id']>('todas');
  const detailRef = useRef<HTMLDivElement>(null);
  const selectedId = MECHANICAL_TOOLS_CATALOG.some((t) => t.id === activeParam) ? activeParam! : MECHANICAL_TOOLS_CATALOG[0].id;
  const tool = MECHANICAL_TOOLS_CATALOG.find((t) => t.id === selectedId)!;

  // Ao trocar de ferramenta pela URL (voltar/avançar), volta para a biblioteca; endereços de atividade abrem a aba certa.
  useEffect(() => {
    if (activeParam) setMode(MODE_PARAMS[activeParam] || 'biblioteca');
  }, [activeParam]);

  const filtered = MECHANICAL_TOOLS_CATALOG.filter((t) => {
    if (category !== 'todas' && t.category !== category) return false;
    if (!query.trim()) return true;
    const hay = normalize([t.name, t.subtitle, t.purpose, ...t.commonApplications].join(' '));
    return normalize(query.trim())
      .split(/\s+/)
      .every((w) => hay.includes(w));
  });

  const scenariosDone = TOOL_SELECTION_SCENARIOS.filter((s) => playerProfile.completedTasks.includes(`task-tool-scenario-${s.id}`)).length;
  const caliperDone = CALIPER_CHALLENGES.filter((c) => playerProfile.completedTasks.includes(`task-caliper-${c.id}`)).length;
  const microDone = MICROMETER_CHALLENGES.filter((c) => playerProfile.completedTasks.includes(micrometerTask(c.id))).length;

  const tabs: { id: Mode; label: string; count: string }[] = [
    { id: 'biblioteca', label: 'Biblioteca', count: `${playerProfile.masteredTools.length}/${MECHANICAL_TOOLS_CATALOG.length}` },
    {
      id: 'fixadores',
      label: 'Fixadores',
      count: `${SELECTION_SCENARIOS.filter((s) => playerProfile.completedTasks.includes(fastenerScenarioTask(s.id))).length}/${SELECTION_SCENARIOS.length}`
    },
    { id: 'escolher', label: 'Qual ferramenta usar?', count: `${scenariosDone}/${TOOL_SELECTION_SCENARIOS.length}` },
    { id: 'paquimetro', label: 'Ler o paquímetro', count: `${caliperDone}/${CALIPER_CHALLENGES.length}` },
    { id: 'micrometro', label: 'Ler o micrômetro', count: `${microDone}/${MICROMETER_CHALLENGES.length}` }
  ];

  const selectTool = (id: string) => {
    navigateTo('tools', id, { replace: true });
    // No celular os detalhes ficam abaixo da lista: leva o aluno até eles.
    if (window.innerWidth < 1024) requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <Page>
      <PageHeader
        title="Ferramentas e instrumentos"
        description="Para que serve cada ferramenta, como reconhecer, quando escolher e como usar com segurança."
      />

      <div role="tablist" aria-label="Atividades" className="mb-6 flex gap-1 overflow-x-auto border-b border-ink-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={mode === t.id}
            onClick={() => setMode(t.id)}
            className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium ${
              mode === t.id ? 'border-accent text-ink-100' : 'border-transparent text-ink-400 hover:text-ink-100'
            }`}
          >
            {t.label}
            <span className="rounded-full bg-ink-800 px-2 py-0.5 font-mono text-xs text-ink-300">{t.count}</span>
          </button>
        ))}
      </div>

      {mode === 'biblioteca' && (
        <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
          <aside className="space-y-3 lg:sticky lg:top-4 lg:self-start">
            <label htmlFor="busca-ferramenta" className="block text-sm font-medium text-ink-200">
              Buscar ferramenta
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden />
              <input
                id="busca-ferramenta"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex.: torque, rolamento, medir"
                className="w-full rounded-lg border border-ink-700 bg-ink-950 py-2 pl-9 pr-3 text-sm text-ink-100 placeholder:text-ink-500 focus:border-accent focus:outline-none"
              />
            </div>
            <div role="group" aria-label="Filtrar por categoria" className="flex flex-wrap gap-1.5">
              {CATEGORY_FILTERS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  aria-pressed={category === c.id}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${
                    category === c.id ? 'border-accent bg-accent-soft text-ink-100' : 'border-ink-700 text-ink-400 hover:text-ink-100'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <ul className="space-y-1.5" aria-live="polite">
              {filtered.length === 0 && (
                <li className="rounded-lg border border-dashed border-ink-700 p-4 text-sm text-ink-400">
                  Nenhuma ferramenta encontrada para “{query}”. Tente outra palavra ou limpe o filtro.
                </li>
              )}
              {filtered.map((t) => {
                const active = t.id === tool.id;
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => selectTool(t.id)}
                      aria-current={active ? 'true' : undefined}
                      className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm ${
                        active ? 'border-accent bg-ink-850 text-ink-100' : 'border-ink-800 bg-ink-900 text-ink-300 hover:border-ink-700 hover:text-ink-100'
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block font-medium">{t.name}</span>
                        <span className="block text-xs text-ink-500">{CATEGORY_LABEL[t.category]}</span>
                      </span>
                      {playerProfile.masteredTools.includes(t.id) && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-label="estudada" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>
          <div ref={detailRef} className="min-w-0 scroll-mt-4">
            <ToolDetail key={tool.id} tool={tool} />
          </div>
        </div>
      )}

      {mode === 'fixadores' && <FastenersModule />}
      {mode === 'escolher' && <ToolChoicePractice onFinish={() => setMode('paquimetro')} />}
      {mode === 'paquimetro' && <CaliperTrainer />}
      {mode === 'micrometro' && <MicrometerTrainer />}
    </Page>
  );
};
