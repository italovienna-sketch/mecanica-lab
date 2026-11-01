import React, { useState } from 'react';
import { Accessibility, Gauge, Monitor, Moon, Palette, Sun, Trash2, Volume2 } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import { ThemePreference } from '../../types/game';

const THEMES: { id: ThemePreference; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Claro', icon: Sun },
  { id: 'dark', label: 'Escuro', icon: Moon },
  { id: 'system', label: 'Igual ao sistema', icon: Monitor }
];

const Toggle: React.FC<{ id: string; label: string; description: string; checked: boolean; onChange: (v: boolean) => void }> = ({
  id,
  label,
  description,
  checked,
  onChange
}) => (
  <div className="flex items-start justify-between gap-4 py-3">
    <div>
      <label htmlFor={id} className="text-sm font-medium text-ink-100">
        {label}
      </label>
      <p id={`${id}-desc`} className="text-sm text-ink-400">
        {description}
      </p>
    </div>
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      aria-describedby={`${id}-desc`}
      onClick={() => onChange(!checked)}
      className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-ink-700'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
    </button>
  </div>
);

/** Preferências pessoais: acessibilidade, desempenho do 3D, som e dados de progresso. */
export const SettingsPanel: React.FC = () => {
  const {
    textSize,
    setTextSize,
    reducedMotion,
    toggleReducedMotion,
    graphicsQuality,
    setGraphicsQuality,
    soundEnabled,
    toggleSound,
    resetLearningProgress,
    theme,
    setTheme
  } = useGameState();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <section aria-labelledby="config-title" className="card p-5 sm:p-6">
      <h2 id="config-title" className="text-lg font-semibold text-ink-100">
        Configurações
      </h2>

      <h3 className="mt-4 flex items-center gap-2 text-sm font-semibold text-ink-300">
        <Palette className="h-4 w-4" aria-hidden /> Aparência
      </h3>
      <div className="py-3">
        <p id="cfg-tema-desc" className="mb-2 text-sm text-ink-400">
          O tema claro é o mais confortável para ler. O laboratório 3D e a oficina 2D ficam sempre escuros para destacar os modelos.
        </p>
        <div role="radiogroup" aria-label="Tema" aria-describedby="cfg-tema-desc" className="segmented">
          {THEMES.map((t) => (
            <button key={t.id} role="radio" aria-checked={theme === t.id} onClick={() => setTheme(t.id)} className="inline-flex items-center gap-1.5">
              <t.icon className="h-4 w-4" aria-hidden /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <h3 className="mt-4 flex items-center gap-2 text-sm font-semibold text-ink-300">
        <Accessibility className="h-4 w-4" aria-hidden /> Acessibilidade
      </h3>
      <div className="divide-y divide-ink-800">
        <Toggle
          id="cfg-texto"
          label="Texto maior"
          description="Aumenta o tamanho das letras em todo o aplicativo."
          checked={textSize === 'large'}
          onChange={(v) => setTextSize(v ? 'large' : 'normal')}
        />
        <Toggle
          id="cfg-movimento"
          label="Reduzir movimento"
          description="Desliga animações e transições. As peças do 3D mudam de posição sem deslizar."
          checked={reducedMotion}
          onChange={() => toggleReducedMotion()}
        />
      </div>

      <h3 className="mt-4 flex items-center gap-2 text-sm font-semibold text-ink-300">
        <Gauge className="h-4 w-4" aria-hidden /> Desempenho
      </h3>
      <Toggle
        id="cfg-leve"
        label="Modo leve do laboratório 3D"
        description="Para computadores mais simples: sem sombras, sem reflexos e com resolução menor."
        checked={graphicsQuality === 'low'}
        onChange={(v) => setGraphicsQuality(v ? 'low' : 'high')}
      />

      <h3 className="mt-4 flex items-center gap-2 text-sm font-semibold text-ink-300">
        <Volume2 className="h-4 w-4" aria-hidden /> Som
      </h3>
      <Toggle id="cfg-som" label="Sons da Oficina 2D" description="Efeitos sonoros do campus virtual." checked={soundEnabled} onChange={() => toggleSound()} />

      <div className="mt-5 rounded-xl border border-ink-800 bg-ink-850 p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-200">
          <Trash2 className="h-4 w-4" aria-hidden /> Seus dados
        </h3>
        <p className="mt-1 text-sm text-ink-400">
          O progresso fica salvo apenas neste navegador. Limpar os dados do navegador apaga o progresso.
        </p>
        {!confirmReset ? (
          <button className="btn-ghost mt-2 px-0 text-rose-300" onClick={() => setConfirmReset(true)}>
            Reiniciar meu progresso de estudo…
          </button>
        ) : (
          <div role="alertdialog" aria-label="Confirmar reinício do progresso" className="mt-3">
            <p className="text-sm text-ink-200">Isso apaga aulas, práticas e missões concluídas. Seu nome e seu personagem são mantidos.</p>
            <div className="mt-2 flex gap-2">
              <button
                className="btn bg-rose-700 text-white hover:bg-rose-600"
                onClick={() => {
                  resetLearningProgress();
                  setConfirmReset(false);
                }}
              >
                Sim, reiniciar
              </button>
              <button className="btn-secondary" onClick={() => setConfirmReset(false)} autoFocus>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
