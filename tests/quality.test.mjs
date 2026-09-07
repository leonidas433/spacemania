// Calidad adaptativa, reservas de objetos, anuncios accesibles,
// hitbox indulgente, formas de bala enemiga y Ascenso de Flota.
import { launch, gamePage } from './lib/harness.mjs';

export const name = 'quality';

const MAXED = { hull: 2, reactor: 3, magnet: 2, combo_fuel: 3, start_shield: 1, fragment_boost: 2, spare_life: 1 };

export default async function run(r) {
  const browser = await launch();
  let p = await gamePage(browser);

  // ── Calidad adaptativa ─────────────────────────────────────
  r.t('en escritorio el modo ahorro está desactivado',
    await p.evaluate(() => LOW_FX === false && fxAutoDowngraded === false));
  r.t('los topes de partículas y estelas cambian con la calidad',
    await p.evaluate(() => {
      const a = maxParticles(), b = maxTrails();
      fxAutoDowngraded = true; computeLowFx();
      const c = maxParticles(), d = maxTrails();
      fxAutoDowngraded = false; computeLowFx();
      return a === 300 && b === 220 && c === 140 && d === 70 && LOW_FX === false;
    }));
  r.t('el movimiento reducido activa el modo ahorro',
    await p.evaluate(() => { toggleReducedMotion(); const on = LOW_FX; toggleReducedMotion(); return on === true && LOW_FX === false; }));
  r.t('las partículas vuelven a la reserva al morir',
    await p.evaluate(() => {
      startGame(false);
      DT = 1;                       // paso fijo: esto prueba la reserva, no el reloj
      for (let i = 0; i < 30; i++) spawnParticles(100, 100, '#fff', 10);
      const before = particles.length;
      for (let i = 0; i < 60; i++) updateParticles();
      return before > 0 && particles.length === 0 && particlePool.length > 0;
    }));
  r.t('el tope de partículas se respeta bajo presión',
    await p.evaluate(() => {
      clearParticles();
      for (let i = 0; i < 100; i++) spawnParticles(100, 100, '#fff', 10);
      return particles.length <= maxParticles();
    }));

  // ── Anuncios para lector de pantalla ───────────────────────
  r.t('la región de estado existe y no ocupa espacio',
    await p.evaluate(() => {
      const el = document.getElementById('sr-live');
      return !!el && el.getAttribute('role') === 'status'
        && el.getAttribute('aria-live') === 'polite'
        && el.getBoundingClientRect().width <= 1;
    }));
  r.t('anuncia el escudo destruido',
    await p.evaluate(() => {
      startGame(false); _srAt = 0; _srLast = '';
      shieldActive = true; shieldHp = 1; playerHit();
      return document.getElementById('sr-live').textContent === 'Escudo destruido';
    }));
  r.t('anuncia el impacto con el casco restante',
    await p.evaluate(() => {
      startGame(false); _srAt = 0; _srLast = '';
      shieldActive = false; playerHit();
      return /^Impacto\. Casco \d+ de \d+$/.test(document.getElementById('sr-live').textContent);
    }));
  r.t('anuncia la Ascensión',
    await p.evaluate(() => {
      startGame(false); _srAt = 0; _srLast = '';
      startAscension();
      return document.getElementById('sr-live').textContent.startsWith('Ascensión activada');
    }));
  r.t('limita la frecuencia para no saturar la locución',
    await p.evaluate(() => {
      _srAt = 0; _srLast = ''; announce('UNO');
      const a = document.getElementById('sr-live').textContent;
      announce('DOS');
      return a === 'UNO' && document.getElementById('sr-live').textContent === 'UNO';
    }));

  // ── Hitbox indulgente ──────────────────────────────────────
  const hit = (mercy, dx) => p.evaluate(({ mercy, dx }) => {
    startGame(false); mercyHitbox = mercy; shieldActive = false; playerExploding = false;
    const hp = shipHp;
    enemies[0].ebullets = [{ x: player.x + dx, y: player.y, vx: 0, vy: 0 }];
    checkCollisions();
    const took = shipHp === hp - 1;
    mercyHitbox = false;
    return took;
  }, { mercy, dx });
  r.t('el hitbox normal recibe impacto a 8 px', await hit(false, 8));
  r.t('el hitbox indulgente esquiva a 8 px', !(await hit(true, 8)));
  r.t('el hitbox indulgente sigue recibiendo a 3 px', await hit(true, 3));
  r.t('la opción se guarda y se refleja en CONTROLES',
    await p.evaluate(() => {
      mercyHitbox = false; toggleMercy(); openSettings();
      const shown = document.getElementById('mercy-display').textContent;
      const saved = localStorage.getItem('retro-game-mania.spacemania.mercy');
      closeSettings(); toggleMercy();
      return shown === 'ACTIVADO' && saved === '1';
    }));

  // ── Formas de bala enemiga ─────────────────────────────────
  r.t('cada familia de oleada tiene una forma de proyectil',
    await p.evaluate(() => {
      const shapes = WAVES.map(w => EBULLET_SHAPE[w.shape]);
      return shapes.every(Boolean) && new Set(shapes).size >= 4;
    }));
  r.t('el enemigo hereda la forma de su oleada',
    await p.evaluate(() => { startGame(false); return enemies[0].bshape === EBULLET_SHAPE[WAVES[0].shape]; }));
  const errsA = p.errors;
  await p.ctx.close();

  // ── Ascenso de Flota ───────────────────────────────────────
  p = await gamePage(browser);
  r.t('sin el Hangar completo no se ofrece el ascenso',
    await p.evaluate(() => { showHangar(); return !hangarMaxed() && !document.getElementById('overlay').innerHTML.includes('ASCENSO DE FLOTA'); }));
  const errsB = p.errors;
  await p.ctx.close();

  p = await gamePage(browser, { upgrades: JSON.stringify(MAXED), fragments: '500' });
  r.t('con el Hangar completo se ofrece el ascenso',
    await p.evaluate(() => { showHangar(); return hangarMaxed() && document.getElementById('overlay').innerHTML.includes('★ ASCENSO DE FLOTA'); }));
  r.t('pide confirmación antes de reiniciar',
    await p.evaluate(() => { armPrestige(); return document.getElementById('overlay').innerHTML.includes('CONFIRMAR ASCENSO') && prestige === 0 && fragments === 500; }));
  r.t('cancelar no toca el progreso',
    await p.evaluate(() => { cancelPrestige(); return prestige === 0 && fragments === 500 && hangarMaxed(); }));
  r.t('confirmar reinicia mejoras y fragments',
    await p.evaluate(() => { armPrestige(); doPrestige(); return prestige === 1 && fragments === 0 && !hangarMaxed() && upgLvl('hull') === 0; }));
  r.t('aplica el multiplicador permanente', await p.evaluate(() => Math.abs(fragMultiplier() - 1.25) < 1e-9));
  r.t('persiste el ascenso', await p.evaluate(() => localStorage.getItem('retro-game-mania.spacemania.prestige') === '1'));
  r.t('desbloquea el logro', await p.evaluate(() => unlockedAchievements.has('fleet')));
  r.t('muestra la insignia en el menú',
    await p.evaluate(() => { showMenu(); return document.getElementById('overlay').innerHTML.includes('★ ASCENSO DE FLOTA'); }));

  const errs = [...errsA, ...errsB, ...p.errors];
  r.t('sin errores de JavaScript', errs.length === 0);
  if (errs.length) r.note(errs.slice(0, 5).join(' | '));
  await browser.close();
}
