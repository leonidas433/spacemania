# 05 — Juice, Feedback y Game Feel

El “juice” es lo que hace que cada acción se sienta satisfactoria. Vampire Survivors y los mejores roguelites exageran deliberadamente el feedback.

---

## 1. Principios de Juice para SpaceMania

- Cada kill debe sentirse mejor que el anterior cuando hay combo alto.
- Las recompensas importantes (sinergia, Ascensión, nuevo récord, fragments) deben tener un momento visual y sonoro claro.
- El feedback debe ser legible incluso en el caos.
- Respetar `reducedMotion` (desactivar o reducir screen shake, partículas excesivas, etc.).

---

## 2. Mejoras de feedback por sistema

### Combate y kills
- **Combo alto (x4+)**: partículas extra, screen shake más fuerte, tono de SFX más agudo.
- **Kill de near-miss**: flash blanco pequeño + SFX de “perfect dodge”.
- **Kill con sinergia activa**: color de partículas distinto + texto flotante con el nombre de la sinergia.
- **Boss hit**: número de daño más grande y con más peso.

### Power-ups y sinergias
- Al recoger power-up: animación de absorción + SFX claro.
- Al activar sinergia: anuncio grande + cambio de aura de la nave + “power chord”.
- Al expirar power-up: SFX de “power down” suave (evitar sorpresas).

### Meta-progresión
- Al ganar fragments en Game Over: animación de números subiendo + sonido de “datos absorbiéndose”.
- Al comprar upgrade en Hangar: confirmación clara + pequeño efecto.
- Nuevo récord: fanfarria + texto dorado parpadeante.

### Ascensión / Overdrive
- Activación: screen flash + anuncio + cambio de color de la nave + aura.
- Durante el modo: partículas constantes suaves + sonido de “hum” de poder.
- Finalización: fade out del efecto + SFX de “cooldown”.

---

## 3. Audio (Web Audio API)

### Nuevos SFX necesarios
- Activación de sinergia
- Near-miss / perfect dodge
- Ascensión on / off
- Fragments ganados
- Compra de upgrade
- Power-up expirando
- Telegraph de boss (tono de advertencia)

### Música
- Mantener la chiptune generativa.
- Añadir variación de modo (mayor → menor o más tensa) a partir del ciclo 3 o durante bosses.
- Subir ligeramente la intensidad durante Ascensión.

---

## 4. Visuales

### Partículas
- Cap estricto (ya existía en el plan anterior: máx 300).
- Más variedad de formas según el tipo de kill (combo, sinergia, boss).
- Partículas de “datos” (cuadrados o bits) cuando se ganan fragments.

### Screen shake
- Proporcional a la importancia del evento.
- Respetar reduced motion (multiplicar por 0 o 0.3).

### Textos flotantes
- Usar el sistema `addFloat` existente.
- Añadir textos para: near-miss, sinergia, Ascensión, fragments.

### HUD
- Barra de Ascensión visible y clara.
- Indicador de sinergia activa (borde o icono especial en los badges de power-up).
- Timer visual de power-ups más evidente (ya parcialmente implementado).

---

## 5. Celebraciones especiales

| Evento | Feedback |
|--------|----------|
| Nuevo best score | Fanfarria + texto dorado + confeti de partículas |
| Primera Ascensión de la partida | Anuncio + tutorial corto la primera vez |
| Sinergia activada | Anuncio + aura |
| Boss derrotado | Explosión elaborada + fragments extra visuales |
| Daily completado | Texto especial + fragments bonus |

---

## 6. Orden de implementación de Juice

1. Mejorar feedback de combo alto y kills.
2. Feedback de activación/expiración de power-ups.
3. Feedback completo de sinergias.
4. Feedback de Ascensión.
5. Animación de fragments en Game Over.
6. Telegraph visual de bosses.
7. Variación de música por ciclo/boss.
8. Pulido final de partículas y shake.
