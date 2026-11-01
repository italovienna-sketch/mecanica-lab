import { test, expect } from '@playwright/test';
import { withProfile } from './helpers';

const PANEL = 'Turma real';

test('área do instrutor exige autenticação no servidor', async ({ page, request }) => {
  await withProfile(page);
  await page.goto('/#/instrutor');
  await expect(page.getByTestId('instructor-dev-bootstrap-btn')).toBeVisible();
  await expect(page.getByRole('tab', { name: PANEL })).toHaveCount(0);

  // Token inventado é recusado pelo servidor
  const verify = await request.get('/api/instructor/verify', { headers: { Authorization: 'Bearer token-falso' } });
  expect(verify.status()).toBe(401);

  // Código de acesso errado é recusado
  const login = await request.post('/api/instructor/login', { data: { accessCode: 'chute' } });
  expect(login.status()).toBe(401);
});

test('código correto (variável de ambiente) entra; código errado mostra erro', async ({ page }) => {
  await withProfile(page);
  await page.goto('/#/instrutor');
  await page.getByLabel('Código de acesso').fill('chute-errado');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('incorreto');
  await expect(page.getByRole('tab', { name: PANEL })).toHaveCount(0);

  await page.getByLabel('Seu nome').fill('Profa. Teste');
  await page.getByLabel('Código de acesso').fill(process.env.E2E_INSTRUCTOR_CODE || 'codigo-e2e-instrutor');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('tab', { name: PANEL })).toBeVisible();
  await expect(page.getByText('Conectado como Profa. Teste')).toBeVisible();
});

test('manipular o sessionStorage não libera o painel do instrutor', async ({ page }) => {
  await withProfile(page);
  await page.addInitScript(() => {
    sessionStorage.setItem(
      'mecanica_lab_instructor_session_v1',
      JSON.stringify({ authenticated: true, instructorName: 'Falso', role: 'developer_admin', token: 'inventado', expiresAt: Date.now() + 3600_000 })
    );
  });
  await page.goto('/#/instrutor');
  await expect(page.getByTestId('instructor-dev-bootstrap-btn')).toBeVisible();
  await expect(page.getByRole('tab', { name: PANEL })).toHaveCount(0);
});

test('hospedagem sem servidor (resposta HTML) mantém o painel bloqueado, inclusive com o antigo código fixo', async ({ page }) => {
  await withProfile(page);
  await page.route('**/api/instructor/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><html></html>' })
  );
  await page.addInitScript(() => {
    sessionStorage.setItem(
      'mecanica_lab_instructor_session_v1',
      JSON.stringify({ authenticated: true, instructorName: 'Falso', role: 'developer_admin', token: 'static-cdn-1', expiresAt: Date.now() + 3600_000 })
    );
  });
  await page.goto('/#/instrutor');
  await expect(page.getByRole('alert')).toContainText('servidor de autenticação');
  await page.getByLabel('Código de acesso').fill('DEV-ADMIN');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('servidor de autenticação');
  await expect(page.getByRole('tab', { name: PANEL })).toHaveCount(0);
});

test('acesso de desenvolvedor funciona na própria máquina (loopback)', async ({ page }) => {
  await withProfile(page);
  await page.goto('/#/instrutor');
  await page.getByTestId('instructor-dev-bootstrap-btn').click();
  await expect(page.getByRole('tab', { name: PANEL })).toBeVisible();
});
