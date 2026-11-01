import React, { useMemo, useRef, useState } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import { FLOW_ORDER, FLOW_REGIONS, PART_REGIONS, PumpSpot, isFlowSpot, spotLabel } from '../../data/journey/pumpSection';
import { REVIEW_CARDS_BY_ID, ReviewCard, warmupCards } from '../../data/journey/review';
import { RELEASE_SEQUENCE, TOOL_CHOICES, TOOL_TASKS } from '../../data/journey/bench';
import { REVIEW_INTERVAL_TEXT } from './reviewText';
import type { Mission } from '../../data/journey/missions';
import { DependencySequence, FeedbackBox, MatchBoard, seededShuffle } from './activityKit';
import { PumpSection } from './PumpSection';

export interface StepProps {
  mission: Mission;
  /** A etapa foi demonstrada: registra a evidência. */
  onPass: () => void;
}

/** Um cartão de recuperação: alternativas ou apontar no corte. Depois de responder, sempre mostra o raciocínio. */
export const CardQuiz: React.FC<{ card: ReviewCard; seed: number; onAnswered: (correct: boolean) => void; onNext: () => void; nextLabel: string }> = ({
  card,
  seed,
  onAnswered,
  onNext,
  nextLabel
}) => {
  const [answered, setAnswered] = useState<{ correct: boolean; trap?: string } | null>(null);
  const [picked, setPicked] = useState<PumpSpot | null>(null);
  const options = useMemo(() => seededShuffle((card.options ?? []).map((text, i) => ({ text, i })), seed), [card, seed]);

  const answer = (correct: boolean, trap?: string) => {
    if (answered) return;
    setAnswered({ correct, trap });
    onAnswered(correct);
  };

  return (
    <div className="space-y-3">
      <p className="text-base font-medium leading-relaxed text-ink-100">{card.prompt}</p>
      {card.spot ? (
        <div className="overflow-hidden rounded-lg border border-ink-800">
          <PumpSection
            title="Corte da bomba: aponte a região"
            mode={answered ? 'none' : isFlowSpot(card.spot) ? 'flow' : 'parts'}
            active={answered ? card.spot : null}
            wrong={answered && !answered.correct ? picked : null}
            onPick={(id) => {
              setPicked(id);
              answer(id === card.spot, `Você apontou: ${spotLabel(id)}.`);
            }}
          />
        </div>
      ) : (
        <ul className="grid gap-2">
          {options.map((o) => (
            <li key={o.i}>
              <button
                disabled={Boolean(answered)}
                onClick={() => answer(o.i === 0, o.i > 0 ? card.traps?.[o.i - 1] : undefined)}
                className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-colors disabled:cursor-default ${
                  answered && o.i === 0 ? 'border-emerald-600/70 bg-emerald-950/30 text-emerald-200' : 'border-ink-700 bg-ink-850 text-ink-100 enabled:hover:border-accent'
                }`}
              >
                {o.text}
              </button>
            </li>
          ))}
        </ul>
      )}
      {answered && (
        <>
          <FeedbackBox tone={answered.correct ? 'success' : 'error'} title={answered.correct ? 'Isso.' : 'Ainda não.'}>
            {!answered.correct && answered.trap && <p>{answered.trap}</p>}
            <p>{card.explanation}</p>
          </FeedbackBox>
          <button className="btn-primary" onClick={onNext}>
            {nextLabel} <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </>
      )}
    </div>
  );
};

/** Aquecimento: lembrar sem consultar. Conta ter tentado, não ter acertado: errar aqui é útil, e o cartão volta antes. */
export const WarmupStep: React.FC<StepProps> = ({ mission, onPass }) => {
  const { playerProfile, recordReviewAnswer, courseConfig } = useGameState();
  const [cards] = useState(() => warmupCards(playerProfile, mission.id, 3, courseConfig.customCards, courseConfig.disabledCards));
  const [i, setI] = useState(0);
  const [right, setRight] = useState(0);
  const card = cards[i];

  if (!card) {
    return (
      <div className="space-y-3">
        <FeedbackBox tone="success" title="Aquecimento feito">
          <p>
            {right} de {cards.length} de memória. {right < cards.length ? 'Os que escaparam voltam na revisão de amanhã.' : 'Esses cartões voltam em alguns dias.'}
          </p>
        </FeedbackBox>
        <button className="btn-primary" onClick={onPass}>
          Seguir para a missão <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    );
  }
  return (
    <div>
      <p className="eyebrow mb-2">
        Cartão {i + 1} de {cards.length} · sem consulta, sem nota
      </p>
      <CardQuiz
        key={card.id}
        card={card}
        seed={i + 5}
        nextLabel={i + 1 < cards.length ? 'Próximo cartão' : 'Ver resultado'}
        onAnswered={(ok) => {
          recordReviewAnswer(card.id, ok);
          if (ok) setRight((r) => r + 1);
        }}
        onNext={() => setI((n) => n + 1)}
      />
    </div>
  );
};

/** OS-01: clicar nas regiões na ordem em que o líquido passa. */
export const FlowStep: React.FC<StepProps> = ({ onPass }) => {
  const { logMistake, resolveMistakes } = useGameState();
  const [done, setDone] = useState<PumpSpot[]>([]);
  const [wrong, setWrong] = useState<PumpSpot | null>(null);
  const [errors, setErrors] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const finished = done.length === FLOW_ORDER.length;
  const passed = finished && errors <= 2;

  const pick = (id: PumpSpot) => {
    if (finished) return;
    const expected = FLOW_ORDER[done.length];
    if (id === expected) {
      const next = [...done, id];
      setDone(next);
      setWrong(null);
      setMessage(FLOW_REGIONS.find((r) => r.id === id)?.note ?? null);
      if (next.length === FLOW_ORDER.length && errors <= 2) resolveMistakes(['mx-fluxo']);
    } else if (!done.includes(id)) {
      setWrong(id);
      setErrors((e) => e + 1);
      logMistake({ id: 'mx-fluxo', area: 'Siga o líquido', skill: 'componentes', text: 'Caminho do líquido fora de ordem.', why: 'O líquido entra pela sucção, chega ao olho do rotor, é acelerado pelas pás, perde velocidade na voluta e sai pelo recalque.' });
      setMessage(`O líquido ainda não chegou em “${spotLabel(id)}”. Pense no que vem logo depois de ${done.length ? `“${spotLabel(done[done.length - 1])}”` : 'a tubulação de sucção'}.`);
    }
  };

  const restart = () => {
    setDone([]);
    setErrors(0);
    setWrong(null);
    setMessage(null);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-300">
        Clique nas regiões do corte <strong className="text-ink-100">na ordem em que a água passa</strong>, da entrada até a saída. {done.length} de {FLOW_ORDER.length}.
      </p>
      <div className="overflow-hidden rounded-lg border border-ink-800">
        <PumpSection title="Corte da bomba: siga o líquido" mode={finished ? 'none' : 'flow'} done={done} wrong={wrong} onPick={pick} showFlow={finished} />
      </div>
      {message && !finished && (
        <FeedbackBox tone={wrong ? 'error' : 'success'}>
          <p>{message}</p>
        </FeedbackBox>
      )}
      {finished && (
        <FeedbackBox tone={passed ? 'success' : 'hint'} title={passed ? 'Caminho completo.' : 'Você chegou ao fim, mas com muitos desvios.'}>
          <p>Sucção, olho do rotor, canais entre as pás, voluta e recalque. O rotor dá velocidade e a voluta troca velocidade por pressão.</p>
        </FeedbackBox>
      )}
      {finished &&
        (passed ? (
          <button className="btn-primary" onClick={onPass}>
            Continuar <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <button className="btn-secondary" onClick={restart}>
            <RotateCcw className="h-4 w-4" aria-hidden /> Refazer o caminho
          </button>
        ))}
    </div>
  );
};

const SPOT_PROMPTS: { spot: PumpSpot; prompt: string; why: string }[] = [
  { spot: 'volute', prompt: 'Onde a velocidade vira pressão?', why: 'Na voluta, o canal alarga e o líquido desacelera: a velocidade vira pressão.' },
  { spot: 'eye', prompt: 'Onde a pressão é mais baixa?', why: 'No olho do rotor: é ali que a cavitação começa quando a sucção é ruim.' },
  { spot: 'vanes', prompt: 'Onde o líquido ganha velocidade?', why: 'Nos canais entre as pás, que giram com o rotor.' },
  { spot: 'discharge', prompt: 'Por onde o líquido sai para a linha?', why: 'Pelo bocal de recalque.' }
];

/** OS-01: localizar conceitos no desenho. Precisa de 3 em 4 de primeira; o que errou volta na mesma rodada. */
export const SpotStep: React.FC<StepProps> = ({ onPass }) => {
  const { logMistake } = useGameState();
  const [round, setRound] = useState(0);
  const prompts = useMemo(() => seededShuffle(SPOT_PROMPTS, round + 2), [round]);
  const [i, setI] = useState(0);
  const [firstTry, setFirstTry] = useState(0);
  const [missed, setMissed] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const cur = prompts[i];
  const finished = i >= prompts.length;

  const pick = (id: PumpSpot) => {
    if (note?.ok) return;
    if (id === cur.spot) {
      if (!missed) setFirstTry((n) => n + 1);
      setNote({ ok: true, text: cur.why });
    } else {
      setMissed(true);
      logMistake({ id: `mx-spot-${cur.spot}`, area: 'Aponte no corte', skill: 'componentes', text: cur.prompt, why: cur.why });
      setNote({ ok: false, text: `Aí é ${spotLabel(id).toLowerCase()}. ${FLOW_REGIONS.find((r) => r.id === id)?.note ?? ''} Tente outra região.` });
    }
  };

  if (finished) {
    const passed = firstTry >= 3;
    return (
      <div className="space-y-3">
        <FeedbackBox tone={passed ? 'success' : 'hint'} title={`${firstTry} de ${prompts.length} de primeira`}>
          <p>{passed ? 'Você sabe onde as coisas acontecem dentro da bomba.' : 'São necessários 3 de primeira. Reveja o que escapou e tente de novo: a ordem muda.'}</p>
        </FeedbackBox>
        {passed ? (
          <button className="btn-primary" onClick={onPass}>
            Continuar <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <button
            className="btn-secondary"
            onClick={() => {
              setRound((r) => r + 1);
              setI(0);
              setFirstTry(0);
              setMissed(false);
              setNote(null);
            }}
          >
            <RotateCcw className="h-4 w-4" aria-hidden /> Tentar de novo
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="eyebrow">
        Pergunta {i + 1} de {prompts.length}
      </p>
      <p className="text-base font-medium text-ink-100">{cur.prompt}</p>
      <div className="overflow-hidden rounded-lg border border-ink-800">
        <PumpSection title="Corte da bomba: aponte a região" mode={note?.ok ? 'none' : 'flow'} active={note?.ok ? cur.spot : null} onPick={pick} />
      </div>
      {note && (
        <FeedbackBox tone={note.ok ? 'success' : 'error'}>
          <p>{note.text}</p>
        </FeedbackBox>
      )}
      {note?.ok && (
        <button
          className="btn-primary"
          onClick={() => {
            setI((n) => n + 1);
            setMissed(false);
            setNote(null);
          }}
        >
          Próxima <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  );
};

const FUNCTION_SLOTS = [
  { part: 'pump-impeller', fn: 'Acelera o líquido para fora' },
  { part: 'pump-volute-casing', fn: 'Transforma velocidade em pressão' },
  { part: 'pump-mechanical-seal', fn: 'Impede vazamento na passagem do eixo' },
  { part: 'pump-bearings', fn: 'Sustenta o eixo e reduz o atrito do giro' },
  { part: 'pump-shaft', fn: 'Leva o giro do motor até o rotor' },
  { part: 'pump-casing-gasket', fn: 'Veda a união entre carcaça e tampa' },
  { part: 'pump-coupling-hub', fn: 'Liga o eixo da bomba ao motor' },
  { part: 'pump-bearing-bracket', fn: 'Aloja os rolamentos e o óleo' }
];

/** OS-02: ligar função ↔ peça. */
export const MatchStep: React.FC<StepProps> = ({ onPass }) => {
  const { logMistake } = useGameState();
  const [result, setResult] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const items = useMemo(() => FUNCTION_SLOTS.map((s) => ({ id: s.part, label: spotLabel(s.part as PumpSpot) })), []);
  const slots = useMemo(() => FUNCTION_SLOTS.map((s) => ({ id: s.part, label: s.fn, accepts: s.part })), []);
  const passed = result !== null && result <= 3;

  return (
    <div className="space-y-3">
      <MatchBoard
        key={round}
        items={items}
        slots={slots}
        seed={round + 11}
        itemsLabel="Peças"
        praise={(s) => PART_REGIONS.find((r) => r.id === s.accepts)?.note ?? 'Certo.'}
        explain={(id) => `${spotLabel(id as PumpSpot)} não faz isso. ${PART_REGIONS.find((r) => r.id === id)?.note ?? ''}`}
        onError={(id, s) => logMistake({ id: `mx-funcao-${s.accepts}`, area: 'Peça certa, função certa', skill: 'componentes', text: `${s.label}: não é ${spotLabel(id as PumpSpot).toLowerCase()}.`, why: `Quem faz isso é: ${spotLabel(s.accepts as PumpSpot).toLowerCase()}.` })}
        onComplete={setResult}
      />
      {result !== null && (
        <>
          <FeedbackBox tone={passed ? 'success' : 'hint'} title={`${result} erro(s)`}>
            <p>{passed ? 'Cada peça no lugar certo.' : 'Mais de 3 erros mostra que ainda há chute. Refaça com calma: o raciocínio de cada erro ficou no caderno.'}</p>
          </FeedbackBox>
          {passed ? (
            <button className="btn-primary" onClick={onPass}>
              Continuar <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          ) : (
            <button
              className="btn-secondary"
              onClick={() => {
                setResult(null);
                setRound((r) => r + 1);
              }}
            >
              <RotateCcw className="h-4 w-4" aria-hidden /> Refazer
            </button>
          )}
        </>
      )}
    </div>
  );
};

/** OS-03: liberação para manutenção. A ordem depende de pré-requisitos, não de uma lista decorada. */
export const ReleaseStep: React.FC<StepProps> = ({ onPass }) => {
  const { logMistake } = useGameState();
  const [round, setRound] = useState(0);
  const [errors, setErrors] = useState<number | null>(null);
  const passed = errors !== null && errors <= 2;
  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-300">
        A bomba está ligada e a operação ainda não sabe da parada. Monte a liberação: escolha sempre o próximo passo. Mais de uma ordem pode funcionar, mas cada passo depende de outros.
      </p>
      <p className="notice-warning">Treino de raciocínio. Na empresa vale o procedimento do local, com profissional autorizado (NR-12, item 12.11.3).</p>
      <DependencySequence
        key={round}
        items={RELEASE_SEQUENCE}
        seed={round + 17}
        onError={(item) => logMistake({ id: `mx-lib-${item.id}`, area: 'Liberação da bomba', skill: 'seguranca', text: `Tentou antes da hora: ${item.label.toLowerCase()}.`, why: item.tooEarly })}
        onComplete={setErrors}
      />
      {errors !== null && (
        <>
          <FeedbackBox tone={passed ? 'success' : 'hint'} title={errors === 0 ? 'Sem nenhum passo fora de hora.' : `${errors} passo(s) fora de hora.`}>
            <p>{passed ? 'A bomba está liberada: sem energia, sem pressão, sem líquido e fria.' : 'Em liberação, passo fora de ordem é risco. Refaça até sair com no máximo 2 tropeços.'}</p>
          </FeedbackBox>
          {passed ? (
            <button className="btn-primary" onClick={onPass}>
              Continuar <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          ) : (
            <button
              className="btn-secondary"
              onClick={() => {
                setErrors(null);
                setRound((r) => r + 1);
              }}
            >
              <RotateCcw className="h-4 w-4" aria-hidden /> Refazer
            </button>
          )}
        </>
      )}
    </div>
  );
};

/** OS-03: ferramenta ↔ tarefa, com o que a ferramenta errada faz com a peça. */
export const ToolsStep: React.FC<StepProps> = ({ onPass }) => {
  const { logMistake } = useGameState();
  const [round, setRound] = useState(0);
  const [errors, setErrors] = useState<number | null>(null);
  const items = useMemo(() => TOOL_CHOICES.map((t) => ({ id: t, label: t })), []);
  const slots = useMemo(() => TOOL_TASKS.map((t) => ({ id: t.id, label: t.task, accepts: t.tool })), []);
  const passed = errors !== null && errors <= 3;
  const taskOf = (id: string) => TOOL_TASKS.find((t) => t.id === id)!;

  return (
    <div className="space-y-3">
      <MatchBoard
        key={round}
        items={items}
        slots={slots}
        seed={round + 23}
        itemsLabel="Caixa de ferramentas"
        praise={(s) => taskOf(s.id).why}
        explain={(tool, s) => taskOf(s.id).wrong[tool] ?? `${tool} não é para esta tarefa. Pense no que a peça pode sofrer.`}
        onError={(tool, s) => logMistake({ id: `mx-ferr-${s.id}`, area: 'Ferramenta para cada tarefa', skill: 'procedimento', text: `${s.label}: ${tool} não serve.`, why: taskOf(s.id).why })}
        onComplete={setErrors}
      />
      {errors !== null && (
        <>
          <FeedbackBox tone={passed ? 'success' : 'hint'} title={`${errors} escolha(s) errada(s)`}>
            <p>{passed ? 'Ferramenta certa é o que separa a desmontagem de um estrago.' : 'Refaça: cada ferramenta errada, na bomba real, vira peça estragada.'}</p>
          </FeedbackBox>
          {passed ? (
            <button className="btn-primary" onClick={onPass}>
              Continuar <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          ) : (
            <button
              className="btn-secondary"
              onClick={() => {
                setErrors(null);
                setRound((r) => r + 1);
              }}
            >
              <RotateCcw className="h-4 w-4" aria-hidden /> Refazer
            </button>
          )}
        </>
      )}
    </div>
  );
};

/** Sessão de revisão espaçada: até 5 cartões vencidos, um por vez. */
export const ReviewSession: React.FC<{ cards: ReviewCard[]; onExit: () => void }> = ({ cards, onExit }) => {
  const { recordReviewAnswer } = useGameState();
  const [i, setI] = useState(0);
  const results = useRef<boolean[]>([]);
  const card = cards[i];

  if (!card) {
    const right = results.current.filter(Boolean).length;
    return (
      <div className="space-y-3">
        <FeedbackBox tone="success" title={`Revisão feita: ${right} de ${cards.length} de memória`}>
          <p>{REVIEW_INTERVAL_TEXT}</p>
        </FeedbackBox>
        <button className="btn-primary" onClick={onExit}>
          Voltar às missões
        </button>
      </div>
    );
  }
  return (
    <div>
      <p className="eyebrow mb-2">
        Cartão {i + 1} de {cards.length}
      </p>
      <CardQuiz
        key={card.id}
        card={REVIEW_CARDS_BY_ID[card.id] ?? card}
        seed={i + 31}
        nextLabel={i + 1 < cards.length ? 'Próximo cartão' : 'Ver resultado'}
        onAnswered={(ok) => {
          results.current.push(ok);
          recordReviewAnswer(card.id, ok);
        }}
        onNext={() => setI((n) => n + 1)}
      />
    </div>
  );
};
