// Grava o modo apresentação do Laboratório 3D em vídeo, quadro a quadro, em "tempo virtual".
//
// O relógio da página é do Playwright: cada quadro avança exatamente 1/FPS s e só então é fotografado.
// Por isso um computador lento (ou renderização 3D por software) deixa a gravação mais demorada,
// mas não deixa o vídeo travado.
//
// Uso (com o site rodando, ex.: `npx vite preview --port 4173`):
//   node scripts/media/capture-presentation.mjs [--url http://localhost:4173/] [--machine centrifugal-pump]
//        [--out saida/apresentacao] [--fps 30] [--size 1920x1080] [--legendas] [--chrome] [--gpu] [--seconds N]
//
// Saída em --out: frames/ (apagados no fim, salvo --keep-frames), apresentacao.mp4, apresentacao.srt, timeline.json.
// A narração entra se existir public/media/apresentacao/<máquina>/narracao.json (scripts/media/narrate-presentation.py).
import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const argv = process.argv.slice(2);
const opt = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : def;
};
const flag = (name) => argv.includes(`--${name}`);

const BASE = opt('url', 'http://localhost:4173/').replace(/\/?$/, '/');
const MACHINE = opt('machine', 'centrifugal-pump');
const OUT = path.resolve(opt('out', path.join(ROOT, 'saida', 'apresentacao')));
const FPS = Number(opt('fps', '30'));
const [W, H] = opt('size', '1920x1080').split('x').map(Number);
const LIMIT = Number(opt('seconds', '0')); // 0 = tudo (útil para prévia curta)
const DT = 1000 / FPS;
const FRAMES = path.join(OUT, 'frames');

// --gpu [vulkan|egl]: placa de vídeo (no Colab, uma das duas costuma funcionar); sem --gpu, SwiftShader (software).
const GPU_ARGS = {
  vulkan: ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--use-angle=vulkan', '--enable-features=Vulkan'],
  egl: ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--use-gl=angle', '--use-angle=gl-egl'],
};
const gpuMode = flag('gpu') ? opt('gpu', 'vulkan') : null;
if (gpuMode && !GPU_ARGS[gpuMode]) throw new Error(`--gpu ${gpuMode}: use vulkan ou egl`);
const launchArgs = gpuMode ? GPU_ARGS[gpuMode] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];

fs.rmSync(FRAMES, { recursive: true, force: true });
fs.mkdirSync(FRAMES, { recursive: true });

const browser = await chromium.launch({ channel: flag('chrome') ? 'chrome' : undefined, args: launchArgs });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, locale: 'pt-BR' });
await ctx.addInitScript(() => {
  localStorage.setItem('mecanica_lab_profile_v4', JSON.stringify({ name: 'Apresentação', onboardingCompleted: true }));
  localStorage.setItem('mecanica_lab_settings_v1', JSON.stringify({ graphicsQuality: 'high', reducedMotion: false }));
  const s = document.createElement('style');
  s.textContent = '*{caret-color:transparent!important}';
  document.addEventListener('DOMContentLoaded', () => document.head.appendChild(s));
});
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.clock.install();

const hash = `#/lab/${MACHINE}/apresentacao/gravacao${flag('legendas') ? '/legendas' : ''}`;
console.log('abrindo', BASE + hash);
await page.goto(BASE + hash, { waitUntil: 'domcontentloaded' });

// Carregamento: o relógio anda em passos curtos até o modelo e o roteiro ficarem prontos.
let ready = false;
for (let i = 0; i < 1200 && !ready; i++) {
  await page.clock.runFor(50);
  await page.waitForTimeout(20);
  ready = await page.evaluate(() => window.__presentation?.ready === true);
}
if (!ready) throw new Error('A apresentação não ficou pronta (o 3D carregou?). Erros: ' + errors.join(' | '));

const renderer = await page.evaluate(() => {
  const gl = document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl');
  const ext = gl && gl.getExtension('WEBGL_debug_renderer_info');
  return gl ? (ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)) : 'sem WebGL';
});
console.log('renderizador WebGL:', renderer);

const info = await page.evaluate(() => ({ total: window.__presentation.total, timeline: window.__presentation.timeline }));
const total = LIMIT > 0 ? Math.min(LIMIT, info.total) : info.total;
const nFrames = Math.ceil(total * FPS);
console.log(`gravando ${total.toFixed(1)} s = ${nFrames} quadros a ${FPS} fps (${W}x${H})`);

const t0 = Date.now();
for (let f = 0; f < nFrames; f++) {
  await page.screenshot({ path: path.join(FRAMES, `${String(f).padStart(6, '0')}.jpg`), type: 'jpeg', quality: 92 });
  await page.clock.runFor(DT);
  if (f % (FPS * 5) === 0) {
    const el = (Date.now() - t0) / 1000;
    const eta = f ? (el / f) * (nFrames - f) : 0;
    console.log(`  quadro ${f}/${nFrames}  (${el.toFixed(0)} s passados, faltam ~${eta.toFixed(0)} s)`);
  }
}
await browser.close();
if (errors.length) console.warn('erros na página durante a gravação:', errors);

// Linha do tempo e legendas (.srt)
fs.writeFileSync(path.join(OUT, 'timeline.json'), JSON.stringify(info.timeline, null, 2));
const srtTime = (s) => {
  const ms = Math.round(s * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`;
};
const cues = info.timeline.filter((e) => e.start < total);
fs.writeFileSync(
  path.join(OUT, 'apresentacao.srt'),
  cues.map((e, i) => `${i + 1}\n${srtTime(e.start + 0.2)} --> ${srtTime(Math.min(total, e.start + e.seconds - 0.2))}\n${e.caption}\n`).join('\n')
);

// Vídeo + narração (cada fala começa 0,3 s depois do início da sua tomada)
const LEAD = 0.3;
const audio = cues
  .filter((e) => e.audio)
  .map((e) => ({ file: path.join(ROOT, 'public', decodeURIComponent(new URL(e.audio, 'http://x/').pathname).replace(/^\//, '')), at: e.start + LEAD }))
  .filter((a) => fs.existsSync(a.file));
const ff = ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(FRAMES, '%06d.jpg')];
audio.forEach((a) => ff.push('-i', a.file));
if (audio.length) {
  const delays = audio.map((a, i) => `[${i + 1}:a]adelay=${Math.round(a.at * 1000)}:all=1[a${i}]`).join(';');
  const mix = audio.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${audio.length}:normalize=0,apad[aout]`;
  ff.push('-filter_complex', `${delays};${mix}`, '-map', '0:v', '-map', '[aout]', '-c:a', 'aac', '-b:a', '160k', '-shortest');
}
ff.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', path.join(OUT, 'apresentacao.mp4'));
console.log(`montando o vídeo com ffmpeg (${audio.length} falas)…`);
const r = spawnSync('ffmpeg', ff, { stdio: 'inherit' });
if (r.status !== 0) throw new Error('ffmpeg falhou');
if (!flag('keep-frames')) fs.rmSync(FRAMES, { recursive: true, force: true });
console.log('pronto:', path.join(OUT, 'apresentacao.mp4'));
