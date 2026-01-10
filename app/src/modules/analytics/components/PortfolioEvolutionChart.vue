<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-sm">Evolución del Portfolio</div>
      <div v-if="loading" class="row justify-center q-pa-lg">
        <q-spinner color="primary" size="50px" />
      </div>
      <div v-else-if="!data || data.length === 0" class="row justify-center q-pa-lg">
        <div class="text-grey-6">No hay datos disponibles</div>
      </div>
      <apexchart
        v-else
        type="area"
        height="300"
        :options="chartOptions"
        :series="series"
      />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PortfolioPointDto } from '../types';

/**
 * Gráfico de evolución del portfolio
 * Muestra la evolución temporal del dinero invertido vs valor del portfolio
 */

interface Props {
  data?: PortfolioPointDto[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false,
});

/**
 * Series de datos para ApexCharts
 */
const series = computed(() => {
  if (!props.data || props.data.length === 0) {
    return [];
  }

  return [
    {
      name: 'Invertido',
      data: props.data.map((p) => ({
        x: new Date(p.date).getTime(),
        y: p.totalInvested,
      })),
    },
    {
      name: 'Valor Portfolio',
      data: props.data.map((p) => ({
        x: new Date(p.date).getTime(),
        y: p.portfolioValue,
      })),
    },
  ];
});

/**
 * Configuración del gráfico ApexCharts
 */
const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
  },
  colors: ['#1976D2', '#21BA45'],
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'smooth',
    width: 2,
  },
  fill: {
    type: 'gradient',
    gradient: {
      opacityFrom: 0.6,
      opacityTo: 0.1,
    },
  },
  xaxis: {
    type: 'datetime',
    labels: {
      datetimeUTC: false,
      format: 'dd MMM',
    },
  },
  yaxis: {
    labels: {
      formatter: (value: number) => {
        return new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      },
    },
  },
  tooltip: {
    theme: 'dark',
    x: {
      format: 'dd MMM yyyy',
    },
    y: {
      formatter: (value: number) => {
        return new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);
      },
    },
  },
  legend: {
    position: 'top',
    horizontalAlign: 'right',
    labels: {
      colors: '#FFFFFF',
    },
  },
  grid: {
    borderColor: '#e0e0e0',
  },
}));
</script>
