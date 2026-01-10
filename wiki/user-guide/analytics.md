# Dashboard de Analítica - Guía de Usuario

## 📊 ¿Qué es el Dashboard de Analítica?

El Dashboard de Analítica es tu **centro de control financiero**, donde puedes visualizar de un vistazo:
- Cuánto dinero tienes en total
- Cuánto has invertido y cuánto tienes disponible
- Si estás ganando o perdiendo dinero
- Qué inversiones te están dando mejores resultados
- Cómo ha evolucionado tu portfolio con el tiempo

Es como el resumen ejecutivo de tus inversiones, todo en una sola pantalla.

---

## 🎯 ¿Para qué sirve?

El dashboard te ayuda a:
1. **Tomar decisiones informadas** sobre dónde invertir más
2. **Identificar inversiones problemáticas** que están perdiendo dinero
3. **Ver tu progreso** a lo largo del tiempo
4. **Entender tu estrategia** (¿estás más en criptos, acciones o ETFs?)
5. **Medir tu éxito** con estadísticas claras (tasa de acierto, rentabilidad)

---

## 📖 Conceptos Básicos

### Balance de Cuenta

**Balance Total**: Todo el dinero que has depositado (menos los retiros).
- Ejemplo: Depositaste 10.000€, retiraste 1.000€ → Balance: 9.000€

**Dinero Invertido**: El dinero que actualmente está "trabajando" en operaciones abiertas.
- Ejemplo: Compraste 0.1 BTC a 45.000€ → Invertido: 4.500€

**Disponible**: El dinero que tienes libre para nuevas inversiones.
- Ejemplo: Balance 9.000€ - Invertido 4.500€ = Disponible 4.500€

> 💡 **Regla de oro**: Balance Total = Dinero Invertido + Disponible

---

### Rendimiento (P&L)

**P&L** = Profit & Loss (Ganancias y Pérdidas)

**P&L Realizado**: Dinero ganado o perdido en operaciones que ya cerraste.
- Ejemplo: Compraste 1 acción a 100€, la vendiste a 120€ → P&L realizado: +20€

**P&L No Realizado**: Ganancia o pérdida "en papel" de operaciones abiertas.
- Ejemplo: Compraste a 100€, ahora vale 110€ → P&L no realizado: +10€
- No es dinero real hasta que vendas

**P&L Total**: La suma de realizado + no realizado.

**Porcentaje de P&L**: Cuánto has ganado/perdido respecto a lo invertido.
- Ejemplo: Invertiste 1.000€, ganaste 100€ → P&L: +10%

---

### Win Rate (Tasa de Acierto)

Porcentaje de operaciones cerradas que fueron ganadoras.

**Ejemplo:**
- Operaciones ganadoras: 8
- Operaciones perdedoras: 2
- Total operaciones: 10
- Win Rate: 80%

> 💡 Un win rate alto (>60%) generalmente indica buena estrategia.

---

## 🚀 Cómo Usar el Dashboard

### Acceder al Dashboard

1. Haz clic en **"Dashboard"** en el menú lateral
2. El sistema carga automáticamente tus datos
3. Por defecto, muestra los últimos **30 días**

---

### Cambiar el Periodo de Tiempo

En la parte superior derecha, puedes filtrar por:
- **7d**: Última semana
- **30d**: Último mes (por defecto)
- **90d**: Últimos 3 meses
- **1 año**: Último año
- **Todo**: Desde que empezaste

**¿Qué cambia al seleccionar un periodo?**
- Rendimiento (P&L)
- Ranking de símbolos
- Evolución del portfolio

**¿Qué NO cambia?**
- Balance de cuenta (siempre muestra el actual)
- Distribución por producto (siempre muestra operaciones abiertas)

**Ejemplo práctico:**
Si seleccionas "7d", verás:
- P&L de operaciones cerradas en los últimos 7 días
- Símbolos que has operado en los últimos 7 días
- Evolución de tu portfolio día a día

---

## 📈 Componentes del Dashboard

### 1. Tarjetas de Balance

**Balance Total**
- Color: Neutral (gris/azul)
- Muestra: Total en tu cuenta

**Dinero Invertido**
- Color: Neutral
- Muestra: Suma de todas las inversiones activas

**Disponible**
- Color: Neutral
- Muestra: Efectivo libre para invertir

**Ejemplo visual:**
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Balance Total   │  │ Invertido       │  │ Disponible      │
│   10,000.00 €   │  │   6,500.00 €    │  │   3,500.00 €    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

### 2. Resumen de Rendimiento

Muestra tu desempeño global en el periodo seleccionado.

**P&L Total**
- Verde: Estás ganando
- Rojo: Estás perdiendo
- Número grande: Cantidad en euros
- Porcentaje: Rentabilidad

**Operaciones**
- Ganadoras: Cuántas cerraste con beneficio
- Perdedoras: Cuántas cerraste con pérdida
- Win Rate: % de acierto (con barra de progreso)

**Ejemplo:**
```
┌────────────────────────┐
│ Rendimiento Global     │
│                        │
│ P&L Total              │
│ +570.80 € (+8.78%)     │  ← Verde porque es positivo
│                        │
│ P&L Realizado: 450.50€ │
│ P&L No Realiz: 120.30€ │
│                        │
│ 12 ganadoras / 3 perdedoras
│ Win Rate: 80%          │
│ ████████░░ 80%         │  ← Barra de progreso
└────────────────────────┘
```

---

### 3. Distribución por Producto

Gráfico de dona que muestra cómo distribuyes tu dinero.

**Tipos de producto:**
- 🟠 **Criptos** (naranja): Bitcoin, Ethereum, etc.
- 🔵 **Acciones** (azul): Apple, Tesla, etc.
- 🟢 **ETFs** (verde): Fondos indexados

**¿Para qué sirve?**
- Ver si estás diversificado o concentrado
- Identificar sesgos (ej: 80% en crypto = alto riesgo)

**Ejemplo:**
```
         Distribución
    ╭─────────────────╮
   ╱   Criptos 60%     ╲
  │                     │
  │   Acciones 30%     │
   ╲                   ╱
    ╰─  ETFs 10%  ────╯

Criptos:   4,000€ (60%)
Acciones:  2,000€ (30%)
ETFs:        667€ (10%)
```

> 💡 **Consejo**: Una cartera equilibrada reduce el riesgo.

---

### 4. Evolución del Portfolio

Gráfico de área que muestra cómo ha crecido tu inversión.

**Dos líneas:**
- 🔵 **Invertido** (azul): Dinero que has metido
- 🟢 **Valor Portfolio** (verde): Valor actual de mercado

**¿Qué significa cada escenario?**

**Línea verde SOBRE azul:**
```
Valor ────────────────  ← Estás ganando
Invertido ─────────────
```
→ Tu portfolio vale más de lo que invertiste

**Líneas iguales:**
```
Valor/Invertido ───────  ← Punto muerto
```
→ Ni ganas ni pierdes

**Línea verde BAJO azul:**
```
Invertido ─────────────
Valor ─────────────────  ← Estás perdiendo
```
→ Tu portfolio vale menos

**Ejemplo práctico:**
Si invertiste 5.000€ y ahora vale 5.500€:
- La línea verde estará 500€ por encima de la azul
- Eso representa un P&L de +500€ (+10%)

---

### 5. Ranking de Símbolos (Top 10)

Tabla que muestra tus mejores y peores inversiones.

**Columnas:**
- **#**: Posición en el ranking
- **Símbolo**: Logo y nombre (ej: BTC - Bitcoin)
- **Invertido**: Cuánto dinero has puesto
- **P&L**: Ganancia o pérdida
- **%**: Rentabilidad porcentual
- **Tendencia**: Mini gráfico de precio

**Ordenamiento:** De mayor a menor P&L total.

**Ejemplo:**
```
#  Símbolo  Invertido  P&L        %      Tendencia
1  BTC      5,000 €    +450.00€   +9.0%  ╱╲╱─╲╱
2  ETH      2,100 €    +180.00€   +8.5%  ─╱─╱╲
3  AAPL     1,500 €    +75.00€    +5.0%  ╱╱╱──
...
10 SOL        800 €    -120.00€   -15%   ╲╲╲──
```

**Códigos de color:**
- 🟢 Verde: P&L positivo
- 🔴 Rojo: P&L negativo

**¿Cómo interpretarlo?**
- Los primeros son tus **mejores inversiones** → considera aumentar posición
- Los últimos son tus **peores inversiones** → evalúa si cortar pérdidas

---

## 📋 Casos de Uso Prácticos

### Caso 1: "¿Tengo dinero para una nueva inversión?"

1. Mira la tarjeta **"Disponible"**
2. Si es > 0€, tienes efectivo libre
3. Si es 0€ o muy poco, necesitas:
   - Depositar más dinero, O
   - Cerrar alguna operación existente

---

### Caso 2: "¿Estoy ganando o perdiendo?"

1. Mira el **Rendimiento Global**
2. Si **P&L Total** es verde → Vas bien ✅
3. Si es rojo → Analiza:
   - ¿Es P&L realizado o no realizado?
   - Si es no realizado, el mercado puede recuperar
   - Si es realizado, ya perdiste ese dinero

---

### Caso 3: "¿Qué inversión me está dando más problemas?"

1. Ve a **Ranking de Símbolos**
2. Ordena de peor a mejor (las últimas posiciones)
3. Los que tengan P&L rojo alto son problemáticos
4. Opciones:
   - **Esperar** si crees que subirá
   - **Cerrar** para cortar pérdidas
   - **Promediar a la baja** (comprar más barato)

---

### Caso 4: "¿Estoy muy concentrado en un tipo de activo?"

1. Mira **Distribución por Producto**
2. Si un color domina (>70%), estás concentrado
3. Evalúa tu tolerancia al riesgo:
   - 100% crypto = Alto riesgo
   - Mix equilibrado = Riesgo moderado
   - 100% ETFs = Bajo riesgo

---

### Caso 5: "¿Cómo va mi portfolio comparado con el mes pasado?"

1. Selecciona periodo **"30d"**
2. Mira **Evolución del Portfolio**
3. Si la línea verde está subiendo → Crecimiento ✅
4. Si está bajando → Decrecimiento ⚠️
5. Cambia a periodo más largo ("90d" o "1 año") para ver tendencia general

---

## ❓ Preguntas Frecuentes

### ¿Por qué el "Disponible" no coincide con lo que pensaba?

El dinero disponible se calcula automáticamente:
```
Disponible = Balance Total - Dinero Invertido
```

Si parece incorrecto, verifica:
- ¿Tienes operaciones abiertas que olvidaste?
- ¿Hiciste algún retiro reciente?

---

### ¿Qué es mejor: P&L alto o Win Rate alto?

Depende de tu estrategia:
- **P&L alto, Win Rate bajo**: Pocas operaciones ganadoras pero muy rentables (ej: 3 ganadoras grandes, 7 pequeñas perdedoras)
- **Win Rate alto, P&L bajo**: Muchas pequeñas ganancias (ej: 8 operaciones con +10€ cada una)

Lo ideal: **Ambos altos** (win rate >60% y P&L positivo creciente).

---

### ¿Por qué el gráfico de Evolución muestra líneas iguales?

Porque `Valor Portfolio` actualmente se calcula igual que `Invertido`.

**Mejora futura:** Se calculará con precios de mercado reales:
```
Valor Portfolio = Σ(cantidad_actual × precio_actual)
```

---

### ¿Cada cuánto se actualizan los datos?

- **En tiempo real** al cargar la página
- **Al cambiar periodo** se recalcula automáticamente
- **Manualmente** recargando la página (F5)

---

### ¿Puedo ver solo una cuenta específica?

Actualmente el dashboard muestra **todas tus cuentas combinadas**.

**Mejora futura:** Selector de cuenta en la parte superior.

---

## 💡 Consejos y Buenas Prácticas

### 1. Revisa el Dashboard Regularmente

- **Diariamente** si haces trading activo
- **Semanalmente** si eres inversor a medio plazo
- **Mensualmente** si tienes estrategia a largo plazo

---

### 2. No Te Obsesiones con P&L No Realizado

El mercado fluctúa. Una pérdida "en papel" hoy puede ser ganancia mañana.

**Ejemplo:**
- Compraste BTC a 45.000€
- Bajó a 42.000€ → P&L no realizado: -3.000€ ⚠️
- No vendiste (mantuviste)
- Subió a 50.000€ → P&L no realizado: +5.000€ ✅

---

### 3. Usa el Ranking para Rebalancear

Si un símbolo tiene:
- P&L muy positivo → Considera tomar ganancias parciales
- P&L muy negativo → Evalúa si cortar pérdidas o esperar

---

### 4. Diversifica Según Tu Perfil

**Perfil conservador:**
- 70% ETFs, 20% Acciones, 10% Crypto

**Perfil moderado:**
- 40% ETFs, 40% Acciones, 20% Crypto

**Perfil agresivo:**
- 20% ETFs, 30% Acciones, 50% Crypto

---

### 5. Analiza Tendencias, No Puntos Aislados

Un mal día no define tu estrategia. Usa periodos largos (90d, 1 año) para ver el panorama completo.

---

## 🎨 Códigos de Color

| Color | Significado | Dónde aparece |
|-------|-------------|---------------|
| 🟢 Verde | Positivo/Ganancia | P&L positivo, win rate alto |
| 🔴 Rojo | Negativo/Pérdida | P&L negativo, pérdidas |
| 🟠 Naranja | Crypto | Distribución, ranking |
| 🔵 Azul | Acciones | Distribución, ranking, gráfico invertido |
| 🟢 Verde oscuro | ETFs | Distribución |

---

## 🔄 Flujo de Trabajo Recomendado

1. **Abrir Dashboard** → Ver resumen general
2. **Revisar Balance** → ¿Tengo efectivo disponible?
3. **Revisar Rendimiento** → ¿Voy por buen camino?
4. **Analizar Ranking** → ¿Qué ajustar?
5. **Ver Distribución** → ¿Estoy diversificado?
6. **Revisar Evolución** → ¿Tendencia alcista o bajista?
7. **Tomar decisión** → Comprar, vender, mantener o depositar

---

## 🛠️ Solución de Problemas

### El dashboard no carga

- Refresca la página (F5)
- Verifica tu conexión a internet
- Cierra sesión y vuelve a entrar

### Los números parecen incorrectos

- Verifica que el periodo seleccionado sea el correcto
- Comprueba que no haya operaciones pendientes de sincronizar
- Contacta a soporte si persiste

### El gráfico no se muestra

- Asegúrate de tener datos en el periodo seleccionado
- Prueba con un periodo más amplio ("Todo")
- Verifica que tengas operaciones registradas

---

## 📚 Relacionado

- [Operaciones - Guía de Usuario](./operaciones.md)
- [Transacciones - Guía de Usuario](./transacciones.md)
- [Símbolos - Guía de Usuario](./symbols.md)
