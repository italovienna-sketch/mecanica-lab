// Mede carregamento por rota no build de produção. Uso: npx vite preview --port 4317 & node scripts/qa/perf-routes.mjs http://localhost:4317
import { chromium } from '@playwright/test';
const base = process.argv[2];
const routes = ['#/', '#/industria', '#/industria/desenhos', '#/industria/bancada-pneumatica', '#/lab/motor-gearbox', '#/lab/diaphragm-pump'];
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
for (const r of routes) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 820 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('mecanica_lab_profile_v4', JSON.stringify({ name: 'Perf', onboardingCompleted: true })));
  let js = 0, total = 0;
  page.on('response', async (res) => {
    try { const b = (await res.body()).length; total += b; if (res.url().endsWith('.js')) js += b; } catch {}
  });
  const t0 = Date.now();
  await page.goto(base + '/' + r, { waitUntil: 'networkidle' });
  if (r.startsWith('#/lab')) await page.waitForFunction(() => document.querySelector('canvas'), null, { timeout: 30000 });
  const t = Date.now() - t0;
  const nav = await page.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; const fcp = performance.getEntriesByName('first-contentful-paint')[0]; return { dcl: Math.round(n.domContentLoadedEventEnd), fcp: fcp ? Math.round(fcp.startTime) : null }; });
  console.log(`${r.padEnd(34)} JS ${(js / 1024).toFixed(0).padStart(5)} kB (sem gzip) | total ${(total / 1024).toFixed(0).padStart(6)} kB | FCP ${nav.fcp} ms | DCL ${nav.dcl} ms | networkidle ${t} ms`);
  await ctx.close();
}
await browser.close();
