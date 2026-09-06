# 04 — Contenido Nuevo (Waves, Bosses, Modificadores, Daily)

## 1. Nuevas Waves (de 8 a 12)

Mantener las 8 actuales y añadir 4 nuevas con temática digital 2026:

| Wave | Nombre | Color | Shape | Patrón | Pts | Notas |
|------|--------|-------|-------|--------|-----|-------|
| 9 | DEEPFAKES | `#e4a` | deepfake | mirror / clonación | 100 | Enemigos que se duplican al morir (1 vez) |
| 10 | SPAM BOTS | `#a4f` | bot | swarm agresivo | 110 | Disparan más balas pequeñas |
| 11 | VIRAL MEMES | `#f4a` | meme | zigzag caótico | 120 | Al morir empujan ligeramente al jugador |
| 12 | SINGULARITY | `#fff` | singularity | chaos + growth | 150 | Enemigos que crecen si no se matan rápido |

**Implementación:**
- Añadir al array `WAVES`.
- Crear las funciones de dibujo correspondientes en `drawShape()`.
- Ajustar la curva de dificultad para que el salto a las nuevas waves no sea injusto.

---

## 2. Nuevos Bosses / Fases

Actuales:
1. Mega Smartphone
2. Crypto Titan
3. AI Overlord

**Añadir:**
4. **Shadowban Phantom** — se vuelve parcialmente invisible, teleporta, dispara desde ángulos inesperados.
5. **Quantum Algorithm** — se divide en 2-3 copias más pequeñas en la segunda fase.

**Mejoras a bosses existentes:**
- Telegraph claro (ojos/cañones se iluminan 0.5-0.7 s antes de disparar).
- Ventana de gracia de 1.5-2 s al aparecer (ya estaba en el plan anterior, confirmar que esté activa).
- Animación de muerte más elaborada (más partículas + screen flash).

---

## 3. Modificadores de Run (Run Modifiers)

Al empezar una partida (después de elegir dificultad), hay una pequeña probabilidad (o siempre en modo “Desafío”) de que se active 1 modificador:

| Modificador | Efecto | Compensación |
|-------------|--------|--------------|
| **Gravity Flux** | La nave cae ligeramente más rápido | +15% puntos |
| **Overclocked Enemies** | Enemigos más rápidos | +20% points + más fragments |
| **Sparse Drops** | Menos power-ups | +25% puntos |
| **Glass Cannon** | Nave tiene 1 HP menos pero +30% daño | Alto riesgo/recompensa |
| **Data Rain** | Más fragments visuales | — |

Los modificadores se anuncian al inicio de la partida y se muestran en el HUD.

---

## 4. Daily Challenge

### Mecánica
- Cada día (basado en fecha local) hay un desafío fijo.
- Se genera con una seed diaria (fecha → seed).
- Ejemplo de desafíos:
  - Solo power-up Guided disponible
  - Enemigos con +40% velocidad
  - Empezar con 1 vida
  - Wave especial del día
  - Combo mínimo requerido para puntuación doble

### Recompensas
- Fragments extra al completar el daily.
- Leaderboard local del daily (top 5 del día).
- Logro por completar X dailies.

### Implementación
```js
function getDailySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth()+1) * 100 + d.getDate();
}
```

---

## 5. Colección de Amenazas (opcional pero recomendable)

- Al derrotar un tipo de enemigo por primera vez, se desbloquea en una “Galería de Amenazas Digitales”.
- Muestra sprite + nombre + lore corto (1-2 frases).
- Completar la colección da un logro y un pequeño bonus permanente (ej. +5% fragments).

Esto añade un objetivo de colección a largo plazo sin complicar el gameplay.

---

## 6. Orden de implementación de contenido

1. Telegraph y gracia en bosses actuales
2. 2 nuevas waves (Deepfakes + Spam Bots)
3. 1 boss nuevo
4. Sistema de modificadores de run (empezar con 3)
5. Daily Challenge básico
6. Resto de waves y bosses
7. Galería de colección
