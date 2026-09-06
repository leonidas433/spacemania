# 07 — Métricas, Balance y Iteración

## 1. Cómo medir si el plan está funcionando

Como es un juego single-player local, las métricas se basan en:

### Datos que ya se pueden trackear (o añadir fácilmente)
- Best score
- Fragments totales acumulados
- Upgrades comprados
- Número de partidas jugadas (contador simple en localStorage)
- Max wave / max cycle alcanzado lifetime
- Logros desbloqueados
- Dailies completados

### Señales cualitativas (las más importantes al principio)
- ¿El jugador dice “solo una más”?
- ¿Después de morir mira cuántos fragments ganó?
- ¿Entra al Hangar a comprar algo?
- ¿Se emociona cuando sale una sinergia o la Ascensión?
- ¿Vuelve al día siguiente?

---

## 2. Balance de meta-progresión

### Reglas de oro
- Los upgrades permanentes **ayudan**, pero no eliminan la necesidad de skill.
- Un jugador nuevo sin upgrades debe poder llegar al menos al ciclo 2 en Normal.
- Un jugador con todos los upgrades no debe sentirse invencible en Difícil.
- El coste de los upgrades debe sentir que “vale la pena el esfuerzo”, no que es un grind eterno.

### Ajustes típicos
| Problema | Solución |
|----------|----------|
| Se sienten demasiado fuertes | Reducir efecto o subir coste |
| Nadie los compra | Bajar coste o hacer el efecto más visible |
| El early game se vuelve trivial | Limitar los primeros upgrades o hacer que desbloqueen más tarde |
| El late game no escala | Añadir upgrades de “calidad de vida” en lugar de solo poder |

---

## 3. Balance de sinergias y Ascensión

- Las sinergias deben sentirse poderosas pero no “gano sin pensar”.
- Ascensión debe ser un momento de poder, no un estado permanente.
- Si los jugadores solo juegan para activar sinergias y se frustran cuando no salen, aumentar ligeramente la frecuencia de power-ups o la duración.

### Preguntas de test
- ¿Una sinergia permite ignorar patrones de enemigos?
- ¿La Ascensión hace que el boss sea trivial?
- ¿El jugador se siente estafado cuando no consigue la combinación que quería?

---

## 4. Curva de dificultad

Mantener la curva progresiva actual, pero:

- Suavizar el salto entre ciclo 1 y ciclo 2 si sigue siendo brusco.
- Las nuevas waves (9-12) deben introducir mecánicas nuevas, no solo más velocidad.
- Los modificadores de run deben compensar claramente el aumento de dificultad con más puntos/fragments.

---

## 5. Proceso de iteración recomendado

1. Implementar el sistema.
2. Jugar 10-15 partidas uno mismo (y si es posible, dar a 2-3 personas).
3. Anotar:
   - Momentos de frustración
   - Momentos de “¡hostia, qué bueno!”
   - Si se entiende el nuevo sistema sin explicación
4. Ajustar números (duraciones, costes, porcentajes).
5. Repetir.

---

## 6. Checklist de balance final (antes de llamar 3.0)

- [ ] Un jugador nuevo entiende Fragments y Hangar en la primera muerte
- [ ] Las sinergias se activan con frecuencia suficiente para ser emocionantes
- [ ] Ascensión se siente como recompensa, no como requisito
- [ ] El juego sigue siendo desafiante en Difícil con todos los upgrades
- [ ] No hay soft-locks ni estados rotos
- [ ] 60 fps estables con muchas partículas y enemigos
- [ ] Reduced motion y colorblind siguen funcionando
- [ ] El archivo sigue siendo un solo `index.html` razonable en tamaño

---

## 7. Posibles expansiones futuras (post-3.0)

- Más upgrades y sinergias
- Modo Endless con ranking
- Más dailies y modificadores
- Leaderboard global (requeriría backend)
- Skins de nave desbloqueables
- Modo 2 jugadores local (ya estaba en el roadmap original)

Estas se contemplan solo después de que el core de 3.0 esté sólido y divertido.
