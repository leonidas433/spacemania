# 03 — Power-ups y Sistema de Sinergias

## Estado actual

```js
const POWERUP_TYPES = [
  {id:'double', label:'x2', color:'#ff6', duration:600, desc:'DOBLE DISPARO'},
  {id:'speed',  label:'>>', color:'#4ff', duration:500, desc:'VELOCIDAD'},
  {id:'guided', label:'⟳',  color:'#f4f', duration:400, desc:'MISIL GUIADO'},
];
```

Máximo 2 activos. No hay sinergias reales.

---

## 1. Objetivos del rediseño

- Mantener los 3 power-ups actuales como base.
- Añadir 2-3 power-ups nuevos diseñados para sinergizar.
- Implementar sinergias reales (1+1=3).
- Hacer que las combinaciones creen estilos de juego distintos.
- Mantener el límite de 2 power-ups activos (salvo excepciones muy raras).

---

## 2. Power-ups nuevos propuestos

| ID | Nombre | Efecto base | Duración | Color | Rol |
|----|--------|-------------|----------|-------|-----|
| `pierce` | Perforante | Las balas atraviesan 1 enemigo extra | ~9 s | `#fa4` | Limpieza de grupos |
| `burst` | Ráfaga | Cada cierto tiempo disparas un abanico de 3 balas | ~8 s | `#f84` | Control de área |
| `leech` | Data Leech | Al matar, pequeña chance de recuperar energía o extender power-ups | ~10 s | `#4f8` | Sostenibilidad |

**Nota:** Empezar implementando solo `pierce` y `burst`. `leech` puede ir en un sprint posterior.

---

## 3. Matriz de sinergias

### Sinergias prioritarias (implementar primero)

| Combinación | Nombre de la sinergia | Efecto emergente |
|-------------|-----------------------|------------------|
| **double + guided** | Barrage Guiado | Los dos misiles persiguen objetivos distintos. Si solo hay uno, ambos se concentran y hacen +25% daño. |
| **speed + double** | Ráfaga de Asalto | +35% cadencia extra mientras ambos están activos. Pequeño rastro de balas al moverse a alta velocidad. |
| **speed + guided** | Cazador de Élite | El misil gira más rápido y genera una mini-explosión al impactar. |
| **double + pierce** | Lluvia Perforante | Las dos balas perforan y mantienen la perforación. |
| **guided + pierce** | Lancero Digital | El misil guiado perfora y sigue buscando después de atravesar. |
| **speed + burst** | Tormenta Móvil | El abanico se dispara con más frecuencia mientras te mueves rápido. |

### Sinergia rara (3 power-ups o ítem especial)
- **Overclock Total**: solo posible con un power-up raro o al activar Ascensión + 2 power-ups.
- Efecto: disparo triple + velocidad extrema + misiles que rebotan 1 vez.
- Duración muy corta (4-5 s) + feedback visual intenso.

---

## 4. Implementación técnica de sinergias

### Detección
```js
function getActiveSynergy() {
  const active = Object.keys(activePowerups).filter(k => !k.includes('_'));
  if (active.length < 2) return null;
  const key = active.sort().join('+'); // ej: "double+guided"
  return SYNERGIES[key] || null;
}
```

### Aplicación
- Al activar el segundo power-up, se llama a `checkAndApplySynergy()`.
- Si existe sinergia:
  - Se muestra anuncio grande con el nombre.
  - Se aplica el modificador extra.
  - Se cambia el color/estilo de la nave o de las balas.
  - SFX especial.
- Al expirar cualquiera de los dos, se elimina el efecto de sinergia.

### Estructura de datos recomendada
```js
const SYNERGIES = {
  'double+guided': {
    name: 'BARRAGE GUIADO',
    color: '#f8f',
    onApply: (state) => { /* modificar comportamiento de balas */ },
    onRemove: (state) => { /* restaurar */ }
  },
  // ...
};
```

---

## 5. Feedback visual y sonoro de sinergias

- Anuncio centrado grande (similar a wave announce) con el nombre de la sinergia.
- Cambio de color del aura de la nave o del trail.
- Partículas especiales al activarse.
- SFX de “power chord” o subida de tono.
- En el HUD de power-ups, mostrar un icono o borde especial cuando hay sinergia activa.

---

## 6. Balance

| Riesgo | Mitigación |
|--------|------------|
| Sinergias demasiado fuertes | Duración más corta o consumo extra de energía |
| Jugador solo espera las buenas combos | Hacer que todas las combinaciones de 2 sean al menos interesantes |
| Complejidad de código | Empezar con solo 3 sinergias (double+guided, speed+double, speed+guided) |
| Romper el skill | Las sinergias dan poder ofensivo, pero no invulnerabilidad |

---

## 7. Orden de implementación

1. Refactorizar el sistema de power-ups para que sea fácil extender.
2. Implementar detección de sinergias.
3. Añadir las 3 sinergias prioritarias entre los power-ups actuales.
4. Añadir power-up `pierce`.
5. Añadir sinergias que involucren `pierce`.
6. (Opcional) Añadir `burst` y sus sinergias.
7. Feedback visual/sonoro completo.
