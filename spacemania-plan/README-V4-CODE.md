# SpaceMania v4 — INSTRUCCIONES PARA CODE

## Misión

Implementa SpaceMania v4 sobre la versión existente, sin reescribir el juego.

Lee antes de modificar:

- `00-V4-MASTER-PLAN.md`
- `01-V4-GAME-DESIGN.md`
- `02-V4-EVENT-DIRECTOR.md`
- `03-V4-TECHNICAL-SPEC.md`
- `04-V4-TESTS-AND-ACCEPTANCE.md`
- `AGENTS.md`
- `README.md`

## Regla principal

No añadas simplemente "más enemigos". La misión es hacer que el jugador anticipe y quiera descubrir la siguiente situación.

## Secuencia de trabajo

### Paso 1
Audita el estado real de `index.html`, tests y documentación antes de editar.

### Paso 2
Implementa solo la fundación del Event Director.

Debe incluir:

- estado;
- seed;
- selección ponderada;
- anti-repeat;
- cooldown;
- pity;
- intensidad;
- telegraph;
- reset limpio.

Ejecuta tests.

### Paso 3
Añade tres eventos mínimos:

1. `courier` — bonus de skill.
2. `leech` — amenaza de prioridad.
3. `precision_drill` — micro-wave de precisión.

Los tres deben reutilizar entidades, scoring, audio, colisiones y pooling existentes.

Ejecuta tests.

### Paso 4
Añade pacing roles y relief/climax.

No cambies todavía todos los valores de dificultad base.

Ejecuta tests.

### Paso 5
Añade eventos sorpresa y rare events.

Ejecuta tests.

### Paso 6
Añade dos rutas y tres secretos.

Ejecuta tests.

### Paso 7
Añade boss anticipation.

Ejecuta tests.

### Paso 8
Haz playtest automatizado/manual y ajusta probabilidades.

## Prohibiciones

No:

- separar `index.html` en módulos;
- introducir React/Vue/Phaser/etc.;
- migrar a WebGL;
- crear sistema de loot box;
- meter recompensas permanentes puramente aleatorias;
- introducir muerte sin telegraph;
- usar timers de gameplay dependientes de refresh rate;
- crear arrays nuevos por frame;
- duplicar sistema de scoring;
- duplicar sistema de colisiones;
- duplicar sinergias;
- romper accesibilidad.

## Criterio de implementación

Cada evento debe responder a estas 6 preguntas antes de codificarse:

1. ¿Qué cambia?
2. ¿Por qué el jugador debe preocuparse?
3. ¿Cómo sabe que viene?
4. ¿Qué puede hacer para responder?
5. ¿Qué recompensa o consecuencia existe?
6. ¿Cómo termina limpiamente?

Si no puedes responderlas, no implementes ese evento todavía.

## Criterio de código

Mantén funciones pequeñas y compatibles con el estilo existente.

Preferir:

```js
planWaveEvent(context)
startEvent(event, context)
updateEvent(DT, context)
resolveEvent(event, context)
```

sobre una única función gigantesca.

No convertir el director en una segunda máquina de juego.

## Criterio de UX

El jugador no necesita conocer el nombre técnico de "Event Director".

Debe percibir:

```text
SEÑAL
→ EXPECTATIVA
→ EVENTO
→ DECISIÓN
→ RECOMPENSA / CONSECUENCIA
→ NUEVA EXPECTATIVA
```

## Resultado esperado

La versión v4 debe conservar todo lo bueno de v3.3 y añadir una propiedad nueva:

> **La próxima wave deja de sentirse como una fila de casillas conocidas y empieza a sentirse como una situación que todavía puede sorprender al jugador.**

Al terminar cada fase, actualiza los tests y deja evidencia en el commit de qué reglas fueron implementadas.
