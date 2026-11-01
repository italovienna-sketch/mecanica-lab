import React from 'react';
import { AvatarCustomization } from '../types/game';

interface CharacterAvatarSvgProps {
  customization: AvatarCustomization;
  mode?: 'portrait' | 'full';
  size?: number;
  className?: string;
}

export const CharacterAvatarSvg: React.FC<CharacterAvatarSvgProps> = ({
  customization: c,
  mode = 'full',
  size,
  className = '',
}) => {
  const isPortrait = mode === 'portrait';
  const viewBox = isPortrait ? '42 12 116 116' : '0 0 200 265';

  // Head contour based on headShape
  const headPath =
    c.headShape === 'angular'
      ? 'M 74 44 C 74 28, 126 28, 126 44 L 125 68 L 112 84 L 88 84 L 75 68 Z'
      : c.headShape === 'redondo'
      ? 'M 72 54 C 72 30, 128 30, 128 54 C 128 74, 115 85, 100 85 C 85 85, 72 74, 72 54 Z'
      : 'M 74 48 C 74 28, 126 28, 126 48 C 126 69, 114 85, 100 85 C 86 85, 74 69, 74 48 Z';

  return (
    <svg
      viewBox={viewBox}
      width={size}
      height={size}
      className={`select-none overflow-visible ${className}`}
      role="img"
      aria-label="Personagem Aprendiz Mecânico"
    >
      <defs>
        <linearGradient id="avatar-bg-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id="visor-shine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.65" />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.45" />
        </linearGradient>
      </defs>

      {/* Sombra no Piso (apenas modo corpo inteiro) */}
      {!isPortrait && (
        <ellipse cx="100" cy="249" rx="46" ry="8" fill="#000000" opacity="0.45" />
      )}

      {/* CAMADA TRASEIRA DO CABELO (Longo / Cacheado / Preso) */}
      {c.hairStyle === 'longo_solto' && (
        <path
          d="M 67 46 C 62 72, 63 108, 70 124 L 130 124 C 137 108, 138 72, 133 46 Z"
          fill={c.hairColor}
          stroke="#111210"
          strokeWidth="1.8"
        />
      )}
      {c.hairStyle === 'cacheado' && (
        <g fill={c.hairColor} stroke="#111210" strokeWidth="1.6">
          <circle cx="71" cy="48" r="13" />
          <circle cx="129" cy="48" r="13" />
          <circle cx="69" cy="64" r="11" />
          <circle cx="131" cy="64" r="11" />
          <circle cx="82" cy="31" r="14" />
          <circle cx="118" cy="31" r="14" />
          <circle cx="100" cy="27" r="15" />
        </g>
      )}
      {c.hairStyle === 'coque' && c.helmetType === 'sem_capacete' && (
        <circle
          cx="100"
          cy="21"
          r="12"
          fill={c.hairColor}
          stroke="#111210"
          strokeWidth="1.8"
        />
      )}
      {c.hairStyle === 'preso' && (
        <path
          d="M 122 52 C 138 54, 144 68, 137 82 C 131 76, 127 65, 122 58 Z"
          fill={c.hairColor}
          stroke="#111210"
          strokeWidth="1.6"
        />
      )}

      {/* PERNAS E CALÇADOS (Modo Corpo Inteiro) */}
      {!isPortrait && (
        <g>
          {/* Perna Esquerda */}
          <path
            d="M 76 164 L 97 164 L 95 228 L 74 228 Z"
            fill={c.trousersColor}
            stroke="#111210"
            strokeWidth="1.8"
          />
          {/* Perna Direita */}
          <path
            d="M 103 164 L 124 164 L 126 228 L 105 228 Z"
            fill={c.trousersColor}
            stroke="#111210"
            strokeWidth="1.8"
          />
          {/* Costura central e bolsos cargo laterais */}
          <rect
            x="71"
            y="180"
            width="7"
            height="18"
            rx="1.5"
            fill={c.trousersColor}
            stroke="#111210"
            strokeWidth="1.4"
          />
          <rect
            x="122"
            y="180"
            width="7"
            height="18"
            rx="1.5"
            fill={c.trousersColor}
            stroke="#111210"
            strokeWidth="1.4"
          />
          {/* Joelheiras técnicas articuladas */}
          <rect
            x="77"
            y="194"
            width="16"
            height="12"
            rx="3"
            fill="#1f2421"
            fillOpacity="0.45"
            stroke="#111210"
            strokeWidth="1.2"
          />
          <rect
            x="107"
            y="194"
            width="16"
            height="12"
            rx="3"
            fill="#1f2421"
            fillOpacity="0.45"
            stroke="#111210"
            strokeWidth="1.2"
          />

          {/* Calçados / Botinas de Segurança EPI */}
          <g>
            <path
              d="M 70 226 L 96 226 L 97 244 L 65 244 C 65 235, 68 229, 70 226 Z"
              fill={c.shoeColor}
              stroke="#111210"
              strokeWidth="1.8"
            />
            <path
              d="M 104 226 L 130 226 C 132 229, 135 235, 135 244 L 103 244 Z"
              fill={c.shoeColor}
              stroke="#111210"
              strokeWidth="1.8"
            />
            {/* Solado Tratorado antiderrapante */}
            <rect x="64" y="242" width="34" height="5" rx="2" fill="#18181b" stroke="#111210" strokeWidth="1.2" />
            <rect x="102" y="242" width="34" height="5" rx="2" fill="#18181b" stroke="#111210" strokeWidth="1.2" />
            {/* Biqueira Composite/Aço */}
            {c.shoeStyle === 'bota_composite' && (
              <>
                <path d="M 65 242 C 65 235, 72 233, 77 235 L 77 242 Z" fill="#eab308" opacity="0.8" />
                <path d="M 135 242 C 135 235, 128 233, 123 235 L 123 242 Z" fill="#eab308" opacity="0.8" />
              </>
            )}
          </g>
        </g>
      )}

      {/* PESCOÇO COM SOMBRA ANATÔMICA */}
      <path
        d="M 91 79 L 109 79 L 111 98 L 89 98 Z"
        fill={c.skinTone}
        stroke="#111210"
        strokeWidth="1.8"
      />
      <path d="M 91 81 L 109 81 L 109 88 C 100 91, 95 90, 91 88 Z" fill="#000000" opacity="0.18" />

      {/* TRONCO, UNIFORME E BRAÇOS ARTICULADOS */}
      <g>
        {/* Camiseta Interna no colarinho */}
        <path d="M 86 94 L 114 94 L 100 112 Z" fill="#f4f3ef" stroke="#111210" strokeWidth="1.4" />

        {/* Corpo Principal da Jaqueta / Jaleco Técnico */}
        <path
          d="M 66 96 C 68 91, 78 89, 88 91 L 100 105 L 112 91 C 122 89, 132 91, 134 96 L 131 165 L 69 165 Z"
          fill={c.uniformColor}
          stroke="#111210"
          strokeWidth="2"
        />
        <path
          d="M 66 96 C 68 91, 78 89, 88 91 L 100 105 L 112 91 C 122 89, 132 91, 134 96 L 131 165 L 69 165 Z"
          fill="url(#avatar-bg-shade)"
        />

        {/* Gola e Lapela Técnica */}
        <path
          d="M 85 90 L 100 107 L 91 112 L 79 96 Z"
          fill={c.uniformColor}
          stroke="#111210"
          strokeWidth="1.6"
        />
        <path
          d="M 115 90 L 100 107 L 109 112 L 121 96 Z"
          fill={c.uniformColor}
          stroke="#111210"
          strokeWidth="1.6"
        />

        {/* Zíper / Fechamento Frontal */}
        <line x1="100" y1="107" x2="100" y2="165" stroke="#111210" strokeWidth="1.8" />

        {/* Bolso Técnico no Peito com Paquímetro / Caneta de Precisão */}
        <rect
          x="107"
          y="116"
          width="17"
          height="19"
          rx="2"
          fill="#000000"
          fillOpacity="0.18"
          stroke="#111210"
          strokeWidth="1.4"
        />
        {/* Paquímetro / Caneta no bolso */}
        <rect x="111" y="110" width="3" height="8" rx="1" fill="#e8590c" stroke="#111210" strokeWidth="1" />
        <rect x="116" y="108" width="4" height="10" rx="1" fill="#cbd5e1" stroke="#111210" strokeWidth="1" />

        {/* Emblema bordado no peito esquerdo */}
        <rect
          x="75"
          y="115"
          width="18"
          height="10"
          rx="1.5"
          fill="#e8590c"
          stroke="#111210"
          strokeWidth="1.2"
        />
        <line x1="78" y1="120" x2="90" y2="120" stroke="#ffffff" strokeWidth="1.6" />

        {/* Colete / Faixas Refletivas NR-12 */}
        {c.vestType === 'faixa_refletiva' && (
          <>
            <rect x="69" y="138" width="62" height="6" fill="#eab308" stroke="#111210" strokeWidth="1" />
            <rect x="69" y="140" width="62" height="2" fill="#fef08a" />
          </>
        )}
        {c.vestType === 'colete_seguranca' && (
          <g>
            <path
              d="M 72 94 L 88 94 L 88 164 L 70 164 Z"
              fill="#f97316"
              fillOpacity="0.88"
              stroke="#111210"
              strokeWidth="1.4"
            />
            <path
              d="M 112 94 L 128 94 L 130 164 L 112 164 Z"
              fill="#f97316"
              fillOpacity="0.88"
              stroke="#111210"
              strokeWidth="1.4"
            />
            <rect x="70" y="136" width="18" height="5" fill="#fef08a" />
            <rect x="112" y="136" width="18" height="5" fill="#fef08a" />
          </g>
        )}

        {/* Crachá ou colar */}
        {c.accessoryType === 'cracha_escolar' && (
          <g>
            <path d="M 89 94 L 100 122 L 111 94" fill="none" stroke="#0284c7" strokeWidth="2.2" />
            <rect x="94" y="121" width="12" height="16" rx="1.5" fill="#f8fafc" stroke="#111210" strokeWidth="1.3" />
            <rect x="96" y="124" width="8" height="4" fill="#e8590c" />
          </g>
        )}
        {c.accessoryType === 'colar_alt' && (
          <path d="M 89 92 Q 100 101 111 92" fill="none" stroke="#18181b" strokeWidth="3" />
        )}

        {/* Braços e Mãos (Modo Corpo Inteiro) */}
        {!isPortrait && (
          <>
            {/* Braço Esquerdo */}
            <path
              d="M 66 96 L 54 102 L 50 152 L 64 154 L 69 116 Z"
              fill={c.uniformColor}
              stroke="#111210"
              strokeWidth="1.8"
            />
            {/* Mão Esquerda */}
            <circle cx="56" cy="158" r="6.5" fill={c.skinTone} stroke="#111210" strokeWidth="1.6" />

            {/* Braço Direito */}
            <path
              d="M 134 96 L 146 102 L 150 152 L 136 154 L 131 116 Z"
              fill={c.uniformColor}
              stroke="#111210"
              strokeWidth="1.8"
            />
            {/* Relógio Técnico no pulso direito */}
            {c.accessoryType === 'relogio_tecnico' && (
              <rect x="137" y="147" width="12" height="5" rx="1" fill="#eab308" stroke="#111210" strokeWidth="1.2" />
            )}
            {/* Mão Direita */}
            <circle cx="144" cy="158" r="6.5" fill={c.skinTone} stroke="#111210" strokeWidth="1.6" />

            {/* Cinto de Utilidades Mecânicas na Cintura */}
            <rect x="68" y="159" width="64" height="7" rx="1.5" fill="#1c1917" stroke="#111210" strokeWidth="1.5" />
            <rect x="95" y="158" width="10" height="9" rx="1" fill="#d97706" stroke="#111210" strokeWidth="1.4" />
          </>
        )}
      </g>

      {/* ORELHAS */}
      <circle cx="73" cy="57" r="5.5" fill={c.skinTone} stroke="#111210" strokeWidth="1.6" />
      <circle cx="127" cy="57" r="5.5" fill={c.skinTone} stroke="#111210" strokeWidth="1.6" />

      {/* CABEÇA E ROSTO EXPRESSIVO */}
      <path d={headPath} fill={c.skinTone} stroke="#111210" strokeWidth="2" />

      {/* Sombra sutil nas bochechas / mandíbula */}
      <ellipse cx="83" cy="63" rx="4.5" ry="2.2" fill="#e11d48" opacity="0.12" />
      <ellipse cx="117" cy="63" rx="4.5" ry="2.2" fill="#e11d48" opacity="0.12" />

      {/* SOBRANCELHAS */}
      <g stroke={c.hairColor} strokeWidth={c.eyebrowStyle === 'marcada' ? '3.2' : '2.3'} strokeLinecap="round" fill="none">
        {c.eyebrowStyle === 'arqueada' ? (
          <>
            <path d="M 81 47 Q 88 43 94 47" />
            <path d="M 106 47 Q 112 43 119 47" />
          </>
        ) : c.eyebrowStyle === 'reta' ? (
          <>
            <line x1="81" y1="47" x2="94" y2="47" />
            <line x1="106" y1="47" x2="119" y2="47" />
          </>
        ) : (
          <>
            <path d="M 81 48 Q 88 45 94 47" />
            <path d="M 106 47 Q 112 45 119 48" />
          </>
        )}
      </g>

      {/* MAQUIAGEM / SOMBRA NOS OLHOS */}
      {c.makeupStyle === 'sombra_colorida' && (
        <>
          <ellipse cx="88" cy="52" rx="6.5" ry="3" fill="#a855f7" opacity="0.38" />
          <ellipse cx="112" cy="52" rx="6.5" ry="3" fill="#a855f7" opacity="0.38" />
        </>
      )}

      {/* OLHOS COM ESCLERA, ÍRIS, PUPILA E BRILHO (CATCHLIGHT) */}
      <g>
        {/* Olho Esquerdo */}
        <ellipse cx="88" cy="55" rx="5.2" ry={c.eyeStyle === 'sereno' ? 3.4 : 4.4} fill="#ffffff" stroke="#111210" strokeWidth="1.4" />
        <circle cx="88.5" cy="55" r="2.9" fill={c.eyeColor} />
        <circle cx="88.5" cy="55" r="1.5" fill="#09090b" />
        <circle cx="89.7" cy="53.8" r="1.0" fill="#ffffff" />

        {/* Olho Direito */}
        <ellipse cx="112" cy="55" rx="5.2" ry={c.eyeStyle === 'sereno' ? 3.4 : 4.4} fill="#ffffff" stroke="#111210" strokeWidth="1.4" />
        <circle cx="111.5" cy="55" r="2.9" fill={c.eyeColor} />
        <circle cx="111.5" cy="55" r="1.5" fill="#09090b" />
        <circle cx="112.7" cy="53.8" r="1.0" fill="#ffffff" />

        {/* Delineado se selecionado */}
        {(c.makeupStyle === 'delineado_sutil' || c.makeupStyle === 'gotico_marcante') && (
          <>
            <path d="M 81 53 Q 88 49 94 54" fill="none" stroke="#09090b" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M 106 54 Q 112 49 119 53" fill="none" stroke="#09090b" strokeWidth="2.2" strokeLinecap="round" />
          </>
        )}
      </g>

      {/* NARIZ CONTORNADO */}
      <path d="M 100 55 L 98.5 63.5 L 102 64.5" fill="none" stroke="#111210" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* BOCA / SORRISO CONFIANTE */}
      {c.makeupStyle === 'batom_suave' || c.makeupStyle === 'gotico_marcante' ? (
        <path
          d="M 93 71 Q 100 76 107 71 Q 100 69 93 71 Z"
          fill={c.makeupStyle === 'gotico_marcante' ? '#3f1d38' : c.lipstickColor}
          stroke="#111210"
          strokeWidth="1.2"
        />
      ) : (
        <path
          d="M 93.5 71 Q 100 75.5 106.5 71"
          fill="none"
          stroke="#111210"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      )}

      {/* CABELO FRONTAL / FRANJA (Quando sem capacete ou aparecendo sob o capacete) */}
      <g fill={c.hairColor} stroke="#111210" strokeWidth="1.6">
        {c.hairStyle === 'curto' && (
          <path d="M 73 48 C 73 27, 127 27, 127 48 C 121 37, 108 35, 100 38 C 91 35, 79 37, 73 48 Z" />
        )}
        {c.hairStyle === 'militar' && (
          <path d="M 74 44 C 75 29, 125 29, 126 44 C 118 39, 82 39, 74 44 Z" />
        )}
        {c.hairStyle === 'franja_alt' && (
          <path d="M 73 49 C 73 26, 127 26, 127 49 L 116 42 L 105 51 L 96 41 L 83 51 Z" />
        )}
        {(c.hairStyle === 'longo_solto' || c.hairStyle === 'preso' || c.hairStyle === 'coque' || c.hairStyle === 'cacheado') && (
          <path d="M 73 49 C 74 27, 126 27, 127 49 C 118 38, 107 36, 100 41 C 93 36, 82 38, 73 49 Z" />
        )}
      </g>

      {/* ÓCULOS DE PROTEÇÃO EPI (Lente Transparente de Policarbonato) */}
      {c.hasSafetyGlasses && (
        <g>
          <rect
            x="77"
            y="49"
            width="20"
            height="12"
            rx="3"
            fill="url(#visor-shine)"
            stroke="#0284c7"
            strokeWidth="1.8"
          />
          <rect
            x="103"
            y="49"
            width="20"
            height="12"
            rx="3"
            fill="url(#visor-shine)"
            stroke="#0284c7"
            strokeWidth="1.8"
          />
          <line x1="97" y1="54" x2="103" y2="54" stroke="#0284c7" strokeWidth="2" />
          <line x1="74" y1="53" x2="77" y2="53" stroke="#0284c7" strokeWidth="1.8" />
          <line x1="123" y1="53" x2="126" y2="53" stroke="#0284c7" strokeWidth="1.8" />
        </g>
      )}

      {/* ABAFADOR DE RUÍDO AURICULAR (EPI NR-06) */}
      {c.hasEarMuffs && (
        <g>
          <path
            d="M 71 54 C 70 22, 130 22, 129 54"
            fill="none"
            stroke="#27272a"
            strokeWidth="3.5"
          />
          <rect x="65" y="47" width="8" height="18" rx="4" fill="#ef4444" stroke="#111210" strokeWidth="1.6" />
          <rect x="127" y="47" width="8" height="18" rx="4" fill="#ef4444" stroke="#111210" strokeWidth="1.6" />
        </g>
      )}

      {/* CAPACETE DE SEGURANÇA INDUSTRIAL OU BONÉ DE OFICINA */}
      {c.helmetType === 'capacete_epi' && (
        <g>
          {/* Casco com nervura central de reforço */}
          <path
            d="M 70 43 C 70 19, 130 19, 130 43 Z"
            fill={c.helmetColor}
            stroke="#111210"
            strokeWidth="2"
          />
          <path
            d="M 95 21 L 105 21 L 107 41 L 93 41 Z"
            fill="#ffffff"
            fillOpacity="0.2"
            stroke="#111210"
            strokeWidth="1.2"
          />
          {/* Aba frontal do capacete */}
          <path
            d="M 65 43 Q 100 37 135 43 L 132 47 Q 100 42 68 47 Z"
            fill={c.helmetColor}
            stroke="#111210"
            strokeWidth="1.8"
          />
          {/* Emblema frontal */}
          <rect x="95" y="31" width="10" height="6" rx="1" fill="#e8590c" stroke="#111210" strokeWidth="1" />
        </g>
      )}

      {c.helmetType === 'bone_oficina' && (
        <g>
          <path
            d="M 72 43 C 72 23, 128 23, 128 43 Z"
            fill={c.helmetColor}
            stroke="#111210"
            strokeWidth="1.8"
          />
          <path
            d="M 72 42 Q 104 38 139 45 Q 112 48 72 44 Z"
            fill={c.helmetColor}
            stroke="#111210"
            strokeWidth="1.8"
          />
        </g>
      )}
    </svg>
  );
};
