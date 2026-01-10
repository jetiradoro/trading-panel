<template>
  <div class="sparkline-chart">
    <apexchart
      v-if="chartOptions && series.length > 0"
      type="line"
      height="40"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

/**
 * Componente de gráfico sparkline (mini gráfico de tendencia)
 */
interface Props {
  data: number[];
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  color: '#1976D2',
});

const series = computed(() => {
  if (!props.data || props.data.length === 0) return [];

  return [{
    name: 'Precio',
    data: props.data,
  }];
});

const chartOptions = computed(() => ({
  chart: {
    type: 'line',
    sparkline: {
      enabled: true,
    },
    animations: {
      enabled: false,
    },
  },
  stroke: {
    width: 2,
    curve: 'smooth' as const,
  },
  colors: [props.color],
  tooltip: {
    enabled: false,
  },
  xaxis: {
    labels: {
      show: false,
    },
    axisBorder: {
      show: false,
    },
  },
  yaxis: {
    labels: {
      show: false,
    },
  },
}));
</script>

<style scoped lang="scss">
.sparkline-chart {
  width: 100px;
  height: 40px;
}
</style>
