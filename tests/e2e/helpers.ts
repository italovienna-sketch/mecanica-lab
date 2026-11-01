import { Page, expect } from '@playwright/test';

export const PROFILE_KEY = 'mecanica_lab_profile_v4';

/** Começa com um perfil já criado (pula o onboarding), sem progresso. */
export async function withProfile(page: Page, extra: Record<string, unknown> = {}) {
  await page.addInitScript(
    ([key, data]) => {
      if (!sessionStorage.getItem('__e2e_seeded')) {
        localStorage.clear();
        localStorage.setItem(key as string, JSON.stringify({ name: 'Aluno Teste', onboardingCompleted: true, ...(data as object) }));
        sessionStorage.setItem('__e2e_seeded', '1');
      }
    },
    [PROFILE_KEY, extra] as const
  );
}

export async function readProfile(page: Page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '{}'), PROFILE_KEY);
}

/** Coleta erros de console e exceções da página para checagem no fim do teste. */
export function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });
  return errors;
}

export async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => {
    const main = document.getElementById('conteudo');
    return {
      doc: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      main: main ? main.scrollWidth - main.clientWidth : 0
    };
  });
  expect(overflow.doc, 'rolagem horizontal no documento').toBeLessThanOrEqual(1);
  expect(overflow.main, 'rolagem horizontal no conteúdo').toBeLessThanOrEqual(1);
}

/** Espera o modelo 3D terminar de carregar. */
export async function waitFor3D(page: Page) {
  await page.locator('canvas').first().waitFor({ timeout: 120_000 });
  await expect(page.getByText('Montando o modelo 3D…')).toHaveCount(0, { timeout: 120_000 });
}

/**
 * Fração de pixels "acesos" (não quase pretos) em uma captura do elemento.
 * Usado para detectar tela preta em canvas (WebGL não permite ler o buffer diretamente).
 */
export async function litRatio(page: Page, selector: string): Promise<number> {
  const png = await page.locator(selector).first().screenshot();
  return page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = 160;
    c.height = 100;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(img, 0, 0, 160, 100);
    const d = ctx.getImageData(0, 0, 160, 100).data;
    let lit = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] > 150) lit++;
    return lit / (160 * 100);
  }, png.toString('base64'));
}

/** Diferença média de pixels entre duas capturas (0 = idênticas). */
export async function imageDiff(page: Page, a: Buffer, b: Buffer): Promise<number> {
  return page.evaluate(
    async ([x, y]) => {
      const load = async (b64: string) => {
        const img = new Image();
        img.src = `data:image/png;base64,${b64}`;
        await img.decode();
        const c = document.createElement('canvas');
        c.width = 120;
        c.height = 80;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(img, 0, 0, 120, 80);
        return ctx.getImageData(0, 0, 120, 80).data;
      };
      const [da, db] = [await load(x), await load(y)];
      let sum = 0;
      for (let i = 0; i < da.length; i += 4) sum += Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]);
      return sum / (120 * 80 * 3 * 255);
    },
    [a.toString('base64'), b.toString('base64')] as const
  );
}
