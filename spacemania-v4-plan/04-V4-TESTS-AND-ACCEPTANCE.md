# SpaceMania v4 — TEST PLAN & ACCEPTANCE

## 1. Objetivo

La v4 solo se acepta cuando aumenta variedad y anticipación sin romper las garantías de v3.3.

## 2. Regla principal

Los tests existentes deben seguir pasando.

La v4 añade tests; no reemplaza los actuales.

## 3. Unit/logic checks

### Director reset

Al iniciar una nueva run:

- `lastEventId === null`;
- `recentEvents` vacío;
- `active === null`;
- `pityCounter === 0`;
- route `alpha`;
- métricas reiniciadas.

### Anti-repeat

Una misma ID no debe seleccionarse inmediatamente dos veces salvo que `canRepeat === true`.

### Cooldown

Un evento no puede volver a activarse antes de su `cooldownWaves`.

### Pity

Después del número máximo configurado de waves sin evento, debe aparecer un evento elegible.

### Boss protection

No se debe lanzar un evento mayor incompatible durante boss.

### Event cleanup

Al terminar un evento:

```text
active -> null
cooldown > 0
```

No deben quedar entidades huérfanas.

## 4. Seed determinista

Con la misma seed + mismo contexto inicial:

```text
same selected event sequence
same route sequence
same rare event decisions
```

El Daily debe ser reproducible.

## 5. Fairness tests

Simular evento de amenaza y verificar que exista telegraph previo a la ventana de daño.

Ningún evento de muerte instantánea puede comenzar sin ventana de reacción.

## 6. Accesibilidad

Con `reducedMotion=true`:

- no screen shake del evento;
- no confeti obligatorio;
- telegraph sigue siendo reconocible;
- `announce()` recibe el nombre de eventos importantes.

Con colorblind:

- ningún estado nuevo depende solamente del color.

Con mercy hitbox:

- eventos no deben sobrescribir la hitbox existente.

## 7. Performance

Ejecutar las suites actuales y añadir un smoke test de:

- 5 ciclos completos;
- múltiples eventos;
- power-ups activos;
- sinergia activa;
- Ascensión;
- boss;
- cambios de ruta.

No debe haber excepciones JS no controladas.

## 8. Regression matrix

| Área | Debe seguir funcionando |
|---|---|
| Movimiento | Sí |
| Disparo | Sí |
| Guiado | Sí |
| Power-ups | Sí |
| Sinergias | Sí |
| Ascensión | Sí |
| Near-miss | Sí |
| Shield | Sí |
| Energía | Sí |
| Combo | Sí |
| Fragments | Sí |
| Hangar | Sí |
| Prestige | Sí |
| Daily | Sí |
| Boss | Sí |
| High scores | Sí |
| Gamepad | Sí |
| Touch | Sí |
| Accesibilidad | Sí |

## 9. Playtest protocol

Cada test humano debe registrar al menos:

```text
run_id
seed
wave_reached
cycle_reached
events_seen
events_remembered
secrets_found
route
max_combo
near_misses
boss_reached
score
death_reason
```

## 10. Preguntas cualitativas

Después de una run, preguntar sin explicar previamente los eventos:

1. ¿Qué creías que iba a pasar después?
2. ¿Hubo algún momento en el que pensaste "¿qué coño es esto?" en sentido positivo?
3. ¿Hubo una sorpresa que pareciera injusta?
4. ¿Recordabas algún evento concreto una partida después?
5. ¿Tenías una razón para probar otra partida aparte de mejorar la puntuación?
6. ¿Sentiste que tus decisiones cambiaban lo que aparecía después?

## 11. Señales de aburrimiento

Considerar fallo de diseño si, tras 3 runs:

- el jugador predice casi todas las waves;
- describe la partida como una repetición de la anterior;
- ignora los telegraphs porque nunca importan;
- los eventos parecen decoración;
- las recompensas no cambian decisiones;
- no existe curiosidad por la siguiente wave.

## 12. Señales de frustración

Considerar fallo si:

- el jugador muere sin saber qué ocurrió;
- el telegraph no da tiempo de reacción;
- eventos encadenados impiden jugar;
- la ruta rara castiga demasiado;
- la aleatoriedad parece manipulación.

## 13. Objetivos cuantitativos iniciales

No son benchmarks científicos; son objetivos de tuning.

### Variedad

En 10 runs normales de suficiente duración:

- >= 70% deben contener al menos un evento no visto en la run anterior inmediata.
- ningún evento individual debería dominar >35% de los eventos seleccionados, salvo eventos base/bonus diseñados para alta frecuencia.

### Repetición

En dos runs consecutivas con misma dificultad:

- la secuencia completa de eventos no debe coincidir salvo seed idéntica.

### Anticipación

Para eventos peligrosos:

- 100% deben tener telegraph.
- 0 muertes atribuibles a un evento sin ventana de reacción.

### Relief

Después de dos waves de intensidad alta:

- el director debe priorizar una ventana de baja/medio intensidad cuando no haya boss setup crítico.

### Secretos

En una muestra de playtestadores familiarizados con el juego:

- al menos una parte debe descubrir un secreto sin tutorial explícito.

Esto verifica que existe información gap, no que el secreto sea imposible.

## 14. Test de refresh-rate

El reloj v3.3 debe seguir siendo la referencia.

Comparar al menos:

- 60 Hz;
- 120 Hz/144 Hz si están disponibles.

La secuencia de eventos basada en tiempo debe permanecer equivalente dentro de una tolerancia razonable.

Nunca introducir lógica dependiente del número de refreshes.

## 15. Smoke test manual obligatorio

Ejecutar una run hasta wave >= 12 y comprobar:

```text
inicio
→ W1-W12
→ evento minor
→ evento bonus
→ evento threat
→ power-up
→ synergy
→ Ascensión
→ cambio de ciclo
→ boss
→ post-boss
→ game over
```

## 16. Acceptance checklist de v4

- [ ] Director aislado de la lógica básica de movimiento.
- [ ] Eventos seleccionados por pesos y contexto.
- [ ] Anti-repeat funcionando.
- [ ] Pity funcionando.
- [ ] Telegraph estándar funcionando.
- [ ] 3 eventos funcionales mínimos.
- [ ] Relief/Climax pacing funcionando.
- [ ] 2 rutas funcionales.
- [ ] 3 secretos funcionales.
- [ ] Boss anticipation funcionando.
- [ ] Daily determinista.
- [ ] Reduced motion compatible.
- [ ] Colorblind compatible.
- [ ] Screen reader announcements para eventos relevantes.
- [ ] Sin regresión de power-ups/sinergias.
- [ ] Sin regresión de Ascensión.
- [ ] Sin regresión de bosses.
- [ ] Sin fuga de entidades/event state.
- [ ] Sin nueva dependencia externa.
- [ ] Sin WebGL.
- [ ] Sin arrays recreados por frame.
- [ ] Todos los tests actuales pasan.
- [ ] Nuevos tests pasan.

## 17. Criterio final de aceptación

La pregunta final no es "¿hay más contenido?".

La pregunta es:

> ¿Un jugador que ya domina v3 siente curiosidad real por la siguiente wave porque sabe que puede ocurrir algo, pero no sabe exactamente qué?

Si la respuesta es no, v4 aún no está terminada.
