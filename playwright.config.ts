import { defineConfig, devices } from '@playwright/test';

/**
 * Testes de ponta a ponta do Mecânica Lab.
 * Rodar: npm run test:e2e   (sobe o servidor de desenvolvimento na porta 5181 e o aquece antes dos testes)
 * Usa o Google Chrome instalado na máquina (channel: 'chrome'), sem baixar navegadores.
 * O WebGL roda por software (SwiftShader) para funcionar também em máquinas sem GPU.
 */
const PORT = Number(process.env.E2E_PORT || 5181);

export default defineConfig({
  testDir: './tests/e2e',
  // Compila as telas uma vez antes dos testes (ver o arquivo).
  globalSetup: './tests/e2e/global-setup.ts',
  timeout: 180_000,
  expect: { timeout: 30_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: 'chrome',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1366, height: 820 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], channel: 'chrome' }, testMatch: /responsive\.spec\.ts/ }
  ],
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    // Servidor exclusivo dos testes (não reaproveita o "npm run dev"), com um código de instrutor só para e2e.
    reuseExistingServer: false,
    timeout: 120_000,
    env: { INSTRUCTOR_ACCESS_CODE: process.env.E2E_INSTRUCTOR_CODE || 'codigo-e2e-instrutor' }
  }
});
