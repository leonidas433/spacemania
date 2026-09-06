# 02 — Sistemas Core (Meta-progresión, Progreso al morir, Arco de poder)

Estos son los sistemas de mayor impacto en retención. Se implementan antes que el contenido nuevo.

---

## 1. Moneda de Meta-progresión: Data Fragments

### Concepto
Al final de cada partida (muerte o victoria de ciclo), el jugador gana **Data Fragments** según su rendimiento.

### Fórmula de ganancia (propuesta)
```
Fragments = (score / 100) 
          + (maxWaveReached * 8) 
          + (maxCycleReached * 40) 
          + (totalKills * 0.5) 
          + (bossesDerrotados * 25)
          + bonus de combo máximo
```

- Mínimo garantizado: 15-20 fragments aunque mueras muy pronto.
- Se guarda en `localStorage` con la clave `LS_PREFIX + 'fragments'`.

### Uso de los Fragments
Se gastan en un **menú de Hangar / Upgrades** accesible desde el menú principal y desde la pantalla de Game Over.

---

## 2. Upgrades permanentes (Hangar)

Lista inicial de upgrades (todos comprables con Fragments):

| ID | Nombre | Coste base | Efecto | Máx nivel |
|----|--------|------------|--------|-----------|
| `hull` | Casco Reforzado | 80 | +1 HP máximo de nave (empieza en 3) | 2 |
| `reactor` | Reactor Eficiente | 60 | Energía se drena 12% más lento | 3 |
| `magnet` | Colector de Datos | 50 | Power-ups y escudos caen un poco más cerca | 2 |
| `combo_fuel` | Estabilizador de Combo | 70 | El timer de combo dura +0.6s por nivel | 3 |
| `start_shield` | Escudo de Emergencia | 120 | Empiezas la partida con 1 pip de escudo | 1 |
| `fragment_boost` | Analizador | 90 | +15% fragments ganados | 2 |
| `spare_life` | Vida de Reserva | 200 | +1 vida al empezar (máx 1) | 1 |

**Reglas:**
- Los costes suben ligeramente por nivel.
- Los efectos son modestos (nunca eliminan el skill).
- Se muestran con descripción clara y nivel actual.

---

## 3. Pantalla de Game Over rediseñada

### Debe mostrar siempre:
- Score final
- Wave y ciclo máximos alcanzados
- Kills totales de la run
- Tiempo de la partida
- **Data Fragments ganados** (número grande y animado)
- Combo máximo alcanzado
- Accuracy aproximada (si se trackea)
- Botones: “Otra partida”, “Hangar”, “Menú”

### Celebraciones
- Si se superó el best score → fanfarria + texto “¡NUEVO RÉCORD!”
- Si se desbloqueó un logro → toast
- Si se ganaron muchos fragments → animación de “datos absorbidos”

---

## 4. Arco de poder dentro de la run (“Ascensión”)

### Objetivo
Crear un momento claro de “ahora soy fuerte” similar al bullet heaven de Vampire Survivors.

### Mecánica propuesta: Barra de Ascensión
- Se llena al destruir enemigos y al mantener combos altos.
- Al llenarse (una vez por ciclo aproximadamente):
  - La nave entra en **Modo Ascensión** durante 8-12 segundos.
  - Efectos: disparo más rápido, pequeño aura, enemigos cercanos reciben daño lento, screen shake suave.
  - Anuncio grande: “ASCENSIÓN DIGITAL”.
- Después del modo, la barra se resetea y se puede volver a llenar (más difícil en ciclos altos).

### Alternativa más simple (si se quiere menos sistemas)
Tras derrotar un boss o alcanzar combo x6, se activa un “Overdrive” temporal de 6-8 segundos con efectos similares.

---

## 5. Near-miss y micro-recompensas

### Near-miss
- Si un enemigo o bala pasa a menos de X píxeles de la nave sin golpear:
  - Pequeño flash
  - +5-15 puntos
  - SFX sutil de “esquiva perfecta”
  - Contribuye un poco a la barra de Ascensión

### Micro-recompensas al matar
- Enemigos normales: chance baja de soltar un “mini-fragment” visual que se absorbe y da 1-3 fragments reales al final.
- Esto refuerza la sensación de progreso constante.

---

## 6. Persistencia (localStorage)

Nuevas claves:
```
LS_PREFIX + 'fragments'          // número total
LS_PREFIX + 'upgrades'           // objeto { hull: 1, reactor: 2, ... }
LS_PREFIX + 'stats'              // opcional: total kills lifetime, etc.
LS_PREFIX + 'ascension_seen'     // para tutorial de la barra
```

Todo debe migrar de forma segura si el jugador ya tiene datos antiguos.

---

## Orden de implementación de este documento

1. Sistema de Fragments + ganancia al morir
2. Pantalla de Game Over mejorada
3. Menú Hangar básico con 4-5 upgrades
4. Barra de Ascensión / Overdrive
5. Near-miss

Estos sistemas solos ya deberían mejorar significativamente la retención.
