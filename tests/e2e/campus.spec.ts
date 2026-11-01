import { test, expect, Page } from '@playwright/test';
import { collectErrors, readProfile, withProfile } from './helpers';
import {
  ROOMS,
  Rect,
  SOLID_WALLS,
  SPAWN,
  STATIONS,
  doorGate,
  isWalkable,
  missingPpe,
  nearestStation,
  ppeFix,
  roomEntrance
} from '../../src/game/campusLayout';

/* ───────────── Planta (funções puras, sem navegador) ───────────── */

/** Pontos alcançáveis a partir da entrada, numa malha de 8 px (busca em largura). */
function reachable(extraSolids: Rect[]) {
  const step = 8;
  const start: [number, number] = [Math.round(SPAWN.x / step) * step, Math.round(SPAWN.y / step) * step];
  const seen = new Set([start.join()]);
  const queue = [start];
  while (queue.length) {
    const [x, y] = queue.shift()!;
    for (const [dx, dy] of [[step, 0], [-step, 0], [0, step], [0, -step]]) {
      const n: [number, number] = [x + dx, y + dy];
      if (!seen.has(n.join()) && isWalkable(n[0], n[1], extraSolids)) {
        seen.add(n.join());
        queue.push(n);
      }
    }
  }
  const points = [...seen].map((k) => k.split(',').map(Number));
  return (sx: number, sy: number) => points.some(([x, y]) => Math.hypot(x - sx, y - sy) < 24);
}

test.describe('planta do campus', () => {
  test('estações e entradas ficam em piso livre, e cada estação é a mais próxima de si mesma', () => {
    expect(isWalkable(SPAWN.x, SPAWN.y)).toBe(true);
    for (const s of STATIONS) {
      expect(isWalkable(s.x, s.y), s.id).toBe(true);
      expect(nearestStation(s.x, s.y)?.id, s.id).toBe(s.id);
    }
    for (const r of ROOMS) {
      const e = roomEntrance(r.id);
      expect(isWalkable(e.x, e.y), r.id).toBe(true);
    }
  });

  test('paredes bloqueiam; com a porta de EPI fechada nenhuma estação da oficina é alcançável', () => {
    const wall = SOLID_WALLS[0];
    expect(isWalkable(wall.x + wall.w / 2, wall.y + wall.h / 2)).toBe(false);
    const oficina = ROOMS.find((r) => r.id === 'oficina')!;
    const open = reachable([]);
    const closed = reachable([doorGate(oficina)!]);
    for (const s of STATIONS) expect(open(s.x, s.y), `${s.id} alcançável`).toBe(true);
    for (const s of STATIONS.filter((st) => st.roomId === 'oficina')) expect(closed(s.x, s.y), `${s.id} bloqueada`).toBe(false);
    for (const s of STATIONS.filter((st) => st.roomId !== 'oficina')) expect(closed(s.x, s.y), `${s.id} continua livre`).toBe(true);
  });

  test('regras de EPI por contexto', () => {
    const base = { hasSafetyGlasses: true, shoeStyle: 'bota_composite' as const, accessoryType: 'nenhum' as const };
    const req = ROOMS.find((r) => r.id === 'oficina')!.ppe!;
    expect(missingPpe(base, req)).toEqual([]);
    expect(missingPpe({ ...base, hasSafetyGlasses: false, shoeStyle: 'tenis_escolar' }, req)).toEqual(['oculos', 'calcado']);
    expect(missingPpe({ ...base, accessoryType: 'colar_alt' }, req)).toEqual(['sem_adornos']);
    expect(missingPpe({ ...base, accessoryType: 'relogio_tecnico' }, req)).toEqual(['sem_adornos']);
    // O crachá não entra na regra de adornos; sala sem exigência não pede nada.
    expect(missingPpe({ ...base, accessoryType: 'cracha_escolar' }, req)).toEqual([]);
    expect(missingPpe({ ...base, hasSafetyGlasses: false }, ROOMS.find((r) => r.id === 'biblioteca')!.ppe)).toEqual([]);
    expect(ppeFix(['calcado', 'sem_adornos'])).toEqual({ shoeStyle: 'bota_composite', accessoryType: 'nenhum' });
  });
});

/* ───────────── No navegador ───────────── */

const map = (page: Page) => page.getByTestId('campus-canvas');
const posOf = async (page: Page) => ({
  x: Number(await map(page).getAttribute('data-x')),
  y: Number(await map(page).getAttribute('data-y'))
});

async function hold(page: Page, key: string, ms: number) {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
  await page.waitForTimeout(250);
}

async function openCampus(page: Page) {
  await withProfile(page);
  await page.goto('/#/oficina');
  await expect(page.getByText('Montando o mapa do campus…')).toHaveCount(0, { timeout: 60_000 });
  await expect(map(page)).toHaveAttribute('data-area', 'convivencia');
}

test('campus: teclado anda, a parede segura, a porta pede EPI e a estação abre o laboratório', async ({ page }) => {
  const errors = collectErrors(page);
  await openCampus(page);
  await map(page).focus();

  // Para a esquerda até os armários do vestiário: a posição para de mudar (não atravessa).
  const start = await posOf(page);
  await hold(page, 'ArrowLeft', 2500);
  const atWall = await posOf(page);
  expect(atWall.x).toBeLessThan(start.x);
  expect(atWall.x).toBeGreaterThan(584); // armários vão até x = 584
  await hold(page, 'ArrowLeft', 600);
  expect((await posOf(page)).x).toBe(atWall.x);

  // Atalho do minimapa até a porta da oficina (S1). Subindo, a faixa de EPI bloqueia: o tênis escolar não é calçado de segurança.
  await page.getByRole('button', { name: /S1 Oficina mecânica/ }).click();
  await map(page).focus();
  await hold(page, 'ArrowUp', 900);
  const dialog = page.getByRole('dialog', { name: 'Oficina mecânica: entrada com EPI' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Calçado de segurança');
  await expect(map(page)).toHaveAttribute('data-area', 'corredor');

  await dialog.getByRole('button', { name: 'Vestir o que falta' }).click();
  await expect(dialog).toHaveCount(0);
  await expect.poll(async () => (await readProfile(page)).customization?.shoeStyle).toBe('bota_composite');

  // Com o EPI a porta abre: sobe até a bancada do redutor.
  await map(page).focus();
  await hold(page, 'ArrowUp', 1700);
  await expect(map(page)).toHaveAttribute('data-area', 'oficina');
  await expect(page.getByTestId('campus-prompt')).toContainText('Redutor de engrenagens (3D)');

  await page.keyboard.press('e');
  await expect(page).toHaveURL(/#\/lab\/gearbox-reducer/);
  expect(errors).toEqual([]);
});

test('campus no celular: os controles de toque andam e o convite tem botão Abrir', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openCampus(page);
  const pad = page.getByTestId('campus-touchpad');
  await expect(pad).toBeVisible();
  const before = await posOf(page);
  const box = (await pad.getByRole('button', { name: 'Andar para a esquerda' }).boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(900);
  await page.mouse.up();
  await page.waitForTimeout(250);
  expect((await posOf(page)).x).toBeLessThan(before.x - 60);
  // Perto do vestiário aparece o convite, com botão (sem depender de teclado).
  const prompt = page.getByTestId('campus-prompt');
  await expect(prompt).toContainText('Vestiário');
  await prompt.getByRole('button', { name: 'Abrir' }).click();
  await expect(page).toHaveURL(/#\/perfil/);
});
