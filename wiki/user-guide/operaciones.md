# Operaciones de Trading - Manual de Usuario

> Guía práctica para gestionar operaciones de trading

## Índice
- [¿Qué son las Operaciones?](#qué-son-las-operaciones)
- [Tipos de Operaciones](#tipos-de-operaciones)
- [Cómo Usar el Sistema](#cómo-usar-el-sistema)
- [Ejemplos Prácticos](#ejemplos-prácticos)
- [Preguntas Frecuentes](#preguntas-frecuentes)

---

## ¿Qué son las Operaciones?

Una **operación de trading** es un registro que agrupa todas las compras y ventas que realizas de un activo financiero (criptomoneda, acción o ETF) hasta completar el ciclo de inversión.

### Conceptos Básicos

**Símbolo**: El activo que estás operando (ej: BTC para Bitcoin, AAPL para Apple)

**Entrada (Entry)**: Cada compra o venta que realizas dentro de una operación

**Estado de la Operación**:
- **Abierta (Open)**: Operación activa, puedes seguir agregando entradas
- **Cerrada (Closed)**: Operación finalizada, ya no acepta más entradas

**Balance**: Ganancia o pérdida final cuando se cierra la operación

---

## Tipos de Operaciones

### Operación Long (Compra)

**Concepto**: Compras un activo esperando que suba de precio para venderlo después con ganancia.

**Flujo típico**:
1. Compras (buy) cierta cantidad a un precio
2. Esperas que el precio suba
3. Vendes (sell) la misma cantidad a un precio mayor
4. La operación se cierra automáticamente
5. Tu ganancia = Precio de venta - Precio de compra - Comisiones

**Ejemplo**:
- Compras 1 BTC a $50,000
- Vendes 1 BTC a $52,000
- Ganancia = $52,000 - $50,000 - comisiones = ~$1,900

---

### Operación Short (Venta)

**Concepto**: Vendes primero (en corto) esperando que el precio baje para recomprar después más barato.

**Flujo típico**:
1. Vendes (sell) cierta cantidad a un precio
2. Esperas que el precio baje
3. Compras (buy) la misma cantidad a un precio menor
4. La operación se cierra automáticamente
5. Tu ganancia = Precio de venta - Precio de recompra - Comisiones

**Ejemplo**:
- Vendes 1 BTC a $50,000
- Compras 1 BTC a $48,000
- Ganancia = $50,000 - $48,000 - comisiones = ~$1,900

---

## Cómo Usar el Sistema

### 1. Crear una Nueva Operación

**Pasos**:
1. Accede a la sección "Operaciones"
2. Haz clic en "Nueva Operación"
3. Completa el formulario:
   - **Símbolo**: Elige o crea el activo (ej: BTC, ETH, AAPL)
   - **Producto**: Criptomoneda, Acción o ETF
   - **Tipo**: Long (compra) o Short (venta)
   - **Primera Entrada** (opcional):
     - Tipo: Buy o Sell
     - Cantidad: Cuántas unidades
     - Precio: A qué precio
     - Comisión: Comisión de la transacción
     - Fecha: Cuándo la realizaste
4. Haz clic en "Crear"

**Resultado**: La operación se crea con estado "Abierta"

---

### 2. Agregar Entradas a una Operación

Una vez creada la operación, puedes ir agregando compras y ventas.

**Pasos**:
1. Entra al detalle de la operación
2. Haz clic en "Agregar Entrada"
3. Completa:
   - **Tipo**: Buy (compra) o Sell (venta)
   - **Cantidad**: Cuántas unidades
   - **Precio**: A qué precio
   - **Comisión**: Comisión de la transacción
   - **Fecha**: Cuándo la realizaste
4. Haz clic en "Guardar"

**Nota**: Cada entrada añade un punto al historial de precios del símbolo con el precio y fecha
que introduzcas.

**Cierre Automático**:
El sistema verifica automáticamente si la cantidad total comprada es igual a la cantidad total vendida. Si coinciden, **la operación se cierra automáticamente** y se calcula tu ganancia o pérdida final.

**Importante**: Una vez cerrada, no podrás agregar más entradas a esa operación.

---

### 3. Ver el Estado de tus Operaciones

#### Operaciones Abiertas

Para operaciones que aún no se han cerrado, verás:

- **Cantidad Actual**: Cuántas unidades aún tienes en posesión
- **Precio Promedio de Compra**: A qué precio promedio compraste
- **P&L No Realizado** (si registraste precios):
  - Tu ganancia o pérdida potencial al precio actual
  - Aparece en verde si es ganancia, en rojo si es pérdida

#### Operaciones Cerradas

Para operaciones finalizadas, verás:

- **Balance Final**: Tu ganancia o pérdida real
  - Verde: Ganaste dinero
  - Rojo: Perdiste dinero
  - Gris: Break-even (ni ganaste ni perdiste)

---

### 4. Registrar Precios Históricos

Para ver tu P&L no realizado en operaciones abiertas, debes registrar precios actuales.

**Pasos**:
1. Entra al detalle de la operación
2. Haz clic en "Agregar Precio"
3. Ingresa el precio actual del activo
4. Selecciona la fecha
5. Haz clic en "Guardar"

El sistema usará el último precio que registraste para calcular tu ganancia o pérdida potencial.

#### Gráfico de precio e inversión
En el detalle de la operación verás un gráfico con:
- **Precio**: evolución histórica del símbolo.
- **Inversión neta**: movimientos según tus entradas y salidas.

Usa el selector de tiempo (7D, 1M, 3M, 6M, 1A, Todo) para cambiar el rango mostrado.
> **Nota**: El gráfico usa los precios del último año.

---

### 5. Eliminar Entradas

Si cometiste un error, puedes eliminar una entrada:

**Pasos**:
1. Entra al detalle de la operación
2. Busca la entrada que quieres eliminar
3. Haz clic en el icono de eliminar (🗑️)
4. Confirma la eliminación

**Nota**: Solo puedes eliminar entradas de operaciones abiertas.

---

### 6. Eliminar una Operación

Si quieres eliminar una operación completa:

**Pasos**:
1. Entra al detalle de la operación
2. Haz clic en "Eliminar Operación"
3. Confirma la eliminación

**Importante**: Se eliminarán también todas las entradas y precios asociados. Esta acción no se puede deshacer.

---

## Ejemplos Prácticos

### Ejemplo 1: Operación Long Simple con Ganancia

**Situación**: Quieres comprar Bitcoin y venderlo cuando suba.

**Pasos**:
1. **Crear operación**:
   - Tipo: Long
   - Símbolo: BTC
   - Primera entrada: Buy 1 BTC a $50,000 (comisión: $50)

2. **Estado actual**:
   - Operación: Abierta
   - Cantidad actual: 1 BTC
   - Precio promedio: $50,000

3. **Registrar precio actual** (opcional):
   - Precio: $52,000
   - P&L no realizado: $2,000 (ganancia potencial)

4. **Vender cuando estés satisfecho**:
   - Agregar entrada: Sell 1 BTC a $52,000 (comisión: $50)
   - **La operación se cierra automáticamente**
   - Balance final: $1,900 ganancia

---

### Ejemplo 2: Operación con Múltiples Compras

**Situación**: Compras Bitcoin en varias ocasiones (estrategia DCA - Dollar Cost Averaging).

**Pasos**:
1. **Primera compra**:
   - Buy 1 BTC a $50,000 (comisión: $50)

2. **El precio baja, compras más**:
   - Buy 1 BTC a $48,000 (comisión: $50)
   - Cantidad actual: 2 BTC
   - Precio promedio: $49,000

3. **Vendes la mitad**:
   - Sell 1 BTC a $51,000 (comisión: $50)
   - Cantidad actual: 1 BTC (aún abierta)

4. **Vendes el resto**:
   - Sell 1 BTC a $52,000 (comisión: $50)
   - **Se cierra automáticamente**
   - Total comprado: $98,000
   - Total vendido: $103,000
   - Balance: $4,800 ganancia

---

### Ejemplo 3: Operación Short con Ganancia

**Situación**: Crees que Bitcoin va a bajar, quieres ganar con la caída.

**Pasos**:
1. **Crear operación**:
   - Tipo: Short
   - Primera entrada: Sell 1 BTC a $50,000 (comisión: $50)

2. **Estado**:
   - Cantidad actual: -1 BTC (posición corta)

3. **El precio baja, cierras posición**:
   - Buy 1 BTC a $48,000 (comisión: $50)
   - **Se cierra automáticamente**
   - Balance: $1,900 ganancia
   - (Vendiste a $50k y compraste a $48k)

---

### Ejemplo 4: Operación con Pérdida

**Situación**: El precio no fue como esperabas.

**Pasos**:
1. **Comprar**:
   - Buy 2 acciones AAPL a $150 (comisión: $2)

2. **El precio baja, decides vender**:
   - Sell 2 acciones AAPL a $140 (comisión: $2)
   - **Se cierra automáticamente**
   - Balance: -$24 pérdida

---

## Preguntas Frecuentes

### ¿Cuándo se cierra automáticamente una operación?

Cuando la **cantidad total comprada es igual a la cantidad total vendida**. El sistema lo verifica cada vez que agregas una entrada.

---

### ¿Puedo agregar más entradas después de que se cierre?

No. Una vez cerrada, la operación queda bloqueada y muestra el balance final. Si quieres seguir operando ese activo, debes crear una nueva operación.

---

### ¿Qué pasa si elimino una entrada de una operación cerrada?

No puedes. Solo puedes eliminar entradas de operaciones abiertas.

---

### ¿Cómo se calcula el precio promedio de compra?

Es un promedio ponderado de todas tus compras:
```
Precio promedio = (Precio1 × Cantidad1 + Precio2 × Cantidad2 + ...) / Cantidad total
```

**Ejemplo**:
- Compras 1 BTC a $50,000
- Compras 1 BTC a $48,000
- Precio promedio = ($50,000 + $48,000) / 2 = $49,000

---

### ¿Qué es el P&L No Realizado?

Es tu **ganancia o pérdida potencial** mientras la operación está abierta, calculada con el último precio que registraste. No es real hasta que vendas.

**Ejemplo**:
- Compraste 1 BTC a $50,000
- Precio actual: $52,000
- P&L no realizado: $2,000 (ganancia potencial)
- Si vendes ahora, tu ganancia real será cercana a eso (menos comisiones)

---

### ¿Por qué no veo el P&L No Realizado?

Necesitas registrar al menos un precio en "Precios Históricos". El sistema usa el último precio registrado para calcular tu ganancia/pérdida potencial.

---

### ¿Qué diferencia hay entre Long y Short?

**Long**: Compras primero esperando que suba. Ganas si el precio sube.

**Short**: Vendes primero esperando que baje. Ganas si el precio baja.

En ambos casos, el sistema cierra automáticamente cuando las cantidades compradas y vendidas coinciden.

---

### ¿Puedo tener varias operaciones del mismo símbolo?

Sí. Puedes tener múltiples operaciones de BTC, por ejemplo. Cada operación es independiente y tiene su propio seguimiento de entradas y balance.

---

### ¿Qué son las comisiones (tax)?

Son las fees que cobran los exchanges o brokers por cada transacción. El sistema las resta del balance final para mostrarte tu ganancia o pérdida neta real.

---

### ¿Puedo editar una entrada después de crearla?

Actualmente no. Si cometiste un error, debes eliminar la entrada y crearla de nuevo con los datos correctos.

---

## Consejos y Buenas Prácticas

✅ **Registra todas tus entradas inmediatamente** después de cada transacción para no olvidar detalles

✅ **Anota las comisiones correctamente** para tener un cálculo preciso de tu balance

✅ **Actualiza los precios regularmente** en operaciones abiertas para ver tu P&L en tiempo real

✅ **Usa nombres de símbolos consistentes** (ej: siempre BTC, no Bitcoin o btc)

✅ **Revisa el detalle antes de cerrar** una operación para asegurarte que todo está correcto

⚠️ **No elimines operaciones cerradas** a menos que sea necesario, son tu historial

⚠️ **Verifica las fechas** al agregar entradas antiguas
