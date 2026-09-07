// Reloj de simulación: la velocidad del juego debe depender del tiempo real,
// no de la tasa de refresco de la pantalla.
//
// Regresión del fallo que tenía el juego hasta la v3.2.0: la simulación
// avanzaba un paso por refresco, así que un monitor de 144 Hz corría 2,4 veces
// más rápido que uno de 60 Hz.
import { launch, gamePage } from './lib/harness.mjs';

export const name = 'clock';

const UNCAPPED = ['--disable-gpu-vsync', '--disable-frame-rate-limit'];

/** Cuánto tarda la nave en cruzar la pantalla y a qué ritmo avanza el reloj. */
async function measure(args) {
  const browser = await launch(args ? { args } : {});
  const p = await gamePage(browser);
  const r = await p.evaluate(() => new Promise(res => {
    startGame(false);
    enemies.forEach(e => e.shootTimer = 1e9);   // nadie dispara: aislar el reloj
    player.x = 22; keys['ArrowRight'] = true;
    const wall0 = performance.now(), sim0 = frame;
    const iv = setInterval(() => {
      if (player.x >= 777) {
        clearInterval(iv); keys['ArrowRight'] = false;
        const ms = performance.now() - wall0;
        res({ ms, simFrames: frame - sim0, renderFps: null, dt: DT });
      }
    }, 1);
  }));
  const rate = await p.evaluate(() => new Promise(res => {
    const wall0 = performance.now(), sim0 = frame;
    let ticks = 0;
    const _raf = window.requestAnimationFrame;
    const count = () => { ticks++; _raf(count); };
    _raf(count);
    setTimeout(() => res({
      simPerSec: (frame - sim0) / ((performance.now() - wall0) / 1000),
      renderPerSec: ticks / ((performance.now() - wall0) / 1000),
    }), 1500);
  }));
  const errors = p.errors.slice();
  await browser.close();
  return { ...r, ...rate, errors };
}

export default async function run(r) {
  // ── Comprobaciones deterministas del reloj ─────────────────
  const browser = await launch();
  const p = await gamePage(browser);

  r.t('a 60 fps el paso vale 1', await p.evaluate(() => {
    _lastTs = 0; advanceClock(1000); advanceClock(1000 + 1000 / 60);
    return Math.abs(DT - 1) < 0.001;
  }));
  r.t('al doble de refresco el paso vale la mitad', await p.evaluate(() => {
    _lastTs = 0; advanceClock(1000); advanceClock(1000 + 1000 / 120);
    return Math.abs(DT - 0.5) < 0.001;
  }));
  r.t('a la mitad de refresco el paso vale el doble', await p.evaluate(() => {
    _lastTs = 0; advanceClock(1000); advanceClock(1000 + 1000 / 30);
    return Math.abs(DT - 2) < 0.001;
  }));
  r.t('un salto largo se acota para no atravesar colisiones', await p.evaluate(() => {
    _lastTs = 0; advanceClock(1000); advanceClock(31000);   // 30 s en segundo plano
    return DT === DT_MAX && DT_MAX <= 3;
  }));
  r.t('un salto negativo o inválido no rompe el reloj', await p.evaluate(() => {
    _lastTs = 0; advanceClock(5000); advanceClock(1000);
    return isFinite(DT) && DT > 0 && DT <= DT_MAX;
  }));
  r.t('el reloj también corre en pausa', await p.evaluate(() => {
    // loop() llama a advanceClock antes de comprobar el estado
    const src = loop.toString();
    return src.indexOf('advanceClock') < src.indexOf("state!=='playing'");
  }));
  r.t('la Ascensión reinicia sus acumuladores', await p.evaluate(() => {
    startGame(false);
    _ascFireAcc = 99; _ascHumAcc = 99; _ascHudAcc = 99; _ascPartAcc = 99;
    startAscension();
    return _ascFireAcc === 0 && _ascHumAcc === 0 && _ascHudAcc === 0 && _ascPartAcc === 0;
  }));
  const errs0 = p.errors;
  await browser.close();

  // ── Comprobación real a dos tasas de refresco distintas ────
  const slow = await measure(null);
  const fast = await measure(UNCAPPED);
  r.note(`con vsync: ${Math.round(slow.ms)} ms para cruzar, ${slow.renderPerSec.toFixed(0)} refrescos/s`);
  r.note(`sin límite: ${Math.round(fast.ms)} ms para cruzar, ${fast.renderPerSec.toFixed(0)} refrescos/s`);

  const spread = fast.renderPerSec / slow.renderPerSec;
  r.t('la prueba consigue dos tasas de refresco muy distintas', spread > 2);

  const ratio = Math.max(slow.ms, fast.ms) / Math.min(slow.ms, fast.ms);
  r.t('cruzar la pantalla tarda lo mismo a cualquier refresco', ratio < 1.25);
  if (ratio >= 1.25) r.note(`desviación ${((ratio - 1) * 100).toFixed(0)}%`);

  for (const [label, m] of [['con vsync', slow], ['sin límite', fast]]) {
    r.t(`el reloj avanza 60 pasos por segundo ${label}`, Math.abs(m.simPerSec - 60) < 9);
    if (Math.abs(m.simPerSec - 60) >= 9) r.note(`${label}: ${m.simPerSec.toFixed(1)} pasos/s`);
  }
  // 756 px a 5 px por paso y 60 pasos por segundo → unos 2,5 s
  r.t('la velocidad de la nave es la calibrada a 60 fps', slow.ms > 2200 && slow.ms < 2900);

  // Segunda tasa independiente: el drenaje de energía. Comprobar valores
  // absolutos es más fiable que comparar partidas del bot, que son ruidosas.
  const b2 = await launch();
  const p2 = await gamePage(b2);
  const rates = await p2.evaluate(() => {
    const out = {};
    // Drenaje de energía en ciclo 1, dificultad normal, sin mejoras
    startGame(false); DT = 1;
    const drain = (.03 + cycle * .01) * DIFF[difficulty].energyDrain * (1 - 0.12 * upgLvl('reactor'));
    out.energyPerSec = drain * 60;
    // Autodisparo de la Ascensión
    out.ascShotsPerSec = 60 / ASC_AUTOFIRE;
    // Duración de la Ascensión en segundos
    out.ascSeconds = ASC_DURATION / 60;
    // Cadencia enemiga mínima
    out.enemyMinShotSeconds = 45 / 60;
    return out;
  });
  await b2.close();
  r.note(`energía ${rates.energyPerSec.toFixed(1)}/s · Ascensión ${rates.ascSeconds}s a ${rates.ascShotsPerSec} disparos/s`);
  r.t('el drenaje de energía es 2,4 por segundo', Math.abs(rates.energyPerSec - 2.4) < 0.01);
  r.t('la Ascensión dura 10 segundos', rates.ascSeconds === 10);
  r.t('la Ascensión dispara 6 veces por segundo', rates.ascShotsPerSec === 6);

  const errs = [...errs0, ...slow.errors, ...fast.errors];
  r.t('sin errores de JavaScript', errs.length === 0);
  if (errs.length) r.note(errs.slice(0, 3).join(' | '));
}
