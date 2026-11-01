import React, { useMemo, useState } from 'react';
import { ArrowRight, Box, CheckCircle2, Clock, Factory, FileText, Info, PlayCircle, Search, ShieldAlert } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import {
  AVAILABILITY_LABEL,
  Availability,
  EQUIPMENT,
  EQUIPMENT_BY_ID,
  EquipmentEntry,
  PLANT_AREAS
} from '../../data/industry/industryCatalog';
import { INDUSTRY_MISSIONS, INDUSTRY_MISSIONS_BY_ID, MISSION_GAME_PREFIX } from '../../data/industry/industryMissions';
import { Page, PageHeader } from '../ui';
import { ClaimBadge, NotQualificationNote, RefLink } from '../safety/SourceBits';
import { PlantMap } from './PlantMap';
import { MissionRunner } from './MissionRunner';
import { PNEUMATIC_BENCH_ID, PNEUMATIC_TASK_COUNT, PneumaticBench } from './PneumaticBench';
import { BearingAssemblyDrawing, ConveyorDriveSchematic, DiaphragmFlowSchematic, MotorGearboxSchematic } from './TechnicalDrawings';

/** Desenho de cada ficha: título, o que observar e o componente. */
const EQUIPMENT_DRAWINGS: Record<NonNullable<EquipmentEntry['drawingId']>, { title: string; observe: string; Figure: React.FC }> = {
  'bearing-assembly': {
    title: 'Desenho de conjunto',
    observe: 'Observe: o eixo e as chavetas não são hachurados; as esferas aparecem inteiras; o rolamento de rolos não tem rebordos no anel interno.',
    Figure: () => <BearingAssemblyDrawing />
  },
  'conveyor-drive': {
    title: 'Esquema do acionamento',
    observe: 'Observe: o redutor fica entre o motor e a polia; é ele que troca rotação por torque.',
    Figure: ConveyorDriveSchematic
  },
  'motor-gearbox': {
    title: 'Esquema do acionamento',
    observe: 'Observe: a coroa é maior que o pinhão na mesma proporção do número de dentes, e as setas de giro apontam em sentidos contrários.',
    Figure: MotorGearboxSchematic
  },
  'diaphragm-flow': {
    title: 'Esquema de fluxo',
    observe: 'Observe: em cada curso só abrem duas esferas — a de baixo do lado que aspira e a de cima do lado que empurra.',
    Figure: DiaphragmFlowSchematic
  }
};

type Tab = 'planta' | 'equipamentos' | 'missoes' | 'desenhos';

const TABS: { id: Tab; label: string }[] = [
  { id: 'planta', label: 'Planta' },
  { id: 'equipamentos', label: 'Equipamentos' },
  { id: 'missoes', label: 'Missões' },
  { id: 'desenhos', label: 'Desenhos e aula' }
];

/** Ciclo de aprendizagem da seção (cada atividade diz em que passo está). */
const CYCLE = ['Explorar', 'Aprender', 'Observar', 'Praticar', 'Diagnosticar', 'Revisar'];

const AVAIL_STYLE: Record<Availability, string> = {
  'lab-3d': 'border-emerald-700/60 bg-emerald-950/30 text-emerald-200',
  simulator: 'border-violet-700/60 bg-violet-950/30 text-violet-200',
  'in-other-3d': 'border-sky-700/60 bg-sky-950/30 text-sky-200',
  info: 'border-ink-600 bg-ink-800 text-ink-300',
  planned: 'border-amber-700/60 bg-amber-950/30 text-amber-200'
};

const AvailBadge: React.FC<{ a: Availability }> = ({ a }) => (
  <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${AVAIL_STYLE[a]}`}>
    {a === 'lab-3d' ? <Box className="h-3 w-3" aria-hidden /> : a === 'planned' ? <Clock className="h-3 w-3" aria-hidden /> : <Info className="h-3 w-3" aria-hidden />}
    {AVAILABILITY_LABEL[a]}
  </span>
);

export const IndustryPage: React.FC = () => {
  const { activeParam, navigateTo } = useGameState();
  const param = activeParam || 'planta';

  const mission = INDUSTRY_MISSIONS_BY_ID[param];
  if (mission) {
    return (
      <Page width="reading">
        <MissionRunner key={mission.id} mission={mission} onBack={() => navigateTo('industry', 'missoes')} />
      </Page>
    );
  }
  if (param === PNEUMATIC_BENCH_ID) {
    return (
      <Page>
        <PneumaticBench onBack={() => navigateTo('industry', 'planta')} />
      </Page>
    );
  }
  const eqId = param.startsWith('equipamento-') ? param.slice('equipamento-'.length) : null;
  if (eqId && EQUIPMENT_BY_ID[eqId]) {
    return (
      <Page width="reading">
        <EquipmentDetail e={EQUIPMENT_BY_ID[eqId]} />
      </Page>
    );
  }
  const tab: Tab = (TABS.find((t) => t.id === param)?.id as Tab) || 'planta';

  return (
    <Page>
      <PageHeader
        eyebrow="Planta-escola"
        title="Indústria na prática"
        description="Como as peças trabalham juntas dentro de uma fábrica: uma planta-escola com bombas, transportador, acionamentos e mancais, missões de manutenção com evidências e desenhos para ligar o 3D ao papel."
      />
      <div className="mb-4 flex flex-wrap items-start gap-2 rounded-xl border border-ink-700 bg-ink-900 p-3 text-sm text-ink-300">
        <Factory className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
        <p className="flex-1">
          A planta é <strong className="text-ink-100">fictícia</strong> e os cenários são <strong className="text-ink-100">simulados</strong>: não reproduzem nenhuma
          empresa real. O Mecânica Lab é um protótipo educacional independente — não é sistema oficial de nenhuma empresa ou instituição.
        </p>
      </div>
      <ol className="mb-5 flex flex-wrap gap-1.5 text-xs" aria-label="Ciclo de aprendizagem">
        {CYCLE.map((c, i) => (
          <li key={c} className="flex items-center gap-1.5 text-ink-300">
            {i > 0 && <span className="text-ink-600" aria-hidden>→</span>}
            <span className="font-mono text-ink-500">{i + 1}</span> {c}
          </li>
        ))}
      </ol>

      <div role="tablist" aria-label="Partes da seção" className="mb-5 flex flex-wrap gap-0.5 rounded-lg border border-ink-700 p-0.5 sm:inline-flex">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={t.id === tab}
            onClick={() => navigateTo('industry', t.id, { replace: true })}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${t.id === tab ? 'bg-ink-700 text-ink-100' : 'text-ink-400 hover:text-ink-100'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'planta' && <PlantTab />}
      {tab === 'equipamentos' && <CatalogTab />}
      {tab === 'missoes' && <MissionsTab />}
      {tab === 'desenhos' && <DrawingsTab />}
    </Page>
  );
};

/* ───────────────────────── Planta ───────────────────────── */

const PlantTab: React.FC = () => {
  const { navigateTo } = useGameState();
  const [area, setArea] = useState<string | null>('transporte');
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    EQUIPMENT.forEach((e) => (c[e.areaId] = (c[e.areaId] || 0) + 1));
    return c;
  }, []);
  const selected = PLANT_AREAS.find((a) => a.id === area);
  const items = EQUIPMENT.filter((e) => e.areaId === area);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div>
        <PlantMap selected={area} onSelect={setArea} counts={counts} />
        <p className="mt-2 text-xs text-ink-400">Toque em uma área para ver os equipamentos. Linhas tracejadas: ligações entre as áreas (água, giro, medições).</p>
      </div>
      <aside aria-live="polite" className="rounded-xl border border-ink-700 bg-ink-900 p-4" data-testid="plant-area-panel">
        {selected ? (
          <>
            <p className="eyebrow">Área {selected.code}</p>
            <h2 className="text-lg font-semibold text-ink-100">{selected.name}</h2>
            <p className="mt-1 text-sm text-ink-300">{selected.description}</p>
            <ul className="mt-3 space-y-2">
              {items.map((e) => (
                <li key={e.id} className="rounded-lg border border-ink-700 bg-ink-950 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-ink-100">{e.name}</span>
                    <AvailBadge a={e.availability} />
                  </div>
                  <p className="mt-1 text-sm text-ink-400">{e.function}</p>
                  <button className="btn-ghost -ml-2 mt-1 text-sm" onClick={() => navigateTo('industry', `equipamento-${e.id}`)}>
                    Ver ficha <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-sm text-ink-300">Escolha uma área no mapa.</p>
        )}
      </aside>
      {/* Alternativa em texto ao mapa */}
      <nav aria-label="Áreas da planta (lista)" className="lg:col-span-2">
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PLANT_AREAS.map((a) => (
            <li key={a.id}>
              <button
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${a.id === area ? 'border-accent text-ink-100' : 'border-ink-700 text-ink-300 hover:border-ink-500'}`}
                onClick={() => setArea(a.id)}
                aria-pressed={a.id === area}
              >
                <span className="font-mono text-ink-500">{a.code}</span> · {a.name} <span className="text-ink-500">({counts[a.id] || 0})</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

/* ───────────────────────── Catálogo ───────────────────────── */

const CatalogTab: React.FC = () => {
  const { navigateTo } = useGameState();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const cats = useMemo(() => Array.from(new Set(EQUIPMENT.map((e) => e.category))), []);
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const list = EQUIPMENT.filter(
    (e) => (!cat || e.category === cat) && (!q || norm([e.name, e.category, e.function, ...e.components].join(' ')).includes(norm(q)))
  );
  const order: Availability[] = ['lab-3d', 'simulator', 'in-other-3d', 'info', 'planned'];
  list.sort((a, b) => order.indexOf(a.availability) - order.indexOf(b.availability));

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Buscar equipamento</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar: rolamento, correia, bomba…"
            className="w-full rounded-lg border border-ink-700 bg-ink-900 py-2 pl-9 pr-3 text-sm text-ink-100 placeholder:text-ink-500"
            data-testid="equipment-search"
          />
        </label>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100"
          aria-label="Filtrar por categoria"
        >
          <option value="">Todas as categorias</option>
          {cats.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <p className="mb-3 text-sm text-ink-400" aria-live="polite">
        {list.length} equipamento(s). Os selos dizem o que já é interativo e o que ainda está planejado.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((e) => (
          <li key={e.id} className="flex flex-col rounded-xl border border-ink-700 bg-ink-900 p-4" data-testid={`equipment-card-${e.id}`}>
            <div className="flex flex-wrap items-center gap-2">
              <AvailBadge a={e.availability} />
              <span className="text-xs text-ink-400">{e.category}</span>
            </div>
            <h3 className="mt-2 font-semibold text-ink-100">{e.name}</h3>
            <p className="mt-1 flex-1 text-sm text-ink-300">{e.function}</p>
            <button className="btn-secondary mt-3 self-start text-sm" onClick={() => navigateTo('industry', `equipamento-${e.id}`)}>
              Abrir ficha <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="text-sm text-ink-300">Nada encontrado. Tente outra palavra.</p>}
    </div>
  );
};

const EquipmentDetail: React.FC<{ e: EquipmentEntry }> = ({ e }) => {
  const { navigateTo } = useGameState();
  const area = PLANT_AREAS.find((a) => a.id === e.areaId);
  return (
    <article data-testid={`equipment-detail-${e.id}`}>
      <button className="btn-ghost -ml-2 mb-2 text-sm" onClick={() => navigateTo('industry', 'equipamentos')}>
        ← Catálogo de equipamentos
      </button>
      <div className="flex flex-wrap items-center gap-2">
        <AvailBadge a={e.availability} />
        <span className="text-sm text-ink-400">
          {e.category} · Área {area?.code} — {area?.name}
        </span>
      </div>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink-100 sm:text-3xl">{e.name}</h1>
      <p className="mt-2 text-base text-ink-300">{e.function}</p>
      {e.availability === 'planned' && (
        <p className="mt-3 rounded-lg border border-amber-700/60 bg-amber-950/30 p-3 text-sm text-amber-100">
          Conteúdo planejado: esta ficha é informativa e ainda não tem modelo 3D nem atividade prática.
        </p>
      )}

      <section className="mt-5">
        <h2 className="text-lg font-semibold text-ink-100">Como funciona</h2>
        <p className="mt-1 text-ink-300">{e.principle}</p>
      </section>
      <section className="mt-5">
        <h2 className="text-lg font-semibold text-ink-100">Componentes importantes</h2>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {e.components.map((c) => (
            <li key={c} className="rounded-full border border-ink-700 px-2.5 py-1 text-sm text-ink-200">
              {c}
            </li>
          ))}
        </ul>
      </section>

      {e.drawingId &&
        (() => {
          const d = EQUIPMENT_DRAWINGS[e.drawingId];
          return (
            <section className="mt-5">
              <h2 className="text-lg font-semibold text-ink-100">{d.title}</h2>
              <p className="mb-2 mt-1 text-sm text-ink-400">{d.observe}</p>
              <d.Figure />
            </section>
          );
        })()}

      <section className="mt-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-ink-100">
          <ShieldAlert className="h-5 w-5 text-accent" aria-hidden /> Segurança
        </h2>
        <ul className="mt-2 space-y-2">
          {e.safety.map((s) => (
            <li key={s.text} className="flex flex-wrap items-start gap-2 text-sm text-ink-300">
              <ClaimBadge kind={s.kind} />
              <span className="min-w-[12rem] flex-1">{s.text}</span>
              {s.ref && <RefLink r={s.ref} />}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-5">
        <h2 className="text-lg font-semibold text-ink-100">Referências para consulta</h2>
        <ul className="mt-2 space-y-1 text-sm text-ink-300">
          {e.references.map((r) => (
            <li key={r.label}>
              <span className="mr-2 text-[11px] font-semibold uppercase tracking-wide text-ink-500">{r.kind}</span>
              {r.label}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-ink-500">Normas citadas pelo nome para consulta na versão vigente. Valores de projeto sempre vêm do fabricante e do projeto.</p>
      </section>

      {e.activities.length > 0 && (
        <section className="mt-5">
          <h2 className="text-lg font-semibold text-ink-100">Atividades</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {e.activities.map((a) => (
              <button key={a.label} className="btn-secondary" onClick={() => navigateTo(a.screen, a.param)}>
                {a.label} <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            ))}
          </div>
        </section>
      )}
      <NotQualificationNote className="mt-6" />
    </article>
  );
};

/* ───────────────────────── Missões ───────────────────────── */

const MissionsTab: React.FC = () => {
  const { navigateTo, playerProfile } = useGameState();
  return (
    <div>
      <p className="mb-4 max-w-2xl text-sm text-ink-300">
        Cada missão traz uma ordem de serviço, evidências e tarefas. O retorno explica o porquê de cada resposta. A missão só termina quando todas as tarefas
        estão certas — errar faz parte e fica registrado para revisão.
      </p>
      <ul className="grid gap-3 md:grid-cols-2">
        {INDUSTRY_MISSIONS.map((m) => {
          const rounds = playerProfile.gameResults[MISSION_GAME_PREFIX + m.id]?.rounds || {};
          const solved = m.tasks.filter((t) => rounds[t.id]?.solved).length;
          const eq = EQUIPMENT_BY_ID[m.equipmentId];
          return (
            <li key={m.id} className="flex flex-col rounded-xl border border-ink-700 bg-ink-900 p-4" data-testid={`mission-card-${m.id}`}>
              <p className="text-xs text-ink-400">
                {eq?.name} · {m.tasks.length} tarefas
              </p>
              <h3 className="mt-1 font-semibold text-ink-100">{m.title}</h3>
              <p className="mt-1 flex-1 text-sm text-ink-300">{m.objective}</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className={`text-xs ${solved === m.tasks.length ? 'text-emerald-300' : 'text-ink-400'}`}>
                  {solved === m.tasks.length ? (
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Concluída
                    </span>
                  ) : (
                    `${solved}/${m.tasks.length} tarefas`
                  )}
                </span>
                <button className="btn-primary text-sm" onClick={() => navigateTo('industry', m.id)}>
                  {solved === 0 ? 'Começar' : solved === m.tasks.length ? 'Revisar' : 'Continuar'} <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </li>
          );
        })}
        <li className="flex flex-col rounded-xl border border-violet-700/50 bg-ink-900 p-4" data-testid="mission-card-bancada-pneumatica">
          <p className="text-xs text-ink-400">Bancada pneumática · simulador · {PNEUMATIC_TASK_COUNT} tarefas</p>
          <h3 className="mt-1 font-semibold text-ink-100">Cilindro de dupla ação: comandar, regular e despressurizar</h3>
          <p className="mt-1 flex-1 text-sm text-ink-300">
            Regular a pressão, fazer o ciclo pela válvula 5/2, controlar a velocidade do avanço pelo lado certo e despressurizar antes de soltar uma conexão.
          </p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-xs text-ink-400">
              {Object.values(playerProfile.gameResults[MISSION_GAME_PREFIX + PNEUMATIC_BENCH_ID]?.rounds || {}).filter((r) => r.solved).length}/{PNEUMATIC_TASK_COUNT}{' '}
              tarefas
            </span>
            <button className="btn-primary text-sm" onClick={() => navigateTo('industry', PNEUMATIC_BENCH_ID)}>
              Abrir a bancada <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </li>
      </ul>
    </div>
  );
};

/* ───────────────────────── Desenhos e aula ───────────────────────── */

const NARRATED_LESSONS = [
  { id: 'rol-fixo-livre', title: 'rolamento fixo e rolamento livre' },
  { id: 'red-rotacao-torque', title: 'redutor troca rotação por torque' }
];

const DrawingsTab: React.FC = () => {
  const { navigateTo } = useGameState();
  return (
    <div className="space-y-6">
      <section aria-labelledby="aulas-narradas">
        <h2 id="aulas-narradas" className="sr-only">
          Aulas narradas
        </h2>
        <p className="mb-2 text-sm text-ink-300">Vídeos curtos com narração em português, legendas e transcrição, seguidos de uma pergunta e da prática no laboratório 3D.</p>
        <ul className="grid gap-3 md:grid-cols-2">
          {NARRATED_LESSONS.map((l) => (
            <li key={l.id} className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-900 p-4" data-testid={`narrated-${l.id}`}>
              <PlayCircle className="h-8 w-8 shrink-0 text-accent" aria-hidden />
              <h3 className="flex-1 font-semibold text-ink-100">Aula narrada: {l.title}</h3>
              <button className="btn-primary" onClick={() => navigateTo('micro', l.id)} aria-label={`Assistir: ${l.title}`}>
                Assistir <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <FileText className="h-5 w-5 text-accent" aria-hidden />
          <h2 className="text-lg font-semibold text-ink-100">Desenho de conjunto — eixo com mancais</h2>
          <span className="rounded-full border border-ink-600 px-2 py-0.5 text-[11px] font-semibold text-ink-300">Ilustração educativa · sem cotas</span>
        </div>
        <p className="mb-3 max-w-3xl text-sm text-ink-300">
          Gerado a partir das mesmas medidas do modelo 3D. Compare com o laboratório: a metade de cima está em corte, como se o conjunto fosse serrado no
          plano do eixo. O que observar: quais peças são hachuradas, onde ficam os rebordos do rolamento livre e o que segura cada rolamento no eixo.
        </p>
        <BearingAssemblyDrawing />
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={() => navigateTo('lab', 'bearing-assembly')}>
            Comparar com o 3D <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
          <button className="btn-secondary" onClick={() => navigateTo('industry', 'missao-ler-desenho')}>
            Missão: ler o desenho <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </section>

      <section>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <FileText className="h-5 w-5 text-accent" aria-hidden />
          <h2 className="text-lg font-semibold text-ink-100">Esquema — caminho do giro no transportador</h2>
          <span className="rounded-full border border-ink-600 px-2 py-0.5 text-[11px] font-semibold text-ink-300">Esquema conceitual</span>
        </div>
        <p className="mb-3 max-w-3xl text-sm text-ink-300">O que observar: cada bloco muda alguma coisa no giro. O redutor troca rotação por torque; a polia transforma giro em movimento da correia.</p>
        <ConveyorDriveSchematic />
        <button className="btn-secondary mt-3" onClick={() => navigateTo('lab', 'belt-conveyor')}>
          Ver em operação no 3D <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </section>

      <section>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <FileText className="h-5 w-5 text-accent" aria-hidden />
          <h2 className="text-lg font-semibold text-ink-100">Esquema — motor, acoplamento e redutor</h2>
          <span className="rounded-full border border-ink-600 px-2 py-0.5 text-[11px] font-semibold text-ink-300">Gerado do modelo 3D · sem cotas</span>
        </div>
        <p className="mb-3 max-w-3xl text-sm text-ink-300">
          Vista lateral simplificada, com os diâmetros primitivos do pinhão e da coroa na escala do modelo. O que observar: a relação vem do número de dentes, a
          coroa gira no sentido contrário ao pinhão e o redutor troca rotação por torque.
        </p>
        <MotorGearboxSchematic />
        <button className="btn-secondary mt-3" onClick={() => navigateTo('lab', 'motor-gearbox')}>
          Ver girando no 3D <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </section>

      <section>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <FileText className="h-5 w-5 text-accent" aria-hidden />
          <h2 className="text-lg font-semibold text-ink-100">Esquema — fluxo na bomba de duplo diafragma</h2>
          <span className="rounded-full border border-ink-600 px-2 py-0.5 text-[11px] font-semibold text-ink-300">Esquema conceitual</span>
        </div>
        <p className="mb-3 max-w-3xl text-sm text-ink-300">
          Os dois cursos lado a lado. O que observar: o ar empurra só um diafragma por vez, o eixo puxa o outro, e as esferas fazem o líquido entrar sempre por
          baixo e sair por cima.
        </p>
        <DiaphragmFlowSchematic />
        <button className="btn-secondary mt-3" onClick={() => navigateTo('lab', 'diaphragm-pump')}>
          Ver funcionando no 3D <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </section>
      <p className="text-xs text-ink-500">
        Desenhos de fabricação reais trazem cotas, tolerâncias, materiais e acabamentos definidos pelo projeto. Os desenhos desta seção existem para
        aprender a ler a representação — não para fabricar peças.
      </p>
    </div>
  );
};
