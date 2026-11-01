import React from 'react';

/**
 * Desenhos esquemáticos (SVG) das ferramentas da biblioteca — usados quando não há modelo 3D
 * ou quando o aluno prefere o desenho. São ilustrações didáticas, não desenhos de fabricação.
 */
export const ToolIllustration2D: React.FC<{ toolId: string }> = ({ toolId }) => {
  switch (toolId) {
    case 'chave-combinada':
      return (
        <g>
          <rect x="115" y="94" width="270" height="32" rx="8" fill="#cbd5e1" stroke="#475569" strokeWidth="3" />
          <rect x="150" y="102" width="200" height="16" rx="4" fill="#94a3b8" />
          <text x="250" y="114" textAnchor="middle" fill="#0f172a" fontSize="11" fontFamily="monospace" fontWeight="bold">
            19 mm • CR-V DIN 3113
          </text>
          <path
            d="M 125 84 C 85 72, 55 82, 55 98 L 95 98 L 95 122 L 55 122 C 55 138, 85 148, 125 136 Z"
            fill="#e2e8f0"
            stroke="#475569"
            strokeWidth="3"
          />
          <circle cx="410" cy="110" r="34" fill="#e2e8f0" stroke="#475569" strokeWidth="3" />
          <circle cx="410" cy="110" r="19" fill="#0f172a" stroke="#64748b" strokeWidth="2" strokeDasharray="5 3" />
        </g>
      );
    case 'chave-allen':
      return (
        <g>
          <path
            d="M 105 45 L 135 45 L 135 125 Q 135 155 165 155 L 430 155 L 430 125 L 165 125 Q 135 125 135 95 Z"
            fill="#334155"
            stroke="#94a3b8"
            strokeWidth="3"
          />
          <rect x="105" y="45" width="30" height="85" rx="3" fill="#475569" stroke="#cbd5e1" strokeWidth="2.5" />
          <rect x="120" y="125" width="310" height="30" rx="3" fill="#475569" stroke="#cbd5e1" strokeWidth="2.5" />
          <text x="285" y="144" textAnchor="middle" fill="#f8fafc" fontSize="11" fontFamily="monospace" fontWeight="bold">
            HEX 6.0 mm • AÇO S2
          </text>
        </g>
      );
    case 'torquimetro':
      return (
        <g>
          <ellipse cx="85" cy="110" rx="34" ry="26" fill="#94a3b8" stroke="#334155" strokeWidth="3" />
          <rect x="73" y="98" width="24" height="24" rx="3" fill="#1e293b" stroke="#e2e8f0" strokeWidth="2" />
          <rect x="118" y="96" width="235" height="28" rx="5" fill="#e2e8f0" stroke="#475569" strokeWidth="3" />
          <rect x="210" y="100" width="90" height="20" rx="3" fill="#0f172a" stroke="#0284c7" strokeWidth="2" />
          <text x="255" y="114" textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">
            N·m ajust.
          </text>
          <rect x="353" y="90" width="95" height="40" rx="8" fill="#1e293b" stroke="#0284c7" strokeWidth="2.5" />
        </g>
      );
    case 'paquimetro':
      return (
        <g>
          <rect x="390" y="102" width="75" height="6" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
          <rect x="85" y="90" width="335" height="32" fill="#e2e8f0" stroke="#475569" strokeWidth="2.5" />
          <path d="M 85 90 L 115 90 L 115 178 L 95 178 L 85 145 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="2.5" />
          <path d="M 95 90 L 112 90 L 112 42 L 100 42 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="2.5" />
          <path d="M 116 90 L 134 90 L 134 42 L 122 42 Z" fill="#94a3b8" stroke="#334155" strokeWidth="2.5" />
          <path d="M 116 122 L 145 122 L 135 178 L 116 178 Z" fill="#94a3b8" stroke="#334155" strokeWidth="2.5" />
          <rect x="145" y="84" width="110" height="44" rx="3" fill="#cbd5e1" stroke="#0284c7" strokeWidth="2.5" />
          <text x="200" y="110" textAnchor="middle" fill="#0f172a" fontSize="10" fontFamily="monospace" fontWeight="bold">
            0,05 mm
          </text>
        </g>
      );
    case 'micrometro':
      return (
        <g>
          <path
            d="M 65 75 L 65 155 C 65 190, 175 190, 175 155 L 175 100 L 150 100 L 150 145 C 150 165, 90 165, 90 145 L 90 75 Z"
            fill="#334155"
            stroke="#94a3b8"
            strokeWidth="3"
          />
          <rect x="92" y="135" width="56" height="22" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="120" y="149" textAnchor="middle" fill="#38bdf8" fontSize="8" fontFamily="monospace">
            0-25mm 0,01
          </text>
          <rect x="90" y="76" width="16" height="18" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
          <rect x="125" y="78" width="50" height="14" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
          <rect x="175" y="70" width="105" height="30" fill="#cbd5e1" stroke="#475569" strokeWidth="2.5" />
          <rect x="280" y="64" width="120" height="42" rx="4" fill="#94a3b8" stroke="#334155" strokeWidth="2.5" />
          <rect x="400" y="73" width="48" height="24" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
        </g>
      );
    case 'chave-boca':
      return (
        <g>
          <rect x="115" y="96" width="270" height="28" rx="6" fill="#cbd5e1" stroke="#475569" strokeWidth="3" />
          <text x="250" y="114" textAnchor="middle" fill="#0f172a" fontSize="11" fontFamily="monospace" fontWeight="bold">
            17 mm • DIN 3110 • 19 mm
          </text>
          <path d="M 120 85 C 80 72, 55 82, 55 98 L 92 98 L 92 122 L 55 122 C 55 138, 80 148, 120 135 Z" fill="#e2e8f0" stroke="#475569" strokeWidth="3" />
          <path d="M 380 82 C 420 68, 448 80, 448 96 L 408 96 L 408 124 L 448 124 C 448 140, 420 152, 380 138 Z" fill="#e2e8f0" stroke="#475569" strokeWidth="3" />
        </g>
      );
    case 'chave-inglesa':
      return (
        <g>
          <rect x="145" y="95" width="290" height="30" rx="8" fill="#cbd5e1" stroke="#475569" strokeWidth="3" />
          <circle cx="410" cy="110" r="9" fill="#0f172a" stroke="#475569" strokeWidth="2" />
          <path d="M 145 80 L 65 70 L 65 98 L 115 98 L 115 122 L 65 122 L 65 148 L 145 135 Z" fill="#e2e8f0" stroke="#475569" strokeWidth="3" />
          <rect x="148" y="112" width="36" height="22" rx="4" fill="#f59e0b" stroke="#0f172a" strokeWidth="2" />
        </g>
      );
    case 'soquete-catraca':
      return (
        <g>
          <rect x="85" y="115" width="52" height="58" rx="6" fill="#e2e8f0" stroke="#475569" strokeWidth="3" />
          <circle cx="111" cy="95" r="28" fill="#cbd5e1" stroke="#475569" strokeWidth="3" />
          <rect x="138" y="87" width="170" height="16" rx="4" fill="#e2e8f0" stroke="#475569" strokeWidth="2.5" />
          <rect x="308" y="80" width="120" height="30" rx="10" fill="#0284c7" stroke="#38bdf8" strokeWidth="2.5" />
        </g>
      );
    case 'relogio-comparador':
      return (
        <g>
          <rect x="95" y="125" width="70" height="55" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" />
          <rect x="125" y="45" width="10" height="80" fill="#cbd5e1" />
          <rect x="125" y="55" width="195" height="8" fill="#cbd5e1" />
          <circle cx="330" cy="75" r="42" fill="#f8fafc" stroke="#475569" strokeWidth="4" />
          <line x1="330" y1="75" x2="352" y2="52" stroke="#ef4444" strokeWidth="3" />
          <rect x="325" y="117" width="10" height="58" fill="#94a3b8" />
          <circle cx="330" cy="178" r="5" fill="#ef4444" />
        </g>
      );
    case 'chave-estrela':
      return (
        <g>
          <path d="M 112 104 L 200 104 Q 220 104 230 92 L 270 92 Q 280 104 300 104 L 388 104 L 388 118 L 300 118 Q 280 118 270 106 L 230 106 Q 220 118 200 118 L 112 118 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="3" />
          <text x="250" y="140" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="monospace" fontWeight="bold">
            17 × 19 mm
          </text>
          <circle cx="82" cy="110" r="32" fill="#e2e8f0" stroke="#475569" strokeWidth="3" />
          <circle cx="82" cy="110" r="17" fill="#0f172a" stroke="#64748b" strokeWidth="2" strokeDasharray="4 3" />
          <circle cx="418" cy="110" r="35" fill="#e2e8f0" stroke="#475569" strokeWidth="3" />
          <circle cx="418" cy="110" r="19" fill="#0f172a" stroke="#64748b" strokeWidth="2" strokeDasharray="4 3" />
        </g>
      );
    case 'chave-fenda-phillips':
      return (
        <g>
          <path d="M 78 104 L 96 104 L 96 116 L 78 116 L 72 112 L 72 108 Z" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
          <rect x="96" y="104" width="200" height="12" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="2.5" />
          <rect x="296" y="88" width="160" height="44" rx="18" fill="#e8590c" stroke="#9a3412" strokeWidth="3" />
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1={320 + i * 26} y1="94" x2={320 + i * 26} y2="126" stroke="#9a3412" strokeWidth="2" />
          ))}
          <g transform="translate(120 44)">
            <circle r="20" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
            <rect x="-13" y="-3" width="26" height="6" fill="#0f172a" />
          </g>
          <g transform="translate(180 44)">
            <circle r="20" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
            <rect x="-11" y="-2.5" width="22" height="5" fill="#0f172a" />
            <rect x="-2.5" y="-11" width="5" height="22" fill="#0f172a" />
          </g>
          <text x="120" y="80" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">fenda</text>
          <text x="180" y="80" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">Phillips</text>
        </g>
      );
    case 'alicate-universal':
      return (
        <g>
          <path d="M 60 100 L 150 102 L 210 104 L 440 70 L 446 84 L 222 112 L 150 118 L 60 120 Q 48 110 60 100 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="3" />
          <path d="M 222 112 L 446 136 L 440 150 L 210 118 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="3" />
          <rect x="300" y="64" width="146" height="20" rx="8" fill="#dc2626" stroke="#7f1d1d" strokeWidth="2" transform="rotate(-8 373 74)" />
          <rect x="300" y="136" width="146" height="20" rx="8" fill="#dc2626" stroke="#7f1d1d" strokeWidth="2" transform="rotate(6 373 146)" />
          <circle cx="210" cy="110" r="9" fill="#475569" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={i} x1={68 + i * 10} y1="104" x2={68 + i * 10} y2="116" stroke="#475569" strokeWidth="2" />
          ))}
          <path d="M 150 103 L 166 110 L 150 117" fill="none" stroke="#0f172a" strokeWidth="2.5" />
        </g>
      );
    case 'alicate-aneis':
      return (
        <g>
          <path d="M 70 98 L 120 102 L 200 104 L 440 74 L 446 88 L 220 112 L 120 108 L 70 104 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="3" />
          <path d="M 70 116 L 120 112 L 220 112 L 446 132 L 440 146 L 200 120 L 120 118 L 70 122 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="3" />
          <rect x="300" y="66" width="146" height="20" rx="8" fill="#2563eb" stroke="#1e3a8a" strokeWidth="2" transform="rotate(-7 373 76)" />
          <rect x="300" y="134" width="146" height="20" rx="8" fill="#2563eb" stroke="#1e3a8a" strokeWidth="2" transform="rotate(5 373 144)" />
          <circle cx="210" cy="110" r="9" fill="#475569" />
          <path d="M 240 96 q 10 14 0 28" fill="none" stroke="#f59e0b" strokeWidth="3" />
          <circle cx="66" cy="101" r="4" fill="#0f172a" />
          <circle cx="66" cy="119" r="4" fill="#0f172a" />
        </g>
      );
    case 'extrator-rolamentos':
      return (
        <g>
          <rect x="226" y="150" width="48" height="60" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
          <rect x="186" y="128" width="128" height="22" rx="3" fill="#e2e8f0" stroke="#475569" strokeWidth="2.5" />
          <circle cx="206" cy="139" r="5" fill="#475569" />
          <circle cx="294" cy="139" r="5" fill="#475569" />
          <rect x="140" y="150" width="108" height="18" fill="#f59e0b" stroke="#78350f" strokeWidth="2" />
          <rect x="252" y="150" width="108" height="18" fill="#f59e0b" stroke="#78350f" strokeWidth="2" />
          <rect x="154" y="80" width="12" height="78" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
          <rect x="334" y="80" width="12" height="78" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
          <rect x="138" y="80" width="224" height="22" rx="5" fill="#94a3b8" stroke="#334155" strokeWidth="2.5" />
          <rect x="242" y="24" width="16" height="104" fill="#475569" stroke="#cbd5e1" strokeWidth="2" />
          <rect x="230" y="18" width="40" height="14" rx="3" fill="#334155" />
          <text x="388" y="164" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">placa no anel interno</text>
        </g>
      );
    case 'martelo-face-macia':
      return (
        <g>
          <rect x="128" y="100" width="322" height="20" rx="9" fill="#a16207" stroke="#713f12" strokeWidth="2.5" />
          <rect x="80" y="54" width="50" height="112" rx="6" fill="#334155" stroke="#0f172a" strokeWidth="2.5" />
          <rect x="84" y="24" width="42" height="32" rx="8" fill="#facc15" stroke="#854d0e" strokeWidth="2.5" />
          <rect x="84" y="164" width="42" height="32" rx="8" fill="#facc15" stroke="#854d0e" strokeWidth="2.5" />
        </g>
      );
    case 'saca-polias':
    default:
      return (
        <g>
          <rect x="238" y="30" width="24" height="145" rx="3" fill="#475569" stroke="#cbd5e1" strokeWidth="2.5" />
          <polygon points="238,175 262,175 250,192" fill="#f59e0b" />
          <rect x="135" y="55" width="230" height="22" rx="6" fill="#94a3b8" stroke="#334155" strokeWidth="2.5" />
          <path d="M 145 77 L 130 165 L 175 165 L 175 150 L 150 150 L 162 77 Z" fill="#cbd5e1" stroke="#334155" strokeWidth="2.5" />
          <path d="M 355 77 L 370 165 L 325 165 L 325 150 L 350 150 L 338 77 Z" fill="#cbd5e1" stroke="#334155" strokeWidth="2.5" />
        </g>
      );
  }
};
