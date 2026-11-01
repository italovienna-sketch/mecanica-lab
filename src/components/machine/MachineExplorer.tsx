import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, CircleDot, Info, OctagonAlert, XCircle } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import { COMPONENTS, COMPONENTS_BY_ID, ComponentState, FAULTS, FAULTS_BY_ID, MachineComponent, correctChecks, stateOf } from '../../data/machine/motorPump';
import { Page, PageHeader, ProgressBar } from '../ui';

/**
 * Máquina interativa: conjunto motobomba em SVG com áreas clicáveis, ficha de cada componente, pergunta de
 * verificação e falhas simuladas. Modelo didático: não está ligado a equipamento real, CLP, SCADA ou sensores.
 */

const STATE_LABEL: Record<ComponentState, string> = { normal: 'normal', alerta: 'alerta simulado', falha: 'falha simulada' };

// Cores do desenho (o SVG fica sobre um “papel” fixo, igual às outras pranchas do app).
const INK = '#1d1e1b';
const PAPER = '#f4f3ef';
const METAL = '#c9ccd0';
const BODY = '#8fa3b5';
const FILL: Record<ComponentState, string> = { normal: BODY, alerta: '#f2c14e', falha: '#e26d5a' };

export const MachineExplorer: React.FC = () => {
  const { activeParam, navigateTo, playerProfile, setLastActivity } = useGameState();
  const fault = FAULTS_BY_ID[activeParam ?? ''] ?? FAULTS[0];
  const [selected, setSelected] = useState<string | null>(null);
  const panelRef = useRef<HTMLHeadingElement>(null);
  const checks = playerProfile.componentChecks;

  useEffect(() => {
    setLastActivity('machine', 'Máquina interativa', activeParam ?? undefined);
  }, [activeParam]); // eslint-disable-line react-hooks/exhaustive-deps

  // Ao trocar a falha, a ficha abre no componente mais afetado.
  useEffect(() => {
    const first = Object.entries(fault.states).find(([, s]) => s === 'falha')?.[0];
    if (first) setSelected(first);
  }, [fault.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const select = (id: string) => {
    setSelected(id);
    requestAnimationFrame(() => panelRef.current?.focus());
  };

  const component = selected ? COMPONENTS_BY_ID[selected] : null;

  return (
    <Page>
      <PageHeader
        eyebrow="Laboratório"
        title="Máquina interativa"
        description="Conjunto motobomba didático. Clique num componente para ver o que ele faz, como falha e o que inspecionar. Use as falhas simuladas para treinar o olhar."
      />

      <section aria-labelledby="h-falha" className="mb-4">
        <h2 id="h-falha" className="field-label">
          Estado simulado do conjunto
        </h2>
        <div className="segmented flex-wrap" role="group" aria-label="Estado simulado do conjunto">
          {FAULTS.map((f) => (
            <button key={f.id} type="button" aria-pressed={f.id === fault.id} onClick={() => navigateTo('machine', f.id === 'normal' ? undefined : f.id)}>
              {f.label}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-4">
          <figure className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <MotorPumpSvg fault={fault} selected={selected} onSelect={select} />
            </div>
            <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-ink-800 px-4 py-2 text-xs text-ink-400">
              <span>Modelo didático, fora de escala — sem ligação com equipamento real. Toque numa peça ou use a lista abaixo.</span>
              <span className="flex items-center gap-1.5">
                <CircleDot className="h-3.5 w-3.5" aria-hidden /> normal
              </span>
              <span className="flex items-center gap-1.5 text-amber-200">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> alerta (!)
              </span>
              <span className="flex items-center gap-1.5 text-rose-300">
                <OctagonAlert className="h-3.5 w-3.5" aria-hidden /> falha (×)
              </span>
            </figcaption>
          </figure>

          {fault.id !== 'normal' && (
            <section className="notice-warning" aria-labelledby="h-sintomas">
              <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
              <div>
                <h2 id="h-sintomas" className="font-semibold">
                  {fault.description}
                </h2>
                <p className="mt-1">Sintomas para investigar:</p>
                <ul className="mt-1 list-disc pl-5">
                  {fault.symptoms.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                <p className="mt-2">{fault.investigate}</p>
                {fault.link && (
                  <button className="link mt-2" onClick={() => navigateTo(fault.link!.screen, fault.link!.param)}>
                    {fault.link.label} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </button>
                )}
              </div>
            </section>
          )}

          <section aria-labelledby="h-comp">
            <h2 id="h-comp" className="section-title">
              Componentes
            </h2>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {COMPONENTS.map((c) => {
                const st = stateOf(fault, c.id);
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => select(c.id)}
                      aria-pressed={selected === c.id}
                      className={`flex min-h-[44px] w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm ${
                        selected === c.id ? 'border-accent bg-accent-soft text-ink-100' : 'border-ink-700 bg-ink-850 text-ink-200 hover:border-ink-500'
                      }`}
                    >
                      <span className="flex-1">{c.name}</span>
                      {st !== 'normal' && <span className={st === 'falha' ? 'badge border-rose-700/60 bg-rose-950/40 text-rose-300' : 'badge-warning'}>{STATE_LABEL[st]}</span>}
                      {checks[c.id]?.correct && <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-label="pergunta respondida" />}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 max-w-sm">
              <ProgressBar value={correctChecks(checks)} max={COMPONENTS.length} label="Perguntas de verificação acertadas" tone="success" />
              <p className="mt-1 text-xs text-ink-500">
                {correctChecks(checks)} de {COMPONENTS.length} perguntas de verificação acertadas
              </p>
            </div>
          </section>
        </div>

        <aside aria-label="Ficha do componente" className="lg:sticky lg:top-4 lg:self-start">
          {component ? (
            <ComponentPanel key={component.id} c={component} state={stateOf(fault, component.id)} headingRef={panelRef} />
          ) : (
            <div className="card flex flex-col items-start gap-2 p-5 text-sm text-ink-400">
              <Info className="h-5 w-5 text-accent" aria-hidden />
              <p>Escolha um componente no desenho ou na lista para abrir a ficha.</p>
            </div>
          )}
        </aside>
      </div>
    </Page>
  );
};

/* ───────────── Ficha ───────────── */

const ComponentPanel: React.FC<{ c: MachineComponent; state: ComponentState; headingRef: React.RefObject<HTMLHeadingElement> }> = ({ c, state, headingRef }) => {
  const { recordComponentCheck } = useGameState();
  // Alternativas em ordem fixa por componente (nos dados a certa é a primeira).
  const order = useMemo(() => {
    const n = c.check.options.length;
    const shift = (c.id.length + c.name.length) % n;
    return c.check.options.map((_, i) => (i + shift) % n);
  }, [c]);
  const [picked, setPicked] = useState<number | null>(null);
  const [sent, setSent] = useState(false);

  const answer = () => {
    if (picked === null) return;
    setSent(true);
    recordComponentCheck(c.id, picked === c.check.correct);
  };

  const sections: [string, string[]][] = [
    ['Falhas comuns', c.failureModes],
    ['Sintomas típicos', c.symptoms],
    ['Pontos de inspeção', c.inspection],
    ['Manutenção preventiva', c.preventive],
    ['Segurança', c.safety]
  ];

  return (
    <div className="card p-5">
      <p className="eyebrow">Componente · {STATE_LABEL[state]}</p>
      <h2 ref={headingRef} tabIndex={-1} className="mt-1 text-lg font-semibold text-ink-100 outline-none">
        {c.name}
      </h2>
      {state !== 'normal' && (
        <p className={`mt-2 rounded-lg border px-3 py-2 text-sm ${state === 'falha' ? 'border-rose-700/60 text-rose-300' : 'border-amber-700/60 text-amber-200'}`}>
          {state === 'falha' ? 'Na falha simulada, este é o componente afetado.' : 'Na falha simulada, este componente mostra sintomas, mas não é a origem.'}
        </p>
      )}
      <dl className="mt-3 space-y-3 text-sm">
        <div>
          <dt className="font-medium text-ink-200">Função</dt>
          <dd className="text-ink-300">{c.function}</dd>
        </div>
        <div>
          <dt className="font-medium text-ink-200">Como funciona</dt>
          <dd className="text-ink-300">{c.principle}</dd>
        </div>
        {sections.map(([title, items]) => (
          <div key={title}>
            <dt className="font-medium text-ink-200">{title}</dt>
            <dd>
              <ul className="list-disc space-y-0.5 pl-5 text-ink-300">
                {items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>

      <fieldset className="mt-4 border-t border-ink-800 pt-4">
        <legend className="field-label pt-4">Verifique: {c.check.prompt}</legend>
        <div className="grid gap-2">
          {order.map((i) => (
            <label
              key={i}
              className={`flex min-h-[44px] cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
                sent && i === c.check.correct ? 'border-emerald-700/60' : sent && i === picked ? 'border-rose-700/60' : 'border-ink-700'
              } ${sent ? 'cursor-default' : 'hover:border-ink-500'}`}
            >
              <input
                type="radio"
                name={`check-${c.id}`}
                checked={picked === i}
                onChange={() => setPicked(i)}
                disabled={sent}
                className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
              />
              <span className="text-ink-200">{c.check.options[i]}</span>
            </label>
          ))}
        </div>
        {!sent ? (
          <button className="btn-primary btn-sm mt-3" onClick={answer} disabled={picked === null}>
            Responder
          </button>
        ) : (
          <p role="status" className={`mt-3 flex gap-2 text-sm ${picked === c.check.correct ? 'text-emerald-300' : 'text-rose-300'}`}>
            {picked === c.check.correct ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />}
            <span>
              <span className="font-semibold">{picked === c.check.correct ? 'Certo.' : 'Não é essa.'}</span> <span className="text-ink-300">{c.check.explanation}</span>
            </span>
          </p>
        )}
      </fieldset>
    </div>
  );
};

/* ───────────── Desenho ───────────── */

interface HotspotProps {
  id: string;
  fault: (typeof FAULTS)[number];
  selected: string | null;
  onSelect: (id: string) => void;
  /** Área clicável (maior que o desenho, para o toque). */
  hit: { x: number; y: number; w: number; h: number };
  /** Onde fica o marcador de alerta/falha. */
  mark: { x: number; y: number };
  children: React.ReactNode;
}

const Hotspot: React.FC<HotspotProps> = ({ id, fault, selected, onSelect, hit, mark, children }) => {
  const st = stateOf(fault, id);
  const isSel = selected === id;
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${COMPONENTS_BY_ID[id].name}: ${STATE_LABEL[st]}`}
      aria-pressed={isSel}
      data-component={id}
      data-state={st}
      className="machine-hotspot cursor-pointer"
      onClick={() => onSelect(id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(id);
        }
      }}
    >
      <rect x={hit.x} y={hit.y} width={hit.w} height={hit.h} rx="6" fill="transparent" className="machine-hit" stroke={isSel ? '#bd420a' : 'transparent'} strokeWidth="3" strokeDasharray={isSel ? '0' : '6 4'} />
      {children}
      {st !== 'normal' && (
        <g aria-hidden>
          <circle cx={mark.x} cy={mark.y} r="12" fill={FILL[st]} stroke={INK} strokeWidth="1.5" />
          <text x={mark.x} y={mark.y + 5} textAnchor="middle" fontSize="15" fontWeight="700" fill={INK} fontFamily="IBM Plex Sans, sans-serif">
            {st === 'falha' ? '×' : '!'}
          </text>
        </g>
      )}
    </g>
  );
};

const Label: React.FC<{ x: number; y: number; children: React.ReactNode; anchor?: 'start' | 'middle' | 'end' }> = ({ x, y, children, anchor = 'middle' }) => (
  <text x={x} y={y} textAnchor={anchor} fontSize="13" fill={INK} fontFamily="IBM Plex Sans, sans-serif" aria-hidden>
    {children}
  </text>
);

const Valve: React.FC<{ cx: number; cy: number; vertical?: boolean; fill: string }> = ({ cx, cy, vertical, fill }) => (
  <g transform={vertical ? `rotate(90 ${cx} ${cy})` : undefined}>
    <path d={`M ${cx - 16} ${cy - 12} L ${cx + 16} ${cy + 12} L ${cx + 16} ${cy - 12} L ${cx - 16} ${cy + 12} Z`} fill={fill} stroke={INK} strokeWidth="1.5" />
    <line x1={cx} y1={cy} x2={cx} y2={cy - 24} stroke={INK} strokeWidth="1.5" />
    <line x1={cx - 10} y1={cy - 24} x2={cx + 10} y2={cy - 24} stroke={INK} strokeWidth="2.5" />
  </g>
);

const Gauge: React.FC<{ cx: number; cy: number; fill: string }> = ({ cx, cy, fill }) => (
  <g>
    <circle cx={cx} cy={cy} r="14" fill={fill === BODY ? '#ffffff' : fill} stroke={INK} strokeWidth="1.5" />
    <line x1={cx} y1={cy} x2={cx + 7} y2={cy - 8} stroke={INK} strokeWidth="1.5" />
  </g>
);

const MotorPumpSvg: React.FC<{ fault: (typeof FAULTS)[number]; selected: string | null; onSelect: (id: string) => void }> = ({ fault, selected, onSelect }) => {
  const f = (id: string) => FILL[stateOf(fault, id)];
  const common = { fault, selected, onSelect };
  return (
    <svg viewBox="0 0 980 430" role="group" aria-label="Conjunto motobomba: motor, acoplamento, mancal, bomba e tubulações" className="h-auto w-full" style={{ background: PAPER }}>
      <style>{`.machine-hotspot:focus{outline:none}.machine-hotspot:focus-visible .machine-hit{stroke:#bd420a;stroke-dasharray:0;stroke-width:3}.machine-hotspot:hover .machine-hit{stroke:#6e706a}`}</style>
      {/* Piso */}
      <line x1="20" y1="372" x2="960" y2="372" stroke={INK} strokeWidth="1" strokeDasharray="2 4" />

      {/* Base */}
      <Hotspot id="base" {...common} hit={{ x: 54, y: 300, w: 560, h: 62 }} mark={{ x: 70, y: 346 }}>
        <rect x="60" y="340" width="540" height="22" fill={f('base')} stroke={INK} strokeWidth="1.5" />
        <rect x="110" y="310" width="40" height="30" fill={f('base')} stroke={INK} strokeWidth="1.5" />
        <rect x="270" y="310" width="40" height="30" fill={f('base')} stroke={INK} strokeWidth="1.5" />
        <circle cx="130" cy="325" r="5" fill="#fff" stroke={INK} />
        <circle cx="290" cy="325" r="5" fill="#fff" stroke={INK} />
        <Label x={330} y={392}>
          Base e fixação
        </Label>
      </Hotspot>

      {/* Motor */}
      <Hotspot id="motor" {...common} hit={{ x: 54, y: 150, w: 280, h: 160 }} mark={{ x: 316, y: 170 }}>
        <rect x="60" y="205" width="34" height="90" rx="6" fill={METAL} stroke={INK} strokeWidth="1.5" />
        <rect x="94" y="190" width="226" height="120" rx="10" fill={f('motor')} stroke={INK} strokeWidth="1.5" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <line key={i} x1="110" y1={205 + i * 15} x2="300" y2={205 + i * 15} stroke={INK} strokeOpacity="0.35" />
        ))}
        <rect x="175" y="165" width="64" height="25" fill={METAL} stroke={INK} strokeWidth="1.5" />
        <Label x={207} y={150}>
          Motor elétrico
        </Label>
      </Hotspot>

      {/* Eixo */}
      <Hotspot id="eixo" {...common} hit={{ x: 320, y: 238, w: 50, h: 24 }} mark={{ x: 345, y: 232 }}>
        <rect x="320" y="243" width="50" height="14" fill={METAL} stroke={INK} strokeWidth="1.5" />
        <rect x="560" y="243" width="18" height="14" fill={METAL} stroke={INK} strokeWidth="1.5" />
      </Hotspot>

      {/* Acoplamento + proteção tracejada */}
      <Hotspot id="acoplamento" {...common} hit={{ x: 362, y: 196, w: 82, h: 104 }} mark={{ x: 440, y: 204 }}>
        <rect x="364" y="200" width="78" height="96" rx="6" fill="none" stroke={INK} strokeWidth="1.2" strokeDasharray="5 4" />
        <rect x="370" y="222" width="30" height="56" rx="3" fill={f('acoplamento')} stroke={INK} strokeWidth="1.5" />
        <rect x="406" y="222" width="30" height="56" rx="3" fill={f('acoplamento')} stroke={INK} strokeWidth="1.5" />
        <rect x="400" y="230" width="6" height="40" fill={INK} />
        <Label x={403} y={316}>
          Acoplamento
        </Label>
      </Hotspot>

      {/* Mancal da bomba */}
      <Hotspot id="mancal" {...common} hit={{ x: 444, y: 210, w: 118, h: 130 }} mark={{ x: 552, y: 216 }}>
        <rect x="448" y="222" width="110" height="56" rx="6" fill={f('mancal')} stroke={INK} strokeWidth="1.5" />
        <rect x="474" y="278" width="58" height="62" fill={f('mancal')} stroke={INK} strokeWidth="1.5" />
        <circle cx="503" cy="216" r="5" fill={METAL} stroke={INK} />
        <Label x={503} y={200}>
          Mancal
        </Label>
      </Hotspot>

      {/* Selo mecânico */}
      <Hotspot id="selo" {...common} hit={{ x: 576, y: 222, w: 24, h: 56 }} mark={{ x: 588, y: 296 }}>
        <rect x="578" y="228" width="20" height="44" fill={f('selo')} stroke={INK} strokeWidth="1.5" />
        <Label x={588} y={322}>
          Selo
        </Label>
      </Hotspot>

      {/* Carcaça (voluta) */}
      <Hotspot id="carcaca" {...common} hit={{ x: 598, y: 168, w: 150, h: 172 }} mark={{ x: 740, y: 186 }}>
        <circle cx="672" cy="250" r="72" fill={f('carcaca')} stroke={INK} strokeWidth="1.5" />
        <circle cx="672" cy="250" r="30" fill={METAL} stroke={INK} strokeWidth="1.2" />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <line
            key={a}
            x1={672 + Math.cos((a * Math.PI) / 180) * 8}
            y1={250 + Math.sin((a * Math.PI) / 180) * 8}
            x2={672 + Math.cos(((a + 25) * Math.PI) / 180) * 28}
            y2={250 + Math.sin(((a + 25) * Math.PI) / 180) * 28}
            stroke={INK}
            strokeWidth="1.5"
          />
        ))}
        <rect x="640" y="320" width="64" height="20" fill={f('carcaca')} stroke={INK} strokeWidth="1.5" />
        <Label x={672} y={364}>
          Carcaça e rotor
        </Label>
      </Hotspot>

      {/* Tubulação de descarga (vertical) */}
      <rect x="652" y="40" width="40" height="140" fill="#ffffff" stroke={INK} strokeWidth="1.5" />
      <Label x={740} y={36} anchor="start">
        Descarga
      </Label>
      <Hotspot id="valvula-descarga" {...common} hit={{ x: 630, y: 62, w: 84, h: 56 }} mark={{ x: 712, y: 72 }}>
        <Valve cx={672} cy={92} vertical fill={f('valvula-descarga') === BODY ? '#ffffff' : f('valvula-descarga')} />
      </Hotspot>

      {/* Tubulação de sucção (horizontal, entrada axial) */}
      <rect x="744" y="232" width="216" height="36" fill="#ffffff" stroke={INK} strokeWidth="1.5" />
      <Label x={958} y={296} anchor="end">
        Sucção ← tanque
      </Label>
      <Hotspot id="filtro" {...common} hit={{ x: 782, y: 210, w: 60, h: 92 }} mark={{ x: 840, y: 214 }}>
        <rect x="788" y="220" width="48" height="76" rx="4" fill={f('filtro') === BODY ? METAL : f('filtro')} stroke={INK} strokeWidth="1.5" />
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="794" y1={232 + i * 13} x2="830" y2={232 + i * 13} stroke={INK} strokeOpacity="0.6" />
        ))}
        <Label x={812} y={318}>
          Filtro
        </Label>
      </Hotspot>
      <Hotspot id="valvula-succao" {...common} hit={{ x: 866, y: 210, w: 64, h: 66 }} mark={{ x: 924, y: 214 }}>
        <Valve cx={898} cy={250} fill={f('valvula-succao') === BODY ? '#ffffff' : f('valvula-succao')} />
        <Label x={898} y={198}>
          Válvula
        </Label>
      </Hotspot>

      {/* Manômetros (sucção e descarga) */}
      <Hotspot id="manometros" {...common} hit={{ x: 696, y: 118, w: 70, h: 104 }} mark={{ x: 762, y: 128 }}>
        <line x1="692" y1="150" x2="716" y2="150" stroke={INK} strokeWidth="1.5" />
        <Gauge cx={730} cy={150} fill={f('manometros')} />
        <line x1="760" y1="232" x2="760" y2="214" stroke={INK} strokeWidth="1.5" />
        <Gauge cx={760} cy={200} fill={f('manometros')} />
        <Label x={744} y={112}>
          Manômetros
        </Label>
      </Hotspot>
    </svg>
  );
};
