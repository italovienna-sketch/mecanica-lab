import React from 'react';
import { Arrow, C, CheckMark, EStop, FONT, Gear, HazardSign, Padlock, Person, SceneFrame, Tag, Txt, appear, ease, hexPoints } from './sceneKit';
import { CaliperReading } from '../illustrations/TechnicalIllustrations';

/**
 * Cenas das demonstrações animadas das aulas rápidas.
 * Cada cena recebe `t` (0 → 1, progresso dentro da cena) e um parâmetro opcional.
 * São ilustrações didáticas desenhadas no projeto — não são fotos nem vídeos de procedimentos reais.
 */

export interface SceneProps {
  t: number;
  param?: number;
}

type Scene = React.FC<SceneProps>;

/* ───────────────────────── Elementos reutilizados ───────────────────────── */

/** Torno simplificado (vista lateral). `spin` em graus. */
export const LatheSide: React.FC<{ x: number; y: number; spin: number; guard?: boolean; scale?: number }> = ({ x, y, spin, guard = true, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={0} y={60} width={260} height={18} rx={3} fill={C.machineDark} />
    <rect x={10} y={78} width={30} height={50} fill={C.machine} />
    <rect x={220} y={78} width={30} height={50} fill={C.machine} />
    <rect x={0} y={0} width={70} height={60} rx={4} fill={C.machine} stroke={C.ink} strokeWidth={1.5} />
    <g transform={`translate(88 30)`}>
      <circle r={24} fill={C.steel} stroke={C.ink} strokeWidth={1.5} />
      {[0, 120, 240].map((a) => (
        <rect key={a} x={-4} y={-24} width={8} height={12} fill={C.steelDark} transform={`rotate(${a + spin})`} />
      ))}
    </g>
    <rect x={112} y={26} width={80} height={8} fill={C.steelLight} stroke={C.ink} strokeWidth={1} />
    <rect x={200} y={14} width={50} height={46} rx={3} fill={C.machine} stroke={C.ink} strokeWidth={1.5} />
    {guard && <path d="M 62 2 L 116 2 L 116 58 L 62 58" fill="#9fd3f5" opacity={0.45} stroke={C.ink} strokeWidth={1.5} />}
  </g>
);

/** Transmissão por correia (duas polias). `spin` em graus. */
const BeltDrive: React.FC<{ x: number; y: number; spin: number }> = ({ x, y, spin }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M 0 -40 L 160 -26 A 26 26 0 0 1 160 26 L 0 40 A 40 40 0 0 1 0 -40 Z" fill="none" stroke={C.ink} strokeWidth={6} />
    <g transform={`rotate(${spin})`}>
      <circle r={40} fill={C.steel} stroke={C.ink} strokeWidth={2} />
      <line x1={-36} y1={0} x2={36} y2={0} stroke={C.steelDark} strokeWidth={4} />
    </g>
    <g transform={`translate(160 0) rotate(${spin * 1.5})`}>
      <circle r={26} fill={C.steel} stroke={C.ink} strokeWidth={2} />
      <line x1={-22} y1={0} x2={22} y2={0} stroke={C.steelDark} strokeWidth={4} />
    </g>
  </g>
);

/** Ícones dos quatro tipos de energia/perigo. */
const EnergyIcon: React.FC<{ kind: 'mec' | 'ele' | 'ter' | 'pre' | 'gra'; x: number; y: number; t: number }> = ({ kind, x, y, t }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={38} fill="#fff" stroke={C.ink} strokeWidth={2} />
    {kind === 'mec' && <Gear cx={0} cy={0} r={24} teeth={10} angle={t * 360} />}
    {kind === 'ele' && <path d="M 6 -26 L -12 4 L 0 4 L -6 26 L 14 -6 L 2 -6 Z" fill={C.yellow} stroke={C.ink} strokeWidth={2} strokeLinejoin="round" />}
    {kind === 'ter' && (
      <g>
        <rect x={-6} y={-26} width={12} height={36} rx={6} fill="#fff" stroke={C.ink} strokeWidth={2} />
        <circle cy={16} r={10} fill={C.red} stroke={C.ink} strokeWidth={2} />
        <rect x={-2.5} y={-12 + (1 - t) * 10} width={5} height={26 - (1 - t) * 10} fill={C.red} />
      </g>
    )}
    {kind === 'pre' && (
      <g>
        <circle r={24} fill="#fff" stroke={C.ink} strokeWidth={2} />
        <path d="M -16 10 A 18 18 0 1 1 16 10" fill="none" stroke={C.line} strokeWidth={3} />
        <line x1={0} y1={0} x2={0} y2={-17} stroke={C.red} strokeWidth={3} strokeLinecap="round" transform={`rotate(${-110 + t * 190})`} />
        <circle r={3} fill={C.ink} />
      </g>
    )}
    {kind === 'gra' && (
      <g>
        <line x1={0} y1={-30} x2={0} y2={-6} stroke={C.ink} strokeWidth={2} />
        <rect x={-14} y={-6} width={28} height={20} fill={C.steelDark} stroke={C.ink} strokeWidth={1.5} />
        <Arrow x1={0} y1={18} x2={0} y2={32} width={2.5} />
      </g>
    )}
  </g>
);

/* ───────────────────────── SEGURANÇA ───────────────────────── */

const HazardWorkshop: Scene = ({ t, param }) => {
  const spin = t * 900;
  const items = [
    { x: 150, y: 120, s: '⟳', label: 'Partes girando' },
    { x: 330, y: 92, s: '!', label: 'Superfície quente' },
    { x: 470, y: 96, s: 'ϟ', label: 'Eletricidade' },
    { x: 560, y: 190, s: '!', label: 'Carga suspensa' }
  ];
  return (
    <SceneFrame label="Oficina com torno, forno de aquecimento, painel elétrico e talha; os perigos aparecem sinalizados">
      <rect x={0} y={290} width={640} height={70} fill={C.paper2} />
      <LatheSide x={40} y={160} spin={spin} guard={param !== 1 ? false : true} scale={0.95} />
      <rect x={300} y={150} width={70} height={110} rx={4} fill={C.machine} stroke={C.ink} strokeWidth={1.5} />
      <rect x={312} y={170} width={46} height={30} fill="#f08c00" opacity={0.6 + 0.3 * Math.sin(t * 20)} />
      <rect x={420} y={120} width={90} height={150} rx={4} fill="#c9ccd1" stroke={C.ink} strokeWidth={1.5} />
      <rect x={432} y={136} width={66} height={40} fill="#fff" stroke={C.ink} />
      <EStop x={465} y={220} scale={0.45} />
      <line x1={575} y1={20} x2={575} y2={170} stroke={C.ink} strokeWidth={2} />
      <rect x={555} y={170} width={40} height={30} fill={C.steelDark} stroke={C.ink} strokeWidth={1.5} transform={`translate(0 ${Math.sin(t * 12) * 3})`} />
      {items.map((it, i) => (
        <g key={it.label} opacity={appear(t, 0.1 + i * 0.16)}>
          <HazardSign x={it.x} y={it.y} symbol={it.s} />
          <Tag x={it.x} y={it.y + 40} text={it.label} anchor="middle" tone="accent" />
        </g>
      ))}
      {param === 1 && <Tag x={320} y={34} text="Parar · procurar os perigos · comunicar" anchor="middle" opacity={appear(t, 0.75)} />}
    </SceneFrame>
  );
};

const HazardVsRisk: Scene = ({ t }) => {
  const handX = 520 - ease(t / 0.8) * 260;
  const dist = Math.max(0, handX - 250);
  const risk = 1 - dist / 270;
  return (
    <SceneFrame label="Um eixo girando (perigo) e uma mão que se aproxima; o medidor de risco sobe com a proximidade">
      <rect x={60} y={150} width={200} height={40} rx={20} fill={C.steel} stroke={C.ink} strokeWidth={2} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={i} x1={80 + ((i * 32 + t * 600) % 180)} y1={152} x2={70 + ((i * 32 + t * 600) % 180)} y2={188} stroke={C.steelDark} strokeWidth={3} />
      ))}
      <Tag x={160} y={120} text="PERIGO: eixo girando" anchor="middle" tone="accent" />
      <g transform={`translate(${handX} 170)`}>
        <rect x={0} y={-12} width={110} height={24} rx={10} fill={C.skin} stroke={C.ink} strokeWidth={1.5} />
        <rect x={-14} y={-14} width={26} height={28} rx={10} fill={C.skin} stroke={C.ink} strokeWidth={1.5} />
      </g>
      <Txt x={360} y={262} size={13} fill={C.muted}>
        distância: {Math.round(dist)} mm (ilustrativo)
      </Txt>
      <g transform="translate(150 290)">
        <Txt x={0} y={-8} size={13}>
          RISCO
        </Txt>
        <rect x={60} y={-22} width={300} height={18} rx={9} fill="#ddd" />
        <rect x={60} y={-22} width={300 * Math.max(0.08, risk)} height={18} rx={9} fill={risk > 0.66 ? C.red : risk > 0.33 ? C.yellow : C.green} />
      </g>
    </SceneFrame>
  );
};

const HazardTypes: Scene = ({ t, param }) => {
  const kinds: { k: 'mec' | 'ele' | 'ter' | 'pre'; label: string; sub: string }[] =
    param === 1
      ? [
          { k: 'ter', label: 'Térmico', sub: 'queimadura' },
          { k: 'pre', label: 'Pressão', sub: 'ruptura, jato de fluido' },
          { k: 'ele', label: 'Elétrico', sub: 'choque, arco' },
          { k: 'mec', label: 'Mecânico', sub: 'esmagamento, corte' }
        ]
      : [
          { k: 'mec', label: 'Mecânico', sub: 'partes móveis' },
          { k: 'ele', label: 'Elétrico', sub: 'tensão, painéis' },
          { k: 'ter', label: 'Térmico', sub: 'peças quentes' },
          { k: 'pre', label: 'Pressão', sub: 'fluidos, ar' }
        ];
  return (
    <SceneFrame label="Quatro tipos de perigo: mecânico, elétrico, térmico e de pressão">
      {kinds.map((k, i) => (
        <g key={k.k} opacity={appear(t, 0.05 + i * 0.18)}>
          <EnergyIcon kind={k.k} x={95 + i * 150} y={160} t={t} />
          <Txt x={95 + i * 150} y={232} anchor="middle" size={16}>
            {k.label}
          </Txt>
          <Txt x={95 + i * 150} y={252} anchor="middle" size={12} weight={500} fill={C.muted}>
            {k.sub}
          </Txt>
        </g>
      ))}
    </SceneFrame>
  );
};

const GuardFixed: Scene = ({ t }) => {
  const open = appear(t, 0.45, 0.25);
  return (
    <SceneFrame label="Transmissão por correia coberta por proteção fixa presa com parafusos; para remover é preciso ferramenta">
      <BeltDrive x={210} y={180} spin={t * 720} />
      <g transform={`translate(${open * 0} ${-open * 110})`} opacity={1 - open * 0.25}>
        <path d="M 150 120 L 400 140 L 400 220 L 150 240 Z" fill={C.yellow} opacity={0.88} stroke={C.ink} strokeWidth={2} />
        {[
          [165, 135],
          [385, 152],
          [385, 208],
          [165, 225]
        ].map(([x, y]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r={6} fill={C.steelDark} stroke={C.ink} />
        ))}
      </g>
      <g opacity={appear(t, 0.3)} transform="translate(470 120)">
        <rect x={-6} y={0} width={12} height={70} rx={3} fill="#c0392b" />
        <rect x={-3} y={70} width={6} height={50} fill={C.steel} />
      </g>
      <Tag x={420} y={290} text="Proteção fixa: só sai com ferramenta" anchor="middle" opacity={appear(t, 0.15)} />
      <Tag x={420} y={320} text="Remover = máquina parada e bloqueada" anchor="middle" tone="accent" opacity={appear(t, 0.7)} />
    </SceneFrame>
  );
};

const GuardInterlock: Scene = ({ t, param }) => {
  const open = param === 1 ? 0 : appear(t, 0.35, 0.15);
  // Com bloqueio (param 1): a porta só abre depois da parada total.
  const stopProgress = param === 1 ? appear(t, 0.2, 0.35) : open;
  const speed = 1 - stopProgress;
  const doorOpen = param === 1 ? appear(t, 0.62, 0.15) : open;
  // Ângulo acumulado: gira a toda velocidade e desacelera até parar.
  const s0 = param === 1 ? 0.2 : 0.35;
  const angle = 1100 * (Math.min(t, s0) + Math.max(0, Math.min(t, s0 + 0.3) - s0) * 0.5);
  return (
    <SceneFrame label="Proteção móvel com intertravamento: ao abrir, a máquina para; com bloqueio, só abre após parar">
      <rect x={120} y={90} width={300} height={200} rx={6} fill={C.machine} stroke={C.ink} strokeWidth={2} />
      <g transform={`translate(270 190) rotate(${angle})`}>
        <Gear cx={0} cy={0} r={60} teeth={16} angle={0} />
      </g>
      <g transform={`translate(420 90) scale(${1 - doorOpen * 0.85} 1)`}>
        <rect x={-300} y={0} width={300} height={200} fill="#9fd3f5" opacity={0.55} stroke={C.ink} strokeWidth={2} />
      </g>
      <rect x={424} y={150} width={22} height={34} rx={3} fill={doorOpen > 0.05 || param === 1 ? C.yellow : C.steelDark} stroke={C.ink} strokeWidth={1.5} />
      {param === 1 && <Padlock x={435} y={130} color={C.yellow} scale={0.6} open={doorOpen > 0.1} />}
      <Txt x={462} y={210} size={13}>
        Intertravamento
      </Txt>
      {param === 1 && (
        <Txt x={462} y={228} size={13}>
          com bloqueio
        </Txt>
      )}
      <Txt x={462} y={param === 1 ? 250 : 232} size={12} weight={500} fill={C.muted}>
        {param === 1 ? 'porta travada até' : 'porta aberta = parada'}
      </Txt>
      {param === 1 && (
        <Txt x={462} y={268} size={12} weight={500} fill={C.muted}>
          o movimento parar
        </Txt>
      )}
      <Tag x={270} y={325} text={speed < 0.05 ? 'Movimento parado' : 'Movimento perigoso'} tone={speed < 0.05 ? 'ok' : 'accent'} anchor="middle" />
    </SceneFrame>
  );
};

const BehaviorReport: Scene = ({ t }) => (
  <SceneFrame label="Trabalhador encontra proteção danificada, coloca aviso de não usar e comunica o supervisor">
    <rect x={60} y={120} width={180} height={150} rx={6} fill={C.machine} stroke={C.ink} strokeWidth={2} />
    <path d="M 70 130 L 230 130 L 230 200 L 150 210 L 70 196 Z" fill={C.yellow} opacity={0.85} stroke={C.ink} strokeWidth={2} />
    <path d="M 150 132 L 162 160 L 146 176 L 160 206" fill="none" stroke={C.ink} strokeWidth={3} />
    <g opacity={appear(t, 0.25)}>
      <rect x={95} y={215} width={110} height={44} rx={4} fill="#fff" stroke={C.red} strokeWidth={3} />
      <Txt x={150} y={236} anchor="middle" size={12} fill={C.red}>
        NÃO USE
      </Txt>
      <Txt x={150} y={252} anchor="middle" size={10} weight={500}>
        proteção danificada
      </Txt>
    </g>
    <Person x={330} y={320} glasses boots />
    <Person x={520} y={320} helmet shirt="#5b6b3a" />
    <g opacity={appear(t, 0.5)}>
      <rect x={350} y={110} width={160} height={52} rx={12} fill="#fff" stroke={C.ink} strokeWidth={2} />
      <Txt x={430} y={132} anchor="middle" size={12}>
        A proteção da furadeira
      </Txt>
      <Txt x={430} y={150} anchor="middle" size={12}>
        está trincada.
      </Txt>
    </g>
    <g opacity={appear(t, 0.75)}>
      <rect x={470} y={50} width={150} height={40} rx={12} fill={C.green} />
      <Txt x={545} y={75} anchor="middle" size={12} fill="#fff">
        Vamos parar e corrigir.
      </Txt>
    </g>
  </SceneFrame>
);

const EstopPress: Scene = ({ t, param }) => {
  const press = param === 1 ? 1 : appear(t, 0.4, 0.08);
  // Mão encosta no botão ao pressionar; na variante 1 ela se afasta e o botão continua retido.
  const handY = param === 1 ? 10 - appear(t, 0.3, 0.2) * 70 : -50 + press * 60;
  const stop = press;
  return (
    <SceneFrame label="Botão de parada de emergência sendo pressionado; ele fica retido e a máquina para">
      <rect x={60} y={120} width={240} height={160} rx={6} fill={C.machine} stroke={C.ink} strokeWidth={2} />
      <g transform={`translate(180 200) rotate(${param === 1 ? 140 : 1200 * (Math.min(t, 0.4) + Math.max(0, Math.min(t, 0.6) - 0.4) * 0.5)})`}>
        <Gear cx={0} cy={0} r={50} teeth={14} angle={0} />
      </g>
      <g transform="translate(450 200)">
        <EStop x={0} y={0} pressed={press} scale={1.6} />
        <g transform={`translate(0 ${handY})`}>
          <rect x={-22} y={-90} width={44} height={70} rx={14} fill={C.skin} stroke={C.ink} strokeWidth={1.5} />
        </g>
      </g>
      <Tag x={450} y={320} text={param === 1 ? 'Solte a mão: o botão continua retido' : 'Prioridade sobre todos os comandos'} anchor="middle" tone="accent" opacity={appear(t, 0.5)} />
      <Tag x={180} y={320} text={stop > 0.5 ? 'Máquina parando' : 'Em funcionamento'} anchor="middle" tone={stop > 0.5 ? 'ok' : 'ink'} />
    </SceneFrame>
  );
};

const EstopReset: Scene = ({ t, param }) => {
  const steps =
    param === 1
      ? ['Emergência não é liga/desliga', 'Não substitui proteções', 'Sempre desobstruída e visível']
      : ['1. Manter parado e avisar', '2. Corrigir a causa', '3. Destravar o botão (girar)', '4. Rearme manual no painel'];
  return (
    <SceneFrame label="Sequência após uma parada de emergência: corrigir a causa, destravar e rearmar manualmente">
      <EStop x={140} y={170} pressed={param === 1 ? 0.6 : 1 - appear(t, 0.55, 0.12)} scale={1.5} />
      {param !== 1 && (
        <g opacity={appear(t, 0.55)}>
          <path d="M 180 110 A 60 60 0 0 1 200 170" fill="none" stroke={C.accent} strokeWidth={3} markerEnd="url(#mk-arrow-accent)" />
        </g>
      )}
      {param !== 1 && (
        <g transform="translate(140 280)" opacity={appear(t, 0.78)}>
          <rect x={-46} y={-18} width={92} height={36} rx={6} fill={C.blue} stroke={C.ink} strokeWidth={1.5} />
          <Txt x={0} y={5} anchor="middle" size={12} fill="#fff">
            REARME
          </Txt>
        </g>
      )}
      {steps.map((s, i) => (
        <g key={s} opacity={appear(t, 0.08 + i * 0.2)}>
          {param === 1 ? <CheckMark x={300} y={110 + i * 60} ok={false} /> : <CheckMark x={300} y={100 + i * 55} />}
          <Txt x={322} y={(param === 1 ? 115 : 105) + i * (param === 1 ? 60 : 55)} size={15}>
            {s}
          </Txt>
        </g>
      ))}
    </SceneFrame>
  );
};

const PpeHierarchy: Scene = ({ t }) => {
  const rows = [
    { label: '1. Proteção coletiva', sub: 'proteções, intertravamentos, enclausuramento', w: 520, color: C.green },
    { label: '2. Medidas administrativas', sub: 'procedimentos, sinalização, treinamento', w: 420, color: C.blue },
    { label: '3. Proteção individual (EPI)', sub: 'a última barreira', w: 320, color: C.accent }
  ];
  return (
    <SceneFrame label="Ordem de prioridade das medidas de proteção: coletiva, administrativa e, por último, individual">
      {rows.map((r, i) => (
        <g key={r.label} opacity={appear(t, 0.05 + i * 0.22)}>
          <rect x={320 - r.w / 2} y={70 + i * 85} width={r.w} height={66} rx={8} fill={r.color} />
          <Txt x={320} y={100 + i * 85} anchor="middle" size={17} fill="#fff">
            {r.label}
          </Txt>
          <Txt x={320} y={122 + i * 85} anchor="middle" size={12} weight={500} fill="#fff">
            {r.sub}
          </Txt>
        </g>
      ))}
      <Txt x={320} y={340} anchor="middle" size={12} weight={500} fill={C.muted}>
        NR-12, item 12.1.8
      </Txt>
    </SceneFrame>
  );
};

const PpeTask: Scene = ({ t, param }) => {
  if (param === 1) {
    return (
      <SceneFrame label="Luva perto da placa girando do torno pode enroscar; correto é sem luva, com óculos">
        <LatheSide x={40} y={110} spin={t * 900} guard={false} />
        <g transform="translate(200 150)">
          <rect x={-10} y={-12} width={80} height={24} rx={10} fill="#c9a227" stroke={C.ink} strokeWidth={1.5} />
          <path d="M -10 -6 Q -30 -16 -26 4" fill="none" stroke="#c9a227" strokeWidth={6} transform={`rotate(${Math.sin(t * 40) * 8})`} />
        </g>
        <CheckMark x={230} y={110} ok={false} size={28} opacity={appear(t, 0.2)} />
        <Tag x={160} y={300} text="Luva perto de parte girando: pode enroscar" anchor="middle" tone="bad" opacity={appear(t, 0.25)} />
        <g opacity={appear(t, 0.55)}>
          <Person x={500} y={330} glasses boots />
          <CheckMark x={560} y={150} size={28} />
          <Tag x={500} y={60} text="Óculos, calçado, roupa justa" anchor="middle" tone="ok" />
        </g>
      </SceneFrame>
    );
  }
  const items = [
    { label: 'Óculos', sub: 'cavacos e partículas', y: 92 },
    { label: 'Protetor auricular', sub: 'ruído', y: 152 },
    { label: 'Calçado de segurança', sub: 'queda de peças', y: 212 },
    { label: 'Luvas', sub: 'só quando não há partes girando', y: 272 }
  ];
  return (
    <SceneFrame label="Trabalhador com óculos, protetor auricular e calçado de segurança, cada EPI ligado a um risco">
      <Person x={180} y={330} scale={1.3} glasses={t > 0.15} earmuffs={t > 0.35} boots={t > 0.55} />
      {items.map((it, i) => (
        <g key={it.label} opacity={appear(t, 0.15 + i * 0.2)}>
          <line x1={250} y1={it.y - 5} x2={320} y2={it.y - 5} stroke={C.line} strokeWidth={2} />
          <Txt x={330} y={it.y} size={16}>
            {it.label}
          </Txt>
          <Txt x={330} y={it.y + 18} size={12} weight={500} fill={C.muted}>
            {it.sub}
          </Txt>
        </g>
      ))}
    </SceneFrame>
  );
};

const PpeCa: Scene = ({ t }) => (
  <SceneFrame label="Óculos de segurança com etiqueta do Certificado de Aprovação; EPI danificado deve ser trocado">
    <g transform="translate(200 170)">
      <rect x={-120} y={-30} width={110} height={60} rx={18} fill="#9fd3f5" stroke={C.ink} strokeWidth={3} />
      <rect x={10} y={-30} width={110} height={60} rx={18} fill="#9fd3f5" stroke={C.ink} strokeWidth={3} />
      <path d="M -10 -10 Q 0 -20 10 -10" fill="none" stroke={C.ink} strokeWidth={3} />
    </g>
    <g opacity={appear(t, 0.2)}>
      <rect x={110} y={235} width={180} height={60} rx={6} fill="#fff" stroke={C.ink} strokeWidth={2} />
      <Txt x={200} y={260} anchor="middle" size={15}>
        CA nº 00000
      </Txt>
      <Txt x={200} y={280} anchor="middle" size={11} weight={500} fill={C.muted}>
        (número ilustrativo)
      </Txt>
    </g>
    <g opacity={appear(t, 0.5)} transform="translate(470 170)">
      <rect x={-70} y={-30} width={60} height={60} rx={16} fill="#cfe6f5" stroke={C.ink} strokeWidth={3} />
      <path d="M -60 -20 L -30 10 L -50 25" fill="none" stroke={C.ink} strokeWidth={2} />
      <CheckMark x={10} y={-40} ok={false} size={26} />
      <Txt x={-40} y={60} anchor="middle" size={13}>
        Trincado? Comunique e troque.
      </Txt>
    </g>
  </SceneFrame>
);

const BehaviorHousekeeping: Scene = ({ t }) => {
  const clean = appear(t, 0.4, 0.3);
  return (
    <SceneFrame label="Oficina organizada: mancha de óleo é limpa e ferramentas voltam ao quadro">
      <rect x={0} y={250} width={640} height={110} fill={C.paper2} />
      <ellipse cx={220} cy={300} rx={70} ry={16} fill={C.oil} opacity={0.6 * (1 - clean)} />
      <rect x={380} y={60} width={200} height={150} rx={4} fill="#d8cdb6" stroke={C.ink} strokeWidth={2} />
      {[0, 1, 2, 3].map((i) => {
        const placed = appear(t, 0.5 + i * 0.1);
        return (
          <g key={i} transform={`translate(${410 + i * 45} ${90 + (1 - placed) * 190})`}>
            <rect x={-5} y={0} width={10} height={80} rx={3} fill={i % 2 ? C.steelDark : C.steel} stroke={C.ink} />
            <circle cx={0} cy={0} r={11} fill="none" stroke={C.ink} strokeWidth={4} />
          </g>
        );
      })}
      <Tag x={220} y={240} text={clean > 0.9 ? 'Piso limpo' : 'Óleo no piso: escorregão'} tone={clean > 0.9 ? 'ok' : 'bad'} anchor="middle" />
      <Tag x={480} y={240} text="Cada ferramenta no seu lugar" anchor="middle" opacity={appear(t, 0.6)} />
    </SceneFrame>
  );
};

const BehaviorAdornos: Scene = ({ t }) => {
  const fixed = appear(t, 0.5, 0.15);
  return (
    <SceneFrame label="Pessoa com cabelo solto e pulseira perto do torno; depois com cabelo preso e sem adornos">
      <LatheSide x={30} y={140} spin={t * 900} />
      <Person x={430} y={330} scale={1.15} longHair={fixed > 0.5 ? 'tied' : 'loose'} bracelet={fixed < 0.5} glasses boots />
      <CheckMark x={520} y={100} ok={fixed > 0.5} size={30} />
      <Tag x={430} y={40} text={fixed > 0.5 ? 'Cabelo preso, sem adornos' : 'Cabelo solto e pulseira: podem enroscar'} anchor="middle" tone={fixed > 0.5 ? 'ok' : 'bad'} />
    </SceneFrame>
  );
};

const EnergySources: Scene = ({ t, param }) => {
  if (param === 1) {
    return (
      <SceneFrame label="Painel elétrico: o mecânico solicita o bloqueio ao profissional autorizado em eletricidade">
        <rect x={80} y={70} width={170} height={230} rx={6} fill="#c9ccd1" stroke={C.ink} strokeWidth={2} />
        <HazardSign x={165} y={120} symbol="ϟ" size={44} />
        <rect x={110} y={170} width={110} height={90} fill="#fff" stroke={C.ink} />
        <Padlock x={165} y={230} color={C.red} />
        <Person x={360} y={330} glasses boots />
        <Person x={520} y={330} helmet shirt="#1e3a8a" />
        <g opacity={appear(t, 0.2)}>
          <rect x={300} y={90} width={150} height={40} rx={12} fill="#fff" stroke={C.ink} strokeWidth={2} />
          <Txt x={375} y={115} anchor="middle" size={12}>
            Preciso do bloqueio
          </Txt>
        </g>
        <Tag x={520} y={60} text="Profissional autorizado (NR-10)" anchor="middle" tone="accent" opacity={appear(t, 0.5)} />
      </SceneFrame>
    );
  }
  const labels = [
    { x: 150, y: 80, k: 'ele' as const, text: 'Elétrica' },
    { x: 320, y: 70, k: 'mec' as const, text: 'Mecânica' },
    { x: 490, y: 80, k: 'pre' as const, text: 'Hidráulica / pneumática' },
    { x: 150, y: 290, k: 'ter' as const, text: 'Térmica' },
    { x: 490, y: 290, k: 'gra' as const, text: 'Gravidade' }
  ];
  return (
    <SceneFrame label="Máquina no centro com cinco formas de energia ao redor">
      <rect x={250} y={140} width={140} height={110} rx={6} fill={C.machine} stroke={C.ink} strokeWidth={2} />
      <Gear cx={320} cy={195} r={34} teeth={12} angle={t * 360} />
      {labels.map((l, i) => (
        <g key={l.text} opacity={appear(t, 0.05 + i * 0.15)}>
          <line x1={l.x} y1={l.y} x2={320} y2={195} stroke={C.line} strokeWidth={2} strokeDasharray="5 5" />
          <g transform={`translate(${l.x} ${l.y}) scale(0.7)`}>
            <EnergyIcon kind={l.k} x={0} y={0} t={t} />
          </g>
          <Txt x={l.x} y={l.y + 46} anchor="middle" size={13}>
            {l.text}
          </Txt>
        </g>
      ))}
    </SceneFrame>
  );
};

const UnexpectedStart: Scene = ({ t, param }) => {
  const powerBack = appear(t, 0.35, 0.05);
  const runs = param === 1 ? 0 : appear(t, 0.42, 0.1);
  return (
    <SceneFrame label="Energia volta depois de uma queda; sem proteção a máquina parte sozinha, com proteção ela aguarda comando">
      <g transform="translate(110 100)">
        <rect x={-40} y={-40} width={80} height={110} rx={6} fill="#c9ccd1" stroke={C.ink} strokeWidth={2} />
        <circle cx={0} cy={-10} r={12} fill={powerBack > 0.5 ? C.green : '#555'} stroke={C.ink} />
        <Txt x={0} y={40} anchor="middle" size={11}>
          {powerBack > 0.5 ? 'energia voltou' : 'sem energia'}
        </Txt>
      </g>
      <rect x={250} y={130} width={260} height={150} rx={6} fill={C.machine} stroke={C.ink} strokeWidth={2} />
      <g transform={`translate(380 205) rotate(${runs > 0 ? 1400 * Math.max(0, t - 0.42) : 0})`}>
        <Gear cx={0} cy={0} r={52} teeth={14} angle={0} />
      </g>
      {param !== 1 && <Person x={560} y={330} scale={0.9} />}
      {param !== 1 && (
        <g opacity={runs}>
          <HazardSign x={560} y={110} size={40} />
          <Tag x={380} y={320} text="Partida inesperada: acidente grave" tone="bad" anchor="middle" />
        </g>
      )}
      {param === 1 && (
        <g opacity={appear(t, 0.45)}>
          <rect x={262} y={60} width={256} height={44} rx={8} fill={C.green} />
          <Txt x={390} y={87} anchor="middle" size={13} fill="#fff">
            Aguardando comando de partida
          </Txt>
          <Tag x={380} y={320} text="NR-12, 12.4.2: não partir sozinha" tone="ok" anchor="middle" />
        </g>
      )}
    </SceneFrame>
  );
};

const StoredEnergy: Scene = ({ t }) => {
  const flywheelSpeed = 1 - ease(t);
  return (
    <SceneFrame label="Energia armazenada: mola comprimida, volante girando depois de desligado e acumulador com pressão">
      <g opacity={appear(t, 0.02)}>
        <path d="M 60 200 l 10 -20 l 10 40 l 10 -40 l 10 40 l 10 -40 l 10 40 l 10 -20" fill="none" stroke={C.ink} strokeWidth={3} />
        <rect x={40} y={170} width={20} height={60} fill={C.steelDark} />
        <rect x={140} y={175} width={20} height={50} fill={C.steel} stroke={C.ink} />
        <Txt x={100} y={270} anchor="middle">
          Mola comprimida
        </Txt>
      </g>
      <g opacity={appear(t, 0.2)}>
        <g transform={`translate(320 200) rotate(${(1 - (1 - t) * (1 - t)) * 900})`}>
          <circle r={60} fill={C.steel} stroke={C.ink} strokeWidth={2} />
          <circle r={14} fill={C.steelDark} />
          <line x1={0} y1={-56} x2={0} y2={-20} stroke={C.ink} strokeWidth={6} />
        </g>
        <Txt x={320} y={290} anchor="middle">
          Volante ainda girando
        </Txt>
        <Txt x={320} y={308} anchor="middle" size={11} weight={500} fill={C.muted}>
          {flywheelSpeed > 0.05 ? 'motor desligado há segundos' : 'parou — agora confirme'}
        </Txt>
      </g>
      <g opacity={appear(t, 0.45)}>
        <rect x={500} y={130} width={60} height={120} rx={28} fill={C.machineLight} stroke={C.ink} strokeWidth={2} />
        <g transform="translate(530 110) scale(0.5)">
          <EnergyIcon kind="pre" x={0} y={0} t={0.85} />
        </g>
        <Txt x={530} y={290} anchor="middle">
          Acumulador
        </Txt>
      </g>
    </SceneFrame>
  );
};

const LotoSteps: Scene = ({ t, param = 0 }) => {
  const steps = ['Avisar e desligar', 'Isolar as fontes', 'Descarregar energias', 'Cadeado + etiqueta', 'Testar a partida', 'Começar o serviço'];
  const active = param === 0 ? [0] : param === 1 ? [1, 2] : [4, 5];
  return (
    <SceneFrame label="Etapas gerais de isolamento e bloqueio de energias">
      {steps.map((s, i) => {
        const on = active.includes(i);
        const done = i < Math.min(...active);
        const x = 60 + (i % 3) * 200;
        const y = i < 3 ? 110 : 240;
        return (
          <g key={s} opacity={on ? appear(t, 0.05 + active.indexOf(i) * 0.25) * 0.7 + 0.3 : done ? 0.85 : 0.35}>
            <rect x={x} y={y - 40} width={170} height={80} rx={10} fill={on ? C.accent : done ? C.green : '#fff'} stroke={C.ink} strokeWidth={1.5} />
            <Txt x={x + 85} y={y - 8} anchor="middle" size={13} fill={on || done ? '#fff' : C.ink}>
              {i + 1}
            </Txt>
            <Txt x={x + 85} y={y + 14} anchor="middle" size={14} fill={on || done ? '#fff' : C.ink}>
              {s}
            </Txt>
          </g>
        );
      })}
      {param === 2 && (
        <g opacity={appear(t, 0.5)}>
          <Tag x={320} y={330} text="Apertou partir e nada se moveu? Bloqueio confirmado." anchor="middle" tone="ok" />
        </g>
      )}
    </SceneFrame>
  );
};

const LotoTag: Scene = ({ t }) => (
  <SceneFrame label="Seccionadora bloqueada com garra múltipla, dois cadeados e etiqueta preenchida">
    <rect x={70} y={60} width={150} height={230} rx={8} fill="#c9ccd1" stroke={C.ink} strokeWidth={2} />
    <rect x={120} y={120} width={50} height={90} rx={6} fill={C.steelDark} stroke={C.ink} />
    <rect x={132} y={175} width={26} height={30} fill={C.red} stroke={C.ink} />
    <Txt x={145} y={110} anchor="middle" size={12}>
      DESLIGADO
    </Txt>
    <rect x={136} y={210} width={18} height={40} fill={C.steel} stroke={C.ink} />
    <g opacity={appear(t, 0.15)}>
      <Padlock x={130} y={270} color={C.red} />
      <Padlock x={165} y={270} color={C.blue} />
    </g>
    <line x1={150} y1={280} x2={300} y2={170} stroke={C.ink} strokeWidth={1.5} opacity={appear(t, 0.3)} />
    <g opacity={appear(t, 0.3)}>
      <rect x={300} y={70} width={280} height={220} rx={8} fill="#fff" stroke={C.red} strokeWidth={4} />
      <rect x={300} y={70} width={280} height={40} rx={6} fill={C.red} />
      <Txt x={440} y={97} anchor="middle" size={16} fill="#fff">
        PERIGO — NÃO OPERE
      </Txt>
      {[
        ['Data', '17/10'],
        ['Horário', '14h30'],
        ['Motivo', 'troca do selo da bomba B-02'],
        ['Responsável', 'J. Silva (ilustrativo)']
      ].map(([k, v], i) => (
        <g key={k} opacity={appear(t, 0.4 + i * 0.12)}>
          <Txt x={318} y={145 + i * 38} size={12} fill={C.muted}>
            {k}
          </Txt>
          <Txt x={318} y={162 + i * 38} size={14}>
            {v}
          </Txt>
        </g>
      ))}
    </g>
  </SceneFrame>
);

const HandlingLoad: Scene = ({ t }) => {
  const lift = ease(t / 0.7);
  return (
    <SceneFrame label="Talha com placa de carga máxima içando uma peça; ninguém sob a carga">
      <rect x={60} y={30} width={520} height={14} fill={C.steelDark} />
      <rect x={290} y={44} width={60} height={40} rx={4} fill={C.yellow} stroke={C.ink} strokeWidth={1.5} />
      <g opacity={appear(t, 0.1)}>
        <rect x={360} y={50} width={130} height={30} rx={4} fill="#fff" stroke={C.ink} />
        <Txt x={425} y={70} anchor="middle" size={12}>
          CMT: 500 kg (ilustrativo)
        </Txt>
      </g>
      <line x1={320} y1={84} x2={320} y2={250 - lift * 90} stroke={C.ink} strokeWidth={2.5} />
      <rect x={280} y={250 - lift * 90} width={80} height={50} rx={4} fill={C.machine} stroke={C.ink} strokeWidth={2} />
      <rect x={250} y={298} width={140} height={22} fill="rgba(214,51,47,0.15)" stroke={C.red} strokeDasharray="6 4" />
      <Txt x={320} y={340} anchor="middle" size={12} fill={C.red}>
        área abaixo da carga: ninguém
      </Txt>
      <Person x={520} y={320} helmet glasses boots gloves />
      <Tag x={120} y={150} text="Conferir capacidade" anchor="middle" opacity={appear(t, 0.2)} />
      <Tag x={120} y={185} text="Inspecionar cinta e gancho" anchor="middle" opacity={appear(t, 0.35)} />
    </SceneFrame>
  );
};

const HandlingLift: Scene = ({ t }) => {
  const good = appear(t, 0.5, 0.1);
  return (
    <SceneFrame label="Levantamento manual: carga longe do corpo é errado; carga perto do corpo é o correto">
      <g opacity={1 - good * 0.6}>
        <Person x={180} y={320} />
        <rect x={240} y={180} width={60} height={40} fill={C.steelDark} stroke={C.ink} />
        <line x1={180} y1={200} x2={270} y2={200} stroke={C.red} strokeWidth={2} strokeDasharray="4 3" />
        <Txt x={225} y={192} anchor="middle" size={11} fill={C.red}>
          longe
        </Txt>
        <CheckMark x={180} y={100} ok={false} size={28} />
      </g>
      <g opacity={good}>
        <Person x={450} y={320} />
        <rect x={430} y={230} width={44} height={36} fill={C.steelDark} stroke={C.ink} />
        <CheckMark x={450} y={100} size={28} />
        <Tag x={450} y={60} text="Carga perto do corpo, sem torcer" tone="ok" anchor="middle" />
      </g>
      <Txt x={320} y={350} anchor="middle" size={11} weight={500} fill={C.muted}>
        Referência: NR-17, item 17.5.2.1 (distância horizontal da pega)
      </Txt>
    </SceneFrame>
  );
};

const HandlingToolDamaged: Scene = ({ t }) => (
  <SceneFrame label="Martelo com cabo trincado é retirado de uso com etiqueta">
    <g transform="translate(150 190) rotate(-20)">
      <rect x={-10} y={-10} width={220} height={22} rx={8} fill="#c58b4b" stroke={C.ink} strokeWidth={2} />
      <path d="M 120 -10 L 128 2 L 118 12" fill="none" stroke={C.ink} strokeWidth={2.5} />
      <rect x={200} y={-40} width={50} height={80} rx={6} fill={C.steelDark} stroke={C.ink} strokeWidth={2} />
    </g>
    <g opacity={appear(t, 0.35)}>
      <rect x={400} y={120} width={170} height={90} rx={6} fill="#fff" stroke={C.red} strokeWidth={3} />
      <Txt x={485} y={155} anchor="middle" size={15} fill={C.red}>
        FORA DE USO
      </Txt>
      <Txt x={485} y={178} anchor="middle" size={12}>
        cabo trincado
      </Txt>
      <Txt x={485} y={196} anchor="middle" size={11} weight={500} fill={C.muted}>
        avisado ao responsável
      </Txt>
    </g>
    <Tag x={180} y={320} text="Fita isolante não devolve a resistência" anchor="middle" tone="bad" opacity={appear(t, 0.6)} />
  </SceneFrame>
);

const SupervisionRoles: Scene = ({ t, param }) => {
  const roles =
    param === 1
      ? [
          { title: 'Capacitação', sub: 'pela empresa, antes da função', color: C.blue },
          { title: 'Autorização', sub: 'formal, para aquela máquina', color: C.green },
          { title: 'Este aplicativo', sub: 'estudo — não autoriza', color: C.muted }
        ]
      : [
          { title: 'Capacitado', sub: 'treinado pela empresa', color: C.blue },
          { title: 'Qualificado', sub: 'curso reconhecido', color: C.machine },
          { title: 'Legalmente habilitado', sub: 'registro em conselho', color: C.accent }
        ];
  return (
    <SceneFrame label="Tipos de profissional previstos na NR-12 e a exigência de autorização">
      {roles.map((r, i) => (
        <g key={r.title} opacity={appear(t, 0.05 + i * 0.2)}>
          <rect x={45 + i * 190} y={90} width={170} height={150} rx={12} fill="#fff" stroke={r.color} strokeWidth={4} />
          <circle cx={130 + i * 190} cy={135} r={22} fill={r.color} />
          <Txt x={130 + i * 190} y={190} anchor="middle" size={15}>
            {r.title}
          </Txt>
          <Txt x={130 + i * 190} y={212} anchor="middle" size={11.5} weight={500} fill={C.muted}>
            {r.sub}
          </Txt>
        </g>
      ))}
      {param !== 1 && <Tag x={320} y={300} text="+ autorizado pelo empregador (NR-12, 12.16.1)" anchor="middle" tone="accent" opacity={appear(t, 0.7)} />}
    </SceneFrame>
  );
};

const SupervisionStop: Scene = ({ t }) => (
  <SceneFrame label="Diante de dúvida ou condição estranha: parar e chamar o responsável">
    <g transform="translate(170 180)">
      <polygon points="-70,-29 -29,-70 29,-70 70,-29 70,29 29,70 -29,70 -70,29" fill={C.red} stroke={C.ink} strokeWidth={3} />
      <Txt x={0} y={9} anchor="middle" size={26} fill="#fff" weight={800}>
        PARE
      </Txt>
    </g>
    {['Tarefa fora do meu treinamento', 'Não há procedimento escrito', 'Barulho, cheiro ou vazamento estranho', 'Proteção ou bloqueio com problema'].map((s, i) => (
      <g key={s} opacity={appear(t, 0.1 + i * 0.15)}>
        <HazardSign x={300} y={100 + i * 52} size={24} />
        <Txt x={322} y={106 + i * 52} size={14}>
          {s}
        </Txt>
      </g>
    ))}
    <Tag x={460} y={330} text="Chame o responsável antes de continuar" anchor="middle" tone="accent" opacity={appear(t, 0.75)} />
  </SceneFrame>
);

/* ───────────────────────── FERRAMENTAS E FIXAÇÃO ───────────────────────── */

const WrenchShape: React.FC<{ x: number; y: number; scale?: number; rot?: number }> = ({ x, y, scale = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
    <rect x={-120} y={-12} width={240} height={24} rx={8} fill={C.steelLight} stroke={C.ink} strokeWidth={2} />
    <path d="M -128 -20 C -170 -32 -196 -18 -196 0 L -160 -7 L -160 7 L -196 0 C -196 18 -170 32 -128 20 Z" fill={C.steelLight} stroke={C.ink} strokeWidth={2} transform="rotate(-15 -128 0)" />
    <circle cx={150} cy={0} r={32} fill={C.steelLight} stroke={C.ink} strokeWidth={2} />
    <polygon points={hexPoints(150, 0, 30, 0)} fill={C.paper} stroke={C.ink} strokeWidth={1.5} />
    <polygon points={hexPoints(150, 0, 30, 30)} fill="none" stroke={C.ink} strokeWidth={1} />
    <Txt x={0} y={5} anchor="middle" size={12}>
      19
    </Txt>
  </g>
);

const WrenchAnatomy: Scene = ({ t }) => (
  <SceneFrame label="Chave combinada com boca aberta inclinada de um lado e anel estriado do outro">
    <WrenchShape x={330} y={180} />
    <Tag x={150} y={110} text="Boca aberta (inclinada ~15°)" anchor="middle" opacity={appear(t, 0.1)} />
    <Tag x={480} y={110} text="Anel estriado (12 pontos)" anchor="middle" opacity={appear(t, 0.35)} />
    <Tag x={330} y={250} text="Medida gravada: 19 mm nas duas pontas" anchor="middle" tone="accent" opacity={appear(t, 0.6)} />
  </SceneFrame>
);

const WrenchFit: Scene = ({ t, param }) => {
  if (param === 1) {
    const slip = appear(t, 0.3, 0.2);
    return (
      <SceneFrame label="Chave folgada escorrega e arredonda os cantos do sextavado; a chave certa abraça as faces">
        <g transform="translate(180 180)">
          <polygon points={hexPoints(0, 0, 90, 0)} fill={C.steel} stroke={C.ink} strokeWidth={2} strokeLinejoin={slip > 0.5 ? 'round' : 'miter'} />
          <rect x={-60} y={-60} width={120} height={120} rx={14} fill="none" stroke={C.red} strokeWidth={4} transform={`rotate(${slip * 22})`} />
          <CheckMark x={0} y={-90} ok={false} size={28} />
          <Txt x={0} y={110} anchor="middle" size={13}>
            Chave maior: escorrega
          </Txt>
        </g>
        <g transform="translate(460 180)" opacity={appear(t, 0.55)}>
          <polygon points={hexPoints(0, 0, 90, 0)} fill={C.steel} stroke={C.ink} strokeWidth={2} />
          <polygon points={hexPoints(0, 0, 94, 0)} fill="none" stroke={C.green} strokeWidth={4} />
          <CheckMark x={0} y={-90} size={28} />
          <Txt x={0} y={110} anchor="middle" size={13}>
            Medida certa: abraça as faces
          </Txt>
        </g>
      </SceneFrame>
    );
  }
  return (
    <SceneFrame label="Sextavado com a cota de distância entre faces destacada">
      <g transform="translate(240 180)">
        <polygon points={hexPoints(0, 0, 160, 0)} fill={C.steel} stroke={C.ink} strokeWidth={2.5} />
        <circle r={36} fill="none" stroke={C.steelDark} strokeWidth={2} strokeDasharray="5 4" />
        <g opacity={appear(t, 0.2)}>
          <line x1={-80} y1={-110} x2={-80} y2={-60} stroke={C.accent} strokeWidth={1.5} />
          <line x1={80} y1={-110} x2={80} y2={-60} stroke={C.accent} strokeWidth={1.5} />
          <line x1={-78} y1={-100} x2={78} y2={-100} stroke={C.accent} strokeWidth={2.5} markerStart="url(#mk-arrow-accent)" markerEnd="url(#mk-arrow-accent)" />
          <Txt x={0} y={-112} anchor="middle" fill={C.accent} size={14}>
            distância entre faces
          </Txt>
        </g>
      </g>
      <g opacity={appear(t, 0.5)}>
        <Txt x={400} y={150} size={15}>
          M12 · ISO 4017 → 18 mm
        </Txt>
        <Txt x={400} y={180} size={15}>
          M12 · DIN 933 → 19 mm
        </Txt>
        <Txt x={400} y={215} size={12} weight={500} fill={C.muted}>
          Mesma rosca, cabeças diferentes:
        </Txt>
        <Txt x={400} y={233} size={12} weight={500} fill={C.muted}>
          confira antes de aplicar força.
        </Txt>
      </g>
    </SceneFrame>
  );
};

const BoltSide: React.FC<{ x: number; y: number; len?: number; scale?: number }> = ({ x, y, len = 230, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={0} y={-40} width={44} height={80} rx={4} fill={C.steel} stroke={C.ink} strokeWidth={2} />
    <line x1={0} y1={-14} x2={44} y2={-14} stroke={C.steelDark} />
    <line x1={0} y1={14} x2={44} y2={14} stroke={C.steelDark} />
    <rect x={44} y={-22} width={len} height={44} fill={C.steelLight} stroke={C.ink} strokeWidth={2} />
    {Array.from({ length: Math.floor((len - 50) / 12) }, (_, i) => (
      <line key={i} x1={94 + i * 12} y1={-22} x2={86 + i * 12} y2={22} stroke={C.steelDark} strokeWidth={1.4} />
    ))}
  </g>
);

const FastenerAnatomy: Scene = ({ t, param }) => {
  if (param === 1) {
    return (
      <SceneFrame label="Dois parafusos com a mesma aparência e marcações diferentes: 8.8 e 4.6">
        <BoltSide x={90} y={120} len={200} />
        <BoltSide x={90} y={250} len={200} />
        <g opacity={appear(t, 0.3)}>
          <Txt x={420} y={126} size={18}>
            8.8
          </Txt>
          <Txt x={420} y={256} size={18}>
            4.6
          </Txt>
          <Txt x={470} y={126} size={12} weight={500} fill={C.muted}>
            mais resistente
          </Txt>
          <Txt x={470} y={256} size={12} weight={500} fill={C.muted}>
            menos resistente
          </Txt>
        </g>
        <Tag x={320} y={330} text="Iguais por fora ≠ iguais no projeto" anchor="middle" tone="accent" opacity={appear(t, 0.6)} />
      </SceneFrame>
    );
  }
  return (
    <SceneFrame label="Parafuso sextavado com cabeça, rosca, comprimento e marcação de classe identificados">
      <BoltSide x={120} y={180} />
      <Tag x={142} y={110} text="Cabeça e acionamento" anchor="middle" opacity={appear(t, 0.05)} />
      <g opacity={appear(t, 0.25)}>
        <line x1={164} y1={240} x2={394} y2={240} stroke={C.accent} strokeWidth={2} markerStart="url(#mk-arrow-accent)" markerEnd="url(#mk-arrow-accent)" />
        <Txt x={279} y={262} anchor="middle" fill={C.accent}>
          comprimento (sob a cabeça)
        </Txt>
      </g>
      <g opacity={appear(t, 0.45)}>
        <line x1={414} y1={158} x2={414} y2={202} stroke={C.accent} strokeWidth={2} markerStart="url(#mk-arrow-accent)" markerEnd="url(#mk-arrow-accent)" />
        <Txt x={424} y={185} fill={C.accent}>
          diâmetro nominal
        </Txt>
      </g>
      <g opacity={appear(t, 0.6)}>
        <line x1={238} y1={130} x2={250} y2={130} stroke={C.accent} strokeWidth={2} />
        <Txt x={244} y={122} anchor="middle" fill={C.accent}>
          passo
        </Txt>
      </g>
      <Tag x={142} y={290} text="8.8 gravado na cabeça" anchor="middle" opacity={appear(t, 0.75)} />
    </SceneFrame>
  );
};

const FastenerCallout: Scene = ({ t }) => {
  const parts = [
    { txt: 'M10', sub: 'rosca métrica, Ø 10 mm' },
    { txt: '× 1,5', sub: 'passo: 1,5 mm' },
    { txt: '× 30', sub: 'comprimento: 30 mm' },
    { txt: '— 8.8', sub: 'classe de resistência' }
  ];
  return (
    <SceneFrame label="Designação M10 × 1,5 × 30 — 8.8 decomposta em partes">
      {parts.map((p, i) => (
        <g key={p.txt} opacity={appear(t, 0.05 + i * 0.18)}>
          <Txt x={110 + i * 140} y={150} anchor="middle" size={34} weight={700} fill={i % 2 ? C.accent : C.ink}>
            {p.txt}
          </Txt>
          <line x1={110 + i * 140} y1={165} x2={110 + i * 140} y2={205} stroke={C.line} strokeWidth={2} />
          <Txt x={110 + i * 140} y={228} anchor="middle" size={12.5} weight={500}>
            {p.sub}
          </Txt>
        </g>
      ))}
      <Txt x={320} y={300} anchor="middle" size={12} weight={500} fill={C.muted} opacity={appear(t, 0.8)}>
        Na rosca métrica grossa o passo costuma ser omitido: "M10" já indica passo 1,5 mm.
      </Txt>
    </SceneFrame>
  );
};

const CaliperRead: Scene = ({ param = 23.35 }) => (
  <div style={{ background: C.paper }} className="flex h-full w-full items-center justify-center p-2">
    <CaliperReading reading={param} label={`Escala de paquímetro com leitura de ${String(param.toFixed(2)).replace('.', ',')} milímetros`} />
  </div>
);

/* ───────────────────────── COMPONENTES E BOMBAS ───────────────────────── */

const BearingSection: Scene = ({ t }) => {
  const balls = 10;
  return (
    <SceneFrame label="Rolamento rígido de esferas visto de frente: anel externo, anel interno, esferas e gaiola">
      <g transform="translate(220 180)">
        <circle r={130} fill={C.steelLight} stroke={C.ink} strokeWidth={2} />
        <circle r={100} fill={C.paper} stroke={C.ink} strokeWidth={2} />
        <circle r={62} fill={C.steel} stroke={C.ink} strokeWidth={2} />
        <circle r={40} fill={C.paper} stroke={C.ink} strokeWidth={2} />
        <g transform={`rotate(${t * 180})`}>
          <circle r={81} fill="none" stroke={C.oil} strokeWidth={6} opacity={0.5} />
          {Array.from({ length: balls }, (_, i) => {
            const a = (i / balls) * Math.PI * 2;
            return <circle key={i} cx={Math.cos(a) * 81} cy={Math.sin(a) * 81} r={17} fill={C.steelDark} stroke={C.ink} strokeWidth={1.5} />;
          })}
        </g>
      </g>
      <Tag x={400} y={70} text="Anel externo — fica na caixa" opacity={appear(t, 0.05)} />
      <Tag x={400} y={130} text="Esferas — rolam entre os anéis" opacity={appear(t, 0.25)} />
      <Tag x={400} y={190} text="Gaiola — mantém o espaçamento" opacity={appear(t, 0.45)} />
      <Tag x={400} y={250} text="Anel interno — gira com o eixo" opacity={appear(t, 0.65)} />
    </SceneFrame>
  );
};

const BearingLoads: Scene = ({ t }) => (
  <SceneFrame label="Eixo apoiado em rolamento com carga radial (vertical) e carga axial (ao longo do eixo)">
    <rect x={100} y={165} width={420} height={30} rx={6} fill={C.steel} stroke={C.ink} strokeWidth={2} />
    <rect x={280} y={130} width={60} height={100} rx={4} fill={C.steelLight} stroke={C.ink} strokeWidth={2} />
    <g opacity={appear(t, 0.1)}>
      <Arrow x1={310} y1={40} x2={310} y2={122} color={C.accent} width={5} />
      <Txt x={325} y={70} fill={C.accent} size={15}>
        Carga radial
      </Txt>
    </g>
    <g opacity={appear(t, 0.5)}>
      <Arrow x1={560} y1={180} x2={528} y2={180} color={C.blue} width={5} />
      <Txt x={470} y={250} fill={C.blue} size={15}>
        Carga axial
      </Txt>
    </g>
  </SceneFrame>
);

const BearingMounting: Scene = ({ t }) => {
  const push = ease(t / 0.6) * 70;
  return (
    <SceneFrame label="Montagem de rolamento com bucha apoiada no anel interno; a força não passa pelas esferas">
      <rect x={60} y={165} width={460} height={30} rx={4} fill={C.steel} stroke={C.ink} strokeWidth={2} />
      <g transform={`translate(${380 - push} 0)`}>
        <rect x={0} y={110} width={40} height={140} rx={4} fill={C.steelLight} stroke={C.ink} strokeWidth={2} />
        <rect x={0} y={150} width={40} height={14} fill={C.steel} stroke={C.ink} />
        <rect x={0} y={196} width={40} height={14} fill={C.steel} stroke={C.ink} />
        <circle cx={20} cy={130} r={9} fill={C.steelDark} />
        <circle cx={20} cy={230} r={9} fill={C.steelDark} />
        <rect x={40} y={150} width={140} height={14} fill={C.machineLight} stroke={C.ink} />
        <rect x={40} y={196} width={140} height={14} fill={C.machineLight} stroke={C.ink} />
        <Arrow x1={240} y1={180} x2={190} y2={180} color={C.accent} width={6} />
      </g>
      <Tag x={430} y={90} text="Bucha apoia só no anel interno" tone="ok" anchor="middle" opacity={appear(t, 0.3)} />
      <Txt x={320} y={320} anchor="middle" size={13} weight={500} fill={C.muted} opacity={appear(t, 0.6)}>
        Martelar o anel externo faria a força atravessar as esferas e marcar as pistas.
      </Txt>
    </SceneFrame>
  );
};

const SealSection: Scene = ({ t, param = 0 }) => {
  const dry = param === 2;
  const film = !dry;
  const heat = dry ? appear(t, 0.2, 0.4) : 0;
  return (
    <SceneFrame label="Corte de selo mecânico: face rotativa no eixo, sede estacionária na tampa e mola">
      <rect x={60} y={160} width={520} height={40} fill={C.steel} stroke={C.ink} strokeWidth={2} />
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={70 + ((i * 66 + t * 400) % 500)} y1={162} x2={62 + ((i * 66 + t * 400) % 500)} y2={198} stroke={C.steelDark} strokeWidth={2} />
      ))}
      <rect x={300} y={60} width={40} height={100} fill={C.machine} stroke={C.ink} strokeWidth={2} />
      <rect x={300} y={200} width={40} height={100} fill={C.machine} stroke={C.ink} strokeWidth={2} />
      {/* sede estacionária */}
      <rect x={280} y={110} width={20} height={50} fill={dry ? `rgb(${230},${230 - heat * 120},${220 - heat * 180})` : '#e9e6dc'} stroke={C.ink} strokeWidth={1.5} />
      <rect x={280} y={200} width={20} height={50} fill={dry ? `rgb(${230},${230 - heat * 120},${220 - heat * 180})` : '#e9e6dc'} stroke={C.ink} strokeWidth={1.5} />
      {/* face rotativa */}
      <rect x={258} y={115} width={20} height={45} fill="#2a2b2e" stroke={C.ink} />
      <rect x={258} y={200} width={20} height={45} fill="#2a2b2e" stroke={C.ink} />
      {/* mola */}
      {[118, 205].map((y) => (
        <path key={y} d={`M 200 ${y + 18} l 8 -12 l 8 24 l 8 -24 l 8 24 l 8 -24 l 8 24 l 8 -12`} fill="none" stroke={C.ink} strokeWidth={2.5} />
      ))}
      {film && (
        <g opacity={param >= 1 ? appear(t, 0.2) : 0}>
          <rect x={277} y={115} width={4} height={45} fill={C.water} />
          <rect x={277} y={200} width={4} height={45} fill={C.water} />
        </g>
      )}
      <rect x={360} y={60} width={220} height={100} fill={C.water} opacity={0.25} />
      <Txt x={470} y={100} anchor="middle" size={13} fill={C.blue}>
        líquido sob pressão
      </Txt>
      {param === 0 && <Tag x={320} y={330} text="O eixo gira; a carcaça fica parada" anchor="middle" opacity={appear(t, 0.2)} />}
      {param === 1 && (
        <>
          <Tag x={200} y={70} text="Mola" anchor="middle" opacity={appear(t, 0.1)} />
          <Tag x={268} y={290} text="Face que gira" anchor="middle" opacity={appear(t, 0.3)} />
          <Tag x={420} y={290} text="Sede parada + filme de líquido" anchor="middle" opacity={appear(t, 0.5)} />
        </>
      )}
      {dry && <Tag x={320} y={330} text="A seco: atrito, calor e trincas nas faces" anchor="middle" tone="bad" opacity={appear(t, 0.35)} />}
    </SceneFrame>
  );
};

const PumpCentrifugal: Scene = ({ t }) => {
  const angle = t * 720;
  return (
    <SceneFrame label="Bomba centrífuga em corte: o líquido entra pelo centro do rotor e sai pela voluta">
      <path d="M 230 70 A 120 120 0 1 1 110 190 L 110 60 L 230 60 Z" fill="#dfe8f0" stroke={C.ink} strokeWidth={2.5} />
      <g transform={`translate(230 190) rotate(${angle})`}>
        <circle r={80} fill="#cdd6de" stroke={C.ink} strokeWidth={2} />
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d="M 18 0 Q 50 10 76 -20" fill="none" stroke={C.ink} strokeWidth={4} transform={`rotate(${i * 60})`} />
        ))}
        <circle r={18} fill={C.steelDark} />
      </g>
      {[0, 1, 2].map((i) => {
        const p = (t * 2 + i / 3) % 1;
        const r = 20 + p * 100;
        const a = (p * 260 + i * 120) * (Math.PI / 180);
        return <circle key={i} cx={230 + Math.cos(a) * r} cy={190 + Math.sin(a) * r} r={7} fill={C.water} />;
      })}
      <Arrow x1={175} y1={40} x2={175} y2={12} color={C.blue} width={5} />
      <Txt x={190} y={30} fill={C.blue} size={13}>
        saída (pressão)
      </Txt>
      <Tag x={380} y={120} text="Rotor dá velocidade ao líquido" opacity={appear(t, 0.15)} />
      <Tag x={380} y={170} text="Voluta converte em pressão" opacity={appear(t, 0.4)} />
      <Tag x={380} y={220} text="Entrada pelo centro (olho)" opacity={appear(t, 0.65)} />
      <Txt x={380} y={280} size={12} weight={500} fill={C.muted} opacity={appear(t, 0.7)}>
        Família: bombas dinâmicas
      </Txt>
    </SceneFrame>
  );
};

/** Bomba de engrenagens externas em corte, com bolsões de líquido transportados pela periferia. */
export const GearPumpSection: React.FC<{ t: number; showPockets?: boolean; labels?: boolean }> = ({ t, showPockets = true, labels = true }) => {
  const teeth = 12;
  const r = 58;
  const spin = t * 360;
  const cxA = 250;
  const cxB = 250 + r * 1.84;
  const cy = 180;
  const half = 180 / teeth;
  return (
    <g>
      <path
        d={`M ${cxA - 80} ${cy - 62} A 62 62 0 0 1 ${cxA} ${cy - 66} L ${cxB} ${cy - 66} A 62 62 0 0 1 ${cxB + 80} ${cy - 62} L ${cxB + 80} ${cy + 62} A 62 62 0 0 1 ${cxB} ${cy + 66} L ${cxA} ${cy + 66} A 62 62 0 0 1 ${cxA - 80} ${cy + 62} Z`}
        fill="none"
        stroke="none"
      />
      <rect x={cxA - 90} y={cy - 80} width={cxB - cxA + 180} height={160} rx={70} fill="#dfe8f0" stroke={C.ink} strokeWidth={2.5} />
      <rect x={(cxA + cxB) / 2 - 22} y={cy + 70} width={44} height={60} fill="#dfe8f0" stroke={C.ink} strokeWidth={2.5} />
      <rect x={(cxA + cxB) / 2 - 22} y={cy - 130} width={44} height={60} fill="#dfe8f0" stroke={C.ink} strokeWidth={2.5} />
      <rect x={(cxA + cxB) / 2 - 20} y={cy + 66} width={40} height={10} fill="#dfe8f0" />
      <rect x={(cxA + cxB) / 2 - 20} y={cy - 76} width={40} height={10} fill="#dfe8f0" />
      <Gear cx={cxA} cy={cy} r={r} teeth={teeth} angle={spin} fill={C.steel} />
      <Gear cx={cxB} cy={cy} r={r} teeth={teeth} angle={-spin + half} fill={C.steelLight} />
      {showPockets &&
        [0, 1, 2, 3].map((i) => {
          const p = (t * 1.2 + i / 4) % 1;
          // Bolsões levados pela periferia: engrenagem da esquerda (sentido horário visto aqui) e da direita (anti-horário)
          const aL = Math.PI / 2 + p * Math.PI;
          const aR = Math.PI / 2 - p * Math.PI;
          return (
            <g key={i}>
              <circle cx={cxA + Math.cos(aL) * (r + 2)} cy={cy + Math.sin(aL) * (r + 2)} r={6} fill={C.oil} />
              <circle cx={cxB + Math.cos(aR) * (r + 2)} cy={cy + Math.sin(aR) * (r + 2)} r={6} fill={C.oil} />
            </g>
          );
        })}
      {labels && (
        <>
          <Arrow x1={(cxA + cxB) / 2} y1={cy + 150} x2={(cxA + cxB) / 2} y2={cy + 118} color={C.blue} width={4} />
          <Txt x={(cxA + cxB) / 2 + 30} y={cy + 145} fill={C.blue} size={13}>
            entrada (sucção)
          </Txt>
          <Arrow x1={(cxA + cxB) / 2} y1={cy - 120} x2={(cxA + cxB) / 2} y2={cy - 152} color={C.blue} width={4} />
          <Txt x={(cxA + cxB) / 2 + 30} y={cy - 140} fill={C.blue} size={13}>
            saída (recalque)
          </Txt>
        </>
      )}
    </g>
  );
};

const PumpGear: Scene = ({ t }) => (
  <SceneFrame label="Bomba de engrenagens externas em corte: o óleo é levado nos vãos dos dentes pela periferia, da entrada (embaixo) à saída (em cima)">
    <g transform="translate(-60 0)">
      <GearPumpSection t={t} />
    </g>
    <Tag x={410} y={60} text="Óleo vai nos vãos dos dentes" opacity={appear(t, 0.2)} />
    <Tag x={410} y={300} text="Dentes engrenados vedam o meio" opacity={appear(t, 0.5)} />
    <Txt x={410} y={335} size={12} weight={500} fill={C.muted} opacity={appear(t, 0.7)}>
      Família: deslocamento positivo
    </Txt>
  </SceneFrame>
);

const PumpCompare: Scene = ({ t }) => {
  const closing = appear(t, 0.3, 0.3);
  const pressure = closing * (0.2 + 0.8 * appear(t, 0.45, 0.4));
  return (
    <SceneFrame label="Com a saída fechada, a pressão de uma bomba de deslocamento positivo sobe até a válvula de alívio abrir">
      <g transform="translate(-110 -10) scale(0.85)">
        <GearPumpSection t={t * 2} labels={false} />
      </g>
      <line x1={148} y1={40} x2={148} y2={25} stroke={C.ink} strokeWidth={10} />
      <line x1={143} y1={30} x2={420} y2={30} stroke={C.ink} strokeWidth={10} />
      <g transform="translate(330 30)">
        <polygon points="-16,-16 16,16 16,-16 -16,16" fill={closing > 0.5 ? C.red : C.green} stroke={C.ink} strokeWidth={1.5} />
        <Txt x={0} y={38} anchor="middle" size={12}>
          válvula de saída {closing > 0.5 ? 'fechada' : 'aberta'}
        </Txt>
      </g>
      <g transform="translate(470 170)">
        <circle r={60} fill="#fff" stroke={C.ink} strokeWidth={2.5} />
        <path d="M -42 30 A 52 52 0 1 1 42 30" fill="none" stroke={C.line} strokeWidth={6} />
        <path d="M 30 -42 A 52 52 0 0 1 42 30" fill="none" stroke={C.red} strokeWidth={6} />
        <line x1={0} y1={0} x2={0} y2={-46} stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" transform={`rotate(${-130 + pressure * 250})`} />
        <circle r={5} fill={C.ink} />
        <Txt x={0} y={88} anchor="middle" size={13}>
          pressão
        </Txt>
      </g>
      <Tag x={470} y={320} text={pressure > 0.8 ? 'Válvula de alívio abre e protege o sistema' : 'Sem saída, a pressão sobe'} tone={pressure > 0.8 ? 'ok' : 'accent'} anchor="middle" />
    </SceneFrame>
  );
};

const PreinspectionChecklist: Scene = ({ t, param = 0 }) => {
  const items = [
    'Ordem de serviço lida',
    'Procedimento / manual disponível',
    'Energias bloqueadas e testadas',
    'Operação avisada',
    'Ferramentas e instrumentos certos',
    'Peças, EPIs e área organizada'
  ];
  const upto = param === 0 ? 2 : param === 1 ? 4 : 6;
  const from = param === 0 ? 0 : param === 1 ? 2 : 4;
  return (
    <SceneFrame label="Prancheta com checklist antes de iniciar a manutenção">
      <rect x={150} y={30} width={340} height={300} rx={10} fill="#fff" stroke={C.ink} strokeWidth={2.5} />
      <rect x={270} y={18} width={100} height={26} rx={6} fill={C.steelDark} />
      <Txt x={320} y={75} anchor="middle" size={16}>
        Antes de começar
      </Txt>
      {items.map((it, i) => {
        const done = i < from || (i < upto && appear(t, 0.1 + (i - from) * 0.3) > 0.5);
        return (
          <g key={it}>
            <rect x={180} y={100 + i * 36} width={20} height={20} rx={4} fill="#fff" stroke={C.ink} strokeWidth={1.5} />
            {done && <path d={`M 184 ${110 + i * 36} l 5 6 l 9 -11`} fill="none" stroke={C.green} strokeWidth={3} strokeLinecap="round" />}
            <Txt x={214} y={115 + i * 36} size={14} weight={done ? 600 : 500} fill={done ? C.ink : C.muted}>
              {it}
            </Txt>
          </g>
        );
      })}
    </SceneFrame>
  );
};

/* ───────────────────────── Registro ───────────────────────── */

export const SCENES: Record<string, Scene> = {
  'hazard-workshop': HazardWorkshop,
  'hazard-vs-risk': HazardVsRisk,
  'hazard-types': HazardTypes,
  'guard-fixed': GuardFixed,
  'guard-interlock': GuardInterlock,
  'behavior-report': BehaviorReport,
  'estop-press': EstopPress,
  'estop-reset': EstopReset,
  'ppe-hierarchy': PpeHierarchy,
  'ppe-task': PpeTask,
  'ppe-ca': PpeCa,
  'behavior-housekeeping': BehaviorHousekeeping,
  'behavior-adornos': BehaviorAdornos,
  'energy-sources': EnergySources,
  'unexpected-start': UnexpectedStart,
  'stored-energy': StoredEnergy,
  'loto-steps': LotoSteps,
  'loto-tag': LotoTag,
  'handling-load': HandlingLoad,
  'handling-lift': HandlingLift,
  'handling-tool-damaged': HandlingToolDamaged,
  'supervision-roles': SupervisionRoles,
  'supervision-stop': SupervisionStop,
  'wrench-anatomy': WrenchAnatomy,
  'wrench-fit': WrenchFit,
  'fastener-anatomy': FastenerAnatomy,
  'fastener-callout': FastenerCallout,
  'caliper-read': CaliperRead,
  'bearing-section': BearingSection,
  'bearing-loads': BearingLoads,
  'bearing-mounting': BearingMounting,
  'seal-section': SealSection,
  'pump-centrifugal': PumpCentrifugal,
  'pump-gear': PumpGear,
  'pump-compare': PumpCompare,
  'preinspection-checklist': PreinspectionChecklist
};

export const MissingScene: Scene = () => (
  <SceneFrame label="Cena indisponível">
    <text x={320} y={180} textAnchor="middle" fontFamily={FONT} fontSize={14} fill={C.muted}>
      Ilustração indisponível
    </text>
  </SceneFrame>
);
