<template>
  <div class="row items-center q-gutter-sm">
    <div class="text-body2 text-grey-7 gt-xs">Periodo:</div>
    <q-btn-toggle
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="periodOptions"
      toggle-color="primary"
      unelevated
      dense
      no-caps
      size="sm"
    />
  </div>
</template>

<script setup lang="ts">
import type { PeriodType } from '../types';

/**
 * Componente de filtro de periodo para analítica
 * Permite seleccionar: 7d, 30d, 90d, 1 año, Todo
 */

interface Props {
  modelValue: PeriodType;
}

interface Emits {
  (e: 'update:modelValue', value: PeriodType): void;
}

defineProps<Props>();
defineEmits<Emits>();

/**
 * Opciones de periodo disponibles
 */
const periodOptions = [
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '90d', value: '90d' },
  { label: '1 año', value: '1y' },
  { label: 'Todo', value: 'all' },
];
</script>
