// Event Director (v4): selección, anti-repetición, cooldown, pity, telegraph,
// limpieza, determinismo por semilla y convivencia con la oleada y el boss.
import { launch, gamePage } from './lib/harness.mjs';

export const name = 'director';

export default async function run(r) {
  const browser = await launch();
  const p = await gamePage(browser);

  // ── Estado y reset ─────────────────────────────────────────
  r.t('la partida arranca con el director limpio', await p.evaluate(() => {
    startGame(false);
    const d = eventDirector;
    return d && d.lastEventId === null && d.recentEvents.length === 0 && d.active === null
      && d.pityCounter === 0 && d.route === 'alpha' && d.intensity === 0
      && v4Metrics.started === 0;
  }));
  r.t('el Daily usa la semilla del día, así es reproducible', await p.evaluate(() => {
    startGame(true);
    const a = eventDirector.seed;
    startGame(true);
    const b = eventDirector.seed;
    startGame(false);
    return a === b && a === (getDailyChallenge().seed >>> 0);
  }));

  // ── Vetos de contexto ──────────────────────────────────────
  r.t('no hay eventos en el tutorial', await p.evaluate(() => {
    startGame(false); isTutorialWave = true;
    const v = directorVeto(buildDirectorContext());
    isTutorialWave = false;
    return v === 'tutorial';
  }));
  r.t('no hay eventos durante el boss', await p.evaluate(() => {
    startGame(false); isBossWave = true;
    const v = directorVeto(buildDirectorContext());
    isBossWave = false;
    return v === 'boss';
  }));
  r.t('no hay eventos en las primeras oleadas', await p.evaluate(() => {
    startGame(false); waveIdx = 0;
    return directorVeto(buildDirectorContext()) === 'too-early';
  }));
  r.t('no se solapan dos eventos', await p.evaluate(() => {
    startGame(false); waveIdx = 5;
    armEvent(eventById('courier'), 10);
    const v = directorVeto(buildDirectorContext());
    abortEvent('test');
    return v === 'event-active';
  }));

  // ── Selección: anti-repetición, cooldown, mínimos ──────────
  r.t('un evento no se repite inmediatamente', await p.evaluate(() => {
    startGame(false); waveIdx = 15; cycle = 2;
    eventDirector.lastEventId = 'courier';
    return eventWeight(eventById('courier'), buildDirectorContext()) === 0;
  }));
  r.t('un evento reciente pierde peso pero sigue siendo elegible', await p.evaluate(() => {
    startGame(false); waveIdx = 15; cycle = 2;
    const base = eventWeight(eventById('courier'), buildDirectorContext());
    eventDirector.recentEvents = ['courier'];
    const pen = eventWeight(eventById('courier'), buildDirectorContext());
    return base > 0 && pen > 0 && pen < base;
  }));
  r.t('el cooldown por evento bloquea su reaparición', await p.evaluate(() => {
    startGame(false); waveIdx = 15; cycle = 2;
    eventDirector.eventCooldowns.courier = 2;
    return eventWeight(eventById('courier'), buildDirectorContext()) === 0;
  }));
  r.t('cada evento respeta su oleada mínima', await p.evaluate(() => {
    startGame(false); waveIdx = 3; cycle = 1;   // papel 'event': admite toda clase
    return eventWeight(eventById('leech'), buildDirectorContext()) === 0
      && eventWeight(eventById('courier'), buildDirectorContext()) > 0;
  }));
  r.t('la amenaza pierde peso con la escena cargada', await p.evaluate(() => {
    startGame(false); waveIdx = 15; cycle = 2;
    eventDirector.intensity = 0;
    const calm = eventWeight(eventById('leech'), buildDirectorContext());
    eventDirector.intensity = 90;
    const busy = eventWeight(eventById('leech'), buildDirectorContext());
    return calm > 0 && busy > 0 && busy < calm;
  }));
  r.t('la amenaza no aparece con el jugador a un impacto de morir', await p.evaluate(() => {
    startGame(false); waveIdx = 15; cycle = 2;
    const full = eventWeight(eventById('leech'), buildDirectorContext());
    shipHp = 1;
    const low = eventWeight(eventById('leech'), buildDirectorContext());
    shipHp = maxShipHp;
    return low < full;
  }));
  r.t('el techo de amenazas por ciclo se respeta', await p.evaluate(() => {
    startGame(false); waveIdx = 15; cycle = 2;
    eventDirector.threatsThisCycle = V4_DIRECTOR.maxThreatPerCycle;
    return eventWeight(eventById('leech'), buildDirectorContext()) === 0;
  }));

  // ── Papeles de oleada ──────────────────────────────────────
  r.t('cada oleada del ciclo tiene un papel', await p.evaluate(() =>
    WAVE_ROLES.length === WAVE_COUNT && WAVE_ROLES.every(x => x in ROLE_KINDS)));
  r.t('las oleadas de introducción y dominio se juegan limpias', await p.evaluate(() => {
    startGame(false); waveIdx = 12; cycle = 2;      // 12 % 12 = 0 → intro
    const intro = directorVeto(buildDirectorContext());
    waveIdx = 13;                                   // mastery
    const mastery = directorVeto(buildDirectorContext());
    return intro === 'role-intro' && mastery === 'role-mastery';
  }));
  r.t('una oleada de alivio no admite amenazas', await p.evaluate(() => {
    startGame(false); waveIdx = 17; cycle = 3;      // relief
    return currentWaveRole() === 'relief'
      && eventWeight(eventById('leech'), buildDirectorContext()) === 0
      && eventWeight(eventById('data_rush'), buildDirectorContext()) > 0;
  }));
  r.t('una oleada de clímax sí admite amenazas', await p.evaluate(() => {
    startGame(false); waveIdx = 20; cycle = 3;      // climax
    return currentWaveRole() === 'climax'
      && eventWeight(eventById('leech'), buildDirectorContext()) > 0;
  }));

  // ── Pity ───────────────────────────────────────────────────
  r.t('el pity garantiza un evento tras demasiadas oleadas en calma', await p.evaluate(() => {
    startGame(false); waveIdx = 15; cycle = 2;
    eventDirector.pityCounter = V4_DIRECTOR.pityAfterWaves;
    eventDirector.wavesSinceEvent = 0;
    eventDirector.rng = () => 0.999;         // el azar diría que no
    const def = planWaveEvent();
    return def !== null && eventDirector.active !== null;
  }));

  // ── Ciclo de vida y telegraph ──────────────────────────────
  r.t('el evento pasa por señal antes de actuar', await p.evaluate(() => {
    startGame(false); waveIdx = 8;
    armEvent(eventById('courier'), 1);
    const armed = eventDirector.active.phase;
    updateDirector(2);                        // agota el retardo
    const tele = eventDirector.active.phase;
    const noEnemyYet = !enemies.some(e => e.ephemeral);
    updateDirector(secsToSteps(1));           // agota la señal
    const active = eventDirector.active.phase;
    const enemyNow = enemies.some(e => e.ephemeral);
    abortEvent('test');
    return armed === 'armed' && tele === 'telegraph' && noEnemyYet
      && active === 'active' && enemyNow;
  }));
  r.t('todo evento peligroso tiene ventana de reacción', await p.evaluate(() =>
    SPACE_EVENTS.every(ev => ev.telegraph >= (ev.kind === 'threat' ? 0.6 : 0.2))));
  r.t('la señal se anuncia por voz', await p.evaluate(() => {
    startGame(false); waveIdx = 8; _srAt = 0; _srLast = '';
    armEvent(eventById('leech'), 1);
    updateDirector(2);
    const said = document.getElementById('sr-live').textContent;
    abortEvent('test');
    return /Señal hostil/.test(said);
  }));

  // ── Limpieza ───────────────────────────────────────────────
  r.t('al resolver no quedan entidades huérfanas', await p.evaluate(() => {
    startGame(false); waveIdx = 8;
    armEvent(eventById('precision_drill'), 0);
    updateDirector(1); updateDirector(secsToSteps(1));
    const spawned = enemies.filter(e => e.ephemeral).length;
    resolveEvent('timeout');
    enemies = enemies.filter(e => e.alive);
    return spawned === 3 && eventDirector.active === null
      && !enemies.some(e => e.ephemeral) && eventDirector.cooldownWaves > 0;
  }));
  r.t('el cambio de oleada aborta el evento en curso', await p.evaluate(() => {
    startGame(false); waveIdx = 8;
    armEvent(eventById('courier'), 0);
    updateDirector(1); updateDirector(secsToSteps(1));
    directorWaveEnd();
    enemies = enemies.filter(e => e.alive);
    return eventDirector.active === null && !enemies.some(e => e.ephemeral);
  }));
  r.t('el fin de partida cierra el evento', await p.evaluate(() => {
    startGame(false); waveIdx = 8; totalKills = 12; lives = 1;
    armEvent(eventById('courier'), 0);
    updateDirector(1); updateDirector(secsToSteps(1));
    endGame();
    return eventDirector.active === null;
  }));

  // ── Convivencia con la oleada ──────────────────────────────
  r.t('los enemigos de evento no retienen el fin de oleada', await p.evaluate(() => {
    startGame(false); waveIdx = 8;
    enemies.length = 0;                       // oleada limpiada por el jugador
    armEvent(eventById('courier'), 0);
    updateDirector(1); updateDirector(secsToSteps(1));
    return enemies.some(e => e.ephemeral) && waveEnemiesAlive() === false;
  }));
  r.t('los enemigos de evento no entran en la Galería de oleadas', await p.evaluate(() => {
    startGame(false); waveIdx = 8;
    const before = threatsSeen.size;
    armEvent(eventById('courier'), 0);
    updateDirector(1); updateDirector(secsToSteps(1));
    const e = enemies.find(x => x.ephemeral);
    e.hp = 1; killEnemy(e, { cause: 'bullet' });
    return threatsSeen.size === before;
  }));

  // ── Determinismo por semilla ───────────────────────────────
  r.t('la misma semilla produce la misma secuencia', await p.evaluate(() => {
    const seq = () => {
      startGame(false); resetDirector(20260907);
      waveIdx = 8; cycle = 2;
      const out = [];
      for (let i = 0; i < 12; i++) {
        const def = pickEvent(buildDirectorContext());
        out.push(def ? def.id : '-');
        if (def) { eventDirector.lastEventId = def.id; }
      }
      return out.join(',');
    };
    const a = seq(), b = seq();
    return a === b && a.length > 0;
  }));
  r.t('semillas distintas producen secuencias distintas', await p.evaluate(() => {
    const seq = (s) => {
      startGame(false); resetDirector(s);
      waveIdx = 8; cycle = 2;
      const out = [];
      for (let i = 0; i < 20; i++) {
        const def = pickEvent(buildDirectorContext());
        out.push(def ? def.id : '-');
        if (def) eventDirector.lastEventId = def.id;
      }
      return out.join(',');
    };
    return seq(1) !== seq(999999);
  }));
  r.t('el director no usa Math.random en su lógica', await p.evaluate(() =>
    !/Math\.random/.test(pickEvent.toString() + planWaveEvent.toString()
      + eventWeight.toString() + startCourierEvent.toString() + startLeechEvent.toString())));

  // ── Eventos: mecánica real, no decorado ────────────────────
  r.t('el mensajero aguanta varios impactos y premia al destruirlo', await p.evaluate(() => {
    startGame(false); waveIdx = 8;
    armEvent(eventById('courier'), 0);
    updateDirector(1); updateDirector(secsToSteps(1));
    const e = enemies.find(x => x.ephemeral);
    const hp0 = e.hp, sc0 = score;
    e.hp = 1; killEnemy(e, { cause: 'bullet' });
    return hp0 === 3 && score > sc0 && eventDirector.active === null
      && eventDirector.stats.completed === 1 && discoveries.has('courier');
  }));
  r.t('si el mensajero escapa no hay recompensa', await p.evaluate(() => {
    startGame(false); waveIdx = 8;
    armEvent(eventById('courier'), 0);
    updateDirector(1); updateDirector(secsToSteps(1));
    const e = enemies.find(x => x.ephemeral);
    const sc0 = score;
    e.x = W + 200;
    updateDirector(1);
    return eventDirector.active === null && eventDirector.stats.missed === 1 && score === sc0;
  }));
  r.t('el parásito acelera la oleada y al morir la devuelve a su ritmo', await p.evaluate(() => {
    startGame(false); waveIdx = 8;
    const before = enemies.filter(e => !e.ephemeral).map(e => e.shootTimer);
    armEvent(eventById('leech'), 0);
    updateDirector(1); updateDirector(secsToSteps(1));
    const boosted = enemies.filter(e => !e.ephemeral).map(e => e.shootTimer);
    const faster = boosted.every((t, i) => t < before[i]) && boosted.length > 0;
    const marked = enemies.filter(e => e.leeched).length === boosted.length;
    const l = enemies.find(x => x.ephemeral);
    l.hp = 1; killEnemy(l, { cause: 'bullet' });
    const cleared = enemies.filter(e => e.leeched).length === 0;
    return faster && marked && cleared && eventDirector.active === null;
  }));
  r.t('los tres blancos completan el evento y dan bonus', await p.evaluate(() => {
    startGame(false); waveIdx = 8;
    armEvent(eventById('precision_drill'), 0);
    updateDirector(1); updateDirector(secsToSteps(1));
    const sc0 = score;
    enemies.filter(e => e.ephemeral).forEach(e => killEnemy(e, { cause: 'bullet' }));
    return score > sc0 && eventDirector.active === null
      && eventDirector.stats.completed === 1 && discoveries.has('precision_drill');
  }));

  // ── Eventos de fase 2 ──────────────────────────────────────
  const arm = (id) => p.evaluate((id) => {
    startGame(false); waveIdx = 20; cycle = 3;
    armEvent(eventById(id), 0);
    updateDirector(1); updateDirector(secsToSteps(1.2));
    return eventDirector.active ? eventDirector.active.phase : null;
  }, id);

  r.t('la señal falsa cae disfrazada y se revela a media pantalla', await p.evaluate(() => {
    startGame(false); waveIdx = 20; cycle = 3;
    armEvent(eventById('mimic_drop'), 0);
    updateDirector(1); updateDirector(secsToSteps(1));
    const m = powerups.find(x => x.mimic);
    const hidden = m && !m.revealed && !!m.type;
    m.y = H * 0.5;
    updateDirector(1);
    const shown = m.revealed;
    abortEvent('test');
    return hidden && shown;
  }));
  r.t('recogerla cuesta energía pero nunca una vida', await p.evaluate(() => {
    startGame(false); waveIdx = 20; cycle = 3;
    armEvent(eventById('mimic_drop'), 0);
    updateDirector(1); updateDirector(secsToSteps(1));
    const m = powerups.find(x => x.mimic);
    const hp0 = shipHp, lives0 = lives, pu0 = activePowerupIds().length;
    energy = 100; m.x = player.x; m.y = player.y;
    checkCollisions();
    const ok = energy < 100 && shipHp === hp0 && lives === lives0
      && activePowerupIds().length === pu0;
    abortEvent('test');
    return ok;
  }));
  r.t('se puede neutralizar a tiros y da recompensa', await p.evaluate(() => {
    startGame(false); waveIdx = 20; cycle = 3;
    armEvent(eventById('mimic_drop'), 0);
    updateDirector(1); updateDirector(secsToSteps(1));
    const m = powerups.find(x => x.mimic);
    const sc0 = score;
    m.hp = 1;
    bullets.push(newBullet(m.x, m.y, {}));
    checkCollisions();
    return score > sc0 && eventDirector.active === null && discoveries.has('mimic_drop');
  }));

  r.t('el eco desvanecido no se puede golpear ni golpea', await p.evaluate(() => {
    startGame(false); waveIdx = 20; cycle = 3;
    armEvent(eventById('phantom_formation'), 0);
    updateDirector(1); updateDirector(secsToSteps(1));
    const e = enemies.find(x => x.eventId === 'phantom_formation');
    e.phaseTimer = 0;
    updateDirector(1);
    const phased = e.phased && e.ghostX > 0;
    bullets.push(newBullet(e.x, e.y, {}));
    const alive0 = e.alive;
    checkCollisions();
    const survived = e.alive === alive0;
    abortEvent('test');
    return phased && survived;
  }));
  r.t('el eco reaparece desplazado donde marcaba la silueta', await p.evaluate(() => {
    startGame(false); waveIdx = 20; cycle = 3;
    armEvent(eventById('phantom_formation'), 0);
    updateDirector(1); updateDirector(secsToSteps(1));
    const e = enemies.find(x => x.eventId === 'phantom_formation');
    e.phaseTimer = 0; updateDirector(1);
    const gx = e.ghostX, gy = e.ghostY;
    e.phaseTimer = 0; updateDirector(1);
    abortEvent('test');
    return !e.phased && e.x === gx && e.y === gy;
  }));

  r.t('el duplicado copia enemigos de la oleada y son más frágiles', await p.evaluate(() => {
    startGame(false); waveIdx = 20; cycle = 3;
    const base = enemies.filter(e => !e.ephemeral);
    armEvent(eventById('glitch_duplicate'), 0);
    updateDirector(1); updateDirector(secsToSteps(1));
    const copies = enemies.filter(e => e.glitch);
    const smaller = copies.every(c => base.some(b => b.shape === c.shape && c.size < b.size));
    const quiet = copies.every(c => c.shootTimer > 1e8);
    abortEvent('test');
    return copies.length > 0 && smaller && quiet;
  }));
  r.t('purgar todas las copias completa el evento', await p.evaluate(() => {
    startGame(false); waveIdx = 20; cycle = 3;
    armEvent(eventById('glitch_duplicate'), 0);
    updateDirector(1); updateDirector(secsToSteps(1));
    const sc0 = score;
    enemies.filter(e => e.glitch).forEach(e => killEnemy(e, { cause: 'bullet' }));
    return score > sc0 && eventDirector.active === null && discoveries.has('glitch_duplicate');
  }));

  r.t('el cazador marca el suelo antes de disparar', await p.evaluate(() => {
    startGame(false); waveIdx = 20; cycle = 3;
    armEvent(eventById('hunter'), 0);
    updateDirector(1); updateDirector(secsToSteps(1));
    const e = enemies.find(x => x.eventId === 'hunter');
    const aiming = e.aiming && e.aimTimer > 0 && e.ebullets.length === 0;
    const mark = e.markX;
    e.aimTimer = 0; updateDirector(1);
    const fired = e.ebullets.length === 1;
    // El disparo va a la marca, no a la posición actual del jugador
    const b = e.ebullets[0];
    const goesToMark = Math.sign(b.vx) === Math.sign(mark - e.x) || Math.abs(mark - e.x) < 2;
    abortEvent('test');
    return aiming && fired && goesToMark;
  }));
  r.t('el cazador aguanta varios impactos', await p.evaluate(() => {
    startGame(false); waveIdx = 20; cycle = 3;
    armEvent(eventById('hunter'), 0);
    updateDirector(1); updateDirector(secsToSteps(1));
    const e = enemies.find(x => x.eventId === 'hunter');
    return e.hp >= 4;
  }));

  r.t('la lluvia de datos suelta fragmentos a lo largo del evento', await p.evaluate(() => {
    startGame(false); waveIdx = 20; cycle = 3;
    miniFrags.length = 0;
    armEvent(eventById('data_rush'), 0);
    updateDirector(1); updateDirector(secsToSteps(0.5));
    const t0 = miniFrags.length;
    for (let i = 0; i < 30; i++) updateDirector(1);
    const grew = miniFrags.length > t0;
    abortEvent('test');
    return grew;
  }));
  r.t('todos los eventos del catálogo tienen manejador', await p.evaluate(() =>
    SPACE_EVENTS.every(ev => EVENT_HANDLERS[ev.id] && typeof EVENT_HANDLERS[ev.id].start === 'function')));
  r.t('un manejador ausente no congela la partida', await p.evaluate(() => {
    startGame(false); waveIdx = 20;
    armEvent({ id: 'inexistente', kind: 'bonus', label: 'X', color: '#fff',
               telegraph: 0.1, duration: 1, cooldownWaves: 1, tags: [] }, 0);
    updateDirector(1); updateDirector(secsToSteps(0.2));
    return eventDirector.active === null && state === 'playing';
  }));

  // ── Secretos ───────────────────────────────────────────────
  r.t('un secreto entra sin anunciarse', await p.evaluate(() => {
    startGame(false); waveIdx = 20; cycle = 3; _srAt = 0; _srLast = '';
    document.getElementById('sr-live').textContent = '';
    armEvent(eventById('sol_signal'), 0);
    updateDirector(1); updateDirector(secsToSteps(0.3));
    const said = document.getElementById('sr-live').textContent;
    const active = eventDirector.active.phase === 'active';
    abortEvent('test');
    return active && said === '';
  }));
  r.t('la señal solitaria se puede localizar y disparar', await p.evaluate(() => {
    startGame(false); waveIdx = 20; cycle = 3;
    armEvent(eventById('sol_signal'), 0);
    updateDirector(1); updateDirector(secsToSteps(0.3));
    const { x, y } = eventDirector.active.data;
    const sc0 = score;
    bullets.push(newBullet(x, y, {}));
    updateDirector(1);
    return score > sc0 && eventDirector.active === null && discoveries.has('sol_signal');
  }));
  r.t('el fragmento espectral exige pericia previa', await p.evaluate(() => {
    startGame(false); waveIdx = 17; cycle = 3;   // papel 'relief': admite secretos
    comboMult = 1; eventDirector.tension = 0;
    const cold = eventWeight(eventById('ghost_fragment'), buildDirectorContext());
    comboMult = 8;
    const hot = eventWeight(eventById('ghost_fragment'), buildDirectorContext());
    comboMult = 1;
    return cold === 0 && hot > 0;
  }));
  r.t('recogerlo suma fragments de la partida', await p.evaluate(() => {
    startGame(false); waveIdx = 20; cycle = 3;
    armEvent(eventById('ghost_fragment'), 0);
    updateDirector(1); updateDirector(secsToSteps(0.3));
    const f0 = runFragments;
    eventDirector.active.data.x = player.x;
    eventDirector.active.data.y = player.y;
    updateDirector(1);
    return runFragments > f0 && discoveries.has('ghost_fragment');
  }));

  // ── Transmisiones y ruta ───────────────────────────────────
  r.t('la partida empieza en el sector Alpha', await p.evaluate(() => {
    startGame(false);
    return eventDirector.route === 'alpha' && routeScoreMult() === 1 && routeEnemySpeed() === 1;
  }));
  r.t('las transmisiones se agotan a las tres', await p.evaluate(() => {
    startGame(false); waveIdx = 10;
    eventDirector.rng = () => 0.01;              // siempre pasa el filtro
    for (let i = 0; i < 10; i++) maybeTransmission();
    return eventDirector.routeFlags.transmissions === 3 && discoveries.has('unknown_transmission');
  }));
  r.t('tres transmisiones abren el sector Eclipse', await p.evaluate(() => {
    startGame(false); waveIdx = 10;
    eventDirector.routeFlags.transmissions = 3;
    evaluateRoute();
    return eventDirector.route === 'eclipse' && discoveries.has('route_eclipse');
  }));
  r.t('un combo normal no basta para abrir Eclipse', await p.evaluate(() => {
    startGame(false); waveIdx = 10;
    maxComboRun = 12; eventDirector.routeFlags.nearStreakBest = 8;
    evaluateRoute();
    maxComboRun = 1;
    return eventDirector.route === 'alpha';
  }));
  r.t('un combo excepcional también lo abre', await p.evaluate(() => {
    startGame(false); waveIdx = 10;
    maxComboRun = 18;
    evaluateRoute();
    maxComboRun = 1;
    return eventDirector.route === 'eclipse';
  }));
  r.t('Eclipse multiplica la puntuación en la misma ruta de scoring', await p.evaluate(() => {
    startGame(false); waveIdx = 10; combo = 0; comboMult = 1; runModifier = null;
    const base = addScore(100, false);
    eventDirector.route = 'eclipse';
    const ecl = addScore(100, false);
    return base === 100 && ecl === 130;
  }));
  r.t('Eclipse acelera la oleada y se ve en el fondo', await p.evaluate(() => {
    startGame(false);
    const a = enemySpeedBonus(), ta = currentRoute().tint;
    eventDirector.route = 'eclipse';
    const b = enemySpeedBonus(), tb = currentRoute().tint;
    return b > a && ta === null && tb !== null;
  }));
  r.t('Eclipse sube la frecuencia de eventos', await p.evaluate(() =>
    ROUTES.eclipse.eventBias > ROUTES.alpha.eventBias));

  // ── Anticipación del boss ──────────────────────────────────
  r.t('el boss se localiza en la oleada correcta', await p.evaluate(() =>
    bossAtWave(12) && bossAtWave(36) && !bossAtWave(24) && !bossAtWave(0) && !bossAtWave(13)));
  r.t('la oleada previa al boss se juega sin eventos', await p.evaluate(() => {
    startGame(false); waveIdx = 11; cycle = 1;
    return wavesUntilBoss() === 1 && directorVeto(buildDirectorContext()) === 'pre-boss';
  }));
  r.t('dos oleadas antes hay señal sutil, una antes aviso claro', await p.evaluate(() => {
    startGame(false);
    waveIdx = 10; const two = wavesUntilBoss();
    waveIdx = 11; const one = wavesUntilBoss();
    waveIdx = 11; _srAt = 0; _srLast = '';
    primeBossAnticipation();
    const warned = /Señal hostil/.test(document.getElementById('sr-live').textContent);
    return two === 2 && one === 1 && warned;
  }));

  // ── Objetivos ocultos ──────────────────────────────────────
  r.t('los objetivos ocultos existen y no se explican al jugador', await p.evaluate(() =>
    HIDDEN_OBJECTIVES.length >= 3 && HIDDEN_OBJECTIVES.every(o => typeof o.check === 'function')));
  r.t('una oleada impecable se detecta y premia', await p.evaluate(() => {
    startGame(false); waveIdx = 6;
    resetWaveStats();
    waveStats.shots = 10; waveStats.hits = 12; waveStats.kills = 10;
    const sc0 = score;
    checkHiddenObjectives();
    return score > sc0 && discoveries.has('obj_flawless_wave');
  }));
  r.t('una oleada sin daño se detecta', await p.evaluate(() => {
    startGame(false); waveIdx = 6;
    resetWaveStats();
    waveStats.kills = 9; waveStats.damage = 0;
    checkHiddenObjectives();
    return discoveries.has('obj_untouched_wave');
  }));
  r.t('recibir daño invalida la oleada sin rasguño', await p.evaluate(() => {
    startGame(false); waveIdx = 6;
    resetWaveStats();
    waveStats.kills = 9; waveStats.damage = 1;
    return HIDDEN_OBJECTIVES.find(o => o.id === 'untouched_wave').check(waveStats) === false;
  }));
  r.t('el silencio táctico mide tiempo, no fotogramas', await p.evaluate(() => {
    startGame(false); resetWaveStats();
    for (let i = 0; i < 10; i++) updateWaveStats(0.5);   // 5 pasos en 10 ticks
    return Math.abs(waveStats.maxNoFire - 5) < 0.001;
  }));
  r.t('disparar reinicia la racha de silencio', await p.evaluate(() => {
    startGame(false); resetWaveStats();
    updateWaveStats(100);
    const before = waveStats.maxNoFire;
    lastFireFrame = -999; fireBullet();
    return before >= 100 && waveStats.noFire === 0 && waveStats.maxNoFire >= 100;
  }));
  r.t('recibir daño corta la racha de esquivas', await p.evaluate(() => {
    startGame(false);
    eventDirector.routeFlags.nearStreak = 5;
    shieldActive = false; playerHit();
    return eventDirector.routeFlags.nearStreak === 0;
  }));

  // ── Compatibilidad ─────────────────────────────────────────
  r.t('con movimiento reducido no hay temblor ni pulso de señal', await p.evaluate(() => {
    startGame(false); waveIdx = 8;
    reducedMotion = true; screenShake = 0;
    armEvent(eventById('leech'), 0);
    updateDirector(1); updateDirector(secsToSteps(1));
    const shook = screenShake;
    abortEvent('test'); reducedMotion = false;
    return shook === 0;
  }));
  r.t('el director avanza con DT, no con fotogramas', await p.evaluate(() => {
    const src = updateDirector.toString();
    return /dt/.test(src) && !/frame\s*%/.test(src);
  }));
  r.t('la intensidad se muestrea sin recorrer nada por frame', await p.evaluate(() => {
    startGame(false);
    const d = eventDirector;
    d.intensity = 0; d.sampleAcc = 0;
    for (let i = 0; i < 5; i++) updateDirector(1);   // 5 pasos: aún no muestrea
    const early = d.intensity;
    updateDirector(20);
    return early === 0 && d.intensity >= 0;
  }));

  r.t('sin errores de JavaScript', p.errors.length === 0);
  if (p.errors.length) r.note(p.errors.slice(0, 5).join(' | '));
  await browser.close();
}
