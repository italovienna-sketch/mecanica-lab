import React, { Suspense, lazy, useLayoutEffect, useRef } from 'react';
import { GameStateProvider, useGameState } from './context/GameStateContext';
import { CompactNav, Sidebar, SkipLink, Toasts } from './components/shell/AppShell';
import { LandingScreen } from './components/LandingScreen';
import { LoadingState, ErrorState } from './components/ui';
import { GameScreen } from './types/game';

const CharacterCustomizer = lazy(() =>
  import('./components/character/CharacterCustomizer').then((m) => ({ default: m.CharacterCustomizer }))
);
const WorkshopCanvas = lazy(() => import('./components/WorkshopCanvas').then((m) => ({ default: m.WorkshopCanvas })));
const MechanicalLab3D = lazy(() => import('./components/lab/MechanicalLab3D').then((m) => ({ default: m.MechanicalLab3D })));
const MechanicalToolsLab = lazy(() =>
  import('./components/tools/MechanicalToolsLab').then((m) => ({ default: m.MechanicalToolsLab }))
);
const QuizEngine = lazy(() => import('./components/quiz/QuizEngine').then((m) => ({ default: m.QuizEngine })));
const CoursesPage = lazy(() => import('./components/courses/CoursesPage').then((m) => ({ default: m.CoursesPage })));
const PracticePage = lazy(() => import('./components/practice/PracticePage').then((m) => ({ default: m.PracticePage })));
const StudentProgressView = lazy(() =>
  import('./components/progress/StudentProgressView').then((m) => ({ default: m.StudentProgressView }))
);
const TeacherDashboard = lazy(() =>
  import('./components/teacher/TeacherDashboard').then((m) => ({ default: m.TeacherDashboard }))
);
const MicroLessonsPage = lazy(() => import('./components/micro/MicroLessonsPage').then((m) => ({ default: m.MicroLessonsPage })));
const IndustryPage = lazy(() => import('./components/industry/IndustryPage').then((m) => ({ default: m.IndustryPage })));
const GamesPage = lazy(() => import('./components/games/GamesPage').then((m) => ({ default: m.GamesPage })));
const DiagnosisPage = lazy(() => import('./components/diagnosis/DiagnosisPage').then((m) => ({ default: m.DiagnosisPage })));
const MachineExplorer = lazy(() => import('./components/machine/MachineExplorer').then((m) => ({ default: m.MachineExplorer })));
const MissionsPage = lazy(() => import('./components/journey/MissionsPage').then((m) => ({ default: m.MissionsPage })));
const DrawingPage = lazy(() => import('./components/drawing/DrawingPage').then((m) => ({ default: m.DrawingPage })));
const LibraryPage = lazy(() => import('./components/library/LibraryPage').then((m) => ({ default: m.LibraryPage })));
const OnboardingScreen = lazy(() =>
  import('./components/onboarding/OnboardingScreen').then((m) => ({ default: m.OnboardingScreen }))
);

/** Telas que ocupam toda a área útil (sem rolagem da página). */
const FULL_BLEED: GameScreen[] = ['workshop', 'lab'];
/** Superfícies técnicas: sempre no tema escuro, qualquer que seja a preferência (o modelo fica em destaque). */
const DARK_SURFACE: GameScreen[] = ['workshop', 'lab'];

interface BoundaryProps {
  resetKey: string;
  onGoHome: () => void;
  children: React.ReactNode;
}

/**
 * Evita a "tela preta": qualquer erro de renderização ou falha ao baixar um módulo
 * mostra uma mensagem compreensível com opções de recuperação.
 */
class RouteErrorBoundary extends React.Component<BoundaryProps, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('[Mecânica Lab] Erro ao exibir a página:', error);
  }

  componentDidUpdate(prev: BoundaryProps) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    const isChunkError = /dynamically imported module|Loading chunk|Failed to fetch/i.test(this.state.error.message);
    return (
      <div className="flex h-full items-center justify-center p-6">
        <ErrorState
          title={isChunkError ? 'Não foi possível carregar esta página' : 'Algo deu errado nesta página'}
          message={
            isChunkError
              ? 'A conexão falhou ao baixar uma parte do aplicativo. Verifique a internet e tente de novo.'
              : 'Seu progresso continua salvo. Você pode tentar novamente ou voltar ao início.'
          }
          action={
            <div className="flex flex-wrap gap-2">
              <button className="btn-primary" onClick={() => (isChunkError ? window.location.reload() : this.setState({ error: null }))}>
                Tentar novamente
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  this.setState({ error: null });
                  this.props.onGoHome();
                }}
              >
                Ir para o início
              </button>
            </div>
          }
        />
      </div>
    );
  }
}

const NotFound: React.FC = () => {
  const { navigateTo } = useGameState();
  return (
    <div className="flex h-full items-center justify-center p-6">
      <ErrorState
        title="Página não encontrada"
        message="O endereço digitado não existe ou mudou de lugar. Use o menu para continuar estudando."
        action={
          <button className="btn-primary" onClick={() => navigateTo('landing', undefined, { replace: true })}>
            Voltar ao início
          </button>
        }
      />
    </div>
  );
};

const MainContent: React.FC = () => {
  const { currentScreen, activeParam, playerProfile, navigateTo } = useGameState();
  const needsOnboarding = !playerProfile.onboardingCompleted && currentScreen !== 'teacher';
  const fullBleed = !needsOnboarding && FULL_BLEED.includes(currentScreen);
  const mainRef = useRef<HTMLElement>(null);

  // Quem rola é o <main>, não a janela: sem isto a tela nova abre na altura em que a anterior estava. Numa tela
  // cheia (oficina, laboratório: overflow-hidden) o conteúdo ficava deslocado para fora e sobrava só o fundo escuro.
  useLayoutEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [currentScreen, activeParam, needsOnboarding]);

  const renderScreen = () => {
    if (needsOnboarding) return <OnboardingScreen />;
    switch (currentScreen) {
      case 'landing':
        return <LandingScreen />;
      case 'missions':
        return <MissionsPage />;
      case 'drawing':
        return <DrawingPage />;
      case 'library':
        return <LibraryPage />;
      case 'courses':
        return <CoursesPage />;
      case 'quiz':
        return <QuizEngine />;
      case 'practice':
        return <PracticePage />;
      case 'micro':
        return <MicroLessonsPage />;
      case 'games':
        return <GamesPage />;
      case 'industry':
        return <IndustryPage />;
      case 'diagnosis':
        return <DiagnosisPage />;
      case 'machine':
        return <MachineExplorer />;
      case 'character':
        return <CharacterCustomizer />;
      case 'workshop':
        return <WorkshopCanvas />;
      case 'lab':
        return <MechanicalLab3D />;
      case 'tools':
        return <MechanicalToolsLab />;
      case 'progress':
        return <StudentProgressView />;
      case 'teacher':
        return <TeacherDashboard />;
      default:
        return <NotFound />;
    }
  };

  const darkSurface = !needsOnboarding && DARK_SURFACE.includes(currentScreen);

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-ink-950">
      {!needsOnboarding && <SkipLink />}
      {!needsOnboarding && <Sidebar />}
      <div className="flex min-w-0 flex-1 flex-col">
        {!needsOnboarding && <CompactNav />}
        <main
          ref={mainRef}
          id="conteudo"
          tabIndex={-1}
          data-theme={darkSurface ? 'dark' : undefined}
          className={`relative w-full flex-1 bg-ink-950 outline-none ${
            fullBleed ? `overflow-hidden ${needsOnboarding ? '' : 'pb-[calc(56px+env(safe-area-inset-bottom))] md:pb-0'}` : 'overflow-y-auto'
          }`}
        >
          <RouteErrorBoundary resetKey={`${currentScreen}/${activeParam ?? ''}`} onGoHome={() => navigateTo('landing')}>
            <Suspense fallback={<LoadingState label="Carregando página…" />}>{renderScreen()}</Suspense>
          </RouteErrorBoundary>
        </main>
      </div>
      {!needsOnboarding && <Toasts />}
    </div>
  );
};

export const App: React.FC = () => (
  <GameStateProvider>
    <MainContent />
  </GameStateProvider>
);

export default App;
