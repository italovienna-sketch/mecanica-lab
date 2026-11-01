import React, { useMemo, useState } from 'react';
import { Check, Copy, Info, Trash2, Upload, X } from 'lucide-react';
import { DEFAULT_CUSTOMIZATION, INITIAL_PROFILE, useGameState } from '../../context/GameStateContext';
import { ClassReport, classReport } from '../../data/journey/classReport';
import { CourseConfig, MAX_PASS, MIN_PASS, encodeCourseConfig, normalizeCourseConfig } from '../../data/journey/courseConfig';
import { CRITERIA, CRITERION_LABEL } from '../../data/journey/meta';
import { MISSIONS } from '../../data/journey/missions';
import { REVIEW_CARDS } from '../../data/journey/review';
import { parseImport } from '../../data/profileStorage';
import type { PlayerProfile } from '../../types/game';
import { EmptyState } from '../ui';

const MAX_FILES = 60;

const Heatmap: React.FC<{ report: ClassReport; passScore: number }> = ({ report, passScore }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[760px] text-left text-sm">
      <caption className="sr-only">Progresso por aluno nas ordens de serviço e na avaliação prática</caption>
      <thead>
        <tr className="border-b border-ink-800 text-xs text-ink-400">
          <th scope="col" className="pb-2 pr-3 font-medium">Aluno</th>
          {MISSIONS.map((m) => (
            <th scope="col" key={m.id} className="pb-2 pr-2 text-center font-mono font-medium">{m.code.slice(3)}</th>
          ))}
          {CRITERIA.map((k) => (
            <th scope="col" key={k} className="pb-2 pr-2 text-center font-medium">{CRITERION_LABEL[k]}</th>
          ))}
          <th scope="col" className="pb-2 pr-2 text-center font-medium">Competências</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-ink-800">
        {report.rows.map((r) => (
          <tr key={r.file}>
            <th scope="row" className="py-2 pr-3 font-medium text-ink-100">{r.name}</th>
            {r.missions.map((m) => (
              <td key={m.id} className="py-2 pr-2 text-center">
                {m.complete ? (
                  <Check className="mx-auto h-4 w-4 text-emerald-400" aria-label={`${m.code} concluída`} />
                ) : (
                  <span className="font-mono text-xs text-ink-400">{m.done ? `${m.done}/${m.total}` : '–'}</span>
                )}
              </td>
            ))}
            {CRITERIA.map((k) => {
              const v = r.best?.criteria[k];
              const low = v !== undefined && v < (k === 'seguranca' ? 100 : passScore);
              return (
                <td key={k} className={`py-2 pr-2 text-center font-mono ${low ? 'font-semibold text-rose-300' : 'text-ink-200'}`}>
                  {v ?? '–'}
                </td>
              );
            })}
            <td className="py-2 pr-2 text-center font-mono text-ink-200">{r.competencies}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/** Turma real: lê os arquivos exportados pelos alunos. Tudo fica na memória desta aba. */
export const ClassImportPanel: React.FC = () => {
  const { courseConfig } = useGameState();
  const [students, setStudents] = useState<{ file: string; profile: PlayerProfile }[]>([]);
  const [rejected, setRejected] = useState<{ file: string; error: string }[]>([]);
  const report = useMemo(() => classReport(students, courseConfig.passScore), [students, courseConfig.passScore]);

  const onFiles = async (list: FileList | null) => {
    if (!list) return;
    const files = Array.from(list).slice(0, MAX_FILES);
    const read = await Promise.all(files.map(async (f) => ({ file: f.name, res: parseImport(await f.text(), INITIAL_PROFILE, DEFAULT_CUSTOMIZATION) })));
    const bad: { file: string; error: string }[] = [];
    const good: { file: string; profile: PlayerProfile }[] = [];
    read.forEach(({ file, res }) => (res.ok ? good.push({ file, profile: res.profile }) : bad.push({ file, error: res.error })));
    setRejected(bad);
    setStudents((cur) => [...cur.filter((s) => !good.some((g) => g.file === s.file)), ...good]);
  };

  return (
    <div className="space-y-4">
      <p className="flex items-start gap-2 rounded-lg border border-ink-700 bg-ink-850 p-3 text-sm text-ink-300">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent-text" aria-hidden />
        <span>
          Os alunos exportam o progresso no Passaporte e entregam o arquivo. Ele é lido só nesta aba: nada é enviado a servidor, e fechar a aba apaga tudo. Mostra o que os exercícios registraram, não é nota oficial.
        </span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="btn-primary cursor-pointer">
          <Upload className="h-4 w-4" aria-hidden /> Importar arquivos dos alunos
          <input type="file" accept=".json,application/json" multiple className="sr-only" data-testid="class-files" onChange={(e) => { onFiles(e.target.files); e.target.value = ''; }} />
        </label>
        {students.length > 0 && (
          <button className="btn-ghost" onClick={() => { setStudents([]); setRejected([]); }}>
            <Trash2 className="h-4 w-4" aria-hidden /> Limpar
          </button>
        )}
      </div>
      {rejected.length > 0 && (
        <ul className="notice-warning block" role="status">
          {rejected.map((r) => (
            <li key={r.file}>{r.file}: {r.error}</li>
          ))}
        </ul>
      )}
      {students.length === 0 ? (
        <EmptyState title="Nenhum arquivo importado" message="Importe os arquivos da turma para ver missões, competências, avaliações e erros comuns." />
      ) : (
        <>
          <section aria-labelledby="mapa-turma" className="card p-4">
            <h2 id="mapa-turma" className="section-title mb-2">Turma: {students.length} {students.length === 1 ? 'aluno' : 'alunos'}</h2>
            <Heatmap report={report} passScore={courseConfig.passScore} />
            <p className="mt-2 text-xs text-ink-400">Notas da tentativa aprovada ou, sem aprovação, da última. Em destaque, abaixo do mínimo.</p>
          </section>
          <div className="grid gap-4 lg:grid-cols-2">
            <section aria-labelledby="erros-turma" className="card p-4">
              <h2 id="erros-turma" className="section-title mb-2">Erros mais comuns</h2>
              {report.mistakes.length ? (
                <ul className="divide-y divide-ink-800">
                  {report.mistakes.map((m) => (
                    <li key={m.text} className="py-2 text-sm">
                      <p className="font-medium text-ink-200">{m.text} <span className="font-normal text-ink-400">· {m.students} {m.students === 1 ? 'aluno' : 'alunos'}</span></p>
                      <p className="text-ink-300">{m.why}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-400">Nenhum erro registrado nas missões.</p>
              )}
            </section>
            <section aria-labelledby="comp-turma" className="card p-4">
              <h2 id="comp-turma" className="section-title mb-2">Competências demonstradas</h2>
              <ul className="space-y-1.5 text-sm">
                {report.competencies.map((c) => (
                  <li key={c.id} className="flex items-baseline justify-between gap-3">
                    <span className="text-ink-300">{c.title}</span>
                    <span className="shrink-0 font-mono text-ink-100">{c.students}/{students.length}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  );
};

const EMPTY_CARD = { prompt: '', correct: '', wrong1: '', wrong2: '', explanation: '' };

/** Controles do que a turma vê. Valem neste navegador e seguem para os alunos pelo link de turma. */
export const CourseControlsPanel: React.FC = () => {
  const { courseConfig, setCourseConfig } = useGameState();
  const [draft, setDraft] = useState(EMPTY_CARD);
  const [copied, setCopied] = useState(false);
  const set = (patch: Partial<CourseConfig>) => {
    setCourseConfig(normalizeCourseConfig({ ...courseConfig, ...patch }));
    setCopied(false);
  };
  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const link = `${window.location.origin}${window.location.pathname}#/turma/${encodeCourseConfig(courseConfig)}`;

  const addCard = (e: React.FormEvent) => {
    e.preventDefault();
    const card = {
      id: `inst-${Date.now()}`,
      from: 'os-01',
      prompt: draft.prompt,
      options: [draft.correct, draft.wrong1, draft.wrong2],
      explanation: draft.explanation
    };
    set({ customCards: [...courseConfig.customCards, card as unknown as CourseConfig['customCards'][number]] });
    setDraft(EMPTY_CARD);
  };

  return (
    <div className="space-y-4">
      <section aria-labelledby="ctrl-missoes" className="card p-4">
        <h2 id="ctrl-missoes" className="section-title">Missões publicadas</h2>
        <p className="mb-2 text-sm text-ink-400">Missão fora do ar some do mapa e deixa de travar a seguinte.</p>
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {MISSIONS.map((m) => (
            <li key={m.id}>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-200">
                <input type="checkbox" className="accent-[#c2410c]" data-publish={m.id} checked={!courseConfig.hiddenMissions.includes(m.id)} onChange={() => set({ hiddenMissions: toggle(courseConfig.hiddenMissions, m.id) })} />
                {m.code}: {m.title}
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="ctrl-nota" className="card grid gap-4 p-4 sm:grid-cols-2">
        <div>
          <h2 id="ctrl-nota" className="section-title">Avaliação prática</h2>
          <label htmlFor="nota-minima" className="field-label mt-2">Nota mínima por critério ({MIN_PASS} a {MAX_PASS})</label>
          <input id="nota-minima" type="number" min={MIN_PASS} max={MAX_PASS} step={5} className="input w-28" value={courseConfig.passScore} onChange={(e) => set({ passScore: Number(e.target.value) })} />
          <p className="mt-1 text-xs text-ink-400">Segurança continua exigindo 100. Decisão insegura reprova.</p>
        </div>
        <div>
          <label htmlFor="recado" className="field-label">Recado no topo das missões</label>
          <textarea id="recado" rows={3} maxLength={280} className="input" value={courseConfig.note} onChange={(e) => set({ note: e.target.value })} />
        </div>
      </section>

      <section aria-labelledby="ctrl-perguntas" className="card p-4">
        <h2 id="ctrl-perguntas" className="section-title">Perguntas da revisão</h2>
        {courseConfig.customCards.length > 0 && (
          <ul className="mt-2 divide-y divide-ink-800">
            {courseConfig.customCards.map((c) => (
              <li key={c.id} className="flex items-start justify-between gap-2 py-2 text-sm">
                <span className="text-ink-200">{c.prompt}</span>
                <button className="btn-ghost btn-sm" onClick={() => set({ customCards: courseConfig.customCards.filter((x) => x.id !== c.id) })} aria-label={`Remover: ${c.prompt}`}>
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={addCard} className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="q-prompt" className="field-label">Nova pergunta</label>
            <input id="q-prompt" className="input" required maxLength={240} value={draft.prompt} onChange={(e) => setDraft({ ...draft, prompt: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="q-correct" className="field-label">Resposta certa</label>
            <input id="q-correct" className="input" required maxLength={120} value={draft.correct} onChange={(e) => setDraft({ ...draft, correct: e.target.value })} />
          </div>
          <div>
            <label htmlFor="q-w1" className="field-label">Alternativa errada</label>
            <input id="q-w1" className="input" required maxLength={120} value={draft.wrong1} onChange={(e) => setDraft({ ...draft, wrong1: e.target.value })} />
          </div>
          <div>
            <label htmlFor="q-w2" className="field-label">Outra alternativa errada</label>
            <input id="q-w2" className="input" required maxLength={120} value={draft.wrong2} onChange={(e) => setDraft({ ...draft, wrong2: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="q-exp" className="field-label">Explicação mostrada depois da resposta</label>
            <input id="q-exp" className="input" required maxLength={300} value={draft.explanation} onChange={(e) => setDraft({ ...draft, explanation: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-secondary">Adicionar pergunta</button>
          </div>
        </form>
        <details className="mt-3">
          <summary className="cursor-pointer text-sm font-medium text-ink-200">Desligar cartões da jornada ({courseConfig.disabledCards.length})</summary>
          <ul className="mt-2 grid gap-1">
            {REVIEW_CARDS.map((c) => (
              <li key={c.id}>
                <label className="flex cursor-pointer items-start gap-2 text-sm text-ink-300">
                  <input type="checkbox" className="mt-0.5 accent-[#c2410c]" checked={!courseConfig.disabledCards.includes(c.id)} onChange={() => set({ disabledCards: toggle(courseConfig.disabledCards, c.id) })} />
                  {c.prompt}
                </label>
              </li>
            ))}
          </ul>
        </details>
      </section>

      <section aria-labelledby="ctrl-link" className="card p-4">
        <h2 id="ctrl-link" className="section-title">Link da turma</h2>
        <p className="mb-2 text-sm text-ink-400">Quem abre o link confirma e passa a usar esta configuração. É ajuste didático, não controle de acesso: o aluno pode alterar a própria cópia.</p>
        <div className="flex gap-2">
          <input aria-label="Link da turma" readOnly className="input font-mono text-xs" value={link} data-testid="class-link" onFocus={(e) => e.target.select()} />
          <button
            className="btn-secondary shrink-0"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(link);
                setCopied(true);
              } catch {
                setCopied(false);
              }
            }}
          >
            <Copy className="h-4 w-4" aria-hidden /> {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
      </section>
    </div>
  );
};
