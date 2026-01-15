<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="row items-center justify-between q-mb-sm">
        <div class="row items-center q-gutter-sm">
          <div class="text-h6">Rendimiento Mensual</div>
          <q-chip
            v-if="scopeLabel"
            dense
            :color="scopeChipColor"
            :text-color="scopeChipTextColor"
          >
            {{ scopeLabel }}
          </q-chip>
          <q-chip v-if="periodLabel" dense color="amber-1" text-color="amber-9">
            Periodo {{ periodLabel }}
          </q-chip>
        </div>
        <q-btn
          icon="info"
          flat
          dense
          round
          size="sm"
          color="grey-6"
          @click="showInfo = true"
        />
      </div>
      <div v-if="loading" class="row justify-center q-pa-lg">
        <q-spinner color="primary" size="50px" />
      </div>
      <div v-else-if="!data || data.length === 0" class="row justify-center q-pa-lg">
        <div class="text-grey-6">No hay datos disponibles</div>
      </div>
      <apexchart
        v-else
        type="bar"
        height="300"
        :options="chartOptions"
        :series="series"
      />
    </q-card-section>

    <info-modal
      v-model="showInfo"
      title="Rendimiento Mensual"
      :content="infoContent"
    />
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import InfoModal from './InfoModal.vue';
import type { MonthlyPerformanceDto } from '../types';

/**
 * Gráfico de rendimiento mensual
 * Muestra P&L realizado y no realizado por mes
 */

interface Props {
  data?: MonthlyPerformanceDto[];
  loading?: boolean;
  scopeLabel?: string;
  periodLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false,
});

const showInfo = ref(false);
const scopeChipColor = computed(() => (
  props.scopeLabel === 'Planes ETF' ? 'light-green-1' : 'light-blue-1'
));
const scopeChipTextColor = computed(() => (
  props.scopeLabel === 'Planes ETF' ? 'green-10' : 'blue-10'
));

const infoContent = `
<p><strong>¿Qué muestra este gráfico?</strong></p>
<p>Este gráfico desglosa tu rendimiento mes a mes mostrando:</p>
<ul>
  <li><strong>P&L Mensual:</strong> Resultado total de operaciones cerradas en cada mes.</li>
  <li><strong>Win Rate:</strong> Porcentaje de operaciones ganadoras por mes.</li>
</ul>
<p><strong>¿Cómo leerlo?</strong></p>
<ul>
  <li>Barras hacia <strong>arriba</strong> → Ganancias en ese mes</li>
  <li>Barras hacia <strong>abajo</strong> → Pérdidas en ese mes</li>
  <li>La altura muestra la magnitud del resultado mensual</li>
</ul>
<p><strong>Utilidad:</strong> Identifica patrones estacionales o rachas de rendimiento.</p>
<p><strong>Filtro aplicado:</strong> Este grafico respeta el periodo seleccionado y la pestaña activa.</p>
`;

/**
 * Series de datos para ApexCharts
 */
const series = computed(() => {
  if (!props.data || props.data.length === 0) {
    return [];
  }

  return [
    {
      name: 'P&L',
      data: props.data.map((p) => p.pnl),
    },
  ];
});

/**
 * Configuración del gráfico ApexCharts
 */
const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: {
      show: false,
    },
  },
  colors: ['#1976D2'],
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '70%',
      colors: {
        ranges: [{
          from: -Infinity,
          to: 0,
          color: '#C10015'
        }]
      }
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent'],
  },
  xaxis: {
    categories: props.data?.map((p) => `${p.month} ${p.year}`) || [],
    labels: {
      style: {
        colors: '#FFFFFF',
      },
    },
  },
  yaxis: {
    labels: {
      style: {
        colors: '#FFFFFF',
      },
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
  fill: {
    opacity: 1,
  },
}));
</script>
