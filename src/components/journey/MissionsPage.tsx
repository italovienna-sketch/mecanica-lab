import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpenCheck, Compass, NotebookPen, Unlock } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import { decodeCourseConfig } from '../../data/journey/courseConfig';
import { JOURNEY_SKILL_LABEL } from '../../data/journey/meta';
import { MISSIONS, isMissionId, missionStatus, unlockHint } from '../../data/journey/missions';
import { dueCards } from '../../data/journey/review';
import { Dialog, EmptyState, Page, PageHeader } from '../ui';
import { MissionRunner } from './MissionRunner';
import { ProcessLine } from './ProcessLine';
import { ReviewSession } from './activities';
import { REVIEW_INTERVAL_TEXT } from './reviewText';

const REVIEW_SIZE = 5;

/** Convite de turma (#/turma/<código>): só aplica depois que o aluno confirma. */
const ClassInvite: React.FC<{ code: string }> = ({ code }) => {
  const { setCourseConfig, navigateTo, courseConfig } = useGameState();
  const config = useMemo(() => decodeCourseConfig(code), [code]);
  if (!config) {
    return <EmptyState title="Link de turma inválido" message="O link foi copiado pela metade ou é de outra versão. Peça um novo ao instrutor." action={<button className="btn-primary" onClick={() => navigateTo('missions', undefined, { replace: true })}>Ir para as missões</button>} />;
  }
  return (
    <Dialog
      open
      title="Aplicar a configuração da turma?"
      onClose={() => navigateTo('missions', undefined, { replace: true })}
      footer={
        <>
          <button className="btn-ghost" onClick={() => navigateTo('missions', undefined, { replace: true })}>
            Agora não
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              setCourseConfig(config);
              navigateTo('missions', undefined, { replace: true });
            }}
          >
            Aplicar
          </button>
        </>
      }
    >
      <p className="text-sm text-ink-300">
        O instrutor definiu nota mínima {config.passScore} na avaliação prática
        {config.hiddenMissions.length ? ` e ${config.hiddenMissions.length} missão(ões) fora do ar` : ''}
        {config.customCards.length ? `, com ${config.customCards.length} pergunta(s) própria(s)` : ''}. Seu progresso não muda.
        {courseConfig.note && ' A configuração atual será substituída.'}
      </p>
    </Dialog>
  );
};

const MistakeNotebook: React.FC = () => {
  const { playerProfile } = useGameState();
  const open = playerProfile.journey.mistakes.filter((m) => !m.resolvedAt).slice(-5).reverse();
  if (!open.length) return null;
  return (
    <section aria-labelledby="caderno" className="card p-4">
      <h2 id="caderno" className="section-title flex items-center gap-2">
        <NotebookPen className="h-[18px] w-[18px] text-accent-text" aria-hidden /> Caderno de erros
      </h2>
      <p className="mt-0.5 text-sm text-ink-400">Onde você tropeçou, com o raciocínio. Sai daqui quando você acertar a mesma atividade.</p>
      <ul className="mt-2 divide-y divide-ink-800">
        {open.map((m) => (
          <li key={m.id} className="py-2 text-sm">
            <p className="font-medium text-ink-200">{m.text}</p>
            <p className="text-ink-300">{m.why}</p>
            <p className="text-xs text-ink-400">{m.area} · {JOURNEY_SKILL_LABEL[m.skill as keyof typeof JOURNEY_SKILL_LABEL] ?? m.skill}{m.count > 1 ? ` · ${m.count} vezes` : ''}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export const MissionsPage: React.FC = () => {
  const { activeParam, playerProfile, navigateTo, courseConfig, setLastActivity } = useGameState();
  const now = useMemo(() => Date.now(), []);
  const due = useMemo(() => dueCards(playerProfile, now, courseConfig.customCards, courseConfig.disabledCards), [playerProfile, now, courseConfig]);
  const [session, setSession] = useState<typeof due | null>(null);

  useEffect(() => {
    setLastActivity('missions', 'Missões da bomba P-101');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeParam !== 'revisao') setSession(null);
    else if (!session) setSession(due.slice(0, REVIEW_SIZE));
  }, [activeParam]); // eslint-disable-line react-hooks/exhaustive-deps

  if (activeParam === 'revisao') {
    return (
      <Page width="reading">
        <PageHeader title="Revisão do dia" description="Lembrar sem consultar. Errar aqui não tira nada: o cartão só volta mais cedo." />
        <div className="card p-4 sm:p-5">
          {session && session.length ? (
            <ReviewSession cards={session} onExit={() => navigateTo('missions')} />
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-ink-300">Nenhum cartão vence hoje. {REVIEW_INTERVAL_TEXT}</p>
              <button className="btn-primary" onClick={() => navigateTo('missions')}>Voltar às missões</button>
            </div>
          )}
        </div>
      </Page>
    );
  }

  if (isMissionId(activeParam)) {
    const mission = MISSIONS.find((m) => m.id === activeParam)!;
    const status = missionStatus(mission, playerProfile, courseConfig);
    if (status === 'bloqueada' || status === 'oculta') {
      const hint = unlockHint(playerProfile, courseConfig);
      return (
        <Page>
          <EmptyState
            title={status === 'oculta' ? 'Esta missão está fora do ar para a sua turma' : `${mission.code} ainda não foi aberta`}
            message={status === 'bloqueada' && hint ? `O que falta: ${hint.needs}` : 'O instrutor pode reabri-la.'}
            action={<button className="btn-primary" onClick={() => navigateTo('missions')}>Voltar ao mapa</button>}
          />
        </Page>
      );
    }
    return (
      <Page>
        <MissionRunner key={mission.id} mission={mission} />
      </Page>
    );
  }

  const hint = unlockHint(playerProfile, courseConfig);
  const inviteCode = activeParam?.startsWith('turma:') ? activeParam.slice(6) : null;

  return (
    <Page>
      {inviteCode && <ClassInvite code={inviteCode} />}
      <PageHeader
        title="Missões da bomba P-101"
        description="Seis ordens de serviço sobre a mesma bomba, do primeiro contato até uma avaliação sem roteiro. A P-101 é fictícia, da planta-escola; o raciocínio é o da oficina."
      />
      {courseConfig.note && (
        <p className="notice mb-4">
          <span>
            <strong className="text-ink-100">Recado do instrutor: </strong>
            {courseConfig.note}
          </span>
        </p>
      )}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <ProcessLine profile={playerProfile} config={courseConfig} onOpen={(m) => navigateTo('missions', m.id)} />
        <aside className="space-y-4">
          <section aria-labelledby="revisao-dia" className="card p-4">
            <h2 id="revisao-dia" className="section-title flex items-center gap-2">
              <BookOpenCheck className="h-[18px] w-[18px] text-accent-text" aria-hidden /> Revisão do dia
            </h2>
            {due.length ? (
              <>
                <p className="mt-1 text-sm text-ink-300">{due.length} {due.length === 1 ? 'cartão vence' : 'cartões vencem'} hoje. Até {REVIEW_SIZE} por sessão, cerca de 2 minutos.</p>
                <button className="btn-primary btn-sm mt-3" onClick={() => navigateTo('missions', 'revisao')}>
                  Começar <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </>
            ) : (
              <p className="mt-1 text-sm text-ink-300">Nada para hoje. {REVIEW_INTERVAL_TEXT}</p>
            )}
          </section>
          {hint && (
            <section aria-labelledby="proxima-os" className="card p-4">
              <h2 id="proxima-os" className="section-title flex items-center gap-2">
                <Unlock className="h-[18px] w-[18px] text-accent-text" aria-hidden /> Para abrir a {hint.mission.code}
              </h2>
              <p className="mt-1 text-sm text-ink-300">{hint.needs}</p>
            </section>
          )}
          <section aria-labelledby="exploracao" className="card p-4">
            <h2 id="exploracao" className="section-title flex items-center gap-2">
              <Compass className="h-[18px] w-[18px] text-accent-text" aria-hidden /> Exploração livre
            </h2>
            <p className="mt-1 text-sm text-ink-300">Fora das missões, nada é avaliado e nada fica trancado.</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              <button className="link" onClick={() => navigateTo('lab', 'centrifugal-pump')}>Laboratório 3D</button>
              <button className="link" onClick={() => navigateTo('drawing')}>Oficina de Desenho</button>
              <button className="link" onClick={() => navigateTo('library')}>Biblioteca</button>
            </div>
          </section>
          <MistakeNotebook />
        </aside>
      </div>
    </Page>
  );
};
