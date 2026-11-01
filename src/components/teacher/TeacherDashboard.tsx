import React, { useEffect, useState } from 'react';
import { useGameState } from '../../context/GameStateContext';
import { TEACHER_DEMO_DATA } from '../../data/teacherDemoData';
import { InstructorSession } from '../../types/game';
import { Page, PageHeader, ProgressBar, LoadingState } from '../ui';
import { AlertTriangle, Box, Lock, LogOut, Search, ShieldCheck, Info } from 'lucide-react';
import { ClassImportPanel, CourseControlsPanel } from './ClassPanels';

/**
 * Área do instrutor.
 * A autorização é decidida SOMENTE pelo servidor (server/instructorAuth.ts):
 * - em desenvolvimento, pelo plugin do vite.config.ts;
 * - em produção, pela Netlify Function netlify/functions/instructor.ts.
 * Se o servidor não responder, o painel continua bloqueado — não existe código de acesso no navegador.
 */

type ServerReply = { ok: boolean; status: number; data: Record<string, unknown> | null };

/** Chama a API e só aceita respostas JSON (hospedagem sem servidor devolve HTML). */
async function callApi(url: string, init?: RequestInit): Promise<ServerReply> {
  const res = await fetch(url, init);
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  return { ok: res.ok && isJson, status: res.status, data: isJson ? await res.json() : null };
}

const UNAVAILABLE =
  'Não foi possível falar com o servidor de autenticação. A área do instrutor só funciona quando o site está publicado com o servidor configurado.';

const STATUS_STYLE: Record<string, string> = {
  Excelente: 'border-emerald-700/60 bg-emerald-950/40 text-emerald-300',
  'No Prazo': 'border-sky-700/60 bg-sky-950/40 text-sky-300',
  'Precisa Atenção': 'border-amber-700/60 bg-amber-950/40 text-amber-300'
};

const LoginGate: React.FC<{ initialError: string | null }> = ({ initialError }) => {
  const { navigateTo, setInstructorSession } = useGameState();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(initialError);
  const [busy, setBusy] = useState(false);
  const isLocalDev = import.meta.env.DEV && ['localhost', '127.0.0.1'].includes(window.location.hostname);

  const accept = (reply: ServerReply, fallbackError: string) => {
    if (reply.ok && reply.data?.authenticated) {
      setInstructorSession(reply.data as unknown as InstructorSession);
      setCode('');
    } else if (!reply.data) {
      setError(UNAVAILABLE);
    } else {
      setError(String(reply.data.error || fallbackError));
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const reply = await callApi('/api/instructor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instructorName: name, accessCode: code })
      });
      accept(reply, 'Acesso negado.');
    } catch {
      setError(UNAVAILABLE);
    } finally {
      setBusy(false);
    }
  };

  const devLogin = async () => {
    setError(null);
    setBusy(true);
    try {
      accept(await callApi('/api/instructor/dev-bootstrap', { method: 'POST' }), 'Acesso de desenvolvedor recusado.');
    } catch {
      setError(UNAVAILABLE);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page width="reading">
      <div className="card mx-auto max-w-md space-y-5 p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-800 text-ink-300">
            <Lock className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-xl font-bold text-ink-100">Área do instrutor</h1>
            <p className="mt-1 text-sm text-ink-300">
              Acompanhamento da turma. Para entrar, use o código de acesso fornecido pela coordenação do curso.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="instrutor-nome" className="mb-1 block text-sm font-medium text-ink-200">
              Seu nome
            </label>
            <input
              id="instrutor-nome"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2.5 text-sm text-ink-100 focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="instrutor-codigo" className="mb-1 block text-sm font-medium text-ink-200">
              Código de acesso
            </label>
            <input
              id="instrutor-codigo"
              type="password"
              autoComplete="current-password"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2.5 text-sm text-ink-100 focus:border-accent focus:outline-none"
            />
          </div>

          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-lg border border-rose-800/60 bg-rose-950/40 p-3 text-sm text-rose-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'Verificando…' : 'Entrar'}
          </button>
        </form>

        {isLocalDev && (
          <div className="space-y-2 border-t border-ink-800 pt-4">
            <p className="text-sm text-ink-400">
              Servidor de desenvolvimento: neste computador você pode entrar sem código (o servidor só aceita pedidos da própria máquina).
            </p>
            <button type="button" onClick={devLogin} disabled={busy} data-testid="instructor-dev-bootstrap-btn" className="btn-secondary w-full">
              <ShieldCheck className="h-4 w-4" aria-hidden />
              Entrar como desenvolvedor
            </button>
          </div>
        )}

        <button onClick={() => navigateTo('landing')} className="btn-ghost w-full">
          Voltar ao início
        </button>
      </div>
    </Page>
  );
};

export const TeacherDashboard: React.FC = () => {
  const { navigateTo, instructorSession, setInstructorSession, logoutInstructor } = useGameState();
  const [verified, setVerified] = useState<'checking' | 'yes' | 'no'>('checking');
  const [gateError, setGateError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState<'turma' | 'conteudo' | 'demo'>('turma');
  const stats = TEACHER_DEMO_DATA;

  // Toda abertura da página revalida o token no servidor. Sem resposta válida, o painel fica bloqueado.
  useEffect(() => {
    let cancelled = false;
    if (!instructorSession?.token) {
      setVerified('no');
      return;
    }
    setVerified('checking');
    callApi('/api/instructor/verify', { headers: { Authorization: `Bearer ${instructorSession.token}` } })
      .then((reply) => {
        if (cancelled) return;
        if (reply.ok && reply.data?.authenticated) {
          setVerified('yes');
          return;
        }
        setGateError(reply.data ? 'Sua sessão expirou. Entre novamente.' : UNAVAILABLE);
        setInstructorSession(null);
        setVerified('no');
      })
      .catch(() => {
        if (cancelled) return;
        setGateError(UNAVAILABLE);
        setInstructorSession(null);
        setVerified('no');
      });
    return () => {
      cancelled = true;
    };
  }, [instructorSession, setInstructorSession]);

  if (verified === 'checking') return <LoadingState label="Verificando acesso…" />;
  if (verified === 'no' || !instructorSession) return <LoginGate initialError={gateError} />;

  const TABS = [['turma', 'Turma real'], ['conteudo', 'Conteúdo'], ['demo', 'Demonstração']] as const;
  const q = searchTerm.toLowerCase();
  const filteredStudents = stats.students.filter((s) => s.name.toLowerCase().includes(q) || s.roleTitle.toLowerCase().includes(q));

  return (
    <Page>
      <PageHeader
        eyebrow="Área do instrutor"
        title="Acompanhamento da turma"
        description={`${stats.className} · Conectado como ${instructorSession.instructorName}`}
        actions={
          <button onClick={logoutInstructor} className="btn-secondary">
            <LogOut className="h-4 w-4" aria-hidden />
            Sair
          </button>
        }
      />

      <div role="tablist" aria-label="Área do instrutor" className="segmented mb-5">
        {TABS.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'turma' && <ClassImportPanel />}
      {tab === 'conteudo' && <CourseControlsPanel />}
      {tab === 'demo' && (
      <>
      <p className="mb-6 flex items-start gap-2 rounded-lg border border-amber-800/60 bg-amber-950/30 p-3 text-sm text-amber-200">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <span>
          <strong>Dados demonstrativos.</strong> Esta turma é fictícia: o progresso dos alunos fica salvo apenas no navegador de cada um e
          ainda não é enviado a um servidor.
        </span>
      </p>

      <section aria-label="Resumo da turma" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Alunos', value: String(stats.totalStudents), hint: stats.classCode },
          { label: 'Média nas avaliações', value: `${stats.averageQuizScore.toLocaleString('pt-BR')}%`, hint: 'Meta: 70%' },
          { label: 'Concluíram a missão 3D', value: `${stats.completionRatePercent}%`, hint: 'Bomba e redutor' },
          { label: 'Tempo médio de bancada', value: `${stats.averageDisassemblyTimeMinutes.toLocaleString('pt-BR')} min`, hint: 'Por atividade 3D' }
        ].map((m) => (
          <div key={m.label} className="card p-4">
            <p className="text-sm text-ink-400">{m.label}</p>
            <p className="mt-1 text-2xl font-bold text-ink-100">{m.value}</p>
            <p className="text-xs text-ink-500">{m.hint}</p>
          </div>
        ))}
      </section>

      <section className="card mb-6 flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink-100">Demonstrar em sala</h2>
          <p className="text-sm text-ink-400">Abra o laboratório 3D no projetor para mostrar a vista explodida e a sequência de desmontagem.</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button onClick={() => navigateTo('lab', 'centrifugal-pump')} className="btn-primary">
            <Box className="h-4 w-4" aria-hidden />
            Bomba centrífuga
          </button>
          <button onClick={() => navigateTo('lab', 'gearbox-reducer')} className="btn-secondary">
            Redutor
          </button>
        </div>
      </section>

      <section className="card mb-6 p-5">
        <h2 className="text-base font-semibold text-ink-100">Conceitos com mais dúvidas</h2>
        <p className="mb-4 text-sm text-ink-400">Sugestões de intervenção a partir das respostas da turma.</p>
        <ul className="space-y-3">
          {stats.missedConceptsList.map((c) => (
            <li key={c.concept} className="rounded-lg border border-ink-800 bg-ink-950 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-ink-100">{c.concept}</span>
                <span className="rounded-full border border-ink-700 px-2 py-0.5 text-xs text-ink-300">{c.errorRate}% de erros</span>
              </div>
              <p className="mt-1 text-sm text-ink-300">
                <span className="font-medium text-ink-200">Dica para a aula: </span>
                {c.pedagogicalTip}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-ink-100">Alunos</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden />
            <input
              type="search"
              aria-label="Buscar aluno"
              placeholder="Buscar aluno"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-ink-700 bg-ink-950 py-2 pl-9 pr-3 text-sm text-ink-100 focus:border-accent focus:outline-none sm:w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-800 text-ink-400">
                <th className="pb-2 font-medium">Aluno</th>
                <th className="pb-2 font-medium">Progresso</th>
                <th className="pb-2 font-medium">Avaliações</th>
                <th className="pb-2 font-medium">Revisar</th>
                <th className="pb-2 font-medium">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800">
              {filteredStudents.map((st) => (
                <tr key={st.id}>
                  <td className="py-3">
                    <span className="block font-medium text-ink-100">{st.name}</span>
                    <span className="text-xs text-ink-500">{st.roleTitle}</span>
                  </td>
                  <td className="w-40 py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={st.progressPercent} label={`Progresso de ${st.name}`} />
                      <span className="text-ink-300">{st.progressPercent}%</span>
                    </div>
                  </td>
                  <td className="py-3 text-ink-200">{st.quizScore}%</td>
                  <td className="py-3 text-ink-300">{st.criticalMistakeConcept || '—'}</td>
                  <td className="py-3">
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[st.status]}`}>{st.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStudents.length === 0 && <p className="py-6 text-center text-sm text-ink-400">Nenhum aluno encontrado.</p>}
        </div>
      </section>
      </>
      )}
    </Page>
  );
};
