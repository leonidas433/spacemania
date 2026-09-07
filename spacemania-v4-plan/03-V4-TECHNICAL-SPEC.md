# SpaceMania v4 — TECHNICAL IMPLEMENTATION SPEC

## 1. Restricciones de arquitectura

Mantener exactamente:

- `index.html` como asset principal.
- Canvas 2D.
- Web Audio API.
- Vanilla JS.
- Sin dependencias de runtime.
- Sin WebGL.
- Sin arrays de gameplay recreados por frame.
- Sin `setTransform` fuera de `applyCanvasScale()`.
- Sin timers de simulación basados en Hz reales.

## 2. Integración con DT

El repositorio v3.3 ya usa reloj de simulación. Toda variable temporal nueva debe usar `DT`.

Correcto:

```js
state.timer -= DT;
```

Correcto para periodos:

```js
state.acc += DT;
if (state.acc >= period) {
  state.acc -= period;
  trigger();
}
```

Incorrecto:

```js
setTimeout(trigger, 1000);
```

para lógica central del gameplay.

`setTimeout` puede conservarse para UI no crítica, nunca para la autoridad temporal del director.

## 3. Nuevas secciones del archivo

Insertar las nuevas secciones sin reordenar agresivamente el archivo:

```text
EVENT DIRECTOR
EVENT CATALOG
EVENT TELEGRAPH
ROUTE DIRECTOR
V4 METRICS
```

Ubicación recomendada: después de `MODIFICADORES DE RUN / DAILY CHALLENGE` y antes de `ESTADO GLOBAL`, o en bloques próximos si el orden actual exige otra integración.

## 4. Estado de wave

Añadir, si no existe equivalente:

```js
let waveRole = 'intro';
let waveEventPlan = null;
let waveIntensityTarget = 0;
```

No duplicar variables existentes. Reutilizar las ya existentes cuando sea posible.

## 5. Identidad de evento

Nunca usar texto visible como identificador.

Ejemplo:

```js
id: 'courier'
label: 'MENSAJERO DE DATOS'
```

## 6. Spawn de eventos

No llamar a `spawnWave()` desde un evento salvo una razón explícita.

Preferir helpers:

```js
spawnEventEnemy(spec)
spawnEventDrop(spec)
spawnEventParticles(spec)
```

Los enemigos creados para un evento deben usar el mismo modelo de enemigo y entrar en el array/pool correcto.

## 7. Kill path

Todo enemigo nuevo debe morir por:

```js
killEnemy(e, { cause: 'event' })
```

Nunca hacer:

```js
enemies.splice(...)
```

ni sumar puntos manualmente desde un evento.

## 8. Scoring

Todo score:

```js
addScore(base, true/false)
```

Los bonus de evento deben pasar por la misma economía de modifiers/daily cuando corresponda.

## 9. Power-ups

Los eventos pueden:

- garantizar un power-up existente;
- cambiar temporalmente la probabilidad de drop;
- crear un pickup especial de evento.

No añadir un sexto power-up permanente salvo decisión posterior.

## 10. Integración con sinergias

Los eventos deben leer:

```js
activePowerupIds()
activeSynergy
```

No crear una segunda lógica de sinergias.

Ejemplo:

`PRECISION_DRILL` puede otorgar mayor recompensa si el jugador tiene `pierce` activo, pero no debe duplicar la lógica de daño de `SYNERGIES`.

## 11. Integración con Ascensión

Durante Ascensión:

- eventos `minor` pueden seguir activos;
- eventos `major` peligrosos deben tener veto o reducción de densidad;
- no cancelar Ascensión del jugador sin una razón explícita;
- no robar control al usuario.

`Overclock Total` debe tratarse como estado de alta intensidad y activar cooldown de eventos peligrosos.

## 12. Integración con near-miss

Cuando exista un near-miss válido:

```js
eventDirector.tension = Math.min(100, eventDirector.tension + VALUE);
```

No generar directamente un evento desde `checkNearMiss()`; el director debe decidir en su ventana de evaluación.

## 13. Integración con boss

Antes de `spawnBoss()`:

```js
primeBossAnticipation(bossPhase);
```

El telegraph del boss debe ser compatible con el que ya existe. No duplicar dos overlays.

## 14. Wave roles sin reescritura total

Añadir opcionalmente a cada entrada `WAVES[]`:

```js
roleHints: ['mastery', 'escalation']
```

No es necesario cambiar todas las entradas en la primera iteración.

El director puede inferir role por `waveIndex` mientras se estabiliza v4.

## 15. Variantes de wave

Una wave puede tener:

```js
variant: 'dense'
variant: 'split'
variant: 'escort'
variant: 'precision'
variant: 'reverse'
```

No introducir todas al mismo tiempo.

La variante debe ser una transformación pequeña sobre la wave base.

Ejemplos:

```js
applyWaveVariant('dense', context);
applyWaveVariant('precision', context);
```

## 16. No duplicar colisiones

Eventos que crean nuevas amenazas deben utilizar `checkCollisions()` y las convenciones existentes. No crear un segundo motor de colisión.

## 17. Pools

Si un evento crea objetos temporales con alta frecuencia, integrarlos en pools existentes.

No hacer:

```js
for (...) particles.push({ ... });
```

sin respetar el sistema de pooling existente.

## 18. LOW_FX y reducedMotion

La lógica del evento no puede depender de FX visuales para ser jugable.

Con reduced motion:

- quitar screen shake;
- reducir parallax;
- reducir confeti;
- conservar telegraph mediante otras señales legibles.

Con LOW_FX:

- reducir partículas;
- evitar `shadowBlur` caliente;
- no alterar ventanas de reacción.

## 19. Accesibilidad

Todos los eventos relevantes deben tener un nombre semántico.

Ejemplo:

```js
announce('Evento: Mensajero de datos');
```

No anunciar cada tick ni cada proyectil.

Respetar el throttle existente de `announce()`.

## 20. Daily Challenge

El director debe aceptar contexto Daily.

El challenge seed puede fijar:

- pesos de eventos;
- ruta permitida;
- variante de wave;
- pool de eventos.

No generar un Daily distinto dentro del mismo día.

## 21. Debug mode

Añadir un flag no persistente:

```js
const V4_DEBUG = false;
```

Cuando true, mostrar discretamente:

```text
EVT courier
ROLE escalation
INT 62
TEN 41
ROUTE alpha
```

Nunca activar por defecto.

## 22. Persistencia

No hacer persistentes todavía:

- `eventDirector.recentEvents`;
- intensidad;
- tensión;
- cooldowns;
- evento actual.

Sí puede persistir un futuro `discoveries`/`secrets`, usando el prefijo actual de localStorage.

No modificar el contrato de scores existentes.

## 23. Seed

Para partidas normales:

```js
const runSeed = Date.now() ^ ((Math.random() * 0xffffffff) >>> 0);
```

Para Daily: usar la semilla diaria existente.

Guardar la seed solo en memoria para la run actual salvo que exista una necesidad futura de replay.

## 24. Error handling

Un evento desconocido nunca debe congelar la partida.

```js
const handler = EVENT_HANDLERS[event.id];
if (!handler) {
  abortEvent('missing-handler');
  return;
}
```

Si `start()` lanza una excepción en debug/prototipo, el juego debe volver a `IDLE` y continuar la wave cuando sea posible.

## 25. Orden del loop

Mantener el orden actual de render/collisión.

Inyectar el director en una zona de actualización de estado:

```text
advanceClock
→ director update
→ player movement
→ ascension
→ bullets
→ enemies
→ boss
→ event entities
→ drops
→ particles
→ render
→ collisions
→ energy
```

Si un evento modifica enemigos, debe hacerlo antes de la comprobación de colisiones correspondiente.

## 26. Performance budget

V4 no debe producir una regresión perceptible a 60 fps en desktop.

Prioridades:

1. lógica O(n) sobre entidades existentes;
2. sin búsquedas repetidas de DOM en cada frame;
3. sin allocations masivas;
4. no añadir canvases adicionales;
5. no meter audio scheduling por entidad.

## 27. Telegráfico DOM vs Canvas

Preferir Canvas/floating text para feedback dentro de juego.

Usar DOM solo para:

- overlays;
- menú;
- accesibilidad;
- mensajes persistentes.

No crear un `<div>` por evento dentro del hot loop.

## 28. Orden de implementación en `index.html`

1. Añadir config V4.
2. Añadir estado `eventDirector`.
3. Añadir catálogo.
4. Añadir RNG/selection helpers.
5. Añadir telegraph.
6. Integrar con startGame/reset.
7. Integrar con cambio de wave.
8. Integrar con loop.
9. Implementar 3 eventos pequeños.
10. Testear.
11. Implementar 3-5 eventos adicionales.
12. Implementar rutas.
13. Implementar secretos.
14. Añadir boss anticipation.
15. Balancear.

## 29. Primera entrega funcional mínima

La primera versión de v4 debe funcionar con solo:

- Director.
- Pacing roles.
- 3 eventos: Courier, Leech, Precision Drill.
- Telegraph estándar.
- Anti-repeat.
- Pity counter.
- Métricas debug.
- Tests.

No intentar desarrollar los 10 eventos, rutas, secretos y bosses en el mismo commit.
