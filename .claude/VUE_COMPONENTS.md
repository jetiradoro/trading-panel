# Directrices Vue/Quasar

## Componentización
- Componentes pequeños, responsabilidad única
- Máximo 150-200 líneas por componente
- Extraer lógica repetida a composables

## Biblioteca de UI
- Reutilizar componentes existentes en `src/components/`
- Crear componentes genéricos para patrones recurrentes
- Mantener cohesión visual UX/UI

## Diseño de Pantallas
- Navegación intuitiva y agradable
- Jerarquía visual clara
- Feedback visual en acciones del usuario

## Estructura Componente
```vue
<template>
  <!-- HTML limpio, sin lógica compleja -->
</template>

<script setup lang="ts">
// Imports, props, emits, composables, lógica
</script>

<style scoped lang="scss">
// Estilos encapsulados
</style>
```
