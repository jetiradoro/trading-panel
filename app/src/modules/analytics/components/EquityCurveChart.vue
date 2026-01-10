<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="row items-center justify-between q-mb-sm">
        <div class="text-h6">Curva de Equity</div>
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
        type="line"
        height="300"
        :options="chartOptions"
        :series="series"
      />
    </q-card-section>

    <info-modal
      v-model="showInfo"
      title="Curva de Equity"
      :content="infoContent"
    />
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import InfoModal from './InfoModal.vue';
import type { EquityPointDto } from '../types';

/**
 * Gráfico de curva de equity
 * Muestra la evolución del equity (balance + posiciones abiertas) y drawdown
 */

interface Props {
  data?: EquityPointDto[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false,
});

const showInfo = ref(false);

const infoContent = `
<p><strong>¿Qué muestra este gráfico?</strong></p>
<p>La curva de equity es una métrica fundamental en trading que muestra:</p>
<ul>
  <li><strong>Equity (verde):</strong> Capital total (depósitos + P&L acumulado).</li>
  <li><strong>Depósitos (azul):</strong> Dinero aportado a la cuenta.</li>
  <li><strong>Retiros (naranja):</strong> Dinero retirado de la cuenta.</li>
</ul>
<p><strong>¿Cómo leerlo?</strong></p>
<ul>
  <li>Equity <strong>por encima</strong> de depósitos → Rentabilidad positiva</li>
  <li>Equity <strong>por debajo</strong> de depósitos → Pérdidas acumuladas</li>
  <li>Pendiente ascendente suave → Trading consistente y saludable</li>
</ul>
<p><strong>Utilidad:</strong> Evalúa la salud general de tu estrategia y gestión de riesgo.</p>
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
      name: 'Equity',
      type: 'line',
      data: props.data.map((p) => ({
        x: new Date(p.date).getTime(),
        y: p.equity,
      })),
    },
    {
      name: 'Depósitos',
      type: 'line',
      data: props.data.map((p) => ({
        x: new Date(p.date).getTime(),
        y: p.deposits,
      })),
    },
    {
      name: 'Retiros',
      type: 'area',
      data: props.data.map((p) => ({
        x: new Date(p.date).getTime(),
        y: -p.withdrawals,
      })),
    },
  ];
});

/**
 * Configuración del gráfico ApexCharts
 */
const chartOptions = computed(() => ({
  chart: {
    type: 'line',
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
  },
  colors: ['#21BA45', '#1976D2', '#C10015'],
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'smooth',
    width: [2, 2, 0],
  },
  fill: {
    type: ['solid', 'solid', 'gradient'],
    gradient: {
      opacityFrom: 0.4,
      opacityTo: 0.1,
    },
  },
  xaxis: {
    type: 'datetime',
    labels: {
      datetimeUTC: false,
      format: 'dd MMM',
      style: {
        colors: '#FFFFFF',
      },
    },
  },
  yaxis: [
    {
      seriesName: 'Equity',
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
    {
      seriesName: 'Equity',
      show: false,
    },
    {
      opposite: true,
      seriesName: 'Drawdown',
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
  ],
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
