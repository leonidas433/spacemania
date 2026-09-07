# SpaceMania v4 — MASTER PLAN

## Propósito

SpaceMania v4 no es una reescritura. Es una evolución de v3.3.0 cuyo objetivo principal es eliminar la sensación de rutina y crear **anticipación por la siguiente oleada, evento y descubrimiento**.

El principio rector es:

> El jugador debe saber que algo puede ocurrir, pero no saber exactamente cuándo ni qué variante será hasta que haya suficiente información para reaccionar.

La sorpresa debe ser **justa**, legible y causada por el juego, nunca arbitraria.

## Estado de partida que v4 debe conservar

La implementación parte de la arquitectura actual del repositorio:

- Un único `index.html`.
- JavaScript + Canvas 2D + Web Audio API.
- Sin framework, bundler ni dependencias de runtime.
- Reloj de simulación v3.3 basado en `DT`.
- 12 waves por ciclo.
- 5 power-ups y sistema de sinergias.
- Ascensión y Overclock Total.
- Near-miss.
- Data Fragments + Hangar + Ascensión de Flota.
- Modificadores de run + Daily Challenge.
- Threat Gallery.
- Bosses cada 2 ciclos.
- Pools de objetos, LOW_FX y accesibilidad.
- 98 checks existentes y CI.

No eliminar ni degradar ninguna de estas funciones salvo que un test demuestre que una nueva regla las contradice.

## Problema que resuelve v4

Actualmente el jugador aprende demasiado pronto la secuencia general: wave -> mismos enemigos -> dificultad creciente -> boss en una cadencia conocida. Aunque existan power-ups, sinergias y bosses, la macroestructura sigue siendo predecible.

La v4 añade un **Event Director** capaz de modificar el desarrollo de una partida sin convertirla en un roguelike caótico.

## Resultado esperado

Después de jugar varias partidas, el jugador debe pensar:

- "Creo que va a pasar algo."
- "¿Qué será esta vez?"
- "Esto no me había salido así."
- "La próxima partida voy a intentar provocar aquella ruta/evento."

Debe desaparecer la sensación:

> "Ya sé qué viene ahora."

## Los 5 pilares v4

### 1. Anticipación

Todo evento importante tiene una pre-señal: audio, texto, icono, anomalía visual, cambio de formación o patrón.

### 2. Variación controlada

El núcleo reconocible de una wave permanece. La variación afecta composición, comportamiento, drops, objetivo u orden de micro-eventos.

### 3. Sorpresa justa

Nunca se permite una muerte que dependa de información imposible de obtener antes de la colisión.

### 4. Maestría

La habilidad del jugador puede aumentar la probabilidad de recibir eventos raros, desbloquear rutas o conseguir recompensas superiores.

### 5. Descubrimiento

Debe existir contenido que el jugador no vea en su primera partida y que pueda descubrir mediante observación, rendimiento y experimentación.

## Regla de distribución

Usar como heurística inicial, no como ley matemática:

- 70% estructura reconocible.
- 20% variación contextual.
- 10% sorpresa fuerte/raridad.

La proporción se ajusta mediante playtest.

## Arquitectura macro v4

```text
START RUN
   |
   v
RUN DIRECTOR
   |
   +--> WAVE PLAN
   |
   +--> INTENSITY TRACKER
   |
   +--> EVENT DIRECTOR
   |       +--> SURPRISE
   |       +--> BONUS
   |       +--> THREAT
   |       +--> SECRET
   |
   +--> ROUTE DIRECTOR
   |
   +--> TELEGRAPH SYSTEM
   |
   +--> REWARD CONTEXT
   |
   v
WAVE / BOSS
   |
   v
POST-WAVE FEEDBACK
   |
   +--> discoveries
   +--> route state
   +--> event history
   +--> pacing state
   |
   v
NEXT WAVE
```

## Cadencia objetivo de una partida

No se busca aumentar dificultad continuamente. Se busca crear una forma de onda emocional:

```text
ORIENTACIÓN
    ↓
ESCALADA
    ↓
TENSIÓN
    ↓
MICRO-CLÍMAX
    ↓
ALIVIO / RECOMPENSA
    ↓
NOVEDAD
    ↓
ESCALADA
    ↓
PRE-BOSS
    ↓
BOSS
```

Después del boss debe existir una pequeña ventana de recuperación antes de volver a escalar.

## Fases de implementación

### Fase 1 — Fundaciones

Implementar estados del director, historial, cooldowns, intensidad y telegraph sin alterar todavía las reglas de las waves existentes.

### Fase 2 — Eventos

Añadir 8-12 eventos pequeños y 3-4 eventos mayores.

### Fase 3 — Wave roles

Convertir la secuencia fija de 12 waves en una secuencia con roles de pacing sin cambiar obligatoriamente sus familias visuales.

### Fase 4 — Secretos y rutas

Añadir al menos 3 eventos secretos y 2 decisiones/rutas desbloqueables por rendimiento.

### Fase 5 — Boss anticipation

Foreshadow del boss 1 wave antes y variantes condicionadas por la partida.

### Fase 6 — Balance

Medir frecuencia de eventos, muertes, duración, score, uso de power-ups, Ascensión y repetición de runs.

## Reglas que NO se deben violar

1. No introducir loot boxes.
2. No usar dinero real.
3. No crear recompensas de tipo casino.
4. No hacer que la progresión permanente dependa de azar puro.
5. No eliminar la legibilidad visual.
6. No introducir eventos simultáneos que oculten amenazas críticas.
7. No resetear progreso del jugador por sorpresa.
8. No romper `DT` con nuevos timers basados directamente en refrescos.
9. No crear arrays nuevos por frame en el hot loop.
10. Mantener todas las rutas de kill/scoring existentes (`killEnemy()` / `addScore()`).
11. Mantener accesibilidad, reduced motion, colorblind, mercy hitbox y anuncios de voz.
12. No convertir SpaceMania en un roguelike complejo con controles nuevos.

## Definición de éxito

V4 está aceptada cuando un jugador que ya conoce las 12 waves no pueda predecir con certeza la secuencia de micro-eventos de una partida, pero pueda explicar retrospectivamente por qué cada evento ocurrió y cómo podía haber reaccionado.

## Orden de lectura para Code

1. Este documento.
2. `01-V4-GAME-DESIGN.md`.
3. `02-V4-EVENT-DIRECTOR.md`.
4. `03-V4-TECHNICAL-SPEC.md`.
5. `04-V4-TESTS-AND-ACCEPTANCE.md`.

No implementar nada que contradiga estas cinco piezas.
