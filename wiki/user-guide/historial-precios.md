# Historial de Precios - Guía de Usuario

> Guía para entender y usar el historial de precios de símbolos

## Índice
- [¿Qué es el Historial de Precios?](#qué-es-el-historial-de-precios)
- [¿Para qué sirve?](#para-qué-sirve)
- [Conceptos Básicos](#conceptos-básicos)
- [Cómo Ver el Precio Actual](#cómo-ver-el-precio-actual)
- [Cómo Gestionar el Historial](#cómo-gestionar-el-historial)
- [Ejemplos Prácticos](#ejemplos-prácticos)
- [Preguntas Frecuentes](#preguntas-frecuentes)

---

## ¿Qué es el Historial de Precios?

El **historial de precios** es un registro cronológico de los precios de mercado de cada símbolo (Bitcoin, Apple, etc.) en diferentes momentos del tiempo.

Por ejemplo, si tienes operaciones con Bitcoin (BTC), el historial de precios almacena:
- Precio de BTC el 1 de enero: $42,000
- Precio de BTC el 15 de enero: $45,000
- Precio de BTC el 30 de enero: $48,000
- etc.

---

## ¿Para qué sirve?

El historial de precios sirve para:

1. **Calcular ganancias/pérdidas no realizadas**: Si compraste Bitcoin a $40,000 y el precio actual es $48,000, puedes ver tu ganancia potencial.

2. **Seguimiento del mercado**: Ver cómo ha evolucionado el precio de tus activos a lo largo del tiempo.

3. **Tomar decisiones informadas**: Decidir si es buen momento para comprar más o vender basándote en la tendencia de precios.

4. **Registro histórico**: Mantener un historial de cómo se movió el mercado durante tus inversiones.

---

## Conceptos Básicos

### Símbolo
Es el activo que estás operando. Ejemplos:
- **BTC** = Bitcoin
- **AAPL** = Acciones de Apple
- **SPY** = ETF del S&P 500

### Precio Actual
Es el último precio registrado en el historial para un símbolo determinado. Este precio se usa para calcular las ganancias/pérdidas no realizadas de tus operaciones abiertas.

### Precio de Entrada
Es el precio al que compraste o vendiste en una operación específica. Este NO es el mismo que el precio actual del mercado.

**Ejemplo**:
- Compraste 1 BTC a $40,000 (precio de entrada)
- Precio actual de BTC: $48,000
- Ganancia no realizada: $8,000

---

## Cómo Ver el Precio Actual

### Desde una Operación

1. Ve a **Operaciones** en el menú
2. Haz clic en cualquier operación abierta
3. En la pantalla de detalle, verás una tarjeta llamada **"Precio Actual del Símbolo"**

**Qué verás**:
```
┌─────────────────────────────────────┐
│ Precio Actual del Símbolo           │
├─────────────────────────────────────┤
│ BTC                                 │
│ $48,000.00                         │
│ Actualizado: 30/01/2024 14:30      │
└─────────────────────────────────────┘
```

**Interpretación**:
- **BTC**: Código del símbolo
- **$48,000.00**: Último precio registrado
- **Actualizado**: Fecha y hora del último precio

> **Nota**: Si no ves precio actual, significa que aún no se ha registrado ningún precio para este símbolo. Puedes añadirlo desde la pantalla de detalle del símbolo.

---

## Cómo Gestionar el Historial

### Ver el Historial Completo

1. Ve a **Símbolos** en el menú
2. Haz clic en el símbolo que quieres consultar (ej: BTC)
3. Verás el historial de precios ordenado del más reciente al más antiguo
> **Nota**: Se muestra el historial del último año.

**Qué verás**:
```
┌─────────────────────────────────────┐
│ Historial de Precios - BTC          │
├─────────────────────────────────────┤
│ 30/01/2024 - $48,000.00            │
│ 15/01/2024 - $45,000.00            │
│ 01/01/2024 - $42,000.00            │
└─────────────────────────────────────┘
```

---

### Añadir un Precio

**¿Cuándo hacerlo?**
- Cuando quieres registrar el precio actual del mercado
- Cuando empiezas una nueva operación y quieres actualizar el precio de referencia
- De forma periódica (diaria, semanal) para tener un historial completo

**Pasos**:
1. Ve a **Símbolos** → Haz clic en el símbolo
2. Haz clic en el botón **"Añadir Precio"**
3. Completa el formulario:
   - **Precio**: Escribe el precio actual (ej: 48000)
   - **Fecha**: Selecciona la fecha y hora del precio
4. Haz clic en **"Guardar"**

**Ejemplo práctico**:
```
Hoy es 30 de enero y BTC está en $48,000:

Campo "Precio":  48000
Campo "Fecha":   30/01/2024 14:30

→ Guardar
```

---

### Editar un Precio

**¿Cuándo hacerlo?**
- Cometiste un error al ingresar el precio
- Quieres ajustar la fecha/hora del registro

**Pasos**:
1. Ve a **Símbolos** → Haz clic en el símbolo
2. En el historial de precios, haz clic sobre el precio que quieres editar
3. Modifica el precio o la fecha
4. Haz clic en **"Guardar"**

---

### Eliminar un Precio

**¿Cuándo hacerlo?**
- Registraste un precio por error
- Tienes duplicados en el historial

**Pasos**:
1. Ve a **Símbolos** → Haz clic en el símbolo
2. En el historial de precios, haz clic en el ícono de **"Eliminar"** (🗑️) del precio
3. Confirma la eliminación

> **Advertencia**: Esta acción no se puede deshacer.

---

## Ejemplos Prácticos

### Ejemplo 1: Empezar a Operar con BTC

**Situación**: Vas a comprar Bitcoin por primera vez y quieres registrar el precio inicial.

**Pasos**:
1. Ve a **Símbolos** → BTC
2. Haz clic en **"Añadir Precio"**
3. Ingresa el precio actual del mercado: $42,000
4. Selecciona la fecha de hoy
5. Guarda

**Resultado**: Ahora cuando crees una operación de BTC, verás el precio actual de $42,000 en la pantalla de detalle.

---

### Ejemplo 2: Actualización Semanal de Precios

**Situación**: Todos los lunes quieres registrar el precio de tus activos para tener un historial.

**Pasos**:
1. Lunes por la mañana, ve a **Símbolos**
2. Para cada símbolo que operas (BTC, AAPL, etc.):
   - Entra al detalle del símbolo
   - Haz clic en **"Añadir Precio"**
   - Registra el precio del mercado
   - Guarda

**Resultado**: Al cabo de unas semanas, tendrás un historial como este:

```
BTC:
  06/02/2024 - $50,000.00
  30/01/2024 - $48,000.00
  22/01/2024 - $46,000.00
  15/01/2024 - $45,000.00
  08/01/2024 - $43,000.00
  01/01/2024 - $42,000.00
```

---

### Ejemplo 3: Verificar Ganancia/Pérdida de una Operación

**Situación**: Compraste 1 BTC a $40,000 hace un mes y quieres ver cuánto has ganado.

**Pasos**:
1. Ve a **Operaciones** → Haz clic en tu operación de BTC
2. En la pantalla de detalle, mira:
   - **Entradas**: Verás tu compra de 1 BTC a $40,000
   - **Precio Actual**: $48,000 (si lo registraste)
   - **Métricas**: Verás la ganancia no realizada: +$8,000 (+20%)

**Interpretación**:
- Invertiste: $40,000
- Valor actual: $48,000
- Ganancia potencial: $8,000 (20% de rentabilidad)

---

### Ejemplo 4: Corregir un Precio Incorrecto

**Situación**: Registraste el precio de BTC como $4,800 en lugar de $48,000.

**Pasos**:
1. Ve a **Símbolos** → BTC
2. En el historial, verás: `30/01/2024 - $4,800.00` ❌
3. Haz clic sobre ese precio
4. Corrige el campo **Precio** a: 48000
5. Guarda

**Resultado**: El precio ahora muestra correctamente $48,000.

---

## Preguntas Frecuentes

### ¿El historial de precios se actualiza automáticamente?
No, debes añadir manualmente los precios. En futuras versiones podríamos integrar APIs de mercado para actualizaciones automáticas.

### ¿Qué precio debo usar?
Usa el precio de mercado actual del exchange o broker donde operas. Por ejemplo, si operas en Binance, usa el precio que ves en Binance.

### ¿Con qué frecuencia debo actualizar los precios?
Depende de tu estrategia:
- **Operador activo**: Diariamente o cada vez que hagas una operación
- **Inversor a largo plazo**: Semanalmente o mensualmente
- **Mínimo recomendado**: Al inicio de cada operación y al cerrarla

### ¿Puedo tener múltiples precios para el mismo día?
Sí, puedes registrar varios precios en el mismo día con diferentes horas. Por ejemplo:
- 30/01/2024 09:00 - $47,500
- 30/01/2024 15:00 - $48,000

### ¿Qué pasa si elimino un precio que estoy usando en una operación?
Las operaciones siempre mostrarán el precio más reciente disponible. Si eliminas el último precio, se mostrará el anterior. Si no hay precios, no se mostrará precio actual.

### ¿Los precios afectan mis entradas (compras/ventas)?
No, los precios del historial son independientes de tus entradas. Tus compras y ventas siempre mantienen el precio al que las ejecutaste. El historial de precios solo sirve para referencia y calcular ganancias/pérdidas potenciales.

**Ejemplo**:
```
Tu entrada:         Compraste 1 BTC a $40,000
Precio histórico:   Registraste BTC a $48,000 hoy
Resultado:          Tu entrada sigue siendo $40,000
                    Tu ganancia potencial: $8,000 (basada en $48,000)
```

### ¿Puedo registrar precios de hace meses?
Sí, puedes registrar precios históricos con fechas pasadas. Esto es útil si quieres completar el historial de tus operaciones anteriores.

### ¿Qué pasa si tengo varias operaciones del mismo símbolo?
Todas las operaciones del mismo símbolo comparten el mismo historial de precios. Si actualizas el precio de BTC, todas tus operaciones de BTC verán el mismo precio actual.

**Ejemplo**:
```
Operación 1: Compraste 0.5 BTC a $40,000
Operación 2: Compraste 1 BTC a $45,000

Registras precio de BTC: $48,000

Resultado:
  → Operación 1 muestra precio actual: $48,000
  → Operación 2 muestra precio actual: $48,000
  → Ambas calculan su P&L individual con el mismo precio de referencia
```

---

## Consejos y Buenas Prácticas

1. **Registra precios regularmente**: Mantén un hábito de actualizar precios (ej: todos los lunes)

2. **Usa la misma fuente de precios**: Siempre consulta el mismo exchange/broker para mantener consistencia

3. **Registra antes de operar**: Antes de comprar o vender, registra el precio actual para tener referencia

4. **Revisa tus métricas**: Usa el precio actual para evaluar tus operaciones abiertas periódicamente

5. **No te obsesiones**: No necesitas registrar cada fluctuación del precio, un seguimiento semanal suele ser suficiente para inversores a largo plazo

6. **Documenta eventos importantes**: Si hay noticias o eventos que mueven el mercado, considera registrar un precio en ese momento para referencia futura
