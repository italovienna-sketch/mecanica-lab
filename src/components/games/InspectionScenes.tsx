import React from 'react';
import { C, EStop, FONT, Padlock, Person, Txt } from '../micro/sceneKit';
import { LatheSide } from '../micro/MicroScenes';
import type { InspectionRound } from '../../data/games';

/**
 * Cenas estáticas dos desafios de inspeção (viewBox 640 × 360).
 * As áreas de toque estão em src/data/games.ts e foram posicionadas sobre estes desenhos.
 */

const Floor: React.FC<{ y?: number }> = ({ y = 248 }) => <rect x={0} y={y} width={640} height={360 - y} fill={C.paper2} />;

const TornoScene: React.FC = () => (
  <g>
    <Floor />
    <rect x={20} y={330} width={600} height={6} fill={C.yellow} />
    <LatheSide x={40} y={120} spin={20} guard={false} />
    {/* proteção da placa levantada (articulada à esquerda) */}
    <polygon points="102,122 64,62 84,54 112,116" fill="#9fd3f5" opacity={0.6} stroke={C.ink} strokeWidth={1.5} />
    {/* chave de aperto esquecida na placa */}
    <line x1={128} y1={128} x2={128} y2={96} stroke={C.steelDark} strokeWidth={5} strokeLinecap="round" />
    <line x1={114} y1={96} x2={142} y2={96} stroke={C.steelDark} strokeWidth={6} strokeLinecap="round" />
    {/* óleo no piso */}
    <ellipse cx={230} cy={299} rx={56} ry={13} fill={C.oil} opacity={0.65} />
    <ellipse cx={214} cy={296} rx={16} ry={4} fill="#fff" opacity={0.25} />
    {/* extintor */}
    <rect x={350} y={166} width={30} height={22} rx={2} fill={C.red} />
    <Txt x={365} y={182} anchor="middle" size={10} fill="#fff">
      EXT
    </Txt>
    <rect x={354} y={200} width={22} height={66} rx={8} fill={C.red} stroke={C.ink} strokeWidth={1.5} />
    <rect x={359} y={192} width={12} height={10} fill={C.ink} />
    <path d="M 371 196 Q 386 200 382 222" fill="none" stroke={C.ink} strokeWidth={2.5} />
    <rect x={346} y={266} width={38} height={6} fill={C.red} opacity={0.35} />
    {/* quadro de ferramentas organizado */}
    <rect x={412} y={60} width={148} height={120} rx={4} fill="#d8cdb6" stroke={C.ink} strokeWidth={2} />
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={i} transform={`translate(${434 + i * 26} 78)`}>
        <rect x={-10} y={-4} width={20} height={88} rx={3} fill="none" stroke="#b9ab8c" strokeDasharray="3 3" />
        <rect x={-3} y={6} width={6} height={70} rx={2} fill={i % 2 ? C.steelDark : C.steel} stroke={C.ink} strokeWidth={0.8} />
        <circle cx={0} cy={6} r={7} fill="none" stroke={C.ink} strokeWidth={3} />
      </g>
    ))}
    <Person x={595} y={330} scale={0.9} glasses boots longHair="tied" />
  </g>
);

const BombaScene: React.FC = () => (
  <g>
    <Floor y={262} />
    {/* painel elétrico: chave em "I" sem cadeado e um papel colado */}
    <rect x={30} y={68} width={82} height={164} rx={4} fill="#c9ccd1" stroke={C.ink} strokeWidth={2} />
    <circle cx={92} cy={84} r={6} fill={C.green} stroke={C.ink} />
    <g transform="rotate(-6 71 106)">
      <rect x={46} y={92} width={50} height={30} fill="#fffbe6" stroke={C.muted} />
      <Txt x={71} y={106} anchor="middle" size={8}>
        NÃO LIGAR
      </Txt>
      <Txt x={71} y={116} anchor="middle" size={7} weight={500} fill={C.muted}>
        manutenção
      </Txt>
    </g>
    <circle cx={71} cy={172} r={18} fill={C.yellow} stroke={C.ink} strokeWidth={1.5} />
    <rect x={67} y={152} width={8} height={30} rx={3} fill={C.red} stroke={C.ink} />
    <Txt x={71} y={208} anchor="middle" size={10}>
      O · I
    </Txt>
    <line x1={112} y1={212} x2={232} y2={212} stroke={C.ink} strokeWidth={2} strokeDasharray="4 3" />
    {/* sucção com válvula bloqueada */}
    <rect x={40} y={220} width={98} height={12} fill={C.steel} stroke={C.ink} />
    <polygon points="89,214 113,238 113,214 89,238" fill={C.steelDark} stroke={C.ink} strokeWidth={1.5} />
    <line x1={101} y1={226} x2={101} y2={206} stroke={C.ink} strokeWidth={2} />
    <rect x={88} y={202} width={26} height={6} rx={2} fill={C.red} />
    <Padlock x={101} y={252} scale={0.7} />
    {/* bomba + motor */}
    <rect x={120} y={262} width={190} height={16} fill={C.machineDark} />
    <circle cx={170} cy={228} r={34} fill={C.machine} stroke={C.ink} strokeWidth={2} />
    <circle cx={170} cy={228} r={10} fill={C.steelDark} />
    <rect x={204} y={222} width={12} height={12} fill={C.steel} stroke={C.ink} />
    <rect x={216} y={198} width={86} height={64} rx={6} fill={C.machineLight} stroke={C.ink} strokeWidth={2} />
    {[0, 1, 2, 3, 4].map((i) => (
      <line key={i} x1={226 + i * 16} y1={204} x2={226 + i * 16} y2={256} stroke={C.machineDark} strokeWidth={3} />
    ))}
    {/* descarga com manômetro indicando pressão */}
    <rect x={164} y={128} width={12} height={68} fill={C.steel} stroke={C.ink} />
    <rect x={164} y={124} width={150} height={12} fill={C.steel} stroke={C.ink} />
    <line x1={240} y1={124} x2={240} y2={136} stroke={C.ink} strokeWidth={4} />
    <circle cx={240} cy={112} r={20} fill="#fff" stroke={C.ink} strokeWidth={2} />
    <path d="M 226 120 A 16 16 0 1 1 254 120" fill="none" stroke={C.line} strokeWidth={3} />
    <line x1={240} y1={112} x2={252} y2={102} stroke={C.red} strokeWidth={2.5} strokeLinecap="round" />
    <circle cx={240} cy={112} r={2.5} fill={C.ink} />
    {/* bandeja de contenção */}
    <path d="M 112 280 L 312 280 L 306 298 L 118 298 Z" fill={C.steelLight} stroke={C.ink} strokeWidth={1.5} />
    {/* colega trabalhando */}
    <Person x={360} y={332} scale={0.9} glasses boots armUp />
    {/* botão de emergência atrás de caixas */}
    <rect x={474} y={110} width={12} height={180} fill={C.steelDark} />
    <EStop x={480} y={196} scale={0.5} />
    <rect x={446} y={232} width={72} height={40} fill="#c58b4b" stroke={C.ink} strokeWidth={1.5} />
    <rect x={452} y={204} width={60} height={28} fill="#d39c5d" stroke={C.ink} strokeWidth={1.5} />
    <line x1={452} y1={218} x2={512} y2={218} stroke="#a26d33" strokeWidth={2} />
    <line x1={446} y1={252} x2={518} y2={252} stroke="#a26d33" strokeWidth={2} />
    {/* bancada com ferramentas separadas */}
    <rect x={536} y={250} width={100} height={8} fill="#8a6a3c" />
    <rect x={544} y={258} width={8} height={70} fill="#8a6a3c" />
    <rect x={620} y={258} width={8} height={70} fill="#8a6a3c" />
    <rect x={548} y={240} width={48} height={7} rx={3} fill={C.steel} stroke={C.ink} />
    <rect x={552} y={226} width={40} height={6} rx={3} fill={C.steelDark} stroke={C.ink} />
    <rect x={602} y={222} width={8} height={26} rx={3} fill={C.red} />
    <rect x={604} y={208} width={4} height={14} fill={C.steel} />
  </g>
);

const IcamentoScene: React.FC = () => (
  <g>
    <Floor y={250} />
    {/* placa de uso obrigatório de capacete */}
    <circle cx={63} cy={69} r={28} fill={C.blue} stroke={C.ink} strokeWidth={1.5} />
    <path d="M 47 76 Q 47 52 63 52 Q 79 52 79 76 Z" fill="#fff" />
    <rect x={43} y={75} width={40} height={5} rx={2} fill="#fff" />
    {/* viga e talha */}
    <rect x={40} y={20} width={560} height={14} fill={C.steelDark} />
    <rect x={285} y={34} width={50} height={36} rx={4} fill={C.yellow} stroke={C.ink} strokeWidth={1.5} />
    <rect x={345} y={40} width={102} height={22} rx={3} fill="#fff" stroke={C.ink} />
    <Txt x={396} y={55} anchor="middle" size={11}>
      CMT 250 kg
    </Txt>
    <line x1={310} y1={70} x2={310} y2={98} stroke={C.ink} strokeWidth={3} strokeDasharray="4 2" />
    {/* gancho aberto/deformado */}
    <path d="M 310 98 L 310 108 Q 310 126 296 124 Q 286 122 290 110" fill="none" stroke={C.steelDark} strokeWidth={5} strokeLinecap="round" />
    {/* cintas e motor */}
    <line x1={304} y1={120} x2={276} y2={138} stroke="#c97a16" strokeWidth={4} />
    <line x1={304} y1={120} x2={348} y2={138} stroke="#c97a16" strokeWidth={4} />
    <rect x={270} y={136} width={84} height={44} rx={6} fill={C.machine} stroke={C.ink} strokeWidth={2} />
    {[0, 1, 2, 3].map((i) => (
      <line key={i} x1={282 + i * 14} y1={140} x2={282 + i * 14} y2={176} stroke={C.machineDark} strokeWidth={3} />
    ))}
    <rect x={318} y={150} width={32} height={18} fill="#fff" stroke={C.ink} strokeWidth={0.8} />
    <Txt x={334} y={163} anchor="middle" size={9}>
      380 kg
    </Txt>
    {/* pessoa embaixo da carga */}
    <Person x={311} y={332} scale={0.78} />
    {/* operador com botoeira */}
    <line x1={292} y1={70} x2={172} y2={238} stroke={C.ink} strokeWidth={1.5} />
    <rect x={164} y={236} width={16} height={30} rx={3} fill={C.yellow} stroke={C.ink} />
    <Person x={140} y={334} scale={0.95} helmet glasses boots gloves />
    {/* bancada: martelo trincado e chave de boca boa */}
    <rect x={470} y={252} width={166} height={8} fill="#8a6a3c" />
    <rect x={478} y={260} width={8} height={70} fill="#8a6a3c" />
    <rect x={620} y={260} width={8} height={70} fill="#8a6a3c" />
    <rect x={488} y={236} width={64} height={8} rx={3} fill="#c58b4b" stroke={C.ink} />
    <path d="M 516 236 L 522 240 L 516 244" fill="none" stroke={C.ink} strokeWidth={1.8} />
    <rect x={550} y={224} width={16} height={28} rx={2} fill={C.steelDark} stroke={C.ink} />
    <rect x={580} y={236} width={40} height={7} rx={3} fill={C.steelLight} stroke={C.ink} />
    <path d="M 574 230 L 584 236 L 584 243 L 574 249" fill="none" stroke={C.ink} strokeWidth={4} />
    <circle cx={623} cy={239.5} r={7} fill="none" stroke={C.ink} strokeWidth={3} />
  </g>
);

const SCENES: Record<InspectionRound['scene'], { label: string; Comp: React.FC }> = {
  torno: { label: 'Oficina com torno, piso, extintor, quadro de ferramentas e um colega', Comp: TornoScene },
  bomba: { label: 'Bomba em manutenção com painel elétrico, válvula, manômetro, botão de emergência e bancada', Comp: BombaScene },
  icamento: { label: 'Talha içando um motor, operador com botoeira, pessoa perto da carga e bancada com ferramentas', Comp: IcamentoScene }
};

export const InspectionScene: React.FC<{ scene: InspectionRound['scene']; children?: React.ReactNode }> = ({ scene, children }) => {
  const { label, Comp } = SCENES[scene];
  return (
    <svg viewBox="0 0 640 360" className="block h-auto w-full touch-manipulation select-none" style={{ background: C.paper, fontFamily: FONT }}>
      <title>{label}</title>
      <defs>
        <pattern id="insp-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e0d8" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="640" height="360" fill="url(#insp-grid)" />
      <Comp />
      {children}
    </svg>
  );
};
