/** @type {import('tailwindcss').Config} */
import defaultColors from 'tailwindcss/colors.js';
import plugin from 'tailwindcss/plugin.js';

// Paleta do Mecânica Lab — ver docs/DESIGN_SYSTEM.md.
// Todas as cores de interface são variáveis CSS, para existirem dois temas:
//   • escuro  (grafite quente): navegação, laboratório 3D, oficina 2D e quem escolher "Escuro" no Perfil;
//   • claro   (papel técnico): leitura, aulas, trilhas e progresso (padrão).
// No tema escuro os valores são exatamente os da versão anterior. No claro, cada tom é trocado
// por outro que mantém o mesmo papel (fundo, borda, texto) com contraste WCAG AA.
// Um trecho da página pode forçar um tema com data-theme="dark" | "light" (as variáveis são herdadas).

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

const INK_DARK = {
  950: '#0f100e',
  900: '#151613',
  850: '#1a1b18',
  800: '#22241f',
  700: '#30322c',
  600: '#464840',
  500: '#858780', // texto secundário: ≥ 4,5:1 sobre ink-900/950
  400: '#9b9a91',
  300: '#c6c4ba',
  200: '#e2e0d8',
  100: '#f1f0eb',
  50: '#f8f7f3'
};

const INK_LIGHT = {
  950: '#f3f2ee', // fundo da página
  900: '#ffffff', // cartões
  850: '#f8f7f4', // faixas internas de cartão
  800: '#e8e6e0', // bordas finas, trilhos, preenchimento sutil
  700: '#d9d7cf', // bordas fortes, item ativo em controles segmentados
  600: '#b9b7ae',
  500: '#63655d', // texto secundário: ≥ 4,5:1 sobre branco, papel e ink-800
  400: '#55574f',
  300: '#3f413b',
  200: '#2b2d28',
  100: '#1a1b17',
  50: '#0f100e'
};

const ACCENT_DARK = {
  DEFAULT: '#e8590c',
  hover: '#d24d07',
  soft: '#3a2416',
  text: '#ff8a4c',
  strong: '#c2410c', // fundo com texto branco: 5,2:1
  'strong-hover': '#9a3412'
};

const ACCENT_LIGHT = {
  DEFAULT: '#bd420a',
  hover: '#a3390a',
  soft: '#fcebe0',
  text: '#b93f0a',
  strong: '#c2410c',
  'strong-hover': '#9a3412'
};

// Cores de status (sucesso, atenção, informação, erro, nível). No claro, cada tom vira o "espelho"
// na escala: textos claros (100–400) viram escuros (700–900); fundos muito escuros (900/950) viram tintas leves.
const STATUS_PALETTES = ['emerald', 'amber', 'sky', 'rose', 'red', 'violet'];
const LIGHT_MIRROR = { 50: 950, 100: 900, 200: 800, 300: 700, 400: 700, 500: 600, 600: 600, 700: 400, 800: 300, 900: 200, 950: 100 };
// Âmbar 700 sobre papel fica em 4,48:1; os textos âmbar usam o 800.
const LIGHT_OVERRIDES = { amber: { 300: 800, 400: 800 } };

const rgb = (hex) => {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(' ');
};
const asVar = (name) => `rgb(var(--${name}) / <alpha-value>)`;

function themeVars(mode) {
  const vars = {};
  const ink = mode === 'dark' ? INK_DARK : INK_LIGHT;
  for (const [k, v] of Object.entries(ink)) vars[`--ink-${k}`] = rgb(v);
  const accent = mode === 'dark' ? ACCENT_DARK : ACCENT_LIGHT;
  for (const [k, v] of Object.entries(accent)) vars[`--accent-${k}`] = rgb(v);
  for (const p of STATUS_PALETTES) {
    for (const s of SHADES) {
      const src = mode === 'dark' ? s : LIGHT_OVERRIDES[p]?.[s] ?? LIGHT_MIRROR[s];
      vars[`--${p}-${s}`] = rgb(defaultColors[p][src]);
    }
  }
  vars['--paper'] = rgb('#f4f3ef');
  vars['color-scheme'] = mode;
  return vars;
}

const ink = Object.fromEntries(Object.keys(INK_DARK).map((k) => [k, asVar(`ink-${k}`)]));
const accent = Object.fromEntries(Object.keys(ACCENT_DARK).map((k) => [k, asVar(`accent-${k}`)]));
const statusColors = Object.fromEntries(
  STATUS_PALETTES.map((p) => [p, Object.fromEntries(SHADES.map((s) => [s, asVar(`${p}-${s}`)]))])
);

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink,
        // "industrial" é alias das telas antigas
        industrial: ink,
        paper: asVar('paper'),
        accent,
        ...statusColors,
        safety: {
          yellow: '#eab308',
          orange: '#f97316',
          amber: '#d97706',
          red: '#ef4444',
          green: '#22c55e',
          cyan: '#06b6d4',
          blue: '#2f7fc1'
        }
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif']
      },
      borderRadius: {
        card: '10px'
      },
      boxShadow: {
        card: '0 1px 2px rgb(15 16 14 / 0.05)',
        pop: '0 8px 24px rgb(15 16 14 / 0.16), 0 1px 3px rgb(15 16 14 / 0.08)'
      },
      maxWidth: {
        page: '72rem',
        reading: '44rem'
      }
    }
  },
  plugins: [
    plugin(({ addBase }) => {
      addBase({
        ':root, [data-theme="light"]': themeVars('light'),
        '[data-theme="dark"]': themeVars('dark')
      });
    })
  ]
};
