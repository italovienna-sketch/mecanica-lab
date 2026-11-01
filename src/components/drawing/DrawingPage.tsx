import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Box, Check, RotateCcw, RotateCw } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import { DRAWING_GAME_ID, DRAWING_ROUNDS, DrawingRoundId } from '../../data/journey/meta';
import { PART_REGIONS, PumpPartId, spotLabel } from '../../data/journey/pumpSection';
import { SHAPES_BY_ID, VIEW_LABEL, ViewId, ViewOption, rotateShape, sectionOptions, viewGrid, viewOptions } from '../../data/drawing/voxel';
import { DRAWING_REFERENCES, FIT_QUESTION, SECTION_QUESTIONS, SHEET_ANSWER, SHEET_WHY, SYMBOLS, SheetSlot, TOLERANCE_CHECKS, VIEW_QUESTIONS } from '../../data/drawing/benches';
import { Page, PageHeader } from '../ui';
import { FeedbackBox, MatchBoard, seededShuffle } from '../journey/activityKit';
import { PumpSection } from '../journey/PumpSection';
import { IsoSvg, ViewSvg } from './DrawingArt';

const ROUND_LABEL: Record<DrawingRoundId, string> = {
  vistas: 'Vistas',
  folha: 'Folha',
  prancha: 'Conjunto',
  cotas: 'Tolerâncias',
  simbolos: 'Símbolos',
  cortes: 'Seções'
};

interface BenchProps {
  onSolved: (errors: number, total: number) => void;
}

const Solved: React.FC<{ text: string; onAgain: () => void }> = ({ text, onAgain }) => (
  <div className="space-y-2">
    <FeedbackBox tone="success" title="Bancada concluída.">
      <p>{text}</p>
    </FeedbackBox>
    <button className="btn-secondary" onClick={onAgain}>
      <RotateCcw className="h-4 w-4" aria-hidden /> Treinar de novo
    </button>
  </div>
);

/** Alternativas desenhadas. Depois de errar, a alternativa explica o engano e o aluno tenta outra. */
const OptionGrid: React.FC<{ options: ViewOption[]; hatch?: boolean; seed: number; label: string; onRight: (firstTry: boolean) => void; rightText: string }> = ({
  options,
  hatch,
  seed,
  label,
  onRight,
  rightText
}) => {
  const shuffled = useMemo(() => seededShuffle(options, seed), [options, seed]);
  const [wrong, setWrong] = useState<string[]>([]);
  const [right, setRight] = useState(false);
  const last = wrong[wrong.length - 1];
  return (
    <div className="space-y-3">
      <ul className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {shuffled.map((o, i) => (
          <li key={o.id}>
            <button
              disabled={right || wrong.includes(o.id)}
              data-correct={o.correct}
              onClick={() => {
                if (o.correct) {
                  setRight(true);
                  onRight(wrong.length === 0);
                } else setWrong((w) => [...w, o.id]);
              }}
              className={`w-full rounded-lg border-2 bg-paper p-2 transition-colors enabled:hover:border-accent disabled:cursor-default ${
                right && o.correct ? 'border-emerald-500' : wrong.includes(o.id) ? 'border-rose-400 opacity-60' : 'border-ink-700'
              }`}
            >
              <ViewSvg grid={o.grid} hatch={hatch} label={`${label}, alternativa ${i + 1}`} />
            </button>
          </li>
        ))}
      </ul>
      {last && !right && (
        <FeedbackBox tone="error">
          <p>{options.find((o) => o.id === last)?.why}</p>
        </FeedbackBox>
      )}
      {right && (
        <FeedbackBox tone="success">
          <p>{rightText}</p>
        </FeedbackBox>
      )}
    </div>
  );
};

/** Sequência de perguntas: conta os erros e entrega o resultado no fim. */
function useQuestions(total: number, onSolved: BenchProps['onSolved']) {
  const [i, setI] = useState(0);
  const [misses, setMisses] = useState(0);
  const [answered, setAnswered] = useState(false);
  const finished = i >= total;
  return {
    i,
    finished,
    answered,
    answer: (firstTry: boolean) => {
      setAnswered(true);
      if (!firstTry) setMisses((m) => m + 1);
    },
    next: () => {
      const n = i + 1;
      setI(n);
      setAnswered(false);
      if (n >= total) onSolved(misses, total);
    },
    restart: () => {
      setI(0);
      setMisses(0);
      setAnswered(false);
    }
  };
}

const NextBtn: React.FC<{ onClick: () => void; last: boolean }> = ({ onClick, last }) => (
  <button className="btn-primary" onClick={onClick}>
    {last ? 'Concluir a bancada' : 'Próxima peça'} <ArrowRight className="h-4 w-4" aria-hidden />
  </button>
);

const VistasBench: React.FC<BenchProps> = ({ onSolved }) => {
  const q = useQuestions(VIEW_QUESTIONS.length, onSolved);
  const [turns, setTurns] = useState(0);
  if (q.finished) return <Solved text="Você transformou peça em vista, nas três direções, sem espelhar." onAgain={q.restart} />;
  const cur = VIEW_QUESTIONS[q.i];
  const shape = SHAPES_BY_ID[cur.shape];
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <div>
        <div className="rounded-lg bg-paper p-2">
          <IsoSvg shape={rotateShape(shape, turns)} turns={turns} label={`${shape.name} em perspectiva isométrica. A letra F marca a frente.`} />
        </div>
        <button className="btn-secondary btn-sm mt-2" onClick={() => setTurns((t) => t + 1)}>
          <RotateCw className="h-4 w-4" aria-hidden /> Girar a peça
        </button>
        <p className="mt-1 text-xs text-ink-400">F marca a frente, em qualquer posição. Arestas invisíveis omitidas nesta bancada.</p>
      </div>
      <div className="space-y-3">
        <p className="text-base font-medium text-ink-100">
          Peça {q.i + 1} de {VIEW_QUESTIONS.length}: qual é a <strong>{VIEW_LABEL[cur.view].toLowerCase()}</strong>?
        </p>
        <OptionGrid key={q.i} options={viewOptions(shape, cur.view)} seed={q.i + 3} label={VIEW_LABEL[cur.view]} onRight={q.answer} rightText="Isso: compare cada degrau com a peça." />
        {q.answered && <NextBtn last={q.i + 1 >= VIEW_QUESTIONS.length} onClick={() => { setTurns(0); q.next(); }} />}
      </div>
    </div>
  );
};

const VIEWS: ViewId[] = ['superior', 'lateral', 'frontal'];
const SLOTS: { id: SheetSlot; area: string; label: string }[] = [
  { id: 'acima', area: 'col-start-2 row-start-1', label: 'Acima' },
  { id: 'esquerda', area: 'col-start-1 row-start-2', label: 'À esquerda' },
  { id: 'centro', area: 'col-start-2 row-start-2', label: 'Centro' },
  { id: 'direita', area: 'col-start-3 row-start-2', label: 'À direita' },
  { id: 'abaixo', area: 'col-start-2 row-start-3', label: 'Abaixo' }
];

/** Tocar na vista e depois no lugar: funciona igual com mouse, toque e teclado. */
const FolhaBench: React.FC<BenchProps> = ({ onSolved }) => {
  const [turn, setTurn] = useState(0);
  const shape = SHAPES_BY_ID[['degrau', 'canto'][turn % 2]];
  const [held, setHeld] = useState<ViewId | null>(null);
  const [placed, setPlaced] = useState<Partial<Record<SheetSlot, ViewId>>>({});
  const [errors, setErrors] = useState(0);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [solved, setSolved] = useState(false);
  const left = VIEWS.filter((v) => !Object.values(placed).includes(v));

  const place = (slot: SheetSlot) => {
    if (!held || placed[slot]) return;
    if (SHEET_ANSWER[held] === slot) {
      const next = { ...placed, [slot]: held };
      setPlaced(next);
      setNote({ ok: true, text: SHEET_WHY[held] });
      setHeld(null);
      if (Object.keys(next).length === VIEWS.length) {
        setSolved(true);
        onSolved(errors, VIEWS.length);
      }
    } else {
      setErrors((e) => e + 1);
      setNote({ ok: false, text: `${SHEET_WHY[held]} Ela não fica ${SLOTS.find((s) => s.id === slot)?.label.toLowerCase()}.` });
    }
  };

  const restart = () => {
    setTurn((t) => t + 1);
    setPlaced({});
    setErrors(0);
    setNote(null);
    setSolved(false);
    setHeld(null);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-300">Monte a folha no 1º diedro, o padrão da ABNT. Escolha uma vista e toque no lugar dela.</p>
      {/* Peça e vistas em faixa: a folha inteira cabe na tela, sem rolar entre escolher a vista e o lugar dela. */}
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 [&_svg]:max-h-24">
        <li className="rounded-lg bg-paper p-2">
          <IsoSvg shape={shape} label={`${shape.name} em perspectiva`} />
        </li>
        {left.map((v) => (
          <li key={v}>
            <button aria-pressed={held === v} data-view={v} onClick={() => setHeld(v)} className={`h-full w-full rounded-lg border-2 bg-paper p-1 ${held === v ? 'border-accent' : 'border-ink-700 hover:border-ink-500'}`}>
              <ViewSvg grid={viewGrid(shape, v)} label={VIEW_LABEL[v]} cell={14} />
              <span className="block text-center text-xs font-semibold text-[#1a1d21]">{VIEW_LABEL[v]}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-3 grid-rows-3 gap-1.5 rounded-lg border border-ink-700 bg-paper p-2 [&_svg]:max-h-24" aria-label="Folha de desenho">
        {SLOTS.map((s) => {
          const v = placed[s.id];
          return (
            <button key={s.id} onClick={() => place(s.id)} disabled={Boolean(v) || !held} data-sheet={s.id} className={`flex min-h-24 flex-col items-center justify-center rounded border border-dashed p-1 text-xs text-[#3f454d] ${s.area} ${held && !v ? 'border-[#c2410c]' : 'border-[#9a9fa6]'}`}>
              {v ? <ViewSvg grid={viewGrid(shape, v)} label={VIEW_LABEL[v]} cell={16} /> : s.label}
            </button>
          );
        })}
      </div>
      {note && (
        <FeedbackBox tone={note.ok ? 'success' : 'error'}>
          <p>{note.text}</p>
        </FeedbackBox>
      )}
      {solved && <Solved text="Folha no 1º diedro completa. Em desenho de fornecedor estrangeiro, olhe o símbolo do diedro antes de ler." onAgain={restart} />}
    </div>
  );
};

/** Desenho de conjunto: ler pela lista de peças, sem nome escrito no desenho. */
const PranchaBench: React.FC<BenchProps> = ({ onSolved }) => {
  const { navigateTo } = useGameState();
  const asks = useMemo(() => seededShuffle(PART_REGIONS.filter((r) => r.n), 7).slice(0, 5), []);
  const q = useQuestions(asks.length, onSolved);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [missed, setMissed] = useState(false);
  if (q.finished) return <Solved text="Você leu o conjunto pela lista de peças, como no chão de fábrica." onAgain={q.restart} />;
  const cur = asks[q.i];
  const pick = (id: string) => {
    if (q.answered) return;
    if (id === cur.id) {
      q.answer(!missed);
      setNote({ ok: true, text: cur.note });
    } else {
      setMissed(true);
      setNote({ ok: false, text: `Aí é o item ${PART_REGIONS.find((r) => r.id === id)?.n}: ${spotLabel(id as PumpPartId).toLowerCase()}.` });
    }
  };
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="space-y-3">
        <p className="text-base font-medium text-ink-100">
          Item {q.i + 1} de {asks.length}: aponte no corte a peça “{cur.label.toLowerCase()}”.
        </p>
        <div className="overflow-hidden rounded-lg border border-ink-800">
          <PumpSection title="Desenho de conjunto da bomba, com balões" mode={q.answered ? 'none' : 'parts'} balloons active={q.answered ? cur.id : null} onPick={pick} />
        </div>
        <p className="text-xs text-ink-400">Corte simplificado, sem escala, criado para o exercício.</p>
        {note && (
          <FeedbackBox tone={note.ok ? 'success' : 'error'}>
            <p>{note.text}</p>
          </FeedbackBox>
        )}
        {q.answered && (
          <div className="flex flex-wrap gap-2">
            <NextBtn
              last={q.i + 1 >= asks.length}
              onClick={() => {
                setNote(null);
                setMissed(false);
                q.next();
              }}
            />
            <button className="btn-secondary" onClick={() => navigateTo('lab', 'centrifugal-pump')}>
              <Box className="h-4 w-4" aria-hidden /> Ver no 3D
            </button>
          </div>
        )}
      </div>
      <table className="h-fit w-full text-left text-sm">
        <caption className="mb-1 text-left text-sm font-semibold text-ink-100">Lista de peças</caption>
        <thead className="text-xs text-ink-400">
          <tr>
            <th scope="col" className="pb-1 font-medium">Item</th>
            <th scope="col" className="pb-1 font-medium">Peça</th>
          </tr>
        </thead>
        <tbody>
          {PART_REGIONS.filter((r) => r.n)
            .sort((a, b) => a.n! - b.n!)
            .map((r) => (
              <tr key={r.id} className="border-t border-ink-800">
                <td className="py-1 pr-2 font-mono text-ink-300">{r.n}</td>
                <td className="py-1 text-ink-200">{r.label}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

const mm = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 });

const CotasBench: React.FC<BenchProps> = ({ onSolved }) => {
  const q = useQuestions(TOLERANCE_CHECKS.length + 1, onSolved);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const fitOptions = useMemo(() => seededShuffle(FIT_QUESTION.options, 3), []);
  const [fitWrong, setFitWrong] = useState<string | null>(null);
  if (q.finished) return <Solved text="Você comparou leitura com limite, em vez de arredondar no olho." onAgain={() => { q.restart(); setFitWrong(null); }} />;
  const onFit = q.i === TOLERANCE_CHECKS.length;
  const c = TOLERANCE_CHECKS[q.i];
  const judge = (ok: boolean) => {
    const inside = c.reading >= c.min && c.reading <= c.max;
    q.answer(ok === inside);
    setNote({ ok: ok === inside, text: c.why });
  };
  return (
    <div className="space-y-3">
      {!onFit ? (
        <>
          <p className="eyebrow">Inspeção {q.i + 1} de {TOLERANCE_CHECKS.length}</p>
          <dl className="grid gap-px overflow-hidden rounded-lg border border-ink-700 bg-ink-700 sm:grid-cols-3">
            <div className="bg-ink-850 p-3">
              <dt className="text-xs text-ink-400">Característica</dt>
              <dd className="text-sm font-medium text-ink-100">{c.feature}</dd>
            </div>
            <div className="bg-ink-850 p-3">
              <dt className="text-xs text-ink-400">No desenho</dt>
              <dd className="font-mono text-lg font-semibold text-ink-100">{c.callout}</dd>
            </div>
            <div className="bg-ink-850 p-3">
              <dt className="text-xs text-ink-400">Leitura</dt>
              <dd className="font-mono text-lg font-semibold text-ink-100">{mm(c.reading)} mm</dd>
            </div>
          </dl>
          {!q.answered ? (
            <div className="flex flex-wrap gap-2">
              <button className="btn-primary" onClick={() => judge(true)}>Aprovar</button>
              <button className="btn-secondary" onClick={() => judge(false)}>Reprovar</button>
            </div>
          ) : (
            <>
              <FeedbackBox tone={note?.ok ? 'success' : 'error'} title={note?.ok ? 'Decisão certa.' : 'Decisão errada.'}>
                <p>{note?.text}</p>
              </FeedbackBox>
              <NextBtn last={false} onClick={q.next} />
            </>
          )}
        </>
      ) : (
        <>
          <p className="text-base font-medium text-ink-100">{FIT_QUESTION.prompt}</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {fitOptions.map((o) => (
              <li key={o.text}>
                <button
                  disabled={q.answered}
                  onClick={() => {
                    if (o.correct) q.answer(fitWrong === null);
                    else setFitWrong(o.why ?? null);
                  }}
                  className="w-full rounded-lg border border-ink-700 bg-ink-850 px-3 py-2.5 text-left text-sm text-ink-100 enabled:hover:border-accent"
                >
                  {o.text}
                </button>
              </li>
            ))}
          </ul>
          {fitWrong && !q.answered && (
            <FeedbackBox tone="error">
              <p>{fitWrong}</p>
            </FeedbackBox>
          )}
          {q.answered && (
            <>
              <FeedbackBox tone="success">
                <p>{FIT_QUESTION.why}</p>
              </FeedbackBox>
              <NextBtn last onClick={q.next} />
            </>
          )}
        </>
      )}
    </div>
  );
};

const SimbolosBench: React.FC<BenchProps> = ({ onSolved }) => {
  const [round, setRound] = useState(0);
  const [done, setDone] = useState(false);
  const items = useMemo(() => SYMBOLS.map((s) => ({ id: s.id, label: s.symbol })), []);
  const slots = useMemo(() => SYMBOLS.map((s) => ({ id: s.id, label: s.meaning, accepts: s.id })), []);
  const whyOf = (id: string) => SYMBOLS.find((s) => s.id === id)!.why;
  if (done) return <Solved text="Cada símbolo no lugar. O desenho fala pouco, mas fala com precisão." onAgain={() => { setDone(false); setRound((r) => r + 1); }} />;
  return (
    <MatchBoard
      key={round}
      items={items}
      slots={slots}
      seed={round + 5}
      itemsLabel="Símbolos do desenho"
      praise={(s) => whyOf(s.id)}
      explain={(id) => `Este símbolo significa outra coisa. ${whyOf(id)}`}
      onComplete={(errors) => {
        setDone(true);
        onSolved(errors, SYMBOLS.length);
      }}
    />
  );
};

const CortesBench: React.FC<BenchProps> = ({ onSolved }) => {
  const q = useQuestions(SECTION_QUESTIONS.length, onSolved);
  if (q.finished) return <Solved text="Você imaginou a peça cortada: é assim que se lê o que uma vista por fora não mostra." onAgain={q.restart} />;
  const cur = SECTION_QUESTIONS[q.i];
  const shape = SHAPES_BY_ID[cur.shape];
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <div>
        <div className="rounded-lg bg-paper p-2">
          <IsoSvg shape={shape} plane={cur.plane} label={`${shape.name} com o plano de corte A-A`} />
        </div>
        <p className="mt-1 text-xs text-ink-400">Seção: mostra só o que o plano toca, com hachura. Um corte completo mostraria também o que está atrás do plano.</p>
      </div>
      <div className="space-y-3">
        <p className="text-base font-medium text-ink-100">
          Peça {q.i + 1} de {SECTION_QUESTIONS.length}: como fica a seção A-A, olhando de frente?
        </p>
        <OptionGrid key={q.i} options={sectionOptions(shape, cur.plane)} hatch seed={q.i + 9} label="Seção A-A" onRight={q.answer} rightText="Isso: é exatamente o que o plano toca." />
        {q.answered && <NextBtn last={q.i + 1 >= SECTION_QUESTIONS.length} onClick={q.next} />}
      </div>
    </div>
  );
};

const BENCHES: Record<DrawingRoundId, React.FC<BenchProps>> = {
  vistas: VistasBench,
  folha: FolhaBench,
  prancha: PranchaBench,
  cotas: CotasBench,
  simbolos: SimbolosBench,
  cortes: CortesBench
};

/** Oficina de Desenho: exploração aberta, em qualquer ordem. Conta para a competência de leitura de desenho. */
export const DrawingPage: React.FC = () => {
  const { playerProfile, recordGameRound, setLastActivity } = useGameState();
  const rounds = playerProfile.gameResults[DRAWING_GAME_ID]?.rounds ?? {};
  const [tab, setTab] = useState<DrawingRoundId>(() => DRAWING_ROUNDS.find((r) => !rounds[r]?.solved) ?? 'vistas');
  const Bench = BENCHES[tab];
  const solvedCount = DRAWING_ROUNDS.filter((r) => rounds[r]?.solved).length;

  useEffect(() => {
    setLastActivity('drawing', 'Oficina de Desenho');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Page>
      <PageHeader title="Oficina de Desenho" description="Leia o desenho como quem vai usá-lo: da peça para a vista, da cota para a decisão, do corte para a peça real." />
      <div role="tablist" aria-label="Bancadas de desenho" className="segmented mb-4 max-w-full overflow-x-auto">
        {DRAWING_ROUNDS.map((r) => (
          <button key={r} role="tab" aria-selected={tab === r} onClick={() => setTab(r)} data-bench={r}>
            {rounds[r]?.solved && <Check className="mr-1 inline h-3.5 w-3.5 text-emerald-400" aria-label="Concluída" />}
            {ROUND_LABEL[r]}
          </button>
        ))}
      </div>
      <section className="card p-4 sm:p-5" aria-label={`Bancada: ${ROUND_LABEL[tab]}`}>
        <Bench key={tab} onSolved={(errors, total) => recordGameRound(DRAWING_GAME_ID, tab, { solved: true, firstTry: errors === 0, score: Math.max(0, Math.round(((total - errors) / total) * 100)) })} />
      </section>
      <p className="mt-3 text-sm text-ink-400">
        {solvedCount} de {DRAWING_ROUNDS.length} bancadas concluídas. Sólidos e leituras são do exercício. Referências: {DRAWING_REFERENCES.join(' ')}
      </p>
    </Page>
  );
};
