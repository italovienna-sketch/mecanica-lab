import { chromium, FullConfig } from '@playwright/test';

/**
 * Aquece o servidor de desenvolvimento antes dos testes: visita cada rota uma vez para o Vite compilar os módulos.
 * Sem isso, a primeira visita a uma tela pesada (lab 3D, ferramentas, cenas das aulas rápidas) pode passar dos 30 s
 * de espera dos testes numa máquina carregada, e o teste falha por tempo de compilação, não por defeito da tela.
 */
const ROUTES = [
  '#/',
  '#/missoes',
  '#/missoes/os-01',
  '#/desenho',
  '#/biblioteca',
  '#/cursos',
  '#/aula/lesson-centrifugal-pump',
  '#/aulas-rapidas',
  '#/praticar',
  '#/desafios',
  '#/industria',
  '#/industria/desenhos',
  '#/industria/bancada-pneumatica',
  '#/ferramentas',
  '#/progresso',
  '#/perfil',
  '#/instrutor',
  '#/lab/centrifugal-pump',
  '#/lab/conventional-lathe',
  '#/oficina'
];

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL as string;
  const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage();
  await page.addInitScript(() => localStorage.setItem('mecanica_lab_profile_v4', JSON.stringify({ name: 'Aquecimento', onboardingCompleted: true })));
  for (const route of ROUTES) {
    await page.goto(`${baseURL}/${route}`);
    // Espera a tela sair do "carregando" (ou desiste depois de 2 min: o teste da rota mostrará o problema).
    await page
      .waitForFunction(() => !document.body.innerText.includes('Carregando página') && !document.body.innerText.includes('Montando o modelo 3D'), null, {
        timeout: 120_000
      })
      .catch(() => {});
  }
  await browser.close();
}
