# 01 — Visión y Principios de Diseño

## Visión de SpaceMania 3.0

**Mantener:**
- Identidad de arcade shooter skill-based (mover + disparar + guiar misil)
- Single-file HTML5 (sin dependencias, sin build)
- Temática “pesadilla digital moderna”
- Controles actuales y accesibilidad ya implementada

**Añadir (inspirado en Vampire Survivors + Roguelites):**
- Meta-progresión ligera pero generosa
- Progreso garantizado aunque mueras
- Arco de poder claro dentro de cada partida
- Sinergias reales entre power-ups
- Más variedad de contenido y recompensas
- Juice y feedback exagerados en momentos clave

**No convertir en:**
- Un roguelite completo con builds complejas
- Un idle / auto-shooter puro
- Un juego con microtransacciones o dark patterns agresivos

---

## Principios de diseño (no negociables)

1. **Cada muerte debe dar algo**  
   El jugador nunca debe sentir que perdió el tiempo.

2. **1 + 1 = 3 en power-ups**  
   Las combinaciones deben crear estilos de juego distintos, no solo números más altos.

3. **Skill sigue siendo el rey**  
   La meta-progresión ayuda, pero no elimina la necesidad de esquivar y apuntar bien.

4. **Runs con arco emocional**  
   Débil → creciendo → momento de poder → tensión final.

5. **Single-file y rendimiento**  
   Todo debe caber en el archivo actual y mantener 60 fps.

6. **Legibilidad**  
   El jugador debe entender por qué se siente poderoso o por qué murió.

---

## Objetivos de retención medibles

| Métrica | Actual (estimado) | Objetivo 3.0 |
|---------|-------------------|--------------|
| Sesiones por jugador (primera semana) | Baja | +80-120% |
| % de jugadores que vuelven al día siguiente | Bajo | ≥ 35-40% |
| Tiempo medio por sesión | Variable | 12-25 min ideal |
| Sensación de “solo una más” | Débil | Fuerte |
| % de muertes que se sienten “justas + productivas” | Bajo | Alto |

---

## Lo que se mantiene intacto

- Core loop de combate (mover, disparar, guiar)
- Sistema de 3 HP de nave + escudo de 4 pips
- Combo multiplier
- Barra de energía
- Bosses cada 3 ciclos
- High scores locales
- Audio Web Audio API
- Controles (teclado, ratón, táctil, gamepad)
- Modo daltónico y reduced motion

---

## Filosofía de “capa ligera de roguelite”

No se añade:
- Generación procedural de niveles
- Builds permanentes complejas
- Inventario
- Árbol de habilidades profundo

Sí se añade:
- Moneda de meta-progresión
- Upgrades permanentes pequeños y claros
- Feedback de progreso al morir
- Modificadores de run opcionales
- Sinergias temporales potentes

El resultado debe sentirse como **un arcade shooter con esteroides de retención**, no como un roguelite disfrazado.
