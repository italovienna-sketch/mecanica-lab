// Capturas de tela para revisão visual (QA). Uso:
//   node scripts/qa/shoot.mjs <saida-dir> <rota>[@larguraxaltura][#seletor] ...
// Ex.: node scripts/qa/shoot.mjs shots "/#/ferramentas/paquimetro" "/#/ferramentas/chave-boca@390x844"
// Usa o Chrome instalado (channel: 'chrome') e WebGL por software, igual aos testes e2e.
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.QA_BASE || 'http://localhost:5190';
const [outDir, ...routes] = process.argv.slice(2);
if (!outDir || routes.length === 0) {
  console.error('uso: node scripts/qa/shoot.mjs <saida-dir> <rota>[@WxH][#seletor] ...');
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });

const gpu = process.env.QA_GPU === '1';
const browser = await chromium.launch({
  channel: 'chrome',
  args: gpu ? ['--ignore-gpu-blocklist'] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
});

for (const spec of routes) {
  const m = spec.match(/^([^@]+?)(?:@(\d+)x(\d+))?(?:\|(.+))?$/);
  const route = m[1];
  const width = Number(m[2] || 1366);
  const height = Number(m[3] || 820);
  const selector = m[4];
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => {
    if (!localStorage.getItem('mecanica_lab_profile_v4')) {
      localStorage.setItem('mecanica_lab_profile_v4', JSON.stringify({ name: 'Revisão Visual', onboardingCompleted: true }));
    }
  });
  const page = await ctx.newPage();
  const errors = [];
  const failed = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  page.on('requestfailed', (r) => failed.push(`${r.url()} ${r.failure()?.errorText}`));
  page.on('response', (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url()}`));
  const t0 = Date.now();
  await page.goto(BASE + route, { waitUntil: 'load', timeout: 90_000 });
  await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
  // espera os indicadores de carregamento 3D sumirem
  await page.waitForFunction(() => !/Carregando modelo 3D|Montando o modelo 3D/.test(document.body.innerText), null, { timeout: 90_000 }).catch(() => {});
  await page.waitForTimeout(Number(process.env.QA_WAIT || 2500));
  const name = (route.replace(/[#/]+/g, '_').replace(/^_|_$/g, '') || 'home') + `_${width}x${height}` + (selector ? '_el' : '');
  const file = path.join(outDir, `${name}.png`);
  if (selector) await page.locator(selector).first().screenshot({ path: file });
  else await page.screenshot({ path: file, fullPage: process.env.QA_FULL === '1' });
  console.log(`${file}  (${Date.now() - t0} ms)`);
  if (errors.length) console.log('  erros de console:', errors);
  if (failed.length) console.log('  requisições com falha:', failed);
  await ctx.close();
}
await browser.close();
