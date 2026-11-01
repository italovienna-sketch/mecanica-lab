import React from 'react';
import { ArrowRight, BarChart3, BookOpen, Box, Check, ClipboardList, Cog, Factory, Library, Puzzle, Ruler, Stethoscope, Target } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import { PRACTICE_TOPICS, SKILLS } from '../../data/practiceBank';
import { LAB_MACHINE_LABELS } from '../../data/labMission';
import { COMPETENCIES, competencyProgress } from '../../data/competencies';
import { masteredQuestionIds } from '../../data/learningPaths';
import { unlockHint } from '../../data/journey/missions';
import { GameScreen } from '../../types/game';

// Blocos do Início que dependem de dados maiores (desafios, aulas rápidas, laboratório). Ficam num módulo separado,
// carregado depois da ação principal, para não pesar no primeiro carregamento.

/** Três das cinco perguntas do Início: o que já domino, onde estou com dificuldade e o que abro em seguida. */
export const StatusPanels: React.FC = () => {
  const { playerProfile: p, navigateTo, courseConfig } = useGameState();
  const mastered = masteredQuestionIds(p);
  const demonstrated = COMPETENCIES.filter((c) => competencyProgress(c, p, mastered).completed);
  const mistakes = p.journey.mistakes.filter((m) => !m.resolvedAt).slice(-2).reverse();
  const weakSkills = Object.entries(p.skillStats)
    .filter(([, s]) => s.total >= 2 && s.correct / s.total < 0.6)
    .slice(0, 2)
    .map(([id]) => SKILLS[id] || id);
  const hint = unlockHint(p, courseConfig);

  return (
    <div className="flex min-w-0 flex-col gap-4 self-start">
      <section aria-labelledby="ja-domino" className="card p-4">
        <h2 id="ja-domino" className="section-title">O que você já demonstrou</h2>
        {demonstrated.length ? (
          <ul className="mt-2 space-y-1">
            {demonstrated.slice(-3).map((c) => (
              <li key={c.id} className="flex gap-2 text-sm text-ink-200">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden /> {c.title}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-ink-300">Nada ainda. Competência aparece aqui quando você a demonstra em uma atividade.</p>
        )}
        <button onClick={() => navigateTo('progress')} className="link mt-2">
          {demonstrated.length} de {COMPETENCIES.length} no Passaporte <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </button>
      </section>

      <section aria-labelledby="dificuldade" className="card p-4">
        <h2 id="dificuldade" className="section-title">Onde está mais difícil</h2>
        {mistakes.length || weakSkills.length ? (
          <ul className="mt-2 space-y-1.5 text-sm text-ink-300">
            {mistakes.map((m) => (
              <li key={m.id}>{m.text}</li>
            ))}
            {weakSkills.map((s) => (
              <li key={s}>Habilidade com poucos acertos: {s}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-ink-300">Nenhum ponto de atenção por enquanto.</p>
        )}
      </section>

      {hint && (
        <section aria-labelledby="desbloquear" className="card p-4">
          <h2 id="desbloquear" className="section-title">O que abre em seguida</h2>
          <p className="mt-1 text-sm text-ink-300">
            <span className="font-semibold text-ink-200">{hint.mission.code}: {hint.mission.title}.</span> Falta: {hint.needs}
          </p>
        </section>
      )}
    </div>
  );
};

/** O que existe para estudar e praticar, com contagens tiradas dos próprios dados. */
export const ExploreAreas: React.FC = () => {
  const { playerProfile, navigateTo } = useGameState();
  const areas: { icon: typeof BookOpen; title: string; text: string; screen: GameScreen; param?: string }[] = [
    { icon: ClipboardList, title: 'Missões da P-101', text: 'Seis ordens de serviço, da bomba desconhecida à avaliação', screen: 'missions' },
    { icon: Ruler, title: 'Oficina de Desenho', text: 'Vistas, tolerâncias, símbolos e seções', screen: 'drawing' },
    { icon: Library, title: 'Biblioteca', text: 'Fichas de equipamentos que levam a uma atividade', screen: 'library' },
    { icon: Stethoscope, title: 'Oficina de Diagnóstico', text: 'Ordens de serviço simuladas: investigue e decida', screen: 'diagnosis' },
    { icon: Cog, title: 'Máquina interativa', text: 'Conjunto motobomba com componentes e falhas simuladas', screen: 'machine' },
    { icon: BarChart3, title: 'Passaporte de competências', text: 'O que você praticou e demonstrou nos exercícios', screen: 'progress' },
    { icon: BookOpen, title: 'Trilhas', text: 'Aulas em sequência, da segurança ao diagnóstico', screen: 'courses' },
    { icon: Target, title: 'Questões', text: `${PRACTICE_TOPICS.length} temas, 5 questões com explicação`, screen: 'practice' },
    {
      icon: Box,
      title: 'Laboratório 3D',
      text: `${Object.keys(LAB_MACHINE_LABELS).length} equipamentos para desmontar e montar`,
      screen: 'lab',
      param: playerProfile.lastMachineId
    },
    { icon: Factory, title: 'Indústria na prática', text: 'Planta-escola fictícia com missões de manutenção', screen: 'industry' },
    { icon: Puzzle, title: 'Desafios', text: 'Segurança, ferramentas, metrologia e rolamentos', screen: 'games' }
  ];
  return (
    <section aria-labelledby="explorar" className="mt-8">
      <h2 id="explorar" className="section-title mb-3">
        Explorar o Mecânica Lab
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {areas.map((s) => (
          <li key={s.title}>
            <button onClick={() => navigateTo(s.screen, s.param)} className="card-interactive flex h-full w-full items-start gap-3 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft">
                <s.icon className="h-[18px] w-[18px] text-accent-text" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-ink-100">{s.title}</span>
                <span className="mt-0.5 block text-sm leading-snug text-ink-400">{s.text}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};
