import React, { useState } from 'react';
import { ArrowRight, BookOpen, Box, Target } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import { CharacterAvatarSvg } from '../CharacterAvatarSvg';
import { AvatarCustomization } from '../../types/game';

const SKIN_TONES = ['#f8d9b5', '#e0ac69', '#c68642', '#9c6137', '#6f411c', '#3d2210'];
const HAIR: { id: AvatarCustomization['hairStyle']; label: string }[] = [
  { id: 'curto', label: 'Curto' },
  { id: 'cacheado', label: 'Cacheado' },
  { id: 'longo_solto', label: 'Longo' },
  { id: 'preso', label: 'Preso' },
  { id: 'coque', label: 'Coque' },
  { id: 'militar', label: 'Raspado' }
];
const HAIR_COLORS = ['#090d16', '#3e2723', '#9a3412', '#d97706', '#6d28d9', '#059669'];

export const OnboardingScreen: React.FC = () => {
  const { playerProfile, updateCustomization, completeOnboarding, navigateTo } = useGameState();
  const [name, setName] = useState(playerProfile.name || '');
  const [error, setError] = useState<string | null>(null);
  const c = playerProfile.customization;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Digite como você quer ser chamado(a).');
      return;
    }
    completeOnboarding(name);
    navigateTo('landing', undefined, { replace: true });
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col justify-center px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-strong font-mono text-sm font-bold text-white" aria-hidden>ML</span>
        <span className="text-lg font-semibold text-ink-100">Mecânica Lab</span>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink-100 sm:text-4xl">Aprenda manutenção mecânica fazendo.</h1>
          <p className="mt-3 text-lg text-ink-300">Aulas curtas, prática com questões e um laboratório 3D para desmontar equipamentos de verdade.</p>
          <ul className="mt-6 space-y-3 text-base text-ink-200">
            <li className="flex gap-3">
              <BookOpen className="h-5 w-5 shrink-0 text-accent" aria-hidden /> Uma aula de cada vez, do básico ao avançado
            </li>
            <li className="flex gap-3">
              <Target className="h-5 w-5 shrink-0 text-accent" aria-hidden /> 5 questões por sessão, com explicação em cada resposta
            </li>
            <li className="flex gap-3">
              <Box className="h-5 w-5 shrink-0 text-accent" aria-hidden /> Desmontagem e montagem guiadas em 3D
            </li>
          </ul>
          <p className="mt-6 text-sm text-ink-500">
            Projeto educacional independente, inspirado em práticas de ensino profissional. Não é afiliado a nenhuma instituição. Seu progresso fica
            salvo neste navegador.
          </p>
        </div>

        <form onSubmit={submit} className="card p-5 sm:p-6" noValidate>
          <h2 className="text-lg font-semibold text-ink-100">Crie seu perfil de aprendiz</h2>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-paper">
              <CharacterAvatarSvg customization={c} mode="portrait" size={92} />
            </div>
            <div className="flex-1">
              <label htmlFor="nome" className="block text-sm font-medium text-ink-200">
                Como você quer ser chamado(a)?
              </label>
              <input
                id="nome"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                maxLength={40}
                autoComplete="given-name"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'nome-erro' : undefined}
                className="mt-1.5 w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2.5 text-base text-ink-100 placeholder:text-ink-500 focus:border-accent focus:outline-none"
                placeholder="Seu nome"
                autoFocus
              />
              {error && (
                <p id="nome-erro" className="mt-1.5 text-sm text-rose-300">
                  {error}
                </p>
              )}
            </div>
          </div>

          <fieldset className="mt-5">
            <legend className="text-sm font-medium text-ink-200">Tom de pele</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {SKIN_TONES.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => updateCustomization({ skinTone: t })}
                  aria-label={`Tom de pele ${t}`}
                  aria-pressed={c.skinTone === t}
                  className={`h-9 w-9 rounded-full border-2 ${c.skinTone === t ? 'border-accent' : 'border-ink-700'}`}
                  style={{ background: t }}
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-4">
            <legend className="text-sm font-medium text-ink-200">Cabelo</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {HAIR.map((h) => (
                <button
                  type="button"
                  key={h.id}
                  onClick={() => updateCustomization({ hairStyle: h.id })}
                  aria-pressed={c.hairStyle === h.id}
                  className={`rounded-lg border px-3 py-1.5 text-sm ${
                    c.hairStyle === h.id ? 'border-accent bg-accent-soft text-ink-100' : 'border-ink-700 text-ink-300 hover:border-ink-500'
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {HAIR_COLORS.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => updateCustomization({ hairColor: t })}
                  aria-label={`Cor do cabelo ${t}`}
                  aria-pressed={c.hairColor === t}
                  className={`h-7 w-7 rounded-full border-2 ${c.hairColor === t ? 'border-accent' : 'border-ink-700'}`}
                  style={{ background: t }}
                />
              ))}
            </div>
          </fieldset>

          <button type="submit" className="btn-primary mt-6 w-full py-3 text-base">
            Começar a aprender <ArrowRight className="h-5 w-5" aria-hidden />
          </button>
          <p className="mt-2 text-center text-sm text-ink-500">Roupas, EPIs e outros detalhes podem ser ajustados depois em Perfil.</p>
        </form>
      </div>
    </div>
  );
};
