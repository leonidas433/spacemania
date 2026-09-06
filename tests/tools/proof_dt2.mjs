// Métrica limpia y visible: cuánto tarda la nave en cruzar la pantalla
// y cuánto tarda una bala en llegar arriba, a distintas tasas de refresco.
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
const _here = dirname(fileURLToPath(import.meta.url));
const GAME_URL = pathToFileURL(resolve(_here, '../../index.html')).href;
const EXE = process.env.CHROMIUM_PATH || undefined;
const EXE = EXE;

async function run(label, args) {
  const b = await chromium.launch({ headless: true, executablePath: EXE, args });
  const p = await (await b.newContext({ viewport: { width: 1000, height: 700 } })).newPage();
  await p.addInitScript(() => localStorage.setItem('retro-game-mania.spacemania.firstgame', '0'));
  await p.goto(GAME_URL);
  await p.waitForFunction(() => typeof startGame === 'function');
  const r = await p.evaluate(() => new Promise(res => {
    startGame(false);
    enemies.forEach(e => e.shootTimer = 1e9);
    player.x = 22; keys['ArrowRight'] = true;
    const t0 = performance.now(); const f0 = frame;
    const iv = setInterval(() => {
      if (player.x >= 777) {
        clearInterval(iv); keys['ArrowRight'] = false;
        res({ ms: performance.now() - t0, frames: frame - f0 });
      }
    }, 1);
  }));
  await b.close();
  return { label, ...r };
}

const a = await run('vsync            ', []);
const b = await run('sin límite de fps', ['--disable-gpu-vsync', '--disable-frame-rate-limit']);
for (const r of [a, b]) {
  console.log(`${r.label} | cruzar la pantalla: ${Math.round(r.ms).toString().padStart(5)} ms | ${r.frames} fotogramas | ${(r.frames / (r.ms / 1000)).toFixed(0)} fps`);
}
console.log(`\nMismos ${a.frames} fotogramas de simulación en ambos casos: ${a.frames === b.frames ? 'SÍ' : 'no (' + a.frames + ' vs ' + b.frames + ')'}`);
console.log(`La nave cruza ${(a.ms / b.ms).toFixed(1)}x más rápido en tiempo real cuando el refresco sube.`);
