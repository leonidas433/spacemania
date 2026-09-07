# SpaceMania v4 — EVENT DIRECTOR SPEC

## 1. Función

El `Event Director` es una capa de decisión por encima de las waves. No mueve directamente enemigos frame a frame. Decide **qué contexto especial puede ocurrir y cuándo**.

Debe ser determinista en estructura, aleatorio en selección y reproducible mediante seed cuando la partida lo necesite.

## 2. Estado mínimo

Añadir un único objeto global:

```js
let eventDirector = {
  seed: 0,
  wave: 0,
  cycle: 0,
  intensity: 0,
  tension: 0,
  lastEventId: null,
  recentEvents: [],
  cooldown: 0,
  majorCooldown: 0,
  wavesSinceMajor: 0,
  guaranteedWindow: 0,
  pityCounter: 0,
  active: null,
  history: [],
  route: 'alpha',
  routeFlags: {},
  stats: {
    eventsShown: 0,
    eventsCompleted: 0,
    eventsMissed: 0,
    secretsFound: 0,
    bonuses: 0
  }
};
```

No guardar timers como IDs de `setTimeout` para la lógica de simulación principal. Usar tiempo de simulación con `DT`.

## 3. Estados de evento

```text
IDLE
  ↓
ARMED
  ↓
TELEGRAPH
  ↓
ACTIVE
  ↓
RESOLVE
  ↓
COOLDOWN
  ↓
IDLE
```

Estados que terminan por daño, cambio de wave o boss deben resolver limpiamente antes de limpiar arrays.

## 4. Catálogo

Definir:

```js
const SPACE_EVENTS = [
  {
    id: 'courier',
    kind: 'bonus',
    minCycle: 1,
    minWave: 2,
    weight: 10,
    intensity: 1,
    duration: 3.5,
    cooldownWaves: 2,
    tags: ['skill', 'reward']
  }
];
```

Campos mínimos:

- `id`
- `kind`
- `minCycle`
- `minWave`
- `weight`
- `intensity`
- `cooldownWaves`
- `tags`
- `canRepeat`
- `requires`
- `excludes`
- `telegraphMs`
- `durationMs`

Las funciones de ejecución pueden estar en un mapa:

```js
const EVENT_HANDLERS = {
  courier: startCourierEvent,
  leech: startLeechEvent,
  precision_drill: startPrecisionDrillEvent
};
```

## 5. Ventanas de decisión

El director decide al principio de cada wave y puede hacer una segunda selección durante la wave si existe una ventana compatible.

No lanzar decisiones nuevas cada frame.

Frecuencia recomendada:

- planificación de wave: una vez;
- chequeo de evento oportunista: cada 250-500 ms mediante acumulador;
- evaluación de ruta: al terminar wave o al cumplir condición especial.

## 6. Intensidad

`intensity` debe representar presión emocional, no solo daño.

Escala 0-100.

Factores que suben intensidad:

- cantidad de enemigos;
- densidad de balas;
- velocidad relativa;
- boss/proximidad a boss;
- eventos de amenaza;
- pérdida de shield/hp;
- duración sin relief.

Factores que bajan intensidad:

- wave de relief;
- bonus corto;
- eliminación total de peligro;
- transición de wave;
- resolución satisfactoria de evento.

## 7. Tension budget

Usar un budget simple para impedir que el director encadene castigo.

```js
const V4_DIRECTOR = {
  firstMajorWave: 3,
  minMajorGapWaves: 2,
  maxHighIntensityWaves: 2,
  reliefAfterHighIntensity: true,
  maxThreatEventsPerCycle: 3,
  maxMajorEventsPerCycle: 2,
  rareBaseChance: 0.04,
  rareMaxChance: 0.14,
  pityAfterWaves: 4
};
```

Los valores iniciales son balanceables.

## 8. Anti-repetición

No permitir:

```text
A -> A
A -> A
A -> A
```

Un evento reciente debe recibir penalización fuerte de peso.

Ejemplo:

```js
function eventWeight(ev) {
  let w = ev.weight;
  if (eventDirector.lastEventId === ev.id) w *= 0.05;
  if (eventDirector.recentEvents.includes(ev.id)) w *= 0.35;
  return w;
}
```

No prohibir absolutamente todos los eventos repetidos: algunos eventos pueden regresar después de una separación suficiente.

## 9. Pity system

El juego no debe pasar demasiadas waves sin novedades.

Incrementar:

```js
eventDirector.pityCounter++;
```

Cuando alcanza `pityAfterWaves`, garantizar un evento de clase válida.

Esto no significa garantizar un evento peligroso.

Preferencia de garantía:

1. bonus;
2. discovery;
3. surprise;
4. threat solo si la intensidad actual es baja.

## 10. Probabilidad rara

Los eventos raros pueden depender de habilidad.

Base:

```js
p = rareBaseChance;
```

Bonificaciones posibles:

- near-miss streak;
- combo alto;
- Ascensión activada;
- secret flags.

Cap:

```js
p = Math.min(rareMaxChance, p);
```

Nunca convertir `p` en garantía de evento peligroso.

## 11. Selección ponderada

Usar RNG determinista por run:

```js
const rng = mulberry32(seed);
```

El director no debe llamar a `Math.random()` indiscriminadamente si Daily Challenge debe ser reproducible.

## 12. Event contract

Todo evento debe definir:

```js
{
  id,
  kind,
  canStart(context),
  start(context),
  update(DT, context),
  resolve(context),
  abort(reason, context),
  getAnnouncement(),
  getReward(context)
}
```

No es obligatorio usar clases. Mantener estilo vanilla del proyecto.

## 13. Contexto de decisión

Crear una función pura:

```js
function buildDirectorContext() {
  return {
    state,
    wave,
    cycle,
    score,
    combo,
    maxCombo,
    shipHp,
    shieldHp,
    energy,
    ascension,
    activePowerupIds: activePowerupIds(),
    activeSynergy,
    nearMisses,
    intensity: eventDirector.intensity,
    tension: eventDirector.tension,
    route: eventDirector.route,
    runModifier,
    dailyMode,
    dailyChallenge
  };
}
```

## 14. Categorías de eventos

### `minor`
Duración <= 5 s. Cambia una pequeña regla.

### `major`
Duración 5-15 s. Cambia la dinámica de la wave.

### `rare`
Evento especial de descubrimiento.

### `boss_setup`
Solo para preparar el boss.

## 15. Compatibilidad con waves

Un evento no reemplaza automáticamente `spawnWave()`.

Patrón recomendado:

```js
spawnWave(waveIndex);
const eventPlan = planWaveEvent(buildDirectorContext());
if (eventPlan) armEvent(eventPlan);
```

El evento puede:

- alterar posiciones;
- añadir un mini-enemigo;
- crear un objetivo bonus;
- alterar formación;
- producir un pequeño intervalo de relief;
- modificar temporalmente una propiedad de enemigos concretos.

## 16. Eventos no compatibles

El director debe poder rechazar un evento si:

- boss activo;
- playerHit acaba de ocurrir;
- Ascensión/Overclock Total está en fase crítica;
- pantalla ya contiene demasiados proyectiles;
- LOW_FX no permite cierta presentación, aunque la lógica siga pudiendo ejecutarse;
- otro evento mayor está activo;
- transición de wave;
- Daily Challenge tiene regla incompatible.

## 17. Rutas

`route='alpha'` por defecto.

Condiciones posibles para `eclipse`:

```js
combo >= 12
|| nearMissStreak >= 4
|| secretsFound >= 1
|| ascensionCount >= 2
```

No usar todas simultáneamente. Configurar condiciones por una tabla de rutas.

## 18. Secrets

Los secretos deben ser:

- detectables;
- opcionales;
- recuperables en otra run;
- catalogables en Threat Gallery o un futuro Discovery Log.

Nunca bloquear el progreso principal.

## 19. Telegráfico estándar

Crear utilidades:

```js
startEventTelegraph(event);
updateEventTelegraph(DT);
finishEventTelegraph();
announceEvent(event);
```

El telegraph debe afectar:

- audio;
- HUD/floating text;
- canvas FX ligero;
- eventualmente patrón/posición visual.

Debe respetar reduced motion.

## 20. Audio

No introducir nueva música completa para cada evento.

Usar pequeños motivos identificables:

- signal: 2-3 tonos;
- threat: nota grave/pulso;
- bonus: arpegio ascendente;
- secret: motivo extraño corto;
- boss setup: motivo actual de boss reutilizado/expandido.

Si el mensaje se comunica solo por sonido, llamar también a `announce()`.

## 21. Métricas internas v4

Durante desarrollo añadir un objeto:

```js
v4Metrics = {
  eventsById: {},
  eventStartCount: 0,
  eventCompleteCount: 0,
  eventAbortCount: 0,
  routeCounts: {},
  secretsFound: 0,
  meanEventsPerRun: 0,
  maxIntensity: 0,
  wavesWithoutEvent: 0
};
```

No mostrar al jugador en producción salvo un debug mode explícito.

## 22. Logging

En debug:

```js
console.debug('[V4 EVENT]', {
  id,
  wave,
  cycle,
  route,
  reason,
  seed
});
```

No loguear por frame.
