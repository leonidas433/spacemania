# SpaceMania v4 — GAME DESIGN

## 1. Objetivo de experiencia

SpaceMania debe funcionar en tres niveles simultáneos.

### Micro
Cada 1-8 segundos ocurre algo que cambia la atención: kill peligroso, near-miss, drop, formación, telegraph, mini-evento.

### Meso
Cada 20-60 segundos la partida cambia de ritmo: bonus, amenaza especial, variante de wave, anomalía, preparación o mini-clímax.

### Macro
Cada ciclo debe contener contenido que el jugador no pueda predecir completamente antes de jugarlo.

## 2. Modelo de pacing

Cada wave recibe un `role` de pacing. El role no es necesariamente visible para el jugador.

Roles permitidos:

- `INTRO`: presenta o recuerda una familia.
- `MASTERY`: exige dominar una regla conocida.
- `ESCALATION`: aumenta presión.
- `EVENT`: contiene una anomalía principal.
- `COMBINATION`: combina dos familias o reglas.
- `CLIMAX`: intensidad alta y corta.
- `RELIEF`: baja presión y recompensa.
- `BONUS`: objetivo alternativo de puntuación/recompensa.
- `SECRET`: puede revelar contenido oculto.
- `PRE_BOSS`: prepara el boss.
- `BOSS`: boss.

No usar todos los roles en todos los ciclos. El director escoge una plantilla compatible con el progreso.

## 3. Plantilla de 12 waves

Una configuración inicial recomendada:

```text
W1 INTRO
W2 MASTERY
W3 ESCALATION
W4 EVENT
W5 COMBINATION
W6 RELIEF/BONUS
W7 ESCALATION
W8 EVENT/SECRET
W9 CLIMAX
W10 COMBINATION
W11 PRE-BOSS / RARE
W12 BOSS PREVIEW O CLIMAX
```

Importante: el boss actual aparece cada 2 ciclos; esta plantilla debe convivir con esa regla existente. En ciclos con boss, el tramo 11-12 debe preparar esa llegada. No cambiar la frecuencia de boss sin una decisión explícita de diseño.

## 4. Eventos por familias

### SURPRISE

Eventos que cambian momentáneamente lo que el jugador cree que está ocurriendo.

Ejemplos:

`MIMIC_DROP`

Un objeto aparentemente power-up aparece. Durante el último 20% de su recorrido revela si es recompensa real o trampa visible. Nunca mata instantáneamente.

`PHANTOM_FORMATION`

Una formación aparece parcialmente, desaparece y reaparece desplazada. El jugador recibe audio y silueta antes del segundo pase.

`GLITCH_DUPLICATE`

Una parte de enemigos produce una copia temporal durante 2-4 segundos. Las copias valen poco y tienen mayor vulnerabilidad.

`SIGNAL_LOST`

Durante una ventana corta desaparecen algunos elementos secundarios del HUD/FX, pero no información necesaria para evitar daño.

### BONUS

`COURIER`

Un enemigo mensajero cruza la pantalla. Si se elimina antes de escapar, deja un reward grande o un power-up garantizado.

`DATA_RUSH`

Micro-wave de baja amenaza con muchos mini-fragments y un objetivo de combo.

`PRECISION_DRILL`

Pocos enemigos, alto valor individual, bonus por destruir todos sin perder combo.

### THREAT

`LEECH`

Un enemigo de soporte potencia a otro enemigo. La prioridad táctica pasa a ser el soporte.

`HUNTER`

Un enemigo no dispara inmediatamente; marca la posición del jugador, emite telegraph y después realiza un ataque dirigido.

`SPLIT_WALL`

Una formación divide el espacio en dos zonas temporales, obligando a reposicionarse.

`BLACKOUT_BURST`

Micro-evento de 2-3 segundos con mayor densidad de proyectiles, anunciado con suficiente antelación.

### SECRET

`SOL_SIGNAL`

Una señal visual discreta aparece en un punto de la pantalla. Si el jugador la detecta y la destruye, desbloquea recompensa/registro.

`GHOST_FRAGMENT`

Solo aparece tras una secuencia de near-misses o combo alto. No es obligatorio para sobrevivir.

`UNKNOWN_TRANSMISSION`

Una transmisión corta aparece varias veces durante la partida. La tercera interacción/reacción puede abrir contenido especial.

## 5. Anticipación

Cada evento importante debe usar una secuencia:

```text
TELEGRAPH
  ↓
EXPECTATION
  ↓
REVEAL
  ↓
ACTION WINDOW
  ↓
PAYOFF
  ↓
SETTLE
```

Duraciones iniciales recomendadas:

- Telegráfico normal: 350-700 ms.
- Telegráfico peligroso: 600-1000 ms.
- Evento mayor: 1000-1800 ms de preparación.
- Después del clímax: 800-1500 ms de asentamiento cuando sea posible.

Los valores son de balance inicial, no absolutos.

## 6. Lo que debe ser desconocido

No ocultar controles básicos.

Ocultar o variar:

- qué evento aparecerá;
- qué variante tendrá una wave conocida;
- cuál de dos rutas futuras se activará;
- cuándo aparecerá un evento raro dentro de una ventana válida;
- qué secreto se puede descubrir.

## 7. Lo que nunca debe ser desconocido

- hitbox del jugador;
- colisiones básicas;
- daño inmediato sin telegraph;
- reglas de controles;
- existencia de una amenaza ya visible;
- coste de upgrades;
- reward permanente.

## 8. Near-miss como habilidad y no solo puntos

El near-miss existente debe tener una segunda función.

Cada near-miss suma un `tensionCharge` pequeño al director. Ese valor:

- aumenta ligeramente la posibilidad de un evento de habilidad;
- puede contribuir a eventos secretos;
- nunca debe forzar un evento peligroso inmediatamente.

Esto transforma una esquiva en una acción con futuro.

## 9. Combo como lenguaje de dominio

Combo alto debe poder modificar contexto, no solo score.

Ejemplos:

- combo >= 8: mayor probabilidad de Courier.
- combo >= 12: posibilidad de Ghost Fragment.
- combo >= 16: posibilidad de ruta de alta presión.

No hacer que el jugador pierda una recompensa permanente por fallar el combo.

## 10. Rutas

Introducir un máximo de 2 rutas en v4 inicial.

### Ruta Alpha

Estado estable, más recompensa y menor riesgo.

### Ruta Eclipse

Se activa mediante una condición de performance, por ejemplo combo máximo, Ascensión o destrucción de un objetivo secreto.

La ruta no debe cambiar controles. Cambia:

- composición de waves;
- frecuencia de eventos;
- variante de recompensa;
- boss variant o mini-boss, si procede.

La existencia de Eclipse se insinúa con señales durante la run pero no se explica por completo desde el inicio.

## 11. Boss anticipation

En el ciclo que contiene boss:

### 2 waves antes

Aparecen pequeñas señales de la familia del boss.

### 1 wave antes

Telegraph narrativo/visual inequívoco: "SEÑAL HOSTIL: NIVEL ...".

### Inicio boss

2 segundos de gracia como ya existe. Mantenerlo.

El objetivo es que el jugador piense "viene algo grande" y no "de repente me mató un boss".

## 12. Recompensas

Usar dos capas:

### Recompensa determinista

El jugador sabe que realizar correctamente una acción da una recompensa mínima.

### Bonus variable

Existe una oportunidad adicional de reward dependiendo de contexto, pero sin alterar la economía base de forma impredecible.

No usar RNG para ocultar poder de progresión permanente de forma agresiva.

## 13. Enemigos: menos tipos, más roles

No añadir 20 familias nuevas en v4.

Reutilizar las familias actuales como roles:

- `swarm`
- `sniper`
- `support`
- `charger`
- `splitter`
- `pusher`
- `tank`
- `chaos`

Una misma familia visual puede recibir un role contextual temporal.

## 14. Juicy feedback

Cada evento importante usa intención clara:

- anticipación: señal sonora + pequeña anomalía;
- impacto: flash/pitch/partículas;
- recompensa: floating text + sonido distintivo;
- settle: recuperar el ritmo.

Todas las nuevas señales respetan `reducedMotion`, `LOW_FX` y la región `#sr-live` cuando el evento tenga impacto únicamente auditivo.

## 15. Meta objetivo

El jugador debe tener cuatro motivos para otra partida:

```text
DOMINAR
DESCUBRIR
PROVOCAR
SUPERAR
```

"¿Puedo llegar más lejos?" es solo uno de ellos.
"¿Qué era aquella señal?" y "¿puedo volver a provocar aquella ruta?" son igualmente importantes.
