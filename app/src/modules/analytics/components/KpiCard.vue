<template>
  <q-card flat bordered class="kpi-card">
    <q-card-section>
      <div class="text-overline text-grey-7">{{ label }}</div>
      <div class="row items-baseline q-mt-sm">
        <div class="text-h5 text-weight-bold">{{ formattedValue }}</div>
        <div
          v-if="change !== undefined"
          class="q-ml-sm text-body2"
          :class="changeColor"
        >
          {{ changeText }}
        </div>
      </div>
      <div v-if="subtitle" class="text-caption text-grey-6 q-mt-xs">
        {{ subtitle }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

/**
 * Componente de tarjeta KPI reutilizable
 */
interface Props {
  label: string;
  value: number;
  format?: 'currency' | 'percentage' | 'number';
  change?: number;
  subtitle?: string;
  currency?: string;
}

const props = withDefaults(defineProps<Props>(), {
  format: 'currency',
  currency: 'EUR',
});

const formattedValue = computed(() => {
  switch (props.format) {
    case 'currency':
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: props.currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(props.value);

    case 'percentage':
      return `${props.value.toFixed(2)}%`;

    case 'number':
      return new Intl.NumberFormat('es-ES').format(props.value);

    default:
      return props.value.toString();
  }
});

const changeText = computed(() => {
  if (props.change === undefined) return '';
  const sign = props.change >= 0 ? '+' : '';
  return `${sign}${props.change.toFixed(2)}%`;
});

const changeColor = computed(() => {
  if (props.change === undefined) return '';
  return props.change >= 0 ? 'text-positive' : 'text-negative';
});
</script>

<style scoped lang="scss">
.kpi-card {
  height: 100%;

  .q-card-section {
    padding: 16px;
  }
}
</style>
