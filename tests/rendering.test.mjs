// Escalado del lienzo y detección de modo ahorro en dispositivos reales.
import { devices } from 'playwright';
import { launch, gamePage } from './lib/harness.mjs';

export const name = 'rendering';

export default async function run(r) {
  const browser = await launch();

  // Escritorio de alta densidad: se dibuja al doble de resolución
  let p = await gamePage(browser, {}, { viewport: { width: 1200, height: 800 }, deviceScaleFactor: 2 });
  const hi = await p.evaluate(() => ({
    low: LOW_FX, dpr: C._dpr, w: C.width, h: C.height,
    css: C.getBoundingClientRect().width,
  }));
  r.t('en alta densidad no entra el modo ahorro', hi.low === false);
  r.t('el lienzo se dibuja al doble de resolución', hi.dpr === 2 && hi.w === 1600 && hi.h === 860);
  r.t('el tamaño en pantalla no cambia', hi.css > 780 && hi.css <= 800);
  await p.evaluate(() => { startGame(false); for (let i = 0; i < 20; i++) spawnParticles(200 + i * 10, 200, '#f84', 8); });
  await p.waitForTimeout(400);
  await p.evaluate(() => { state = 'menu'; showGallery(); });
  await p.waitForTimeout(300);
  r.t('la Galería sigue dibujando sus miniaturas',
    await p.evaluate(() => document.querySelectorAll('.gal-card canvas').length > 0));
  const errsA = p.errors;
  await p.ctx.close();

  // Móvil: modo ahorro y sin sobre-render
  p = await gamePage(browser, {}, { ...devices['Pixel 5'] });
  const mob = await p.evaluate(() => ({ low: LOW_FX, coarse: IS_COARSE, dpr: C._dpr, w: C.width }));
  r.t('en móvil se activa el modo ahorro', mob.low === true && mob.coarse === true);
  r.t('en móvil no se sobre-renderiza', mob.dpr === 1 && mob.w === 800);
  await p.evaluate(() => startGame(false));
  await p.waitForTimeout(700);
  r.t('el juego corre en móvil', await p.evaluate(() => frame > 10));

  const errs = [...errsA, ...p.errors];
  r.t('sin errores de JavaScript', errs.length === 0);
  if (errs.length) r.note(errs.slice(0, 3).join(' | '));
  await browser.close();
}
