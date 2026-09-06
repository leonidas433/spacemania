# 06 — Sprints y Prioridades de Implementación

## Filosofía de ejecución

- Cada sprint debe dejar el juego en un estado **jugable y mejor** que el anterior.
- Priorizar sistemas de retención (meta-progresión) antes que contenido nuevo.
- Mantener el single-file en todo momento.
- Probar en desktop y móvil después de cada sprint importante.

---

## Sprint 0 — Preparación (0.5-1 día)
- [ ] Crear rama o copia de seguridad del `index.html` actual
- [ ] Revisar que todos los sistemas existentes (logros, colorblind, gamepad, etc.) siguen funcionando
- [ ] Añadir comentarios claros de sección para los nuevos sistemas
- [ ] Definir las nuevas claves de localStorage

**Entregable:** base limpia y documentada para empezar a construir.

---

## Sprint 1 — Fundación de Retención (Prioridad máxima)
**Objetivo:** que morir ya no se sienta vacío.

- [ ] Sistema de Data Fragments (cálculo + guardado)
- [ ] Pantalla de Game Over rediseñada con fragments ganados
- [ ] Menú Hangar básico con 4-5 upgrades permanentes
- [ ] Integración de upgrades en el gameplay (hull, reactor, etc.)
- [ ] Feedback básico de fragments y compras

**Resultado esperado:** el jugador siente progreso real entre partidas.

---

## Sprint 2 — Power-ups y Sinergias
**Objetivo:** crear momentos de poder emergentes.

- [ ] Refactor del sistema de power-ups para extensibilidad
- [ ] Detección y aplicación de sinergias
- [ ] 3 sinergias prioritarias (double+guided, speed+double, speed+guided)
- [ ] Feedback visual y sonoro de sinergias
- [ ] Power-up nuevo: Pierce
- [ ] Sinergias que involucren Pierce

**Resultado esperado:** las combinaciones de power-ups se sienten distintas y satisfactorias.

---

## Sprint 3 — Arco de Poder y Near-miss
**Objetivo:** crear el “bullet heaven” moment y micro-recompensas.

- [ ] Barra de Ascensión (o sistema Overdrive)
- [ ] Efectos de Ascensión (disparo, aura, partículas)
- [ ] Near-miss detection + recompensa
- [ ] Integración con combo y fragments
- [ ] Tutorial/primera vez de Ascensión

**Resultado esperado:** cada run tiene un pico de poder claro y se siente más “jugosa”.

---

## Sprint 4 — Contenido y Variedad
**Objetivo:** más razones para volver y más variedad.

- [ ] Telegraph + gracia en bosses actuales
- [ ] 2-3 nuevas waves
- [ ] 1 boss nuevo
- [ ] Sistema de modificadores de run (3 modificadores iniciales)
- [ ] Daily Challenge básico (seed diaria + 1-2 tipos de desafío)

**Resultado esperado:** el contenido se siente más fresco y hay objetivos diarios.

---

## Sprint 5 — Juice y Pulido
**Objetivo:** maximizar la satisfacción sensorial.

- [ ] Mejoras de partículas y screen shake según contexto
- [ ] Todos los SFX nuevos
- [ ] Variación de música
- [ ] Celebraciones (nuevo récord, Ascensión, sinergias, daily)
- [ ] Ajustes de legibilidad en móvil
- [ ] Revisión de reduced motion y colorblind

**Resultado esperado:** el juego se siente premium y reactivo.

---

## Sprint 6 — Contenido extra y Meta a largo plazo (opcional)
- [ ] Resto de waves y bosses
- [ ] Galería de Amenazas (colección)
- [ ] Más upgrades en el Hangar
- [ ] Más tipos de Daily
- [ ] Logros nuevos relacionados con los sistemas añadidos
- [ ] Estadísticas lifetime

---

## Orden de prioridades absoluto (si el tiempo es limitado)

1. Data Fragments + Game Over mejorado + Hangar básico
2. Sinergias de los 3 power-ups actuales
3. Ascensión / Overdrive
4. Near-miss
5. Telegraph de bosses
6. Pierce + nuevas sinergias
7. Nuevas waves
8. Daily Challenge
9. Juice completo
10. Resto de contenido

---

## Criterios de “hecho” por sprint

Un sprint se considera terminado cuando:
- El juego se puede jugar de principio a fin sin crashes
- Los nuevos sistemas se entienden sin leer código
- No se ha roto la accesibilidad existente
- Se mantiene 60 fps en una máquina media
- Hay feedback visual/sonoro mínimo de las nuevas features
